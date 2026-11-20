import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}

/** Horizontal progress indicator for multi-step flows; condenses on mobile. */
export function Stepper({ steps, current, className }: StepperProps) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;
  return (
    <nav aria-label="Progress" className={className}>
      {/* Compact (mobile) */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold text-fg">{steps[current]}</span>
          <span className="tabular-nums text-fg-subtle">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 dark:bg-primary-text"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
      </div>

      {/* Full (sm+) */}
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const complete = i < current;
          const active = i === current;
          return (
            <li
              key={`${label}-${i}`}
              className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
              aria-current={active ? "step" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                    complete && "bg-success-solid text-white",
                    active && "bg-primary text-primary-fg ring-4 ring-primary/15",
                    !complete && !active && "border border-line-strong/60 bg-surface text-fg-subtle",
                  )}
                >
                  {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px]",
                    active ? "font-semibold text-fg" : complete ? "font-medium text-fg" : "text-fg-subtle",
                  )}
                >
                  {label}
                  {complete ? <span className="sr-only"> (completed)</span> : null}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    complete ? "bg-success" : "bg-line-strong/40",
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
