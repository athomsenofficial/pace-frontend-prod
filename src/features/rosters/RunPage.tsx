import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ChevronRight, Download, FileSpreadsheet, Play } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import { Tag } from "@/components/ui/Badge";
import { api, filenameFromDisposition, parseApiError } from "@/lib/api";
import { cn, downloadBlob, formatDateMil } from "@/lib/utils";
import { ActionBar, MetaLine, PageHeader } from "@/features/mel/WizardShell";
import { ColChips, FileDropper } from "@/features/mel/UploadStep";
import { findHighImpactPii, readHeaderRow } from "@/components/upload/pii";
import { PiiFoundWarning, RemovePiiPanel } from "@/components/upload/PiiPanel";
import { RostersShell } from "./RostersShell";
import { useRunsMeta } from "./useRunsMeta";
import { RunTable, formatNumber, formatQuota, statusTone } from "./cells";
import { BtzPanels } from "./BtzPanels";
import {
  runShort,
  type RunBucket,
  type RunColumn,
  type RunId,
  type RunMeta,
  type RunParam,
  type RunRequest,
  type RunResult,
} from "./types";

/* ------------------------------------------------------------------ helpers */

const pad2 = (n: number) => String(n).padStart(2, "0");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const ACRONYMS = ["DOS", "DEROS", "RE", "CBB", "BTZ", "GSR", "UIF", "HYT", "PAS", "SRP", "CJR", "RIP", "ETS"];

/** total_records -> "Total records"; dos_expired -> "DOS expired". */
function humanize(key: string): string {
  const words = key.split("_").filter(Boolean);
  return words
    .map((w, i) => {
      const up = w.toUpperCase();
      if (up === "REGAF") return "RegAF";
      if (ACRONYMS.includes(up) || /\d/.test(w)) return up;
      return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    })
    .join(" ");
}

type ParamValues = Record<string, string>;

function initialParamText(p: RunParam): string {
  const d = p.default;
  if (Array.isArray(d)) return d.join(", ");
  if (d == null) return "";
  return String(d);
}

function paramsFromText(params: RunParam[], text: ParamValues) {
  const out: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const p of params) {
    const raw = (text[p.name] ?? "").trim();
    if (p.type === "int") {
      if (!/^\d+$/.test(raw)) {
        errors[p.name] = "Enter a whole number.";
        continue;
      }
      const n = Number(raw);
      if (typeof p.min === "number" && n < p.min) errors[p.name] = `Use ${p.min} or more.`;
      else if (typeof p.max === "number" && n > p.max) errors[p.name] = `Use ${p.max} or less.`;
      else out[p.name] = n;
    } else if (p.type === "prefix_list") {
      const list = raw
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      if (!list.length) errors[p.name] = "Enter at least one prefix, e.g. 2, 4.";
      else out[p.name] = Array.from(new Set(list));
    } else if (raw) {
      out[p.name] = raw;
    }
  }
  return { values: out, errors };
}

const sameRequest = (a?: RunRequest, b?: RunRequest) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});

/* --------------------------------------------------------------------- page */

/** Route element for /rosters/:runId. Keyed so each run gets fresh form state. */
export function RunRoute() {
  const { runId = "" } = useParams();
  return <RunPage key={runId} runId={runId} />;
}

