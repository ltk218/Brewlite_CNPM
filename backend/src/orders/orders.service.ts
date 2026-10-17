import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BarStation, InventoryTxType, OrderStatus, ProductSize, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { assertTransition } from './order-state-machine';
import { AuthenticatedUser } from '../common/decorators';

const SIZE_UPCHARGE: Record<ProductSize, number> = {
  [ProductSize.S]: 0,
  [ProductSize.M]: 6000,
  [ProductSize.L]: 12000,
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Giỏ hàng không được để trống');
    }

    return this.prisma.$transaction(async (tx) => {
      const allToppingIds = Array.from(
        new Set(dto.items.flatMap((i) => i.toppingIds ?? [])),
      );

      const toppingsMap = new Map<string, { id: string; name: string; price: number }>();
      if (allToppingIds.length > 0) {
        const toppings = await tx.topping.findMany({
          where: { id: { in: allToppingIds }, isAvailable: true },
        });
        for (const t of toppings) {
          toppingsMap.set(t.id, { id: t.id, name: t.name, price: t.price });
        }
      }

      const preparedItems: Array<{
        productId: string;
        productName: string;
        size: ProductSize;
        qty: number;
        sugarLevel?: string;
        iceLevel?: string;
        itemNote?: string;
        station?: BarStation;
        toppings: Array<{ id: string; name: string; price: number }>;
        unitPrice: number;
        lineTotal: number;
      }> = [];

      let subtotal = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isAvailable) {
          throw new BadRequestException('Sản phẩm không tồn tại hoặc đang tạm ngưng phục vụ');
        }

        if (product.stock < item.qty) {
          throw new ConflictException(
            'Sản phẩm không đủ tồn kho hoặc đang có giao dịch đồng thời, vui lòng thử lại',
          );
        }

        const updatedStock = await tx.product.updateMany({
          where: {
            id: product.id,
            version: product.version,
            stock: { gte: item.qty },
          },
          data: {
            stock: { decrement: item.qty },
            version: { increment: 1 },
          },
        });

        if (updatedStock.count === 0) {
          throw new ConflictException(
            'Sản phẩm không đủ tồn kho hoặc đang có giao dịch đồng thời, vui lòng thử lại',
          );
        }

        const selectedToppings = (item.toppingIds ?? []).map((tid) => {
          const found = toppingsMap.get(tid);
          if (!found) {
            throw new BadRequestException('Topping đã chọn không hợp lệ');
          }
          return found;
        });

        const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
        const sizePrice = SIZE_UPCHARGE[item.size] ?? 0;
        const unitPrice = product.price + sizePrice + toppingsPrice;
        const lineTotal = unitPrice * item.qty;

        subtotal += lineTotal;

        preparedItems.push({
          productId: product.id,
          productName: product.name,
          size: item.size,
          qty: item.qty,
          ...(item.sugarLevel ? { sugarLevel: item.sugarLevel } : {}),
          ...(item.iceLevel ? { iceLevel: item.iceLevel } : {}),
          ...(item.itemNote ? { itemNote: item.itemNote } : {}),
          ...(product.station ? { station: product.station } : {}),
          toppings: selectedToppings,
          unitPrice,
          lineTotal,
        });
      }

      let discountAmount = 0;
      let appliedCode: string | null = null;

      if (dto.promotionCode && dto.promotionCode.trim() !== '') {
        const normalizedCode = dto.promotionCode.trim().toUpperCase();
        const promo = await tx.promotion.findUnique({
          where: { code: normalizedCode },
        });

        if (!promo || !promo.isActive || promo.expiresAt.getTime() < Date.now()) {
          throw new BadRequestException('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
        }

        if (subtotal < promo.minOrderValue) {
          throw new BadRequestException(
            `Đơn hàng cần tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã ${promo.code}`,
          );
        }

        const rawDiscount = Math.floor((subtotal * promo.discountPercent) / 100);
        discountAmount = Math.min(rawDiscount, promo.maxDiscountAmount);
        appliedCode = promo.code;
      }

      const afterPromo = Math.max(0, subtotal - discountAmount);
      let pointsUsed = 0;
      let pointsDiscountAmount = 0;

      const requestedPoints = Math.floor(Number(dto.pointsUsed || 0));
      if (requestedPoints > 0 && tx.user) {
        const buyer = await tx.user.findUnique({ where: { id: userId } });
        if (buyer && buyer.role === UserRole.CUSTOMER && buyer.loyaltyPoints > 0) {
          pointsUsed = Math.min(requestedPoints, buyer.loyaltyPoints, afterPromo);
          pointsDiscountAmount = pointsUsed;
          if (pointsUsed > 0) {
            await tx.user.update({
              where: { id: buyer.id },
              data: {
                loyaltyPoints: { decrement: pointsUsed },
              },
            });
          }
        }
      }

      const total = Math.max(0, afterPromo - pointsDiscountAmount);
      const countOrders = await tx.order.count();
      const randomSuffix = Math.floor(10 + Math.random() * 89);
      const orderCode = `#${1043 + countOrders}${randomSuffix}`.slice(0, 6);

      const createdOrder = await tx.order.create({
        data: {
          orderCode,
          userId,
          status: OrderStatus.PENDING,
          ...(dto.pickupMethod ? { pickupMethod: dto.pickupMethod } : {}),
          ...(dto.customerNote ? { customerNote: dto.customerNote } : {}),
          subtotal,
          discountAmount,
          pointsUsed,
          pointsDiscountAmount,
          total,
          promotionCode: appliedCode,
          items: {
            create: preparedItems,
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (pointsUsed > 0 && tx.loyaltyTransaction) {
        await tx.loyaltyTransaction.create({
          data: {
            userId,
            orderId: createdOrder.id,
            points: -pointsUsed,
            type: 'REDEEM',
            description: `Dùng ${pointsUsed.toLocaleString('vi-VN')} điểm giảm giá cho đơn ${orderCode}`,
          },
        });
      }

      return createdOrder;
    });
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(orderId: string, user: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            loyaltyPoints: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      assertTransition(order.status, dto.status);

      if (dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.qty },
              version: { increment: 1 },
            },
          });
        }
        if (order.pointsUsed && order.pointsUsed > 0 && tx.user) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoints: { increment: order.pointsUsed },
            },
          });
        }
      }

      if (dto.status === OrderStatus.PREPARING && tx.recipe && tx.ingredient) {
        for (const item of order.items) {
          if (!item.inventoryDeducted) {
            const recipes = await tx.recipe.findMany({
              where: { productId: item.productId },
            });
            for (const r of recipes) {
              const deductAmount = r.quantityNeeded * item.qty;
              const updatedIng = await tx.ingredient.update({
                where: { id: r.ingredientId },
                data: {
                  currentStock: { decrement: deductAmount },
                },
              });
              await tx.inventoryTransaction.create({
                data: {
                  ingredientId: r.ingredientId,
                  orderId: order.id,
                  type: InventoryTxType.ORDER_DEDUCT,
                  quantityChange: -deductAmount,
                  balanceAfter: updatedIng.currentStock,
                  reason: `Trừ kho tự động theo BOM cho đơn ${order.orderCode} (${item.qty}x ${item.productName})`,
                  performedBy: 'KDS Barista',
                },
              });
            }
            await tx.orderItem.update({
              where: { id: item.id },
              data: {
                inventoryDeducted: true,
                kdsStartedAt: new Date(),
              },
            });
          }
        }
      }

      if (dto.status === OrderStatus.READY && tx.orderItem) {
        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { kdsReadyAt: new Date() },
        });
      }

      if (dto.status === OrderStatus.COMPLETED && tx.orderItem) {
        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { servedAt: new Date() },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: dto.status,
          ...(dto.cancelReason ? { cancelReason: dto.cancelReason } : {}),
        },
        include: {
          items: true,
          payments: true,
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });
  }
}
