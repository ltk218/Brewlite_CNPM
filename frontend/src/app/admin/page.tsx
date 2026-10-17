'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  BarChart3,
  PieChart,
  Sparkles,
} from 'lucide-react';
import {
  AdminStatsResponse,
  api,
  formatDateTime,
  formatVND,
  OrderStatus,
} from '../../lib/api';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { useAuthStore } from '../../store/useAuthStore';

const STATUS_BAR_ITEMS: Array<{
  status: OrderStatus;
  label: string;
  color: string;
}> = [
  { status: 'COMPLETED', label: 'Hoàn tất (COMPLETED)', color: '#3E2723' },
  { status: 'READY', label: 'Chờ lấy nước (READY)', color: '#059669' },
  { status: 'PREPARING', label: 'Đang pha (PREPARING)', color: '#D97706' },
  { status: 'PAID', label: 'Chờ nhận (PAID)', color: '#2563EB' },
  { status: 'PENDING', label: 'Chờ thanh toán (PENDING)', color: '#795548' },
  { status: 'PAYMENT_FAILED', label: 'Lỗi TT (PAYMENT_FAILED)', color: '#DC2626' },
  { status: 'CANCELLED', label: 'Đã hủy (CANCELLED)', color: '#A8A29E' },
];

export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [animateChart, setAnimateChart] = useState<boolean>(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<OrderStatus | null>(null);

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    setAnimateChart(false);
    setError(null);
    try {
      const data = await api.getAdminStats(token);
      setStats(data);
      setTimeout(() => {
        setAnimateChart(true);
      }, 80);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải thống kê quản trị',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white border border-[#E6DCD2] rounded-2xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white border border-[#E6DCD2] rounded-2xl" />
          <div className="h-80 bg-white border border-[#E6DCD2] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-red-600">
          {error || 'Lỗi dữ liệu'}
        </p>
        <button
          type="button"
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const maxDayRevenue = Math.max(
    ...stats.revenueLast7Days.map((d) => d.revenue),
    100000,
  );

  const hoveredDay =
    hoveredBarIndex !== null
      ? stats.revenueLast7Days[hoveredBarIndex]
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C1810]">
            Tổng quan vận hành cửa hàng
          </h1>
          <p className="text-sm text-[#795548]">
            Số liệu doanh thu thực tế, đơn hàng tại quầy và cảnh báo tồn kho
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E6DCD2] text-xs sm:text-sm font-bold text-[#2C1810] hover:bg-[#FDFBF7] shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Cập nhật số liệu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Tổng doanh thu
            </p>
            <p className="text-2xl font-extrabold text-[#B45309] tabular-nums">
              {formatVND(stats.totalRevenue)}
            </p>
            <p className="text-xs text-[#795548]">Đơn đã thanh toán</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#B45309] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Tổng đơn hàng
            </p>
            <p className="text-2xl font-extrabold text-[#2C1810] tabular-nums">
              {stats.totalOrders}
            </p>
            <p className="text-xs text-[#795548]">Toàn hệ thống</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FDFBF7] text-[#3E2723] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Đơn đang xử lý tại quầy
            </p>
            <p className="text-2xl font-extrabold text-[#3E2723] tabular-nums">
              {stats.activeOrdersCount}
            </p>
            <p className="text-xs text-[#795548]">PAID • PREPARING • READY</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#3E2723] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Món sắp hết kho
            </p>
            <p className="text-2xl font-extrabold text-red-600 tabular-nums">
              {stats.lowStockCount}
            </p>
            <p className="text-xs text-[#795548]">Tồn kho &le; 5 ly</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#3E2723]" />
              <h2 className="text-base font-bold text-[#2C1810]">
                Biểu đồ Doanh thu 7 ngày gần nhất
              </h2>
            </div>

            <div className="min-h-[32px] flex items-center">
              {hoveredDay ? (
                <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#2C1810] text-amber-100 text-xs font-bold shadow-md transition-all duration-200">
                  <span className="text-amber-300">Ngày {hoveredDay.label}:</span>
                  <span className="tabular-nums text-white font-extrabold">
                    {formatVND(hoveredDay.revenue)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-amber-200 tabular-nums">
                    {hoveredDay.ordersCount} đơn
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#795548] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                  Di chuột vào từng cột để xem chi tiết
                </span>
              )}
            </div>
          </div>

          <div className="relative pt-10 pb-2 px-2">
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-5 border-b border-[#E6DCD2] pb-3 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-3">
                {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
                  <div
                    key={idx}
                    className="w-full border-t border-dashed border-[#E6DCD2]/80 flex items-center"
                  >
                    <span className="text-[10px] font-semibold text-[#8D6E63] bg-white pr-2 -mt-2.5 tabular-nums">
                      {Math.round((maxDayRevenue * ratio) / 1000)}K
                    </span>
                  </div>
                ))}
              </div>

              {stats.revenueLast7Days.map((item, idx) => {
                const heightPercent = Math.max(
                  6,
                  Math.round((item.revenue / maxDayRevenue) * 100),
                );
                const isHovered = hoveredBarIndex === idx;
                const avgOrder =
                  item.ordersCount > 0
                    ? Math.round(item.revenue / item.ordersCount)
                    : 0;

                return (
                  <div
                    key={item.date}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end z-10 group cursor-pointer"
                  >
                    <div
                      className={`pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-30 w-44 p-2.5 rounded-xl bg-[#2C1810] text-white shadow-xl border border-amber-400/30 transition-all duration-200 ${
                        isHovered
                          ? 'opacity-100 -translate-y-1 scale-100'
                          : 'opacity-0 translate-y-2 scale-95'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold border-b border-white/10 pb-1">
                        <span>Ngày {item.label}</span>
                        <span>{item.ordersCount} đơn</span>
                      </div>
                      <p className="text-xs font-extrabold text-white mt-1 tabular-nums">
                        Doanh thu: {formatVND(item.revenue)}
                      </p>
                      <p className="text-[10px] text-[#D7CCC8] tabular-nums">
                        TB: {formatVND(avgOrder)} / đơn
                      </p>
                    </div>

                    <span
                      className={`mb-1.5 text-[11px] font-extrabold tabular-nums transition-all duration-300 ${
                        isHovered
                          ? 'text-[#B45309] -translate-y-0.5 scale-110'
                          : 'text-[#5D4037]'
                      }`}
                    >
                      {item.revenue > 0
                        ? `${Math.round(item.revenue / 1000)}K`
                        : '0đ'}
                    </span>

                    <div className="w-full max-w-[46px] h-40 flex items-end justify-center bg-[#FDFBF7]/60 rounded-t-xl overflow-hidden p-0.5">
                      <div
                        style={{
                          height: animateChart ? `${heightPercent}%` : '0%',
                          transitionDelay: `${idx * 75}ms`,
                        }}
                        className={`w-full rounded-t-xl transition-all duration-700 ease-out ${
                          isHovered
                            ? 'bg-gradient-to-t from-[#B45309] to-amber-400 shadow-lg'
                            : item.revenue > 0
                              ? 'bg-gradient-to-t from-[#2C1810] to-[#5D4037]'
                              : 'bg-[#E6DCD2]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 sm:gap-5 pt-2.5">
              {stats.revenueLast7Days.map((item, idx) => {
                const isHovered = hoveredBarIndex === idx;
                return (
                  <div
                    key={item.date}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 text-center cursor-pointer"
                  >
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isHovered
                          ? 'text-[#B45309] font-extrabold'
                          : 'text-[#795548]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#B45309]" />
              <h2 className="text-base font-bold text-[#2C1810]">
                Thống kê trạng thái đơn
              </h2>
            </div>
            <span className="text-xs font-bold text-[#795548] tabular-nums">
              {stats.totalOrders} đơn
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {STATUS_BAR_ITEMS.map((row, idx) => {
              const count = stats.statusBreakdown[row.status] || 0;
              const pct =
                stats.totalOrders > 0
                  ? Math.round((count / stats.totalOrders) * 100)
                  : 0;
              const targetWidth = Math.max(pct, count > 0 ? 8 : 0);
              const isRowHovered = hoveredStatus === row.status;

              return (
                <div
                  key={row.status}
                  onMouseEnter={() => setHoveredStatus(row.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isRowHovered
                      ? 'bg-[#FDFBF7] border-[#8D6E63] shadow-sm scale-[1.01]'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#2C1810] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span>{row.label}</span>
                    </span>
                    <span
                      className={`font-extrabold tabular-nums transition-colors ${
                        isRowHovered ? 'text-[#B45309]' : 'text-[#795548]'
                      }`}
                    >
                      {count} đơn ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#FDFBF7] overflow-hidden border border-[#E6DCD2]">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: animateChart ? `${targetWidth}%` : '0%',
                        backgroundColor: row.color,
                        transitionDelay: `${idx * 90}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6DCD2] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E6DCD2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2C1810]">
              5 Đơn hàng mới nhất
            </h2>
            <p className="text-xs text-[#795548]">
              Cập nhật theo thời gian thực tại quầy
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3E2723] hover:underline"
          >
            <span>Quản lý toàn bộ đơn</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#E6DCD2] text-[11px] font-bold uppercase tracking-wider text-[#795548]">
                <th className="py-3.5 px-5">Mã đơn</th>
                <th className="py-3.5 px-5">Khách hàng</th>
                <th className="py-3.5 px-5">Món đã đặt</th>
                <th className="py-3.5 px-5">Thời gian</th>
                <th className="py-3.5 px-5">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DCD2] text-sm">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FDFBF7]/60">
                  <td className="py-3.5 px-5 font-extrabold text-[#2C1810] tabular-nums">
                    {order.orderCode}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-[#2C1810]">
                      {order.user?.fullName || 'Khách thành viên'}
                    </p>
                    <p className="text-xs text-[#795548]">
                      {order.user?.email || ''}
                    </p>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#795548] max-w-xs truncate">
                    {order.items
                      .map((i) => `${i.qty}x ${i.productName} (${i.size})`)
                      .join(', ')}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#795548] whitespace-nowrap">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="py-3.5 px-5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right font-extrabold text-[#B45309] tabular-nums">
                    {formatVND(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
