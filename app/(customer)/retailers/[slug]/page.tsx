import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RetailerProfileHero } from "@/components/customer/retailer-profile/hero";
import { StorySection, StoreCollections, RetailerTrustSection, StoreInfoSection } from "@/components/customer/retailer-profile/sections";
import { RetailerProductsSection } from "@/components/customer/retailer-profile/products-section";
import { RetailerReviewsSection } from "@/components/customer/retailer-profile/reviews-section";
import { getRetailerBySlug } from "@/lib/data/retailers";
import { getProducts } from "@/lib/data/products";
import { getCollections } from "@/lib/data/collections";
import { getRetailerRatingBreakdown, getRetailerReviews } from "@/lib/data/reviews";

// No generateStaticParams — retailer profiles change as soon as a retailer
// is approved/edits their store, so this renders per-request.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) return {};
  return { title: retailer.name, description: retailer.bio };
}

export default async function RetailerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) notFound();

  const [products, collections, reviews, breakdown] = await Promise.all([
    getProducts({ retailerId: retailer.id }),
    getCollections(),
    getRetailerReviews(retailer.id),
    getRetailerRatingBreakdown(retailer.id),
  ]);

  return (
    <div>
      <div className="px-5 pt-6 sm:px-10 lg:px-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Retailers", href: "/retailers" }, { label: retailer.name }]} />
      </div>
      <RetailerProfileHero retailer={retailer} />
      <StorySection retailer={retailer} />
      <StoreCollections
        collections={collections.filter((c) => c.productIds.some((id) => products.some((p) => p.id === id)))}
        retailerId={retailer.id}
      />
      <RetailerProductsSection products={products} retailerName={retailer.name} />
      <RetailerTrustSection />
      <RetailerReviewsSection breakdown={breakdown} reviews={reviews} />
      <StoreInfoSection />
    </div>
  );
}
