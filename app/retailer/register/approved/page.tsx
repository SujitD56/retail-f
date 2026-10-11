import Link from "next/link";
import { Eye, Plus, Sparkles, Truck, User } from "lucide-react";
import { RetailerStatusShell } from "@/components/retailer/status-card-shell";
import { Button } from "@/components/ui/button";

const CHECKLIST = [
  { icon: Plus, label: "Add your first product catalog" },
  { icon: User, label: "Complete store profile details" },
  { icon: Truck, label: "Set up preferred shipping partners" },
  { icon: Eye, label: "Explore the wholesale dashboard" },
];

export default function RetailerApprovedPage() {
  return (
    <RetailerStatusShell
      icon={Sparkles}
      iconClassName="bg-gold-50 text-gold-600"
      title="Welcome to Kaushaya!"
      description="Your retailer account has been approved."
    >
      <div className="rounded-lg border border-gold-400 bg-gold-50 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Approved Retailer</p>
        <p className="mt-1 font-display text-2xl text-primary-600">Lakshmi Sarees</p>
      </div>

      <p className="text-sm leading-relaxed text-ink-700">
        You are now certified as an authentic partner. You can now start listing your products, syncing with
        handloom weaver cooperatives, and reaching customers across India.
      </p>

      <div>
        <p className="text-sm font-semibold text-ink-900">Your Quick Start Checklist</p>
        <div className="mt-4 flex flex-col gap-3">
          {CHECKLIST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm text-ink-900">
              <Icon className="size-[18px] text-primary-600" /> {label}
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-cream-300" />
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-[52px] w-full">
          <Link href="/retailer/dashboard">Go to Dashboard →</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-12 w-full">
          <Link href="/retailer/settings">Set Up Store Profile</Link>
        </Button>
      </div>
    </RetailerStatusShell>
  );
}
