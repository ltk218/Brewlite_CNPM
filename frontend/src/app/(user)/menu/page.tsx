'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Coffee,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { api, Product } from '../../../lib/api';
import { ProductCard } from '../../../components/ProductCard';
import { useCartStore } from '../../../store/useCartStore';

type SortOption = 'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC';
type PriceRangeOption = 'ALL' | 'UNDER_40K' | 'FROM_40K_TO_50K' | 'OVER_50K';

const POPULAR_ORDER = [
  'Cà Phê Sữa Đá Sài Gòn',
  'Bạc Xỉu Đá Hạt Dẻ',
  'Caramel Macchiato',
  'Trà Đào Cam Sả',
  'Cold Brew Cam Sả',
  'Matcha Latte Kem Phô Mai',
  'Cappuccino Kem Mịn',
  'Americano Đá Nguyên Bản',
];

function MenuCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Tất cả';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('POPULAR');
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
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
          : 'Không thể tải danh sách sản phẩm lúc này',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ['Tất cả', ...unique];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCat =
        selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesPrice =
        priceRange === 'ALL'
          ? true
          : priceRange === 'UNDER_40K'
            ? p.price <= 40000
            : priceRange === 'FROM_40K_TO_50K'
              ? p.price > 40000 && p.price <= 50000
              : p.price > 50000;

      const matchesStock = onlyInStock ? p.isAvailable && p.stock > 0 : true;

      return matchesCat && matchesSearch && matchesPrice && matchesStock;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name, 'vi');

      const idxA = POPULAR_ORDER.indexOf(a.name);
      const idxB = POPULAR_ORDER.indexOf(b.name);
      const rankA = idxA === -1 ? 99 : idxA;
      const rankB = idxB === -1 ? 99 : idxB;
      return rankA - rankB;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    priceRange,
    onlyInStock,
    sortBy,
  ]);

  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, safePage, pageSize]);

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả');
    setSearchQuery('');
    setSortBy('POPULAR');
    setPriceRange('ALL');
    setOnlyInStock(false);
    setCurrentPage(1);
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
    setToastMessage(`Đã thêm "${product.name} (Size S)" vào giỏ hàng`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#2C1810] text-amber-100 text-sm font-bold shadow-xl border border-amber-400/30">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#2C1810] via-[#3E2723] to-[#4E342E] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#5D4037]">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
            Thực đơn Specialty Roastery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FDFBF7]">
            Tất Cả Sản Phẩm & Thức Uống Tại Quầy
          </h1>
          <p className="text-xs sm:text-sm text-[#D7CCC8]">
            Sử dụng bộ lọc bên trái để tìm nhanh theo danh mục, mức giá hoặc
            sắp xếp theo độ phổ biến.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#2C1810]">
              <SlidersHorizontal className="w-4 h-4 text-[#B45309]" />
              <span>Bộ lọc & Sắp xếp</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5D4037]">
              Tìm kiếm tên món
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#8D6E63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cà phê sữa, matcha..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs sm:text-sm text-[#2C1810] focus:outline-none focus:border-[#3E2723]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5D4037] flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Sắp xếp theo</span>
            </label>
            <div className="space-y-1.5">
              {[
                { key: 'POPULAR', label: 'Phổ biến & Bán chạy nhất' },
                { key: 'PRICE_ASC', label: 'Giá: Thấp đến Cao' },
                { key: 'PRICE_DESC', label: 'Giá: Cao đến Thấp' },
                { key: 'NAME_ASC', label: 'Tên món: A → Z' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSortBy(item.key as SortOption);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    sortBy === item.key
                      ? 'bg-[#3E2723] text-white shadow-sm'
                      : 'bg-[#FDFBF7] text-[#5D4037] border border-[#E6DCD2] hover:bg-[#F7F2EB]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5D4037]">
              Danh mục thức uống
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const count =
                  cat === 'Tất cả'
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#3E2723] text-white shadow-sm'
                        : 'bg-[#FDFBF7] text-[#5D4037] border border-[#E6DCD2] hover:bg-[#F7F2EB]'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums ${
                        active
                          ? 'bg-amber-400 text-[#2C1810]'
                          : 'bg-white text-[#795548]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5D4037] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Khoảng giá</span>
            </label>
            <div className="space-y-1.5">
              {[
                { key: 'ALL', label: 'Tất cả mức giá' },
                { key: 'UNDER_40K', label: 'Dưới 40.000đ' },
                { key: 'FROM_40K_TO_50K', label: 'Từ 40.000đ – 50.000đ' },
                { key: 'OVER_50K', label: 'Trên 50.000đ' },
              ].map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => {
                    setPriceRange(range.key as PriceRangeOption);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    priceRange === range.key
                      ? 'bg-[#3E2723] text-white shadow-sm'
                      : 'bg-[#FDFBF7] text-[#5D4037] border border-[#E6DCD2] hover:bg-[#F7F2EB]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E6DCD2]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-[#2C1810]">
                Chỉ hiện món còn hàng
              </span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => {
                  setOnlyInStock(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 accent-[#3E2723] rounded"
              />
            </label>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-bold text-[#2C1810]">
              Tìm thấy{' '}
              <span className="text-[#B45309] tabular-nums">{totalItems}</span>{' '}
              thức uống phù hợp
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-[#5D4037]">
              <span>Hiển thị mỗi trang:</span>
              {[6, 8, 12].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border tabular-nums transition-colors ${
                    pageSize === size
                      ? 'bg-[#3E2723] text-white border-[#3E2723]'
                      : 'bg-[#FDFBF7] text-[#5D4037] border-[#E6DCD2]'
                  }`}
                >
                  {size === 12 ? 'Tất cả' : `${size} món`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 bg-white border border-[#E6DCD2] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white border border-[#E6DCD2] rounded-2xl p-8 text-center space-y-4">
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
          ) : paginatedProducts.length === 0 ? (
            <div className="bg-white border border-[#E6DCD2] rounded-2xl p-12 text-center space-y-3">
              <Coffee className="w-10 h-10 text-[#8D6E63] mx-auto" />
              <h3 className="text-base font-extrabold text-[#2C1810]">
                Không tìm thấy sản phẩm phù hợp với bộ lọc
              </h3>
              <p className="text-xs sm:text-sm text-[#795548]">
                Hãy thử đổi khoảng giá hoặc bấm đặt lại bộ lọc bên trái.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>

              <nav
                aria-label="Điều hướng phân trang sản phẩm"
                className="bg-white border border-[#E6DCD2] rounded-2xl px-5 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-xs font-semibold text-[#795548] tabular-nums">
                  Đang hiển thị trang{' '}
                  <strong className="text-[#2C1810]">{safePage}</strong> /{' '}
                  <strong className="text-[#2C1810]">{totalPages}</strong> (Tổng{' '}
                  {totalItems} sản phẩm)
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold text-[#2C1810] hover:bg-[#F7F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Trang trước</span>
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const active = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold tabular-nums transition-all ${
                          active
                            ? 'bg-[#3E2723] text-white shadow-sm'
                            : 'bg-[#FDFBF7] text-[#5D4037] border border-[#E6DCD2] hover:bg-[#F7F2EB]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold text-[#2C1810] hover:bg-[#F7F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-3 h-96 bg-white border border-[#E6DCD2] rounded-2xl" />
          <div className="lg:col-span-9 h-96 bg-white border border-[#E6DCD2] rounded-2xl" />
        </div>
      }
    >
      <MenuCatalogContent />
    </Suspense>
  );
}
