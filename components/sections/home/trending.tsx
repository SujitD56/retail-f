import Link from "next/link";
import type { Product, Retailer } from "@/types";
import { ProductCard } from "@/components/customer/product-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

export function Trending({ products, retailers }: { products: Product[]; retailers: Retailer[] }) {
  const retailerName = (id: string) => retailers.find((r) => r.id === id)?.name;

  return (
    <section className="flex flex-col gap-14 px-5 py-24 sm:px-10 lg:px-20">
      <SectionHeading
        eyebrow="Popular Choice"
        title="Trending Now"
        description="The most-coveted drapes this week across our partner retailers."
      />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} retailerName={retailerName(p.retailerId)} />
        ))}
      </div>
      <Button asChild variant="outline" size="lg" className="mx-auto w-fit uppercase">
        <Link href="/trending">View All Trending</Link>
      </Button>
    </section>
  );
}
