import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number;
  /** CSS colour for the 8px dot, e.g. "rgb(var(--elig))". */
  dot?: string;
  /** Short caps flag after the count, e.g. "Review". */
  flag?: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  /** id prefix: tab buttons get `${idBase}-tab-${value}` and control `${idBase}-panel`. */
  idBase?: string;
}

/** Underline tabs with counts. role=tablist, arrow keys move and select. */
export function Tabs({ items, value, onChange, className, ariaLabel = "Tabs", idBase }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent, idx: number) => {
    let j = -1;
    if (e.key === "ArrowRight") j = (idx + 1) % items.length;
    else if (e.key === "ArrowLeft") j = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = items.length - 1;
    if (j < 0) return;
    e.preventDefault();
    refs.current[j]?.focus();
    onChange(items[j].value);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-0.5 border-b border-line overflow-x-auto [scrollbar-width:thin]",
        className,
      )}
    >
      {items.map((item, idx) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            id={idBase ? `${idBase}-tab-${item.value}` : undefined}
            aria-controls={idBase ? `${idBase}-panel` : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKey(e, idx)}
            className={cn(
              "relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap px-3 text-sm transition-colors duration-1",
              "focus-visible:outline-offset-[-2px]",
              active ? "font-medium text-ink" : "text-ink-3 hover:text-ink",
              active &&
                "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-primary",
            )}
          >
            {item.dot ? (
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ background: item.dot }}
              />
            ) : null}
            {item.label}
            {typeof item.count === "number" ? (
              <span className={cn("num text-[13px]", active ? "text-ink" : "text-ink-3")}>
                {item.count}
              </span>
            ) : null}
            {item.flag ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-disc-ink">
                {item.flag}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
