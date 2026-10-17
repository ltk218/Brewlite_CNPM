import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './payments.dto';
import { assertTransition } from '../orders/order-state-machine';
import { AuthenticatedUser } from '../common/decorators';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async processPayment(
    user: AuthenticatedUser,
    dto: ProcessPaymentDto,
    headerIdempotencyKey?: string,
  ) {
    const idempotencyKey = (headerIdempotencyKey || dto.idempotencyKey || '').trim();
    if (!idempotencyKey) {
      throw new BadRequestException('Thiếu khóa chống trùng lặp giao dịch (Idempotency-Key)');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
      include: {
        order: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (existingPayment) {
      return {
        payment: existingPayment,
        order: existingPayment.order,
        idempotentReplay: true,
        pointsEarned:
          existingPayment.status === PaymentStatus.SUCCESS && user.role === UserRole.CUSTOMER
            ? Math.floor(existingPayment.amount * 0.05)
            : 0,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const recheckPayment = await tx.payment.findUnique({
        where: { idempotencyKey },
        include: {
          order: {
            include: {
              items: true,
              payments: true,
            },
          },
        },
      });

      if (recheckPayment) {
        return {
          payment: recheckPayment,
          order: recheckPayment.order,
          idempotentReplay: true,
          pointsEarned:
            recheckPayment.status === PaymentStatus.SUCCESS && user.role === UserRole.CUSTOMER
              ? Math.floor(recheckPayment.amount * 0.05)
              : 0,
        };
      }

      const order = await tx.order.findUnique({
        where: { id: dto.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng cần thanh toán');
      }

      if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền thanh toán cho đơn hàng này');
      }

      if (dto.simulateFailure) {
        assertTransition(order.status, OrderStatus.PAYMENT_FAILED);

        const failedPayment = await tx.payment.create({
          data: {
            orderId: order.id,
            idempotencyKey,
            amount: order.total,
            method: dto.method,
            status: PaymentStatus.FAILED,
            errorMessage: 'Giao dịch bị từ chối bởi cổng thanh toán (Mô phỏng lỗi PAYMENT_FAILED)',
          },
        });

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAYMENT_FAILED },
          include: {
            items: true,
            payments: true,
          },
        });

        return {
          payment: failedPayment,
          order: updatedOrder,
          idempotentReplay: false,
          pointsEarned: 0,
        };
      }

      assertTransition(order.status, OrderStatus.PAID);

      const successPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          idempotencyKey,
          amount: order.total,
          method: dto.method,
          status: PaymentStatus.SUCCESS,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
        include: {
          items: true,
          payments: true,
        },
      });

      const pointsEarned =
        user.role === UserRole.CUSTOMER ? Math.floor(order.total * 0.05) : 0;
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            loyaltyPoints: { increment: pointsEarned },
          },
        });

        await tx.loyaltyTransaction.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            points: pointsEarned,
            description: `Tích điểm hoàn 5% hóa đơn thanh toán đơn hàng ${order.orderCode}`,
          },
        });
      }

      return {
        payment: successPayment,
        order: updatedOrder,
        idempotentReplay: false,
        pointsEarned,
      };
    });
  }
}
