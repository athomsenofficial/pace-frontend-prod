import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RailStep {
  label: string;
  /** One-line status under the label ("3 discrepancies to review"). */
  status?: string;
  warn?: boolean;
}

interface WizardShellProps {
  /** Small caps label at the top of the rail, e.g. "Initial MEL". */
  kind: string;
  /** Value under it, e.g. "SSG · 2026" or "New listing". */
  kindValue: string;
  steps: RailStep[];
  current: number;
  /** Called for completed steps the user clicks to go back to. */
  onStepClick?: (index: number) => void;
  session?: Array<{ label: string; value: ReactNode; mono?: boolean }>;
  onStartOver?: () => void;
  children: ReactNode;
}

/**
 * App shell for the MEL tools: a persistent step rail on the left (a 4-column strip
 * below lg) and the step's content on the right. Each step renders its own
 * PageHeader and sticky ActionBar.
 */
export function WizardShell({
  kind,
  kindValue,
  steps,
  current,
  onStepClick,
  session,
  onStartOver,
  children,
}: WizardShellProps) {
  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside
        aria-label="Progress"
        className="border-b border-line bg-surface px-3 py-2.5 lg:flex lg:flex-col lg:gap-5 lg:border-b-0 lg:border-r lg:px-3.5 lg:pb-6 lg:pt-5"
      >
        <div className="hidden px-2 lg:block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            {kind}
          </div>
          <div className="mt-1 text-[15px] font-semibold leading-snug text-ink">{kindValue}</div>
        </div>
        <ol className="grid grid-flow-col auto-cols-[minmax(0,1fr)] gap-1 lg:grid-flow-row lg:auto-cols-auto lg:gap-0.5">
          {steps.map((s, i) => {
            const done = i < current;
            const cur = i === current;
            const clickable = done && !!onStepClick;
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-1 border text-xs font-semibold",
                    done && "border-elig bg-elig-tint text-elig",
                    cur && "border-primary bg-primary text-white",
                    !done && !cur && "border-ctrl bg-surface text-ink-3",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0 text-[12.5px] font-medium leading-tight lg:text-sm">
                  <span className="vh">
                    Step {i + 1}
                    {done ? ", done" : cur ? ", current" : ""}:{" "}
                  </span>
                  {s.label}
                  {s.status ? (
                    <span
                      className={cn(
                        "mt-0.5 hidden text-xs font-normal lg:block",
                        s.warn ? "text-disc-ink" : "text-ink-3",
                      )}
                    >
                      {s.status}
                    </span>
                  ) : null}
                </span>
              </>
            );
            const base = cn(
              "relative flex flex-col items-start gap-1.5 rounded-1 p-1.5 text-left lg:grid lg:grid-cols-[24px_1fr] lg:gap-2.5 lg:px-2 lg:py-[9px]",
              cur
                ? "bg-ground text-ink after:absolute after:inset-x-1.5 after:-bottom-[11px] after:h-[3px] after:bg-gold lg:after:inset-x-auto lg:after:-left-3.5 lg:after:bottom-2 lg:after:top-2 lg:after:h-auto lg:after:w-[3px]"
                : done
                  ? "text-ink-2"
                  : "text-ink-3",
            );
            return (
              <li key={s.label} className="min-w-0">
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick!(i)}
                    className={cn(base, "w-full hover:bg-ground")}
                  >
                    {inner}
                  </button>
                ) : (
                  <div className={base} aria-current={cur ? "step" : undefined}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {session && session.length ? (
          <dl className="hidden grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-line px-2 pt-3.5 text-[13px] lg:grid">
            {session.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-ink-3">{row.label}</dt>
                <dd
                  className={cn(
                    "m-0 min-w-0 truncate text-right text-ink",
                    row.mono && "font-mono text-xs",
                  )}
                  title={typeof row.value === "string" ? row.value : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {onStartOver ? (
          <button
            type="button"
            onClick={onStartOver}
            className="hidden px-2 text-left text-[13px] text-ink-3 underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-current lg:block"
          >
            Start over with a new file
          </button>
        ) : null}
      </aside>
      <div className="flex min-w-0 flex-col px-4 pt-5 sm:px-6 sm:pt-6">{children}</div>
    </div>
  );
}

export function PageHeader({
  meta,
  title,
  description,
  actions,
}: {
  meta?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-[18px]">
      <div className="min-w-0">
        {meta ? (
          <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-3">
            {meta}
          </div>
        ) : null}
        <h1 className="page-title">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[64ch] text-sm text-ink-3">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** "Step 2 of 4 · Initial MEL · SSG · 2026" with dot separators. */
export function MetaLine({ parts }: { parts: Array<string | null | undefined | false> }) {
  const shown = parts.filter(Boolean) as string[];
  return (
    <>
      {shown.map((p, i) => (
        <span key={`${p}-${i}`} className="inline-flex items-center gap-2.5">
          {i > 0 ? (
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-line-strong" />
          ) : null}
          {p}
        </span>
      ))}
    </>
  );
}

/** Sticky bar: Back, the outstanding issue, and the one primary action. */
export function ActionBar({
  back,
  status,
  statusTone = "muted",
  primary,
}: {
  back?: ReactNode;
  status?: ReactNode;
  statusTone?: "muted" | "warn" | "ok";
  primary?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line bg-surface px-4 py-3 sm:-mx-6 sm:px-6">
      {back ? <div className="shrink-0">{back}</div> : null}
      <div
        className="flex min-w-[200px] flex-1 items-center gap-2 text-sm text-ink-2"
        aria-live="polite"
      >
        {status ? (
          <>
            {statusTone !== "muted" ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  statusTone === "warn" ? "bg-disc" : "bg-elig",
                )}
              />
            ) : null}
            <span className={statusTone === "muted" ? "text-ink-3" : undefined}>{status}</span>
          </>
        ) : null}
      </div>
      {primary ? <div className="flex max-sm:w-full max-sm:[&>*]:w-full">{primary}</div> : null}
    </div>
  );
}
