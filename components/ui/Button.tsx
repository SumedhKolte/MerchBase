import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "attention" | "danger" | "ghost" | "ghost-danger";
type Size = "sm" | "md" | "icon";
type Shape = "rounded" | "pill";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-fg shadow-xs hover:bg-surface-muted",
  attention:
    "border border-amber-300 bg-amber-50 text-amber-900 shadow-xs hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-500",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
  "ghost-danger":
    "text-fg-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "size-8",
};

/**
 * Shared by <Button> and links that should look like buttons. Every visual axis
 * is a parameter, so callers never override classes via `className` (Tailwind
 * doesn't guarantee the later class wins for the same CSS property).
 */
export function buttonClasses(
  variant: Variant = "secondary",
  size: Size = "md",
  shape: Shape = "rounded",
) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition",
    shape === "pill" ? "rounded-full" : "rounded-lg",
    "active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  shape,
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonClasses(variant, size, shape), className)}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
