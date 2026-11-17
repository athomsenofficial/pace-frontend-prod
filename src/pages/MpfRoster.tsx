import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WizardShell, MetaLine, PageHeader, ActionBar, type RailStep } from "@/features/mel/WizardShell";
import { UploadStep } from "@/features/mel/UploadStep";
import { ReviewStep, type ReviewSummary } from "@/features/mel/ReviewStep";
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

const MPF_CYCLES = [
  { value: "SRA", label: "Senior Airman (SRA)" },
  { value: "SSG", label: "Staff Sergeant (SSG)" },
  { value: "TSG", label: "Technical Sergeant (TSG)" },
  { value: "MSG", label: "Master Sergeant (MSG)" },
  { value: "SMS", label: "Senior Master Sergeant (SMS)" },
];

interface FormatOption {
  value: MpfFormat;
  label: string;
  desc: string;
  filenameTag: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "list",
    label: "MPF list only",
    desc: "Simple roster listing: Name, Grade, Unit, DAFSC, DOR, TAFMSD",
    filenameTag: "MPF_List",
  },
  {
    value: "mel",
    label: "MEL format only",
    desc: "Master Eligibility List format with full eligibility determinations",
    filenameTag: "MEL",
  },
  {
    value: "both",
    label: "MPF list + MEL",
    desc: "MPF list and MEL merged into a single PDF document",
    filenameTag: "MPF_Both",
  },
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function MpfRoster() {
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [format, setFormat] = useState<MpfFormat>("both");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  const reset = () => {
    setStep(0);
    setSession(null);
    setFormat("both");
    setDownloaded(false);
    setError(null);
    setFileName(null);
    setSummary(null);
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

  const cycleYear = session ? `${session.cycle} · ${session.year}` : null;
  const meta = (n: number) => <MetaLine parts={[`Step ${n} of 4`, "MPF roster", cycleYear]} />;
  const units = session?.pascodes.length ?? 0;
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
          : step === 1 && summary && summary.discrepancy > 0
            ? `${plural(summary.discrepancy, "discrepancy", "discrepancies")} to review`
            : step === 1
              ? "Check each category"
              : "Reviewed",
      warn: step === 1 && !!summary && summary.discrepancy > 0,
    },
    {
      label: "Select format",
      status: step >= 2 ? FORMAT_OPTIONS.find((f) => f.value === format)?.label : "List, MEL or both",
    },
    { label: "Download PDF", status: step === 3 ? (downloaded ? "Downloaded" : "Ready") : "CUI-marked" },
  ];

  const startOver = () => {
    if (window.confirm("Start over with a new file? Your edits for this session will be cleared.")) reset();
  };

  return (
    <WizardShell
      kind="MPF roster"
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
          type="mpf-roster"
          title="MPF roster"
          cycles={MPF_CYCLES}
          meta={meta(1)}
          onSuccess={(data, cycle, year, name) => {
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
            setFileName(name ?? null);
            setSummary(null);
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
          meta={meta(2)}
          continueLabel="Continue to format"
          onSummaryChange={setSummary}
          onContinue={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      ) : null}

      {step === 2 && session ? (
        <>
          <PageHeader
            meta={meta(3)}
            title="Choose the output format"
            description="This tool generates up to two separate documents. Pick the format your MPF needs."
          />
          <fieldset className="mt-6 min-w-0">
            <legend className="vh">Output format</legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {FORMAT_OPTIONS.map((opt) => {
                const selected = format === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-2 border bg-surface p-4 transition-colors duration-1",
                      selected
                        ? "border-primary shadow-[inset_0_0_0_1px_rgb(var(--primary))]"
                        : "border-line hover:border-ink-3",
                    )}
                  >
                    <input
                      type="radio"
                      name="mpf-format"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setFormat(opt.value)}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span>
                      <span className="block font-semibold text-ink">{opt.label}</span>
                      <span className="mt-1 block text-sm text-ink-3">{opt.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error ? (
            <div role="alert" className="msg msg-error mt-4">
              {error}
            </div>
          ) : null}

          <div className="flex-1" />
          <ActionBar
            back={
              <Button
                variant="tertiary"
                onClick={() => setStep(1)}
                disabled={submitting}
                leftIcon={<ArrowLeft />}
              >
                Back to review
              </Button>
            }
            status={`${FORMAT_OPTIONS.find((f) => f.value === format)?.label} selected.`}
            primary={
              <Button onClick={generate} loading={submitting} rightIcon={<ArrowRight />}>
                Generate PDF
              </Button>
            }
          />
        </>
      ) : null}

      {step === 3 && session ? (
        <>
          <PageHeader
            meta={meta(4)}
            title="Download the PDF"
            description="The document is CUI-marked. Store and send it the way your unit handles CUI."
          />
          <div role="status" className="msg msg-ok mt-6 max-w-2xl">
            <b>Your MPF roster is ready.</b>{" "}
            {downloaded
              ? "The download started. If it didn't, use Download PDF below."
              : downloading
                ? "Preparing the download…"
                : "Use Download PDF below to save it."}
          </div>
          {error ? (
            <div role="alert" className="msg msg-error mt-4 max-w-2xl">
              {error}
            </div>
          ) : null}
          <div className="flex-1" />
          <ActionBar
            back={
              <Button variant="tertiary" onClick={reset} leftIcon={<RotateCcw />}>
                Start a new session
              </Button>
            }
            primary={
              <Button onClick={download} loading={downloading} leftIcon={<Download />}>
                {downloaded ? "Download again" : "Download PDF"}
              </Button>
            }
          />
        </>
      ) : null}
    </WizardShell>
  );
}
