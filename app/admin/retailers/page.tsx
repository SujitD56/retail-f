"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Search, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { cn, formatDate } from "@/lib/utils";

type ModerateAction = "approve" | "reject" | "suspend" | "reinstate";
const STATUS_AFTER_ACTION: Record<ModerateAction, AdminRetailerRow["status"]> = {
  approve: "Verified",
  reject: "Rejected",
  suspend: "Suspended",
  reinstate: "Verified",
};

interface AdminRetailerRow {
  id: string;
  slug: string;
  name: string;
  weaverId: string;
  status: "Verified" | "Pending" | "Rejected" | "Suspended";
  location: string;
  productsListed: number;
  ordersServiced: number;
  rating: number;
  joinedDate: string;
}
interface AdminRetailersResponse {
  items: AdminRetailerRow[];
  summary: { all: number; verified: number; pending: number; suspended: number };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function buildColumns(moderate: (id: string, action: ModerateAction) => void): ColumnDef<AdminRetailerRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Retailer Name & Weaver ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
            {initials(row.original.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">{row.original.name}</p>
            <p className="text-xs text-ink-500">{row.original.weaverId}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status} /> },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "productsListed", header: "Products Listed", cell: ({ row }) => `${row.original.productsListed} items` },
    { accessorKey: "ordersServiced", header: "Orders Serviced" },
    {
      accessorKey: "rating",
      header: "Avg Rating",
      cell: ({ row }) =>
        row.original.rating > 0 ? (
          <span className="flex items-center gap-1 font-medium text-ink-900">
            <Star className="size-3.5 fill-gold-400 text-gold-400" /> {row.original.rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-ink-500">—</span>
        ),
    },
    { accessorKey: "joinedDate", header: "Joined Date", cell: ({ row }) => formatDate(row.original.joinedDate) },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const { id, slug, status } = row.original;
        return (
          <div className="flex items-center gap-2">
            <a href={`/retailers/${slug}`} target="_blank" rel="noopener noreferrer" aria-label="View retailer profile" className="text-ink-500 hover:text-primary-600">
              <Eye className="size-4" />
            </a>
            {status === "Pending" && (
              <>
                <Button size="sm" onClick={() => moderate(id, "approve")}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => moderate(id, "reject")}>
                  Reject
                </Button>
              </>
            )}
            {status === "Verified" && (
              <Button size="sm" variant="danger" onClick={() => moderate(id, "suspend")}>
                Deactivate
              </Button>
            )}
            {status === "Suspended" && (
              <Button size="sm" onClick={() => moderate(id, "reinstate")}>
                Activate
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

export default function AdminRetailersPage() {
  const { data, loading } = useApiQuery<AdminRetailersResponse>("/retailers/admin");
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Record<string, AdminRetailerRow["status"]>>({});
  const rows = useMemo(
    () => (data?.items ?? []).map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id]! } : r)),
    [data, overrides],
  );
  const summary = data?.summary ?? { all: 0, verified: 0, pending: 0, suspended: 0 };

  const [tab, setTab] = useState<"all" | "verified" | "pending" | "suspended">("all");
  const [query, setQuery] = useState("");

  async function moderate(id: string, action: ModerateAction) {
    try {
      await api.patch(`/retailers/admin/${id}/moderate`, { action });
      setOverrides((prev) => ({ ...prev, [id]: STATUS_AFTER_ACTION[action] }));
      const messages: Record<ModerateAction, string> = {
        approve: "Retailer approved",
        reject: "Retailer rejected",
        suspend: "Retailer deactivated",
        reinstate: "Retailer activated",
      };
      toast({ title: messages[action], variant: action === "approve" || action === "reinstate" ? "success" : undefined });
    } catch {
      toast({ title: "Couldn't update this retailer — try again", variant: "error" });
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => buildColumns(moderate), []);

  const tabs = [
    { key: "all" as const, label: "All", count: summary.all },
    { key: "verified" as const, label: "Verified", count: summary.verified },
    { key: "pending" as const, label: "Pending Action", count: summary.pending },
    { key: "suspended" as const, label: "Suspended", count: summary.suspended },
  ];

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "verified") list = list.filter((r) => r.status === "Verified");
    if (tab === "pending") list = list.filter((r) => r.status === "Pending");
    if (tab === "suspended") list = list.filter((r) => r.status === "Suspended");
    if (query) list = list.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [rows, tab, query]);

  return (
    <AdminShell title="Retailer Management" subtitle="Vet credentials, approve payouts, and manage verified handloom stores globally.">
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
            placeholder="Search registered weavers..."
            className="h-10 w-72 rounded-sm border border-cream-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : <DataTable columns={columns} data={filtered} pageSize={8} emptyMessage="No retailers match this filter." />}
    </AdminShell>
  );
}
