"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Heart } from "lucide-react";
import type { Product, Retailer } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useSavedRetailersStore } from "@/lib/store/saved-retailers";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { cn } from "@/lib/utils";

export function RetailerCard({ retailer, previewProducts }: { retailer: Retailer; previewProducts: Product[] }) {
  const mounted = useMounted();
  const saved = useSavedRetailersStore((s) => s.has(retailer.id)) && mounted;
  const toggleSaved = useSavedRetailersStore((s) => s.toggle);
  const requireAuth = useRequireAuth();

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-cream-300 bg-white">
      <div className="relative h-40 w-full bg-cream-100">
        {retailer.coverUrl && (
          <Image src={retailer.coverUrl} alt="" fill sizes="33vw" className="object-cover" />
        )}
        <button
          type="button"
          aria-label={saved ? "Unfollow retailer" : "Add retailer to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            requireAuth(() => toggleSaved(retailer.id));
          }}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
        >
          <Heart className={cn("size-[18px]", saved ? "fill-primary-600 text-primary-600" : "text-ink-900")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-center gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-cream-100 shadow-card">
            {retailer.logoUrl && (
              <Image src={retailer.logoUrl} alt={retailer.name} fill sizes="56px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-xl text-ink-900">{retailer.name}</p>
              {retailer.verified && (
                <span className="flex items-center gap-1 rounded-sm bg-[#e2ece9] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#1e5c49]">
                  <BadgeCheck className="size-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-[13px] text-ink-700">{retailer.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StarRating value={retailer.rating} size="xs" />
          <span className="rounded-sm bg-cream-100 px-2.5 py-1 text-[11px] font-semibold text-primary-600">
            {retailer.productCount}+ Sarees
          </span>
        </div>

        <p className="text-sm leading-relaxed text-ink-700">{retailer.bio}</p>

        <div className="h-px w-full bg-cream-300" />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase text-gold-400">Featured Preview</p>
          <div className="flex h-[50px] gap-2.5">
            {previewProducts.slice(0, 3).map((p) => (
              <div key={p.id} className="relative h-full w-[60px] shrink-0 overflow-hidden rounded-sm">
                <Image src={p.images[0]!.url} alt="" fill sizes="60px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <Button asChild className="mt-auto w-full uppercase">
          <Link href={`/retailers/${retailer.slug}`}>Visit Store</Link>
        </Button>
      </div>
    </div>
  );
}
