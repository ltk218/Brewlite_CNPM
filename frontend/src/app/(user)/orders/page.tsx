'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  ArrowRight,
  Clock,
  Coffee,
  RefreshCw,
} from 'lucide-react';
import { api, formatDateTime, formatVND, Order } from '../../../lib/api';
import { OrderStatusBadge } from '../../../components/OrderStatusBadge';
import { useAuthStore } from '../../../store/useAuthStore';

export default function MyOrdersPage() {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyOrders(token);
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải lịch sử đơn hàng',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login?redirect=/orders');
      return;
    }
    if (token) {
      fetchOrders();
    }
  }, [hydrated, token]);

  if (!hydrated || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-[#EFE8DF] rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white border border-[#E6DCD2] rounded-2xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]">
            Lịch sử đơn hàng
          </h1>
          <p className="text-sm text-[#795548] mt-0.5">
            Theo dõi trạng thái pha chế tại quầy và chi tiết hóa đơn của bạn
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E6DCD2] text-xs sm:text-sm font-semibold text-[#2C1810] hover:bg-[#FDFBF7]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {error ? (
        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-red-600 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold"
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EFE8DF] text-[#3E2723] flex items-center justify-center mx-auto">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#2C1810]">
            Bạn chưa có đơn hàng nào
          </h2>
          <p className="text-sm text-[#795548]">
            Đặt ngay một ly cà phê thơm ngon và nhận ưu đãi tích điểm thành viên.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3E2723] text-white text-sm font-bold hover:bg-[#2C1810]"
          >
            <Coffee className="w-4 h-4" />
            <span>Đặt món ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#3E2723]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-[#2C1810] tabular-nums">
                      {order.orderCode}
                    </span>
                    <span className="text-xs text-[#795548] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[#795548] line-clamp-1">
                    {order.items
                      .map((i) => `${i.qty}x ${i.productName} (${i.size})`)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6DCD2]">
                  <OrderStatusBadge status={order.status} />

                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#B45309] tabular-nums">
                      {formatVND(order.total)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#795548]" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
