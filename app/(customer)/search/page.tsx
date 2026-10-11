import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getRetailers } from "@/lib/data/retailers";
import { getCollections } from "@/lib/data/collections";
import { SareeListingClient } from "@/components/customer/plp/saree-listing-client";
import { RetailerMatchRow } from "@/components/customer/search/retailer-match-row";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Search Results" };

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const needle = query.toLowerCase();

  const [allProducts, allRetailers, collections] = await Promise.all([getProducts(), getRetailers(), getCollections()]);

  const matchedProducts = needle
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.weaveType.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle),
      )
    : allProducts;

  const matchedRetailers = needle ? allRetailers.filter((r) => r.name.toLowerCase().includes(needle)) : allRetailers.slice(0, 2);

  const matchedCollections = needle ? collections.filter((c) => c.title.toLowerCase().includes(needle)) : collections;

  const tabs = [
    { label: "All Results", count: null },
    { label: "Sarees", count: matchedProducts.length },
    { label: "Retailers", count: matchedRetailers.length },
    { label: "Collections", count: matchedCollections.length },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-8 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600">
          {query ? `Search Results for "${query}"` : "Search Kaushaya"}
        </h1>
        <p className="text-base text-ink-700">
          {matchedProducts.length + matchedRetailers.length + matchedCollections.length} matching results found across the weaver network
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {tabs.map((tab, i) => (
            <span
              key={tab.label}
              className={cn(
                "rounded-pill px-4 py-2 text-[13px] font-semibold",
                i === 1 ? "bg-primary-600 text-white" : "border border-cream-300 bg-white text-ink-700",
              )}
            >
              {tab.label}
              {tab.count !== null && ` (${tab.count})`}
            </span>
          ))}
        </div>
      </div>

      <RetailerMatchRow retailers={matchedRetailers} />

      <SareeListingClient
        products={matchedProducts}
        retailers={allRetailers}
        header={
          <div key="search-header">
            <h2 className="font-display text-2xl text-ink-900">Sarees</h2>
            <p className="text-sm text-ink-700">{matchedProducts.length} results</p>
          </div>
        }
      />
    </div>
  );
}
