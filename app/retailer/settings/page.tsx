"use client";

import { useState } from "react";
import { RetailerShell } from "@/components/retailer/shell";
import { FileUploadBox } from "@/components/retailer/file-upload-box";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TOGGLES = [
  { key: "smsOrders", label: "SMS notifications on new weaver orders received", defaultOn: true },
  { key: "weeklyLedger", label: "Weekly analytics and store sales ledger updates", defaultOn: true },
  { key: "whatsappStock", label: "Alert me on WhatsApp if a loom masterwork falls to low stock", defaultOn: false },
  { key: "reviewAlert", label: "Notify when a customer leaves a handloom review", defaultOn: true },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={cn("relative h-6 w-12 rounded-pill transition-colors", on ? "bg-primary-600" : "bg-cream-300")}>
      <span className={cn("absolute top-1 size-4 rounded-full bg-white transition-transform", on ? "translate-x-7" : "translate-x-1")} />
    </button>
  );
}

export default function RetailerSettingsPage() {
  const [toggles, setToggles] = useState(Object.fromEntries(TOGGLES.map((t) => [t.key, t.defaultOn])));
  const { toast } = useToast();

  return (
    <RetailerShell title="Store Settings" subtitle="Manage your weaver storefront brand, payouts details, and shipping defaults.">
      <div className="mb-6 flex justify-end gap-3">
        <Button variant="secondary">Discard</Button>
        <Button onClick={() => toast({ title: "Settings saved", variant: "success" })}>Save Settings</Button>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Public Storefront Profile</p>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
            <div>
              <Label>Store Logo</Label>
              <FileUploadBox label="Upload New" hint="Square, min 400x400" purpose="RETAILER_LOGO" />
            </div>
            <div>
              <Label>Cover Banner</Label>
              <FileUploadBox label="Replace" hint="1600x400 recommended" purpose="RETAILER_COVER" />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="storefrontName">Storefront Name</Label>
            <Input id="storefrontName" defaultValue="Lakshmi Handloom Sarees" />
          </div>
          <div className="mt-5">
            <Label htmlFor="storefrontDesc">Storefront Description</Label>
            <Textarea
              id="storefrontDesc"
              className="min-h-[100px]"
              defaultValue="Passing down weavers' legacy through five generations. We bring you strictly GI Certified and Handloom mark authentic Ilkal cotton, silk blend, and pure raw silk masterpieces handwoven in Hunagund cluster."
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="slug">Artisan Page Slug</Label>
            <Input id="slug" defaultValue="kaushaya.com/boutique/lakshmi-handlooms" />
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Bank Account &amp; Payouts Ledger</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="beneficiaryName">Bank Account Beneficiary Name</Label>
              <Input id="beneficiaryName" defaultValue="Lakshmi Handloom Sarees Cooperatives" />
            </div>
            <div>
              <Label htmlFor="acctNo">Account Number</Label>
              <Input id="acctNo" defaultValue="**********45829" />
            </div>
            <div>
              <Label htmlFor="ifscSettings">IFSC Code</Label>
              <Input id="ifscSettings" defaultValue="SBIN0001428" />
            </div>
            <div>
              <Label htmlFor="branchTown">Bank Branch Town</Label>
              <Input id="branchTown" defaultValue="Main Bazaar Branch, Ilkal" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="upiId">Verified UPI ID for Fast Payouts</Label>
              <Input id="upiId" defaultValue="lakshmisarees@oksbi" />
            </div>
          </div>
          <div className="mt-5 rounded-md bg-cream-100 p-4 text-xs leading-relaxed text-ink-700">
            Payouts are auto-processed every Thursday for completed orders with active delivery confirmations. Subject
            to a flat 2.5% marketplace support fee.
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">Shipping &amp; Fulfillment</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Default Courier Partner</Label>
              <Select defaultValue="india-post">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="india-post">India Post (Speed Post) &amp; Delhivery</SelectItem>
                  <SelectItem value="bluedart">Blue Dart</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Loom to Courier Dispatch Delay</Label>
              <Select defaultValue="1-2">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1 - 2 Business Days</SelectItem>
                  <SelectItem value="3-5">3 - 5 Business Days</SelectItem>
                  <SelectItem value="5-7">5 - 7 Business Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-cream-300 bg-white p-6">
          <p className="font-display text-xl text-ink-900">SMS &amp; Email Alert Preferences</p>
          <div className="mt-5 flex flex-col gap-5">
            {TOGGLES.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-sm text-ink-900">{t.label}</span>
                <Toggle on={toggles[t.key]!} onToggle={() => setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }))} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </RetailerShell>
  );
}
