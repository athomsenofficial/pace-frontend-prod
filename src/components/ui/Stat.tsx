import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "violet";

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  /** Makes the tile a button (e.g. to filter a table). */
  onClick?: () => void;
  /** Highlights the tile as the current selection. */
  active?: boolean;
  className?: string;
}

const toneIcon: Record<Tone, string> = {
  neutral: "bg-surface-hover text-fg-muted",
  primary: "bg-primary-soft text-primary-text",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
};

const toneBar: Record<Tone, string> = {
  neutral: "bg-line-strong",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  violet: "bg-violet",
};

export function Stat({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
  onClick,
  active,
  className,
}: StatProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-fg-muted">{label}</span>
        {icon ? (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md [&_svg]:h-4 [&_svg]:w-4",
              toneIcon[tone],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums leading-8 tracking-tight text-fg">
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-xs text-fg-subtle">{hint}</div> : null}
      {active ? (
        <span
          className={cn("absolute inset-x-3 bottom-0 h-0.5 rounded-full", toneBar[tone])}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
  const base = cn(
    "relative rounded-lg border bg-surface px-3.5 py-3 text-left shadow-card",
    active ? "border-line-strong/60" : "border-line",
    className,
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(base, "w-full transition-colors hover:border-line-strong/60 hover:bg-surface-hover")}
      >
        {body}
      </button>
    );
  }
  return <div className={base}>{body}</div>;
}
