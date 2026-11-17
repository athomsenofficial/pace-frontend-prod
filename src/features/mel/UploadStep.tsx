import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { AlertCircle, ArrowRight, Check, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, type MelType } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ActionBar, PageHeader } from "./WizardShell";
import { findHighImpactPii, readHeaderRow } from "@/components/upload/pii";
import { PiiFoundWarning, RemovePiiPanel } from "@/components/upload/PiiPanel";

export interface CycleOption {
  value: string;
  label: string;
}

interface UploadStepProps {
  type: MelType;
  title: string;
  cycles: CycleOption[];
  /** Header meta line (Step 1 of 4 · Initial MEL). */
  meta?: ReactNode;
  onSuccess: (
    sessionData: Record<string, unknown> & { session_id: string },
    cycle: string,
    year: string,
    fileName?: string,
  ) => void;
}

const REQUIRED_COLUMNS = [
  "FULL_NAME",
  "GRADE",
  "ASSIGNED_PAS_CLEARTEXT",
  "DAFSC",
  "DOR",
  "DATE_ARRIVED_STATION",
  "TAFMSD",
  "REENL_ELIG_STATUS",
  "ASSIGNED_PAS",
  "PAFSC",
];

const ADDITIONAL_COLUMNS = [
  "GRADE_PERM_PROJ",
  "UIF_CODE",
  "UIF_DISPOSITION_DATE",
  "2AFSC",
  "3AFSC",
  "4AFSC",
];

function fiscalYearOptions(): CycleOption[] {
  const now = new Date();
  const y = now.getFullYear();
  const next = now.getMonth() >= 3 ? y + 1 : y;
  return [
    { value: String(next), label: String(next) },
    { value: String(next - 1), label: String(next - 1) },
    { value: String(next - 2), label: String(next - 2) },
  ];
}

interface HeaderCheck {
  rows?: number;
  missingRequired: string[];
  additionalFound: number;
  piiFound: string[];
  failed?: boolean;
}

/**
 * Reads only the header row in the browser so missing or PII columns show
 * before the upload. Purely informational.
 */
async function checkHeaders(file: File): Promise<HeaderCheck> {
  const row = await readHeaderRow(file);
  if (!row) return { missingRequired: [], additionalFound: 0, piiFound: [], failed: true };
  const headers = new Set(row);
  return {
    missingRequired: REQUIRED_COLUMNS.filter((c) => !headers.has(c)),
    additionalFound: ADDITIONAL_COLUMNS.filter((c) => headers.has(c)).length,
    piiFound: findHighImpactPii(row),
  };
}

