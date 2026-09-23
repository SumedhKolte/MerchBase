"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, PackageX, Pencil, Trash2 } from "lucide-react";
import { DeleteProductModal } from "@/components/products/DeleteProductModal";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { MutationBadge, Rating, StockBadge } from "@/components/products/ProductBadges";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";
import { useCategories } from "@/hooks/useCategories";
import { useListUrl } from "@/hooks/useListUrl";
import { useProduct } from "@/hooks/useProduct";
import { cn } from "@/lib/cn";
import { formatCategory, formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";
import { Breadcrumbs } from "./Breadcrumbs";
import { ImageGallery } from "./ImageGallery";
import { ReviewList } from "./ReviewList";

function getSpecs(product: Product): Array<[label: string, value: string | undefined]> {
  const { sku, brand, weight, dimensions, minimumOrderQuantity } = product;
  return [
    ["SKU", sku],
    ["Brand", brand],
    ["Weight", weight ? `${weight} g` : undefined],
    [
      "Dimensions",
      dimensions && `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`,
    ],
    ["Minimum order", minimumOrderQuantity ? `${minimumOrderQuantity} units` : undefined],
    ["Warranty", product.warrantyInformation],
    ["Shipping", product.shippingInformation],
    ["Returns", product.returnPolicy],
  ];
}

export function ProductDetail({ id }: { id: string }) {
  const { state, retry } = useProduct(id);
  const { getStatus } = useProductOverlay();
  const showToast = useToast();
  const router = useRouter();
  const listUrl = useListUrl();
  const categories = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Name the browser tab after the product (static metadata can't know it).
  const productTitle = state.status === "success" ? state.product.title : null;
  useEffect(() => {
    if (productTitle) document.title = `${productTitle} · MerchBase`;
  }, [productTitle]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Couldn’t copy the link", "error");
    }
  };

  if (state.status === "loading") return <DetailSkeleton />;

  if (state.status === "not-found" || state.status === "error") {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="rounded-2xl border border-line bg-surface">
          {state.status === "error" ? (
            <ErrorAlert
              title="Couldn’t load this product"
              message={state.message}
              onRetry={retry}
            />
          ) : (
            <div className="flex flex-col items-center px-4 py-20 text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-muted text-fg-subtle ring-1 ring-line">
                <PackageX className="size-6" aria-hidden />
              </span>
              <h1 className="text-lg font-semibold">Product not found</h1>
              <p className="mt-1 max-w-sm text-sm text-fg-muted">
                There’s no product with ID “{id}”. It may have been deleted or never existed.
              </p>
              <Link href={listUrl} className={cn(buttonClasses("primary", "md", "pill"), "mt-5")}>
                Browse products
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { product } = state;
  const images = product.images.length > 0 ? product.images : [product.thumbnail].filter(Boolean);
  const specs = getSpecs(product).filter(([, value]) => value);

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumbs category={product.category} title={product.title} />
        <Button size="sm" onClick={copyShareLink} className="shrink-0">
          <Link2 className="size-4" aria-hidden />
          <span className="hidden sm:inline">Copy shareable link</span>
          <span className="sm:hidden">Copy link</span>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={images} title={product.title} />

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{formatCategory(product.category)}</Badge>
              <MutationBadge status={getStatus(product.id)} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.title}</h1>
            {product.brand && <p className="mt-1 text-sm text-fg-subtle">by {product.brand}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-3xl font-semibold tabular-nums">{formatCurrency(product.price)}</p>
            {Boolean(product.discountPercentage) && (
              <Badge tone="success">{product.discountPercentage}% off</Badge>
            )}
            <span className="text-sm text-fg-muted">
              <Rating value={product.rating} />
            </span>
            <StockBadge stock={product.stock} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button shape="pill" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" aria-hidden />
              Edit product
            </Button>
            <Button shape="pill" variant="ghost-danger" onClick={() => setIsDeleting(true)}>
              <Trash2 className="size-4" aria-hidden />
              Delete
            </Button>
          </div>

          <p className="leading-relaxed text-fg-muted">{product.description}</p>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-fg-muted"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          )}

          {specs.length > 0 && (
            <section
              aria-labelledby="specs-heading"
              className="rounded-xl border border-line bg-surface"
            >
              <h2
                id="specs-heading"
                className="border-b border-line px-4 py-3 text-sm font-semibold"
              >
                Specifications
              </h2>
              <dl className="divide-y divide-line text-sm">
                {specs.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-3 gap-4 px-4 py-2.5">
                    <dt className="text-fg-subtle">{label}</dt>
                    <dd className="col-span-2 text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="reviews-heading" className="space-y-4">
        <h2 id="reviews-heading" className="text-lg font-semibold">
          Customer reviews{" "}
          <span className="text-fg-subtle tabular-nums">({product.reviews?.length ?? 0})</span>
        </h2>
        <ReviewList reviews={product.reviews ?? []} />
      </section>

      {isEditing && (
        <ProductFormModal
          product={product}
          categories={categories}
          onClose={() => setIsEditing(false)}
        />
      )}
      {isDeleting && (
        <DeleteProductModal
          products={[product]}
          onClose={() => setIsDeleting(false)}
          onDeleted={() => router.push(listUrl)}
        />
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="space-y-8">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
