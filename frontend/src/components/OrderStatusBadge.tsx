'use client';

import React from 'react';
import { OrderStatus } from '../lib/api';

const STATUS_CONFIG: Record<
  OrderStatus,
  { text: string; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    text: 'Đang chờ thanh toán',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  PAYMENT_FAILED: {
    text: 'Thanh toán thất bại — Vui lòng thử lại',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  PAID: {
    text: 'Đã thanh toán — Đang chờ quầy tiếp nhận',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-600',
  },
  PREPARING: {
    text: 'Quầy đang pha chế món của bạn',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500',
  },
  READY: {
    text: 'Món đã sẵn sàng — Mời bạn tới quầy lấy nước',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  COMPLETED: {
    text: 'Đơn hàng đã hoàn tất',
    badgeClass: 'bg-stone-100 text-[#2C1810] border-[#E6DCD2]',
    dotClass: 'bg-[#3E2723]',
  },
  CANCELLED: {
    text: 'Đơn hàng đã hủy',
    badgeClass: 'bg-stone-100 text-[#795548] border-[#E6DCD2]',
    dotClass: 'bg-stone-400',
  },
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.text ?? status;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    text: status,
    badgeClass: 'bg-stone-100 text-[#2C1810] border-[#E6DCD2]',
    dotClass: 'bg-stone-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${cfg.badgeClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
      <span>{cfg.text}</span>
    </span>
  );
}
