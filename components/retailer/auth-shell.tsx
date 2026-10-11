import Link from "next/link";
import Image from "next/image";

const STATS = [
  { value: "500+", label: "Verified Retailers" },
  { value: "₹2Cr+", label: "Monthly Sales Volume" },
  { value: "98%", label: "Sustained Satisfaction" },
];

/**
 * Shared branded split-shell for every Retailer Portal auth screen (login,
 * 5-step registration, submitted/under-review/approved/rejected,
 * forgot-password) — matches the "left-branded-panel" + "right-form-panel"
 * pattern from the source design, reused across all 11 screens.
 */
export function RetailerAuthShell({
  tagBadge = "B2B SELLER NETWORK",
  headline,
  pitch,
  showStats = true,
  children,
}: {
  tagBadge?: string;
  headline: React.ReactNode;
  pitch?: string;
  showStats?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-stretch bg-cream-100">
      <div className="hidden w-[45%] shrink-0 flex-col justify-between border-r-4 border-gold-400 bg-primary-600 p-16 lg:flex">
        <Link href="/" className="flex items-center gap-4">
          <div className="rounded-md bg-cream-100 p-2">
            <Image src="/images/brand/kaushaya-logo-sm.png" alt="Kaushaya" width={200} height={112} className="h-16 w-auto object-contain" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-400">Retailer Portal</span>
        </Link>

        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-sm border border-gold-400 bg-gold-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-gold-400">
            {tagBadge}
          </span>
          <h1 className="font-display text-5xl font-semibold leading-[1.15] text-white">{headline}</h1>
          {pitch && <p className="text-base leading-relaxed text-cream-100/90">{pitch}</p>}
        </div>

        {showStats ? (
          <div className="flex gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="flex-1 border-l-2 border-gold-400 pl-4">
                <p className="font-display text-3xl font-bold text-gold-400">{s.value}</p>
                <p className="mt-2 text-[13px] text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 sm:p-16">
        <div className="w-full max-w-[592px]">{children}</div>
        <div className="flex items-center gap-2 text-[13px] text-ink-700">
          Need help? <span className="font-semibold text-primary-600">Contact Seller Support</span>
        </div>
      </div>
    </div>
  );
}
