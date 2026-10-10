"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Calendar, Download } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatDate } from "@/lib/utils";
import type { MarketplaceEvent } from "@/types";

interface EventAnalytics {
  totalEntries: number;
  totalVotes: number;
  uniqueVoters: number;
  votingTrend: { day: string; votes: number }[];
  topEntries: { title: string; votes: number }[];
  retailerParticipation: { retailerId: string; name: string; location: string; entries: number; votes: number }[];
}

export default function AdminEventAnalyticsPage() {
  const { data: eventsData, loading: eventsLoading } = useApiQuery<{ items: MarketplaceEvent[] }>("/events");
  const event = eventsData?.items.find((e) => e.status === "live") ?? eventsData?.items.find((e) => e.status === "upcoming") ?? eventsData?.items[0] ?? null;
  const { data: a, loading: analyticsLoading } = useApiQuery<EventAnalytics>(event ? `/events/${event.id}/analytics` : null);

  if (eventsLoading || (event && analyticsLoading)) {
    return (
      <AdminShell title="Event Analytics" subtitle="Loading…">
        <Skeleton className="h-96 w-full" />
      </AdminShell>
    );
  }

  if (!event || !a) {
    return (
      <AdminShell title="Event Analytics" subtitle="No events yet">
        <div className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-500">
          Create an event to see analytics here.
        </div>
      </AdminShell>
    );
  }

  const kpis = [
    { label: "Total Entries", value: a.totalEntries.toLocaleString("en-IN") },
    { label: "Total Votes", value: a.totalVotes.toLocaleString("en-IN") },
    { label: "Unique Voters", value: a.uniqueVoters.toLocaleString("en-IN") },
  ];
  const maxEntryVotes = Math.max(1, ...a.topEntries.map((e) => e.votes));

  return (
    <AdminShell title="Event Analytics" subtitle={`${event.title} Overview`}>
      <div className="mb-6 flex justify-end gap-3">
        <Button variant="secondary">
          <Calendar className="size-3.5" /> {formatDate(event.startsAt)} - {formatDate(event.endsAt)}
        </Button>
        <Button variant="secondary">
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-cream-300 bg-white p-5">
            <p className="text-xs text-ink-500">{k.label}</p>
            <p className="mt-2 font-display text-2xl text-ink-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl text-ink-900">Voting Trends (Votes / Day)</p>
            <span className="text-xs text-ink-500">Last 7 Days</span>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={a.votingTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-500)" }} axisLine={false} tickLine={false} />
                <Bar dataKey="votes" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Top Performing Entries</p>
          {a.topEntries.length === 0 ? (
            <p className="mt-5 text-sm text-ink-500">No approved entries yet.</p>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {a.topEntries.map((e) => (
                <div key={e.title}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-900">{e.title}</span>
                    <span className="text-ink-500">{e.votes.toLocaleString("en-IN")} votes</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-cream-200">
                    <div className="h-full rounded-pill bg-gold-400" style={{ width: `${(e.votes / maxEntryVotes) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-cream-300 bg-white p-6">
        <p className="font-display text-xl text-ink-900">Retailer Participation</p>
        <div className="mt-4 overflow-x-auto rounded-md border border-cream-300">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-700">
                <th className="px-4 py-3">Retailer Name</th>
                <th className="px-4 py-3">Submitted Entries</th>
                <th className="px-4 py-3">Total Votes Secured</th>
                <th className="px-4 py-3">Region</th>
              </tr>
            </thead>
            <tbody>
              {a.retailerParticipation.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-500">No entries yet.</td></tr>
              )}
              {a.retailerParticipation.map((r) => (
                <tr key={r.retailerId} className="border-b border-cream-300 last:border-0">
                  <td className="px-4 py-3.5 font-medium text-ink-900">{r.name}</td>
                  <td className="px-4 py-3.5">{r.entries}</td>
                  <td className="px-4 py-3.5">{r.votes.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3.5">{r.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
