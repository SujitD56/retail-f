import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RetailerStatusShell } from "@/components/retailer/status-card-shell";
import { Button } from "@/components/ui/button";

const STEPS = [
  { n: 1, title: "Document Verification", description: "Validating GSTIN, PAN, and Bank details." },
  { n: 2, title: "Quality Review", description: "Reviewing catalog references for genuine Ilkal craftsmanship." },
  { n: 3, title: "Account Activation", description: "You'll receive login credentials & guide to list products." },
];

export default function RetailerRegistrationSubmittedPage() {
  return (
    <RetailerStatusShell
      icon={CheckCircle2}
      iconClassName="bg-success-50 text-success-500"
      title="Registration Submitted!"
      description="Thank you for registering with Kaushaya."
    >
      <div className="rounded-lg bg-cream-100 p-5 text-sm text-ink-700">
        <p>
          Your application is under review. Our curation team will verify your tax credentials, business location,
          and weaver credentials within 2-3 business days.
        </p>
        <p className="mt-3">We&apos;ve sent a verification email with your details.</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-900">What Happens Next?</p>
        <div className="mt-4 flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
                {s.n}
              </span>
              <p className="text-sm text-ink-700">
                <span className="font-semibold text-ink-900">{s.title}: </span>
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-cream-300" />
      <Button asChild size="lg" className="h-12 w-full">
        <Link href="/retailer/login">Go to Login</Link>
      </Button>
    </RetailerStatusShell>
  );
}
