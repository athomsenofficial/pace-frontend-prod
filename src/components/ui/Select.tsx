import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessage, controlClasses } from "./Field";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  optional?: boolean | string;
  edited?: boolean;
  options?: Array<{ value: string; label: string }>;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    optional,
    edited,
    options,
    children,
    className,
    wrapperClassName,
    id,
    ...rest
  },
  ref,
) {
  const auto = useId();
  const selectId = id ?? `sel-${auto}`;
  const msgId = error || hint ? `${selectId}-msg` : undefined;
  return (
    <div className={cn("w-full min-w-0", wrapperClassName)}>
      {label ? (
        <FieldLabel htmlFor={selectId} optional={optional} edited={edited}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={msgId}
          className={cn(
            controlClasses,
            "appearance-none pr-9 cursor-pointer",
            className,
          )}
          {...rest}
        >
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
        />
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
