"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatDate } from "@/lib/utils";
import type { EventEntry, MarketplaceEvent } from "@/types";

const REQUIREMENTS = [
  "Upload 9:16 vertical video reel format (max 60s)",
  "Feature at least one authentic Ilkal saree from your store",
  "Tag the listed catalog product in your entry to enable direct checkout",
];

export default function RetailerJoinEventPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { data: eventsData, loading: eventsLoading } = useApiQuery<{ items: MarketplaceEvent[] }>("/events");
  const event = eventsData?.items.find((e) => e.status === "live") ?? eventsData?.items.find((e) => e.status === "upcoming") ?? null;
  const { data: myEntries } = useApiQuery<{ items: EventEntry[] }>(event ? "/events/retailer/mine" : null);
  const myEventEntries = myEntries?.items.filter((e) => e.eventId === event?.id) ?? [];
  const joinedOn = myEventEntries.length ? myEventEntries.reduce((earliest, e) => (e.submittedAt < earliest ? e.submittedAt : earliest), myEventEntries[0]!.submittedAt) : null;

  if (eventsLoading) {
    return (
      <RetailerShell title="Events & Competitions">
        <Skeleton className="h-96 w-full" />
      </RetailerShell>
    );
  }

  if (!event) {
    return (
      <RetailerShell title="Events & Competitions">
        <div className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-500">
          No events are open for entry right now — check back soon.
        </div>
      </RetailerShell>
    );
  }

  return (
    <RetailerShell title="Events & Competitions">
      <Breadcrumbs items={[{ label: "Events", href: "/retailer/events" }, { label: event.title }]} />

      <div className="mt-6 overflow-hidden rounded-lg border border-cream-300 bg-white">
        <div className="relative h-[240px] w-full">
          <Image src={event.bannerUrl} alt="" fill sizes="1100px" className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="p-8">
          <div>
            <p className="font-display text-3xl text-primary-600">{event.title}</p>
            <p className="mt-1 text-sm text-ink-500">
              {formatDate(event.startsAt)} — {formatDate(event.endsAt)}
            </p>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-700">{event.description}</p>

          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="font-display text-lg text-ink-900">Requirements</p>
              <ul className="mt-3 flex flex-col gap-2.5 text-sm text-ink-700">
                {REQUIREMENTS.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-lg text-ink-900">Prize Pool</p>
              <p className="mt-3 text-sm text-ink-700">{event.prizePool}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-cream-300 pt-6">
            {joinedOn ? (
              <div className="flex items-center gap-2 rounded-md bg-success-50 p-4 text-sm text-success-500">
                <Check className="size-4 shrink-0" />
                You joined on {formatDate(joinedOn)}. You have {myEventEntries.length} {myEventEntries.length === 1 ? "entry" : "entries"} submitted.
              </div>
            ) : (
              <div className="rounded-md bg-cream-100 p-4 text-sm text-ink-700">
                You haven&apos;t submitted an entry to this event yet.
              </div>
            )}

            <label className="mt-5 flex items-start gap-2.5 text-sm text-ink-700">
              <Checkbox className="mt-0.5" checked={agreed} onCheckedChange={() => setAgreed((v) => !v)} />
              I agree to the Event Terms &amp; Conditions and Weaver Co-op guidelines.
            </label>

            <Button size="lg" className="mt-5" onClick={() => router.push("/retailer/events/submit")}>
              Submit New Entry
            </Button>
          </div>
        </div>
      </div>
    </RetailerShell>
  );
}
