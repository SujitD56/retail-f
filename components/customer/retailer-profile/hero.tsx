"use client";

import Image from "next/image";
import { Check, Share2 } from "lucide-react";
import type { Retailer } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useSavedRetailersStore } from "@/lib/store/saved-retailers";
import { useMounted } from "@/lib/hooks/use-mounted";

export function RetailerProfileHero({ retailer }: { retailer: Retailer }) {
  const { toast } = useToast();
  const mounted = useMounted();
  const saved = useSavedRetailersStore((s) => s.has(retailer.id)) && mounted;
  const toggleSaved = useSavedRetailersStore((s) => s.toggle);

  return (
    <section className="relative flex flex-col gap-6 px-5 pb-12 pt-28 sm:px-10 lg:px-20">
      <Image src={retailer.heroImageUrl ?? retailer.coverUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-white">
          <Image src={retailer.logoUrl} alt={retailer.name} fill sizes="112px" className="object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl text-white sm:text-[42px]">{retailer.name}</h1>
            <Badge variant="success" className="bg-[#e2ece9] text-[#1e5c49]">
              Verified
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[15px] text-white/90">
            <span>{retailer.location}</span>
            <span className="h-3 w-px bg-white/30" />
            <span>Weaving tradition since {retailer.foundedYear ?? "—"}</span>
            <span className="h-3 w-px bg-white/30" />
            <StarRating value={retailer.rating} size="xs" />
            <span className="text-white/70">({retailer.reviewCount.toLocaleString("en-IN")} reviews)</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={saved ? "secondary" : "primary"}
            onClick={() => {
              toggleSaved(retailer.id);
              toast({ title: saved ? `Unfollowed ${retailer.name}` : `Following ${retailer.name}`, variant: "success" });
            }}
            className="uppercase"
          >
            {saved && <Check className="size-4" />}
            {saved ? "Following" : "Follow Store"}
          </Button>
          <button
            type="button"
            aria-label="Share store"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast({ title: "Link copied to clipboard" });
            }}
            className="flex size-11 items-center justify-center rounded-sm border border-white bg-white/15 text-white"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 h-px w-full bg-white/20" />

      <div className="relative z-10 flex flex-wrap gap-12">
        <Stat value={`${retailer.productCount.toLocaleString("en-IN")}+`} label="Products" />
        <Stat value="48" label="Collections" />
        <Stat value={`${(retailer.ordersFulfilled ?? 3200).toLocaleString("en-IN")}+`} label="Orders Fulfilled" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2 text-white">
      <span className="font-display text-[28px] font-semibold">{value}</span>
      <span className="text-[13px] text-white/70">{label}</span>
    </div>
  );
}
