import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableContextValue {
  dense: boolean;
  zebra: boolean;
}

const TableContext = createContext<TableContextValue>({ dense: false, zebra: false });

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  /** Classes for the scroll container (border, radius, max-height…). */
  containerClassName?: string;
  /** Cap the height so the body scrolls under a sticky header (e.g. "65vh"). */
  maxHeight?: CSSProperties["maxHeight"];
  /** Tighter row padding for data-heavy tables. */
  dense?: boolean;
  /** Alternate row shading. */
  zebra?: boolean;
}

export function Table({
  className,
  containerClassName,
  maxHeight,
  dense = false,
  zebra = false,
  children,
  ...rest
}: TableProps) {
  return (
    <TableContext.Provider value={{ dense, zebra }}>
      <div
        className={cn(
          "scroll-thin relative w-full overflow-auto rounded-lg border border-line bg-surface",
          containerClassName,
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table
          className={cn(
            "w-full min-w-full border-separate border-spacing-0 text-left",
            className,
          )}
          {...rest}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  const { zebra } = useContext(TableContext);
  return (
    <tbody
      className={cn(
        "[&>tr:last-child>td]:border-b-0 [&>tr:hover>td]:!bg-surface-hover",
        zebra && "[&>tr:nth-child(even)>td]:bg-surface-muted/70",
      )}
    >
      {children}
    </tbody>
  );
}

interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function TR({ children, className, onClick, selected, ...rest }: TRProps) {
  return (
    <tr
      className={cn(
        onClick && "cursor-pointer",
        selected && "[&>td]:bg-primary-soft/60",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </tr>
  );
}

type Align = "left" | "center" | "right";

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

interface THProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  children?: ReactNode;
  className?: string;
  align?: Align;
  /** Right-align (numbers). */
  numeric?: boolean;
  /** Current sort direction for this column (renders a sort button when onSort is set). */
  sort?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TH({
  children,
  className,
  align,
  numeric,
  sort,
  onSort,
  ...rest
}: THProps) {
  const { dense } = useContext(TableContext);
  const a: Align = align ?? (numeric ? "right" : "left");
  const SortIcon = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <th
      scope="col"
      aria-sort={
        sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined
      }
      className={cn(
        "sticky top-0 z-10 whitespace-nowrap border-b border-line bg-surface-muted",
        "text-2xs font-semibold uppercase tracking-[0.06em] text-fg-muted",
        dense ? "px-3 py-2" : "px-4 py-2.5",
        alignClass[a],
        className,
      )}
      {...rest}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase hover:text-fg",
            a === "right" && "flex-row-reverse",
          )}
        >
          {children}
          <SortIcon
            className={cn("h-3 w-3", sort ? "text-fg" : "text-fg-subtle/70")}
            aria-hidden="true"
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

interface TDProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  children?: ReactNode;
  className?: string;
  align?: Align;
  /** Right-align with tabular figures (numbers). */
  numeric?: boolean;
}

export function TD({ children, className, align, numeric, ...rest }: TDProps) {
  const { dense } = useContext(TableContext);
  const a: Align = align ?? (numeric ? "right" : "left");
  return (
    <td
      className={cn(
        "border-b border-line align-middle text-sm text-fg",
        dense ? "px-3 py-2" : "px-4 py-2.5",
        alignClass[a],
        numeric && "tabular-nums",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
