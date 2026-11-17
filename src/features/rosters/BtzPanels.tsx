import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDateMil } from "@/lib/utils";
import { SizeTag, formatQuota } from "./cells";
import type { RunResult } from "./types";

/** Shown with every quota: the API gives exact 15% quotas; the MPF sets the whole number. */
const MPF_QUOTA_NOTE = "Quotas are exact (to 2 decimal places). The MPF determines the whole-number quota.";

/** quota_display from the server when present, else the exact quota to 2 places. */
const showQuota = (q: { quota: number | null; quota_display?: string | null }) =>
  (q.quota_display && q.quota_display.trim()) || formatQuota(q.quota);

/** BTZ-only: the board quarter, the per-unit quota table and the Central Base Board box. */
export function BtzPanels({ result }: { result: RunResult }) {
  const q = result.quarter;
  const units = result.units ?? [];
  const cbb = result.cbb;
  return (
    <div className="mt-6 grid gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="grid content-start gap-4">
        {q ? (
          <section className="panel" aria-labelledby="btz-q-h">
            <h3 id="btz-q-h" className="border-b border-line px-5 py-3.5 text-base font-semibold">
              Quarter <span className="code ml-1 font-normal text-ink-2">{q.id}</span>
            </h3>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-5 py-4 text-sm">
              <dt className="text-ink-3">BTZ dates</dt>
              <dd className="num m-0 text-ink">
                {formatDateMil(q.btz_date_start)} to {formatDateMil(q.btz_date_end)}
              </dd>
              <dt className="text-ink-3">Processing</dt>
              <dd className="num m-0 text-ink">{q.processing_months.join(", ")}</dd>
              <dt className="text-ink-3">Board</dt>
              <dd className="num m-0 font-semibold text-ink">{q.board_month}</dd>
            </dl>
          </section>
        ) : null}

        {cbb ? (
          <section className="panel border-l-[3px] border-l-primary" aria-labelledby="btz-cbb-h">
            <h3 id="btz-cbb-h" className="border-b border-line px-5 py-3.5 text-base font-semibold">
              Central Base Board (CBB)
            </h3>
            <div className="grid gap-3 px-5 py-4 text-sm">
              <dl className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <dt className="text-[12px] text-ink-3">Pool total</dt>
                  <dd className="num m-0 text-lg font-semibold text-ink">{cbb.pool_total}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Quota</dt>
                  <dd className="num m-0 text-lg font-semibold text-ink">{showQuota(cbb) ?? "None"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[12px] text-ink-3">Pooled units</dt>
                  <dd className="m-0 font-mono text-[12.5px] text-ink [overflow-wrap:anywhere]">
                    {cbb.pool_units.length ? cbb.pool_units.join(", ") : "None"}
                  </dd>
                </div>
              </dl>
              {cbb.note ? <p className="text-ink-2">{cbb.note}</p> : null}
              {cbb.quota_note ? <p className="text-ink-2">{cbb.quota_note}</p> : null}
              <p className="text-[13px] text-ink-3">{MPF_QUOTA_NOTE}</p>
              {cbb.policy_note ? (
                <p className="border-t border-line pt-3 text-[13px] text-ink-2">{cbb.policy_note}</p>
              ) : null}
              {cbb.requires_base_wide_roster ? (
                <p className="msg msg-warn">
                  <Badge color="amber" className="mr-2">
                    {cbb.label || "requires base-wide roster"}
                  </Badge>
                  This roster covers one unit only, so the CBB pool and quota need the base-wide
                  roster from the MPF.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <section className="min-w-0" aria-labelledby="btz-units-h">
        <h3 id="btz-units-h" className="mb-2 flex items-baseline gap-2.5 text-base font-semibold">
          Units <span className="num text-[13px] font-normal text-ink-3">{units.length}</span>
        </h3>
        {units.length ? (
          <Table label="BTZ eligibles by unit">
            <THead>
              <tr>
                <TH>PASCODE</TH>
                <TH>Unit</TH>
                <TH className="text-right">Eligibles</TH>
                <TH>Size</TH>
                <TH className="text-right">Quota</TH>
                <TH>Note</TH>
              </tr>
            </THead>
            <TBody>
              {units.map((u) => (
                <TR key={u.pascode}>
                  <TD className="code whitespace-nowrap text-ink">{u.pascode}</TD>
                  <TD className="min-w-[10rem]">{u.unit}</TD>
                  <TD className="num text-right">{u.eligible_count}</TD>
                  <TD>
                    <SizeTag value={u.size} />
                  </TD>
                  <TD className="num text-right">
                    {showQuota(u) ?? (
                      <span className="text-ink-3">
                        <span aria-hidden="true">—</span>
                        <span className="vh">none</span>
                      </span>
                    )}
                  </TD>
                  <TD className="min-w-[12rem]">{u.quota_note}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <p className="rounded-2 border border-line bg-surface px-4 py-3 text-sm text-ink-3">
            No eligibles in this quarter.
          </p>
        )}
        <p className="mt-2 text-[13px] text-ink-3">{MPF_QUOTA_NOTE}</p>
      </section>
    </div>
  );
}
