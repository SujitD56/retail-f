import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacebookGlyph, InstagramGlyph, TwitterGlyph, YoutubeGlyph } from "@/components/ui/social-glyphs";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Cotton Ilkal", href: "/sarees?category=cotton-ilkal" },
      { label: "Silk Cotton", href: "/sarees?category=silk-cotton" },
      { label: "Wedding Sarees", href: "/sarees?category=wedding-sarees" },
      { label: "Festive Sarees", href: "/sarees?category=festive-sarees" },
      { label: "New Arrivals", href: "/new-arrivals" },
    ],
  },
  {
    title: "Retailers",
    links: [
      { label: "Our Partners", href: "/retailers" },
      { label: "Weaving Guilds", href: "/retailers" },
      { label: "Artisan Stories", href: "/events" },
      { label: "Become a Partner", href: "/retailer/register" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "Our Heritage", href: "/about#heritage" },
      { label: "Authenticity GI", href: "/about#authenticity-gi" },
      { label: "Weaver Welfare", href: "/about#weaver-welfare" },
      { label: "Careers", href: "/about" },
      { label: "Press", href: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "#" },
      { label: "Shipping Policies", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramGlyph, label: "Instagram" },
  { icon: FacebookGlyph, label: "Facebook" },
  { icon: TwitterGlyph, label: "Twitter" },
  { icon: YoutubeGlyph, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-primary-600 px-5 pb-10 pt-16 text-white sm:px-10 lg:px-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="flex max-w-[340px] flex-col gap-5">
            <p className="font-display text-[32px] font-semibold">Ilkal Threads</p>
            <p className="text-sm leading-relaxed text-cream-400">
              Connecting customers with authentic, GI-verified handloom Ilkal saree retailers from Karnataka.
              Empowering weaver communities since 2026.
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-pill bg-white/10 hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 sm:gap-16">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex w-[120px] flex-col gap-4">
                <p className="text-[13px] font-bold uppercase text-gold-400">{col.title}</p>
                <div className="flex flex-col gap-2.5 text-[13px] text-[#ead8d7]">
                  {col.links.map((link) => (
                    <Link key={link.label} href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-4 lg:max-w-[280px]">
            <p className="text-[13px] font-bold uppercase text-gold-400">Subscribe</p>
            <p className="text-[13px] text-cream-400">
              Stay updated on direct weaver drops, festive collections, and exclusive partner launches.
            </p>
            <form className="flex h-11 items-center overflow-hidden rounded-sm bg-white/10">
              <input
                type="email"
                placeholder="Email Address"
                className="h-full flex-1 bg-transparent px-4 text-[13px] text-white placeholder:text-white/50 focus:outline-none"
              />
              <button type="submit" aria-label="Subscribe" className="flex h-full w-11 items-center justify-center bg-gold-400 text-ink-900">
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="h-px w-full bg-white/15" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/60 sm:flex-row">
          <p>© 2026 Ilkal Threads. All rights reserved. Handcrafted with love in Karnataka, India.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
