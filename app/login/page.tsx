import type { Metadata } from "next";
import { Suspense } from "react";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-accent-fg shadow-sm">
            <Boxes className="size-5" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Sign in to MerchBase</h1>
          <p className="mt-1 text-sm text-fg-muted">Manage your product catalog.</p>
        </div>
        {/* LoginForm reads ?from= and ?reason= via useSearchParams. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
