import type {
  RosterCell,
  RosterDefinition,
  RosterParam,
  RosterParamValues,
  RosterUploadResponse,
} from "@/types";

export type FormValues = Record<string, string>;

export interface Availability {
  state: "unknown" | "available" | "missing";
  missing: string[];
}

/** Whether a roster can run against the uploaded columns. */
export function availabilityOf(
  def: RosterDefinition,
  upload: RosterUploadResponse | null,
): Availability {
  if (!upload) return { state: "unknown", missing: [] };
  const found = new Set(upload.columns_found.map((c) => c.toUpperCase()));
  const missing =
    def.missing_columns ??
    def.required_columns.filter((c) => !found.has(c.toUpperCase()));
  const available = def.available ?? missing.length === 0;
  return { state: available ? "available" : "missing", missing };
}

export const isRequired = (p: RosterParam) => p.default === null || p.default === undefined;

export function initialValues(def: RosterDefinition): FormValues {
  const v: FormValues = {};
  for (const p of def.params) v[p.name] = isRequired(p) ? "" : String(p.default);
  return v;
}

/** Validates form values and converts them to the API payload. */
export function buildParams(
  def: RosterDefinition,
  values: FormValues,
): { params: RosterParamValues; errors: Record<string, string> } {
  const params: RosterParamValues = {};
  const errors: Record<string, string> = {};
  for (const p of def.params) {
    const raw = (values[p.name] ?? "").trim();
    if (raw === "") {
      if (isRequired(p)) errors[p.name] = "Required — enter a value to run this roster.";
      else params[p.name] = p.default;
      continue;
    }
    if (p.type === "int") {
      const n = Number(raw);
      if (!Number.isInteger(n)) {
        errors[p.name] = "Enter a whole number.";
        continue;
      }
      params[p.name] = n;
    } else if (p.type === "enum") {
      if (p.options && p.options.length && !p.options.includes(raw)) {
        errors[p.name] = "Choose one of the listed options.";
        continue;
      }
      params[p.name] = raw;
    } else {
      params[p.name] = raw; // canonical YYYY-MM-DD from SmartDateInput
    }
  }
  return { params, errors };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCell(v: RosterCell): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return new Intl.NumberFormat("en-US").format(v);
  const s = String(v);
  const iso = s.length >= 10 && ISO_DATE.test(s.slice(0, 10)) && (s.length === 10 || s[10] === "T");
  if (iso) {
    const [y, m, d] = s.slice(0, 10).split("-");
    const mi = Number(m);
    if (mi >= 1 && mi <= 12) return `${d} ${MONTHS[mi - 1]} ${y}`;
  }
  return s;
}

export function compareCells(a: RosterCell, b: RosterCell): number {
  const aNull = a === null || a === undefined || a === "";
  const bNull = b === null || b === undefined || b === "";
  if (aNull && bNull) return 0;
  if (aNull) return 1; // blanks last
  if (bNull) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function isNumericColumn(rows: Record<string, RosterCell>[], key: string): boolean {
  let seen = false;
  for (const r of rows) {
    const v = r[key];
    if (v === null || v === undefined || v === "") continue;
    if (typeof v !== "number") return false;
    seen = true;
  }
  return seen;
}
