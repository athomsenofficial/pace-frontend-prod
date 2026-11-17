import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessage, controlClasses } from "./Field";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  /** Shows "Optional" (or the given text) after the label. */
  optional?: boolean | string;
  /** Shows a quiet "Edited" marker after the label. */
  edited?: boolean;
  /** Set codes (PAS, AFSC, SRID, RE/UIF) in IBM Plex Mono. */
  mono?: boolean;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, optional, edited, mono, className, wrapperClassName, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `in-${auto}`;
  const msgId = error || hint ? `${inputId}-msg` : undefined;
  return (
    <div className={cn("w-full min-w-0", wrapperClassName)}>
      {label ? (
        <FieldLabel htmlFor={inputId} optional={optional} edited={edited}>
          {label}
        </FieldLabel>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={msgId}
        className={cn(
          controlClasses,
          mono && "font-mono text-[14px] tracking-[0.02em]",
          className,
        )}
        {...rest}
      />
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
