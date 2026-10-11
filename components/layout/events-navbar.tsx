"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useCartStore } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/use-mounted";

const LINKS = [
  { label: "Sarees", href: "/sarees" },
  { label: "Collections", href: "/collections/handpicked-ilkal" },
  { label: "Retailers", href: "/retailers" },
  { label: "Events", href: "/events", active: true },
  { label: "New Arrivals", href: "/sarees?sort=newest" },
];

export function EventsNavbar() {
  const mounted = useMounted();
  const cartCount = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);

  return (
    <div className="sticky top-0 z-40">
      <div className="flex h-10 items-center justify-center bg-primary-600 px-10">
        <p className="text-xs font-semibold uppercase text-cream-100">
          ✨ Ilkal Style Challenge 2026 — 42 Retailers. 120+ Looks.{" "}
          <Link href="/events/ilkal-style-challenge-2026/leaderboard" className="underline">
            Vote Now →
          </Link>
        </p>
      </div>
      <header className="flex h-20 items-center justify-between border-b border-cream-300 bg-cream-100 px-16">
        <Link href="/" className="flex items-center">
          <Image src="/images/brand/kaushaya-logo-sm.png" alt="Kaushaya" width={140} height={78} className="h-16 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-1.5 py-2 text-sm font-medium ${link.active ? "font-bold text-primary-600" : "text-ink-900"}`}
            >
              {link.label}
              {link.active && <span className="size-1.5 rounded-full bg-primary-600" />}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <Search className="size-5 text-ink-900" />
          <Link href="/wishlist">
            <Heart className="size-5 text-ink-900" />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingBag className="size-5 text-ink-900" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <span className="h-5 w-px bg-cream-300" />
          <Link href={user ? "/account" : "/login"} className="flex items-center gap-2 text-sm font-medium text-ink-900">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
              {user ? user.name[0] : "?"}
            </span>
            {user ? "Account" : "Sign In"}
          </Link>
        </div>
      </header>
    </div>
  );
}
