import type { ReactNode } from "react";
import { Badge, Tag, type TagTone } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { cn, formatDateMil } from "@/lib/utils";
import type { Cell, Row, RunColumn } from "./types";

/** Status text -> tag colour. Longest/most specific matches first. */
export function statusTone(value: string): TagTone {
  const v = value.trim().toUpperCase();
  if (v === "ELIGIBLE - NOT YET SRP CONSIDERED") return "btz";
  if (v.startsWith("INELIGIBLE - WAIV")) return "disc";
  if (v === "REVIEW") return "disc";
  if (v === "HYT/RETIREMENT") return "small";
  if (v === "INELIGIBLE" || v === "BARRED") return "inel";
  if (v === "ELIGIBLE") return "elig";
  // CJR window run
  if (v === "PAST WINDOW") return "inel";
  if (v === "IN WINDOW") return "disc";
  if (v === "APPROACHING") return "small";
  return "neutral";
}

/** Whole numbers as-is; anything fractional (e.g. a BTZ quota of 1.65) to 2 places. */
export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** Quotas are exact decimals now (the MPF sets the whole number): always 2 places. */
export function formatQuota(n: number | null | undefined): string | null {
  return typeof n === "number" && Number.isFinite(n) ? n.toFixed(2) : null;
}

const STATUS_KEYS = new Set(["status", "run1_status", "re_class", "cjr_status", "window_status"]);
const CODE_KEYS = new Set(["pascode", "re_code", "uif_code", "grade"]);
const SIZE_KEYS = new Set(["unit_size", "size"]);

const FLAG_LABEL: Record<string, { label: string; color: "amber" | "red" }> = {
  NO_ASSIGNMENT: { label: "No assignment", color: "amber" },
  INSUFFICIENT_RETAINABILITY: { label: "Insufficient retainability", color: "red" },
};

const blank = (
  <span className="text-ink-3">
    <span aria-hidden="true">—</span>
    <span className="vh">blank</span>
  </span>
);

export function DateText({ value }: { value: unknown }) {
  if (value == null || value === "") return blank;
  const s = String(value);
  if (s.toUpperCase() === "INDEFINITE") return <Badge color="neutral">Indefinite</Badge>;
  return <span className="num whitespace-nowrap">{formatDateMil(s)}</span>;
}

export function SizeTag({ value }: { value: string }) {
  const v = value.toUpperCase();
  if (!v) return blank;
  return <Tag tone={v === "LARGE" ? "primary" : v === "SMALL" ? "small" : "neutral"}>{v}</Tag>;
}

/** Renders one cell by its column kind (and a few well-known keys). */
export function CellValue({ col, value }: { col: RunColumn; value: Cell }): ReactNode {
  if (col.kind === "date") return <DateText value={value} />;
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return blank;

  if (col.kind === "list" || Array.isArray(value)) {
    const items = (Array.isArray(value) ? value : [value]).map(String);
    if (col.key === "flags") {
      return (
        <span className="flex flex-col items-start gap-1">
          {items.map((f) => {
            const m = FLAG_LABEL[f];
            return (
              <Badge key={f} color={m?.color ?? "neutral"} title={f}>
                {m?.label ?? f.replace(/_/g, " ")}
              </Badge>
            );
          })}
        </span>
      );
    }
    return (
      <ul className="grid min-w-[14rem] max-w-[30rem] gap-1">
        {items.map((it, i) => (
          <li key={i} className="leading-snug">
            {it}
          </li>
        ))}
      </ul>
    );
  }

  if (col.kind === "bool" || typeof value === "boolean") {
    const yes = value === true || String(value).toLowerCase() === "true";
    if (col.key === "action_overdue") return yes ? <Badge color="red">Overdue</Badge> : <span>No</span>;
    return <span className={yes ? "font-medium text-ink" : undefined}>{yes ? "Yes" : "No"}</span>;
  }

  if (typeof value === "number") {
    const q = /quota/i.test(col.key) ? formatQuota(value) : null;
    return <span className="num">{q ?? formatNumber(value)}</span>;
  }
  if (col.kind === "int") return <span className="num">{String(value)}</span>;

  const s = String(value);
  if (STATUS_KEYS.has(col.key)) return <Tag tone={statusTone(s)}>{s}</Tag>;
  if (SIZE_KEYS.has(col.key)) return <SizeTag value={s} />;
  if (CODE_KEYS.has(col.key)) return <span className="code whitespace-nowrap text-ink">{s}</span>;
  if (col.key === "name") return <span className="whitespace-nowrap font-medium text-ink">{s}</span>;
  if (col.key === "unit" && s.length <= 28) return <span className="whitespace-nowrap">{s}</span>;
  return <span className={cn(s.length > 40 && "block min-w-[14rem] max-w-[30rem] leading-snug")}>{s}</span>;
}

/**
 * A run table. Keeps the API's row order (the backend sorts each list, e.g.
 * soonest DOS first). The frame scrolls both ways; the header and the Name
 * column stay put while it does.
 */
export function RunTable({
  label,
  columns,
  rows,
  empty = "No members on this list.",
}: {
  label: string;
  columns: RunColumn[];
  rows: Row[];
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="rounded-2 border border-line bg-surface px-4 py-3 text-sm text-ink-3">{empty}</p>;
  }
  const sticky = (c: RunColumn) => c.key === "name";
  return (
    <Table label={label} wrapperClassName="max-h-[70vh] overflow-y-auto">
      <THead>
        <tr>
          {columns.map((c) => (
            <TH
              key={c.key}
              className={cn(
                "z-10",
                (c.kind === "int" || c.kind === "number" || c.kind === "float") && "text-right",
                sticky(c) && "left-0 z-20 shadow-[inset_-1px_0_0_rgb(var(--line))]",
              )}
            >
              {c.label}
            </TH>
          ))}
        </tr>
      </THead>
      <TBody>
        {rows.map((r, i) => (
          <TR key={i}>
            {columns.map((c) =>
              sticky(c) ? (
                <th
                  key={c.key}
                  scope="row"
                  className="sticky left-0 z-[1] border-b border-line bg-surface px-2.5 py-2 text-left align-top font-normal shadow-[inset_-1px_0_0_rgb(var(--line))]"
                >
                  <CellValue col={c} value={r[c.key]} />
                </th>
              ) : (
                <TD
                  key={c.key}
                  className={cn(
                    "!align-top",
                    (c.kind === "int" || c.kind === "number" || c.kind === "float") && "text-right",
                  )}
                >
                  <CellValue col={c} value={r[c.key]} />
                </TD>
              ),
            )}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
