import { ConflictException } from '@nestjs/common';
import { OrderStatus, ProductSize } from '@prisma/client';
import { OrdersService } from '../src/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Task 10.3 - Concurrency Stock Control with Optimistic Locking', () => {
  let ordersService: OrdersService;
  let productRecord: {
    id: string;
    name: string;
    price: number;
    stock: number;
    version: number;
    isAvailable: boolean;
  };
  let createdOrdersCount: number;

  beforeEach(() => {
    productRecord = {
      id: 'prod-matcha-latte',
      name: 'Matcha Latte Kem Phô Mai',
      price: 55000,
      stock: 2,
      version: 1,
      isAvailable: true,
    };
    createdOrdersCount = 0;

    const mockPrisma = {
      $transaction: jest.fn(async (cb: (tx: Record<string, unknown>) => Promise<unknown>) => {
        const tx = {
          topping: {
            findMany: jest.fn(async () => []),
          },
          product: {
            findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
              if (where.id !== productRecord.id) return null;
              return { ...productRecord };
            }),
            updateMany: jest.fn(
              async ({
                where,
                data,
              }: {
                where: { id: string; version: number; stock: { gte: number } };
                data: { stock: { decrement: number }; version: { increment: number } };
              }) => {
                await new Promise((resolve) => setTimeout(resolve, 5));
                if (
                  productRecord.id === where.id &&
                  productRecord.version === where.version &&
                  productRecord.stock >= where.stock.gte
                ) {
                  productRecord.stock -= data.stock.decrement;
                  productRecord.version += data.version.increment;
                  return { count: 1 };
                }
                return { count: 0 };
              },
            ),
          },
          promotion: {
            findUnique: jest.fn(async () => null),
          },
          order: {
            count: jest.fn(async () => createdOrdersCount),
            create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
              createdOrdersCount += 1;
              return {
                id: `order-concurrent-${createdOrdersCount}`,
                ...data,
                status: OrderStatus.PENDING,
              };
            }),
          },
        };
        return cb(tx);
      }),
    } as unknown as PrismaService;

    ordersService = new OrdersService(mockPrisma);
  });

  it('allows exactly 2 orders to succeed and rejects 3 with ConflictException when 5 concurrent requests buy stock=2', async () => {
    const orderPayload = {
      items: [
        {
          productId: 'prod-matcha-latte',
          size: ProductSize.M,
          qty: 1,
          toppingIds: [],
        },
      ],
    };

    const concurrentPromises = Array.from({ length: 5 }, (_, idx) =>
      ordersService.createOrder(`user-${idx + 1}`, orderPayload),
    );

    const results = await Promise.allSettled(concurrentPromises);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    expect(fulfilled.length).toBe(2);
    expect(rejected.length).toBe(3);
    for (const rej of rejected) {
      expect(rej.reason).toBeInstanceOf(ConflictException);
    }
    expect(productRecord.stock).toBe(0);
    expect(productRecord.version).toBe(3);
  });
});
