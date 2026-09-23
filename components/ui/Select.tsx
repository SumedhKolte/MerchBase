import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClasses } from "./Field";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md";
  hasError?: boolean;
  /** Width/layout classes for the wrapper; the <select> always fills it. */
  wrapperClassName?: string;
}

/**
 * Native <select> (keyboard + screen-reader support for free) with the platform
 * chevron replaced by our own, so text never clips and it looks the same everywhere.
 */
export function Select({
  size = "md",
  hasError,
  wrapperClassName,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          controlClasses(hasError),
          "w-full appearance-none truncate pr-8 pl-3",
          size === "sm" ? "h-8" : "h-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </div>
  );
}
