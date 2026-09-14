"use client";

import { api } from "@/lib/api/client";
import type { Order, PaymentSession } from "@/types";

// Minimal shape of the global Checkout.js exposes — just what we actually
// call. See https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: unknown) => void): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay checkout only runs in the browser"));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null; // let a later retry try loading it again instead of staying rejected forever
        reject(new Error("Couldn't load the Razorpay checkout script"));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens Razorpay's Checkout.js widget and resolves with the success payload
 * once the customer completes a payment. Resolves `null` — not a rejection
 * — if they close the widget without paying, or a payment attempt fails:
 * neither is an error condition here, since the order already exists and
 * just stays unpaid either way. Only throws if the widget itself couldn't
 * be opened (script failed to load).
 */
async function openCheckoutWidget(options: {
  session: PaymentSession;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}): Promise<RazorpaySuccessResponse | null> {
  await loadCheckoutScript();
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout script failed to load"));
      return;
    }
    const rzp = new window.Razorpay({
      key: options.session.keyId,
      amount: options.session.amount,
      currency: options.session.currency,
      order_id: options.session.orderId,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment.failed", () => resolve(null));
    rzp.open();
  });
}

/**
 * Full round trip for collecting payment on an already-placed order: opens
 * the widget, and on success verifies the signature server-side before
 * resolving — the widget succeeding is never itself treated as "paid".
 * Resolves `null` (never throws) for every non-paid outcome — dismissed,
 * declined, or a signature that fails verification — since the order
 * always stays retryable from the order page regardless of which of those
 * happened.
 */
export async function payForOrder(options: {
  orderNumber: string;
  session: PaymentSession;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}): Promise<Order | null> {
  const response = await openCheckoutWidget(options);
  if (!response) return null;
  try {
    const { order } = await api.post<{ order: Order }>(`/orders/${options.orderNumber}/verify-payment`, response);
    return order;
  } catch {
    return null;
  }
}
