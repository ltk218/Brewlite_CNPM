'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Coffee,
  LayoutDashboard,
  ClipboardCheck,
  Package,
  Boxes,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/orders',
    label: 'Điều phối KDS & Đơn',
    icon: ClipboardCheck,
    exact: false,
  },
  {
    href: '/admin/products',
    label: 'Thực đơn & Giá',
    icon: Package,
    exact: false,
  },
  {
    href: '/admin/inventory',
    label: 'Kho Nguyên Liệu & BOM',
    icon: Boxes,
    exact: false,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, hydrated, logout } = useAuthStore();

  useEffect(() => {
    if (hydrated && (!token || user?.role !== 'ADMIN')) {
      router.replace('/login?redirect=/admin');
    }
  }, [hydrated, token, user, router]);

  if (!hydrated || !token || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F7F2EB] flex items-center justify-center p-8">
        <div className="w-full max-w-md h-48 rounded-2xl bg-white border border-[#E6DCD2] animate-pulse p-6 flex items-center justify-center text-sm font-semibold text-[#795548]">
          Đang xác thực quyền Quản trị viên...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2EB] text-[#2C1810] flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#2C1810] text-[#F5EBE6] border-b lg:border-b-0 lg:border-r border-[#4E342E] flex flex-col z-30">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#4E342E]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#2C1810] flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white block leading-none">
                BrewLite POS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Smart KDS & BOM
              </span>
            </div>
          </Link>
        </div>

        <nav className="p-4 flex lg:flex-col gap-1.5 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-amber-400 text-[#2C1810] shadow-sm'
                    : 'text-[#D7CCC8] hover:bg-[#3E2723] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="lg:pt-4 lg:mt-4 lg:border-t border-[#4E342E]">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-200 bg-[#3E2723] border border-[#5D4037] hover:bg-[#4E342E] whitespace-nowrap transition-colors"
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Về trang Khách hàng</span>
            </Link>
          </div>
        </nav>

        <div className="hidden lg:flex mt-auto p-4 border-t border-[#4E342E] items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user.fullName}
            </p>
            <p className="text-[11px] text-[#D7CCC8] truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            title="Đăng xuất"
            className="p-2 rounded-xl text-[#D7CCC8] hover:text-red-300 hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-[#E6DCD2] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2C1810]">
            <ShieldCheck className="w-4 h-4 text-[#B45309]" />
            <span>Hệ thống Điều phối Quầy Pha Chế KDS & Quản lý Định lượng BOM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#795548] hidden sm:inline">
              Quản trị viên: <strong className="text-[#2C1810]">{user.fullName}</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
