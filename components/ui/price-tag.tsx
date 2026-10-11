import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const priceSize = { sm: "text-sm", md: "text-lg", lg: "text-2xl" }[size];
  const compareSize = { sm: "text-[11px]", md: "text-xs", lg: "text-sm" }[size];

  // No "You save X%" text here — this renders in narrow card/list contexts
  // where that extra text wraps to its own line and throws off row/card
  // alignment. The struck-through compare price already signals a discount;
  // ProductCard additionally shows a "X% OFF" badge on the image.
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn(priceSize, "font-bold text-ink-900")}>{formatINR(price)}</span>
      {compareAt && compareAt > price && (
        <span className={cn(compareSize, "text-ink-500 line-through")}>{formatINR(compareAt)}</span>
      )}
    </div>
  );
}
