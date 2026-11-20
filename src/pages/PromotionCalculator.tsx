import { useState } from "react";
import { Calculator } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import { Page } from "@/components/Page";
import {
  ReasonList,
  RequirementList,
  RequirementSection,
  Verdict,
} from "@/features/calculators/Result";
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
    <Page>
      <PageHeader
        eyebrow="Calculators"
        icon={<Calculator />}
        title="Promotion eligibility"
        description="Check TIG, TIS, and HYT requirements for a promotion cycle."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Member information"
            description="Enter the member's dates and current rank."
          />
          <CardBody>
            <div className="space-y-4">
              <SmartDateInput
                label="Date of Rank (DOR / TIG start) *"
                value={form.tig_date}
                onChange={(v) => update("tig_date", v)}
                hint="The date the member was promoted to current rank"
              />
              <SmartDateInput
                label="TAFMSD (TIS start date) *"
                value={form.tis_date}
                onChange={(v) => update("tis_date", v)}
                hint="Total Active Federal Military Service Date"
              />
              <Select
                label="Current rank *"
                value={form.current_rank}
                onChange={(e) => update("current_rank", e.target.value)}
              >
                <option value="">Select rank…</option>
                {RANKS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Target promotion cycle year *"
                value={form.target_year}
                onChange={(e) => update("target_year", e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </Select>
              <Button
                className="w-full"
                disabled={!canSubmit || loading}
                loading={loading}
                onClick={submit}
              >
                {loading ? "Checking…" : "Check eligibility"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-3" aria-live="polite">
          {error ? (
            <Alert tone="danger" title="Couldn't check eligibility">
              {error}
            </Alert>
          ) : null}
          {result ? (
            <ResultPanel result={result} currentRank={form.current_rank} />
          ) : !error ? (
            <Card>
              <EmptyState
                icon={<Calculator />}
                title="No result yet"
                description="Enter the member's DOR, TAFMSD, rank and cycle year, then check eligibility. Each requirement is itemized here."
              />
            </Card>
          ) : null}
        </div>
      </div>
    </Page>
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
    <div className="space-y-4">
      <Verdict
        eligible={result.eligible}
        title={result.eligible ? "Eligible" : "Not eligible"}
        subtitle={
          <>
            {currentRank} → {result.cycle} promotion cycle {result.year} · SCOD{" "}
            <span className="font-medium tabular-nums text-fg">{result.scod}</span>
          </>
        }
      />
      <RequirementList>
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
      </RequirementList>
      {!result.eligible &&
      result.unmet_requirements &&
      result.unmet_requirements.length > 0 ? (
        <ReasonList reasons={result.unmet_requirements} />
      ) : null}
    </div>
  );
}
