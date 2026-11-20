import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children?: ReactNode;
  /** Optional structured header: renders a title row with description and actions. */
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({
  className,
  children,
  title,
  description,
  actions,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn("border-b border-line px-4 py-3.5 sm:px-5", className)}
      {...rest}
    >
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-[15px] font-semibold leading-6 text-fg">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn("px-4 py-4 sm:px-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-b-lg border-t border-line bg-surface-muted px-4 py-3 sm:px-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
