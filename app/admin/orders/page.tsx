"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Calendar, CheckCircle2, ChevronDown, Eye, MoreVertical, Package, RotateCcw, Search, Truck } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatDate, formatINR } from "@/lib/utils";

interface AdminOrderRow {
  id: string;
  orderId: string;
  customer: string;
  customerEmail: string;
  retailer: string;
  itemCount: number;
  total: number;
  paymentStatus: "Paid" | "COD" | "Failed";
  fulfillmentStatus: "Confirmed" | "Shipped" | "Delivered" | "Pending" | "Cancelled";
  orderDate: string;
}
interface AdminStats {
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
}

const columns: ColumnDef<AdminOrderRow>[] = [
  { accessorKey: "orderId", header: "Order ID", cell: ({ row }) => <span className="font-medium text-ink-900">{row.original.orderId}</span> },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "retailer", header: "Retailer Store" },
  { accessorKey: "itemCount", header: "Products", cell: ({ row }) => `${row.original.itemCount} items` },
  { accessorKey: "total", header: "Total Amount", cell: ({ row }) => formatINR(row.original.total) },
  { accessorKey: "paymentStatus", header: "Payment Status", cell: ({ row }) => <StatusPill status={row.original.paymentStatus} /> },
  { accessorKey: "fulfillmentStatus", header: "Fulfillment Status", cell: ({ row }) => <StatusPill status={row.original.fulfillmentStatus} /> },
  { accessorKey: "orderDate", header: "Order Date", cell: ({ row }) => formatDate(row.original.orderDate) },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-ink-500">
        <Link href={`/admin/orders/${row.original.id}`} aria-label="View order details" className="hover:text-primary-600">
          <Eye className="size-4" />
        </Link>
        <button type="button" aria-label="More"><MoreVertical className="size-4 hover:text-primary-600" /></button>
      </div>
    ),
  },
];

function statusCount(stats: AdminStats | null, status: string) {
  return stats?.ordersByStatus.find((s) => s.status === status)?.count ?? 0;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="m-10 h-96" />}>
      <AdminOrdersPageContent />
    </Suspense>
  );
}

function AdminOrdersPageContent() {
  const searchParams = useSearchParams();
  const { data, loading } = useApiQuery<{ items: AdminOrderRow[] }>("/orders/admin?pageSize=200");
  const { data: stats } = useApiQuery<AdminStats>("/admin/stats");
  const rows = useMemo(() => data?.items ?? [], [data]);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (o) => o.orderId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const total = stats?.totalOrders ?? 0;
  const shippedOrTransit = statusCount(stats, "shipped") + statusCount(stats, "in transit");
  const delivered = statusCount(stats, "delivered");
  const cancelled = statusCount(stats, "cancelled");
  const processing = statusCount(stats, "processing");
  const deliveredPct = total > 0 ? ((delivered / total) * 100).toFixed(1) : "0";
  const cancelledPct = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0";

  const statCards = [
    { label: "Total Orders", value: `${total.toLocaleString("en-IN")} Complete`, change: "100%", note: "since inception", icon: Package },
    { label: "Processing", value: `${processing.toLocaleString("en-IN")} Pending`, change: "Needs dispatch", note: "weaver action needed", icon: Package },
    { label: "In Transit", value: `${shippedOrTransit.toLocaleString("en-IN")} Shipments`, change: "On road", note: "shipped + in transit", icon: Truck },
    { label: "Delivered Safely", value: `${delivered.toLocaleString("en-IN")} Orders`, change: `${deliveredPct}%`, note: "successful fulfillment", icon: CheckCircle2 },
    { label: "Cancelled", value: `${cancelled.toLocaleString("en-IN")} Orders`, change: `${cancelledPct}%`, note: "cancellation rate", icon: RotateCcw },
  ];

  return (
    <AdminShell title="Order Management" subtitle="Monitor global handicraft sales and coordinate weaver logistics.">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {stats
          ? statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-cream-300 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink-700">{s.label}</p>
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-4 font-display text-2xl text-ink-900">{s.value}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-sm bg-cream-200 px-1.5 py-0.5 font-semibold text-ink-700">{s.change}</span>
                    <span className="text-ink-500">{s.note}</span>
                  </div>
                </div>
              );
            })
          : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>

      <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" className="flex h-10 items-center gap-2 rounded-sm border border-cream-300 bg-white px-4 text-sm font-medium text-ink-700">
            Status: All Orders <ChevronDown className="size-3.5" />
          </button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-sm border border-cream-300 bg-white px-4 text-sm font-medium text-ink-700">
            <Calendar className="size-3.5" /> Date: All Time
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order # or customer..."
            className="h-10 w-72 rounded-sm border border-cream-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={8} emptyMessage="No orders match this search." />}
    </AdminShell>
  );
}
