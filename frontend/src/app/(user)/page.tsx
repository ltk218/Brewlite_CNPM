'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Coffee,
  RefreshCw,
  CheckCircle2,
  Flame,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  api,
  FALLBACK_COFFEE_IMAGE,
  HERO_BANNER_IMAGE,
  Product,
  ROASTERY_STORY_IMAGE,
} from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { useCartStore } from '../../store/useCartStore';

const CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Rang Mộc Tươi Mỗi Sáng • 100% Specialty',
    title: 'Đậm Đà Hương Vị Cà Phê Phin & Espresso Nguyên Bản',
    subtitle:
      'Tuyển chọn hạt Robusta Đắk Lắk và Arabica Cầu Đất chín đỏ, chiết xuất chuẩn vị Barista chỉ trong vài chạm.',
    ctaText: 'Khám phá Sản phẩm',
    ctaHref: '/menu',
    secondaryText: 'Đọc Blog Cà Phê',
    secondaryHref: '/story',
    image: HERO_BANNER_IMAGE,
  },
  {
    id: 'slide-2',
    badge: 'Đặt Trước Không Tiền Mặt • Tích Điểm Đổi Thưởng',
    title: 'Không Xếp Hàng Giờ Cao Điểm — Tới Quầy Là Có Nước',
    subtitle:
      'Thanh toán một chạm qua Ví điện tử hoặc Thẻ ngân hàng. Tích lũy ngay 5% giá trị hóa đơn thành điểm thưởng (1 điểm = 1đ).',
    ctaText: 'Tìm hiểu Về chúng tôi',
    ctaHref: '/promotions',
    secondaryText: 'Đặt món ngay',
    secondaryHref: '/menu',
    image: ROASTERY_STORY_IMAGE,
  },
  {
    id: 'slide-3',
    badge: 'Bộ Sưu Tập Đặc Sản Mùa Mới',
    title: 'Cold Brew Ủ Lạnh 18 Giờ & Matcha Uji Kem Phô Mai',
    subtitle:
      'Sự kết hợp thanh mát giữa cam vàng tươi, sả cây tự nhiên và bột trà xanh Uji Nhật Bản thượng hạng.',
    ctaText: 'Thử Ngay Món Mới',
    ctaHref: '/menu',
    secondaryText: 'Khám phá Câu chuyện',
    secondaryHref: '/story',
    image: FALLBACK_COFFEE_IMAGE,
  },
];

const BEST_SELLER_NAMES = [
  'Cà Phê Sữa Đá Sài Gòn',
  'Bạc Xỉu Đá Hạt Dẻ',
  'Caramel Macchiato',
  'Trà Đào Cam Sả',
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data.products);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách thực đơn lúc này',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleQuickAdd = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.price,
      size: 'S',
      qty: 1,
      toppings: [],
    });
    showToast(`Đã thêm "${product.name} (Size S)" vào giỏ hàng`);
  };

  const bestSellers = products.filter((p) =>
    BEST_SELLER_NAMES.includes(p.name),
  );
  const displayBestSellers =
    bestSellers.length >= 4 ? bestSellers.slice(0, 4) : products.slice(0, 4);

  const specialtyPicks = products
    .filter((p) => !displayBestSellers.some((b) => b.id === p.id))
    .slice(0, 4);

  return (
    <div className="space-y-12">
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#2C1810] text-amber-100 text-sm font-bold shadow-xl border border-amber-400/30">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#5D4037] text-white shadow-xl border border-[#6D4C41]/40"
      >
        <div
          className="flex transition-transform duration-700 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {CAROUSEL_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[430px]"
            >
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 pb-16 lg:pb-16 space-y-5 z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{slide.badge}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.18] text-[#FDFBF7]">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base text-[#E6DCD2] leading-relaxed max-w-xl">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-[#2C1810] font-extrabold text-sm hover:bg-amber-300 transition-colors shadow-md"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={slide.secondaryHref}
                    className="px-5 py-3.5 rounded-xl bg-white/10 text-amber-100 border border-white/20 font-bold text-sm hover:bg-white/20 transition-colors"
                  >
                    {slide.secondaryText}
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-[430px] overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      FALLBACK_COFFEE_IMAGE;
                  }}
                  className="w-full h-full object-cover scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#3E2723] via-[#3E2723]/35 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-6 sm:left-10 lg:left-12 right-6 sm:right-10 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {CAROUSEL_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Chuyển đến banner ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  currentSlide === idx
                    ? 'w-9 bg-amber-400 shadow-sm'
                    : 'w-2.5 bg-white/35 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide(
                  (prev) =>
                    (prev - 1 + CAROUSEL_SLIDES.length) %
                    CAROUSEL_SLIDES.length,
                )
              }
              className="w-9 h-9 rounded-xl bg-[#2C1810]/70 backdrop-blur-md hover:bg-amber-400 hover:text-[#2C1810] flex items-center justify-center text-white border border-white/20 transition-all shadow-md"
              aria-label="Banner trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev + 1) % CAROUSEL_SLIDES.length,
                )
              }
              className="w-9 h-9 rounded-xl bg-[#2C1810]/70 backdrop-blur-md hover:bg-amber-400 hover:text-[#2C1810] flex items-center justify-center text-white border border-white/20 transition-all shadow-md"
              aria-label="Banner tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E6DCD2] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] text-[#B45309] flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#2C1810]">
              100% Hạt Rang Mộc Mới
            </h3>
            <p className="text-xs text-[#795548] mt-0.5">
              Định lượng chuẩn BOM cho từng ly nước
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E6DCD2] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] text-[#3E2723] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#2C1810]">
              Đặt Trước Không Chờ Đợi
            </h3>
            <p className="text-xs text-[#795548] mt-0.5">
              Phân luồng tự động tới 3 trạm KDS Barista
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E6DCD2] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] text-[#B45309] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#2C1810]">
              Tích Điểm Đổi Thưởng (1 Điểm = 1đ)
            </h3>
            <p className="text-xs text-[#795548] mt-0.5">
              Hoàn ngay 5% giá trị hóa đơn thành điểm thưởng
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DCD2] pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#B45309]">
              <TrendingUp className="w-4 h-4" />
              Best Seller Tại BrewLite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] mt-1">
              Món Được Đặt Mua Nhiều Nhất
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả sản phẩm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 bg-white border border-[#E6DCD2] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
            <Coffee className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-sm text-[#795548]">{error}</p>
            <button
              type="button"
              onClick={fetchCatalog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử tải lại</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayBestSellers.map((product, index) => (
              <div key={product.id} className="relative flex flex-col h-full">
                <div className="absolute -top-2.5 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-[#2C1810] text-[11px] font-extrabold shadow-md border border-[#2C1810]/10">
                  <Star className="w-3 h-3 fill-[#2C1810]" />
                  <span>TOP {index + 1} BÁN CHẠY</span>
                </div>
                <ProductCard
                  product={product}
                  onQuickAdd={handleQuickAdd}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {specialtyPicks.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DCD2] pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B45309]">
                Gợi ý từ Barista
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] mt-1">
                Đặc Sản Rang Xay & Thức Uống Signature
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-sm font-extrabold text-[#3E2723] hover:text-[#B45309] inline-flex items-center gap-1.5"
            >
              <span>Mở bộ lọc thực đơn đầy đủ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyPicks.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
