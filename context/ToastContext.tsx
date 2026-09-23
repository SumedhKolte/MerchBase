"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

type ShowToast = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<ShowToast | null>(null);
const TOAST_DURATION_MS = 3000;
let nextToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback<ShowToast>((message, variant = "success") => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Top on phones, so toasts never cover the bottom bulk-action bar. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-16 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-fg shadow-lg"
          >
            {toast.variant === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
            ) : (
              <XCircle className="size-4 text-red-500" aria-hidden />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within <ToastProvider>");
  return context;
}
