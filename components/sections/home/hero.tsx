import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex h-[340px] items-center px-5 sm:px-10 lg:px-20">
      <Image
        src="/images/customer/hero-banner.png"
        alt="Weaver draping an Ilkal saree"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex max-w-[720px] flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] font-semibold uppercase text-gold-400">The Loom of Heritage</p>
          <h1 className="font-display text-3xl leading-[1.1] text-white sm:text-4xl">Discover the Soul of Ilkal</h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#f0ece6] sm:text-base">
            Explore authentic Ilkal sarees from trusted retailers — collections crafted with generations of
            tradition, directly empowered from Karnataka&apos;s weaver heartlands.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="uppercase">
            <Link href="/sarees">
              Explore Sarees <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[1.5px] border-white text-white uppercase hover:bg-white/10">
            <Link href="/retailers">Meet Our Retailers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
