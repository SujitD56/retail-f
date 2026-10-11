import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind Kaushaya — connecting customers with authentic, GI-verified handloom Ilkal saree retailers from Karnataka.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="px-5 pt-6 sm:px-10 lg:px-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8 pt-12 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600 sm:text-5xl">About Kaushaya</h1>
        <p className="max-w-2xl text-base text-ink-700">
          Kaushaya connects customers with authentic, GI-verified handloom Ilkal saree retailers from
          Karnataka — empowering weaver communities since 2026.
        </p>
      </div>

      <section id="heritage" className="flex flex-col gap-6 px-5 py-12 sm:px-10 lg:px-20">
        <p className="text-[13px] font-semibold uppercase text-gold-400">Our Heritage</p>
        <h2 className="font-display text-3xl text-primary-600 sm:text-4xl">The Art of Ilkal Weaving</h2>
        <p className="max-w-3xl text-base leading-[1.7] text-ink-700">
          Originating from the town of Ilkal in northern Karnataka, these legendary drapes are characterized by the
          distinct Chikki Paras (star patterns) border and a striking red silk pallu embellished with Tope Teni
          (temple tower) patterns.
        </p>
        <p className="max-w-3xl text-base leading-[1.7] text-ink-700">
          Using fine cotton wraps warped painstakingly to rich silk wefts, weavers employ traditional loop-joining
          techniques that have sustained weaver guilds for over 1,200 years. Every saree preserves this unbroken
          heritage.
        </p>
      </section>

      <section id="authenticity-gi" className="flex flex-col gap-6 border-y border-cream-300 bg-cream-100 px-5 py-12 sm:px-10 lg:px-20">
        <p className="text-[13px] font-semibold uppercase text-gold-400">Authenticity &amp; GI</p>
        <h2 className="font-display text-3xl text-primary-600 sm:text-4xl">GI-Verified, Guaranteed Genuine</h2>
        <p className="max-w-3xl text-base leading-[1.7] text-ink-700">
          Ilkal sarees carry a Geographical Indication (GI) tag, certifying that each piece is woven in and around
          Ilkal, Karnataka, using traditional techniques passed down through generations. Every retailer on our
          platform is verified before being allowed to list products, so customers can shop with confidence that
          what they&apos;re buying is genuine handloom craftsmanship — not a mass-produced imitation.
        </p>
      </section>

      <section id="weaver-welfare" className="flex flex-col gap-6 px-5 py-12 sm:px-10 lg:px-20">
        <p className="text-[13px] font-semibold uppercase text-gold-400">Weaver Welfare</p>
        <h2 className="font-display text-3xl text-primary-600 sm:text-4xl">Empowering the Hands Behind the Loom</h2>
        <p className="max-w-3xl text-base leading-[1.7] text-ink-700">
          By connecting weaver-run retailers directly with customers, Kaushaya removes layers of middlemen so
          more of every sale reaches the artisan communities who weave each saree. We work with weaver guilds across
          Ilkal, Bagalkot, Gadag, and Hubballi to help sustain fair wages and keep this centuries-old craft alive for
          future generations.
        </p>
      </section>

      <section className="flex flex-col items-center gap-6 px-5 py-16 text-center sm:px-10 lg:px-20">
        <h2 className="font-display text-3xl text-primary-600 sm:text-4xl">Explore Authentic Handloom Sarees</h2>
        <p className="max-w-xl text-base text-ink-700">
          Browse our full collection of GI-verified Ilkal sarees, or discover the retailers behind every weave.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="uppercase">
            <Link href="/sarees">Explore Sarees</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="uppercase">
            <Link href="/retailers">Meet Our Retailers</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
