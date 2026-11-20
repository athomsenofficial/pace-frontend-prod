import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Field, controlClasses, controlErrorClasses, describedBy } from "./Field";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Class for the outer wrapper (label + input + hint). */
  containerClassName?: string;
  /** Short unit text shown inside the right edge, e.g. "months". */
  suffix?: ReactNode;
  /** Icon shown inside the left edge, e.g. a search glyph. */
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, containerClassName, suffix, leadingIcon, id, ...rest },
  ref,
) {
  const autoId = useId();
  // useId keeps ids unique even when several fields share a label.
  const inputId = id ?? autoId;
  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-3 z-[1] flex items-center text-fg-subtle [&_svg]:h-4 [&_svg]:w-4"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={cn(
            controlClasses,
            "h-9",
            suffix ? "pr-16" : null,
            leadingIcon ? "pl-9" : null,
            error && controlErrorClasses,
            className,
          )}
          {...rest}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-fg-subtle">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  );
});
