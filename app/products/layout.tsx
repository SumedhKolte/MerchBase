import { DashboardFooter } from "@/components/layout/DashboardFooter";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ProductOverlayProvider } from "@/context/ProductOverlayContext";

export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return (
    <ProductOverlayProvider>
      {/* `isolate` keeps the decorative backdrop's -z-10 inside this layout. */}
      <div className="relative isolate flex flex-1 flex-col">
        {/* Decorative: a faint grid and accent glow behind the page header, fading out. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(40rem_16rem_at_20%_0%,var(--accent-soft),transparent)]"
        />
        <DashboardHeader />
        <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </ProductOverlayProvider>
  );
}
