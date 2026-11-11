import { useState } from "react";
import { Calculator, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Promotion Eligibility
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Check TIG, TIS, and HYT requirements for a promotion cycle
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Member Information
          </h3>
          <p className="text-sm text-slate-500">
            Enter the member's dates and current rank to check promotion
            eligibility
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Date of Rank (DOR / TIG Start) *"
              type="date"
              value={form.tig_date}
              onChange={(e) => update("tig_date", e.target.value)}
              hint="The date the member was promoted to current rank"
            />
            <Input
              label="TAFMSD (TIS Start Date) *"
              type="date"
              value={form.tis_date}
              onChange={(e) => update("tis_date", e.target.value)}
              hint="Total Active Federal Military Service Date"
            />
            <Select
              label="Current Rank *"
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
              label="Target Promotion Cycle Year *"
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
            className="w-full"
            disabled={!canSubmit || loading}
            loading={loading}
            onClick={submit}
          >
            {loading ? "Checking..." : "Check Eligibility"}
          </Button>

          {error ? (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          ) : null}

          {result ? <ResultPanel result={result} currentRank={form.current_rank} /> : null}
        </div>
      </div>
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
    <div
      className={`mt-6 rounded-xl border-2 p-5 ${
        result.eligible
          ? "border-green-300 bg-green-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        {result.eligible ? (
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        ) : (
          <XCircle className="w-10 h-10 text-red-600" />
        )}
        <div>
          <p
            className={`text-2xl font-bold ${
              result.eligible ? "text-green-800" : "text-red-800"
            }`}
          >
            {result.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
          </p>
          <p className="text-sm text-slate-600">
            {currentRank} → {result.cycle} Promotion Cycle {result.year}
            {" | SCOD: "}
            {result.scod}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
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
        <div className="mt-3 p-3 bg-red-100 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">
            Reason(s) Not Eligible:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {result.unmet_requirements.map((r, i) => (
              <li key={i} className="text-sm text-red-700">
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
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-slate-700">{title}</span>
        <MetBadge met={met} label={met ? metLabel : notMetLabel} />
      </div>
      <div className="space-y-0.5">
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        met ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
      }`}
    >
      {met ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}
