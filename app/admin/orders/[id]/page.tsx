"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, PackageX } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api, ApiError } from "@/lib/api/client";
import { formatDateTime, formatINR } from "@/lib/utils";

interface AdminOrderItemDetail {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  retailerName: string;
  retailerSlug: string;
  quantity: number;
  priceAtPurchase: number;
}
interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  placedAt: string;
  estimatedDelivery: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { fullName: string; line1: string; city: string; state: string; postalCode: string; phone: string };
  customer: { name: string; email: string; phone: string };
  items: AdminOrderItemDetail[];
  tracking: { status: string; label: string; timestamp: string; complete: boolean }[];
}

const PAYMENT_STATUS_LABEL = { paid: "Paid", pending: "COD", failed: "Failed" } as const;

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AdminOrderDetail>(`/orders/admin/${id}`)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Order Details" subtitle="Loading…">
        <Skeleton className="h-96 w-full" />
      </AdminShell>
    );
  }

  if (notFound || !order) {
    return (
      <AdminShell title="Order Details" subtitle="">
        <EmptyState
          icon={PackageX}
          title="Order not found"
          description="This order doesn't exist."
          actionLabel="Back to Orders"
          actionHref="/admin/orders"
          className="mx-auto max-w-md"
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Order #${order.orderNumber}`} subtitle={`Placed ${formatDateTime(order.placedAt)}`}>
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
        <ArrowLeft className="size-4" /> Back to Orders
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-xl text-ink-900">Ordered Products</p>
              <div className="flex items-center gap-2">
                <StatusPill status={order.status} />
                <StatusPill status={PAYMENT_STATUS_LABEL[order.paymentStatus]} />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {order.items.map((item, i) => (
                <div key={`${item.productId}-${i}`} className="flex items-center gap-4 border-b border-cream-300 pb-4 last:border-0 last:pb-0">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-cream-100">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.productSlug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-primary-600">
                      {item.productName}
                    </Link>
                    <p className="text-xs text-ink-500">
                      Sold by{" "}
                      <Link href={`/retailers/${item.retailerSlug}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 hover:underline">
                        {item.retailerName}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs text-ink-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-ink-900">{formatINR(item.priceAtPurchase * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-xl text-ink-900">Order Timeline</p>
            <div className="mt-4 flex flex-col gap-3">
              {order.tracking.map((t) => (
                <div key={t.label} className="flex items-center justify-between text-sm">
                  <span className={t.complete ? "font-medium text-ink-900" : "text-ink-500"}>{t.label}</span>
                  <span className="text-xs text-ink-500">{t.timestamp ? formatDateTime(t.timestamp) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-lg text-ink-900">Customer</p>
            <div className="mt-3 flex flex-col gap-1 text-sm text-ink-700">
              <p className="font-medium text-ink-900">{order.customer.name}</p>
              {order.customer.email && <p>{order.customer.email}</p>}
              {order.customer.phone && <p>{order.customer.phone}</p>}
            </div>
          </div>

          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-lg text-ink-900">Shipping Address</p>
            <div className="mt-3 text-sm leading-relaxed text-ink-700">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-lg text-ink-900">Payment Summary</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatINR(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatINR(order.tax)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-cream-300 pt-2 font-semibold text-ink-900">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
