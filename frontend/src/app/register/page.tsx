'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { api, HERO_BANNER_IMAGE, FALLBACK_COFFEE_IMAGE } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const setAuth = useAuthStore((state) => state.setAuth);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({ fullName, email, password });
      setAuth(res.accessToken, res.user);
      router.push(redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể đăng ký tài khoản',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EB] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto bg-white border border-[#E6DCD2] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 relative bg-[#2C1810] text-white p-8 flex flex-col justify-between min-h-[240px]">
          <img
            src={HERO_BANNER_IMAGE}
            alt="BrewLite Coffee"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_COFFEE_IMAGE;
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="relative z-10 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#2C1810] flex items-center justify-center shadow-sm">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                BrewLite Roastery
              </span>
            </Link>
          </div>

          <div className="relative z-10 space-y-2 pt-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quà tặng thành viên mới</span>
            </div>
            <h2 className="text-xl font-extrabold text-amber-100 leading-snug">
              Tặng ngay 5.000 điểm thưởng (giảm 5.000đ) khi đăng ký hôm nay
            </h2>
            <p className="text-xs text-[#D7CCC8]">
              Quy đổi 1 điểm = 1đ trực tiếp vào hóa đơn như Xu thưởng.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C1810]">
              Đăng ký thành viên BrewLite
            </h1>
            <p className="text-sm text-[#795548] mt-1">
              Tạo tài khoản miễn phí chỉ trong 15 giây
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C1810]">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C1810]">
                Địa chỉ Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@brewlite.vn"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C1810]">
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#3E2723] text-white font-bold text-sm hover:bg-[#2C1810] disabled:opacity-50 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#E6DCD2] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#795548]">
            <p>
              Đã có tài khoản?{' '}
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="font-bold text-[#B45309] hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
            <Link href="/" className="font-semibold text-[#5D4037] hover:text-[#2C1810]">
              ← Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F2EB] flex items-center justify-center p-8">
          <div className="w-full max-w-md h-96 rounded-2xl bg-white border border-[#E6DCD2] animate-pulse" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
