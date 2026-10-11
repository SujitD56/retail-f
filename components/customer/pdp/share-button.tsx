"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/ui/share-dialog";

export function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Share"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-sm border border-cream-300 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-cream-100"
      >
        <Share2 className="size-3.5" /> Share
      </button>
      <ShareDialog open={open} onOpenChange={setOpen} title={title} />
    </>
  );
}
