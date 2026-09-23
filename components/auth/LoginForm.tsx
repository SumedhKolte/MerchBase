"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { errorId, Field, inputClasses } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/services/api";

type Credentials = { username: string; password: string };
type CredentialErrors = Partial<Record<keyof Credentials, string>>;

const DEMO_CREDENTIALS: Credentials = { username: "emilys", password: "emilyspass" };

function validate({ username, password }: Credentials): CredentialErrors {
  const errors: CredentialErrors = {};
  if (!username.trim()) errors.username = "Username is required.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

/** Only allow same-origin paths, so `?from=` can't become an open redirect. */
function safeRedirectPath(from: string | null): string {
  return from?.startsWith("/") && !from.startsWith("//") ? from : "/products";
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<Credentials>({ username: "", password: "" });
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const sessionExpired = searchParams.get("reason") === "expired";

  const handleChange =
    (field: keyof Credentials) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(values.username.trim(), values.password);
      // Stay in the submitting state until navigation completes.
      router.replace(safeRedirectPath(searchParams.get("from")));
    } catch (error) {
      setFormError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
      {sessionExpired && !formError && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your session expired. Please sign in again.
        </p>
      )}
      {formError && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id="username" label="Username" error={errors.username}>
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={values.username}
            onChange={handleChange("username")}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? errorId("username") : undefined}
            className={inputClasses(Boolean(errors.username))}
          />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? errorId("password") : undefined}
              className={cn(inputClasses(Boolean(errors.password)), "pr-10")}
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-fg-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              {isPasswordVisible ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </Field>
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2.5 text-xs text-fg-muted">
        <span>
          Demo: <code className="font-mono text-fg">emilys</code> /{" "}
          <code className="font-mono text-fg">emilyspass</code>
        </span>
        <button
          type="button"
          onClick={() => {
            setValues(DEMO_CREDENTIALS);
            setErrors({});
          }}
          className="rounded font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Autofill
        </button>
      </div>
    </div>
  );
}
