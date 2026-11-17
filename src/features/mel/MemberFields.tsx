import type { ReactNode } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SmartDateInput } from "@/components/ui/SmartDateInput";

export const MEMBER_GRADES = [
  { value: "AB", label: "AB – Airman Basic" },
  { value: "AMN", label: "AMN – Airman" },
  { value: "A1C", label: "A1C – Airman First Class" },
  { value: "SRA", label: "SRA – Senior Airman" },
  { value: "SSG", label: "SSG – Staff Sergeant" },
  { value: "TSG", label: "TSG – Technical Sergeant" },
  { value: "MSG", label: "MSG – Master Sergeant" },
  { value: "SMS", label: "SMS – Senior Master Sergeant" },
  { value: "CMS", label: "CMS – Chief Master Sergeant" },
];

export type MemberFieldKey =
  | "FULL_NAME"
  | "GRADE"
  | "ASSIGNED_PAS"
  | "ASSIGNED_PAS_CLEARTEXT"
  | "PAFSC"
  | "DAFSC"
  | "DOR"
  | "TAFMSD"
  | "DATE_ARRIVED_STATION"
  | "REENL_ELIG_STATUS"
  | "UIF_CODE"
  | "UIF_DISPOSITION_DATE";

type SectionKey = "identity" | "time" | "assignment" | "afsc" | "reenl";

/** Puts the section holding the flagged field first, so the fix is what you see. */
export function sectionOrderFor(reason?: string | null): SectionKey[] {
  const base: SectionKey[] = ["identity", "time", "assignment", "afsc", "reenl"];
  const r = (reason ?? "").toLowerCase();
  let first: SectionKey | null = null;
  if (/tig|tis|dor|tafmsd|hyt|date|tenure/.test(r)) first = "time";
  else if (/afsc|skill/.test(r)) first = "afsc";
  else if (/uif|reenl|\bre\b/.test(r)) first = "reenl";
  return first ? [first, ...base.filter((s) => s !== first)] : base;
}

interface MemberFieldsProps {
  idPrefix: string;
  val: (k: MemberFieldKey) => string;
  set: (k: MemberFieldKey, v: string) => void;
  edited?: (k: MemberFieldKey) => boolean;
  order?: SectionKey[];
  /** Fields that are optional (shows "Optional" after the label). */
  optional?: MemberFieldKey[];
}

function Sec({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-2.5 border-t border-line py-3.5 first:border-t-0 first:pt-1 md:grid-cols-[150px_minmax(0,1fr)] md:gap-4">
      <h3 className="pt-0.5 text-[13px] font-semibold text-ink">
        {title}
        {sub ? <small className="mt-0.5 block text-[12.5px] font-normal text-ink-3">{sub}</small> : null}
      </h3>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function MemberFields({
  idPrefix,
  val,
  set,
  edited = () => false,
  order = ["identity", "time", "assignment", "afsc", "reenl"],
  optional = ["UIF_CODE", "UIF_DISPOSITION_DATE"],
}: MemberFieldsProps) {
  const id = (k: MemberFieldKey) => `${idPrefix}-${k}`;
  const opt = (k: MemberFieldKey) => optional.includes(k);
  const text = (k: MemberFieldKey, label: string, extra: Partial<Parameters<typeof Input>[0]> = {}) => (
    <Input
      id={id(k)}
      label={label}
      value={val(k)}
      onChange={(e) => set(k, e.target.value)}
      edited={edited(k)}
      optional={opt(k)}
      {...extra}
    />
  );
  const date = (k: MemberFieldKey, label: string, hint?: string) => (
    <SmartDateInput
      id={id(k)}
      label={label}
      value={val(k)}
      onChange={(v) => set(k, v)}
      edited={edited(k)}
      optional={opt(k)}
      hint={hint}
    />
  );

  const sections: Record<SectionKey, ReactNode> = {
    identity: (
      <Sec key="identity" title="Identity">
        {text("FULL_NAME", "Full name", { placeholder: "LAST, FIRST M." })}
        <Select
          id={id("GRADE")}
          label="Grade"
          value={val("GRADE")}
          onChange={(e) => set("GRADE", e.target.value)}
          edited={edited("GRADE")}
        >
          <option value="">Select grade…</option>
          {MEMBER_GRADES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </Sec>
    ),
    time: (
      <Sec key="time" title="Time in grade / service" sub="Dates as DD-MMM-YYYY">
        {date("DOR", "Date of rank (DOR)")}
        {date("TAFMSD", "TAFMSD", "Total Active Federal Military Service Date · DD-MMM-YYYY")}
      </Sec>
    ),
    assignment: (
      <Sec key="assignment" title="Assignment">
        {text("ASSIGNED_PAS", "Assigned PAS", { mono: true, placeholder: "e.g. HAAC6L00" })}
        {date("DATE_ARRIVED_STATION", "Date arrived station")}
        <div className="sm:col-span-2">
          {text("ASSIGNED_PAS_CLEARTEXT", "Unit name", {
            placeholder: "e.g. 1st Information Systems Sq",
            hint: "Column ASSIGNED_PAS_CLEARTEXT",
          })}
        </div>
      </Sec>
    ),
    afsc: (
      <Sec key="afsc" title="AFSC">
        {text("PAFSC", "PAFSC", { mono: true, placeholder: "e.g. 3F051", hint: "Primary AFSC" })}
        {text("DAFSC", "DAFSC", { mono: true, placeholder: "e.g. 3F051", hint: "Duty AFSC" })}
      </Sec>
    ),
    reenl: (
      <Sec key="reenl" title="Reenlistment & UIF">
        {text("REENL_ELIG_STATUS", "RE code", { mono: true, placeholder: "e.g. 1A" })}
        {text("UIF_CODE", "UIF code", { mono: true, placeholder: "Blank if none" })}
        {date("UIF_DISPOSITION_DATE", "UIF disposition date")}
      </Sec>
    ),
  };

  return <div>{order.map((k) => sections[k])}</div>;
}
