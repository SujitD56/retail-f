import type { Metadata } from "next";
import { EB_Garamond, Geist } from "next/font/google";
import { AuthHydrator } from "@/components/auth-hydrator";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kaushaya — Handloom Saree Marketplace",
    template: "%s · Kaushaya",
  },
  description:
    "Kaushaya connects customers with GI-verified handloom saree retailers from Karnataka, empowering weaver communities since 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${geist.variable} h-full antialiased`}>
      {/*
        suppressHydrationWarning is scoped to just this element's own
        attributes (not its children/subtree) — it's the fix Next.js itself
        recommends for exactly this case: a browser extension (ColorZilla's
        `cz-shortcut-listen`, Grammarly's `data-gr-*`, etc.) mutating <body>
        before React hydrates. Nothing in this codebase sets that attribute
        — grep confirms it — so silencing the warning here doesn't hide a
        real mismatch, just a false positive from the visitor's browser.
      */}
      <body className="min-h-full flex flex-col bg-cream-200 text-ink-900" suppressHydrationWarning>
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
