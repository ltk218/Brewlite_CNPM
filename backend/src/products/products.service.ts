import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const count = await this.prisma.product.count();
    if (count === 0) {
      await this.prisma.ensureSeedData();
    }

    const [products, toppings, modifierGroups] = await Promise.all([
      this.prisma.product.findMany({
        include: {
          variants: true,
          recipes: {
            include: {
              ingredient: true,
            },
          },
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.topping.findMany({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      }),
      this.prisma.modifierGroup.findMany({
        include: {
          options: {
            where: { isActive: true },
          },
        },
      }),
    ]);

    return {
      products,
      toppings,
      modifierGroups,
    };
  }

  async findOne(id: string) {
    const [product, toppings, modifierGroups] = await Promise.all([
      this.prisma.product.findUnique({
        where: { id },
        include: {
          variants: true,
          recipes: {
            include: {
              ingredient: true,
            },
          },
        },
      }),
      this.prisma.topping.findMany({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      }),
      this.prisma.modifierGroup.findMany({
        include: {
          options: {
            where: { isActive: true },
          },
        },
      }),
    ]);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm này');
    }

    return {
      product,
      toppings,
      modifierGroups,
    };
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        description: dto.description.trim(),
        category: dto.category.trim(),
        price: dto.price,
        imageUrl: dto.imageUrl.trim(),
        stock: dto.stock,
        isAvailable: dto.isAvailable ?? true,
      },
      include: {
        variants: true,
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy sản phẩm cần cập nhật');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.category !== undefined ? { category: dto.category.trim() } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl.trim() } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
        version: { increment: 1 },
      },
      include: {
        variants: true,
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy sản phẩm cần xóa');
    }

    await this.prisma.product.delete({ where: { id } });
    return { deleted: true, id, name: existing.name };
  }
}
