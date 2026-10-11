"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { PriceTag } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { cn } from "@/lib/utils";

export function ProductCard({ product, retailerName, priority }: { product: Product; retailerName?: string; priority?: boolean }) {
  const mounted = useMounted();
  const inWishlist = useWishlistStore((s) => s.has(product.id)) && mounted;
  const toggle = useWishlistStore((s) => s.toggle);
  const requireAuth = useRequireAuth();

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-white pb-5">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] w-full shrink-0 overflow-hidden bg-cream-100">
        <Image
          src={product.images[0]!.url}
          alt={product.images[0]!.alt}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.compareAtPrice && (
          <Badge variant="solid" className="absolute left-3 top-3">
            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
          </Badge>
        )}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            requireAuth(() => toggle(product.id));
          }}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
        >
          <Heart className={cn("size-[18px]", inWishlist ? "fill-primary-600 text-primary-600" : "text-ink-900")} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-3">
        <div className="flex flex-col gap-1">
          <Link href={`/product/${product.slug}`} className="truncate font-display text-lg text-ink-900 hover:text-primary-600">
            {product.name}
          </Link>
          <div className="flex min-h-[21px] items-center gap-1.5">
            {retailerName && (
              <>
                <span className="text-[13px] text-ink-700">By {retailerName}</span>
                <Badge variant="success" className="bg-[#e2ece9] text-[#1e5c49]">
                  Verified
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <StarRating value={product.rating} size="xs" />
          <PriceTag price={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
      </div>
    </div>
  );
}
