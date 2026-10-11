"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Users, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BENEFITS = [
  { icon: Store, title: "Your Digital Storefront", description: "Create your personalized boutique profile, showcase custom handloom collections, and tell your unique artisan story." },
  { icon: Users, title: "Reach More Saree Enthusiasts", description: "Get exposure to thousands of verified buyers seeking authentic, certified geographical indication (GI) Ilkal sarees." },
  { icon: LayoutDashboard, title: "Sovereign Management Tools", description: "Access easy-to-use artisan dashboards, inventory alerts, bulk product loaders, and detailed payouts ledger." },
];

export default function RetailerJoinLandingPage() {
  const router = useRouter();

  return (
    <div className="bg-cream-100">
      <header className="flex h-[88px] items-center justify-between border-b border-cream-300 bg-white px-5 sm:px-10 lg:px-20">
        <div>
          <p className="font-display text-2xl text-primary-600">Kaushaya</p>
          <p className="text-[10px] uppercase tracking-wide text-gold-400">Weaver Marketplace</p>
        </div>
        <nav className="hidden gap-8 text-sm font-medium text-ink-900 md:flex">
          <Link href="/sarees">Sarees</Link>
          <Link href="/retailers">Artisans</Link>
          <Link href="#">Heritage</Link>
          <Link href="/retailer/join" className="font-semibold text-primary-600">Sell on Ilkal</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/retailer/login" className="text-sm font-medium text-ink-900">Sign In</Link>
          <Button asChild size="sm"><Link href="#form">Join Waitlist</Link></Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 py-12 sm:px-10 lg:flex-row lg:px-20 lg:py-20">
        <div className="flex flex-1 flex-col gap-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase text-gold-400">Artisan &amp; Master Weaver Registration</p>
            <h1 className="font-display text-3xl leading-[1.15] text-primary-600 sm:text-4xl lg:text-5xl">Digitize Your Legacy. Sell Your Authentic Ilkal Sarees.</h1>
            <p className="text-base leading-relaxed text-ink-700">
              Join India&apos;s trusted online portal dedicated strictly to traditional Ilkal handlooms. Showcase your
              craftsmanship and directly supply to handloom connoisseurs across the globe.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {BENEFITS.map(({ title, description }, i) => (
              <div key={title} className="flex gap-4 rounded-lg border border-cream-300 bg-white p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-lg font-semibold text-primary-600">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg text-ink-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="italic leading-relaxed text-ink-700">
              &ldquo;Transitioning to Kaushaya allowed our weaving cooperative to reach markets in Mumbai and
              Delhi we never had access to. Our looms run full-time now.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600">GS</span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Guruappa Shettar</p>
                <p className="text-xs text-ink-500">Founder, Shettar Handlooms • Partner Retailer</p>
              </div>
            </div>
          </div>
        </div>

        <div id="form" className="w-full max-w-[480px] shrink-0 rounded-xl border border-cream-300 bg-white p-10">
          <h2 className="font-display text-3xl text-primary-600">Join as a Retailer</h2>
          <p className="mt-1 text-sm text-ink-700">Set up your sovereign artisan storefront in 5 minutes.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/retailer/register");
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <div>
              <Label htmlFor="storeName" required>Store Name / Weaver Society</Label>
              <Input id="storeName" placeholder="e.g. Karnataka Handloom Co-op" />
            </div>
            <div>
              <Label htmlFor="ownerName" required>Owner / Representative Name</Label>
              <Input id="ownerName" placeholder="e.g. Mahadev Swamy" />
            </div>
            <div>
              <Label htmlFor="joinEmail" required>Email Address</Label>
              <Input id="joinEmail" placeholder="name@society.com" />
            </div>
            <div>
              <Label htmlFor="joinPhone" required>Phone Number</Label>
              <Input id="joinPhone" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label>Weaving District Location</Label>
              <Select defaultValue="Bagalkot (Ilkal cluster)">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bagalkot (Ilkal cluster)">Bagalkot (Ilkal cluster)</SelectItem>
                  <SelectItem value="Gadag">Gadag</SelectItem>
                  <SelectItem value="Hubballi-Dharwad">Hubballi-Dharwad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="joinPassword" required>Choose Password</Label>
              <Input id="joinPassword" type="password" placeholder="At least 8 characters" />
            </div>
            <label className="flex items-start gap-2.5 text-[13px] text-ink-700">
              <Checkbox className="mt-0.5" />
              I agree to the Retailer Marketplace Agreement and declare our weaves are Handloom mark compliant.
            </label>
            <Button type="submit" size="lg" className="h-[46px] w-full">Create Retailer Account</Button>
            <p className="text-center text-sm text-ink-700">
              Already registered? <Link href="/retailer/login" className="font-semibold text-primary-600">Sign In</Link>
            </p>
          </form>
        </div>
      </div>

      <footer className="border-t border-cream-300 bg-white px-5 py-12 sm:px-10 lg:px-20 lg:py-16">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="max-w-sm">
            <p className="font-display text-2xl text-primary-600">Kaushaya</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              Preserving and promoting the legendary craft of Ilkal weaving. Empowering weavers and weavers&apos;
              cooperatives through digital commerce.
            </p>
          </div>
          <div className="flex gap-10 sm:gap-16">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-ink-900">Portal</p>
              <Link href="/retailer/login" className="text-sm text-ink-700">Retailer Login</Link>
              <Link href="/retailers" className="text-sm text-ink-700">Artisan Directory</Link>
              <span className="text-sm text-ink-700">Weaving Clusters</span>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-ink-900">Support</p>
              <span className="text-sm text-ink-700">Weaver Guidelines</span>
              <span className="text-sm text-ink-700">Shipping Terms</span>
              <span className="text-sm text-ink-700">Craft Certification</span>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-cream-300 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Kaushaya. All rights reserved. Handloom Mark Certified.</span>
          <div className="flex gap-6">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>YouTube</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
