"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useSavedRetailersStore } from "@/lib/store/saved-retailers";
import { api } from "@/lib/api/client";
import { WishlistGrid } from "@/components/customer/wishlist-grid";
import { RetailerCard } from "@/components/customer/retailer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Award } from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";
import type { Product, Retailer } from "@/types";

const TABS = ["Products", "Retailers"] as const;

export default function WishlistPage() {
  const mounted = useMounted();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Products");
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const savedRetailerIds = useSavedRetailersStore((s) => s.retailerIds);

  const [allRetailers, setAllRetailers] = useState<Retailer[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!mounted || tab !== "Retailers") return;
    Promise.all([
      api.get<{ items: Retailer[] }>("/retailers"),
      api.get<{ items: Product[] }>("/products?pageSize=100"),
    ])
      .then(([{ items: retailers }, { items: products }]) => {
        setAllRetailers(retailers);
        setAllProducts(products);
      })
      .catch(() => undefined); // Transient API hiccup — don't crash the whole wishlist over it.
  }, [mounted, tab]);

  const counts = { Products: wishlistCount, Retailers: savedRetailerIds.length };
  const savedRetailers = allRetailers.filter((r) => savedRetailerIds.includes(r.id));

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-6 px-5 pt-8 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600">My Wishlist</h1>
        <div className="flex h-11 gap-2 border-b border-cream-300">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-[3px] px-4 pb-3 text-sm font-semibold",
                tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-ink-700",
              )}
            >
              {t} ({mounted ? counts[t] : 0})
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 sm:px-10 lg:px-20">
        {!mounted ? null : tab === "Products" ? (
          <WishlistGrid />
        ) : savedRetailers.length === 0 ? (
          <EmptyState icon={Award} title="No saved retailers yet" description="Follow retailer storefronts to see them here." actionLabel="Explore Retailers" actionHref="/retailers" className="mx-auto max-w-md" />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {savedRetailers.map((r) => (
              <RetailerCard key={r.id} retailer={r} previewProducts={allProducts.filter((p) => p.retailerId === r.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
