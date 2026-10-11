"use client";

import { useRouter } from "next/navigation";
import { Award, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  { n: 1, label: "Account Info", done: true },
  { n: 2, label: "Business Details", done: false },
  { n: 3, label: "Store Profile", done: false },
  { n: 4, label: "Verification", done: false },
  { n: 5, label: "Bank Account", done: false },
];

const CONSTITUTIONS = ["Individual Weaver", "Artisan Partnership", "Handloom Weavers Cooperative Society"];

export default function RetailerOnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="flex h-[88px] items-center justify-between border-b border-cream-300 bg-white px-20">
        <div>
          <p className="font-display text-2xl text-primary-600">Kaushaya</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-500">Retailer Onboarding</p>
        </div>
        <button type="button" className="text-sm font-medium text-ink-700">Save Draft &amp; Exit</button>
      </header>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-20 py-12 lg:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/retailer/dashboard");
          }}
          className="flex flex-1 flex-col gap-8 rounded-xl border border-cream-300 bg-white p-10"
        >
          <div>
            <p className="text-xs font-semibold uppercase text-gold-400">Step 2 of 5</p>
            <h1 className="mt-1 font-display text-3xl text-primary-600">Business &amp; Handloom Details</h1>
            <p className="mt-2 text-sm text-ink-700">
              We verify these details with the weaver cluster registers to protect authentic Ilkal geographical indication.
            </p>
          </div>

          <div>
            <Label>Constitution of Business</Label>
            <div className="flex flex-wrap gap-6 pt-1">
              {CONSTITUTIONS.map((c, i) => (
                <label key={c} className="flex items-center gap-2 text-sm text-ink-900">
                  <input type="radio" name="constitution" defaultChecked={i === 2} className="size-4 accent-primary-600" /> {c}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="regBusinessName">Registered Business Name</Label>
              <Input id="regBusinessName" defaultValue="Lakshmi Sarees Handloom Guild" />
            </div>
            <div>
              <Label htmlFor="coopReg">Weaver Cooperative Reg No. (Optional)</Label>
              <Input id="coopReg" placeholder="e.g. COOP-52-BAG" />
            </div>
            <div>
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input id="panNumber" defaultValue="ABCPL7421H" />
            </div>
            <div>
              <Label htmlFor="gstin2">GSTIN (Optional)</Label>
              <Input id="gstin2" placeholder="29ABCPL7421H1Z5" />
            </div>
            <div>
              <Label htmlFor="clusterTown">Weaving Cluster Town</Label>
              <Input id="clusterTown" defaultValue="Ilkal" />
            </div>
            <div>
              <Label htmlFor="taluk">Taluk / District</Label>
              <Input id="taluk" defaultValue="Hunagund, Bagalkot" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="societyAddress">Weaver Society Registered Address</Label>
              <Input id="societyAddress" defaultValue="Weaver Colony, Near Huchaswamy Temple, Ilkal - 587125" />
            </div>
            <div>
              <Label>Years Practicing Craft</Label>
              <Select defaultValue="15-25">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5">0 - 5 years</SelectItem>
                  <SelectItem value="5-15">5 - 15 years</SelectItem>
                  <SelectItem value="15-25">15 - 25 years</SelectItem>
                  <SelectItem value="25+">25+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Active Looms Owned / Managed</Label>
              <Select defaultValue="12">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1 - 5 Looms</SelectItem>
                  <SelectItem value="6-10">6 - 10 Looms</SelectItem>
                  <SelectItem value="12">12 Active Looms</SelectItem>
                  <SelectItem value="20+">20+ Looms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-cream-300 pt-6">
            <button type="button" className="text-sm font-medium text-ink-700">Back</button>
            <div className="flex gap-3">
              <Button type="button" variant="secondary">Save Draft</Button>
              <Button type="submit">Save &amp; Continue</Button>
            </div>
          </div>
        </form>

        <aside className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
          <div className="rounded-xl border border-cream-300 bg-white p-8">
            <p className="font-display text-2xl text-primary-600">Onboarding Progress</p>
            <div className="mt-6 flex flex-col gap-4">
              {CHECKLIST.map((s) => (
                <div key={s.n} className="flex items-center gap-3">
                  <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-semibold", s.done ? "bg-success-500 text-white" : "bg-cream-200 text-ink-700")}>
                    {s.done ? <Check className="size-3.5" /> : s.n}
                  </span>
                  <span className={cn("text-sm", s.done ? "text-ink-900" : "text-ink-700")}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-cream-300 bg-cream-200 p-8">
            <Award className="size-6 text-primary-600" />
            <p className="mt-4 font-display text-lg text-primary-600">GI Certified Protection</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              We strictly enforce the Geographical Indication of Goods Act, protecting Ilkal weave heritage. Handloom
              verification prevents machine-made copycats from undermining genuine weaver prices.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