export function RunPage({ runId }: { runId: RunId }) {
  const { meta: allMeta, loading, error: metaError } = useRunsMeta();
  const meta: RunMeta | undefined = allMeta?.find((m) => m.id === runId);

  // Everything below lives in this component only: leaving or refreshing the
  // page clears the file, the settings and the results.
  const [file, setFile] = useState<File | null>(null);
  const [headerRow, setHeaderRow] = useState<string[] | "failed" | null>(null);
  const fileRef = useRef<File | null>(null);
  const [asOf, setAsOf] = useState<string>(todayIso);
  const [paramText, setParamText] = useState<ParamValues>({});
  const [pascodes, setPascodes] = useState<string[]>([]);
  const [seenPascodes, setSeenPascodes] = useState<string[]>([]);
  const [shown, setShown] = useState<{ file: File; request: RunRequest; result: RunResult } | null>(null);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const resultsRef = useRef<HTMLHeadingElement>(null);

  // Seed the params form from the run's defaults.
  useEffect(() => {
    if (!meta) return;
    setParamText((cur) => {
      if (Object.keys(cur).length) return cur;
      const next: ParamValues = {};
      for (const p of meta.params) next[p.name] = initialParamText(p);
      return next;
    });
  }, [meta]);

  const selectFile = (f: File | null) => {
    setFile(f);
    fileRef.current = f;
    setHeaderRow(null);
    setError(null);
    // A different roster has different units: the filter starts over.
    setPascodes([]);
    setSeenPascodes([]);
    if (!f) return;
    readHeaderRow(f).then((row) => {
      if (fileRef.current === f) setHeaderRow(row ?? "failed");
    });
  };

  const check = useMemo(() => {
    if (!headerRow || !meta) return null;
    if (headerRow === "failed") return { failed: true as const };
    const have = new Set(headerRow.map((h) => h.toUpperCase()));
    return {
      failed: false as const,
      requiredMissing: meta.required_columns.filter((c) => !have.has(c)),
      requiredFound: meta.required_columns.filter((c) => have.has(c)).length,
      optionalFound: meta.optional_columns.filter((c) => have.has(c)).length,
      piiFound: findHighImpactPii(headerRow),
    };
  }, [headerRow, meta]);

  const params = meta?.params ?? [];
  const built = useMemo(() => paramsFromText(params, paramText), [params, paramText]);
  const currentRequest: RunRequest = useMemo(
    () => ({
      as_of_date: asOf || undefined,
      params: built.values,
      ...(pascodes.length ? { pascodes: [...pascodes].sort() } : {}),
    }),
    [asOf, built.values, pascodes],
  );

  const result = shown?.result;
  const stale = !!shown && (shown.file !== file || !sameRequest(shown.request, currentRequest));

  const run = async (ev?: FormEvent) => {
    ev?.preventDefault();
    if (!meta) return;
    const errs = { ...built.errors };
    if (!asOf) errs.as_of_date = "Enter the as-of date, like 17-NOV-2026.";
    if (!file) errs.file = "Choose the alpha roster file first.";
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setError(errs.file && Object.keys(errs).length === 1 ? errs.file : "Fix the highlighted settings, then run again.");
      return;
    }
    const f = file!;
    setRunning(true);
    setError(null);
    try {
      const res = await api.processRun(runId, f, currentRequest);
      setShown({ file: f, request: currentRequest, result: res.data });
      setSeenPascodes((prev) => Array.from(new Set([...prev, ...(res.data.pascodes ?? [])])).sort());
      window.setTimeout(() => resultsRef.current?.focus(), 0);
    } catch (e) {
      const p = await parseApiError(e, "The roster couldn't be run.");
      const fe: Record<string, string> = {};
      for (const name of p.invalidParams) fe[name] = p.message;
      setFieldErrors(fe);
      setError(
        p.missingColumns.length
          ? `${p.message.replace(/\.?$/, ".")} The file needs: ${p.missingColumns.join(", ")}.`
          : p.message,
      );
    } finally {
      setRunning(false);
    }
  };

  // Exports re-send the file and settings behind the result on screen.
  const doExport = async (format: "pdf" | "xlsx") => {
    if (!shown) return;
    setExporting(format);
    setError(null);
    try {
      const res = await api.exportRun(runId, format, shown.file, shown.request);
      const fallback = `${runId}_${shown.result.as_of}.${format}`;
      downloadBlob(res.data, filenameFromDisposition(res.headers["content-disposition"], fallback));
    } catch (e) {
      const p = await parseApiError(e, `The ${format === "pdf" ? "PDF" : "Excel"} export failed.`);
      setError(p.message);
    } finally {
      setExporting(null);
    }
  };

  const title = meta?.label ?? runShort(runId);
  const unknownRun = !!allMeta && !meta;

  return (
    <RostersShell>
      <form onSubmit={run} noValidate className="flex min-w-0 flex-1 flex-col">
        <PageHeader
          meta={<MetaLine parts={["Rosters", runShort(runId, meta?.label)]} />}
          title={title}
          description={meta?.description}
        />

        {loading ? <p className="mt-5 text-sm text-ink-3">Loading this roster&apos;s settings…</p> : null}
        {metaError && !meta ? (
          <div role="alert" className="msg msg-error mt-5">
            {metaError}
          </div>
        ) : null}

        {unknownRun ? (
          <div role="status" className="msg msg-warn mt-6 max-w-3xl">
            <b>This roster isn&apos;t available.</b> It may have been renamed or removed.{" "}
            <Link to="/rosters" className="font-medium text-primary underline">
              See the roster tools
            </Link>
          </div>
        ) : null}

        {meta ? <AboutRun meta={meta} /> : null}

        {meta ? (
          <div className="mt-6 grid grid-cols-1 items-start gap-6 min-[1100px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <section className="panel min-w-0" aria-labelledby="run-settings-h">
              <div className="border-b border-line px-5 py-4">
                <h2 id="run-settings-h" className="text-base font-semibold">
                  Settings
                </h2>
              </div>
              <div className="grid gap-5 p-5">
                <div className="grid gap-3">
                  <FileDropper onFileSelect={selectFile} file={file} />
                  <p className="text-[13px] text-ink-2">
                    Your file is processed in memory to build this roster and is not kept.
                    Refreshing or leaving this page clears it.
                  </p>
                  {fieldErrors.file && !file ? (
                    <p className="text-[13px] text-error">{fieldErrors.file}</p>
                  ) : null}
                  {file ? <HeaderCheckList check={check} meta={meta} /> : null}
                  {check && !check.failed ? <PiiFoundWarning found={check.piiFound} /> : null}
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-2">
                  <SmartDateInput
                    id="run-as-of"
                    label="As-of date"
                    value={asOf}
                    onChange={setAsOf}
                    hint="DD-MMM-YYYY. Windows and months remaining count from this date."
                    error={fieldErrors.as_of_date}
                  />
                  {params.map((p) => (
                    <ParamField
                      key={p.name}
                      param={p}
                      value={paramText[p.name] ?? ""}
                      onChange={(v) => setParamText((cur) => ({ ...cur, [p.name]: v }))}
                      error={fieldErrors[p.name]}
                      quarterOptions={result?.quarter_options}
                    />
                  ))}
                </div>

                <PascodeFilter
                  all={seenPascodes}
                  selected={pascodes}
                  onChange={setPascodes}
                  note={
                    runId === "btz-quarterly"
                      ? "Filters the member lists only. Unit sizes and quotas are always counted base-wide."
                      : undefined
                  }
                />
              </div>
            </section>

            <div className="grid min-w-0 gap-6">
              <RemovePiiPanel headingId="run-pii-h" />
              <section className="panel min-w-0" aria-labelledby="run-cols-h">
                <div className="border-b border-line px-5 py-4">
                  <h2 id="run-cols-h" className="text-base font-semibold">
                    Columns this roster uses
                  </h2>
                </div>
                <div className="grid gap-2.5 px-5 py-4">
                  <h3 className="flex justify-between gap-2 text-sm font-semibold">
                    Required{" "}
                    <span className="text-[13px] font-normal text-ink-3">{meta.required_columns.length}</span>
                  </h3>
                  <ColChips cols={meta.required_columns} />
                </div>
                {meta.optional_columns.length ? (
                  <div className="grid gap-2.5 border-t border-line px-5 py-4">
                    <h3 className="flex justify-between gap-2 text-sm font-semibold">
                      Used{" "}
                      <span className="text-[13px] font-normal text-ink-3">
                        may be blank · {meta.optional_columns.length}
                      </span>
                    </h3>
                    <ColChips cols={meta.optional_columns} />
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        ) : null}

        {error ? (
          <div role="alert" className="msg msg-error mt-5">
            {error}
          </div>
        ) : null}

        {result ? (
          <Results
            result={result}
            stale={stale}
            exporting={exporting}
            onExport={doExport}
            headingRef={resultsRef}
          />
        ) : null}

        <div className="flex-1" />
        <ActionBar
          back={
            <Link to="/rosters" className={buttonClasses("tertiary")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All roster tools
            </Link>
          }
          status={
            !meta
              ? undefined
              : !file
                ? "Choose the alpha roster file to run this roster."
                : stale
                  ? "The file or settings changed since the last run. Run again to update the lists and exports."
                  : result
                    ? `Run as of ${result.as_of_display}. ${result.rows.length} on the main list.`
                    : "Check the settings, then run."
          }
          statusTone={stale ? "warn" : "muted"}
          primary={
            <Button
              type="submit"
              disabled={!meta || !file || running}
              loading={running}
              leftIcon={running ? undefined : <Play />}
            >
              {running ? "Running…" : result ? "Run again" : "Run roster"}
            </Button>
          }
        />
      </form>
    </RostersShell>
  );
}

function HeaderCheckList({
  check,
  meta,
}: {
  check:
    | { failed: true }
    | { failed: false; requiredMissing: string[]; requiredFound: number; optionalFound: number; piiFound: string[] }
    | null;
  meta: RunMeta;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">Checked in your browser</p>
      {!check ? (
        <p className="text-sm text-ink-3">Reading the header row…</p>
      ) : check.failed ? (
        <p className="text-sm text-ink-3">
          The header row couldn&apos;t be read here. The server will check it when you run.
        </p>
      ) : (
        <ul className="grid gap-1.5 text-sm">
          <CheckLine ok={check.requiredMissing.length === 0}>
            {check.requiredFound} of {meta.required_columns.length} required columns found
            {check.requiredMissing.length ? (
              <>
                . Missing:{" "}
                <span className="font-mono text-[12.5px] [overflow-wrap:anywhere]">
                  {check.requiredMissing.join(", ")}
                </span>
              </>
            ) : null}
          </CheckLine>
          {meta.optional_columns.length ? (
            <CheckLine ok>
              {check.optionalFound} of {meta.optional_columns.length} other columns this roster uses found
            </CheckLine>
          ) : null}
          <CheckLine ok={check.piiFound.length === 0}>
            {check.piiFound.length === 0
              ? "None of the listed PII columns found"
              : `${check.piiFound.length} listed PII column${check.piiFound.length === 1 ? "" : "s"} found`}
          </CheckLine>
        </ul>
      )}
    </div>
  );
}

function CheckLine({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-elig" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-disc-ink" aria-hidden="true" />
      )}
      <span className="min-w-0">
        <span className="vh">{ok ? "OK: " : "Check: "}</span>
        {children}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------ settings bits */

function ParamField({
  param: p,
  value,
  onChange,
  error,
  quarterOptions,
}: {
  param: RunParam;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  quarterOptions?: Array<{ id: string; label: string }>;
}) {
  const id = `param-${p.name}`;
  const hint = (
    <>
      {p.help}
      {p.type === "int" && (typeof p.min === "number" || typeof p.max === "number") ? (
        <>
          {" "}
          Range {p.min ?? "?"} to {p.max ?? "?"}
          {p.unit ? ` ${p.unit}` : ""}.
        </>
      ) : null}
      {p.citation ? <span className="mt-0.5 block text-[12px]">Source: {p.citation}</span> : null}
    </>
  );
  if (p.type === "quarter") {
    const opts = quarterOptions?.length ? quarterOptions : (p.options ?? []);
    return (
      <Select
        id={id}
        label={p.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hint={hint}
        error={error}
        wrapperClassName="sm:col-span-2"
      >
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.id} · {o.label}
          </option>
        ))}
        {value && !opts.some((o) => o.id === value) ? <option value={value}>{value}</option> : null}
      </Select>
    );
  }
  return (
    <Input
      id={id}
      label={p.unit ? `${p.label} (${p.unit})` : p.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode={p.type === "int" ? "numeric" : "text"}
      autoComplete="off"
      spellCheck={false}
      mono={p.type === "prefix_list"}
      placeholder={p.type === "prefix_list" ? "2, 4" : undefined}
      hint={hint}
      error={error}
    />
  );
}

