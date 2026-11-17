import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Badge";
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-line pb-5">
        <span className="eyebrow">Calculators</span>
        <h1 className="page-title mt-2">BTZ Eligibility</h1>
        <p className="mt-2 max-w-[64ch] text-ink-3">
          Below-the-Zone A1C → SRA eligibility — board quarter and 36-month
          TIS exclusion
        </p>
      </header>

      <section className="panel" aria-labelledby="member-info">
        <div className="border-b border-line px-5 py-4">
          <h2 id="member-info" className="text-base font-semibold text-ink">
            Member Information
          </h2>
          <p className="text-sm text-ink-3">
            Enter the member's enlistment date, A1C DOR, and target year to
            check BTZ eligibility
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Initial Enlistment Date"
              type="date"
              value={form.enlistment_date}
              onChange={(e) => update("enlistment_date", e.target.value)}
              hint="Date member first enlisted (36-mo TIS check)"
            />
            <Input
              label="A1C Date of Rank (DOR)"
              type="date"
              value={form.a1c_dor}
              onChange={(e) => update("a1c_dor", e.target.value)}
              hint="Date member was promoted to Airman First Class"
            />
            <Select
              label="Target BTZ Year"
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
            {loading ? "Checking..." : "Check BTZ Eligibility"}
          </Button>

          {error ? (
            <div role="alert" className="msg msg-error mt-4 flex items-start gap-2 break-words">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-inel" />
              <span className="min-w-0">{error}</span>
            </div>
          ) : null}

          {result ? <ResultPanel result={result} /> : null}
        </div>
      </section>
    </div>
  );
}

function ResultPanel({ result }: { result: BtzEligibilityResult }) {
  return (
    <div className="mt-6" aria-live="polite">
      <div
        className={`msg ${result.eligible ? "msg-ok" : "msg-error"} flex flex-wrap items-center gap-x-4 gap-y-2`}
      >
        <Tag tone={result.eligible ? "elig" : "inel"}>
          {result.eligible ? "BTZ eligible" : "Not BTZ eligible"}
        </Tag>
        <p className="min-w-0 text-sm text-ink-2">
          Board: <span className="num">{result.board_quarter}</span>
          {result.promotion_date ? (
            <>
              {" | Projected Promotion: "}
              <strong className="num">{result.promotion_date}</strong>
            </>
          ) : null}
        </p>
      </div>

      <div className="panel mt-3 divide-y divide-line">
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
        <div className="msg msg-error mt-3">
          <p className="mb-1 font-semibold text-ink">Reason(s) Not Eligible:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {result.ineligible_reasons.map((r, i) => (
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
