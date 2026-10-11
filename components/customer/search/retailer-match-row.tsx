import Link from "next/link";
import Image from "next/image";
import type { Retailer } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RetailerMatchRow({ retailers }: { retailers: Retailer[] }) {
  if (retailers.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 sm:px-10 lg:px-20">
      <p className="text-sm font-semibold uppercase text-gold-400">Retailers matching your search</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {retailers.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 rounded-lg border border-cream-300 bg-white p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex items-center gap-3 sm:contents">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-pill border border-cream-300 bg-cream-100">
                <Image src={r.logoUrl} alt={r.name} fill sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-display text-base text-ink-900">{r.name}</p>
                  <Badge variant="success" className="bg-[#e2ece9] text-[9px] text-[#1e5c49] normal-case">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-ink-500">{r.location}</p>
              </div>
            </div>
            <div className="hidden h-10 w-px shrink-0 bg-cream-300 sm:block" />
            <div className="flex items-center justify-between gap-3 sm:contents">
              <div className="w-[110px] shrink-0">
                <p className="text-[11px] text-ink-500">Rating</p>
                <StarRating value={r.rating} size="xs" />
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/retailers/${r.slug}`}>Visit Store</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
