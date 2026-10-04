import type { Product, Retailer } from "@/types";
import { FilterableProductSection } from "./filterable-product-section";

export function FeaturedProducts({ products, retailers }: { products: Product[]; retailers: Retailer[] }) {
  return (
    <FilterableProductSection
      eyebrow="From Our Partner Stores"
      title="Shop Our Top Rated Sarees"
      description="The best-rated handloom Ilkal sarees, mixed across every weaver-run retailer partner."
      products={products}
      retailers={retailers}
    />
  );
}
