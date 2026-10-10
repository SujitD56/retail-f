"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Retailer } from "@/types";
import { RetailerCard } from "@/components/customer/retailer-card";
import { SectionHeading } from "./section-heading";

export function RetailersShowcase({ retailers, products }: { retailers: Retailer[]; products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.firstElementChild as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 320) + 32;
    scroller.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-14 bg-cream-200 px-5 pb-24 pt-10 sm:px-10 lg:px-20">
      <SectionHeading
        eyebrow="Verified Partners"
        title="Meet Our Retailers"
        description="Connecting you with the true custodians of handloom heritage, supporting authentic weavers from Ilkal town."
      />
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-8 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {retailers.map((r) => (
            <div key={r.id} className="flex w-[85%] shrink-0 snap-start sm:w-[360px]">
              <RetailerCard retailer={r} previewProducts={products.filter((p) => p.retailerId === r.id)} />
            </div>
          ))}
        </div>
        {retailers.length > 3 && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByCard(-1)}
              className="absolute -left-4 top-1/3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream-300 bg-white shadow-card sm:flex"
            >
              <ChevronLeft className="size-4 text-ink-900" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByCard(1)}
              className="absolute -right-4 top-1/3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream-300 bg-white shadow-card sm:flex"
            >
              <ChevronRight className="size-4 text-ink-900" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
