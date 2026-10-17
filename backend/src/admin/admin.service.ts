import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryTxType, OrderStatus, PurchaseOrder } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatedPurchaseOrder extends PurchaseOrder {
  supplier?: unknown;
  items?: unknown;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [orders, lowStockProducts, ingredients, recentAuditLogs] = await Promise.all([
      this.prisma.order.findMany({
        include: {
          items: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.ingredient.findMany({
        orderBy: { currentStock: 'asc' },
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const lowStockIngredients = ingredients.filter(
      (ing) => ing.currentStock <= ing.minThreshold,
    );

    const revenueStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
    ];

    const activeQueueStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.PREPARING,
      OrderStatus.READY,
    ];

    const totalRevenue = orders
      .filter((o) => revenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const activeOrdersCount = orders.filter((o) => activeQueueStatuses.includes(o.status)).length;
    const lowStockCount = lowStockProducts.length;

    const now = new Date();
    const revenueLast7Days: Array<{ date: string; label: string; revenue: number; ordersCount: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;

      const dayOrders = orders.filter((o) => {
        const od = new Date(o.createdAt);
        return (
          od.getFullYear() === yyyy &&
          od.getMonth() === d.getMonth() &&
          od.getDate() === d.getDate() &&
          revenueStatuses.includes(o.status)
        );
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      revenueLast7Days.push({
        date: dateStr,
        label,
        revenue: dayRevenue,
        ordersCount: dayOrders.length,
      });
    }

    const statusBreakdown: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.PAID]: 0,
      [OrderStatus.PREPARING]: 0,
      [OrderStatus.READY]: 0,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.PAYMENT_FAILED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };

    for (const o of orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    }

    return {
      totalRevenue,
      totalOrders,
      activeOrdersCount,
      lowStockCount,
      lowStockProducts,
      lowStockIngredientsCount: lowStockIngredients.length,
      lowStockIngredients,
      revenueLast7Days,
      statusBreakdown,
      recentOrders: orders.slice(0, 5),
      recentAuditLogs,
    };
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInventoryOverview() {
    const [ingredients, productsWithBom, transactions, suppliers, purchaseOrders] =
      await Promise.all([
        this.prisma.ingredient.findMany({
          orderBy: { code: 'asc' },
        }),
        this.prisma.product.findMany({
          include: {
            recipes: {
              include: {
                ingredient: true,
              },
            },
          },
          orderBy: { category: 'asc' },
        }),
        this.prisma.inventoryTransaction.findMany({
          include: {
            ingredient: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
        this.prisma.supplier.findMany({
          orderBy: { name: 'asc' },
        }),
        this.prisma.purchaseOrder.findMany({
          include: {
            supplier: true,
            items: {
              include: {
                ingredient: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    return {
      ingredients,
      productsWithBom,
      transactions,
      suppliers,
      purchaseOrders,
    };
  }

  async adjustIngredientStock(payload: {
    ingredientId: string;
    quantityChange: number;
    type: 'IMPORT' | 'ADJUSTMENT';
    reason: string;
    supplierId?: string;
    unitCost?: number;
    performedBy?: string;
  }) {
    if (!payload.reason || payload.reason.trim() === '') {
      throw new BadRequestException('Vui lòng nhập lý do nhập kho hoặc điều chỉnh tồn kho');
    }

    return this.prisma.$transaction(async (tx) => {
      const ing = await tx.ingredient.findUnique({
        where: { id: payload.ingredientId },
      });

      if (!ing) {
        throw new NotFoundException('Không tìm thấy nguyên liệu trong kho');
      }

      const rawQty = Number(payload.quantityChange);
      const signedDelta =
        payload.type === 'IMPORT' ? Math.abs(rawQty) : rawQty;
      const newBalance = Math.max(0, ing.currentStock + signedDelta);
      const nextUnitCost =
        payload.unitCost && Number(payload.unitCost) > 0
          ? Math.round(Number(payload.unitCost))
          : ing.costPerUnit;

      const updatedIngredient = await tx.ingredient.update({
        where: { id: ing.id },
        data: {
          currentStock: newBalance,
          costPerUnit: nextUnitCost,
        },
      });

      let createdPo: CreatedPurchaseOrder | null = null;
      if (payload.type === 'IMPORT' && signedDelta > 0) {
        let supplier = payload.supplierId
          ? await tx.supplier.findUnique({ where: { id: payload.supplierId } })
          : await tx.supplier.findFirst();

        if (!supplier) {
          supplier = await tx.supplier.create({
            data: {
              name: 'Nông Trại Cầu Đất & Đắk Lắk Specialty Roastery',
              phone: '02633888999',
              email: 'supply@caudatroastery.vn',
              address: 'Xã Xuân Trường, TP. Đà Lạt, Lâm Đồng',
              isActive: true,
            },
          });
        }

        const poCount = await tx.purchaseOrder.count();
        const poNumber = `PO-202610-${String(poCount + 1).padStart(3, '0')}`;
        const lineTotal = Math.round(signedDelta * nextUnitCost);

        createdPo = await tx.purchaseOrder.create({
          data: {
            poNumber,
            supplierId: supplier.id,
            totalAmount: lineTotal,
            status: 'RECEIVED',
            note: `${payload.reason.trim()} (${signedDelta.toLocaleString('vi-VN')}${ing.unit} ${ing.name})`,
            items: {
              create: [
                {
                  ingredientId: ing.id,
                  quantity: signedDelta,
                  unitPrice: nextUnitCost,
                  lineTotal,
                },
              ],
            },
          },
          include: {
            supplier: true,
            items: {
              include: {
                ingredient: true,
              },
            },
          },
        });
      }

      const txRecord = await tx.inventoryTransaction.create({
        data: {
          ingredientId: ing.id,
          type:
            payload.type === 'IMPORT'
              ? InventoryTxType.IMPORT
              : InventoryTxType.ADJUSTMENT,
          quantityChange: signedDelta,
          balanceAfter: newBalance,
          reason: createdPo
            ? `[${createdPo.poNumber}] ${payload.reason.trim()}`
            : payload.reason.trim(),
          performedBy: payload.performedBy || 'Quản trị viên',
        },
        include: {
          ingredient: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: payload.type === 'IMPORT' ? 'INVENTORY_IMPORT' : 'INVENTORY_ADJUST',
          entityType: 'INGREDIENT',
          entityId: ing.code,
          details: `${ing.name}: ${signedDelta > 0 ? '+' : ''}${signedDelta}${ing.unit} (${payload.reason.trim()})`,
        },
      });

      return {
        ingredient: updatedIngredient,
        transaction: txRecord,
        purchaseOrder: createdPo,
      };
    });
  }

  async createIngredient(body: {
    code: string;
    name: string;
    unit: string;
    currentStock: number;
    minThreshold: number;
    costPerUnit: number;
  }) {
    const code = (body.code || `ING-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
    return this.prisma.ingredient.create({
      data: {
        code,
        name: body.name.trim(),
        unit: body.unit.trim() || 'g',
        currentStock: Math.max(0, Number(body.currentStock || 0)),
        minThreshold: Math.max(0, Number(body.minThreshold || 100)),
        costPerUnit: Math.max(1, Math.round(Number(body.costPerUnit || 100))),
        isActive: true,
      },
    });
  }

  async updateIngredient(
    id: string,
    body: Partial<{
      name: string;
      unit: string;
      currentStock: number;
      minThreshold: number;
      costPerUnit: number;
    }>,
  ) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nguyên liệu cần cập nhật');
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.unit !== undefined ? { unit: body.unit.trim() } : {}),
        ...(body.currentStock !== undefined ? { currentStock: Math.max(0, Number(body.currentStock)) } : {}),
        ...(body.minThreshold !== undefined ? { minThreshold: Math.max(0, Number(body.minThreshold)) } : {}),
        ...(body.costPerUnit !== undefined ? { costPerUnit: Math.max(1, Math.round(Number(body.costPerUnit))) } : {}),
      },
    });
  }

  async deleteIngredient(id: string) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nguyên liệu cần xóa');
    }

    await this.prisma.ingredient.delete({ where: { id } });
    return { deleted: true, id };
  }

  async upsertRecipeItem(body: {
    productId: string;
    ingredientId: string;
    quantityNeeded: number;
  }) {
    const qty = Number(body.quantityNeeded);
    if (!qty || qty <= 0) {
      throw new BadRequestException('Định lượng nguyên liệu phải lớn hơn 0');
    }

    const existing = await this.prisma.recipe.findFirst({
      where: {
        productId: body.productId,
        ingredientId: body.ingredientId,
      },
    });

    if (existing) {
      return this.prisma.recipe.update({
        where: { id: existing.id },
        data: { quantityNeeded: qty },
        include: { ingredient: true },
      });
    }

    return this.prisma.recipe.create({
      data: {
        productId: body.productId,
        ingredientId: body.ingredientId,
        quantityNeeded: qty,
      },
      include: { ingredient: true },
    });
  }

  async updateRecipeItem(id: string, quantityNeeded: number) {
    const qty = Number(quantityNeeded);
    if (!qty || qty <= 0) {
      throw new BadRequestException('Định lượng nguyên liệu phải lớn hơn 0');
    }

    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy dòng định lượng công thức');
    }

    return this.prisma.recipe.update({
      where: { id },
      data: { quantityNeeded: qty },
      include: { ingredient: true },
    });
  }

  async deleteRecipeItem(id: string) {
    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy dòng định lượng cần xóa');
    }

    await this.prisma.recipe.delete({ where: { id } });
    return { deleted: true, id };
  }
}
