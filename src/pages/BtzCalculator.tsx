import { useState } from "react";
import { Crown } from "lucide-react";
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
    <Page>
      <PageHeader
        eyebrow="Calculators"
        icon={<Crown />}
        title="BTZ eligibility"
        description="Below-the-Zone A1C → SrA eligibility — board quarter and 36-month TIS exclusion."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Member information"
            description="Enter the enlistment date, A1C DOR and target year."
          />
          <CardBody>
            <div className="space-y-4">
              <SmartDateInput
                label="Initial enlistment date *"
                value={form.enlistment_date}
                onChange={(v) => update("enlistment_date", v)}
                hint="Date member first enlisted (36-mo TIS check)"
              />
              <SmartDateInput
                label="A1C Date of Rank (DOR) *"
                value={form.a1c_dor}
                onChange={(v) => update("a1c_dor", v)}
                hint="Date member was promoted to Airman First Class"
              />
              <Select
                label="Target BTZ year *"
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
                {loading ? "Checking…" : "Check BTZ eligibility"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-3" aria-live="polite">
          {error ? (
            <Alert tone="danger" title="Couldn't check BTZ eligibility">
              {error}
            </Alert>
          ) : null}
          {result ? (
            <ResultPanel result={result} />
          ) : !error ? (
            <Card>
              <EmptyState
                icon={<Crown />}
                title="No result yet"
                description="Enter the dates and target year, then check. The board quarter, 20-month TIG window and 36-month TIS exclusion are shown here."
              />
            </Card>
          ) : null}
        </div>
      </div>
    </Page>
  );
}

function ResultPanel({ result }: { result: BtzEligibilityResult }) {
  return (
    <div className="space-y-4">
      <Verdict
        eligible={result.eligible}
        title={result.eligible ? "BTZ eligible" : "Not BTZ eligible"}
        subtitle={
          <>
            Board: <span className="font-medium text-fg">{result.board_quarter}</span>
            {result.promotion_date ? (
              <>
                {" · Projected promotion: "}
                <span className="font-medium tabular-nums text-fg">{result.promotion_date}</span>
              </>
            ) : null}
          </>
        }
      />
      <RequirementList>
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
      </RequirementList>
      {!result.eligible &&
      result.ineligible_reasons &&
      result.ineligible_reasons.length > 0 ? (
        <ReasonList reasons={result.ineligible_reasons} />
      ) : null}
    </div>
  );
}
