'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Coffee,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  User,
  Calendar,
} from 'lucide-react';
import {
  FALLBACK_COFFEE_IMAGE,
  HERO_BANNER_IMAGE,
  ROASTERY_STORY_IMAGE,
} from '../../../lib/api';

interface BlogArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  recommendedDrink: string;
  paragraphs: string[];
  baristaNote: string;
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    category: 'Hành trình hạt cà phê',
    title: 'Hành Trình Hạt Arabica Cầu Đất Ở Độ Cao 1.650m Đến Ly Espresso Mỗi Sáng',
    excerpt:
      'Khám phá quy trình thu hái trái chín đỏ 100% tại sương mù Cầu Đất, sơ chế ướt lên men tự nhiên và rang mộc chuẩn vị tại xưởng BrewLite.',
    author: 'Master Roaster Minh Quân',
    date: '12/10/2026',
    readTime: '4 phút đọc',
    image: ROASTERY_STORY_IMAGE,
    recommendedDrink: 'Americano Đá Nguyên Bản',
    paragraphs: [
      'Vùng nguyên liệu Cầu Đất (Đà Lạt) nằm ở độ cao 1.650m so với mực nước biển với biên độ nhiệt ngày và đêm lớn, tạo điều kiện lý tưởng để trái cà phê Arabica tích tụ lượng đường tự nhiên và hương hoa quả thanh tao.',
      'Tại BrewLite Roastery, chúng tôi chỉ hợp tác cùng các nông hộ thu hái thủ công 100% trái chín đỏ. Sau khi thu hoạch, hạt được đưa vào quy trình sơ chế ướt (Fully Washed) và phơi trên giàn nhà kính giúp hạt đạt độ ẩm chuẩn 11.5%.',
      'Mỗi mẻ rang tại xưởng đều được theo dõi biểu đồ nhiệt thời gian thực ở mức Rang Vừa (Medium Roast), giữ trọn vẹn nốt hương cam thảo, sô-cô-la đen và hậu vị ngọt sâu mà hoàn toàn không cần tẩm ướp bất kỳ hương liệu nào.',
    ],
    baristaNote:
      'Thưởng thức ngon nhất khi chọn Americano Đá Nguyên Bản không đường hoặc Cappuccino Kem Mịn để cảm nhận rõ lớp crema sánh mịn.',
  },
  {
    id: 'blog-2',
    category: 'Nghệ thuật pha chế',
    title: 'Bí Quyết Ủ Lạnh Cold Brew 18 Giờ Kết Hợp Cam Vàng & Sả Tươi Thanh Mát',
    excerpt:
      'Vì sao phương pháp ngâm ủ nước lạnh trong 18 giờ lại giúp giảm đến 65% độ chua gắt và đánh thức hương thơm trái cây nhiệt đới?',
    author: 'Head Barista Trần Bảo',
    date: '14/10/2026',
    readTime: '5 phút đọc',
    image: HERO_BANNER_IMAGE,
    recommendedDrink: 'Cold Brew Cam Sả',
    paragraphs: [
      'Khác với phương pháp chiết xuất bằng nước nóng áp suất cao của máy Espresso, Cold Brew sử dụng nước tinh khiết ở nhiệt độ mát từ 4 đến 8 độ C để ngâm ủ bột cà phê xay thô liên tục suốt 18 giờ đồng hồ.',
      'Chính sự kiên nhẫn của thời gian thay thế cho nhiệt độ giúp chiết xuất trọn vẹn các hợp chất hương thơm dễ bay hơi mà hạn chế tối đa vị đắng gắt hay axit chua gắt, mang lại cảm giác êm mượt như nhung.',
      'Khi kết hợp định lượng chuẩn 28g cốt cà phê Arabica ủ lạnh cùng 80g nước cam vàng tươi và sả cây đập dập tự nhiên, ly Cold Brew Cam Sả trở thành thức uống giải nhiệt hoàn hảo cho những buổi chiều Sài Gòn.',
    ],
    baristaNote:
      'Nên chọn mức 50% đường và Đá bình thường để vị ngọt dịu của cam vàng hòa quyện tự nhiên cùng hậu vị cà phê ủ lạnh.',
  },
  {
    id: 'blog-3',
    category: 'Văn hóa cà phê Sài Gòn',
    title: 'Bạc Xỉu Đá Hạt Dẻ & Cà Phê Sữa Đá: Bản Giao Hưởng Giữa Phin Truyền Thống Và Hiện Đại',
    excerpt:
      'Từ nét văn hóa cà phê vợt, cà phê phin lâu đời của người Sài Gòn đến công thức định lượng sữa tươi Dalatmilk quyện syrup hạt dẻ.',
    author: 'Nguyễn Minh Khách',
    date: '15/10/2026',
    readTime: '3 phút đọc',
    image: FALLBACK_COFFEE_IMAGE,
    recommendedDrink: 'Bạc Xỉu Đá Hạt Dẻ',
    paragraphs: [
      'Nhắc đến buổi sáng Sài Gòn là nhắc đến hình ảnh ly Cà Phê Sữa Đá đậm đà hay ly Bạc Xỉu béo thơm. Tại BrewLite, chúng tôi giữ nguyên tinh thần mộc mạc ấy bằng hạt Robusta Đắk Lắk rang đậm vừa, cho chất cà phê sánh đặc và dậy mùi cacao.',
      'Điểm khác biệt nằm ở bảng định lượng công thức BOM minh bạch: 18g cà phê Robusta chiết xuất nóng đánh bông tạo bọt, rót trên nền 120ml sữa tươi thanh trùng Dalatmilk và 15ml syrup hạt dẻ nướng thơm lừng.',
      'Dù bạn yêu vị đậm mạnh của Cà Phê Sữa Đá hay vị béo dịu dễ uống của Bạc Xỉu Hạt Dẻ, mỗi ly nước khi đến tay đều giữ đúng tỷ lệ vàng đã được chuẩn hóa.',
    ],
    baristaNote:
      'Thêm topping Thạch cà phê nguyên chất hoặc Kem phô mai Macchiato để tăng độ giòn dai và béo mặn hấp dẫn.',
  },
  {
    id: 'blog-4',
    category: 'Nguyên liệu tuyển chọn',
    title: 'Matcha Uji Nhật Bản Đánh Bông Thủ Công Cùng Lớp Kem Phô Mai Mặn Dịu',
    excerpt:
      'Tìm hiểu quy trình che nắng lá trà Tencha suốt 20 ngày tại vùng Uji Kyoto để tạo nên sắc xanh ngọc bích và vị Umami đặc trưng.',
    author: 'Chuyên gia Trà Thảo Vy',
    date: '16/10/2026',
    readTime: '4 phút đọc',
    image: ROASTERY_STORY_IMAGE,
    recommendedDrink: 'Matcha Latte Kem Phô Mai',
    paragraphs: [
      'Bột Matcha sử dụng tại Trạm Trà & Matcha của BrewLite được nhập khẩu từ vùng Uji (Kyoto, Nhật Bản). Trước khi thu hoạch 20 ngày, toàn bộ đồi trà được che phủ lưới đen để lá trà tăng cường sản sinh chất diệp lục và L-Theanine.',
      'Lá trà non sau khi hấp nhiệt được nghiền chậm bằng cối đá granite thành bột mịn kích thước siêu nhỏ, giữ nguyên màu xanh ngọc bích và vị ngọt hậu Umami không lẫn vào đâu được.',
      'Khi Barista đánh tan 12g bột Matcha Uji bằng chổi tre Chasen cùng 150ml sữa tươi thanh trùng và phủ lớp kem phô mai đánh bông mặn nhẹ phía trên, bạn sẽ cảm nhận được sự cân bằng trọn vẹn trong từng ngụm.',
    ],
    baristaNote:
      'Gợi ý chọn mức 70% đường (Ít ngọt) để tôn lên hương trà xanh Uji nguyên bản và vị béo mặn của lớp kem phô mai.',
  },
];

