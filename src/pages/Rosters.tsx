import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListChecks, Upload } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { api, apiErrorMessage, filenameFromDisposition } from "@/lib/api";
import { downloadBlob } from "@/lib/utils";
import type {
  RosterDefinition,
  RosterExportFormat,
  RosterParamValues,
  RosterRunResult,
  RosterUploadResponse,
} from "@/types";
import { UploadCard } from "@/features/rosters/UploadCard";
import { Catalog } from "@/features/rosters/Catalog";
import { ParamsForm } from "@/features/rosters/ParamsForm";
import { Results } from "@/features/rosters/Results";
import {
  availabilityOf,
  buildParams,
  initialValues,
  type FormValues,
} from "@/features/rosters/logic";

interface RunSnapshot {
  rosterId: string;
  params: RosterParamValues;
  asOf: string;
}

export default function Rosters() {
  const [upload, setUpload] = useState<RosterUploadResponse | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<RosterDefinition[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, FormValues>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [asOf, setAsOf] = useState("");

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<RosterRunResult | null>(null);
  const [lastRun, setLastRun] = useState<RunSnapshot | null>(null);

  const [exporting, setExporting] = useState<RosterExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const sessionId = upload?.session_id ?? null;

  const loadCatalog = useCallback(async (sid: string | null) => {
    setCatalogStatus("loading");
    setCatalogError(null);
    try {
      const res = await api.rosters.list(sid);
      setCatalog(Array.isArray(res.data) ? res.data : []);
      setCatalogStatus("ready");
    } catch (e) {
      const noResponse = !(e as { response?: unknown })?.response;
      setCatalogError(
        noResponse
          ? "The roster reports service didn't respond. It may not be available on this server yet — try again later."
          : await apiErrorMessage(e, "Roster reports are unavailable"),
      );
      setCatalogStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadCatalog(sessionId);
  }, [sessionId, loadCatalog]);

  const selected = useMemo(
    () => catalog.find((r) => r.id === selectedId) ?? null,
    [catalog, selectedId],
  );
  const formValues = useMemo<FormValues>(
    () => (selected ? values[selected.id] ?? initialValues(selected) : {}),
    [selected, values],
  );
  const validation = useMemo(
    () => (selected ? buildParams(selected, formValues) : null),
    [selected, formValues],
  );

  const stale =
    !!result &&
    !!lastRun &&
    !!selected &&
    lastRun.rosterId === selected.id &&
    !!validation &&
    (JSON.stringify(validation.params) !== JSON.stringify(lastRun.params) ||
      asOf !== lastRun.asOf);

  const select = (id: string) => {
    setSelectedId(id);
    setShowErrors(false);
    setRunError(null);
    if (lastRun && lastRun.rosterId !== id) {
      setResult(null);
      setLastRun(null);
    }
    // On narrow screens the detail panel is below the list — bring it into view.
    if (window.matchMedia?.("(max-width: 1023px)").matches) {
      window.setTimeout(
        () => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  };

  const setValue = (name: string, v: string) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      [selected.id]: { ...(prev[selected.id] ?? initialValues(selected)), [name]: v },
    }));
  };

  const resetDefaults = () => {
    if (!selected) return;
    setValues((prev) => ({ ...prev, [selected.id]: initialValues(selected) }));
    setShowErrors(false);
  };

  const run = async () => {
    if (!selected || !sessionId || !validation) return;
    setShowErrors(true);
    if (Object.keys(validation.errors).length) return;
    setRunning(true);
    setRunError(null);
    setExportError(null);
    try {
      const res = await api.rosters.run(selected.id, {
        session_id: sessionId,
        params: validation.params,
        ...(asOf ? { as_of_date: asOf } : {}),
      });
      setResult(res.data);
      setLastRun({ rosterId: selected.id, params: validation.params, asOf });
      window.setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    } catch (e) {
      setRunError(await apiErrorMessage(e, "The roster couldn't be run"));
    } finally {
      setRunning(false);
    }
  };

  const exportAs = async (format: RosterExportFormat) => {
    if (!lastRun || !sessionId || !result) return;
    setExporting(format);
    setExportError(null);
    try {
      const res = await api.rosters.export(lastRun.rosterId, {
        session_id: sessionId,
        params: lastRun.params,
        ...(lastRun.asOf ? { as_of_date: lastRun.asOf } : {}),
        format,
      });
      const fallback = `${result.roster_id}_${result.as_of || "roster"}.${format}`;
      const name =
        filenameFromDisposition(
          (res.headers as Record<string, string | undefined>)["content-disposition"],
        ) ?? fallback;
      downloadBlob(res.data, name);
    } catch (e) {
      setExportError(await apiErrorMessage(e, "Export failed"));
    } finally {
      setExporting(null);
    }
  };

  const resetUpload = () => {
    setUpload(null);
    setFileName(null);
    setResult(null);
    setLastRun(null);
    setRunError(null);
    setExportError(null);
    setShowErrors(false);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Rosters"
        icon={<ListChecks />}
        title="Roster reports"
        description="Upload a roster once, then run DEROS and assignment retainability, DOS window, HYT, UIF disposition and time-on-station reports. Export any result to PDF or Excel."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <UploadCard
            upload={upload}
            fileName={fileName}
            onUploaded={(res, name) => {
              setUpload(res);
              setFileName(name);
              setResult(null);
              setLastRun(null);
            }}
            onReset={resetUpload}
          />
          <Catalog
            rosters={catalog}
            status={catalogStatus}
            error={catalogError}
            upload={upload}
            selectedId={selectedId}
            onSelect={select}
            onRetry={() => void loadCatalog(sessionId)}
          />
        </div>

        <div ref={detailRef} className="min-w-0 scroll-mt-20 space-y-6 lg:col-span-7 xl:col-span-8">
          {selected ? (
            <ParamsForm
              roster={selected}
              availability={availabilityOf(selected, upload)}
              hasSession={!!sessionId}
              values={formValues}
              errors={showErrors && validation ? validation.errors : {}}
              asOf={asOf}
              running={running}
              runError={runError}
              onChange={setValue}
              onAsOfChange={setAsOf}
              onRun={run}
              onResetDefaults={resetDefaults}
              onDismissError={() => setRunError(null)}
            />
          ) : (
            <Card>
              {catalogStatus === "loading" ? (
                <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-fg-muted">
                  <Spinner />
                  Loading reports…
                </div>
              ) : (
                <EmptyState
                  icon={upload ? <ListChecks /> : <Upload />}
                  title={upload ? "Choose a report" : "Start by uploading a roster"}
                  description={
                    upload
                      ? "Pick a report from the list to set its parameters and run it."
                      : "PACE checks your columns and shows which reports can run. You can browse reports and their parameters in the meantime."
                  }
                />
              )}
            </Card>
          )}

          <div ref={resultRef} className="scroll-mt-20">
            {result && lastRun && selected && lastRun.rosterId === selected.id ? (
              <Results
                result={result}
                stale={stale}
                exporting={exporting}
                exportError={exportError}
                onExport={exportAs}
                onDismissExportError={() => setExportError(null)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Page>
  );
}
