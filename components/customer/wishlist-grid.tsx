"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { getProductsByIds } from "@/lib/data/products-client";
import { api } from "@/lib/api/client";
import { ProductCard } from "@/components/customer/product-card";
import { EmptyState, EmptyStatePresets } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/hooks/use-mounted";
import type { Product, Retailer } from "@/types";

export function WishlistGrid() {
  const mounted = useMounted();
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      try {
        const items = await getProductsByIds(productIds);
        if (cancelled) return;
        setProducts(items);
        const { items: allRetailers } = await api.get<{ items: Retailer[] }>("/retailers");
        if (!cancelled) setRetailers(allRetailers);
      } catch {
        // Transient API hiccup — don't crash the whole wishlist over it.
        if (!cancelled) setProducts((prev) => prev ?? []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, productIds]);

  if (!mounted || products === null) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState {...EmptyStatePresets.wishlistEmpty} className="mx-auto max-w-md" />;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} retailerName={retailers.find((r) => r.id === product.retailerId)?.name} />
      ))}
    </div>
  );
}
