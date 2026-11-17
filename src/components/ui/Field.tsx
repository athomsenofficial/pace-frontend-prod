import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared control styling: 40px, 4px radius, ctrl border (>= 3:1), focus ring. */
export const controlClasses = cn(
  "block w-full h-10 px-3 rounded-1 border border-ctrl bg-surface text-ink text-[15px]",
  "transition-colors duration-1 ease-out hover:border-ink-2",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus focus-visible:border-focus",
  "disabled:bg-ground disabled:text-ink-3 disabled:cursor-not-allowed",
  "aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[inset_0_0_0_1px_rgb(var(--error))]",
);

/** Strip a trailing " *" from legacy labels: required is the default, optional says so. */
export function cleanLabel(label?: ReactNode): ReactNode {
  if (typeof label === "string") return label.replace(/\s*\*\s*$/, "");
  return label;
}

export function FieldLabel({
  htmlFor,
  children,
  optional,
  edited,
  className,
}: {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean | string;
  edited?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-ink mb-1.5", className)}
    >
      {cleanLabel(children)}
      {optional ? (
        <span className="ml-1.5 text-[13px] font-normal text-ink-3">
          {typeof optional === "string" ? optional : "Optional"}
        </span>
      ) : null}
      {edited ? (
        <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          Edited
        </span>
      ) : null}
    </label>
  );
}

export function FieldMessage({
  id,
  error,
  hint,
}: {
  id?: string;
  error?: ReactNode;
  hint?: ReactNode;
}) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-error">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-[13px] text-ink-3">
        {hint}
      </p>
    );
  }
  return null;
}
