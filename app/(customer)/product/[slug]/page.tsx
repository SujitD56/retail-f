import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/customer/pdp/product-gallery";
import { PurchasePanel } from "@/components/customer/pdp/purchase-panel";
import { RetailerMiniCard } from "@/components/customer/pdp/retailer-mini-card";
import { ReviewsPanel } from "@/components/customer/pdp/reviews-panel";
import { ShareButton } from "@/components/customer/pdp/share-button";
import { ProductCarousel } from "@/components/customer/product-carousel";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getRetailerById } from "@/lib/data/retailers";
import { getRatingBreakdown, getReviews } from "@/lib/data/reviews";
import { formatINR } from "@/lib/utils";

// No generateStaticParams — retailers add/edit products continuously, so
// this renders per-request rather than freezing the catalog at build time.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

const SPEC_ROWS = (product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) => [
  ["Material", product.material],
  ["Length & Width", product.lengthWidth],
  ["Weave Type", product.weaveType],
  ["Border Type", product.borderType],
  ["Color", product.color],
];

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [retailer, related, reviews, ratingBreakdown] = await Promise.all([
    getRetailerById(product.retailerId),
    getRelatedProducts(product.id, 4),
    getReviews(product.id),
    getRatingBreakdown(product.id),
  ]);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div>
      <div className="px-5 pt-6 sm:px-10 lg:px-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Sarees", href: "/sarees" },
            { label: product.weaveType, href: `/sarees?category=${product.weaveType}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="flex flex-col gap-16 px-5 py-10 sm:px-10 lg:flex-row lg:px-20 lg:py-16">
        <ProductGallery images={product.images} />

        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-gold-400">Handloom Heritage</p>
              <div className="flex items-center gap-3">
                {discount && <Badge variant="primary">{discount}% OFF</Badge>}
                <ShareButton title={product.name} />
              </div>
            </div>
            <h1 className="font-display text-[40px] leading-[1.1] text-primary-600">{product.name}</h1>
            <div className="flex items-center gap-3">
              <StarRating value={product.rating} size="sm" />
              <span className="h-3.5 w-px bg-cream-300" />
              <a href="#reviews" className="text-sm text-gold-400 underline">
                {product.reviewCount} verified reviews
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-cream-300 bg-white p-6">
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-3xl font-bold text-primary-600">{formatINR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-ink-500 line-through">{formatINR(product.compareAtPrice)}</span>
              )}
              {product.compareAtPrice && (
                <span className="text-sm text-gold-400">(You save {formatINR(product.compareAtPrice - product.price)})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-success-500" />
              <span className="text-sm font-medium text-success-500">
                {product.inStock ? "In Stock — Handcrafted, ready to dispatch" : "Currently out of stock"}
              </span>
            </div>
          </div>

          <p className="text-base leading-relaxed text-ink-700">{product.description}</p>

          <div className="flex flex-col gap-3">
            <p className="text-base font-bold uppercase text-ink-900">Product Specifications</p>
            <div className="overflow-hidden rounded-md border border-cream-300 text-sm">
              {SPEC_ROWS(product).map(([label, value], i) => (
                <div key={label} className={`flex gap-4 p-3.5 ${i % 2 === 1 ? "bg-cream-100" : "bg-white"} border-b border-cream-300 last:border-0`}>
                  <p className="w-[120px] shrink-0 font-semibold text-ink-900 sm:w-[180px]">{label}</p>
                  <p className="min-w-0 flex-1 text-ink-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <PurchasePanel product={product} />

          {retailer && <RetailerMiniCard retailer={retailer} />}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-y border-cream-300 bg-white px-5 py-16 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl text-primary-600">You May Also Like</h2>
          <ProductCarousel products={related} className="mt-8" />
        </section>
      )}

      <div id="reviews">
        <ReviewsPanel breakdown={ratingBreakdown} reviews={reviews} />
      </div>
    </div>
  );
}