export default function StoryPage() {
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);

  if (selectedBlog) {
    const relatedPosts = BLOG_ARTICLES.filter(
      (b) => b.id !== selectedBlog.id,
    ).slice(0, 2);

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <button
            type="button"
            onClick={() => {
              setSelectedBlog(null);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E6DCD2] text-xs sm:text-sm font-bold text-[#3E2723] hover:bg-[#F7F2EB] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách Câu chuyện</span>
          </button>
        </div>

        <article className="bg-white border border-[#E6DCD2] rounded-3xl overflow-hidden shadow-md">
          <div className="aspect-[16/8] w-full overflow-hidden bg-[#EFE8DF] relative">
            <img
              src={selectedBlog.image}
              alt={selectedBlog.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  FALLBACK_COFFEE_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-[#2C1810] text-xs font-extrabold">
                <BookOpen className="w-3.5 h-3.5" />
                {selectedBlog.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#FDFBF7]">
                {selectedBlog.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#795548] pb-4 border-b border-[#E6DCD2]">
              <span className="inline-flex items-center gap-1.5 text-[#3E2723] font-bold">
                <User className="w-4 h-4 text-[#B45309]" />
                {selectedBlog.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B45309]" />
                {selectedBlog.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B45309]" />
                {selectedBlog.readTime}
              </span>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#2C1810] leading-relaxed">
              <p className="font-bold text-base sm:text-lg text-[#3E2723]">
                {selectedBlog.excerpt}
              </p>
              {selectedBlog.paragraphs.map((para, index) => (
                <p key={index} className="text-[#5D4037] leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F2EB] border border-[#E6DCD2] space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
                <Coffee className="w-4 h-4" />
                <span>Gợi ý thưởng thức từ Barista</span>
              </p>
              <p className="text-sm font-medium text-[#2C1810]">
                {selectedBlog.baristaNote}
              </p>
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] transition-colors"
                >
                  <span>Đặt thử {selectedBlog.recommendedDrink}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#2C1810]">
            Bài viết khác cùng chuyên mục
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-[#B45309]">
                    {post.category}
                  </span>
                  <h3 className="text-base font-extrabold text-[#2C1810]">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#795548] line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBlog(post);
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] transition-colors"
                  >
                    <span>Xem thêm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#5D4037] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#6D4C41]">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            Chuyên Mục Câu Chuyện & Blog Cà Phê
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#FDFBF7] leading-tight">
            Câu Chuyện Hạt Cà Phê Việt & Nhật Ký Rang Xay Tại BrewLite
          </h1>
          <p className="text-sm sm:text-base text-[#D7CCC8] leading-relaxed">
            Khám phá nguồn gốc nông trại Cầu Đất, Đắk Lắk, Uji Kyoto và những bí
            quyết chiết xuất đồ uống chuẩn vị từ đội ngũ Barista của chúng tôi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_ARTICLES.map((article) => (
          <article
            key={article.id}
            className="bg-white border border-[#E6DCD2] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#EFE8DF] relative">
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    FALLBACK_COFFEE_IMAGE;
                }}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2C1810]/85 text-amber-300 text-[11px] font-bold backdrop-blur-sm">
                {article.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs text-[#795548] font-medium">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span className="text-[#3E2723] font-semibold">
                    {article.author}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-[#2C1810] leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E6DCD2] flex items-center justify-between gap-3 mt-auto">
                <span className="text-xs font-semibold text-[#795548] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Gợi ý: {article.recommendedDrink}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlog(article);
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] transition-colors shadow-sm ml-auto"
                >
                  <span>Xem thêm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
