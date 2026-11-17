import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRosterStore } from "./store";
import { RUN_IDS, runShort } from "./types";

/**
 * Rosters area shell: the same rail + content grid as the MEL wizard. The
 * rail is plain navigation (the index and each roster tool). Below lg it
 * becomes a strip that scrolls sideways inside itself.
 */
export function RostersShell({ children }: { children: ReactNode }) {
  const meta = useRosterStore((s) => s.meta);
  const runList: Array<{ id: string; label?: string }> = meta?.length
    ? meta.map((m) => ({ id: m.id, label: m.label }))
    : RUN_IDS.map((id) => ({ id }));

  const items = [
    { to: "/rosters", label: "All roster tools", end: true },
    ...runList.map((r) => ({ to: `/rosters/${r.id}`, label: runShort(r.id, r.label), end: true })),
  ];

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside
        aria-label="Roster tools"
        className="min-w-0 border-b border-line bg-surface px-3 py-2.5 lg:flex lg:flex-col lg:gap-5 lg:border-b-0 lg:border-r lg:px-3.5 lg:pb-6 lg:pt-5"
      >
        <div className="hidden px-2 lg:block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Rosters
          </div>
          <div className="mt-1 text-[15px] font-semibold leading-snug text-ink">Roster tools</div>
        </div>
        <nav aria-label="Roster tools" className="-mx-1 overflow-x-auto px-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-1 lg:grid lg:gap-0.5">
            {items.map((it) => (
              <li key={it.to} className="shrink-0 lg:shrink">
                <NavLink
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    cn(
                      "relative block rounded-1 px-2.5 py-1.5 no-underline lg:px-2 lg:py-[9px]",
                      isActive
                        ? "bg-ground font-medium text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-gold lg:after:inset-x-auto lg:after:-left-3.5 lg:after:bottom-2 lg:after:top-2 lg:after:h-auto lg:after:w-[3px]"
                        : "text-ink-2 hover:bg-ground hover:text-ink",
                    )
                  }
                >
                  <span className="block whitespace-nowrap text-[13px] leading-tight lg:whitespace-normal lg:text-sm">
                    {it.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="hidden px-2 text-[12.5px] leading-snug text-ink-3 lg:block">
          Each tool takes the alpha roster when you run it. Files are processed in memory and not
          kept.
        </p>
      </aside>
      <div className="flex min-w-0 flex-col px-4 pt-5 sm:px-6 sm:pt-6">{children}</div>
    </div>
  );
}
