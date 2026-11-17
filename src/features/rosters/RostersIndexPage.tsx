import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { MetaLine, PageHeader } from "@/features/mel/WizardShell";
import { RostersShell } from "./RostersShell";
import { useRunsMeta } from "./useRunsMeta";
import { runShort } from "./types";

/** /rosters: an index of the roster tools. No upload here: each tool takes its own file. */
export function RostersIndexPage() {
  const { meta, loading, error } = useRunsMeta();
  const runs = meta ?? [];

  return (
    <RostersShell>
      <PageHeader
        meta={<MetaLine parts={["Rosters"]} />}
        title="Roster tools"
        description="Retention and BTZ rosters built from the alpha roster export. Open a tool, choose the file, and run it. Each file is processed in memory for that run and is not kept."
      />

      {error && !runs.length ? (
        <div role="alert" className="msg msg-error mt-6">
          {error}
        </div>
      ) : null}
      {loading && !runs.length ? <p className="mt-6 text-sm text-ink-3">Loading roster tools…</p> : null}

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {runs.map((r) => (
          <li key={r.id} className="panel flex min-w-0 flex-col">
            <h2 className="border-b border-line px-5 py-4 text-base font-semibold">{r.label}</h2>
            <div className="grid flex-1 content-start gap-3 px-5 py-4 text-sm">
              <p className="text-ink-2">{r.description}</p>
              {r.duty.length ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    Supports CSS duty
                  </p>
                  <ul className="mt-1 grid gap-1 text-[13px] text-ink-3">
                    {r.duty.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="border-t border-line px-5 py-3">
              <Link
                to={`/rosters/${r.id}`}
                className={buttonClasses("secondary", "sm")}
                aria-label={`Open ${r.label}`}
              >
                Open {runShort(r.id, r.label)}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[64ch] pb-8 text-[13px] text-ink-3">
        Each roster is a screening aid. The MPF and the commander make the final determination.
      </p>
    </RostersShell>
  );
}
