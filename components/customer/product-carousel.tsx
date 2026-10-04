"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/customer/product-card";
import { cn } from "@/lib/utils";

export function ProductCarousel({ products, className }: { products: Product[]; className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.firstElementChild as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 240) + 24;
    scroller.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={scrollerRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div key={p.id} className="w-[45%] shrink-0 snap-start sm:w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {products.length > 2 && (
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
  );
}
