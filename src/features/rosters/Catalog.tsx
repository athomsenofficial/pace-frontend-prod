import { CheckCircle2, CircleAlert, ListChecks, RotateCw } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { RosterDefinition, RosterUploadResponse } from "@/types";
import { availabilityOf } from "./logic";

interface CatalogProps {
  rosters: RosterDefinition[];
  status: "loading" | "ready" | "error";
  error: string | null;
  upload: RosterUploadResponse | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

export function Catalog({
  rosters,
  status,
  error,
  upload,
  selectedId,
  onSelect,
  onRetry,
}: CatalogProps) {
  const availableCount = upload
    ? rosters.filter((r) => availabilityOf(r, upload).state === "available").length
    : null;

  return (
    <Card>
      <CardHeader
        title="2. Choose a report"
        description={
          availableCount !== null && status === "ready"
            ? `${availableCount} of ${rosters.length} can run with your roster's columns.`
            : "Upload a roster to see which reports your data supports."
        }
      />
      {status === "loading" ? (
        <ul className="divide-y divide-line" aria-busy="true" aria-label="Loading reports">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="space-y-2 px-4 py-3.5 sm:px-5">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-surface-hover" />
            </li>
          ))}
        </ul>
      ) : status === "error" ? (
        <div className="p-4 sm:p-5">
          <Alert
            tone="danger"
            title="Couldn't load roster reports"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RotateCw className="h-3.5 w-3.5" />}
              >
                Try again
              </Button>
            }
          >
            {error}
          </Alert>
        </div>
      ) : rosters.length === 0 ? (
        <EmptyState
          compact
          icon={<ListChecks />}
          title="No reports available"
          description="The server didn't return any roster reports."
        />
      ) : (
        <div role="radiogroup" aria-label="Roster reports" className="divide-y divide-line">
          {rosters.map((r) => {
            const a = availabilityOf(r, upload);
            const selected = r.id === selectedId;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(r.id)}
                className={cn(
                  "relative block w-full px-4 py-3 text-left transition-colors sm:px-5",
                  "focus-visible:outline-offset-[-2px]",
                  selected ? "bg-primary-soft/70" : "hover:bg-surface-hover",
                )}
              >
                {selected ? (
                  <span
                    className="absolute inset-y-0 left-0 w-[3px] bg-primary dark:bg-primary-text"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">{r.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-[1.125rem] text-fg-muted">
                      {r.description}
                    </span>
                  </span>
                  {a.state === "available" ? (
                    <Badge color="green" className="mt-0.5">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Ready
                    </Badge>
                  ) : a.state === "missing" ? (
                    <Badge color="amber" className="mt-0.5">
                      <CircleAlert className="h-3 w-3" aria-hidden="true" />
                      {a.missing.length ? `${a.missing.length} missing` : "Unavailable"}
                    </Badge>
                  ) : null}
                </span>
                {a.state === "missing" && a.missing.length ? (
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {a.missing.map((c) => (
                      <span
                        key={c}
                        className="rounded border border-warning-line bg-warning-soft px-1.5 py-px font-mono text-[10.5px] text-warning"
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
