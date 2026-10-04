"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { getProductsByIds } from "@/lib/data/products-client";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartLineItem } from "@/components/customer/cart/cart-line-item";
import { EmptyState, EmptyStatePresets } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR } from "@/lib/utils";
import type { Product, Retailer } from "@/types";

const SHIPPING_PER_RETAILER = 150;
const TAX_RATE = 0.18;

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const router = useRouter();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const productList = await getProductsByIds(items.map((i) => i.productId));
      if (cancelled) return;
      setProducts(productList);
      const { items: retailerList } = await api.get<{ items: Retailer[] }>("/retailers");
      if (!cancelled) setRetailers(retailerList);
    })();
    return () => {
      cancelled = true;
    };
    // Re-fetch whenever the set of productIds in the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items.map((i) => i.productId).join(",")]);

  if (!mounted || products === null) {
    return (
      <div className="flex flex-col gap-6 px-5 py-16 sm:px-10 lg:px-20">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const resolvedItems = items
    .map((item) => ({ item, product: products.find((p) => p.id === item.productId) }))
    .filter((x): x is { item: (typeof items)[number]; product: NonNullable<(typeof x)["product"]> } => Boolean(x.product));

  const byRetailer = new Map<string, typeof resolvedItems>();
  for (const entry of resolvedItems) {
    const list = byRetailer.get(entry.product.retailerId) ?? [];
    list.push(entry);
    byRetailer.set(entry.product.retailerId, list);
  }

  const subtotal = resolvedItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const shipping = byRetailer.size * SHIPPING_PER_RETAILER;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  if (resolvedItems.length === 0) {
    return (
      <div className="flex flex-col gap-8 px-5 py-16 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600">Your Shopping Cart</h1>
        <EmptyState {...EmptyStatePresets.cartEmpty} className="mx-auto max-w-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 px-5 pb-24 pt-10 sm:px-10 lg:flex-row lg:px-20">
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl text-primary-600">Your Shopping Cart</h1>
          <p className="text-[15px] text-ink-700">
            You have {resolvedItems.reduce((n, e) => n + e.item.quantity, 0)} items in your cart from {byRetailer.size} distinct weavers/retailers.
          </p>
        </div>

        {Array.from(byRetailer.entries()).map(([retailerId, entries]) => {
          const retailer = retailers.find((r) => r.id === retailerId);
          const groupSubtotal = entries.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
          return (
            <div key={retailerId} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <p className="font-display text-[22px] text-ink-900">{retailer?.name ?? "Retailer"}</p>
                {retailer?.verified && (
                  <Badge variant="success" className="bg-[#e2ece9] text-[#1e5c49]">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {entries.map(({ item, product }) => (
                  <CartLineItem key={product.id} product={product} quantity={item.quantity} />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-md bg-[#f0ece1] px-6 py-3">
                <span className="text-sm text-ink-700">Subtotal for {retailer?.name ?? "Retailer"}</span>
                <span className="text-base font-bold text-primary-600">{formatINR(groupSubtotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
        <div className="flex flex-col gap-6 rounded-xl border border-cream-300 bg-white p-8">
          <h2 className="font-display text-2xl text-primary-600">Order Summary</h2>
          <div className="flex flex-col gap-4 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Estimated Shipping" value={formatINR(shipping)} />
            <Row label="Tax (GST 18%)" value={formatINR(tax)} />
            <div className="h-px w-full bg-cream-300" />
            <div className="flex items-center justify-between font-bold">
              <span className="text-base text-ink-900">Estimated Total</span>
              <span className="text-xl text-primary-600">{formatINR(total)}</span>
            </div>
          </div>
          {byRetailer.size > 1 && (
            <div className="flex items-center gap-2 rounded-md border border-gold-400 bg-[#f4ece1] p-4">
              <Sparkles className="size-4 shrink-0 text-gold-400" />
              <p className="flex-1 text-xs leading-relaxed text-ink-700">
                Your order contains handloom products from {byRetailer.size} weavers. You may receive separate shipments.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full uppercase" onClick={() => router.push("/checkout")}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full uppercase" onClick={() => router.back()}>
              Continue Shopping
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-cream-300 bg-cream-200 p-6">
          <div className="flex gap-3">
            <ShieldCheck className="size-8 shrink-0 text-primary-600" />
            <div>
              <p className="font-display text-sm text-primary-600">Authenticity Guaranteed</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                Geographical Indication (GI) protected handlooms directly sourced from verified weaver cooperative networks.
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-cream-300" />
          <div className="flex gap-3">
            <Sparkles className="size-8 shrink-0 text-primary-600" />
            <div>
              <p className="font-display text-sm text-primary-600">Weaver Fair-Wages</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                Bypassing wholesale margins, insuring fair living wages are dispersed directly to artisans in Ilkal town.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-700">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}
