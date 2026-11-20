import { useState } from "react";
import { Upload, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { api, type MelType } from "@/lib/api";

export interface CycleOption {
  value: string;
  label: string;
}

interface UploadStepProps {
  type: MelType;
  title: string;
  cycles: CycleOption[];
  onSuccess: (
    sessionData: Record<string, unknown> & { session_id: string },
    cycle: string,
    year: string,
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

const PII_COLUMNS = [
  "SSAN", "RECORD_STATUS", "OFFICE_SYMBOL", "DUTY_TITLE", "DUTY_START_DATE",
  "DUTY_PHONE", "DATE_OF_BIRTH", "HOME_ADDRESS", "HOME_CITY", "HOME_STATE",
  "HOME_ZIP_CODE", "SUPV_NAME", "PROJ_EVAL_CLOSE_DATE", "MARITAL_STATUS",
  "RNLTD", "GAINING_PAS", "GAINING_PAS_CLEARTEXT", "LAST_EVAL_RATING",
  "LAST_EVAL_CLOSE_DATE", "PERF_INDICATOR", "SPOUSE_SSAN", "SUPV_BEGIN_DATE",
  "HOME_PHONE_NUMBER", "AGE", "DEROS", "DEPLOY_ADMIN_STATUS",
  "DEPLOY_ADMIN_STATUS_CLEARTEXT", "DEPLOY_ADMIN_STOP_DATE", "DEPLOY_LEGAL_STATUS",
  "DEPLOY_LEGAL_STATUS_CLEARTEXT", "DEPLOY_LEGAL_STOP_DATE", "DEPLOY_PHYS_STATUS",
  "DEPLOY_PHYS_STATUS_CLEARTEXT", "DEPLOY_PHYS_STOP_DATE", "DEPLOY_TIME_STATUS",
  "DEPLOY_TIME_STATUS_CLEARTEXT", "DEPLOY_TIME_STOP_DATE", "AVAILABILITY_CODE",
  "AVAILABILITY_CODE_CLEARTEXT", "AVAILABILITY_DATE", "AVAILABILITY_STATUS",
  "AVAILABILITY_STATUS_CLEARTEXT", "LIMITATION_CODE", "LIMITATION_CODE_CLEARTEXT",
  "LIMITATION_END_DATE", "SEC_CLR", "TYPE_SEC_INV", "DT_SCTY_INVES_COMPL",
  "SEC_ELIG_DT", "TECH_ID", "ACDU_STATUS", "ANG_ROLL_INDICATOR",
  "AFR_SECTION_ID", "CIVILIAN_ART_ID", "ATTACHED_PAS", "FUNCTIONAL_CATEGORY",
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

export function UploadStep({ type, title, cycles, onSuccess }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cycle, setCycle] = useState("");
  const [year, setYear] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const years = fiscalYearOptions();

  const submit = async () => {
    if (!file || !cycle || !year) {
      setError("Please select a file, cycle, and year");
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
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err?.response?.data?.detail || err?.message || "Failed to upload roster");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Upload roster"
            description="Select the roster export and the promotion cycle it applies to."
          />
          <CardBody className="space-y-4">
            <FileDropzone file={file} onFileSelect={setFile} disabled={uploading} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Promotion cycle *"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                disabled={uploading}
              >
                <option value="">Select cycle</option>
                {cycles.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Calendar year *"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={uploading}
              >
                <option value="">Select year</option>
                {years.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </Select>
            </div>
            {error ? (
              <Alert tone="danger" title="Upload failed" onDismiss={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
            <Button
              onClick={submit}
              disabled={!file || !cycle || !year || uploading}
              loading={uploading}
              className="w-full"
              leftIcon={<Upload className="h-4 w-4" />}
            >
              {uploading ? "Processing roster…" : `Process ${title}`}
            </Button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Column checklist"
            description="Column names must match exactly (case-sensitive)."
          />
          <CardBody className="space-y-5">
            <ColumnGroup
              title="Required"
              note="Can't be blank"
              columns={REQUIRED_COLUMNS}
            />
            <ColumnGroup
              title="Additional"
              note="Still necessary, but will process if blank"
              columns={ADDITIONAL_COLUMNS}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="border-danger-line">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-danger" aria-hidden="true" />
              Remove these columns before uploading
            </span>
          }
          description="These columns contain PII or sensitive information. While we do not store any data, removal of PII ensures we can continue to provide you MEL generation services."
        />
        <CardBody>
          <ul className="flex flex-wrap gap-1.5" aria-label="Columns to remove">
            {PII_COLUMNS.map((col) => (
              <li
                key={col}
                className="rounded border border-danger-line bg-danger-soft px-1.5 py-0.5 font-mono text-[11px] text-danger"
              >
                {col}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function ColumnGroup({
  title,
  note,
  columns,
}: {
  title: string;
  note: string;
  columns: string[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-fg">{title}</h4>
        <span className="text-xs text-fg-subtle">{note}</span>
      </div>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {columns.map((col) => (
          <li key={col} className="flex items-center gap-2 text-[13px] text-fg-muted">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            <span className="font-mono text-xs">{col}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
