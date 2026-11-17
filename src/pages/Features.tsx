import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, Layers, Plane, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { TOOL_COUNT, TOOL_GROUPS } from "@/lib/tools";

export default function Features() {
  return (
    <div>
      <Hero />
      <Groups />
      <PolicyReferences />
      <CtaFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        <span className="eyebrow">The suite</span>
        <h1 className="page-title mt-3">What each PACE tool does</h1>
        <p className="mt-2 max-w-[64ch] text-ink-3">
          {TOOL_COUNT} tools for Commander Support Staff and unit admin, grouped by job. Each entry
          says what the tool checks and what it hands back.
        </p>
        <nav aria-label="Tool groups" className="mt-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {TOOL_GROUPS.map((g) => (
              <li key={g.id}>
                <a href={`#feat-${g.id}`} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/* ---------- One section per group, one row per tool ---------- */

function Groups() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-12 sm:px-6">
      {TOOL_GROUPS.map((g) => (
        <section key={g.id} id={`feat-${g.id}`} aria-labelledby={`feat-${g.id}-h`} className="scroll-mt-4">
          <div className="mb-5 border-b border-line pb-3">
            <h2 id={`feat-${g.id}-h`} className="section-title">
              {g.label}
            </h2>
            <p className="mt-1 text-sm text-ink-3">{g.intro}</p>
          </div>
          <ul className="grid gap-4">
            {g.tools.map((t) => (
              <li
                key={t.to}
                className="panel grid min-w-0 gap-4 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-start"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">{t.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t.description}</p>
                  {t.duty ? (
                    <p className="mt-2 text-[13px] text-ink-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Supports</span>{" "}
                      {t.duty}
                    </p>
                  ) : null}
                </div>
                <div className="min-w-0 text-sm">
                  <ul className="grid list-disc gap-1 pl-5 text-ink-2 marker:text-ink-3">
                    {t.does.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[13px] text-ink-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Output</span>{" "}
                    {t.produces.join(" · ")}
                  </p>
                </div>
                <Link to={t.to} className={buttonClasses("secondary", "sm", "justify-self-start")}>
                  Open
                  <span className="vh"> {t.name}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ---------- Policy References ---------- */

interface Policy {
  icon: ReactNode;
  pub: string;
  title: string;
  desc: string;
}

const POLICIES: Policy[] = [
  {
    icon: <Award className="h-5 w-5" aria-hidden="true" />,
    pub: "DAFI 36-2502",
    title: "Enlisted Airman Promotion",
    desc: "Governs WAPS promotion eligibility, TIG/TIS requirements, HYT limits, and board procedures.",
  },
  {
    icon: <Layers className="h-5 w-5" aria-hidden="true" />,
    pub: "DAFI 36-2606",
    title: "Reenlistment and extension",
    desc: "RE codes, waiver authority, CJR, extensions and HYT used by the DOS / Reenlistment and RE Code rosters.",
  },
  {
    icon: <Plane className="h-5 w-5" aria-hidden="true" />,
    pub: "DAFI 36-2110",
    title: "Assignments",
    desc: "DEROS Option retainability and the OS-to-CONUS requirement used by the DEROS Option roster.",
  },
  {
    icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
    pub: "AFH 33-337",
    title: "The Tongue and Quill",
    desc: "Official correspondence formatting standard used for MFR layout, margins, fonts, and signature blocks.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
    pub: "DoDM 5200.01",
    title: "CUI Program",
    desc: "Controlled Unclassified Information marking standards applied to PDF and Excel outputs.",
  },
];

function PolicyReferences() {
  return (
    <div className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <span className="eyebrow">Sources</span>
        <h2 className="section-title mt-2">Policy references</h2>
        <p className="mt-2 mb-6 text-sm text-ink-3">
          PACE is built against these publications. Verify cited values against the current versions.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {POLICIES.map((p) => (
            <div key={p.pub} className="panel min-w-0 p-5">
              <div className="mb-3 flex items-center gap-2 text-ink-3">
                {p.icon}
                <h3 className="code text-sm font-semibold text-ink">{p.pub}</h3>
              </div>
              <p className="mb-1 text-[13px] font-semibold text-ink">{p.title}</p>
              <p className="text-[13px] leading-relaxed text-ink-3">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Final CTA ---------- */

function CtaFooter() {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="section-title !text-white">Ready to start?</h2>
        <p className="mb-6 mt-2 max-w-[64ch] text-navy-on-2">
          Open the roster tools for the retention and BTZ rosters, or pick any tool from the home
          page.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/rosters" className={buttonClasses("white", "lg")}>
            Roster tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/how-to" className={buttonClasses("on-navy", "lg")}>
            Read the how-to guide
          </Link>
        </div>
      </div>
    </div>
  );
}
