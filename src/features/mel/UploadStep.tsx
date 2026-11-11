import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Upload,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, type MelType } from "@/lib/api";
import { cn } from "@/lib/utils";

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
  const years = fiscalYearOptions();

  const submit = async () => {
    if (!file || !cycle || !year) {
      alert("Please select a file, cycle, and year");
      return;
    }
    setUploading(true);
    try {
      const res = await api.uploadRoster(type, file, cycle, year);
      onSuccess(
        { ...(res.data as unknown as Record<string, unknown>), session_id: res.data.session_id },
        cycle,
        year,
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      alert(err?.response?.data?.detail || err?.message || "Failed to upload roster");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <Card className="border border-slate-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Cycle Information
              </h3>
              <p className="text-sm text-slate-500">
                Upload roster file and select promotion cycle information
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FileDropper onFileSelect={setFile} file={file} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Promotion Cycle *"
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                >
                  <option value="">Select cycle</option>
                  {cycles.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Calendar Year *"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                onClick={submit}
                disabled={!file || !cycle || !year || uploading}
                loading={uploading}
                className="w-full"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                {uploading ? "Processing Roster..." : `Process ${title}`}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Required Columns (can't be blank)
              </h3>
              <p className="text-sm text-slate-500">
                Ensure your Excel file contains the following columns for
                successful processing:
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {REQUIRED_COLUMNS.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-slate-700">{col}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-slate-700">
                  <strong>Note:</strong> Column names must match exactly
                  (case-sensitive).
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Additional Columns (STILL NECESSARY, but will process if blank)
              </h3>
              <p className="text-sm text-slate-500">
                These columns are essential for proper processing and
                categorization of service members, but in some cases these
                fields are blank.
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {ADDITIONAL_COLUMNS.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-slate-700">{col}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-slate-700">
                  <strong>Note:</strong> Column names must match exactly
                  (case-sensitive).
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-danger">
            <CardHeader>
              <h3 className="text-lg font-semibold text-danger-dark">
                Remove these columns before uploading
              </h3>
              <p className="text-sm text-slate-500">
                These columns contain PII or sensitive information. While we do
                not store any data, removal of PII ensures we can continue to
                provide you MEL generation services.
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {PII_COLUMNS.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-danger" />
                    <span className="text-sm text-slate-700">{col}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-danger">
                <p className="text-sm text-slate-700">
                  <strong>Important:</strong> These columns must be removed
                  before uploading to protect sensitive information.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----- Inline FileDropper ----- */

function FileDropper({
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
      setError("Invalid file type. Please upload .csv,.xlsx files only.");
      return false;
    }
    if (f.size / (1024 * 1024) > 10) {
      setError("File size exceeds 10MB limit.");
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
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : error
          ? "border-danger bg-danger/5"
          : file
          ? "border-success bg-success/5"
          : "border-slate-300 hover:border-primary/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={onInput}
        className="hidden"
      />
      {file ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-success/10 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-600" />
              <p className="font-semibold text-slate-900">{file.name}</p>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Remove
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Choose Different File
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              Drop your roster file here
            </p>
            <p className="text-xs text-slate-600 mb-3">
              or click to browse (.csv,.xlsx files, max 10MB)
            </p>
            <Button
              size="sm"
              onClick={() => inputRef.current?.click()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Select File
            </Button>
          </div>
        </div>
      )}
      {error ? (
        <div className="mt-4 flex items-center justify-center space-x-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
