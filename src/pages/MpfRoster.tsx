import { useEffect, useState } from "react";
import { ArrowRight, Download, FileText, FileSpreadsheet, Files } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
    icon: <FileSpreadsheet className="w-5 h-5 text-primary" />,
    label: "MPF List Only",
    desc: "Simple roster listing: Name, Grade, Unit, DAFSC, DOR, TAFMSD",
    filenameTag: "MPF_List",
  },
  {
    value: "mel",
    icon: <FileText className="w-5 h-5 text-success" />,
    label: "MEL Format Only",
    desc: "Master Eligibility List format with full eligibility determinations",
    filenameTag: "MEL",
  },
  {
    value: "both",
    icon: <Files className="w-5 h-5 text-accent" />,
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            MPF Roster Distribution
          </h1>
          <Badge color="navy">Step {step + 1} of 4</Badge>
        </div>
        <p className="text-slate-600 mt-2">
          Upload a roster to generate an MPF list, MEL format, or both as a
          merged PDF.
        </p>
      </div>

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
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-slate-900">
                MPF Roster Output Formats
              </h2>
              <p className="text-sm text-slate-600">
                This tool generates up to two separate documents. Pick the
                format your MPF needs.
              </p>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMAT_OPTIONS.map((opt) => {
              const selected = format === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    "rounded-lg border-2 bg-white text-left p-5 transition-colors",
                    selected
                      ? "border-primary/30 bg-primary/5"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {opt.icon}
                    <span className="font-semibold text-slate-900">
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="rounded-md bg-danger/10 border border-danger/30 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={generate}
              loading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Generate PDF
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && session ? (
        <Card>
          <CardBody className="space-y-6 text-center py-10">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Your MPF Roster is ready
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                Select a format and download your MPF roster PDF.
              </p>
            </div>
            {error ? (
              <div className="rounded-md bg-danger/10 border border-danger/30 px-3 py-2 text-sm text-danger max-w-md mx-auto">
                {error}
              </div>
            ) : null}
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                variant="primary"
                size="lg"
                onClick={download}
                loading={downloading}
                leftIcon={<Download className="h-4 w-4" />}
              >
                {downloaded ? "Download again" : "Download PDF"}
              </Button>
              <Button variant="outline" size="lg" onClick={reset}>
                Start a new session
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
