import { AlertTriangle } from "lucide-react";
import { HIGH_IMPACT_PII } from "./pii";

/**
 * "Before you upload: delete these columns". Always visible (never folded) on
 * every upload screen. Informational: PACE never blocks an upload on it.
 */
export function RemovePiiPanel({ headingId = "pii-remove-h" }: { headingId?: string }) {
  return (
    <section className="panel border-l-[3px] border-l-inel" aria-labelledby={headingId}>
      <div className="border-b border-line px-5 py-4">
        <h2 id={headingId} className="text-base font-semibold">
          Before you upload: delete these columns
        </h2>
        <p className="mt-1 text-[13px] text-ink-2">
          PACE only uses the columns listed under Required/Used. Removing everything else is the
          safest option. Check with your unit Privacy Act monitor if unsure.
        </p>
      </div>
      <dl className="grid gap-3.5 px-5 py-4">
        {HIGH_IMPACT_PII.map((g) => (
          <div key={g.label} className="grid gap-1.5">
            <dt className="text-[13px] font-semibold text-ink">{g.label}</dt>
            <dd className="m-0">
              <ul className="flex flex-wrap gap-1.5">
                {g.columns.map((c) => (
                  <li
                    key={c}
                    className="rounded-[3px] border border-inel/30 bg-inel-tint px-[7px] py-[3px] font-mono text-xs text-ink-2"
                  >
                    {c}
                    {c === "SSAN" ? (
                      <span className="font-sans text-[11.5px] text-ink-3"> (or any SSN column)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Warning line for listed columns found in the chosen file. Header names only. */
export function PiiFoundWarning({ found }: { found: string[] }) {
  if (!found.length) return null;
  return (
    <div role="status" className="msg msg-warn flex items-start gap-2">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-disc-ink" aria-hidden="true" />
      <span className="min-w-0">
        <b>Remove these before uploading:</b>{" "}
        <span className="font-mono text-[12.5px] [overflow-wrap:anywhere]">{found.join(", ")}</span>
        <span className="mt-1 block text-[13px] text-ink-3">
          This check runs in your browser and doesn&apos;t stop the upload.
        </span>
      </span>
    </div>
  );
}
