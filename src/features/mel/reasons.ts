/**
 * Plain-language explanations for the eligibility engine's raw reason strings.
 * The raw string is always shown underneath in mono, so admins can trace a row to
 * the rule. Patterns are deliberately loose; anything unrecognised returns the raw
 * text unchanged (shown once, without a duplicate mono line).
 */
const RULES: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/\bTIG\b[^0-9]*<\s*(\d+)\s*month/i, (m) => `Under ${m[1]} months time in grade`],
  [/\bTIS\b[^0-9]*<\s*(\d+)\s*year/i, (m) => `Under ${m[1]} years time in service`],
  [/\bTIG\b/i, () => "Time in grade requirement not met"],
  [/\bTIS\b/i, () => "Time in service requirement not met"],
  [/\bHYT\b|high year/i, () => "Reaches high year of tenure before the promotion date"],
  [/\bUIF\b/i, () => "Unfavourable information file (UIF) on record"],
  [/skill level/i, () => "PAFSC skill level too low for this cycle"],
  [/date[^.]*(missing|unreadable|invalid)|(missing|unreadable|invalid)[^.]*date/i, () => "A required date is missing or unreadable"],
  [/missing|unreadable|blank/i, () => "Required roster data is missing or unreadable"],
  [/\bRE\b|reenl/i, () => "Reenlistment eligibility code makes the member ineligible"],
];

const CATEGORY_DEFAULTS: Record<string, string> = {
  btz: "Below-the-zone candidate",
  small_unit: "Rated by the small-unit senior rater",
};

export function explainReason(raw: string | null | undefined, category?: string): string | null {
  const r = (raw ?? "").trim();
  if (!r) return category ? CATEGORY_DEFAULTS[category] ?? null : null;
  for (const [re, fn] of RULES) {
    const m = r.match(re);
    if (m) return fn(m);
  }
  return r;
}
