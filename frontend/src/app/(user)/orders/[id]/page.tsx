'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Award,
  CreditCard,
  Clock,
  RefreshCw,
  Receipt,
  Store,
} from 'lucide-react';
import {
  api,
  formatDateTime,
  formatVND,
  getStationLabel,
  Order,
} from '../../../../lib/api';
import { OrderStatusBadge } from '../../../../components/OrderStatusBadge';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useCartStore } from '../../../../store/useCartStore';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, hydrated, refreshProfile } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!token || !params?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrderById(token, params.id);
      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng',
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
    if (token && params?.id) {
      fetchOrder();
    }
  }, [hydrated, token, params?.id]);

  const handleRetryPayment = async () => {
    if (!token || !order) return;
    setRetryingPayment(true);
    setError(null);
    try {
      const res = await api.processPayment(token, {
        orderId: order.id,
        method: 'WALLET',
        idempotencyKey: `retry-${order.id}-${Date.now()}`,
        simulateFailure: false,
      });
      setOrder(res.order);
      clearCart();
      await refreshProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Thanh toán lại không thành công',
      );
    } finally {
      setRetryingPayment(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-5 w-40 bg-[#EFE8DF] rounded" />
        <div className="h-72 bg-white border border-[#E6DCD2] rounded-2xl" />
        <div className="h-64 bg-white border border-[#E6DCD2] rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-[#2C1810]">
          {error || 'Không tìm thấy đơn hàng'}
        </h2>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-sm font-semibold"
        >
          Xem lịch sử đơn hàng
        </Link>
      </div>
    );
  }

  const latestPayment = order.payments?.[0];
  const paymentMethodLabel =
    latestPayment?.method === 'CARD'
      ? 'Thẻ ngân hàng (Visa / Napas)'
      : 'Ví điện tử (MoMo / VNPay)';
  const pointsEarned =
    order.status === 'PENDING' ||
    order.status === 'PAYMENT_FAILED' ||
    order.status === 'CANCELLED' ||
    user?.role === 'ADMIN'
      ? 0
      : Math.floor(order.total * 0.05);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#795548] hover:text-[#3E2723]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách đơn hàng của tôi</span>
        </Link>

        <button
          type="button"
          onClick={fetchOrder}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E6DCD2] text-xs font-semibold text-[#2C1810] hover:bg-[#FDFBF7]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DCD2]">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                order.status === 'PAYMENT_FAILED' || order.status === 'CANCELLED'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-[#3E2723]'
              }`}
            >
              {order.status === 'PAYMENT_FAILED' ||
              order.status === 'CANCELLED' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#3E2723]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
                Mã nhận nước tại quầy
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tabular-nums">
                {order.orderCode}
              </h1>
              <p className="text-xs text-[#795548] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Đặt lúc {formatDateTime(order.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <OrderStatusBadge status={order.status} />
            {(order.status === 'PAYMENT_FAILED' ||
              order.status === 'PENDING') && (
              <button
                type="button"
                disabled={retryingPayment}
                onClick={handleRetryPayment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {retryingPayment ? 'Đang thanh toán...' : 'Thanh toán lại'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#3E2723] shrink-0" />
            <div>
              <p className="text-[11px] text-[#795548]">Thanh toán</p>
              <p className="text-xs font-bold text-[#2C1810]">
                {paymentMethodLabel}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] flex items-center gap-3">
            <Store className="w-5 h-5 text-[#3E2723] shrink-0" />
            <div>
              <p className="text-[11px] text-[#795548]">Hình thức nhận</p>
              <p className="text-xs font-bold text-[#2C1810]">
                {order.pickupMethod === 'TAKEAWAY_BAG'
                  ? 'Đóng gói mang đi'
                  : 'Lấy trực tiếp tại quầy'}
              </p>
            </div>
          </div>

          {user?.role !== 'ADMIN' && (
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] flex items-center gap-3">
              <Award className="w-5 h-5 text-[#B45309] shrink-0" />
              <div>
                <p className="text-[11px] text-[#795548]">Điểm tích lũy (5%)</p>
                <p className="text-xs font-bold text-[#B45309] tabular-nums">
                  +{pointsEarned.toLocaleString('vi-VN')} điểm thưởng
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-[#2C1810] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#3E2723]" />
            <span>Chi tiết các món đã đặt</span>
          </h2>

          <div className="divide-y divide-[#E6DCD2] border border-[#E6DCD2] rounded-2xl overflow-hidden">
            {order.items.map((item) => {
              const toppingsList = Array.isArray(item.toppings)
                ? item.toppings
                : [];
              return (
                <div
                  key={item.id}
                  className="p-4 bg-white flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#2C1810]">
                        <span className="text-[#3E2723] tabular-nums">
                          {item.qty}x
                        </span>{' '}
                        {item.productName} (Size {item.size})
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-[#F7F2EB] text-[10px] font-bold text-[#5D4037]">
                        {getStationLabel(item.station)}
                      </span>
                    </div>
                    <p className="text-xs text-[#795548]">
                      Tùy chọn:{' '}
                      <strong className="text-[#2C1810]">
                        {item.sugarLevel || '100% đường'}
                      </strong>{' '}
                      •{' '}
                      <strong className="text-[#2C1810]">
                        {item.iceLevel || 'Đá bình thường'}
                      </strong>
                      {toppingsList.length > 0 &&
                        ` • Topping: ${toppingsList
                          .map((t) => t.name)
                          .join(', ')}`}
                    </p>
                    {item.itemNote && (
                      <p className="text-xs text-[#B45309] italic">
                        Ghi chú Barista: &ldquo;{item.itemNote}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#2C1810] tabular-nums shrink-0">
                    {formatVND(item.lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#E6DCD2] pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#795548]">
            <span>Tạm tính</span>
            <span className="font-semibold text-[#2C1810] tabular-nums">
              {formatVND(order.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#795548]">
            <span>
              Giảm giá khuyến mãi{' '}
              {order.promotionCode ? `(${order.promotionCode})` : ''}
            </span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              -{formatVND(order.discountAmount)}
            </span>
          </div>
          {(order.pointsDiscountAmount || order.pointsUsed || 0) > 0 && (
            <div className="flex items-center justify-between text-[#B45309] font-semibold">
              <span>
                Quy đổi {(order.pointsUsed || 0).toLocaleString('vi-VN')} điểm
                thưởng
              </span>
              <span className="tabular-nums">
                -{formatVND(order.pointsDiscountAmount || order.pointsUsed || 0)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-[#E6DCD2] text-base font-extrabold text-[#2C1810]">
            <span>Tổng cộng hóa đơn</span>
            <span className="text-xl text-[#B45309] tabular-nums">
              {formatVND(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
