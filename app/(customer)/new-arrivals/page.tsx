import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SareeListingClient } from "@/components/customer/plp/saree-listing-client";
import { getProducts } from "@/lib/data/products";
import { getRetailers } from "@/lib/data/retailers";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The newest GI-verified handloom Ilkal sarees, fresh off the loom.",
};

export default async function NewArrivalsPage() {
  const [allProducts, retailers] = await Promise.all([getProducts(), getRetailers()]);
  const products = [...allProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="pb-4">
      <div className="px-5 pt-6 sm:px-10 lg:px-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]} />
      </div>
      <div className="flex flex-col gap-3 px-5 pb-8 pt-12 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600 sm:text-5xl">New Arrivals</h1>
        <p className="max-w-2xl text-base text-ink-700">Fresh off the loom — the latest handloom Ilkal sarees from our retailers.</p>
      </div>
      <SareeListingClient products={products} retailers={retailers} hideCategoryFilter={false} />
    </div>
  );
}
