import { useState } from "react";
import { WizardShell, MetaLine, type RailStep } from "./WizardShell";
import { UploadStep, type CycleOption } from "./UploadStep";
import { ReviewStep, type ReviewSummary } from "./ReviewStep";
import { PascodeStep, type PascodeDraft } from "./PascodeStep";
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

const KIND: Record<MelType, string> = {
  "initial-mel": "Initial MEL",
  "final-mel": "Final MEL",
  "mpf-roster": "MPF roster",
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function MelWizard({
  type,
  documentLabel,
  filenamePrefix,
  cycles,
  showLogo = true,
}: MelWizardProps) {
  const [step, setStep] = useState(0);
  const [pascodeDraft, setPascodeDraft] = useState<PascodeDraft | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [fd, setFd] = useState<{ complete: number; total: number } | null>(null);

  const reset = () => {
    setStep(0);
    setPascodeDraft(null);
    setSession(null);
    setPdfBlob(null);
    setFileName(null);
    setSummary(null);
    setFd(null);
  };

  const kind = KIND[type];
  const units = session?.pascodes?.length ?? 0;
  const cycleYear = session ? `${session.cycle} · ${session.year}` : null;
  const meta = (n: number) => (
    <MetaLine parts={[`Step ${n} of 4`, kind, cycleYear]} />
  );

  const steps: RailStep[] = [
    {
      label: "Upload roster",
      status:
        step > 0
          ? [summary ? plural(summary.total, "member", "members") : null, units ? plural(units, "unit", "units") : null]
              .filter(Boolean)
              .join(", ") || "Uploaded"
          : "Choose cycle and file",
    },
    {
      label: "Review & edit",
      status:
        step < 1
          ? "After upload"
          : step === 1
            ? summary && summary.discrepancy > 0
              ? `${plural(summary.discrepancy, "discrepancy", "discrepancies")} to review`
              : "Check each category"
            : summary && (summary.overrides || summary.added)
              ? [
                  summary.overrides ? plural(summary.overrides, "override", "overrides") : null,
                  summary.added ? `${summary.added} added` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "Reviewed",
      warn: step === 1 && !!summary && summary.discrepancy > 0,
    },
    {
      label: "Force distributor",
      status:
        step >= 2 && fd
          ? fd.complete === fd.total
            ? "All units complete"
            : `${fd.complete} of ${fd.total} complete`
          : units
            ? `${plural(units, "unit", "units")} to fill`
            : "Commanders, senior raters",
      warn: step === 2 && !!fd && fd.complete < fd.total,
    },
    { label: "Download PDF", status: step === 3 ? "Ready" : "CUI-marked" },
  ];

  const startOver = () => {
    if (
      window.confirm(
        "Start over with a new file? Your edits and Force Distributor entries for this session will be cleared.",
      )
    ) {
      reset();
    }
  };

  return (
    <WizardShell
      kind={kind}
      kindValue={cycleYear ?? "New listing"}
      steps={steps}
      current={step}
      onStepClick={step === 3 ? undefined : (i) => (i === 0 ? startOver() : setStep(i))}
      session={
        session
          ? [
              { label: "Cycle", value: session.cycle },
              { label: "Year", value: session.year },
              ...(fileName ? [{ label: "File", value: fileName }] : []),
            ]
          : undefined
      }
      onStartOver={session ? startOver : undefined}
    >
      {step === 0 ? (
        <UploadStep
          type={type}
          title={documentLabel}
          cycles={cycles}
          meta={meta(1)}
          onSuccess={(data, cycle, year, name) => {
            setSession({ ...(data as SessionData), cycle, year });
            setFileName(name ?? null);
            setPascodeDraft(null);
            setSummary(null);
            setFd(null);
            setStep(1);
          }}
        />
      ) : null}

      {step === 1 && session ? (
        <ReviewStep
          sessionData={session as unknown as Parameters<typeof ReviewStep>[0]["sessionData"]}
          showLogo={showLogo}
          meta={meta(2)}
          onSummaryChange={setSummary}
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
          meta={meta(3)}
          onProgressChange={setFd}
          onSubmitted={(blob) => {
            setPdfBlob(blob);
            setStep(3);
          }}
          onBack={() => setStep(1)}
          draft={pascodeDraft}
          onDraftChange={setPascodeDraft}
        />
      ) : null}

      {step === 3 && session ? (
        <DownloadStep
          blob={pdfBlob}
          sessionId={session.session_id}
          documentLabel={documentLabel}
          filenamePrefix={filenamePrefix}
          meta={meta(4)}
          onStartOver={reset}
        />
      ) : null}
    </WizardShell>
  );
}
