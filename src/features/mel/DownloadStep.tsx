import { useEffect, useState } from "react";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";
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

  const download = () => {
    if (!blob) return;
    downloadBlob(blob, `${filenamePrefix}_${sessionId}.pdf`);
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
      <CardBody className="pt-6">
        <div className="text-center space-y-6">
          <div className="p-4 bg-success/10 border border-success rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <h3 className="text-xl font-semibold text-success-dark">
                PDF Generated Successfully!
              </h3>
            </div>
            <p className="text-sm text-slate-700">
              Your {documentLabel} has been generated and is ready to download.
            </p>
          </div>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<RotateCcw className="w-5 h-5" />}
              onClick={onStartOver}
            >
              Process New Roster
            </Button>
            <Button
              size="lg"
              leftIcon={<Download className="w-5 h-5" />}
              onClick={download}
              disabled={!blob}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
