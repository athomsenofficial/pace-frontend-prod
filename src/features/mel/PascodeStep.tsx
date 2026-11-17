import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Copy, FileCheck2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { controlClasses } from "@/components/ui/Field";
import { apiClient, type MelType } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ActionBar, PageHeader } from "./WizardShell";

const OFFICER_RANKS = [
  { value: "2d Lt", label: "2d Lt - Second Lieutenant" },
  { value: "1st Lt", label: "1st Lt - First Lieutenant" },
  { value: "Capt", label: "Capt - Captain" },
  { value: "Maj", label: "Maj - Major" },
  { value: "Lt Col", label: "Lt Col - Lieutenant Colonel" },
  { value: "Col", label: "Col - Colonel" },
  { value: "Brig Gen", label: "Brig Gen - Brigadier General" },
  { value: "Maj Gen", label: "Maj Gen - Major General" },
  { value: "Lt Gen", label: "Lt Gen - Lieutenant General" },
  { value: "Gen", label: "Gen - General" },
];

export interface PascodeEntry {
  srid: string;
  senior_rater_rank: string;
  senior_rater_title: string;
  senior_rater_first_name: string;
  senior_rater_middle_name: string;
  senior_rater_last_name: string;
  commander_rank: string;
  commander_title: string;
  commander_first_name: string;
  commander_middle_name: string;
  commander_last_name: string;
}

/**
 * Every unit (and the small-unit senior rater block) starts filled with example
 * values that pass validation unchanged, so a user can click straight through
 * (owner decision, 17-NOV-2026). They are real values, not placeholders; the
 * step shows a note asking for the real names before a MEL is used.
 * pascode_map values from the session and the user's draft still override them.
 */
export const EXAMPLE_SRID = "1234567";

const blankEntry = (): PascodeEntry => ({
  srid: EXAMPLE_SRID,
  senior_rater_rank: "Col",
  senior_rater_title: "Commander",
  senior_rater_first_name: "FIRST",
  senior_rater_middle_name: "M",
  senior_rater_last_name: "LAST",
  commander_rank: "Lt Col",
  commander_title: "Commander",
  commander_first_name: "FIRST",
  commander_middle_name: "M",
  commander_last_name: "LAST",
});

export type PascodeDraft = {
  entries: Record<string, PascodeEntry>;
  smallUnitSr: PascodeEntry;
};

interface SessionData {
  session_id: string;
  cycle?: string;
  pascodes?: string[];
  pascode_unit_map?: Record<string, string>;
  pascode_map?: Record<string, unknown>;
  small_unit_sr?: unknown;
  senior_rater_needed?: boolean;
  categories?: {
    small_unit?: Array<{ ASSIGNED_PAS?: string }>;
  };
}

interface PascodeStepProps {
  sessionData: SessionData;
  type: MelType;
  onSubmitted: (pdfBlob: Blob) => void;
  /** Return to Review & Edit. What's typed here is kept via draft/onDraftChange. */
  onBack?: () => void;
  draft?: PascodeDraft | null;
  onDraftChange?: (draft: PascodeDraft) => void;
  /** Header meta line (Step 3 of 4 · Initial MEL · SSG · 2026). */
  meta?: ReactNode;
  /** Reports completion to the step rail. */
  onProgressChange?: (p: { complete: number; total: number }) => void;
}