function PascodeFilter({
  all,
  selected,
  onChange,
  note,
}: {
  all: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  note?: string;
}) {
  const toggle = (p: string) =>
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-ink">
        Units (PASCODE)
        <span className="ml-1.5 text-[13px] font-normal text-ink-3">Optional</span>
      </legend>
      {all.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={selected.length === 0}
            onClick={() => onChange([])}
            className={chipClass(selected.length === 0)}
          >
            All units
          </button>
          {all.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={selected.includes(p)}
              onClick={() => toggle(p)}
              className={cn(chipClass(selected.includes(p)), "font-mono text-[12.5px]")}
            >
              {p}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-ink-3">Run once to list the units in this roster.</p>
      )}
      <p className="mt-1.5 text-[13px] text-ink-3">
        {selected.length
          ? `Showing ${selected.length} of ${all.length} units.`
          : "Showing every unit."}
        {note ? ` ${note}` : ""}
      </p>
    </fieldset>
  );
}

const chipClass = (on: boolean) =>
  cn(
    "inline-flex h-8 items-center rounded-1 border px-2.5 text-[13px] transition-colors duration-1",
    on
      ? "border-primary bg-primary-tint font-medium text-primary"
      : "border-ctrl bg-surface text-ink-2 hover:border-ink-2 hover:text-ink",
  );

