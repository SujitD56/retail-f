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
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UserCircle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

interface LowStockItem { category: string; product: string; unitsLeft: number }
interface RetailerOrderRow { id: string; customer: string; shipStatus: string }

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Real alerts derived from the retailer's own data — no hand-authored notifications. */
function useRetailerNotifications() {
  const { data: lowStock } = useApiQuery<{ items: LowStockItem[] }>("/retailers/stats/low-stock");
  const { data: orders } = useApiQuery<{ items: RetailerOrderRow[] }>("/orders/retailer/mine");

  const stockAlerts = (lowStock?.items ?? []).map((item) => ({
    id: `stock-${item.product}`,
    text: item.unitsLeft === 0 ? `${item.product} is out of stock` : `${item.product} has only ${item.unitsLeft} left`,
    href: "/retailer/products",
  }));
  const orderAlerts = (orders?.items ?? []).slice(0, 5).map((o) => ({
    id: `order-${o.id}`,
    text: `Order #${o.id} — ${o.customer} (${o.shipStatus})`,
    href: "/retailer/orders",
  }));
  return [...stockAlerts, ...orderAlerts].slice(0, 8);
}

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
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notifications = useRetailerNotifications();

  const handleLogout = async () => {
    await logout();
    router.push("/retailer/login");
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Notifications" className="relative text-ink-700 hover:text-primary-600">
                  <Bell className="size-5" />
                  {notifications.length > 0 && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary-600" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2.5 py-4 text-center text-sm text-ink-500">You&rsquo;re all caught up.</p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} onSelect={() => router.push(n.href)} className="whitespace-normal">
                      {n.text}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="hidden h-6 w-px bg-cream-300 sm:block" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-3 rounded-sm text-left hover:opacity-80">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-200 font-semibold text-ink-900">
                    {initials(user?.name ?? "Retailer")}
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-ink-900">{user?.name ?? "Retailer"}</p>
                    <p className="text-xs text-ink-500">Store Manager</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.email && <DropdownMenuLabel>{user.email}</DropdownMenuLabel>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/retailer/settings")}>
                  <UserCircle className="size-4" /> View / Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={handleLogout}>
                  <LogOut className="size-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