export function PascodeStep({
  sessionData,
  type,
  onSubmitted,
  onBack,
  draft,
  onDraftChange,
  meta,
  onProgressChange,
}: PascodeStepProps) {
  const pascodes = useMemo(
    () => sessionData.pascodes ?? [],
    [sessionData.pascodes],
  );
  const pascodeUnitMap = sessionData.pascode_unit_map ?? {};
  const smallUnitPascodes = useMemo(
    () =>
      sessionData.categories?.small_unit
        ?.map((m) => m.ASSIGNED_PAS)
        .filter((p): p is string => !!p) ?? [],
    [sessionData.categories],
  );

  const [entries, setEntries] = useState<Record<string, PascodeEntry>>({});
  const [smallUnitSr, setSmallUnitSr] = useState<PascodeEntry>(blankEntry);
  const [activeTab, setActiveTab] = useState<string>(pascodes[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, PascodeEntry> = {};
    pascodes.forEach((p) => {
      const existing = (sessionData.pascode_map?.[p] ?? {}) as Partial<PascodeEntry>;
      next[p] = { ...blankEntry(), ...existing, ...(draft?.entries?.[p] ?? {}) };
    });
    setEntries(next);
    if (sessionData.senior_rater_needed) {
      const seed = (sessionData.small_unit_sr ?? {}) as Partial<PascodeEntry>;
      setSmallUnitSr({ ...blankEntry(), ...seed, ...(draft?.smallUnitSr ?? {}) });
    }
    if (!activeTab && pascodes[0]) setActiveTab(pascodes[0]);
  }, [pascodes, sessionData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep what's been typed if the user goes Back to Review & Edit and returns.
  useEffect(() => {
    if (Object.keys(entries).length) onDraftChange?.({ entries, smallUnitSr });
  }, [entries, smallUnitSr]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycle = sessionData.cycle ?? "";
  const requiresSrDetail = (pascode: string) =>
    cycle === "MSG" || cycle === "SMS"
      ? true
      : smallUnitPascodes.includes(pascode);

  const updateEntry = (
    pascode: string,
    key: keyof PascodeEntry,
    value: string,
  ) =>
    setEntries((prev) => ({
      ...prev,
      [pascode]: { ...(prev[pascode] ?? blankEntry()), [key]: value },
    }));

  const updateSmallUnitSr = (key: keyof PascodeEntry, value: string) =>
    setSmallUnitSr((prev) => ({ ...prev, [key]: value }));

  const isCommanderFilled = (e: PascodeEntry) =>
    !!(
      e.commander_rank &&
      e.commander_title?.trim() &&
      e.commander_first_name?.trim() &&
      e.commander_last_name?.trim()
    );
  const isSridFilled = (e: PascodeEntry) => !!e.srid?.trim();
  const isSrFilled = (e: PascodeEntry) =>
    !!(
      e.senior_rater_rank &&
      e.senior_rater_title?.trim() &&
      e.senior_rater_first_name?.trim() &&
      e.senior_rater_last_name?.trim()
    );

  // Plain-language list of what still blocks "Generate PDF".
  const missingItems = (): string[] => {
    const out: string[] = [];
    const check = (label: string, e: PascodeEntry, needSr: boolean) => {
      const gaps: string[] = [];
      if (!e.commander_first_name?.trim() || !e.commander_last_name?.trim()) gaps.push("commander name");
      if (!e.commander_rank || !e.commander_title?.trim()) gaps.push("commander rank/title");
      if (!e.srid?.trim()) gaps.push("SRID");
      if (needSr && (!e.senior_rater_first_name?.trim() || !e.senior_rater_last_name?.trim()))
        gaps.push("senior rater name");
      if (needSr && (!e.senior_rater_rank || !e.senior_rater_title?.trim())) gaps.push("senior rater rank/title");
      if (gaps.length) out.push(`${label}: ${gaps.join(", ")}`);
    };
    Object.entries(entries).forEach(([p, e]) => check(p, e, requiresSrDetail(p)));
    if (sessionData.senior_rater_needed) check("Small unit senior rater", smallUnitSr, true);
    return out;
  };

  const canSubmit = () => {
    const allPascodesOk = Object.entries(entries).every(([p, e]) => {
      const cmd = isCommanderFilled(e);
      const sr = isSridFilled(e);
      const detail = !requiresSrDetail(p) || isSrFilled(e);
      return cmd && sr && detail;
    });
    const smallUnitOk =
      !sessionData.senior_rater_needed ||
      (isCommanderFilled(smallUnitSr) &&
        isSridFilled(smallUnitSr) &&
        isSrFilled(smallUnitSr));
    return allPascodesOk && smallUnitOk;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, PascodeEntry> = {};
      Object.entries(entries).forEach(([p, e]) => {
        payload[p] = trimEntry(e);
      });
      if (sessionData.senior_rater_needed) {
        (payload as Record<string, unknown>).small_unit_sr = trimEntry(smallUnitSr);
      }
      const res = await apiClient.post(
        `/api/${type}/submit/pascode-info`,
        {
          session_id: sessionData.session_id,
          pascode_info: payload,
        },
        { responseType: "blob" },
      );
      onSubmitted(res.data as Blob);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(
        err?.response?.data?.detail || err?.message || "Submission failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
     UI (unit list, per-unit form, prints-as preview, copy-from).
     Everything above this line is the shipped validation / submit logic.
     ------------------------------------------------------------------ */
  const SMALL = "__small__";
  const unitKeys = [...pascodes, ...(sessionData.senior_rater_needed ? [SMALL] : [])];
  const current = unitKeys.includes(activeTab) ? activeTab : (unitKeys[0] ?? "");
  const entryFor = (k: string): PascodeEntry =>
    k === SMALL ? smallUnitSr : (entries[k] ?? blankEntry());
  const needSrFor = (k: string) => (k === SMALL ? true : requiresSrDetail(k));
  const changeFor = (k: string) => (key: keyof PascodeEntry, value: string) =>
    k === SMALL ? updateSmallUnitSr(key, value) : updateEntry(k, key, value);
  const unitLabel = (k: string) => (k === SMALL ? "Small unit senior rater" : k);
  const smallUnitList = Array.from(new Set(smallUnitPascodes));
  // FD NAME is left off the unit data block on MSG and SMS cycles.
  const fdNameHidden = cycle === "MSG" || cycle === "SMS";

  const [showErrors, setShowErrors] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [copySel, setCopySel] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLDivElement>(null);
  const formTopRef = useRef<HTMLHeadingElement>(null);

  // Field-level gaps, mirroring canSubmit() exactly.
  const missingFields = (e: PascodeEntry, needSr: boolean) => {
    const out: Array<{ key: keyof PascodeEntry; label: string; msg: string }> = [];
    if (!e.commander_rank) out.push({ key: "commander_rank", label: "Commander rank", msg: "Choose the commander's rank." });
    if (!e.commander_title?.trim()) out.push({ key: "commander_title", label: "Commander title", msg: "Enter the commander's title." });
    if (!e.commander_first_name?.trim()) out.push({ key: "commander_first_name", label: "Commander first name", msg: "Enter the commander's first name." });
    if (!e.commander_last_name?.trim()) out.push({ key: "commander_last_name", label: "Commander last name", msg: "Enter the commander's last name." });
    if (!e.srid?.trim()) out.push({ key: "srid", label: "Senior rater ID (SRID)", msg: "Enter the senior rater ID (SRID)." });
    if (needSr) {
      if (!e.senior_rater_rank) out.push({ key: "senior_rater_rank", label: "Senior rater rank", msg: "Choose the senior rater's rank." });
      if (!e.senior_rater_title?.trim()) out.push({ key: "senior_rater_title", label: "Senior rater title", msg: "Enter the senior rater's title." });
      if (!e.senior_rater_first_name?.trim()) out.push({ key: "senior_rater_first_name", label: "Senior rater first name", msg: "Enter the senior rater's first name." });
      if (!e.senior_rater_last_name?.trim()) out.push({ key: "senior_rater_last_name", label: "Senior rater last name", msg: "Enter the senior rater's last name." });
    }
    return out;
  };

  const unitStatus = (k: string) => {
    const e = entryFor(k);
    const n = missingFields(e, needSrFor(k)).length;
    if (n === 0) return { kind: "ok" as const, n };
    const started = [
      e.commander_first_name,
      e.commander_last_name,
      e.srid,
      e.senior_rater_first_name,
      e.senior_rater_last_name,
    ].some((v) => v?.trim());
    return { kind: started ? ("part" as const) : ("none" as const), n };
  };

  const completeCount = unitKeys.filter((k) => unitStatus(k).kind === "ok").length;
  useEffect(() => {
    onProgressChange?.({ complete: completeCount, total: unitKeys.length });
  }, [completeCount, unitKeys.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fid = (k: string, key: keyof PascodeEntry) =>
    `fd-${k.replace(/[^A-Za-z0-9_-]/g, "_")}-${key}`;

  const SR_KEYS: Array<keyof PascodeEntry> = [
    "srid",
    "senior_rater_rank",
    "senior_rater_title",
    "senior_rater_first_name",
    "senior_rater_middle_name",
    "senior_rater_last_name",
  ];
  const copySr = (from: string, to: string) => {
    const src = entryFor(from);
    const set = changeFor(to);
    SR_KEYS.forEach((key) => set(key, src[key] ?? ""));
    setCopied(`Copied the senior rater from ${unitLabel(from)}.`);
  };

  // Copies the complete senior rater identity (SRID, rank, title, names) from
  // one unit to every other unit and to the small-unit senior rater block.
  // Commander fields are left alone: commanders differ per unit.
  const applySeniorRaterToAll = (from: string) => {
    const src = entryFor(from);
    if (!src.srid?.trim()) return;
    const sr = Object.fromEntries(SR_KEYS.map((key) => [key, src[key] ?? ""])) as Partial<PascodeEntry>;
    const targets = unitKeys.filter((k) => k !== from);
    setEntries((prev) => {
      const next = { ...prev };
      for (const k of targets) if (k !== SMALL) next[k] = { ...(prev[k] ?? blankEntry()), ...sr };
      return next;
    });
    if (targets.includes(SMALL)) setSmallUnitSr((prev) => ({ ...prev, ...sr }));
    setCopied(`Senior rater copied to ${targets.length} unit${targets.length === 1 ? "" : "s"}.`);
  };

  const select = (k: string) => {
    setActiveTab(k);
    setCopied(null);
    setCopySel("");
  };

  const goNext = () => {
    setShowErrors((s) => new Set(s).add(current));
    if (missingFields(entryFor(current), needSrFor(current)).length) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    const i = unitKeys.indexOf(current);
    if (i >= 0 && i < unitKeys.length - 1) {
      select(unitKeys[i + 1]);
      window.setTimeout(() => formTopRef.current?.focus(), 0);
    }
  };

  const flagAll = () => {
    setShowErrors(new Set(unitKeys));
    const firstOpen = unitKeys.find((k) => unitStatus(k).kind !== "ok");
    if (firstOpen) select(firstOpen);
    window.setTimeout(() => stillRef.current?.focus(), 0);
  };

  const onFormSubmit = (ev: FormEvent) => {
    if (!canSubmit()) {
      ev.preventDefault();
      flagAll();
      return;
    }
    submit(ev);
  };

  if (pascodes.length === 0) {
    return (
      <>
        <PageHeader meta={meta} title="Force distributor" />
        <div className="msg msg-warn mt-6">
          No PASCODEs detected for this session. Verify the roster step and ensure members
          include PASCODE assignments before continuing.
        </div>
        <div className="flex-1" />
        <ActionBar
          back={
            onBack ? (
              <Button variant="tertiary" onClick={onBack} leftIcon={<ArrowLeft />}>
                Back to Review &amp; Edit
              </Button>
            ) : null
          }
        />
      </>
    );
  }

  const curEntry = entryFor(current);
  const curMissing = missingFields(curEntry, needSrFor(current));
  const curErr = showErrors.has(current)
    ? Object.fromEntries(curMissing.map((f) => [f.key, f.msg]))
    : ({} as Record<string, string>);
  const copySources = unitKeys.filter(
    (o) =>
      o !== current &&
      (entryFor(o).srid?.trim() ||
        entryFor(o).senior_rater_last_name?.trim() ||
        entryFor(o).senior_rater_first_name?.trim()),
  );
  const copyFrom = copySources.includes(copySel) ? copySel : copySources[0];
  const curIdx = unitKeys.indexOf(current);
  const nextKey = unitKeys[curIdx + 1];
  const okToSubmit = canSubmit();
  const unitName = current === SMALL ? null : pascodeUnitMap[current];

  const renderUnitForm = (k: string) => {
    const e = entryFor(k);
    const onChange = changeFor(k);
    const showSrDetail = needSrFor(k);
    const err = (key: keyof PascodeEntry) => curErr[key];
    return (
      <>
        <fieldset className="panel min-w-0">
          <legend className="float-left flex w-full flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5 text-base font-semibold text-ink">
            Unit commander
            <span className="text-[13px] font-normal text-ink-3">
              {k === SMALL ? smallUnitList.join(", ") || "Small units" : [k, unitName].filter(Boolean).join(" · ")}
            </span>
          </legend>
          <div className="clear-both grid gap-4 px-5 pb-5 pt-[18px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[260px_minmax(0,1fr)]">
              <Select
                id={fid(k, "commander_rank")}
                label="Rank"
                value={e.commander_rank}
                onChange={(ev) => onChange("commander_rank", ev.target.value)}
                disabled={submitting}
                options={OFFICER_RANKS}
                error={err("commander_rank")}
              />
              <Input
                id={fid(k, "commander_title")}
                label="Title"
                value={e.commander_title}
                onChange={(ev) => onChange("commander_title", ev.target.value)}
                disabled={submitting}
                placeholder="Commander"
                error={err("commander_title")}
              />
            </div>
            <NameRow
              ids={[fid(k, "commander_first_name"), fid(k, "commander_middle_name"), fid(k, "commander_last_name")]}
              values={[e.commander_first_name, e.commander_middle_name, e.commander_last_name]}
              errors={[err("commander_first_name"), undefined, err("commander_last_name")]}
              onChange={[
                (v) => onChange("commander_first_name", v),
                (v) => onChange("commander_middle_name", v),
                (v) => onChange("commander_last_name", v),
              ]}
              disabled={submitting}
            />
            {k === SMALL ? (
              <NotPrinted>
                Not printed. The small-unit page signs as the senior rater below.
              </NotPrinted>
            ) : (
              <PrintsAs
                sig={commanderSignature(e)}
                showFdName={!fdNameHidden}
              />
            )}
          </div>
        </fieldset>

        <fieldset className="panel mt-4 min-w-0">
          <legend className="float-left flex w-full flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5 text-base font-semibold text-ink">
            Senior rater
            {copySources.length ? (
              <span className="flex flex-wrap items-center gap-2 text-sm font-normal">
                {copySources.length > 1 ? (
                  <>
                    <label htmlFor={`copy-${k}`} className="vh">
                      Copy senior rater from
                    </label>
                    <select
                      id={`copy-${k}`}
                      value={copyFrom}
                      onChange={(ev) => setCopySel(ev.target.value)}
                      className={cn(controlClasses, "h-8 w-auto py-0 text-[13px]")}
                    >
                      {copySources.map((o) => (
                        <option key={o} value={o}>
                          {unitLabel(o)}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Copy />}
                  onClick={() => copyFrom && copySr(copyFrom, k)}
                  disabled={submitting}
                >
                  {copySources.length > 1 ? "Copy" : `Copy from ${unitLabel(copyFrom!)}`}
                </Button>
              </span>
            ) : null}
          </legend>
          <div className="clear-both grid gap-4 px-5 pb-5 pt-[18px]">
            {copied ? (
              <p role="status" className="text-[13px] text-elig">
                {copied}
              </p>
            ) : null}
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full max-w-[280px]">
                <Input
                  id={fid(k, "srid")}
                  label="Senior rater ID (SRID)"
                  value={e.srid}
                  onChange={(ev) => onChange("srid", ev.target.value)}
                  disabled={submitting}
                  placeholder="e.g. 1234567"
                  inputMode="numeric"
                  mono
                  error={err("srid")}
                />
              </div>
              {unitKeys.length > 1 ? (
                <Button
                  variant="tertiary"
                  size="sm"
                  className="mb-1"
                  disabled={!e.srid?.trim() || submitting}
                  onClick={() => applySeniorRaterToAll(k)}
                  title="Copy this SRID, rank, title and name to every unit and the small-unit block. Commanders aren't changed."
                >
                  Apply this senior rater to all units
                </Button>
              ) : null}
            </div>
            {showSrDetail ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[260px_minmax(0,1fr)]">
                  <Select
                    id={fid(k, "senior_rater_rank")}
                    label="Rank"
                    value={e.senior_rater_rank}
                    onChange={(ev) => onChange("senior_rater_rank", ev.target.value)}
                    disabled={submitting}
                    options={OFFICER_RANKS}
                    error={err("senior_rater_rank")}
                  />
                  <Input
                    id={fid(k, "senior_rater_title")}
                    label="Title"
                    value={e.senior_rater_title}
                    onChange={(ev) => onChange("senior_rater_title", ev.target.value)}
                    disabled={submitting}
                    placeholder="Commander"
                    hint="e.g. Commander, 99th Test Group"
                    error={err("senior_rater_title")}
                  />
                </div>
                <NameRow
                  ids={[fid(k, "senior_rater_first_name"), fid(k, "senior_rater_middle_name"), fid(k, "senior_rater_last_name")]}
                  values={[e.senior_rater_first_name, e.senior_rater_middle_name, e.senior_rater_last_name]}
                  errors={[err("senior_rater_first_name"), undefined, err("senior_rater_last_name")]}
                  onChange={[
                    (v) => onChange("senior_rater_first_name", v),
                    (v) => onChange("senior_rater_middle_name", v),
                    (v) => onChange("senior_rater_last_name", v),
                  ]}
                  disabled={submitting}
                />
                {k === SMALL ? (
                  <PrintsAs sig={smallUnitSignature(e)} showFdName={!fdNameHidden} />
                ) : (
                  <NotPrinted>
                    Not printed. This unit&apos;s page signs as the commander above.
                  </NotPrinted>
                )}
              </>
            ) : (
              <p className="text-[13px] text-ink-3">
                For this cycle and unit only the SRID is needed. Rank, title and name are asked
                for on MSG and SMS cycles and for small units.
              </p>
            )}
          </div>
        </fieldset>
      </>
    );
  };

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex min-w-0 flex-1 flex-col">
      <PageHeader
        meta={meta}
        title="Force distributor"
        description="Enter the unit commander and senior rater for each unit. These appear in the MEL's signature blocks."
      />

      <p className="msg msg-info mt-[18px] max-w-3xl">
        Example values are filled in so you can continue right away. Replace them with the real
        commander and senior rater before generating a MEL you intend to use.
      </p>

      {error ? (
        <div role="alert" className="msg msg-error mt-[18px]">
          {error}
        </div>
      ) : null}

      <div
        className={cn(
          "mt-[22px] grid grid-cols-1 items-start gap-6",
          unitKeys.length > 1 && "min-[900px]:grid-cols-[240px_minmax(0,1fr)]",
        )}
      >
        {unitKeys.length > 1 ? (
          <nav aria-label="Units">
            <ul className="overflow-hidden rounded-2 border border-line bg-surface">
              <li className="bg-surface-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                Units &middot; {completeCount} of {unitKeys.length} complete
              </li>
              {unitKeys.map((k) => {
                const st = unitStatus(k);
                const active = k === current;
                return (
                  <li key={k} className="border-t border-line">
                    {k === SMALL ? (
                      <div className="border-b border-line bg-surface-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                        Small unit
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => select(k)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative grid w-full gap-0.5 px-3.5 py-3 text-left hover:bg-ground",
                        active &&
                          "bg-ground before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[13.5px] font-medium text-ink",
                          k !== SMALL && "font-mono",
                        )}
                      >
                        {k === SMALL ? "Senior rater" : k}
                      </span>
                      <span className="text-[13px] text-ink-2">
                        {k === SMALL ? smallUnitList.join(", ") || "Small units" : pascodeUnitMap[k] ?? ""}
                      </span>
                      <span
                        className={cn(
                          "mt-1 flex items-center gap-1.5 text-[12.5px] before:h-2 before:w-2 before:rounded-full before:content-['']",
                          st.kind === "ok" && "text-elig before:bg-elig",
                          st.kind === "part" && "text-disc-ink before:bg-disc",
                          st.kind === "none" && "text-ink-3 before:bg-line-strong",
                        )}
                      >
                        {st.kind === "ok"
                          ? "Complete"
                          : st.kind === "part"
                            ? `${st.n} field${st.n === 1 ? "" : "s"} missing`
                            : "Not started"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <div className="min-w-0">
          <h2 ref={formTopRef} tabIndex={-1} className="vh">
            {current === SMALL ? "Small unit senior rater" : [current, unitName].filter(Boolean).join(", ")}
          </h2>
          {showErrors.has(current) && curMissing.length ? (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="msg msg-error mb-4">
              <b>
                {curMissing.length} field{curMissing.length === 1 ? " needs" : "s need"} attention
                for {unitLabel(current)}:
              </b>{" "}
              {curMissing.map((f, i) => (
                <span key={f.key}>
                  {i > 0 ? ", " : ""}
                  <a
                    href={`#${fid(current, f.key)}`}
                    className="text-ink underline"
                    onClick={(ev) => {
                      ev.preventDefault();
                      document.getElementById(fid(current, f.key))?.focus();
                    }}
                  >
                    {f.label}
                  </a>
                </span>
              ))}
              .
            </div>
          ) : null}

          {renderUnitForm(current)}

          {unitKeys.length > 1 ? (
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={goNext}
                disabled={submitting}
                rightIcon={nextKey ? <ArrowRight /> : undefined}
              >
                {nextKey ? `Save and go to ${unitLabel(nextKey)}` : "Check this unit"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {!okToSubmit && !submitting ? (
        <div ref={stillRef} tabIndex={-1} className="msg msg-warn mt-6" aria-live="polite">
          <p className="font-semibold text-ink">Still needed before the PDF can be generated:</p>
          <ul className="mt-1 list-disc pl-5">
            {missingItems().map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex-1" />
      <ActionBar
        back={
          onBack ? (
            <Button
              variant="tertiary"
              onClick={onBack}
              disabled={submitting}
              leftIcon={<ArrowLeft />}
            >
              Back to Review &amp; Edit
            </Button>
          ) : null
        }
        statusTone={okToSubmit ? "ok" : "warn"}
        status={
          okToSubmit
            ? `All ${unitKeys.length === 1 ? "details" : `${unitKeys.length} units`} complete. Generate the PDF when ready.`
            : `${unitKeys.length - completeCount} of ${unitKeys.length} ${unitKeys.length === 1 ? "unit still needs" : "units still need"} details before the PDF can be generated.`
        }
        primary={
          <Button
            type="submit"
            loading={submitting}
            aria-disabled={!okToSubmit || undefined}
            leftIcon={<FileCheck2 />}
          >
            {submitting ? "Generating PDF…" : "Generate PDF"}
          </Button>
        }
      />
    </form>
  );
}

function NameRow({
  ids,
  values,
  errors,
  onChange,
  disabled,
}: {
  ids: [string, string, string];
  values: [string, string, string];
  errors: [string | undefined, undefined, string | undefined];
  onChange: [(v: string) => void, (v: string) => void, (v: string) => void];
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-4 sm:grid-cols-[minmax(0,1fr)_92px_minmax(0,1fr)]">
      <Input
        id={ids[0]}
        label="First name"
        value={values[0]}
        onChange={(e) => onChange[0](e.target.value)}
        disabled={disabled}
        placeholder="FIRST"
        error={errors[0]}
      />
      <Input
        id={ids[1]}
        label="MI"
        optional="opt."
        value={values[1]}
        onChange={(e) => onChange[1](e.target.value)}
        disabled={disabled}
        placeholder="M"
        aria-label="Middle initial (optional)"
      />
      <Input
        id={ids[2]}
        label="Last name"
        value={values[2]}
        onChange={(e) => onChange[2](e.target.value)}
        disabled={disabled}
        placeholder="LAST"
        error={errors[2]}
        wrapperClassName="max-sm:col-span-2"
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   "Prints as" preview. Mirrors the backend exactly (pace-backend
   pdf_utils.format_sig_name / resolve_commander_name,
   initial_mel_generator.py and pdf_templates._add_signature_block):

     line 1  "<FIRST M. LAST>, <rank>, USAF"   (name upper-cased, rank as
             chosen, "USAF" is fixed text whatever the branch)
     line 2  title
     unit    "FD NAME: <last>, <first> <middle>" as typed (not on MSG/SMS)

   Unit pages sign as the commander, with each empty commander name part
   (including the middle name) falling back to the senior rater's, and the
   rank and title falling back to the senior rater's when blank. The
   small-unit page signs as the small-unit senior rater. Verified line for
   line against a live Initial MEL PDF on the test API (backend 5e7d327,
   which keeps commander_title), 17-NOV-2026.
   ------------------------------------------------------------------ */

const tr = (v: string | null | undefined) => (v ?? "").trim();

/** format_sig_name's middle initial: kept as typed if it ends in ".", else its first letter + ".". */
function sigMiddle(middle: string): string {
  const m = tr(middle);
  if (!m) return "";
  return m.endsWith(".") ? m : `${m[0]}.`;
}

/** resolve_commander_name's FD NAME text: "last, first middle", stripped of edge commas/spaces. */
function fdNameText(first: string, middle: string, last: string, fallback: string): string {
  if (!last && !first) return fallback;
  let name = `${last}, ${first}`;
  if (middle) name += ` ${middle}`;
  return name.trim().replace(/^,+|,+$/g, "");
}

interface SignaturePreview {
  first: string;
  middle: string;
  last: string;
  rank: string;
  title: string;
  fdName: string;
}

/** What a unit (PASCODE) page prints for this entry. */
function commanderSignature(e: PascodeEntry): SignaturePreview {
  const first = tr(e.commander_first_name) || tr(e.senior_rater_first_name);
  const middle = tr(e.commander_middle_name) || tr(e.senior_rater_middle_name);
  const last = tr(e.commander_last_name) || tr(e.senior_rater_last_name);
  const srName = [e.senior_rater_first_name, e.senior_rater_middle_name, e.senior_rater_last_name]
    .map(tr)
    .filter(Boolean)
    .join(" ");
  return {
    first,
    middle,
    last,
    rank: tr(e.commander_rank) || tr(e.senior_rater_rank) || "N/A",
    title: tr(e.commander_title) || tr(e.senior_rater_title),
    fdName: fdNameText(first, middle, last, srName),
  };
}

/** What the small-unit page prints for the small-unit senior rater. */
function smallUnitSignature(e: PascodeEntry): SignaturePreview {
  const first = tr(e.senior_rater_first_name);
  const middle = tr(e.senior_rater_middle_name);
  const last = tr(e.senior_rater_last_name);
  return {
    first,
    middle,
    last,
    rank: tr(e.senior_rater_rank) || "N/A",
    title: tr(e.senior_rater_title),
    fdName: [first, middle, last].filter(Boolean).join(" ") || "N/A",
  };
}

function PrintsAs({
  sig,
  showFdName,
}: {
  sig: SignaturePreview;
  /** FD NAME prints in the unit data block on every cycle except MSG and SMS. */
  showFdName?: boolean;
}) {
  const gap = (label: string) => <span className="text-error">[{label}]</span>;
  const mi = sigMiddle(sig.middle);
  return (
    <div className="grid gap-1 rounded-1 border border-dashed border-line-strong bg-ground px-3 py-2.5 text-[13px]">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">Prints as</span>
      <span className="font-mono text-[13px] text-ink [overflow-wrap:anywhere]">
        {sig.first ? sig.first.toUpperCase() : gap("first name")}
        {mi ? ` ${mi.toUpperCase()}` : ""} {sig.last ? sig.last.toUpperCase() : gap("last name")},{" "}
        {sig.rank}, USAF
      </span>
      <span className="font-mono text-[13px] text-ink [overflow-wrap:anywhere]">
        {sig.title || gap("title")}
      </span>
      {showFdName ? (
        <span className="font-mono text-[12.5px] text-ink-3 [overflow-wrap:anywhere]">
          FD NAME: {sig.fdName}
        </span>
      ) : null}
    </div>
  );
}

function NotPrinted({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-1 border border-dashed border-line-strong bg-ground px-3 py-2.5 text-[13px] text-ink-3">
      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.06em]">Prints as</span>
      {children}
    </p>
  );
}

function trimEntry(e: PascodeEntry): PascodeEntry & { senior_rater_name: string } {
  const trimmed = Object.fromEntries(
    Object.entries(e).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
  ) as PascodeEntry;
  const name = [
    trimmed.senior_rater_first_name,
    trimmed.senior_rater_middle_name,
    trimmed.senior_rater_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  return { ...trimmed, senior_rater_name: name };
}
