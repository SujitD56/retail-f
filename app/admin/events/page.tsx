"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Archive, ArrowRight, Clock, ImageIcon, Plus, PlayCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { MarketplaceEvent } from "@/types";

interface ActivityEntry { type: string; message: string; time: string }

export default function AdminEventsDashboardPage() {
  const { data, loading } = useApiQuery<{ items: MarketplaceEvent[] }>("/events");
  const { data: activity } = useApiQuery<{ items: ActivityEntry[] }>("/admin/activity?limit=6");
  const events = data?.items ?? [];

  const live = events.filter((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status === "upcoming");
  const ended = events.filter((e) => e.status === "ended");
  const totalSubmissions = events.reduce((sum, e) => sum + e.totalEntries, 0);

  const [votesByEvent, setVotesByEvent] = useState<Record<string, number>>({});
  useEffect(() => {
    live.forEach((e) => {
      if (votesByEvent[e.id] !== undefined) return;
      api.get<{ items: { votes: number }[] }>(`/events/${e.id}/entries`).then(({ items }) => {
        setVotesByEvent((prev) => ({ ...prev, [e.id]: items.reduce((s, x) => s + x.votes, 0) }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const stats = [
    { label: "Active Events", value: String(live.length), note: "Currently Live", icon: PlayCircle },
    { label: "Upcoming", value: String(upcoming.length), note: "Scheduled", icon: Clock },
    { label: "Past Events", value: String(ended.length), note: "Archived", icon: Archive },
    { label: "Total Submissions", value: totalSubmissions.toLocaleString("en-IN"), note: "Across all contests", icon: ImageIcon },
  ];

  return (
    <AdminShell title="Event Management" subtitle="Launch, moderate, and analyze marketplace style challenges.">
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="size-4" /> Create New Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          : stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-cream-300 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-700">{s.label}</p>
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <s.icon className="size-4.5" />
                  </span>
                </div>
                <p className="mt-4 font-display text-4xl text-ink-900">{s.value}</p>
                <p className="mt-1 text-sm text-ink-500">{s.note}</p>
              </div>
            ))}
      </div>

      <div className="mt-6 rounded-lg border border-cream-300 bg-white p-6">
        <p className="font-display text-xl text-ink-900">Live &amp; Active Contests</p>
        <div className="mt-4 overflow-x-auto rounded-md border border-cream-300">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-700">
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {live.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-500">No live events right now.</td></tr>
              )}
              {live.map((c) => (
                <tr key={c.id} className="last:border-0">
                  <td className="px-4 py-4 font-medium text-ink-900">{c.title}</td>
                  <td className="px-4 py-4"><StatusPill status="Voting Open" /></td>
                  <td className="px-4 py-4">{c.totalEntries}</td>
                  <td className="px-4 py-4">{votesByEvent[c.id]?.toLocaleString("en-IN") ?? "…"}</td>
                  <td className="px-4 py-4">{formatDate(c.startsAt)}</td>
                  <td className="px-4 py-4">{formatDate(c.endsAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <Link href="/admin/events/moderation" className="text-sm font-semibold text-primary-600 hover:underline">
                        Moderate
                      </Link>
                      <Link href="/admin/events/analytics" className="text-sm font-semibold text-primary-600 hover:underline">
                        Analytics
                      </Link>
                      <Link href="/admin/events/new" className="text-sm font-semibold text-ink-700 hover:underline">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Upcoming &amp; Scheduled</p>
          <div className="mt-4 flex flex-col divide-y divide-cream-300">
            {upcoming.length === 0 && <p className="py-4 text-sm text-ink-500">Nothing scheduled.</p>}
            {upcoming.map((d) => (
              <div key={d.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                  <Image src={d.bannerUrl} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-ink-900">{d.title}</p>
                  <p className="text-sm text-ink-500">Starts {formatDate(d.startsAt)}</p>
                </div>
                <Link href="/admin/events/new" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
                  Launch wizard <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Recent Activity</p>
          <div className="mt-4 flex flex-col divide-y divide-cream-300">
            {!activity ? (
              <Skeleton className="h-32 w-full" />
            ) : activity.items.length === 0 ? (
              <p className="py-4 text-sm text-ink-500">Nothing yet.</p>
            ) : (
              activity.items.map((a, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm text-ink-900">{a.message}</p>
                  <p className="mt-1 text-xs text-ink-500">{a.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
