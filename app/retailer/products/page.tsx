"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Plus, Search } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatINR, cn } from "@/lib/utils";

interface RetailerCatalogRow {
  id: string;
  imageUrl: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  orders: number;
}
interface RetailerProductsResponse {
  items: RetailerCatalogRow[];
  summary: { all: number; active: number; draft: number; archived: number };
}

const columns: ColumnDef<RetailerCatalogRow>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="relative size-10 overflow-hidden rounded-sm">
        <Image src={row.original.imageUrl} alt="" fill sizes="40px" className="object-cover" />
      </div>
    ),
  },
  { accessorKey: "name", header: "Product Name", cell: ({ row }) => <span className="font-medium text-ink-900">{row.original.name}</span> },
  { accessorKey: "collection", header: "Collection" },
  { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
  { accessorKey: "stock", header: "Stock", cell: ({ row }) => `${row.original.stock} units` },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status} /> },
  { accessorKey: "orders", header: "Orders" },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-ink-500">
        <Link href={`/retailer/products/${row.original.id}/edit`} aria-label="Edit">
          <Edit2 className="size-4 hover:text-primary-600" />
        </Link>
        <button type="button" aria-label="More"><MoreVertical className="size-4 hover:text-primary-600" /></button>
      </div>
    ),
  },
];

export default function RetailerProductsPage() {
  const { data, loading } = useApiQuery<RetailerProductsResponse>("/products/mine");
  const rows = useMemo(() => data?.items ?? [], [data]);
  const summary = data?.summary ?? { all: 0, active: 0, draft: 0, archived: 0 };

  const [tab, setTab] = useState<"all" | "active" | "draft" | "archived">("all");
  const [query, setQuery] = useState("");

  const tabs = [
    { key: "all" as const, label: "All", count: summary.all },
    { key: "active" as const, label: "Active", count: summary.active },
    { key: "draft" as const, label: "Draft", count: summary.draft },
    { key: "archived" as const, label: "Archived", count: summary.archived },
  ];

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "active") list = list.filter((p) => p.status === "Active" || p.status === "Low Stock");
    if (tab === "draft") list = list.filter((p) => p.status === "Draft");
    if (tab === "archived") list = list.filter((p) => p.status === "Archived");
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [rows, tab, query]);

  return (
    <RetailerShell title="Products" subtitle="Manage and showcase your exquisite Ilkal masterpieces.">
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/retailer/products/new">
            <Plus className="size-4" /> Add Product
          </Link>
        </Button>
      </div>

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
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product catalog..."
            className="h-10 w-72 rounded-sm border border-cream-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={8} emptyMessage="No products match this filter." />}
    </RetailerShell>
  );
}
