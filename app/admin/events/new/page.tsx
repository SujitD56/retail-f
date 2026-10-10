"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { FileUploadBox } from "@/components/retailer/file-upload-box";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { eventCategoryOptions } from "@/lib/data/admin-events";

const TOGGLE_OPTIONS = ["Require Pure Handloom Certification", "Enable Direct Saree Product Tagging"];
const DEFAULT_PRIZES = [
  { place: "Grand Winner", cash: "", perks: "" },
  { place: "Runner Up", cash: "", perks: "" },
  { place: "Third Place", cash: "", perks: "" },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminCreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [toggles, setToggles] = useState(Object.fromEntries(TOGGLE_OPTIONS.map((t) => [t, true])));
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(eventCategoryOptions[0]);
  const [registration, setRegistration] = useState({ start: "", end: "" });
  const [submission, setSubmission] = useState({ start: "", end: "" });
  const [voting, setVoting] = useState({ start: "", end: "" });
  const [entryFormat, setEntryFormat] = useState("");
  const [maxEntries, setMaxEntries] = useState("");
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);
  const [jury, setJury] = useState<{ name: string; role: string }[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updatePrize = (place: string, field: "cash" | "perks", value: string) => {
    setPrizes((prev) => prev.map((p) => (p.place === place ? { ...p, [field]: value } : p)));
  };

  const save = async (status: "DRAFT" | "LIVE") => {
    if (!bannerUrl) {
      toast({ title: "Upload a promotional banner first", variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/events/admin", {
        title: name,
        tagline,
        bannerUrl,
        description,
        category,
        startsAt: registration.start || new Date().toISOString(),
        endsAt: voting.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        prizePool: prizes.filter((p) => p.cash).map((p) => `${p.place}: ${p.cash}`).join(", ") || "TBD",
        entryFormat,
        maxEntriesPerRetailer: Number(maxEntries) || undefined,
        config: { toggles, prizes, jury, registration, submission, voting },
        status,
      });
      toast({ title: status === "DRAFT" ? "Draft saved" : "Event published", variant: "success" });
      router.push("/admin/events");
    } catch {
      toast({ title: "Couldn't save this event — try again", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Create New Event" subtitle="Configure a new style challenge from basics through jury assignment.">
      <div className="mb-6 flex justify-end gap-3">
        <Button variant="secondary" disabled={submitting} onClick={() => save("DRAFT")}>
          Save as Draft
        </Button>
        <Button disabled={submitting} onClick={() => save("LIVE")}>
          {submitting ? "Publishing…" : "Publish Event"}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Basic Info</p>
          <p className="mt-1 text-sm text-ink-500">Set the public profile and theme details for your style challenge.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input id="eventName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="eventTagline">Tagline / Prompt Theme</Label>
              <Input id="eventTagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="eventDescription">Description</Label>
            <Textarea id="eventDescription" className="min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mt-5">
            <Label>Event Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {eventCategoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Phases &amp; Timeline Schedule</p>
          <p className="mt-1 text-sm text-ink-500">Define the sequential timelines for each stage of the event lifecycle.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-ink-900">Registration Period</p>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="regStart">Start</Label>
                  <Input id="regStart" value={registration.start} onChange={(e) => setRegistration({ ...registration, start: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="regEnd">End</Label>
                  <Input id="regEnd" value={registration.end} onChange={(e) => setRegistration({ ...registration, end: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">Submission Period</p>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="subStart">Start</Label>
                  <Input id="subStart" value={submission.start} onChange={(e) => setSubmission({ ...submission, start: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="subEnd">End</Label>
                  <Input id="subEnd" value={submission.end} onChange={(e) => setSubmission({ ...submission, end: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">Public Voting Period</p>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="voteStart">Start</Label>
                  <Input id="voteStart" value={voting.start} onChange={(e) => setVoting({ ...voting, start: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="voteEnd">End</Label>
                  <Input id="voteEnd" value={voting.end} onChange={(e) => setVoting({ ...voting, end: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Contest Rules &amp; Config</p>
          <p className="mt-1 text-sm text-ink-500">Set up format, tagging restrictions, and participant parameters.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="entryFormat">Entry Format</Label>
              <Input id="entryFormat" value={entryFormat} onChange={(e) => setEntryFormat(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="maxEntries">Max Entries Per Retailer</Label>
              <Input id="maxEntries" value={maxEntries} onChange={(e) => setMaxEntries(e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            {TOGGLE_OPTIONS.map((t) => (
              <label key={t} className="flex items-center gap-2.5 text-sm text-ink-900">
                <Checkbox checked={toggles[t]} onCheckedChange={(v) => setToggles((prev) => ({ ...prev, [t]: v === true }))} />
                {t}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Contest Prizes</p>
          <p className="mt-1 text-sm text-ink-500">Indicate rewards and perks for the top 3 ranking spots.</p>
          <div className="mt-5 flex flex-col divide-y divide-cream-300">
            {prizes.map((p) => (
              <div key={p.place} className="grid grid-cols-1 gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[150px_1fr_1fr]">
                <p className="self-center font-display text-lg text-ink-900">{p.place}</p>
                <div>
                  <Label htmlFor={`${p.place}-cash`}>Cash Amount</Label>
                  <Input id={`${p.place}-cash`} value={p.cash} onChange={(e) => updatePrize(p.place, "cash", e.target.value)} placeholder="e.g. ₹25,000" />
                </div>
                <div>
                  <Label htmlFor={`${p.place}-perks`}>Coupons &amp; Perks</Label>
                  <Input id={`${p.place}-perks`} value={p.perks} onChange={(e) => updatePrize(p.place, "perks", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Grand Jury Slots</p>
          <p className="mt-1 text-sm text-ink-500">Assign historical textile experts and modern fashion designers to judge.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {jury.map((j, i) => (
              <div key={i} className="flex flex-col items-center rounded-md border border-cream-300 p-5 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-600">
                  {j.name ? initials(j.name) : "—"}
                </span>
                <Input
                  className="mt-3 text-center"
                  placeholder="Judge name"
                  value={j.name}
                  onChange={(e) => setJury((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                />
                <Input
                  className="mt-2 text-center"
                  placeholder="Role"
                  value={j.role}
                  onChange={(e) => setJury((prev) => prev.map((x, idx) => (idx === i ? { ...x, role: e.target.value } : x)))}
                />
                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-danger-500 hover:underline"
                  onClick={() => setJury((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-cream-300 text-sm font-semibold text-primary-600 hover:bg-cream-100"
              onClick={() => setJury((prev) => [...prev, { name: "", role: "" }])}
            >
              + Add Judge
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Promotional Media</p>
          <p className="mt-1 text-sm text-ink-500">Upload the main banners and imagery used on landing and promotional carousels.</p>
          <div className="mt-5">
            <FileUploadBox
              label="Drag & drop event display banner here"
              hint="JPEG, PNG (Recommended 1440x520px)"
              purpose="EVENT_BANNER"
              onUploaded={(files) => setBannerUrl(files[0]?.url ?? null)}
            />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
