"use client";

import { Award, Film, Share2, Star, ThumbsUp, Trophy, type LucideIcon } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";

interface MyEventStats {
  achievements: { title: string; subtitle: string; icon: string }[];
}

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  film: Film,
  "thumbs-up": ThumbsUp,
};

export default function RetailerAchievementsPage() {
  const { toast } = useToast();
  const { data: s, loading } = useApiQuery<MyEventStats>("/events/retailer/mine/stats");
  const achievements = s?.achievements ?? [];

  return (
    <RetailerShell title="Your Achievements">
      <div className="mb-8">
        <p className="font-display text-2xl text-ink-900">Accredited Handloom Milestones</p>
        <p className="mt-1 text-sm text-ink-700">
          {loading ? "Loading your achievements…" : `You've earned ${achievements.length} badge${achievements.length === 1 ? "" : "s"} so far.`}
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : achievements.length === 0 ? (
        <div className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-500">
          No achievements yet — enter a challenge and start racking up votes to earn badges.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((b, i) => {
            const Icon = ICONS[b.icon] ?? Award;
            return (
              <div key={i} className="flex flex-col items-center gap-3 rounded-lg border border-cream-300 bg-white p-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{b.title}</p>
                  <p className="mt-1 text-xs text-ink-500">{b.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-cream-300 bg-white p-6">
        <div>
          <p className="font-display text-xl text-ink-900">Share Your Weaver Achievements</p>
          <p className="mt-1 text-sm text-ink-700">Showcase your handloom awards directly to your retail customers on Instagram &amp; Facebook.</p>
        </div>
        <Button onClick={() => toast({ title: "Share sheet opened" })}>
          <Share2 className="size-4" /> Share on Social Media
        </Button>
      </div>
    </RetailerShell>
  );
}
