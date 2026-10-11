"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";

interface ModerationEntry {
  id: string;
  title: string;
  imageUrl: string;
  retailer: string;
  verified: boolean;
  taggedSaree: string;
  submittedOn: string;
}

const SUBMISSION_RULES = [
  { title: "1. Authentic Ilkal Fabric", body: "The showcased saree must prominently feature traditional Ilkal borders (Chikki Paras, Gomi, or Gayathri) and cotton-silk blend properties." },
  { title: "2. Saree Product Tagging", body: "Each submission must tag a verified catalog product from an accredited Karnataka handloom cooperative/retailer." },
  { title: "3. High Fidelity Presentation", body: "The video must have clear lighting, showcase complete draping mechanics, and contain no third-party branding overlays." },
];

export default function AdminModerationPage() {
  const { data, loading } = useApiQuery<{ items: ModerationEntry[] }>("/events/admin/moderation");
  const [selected, setSelected] = useState<string[]>([]);
  const [entries, setEntries] = useState<ModerationEntry[] | null>(null);
  const { toast } = useToast();

  const list = entries ?? data?.items ?? [];

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function moderate(id: string, action: "approve" | "reject") {
    try {
      await api.patch(`/events/admin/entries/${id}/moderate`, { action });
      setEntries(list.filter((e) => e.id !== id));
      setSelected((prev) => prev.filter((s) => s !== id));
      toast({ title: action === "approve" ? "Entry approved" : "Entry rejected", variant: action === "approve" ? "success" : undefined });
    } catch {
      toast({ title: "Couldn't update this entry — try again", variant: "error" });
    }
  }

  async function moderateSelected(action: "approve" | "reject") {
    const ids = selected.length > 0 ? selected : list.map((e) => e.id);
    await Promise.all(ids.map((id) => api.patch(`/events/admin/entries/${id}/moderate`, { action }).catch(() => undefined)));
    setEntries(list.filter((e) => !ids.includes(e.id)));
    setSelected([]);
    toast({ title: `${ids.length} entries ${action === "approve" ? "approved" : "rejected"}`, variant: action === "approve" ? "success" : undefined });
  }

  return (
    <AdminShell title="Entry Moderation" subtitle="Pending Style Challenge submissions across all events">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-pill bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
          {list.length} Submission{list.length === 1 ? "" : "s"} Waiting
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : list.length === 0 ? (
            <div className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-500">
              Nothing pending review — all caught up.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border border-cream-300 bg-white px-5 py-4">
                <label className="flex items-center gap-2.5 text-sm font-medium text-ink-900">
                  <Checkbox
                    checked={selected.length === list.length && list.length > 0}
                    onCheckedChange={(v) => setSelected(v ? list.map((c) => c.id) : [])}
                  />
                  Select All ({list.length})
                </label>
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => moderateSelected("approve")}>
                    Approve {selected.length > 0 ? `Selected (${selected.length})` : "All"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => moderateSelected("reject")}>
                    Reject {selected.length > 0 ? `Selected (${selected.length})` : "All"}
                  </Button>
                </div>
              </div>

              {list.map((c) => (
                <div key={c.id} className="flex flex-col gap-4 rounded-lg border border-cream-300 bg-white p-5 sm:flex-row sm:gap-5">
                  <div className="flex gap-4 sm:contents">
                    <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} className="mt-1 shrink-0" />
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md sm:h-40 sm:w-[90px]">
                      <Image src={c.imageUrl} alt="" fill sizes="90px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-snug text-ink-900">{c.title}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-700">
                        {c.retailer}
                        {c.verified && (
                          <span className="rounded-pill bg-success-50 px-2 py-0.5 text-[10px] font-semibold text-success-500">Verified</span>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-ink-500">Submitted on: {c.submittedOn}</p>
                      <p className="mt-1 text-xs text-ink-500">Tagged Saree: {c.taggedSaree}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:w-[180px] sm:shrink-0 sm:flex-col">
                    <Button size="sm" className="flex-1" onClick={() => moderate(c.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1" onClick={() => moderate(c.id, "reject")}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="h-fit rounded-lg border border-cream-300 bg-white p-6">
          <div className="flex items-center gap-2 text-ink-900">
            <FileText className="size-4.5" />
            <p className="font-display text-xl">Submission Rules</p>
          </div>
          <div className="mt-5 flex flex-col divide-y divide-cream-300">
            {SUBMISSION_RULES.map((r) => (
              <div key={r.title} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-ink-900">{r.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-cream-300 pt-5">
            <p className="text-sm text-ink-700">Need verification assistance?</p>
            <Button variant="secondary" className="mt-3 w-full">Contact Weaver Guild</Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
