"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Bell, Settings as SettingsIcon, Star } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useOrdersStore } from "@/lib/store/orders";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useSavedRetailersStore } from "@/lib/store/saved-retailers";
import { api } from "@/lib/api/client";
import { AccountSidebarNav, type AccountTab } from "@/components/customer/account/sidebar-nav";
import { ProfilePanel } from "@/components/customer/account/profile-panel";
import { OrdersPanel } from "@/components/customer/account/orders-panel";
import { AccountPlaceholderPanel } from "@/components/customer/account/placeholder-panel";
import { AddressesPanel } from "@/components/customer/account/addresses-panel";
import { WishlistGrid } from "@/components/customer/wishlist-grid";
import { RetailerCard } from "@/components/customer/retailer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/hooks/use-mounted";
import type { Order, Product, Retailer } from "@/types";

export default function AccountPage() {
  const mounted = useMounted();
  const [tab, setTab] = useState<AccountTab>("Profile");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getAllOrders = useOrdersStore((s) => s.getAllOrders);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const savedRetailerIds = useSavedRetailersStore((s) => s.retailerIds);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [allRetailers, setAllRetailers] = useState<Retailer[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!mounted || !user) return;
    getAllOrders().then(setOrders);
    Promise.all([api.get<{ items: Retailer[] }>("/retailers"), api.get<{ items: Product[] }>("/products?pageSize=100")]).then(
      ([{ items: r }, { items: p }]) => {
        setAllRetailers(r);
        setAllProducts(p);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="flex flex-col gap-8 px-5 py-20 sm:px-10 lg:px-20">
        <EmptyState
          icon={Award}
          title="Sign in to view your account"
          description="Track orders, manage your wishlist, and follow your favorite retailers."
          actionLabel="Sign In"
          actionHref="/login"
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  const savedRetailers = allRetailers.filter((r) => savedRetailerIds.includes(r.id));

  return (
    <div className="flex flex-col gap-8 px-5 py-10 sm:px-10 lg:flex-row lg:px-20">
      <AccountSidebarNav
        active={tab}
        onChange={setTab}
        onLogout={async () => {
          await logout();
          router.push("/");
        }}
      />

      {tab === "Profile" &&
        (orders === null ? (
          <Skeleton className="h-96 flex-1" />
        ) : (
          <ProfilePanel
            user={user}
            ordersCount={orders.length}
            wishlistCount={wishlistCount}
            savedRetailersCount={savedRetailers.length}
            recentOrders={orders.slice(0, 3)}
          />
        ))}
      {tab === "Orders" && (orders === null ? <Skeleton className="h-96 flex-1" /> : <OrdersPanel orders={orders} />)}
      {tab === "Wishlist" && (
        <div className="flex-1">
          <WishlistGrid />
        </div>
      )}
      {tab === "Saved Retailers" && (
        <div className="flex-1">
          {savedRetailers.length === 0 ? (
            <EmptyState icon={Award} title="No saved retailers yet" description="Follow retailer storefronts to see them here." actionLabel="Explore Retailers" actionHref="/retailers" />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {savedRetailers.map((r) => (
                <RetailerCard key={r.id} retailer={r} previewProducts={allProducts.filter((p) => p.retailerId === r.id)} />
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "Addresses" && <AddressesPanel />}
      {tab === "Reviews" && (
        <AccountPlaceholderPanel icon={Star} title="No reviews yet" description="Reviews you write for delivered orders will appear here." />
      )}
      {tab === "Notifications" && (
        <AccountPlaceholderPanel icon={Bell} title="You're all caught up" description="Order updates and weaver drop announcements will show up here." />
      )}
      {tab === "Settings" && (
        <div className="flex flex-1 flex-col gap-4 rounded-lg border border-cream-300 bg-white p-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="size-5 text-primary-600" />
            <h2 className="font-display text-2xl text-primary-600">Settings</h2>
          </div>
          <p className="text-sm text-ink-700">Signed in as {user.email}</p>
          <Button
            variant="danger"
            className="w-fit"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Sign out of Ilkal Threads
          </Button>
        </div>
      )}
    </div>
  );
}
