'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  AlertCircle,
  RefreshCw,
  Flame,
  Droplets,
  Snowflake,
  MessageSquare,
} from 'lucide-react';
import {
  api,
  FALLBACK_COFFEE_IMAGE,
  formatVND,
  getSizeUpcharge,
  getStationLabel,
  Product,
  ProductSize,
  Topping,
} from '../../../../lib/api';
import { useCartStore } from '../../../../store/useCartStore';

const SIZES: Array<{ size: ProductSize; label: string; upcharge: number }> = [
  { size: 'S', label: 'Size S (Tiêu chuẩn)', upcharge: 0 },
  { size: 'M', label: 'Size M (Vừa)', upcharge: 6000 },
  { size: 'L', label: 'Size L (Lớn)', upcharge: 12000 },
];

const SUGAR_OPTIONS = [
  '100% đường',
  '70% đường',
  '50% đường',
  '30% đường',
  'Không đường (0%)',
];

const ICE_OPTIONS = [
  'Đá bình thường',
  'Ít đá',
  'Đá để riêng',
  'Không đá',
];

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [sugarLevel, setSugarLevel] = useState<string>('100% đường');
  const [iceLevel, setIceLevel] = useState<string>('Đá bình thường');
  const [itemNote, setItemNote] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_COFFEE_IMAGE);

  const fetchDetail = async () => {
    if (!params?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProductById(params.id);
      setProduct(data.product);
      setImgSrc(data.product.imageUrl || FALLBACK_COFFEE_IMAGE);
      setToppings(data.toppings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không tìm thấy thông tin món',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [params?.id]);

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      }
      return [...prev, topping];
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-36 bg-[#EFE8DF] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-[#E6DCD2] rounded-2xl p-6 sm:p-8">
          <div className="aspect-[4/3] w-full rounded-2xl bg-[#EFE8DF]" />
          <div className="space-y-4">
            <div className="h-8 bg-[#EFE8DF] rounded-xl w-2/3" />
            <div className="h-4 bg-[#EFE8DF] rounded w-full" />
            <div className="h-28 bg-[#EFE8DF] rounded-2xl w-full" />
            <div className="h-36 bg-[#EFE8DF] rounded-2xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-[#2C1810]">
          {error || 'Sản phẩm không tồn tại'}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-[#E6DCD2] text-sm font-semibold text-[#2C1810] hover:bg-[#FDFBF7]"
          >
            Quay lại thực đơn
          </Link>
          <button
            type="button"
            onClick={fetchDetail}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-sm font-semibold hover:bg-[#2C1810]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const maxQty = Math.max(1, product.stock);
  const toppingsSum = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const unitPrice = product.price + getSizeUpcharge(selectedSize) + toppingsSum;
  const totalPrice = unitPrice * qty;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.price,
      size: selectedSize,
      sugarLevel,
      iceLevel,
      itemNote,
      qty,
      toppings: selectedToppings,
    });
    router.push('/cart');
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#795548] hover:text-[#3E2723] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại thực đơn</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-[#E6DCD2] rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EFE8DF] border border-[#E6DCD2]">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImgSrc(FALLBACK_COFFEE_IMAGE)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs sm:text-sm">
            <span className="font-semibold text-[#795548]">Tồn kho quầy:</span>
            <span
              className={`font-extrabold tabular-nums ${
                isOutOfStock
                  ? 'text-red-600'
                  : product.stock <= 5
                    ? 'text-amber-600'
                    : 'text-[#3E2723]'
              }`}
            >
              {isOutOfStock ? 'Tạm hết hàng' : `Còn ${product.stock} ly sẵn sàng`}
            </span>
          </div>

          {product.recipes && product.recipes.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#F7F2EB] border border-[#E6DCD2] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3E2723]">
                  <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                  Định lượng chuẩn BOM (1 ly)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E6DCD2] text-[#5D4037]">
                  {getStationLabel(product.station)}
                </span>
              </div>
              <ul className="space-y-1 text-xs text-[#5D4037]">
                {product.recipes.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <span>• {r.ingredient?.name || 'Nguyên liệu rang xay'}</span>
                    <strong className="tabular-nums text-[#2C1810]">
                      {r.quantityNeeded} {r.ingredient?.unit || 'g'}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-5">
          <div className="space-y-2 border-b border-[#E6DCD2] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F7F2EB] text-[#3E2723] border border-[#E6DCD2]">
                {product.category}
              </span>
              {product.code && (
                <span className="text-xs font-bold text-[#8D6E63]">
                  Mã món: {product.code}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810]">
              {product.name}
            </h1>
            <p className="text-sm text-[#795548] leading-relaxed">
              {product.description}
            </p>
            <div className="pt-1 text-2xl font-extrabold text-[#B45309] tabular-nums">
              {formatVND(product.price)}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider">
                1. Chọn kích cỡ ly (Bắt buộc)
              </h3>
              <span className="text-xs text-[#795548]">Chọn 1 size</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SIZES.map((item) => {
                const active = selectedSize === item.size;
                return (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setSelectedSize(item.size)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-sm'
                        : 'bg-[#FDFBF7] text-[#2C1810] border-[#E6DCD2] hover:border-[#3E2723]/40'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                    <span
                      className={`text-xs mt-0.5 tabular-nums ${
                        active ? 'text-amber-300 font-semibold' : 'text-[#B45309] font-semibold'
                      }`}
                    >
                      +{formatVND(item.upcharge)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#B45309]" />
                <span>2. Mức đường</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {SUGAR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSugarLevel(opt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      sugarLevel === opt
                        ? 'bg-[#3E2723] text-white border-[#3E2723]'
                        : 'bg-[#FDFBF7] text-[#5D4037] border-[#E6DCD2] hover:bg-[#F7F2EB]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-[#B45309]" />
                <span>3. Mức đá</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ICE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIceLevel(opt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      iceLevel === opt
                        ? 'bg-[#3E2723] text-white border-[#3E2723]'
                        : 'bg-[#FDFBF7] text-[#5D4037] border-[#E6DCD2] hover:bg-[#F7F2EB]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider">
                4. Topping thêm (Tùy chọn)
              </h3>
              <span className="text-xs text-[#795548]">Có thể chọn nhiều</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {toppings.map((topping) => {
                const checked = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => toggleTopping(topping)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      checked
                        ? 'bg-amber-50/80 border-[#3E2723] text-[#2C1810]'
                        : 'bg-white border-[#E6DCD2] text-[#2C1810] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checked
                            ? 'bg-[#3E2723] border-[#3E2723] text-white'
                            : 'border-[#795548]/40 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{topping.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#B45309] tabular-nums">
                      +{formatVND(topping.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#B45309]" />
              <span>5. Ghi chú cho Barista (Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="VD: Đánh nhiều bọt sữa, khuấy đều giúp mình..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs sm:text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
            />
          </div>

          <div className="mt-auto pt-4 border-t border-[#E6DCD2] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4 bg-[#FDFBF7] border border-[#E6DCD2] rounded-xl px-4 py-2.5">
              <span className="text-xs font-semibold text-[#795548] sm:hidden">
                Số lượng:
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg bg-white border border-[#E6DCD2] flex items-center justify-center text-[#2C1810] disabled:opacity-40 hover:bg-[#EFE8DF]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-base tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="w-8 h-8 rounded-lg bg-white border border-[#E6DCD2] flex items-center justify-center text-[#2C1810] disabled:opacity-40 hover:bg-[#EFE8DF]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#3E2723] text-white font-bold text-sm sm:text-base hover:bg-[#2C1810] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-sm tabular-nums"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span>
                {isOutOfStock
                  ? 'Sản phẩm tạm hết hàng'
                  : `Thêm vào giỏ hàng • ${formatVND(totalPrice)}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
