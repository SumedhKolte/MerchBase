import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ProductOverlayProvider } from "@/context/ProductOverlayContext";

export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return (
    <ProductOverlayProvider>
      <DashboardHeader />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
    </ProductOverlayProvider>
  );
}
