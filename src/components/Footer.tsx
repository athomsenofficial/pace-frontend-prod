import { Link } from "react-router-dom";
import { TOOL_GROUPS } from "@/lib/tools";

const COLS = [
  ...TOOL_GROUPS.map((g) => ({
    title: g.navLabel,
    links: g.tools.map((t) => ({ to: t.to, label: t.name })),
  })),
  {
    title: "Help",
    links: [
      { to: "/rosters", label: "Roster tools" },
      { to: "/how-to", label: "How-to guide" },
      { to: "/features", label: "Features" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-navy-on-2">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/air_force_no_bg_navy.png"
                alt=""
                className="h-6 w-auto brightness-0 invert"
              />
              <span className="font-display text-2xl font-semibold tracking-[0.06em] text-white">
                PACE
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              Personnel &amp; Administrative Collaboration Engine. A suite of personnel
              tools for Commander Support Staff and unit admin.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                {c.title}
              </h2>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-navy-on-2 underline decoration-white/25 hover:text-white hover:decoration-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/15 pt-6 text-xs md:flex-row">
          <p>&copy; {new Date().getFullYear()} PACE System. Built for Commander Support Staff and unit admin.</p>
          <p>Controlled Unclassified Information when populated &mdash; handle in accordance with DoDI 5200.48.</p>
        </div>
      </div>
    </footer>
  );
}
