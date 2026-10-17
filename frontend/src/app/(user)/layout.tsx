'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Coffee,
  ShoppingBag,
  Award,
  LogOut,
  LogIn,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Phone,
  MapPin,
  Clock,
  Flame,
  Gift,
  Heart,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { formatVND } from '../../lib/api';

const MAIN_NAV_LINKS = [
  {
    href: '/',
    label: 'Trang chủ',
    match: (pathname: string) => pathname === '/',
  },
  {
    href: '/menu',
    label: 'Sản phẩm',
    match: (pathname: string) =>
      pathname.startsWith('/menu') || pathname.startsWith('/products'),
  },
  {
    href: '/promotions',
    label: 'Về chúng tôi',
    match: (pathname: string) => pathname.startsWith('/promotions'),
  },
  {
    href: '/story',
    label: 'Câu chuyện',
    match: (pathname: string) => pathname.startsWith('/story'),
  },
  {
    href: '/orders',
    label: 'Đơn hàng',
    match: (pathname: string) => pathname.startsWith('/orders'),
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, refreshProfile } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const totalCount = useCartStore((state) => state.getTotalCount());
  const totalAmount = useCartStore((state) => state.getTotal());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token, refreshProfile]);

  const showFloatingCart =
    items.length > 0 && pathname !== '/cart' && pathname !== '/checkout';

  const isCartActive =
    pathname.startsWith('/cart') || pathname.startsWith('/checkout');

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2C1810]">
      <div className="bg-[#2C1810] text-[#F5EBE6] text-xs py-2 px-4 border-b border-[#4E342E]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Hương vị cà phê nguyên bản rang mộc mỗi sáng — Đặt trước tiện lợi,
              nhận nước liền tay không cần chờ đợi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-[#D7CCC8]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Mở cửa: 07:00 – 22:30
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Hotline: 1900 6886
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E6DCD2] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4E342E] to-[#2C1810] flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <div className="whitespace-nowrap">
              <span className="text-xl font-extrabold tracking-tight text-[#2C1810] block leading-none">
                BrewLite
              </span>
              <span className="text-[11px] font-bold text-[#8D6E63] tracking-widest uppercase block mt-0.5">
                Coffee Roastery
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-3 flex-1 px-4">
            {MAIN_NAV_LINKS.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap leading-none transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3E2723] text-white shadow-sm'
                      : 'text-[#5D4037] hover:bg-[#F7F2EB] hover:text-[#2C1810]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            {user && user.role === 'CUSTOMER' && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F7F2EB] border border-[#E6DCD2] text-xs font-bold text-[#3E2723] whitespace-nowrap leading-none">
                <Award className="w-4 h-4 text-[#B45309] shrink-0" />
                <span className="tabular-nums">
                  {user.loyaltyPoints.toLocaleString('vi-VN')} điểm
                </span>
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-100/90 text-[#3E2723] border border-amber-300 hover:bg-amber-200 transition-colors whitespace-nowrap leading-none"
              >
                <ShieldCheck className="w-4 h-4 text-[#B45309] shrink-0" />
                <span className="hidden md:inline">Quản trị</span>
              </Link>
            )}

            <Link
              href="/cart"
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap leading-none ${
                isCartActive
                  ? 'bg-[#2C1810] text-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-[#3E2723] text-white hover:bg-[#2C1810]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-400 text-[#2C1810] font-extrabold tabular-nums leading-none">
                {totalCount}
              </span>
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E6DCD2]">
                <span className="hidden xl:inline text-xs font-bold text-[#3E2723] max-w-[130px] truncate whitespace-nowrap">
                  {user.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  title="Đăng xuất"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#795548] hover:text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap leading-none"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#F7F2EB] text-[#3E2723] border border-[#E6DCD2] hover:bg-[#EFE8DF] transition-colors whitespace-nowrap leading-none"
              >
                <LogIn className="w-4 h-4 text-[#B45309] shrink-0" />
                <span>Đăng nhập</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl bg-[#F7F2EB] border border-[#E6DCD2] text-[#3E2723]"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FDFBF7] border-t border-[#E6DCD2] px-4 py-4 space-y-2 shadow-lg">
            {MAIN_NAV_LINKS.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-[#3E2723] text-white'
                      : 'text-[#3E2723] hover:bg-[#F7F2EB]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <div className="pt-2 border-t border-[#E6DCD2] flex items-center justify-between px-4 py-2">
                <span className="text-xs font-bold text-[#5D4037]">
                  {user.fullName}
                  {user.role === 'CUSTOMER'
                    ? ` (${user.loyaltyPoints.toLocaleString('vi-VN')} điểm)`
                    : ' (Quản trị viên)'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="text-xs font-bold text-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        {children}
      </main>

      <footer className="bg-[#2C1810] text-[#EFE8DF] border-t-4 border-[#6D4C41] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-white block leading-none">
                    BrewLite Roastery
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider">
                    Artisanal Vietnamese Coffee
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#D7CCC8] leading-relaxed">
                Tuyển chọn hạt Arabica Cầu Đất và Robusta Đắk Lắk rang mộc tươi
                mỗi ngày. Đặt món không tiền mặt, nhận nước nhanh tại quầy và
                tích điểm thành viên tự động.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <Flame className="w-4 h-4" />
                <span>Rang mộc 100% • Tươi mới mỗi sáng</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                Danh mục thức uống
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#D7CCC8]">
                <li>
                  <Link href="/menu?category=Cà phê truyền thống" className="hover:text-white transition-colors">
                    • Cà phê truyền thống Sài Gòn
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=Espresso & Máy" className="hover:text-white transition-colors">
                    • Espresso & Cà phê máy Ý
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=Cold Brew" className="hover:text-white transition-colors">
                    • Cold Brew Ủ Lạnh 18 Giờ
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=Trà trái cây" className="hover:text-white transition-colors">
                    • Trà Trái Cây Nhiệt Đới
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=Matcha & Sữa" className="hover:text-white transition-colors">
                    • Matcha Uji & Sữa Tươi
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                Khám phá & Dịch vụ
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#D7CCC8]">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    • Trang chủ & Best Seller
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="hover:text-white transition-colors">
                    • Tất cả Sản phẩm & Bộ lọc
                  </Link>
                </li>
                <li>
                  <Link href="/promotions" className="hover:text-white transition-colors">
                    • Về chúng tôi & Đặc quyền
                  </Link>
                </li>
                <li>
                  <Link href="/story" className="hover:text-white transition-colors">
                    • Câu chuyện & Blog Cà Phê
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white transition-colors">
                    • Lịch sử đơn hàng của tôi
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                Liên hệ & Quầy pha chế
              </h3>
              <div className="space-y-2.5 text-xs sm:text-sm text-[#D7CCC8]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hotline CSKH: 1900 6886</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>07:00 – 22:30 (Tất cả các ngày)</span>
                </p>
                <p className="flex items-center gap-2 pt-1 text-amber-200 font-semibold">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hỗ trợ Ví MoMo, VNPay, Thẻ Visa / Napas</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#4E342E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1887F]">
            <p>© 2026 BrewLite Specialty Coffee Roastery — Nhóm 19 CNPM SGU.</p>
            <p className="flex items-center gap-1">
              <span>Chế tác với</span>
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>dành cho tín đồ cà phê Việt</span>
            </p>
          </div>
        </div>
      </footer>

      {showFloatingCart && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <Link
              href="/cart"
              className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3E2723] to-[#2C1810] text-white shadow-xl hover:from-[#2C1810] hover:to-[#3E2723] transition-all border border-amber-400/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#2C1810] flex items-center justify-center font-extrabold text-sm tabular-nums">
                  {totalCount}
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-amber-100">
                    Giỏ hàng đang có {totalCount} món
                  </p>
                  <p className="text-xs text-[#D7CCC8]">
                    Nhấn để dùng điểm thưởng, áp mã ưu đãi và thanh toán nhanh
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base text-amber-300 tabular-nums">
                <span>{formatVND(totalAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
