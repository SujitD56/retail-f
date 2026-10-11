import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Compass className="size-7" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-display text-3xl text-ink-900">Page not found</p>
        <p className="mt-1.5 max-w-sm text-sm text-ink-700">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Kaushaya</Link>
      </Button>
    </div>
  );
}
