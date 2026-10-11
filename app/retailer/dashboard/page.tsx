"use client";

import Link from "next/link";
import { AlertTriangle, BarChart2, ExternalLink, FolderPlus, Plus, ShoppingBag, Star as StarIcon, Truck, Users } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { StatCard } from "@/components/retailer/stat-card";
import { SalesChart } from "@/components/retailer/sales-chart";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate, formatINR } from "@/lib/utils";

interface DashboardStats { totalSales: number; orders: number; activeProducts: number; customers: number; avgRating: number }
interface RetailerOrderRow { id: string; customer: string; product: string; amount: number; shipStatus: string; date: string }
interface LowStockItem { category: string; product: string; unitsLeft: number }

export default function RetailerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useApiQuery<DashboardStats>("/retailers/stats/dashboard");
  const { data: trend } = useApiQuery<{ items: { label: string; value: number }[] }>("/retailers/stats/sales-trend");
  const { data: orders } = useApiQuery<{ items: RetailerOrderRow[] }>("/orders/retailer/mine");
  const { data: lowStock } = useApiQuery<{ items: LowStockItem[] }>("/retailers/stats/low-stock");

  const recentOrders = (orders?.items ?? []).slice(0, 5);

  return (
    <RetailerShell title={`Welcome back, ${user?.name ?? "Retailer"}`} subtitle="Here is what is happening with your handloom store today.">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {stats ? (
          <>
            <StatCard label="Total Sales" value={formatINR(stats.totalSales)} icon={BarChart2} href="/retailer/analytics" />
            <StatCard label="Orders" value={String(stats.orders)} icon={ShoppingBag} href="/retailer/orders" />
            <StatCard label="Active Products" value={String(stats.activeProducts)} icon={ShoppingBag} href="/retailer/products" />
            <StatCard label="Customers" value={stats.customers.toLocaleString("en-IN")} icon={Users} href="/retailer/analytics" />
            <StatCard label="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating} ★` : "—"} icon={StarIcon} href="/retailer/analytics" />
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <div>
            <p className="font-display text-xl text-ink-900">Sales Revenue (Last 12 Weeks)</p>
            <p className="text-sm text-ink-500">Real revenue from your completed order line items.</p>
          </div>
          <div className="mt-6">
            {trend ? <SalesChart data={trend.items} /> : <Skeleton className="h-64 w-full" />}
          </div>
        </div>

        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Quick Actions</p>
          <div className="mt-4 flex flex-col gap-1">
            <QuickAction href="/retailer/products/new" icon={Plus} label="Add New Product" />
            <QuickAction href="/retailer/collections" icon={FolderPlus} label="Create Collection" />
            <QuickAction href="/retailer/settings" icon={ExternalLink} label="View Public Storefront" />
            <QuickAction href="/retailer/orders" icon={Truck} label="Manage Active Orders" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl text-ink-900">Recent Orders</p>
            <Link href="/retailer/orders" className="text-sm font-semibold text-primary-600">
              View All Orders
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            {!orders ? (
              <Skeleton className="h-48 w-full" />
            ) : recentOrders.length === 0 ? (
              <p className="py-6 text-sm text-ink-500">No orders yet.</p>
            ) : (
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-cream-300 text-left text-xs uppercase text-ink-500">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-cream-300 last:border-0">
                      <td className="py-3 font-medium text-ink-900">#{o.id}</td>
                      <td className="py-3 text-ink-700">{o.customer}</td>
                      <td className="py-3 text-ink-900">{formatINR(o.amount)}</td>
                      <td className="py-3">
                        <StatusPill status={o.shipStatus} />
                      </td>
                      <td className="py-3 text-ink-500">{formatDate(o.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <div className="flex items-center gap-2">
            <p className="font-display text-xl text-ink-900">Low Stock Alerts</p>
            <AlertTriangle className="size-4 text-warning-500" />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {!lowStock ? (
              <Skeleton className="h-24 w-full" />
            ) : lowStock.items.length === 0 ? (
              <p className="text-sm text-ink-500">All stocked up — nothing below 3 units.</p>
            ) : (
              lowStock.items.map((item) => (
                <div key={item.product} className="rounded-md border border-cream-300 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-medium text-ink-500">{item.category}</span>
                    <span className={`shrink-0 whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-semibold ${item.unitsLeft === 0 ? "bg-danger-50 text-danger-500" : "bg-warning-50 text-warning-500"}`}>
                      {item.unitsLeft} left
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-900">{item.product}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RetailerShell>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Plus; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-cream-100">
      <Icon className="size-4 text-primary-600" />
      {label}
    </Link>
  );
}
