/**
 * High-impact PII columns in the alpha-roster export that users must delete
 * before uploading to any PACE tool. Owner list, 17-NOV-2026.
 *
 * Deliberately NOT listed (the roster runs need them): DEROS, DOS, ETS, DOE,
 * RNLTD, GAINING_PAS, AVAILABILITY_*, UIF_*, REENL_ELIG_STATUS.
 */
export interface PiiGroup {
  label: string;
  columns: string[];
}

export const HIGH_IMPACT_PII: PiiGroup[] = [
  { label: "Identity / personal", columns: ["SSAN", "DATE_OF_BIRTH", "AGE", "MARITAL_STATUS"] },
  {
    label: "Home contact",
    columns: ["HOME_ADDRESS", "HOME_CITY", "HOME_STATE", "HOME_ZIP_CODE", "HOME_PHONE_NUMBER"],
  },
  {
    label: "Medical / duty-limiting",
    columns: [
      "LIMITATION_CODE",
      "LIMITATION_CODE_CLEARTEXT",
      "LIMITATION_END_DATE",
      "DEPLOY_PHYS_STATUS",
      "DEPLOY_PHYS_STATUS_CLEARTEXT",
      "DEPLOY_PHYS_STOP_DATE",
    ],
  },
  {
    label: "Legal / adverse",
    columns: ["DEPLOY_LEGAL_STATUS", "DEPLOY_LEGAL_STATUS_CLEARTEXT", "DEPLOY_LEGAL_STOP_DATE"],
  },
  { label: "Security", columns: ["SEC_CLR", "TYPE_SEC_INV", "DT_SCTY_INVES_COMPL", "SEC_ELIG_DT"] },
  { label: "Evaluations", columns: ["LAST_EVAL_RATING", "LAST_EVAL_CLOSE_DATE", "PERF_INDICATOR"] },
];

const LISTED = new Set(HIGH_IMPACT_PII.flatMap((g) => g.columns));

/** "SSAN (or any SSN column)": SSAN, SSN, SPOUSE_SSAN, MBR_SSN ... */
const SSN_LIKE = /(^|[^A-Z])SSA?N([^A-Z]|$)/;

const norm = (h: string) => h.trim().toUpperCase();

/** Headers from the file that are on the high-impact list (header names only, never cell values). */
export function findHighImpactPii(headers: string[]): string[] {
  const out: string[] = [];
  for (const raw of headers) {
    const h = norm(raw);
    if (!h) continue;
    if (LISTED.has(h) || SSN_LIKE.test(h)) out.push(raw.trim());
  }
  return Array.from(new Set(out));
}

/**
 * Reads only the header row in the browser (xlsx is loaded on demand). Cell
 * values below row 1 are never read. Returns null if the file can't be read.
 */
export async function readHeaderRow(file: File): Promise<string[] | null> {
  try {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", sheetRows: 1 });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    return ((rows[0] ?? []) as unknown[]).map((h) => String(h ?? "").trim()).filter(Boolean);
  } catch {
    return null;
  }
}
