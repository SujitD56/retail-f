"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check, Download, HelpCircle, Package, ShieldCheck, XCircle } from "lucide-react";
import { useOrdersStore } from "@/lib/store/orders";
import { getProductsByIds } from "@/lib/data/products-client";
import { payForOrder } from "@/lib/payments/razorpay";
import { api } from "@/lib/api/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/store/auth";
import { formatDateTime, formatINR, cn } from "@/lib/utils";
import type { Order, PaymentSession, Product, Retailer } from "@/types";

const PAYMENT_METHOD_LABEL: Record<Order["paymentMethod"], string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};

const PAYMENT_STATUS_LABEL: Record<Order["paymentStatus"], string> = {
  paid: "Paid",
  pending: "Payment Pending",
  failed: "Payment Failed",
};

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const getOrder = useOrdersStore((s) => s.getOrder);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [payingNow, setPayingNow] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getOrder(params.id).catch(() => null);
      if (cancelled) return;
      setOrder(result?.order ?? null);
      setPaymentSession(result?.payment ?? null);
      if (result?.order) {
        const [productList, { items: retailerList }] = await Promise.all([
          getProductsByIds(result.order.items.map((i) => i.productId)),
          api.get<{ items: Retailer[] }>("/retailers"),
        ]);
        if (!cancelled) {
          setProducts(productList);
          setRetailers(retailerList);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handlePayNow = async () => {
    if (!order || !paymentSession) return;
    setPayingNow(true);
    try {
      const paid = await payForOrder({
        orderNumber: order.id,
        session: paymentSession,
        name: "Ilkal Threads",
        description: `Order ${order.id}`,
        prefill: { name: order.shippingAddress.fullName, email: user?.email, contact: order.shippingAddress.phone },
      });
      if (paid) {
        setOrder(paid);
        setPaymentSession(null);
        toast({ title: "Payment received", variant: "success" });
      } else {
        toast({ title: "Payment not completed", description: "You can try again whenever you're ready.", variant: "error" });
      }
    } finally {
      setPayingNow(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast({ title: "Order cancelled", variant: "success" });
    } catch {
      toast({ title: "Couldn't cancel this order", description: "It may have already shipped.", variant: "error" });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-5 py-16 sm:px-10 lg:px-20">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-8 px-5 py-16 sm:px-10 lg:px-20">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="We couldn't find an order with that ID. It may have used a different browser or device."
          actionLabel="View My Account"
          actionHref="/account"
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  const byRetailer = new Map<string, { productId: string; quantity: number }[]>();
  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const list = byRetailer.get(product.retailerId) ?? [];
    list.push(item);
    byRetailer.set(product.retailerId, list);
  }

  return (
    <div className="flex flex-col gap-8 px-5 py-8 sm:px-10 lg:px-20">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: order.id }]} />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8">
          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-[28px] text-primary-600">Order #{order.id}</h1>
              <StatusPill status={order.status} />
            </div>
            <p className="mt-2 text-sm text-ink-700">
              Placed on {formatDateTime(order.placedAt)} | Estimated Complete Delivery by {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && (
            <div className="flex flex-col gap-3 rounded-lg border border-warning-500/30 bg-warning-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg text-ink-900">Payment not completed</p>
                <p className="mt-1 text-sm text-ink-700">This order is saved, but the payment for it didn&apos;t go through yet.</p>
              </div>
              <Button onClick={handlePayNow} disabled={payingNow || !paymentSession} className="shrink-0 uppercase">
                {payingNow ? "Opening payment…" : `Pay Now (${formatINR(order.total)})`}
              </Button>
            </div>
          )}

          {Array.from(byRetailer.entries()).map(([retailerId, items], i) => {
            const retailer = retailers.find((r) => r.id === retailerId);
            return (
              <div key={retailerId} className="rounded-lg border border-cream-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-xl text-ink-900">
                        Package {i + 1}: {retailer?.name ?? "Retailer"}
                      </p>
                      {retailer?.verified && (
                        <span className="flex items-center gap-1 rounded-sm bg-[#e2ece9] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#1e5c49]">
                          <Check className="size-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-ink-500">
                      Tracking ID: ILK-{retailerId.slice(4, 7).toUpperCase()}-{order.id.replace("ORD-", "")} | Carrier: Handloom Express Logistics
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500">Estimated Delivery</p>
                    <p className="text-sm font-semibold text-ink-900">
                      {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-6 rounded-md bg-cream-100 p-4">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-sm">
                          <Image src={product.images[0]!.url} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                        <p className="text-sm text-ink-900">
                          {product.name} (x{item.quantity})
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-5">
                  {order.tracking.map((step, idx) => (
                    <div key={step.status + idx} className="flex items-start gap-4">
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full",
                          step.complete ? "bg-success-500 text-white" : "border-2 border-cream-300 bg-white",
                        )}
                      >
                        {step.complete && <Check className="size-3.5" />}
                      </span>
                      <div>
                        <p className={cn("text-sm font-medium", step.complete ? "text-ink-900" : "text-ink-500")}>{step.label}</p>
                        {step.timestamp && <p className="text-xs text-ink-500">{formatDateTime(step.timestamp)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
          <div className="flex flex-col gap-5 rounded-lg border border-cream-300 bg-white p-6">
            <h2 className="font-display text-xl text-primary-600">Delivery &amp; Details</h2>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-500">Delivery Address</p>
              <p className="mt-1 text-sm text-ink-900">
                {order.shippingAddress.fullName} • {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
            </div>
            <div className="h-px w-full bg-cream-300" />
            <div>
              <p className="text-xs font-semibold uppercase text-ink-500">Payment Information</p>
              <p className="mt-1 text-sm text-ink-900">
                {PAYMENT_METHOD_LABEL[order.paymentMethod]} — {PAYMENT_STATUS_LABEL[order.paymentStatus]}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-900">
                {order.paymentStatus === "paid" ? "Total Paid" : "Total Due"}: {formatINR(order.total)}
              </p>
            </div>
            <Button variant="secondary" onClick={() => toast({ title: "Invoice download started" })}>
              <Download className="size-4" /> Download Invoice (PDF)
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Support request sent", description: "Our team will reach out shortly." })}>
              <HelpCircle className="size-4" /> Need Help with your order?
            </Button>
            {order.status === "processing" && (
              <Button variant="danger" disabled={cancelling} onClick={handleCancelOrder}>
                <XCircle className="size-4" /> {cancelling ? "Cancelling…" : "Cancel Order"}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-cream-300 bg-cream-200 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-[18px] text-primary-600" />
              <p className="font-display text-base text-primary-600">Our Safe Delivery Trust</p>
            </div>
            <p className="text-sm leading-relaxed text-ink-700">
              Each handloom saree is securely encased in specialized waterproof layering, guaranteeing damage-free
              transit from rural looms right to your doorstep.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
