import type { Metadata } from "next";
import { Suspense } from "react";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginShowcase } from "@/components/auth/LoginShowcase";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <LoginShowcase />

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            {/* The showcase carries the brand on large screens; repeat it on small ones. */}
            <span className="mb-6 flex size-10 items-center justify-center rounded-xl bg-accent text-accent-fg shadow-sm lg:hidden">
              <Boxes className="size-5" aria-hidden />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-fg-muted">Sign in to manage your product catalog.</p>
          </div>
          {/* LoginForm reads ?from= and ?reason= via useSearchParams. */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
