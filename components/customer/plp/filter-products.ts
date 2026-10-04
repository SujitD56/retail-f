import type { Product } from "@/types";
import { COLOR_SWATCHES } from "./filters-sidebar";
import type { PlpFilters } from "./types";

/** Shared predicate used by every filterable product grid (PLP, trending, home sections). */
export function applyPlpFilters(products: Product[], filters: PlpFilters): Product[] {
  return products.filter((p) => {
    if (filters.categories.length && !filters.categories.includes(p.weaveType)) return false;
    if (p.price > filters.priceMax) return false;
    if (filters.retailerIds.length && !filters.retailerIds.includes(p.retailerId)) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.outOfStockOnly && p.inStock) return false;
    if (filters.materials.length && !filters.materials.some((m) => p.material.toLowerCase().includes(m.split(" ")[0]!.toLowerCase()))) return false;
    if (filters.colors.length) {
      const productColor = p.color.toLowerCase();
      const matchesColor = filters.colors.some((hex) => {
        const swatch = COLOR_SWATCHES.find((c) => c.hex === hex);
        return swatch?.keywords.some((k) => productColor.includes(k));
      });
      if (!matchesColor) return false;
    }
    return true;
  });
}
