"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  Bell,
  Calendar,
  Folder,
  HelpCircle,
  LayoutGrid,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/retailer/dashboard", icon: LayoutGrid },
  { label: "Products", href: "/retailer/products", icon: Package },
  { label: "Collections", href: "/retailer/collections", icon: Folder },
  { label: "Orders", href: "/retailer/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/retailer/analytics", icon: BarChart2 },
  { label: "Events", href: "/retailer/events", icon: Calendar },
  { label: "Store Settings", href: "/retailer/settings", icon: Settings },
];

export function RetailerShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex flex-col gap-2 p-5 pt-6">
        <div className="flex items-center justify-between px-1 pb-6">
          <div className="flex flex-col gap-1.5">
            <Image src="/images/brand/kaushaya-logo-sm.png" alt="Kaushaya" width={160} height={90} className="h-14 w-auto object-contain" />
            <p className="flex items-center gap-2 text-xs text-ink-500">
              Retailer Portal <span className="h-3 w-px bg-cream-300" /> Partner v2.6
            </p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="text-ink-700 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-sm font-medium",
                active ? "bg-primary-600 text-white" : "text-ink-900 hover:bg-cream-100",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-cream-300 p-5">
        <button type="button" className="flex items-center gap-2 text-sm text-ink-700 hover:text-primary-600">
          <HelpCircle className="size-4" /> Help &amp; Documentation
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileNavOpen(false);
            router.push("/retailer/settings");
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-sm py-2 text-left hover:bg-cream-100"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-sm font-semibold text-primary-600">
            LS
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name ?? "Lakshmi Sarees"}</p>
            <p className="text-xs text-ink-500">Ilkal, KA • Verified</p>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Desktop sidebar — always visible at lg+, matches the previous fixed layout. */}
      <aside className="hidden w-[260px] shrink-0 flex-col justify-between border-r border-cream-300 bg-white lg:flex">
        {sidebar}
      </aside>

      {/* Mobile sidebar — off-canvas drawer, toggled by the header's menu button. */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex h-full w-[260px] max-w-[80vw] flex-col justify-between overflow-y-auto bg-white shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-auto min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-cream-300 bg-white px-4 py-3 sm:h-[88px] sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="text-ink-900 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="font-display text-lg text-ink-900 sm:text-2xl">{title}</h1>
              {subtitle && <p className="text-xs text-ink-500 sm:text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button type="button" aria-label="Notifications" className="relative text-ink-700">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary-600" />
            </button>
            <span className="hidden h-6 w-px bg-cream-300 sm:block" />
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-200 font-semibold text-ink-900">DS</span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-ink-900">Devappa Swamy</p>
                <p className="text-xs text-ink-500">Store Manager</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
