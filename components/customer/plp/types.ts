import type { WeaveType } from "@/types";

export interface PlpFilters {
  categories: WeaveType[];
  priceMax: number;
  colors: string[];
  materials: string[];
  retailerIds: string[];
  minRating: number;
  inStockOnly: boolean;
  outOfStockOnly: boolean;
}

export const DEFAULT_PLP_FILTERS: PlpFilters = {
  categories: [],
  priceMax: 10000,
  colors: [],
  materials: [],
  retailerIds: [],
  minRating: 0,
  inStockOnly: false,
  outOfStockOnly: false,
};

export type SortOption = "best-selling" | "price-asc" | "price-desc" | "rating" | "newest";

export const SORT_LABELS: Record<SortOption, string> = {
  "best-selling": "Best Selling",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Highest Rated",
  newest: "Newest First",
};
