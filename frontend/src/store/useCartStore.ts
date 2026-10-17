'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSizeUpcharge, ProductSize, Topping } from '../lib/api';

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  basePrice: number;
  size: ProductSize;
  sugarLevel: string;
  iceLevel: string;
  itemNote: string;
  qty: number;
  toppings: Topping[];
  unitPrice: number;
  lineTotal: number;
}

export interface AppliedPromo {
  code: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  discountPercent: number;
  maxDiscountAmount: number;
}

interface CartState {
  items: CartItem[];
  appliedPromo: AppliedPromo | null;
  usePoints: boolean;
  pendingOrderId: string | null;
  addItem: (payload: {
    productId: string;
    productName: string;
    imageUrl: string;
    basePrice: number;
    size: ProductSize;
    sugarLevel?: string;
    iceLevel?: string;
    itemNote?: string;
    qty: number;
    toppings: Topping[];
  }) => void;
  updateQty: (cartItemId: string, qty: number) => void;
  removeItem: (cartItemId: string) => void;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  setUsePoints: (use: boolean) => void;
  setPendingOrderId: (orderId: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getPointsUsed: (availablePoints: number) => number;
  getFinalTotal: (availablePoints: number) => number;
  getTotalCount: () => number;
}

function buildCartItemId(
  productId: string,
  size: ProductSize,
  sugarLevel: string,
  iceLevel: string,
  itemNote: string,
  toppings: Topping[],
): string {
  const sortedIds = [...toppings]
    .map((t) => t.id)
    .sort()
    .join(',');
  return `${productId}__${size}__${sugarLevel}__${iceLevel}__${itemNote.trim()}__${sortedIds}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromo: null,
      usePoints: false,
      pendingOrderId: null,

      addItem: ({
        productId,
        productName,
        imageUrl,
        basePrice,
        size,
        sugarLevel = '100% đường',
        iceLevel = 'Đá bình thường',
        itemNote = '',
        qty,
        toppings,
      }) => {
        const cartItemId = buildCartItemId(
          productId,
          size,
          sugarLevel,
          iceLevel,
          itemNote,
          toppings,
        );
        const toppingsPrice = toppings.reduce((sum, t) => sum + t.price, 0);
        const unitPrice = basePrice + getSizeUpcharge(size) + toppingsPrice;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.cartItemId === cartItemId,
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = updated[existingIndex].qty + qty;
            updated[existingIndex] = {
              ...updated[existingIndex],
              qty: newQty,
              unitPrice,
              lineTotal: unitPrice * newQty,
            };
            return { items: updated, pendingOrderId: null };
          }

          return {
            items: [
              ...state.items,
              {
                cartItemId,
                productId,
                productName,
                imageUrl,
                basePrice,
                size,
                sugarLevel,
                iceLevel,
                itemNote: itemNote.trim(),
                qty,
                toppings,
                unitPrice,
                lineTotal: unitPrice * qty,
              },
            ],
            pendingOrderId: null,
          };
        });
      },

      updateQty: (cartItemId, qty) => {
        if (qty <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => {
          const updated = state.items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  qty,
                  lineTotal: item.unitPrice * qty,
                }
              : item,
          );
          return { items: updated, pendingOrderId: null };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
          pendingOrderId: null,
        }));
      },

      setAppliedPromo: (promo) =>
        set({ appliedPromo: promo, pendingOrderId: null }),

      setUsePoints: (usePoints) =>
        set({ usePoints, pendingOrderId: null }),

      setPendingOrderId: (orderId) => set({ pendingOrderId: orderId }),

      clearCart: () =>
        set({
          items: [],
          appliedPromo: null,
          usePoints: false,
          pendingOrderId: null,
        }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.lineTotal, 0),

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const promo = get().appliedPromo;
        if (!promo) return 0;
        if (subtotal < promo.minOrderValue) return 0;
        const raw = Math.floor((subtotal * promo.discountPercent) / 100);
        return Math.min(raw, promo.maxDiscountAmount);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getPointsUsed: (availablePoints: number) => {
        if (!get().usePoints || availablePoints <= 0) return 0;
        const afterPromo = get().getTotal();
        return Math.min(Math.floor(availablePoints), afterPromo);
      },

      getFinalTotal: (availablePoints: number) => {
        const afterPromo = get().getTotal();
        const pts = get().getPointsUsed(availablePoints);
        return Math.max(0, afterPromo - pts);
      },

      getTotalCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    {
      name: 'brewlite-cart-storage-v4',
    },
  ),
);
