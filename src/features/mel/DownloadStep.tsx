import { useEffect, useState, type ReactNode } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";
import { ActionBar, PageHeader } from "./WizardShell";

interface DownloadStepProps {
  blob: Blob | null;
  sessionId: string;
  documentLabel: string;
  filenamePrefix: string;
  meta?: ReactNode;
  onStartOver: () => void;
}

export function DownloadStep({
  blob,
  sessionId,
  documentLabel,
  filenamePrefix,
  meta,
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
    <>
      <PageHeader
        meta={meta}
        title="Download the PDF"
        description="The document is CUI-marked. Store and send it the way your unit handles CUI."
      />
      <div role="status" className="msg msg-ok mt-6 max-w-2xl">
        <b>Your {documentLabel} is ready.</b>{" "}
        {downloaded
          ? "The download started. If it didn't, use Download PDF below."
          : "Use Download PDF below to save it."}
        <div className="mt-2 font-mono text-[12.5px] text-ink-3 [overflow-wrap:anywhere]">{filename}</div>
      </div>
      <div className="flex-1" />
      <ActionBar
        back={
          <Button variant="tertiary" leftIcon={<RotateCcw />} onClick={onStartOver}>
            Process a new roster
          </Button>
        }
        primary={
          <Button leftIcon={<Download />} onClick={download} disabled={!blob}>
            {downloaded ? "Download again" : "Download PDF"}
          </Button>
        }
      />
    </>
  );
}
