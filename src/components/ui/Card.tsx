import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Panel: white surface, 1px hairline, 8px radius, no shadow. */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn("panel", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-line [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn("px-5 py-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn("px-5 py-4 border-t border-line", className)} {...rest}>
      {children}
    </div>
  );
}
