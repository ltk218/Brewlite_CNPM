import { OrderStatus, PaymentMethod, PaymentStatus, UserRole } from '@prisma/client';
import { PaymentsService } from '../src/payments/payments.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthenticatedUser } from '../src/common/decorators';

interface InMemoryPayment {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  errorMessage?: string | null;
  createdAt: Date;
}

interface InMemoryLoyaltyTx {
  id: string;
  userId: string;
  orderId: string;
  points: number;
  description: string;
}

describe('Task 10.2 & 10.4 - Payment Idempotency & Atomic Loyalty Points', () => {
  let paymentsService: PaymentsService;
  let paymentsStore: Map<string, InMemoryPayment>;
  let loyaltyStore: InMemoryLoyaltyTx[];
  let userPoints: number;
  let orderState: {
    id: string;
    orderCode: string;
    userId: string;
    status: OrderStatus;
    total: number;
    items: Array<Record<string, unknown>>;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-customer-1',
    email: 'khachhang@brewlite.vn',
    role: UserRole.CUSTOMER,
    fullName: 'Nguyễn Minh Khách',
  };

  beforeEach(() => {
    paymentsStore = new Map<string, InMemoryPayment>();
    loyaltyStore = [];
    userPoints = 15000;
    orderState = {
      id: 'order-1042',
      orderCode: '#1042',
      userId: mockUser.id,
      status: OrderStatus.PENDING,
      total: 85000,
      items: [],
    };

    const txClient = {
      payment: {
        findUnique: jest.fn(async ({ where }: { where: { idempotencyKey: string } }) => {
          const found = paymentsStore.get(where.idempotencyKey);
          if (!found) return null;
          return {
            ...found,
            order: {
              ...orderState,
              payments: Array.from(paymentsStore.values()),
            },
          };
        }),
        create: jest.fn(async ({ data }: { data: Omit<InMemoryPayment, 'id' | 'createdAt'> }) => {
          const created: InMemoryPayment = {
            id: `pay-${paymentsStore.size + 1}`,
            createdAt: new Date(),
            ...data,
          };
          paymentsStore.set(data.idempotencyKey, created);
          return created;
        }),
      },
      order: {
        findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
          if (where.id !== orderState.id) return null;
          return { ...orderState };
        }),
        update: jest.fn(async ({ data }: { data: { status: OrderStatus } }) => {
          orderState.status = data.status;
          return {
            ...orderState,
            payments: Array.from(paymentsStore.values()),
          };
        }),
      },
      user: {
        update: jest.fn(async ({ data }: { data: { loyaltyPoints: { increment: number } } }) => {
          userPoints += data.loyaltyPoints.increment;
          return { id: mockUser.id, loyaltyPoints: userPoints };
        }),
      },
      loyaltyTransaction: {
        create: jest.fn(async ({ data }: { data: Omit<InMemoryLoyaltyTx, 'id'> }) => {
          const entry: InMemoryLoyaltyTx = {
            id: `loy-${loyaltyStore.length + 1}`,
            ...data,
          };
          loyaltyStore.push(entry);
          return entry;
        }),
      },
    };

    const mockPrisma = {
      payment: txClient.payment,
      $transaction: jest.fn(async (cb: (tx: typeof txClient) => Promise<unknown>) => cb(txClient)),
    } as unknown as PrismaService;

    paymentsService = new PaymentsService(mockPrisma);
  });

  it('processes payment once and returns idempotent response on duplicate Idempotency-Key without double-charging or double-adding loyalty points', async () => {
    const idemKey = 'idem-key-order-1042-unique';

    const firstResponse = await paymentsService.processPayment(
      mockUser,
      {
        orderId: 'order-1042',
        method: PaymentMethod.WALLET,
      },
      idemKey,
    );

    expect(firstResponse.idempotentReplay).toBe(false);
    expect(firstResponse.payment.status).toBe(PaymentStatus.SUCCESS);
    expect(firstResponse.order.status).toBe(OrderStatus.PAID);
    expect(firstResponse.pointsEarned).toBe(4250);
    expect(paymentsStore.size).toBe(1);
    expect(loyaltyStore.length).toBe(1);
    expect(userPoints).toBe(19250);

    const secondResponse = await paymentsService.processPayment(
      mockUser,
      {
        orderId: 'order-1042',
        method: PaymentMethod.WALLET,
      },
      idemKey,
    );

    expect(secondResponse.idempotentReplay).toBe(true);
    expect(secondResponse.payment.id).toBe(firstResponse.payment.id);
    expect(paymentsStore.size).toBe(1);
    expect(loyaltyStore.length).toBe(1);
    expect(userPoints).toBe(19250);
  });
});
