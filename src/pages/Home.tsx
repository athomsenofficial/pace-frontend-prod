import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, BookOpen, Pause, Play } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { TOOL_COUNT, TOOL_GROUPS } from "@/lib/tools";

export default function Home() {
  return (
    <div>
      <Hero />
      <Facts />
      <ToolGrid />
      <Principles />
      <CtaBand />
    </div>
  );
}

/* ---------- Hero with background video ---------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/**
 * Full-width hero. The background is a muted, looping F-22 clip under a flat navy
 * overlay. Media files (not in the repo yet):
 *   public/media/hero-f22.webm, public/media/hero-f22.mp4, public/media/hero-poster.jpg
 * Until they exist the hero falls back to the solid navy container background.
 * Reduced motion: no autoplay. A visible pause / play control is always offered
 * once the clip loads (WCAG 2.2.2).
 */
function Hero() {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // React does not reliably reflect `muted` as an attribute; set the property
    // so browsers allow autoplay.
    v.muted = true;
    if (reduced) {
      v.pause();
      return;
    }
    v.play().catch(() => {
      /* autoplay blocked or no source: the navy ground stays */
    });
  }, [reduced]);

  const browseTools = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("tools-h");
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-navy text-white"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        poster="/media/hero-poster.jpg"
        muted
        loop
        playsInline
        autoPlay={!reduced}
        preload={reduced ? "metadata" : "auto"}
        aria-hidden="true"
        tabIndex={-1}
        onLoadedMetadata={() => setAvailable(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/media/hero-f22.webm" type="video/webm" />
        <source src="/media/hero-f22.mp4" type="video/mp4" />
      </video>
      {/* Flat navy overlay (no gradient): keeps white text >= 7:1 on any frame. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/[0.78]" />

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <span className="eyebrow eyebrow-on-navy">Department of the Air Force</span>
          <h1
            id="hero-title"
            className="mt-5 font-display font-normal leading-[1.02] text-white"
          >
            <span className="block text-[56px] font-semibold tracking-[0.06em] sm:text-[80px]">
              PACE
            </span>
            <span className="mt-2 block text-[24px] leading-tight text-navy-on-2 sm:text-[30px]">
              Personnel &amp; Administrative Collaboration Engine
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white">
            A suite of personnel tools for Commander Support Staff and unit admin: promotion
            listings, retention and BTZ rosters, eligibility calculators and memoranda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#tools" onClick={browseTools} className={buttonClasses("white", "lg")}>
              Browse tools
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link to="/rosters" className={buttonClasses("on-navy", "lg")}>
              Roster tools
            </Link>
          </div>
        </div>
      </div>

      {available ? (
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-2 px-4 pb-3 sm:px-6">
            <p className="text-[11px] text-navy-on-2">
              F-22 Demo Team, Seoul ADEX 23 &middot; U.S. Army video by Sgt Elijah Florence (public domain)
            </p>
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-8 items-center gap-1.5 rounded-1 border border-white/50 px-2.5 text-[13px] text-white hover:border-white"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {playing ? "Pause video" : "Play video"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ---------- Suite facts (no metrics, just what is true of every tool) ---------- */

const FACTS = [
  { value: `${TOOL_COUNT} tools`, label: "Promotions, retention, calculators, correspondence" },
  { value: "Nothing stored", label: "Roster files are processed in memory, not kept" },
  { value: "CUI-marked", label: "PDF and Excel output, marked for handling" },
];

function Facts() {
  return (
    <div className="border-b border-line bg-surface">
      <dl className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-line px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        {FACTS.map((f) => (
          <div key={f.value} className="flex items-baseline gap-3 py-4 sm:px-6 sm:first:pl-0">
            <dt className="num shrink-0 text-lg font-semibold text-ink">{f.value}</dt>
            <dd className="m-0 text-sm text-ink-3">{f.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- Tool grid, grouped by job ---------- */

function ToolGrid() {
  return (
    <section aria-labelledby="tools-h" id="tools" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6">
      <div className="mb-8 border-b border-line pb-4">
        <span className="eyebrow">The suite</span>
        <h2 id="tools-h" tabIndex={-1} className="section-title mt-3 scroll-mt-4 focus:outline-none">
          Tools by job
        </h2>
        <p className="mt-1.5 max-w-[64ch] text-sm text-ink-3">
          The{" "}
          <Link to="/rosters" className="text-primary underline">
            roster tools
          </Link>{" "}
          take the alpha roster export when you run them. Each file is processed in memory for that
          run and is not kept.
        </p>
      </div>
      <div className="grid gap-12">
        {TOOL_GROUPS.map((g, gi) => (
          <section key={g.id} aria-labelledby={`grp-${g.id}`}>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 id={`grp-${g.id}`} className="text-lg font-semibold text-ink">
                <span className="num mr-2 text-ink-3">{String(gi + 1).padStart(2, "0")}</span>
                {g.label}
              </h3>
              <p className="text-sm text-ink-3">{g.intro}</p>
            </div>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {g.tools.map((t) => (
                <li key={t.to} className="panel flex min-w-0 flex-col p-5">
                  <h4 className="text-base font-semibold text-ink">{t.name}</h4>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{t.description}</p>
                  {t.duty ? (
                    <p className="mt-3 text-[13px] text-ink-3">
                      <span className="font-semibold uppercase tracking-[0.08em] text-[11px]">
                        Supports
                      </span>{" "}
                      {t.duty}
                    </p>
                  ) : null}
                  <Link
                    to={t.to}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                  >
                    Open {t.name}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

/* ---------- How the suite works (navy) ---------- */

const PRINCIPLES = [
  {
    title: "Rules with citations",
    desc: "Each roster run lists the DAFI paragraph or local setting behind its rules, and marks values to verify against the current publication.",
  },
  {
    title: "Nothing stored",
    desc: "Roster tools process your file in memory for each run and don't keep it. The MEL tools hold a roster only while you edit it.",
  },
  {
    title: "CUI-marked output",
    desc: "PDF and Excel exports carry CUI markings. Store and send them the way your unit handles CUI.",
  },
  {
    title: "Screening aid",
    desc: "PACE does the sorting and date math. The MPF and the commander make the final determination.",
  },
];

function Principles() {
  return (
    <section aria-labelledby="how-h" className="bg-navy text-navy-on-2">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="eyebrow eyebrow-on-navy">How it works</span>
          <h2 id="how-h" className="section-title mt-3 !text-white">
            Built for the CSS workload
          </h2>
          <p className="mt-5 leading-relaxed">
            Most CSS rosters start from the same alpha roster export. PACE reads it, applies the
            published rules and hands back a list you can act on, with the reason for every
            call.
          </p>
          <Link to="/how-to" className={buttonClasses("on-navy", "md", "mt-6")}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Read the how-to guide
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="border-t border-white/15 py-5">
              <h3 className="text-[15px] font-semibold text-white">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed">{p.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Final call to action ---------- */

function CtaBand() {
  return (
    <section aria-labelledby="cta-h" className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 id="cta-h" className="section-title">
            Run a roster from your alpha roster
          </h2>
          <p className="mt-1.5 text-ink-3">
            DOS / Reenlistment, DEROS Option, RE code, CJR window and BTZ rosters, one file per run.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/features" className={buttonClasses("tertiary", "md")}>
            See every tool
          </Link>
          <Link to="/rosters" className={buttonClasses("primary", "md")}>
            Roster tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
