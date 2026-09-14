"use client";

import { create } from "zustand";
import type { Address, Order, PaymentSession } from "@/types";
import { api, ApiError } from "@/lib/api/client";

interface PlaceOrderInput {
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
  deliveryMethod?: "standard" | "express";
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  /** Required when checking out signed out. */
  guestEmail?: string;
}

/** `payment` is non-null whenever there's still something to collect online — present right after checkout, and again on re-fetch if the customer never finished paying. Null for COD, and null once paid. */
interface OrderWithPayment {
  order: Order;
  payment: PaymentSession | null;
}

interface OrdersState {
  placeOrder: (input: PlaceOrderInput) => Promise<OrderWithPayment>;
  getOrder: (orderNumber: string) => Promise<OrderWithPayment | null>;
  getAllOrders: () => Promise<Order[]>;
}

/**
 * Orders are server-truth now (no more client-generated order objects held
 * in localStorage) — this store is just a thin async wrapper so components
 * keep a single, familiar `useOrdersStore()` call site. Pricing (subtotal/
 * shipping/tax/total) is intentionally NOT part of the input: the API
 * always recomputes it from live product prices, never trusts a client-sent
 * total.
 */
export const useOrdersStore = create<OrdersState>()(() => ({
  placeOrder: (input) => api.post<OrderWithPayment>("/orders/checkout", input),

  getOrder: async (orderNumber) => {
    try {
      return await api.get<OrderWithPayment>(`/orders/${orderNumber}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  getAllOrders: async () => {
    const { items } = await api.get<{ items: Order[] }>("/orders/mine");
    return items;
  },
}));
