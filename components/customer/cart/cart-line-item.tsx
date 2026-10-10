"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCartStore } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";

export function CartLineItem({ product, quantity }: { product: Product; quantity: number }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-6 rounded-lg border border-cream-300 bg-white p-5">
      <div className="relative h-[120px] w-[100px] shrink-0 overflow-hidden rounded-sm">
        <Image src={product.images[0]!.url} alt={product.images[0]!.alt} fill sizes="100px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Link href={`/product/${product.slug}`} className="font-display text-lg text-ink-900 hover:text-primary-600">
            {product.name}
          </Link>
          <p className="text-[13px] text-ink-700">
            Color: {product.color} | Border: {product.borderType}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-primary-600">{formatINR(product.price)}</span>
          <span className="text-ink-500">|</span>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-danger-500"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
      <QuantityStepper value={quantity} onChange={(q) => setQuantity(product.id, q)} max={product.stockCount} />
      <div className="w-[100px] shrink-0 text-right">
        <p className="text-base font-bold text-ink-900">{formatINR(product.price * quantity)}</p>
      </div>
    </div>
  );
}
