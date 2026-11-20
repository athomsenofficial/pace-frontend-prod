import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, RotateCcw } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";

interface DownloadStepProps {
  blob: Blob | null;
  sessionId: string;
  documentLabel: string;
  filenamePrefix: string;
  onStartOver: () => void;
}

export function DownloadStep({
  blob,
  sessionId,
  documentLabel,
  filenamePrefix,
  onStartOver,
}: DownloadStepProps) {
  const [downloaded, setDownloaded] = useState(false);
  const filename = `${filenamePrefix}_${sessionId}.pdf`;

  const download = () => {
    if (!blob) return;
    downloadBlob(blob, filename);
    setDownloaded(true);
  };

  useEffect(() => {
    if (blob && !downloaded) {
      download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  return (
    <Card>
      <CardBody className="flex flex-col items-center px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-fg">PDF generated</h2>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          Your {documentLabel} is ready.
          {downloaded ? " The download should have started automatically." : null}
        </p>

        {blob ? (
          <div className="mt-5 flex w-full max-w-md items-center gap-3 rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-left">
            <FileText className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-fg" title={filename}>
                {filename}
              </p>
              <p className="text-xs text-fg-subtle">
                {(blob.size / 1024).toFixed(0)} KB · Contains CUI
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex w-full max-w-md flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={onStartOver}
          >
            Process new roster
          </Button>
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            onClick={download}
            disabled={!blob}
          >
            {downloaded ? "Download again" : "Download PDF"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
