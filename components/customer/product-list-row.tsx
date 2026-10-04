"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Truck } from "lucide-react";
import type { Product } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { PriceTag } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

export function ProductListRow({ product, retailerName }: { product: Product; retailerName?: string }) {
  const mounted = useMounted();
  const inWishlist = useWishlistStore((s) => s.has(product.id)) && mounted;
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex items-center gap-6 overflow-hidden rounded-lg border border-cream-300 bg-white p-4"
    >
      <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-md bg-cream-100">
        <Image src={product.images[0]!.url} alt={product.images[0]!.alt} fill sizes="128px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl text-ink-900 group-hover:text-primary-600">{product.name}</p>
            <div className="mt-1 flex items-center gap-2">
              {retailerName && <span className="text-[13px] text-ink-700">By {retailerName}</span>}
              <Badge variant="success" className="bg-[#e2ece9] text-[#1e5c49]">
                Verified
              </Badge>
            </div>
          </div>
          <button
            type="button"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
          >
            <Heart className={cn("size-5", inWishlist ? "fill-primary-600 text-primary-600" : "text-ink-500")} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-ink-500">
          <Truck className="size-3.5" /> Free 3-Day Delivery
        </div>
        <div className="flex items-center justify-between pt-1">
          <StarRating value={product.rating} count={product.reviewCount} size="sm" />
          <PriceTag price={product.price} compareAt={product.compareAtPrice} />
        </div>
      </div>
    </Link>
  );
}
