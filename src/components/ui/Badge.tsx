import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "neutral"
  | "navy"
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "teal";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  neutral: "bg-slate-100 text-slate-700",
  navy: "bg-navy-100 text-navy-900 bg-navy-900/10",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  teal: "bg-cyan-100 text-cyan-800",
};

export function Badge({ children, color = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
