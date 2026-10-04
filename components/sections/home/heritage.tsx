import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Heritage() {
  return (
    <section className="flex flex-col items-center gap-10 px-5 py-24 sm:px-10 lg:flex-row lg:gap-20 lg:px-20">
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold uppercase text-gold-400">Deep Dive Into History</p>
          <h2 className="font-display text-4xl text-primary-600 sm:text-5xl">The Art of Ilkal Weaving</h2>
          <p className="text-base leading-[1.7] text-ink-700">
            Originating from the town of Ilkal in northern Karnataka, these legendary drapes are characterized by
            the distinct Chikki Paras (star patterns) border and a striking red silk pallu embellished with Tope
            Teni (temple tower) patterns.
          </p>
          <p className="text-base leading-[1.7] text-ink-700">
            Using fine cotton wraps warped painstakingly to rich silk wefts, weavers employ traditional loop-joining
            techniques that have sustained weaver guilds for over 1,200 years. Every saree preserves this unbroken
            heritage.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="w-fit uppercase">
          <Link href="/sarees">Discover Ilkal</Link>
        </Button>
      </div>
      <div className="flex h-[280px] flex-1 gap-4 sm:h-[360px] sm:gap-6 lg:h-[480px]">
        <div className="relative flex-1 overflow-hidden rounded-md">
          <Image src="/images/customer/heritage-1.png" alt="Ilkal weaving loom" fill sizes="25vw" className="object-cover" />
        </div>
        <div className="flex w-[110px] flex-col gap-4 sm:w-[160px] sm:gap-6 lg:w-[220px]">
          <div className="relative flex-1 overflow-hidden rounded-md">
            <Image src="/images/customer/heritage-2.png" alt="Handloom detail" fill sizes="15vw" className="object-cover" />
          </div>
          <div className="relative flex-1 overflow-hidden rounded-md">
            <Image src="/images/customer/heritage-3.png" alt="Weaver at work" fill sizes="15vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
