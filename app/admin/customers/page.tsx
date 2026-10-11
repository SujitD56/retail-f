"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Mail, ShoppingBag, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { cn, formatDate, formatINR } from "@/lib/utils";

interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  ordersCount: number;
  totalSpent: number;
}
interface AdminCustomersResponse {
  items: AdminCustomerRow[];
  summary: { all: number; withOrders: number; newThisMonth: number };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const columns: ColumnDef<AdminCustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
          {initials(row.original.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{row.original.name}</p>
          <p className="truncate text-xs text-ink-500">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || "—" },
  { accessorKey: "joinedDate", header: "Joined Date", cell: ({ row }) => formatDate(row.original.joinedDate) },
  { accessorKey: "ordersCount", header: "Orders" },
  { accessorKey: "totalSpent", header: "Total Spent", cell: ({ row }) => formatINR(row.original.totalSpent) },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-ink-500">
        <Link
          href={`/admin/orders?q=${encodeURIComponent(row.original.email)}`}
          aria-label={`View orders for ${row.original.name}`}
          className="hover:text-primary-600"
        >
          <ShoppingBag className="size-4" />
        </Link>
        <a href={`mailto:${row.original.email}`} aria-label={`Email ${row.original.name}`} className="hover:text-primary-600">
          <Mail className="size-4" />
        </a>
      </div>
    ),
  },
];

export default function AdminCustomersPage() {
  const { data, loading } = useApiQuery<AdminCustomersResponse>("/admin/customers");
  const rows = useMemo(() => data?.items ?? [], [data]);
  const summary = data?.summary ?? { all: 0, withOrders: 0, newThisMonth: 0 };

  const [tab, setTab] = useState<"all" | "withOrders" | "newThisMonth">("all");
  const [query, setQuery] = useState("");

  const tabs = [
    { key: "all" as const, label: "All Customers", count: summary.all },
    { key: "withOrders" as const, label: "With Orders", count: summary.withOrders },
    { key: "newThisMonth" as const, label: "New This Month", count: summary.newThisMonth },
  ];

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "withOrders") list = list.filter((c) => c.ordersCount > 0);
    if (tab === "newThisMonth") {
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      list = list.filter((c) => new Date(c.joinedDate) >= start);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return list;
  }, [rows, tab, query]);

  return (
    <AdminShell title="Customer Management" subtitle="View registered buyers across the Kaushaya marketplace.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-md border border-cream-300 bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-sm px-4 py-1.5 text-sm font-medium",
                tab === t.key ? "bg-primary-600 text-white" : "text-ink-700 hover:bg-cream-100",
              )}
            >
              {t.label} ({t.count.toLocaleString("en-IN")})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="h-10 w-72 rounded-sm border border-cream-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={10} emptyMessage="No customers match this filter." />}
    </AdminShell>
  );
}
