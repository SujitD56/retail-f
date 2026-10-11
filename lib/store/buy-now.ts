"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BuyNowItem {
  productId: string;
  quantity: number;
}

interface BuyNowState {
  item: BuyNowItem | null;
  setItem: (productId: string, quantity: number) => void;
  clear: () => void;
}

/**
 * Lets the product page's "Buy Now" button checkout a single product
 * without touching (or being affected by) whatever else is already in the
 * cart. Persisted to sessionStorage (not localStorage — this is meant to be
 * cleared once the tab closes, not stick around like the cart) because a
 * plain in-memory store doesn't survive the customer refreshing the
 * checkout page, which lands them back on "/checkout?buyNow=1" with an
 * empty cart instead of the item they picked.
 */
export const useBuyNowStore = create<BuyNowState>()(
  persist(
    (set) => ({
      item: null,
      setItem: (productId, quantity) => set({ item: { productId, quantity } }),
      clear: () => set({ item: null }),
    }),
    { name: "ilkal-buy-now", storage: createJSONStorage(() => sessionStorage) },
  ),
);
