import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { assertTransition, canTransition } from '../src/orders/order-state-machine';

describe('Task 10.1 - Order State Machine (assertTransition)', () => {
  it('allows all valid transitions from PENDING', () => {
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.PAID)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.PAYMENT_FAILED)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).not.toThrow();
  });

  it('allows all valid transitions from PAYMENT_FAILED', () => {
    expect(() => assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.PENDING)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.PAID)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED)).not.toThrow();
  });

  it('allows all valid transitions from PAID, PREPARING, and READY', () => {
    expect(() => assertTransition(OrderStatus.PAID, OrderStatus.PREPARING)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PAID, OrderStatus.CANCELLED)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PREPARING, OrderStatus.READY)).not.toThrow();
    expect(() => assertTransition(OrderStatus.READY, OrderStatus.COMPLETED)).not.toThrow();
  });

  it('rejects invalid transitions by throwing BadRequestException', () => {
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.PREPARING)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.READY)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.PAID, OrderStatus.READY)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.PREPARING, OrderStatus.COMPLETED)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED)).toThrow(BadRequestException);
    expect(() => assertTransition(OrderStatus.READY, OrderStatus.CANCELLED)).toThrow(BadRequestException);
  });

  it('blocks any outgoing transitions from terminal states COMPLETED and CANCELLED', () => {
    const allStatuses = Object.values(OrderStatus);
    for (const next of allStatuses) {
      expect(canTransition(OrderStatus.COMPLETED, next)).toBe(false);
      expect(canTransition(OrderStatus.CANCELLED, next)).toBe(false);
      expect(() => assertTransition(OrderStatus.COMPLETED, next)).toThrow(BadRequestException);
      expect(() => assertTransition(OrderStatus.CANCELLED, next)).toThrow(BadRequestException);
    }
  });
});
