import { useState } from "react";
import { Crown, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api";
import { toBackendDate } from "@/lib/utils";
import type { BtzEligibilityResult } from "@/types";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

interface FormState {
  enlistment_date: string;
  a1c_dor: string;
  target_year: string;
}

export default function BtzCalculator() {
  const [form, setForm] = useState<FormState>({
    enlistment_date: "",
    a1c_dor: "",
    target_year: String(currentYear),
  });
  const [result, setResult] = useState<BtzEligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit = !!form.enlistment_date && !!form.a1c_dor && !!form.target_year;

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.post<BtzEligibilityResult>(
        "/api/calculators/btz-eligibility",
        {
          enlistment_date: toBackendDate(form.enlistment_date),
          a1c_dor: toBackendDate(form.a1c_dor),
          target_year: parseInt(form.target_year, 10),
        },
      );
      setResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-special/10 rounded-lg">
            <Crown className="w-7 h-7 text-special" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              BTZ Eligibility
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Below-the-Zone A1C → SRA eligibility — board quarter and 36-month
              TIS exclusion
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
            Enter the member's enlistment date, A1C DOR, and target year to
            check BTZ eligibility
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              label="Initial Enlistment Date *"
              type="date"
              value={form.enlistment_date}
              onChange={(e) => update("enlistment_date", e.target.value)}
              hint="Date member first enlisted (36-mo TIS check)"
            />
            <Input
              label="A1C Date of Rank (DOR) *"
              type="date"
              value={form.a1c_dor}
              onChange={(e) => update("a1c_dor", e.target.value)}
              hint="Date member was promoted to Airman First Class"
            />
            <Select
              label="Target BTZ Year *"
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
            {loading ? "Checking..." : "Check BTZ Eligibility"}
          </Button>

          {error ? (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          ) : null}

          {result ? <ResultPanel result={result} /> : null}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: BtzEligibilityResult }) {
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
            {result.eligible ? "BTZ ELIGIBLE" : "NOT BTZ ELIGIBLE"}
          </p>
          <p className="text-sm text-slate-600">
            Board: {result.board_quarter}
            {result.promotion_date ? (
              <>
                {" | Projected Promotion: "}
                <strong>{result.promotion_date}</strong>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        <RequirementSection
          title="20-Month TIG (Board Consideration)"
          met={result.requirements.tig_20_months.met}
          metLabel="In Target Year"
          notMetLabel="Outside Target Year"
          rows={[
            {
              label: "Board Quarter",
              value: result.requirements.tig_20_months.board_quarter,
            },
            {
              label: "Board Consideration Date (20 mo TIG)",
              value: result.requirements.tig_20_months.consideration_date,
            },
            {
              label: "Projected Promotion Date (22 mo TIG)",
              value: result.requirements.tig_20_months.promotion_date,
            },
            {
              label: "A1C DOR",
              value: result.requirements.tig_20_months.a1c_dor,
            },
          ]}
        />
        <RequirementSection
          title="36-Month TIS Exclusion"
          met={result.requirements.three_year_tis_exclusion.met}
          metLabel="Within Limit"
          notMetLabel="Exceeds Limit"
          rows={[
            {
              label: "TIS at Projected Promotion",
              value: result.requirements.three_year_tis_exclusion.tis_at_promotion,
            },
            {
              label: "36-Month TIS Date",
              value: result.requirements.three_year_tis_exclusion.three_year_date,
            },
            {
              label: "Initial Enlistment Date",
              value: result.requirements.three_year_tis_exclusion.enlistment_date,
            },
          ]}
        />
      </div>

      {!result.eligible &&
      result.ineligible_reasons &&
      result.ineligible_reasons.length > 0 ? (
        <div className="mt-3 p-3 bg-red-100 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">
            Reason(s) Not Eligible:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {result.ineligible_reasons.map((r, i) => (
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
