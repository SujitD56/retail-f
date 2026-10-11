"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const current = images[active] ?? images[0]!;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="flex max-w-[640px] flex-1 flex-col gap-6">
      <div
        className="relative aspect-[4/3.5] w-full cursor-zoom-in overflow-hidden rounded-lg bg-cream-100"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={current.url}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority
          className={cn("object-cover", zooming && "opacity-0")}
        />
        {zooming && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${current.url})`,
              backgroundSize: "200%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2",
                i === active ? "border-primary-600" : "border-transparent",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
