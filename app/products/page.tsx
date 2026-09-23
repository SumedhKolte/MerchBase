import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDashboard } from "@/components/products/ProductDashboard";
import { ProductsSkeleton } from "@/components/products/ProductsSkeleton";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    // The dashboard reads the URL via useSearchParams, which requires a Suspense boundary.
    <Suspense fallback={<ProductsSkeleton rows={10} />}>
      <ProductDashboard />
    </Suspense>
  );
}
