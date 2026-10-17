'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Coins,
} from 'lucide-react';
import { api, FALLBACK_COFFEE_IMAGE, formatVND } from '../../../lib/api';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    items,
    appliedPromo,
    usePoints,
    updateQty,
    removeItem,
    setAppliedPromo,
    setUsePoints,
    getSubtotal,
    getDiscountAmount,
    getPointsUsed,
    getFinalTotal,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState<string>(appliedPromo?.code || '');
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const isCustomer = !user || user.role === 'CUSTOMER';
  const availablePoints =
    user && user.role === 'CUSTOMER' ? user.loyaltyPoints : 0;

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const pointsUsed = getPointsUsed(availablePoints);
  const finalTotal = getFinalTotal(availablePoints);
  const maxRedeemableNow = Math.min(
    availablePoints,
    Math.max(0, subtotal - discountAmount),
  );
  const estimatedPointsEarned = Math.floor(finalTotal * 0.05);

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = (codeToApply ?? promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Vui lòng nhập mã khuyến mãi');
      return;
    }
    setPromoInput(code);
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await api.applyPromotion({ code, subtotal });
      setAppliedPromo({
        code: res.code,
        description: res.description,
        discountAmount: res.discountAmount,
        minOrderValue: res.minOrderValue,
        discountPercent: res.discountPercent,
        maxDiscountAmount: res.maxDiscountAmount,
      });
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(
        err instanceof Error ? err.message : 'Không thể áp dụng mã giảm giá',
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleProceedCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#EFE8DF] text-[#3E2723] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-[#2C1810]">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="text-sm text-[#795548]">
          Hãy khám phá thực đơn cà phê Specialty và chọn cho mình một ly nước
          yêu thích nhé.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3E2723] text-white text-sm font-bold hover:bg-[#2C1810] transition-colors"
        >
          <span>Khám phá thực đơn</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#795548] hover:text-[#3E2723]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục chọn thêm món</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] mt-1">
            Giỏ hàng của bạn
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-[#E6DCD2] rounded-2xl shadow-sm"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.imageUrl || FALLBACK_COFFEE_IMAGE}
                  alt={item.productName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      FALLBACK_COFFEE_IMAGE;
                  }}
                  className="w-20 h-20 rounded-xl object-cover bg-[#EFE8DF] border border-[#E6DCD2] shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#2C1810]">
                    {item.productName}
                  </h3>
                  <p className="text-xs font-bold text-[#3E2723]">
                    Size {item.size} • {item.sugarLevel || '100% đường'} •{' '}
                    {item.iceLevel || 'Đá bình thường'}
                  </p>
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-[#795548]">
                      Topping: {item.toppings.map((t) => t.name).join(', ')}
                    </p>
                  )}
                  {item.itemNote && (
                    <p className="text-xs text-[#B45309] italic">
                      Ghi chú: &ldquo;{item.itemNote}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-[#795548] tabular-nums">
                    Đơn giá: {formatVND(item.unitPrice)} / ly
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6DCD2]">
                <div className="flex items-center gap-2 bg-[#FDFBF7] border border-[#E6DCD2] rounded-xl px-2.5 py-1.5">
                  <button
                    type="button"
                    onClick={() => updateQty(item.cartItemId, item.qty - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E6DCD2] flex items-center justify-center hover:bg-[#EFE8DF]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.cartItemId, item.qty + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E6DCD2] flex items-center justify-center hover:bg-[#EFE8DF]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-base font-extrabold text-[#B45309] tabular-nums">
                    {formatVND(item.lineTotal)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  title="Xóa món"
                  className="p-2 rounded-xl text-[#795548] hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#2C1810] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#B45309]" />
              <span>Mã khuyến mãi (Voucher)</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã ưu đãi..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm font-semibold uppercase text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
              />
              <button
                type="button"
                disabled={promoLoading}
                onClick={() => handleApplyVoucher()}
                className="px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] disabled:opacity-50 transition-colors"
              >
                {promoLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-[#795548]">
                Chọn nhanh mã ưu đãi có sẵn:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyVoucher('BREWLITE10')}
                  className="p-2.5 rounded-xl border border-[#E6DCD2] bg-[#FDFBF7] hover:border-[#3E2723] text-left transition-colors"
                >
                  <span className="text-xs font-extrabold text-[#3E2723] block">
                    BREWLITE10
                  </span>
                  <span className="text-[11px] text-[#795548]">
                    Giảm 10% (Đơn từ 40K)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyVoucher('CHAOBANMOI')}
                  className="p-2.5 rounded-xl border border-[#E6DCD2] bg-[#FDFBF7] hover:border-[#3E2723] text-left transition-colors"
                >
                  <span className="text-xs font-extrabold text-[#3E2723] block">
                    CHAOBANMOI
                  </span>
                  <span className="text-[11px] text-[#795548]">
                    Giảm 20% (Đơn từ 80K)
                  </span>
                </button>
              </div>
            </div>

            {promoError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{promoError}</span>
              </div>
            )}

            {appliedPromo && discountAmount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã áp dụng {appliedPromo.code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoInput('');
                  }}
                  className="text-red-600 hover:underline font-bold"
                >
                  Bỏ mã
                </button>
              </div>
            )}
          </div>

          {isCustomer && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#2C1810] flex items-center justify-center shrink-0 shadow-sm">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#2C1810]">
                      Dùng điểm thưởng BrewLite Xu
                    </p>
                    <p className="text-[11px] text-[#795548] tabular-nums">
                      {user
                        ? `Đang có ${availablePoints.toLocaleString('vi-VN')} điểm (1 điểm = 1đ)`
                        : 'Đăng nhập để dùng điểm giảm trực tiếp (1 điểm = 1đ)'}
                    </p>
                  </div>
                </div>

                {user && availablePoints > 0 && (
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3E2723]" />
                  </label>
                )}
              </div>

              {user && availablePoints > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/60">
                  <span className="text-[#5D4037] font-medium">
                    {usePoints
                      ? `Đang dùng ${pointsUsed.toLocaleString('vi-VN')} điểm`
                      : `Có thể giảm ngay ${formatVND(maxRedeemableNow)}`}
                  </span>
                  <span className="font-extrabold text-[#B45309] tabular-nums">
                    {usePoints ? `-${formatVND(pointsUsed)}` : 'Bật để trừ tiền'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-[#E6DCD2] pt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-[#795548]">
              <span>Tạm tính</span>
              <span className="font-semibold text-[#2C1810] tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#795548]">
              <span>Giảm giá khuyến mãi</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                -{formatVND(discountAmount)}
              </span>
            </div>
            {isCustomer && pointsUsed > 0 && (
              <div className="flex items-center justify-between text-[#B45309] font-semibold">
                <span>Quy đổi {pointsUsed.toLocaleString('vi-VN')} điểm</span>
                <span className="tabular-nums">-{formatVND(pointsUsed)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[#E6DCD2] text-base font-extrabold text-[#2C1810]">
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
                Đơn này hoàn thêm{' '}
                <strong className="text-[#B45309] tabular-nums">
                  +{estimatedPointsEarned.toLocaleString('vi-VN')} điểm
                </strong>{' '}
                (5% hóa đơn)
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleProceedCheckout}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#3E2723] text-white font-bold text-sm sm:text-base hover:bg-[#2C1810] transition-all shadow-sm"
          >
            <span>Thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
