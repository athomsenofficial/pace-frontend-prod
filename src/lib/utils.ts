export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function buildIso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (y < 100) y += y >= 70 ? 1900 : 2000; // 2-digit year heuristic
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null; // rejects impossible dates like Feb 30
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/**
 * Parse a human-typed date into canonical "YYYY-MM-DD".
 * Accepts: 2024-03-15, 2024/03/15, 20240315, 03/15/2024, 3-15-24,
 * 15 Mar 2024, 15-Mar-2024, Mar 15 2024, March 15, 2024, etc.
 * Returns "" for empty input, or null if it can't be parsed.
 * All-numeric ambiguous values are read US-style (Month/Day/Year).
 */
export function parseFlexibleDate(input: string): string | null {
  const s = (input ?? "").trim();
  if (!s) return "";

  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/); // YYYY-MM-DD / YYYY/MM/DD
  if (m) return buildIso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/); // YYYYMMDD
  if (m) return buildIso(+m[1], +m[2], +m[3]);

  const tokens = s.split(/[\s,./-]+/).filter(Boolean);
  if (tokens.length === 3) {
    const lower = tokens.map((t) => t.toLowerCase());
    const monthIdx = lower.findIndex((t) => t in MONTHS);
    if (monthIdx >= 0) {
      const month = MONTHS[lower[monthIdx]];
      const rest = tokens.filter((_, i) => i !== monthIdx);
      const a = parseInt(rest[0], 10);
      const b = parseInt(rest[1], 10);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        if (rest[0].length === 4) return buildIso(a, month, b); // YYYY .. DD
        if (rest[1].length === 4) return buildIso(b, month, a); // DD .. YYYY
        return a > 31 ? buildIso(a, month, b) : buildIso(b, month, a);
      }
    } else {
      const n = tokens.map((t) => parseInt(t, 10));
      if (n.every((x) => !Number.isNaN(x))) {
        if (tokens[0].length === 4) return buildIso(n[0], n[1], n[2]); // Y M D
        return buildIso(n[2], n[0], n[1]); // US M D Y (incl. 2-digit year)
      }
    }
  }
  return null;
}

/** Renders canonical "YYYY-MM-DD" as a readable "DD Mmm YYYY" (or passes through). */
export function formatDateReadable(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return value ?? "";
  return `${m[3]} ${MONTH_ABBR[+m[2] - 1]} ${m[1]}`;
}

/**
 * Renders any stored date ("YYYY-MM-DD", "01-JAN-2024", "2024-Jan-01", ...) as the
 * military DD-MMM-YYYY form (01-MAR-2024) without going through Date/toISOString,
 * so there is no timezone shift. Returns "" for empty input and the raw value if
 * it can't be read.
 */
export function formatDateMil(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "";
  const iso = parseFlexibleDate(String(value));
  if (!iso) return String(value);
  const [y, m, d] = iso.split("-");
  return `${d}-${MONTH_ABBR[+m - 1].toUpperCase()}-${y}`;
}

/** Converts an ISO date "YYYY-MM-DD" to backend format "YYYY-Mmm-DD". */
export function toBackendDate(value: string): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  const mi = parseInt(m, 10);
  if (!y || !d || Number.isNaN(mi) || mi < 1 || mi > 12) return value;
  return `${y}-${MONTH_ABBR[mi - 1]}-${d}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface CycleOption {
  value: string;
  label: string;
  full: string;
}

export const CYCLES: CycleOption[] = [
  { value: "SRA", label: "Senior Airman (SRA)", full: "Senior Airman" },
  { value: "SSG", label: "Staff Sergeant (SSG)", full: "Staff Sergeant" },
  { value: "TSG", label: "Technical Sergeant (TSG)", full: "Technical Sergeant" },
  { value: "MSG", label: "Master Sergeant (MSG)", full: "Master Sergeant" },
  { value: "SMS", label: "Senior Master Sergeant (SMS)", full: "Senior Master Sergeant" },
  { value: "CMS", label: "Chief Master Sergeant (CMS)", full: "Chief Master Sergeant" },
];

export interface RankOption {
  value: string;
  label: string;
}

export const OFFICER_RANKS: RankOption[] = [
  { value: "2d Lt", label: "2d Lt – Second Lieutenant" },
  { value: "1st Lt", label: "1st Lt – First Lieutenant" },
  { value: "Capt", label: "Capt – Captain" },
  { value: "Maj", label: "Maj – Major" },
  { value: "Lt Col", label: "Lt Col – Lieutenant Colonel" },
  { value: "Col", label: "Col – Colonel" },
  { value: "Brig Gen", label: "Brig Gen – Brigadier General" },
];

export const ENLISTED_RANKS: RankOption[] = [
  { value: "AB", label: "AB – Airman Basic" },
  { value: "AMN", label: "AMN – Airman" },
  { value: "A1C", label: "A1C – Airman First Class" },
  { value: "SrA", label: "SrA – Senior Airman" },
  { value: "SSgt", label: "SSgt – Staff Sergeant" },
  { value: "TSgt", label: "TSgt – Technical Sergeant" },
  { value: "MSgt", label: "MSgt – Master Sergeant" },
  { value: "SMSgt", label: "SMSgt – Senior Master Sergeant" },
  { value: "CMSgt", label: "CMSgt – Chief Master Sergeant" },
];

export const CIVILIAN_RANKS: RankOption[] = Array.from({ length: 15 }, (_, i) => ({
  value: `GS-${i + 1}`,
  label: `GS-${i + 1}`,
}));

export const SIGNER_BRANCHES: RankOption[] = [
  { value: "USAF", label: "USAF – United States Air Force" },
  { value: "ANG", label: "ANG – Air National Guard" },
  { value: "AFRC", label: "AFRC – Air Force Reserve Command" },
  { value: "DAF", label: "DAF – Dept of the Air Force (Civilian)" },
  { value: "SES", label: "SES – Senior Executive Service" },
];

export const US_STATES: RankOption[] = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC","PR","GU","VI","AE","AP","AA",
].map((s) => ({ value: s, label: s }));