function AboutRun({ meta }: { meta: RunMeta }) {
  return (
    <details className="group panel mt-5">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-3.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-1 group-open:rotate-90"
        />
        CSS duty, columns and rules
        <span className="ml-auto text-[13px] font-normal text-ink-3">
          {meta.rule_references.length} {meta.rule_references.length === 1 ? "rule" : "rules"}
        </span>
      </summary>
      <div className="grid gap-4 border-t border-line px-5 py-4 text-sm">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            Supports CSS duty
          </h3>
          <ul className="mt-1.5 grid gap-1 text-ink-2">
            {meta.duty.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            Columns
          </h3>
          <p className="mt-1.5 text-ink-2">
            Required:{" "}
            <span className="font-mono text-[12.5px] [overflow-wrap:anywhere]">
              {meta.required_columns.join(", ")}
            </span>
          </p>
          {meta.optional_columns.length ? (
            <p className="mt-1 text-ink-2">
              Used when present:{" "}
              <span className="font-mono text-[12.5px] [overflow-wrap:anywhere]">
                {meta.optional_columns.join(", ")}
              </span>
            </p>
          ) : null}
        </div>
        {meta.rule_references.length ? (
          <ul className="grid gap-2.5">
            {meta.rule_references.map((r) => (
              <li key={r.rule} className="border-t border-line pt-2.5">
                <p className="font-medium text-ink">
                  {r.rule}: <span className="font-normal text-ink-2">{r.value}</span>
                </p>
                <p className="text-[13px] text-ink-3">
                  {r.citation}
                  {r.note ? ` · ${r.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ results */

function Results({
  result,
  stale,
  exporting,
  onExport,
  headingRef,
}: {
  result: RunResult;
  stale: boolean;
  exporting: "pdf" | "xlsx" | null;
  onExport: (f: "pdf" | "xlsx") => void;
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  const colsByKey = useMemo(
    () => Object.fromEntries(result.columns.map((c) => [c.key, c])) as Record<string, RunColumn>,
    [result.columns],
  );
  const bucketCols = (b: RunBucket): RunColumn[] =>
    (b.columns as Array<RunColumn | string>).map((c) =>
      typeof c === "string" ? (colsByKey[c] ?? { key: c, label: humanize(c), kind: "text" }) : c,
    );

  return (
    <section className="mt-8 min-w-0" aria-labelledby="run-results-h">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 id="run-results-h" ref={headingRef} tabIndex={-1} className="section-title focus:outline-none">
            {result.title}
          </h2>
          <p className="mt-1 text-[13px] text-ink-3">
            As of <span className="num">{result.as_of_display || formatDateMil(result.as_of)}</span>
            {result.pascode_filter?.length ? (
              <>
                {" "}
                · Units:{" "}
                <span className="font-mono text-[12.5px]">{result.pascode_filter.join(", ")}</span>
              </>
            ) : (
              " · All units"
            )}
            {stale ? <span className="text-disc-ink"> · Settings changed since this run</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download />}
            loading={exporting === "pdf"}
            disabled={!!exporting}
            onClick={() => onExport("pdf")}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileSpreadsheet />}
            loading={exporting === "xlsx"}
            disabled={!!exporting}
            onClick={() => onExport("xlsx")}
          >
            Export Excel
          </Button>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-ink-3">
        Exports match the run shown here and are CUI-marked. Store and send them the way your unit
        handles CUI.
      </p>

      <SummaryStrip summary={result.summary} />

      {result.warnings.length ? (
        <div role="status" className="msg msg-warn mt-4">
          <b>Warnings</b>
          <ul className="mt-1 grid list-disc gap-1 pl-5">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {result.notes.length ? (
        <div className="msg msg-info mt-4">
          <b>Notes</b>
          <ul className="mt-1 grid list-disc gap-1 pl-5">
            {result.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.run_id === "btz-quarterly" ? <BtzPanels result={result} /> : null}

      <div className="mt-6">
        <h3 className="mb-2 flex flex-wrap items-baseline gap-x-2.5 text-base font-semibold">
          {result.main_label}
          <span className="num text-[13px] font-normal text-ink-3">{result.rows.length}</span>
        </h3>
        <RunTable label={result.main_label} columns={result.columns} rows={result.rows} />
      </div>

      {result.buckets.length ? (
        <div className="mt-6 grid gap-2.5">
          <h3 className="text-base font-semibold">Also listed</h3>
          {result.buckets.map((b) => (
            <BucketSection key={b.id} bucket={b} columns={bucketCols(b)} />
          ))}
        </div>
      ) : null}

      {result.footer ? (
        <p className="mt-6 border-t border-line pt-3 text-[13px] text-ink-2">{result.footer}</p>
      ) : null}
    </section>
  );
}

function BucketSection({ bucket: b, columns }: { bucket: RunBucket; columns: RunColumn[] }) {
  const issue = b.id === "data_issue" && b.count > 0;
  return (
    <details className="group panel min-w-0">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-1 group-open:rotate-90"
        />
        <span className="font-semibold text-ink">{b.label}</span>
        <span className="num text-[13px] text-ink-3">{b.count}</span>
        {issue ? <Tag tone="disc">Fix in roster</Tag> : null}
      </summary>
      <div className="grid gap-3 border-t border-line px-4 py-3">
        {b.description ? <p className="text-[13px] text-ink-3">{b.description}</p> : null}
        <RunTable label={b.label} columns={columns} rows={b.rows} empty="None." />
      </div>
    </details>
  );
}

/** Counts from the API's summary object, shown as one hairline strip. */
function SummaryStrip({ summary }: { summary: Record<string, unknown> }) {
  const scalars: Array<[string, ReactNode]> = [];
  const groups: Array<[string, Record<string, number>]> = [];
  const lists: Array<[string, string[]]> = [];
  for (const [k, v] of Object.entries(summary ?? {})) {
    if (typeof v === "number")
      scalars.push([k, <span className="num">{/quota/i.test(k) ? formatQuota(v) : formatNumber(v)}</span>]);
    else if (typeof v === "boolean") scalars.push([k, v ? "Yes" : "No"]);
    else if (typeof v === "string" && v) scalars.push([k, v]);
    else if (Array.isArray(v)) {
      if (v.length) lists.push([k, v.map((x) => (typeof x === "string" ? x : JSON.stringify(x)))]);
    } else if (v && typeof v === "object") {
      const entries = Object.entries(v as Record<string, unknown>).filter(
        (e): e is [string, number] => typeof e[1] === "number",
      );
      if (entries.length) groups.push([k, Object.fromEntries(entries)]);
    }
  }
  if (!scalars.length && !groups.length && !lists.length) return null;
  return (
    <div className="mt-5 grid gap-3">
      {scalars.length ? (
        <dl className="flex flex-wrap overflow-hidden rounded-2 border border-line bg-surface">
          {scalars.map(([k, v]) => (
            <div
              key={k}
              className="min-w-[8.5rem] flex-1 border-b border-r border-line px-3.5 py-2.5 [margin:0_-1px_-1px_0]"
            >
              <dt className="text-[12px] text-ink-3">{humanize(k)}</dt>
              <dd className="m-0 text-lg font-semibold leading-tight text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {groups.map(([k, g]) => (
        <div key={k} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
          <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            {humanize(k)}
          </span>
          {Object.entries(g).map(([label, n]) => (
            <Tag key={label} tone={/status/i.test(k) ? statusTone(label) : "neutral"}>
              <span className={k === "by_code" ? "font-mono" : undefined}>{label}</span>
              <span className="num font-semibold text-ink">{formatNumber(n)}</span>
            </Tag>
          ))}
        </div>
      ))}
      {lists.map(([k, items]) => (
        <p key={k} className="text-sm text-ink-2">
          <span className="mr-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            {humanize(k)}
          </span>
          <span className="[overflow-wrap:anywhere]">{items.join(", ")}</span>
        </p>
      ))}
    </div>
  );
}
