import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { StepIndicator } from "./StepIndicator";
import { UploadStep, type CycleOption } from "./UploadStep";
import { ReviewStep } from "./ReviewStep";
import { PascodeStep } from "./PascodeStep";
import { DownloadStep } from "./DownloadStep";
import type { MelType } from "@/lib/api";

interface MelWizardProps {
  type: MelType;
  title: string;
  documentLabel: string;
  filenamePrefix: string;
  cycles: CycleOption[];
  showLogo?: boolean;
}

interface SessionData {
  session_id: string;
  cycle: string;
  year: string;
  pascodes?: string[];
  pascode_unit_map?: Record<string, string>;
  pascode_map?: Record<string, unknown>;
  small_unit_sr?: unknown;
  senior_rater_needed?: boolean;
  categories?: {
    eligible?: unknown[];
    ineligible?: unknown[];
    discrepancy?: unknown[];
    btz?: unknown[];
    small_unit?: Array<{ ASSIGNED_PAS?: string }>;
  };
  [k: string]: unknown;
}

const STEPS = ["Upload Roster", "Review & Edit", "Force Distributor", "Download PDF"];

export function MelWizard({
  type,
  title,
  documentLabel,
  filenamePrefix,
  cycles,
  showLogo = true,
}: MelWizardProps) {
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const reset = () => {
    setStep(0);
    setSession(null);
    setPdfBlob(null);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Promotions"
        title={title}
        badge={
          session ? (
            <Badge color="navy">
              {session.cycle} · {session.year}
            </Badge>
          ) : null
        }
        description={
          step === 0
            ? "Upload a roster, review eligibility determinations, add unit leadership, then download the PDF."
            : undefined
        }
      />

      <StepIndicator steps={STEPS} current={step} />

      <div>
        {step === 0 ? (
          <UploadStep
            type={type}
            title={documentLabel}
            cycles={cycles}
            onSuccess={(data, cycle, year) => {
              setSession({ ...(data as SessionData), cycle, year });
              setStep(1);
            }}
          />
        ) : null}

        {step === 1 && session ? (
          <ReviewStep
            sessionData={session as unknown as Parameters<typeof ReviewStep>[0]["sessionData"]}
            showLogo={showLogo}
            onContinue={(updated) => {
              setSession((s) =>
                s
                  ? ({ ...s, ...updated } as SessionData)
                  : (updated as unknown as SessionData),
              );
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        ) : null}

        {step === 2 && session ? (
          <PascodeStep
            sessionData={session}
            type={type}
            onSubmitted={(blob) => {
              setPdfBlob(blob);
              setStep(3);
            }}
          />
        ) : null}

        {step === 3 && session ? (
          <DownloadStep
            blob={pdfBlob}
            sessionId={session.session_id}
            documentLabel={documentLabel}
            filenamePrefix={filenamePrefix}
            onStartOver={reset}
          />
        ) : null}
      </div>
    </Page>
  );
}