export function UploadStep({ type, title, cycles, meta, onSuccess }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cycle, setCycle] = useState("");
  const [year, setYear] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState<HeaderCheck | null>(null);
  const years = fiscalYearOptions();
  const fileRef = useRef<File | null>(null);

  const selectFile = (f: File | null) => {
    setFile(f);
    fileRef.current = f;
    setCheck(null);
    setError(null);
    if (f) {
      checkHeaders(f).then((c) => {
        if (fileRef.current === f) setCheck(c);
      });
    }
  };

  const ready = !!file && !!cycle && !!year;

  const submit = async () => {
    if (!file || !cycle || !year) {
      setError("Choose a promotion cycle, a calendar year and a roster file first.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadRoster(type, file, cycle, year);
      onSuccess(
        { ...(res.data as unknown as Record<string, unknown>), session_id: res.data.session_id },
        cycle,
        year,
        file.name,
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err?.response?.data?.detail || err?.message || "Failed to upload roster");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader
        meta={meta}
        title="Upload your roster"
        description={`PACE sorts every member into Eligible, Ineligible, Discrepancy, BTZ and Small unit for the ${title}. You can review and fix anything on the next step.`}
      />

      <div className="mt-[22px] grid grid-cols-1 items-start gap-6 min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <section className="panel" aria-labelledby="up-form-h">
          <div className="border-b border-line px-5 py-4">
            <h2 id="up-form-h" className="text-base font-semibold">
              Cycle and file
            </h2>
          </div>
          <div className="grid gap-[18px] p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Promotion cycle" value={cycle} onChange={(e) => setCycle(e.target.value)}>
                <option value="">Select cycle</option>
                {cycles.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Select label="Calendar year" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select year</option>
                {years.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </Select>
            </div>

            <FileDropper onFileSelect={selectFile} file={file} />

            {file ? (
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Checked in your browser</p>
                {check ? (
                  check.failed ? (
                    <p className="text-sm text-ink-3">
                      The header row couldn't be read here. The server will check it when you
                      process the roster.
                    </p>
                  ) : (
                    <ul className="grid gap-1.5 text-sm">
                      <CheckLine ok={check.missingRequired.length === 0}>
                        {REQUIRED_COLUMNS.length - check.missingRequired.length} of{" "}
                        {REQUIRED_COLUMNS.length} required columns found
                        {check.missingRequired.length ? (
                          <>
                            . Missing:{" "}
                            <span className="font-mono text-[12.5px]">
                              {check.missingRequired.join(", ")}
                            </span>
                          </>
                        ) : null}
                      </CheckLine>
                      <CheckLine ok>
                        {check.additionalFound} of {ADDITIONAL_COLUMNS.length} additional columns
                        found
                      </CheckLine>
                      <CheckLine ok={check.piiFound.length === 0}>
                        {check.piiFound.length === 0
                          ? "None of the listed PII columns found"
                          : `${check.piiFound.length} listed PII column${check.piiFound.length === 1 ? "" : "s"} found`}
                      </CheckLine>
                    </ul>
                  )
                ) : (
                  <p className="text-sm text-ink-3">Reading the header row…</p>
                )}
              </div>
            ) : null}

            {check && !check.failed ? <PiiFoundWarning found={check.piiFound} /> : null}

            {error ? (
              <div role="alert" className="msg msg-error">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid min-w-0 gap-6">
        <RemovePiiPanel headingId="up-pii-h" />
        <section className="panel" aria-labelledby="up-cols-h">
          <div className="border-b border-line px-5 py-4">
            <h2 id="up-cols-h" className="text-base font-semibold">
              Columns PACE uses
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-3">
              Column names must match exactly, including case.
            </p>
          </div>
          <div className="grid gap-2.5 px-5 py-4">
            <h3 className="flex justify-between gap-2 text-sm font-semibold">
              Required <span className="text-[13px] font-normal text-ink-3">can't be blank · {REQUIRED_COLUMNS.length}</span>
            </h3>
            <ColChips cols={REQUIRED_COLUMNS} />
          </div>
          <div className="grid gap-2.5 border-t border-line px-5 py-4">
            <h3 className="flex justify-between gap-2 text-sm font-semibold">
              Additional <span className="text-[13px] font-normal text-ink-3">may be blank · {ADDITIONAL_COLUMNS.length}</span>
            </h3>
            <ColChips cols={ADDITIONAL_COLUMNS} />
          </div>
        </section>
        </div>
      </div>

      <div className="flex-1" />
      <ActionBar
        status={
          ready
            ? "Nothing is stored. Closing this tab ends the session."
            : "Choose a cycle, a year and a roster file to continue."
        }
        primary={
          <Button
            onClick={submit}
            disabled={!ready || uploading}
            loading={uploading}
            rightIcon={uploading ? undefined : <ArrowRight />}
          >
            {uploading ? "Processing roster…" : "Process roster"}
          </Button>
        }
      />
    </>
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

export function ColChips({ cols, pii }: { cols: string[]; pii?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {cols.map((c) => (
        <li
          key={c}
          className={cn(
            "rounded-[3px] border px-[7px] py-[3px] font-mono text-xs text-ink-2",
            pii ? "border-inel/30 bg-inel-tint" : "border-line bg-ground",
          )}
        >
          {c}
        </li>
      ))}
    </ul>
  );
}

/* ----- File drop area ----- */

export function FileDropper({
  onFileSelect,
  file,
}: {
  onFileSelect: (f: File | null) => void;
  file: File | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const validate = (f: File): boolean => {
    const accepted = [".csv", ".xlsx"];
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!accepted.includes(ext)) {
      setError("Invalid file type. Please upload .csv or .xlsx files only.");
      return false;
    }
    if (f.size / (1024 * 1024) > 10) {
      setError("File size exceeds the 10 MB limit.");
      return false;
    }
    setError("");
    return true;
  };

  const accept = (f: File) => {
    if (validate(f)) onFileSelect(f);
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) accept(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) accept(f);
  };

  const reset = () => {
    onFileSelect(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-w-0">
      <p id="roster-file-label" className="mb-1.5 text-sm font-medium text-ink">
        Roster file
      </p>
      <input
        ref={inputRef}
        id="roster-file"
        type="file"
        accept=".csv,.xlsx"
        onChange={onInput}
        className="vh"
        aria-labelledby="roster-file-label"
        tabIndex={-1}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "rounded-2 border px-5 py-[22px] text-center text-sm transition-colors duration-1",
          dragging ? "border-primary bg-primary-tint" : error ? "border-error bg-inel-tint" : "border-ctrl bg-ground",
        )}
      >
        <p className="text-[15px] font-semibold text-ink">
          {file ? "Drop a different file here" : "Drag the roster here"}
        </p>
        <p className="mt-1 text-[13px] text-ink-3">.xlsx or .csv · one sheet · headers in row 1 · max 10 MB</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          {file ? "Choose a different file" : "Choose file"}
        </Button>
      </div>
      {file ? (
        <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-1 border border-line bg-surface px-3 py-2.5 text-sm">
          <FileSpreadsheet className="h-5 w-5 text-ink-3" aria-hidden="true" />
          <div className="min-w-0">
            <div className="font-medium text-ink [overflow-wrap:anywhere]">{file.name}</div>
            <div className="num text-[12.5px] text-ink-3">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label={`Remove ${file.name}`}
            className="inline-flex h-7 items-center gap-1 rounded-1 border border-transparent px-2 text-[13px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-error">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
