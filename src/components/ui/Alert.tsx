import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  /** Override the default tone icon; pass null to hide it. */
  icon?: ReactNode | null;
  /** Inline actions shown under the message. */
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const toneClasses: Record<Tone, { box: string; icon: string }> = {
  info: { box: "bg-info-soft border-info-line", icon: "text-info" },
  success: { box: "bg-success-soft border-success-line", icon: "text-success" },
  warning: { box: "bg-warning-soft border-warning-line", icon: "text-warning" },
  danger: { box: "bg-danger-soft border-danger-line", icon: "text-danger" },
  neutral: { box: "bg-surface-muted border-line", icon: "text-fg-muted" },
};

const defaultIcon: Record<Tone, ReactNode> = {
  info: <Info />,
  success: <CheckCircle2 />,
  warning: <AlertTriangle />,
  danger: <AlertCircle />,
  neutral: <Info />,
};

/** Inline callout for status, warnings and errors. */
export function Alert({
  tone = "info",
  title,
  children,
  icon,
  actions,
  onDismiss,
  className,
}: AlertProps) {
  const t = toneClasses[tone];
  const shownIcon = icon === undefined ? defaultIcon[tone] : icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border px-3.5 py-3 text-sm",
        t.box,
        className,
      )}
    >
      {shownIcon ? (
        <span
          className={cn("mt-px shrink-0 [&_svg]:h-[18px] [&_svg]:w-[18px]", t.icon)}
          aria-hidden="true"
        >
          {shownIcon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 leading-5">
        {title ? <p className="font-semibold text-fg">{title}</p> : null}
        {children ? (
          <div className={cn("text-fg-muted", title ? "mt-0.5" : null)}>{children}</div>
        ) : null}
        {actions ? <div className="mt-2.5 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-7 w-7 shrink-0 rounded-md p-1.5 text-fg-subtle hover:bg-surface/60 hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
