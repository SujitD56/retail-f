import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SareeListingClient } from "@/components/customer/plp/saree-listing-client";
import { getProducts } from "@/lib/data/products";
import { getRetailers } from "@/lib/data/retailers";

export const metadata: Metadata = {
  title: "Trending Ilkal Sarees",
  description: "The most-loved GI-verified handloom Ilkal sarees right now.",
};

export default async function TrendingPage() {
  const [allProducts, retailers] = await Promise.all([getProducts(), getRetailers()]);
  const products = allProducts.filter((p) => p.tags.includes("trending"));

  return (
    <div className="pb-4">
      <div className="px-5 pt-6 sm:px-10 lg:px-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trending" }]} />
      </div>
      <div className="flex flex-col gap-3 px-5 pb-8 pt-12 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600 sm:text-5xl">Trending Now</h1>
        <p className="max-w-2xl text-base text-ink-700">The handloom Ilkal sarees customers are loving most right now.</p>
      </div>
      <SareeListingClient products={products} retailers={retailers} hideCategoryFilter={false} />
    </div>
  );
}
