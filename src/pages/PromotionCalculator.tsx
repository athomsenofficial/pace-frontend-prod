import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Badge";
import { apiClient } from "@/lib/api";
import { toBackendDate } from "@/lib/utils";
import type { PromotionEligibilityResult } from "@/types";

const RANKS = [
  { value: "AB", label: "AB – Airman Basic" },
  { value: "AMN", label: "AMN – Airman" },
  { value: "A1C", label: "A1C – Airman First Class" },
  { value: "SRA", label: "SRA – Senior Airman" },
  { value: "SSG", label: "SSG – Staff Sergeant" },
  { value: "TSG", label: "TSG – Technical Sergeant" },
  { value: "MSG", label: "MSG – Master Sergeant" },
  { value: "SMS", label: "SMS – Senior Master Sergeant" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

interface FormState {
  tig_date: string;
  tis_date: string;
  current_rank: string;
  target_year: string;
}

export default function PromotionCalculator() {
  const [form, setForm] = useState<FormState>({
    tig_date: "",
    tis_date: "",
    current_rank: "",
    target_year: String(currentYear),
  });
  const [result, setResult] = useState<PromotionEligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    !!form.tig_date && !!form.tis_date && !!form.current_rank && !!form.target_year;

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.post<PromotionEligibilityResult>(
        "/api/calculators/promotion-eligibility",
        {
          tig_date: toBackendDate(form.tig_date),
          tis_date: toBackendDate(form.tis_date),
          current_rank: form.current_rank,
          target_year: parseInt(form.target_year, 10),
        },
      );
      setResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(
        err?.response?.data?.error || err?.message || "Request failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-line pb-5">
        <span className="eyebrow">Calculators</span>
        <h1 className="page-title mt-2">Promotion Eligibility</h1>
        <p className="mt-2 max-w-[64ch] text-ink-3">
          Check TIG, TIS, and HYT requirements for a promotion cycle
        </p>
      </header>

      <section className="panel" aria-labelledby="member-info">
        <div className="border-b border-line px-5 py-4">
          <h2 id="member-info" className="text-base font-semibold text-ink">
            Member Information
          </h2>
          <p className="text-sm text-ink-3">
            Enter the member's dates and current rank to check promotion
            eligibility
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Date of Rank (DOR / TIG Start)"
              type="date"
              value={form.tig_date}
              onChange={(e) => update("tig_date", e.target.value)}
              hint="The date the member was promoted to current rank"
            />
            <Input
              label="TAFMSD (TIS Start Date)"
              type="date"
              value={form.tis_date}
              onChange={(e) => update("tis_date", e.target.value)}
              hint="Total Active Federal Military Service Date"
            />
            <Select
              label="Current Rank"
              value={form.current_rank}
              onChange={(e) => update("current_rank", e.target.value)}
            >
              <option value="">Select rank...</option>
              {RANKS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Select
              label="Target Promotion Cycle Year"
              value={form.target_year}
              onChange={(e) => update("target_year", e.target.value)}
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="primary"
            className="w-full sm:w-auto"
            disabled={!canSubmit || loading}
            loading={loading}
            onClick={submit}
          >
            {loading ? "Checking..." : "Check Eligibility"}
          </Button>

          {error ? (
            <div role="alert" className="msg msg-error mt-4 flex items-start gap-2 break-words">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-inel" />
              <span className="min-w-0">{error}</span>
            </div>
          ) : null}

          {result ? <ResultPanel result={result} currentRank={form.current_rank} /> : null}
        </div>
      </section>
    </div>
  );
}

function ResultPanel({
  result,
  currentRank,
}: {
  result: PromotionEligibilityResult;
  currentRank: string;
}) {
  return (
    <div className="mt-6" aria-live="polite">
      <div
        className={`msg ${result.eligible ? "msg-ok" : "msg-error"} flex flex-wrap items-center gap-x-4 gap-y-2`}
      >
        <Tag tone={result.eligible ? "elig" : "inel"}>
          {result.eligible ? "Eligible" : "Not eligible"}
        </Tag>
        <p className="min-w-0 text-sm text-ink-2">
          <span className="code">{currentRank}</span> → {result.cycle} Promotion Cycle{" "}
          <span className="num">{result.year}</span>
          {" | SCOD: "}
          <span className="num">{result.scod}</span>
        </p>
      </div>

      <div className="panel mt-3 divide-y divide-line">
        <RequirementSection
          title="Time in Grade (TIG)"
          met={result.requirements.tig.met}
          metLabel="Met"
          notMetLabel="Not Met"
          rows={[
            { label: "Required", value: result.requirements.tig.required },
            { label: "Actual", value: result.requirements.tig.actual },
            {
              label: "Must have DOR on or before",
              value: result.requirements.tig.required_date,
            },
            { label: "Member DOR", value: result.requirements.tig.member_date },
          ]}
        />
        <RequirementSection
          title="Time in Service (TIS / TAFMSD)"
          met={result.requirements.tis.met}
          metLabel="Met"
          notMetLabel="Not Met"
          rows={[
            { label: "Required", value: result.requirements.tis.required },
            { label: "Actual", value: result.requirements.tis.actual },
            {
              label: "Must have TAFMSD on or before",
              value: result.requirements.tis.required_date,
            },
            { label: "Member TAFMSD", value: result.requirements.tis.member_date },
          ]}
        />
        <RequirementSection
          title="High Year Tenure (HYT)"
          met={result.requirements.hyt.met}
          metLabel="Met"
          notMetLabel="Exceeded"
          rows={[
            { label: "HYT Limit", value: result.requirements.hyt.limit },
            { label: "Current TIS at SCOD", value: result.requirements.hyt.current },
            { label: "HYT Date", value: result.requirements.hyt.hyt_date },
            { label: "MDOS Required", value: result.requirements.hyt.mdos_date },
          ]}
        />
      </div>

      {!result.eligible &&
      result.unmet_requirements &&
      result.unmet_requirements.length > 0 ? (
        <div className="msg msg-error mt-3">
          <p className="mb-1 font-semibold text-ink">Reason(s) Not Eligible:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {result.unmet_requirements.map((r, i) => (
              <li key={i} className="text-sm text-ink-2">
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RequirementSection({
  title,
  met,
  metLabel,
  notMetLabel,
  rows,
}: {
  title: string;
  met: boolean;
  metLabel: string;
  notMetLabel: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <MetBadge met={met} label={met ? metLabel : notMetLabel} />
      </div>
      <div>
        {rows.map((r) => (
          <KvRow key={r.label} label={r.label} value={r.value} />
        ))}
      </div>
    </div>
  );
}

function MetBadge({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
        met ? "text-elig" : "text-inel"
      }`}
    >
      {met ? (
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      ) : (
        <XCircle aria-hidden="true" className="h-4 w-4" />
      )}
      {label}
    </span>
  );
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-1.5 text-sm last:border-0">
      <span className="min-w-0 text-ink-3">{label}</span>
      <span className="num min-w-0 text-right font-medium text-ink [overflow-wrap:anywhere]">
        {value}
      </span>
    </div>
  );
}
