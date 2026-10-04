"use client";

import { create } from "zustand";

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
 * cart. Not persisted — it only needs to survive the client-side navigation
 * from the product page to /checkout.
 */
export const useBuyNowStore = create<BuyNowState>((set) => ({
  item: null,
  setItem: (productId, quantity) => set({ item: { productId, quantity } }),
  clear: () => set({ item: null }),
}));
