import type { Metadata } from "next";
import { Hero } from "@/components/sections/home/hero";
import { FeaturedProducts } from "@/components/sections/home/featured-products";
import { RetailersShowcase } from "@/components/sections/home/retailers";
import { Trust } from "@/components/sections/home/trust";
import { Heritage } from "@/components/sections/home/heritage";
import { RetailerStory } from "@/components/sections/home/retailer-story";
import { getProducts } from "@/lib/data/products";
import { getRetailers } from "@/lib/data/retailers";

export const metadata: Metadata = {
  title: "Handloom Saree Marketplace",
  description:
    "Discover the soul of Ilkal — authentic GI-verified handloom sarees from Karnataka's trusted weaver retailers.",
};

export default async function HomePage() {
  const [retailers, allProducts] = await Promise.all([getRetailers(), getProducts()]);

  return (
    <>
      <Hero />
      <FeaturedProducts products={allProducts} retailers={retailers} />
      <RetailersShowcase retailers={retailers} products={allProducts} />
      <Trust />
      <Heritage />
      <RetailerStory />
    </>
  );
}
