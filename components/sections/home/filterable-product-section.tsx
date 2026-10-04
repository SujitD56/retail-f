"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, Retailer } from "@/types";
import { ProductCard } from "@/components/customer/product-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, EmptyStatePresets } from "@/components/ui/empty-state";
import { FiltersSidebar, COLOR_SWATCHES } from "@/components/customer/plp/filters-sidebar";
import { applyPlpFilters } from "@/components/customer/plp/filter-products";
import { DEFAULT_PLP_FILTERS, type PlpFilters } from "@/components/customer/plp/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

/**
 * Single homepage catalog section — mixes every retailer's products (ranked by
 * rating) behind the same Flipkart-style filter sidebar + pagination used on
 * /sarees, so there's no separate "trending" vs. "retailer" split or View All link.
 */
export function FilterableProductSection({
  eyebrow,
  title,
  description,
  products,
  retailers,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  retailers: Retailer[];
  className?: string;
}) {
  const [filters, setFilters] = useState<PlpFilters>(DEFAULT_PLP_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const retailerName = (id: string) => retailers.find((r) => r.id === id)?.name;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) counts[p.weaveType] = (counts[p.weaveType] ?? 0) + 1;
    return counts;
  }, [products]);

  const ranked = useMemo(() => {
    const filtered = applyPlpFilters(products, filters);
    return [...filtered].sort((a, b) => b.rating - a.rating);
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const pageItems = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilters = (next: PlpFilters) => {
    setFilters(next);
    setPage(1);
  };

  const appliedChips: { key: string; label: string; onRemove: () => void }[] = [
    ...filters.categories.map((cat) => ({
      key: `cat-${cat}`,
      label: cat,
      onRemove: () => updateFilters({ ...filters, categories: filters.categories.filter((c) => c !== cat) }),
    })),
    ...filters.colors.map((hex) => ({
      key: `color-${hex}`,
      label: COLOR_SWATCHES.find((c) => c.hex === hex)?.label ?? hex,
      onRemove: () => updateFilters({ ...filters, colors: filters.colors.filter((c) => c !== hex) }),
    })),
    ...filters.materials.map((mat) => ({
      key: `mat-${mat}`,
      label: mat,
      onRemove: () => updateFilters({ ...filters, materials: filters.materials.filter((m) => m !== mat) }),
    })),
    ...filters.retailerIds.map((id) => ({
      key: `retailer-${id}`,
      label: retailerName(id) ?? "Retailer",
      onRemove: () => updateFilters({ ...filters, retailerIds: filters.retailerIds.filter((r) => r !== id) }),
    })),
    ...(filters.minRating
      ? [{ key: "rating", label: `${filters.minRating}★ & above`, onRemove: () => updateFilters({ ...filters, minRating: 0 }) }]
      : []),
    ...(filters.inStockOnly
      ? [{ key: "in-stock", label: "In Stock Only", onRemove: () => updateFilters({ ...filters, inStockOnly: false }) }]
      : []),
    ...(filters.outOfStockOnly
      ? [{ key: "out-of-stock", label: "Out of Stock", onRemove: () => updateFilters({ ...filters, outOfStockOnly: false }) }]
      : []),
    ...(filters.priceMax < DEFAULT_PLP_FILTERS.priceMax
      ? [
          {
            key: "price",
            label: `Up to ₹${filters.priceMax.toLocaleString("en-IN")}`,
            onRemove: () => updateFilters({ ...filters, priceMax: DEFAULT_PLP_FILTERS.priceMax }),
          },
        ]
      : []),
  ];

  return (
    <section className={cn("flex flex-col gap-10 px-5 py-24 sm:px-10 lg:flex-row lg:items-start lg:gap-14 lg:px-20", className)}>
      <div className="flex w-full flex-col gap-6 lg:w-[280px] lg:shrink-0">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase text-gold-400">{eyebrow}</p>
          <h2 className="font-display text-3xl text-primary-600">{title}</h2>
          {description && <p className="text-sm leading-relaxed text-ink-700">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-2 rounded-sm border border-cream-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> Filters
        </button>
        <FiltersSidebar
          filters={filters}
          onChange={updateFilters}
          retailers={retailers}
          categoryCounts={categoryCounts}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {appliedChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-ink-700">Applied Filters:</span>
            {appliedChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1 text-[13px] text-ink-900"
              >
                {chip.label}
                <X className="size-3" />
              </button>
            ))}
            <button type="button" onClick={() => updateFilters(DEFAULT_PLP_FILTERS)} className="text-[13px] font-medium text-primary-600">
              Clear All
            </button>
          </div>
        )}

        {pageItems.length === 0 ? (
          <EmptyState {...EmptyStatePresets.noSareesFound} onAction={() => updateFilters(DEFAULT_PLP_FILTERS)} actionHref={undefined} />
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {pageItems.map((p) => (
              <ProductCard key={p.id} product={p} retailerName={retailerName(p.retailerId)} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}
