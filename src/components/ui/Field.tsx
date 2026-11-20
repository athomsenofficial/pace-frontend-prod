import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared class string for text-like form controls (input, select, textarea). */
export const controlClasses = cn(
  "block w-full rounded-md border border-line-strong/70 bg-surface px-3 text-sm text-fg shadow-sm",
  "placeholder:text-fg-subtle",
  "transition-colors hover:border-line-strong",
  "focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-subtle disabled:shadow-none",
);

export const controlErrorClasses =
  "border-danger hover:border-danger focus:border-danger focus:ring-danger/25";

interface FieldProps {
  id?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error, with ids wired for aria-describedby. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[13px] font-medium leading-5 text-fg"
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="mt-1.5 flex items-start gap-1 text-xs text-danger"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p
          id={id ? `${id}-hint` : undefined}
          className="mt-1.5 text-xs leading-4 text-fg-subtle"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(
  id: string | undefined,
  error?: unknown,
  hint?: unknown,
): string | undefined {
  if (!id) return undefined;
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
