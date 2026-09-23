import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorAlertProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{message}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
