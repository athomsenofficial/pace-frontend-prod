import { BookMarked, Play, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import { cn } from "@/lib/utils";
import type { RosterDefinition, RosterParam } from "@/types";
import { isRequired, type Availability, type FormValues } from "./logic";

interface ParamsFormProps {
  roster: RosterDefinition;
  availability: Availability;
  hasSession: boolean;
  values: FormValues;
  errors: Record<string, string>;
  asOf: string;
  running: boolean;
  runError: string | null;
  onChange: (name: string, value: string) => void;
  onAsOfChange: (value: string) => void;
  onRun: () => void;
  onResetDefaults: () => void;
  onDismissError: () => void;
}

export function ParamsForm({
  roster,
  availability,
  hasSession,
  values,
  errors,
  asOf,
  running,
  runError,
  onChange,
  onAsOfChange,
  onRun,
  onResetDefaults,
  onDismissError,
}: ParamsFormProps) {
  const requiredCount = roster.params.filter(isRequired).length;
  const canRun = hasSession && availability.state !== "missing" && !running;

  return (
    <Card>
      <CardHeader
        title={roster.title}
        description={roster.description}
        actions={
          availability.state === "available" ? (
            <Badge color="green" dot>
              Ready to run
            </Badge>
          ) : availability.state === "missing" ? (
            <Badge color="amber" dot>
              Missing columns
            </Badge>
          ) : (
            <Badge color="neutral" dot>
              Needs a roster
            </Badge>
          )
        }
      />
      <CardBody className="space-y-5">
        {!hasSession ? (
          <Alert tone="info">Upload a roster first — then you can run this report.</Alert>
        ) : availability.state === "missing" ? (
          <Alert tone="warning" title="Your roster is missing columns this report needs">
            Add{" "}
            {availability.missing.length ? (
              <span className="font-mono text-xs text-fg">{availability.missing.join(", ")}</span>
            ) : (
              "the required columns"
            )}{" "}
            to the roster and upload it again.
          </Alert>
        ) : null}

        <ColumnsLine label="Uses columns" columns={roster.required_columns} />
        {roster.optional_columns.length ? (
          <ColumnsLine label="Optional" columns={roster.optional_columns} muted />
        ) : null}

        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
            <h3 className="text-sm font-semibold text-fg">Parameters</h3>
            <span className="text-xs text-fg-subtle">
              {requiredCount > 0
                ? `${requiredCount} required field${requiredCount === 1 ? "" : "s"} marked *`
                : "Defaults shown — adjust if needed"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {roster.params.map((p) => (
              <ParamField
                key={p.name}
                param={p}
                value={values[p.name] ?? ""}
                error={errors[p.name]}
                disabled={running}
                onChange={(v) => onChange(p.name, v)}
              />
            ))}
            <SmartDateInput
              label="As-of date"
              value={asOf}
              onChange={onAsOfChange}
              hint="Leave blank to calculate as of today."
              disabled={running}
            />
          </div>
        </div>

        {runError ? (
          <Alert tone="danger" title="Couldn't run this roster" onDismiss={onDismissError}>
            {runError}
          </Alert>
        ) : null}
      </CardBody>
      <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetDefaults}
          disabled={running}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Reset to defaults
        </Button>
        <Button
          onClick={onRun}
          disabled={!canRun}
          loading={running}
          leftIcon={<Play className="h-4 w-4" />}
        >
          {running ? "Running…" : "Run report"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ColumnsLine({
  label,
  columns,
  muted,
}: {
  label: string;
  columns: string[];
  muted?: boolean;
}) {
  if (!columns.length) return null;
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="w-24 shrink-0 text-xs text-fg-subtle">{label}</span>
      <ul className="flex flex-wrap gap-1">
        {columns.map((c) => (
          <li
            key={c}
            className={cn(
              "rounded border px-1.5 py-px font-mono text-[11px]",
              muted
                ? "border-line text-fg-subtle"
                : "border-line bg-surface-muted text-fg-muted",
            )}
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParamField({
  param: p,
  value,
  error,
  disabled,
  onChange,
}: {
  param: RosterParam;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const required = isRequired(p);
  const label = `${p.label}${required ? " *" : ""}`;
  const defaultHint =
    !required && p.default !== null && p.default !== undefined
      ? `Default: ${p.default}${p.unit ? ` ${p.unit}` : ""}`
      : undefined;
  const hint = [p.help, defaultHint].filter(Boolean).join(" · ") || undefined;

  let field;
  if (p.type === "date") {
    field = (
      <SmartDateInput
        label={label}
        value={value}
        onChange={onChange}
        hint={hint}
        error={error}
        disabled={disabled}
      />
    );
  } else if (p.type === "enum") {
    field = (
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hint={hint}
        error={error}
        disabled={disabled}
      >
        <option value="">{required ? "Select…" : "Use default"}</option>
        {(p.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    );
  } else {
    field = (
      <Input
        label={label}
        type="number"
        inputMode="numeric"
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hint={hint}
        error={error}
        suffix={p.unit}
        disabled={disabled}
        className="tabular-nums"
      />
    );
  }

  const pending = p.citation ? /pending|tbd|unconfirmed/i.test(p.citation) : false;

  return (
    <div>
      {field}
      {p.citation ? (
        <p
          className={cn(
            "mt-1.5 flex items-start gap-1.5 text-xs leading-4",
            pending ? "text-warning" : "text-fg-subtle",
          )}
        >
          <BookMarked className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="sr-only">Source: </span>
            {p.citation}
          </span>
        </p>
      ) : null}
    </div>
  );
}
