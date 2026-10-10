"use client";

import Image from "next/image";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Share2 } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatINR } from "@/lib/utils";
import type { EventEntry } from "@/types";

interface EntryAnalytics {
  entryId: string;
  entryTitle: string;
  votes: number;
  rank: number | null;
  voteTrend: { day: string; votes: number }[];
  taggedProduct: { name: string; price: number; image: string; slug: string } | null;
}

export default function RetailerEntryAnalyticsPage() {
  const { toast } = useToast();
  const { data: myEntries, loading: entriesLoading } = useApiQuery<{ items: EventEntry[] }>("/events/retailer/mine");
  const bestEntry = myEntries?.items.reduce<EventEntry | null>((best, e) => (!best || e.votes > best.votes ? e : best), null) ?? null;
  const { data: a, loading: analyticsLoading } = useApiQuery<EntryAnalytics>(bestEntry ? `/events/retailer/mine/entries/${bestEntry.id}/analytics` : null);

  if (entriesLoading || (bestEntry && analyticsLoading)) {
    return (
      <RetailerShell title="Entry Performance">
        <Skeleton className="h-96 w-full" />
      </RetailerShell>
    );
  }

  if (!bestEntry || !a) {
    return (
      <RetailerShell title="Entry Performance">
        <div className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-500">
          You haven&apos;t submitted any entries yet.
        </div>
      </RetailerShell>
    );
  }

  const stats = [
    { label: "Votes", value: a.votes.toLocaleString("en-IN") },
    { label: "Rank", value: a.rank ? `#${a.rank}` : "—" },
  ];

  return (
    <RetailerShell title="Entry Performance">
      <Breadcrumbs items={[{ label: "Events", href: "/retailer/events" }, { label: a.entryTitle }]} />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="font-display text-3xl text-primary-600">{a.entryTitle}</p>
          <p className="text-sm text-ink-500">Performance Overview</p>
        </div>
        <Button variant="secondary" onClick={() => toast({ title: "Link copied" })}>
          <Share2 className="size-4" /> Share Entry
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-cream-300 bg-white p-5">
            <p className="text-sm text-ink-700">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-cream-300 bg-white p-6">
        <p className="font-display text-xl text-ink-900">Vote Trend (Last 7 Days)</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={a.voteTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-500)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="votes" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {a.taggedProduct && (
        <div className="mt-6 rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Tagged Product</p>
          <div className="mt-5 flex items-center gap-4 rounded-md border border-cream-300 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
              <Image src={a.taggedProduct.image} alt={a.taggedProduct.name} fill sizes="64px" className="object-cover" />
            </div>
            <div>
              <p className="font-display text-lg text-ink-900">{a.taggedProduct.name}</p>
              <p className="text-sm text-ink-500">{formatINR(a.taggedProduct.price)}</p>
            </div>
          </div>
        </div>
      )}
    </RetailerShell>
  );
}
