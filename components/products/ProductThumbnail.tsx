import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "tile" | "stage";

const FRAME: Record<Variant, string> = {
  tile: "rounded-lg border border-line",
  stage: "rounded-xl",
};

const IMAGE: Record<Variant, string> = {
  tile: "p-1",
  // The "pedestal" zooms when its card (a `.group`) is hovered.
  stage:
    "p-2 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:p-6",
};

interface ProductThumbnailProps {
  src: string;
  alt: string;
  /** "tile": small bordered square (table). "stage": soft pedestal backdrop (cards). */
  variant?: Variant;
  /** Pixel size for a square thumbnail; omit to size it via `className`. */
  size?: number;
  /** Skip lazy-loading for images that are visible on first paint. */
  eager?: boolean;
  /** Size/layout classes only — visual styling comes from `variant`. */
  className?: string;
}

/**
 * Fixed-size frame so layouts never shift while images load.
 * Drafts have no image, so they fall back to a neutral placeholder.
 */
export function ProductThumbnail({
  src,
  alt,
  variant = "tile",
  size,
  eager,
  className,
}: ProductThumbnailProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-surface-muted text-fg-subtle",
        FRAME[variant],
        className,
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes={size ? `${size}px` : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80px"}
          className={cn("object-contain", IMAGE[variant])}
        />
      ) : (
        <Package className="size-1/3" aria-hidden />
      )}
    </div>
  );
}
