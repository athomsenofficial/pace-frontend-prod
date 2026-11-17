import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge: 20px square caps label (e.g. OVERRIDE, ADDED). For a member's category
 * use <Tag> (dot pill), the only round shape in the system.
 */
type BadgeColor = "neutral" | "navy" | "primary" | "green" | "red" | "amber" | "blue" | "teal";

const badgeColor: Record<BadgeColor, string> = {
  neutral: "border-ink-3 text-ink-2",
  navy: "border-primary text-primary",
  primary: "border-primary text-primary",
  blue: "border-primary text-primary",
  green: "border-elig text-elig",
  red: "border-inel text-inel",
  amber: "border-disc text-disc-ink",
  teal: "border-btz text-btz-ink",
};

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
  title?: string;
}

export function Badge({ children, color = "neutral", className, title }: BadgeProps) {
  return (
    <span className={cn("badge", badgeColor[color], className)} title={title}>
      {children}
    </span>
  );
}

export type TagTone = "elig" | "inel" | "disc" | "btz" | "small" | "primary" | "neutral";

export function Tag({
  tone = "neutral",
  children,
  className,
}: {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("tag", tone !== "neutral" && `t-${tone}`, className)}>
      {children}
    </span>
  );
}
