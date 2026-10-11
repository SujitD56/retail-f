"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useSavedRetailersStore } from "@/lib/store/saved-retailers";
import { useAuthStore } from "@/lib/store/auth";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Sarees", href: "/sarees" },
  { label: "Collections", href: "/collections/handpicked-ilkal" },
  { label: "Retailers", href: "/retailers" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Trending", href: "/trending" },
];

export function Navbar() {
  const mounted = useMounted();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const savedRetailersCount = useSavedRetailersStore((s) => s.retailerIds.length);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-white">
      <div className="mx-auto flex h-[108px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-10 lg:px-20">
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="lg:hidden text-ink-900"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link href="/" className="flex items-center">
            <Image src="/images/brand/kaushaya-logo.png" alt="Kaushaya" width={280} height={156} className="h-24 w-auto object-contain" priority />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-900 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-primary-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
          }}
          className="hidden flex-1 max-w-[280px] items-center gap-2 rounded-pill border border-cream-300 bg-cream-100 px-4 h-10 md:flex"
        >
          <Search className="size-4 shrink-0 text-ink-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sarees, weavers, patterns..."
            className="w-full bg-transparent text-[13px] text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/wishlist" aria-label="Wishlist" className="relative text-ink-900 hover:text-primary-600">
            <Heart className="size-5" />
            {mounted && user && wishlistCount + savedRetailersCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
                {wishlistCount + savedRetailersCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-pill bg-cream-100 text-ink-900 hover:text-primary-600"
          >
            <ShoppingBag className="size-[18px]" />
            {mounted && user && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-md bg-primary-600 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {mounted && user ? (
            <Link href="/account" className="flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-primary-600">
              <User className="size-5" />
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-primary-600">
              <User className="size-5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      <div className={cn("border-t border-cream-300 bg-white lg:hidden", mobileOpen ? "block" : "hidden")}>
        <nav className="flex flex-col gap-1 px-5 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-sm px-2 py-2.5 text-sm font-medium text-ink-900 hover:bg-cream-100"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
