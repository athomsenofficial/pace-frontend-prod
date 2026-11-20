import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "neutral"
  | "navy"
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "teal"
  | "violet";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  /** Show a small leading status dot. */
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  neutral: "bg-surface-hover text-fg-muted ring-line",
  navy: "bg-primary-soft text-primary-text ring-primary/20",
  green: "bg-success-soft text-success ring-success-line",
  red: "bg-danger-soft text-danger ring-danger-line",
  amber: "bg-warning-soft text-warning ring-warning-line",
  blue: "bg-info-soft text-info ring-info-line",
  teal: "bg-info-soft text-info ring-info-line",
  violet: "bg-violet-soft text-violet ring-violet-line",
};

export function Badge({
  children,
  color = "neutral",
  dot,
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-[13px]",
        colorClasses[color],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
