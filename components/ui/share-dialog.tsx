"use client";

import type { ComponentType, SVGProps } from "react";
import { Link2, Mail, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FacebookGlyph, TwitterGlyph, WhatsappGlyph } from "@/components/ui/social-glyphs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Controlled share panel — same "pick an app" pattern as Flipkart/Amazon's share sheet, not just a single direct link. Callers own the open state so they can use whatever trigger button fits their layout. */
export function ShareDialog({ open, onOpenChange, title }: { open: boolean; onOpenChange: (open: boolean) => void; title: string }) {
  const { toast } = useToast();
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const options: { label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; color: string; href?: string; onClick?: () => void }[] = [
    { label: "Copy Link", icon: Link2, color: "bg-ink-700", onClick: async () => { await navigator.clipboard.writeText(url); toast({ title: "Link copied to clipboard" }); onOpenChange(false); } },
    { label: "WhatsApp", icon: WhatsappGlyph, color: "bg-[#25D366]", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: "Facebook", icon: FacebookGlyph, color: "bg-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Twitter", icon: TwitterGlyph, color: "bg-black", href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: "Gmail", icon: Mail, color: "bg-[#EA4335]", href: `mailto:?subject=${encodedText}&body=${encodedUrl}` },
    { label: "SMS", icon: MessageSquare, color: "bg-success-500", href: `sms:?body=${encodedText}%20${encodedUrl}` },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-5 pt-2 sm:grid-cols-4">
          {options.map((opt) =>
            opt.href ? (
              <a
                key={opt.label}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
                className="flex flex-col items-center gap-2 text-xs text-ink-700"
              >
                <span className={cn("flex size-12 items-center justify-center rounded-full text-white", opt.color)}>
                  <opt.icon className="size-5" />
                </span>
                {opt.label}
              </a>
            ) : (
              <button key={opt.label} type="button" onClick={opt.onClick} className="flex flex-col items-center gap-2 text-xs text-ink-700">
                <span className={cn("flex size-12 items-center justify-center rounded-full text-white", opt.color)}>
                  <opt.icon className="size-5" />
                </span>
                {opt.label}
              </button>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
