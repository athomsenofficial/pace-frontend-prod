import { useMemo, useState } from "react";
import { AlertTriangle, FileDown, FileSpreadsheet, Search, Users } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { RosterExportFormat, RosterRunResult } from "@/types";
import { compareCells, formatCell, isNumericColumn } from "./logic";

interface ResultsProps {
  result: RosterRunResult;
  stale: boolean;
  exporting: RosterExportFormat | null;
  exportError: string | null;
  onExport: (format: RosterExportFormat) => void;
  onDismissExportError: () => void;
}

export function Results({
  result,
  stale,
  exporting,
  exportError,
  onExport,
  onDismissExportError,
}: ResultsProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const numeric = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const c of result.columns) m[c.key] = isNumericColumn(result.rows, c.key);
    return m;
  }, [result]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = result.rows;
    if (q) {
      out = out.filter((r) =>
        result.columns.some((c) => formatCell(r[c.key]).toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const dir = sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        // Blanks stay last in either direction.
        const aBlank = av === null || av === undefined || av === "";
        const bBlank = bv === null || bv === undefined || bv === "";
        if (aBlank || bBlank) return compareCells(av, bv);
        return compareCells(av, bv) * dir;
      });
    }
    return out;
  }, [result, query, sort]);

  const toggleSort = (key: string) =>
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
          ? { key, dir: "desc" }
          : null,
    );

  return (
    <Card>
      <CardHeader
        title={result.title}
        description={
          <span className="tabular-nums">
            <span className="font-medium text-fg">
              {result.count.toLocaleString("en-US")} member{result.count === 1 ? "" : "s"}
            </span>{" "}
            · as of {formatCell(result.as_of)}
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("xlsx")}
              loading={exporting === "xlsx"}
              disabled={!!exporting}
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
              Excel
            </Button>
            <Button
              size="sm"
              onClick={() => onExport("pdf")}
              loading={exporting === "pdf"}
              disabled={!!exporting}
              leftIcon={<FileDown className="h-4 w-4" />}
            >
              Export PDF
            </Button>
          </>
        }
      />
      <CardBody className="space-y-4">
        {stale ? (
          <Alert tone="neutral" icon={<AlertTriangle />}>
            Parameters have changed since this report ran. Run it again to update the
            results — exports use the parameters shown here.
          </Alert>
        ) : null}

        {exportError ? (
          <Alert tone="danger" title="Export failed" onDismiss={onDismissExportError}>
            {exportError}
          </Alert>
        ) : null}

        {result.warnings.length ? (
          <Alert
            tone="warning"
            title={`${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}`}
          >
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        {result.missing_columns.length ? (
          <Alert tone="info" title="Some optional columns weren't in your roster">
            Results may be less complete without{" "}
            <span className="font-mono text-xs text-fg">{result.missing_columns.join(", ")}</span>.
          </Alert>
        ) : null}

        {result.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong/50">
            <EmptyState
              compact
              icon={<Users />}
              title="No members match this report"
              description="Nobody on the roster meets the criteria for these parameters and as-of date."
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="sm:w-72">
              <Input
                leadingIcon={<Search />}
                  aria-label="Filter results"
                  placeholder="Filter rows…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <p className="text-xs tabular-nums text-fg-subtle">
                {rows.length === result.rows.length
                  ? `${rows.length.toLocaleString("en-US")} rows`
                  : `${rows.length.toLocaleString("en-US")} of ${result.rows.length.toLocaleString("en-US")} rows`}
                {sort ? " · sorted" : ""}
              </p>
            </div>

            <Table maxHeight="65vh" dense zebra>
              <THead>
                <TR>
                  {result.columns.map((c) => (
                    <TH
                      key={c.key}
                      numeric={numeric[c.key]}
                      sort={sort?.key === c.key ? sort.dir : null}
                      onSort={() => toggleSort(c.key)}
                    >
                      {c.label}
                    </TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <TR>
                    <TD colSpan={result.columns.length}>
                      <EmptyState compact title="No rows match your filter" />
                    </TD>
                  </TR>
                ) : (
                  rows.map((r, i) => (
                    <TR key={i}>
                      {result.columns.map((c) => (
                        <TD
                          key={c.key}
                          numeric={numeric[c.key]}
                          className="whitespace-nowrap"
                        >
                          {formatCell(r[c.key])}
                        </TD>
                      ))}
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </>
        )}
      </CardBody>
    </Card>
  );
}
