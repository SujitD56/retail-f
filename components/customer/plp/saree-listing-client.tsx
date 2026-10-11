"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import type { Product, Retailer, WeaveType } from "@/types";
import { FiltersSidebar, COLOR_SWATCHES } from "./filters-sidebar";
import { applyPlpFilters } from "./filter-products";
import { DEFAULT_PLP_FILTERS, SORT_LABELS, type PlpFilters, type SortOption } from "./types";
import { ProductCard } from "@/components/customer/product-card";
import { ProductListRow } from "@/components/customer/product-list-row";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, EmptyStatePresets } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function SareeListingClient({
  products,
  retailers,
  initialCategory,
  header,
  hideCategoryFilter = false,
  hideRetailerFilter = false,
}: {
  products: Product[];
  retailers: Retailer[];
  initialCategory?: WeaveType;
  /** Overrides the default "Ilkal Sarees" heading — used by the Search Results page. */
  header?: React.ReactNode;
  /** Used by the Collection page, where the collection itself is the category. */
  hideCategoryFilter?: boolean;
  /** Used by the Collection page when scoped to one retailer — filtering by retailer is redundant there. */
  hideRetailerFilter?: boolean;
}) {
  const [filters, setFilters] = useState<PlpFilters>({
    ...DEFAULT_PLP_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  });
  const [sort, setSort] = useState<SortOption>("best-selling");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const retailerName = (id: string) => retailers.find((r) => r.id === id)?.name;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) counts[p.weaveType] = (counts[p.weaveType] ?? 0) + 1;
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let list = applyPlpFilters(products, filters);

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    return list;
  }, [products, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    ...(filters.minRating ? [{ key: "rating", label: `${filters.minRating}★ & above`, onRemove: () => updateFilters({ ...filters, minRating: 0 }) }] : []),
    ...(filters.inStockOnly ? [{ key: "in-stock", label: "In Stock Only", onRemove: () => updateFilters({ ...filters, inStockOnly: false }) }] : []),
    ...(filters.outOfStockOnly ? [{ key: "out-of-stock", label: "Out of Stock", onRemove: () => updateFilters({ ...filters, outOfStockOnly: false }) }] : []),
    ...(filters.priceMax < 10000 ? [{ key: "price", label: `Up to ₹${filters.priceMax.toLocaleString("en-IN")}`, onRemove: () => updateFilters({ ...filters, priceMax: 10000 }) }] : []),
  ];

  return (
    <div className="flex gap-10 px-5 pb-24 sm:px-10 lg:px-20">
      <FiltersSidebar
        filters={filters}
        onChange={updateFilters}
        retailers={retailers}
        categoryCounts={categoryCounts}
        hideCategory={hideCategoryFilter}
        hideRetailer={hideRetailerFilter}
        mobileOpen={mobileFiltersOpen}
        onMobileClose={() => setMobileFiltersOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          {header ?? (
            <div className="flex items-baseline gap-4">
              <h1 className="font-display text-3xl text-primary-600 sm:text-4xl">Ilkal Sarees</h1>
              <p className="text-sm text-ink-700 sm:text-base">
                {filtered.length.toLocaleString("en-IN")} {filtered.length === 1 ? "Saree" : "Sarees"} Found
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-sm border border-cream-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 lg:hidden"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-ink-700 sm:inline">Sort By:</span>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-[140px] sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex overflow-hidden rounded-sm border border-cream-300">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView("grid")}
                className={cn("p-2", view === "grid" ? "bg-primary-600 text-white" : "bg-white text-ink-700")}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView("list")}
                className={cn("p-2", view === "list" ? "bg-primary-600 text-white" : "bg-white text-ink-700")}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {appliedChips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
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
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {pageItems.map((p, i) => (
              <ProductCard key={p.id} product={p} retailerName={retailerName(p.retailerId)} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pageItems.map((p) => (
              <ProductListRow key={p.id} product={p} retailerName={retailerName(p.retailerId)} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-10" />
      </div>
    </div>
  );
}
