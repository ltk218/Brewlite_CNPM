'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, Sparkles } from 'lucide-react';
import { FALLBACK_COFFEE_IMAGE, formatVND, Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    product.imageUrl || FALLBACK_COFFEE_IMAGE,
  );

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = product.isAvailable && product.stock > 0 && product.stock <= 5;

  return (
    <div className="flex flex-col h-full bg-white border border-[#E6DCD2] rounded-2xl shadow-sm hover:shadow-xl hover:border-[#8D6E63]/50 transition-all duration-300 overflow-hidden group">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#EFE8DF] block"
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(FALLBACK_COFFEE_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/50 via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDFBF7]/95 backdrop-blur-sm text-[#3E2723] border border-[#E6DCD2] shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-700 text-white shadow-sm">
              Tạm hết hàng
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              Còn {product.stock} ly
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2C1810]/90 text-[#F5EBE6] flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Còn {product.stock} ly
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 bg-white">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-base font-extrabold text-[#2C1810] line-clamp-1 group-hover:text-[#6D4C41] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-sm text-[#795548] line-clamp-2 min-h-[40px] leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-3.5 flex items-center justify-between border-t border-[#EFE8DF]">
          <div>
            <span className="text-[11px] font-medium text-[#8D6E63] block">
              Giá từ
            </span>
            <span className="text-base font-extrabold text-[#B45309] tabular-nums">
              {formatVND(product.price)}
            </span>
          </div>

          {isOutOfStock ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F2EB] text-[#8D6E63] cursor-not-allowed">
              Hết hàng
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {onQuickAdd && (
                <button
                  type="button"
                  onClick={() => onQuickAdd(product)}
                  title="Thêm nhanh Size S vào giỏ"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3E2723] text-white hover:bg-[#2C1810] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <Link
                href={`/products/${product.id}`}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F7F2EB] text-[#3E2723] border border-[#E6DCD2] hover:bg-[#3E2723] hover:text-white hover:border-[#3E2723] transition-colors"
              >
                Tùy chọn
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
