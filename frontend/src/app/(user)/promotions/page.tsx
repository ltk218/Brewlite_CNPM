'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Coffee,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Users,
  Coins,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import {
  FALLBACK_COFFEE_IMAGE,
  HERO_BANNER_IMAGE,
  ROASTERY_STORY_IMAGE,
} from '../../../lib/api';

export default function AboutUsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setToast(`Đã sao chép mã ưu đãi ${code}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="space-y-12">
      {toast && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#2C1810] text-amber-200 text-sm font-bold shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#5D4037] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#6D4C41]">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            Về Chúng Tôi • BrewLite Specialty Coffee Roastery
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#FDFBF7] leading-tight">
            Nâng Tầm Cà Phê Việt Bằng Nghệ Thuật Rang Mộc & Công Nghệ Quầy Barista Không Tiền Mặt
          </h1>
          <p className="text-sm sm:text-base text-[#D7CCC8] leading-relaxed">
            Khởi nguồn từ niềm đam mê hạt Arabica Cầu Đất và Robusta Đắk Lắk chín
            mọng, BrewLite kết hợp quy trình chiết xuất thủ công chuẩn Specialty
            cùng hệ thống đặt món không tiếp xúc hiện đại — giúp khách hàng tận
            hưởng trọn vẹn hương vị nguyên bản mà không mất thời gian chờ đợi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E6DCD2] rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden border border-[#E6DCD2]">
          <img
            src={ROASTERY_STORY_IMAGE}
            alt="Xưởng rang xay BrewLite"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_COFFEE_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#B45309]">
            Giá trị cốt lõi của BrewLite
          </span>
          <h2 className="text-2xl font-extrabold text-[#2C1810]">
            Chuẩn Hóa Từng Công Thức Định Lượng (BOM) & Từng Trạm Pha Chế KDS
          </h2>
          <p className="text-sm text-[#5D4037] leading-relaxed">
            Tại BrewLite, chất lượng không dựa trên cảm tính. Mỗi ly đồ uống đều
            được kiểm soát bằng hệ thống định lượng nguyên liệu BOM chính xác
            đến từng gram hạt cà phê và từng millilit sữa tươi thanh trùng
            Dalatmilk, vận hành đồng bộ trên 3 trạm pha chế chuyên biệt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6DCD2] space-y-1.5">
              <Flame className="w-5 h-5 text-[#B45309]" />
              <p className="text-sm font-extrabold text-[#2C1810]">
                100% Hạt Rang Mộc
              </p>
              <p className="text-xs text-[#795548]">
                Không tẩm phụ gia, rang mới mỗi sáng giữ trọn hậu vị ngọt thanh.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6DCD2] space-y-1.5">
              <Coffee className="w-5 h-5 text-[#3E2723]" />
              <p className="text-sm font-extrabold text-[#2C1810]">
                3 Trạm Barista KDS
              </p>
              <p className="text-xs text-[#795548]">
                Phân luồng tự động Trạm Espresso, Trạm Cold Brew và Trạm Matcha.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6DCD2] space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-[#B45309]" />
              <p className="text-sm font-extrabold text-[#2C1810]">
                Thanh Toán 1 Chạm
              </p>
              <p className="text-xs text-[#795548]">
                An toàn tuyệt đối với cơ chế chống trừ tiền trùng lặp Idempotent.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F7F2EB] border border-[#E6DCD2] rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#3E2723] text-amber-300 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810]">
                Cơ Chế Tích Điểm Đổi Thưởng BrewLite Xu (1 Điểm = 1đ)
              </h2>
              <p className="text-xs sm:text-sm text-[#795548]">
                Hoàn ngay 5% giá trị mọi hóa đơn thành điểm thưởng dùng để trừ
                trực tiếp cho đơn tiếp theo
              </p>
            </div>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] self-start sm:self-auto"
          >
            <span>Trải nghiệm đặt món</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 space-y-2">
            <Award className="w-5 h-5 text-[#B45309]" />
            <h3 className="text-base font-extrabold text-[#2C1810]">
              1. Tích Điểm Tương Xứng Hóa Đơn
            </h3>
            <p className="text-xs text-[#795548] leading-relaxed">
              Mỗi lần thanh toán thành công, khách hàng nhận ngay số điểm tương
              đương <strong>5% tổng hóa đơn</strong> (VD: Đơn 60.000đ tích lũy
              ngay +3.000 điểm).
            </p>
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 space-y-2">
            <Coins className="w-5 h-5 text-[#B45309]" />
            <h3 className="text-base font-extrabold text-[#2C1810]">
              2. Gạt Nút Dùng Điểm (1 Điểm = 1đ)
            </h3>
            <p className="text-xs text-[#795548] leading-relaxed">
              Tại Giỏ hàng hoặc bước Thanh toán, bạn chỉ cần bật công tắc dùng
              điểm thưởng để giảm trực tiếp <strong>1đ cho mỗi 1 điểm</strong>{' '}
              đang có trong tài khoản.
            </p>
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 space-y-2">
            <Users className="w-5 h-5 text-[#B45309]" />
            <h3 className="text-base font-extrabold text-[#2C1810]">
              3. Đặc Quyền Thành Viên Mới
            </h3>
            <p className="text-xs text-[#795548] leading-relaxed">
              Tặng ngay <strong>5.000 điểm thưởng</strong> khi đăng ký mới kèm
              quyền sử dụng các mã voucher ưu đãi thành viên bên dưới.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#B45309] uppercase">
                Voucher Thành Viên • Đơn từ 40K
              </span>
              <h4 className="text-base font-extrabold text-[#2C1810] mt-0.5">
                BREWLITE10 — Giảm 10% (Tối đa 20K)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('BREWLITE10')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] shrink-0"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>Sao chép</span>
            </button>
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#B45309] uppercase">
                Voucher Nhóm & Combo • Đơn từ 80K
              </span>
              <h4 className="text-base font-extrabold text-[#2C1810] mt-0.5">
                CHAOBANMOI — Giảm 20% (Tối đa 30K)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('CHAOBANMOI')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] shrink-0"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>Sao chép</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E6DCD2] rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#B45309]">
            Không gian & Liên hệ
          </span>
          <h2 className="text-2xl font-extrabold text-[#2C1810]">
            Ghé Thăm Không Gian Trải Nghiệm BrewLite Roastery
          </h2>
          <p className="text-sm text-[#5D4037] leading-relaxed">
            Tọa lạc tại trung tâm Quận 1, TP. Hồ Chí Minh, quầy pha chế mở của
            BrewLite được thiết kế ấm cúng với tông màu nâu gỗ cà phê đặc trưng,
            phù hợp cho cả những buổi hẹn làm việc lẫn khách ghé nhận nước nhanh
            trong giờ cao điểm.
          </p>
          <div className="space-y-2.5 text-sm text-[#2C1810] pt-1">
            <p className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>
                <strong>Địa chỉ:</strong> 88 Nguyễn Huệ, Phường Bến Nghé, Quận 1,
                TP. Hồ Chí Minh
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>
                <strong>Giờ mở cửa:</strong> 07:00 – 22:30 (Tất cả các ngày trong
                tuần)
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>
                <strong>Hotline hỗ trợ:</strong> 1900 6886
              </span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden border border-[#E6DCD2]">
          <img
            src={HERO_BANNER_IMAGE}
            alt="Không gian quán BrewLite"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_COFFEE_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
