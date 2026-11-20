import type { ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function Verdict({
  eligible,
  title,
  subtitle,
}: {
  eligible: boolean;
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3.5",
        eligible ? "border-success-line bg-success-soft" : "border-danger-line bg-danger-soft",
      )}
      role="status"
    >
      {eligible ? (
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-danger" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "text-lg font-semibold leading-7 tracking-tight",
            eligible ? "text-success" : "text-danger",
          )}
        >
          {title}
        </p>
        <p className="text-[13px] text-fg-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export function RequirementSection({
  title,
  met,
  metLabel,
  notMetLabel,
  rows,
}: {
  title: string;
  met: boolean;
  metLabel: string;
  notMetLabel: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <Badge color={met ? "green" : "red"} dot>
          {met ? metLabel : notMetLabel}
        </Badge>
      </div>
      <dl className="divide-y divide-line">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start justify-between gap-4 py-1.5 text-[13px]"
          >
            <dt className="text-fg-muted">{r.label}</dt>
            <dd className="text-right font-medium tabular-nums text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function RequirementList({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-surface">
      {children}
    </div>
  );
}

export function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <div className="rounded-lg border border-danger-line bg-danger-soft px-4 py-3">
      <p className="text-[13px] font-semibold text-danger">Reason(s) not eligible</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] text-fg-muted">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
