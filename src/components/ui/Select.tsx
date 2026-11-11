import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, children, className, id, ...rest },
  ref,
) {
  const selectId =
    id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent",
          "disabled:bg-slate-50 disabled:text-slate-500",
          error && "border-red-500 focus:ring-red-500",
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
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
      {!error && hint ? (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
});
