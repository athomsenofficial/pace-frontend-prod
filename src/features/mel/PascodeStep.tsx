import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, CircleDashed, FileCheck2 } from "lucide-react";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { apiClient, type MelType } from "@/lib/api";

const OFFICER_RANKS = [
  { value: "2d Lt", label: "2d Lt - Second Lieutenant" },
  { value: "1st Lt", label: "1st Lt - First Lieutenant" },
  { value: "Capt", label: "Capt - Captain" },
  { value: "Maj", label: "Maj - Major" },
  { value: "Lt Col", label: "Lt Col - Lieutenant Colonel" },
  { value: "Col", label: "Col - Colonel" },
  { value: "Brig Gen", label: "Brig Gen - Brigadier General" },
  { value: "Maj Gen", label: "Maj Gen - Major General" },
  { value: "Lt Gen", label: "Lt Gen - Lieutenant General" },
  { value: "Gen", label: "Gen - General" },
];

export interface PascodeEntry {
  srid: string;
  senior_rater_rank: string;
  senior_rater_title: string;
  senior_rater_first_name: string;
  senior_rater_middle_name: string;
  senior_rater_last_name: string;
  commander_rank: string;
  commander_title: string;
  commander_first_name: string;
  commander_middle_name: string;
  commander_last_name: string;
}

const blankEntry = (): PascodeEntry => ({
  srid: "",
  senior_rater_rank: "Col",
  senior_rater_title: "Commander",
  senior_rater_first_name: "FIRST",
  senior_rater_middle_name: "M",
  senior_rater_last_name: "LAST",
  commander_rank: "Lt Col",
  commander_title: "Commander",
  commander_first_name: "FIRST",
  commander_middle_name: "M",
  commander_last_name: "LAST",
});

interface SessionData {
  session_id: string;
  cycle?: string;
  pascodes?: string[];
  pascode_unit_map?: Record<string, string>;
  pascode_map?: Record<string, unknown>;
  small_unit_sr?: unknown;
  senior_rater_needed?: boolean;
  categories?: {
    small_unit?: Array<{ ASSIGNED_PAS?: string }>;
  };
}

interface PascodeStepProps {
  sessionData: SessionData;
  type: MelType;
  onSubmitted: (pdfBlob: Blob) => void;
}

