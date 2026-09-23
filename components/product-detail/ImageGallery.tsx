"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/cn";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${title} — image ${activeIndex + 1} of ${images.length}`}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-fg-subtle">
            <Package className="size-16" aria-hidden />
            <span className="sr-only">No image available</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg border bg-surface transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  index === activeIndex
                    ? "border-accent ring-1 ring-accent"
                    : "border-line opacity-70 hover:opacity-100",
                )}
              >
                {/* Eager: tiny, above the fold, and the first shares the main image's src. */}
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  loading="eager"
                  className="object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
