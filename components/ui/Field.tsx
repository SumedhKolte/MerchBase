import { cn } from "@/lib/cn";

/** Border, color, and focus styles shared by every form control (no padding/size). */
export function controlClasses(hasError = false) {
  return cn(
    "block rounded-lg border bg-surface text-sm text-fg shadow-xs transition-colors",
    "placeholder:text-fg-subtle focus:outline-2 focus:-outline-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-60",
    hasError
      ? "border-red-400 focus:outline-red-500 dark:border-red-500/70"
      : "border-line-strong hover:border-fg-subtle focus:outline-accent",
  );
}

export function inputClasses(hasError = false) {
  return cn(controlClasses(hasError), "w-full px-3 py-2");
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + error message. Controls should set `aria-describedby={errorId(id)}`. */
export function Field({ id, label, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId(id)} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function errorId(id: string) {
  return `${id}-error`;
}
