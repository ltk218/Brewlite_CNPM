'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  CreditCard,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Award,
  Store,
  ShoppingBag,
  Coins,
} from 'lucide-react';
import { api, formatVND, PaymentMethod } from '../../../lib/api';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, hydrated, refreshProfile, updateUserPoints } =
    useAuthStore();
  const {
    items,
    appliedPromo,
    usePoints,
    setUsePoints,
    pendingOrderId,
    setPendingOrderId,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getPointsUsed,
    getFinalTotal,
  } = useCartStore();

  const [pickupMethod, setPickupMethod] = useState<
    'PICKUP_COUNTER' | 'TAKEAWAY_BAG'
  >('PICKUP_COUNTER');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [failedOrderCode, setFailedOrderCode] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login?redirect=/checkout');
    }
  }, [hydrated, token, router]);

  const isCustomer = user?.role === 'CUSTOMER';
  const availablePoints = isCustomer ? user.loyaltyPoints : 0;

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const pointsUsed = getPointsUsed(availablePoints);
  const finalTotal = getFinalTotal(availablePoints);
  const estimatedPointsEarned = isCustomer
    ? Math.floor(finalTotal * 0.05)
    : 0;

  const handlePayment = async () => {
    if (!token || items.length === 0) return;
    setProcessing(true);
    setPaymentError(null);

    try {
      let currentOrderId = pendingOrderId;

      if (!currentOrderId) {
        const createdOrder = await api.createOrder(token, {
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            qty: i.qty,
            sugarLevel: i.sugarLevel,
            iceLevel: i.iceLevel,
            itemNote: i.itemNote,
            toppingIds: i.toppings.map((t) => t.id),
          })),
          promotionCode: appliedPromo?.code,
          pointsUsed: isCustomer ? pointsUsed : 0,
          pickupMethod,
          customerNote,
        });
        currentOrderId = createdOrder.id;
        setPendingOrderId(createdOrder.id);
      }

      const idempotencyKey = `pay-${currentOrderId}-${Date.now()}-${
        simulateFailure ? 'fail' : 'ok'
      }`;

      const result = await api.processPayment(token, {
        orderId: currentOrderId,
        method: paymentMethod,
        idempotencyKey,
        simulateFailure,
      });

      if (
        result.payment.status === 'FAILED' ||
        result.order.status === 'PAYMENT_FAILED'
      ) {
        setFailedOrderCode(result.order.orderCode);
        setPaymentError(
          result.payment.errorMessage ||
            'Thanh toán không thành công (Trạng thái đơn: PAYMENT_FAILED). Đơn hàng và giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử thanh toán lại.',
        );
        return;
      }

      if (isCustomer && user) {
        const nextBalance =
          Math.max(0, user.loyaltyPoints - pointsUsed) +
          (result.pointsEarned || estimatedPointsEarned);
        updateUserPoints(nextBalance);
      }

      clearCart();
      await refreshProfile();
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : 'Không thể xử lý giao dịch lúc này, vui lòng thử lại',
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 h-96 bg-white border border-[#E6DCD2] rounded-2xl" />
        <div className="h-80 bg-white border border-[#E6DCD2] rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-[#2C1810]">
          Chưa có món nào để thanh toán
        </h2>
        <p className="text-sm text-[#795548]">
          Vui lòng chọn đồ uống vào giỏ hàng trước khi tiến hành thanh toán.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3E2723] text-white text-sm font-bold hover:bg-[#2C1810]"
        >
          Quay về Thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#795548] hover:text-[#3E2723]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại giỏ hàng</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] mt-1">
          Thanh toán không tiền mặt
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2C1810]">
              1. Chọn hình thức nhận đồ uống tại quầy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupMethod('PICKUP_COUNTER')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  pickupMethod === 'PICKUP_COUNTER'
                    ? 'bg-amber-50/70 border-[#3E2723]'
                    : 'bg-[#FDFBF7] border-[#E6DCD2]'
                }`}
              >
                <Store className="w-5 h-5 text-[#3E2723] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-[#2C1810] block">
                    Nhận trực tiếp tại Quầy Pick-up
                  </span>
                  <span className="text-xs text-[#795548]">
                    Ly dùng ngay tại quán hoặc lấy liền không xếp hàng
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPickupMethod('TAKEAWAY_BAG')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  pickupMethod === 'TAKEAWAY_BAG'
                    ? 'bg-amber-50/70 border-[#3E2723]'
                    : 'bg-[#FDFBF7] border-[#E6DCD2]'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-[#2C1810] block">
                    Đóng gói mang đi (Take-away)
                  </span>
                  <span className="text-xs text-[#795548]">
                    Ép màng nắp chống tràn kèm túi giữ nhiệt & ống hút
                  </span>
                </div>
              </button>
            </div>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Ghi chú chung cho đơn hàng (VD: Tách riêng túi 2 ly)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs sm:text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
            />
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2C1810]">
              2. Chọn phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'WALLET'
                    ? 'bg-amber-50/70 border-[#3E2723] shadow-sm'
                    : 'bg-[#FDFBF7] border-[#E6DCD2] hover:border-[#3E2723]/40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'WALLET'
                      ? 'bg-[#3E2723] text-white'
                      : 'bg-white text-[#3E2723] border border-[#E6DCD2]'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2C1810]">
                      Ví điện tử (MoMo / VNPay)
                    </span>
                    {paymentMethod === 'WALLET' && (
                      <CheckCircle2 className="w-4 h-4 text-[#3E2723]" />
                    )}
                  </div>
                  <p className="text-xs text-[#795548] mt-1">
                    Xác thực tức thì qua ứng dụng Ví điện tử không tiền mặt
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-50/70 border-[#3E2723] shadow-sm'
                    : 'bg-[#FDFBF7] border-[#E6DCD2] hover:border-[#3E2723]/40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'CARD'
                      ? 'bg-[#3E2723] text-white'
                      : 'bg-white text-[#3E2723] border border-[#E6DCD2]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2C1810]">
                      Thẻ ngân hàng (Visa / Napas)
                    </span>
                    {paymentMethod === 'CARD' && (
                      <CheckCircle2 className="w-4 h-4 text-[#3E2723]" />
                    )}
                  </div>
                  <p className="text-xs text-[#795548] mt-1">
                    Thanh toán bảo mật chuẩn quốc tế với khóa Idempotency-Key
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#B45309] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C1810]">
                    Mô phỏng lỗi thanh toán (Test PAYMENT_FAILED)
                  </h3>
                  <p className="text-xs text-[#795548] mt-0.5">
                    Khi bật công tắc này, giao dịch sẽ giả lập trạng thái lỗi{' '}
                    <span className="font-semibold text-[#2C1810]">
                      PAYMENT_FAILED
                    </span>{' '}
                    để kiểm thử tính năng giữ nguyên đơn và thanh toán lại.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>

            {paymentError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-start gap-2.5 text-red-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-bold">
                      Giao dịch thất bại{' '}
                      {failedOrderCode ? `(Đơn ${failedOrderCode})` : ''}
                    </p>
                    <p>{paymentError}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setSimulateFailure(false);
                      setTimeout(() => {
                        handlePayment();
                      }, 50);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tắt mô phỏng lỗi & Thử thanh toán lại ngay</span>
                  </button>
                  {pendingOrderId && (
                    <Link
                      href={`/orders/${pendingOrderId}`}
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      Xem trạng thái đơn {failedOrderCode || ''} →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#2C1810]">
            3. Tóm tắt đơn hàng ({items.reduce((s, i) => s + i.qty, 0)} ly)
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-[#E6DCD2]">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs sm:text-sm"
              >
                <div>
                  <p className="font-bold text-[#2C1810]">
                    {item.qty}x {item.productName} (Size {item.size})
                  </p>
                  <p className="text-[11px] text-[#5D4037]">
                    {item.sugarLevel} • {item.iceLevel}
                  </p>
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-[#795548]">
                      + {item.toppings.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-bold text-[#2C1810] tabular-nums shrink-0">
                  {formatVND(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          {isCustomer && availablePoints > 0 && !pendingOrderId && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-[#B45309] shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-[#2C1810]">
                    Dùng {availablePoints.toLocaleString('vi-VN')} điểm thưởng
                  </p>
                  <p className="text-[11px] text-[#795548]">
                    Quy đổi 1 điểm = giảm 1đ trực tiếp
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3E2723]" />
              </label>
            </div>
          )}

          <div className="border-t border-[#E6DCD2] pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-[#795548]">
              <span>Tạm tính</span>
              <span className="font-semibold text-[#2C1810] tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#795548]">
              <span>
                Giảm giá {appliedPromo ? `(${appliedPromo.code})` : ''}
              </span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                -{formatVND(discountAmount)}
              </span>
            </div>
            {isCustomer && pointsUsed > 0 && (
              <div className="flex items-center justify-between text-[#B45309] font-semibold">
                <span>Dùng {pointsUsed.toLocaleString('vi-VN')} điểm</span>
                <span className="tabular-nums">-{formatVND(pointsUsed)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#E6DCD2] text-base font-extrabold text-[#2C1810]">
              <span>Tổng thanh toán</span>
              <span className="text-xl text-[#B45309] tabular-nums">
                {formatVND(finalTotal)}
              </span>
            </div>
          </div>

          {isCustomer && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-semibold text-[#3E2723]">
              <Award className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>
                Bạn sẽ tích lũy thêm{' '}
                <strong className="text-[#B45309] tabular-nums">
                  +{estimatedPointsEarned.toLocaleString('vi-VN')} điểm
                </strong>{' '}
                thưởng sau khi thanh toán
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={processing}
            onClick={handlePayment}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#3E2723] text-white font-bold text-sm sm:text-base hover:bg-[#2C1810] disabled:opacity-50 transition-all shadow-sm tabular-nums"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>
              {processing
                ? 'Đang xử lý giao dịch...'
                : paymentError
                  ? `Thử thanh toán lại • ${formatVND(finalTotal)}`
                  : `Xác nhận thanh toán • ${formatVND(finalTotal)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
