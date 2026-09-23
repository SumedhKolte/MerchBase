"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface ModalProps {
  title: string;
  description?: React.ReactNode;
  onClose: () => void;
  /** Blocks Escape / backdrop / ✕ dismissal, e.g. while a request is in flight. */
  isDismissible?: boolean;
  role?: "dialog" | "alertdialog";
  /** "center" for confirmations, "sheet" for a right-hand slide-over panel. */
  variant?: "center" | "sheet";
  /** Pinned below the scrollable body (sheet only), e.g. form buttons. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_CLASSES = {
  center: "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-xl border",
  // `starting:` defines the pre-open state, so the sheet slides in from the right.
  sheet:
    "my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-lg border-l transition-transform duration-300 ease-out motion-reduce:transition-none starting:translate-x-full",
};

/**
 * Built on the native <dialog>: `showModal()` gives us focus trapping, Escape
 * handling, a backdrop, and inert background content for free. Render it only
 * while open — mounting opens it, unmounting closes it.
 */
export function Modal({
  title,
  description,
  onClose,
  isDismissible = true,
  role = "dialog",
  variant = "center",
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Unmounting removes the dialog without close(), so the browser won't restore
  // focus by itself. Remember the opener during the first render — by the time
  // effects run, an `autoFocus` field inside the dialog has already taken focus.
  const [opener] = useState(() =>
    typeof document === "undefined" ? null : document.activeElement,
  );

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [opener]);

  const requestClose = () => {
    if (isDismissible) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault(); // React state, not the browser, decides when we close.
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className={cn(
        "flex-col overflow-hidden border-line bg-surface text-fg shadow-2xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-[2px] open:flex",
        VARIANT_CLASSES[variant],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="mt-1 text-sm text-fg-muted">
              {description}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={requestClose}
          disabled={!isDismissible}
          aria-label="Close dialog"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
      {footer && (
        <div className="flex justify-end gap-2 border-t border-line bg-surface-muted/60 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
