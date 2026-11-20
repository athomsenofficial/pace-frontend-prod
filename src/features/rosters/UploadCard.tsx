import { useState } from "react";
import { FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { api, apiErrorMessage } from "@/lib/api";
import type { RosterUploadResponse } from "@/types";

interface UploadCardProps {
  upload: RosterUploadResponse | null;
  fileName: string | null;
  onUploaded: (res: RosterUploadResponse, fileName: string) => void;
  onReset: () => void;
}

export function UploadCard({ upload, fileName, onUploaded, onReset }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.rosters.upload(file);
      onUploaded(res.data, file.name);
      setFile(null);
    } catch (e) {
      setError(await apiErrorMessage(e, "Roster upload failed"));
    } finally {
      setUploading(false);
    }
  };

  if (upload) {
    const found = upload.columns_found.length;
    const unmapped = upload.unmapped_columns;
    return (
      <Card>
        <CardHeader
          title="1. Roster"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Replace
            </Button>
          }
        />
        <CardBody className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success-soft text-success">
              <FileSpreadsheet className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg" title={fileName ?? undefined}>
                {fileName ?? "Uploaded roster"}
              </p>
              <p className="text-xs text-fg-muted">Processed for this session only</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-line bg-surface-muted px-3 py-2">
              <dt className="text-xs text-fg-muted">Rows</dt>
              <dd className="text-lg font-semibold tabular-nums text-fg">
                {upload.row_count.toLocaleString("en-US")}
              </dd>
            </div>
            <div className="rounded-md border border-line bg-surface-muted px-3 py-2">
              <dt className="text-xs text-fg-muted">Columns recognized</dt>
              <dd className="text-lg font-semibold tabular-nums text-fg">{found}</dd>
            </div>
          </dl>
          {unmapped.length > 0 ? (
            <details className="group rounded-md border border-line px-3 py-2 text-xs">
              <summary className="cursor-pointer select-none font-medium text-fg-muted marker:text-fg-subtle">
                {unmapped.length} column{unmapped.length === 1 ? "" : "s"} not recognized (ignored)
              </summary>
              <ul className="mt-2 flex flex-wrap gap-1">
                {unmapped.map((c) => (
                  <li
                    key={c}
                    className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-fg-muted"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="1. Upload roster"
        description="Upload once — every report below runs against the same file."
      />
      <CardBody className="space-y-3">
        <FileDropzone file={file} onFileSelect={setFile} disabled={uploading} />
        {error ? (
          <Alert tone="danger" title="Upload failed" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        ) : null}
        <Button
          className="w-full"
          onClick={submit}
          disabled={!file || uploading}
          loading={uploading}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          {uploading ? "Analyzing roster…" : "Upload and check columns"}
        </Button>
        <p className="text-xs leading-4 text-fg-subtle">
          Remove PII columns (SSAN, DOB, home address…) before uploading.
        </p>
      </CardBody>
    </Card>
  );
}
