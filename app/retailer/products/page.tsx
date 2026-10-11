"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Archive, ArchiveRestore, Edit2, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";
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

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

export default function RetailerProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useApiQuery<RetailerProductsResponse>(`/products/mine?_r=${refreshKey}`);
  const rows = useMemo(() => data?.items ?? [], [data]);
  const summary = data?.summary ?? { all: 0, active: 0, draft: 0, archived: 0 };

  const [tab, setTab] = useState<"all" | "active" | "draft" | "archived">("all");
  const [query, setQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const tabs = [
    { key: "all" as const, label: "All", count: summary.all },
    { key: "active" as const, label: "Active", count: summary.active },
    { key: "draft" as const, label: "Draft", count: summary.draft },
    { key: "archived" as const, label: "Archived", count: summary.archived },
  ];

  const archiveToggle = async (row: RetailerCatalogRow) => {
    const archiving = row.status !== "Archived";
    try {
      await api.patch(`/products/mine/${row.id}`, { status: archiving ? "ARCHIVED" : "DRAFT" });
      toast({ title: archiving ? "Product archived" : "Product restored to draft", variant: "success" });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: "Couldn't update this product — try again", variant: "error" });
    }
  };

  const deleteProduct = async (row: RetailerCatalogRow) => {
    if (!window.confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/mine/${row.id}`);
      toast({ title: "Product deleted", variant: "success" });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: "Couldn't delete this product — try again", variant: "error" });
    }
  };

  const columns = useMemo<ColumnDef<RetailerCatalogRow>[]>(
    () => [
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="More actions">
                  <MoreVertical className="size-4 hover:text-primary-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push(`/retailer/products/${row.original.id}/edit`)}>
                  <Edit2 className="size-4" /> Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => archiveToggle(row.original)}>
                  {row.original.status === "Archived" ? (
                    <>
                      <ArchiveRestore className="size-4" /> Restore to Draft
                    </>
                  ) : (
                    <>
                      <Archive className="size-4" /> Archive
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={() => deleteProduct(row.original)}>
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "active") list = list.filter((p) => p.status === "Active" || p.status === "Low Stock");
    if (tab === "draft") list = list.filter((p) => p.status === "Draft");
    if (tab === "archived") list = list.filter((p) => p.status === "Archived");
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;
    if (min !== undefined) list = list.filter((p) => p.price >= min);
    if (max !== undefined) list = list.filter((p) => p.price <= max);
    if (stockFilter === "in-stock") list = list.filter((p) => p.stock > 3);
    if (stockFilter === "low-stock") list = list.filter((p) => p.stock > 0 && p.stock <= 3);
    if (stockFilter === "out-of-stock") list = list.filter((p) => p.stock === 0);
    return list;
  }, [rows, tab, query, priceMin, priceMax, stockFilter]);

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

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-md border border-cream-300 bg-white p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-900">Min Price (₹)</label>
          <Input type="number" min={0} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="h-9 w-28" placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-900">Max Price (₹)</label>
          <Input type="number" min={0} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="h-9 w-28" placeholder="Any" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-900">Stock</label>
          <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock (≤3)</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(priceMin || priceMax || stockFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setPriceMin("");
              setPriceMax("");
              setStockFilter("all");
            }}
            className="h-9 text-xs font-semibold text-primary-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={8} emptyMessage="No products match this filter." />}
    </RetailerShell>
  );
}
