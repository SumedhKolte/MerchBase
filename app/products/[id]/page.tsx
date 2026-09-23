import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail/ProductDetail";

export const metadata: Metadata = { title: "Product details" };

export default async function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