export function PascodeStep({
  sessionData,
  type,
  onSubmitted,
}: PascodeStepProps) {
  const pascodes = useMemo(
    () => sessionData.pascodes ?? [],
    [sessionData.pascodes],
  );
  const pascodeUnitMap = sessionData.pascode_unit_map ?? {};
  const smallUnitPascodes = useMemo(
    () =>
      sessionData.categories?.small_unit
        ?.map((m) => m.ASSIGNED_PAS)
        .filter((p): p is string => !!p) ?? [],
    [sessionData.categories],
  );

  const [entries, setEntries] = useState<Record<string, PascodeEntry>>({});
  const [smallUnitSr, setSmallUnitSr] = useState<PascodeEntry>(blankEntry);
  const [activeTab, setActiveTab] = useState<string>(pascodes[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, PascodeEntry> = {};
    pascodes.forEach((p) => {
      const existing = (sessionData.pascode_map?.[p] ?? {}) as Partial<PascodeEntry>;
      next[p] = { ...blankEntry(), ...existing };
    });
    setEntries(next);
    if (sessionData.senior_rater_needed) {
      const seed = (sessionData.small_unit_sr ?? {}) as Partial<PascodeEntry>;
      setSmallUnitSr({ ...blankEntry(), ...seed });
    }
    if (!activeTab && pascodes[0]) setActiveTab(pascodes[0]);
  }, [pascodes, sessionData]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycle = sessionData.cycle ?? "";
  const requiresSrDetail = (pascode: string) =>
    cycle === "MSG" || cycle === "SMS"
      ? true
      : smallUnitPascodes.includes(pascode);

  const updateEntry = (
    pascode: string,
    key: keyof PascodeEntry,
    value: string,
  ) =>
    setEntries((prev) => ({
      ...prev,
      [pascode]: { ...(prev[pascode] ?? blankEntry()), [key]: value },
    }));

  const updateSmallUnitSr = (key: keyof PascodeEntry, value: string) =>
    setSmallUnitSr((prev) => ({ ...prev, [key]: value }));

  // Propagate one SRID to every PAS code so the whole page can be filled from a
  // single entry (most units share the same senior rater / SRID).
  const applySridToAll = (srid: string) => {
    const v = srid.trim();
    if (!v) return;
    setEntries((prev) => {
      const next: Record<string, PascodeEntry> = {};
      for (const [p, e] of Object.entries(prev)) next[p] = { ...e, srid: v };
      return next;
    });
  };

  const isCommanderFilled = (e: PascodeEntry) =>
    !!(
      e.commander_rank &&
      e.commander_title &&
      e.commander_first_name &&
      e.commander_last_name
    );
  const isSridFilled = (e: PascodeEntry) => !!e.srid;
  const isSrFilled = (e: PascodeEntry) =>
    !!(
      e.senior_rater_rank &&
      e.senior_rater_title &&
      e.senior_rater_first_name &&
      e.senior_rater_last_name
    );

  const canSubmit = () => {
    const allPascodesOk = Object.entries(entries).every(([p, e]) => {
      const cmd = isCommanderFilled(e);
      const sr = isSridFilled(e);
      const detail = !requiresSrDetail(p) || isSrFilled(e);
      return cmd && sr && detail;
    });
    const smallUnitOk =
      !sessionData.senior_rater_needed ||
      (isCommanderFilled(smallUnitSr) &&
        isSridFilled(smallUnitSr) &&
        isSrFilled(smallUnitSr));
    return allPascodesOk && smallUnitOk;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, PascodeEntry> = {};
      Object.entries(entries).forEach(([p, e]) => {
        payload[p] = trimEntry(e);
      });
      if (sessionData.senior_rater_needed) {
        (payload as Record<string, unknown>).small_unit_sr = trimEntry(smallUnitSr);
      }
      const res = await apiClient.post(
        `/api/${type}/submit/pascode-info`,
        {
          session_id: sessionData.session_id,
          pascode_info: payload,
        },
        { responseType: "blob" },
      );
      onSubmitted(res.data as Blob);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(
        err?.response?.data?.detail || err?.message || "Submission failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (pascodes.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<CircleDashed />}
          title="No PASCODEs detected for this session"
          description="Verify the roster step and ensure members include PASCODE assignments before continuing."
        />
      </Card>
    );
  }

  const renderForm = (
    entry: PascodeEntry,
    onChange: (key: keyof PascodeEntry, value: string) => void,
    pascode?: string,
  ) => {
    const showSrDetail = pascode ? requiresSrDetail(pascode) : true;
    return (
      <div className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="mb-3 w-full border-b border-line pb-2 text-sm font-semibold text-fg">
            Unit commander
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Commander Rank *"
              value={entry.commander_rank}
              onChange={(e) => onChange("commander_rank", e.target.value)}
              disabled={submitting}
              options={OFFICER_RANKS}
            />
            <Input
              label="Commander Title *"
              value={entry.commander_title}
              onChange={(e) => onChange("commander_title", e.target.value)}
              disabled={submitting}
              placeholder="Commander"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem_1fr] md:col-span-2">
              <Input
                label="First Name *"
                value={entry.commander_first_name}
                onChange={(e) =>
                  onChange("commander_first_name", e.target.value)
                }
                disabled={submitting}
                placeholder="FIRST"
              />
              <Input
                label="Middle Initial"
                value={entry.commander_middle_name}
                onChange={(e) =>
                  onChange("commander_middle_name", e.target.value)
                }
                disabled={submitting}
                placeholder="M"
              />
              <Input
                label="Last Name *"
                value={entry.commander_last_name}
                onChange={(e) =>
                  onChange("commander_last_name", e.target.value)
                }
                disabled={submitting}
                placeholder="LAST"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 w-full border-b border-line pb-2 text-sm font-semibold text-fg">
            Senior rater
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Senior Rater ID (SRID) *"
              value={entry.srid}
              onChange={(e) => onChange("srid", e.target.value)}
              disabled={submitting}
              placeholder="e.g., 1234567"
            />
            {showSrDetail ? (
              <>
                <Select
                  label="Senior Rater Rank *"
                  value={entry.senior_rater_rank}
                  onChange={(e) =>
                    onChange("senior_rater_rank", e.target.value)
                  }
                  disabled={submitting}
                  options={OFFICER_RANKS}
                />
                <Input
                  label="Senior Rater Title *"
                  value={entry.senior_rater_title}
                  onChange={(e) =>
                    onChange("senior_rater_title", e.target.value)
                  }
                  disabled={submitting}
                  placeholder="Commander"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem_1fr] md:col-span-2">
                  <Input
                    label="First Name *"
                    value={entry.senior_rater_first_name}
                    onChange={(e) =>
                      onChange("senior_rater_first_name", e.target.value)
                    }
                    disabled={submitting}
                    placeholder="FIRST"
                  />
                  <Input
                    label="Middle Initial"
                    value={entry.senior_rater_middle_name}
                    onChange={(e) =>
                      onChange("senior_rater_middle_name", e.target.value)
                    }
                    disabled={submitting}
                    placeholder="M"
                  />
                  <Input
                    label="Last Name *"
                    value={entry.senior_rater_last_name}
                    onChange={(e) =>
                      onChange("senior_rater_last_name", e.target.value)
                    }
                    disabled={submitting}
                    placeholder="LAST"
                  />
                </div>
              </>
            ) : null}
          </div>
        </fieldset>
      </div>
    );
  };

  const hasMultiple = pascodes.length > 1;

  const isPascodeComplete = (p: string) => {
    const e = entries[p];
    if (!e) return false;
    return isCommanderFilled(e) && isSridFilled(e) && (!requiresSrDetail(p) || isSrFilled(e));
  };
  const completeCount = pascodes.filter(isPascodeComplete).length;
  const ready = canSubmit();

  const pascodeBanner = (p: string, withApply: boolean) => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">
          PASCODE <span className="font-mono">{p}</span>
        </p>
        {pascodeUnitMap[p] ? (
          <p className="truncate text-xs text-fg-muted">{pascodeUnitMap[p]}</p>
        ) : null}
      </div>
      {withApply ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!entries[p]?.srid?.trim() || submitting}
          onClick={() => applySridToAll(entries[p]?.srid ?? "")}
          title="Copy this SRID into every PAS code"
        >
          Apply SRID to all PAS codes
        </Button>
      ) : null}
    </div>
  );

  return (
    <Card>
      <form onSubmit={submit}>
        <CardHeader
          title="Force distribution information"
          description={
            <>
              Enter commander and senior rater details for each PASCODE.{" "}
              <span className="whitespace-nowrap font-mono text-xs text-fg-subtle">
                Session {sessionData.session_id}
              </span>
            </>
          }
          actions={
            hasMultiple ? (
              <Badge color={completeCount === pascodes.length ? "green" : "neutral"}>
                {completeCount} of {pascodes.length} complete
              </Badge>
            ) : null
          }
        />
        <CardBody className="space-y-5">
          {error ? (
            <Alert tone="danger" title="Couldn't generate the PDF" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          {hasMultiple ? (
            <>
              <Tabs
                ariaLabel="PASCODEs"
                items={pascodes.map((p) => ({
                  value: p,
                  label: (
                    <span className="flex items-center gap-1.5">
                      {isPascodeComplete(p) ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-label="Complete" />
                      ) : (
                        <CircleDashed className="h-4 w-4 text-fg-subtle" aria-label="Incomplete" />
                      )}
                      <span className="font-mono text-[13px]">{p}</span>
                      {pascodeUnitMap[p] ? (
                        <span className="hidden max-w-[10rem] truncate text-xs font-normal text-fg-subtle md:inline">
                          {pascodeUnitMap[p]}
                        </span>
                      ) : null}
                    </span>
                  ),
                }))}
                value={activeTab}
                onChange={setActiveTab}
              />
              {pascodes.map((p) =>
                p === activeTab ? (
                  <div key={p} className="space-y-5">
                    {pascodeBanner(p, true)}
                    {renderForm(
                      entries[p] ?? blankEntry(),
                      (k, v) => updateEntry(p, k, v),
                      p,
                    )}
                  </div>
                ) : null,
              )}
            </>
          ) : (
            <div className="space-y-5">
              {pascodeBanner(pascodes[0], false)}
              {renderForm(
                entries[pascodes[0]] ?? blankEntry(),
                (k, v) => updateEntry(pascodes[0], k, v),
                pascodes[0],
              )}
            </div>
          )}

          {sessionData.senior_rater_needed ? (
            <div className="space-y-5 border-t border-line pt-5">
              <Alert tone="info" title="Small unit senior rater">
                Required for units with special senior rater requirements.
              </Alert>
              {renderForm(smallUnitSr, updateSmallUnitSr)}
            </div>
          ) : null}
        </CardBody>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-muted">
            {ready
              ? "All required fields are complete."
              : "Complete the required (*) fields for every PASCODE to continue."}
          </p>
          <Button
            type="submit"
            disabled={!ready || submitting}
            loading={submitting}
            leftIcon={<FileCheck2 className="h-4 w-4" />}
          >
            {submitting ? "Generating PDF…" : "Generate PDF"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function trimEntry(e: PascodeEntry): PascodeEntry & { senior_rater_name: string } {
  const trimmed = Object.fromEntries(
    Object.entries(e).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
  ) as PascodeEntry;
  const name = [
    trimmed.senior_rater_first_name,
    trimmed.senior_rater_middle_name,
    trimmed.senior_rater_last_name,
  ]
    .filter(Boolean)
    .join(" ");
  return { ...trimmed, senior_rater_name: name };
}
