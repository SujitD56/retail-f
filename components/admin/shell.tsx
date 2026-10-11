"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  Folder,
  Gauge,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Ticket,
  Users,
  UsersRound,
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
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid, active: true },
  { label: "Retailers", href: "/admin/retailers", icon: Users, active: true },
  { label: "Customers", href: "/admin/customers", icon: UsersRound, active: true },
  { label: "Products", href: "/admin/products", icon: Package, active: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, active: true },
  { label: "Events", href: "/admin/events", icon: ClipboardList, active: true },
  { label: "Categories", href: "#", icon: Tag, active: false },
  { label: "Collections", href: "#", icon: Folder, active: false },
  { label: "Reviews", href: "#", icon: Star, active: false },
  { label: "Coupons", href: "#", icon: Ticket, active: false },
  { label: "Promotions", href: "#", icon: Megaphone, active: false },
  { label: "Reports", href: "#", icon: Gauge, active: false },
  { label: "Settings", href: "#", icon: Settings, active: false },
];

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const sidebar = (
    <>
      <div className="flex flex-col gap-1 p-5 pt-6">
        <div className="flex items-center justify-between px-1 pb-5">
          <div className="flex flex-col gap-1.5">
            <Image src="/images/brand/kaushaya-logo-sm.png" alt="Kaushaya" width={160} height={90} className="h-14 w-auto object-contain" />
            <p className="flex items-center gap-2 text-xs text-ink-500">
              Platform Admin <span className="h-3 w-px bg-cream-300" /> v3.2 Stable
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
          const current = item.active && (pathname === item.href || pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (!item.active) {
                  e.preventDefault();
                  return;
                }
                setMobileNavOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3.5 py-2 text-sm font-medium",
                current ? "bg-primary-600 text-white" : item.active ? "text-ink-900 hover:bg-cream-100" : "text-ink-300 cursor-not-allowed",
              )}
              aria-disabled={!item.active}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-cream-300 p-5">
        <button type="button" className="flex items-center gap-2 text-sm text-ink-700 hover:text-primary-600">
          <HelpCircle className="size-4" /> Documentation &amp; Support
        </button>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
            {initials(user?.name ?? "Admin")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-ink-500">Super Administrator</p>
          </div>
        </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-3 rounded-sm text-left hover:opacity-80">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-200 font-semibold text-ink-900">
                    {initials(user?.name ?? "Admin")}
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-ink-900">{user?.name ?? "Admin"}</p>
                    <p className="text-xs text-ink-500">HQ Admin</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.email && <DropdownMenuLabel>{user.email}</DropdownMenuLabel>}
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
