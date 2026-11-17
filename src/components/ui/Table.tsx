import type {
  HTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  /** Accessible name for the scroll region (it is focusable so keyboard users can scroll it). */
  label?: string;
  caption?: ReactNode;
  wrapperClassName?: string;
}

/** Table in its own scroll frame: the page never scrolls sideways, the table can. */
export function Table({ className, children, label, caption, wrapperClassName, ...rest }: TableProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto rounded-2 border border-line bg-surface",
        wrapperClassName,
      )}
      role={label ? "region" : undefined}
      aria-label={label}
      tabIndex={label ? 0 : undefined}
    >
      <table className={cn("w-full border-collapse text-sm", className)} {...rest}>
        {caption ? <caption className="vh">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="[&>tr:last-child>td]:border-b-0">{children}</tbody>;
}

interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TR({ children, className, onClick, ...rest }: TRProps) {
  return (
    <tr
      className={cn(onClick && "cursor-pointer hover:bg-ground", className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </tr>
  );
}

interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TH({ children, className, scope = "col", ...rest }: THProps) {
  return (
    <th
      scope={scope}
      className={cn(
        "sticky top-0 whitespace-nowrap border-b border-line bg-surface-2 px-2.5 py-2.5 text-left",
        "text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-2",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

interface TDProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TD({ children, className, ...rest }: TDProps) {
  return (
    <td
      className={cn("border-b border-line px-2.5 py-2 align-middle text-ink-2", className)}
      {...rest}
    >
      {children}
    </td>
  );
}
