import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyPromotionDto } from './promotions.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive() {
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { minOrderValue: 'asc' },
    });
  }

  async applyPromotion(dto: ApplyPromotionDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const promotion = await this.prisma.promotion.findUnique({
      where: { code: normalizedCode },
    });

    if (!promotion || !promotion.isActive) {
      throw new NotFoundException('Mã khuyến mãi không tồn tại hoặc đã ngừng áp dụng');
    }

    if (promotion.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Mã khuyến mãi đã hết hạn sử dụng');
    }

    if (dto.subtotal < promotion.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ mới được áp dụng mã ${promotion.code}`,
      );
    }

    const rawDiscount = Math.floor((dto.subtotal * promotion.discountPercent) / 100);
    const discountAmount = Math.min(rawDiscount, promotion.maxDiscountAmount);

    return {
      code: promotion.code,
      description: promotion.description,
      discountPercent: promotion.discountPercent,
      maxDiscountAmount: promotion.maxDiscountAmount,
      minOrderValue: promotion.minOrderValue,
      discountAmount,
      finalTotal: Math.max(0, dto.subtotal - discountAmount),
    };
  }
}
