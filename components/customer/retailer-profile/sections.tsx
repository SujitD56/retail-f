import Link from "next/link";
import Image from "next/image";
import { Award, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { Collection, Retailer } from "@/types";

export function StorySection({ retailer }: { retailer: Retailer }) {
  const paragraphs = retailer.storyParagraphs ?? [
    `${retailer.name} has built a reputation for genuine handloom excellence in ${retailer.location}, sustaining local weaver families who work using techniques passed down through generations.`,
    retailer.bio,
  ];

  return (
    <section className="flex flex-col items-center gap-16 px-5 py-20 sm:px-10 lg:flex-row lg:px-20">
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-[13px] font-semibold uppercase text-gold-400">Our Legacy</p>
        <h2 className="font-display text-4xl text-primary-600">{retailer.storyTitle ?? "A Weaving Legacy"}</h2>
        <div className="flex flex-col gap-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-ink-700">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div className="relative h-[360px] w-full flex-1 overflow-hidden rounded-lg">
        <Image src={retailer.storyImageUrl ?? retailer.coverUrl} alt="" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
      </div>
    </section>
  );
}

export function StoreCollections({ collections, retailerId }: { collections: Collection[]; retailerId: string }) {
  return (
    <section className="px-5 py-16 sm:px-10 lg:px-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-[32px] text-primary-600">Store Collections</h2>
        <span className="text-sm font-semibold text-ink-500">{collections.length} Collections</span>
      </div>
      {collections.length === 0 ? (
        <p className="text-sm text-ink-700">This store hasn&apos;t been featured in any collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}?retailer=${retailerId}`}
              className="group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-md p-5"
            >
              <Image src={c.coverUrl} alt={c.title} fill sizes="25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40" />
              <p className="relative z-10 font-display text-xl text-white">{c.title}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

const TRUST_ITEMS = [
  { icon: Award, title: "GI Handloom Verified", description: "100% genuine Karnataka geographical indication authenticated handloom standards." },
  { icon: ShieldCheck, title: "Fair Trade Commitment", description: "Direct partner program ensuring comfortable wages for our weaver artisans." },
  { icon: Truck, title: "Insured Safe Shipping", description: "Eco-friendly premium packaging with safe fully-insured global delivery routes." },
  { icon: RefreshCw, title: "Delight Guaranteed", description: "7-day seamless return protection policy for completely risk-free styling." },
];

export function RetailerTrustSection() {
  return (
    <section className="grid grid-cols-1 gap-10 border-y border-cream-300 bg-white px-5 py-16 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:px-20">
      {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex flex-col gap-3">
          <span className="flex size-10 items-center justify-center rounded-pill bg-primary-600/[0.07] text-primary-600">
            <Icon className="size-5" />
          </span>
          <p className="font-display text-lg text-ink-900">{title}</p>
          <p className="text-sm leading-relaxed text-ink-700">{description}</p>
        </div>
      ))}
    </section>
  );
}

export function StoreInfoSection() {
  return (
    <section className="flex flex-col gap-10 border-t border-cream-300 bg-white px-5 py-16 sm:flex-row sm:px-10 lg:px-20">
      <div className="flex-1">
        <h3 className="font-display text-xl text-primary-600">Store Policy</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          Returns are processed within 7 days of delivery. Free shipping applies to all standard domestic orders.
          International rates calculated securely at checkout.
        </p>
      </div>
      <div className="flex-1">
        <h3 className="font-display text-xl text-primary-600">Weaver Welfare</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          A dedicated 10% of gross proceeds from every purchase goes directly into the Weaver Healthcare and
          Children&apos;s Education Fund managed locally.
        </p>
      </div>
    </section>
  );
}
