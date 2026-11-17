/**
 * Roster runs (retention + BTZ). Each run takes its own alpha-roster file.
 * Shapes follow pace-backend routers/roster_runs.py (module docstring).
 */

/**
 * Runs known when this was built, in display order. The live list comes from
 * GET /rosters/runs, so a run added on the backend appears on the upload page
 * and in the rail without a frontend change; this list is only the fallback
 * while that loads (and the order known runs sort into).
 */
export const RUN_IDS = [
  "dos-reenlistment",
  "deros-option",
  "re-code-review",
  "cjr-window",
  "btz-quarterly",
] as const;

/** Any run id the backend offers (not only the ones listed above). */
export type RunId = string;

/** Short names for the rail and buttons (the API label is the full title). */
const RUN_SHORT_KNOWN: Record<string, string> = {
  "dos-reenlistment": "DOS / Reenlistment",
  "deros-option": "DEROS Option",
  "re-code-review": "RE Code Review",
  "cjr-window": "CJR Window",
  "btz-quarterly": "SrA BTZ Quarterly",
};

export function runShort(id: string, label?: string): string {
  return RUN_SHORT_KNOWN[id] ?? label ?? id;
}

export interface QuarterOption {
  id: string;
  label: string;
  default?: boolean;
}

export interface RunParam {
  name: string;
  label: string;
  type: "int" | "prefix_list" | "quarter" | string;
  default: unknown;
  unit?: string | null;
  help?: string | null;
  citation?: string | null;
  min?: number;
  max?: number;
  options?: QuarterOption[];
}

export interface RuleReference {
  rule: string;
  value: string;
  citation: string;
  note?: string;
}

export interface RunMeta {
  id: RunId;
  label: string;
  description: string;
  duty: string[];
  required_columns: string[];
  optional_columns: string[];
  params: RunParam[];
  formats: string[];
  rule_references: RuleReference[];
}

export interface RunsListResponse {
  as_of: string;
  runs: RunMeta[];
}

export type ColumnKind = "text" | "date" | "int" | "list" | "bool" | string;

export interface RunColumn {
  key: string;
  label: string;
  kind: ColumnKind;
}

export type Cell = string | number | boolean | null | string[] | undefined;
export type Row = Record<string, Cell>;

export interface RunBucket {
  id: string;
  label: string;
  description?: string;
  count: number;
  columns: RunColumn[] | string[];
  rows: Row[];
}

export interface BtzQuarter {
  id: string;
  label: string;
  btz_date_start: string;
  btz_date_end: string;
  processing_months: string[];
  board_month: string;
}

export interface BtzUnit {
  pascode: string;
  unit: string;
  eligible_count: number;
  size: "LARGE" | "SMALL" | string;
  /** Exact 15% quota; the MPF determines the whole number. */
  quota: number | null;
  /** Server-formatted quota, e.g. "1.65". Shown when present. */
  quota_display?: string | null;
  quota_note: string;
}

export interface BtzCbb {
  pool_units: string[];
  pool_total: number;
  quota: number | null;
  quota_display?: string | null;
  quota_note?: string | null;
  note: string;
  policy_note?: string | null;
  requires_base_wide_roster: boolean;
  label: string;
}

export interface RunResult {
  run_id: RunId;
  title: string;
  duty: string[];
  as_of: string;
  as_of_display: string;
  params: Record<string, unknown>;
  main_label: string;
  columns: RunColumn[];
  rows: Row[];
  buckets: RunBucket[];
  summary: Record<string, unknown>;
  warnings: string[];
  notes: string[];
  footer: string;
  pascodes: string[];
  pascode_filter?: string[];
  quarter?: BtzQuarter;
  quarter_options?: QuarterOption[];
  units?: BtzUnit[];
  cbb?: BtzCbb;
}

export interface RunRequest {
  as_of_date?: string;
  params?: Record<string, unknown>;
  pascodes?: string[];
}
