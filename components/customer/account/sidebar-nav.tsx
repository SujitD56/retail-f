"use client";

import { Award, Bell, Heart, LogOut, MapPin, Settings, ShoppingBag, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const ACCOUNT_TABS = ["Profile", "Orders", "Wishlist", "Saved Retailers", "Addresses", "Reviews", "Notifications", "Settings"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

const ICONS: Record<AccountTab, typeof User> = {
  Profile: User,
  Orders: ShoppingBag,
  Wishlist: Heart,
  "Saved Retailers": Award,
  Addresses: MapPin,
  Reviews: Star,
  Notifications: Bell,
  Settings: Settings,
};

export function AccountSidebarNav({
  active,
  onChange,
  onLogout,
}: {
  active: AccountTab;
  onChange: (tab: AccountTab) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 rounded-lg border border-cream-300 bg-white p-5 lg:w-[260px]">
      {ACCOUNT_TABS.map((tab) => {
        const Icon = ICONS[tab];
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "flex items-center gap-3 rounded-sm px-4 py-2.5 text-left text-sm font-medium",
              active === tab ? "bg-primary-600 text-white" : "text-ink-900 hover:bg-cream-100",
            )}
          >
            <Icon className="size-4" />
            {tab}
          </button>
        );
      })}
      <div className="my-2 h-px bg-cream-300" />
      <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-sm px-4 py-2.5 text-left text-sm font-medium text-danger-500 hover:bg-danger-50">
        <LogOut className="size-4" />
        Logout
      </button>
    </aside>
  );
}
