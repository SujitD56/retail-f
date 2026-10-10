import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventHero } from "@/components/customer/events/event-hero";
import { ProductCard } from "@/components/customer/product-card";
import { RetailerCard } from "@/components/customer/retailer-card";
import { getEventBySlug, getEventEntries, entryProduct } from "@/lib/data/events";
import { getProducts } from "@/lib/data/products";
import { getRetailers } from "@/lib/data/retailers";

export const metadata: Metadata = { title: "Shop the Event" };

export default async function ShopTheEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventBySlug(id);
  if (!event) notFound();

  const [entries, allProducts, allRetailers] = await Promise.all([getEventEntries(event.id), getProducts(), getRetailers()]);
  const winnerProductsRaw = await Promise.all(entries.slice(0, 4).map(entryProduct));
  const winnerProducts = winnerProductsRaw.filter((p): p is NonNullable<typeof p> => Boolean(p));
  const trending = allProducts.slice(0, 8);
  const retailerName = (id: string) => allRetailers.find((r) => r.id === id)?.name;
  const participatingRetailerIds = Array.from(new Set(entries.map((e) => e.retailerId)));
  const participatingRetailers = participatingRetailerIds
    .map((id) => allRetailers.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div>
      <EventHero eyebrow="Shop the Challenge" title="Shop the Event" description="Every look from the challenge is available to buy today — straight from the weavers who made it." imageUrl={event.bannerUrl} />

      <section className="px-16 py-16">
        <h2 className="mb-8 font-display text-3xl text-primary-600">Winners&apos; Spotlight</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {winnerProducts.map((p) => (
            <ProductCard key={p.id} product={p} retailerName={retailerName(p.retailerId)} />
          ))}
        </div>
      </section>

      <section className="bg-white px-16 py-16">
        <h2 className="mb-8 font-display text-3xl text-primary-600">Trending From the Challenge</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} retailerName={retailerName(p.retailerId)} />
          ))}
        </div>
      </section>

      {participatingRetailers.length > 0 && (
        <section className="px-16 py-16">
          <h2 className="mb-8 font-display text-3xl text-primary-600">Shop by Participating Retailer</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {participatingRetailers.slice(0, 3).map((r) => (
              <RetailerCard key={r.id} retailer={r} previewProducts={allProducts.filter((p) => p.retailerId === r.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
