import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  FileSpreadsheet,
  Files,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { Page } from "@/components/Page";
import { StepIndicator } from "@/features/mel/StepIndicator";
import { UploadStep } from "@/features/mel/UploadStep";
import { ReviewStep } from "@/features/mel/ReviewStep";
import { api } from "@/lib/api";
import { cn, downloadBlob } from "@/lib/utils";
import type { MpfFormat } from "@/types";

interface SessionData {
  session_id: string;
  pascodes: string[];
  pascode_unit_map: Record<string, string>;
  cycle: string;
  year: string;
  raw: Record<string, unknown>;
}

const STEPS = ["Upload Roster", "Review & Edit", "Select Format", "Download PDF"];

const MPF_CYCLES = [
  { value: "SRA", label: "Senior Airman (SRA)" },
  { value: "SSG", label: "Staff Sergeant (SSG)" },
  { value: "TSG", label: "Technical Sergeant (TSG)" },
  { value: "MSG", label: "Master Sergeant (MSG)" },
  { value: "SMS", label: "Senior Master Sergeant (SMS)" },
];

interface FormatOption {
  value: MpfFormat;
  icon: React.ReactNode;
  label: string;
  desc: string;
  filenameTag: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "list",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    label: "MPF List Only",
    desc: "Simple roster listing: Name, Grade, Unit, DAFSC, DOR, TAFMSD",
    filenameTag: "MPF_List",
  },
  {
    value: "mel",
    icon: <FileText className="h-5 w-5" />,
    label: "MEL Format Only",
    desc: "Master Eligibility List format with full eligibility determinations",
    filenameTag: "MEL",
  },
  {
    value: "both",
    icon: <Files className="h-5 w-5" />,
    label: "MPF List + MEL",
    desc: "MPF List and MEL merged into a single PDF document",
    filenameTag: "MPF_Both",
  },
];

export default function MpfRoster() {
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [format, setFormat] = useState<MpfFormat>("both");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep(0);
    setSession(null);
    setFormat("both");
    setDownloaded(false);
    setError(null);
  };

  const generate = async () => {
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitPascodeInfo("mpf-roster", {
        session_id: session.session_id,
        pascode_info: session.pascodes.map((p) => ({
          pascode: p,
          unit_name: session.pascode_unit_map[p] ?? "",
          senior_rater_rank: "",
          senior_rater_title: "",
          senior_rater_first_name: "",
          senior_rater_last_name: "",
          commander_rank: "",
          commander_title: "",
          commander_first_name: "",
          commander_last_name: "",
        })),
      });
      setStep(3);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to prepare MPF document";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const download = async () => {
    if (!session) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await api.downloadDocument("mpf-roster", session.session_id, format);
      const tag = FORMAT_OPTIONS.find((f) => f.value === format)?.filenameTag ?? "MPF";
      downloadBlob(res.data, `${tag}_${session.cycle}_${session.year}.pdf`);
      setDownloaded(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Download failed";
      setError(msg);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (step === 3 && session && !downloaded && !downloading) {
      download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <Page>
      <PageHeader
        eyebrow="Promotions"
        title="MPF Roster Distribution"
        badge={
          session ? (
            <Badge color="navy">
              {session.cycle} · {session.year}
            </Badge>
          ) : null
        }
        description="Upload a roster to generate an MPF list, MEL format, or both as a merged PDF."
      />

      <StepIndicator steps={STEPS} current={step} />

      {step === 0 ? (
        <UploadStep
          type="mpf-roster"
          title="MPF Roster"
          cycles={MPF_CYCLES}
          onSuccess={(data, cycle, year) => {
            const d = data as unknown as {
              session_id: string;
              pascodes?: string[];
              pascode_unit_map?: Record<string, string>;
            };
            setSession({
              session_id: d.session_id,
              pascodes: d.pascodes ?? [],
              pascode_unit_map: d.pascode_unit_map ?? {},
              cycle,
              year,
              raw: data as unknown as Record<string, unknown>,
            });
            setStep(1);
          }}
        />
      ) : null}

      {step === 1 && session ? (
        <ReviewStep
          sessionData={{
            ...session.raw,
            session_id: session.session_id,
            cycle: session.cycle,
            year: session.year,
          } as Parameters<typeof ReviewStep>[0]["sessionData"]}
          showLogo={false}
          onContinue={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      ) : null}

      {step === 2 && session ? (
        <Card>
          <CardHeader
            title="Output format"
            description="This tool generates up to two separate documents. Pick the format your MPF needs."
          />
          <CardBody className="space-y-4">
            <div
              role="radiogroup"
              aria-label="Output format"
              className="grid grid-cols-1 gap-3 md:grid-cols-3"
            >
              {FORMAT_OPTIONS.map((opt) => {
                const selected = format === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFormat(opt.value)}
                    className={cn(
                      "relative rounded-lg border bg-surface p-4 text-left transition-colors",
                      selected
                        ? "border-primary ring-1 ring-primary dark:border-primary-text dark:ring-primary-text"
                        : "border-line hover:border-line-strong/60 hover:bg-surface-hover",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md",
                          selected
                            ? "bg-primary text-primary-fg"
                            : "bg-surface-hover text-fg-muted",
                        )}
                      >
                        {opt.icon}
                      </span>
                      <span className="text-sm font-semibold text-fg">{opt.label}</span>
                      {selected ? (
                        <CheckCircle2
                          className="ml-auto h-4 w-4 text-primary-text"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-fg-muted">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {error ? (
              <Alert tone="danger" onDismiss={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
          </CardBody>
          <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={submitting}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to review
            </Button>
            <Button
              onClick={generate}
              loading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Generate PDF
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {step === 3 && session ? (
        <Card>
          <CardBody className="flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-fg">Your MPF roster is ready</h2>
            <p className="mt-1 max-w-md text-sm text-fg-muted">
              Format:{" "}
              <span className="font-medium text-fg">
                {FORMAT_OPTIONS.find((f) => f.value === format)?.label}
              </span>
              . {downloaded ? "The download should have started automatically." : "Downloading…"}
            </p>
            {error ? (
              <Alert tone="danger" className="mt-5 w-full max-w-md text-left">
                {error}
              </Alert>
            ) : null}
            <div className="mt-6 flex w-full max-w-md flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={reset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Start a new session
              </Button>
              <Button
                onClick={download}
                loading={downloading}
                leftIcon={<Download className="h-4 w-4" />}
              >
                {downloaded ? "Download again" : "Download PDF"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </Page>
  );
}
