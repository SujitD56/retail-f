"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ChevronDown, Eye, MoreVertical, Search, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { cn, formatINR } from "@/lib/utils";

type AdminLifecycleStatus = "DRAFT" | "ACTIVE" | "UNDER_REVIEW" | "ARCHIVED";

interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  sku: string;
  retailer: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  rating: number;
  imageUrl: string;
  orders: number;
}

function buildColumns(moderate: (id: string, status: AdminLifecycleStatus) => void): ColumnDef<AdminProductRow>[] {
  return [
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
    {
      accessorKey: "name",
      header: "Product Name & Sku",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-ink-900">{row.original.name}</p>
          <p className="text-xs text-ink-500">SKU: {row.original.sku}</p>
        </div>
      ),
    },
    { accessorKey: "retailer", header: "Retailer Store" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
    { accessorKey: "stock", header: "Stock", cell: ({ row }) => `${row.original.stock} unit${row.original.stock === 1 ? "" : "s"}` },
    { accessorKey: "status", header: "Status Tag", cell: ({ row }) => <StatusPill status={row.original.status} /> },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) =>
        row.original.rating > 0 ? (
          <span className="flex items-center gap-1 font-medium text-ink-900">
            {row.original.rating.toFixed(1)} <Star className="size-3.5 fill-gold-400 text-gold-400" />
          </span>
        ) : (
          <span className="text-ink-500">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const { id, slug, status } = row.original;
        return (
          <div className="flex items-center gap-3 text-ink-500">
            <a href={`/product/${slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on storefront" className="hover:text-primary-600">
              <Eye className="size-4" />
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="More actions">
                  <MoreVertical className="size-4 hover:text-primary-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {status === "Draft" && (
                  <>
                    <DropdownMenuItem onSelect={() => moderate(id, "ACTIVE")}>Activate</DropdownMenuItem>
                    <DropdownMenuItem destructive onSelect={() => moderate(id, "ARCHIVED")}>Archive</DropdownMenuItem>
                  </>
                )}
                {status === "Under Review" && (
                  <>
                    <DropdownMenuItem onSelect={() => moderate(id, "ACTIVE")}>Approve &amp; Activate</DropdownMenuItem>
                    <DropdownMenuItem destructive onSelect={() => moderate(id, "ARCHIVED")}>Reject &amp; Archive</DropdownMenuItem>
                  </>
                )}
                {(status === "Active" || status === "Low Stock" || status === "Out of Stock") && (
                  <>
                    <DropdownMenuItem onSelect={() => moderate(id, "UNDER_REVIEW")}>Flag for Review</DropdownMenuItem>
                    <DropdownMenuItem destructive onSelect={() => moderate(id, "ARCHIVED")}>Archive Listing</DropdownMenuItem>
                  </>
                )}
                {status === "Archived" && <DropdownMenuItem onSelect={() => moderate(id, "DRAFT")}>Restore to Draft</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useApiQuery<{ items: AdminProductRow[]; total: number }>(`/products/admin?pageSize=200&_r=${refreshKey}`);
  const rows = useMemo(() => data?.items ?? [], [data]);

  const [tab, setTab] = useState<"all" | "active" | "audit" | "reported">("all");
  const [query, setQuery] = useState("");

  const moderate = async (id: string, status: AdminLifecycleStatus) => {
    try {
      await api.patch(`/products/admin/${id}/status`, { status });
      toast({ title: "Product listing updated", variant: "success" });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: "Couldn't update this listing — try again", variant: "error" });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => buildColumns(moderate), []);

  const tabs = useMemo(
    () => [
      { key: "all" as const, label: "All Listings", count: rows.length },
      { key: "active" as const, label: "Active", count: rows.filter((p) => p.status === "Active").length },
      { key: "audit" as const, label: "Under Audit", count: rows.filter((p) => p.status === "Under Review").length },
      { key: "reported" as const, label: "Low/Out of Stock", count: rows.filter((p) => p.status === "Out of Stock" || p.status === "Low Stock").length },
    ],
    [rows],
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "active") list = list.filter((p) => p.status === "Active");
    if (tab === "audit") list = list.filter((p) => p.status === "Under Review");
    if (tab === "reported") list = list.filter((p) => p.status === "Out of Stock" || p.status === "Low Stock");
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [rows, tab, query]);

  const underAuditCount = tabs.find((t) => t.key === "audit")?.count ?? 0;

  return (
    <AdminShell title="Product Management" subtitle="Moderate global product listings and handle flagged item complaints.">
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
        <div className="flex items-center gap-3">
          <button type="button" className="flex h-10 items-center gap-2 rounded-sm border border-cream-300 bg-white px-4 text-sm font-medium text-ink-700">
            Filter: All Saree Types <ChevronDown className="size-3.5" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entire master catalog..."
              className="h-10 w-72 rounded-sm border border-cream-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {underAuditCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-warning-500/20 bg-warning-50 px-4 py-3">
          <AlertTriangle className="size-4 shrink-0 text-warning-500" />
          <p className="flex-1 text-sm text-ink-700">{underAuditCount} product{underAuditCount === 1 ? "" : "s"} flagged for manual review.</p>
          <button type="button" onClick={() => setTab("audit")} className="shrink-0 text-sm font-semibold text-primary-600 hover:underline">
            Go to Audits
          </button>
        </div>
      )}

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={8} emptyMessage="No products match this filter." />}
    </AdminShell>
  );
}
