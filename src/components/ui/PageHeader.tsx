import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Small uppercase label above the title, e.g. the nav group. */
  eyebrow?: ReactNode;
  /** Inline element after the title (e.g. a Badge). */
  badge?: ReactNode;
  /** Right-aligned actions (buttons). Wrap below the title on small screens. */
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  badge,
  actions,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <div
            className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-primary-text shadow-card sm:flex [&_svg]:h-5 [&_svg]:w-5"
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-xl font-semibold leading-7 tracking-tight text-fg sm:text-2xl sm:leading-8">
              {title}
            </h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
