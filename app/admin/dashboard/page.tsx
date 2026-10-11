"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { SalesChart } from "@/components/retailer/sales-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  RETAILER: "bg-info-50 text-info-500",
  ORDER: "bg-success-50 text-success-500",
  PAYOUT: "bg-gold-50 text-gold-600",
  SYSTEM: "bg-cream-200 text-ink-700",
  REVIEW: "bg-primary-50 text-primary-600",
  EVENT: "bg-primary-50 text-primary-600",
};

interface OverviewCard { label: string; value: string; change: string; note: string }
interface PendingAction { title: string; action: string; detail: string; href: string }
interface ActivityEntry { type: string; message: string; time: string }
interface AdminStats { revenueTrend: { label: string; value: number }[] }

export default function AdminDashboardPage() {
  const { data: overview } = useApiQuery<{ items: OverviewCard[] }>("/admin/overview");
  const { data: pending } = useApiQuery<{ items: PendingAction[] }>("/admin/pending-actions");
  const { data: activity } = useApiQuery<{ items: ActivityEntry[] }>("/admin/activity?limit=10");
  const { data: stats } = useApiQuery<AdminStats>("/admin/stats");

  return (
    <AdminShell title="Kaushaya Admin" subtitle="Central administrative workspace for the handloom weaver platform.">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {overview ? (
          overview.items.map((s) => (
            <div key={s.label} className="rounded-lg border border-cream-300 bg-white p-5">
              <p className="text-xs text-ink-500">{s.label}</p>
              <p className="mt-2 font-display text-2xl text-ink-900">{s.value}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                {s.change && <span className="rounded-sm bg-success-50 px-1.5 py-0.5 font-semibold text-success-500">{s.change}</span>}
                <span className="text-ink-500">{s.note}</span>
              </div>
            </div>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Platform Revenue (Last 6 Months)</p>
          <p className="text-sm text-ink-500">Real revenue aggregated from placed orders, month over month.</p>
          <div className="mt-4">
            {stats ? <SalesChart data={stats.revenueTrend} /> : <Skeleton className="h-64 w-full" />}
          </div>
        </div>

        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Pending Action Desk</p>
          <div className="mt-4 flex flex-col gap-3">
            {pending && pending.items.length === 0 && <p className="text-sm text-ink-500">Nothing pending — all clear.</p>}
            {(pending?.items ?? []).map((a) => (
              <Link key={a.title} href={a.href} className="block rounded-md border border-cream-300 p-3 hover:bg-cream-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-900">{a.title}</span>
                  <span className="rounded-sm bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">{a.action}</span>
                </div>
                {a.detail && <p className="mt-1.5 text-xs text-ink-500">{a.detail}</p>}
              </Link>
            ))}
            {!pending && <Skeleton className="h-24 w-full" />}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-cream-300 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl text-ink-900">Real-time Platform Activity Logs</p>
          <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-sm font-semibold text-primary-600">
            <RefreshCw className="size-3.5" /> Refresh Streams
          </button>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-cream-300">
          {activity && activity.items.length === 0 && <p className="py-3 text-sm text-ink-500">No activity yet — this fills up as orders, retailers, and products move through the platform.</p>}
          {(activity?.items ?? []).map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <span className={`w-[92px] shrink-0 rounded-sm px-2 py-1 text-center text-[11px] font-semibold ${ACTIVITY_TYPE_COLORS[log.type] ?? "bg-cream-200 text-ink-700"}`}>
                {log.type}
              </span>
              <p className="flex-1 text-sm text-ink-700">{log.message}</p>
              <span className="shrink-0 text-xs text-ink-500">{log.time}</span>
            </div>
          ))}
          {!activity && <Skeleton className="h-32 w-full" />}
        </div>
      </div>
    </AdminShell>
  );
}
