import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons follow the concept: 40px app height, 4px radius, hover changes colour only.
 * One `primary` per view (always the next step). Everything else is `secondary`
 * (ink outline), `tertiary` (underlined text), or a row action.
 *
 * Legacy variant names are kept: `outline` = secondary, `ghost` = tertiary.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "tertiary"
  | "ghost"
  | "danger"
  | "white"
  | "on-navy";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white border-transparent hover:bg-primary-hover",
  secondary:
    "border-ink text-ink bg-transparent hover:bg-ink hover:text-surface",
  outline:
    "border-ink text-ink bg-transparent hover:bg-ink hover:text-surface",
  tertiary:
    "border-transparent text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current !px-1",
  ghost:
    "border-transparent text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current !px-1",
  danger: "border-inel text-inel bg-transparent hover:bg-inel hover:text-white",
  white: "bg-white text-navy border-transparent hover:bg-surface-2",
  "on-navy":
    "border-white/80 text-white bg-transparent hover:bg-white hover:text-navy",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[15px]",
  lg: "h-11 px-5 text-[15px]",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-1 border font-medium leading-none whitespace-nowrap no-underline",
    "transition-colors duration-1 ease-out",
    "disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    loading,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      ) : leftIcon ? (
        <span className="shrink-0 inline-flex [&>svg]:h-4 [&>svg]:w-4">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon ? (
        <span className="shrink-0 inline-flex [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>
      ) : null}
    </button>
  );
});
