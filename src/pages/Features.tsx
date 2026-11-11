import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ClipboardCheck,
  FileCheck2,
  Calculator,
  FileText,
  Award,
  BookOpen,
  Layers,
  CheckCircle2,
  Download,
  Crown,
} from "lucide-react";
import type { ReactNode } from "react";

export default function Features() {
  return (
    <div>
      <Hero />
      <FeatureBlocks />
      <PolicyReferences />
      <CtaFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">
            Platform Capabilities
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
          Everything PACE
          <br />
          <span className="text-gold-light">can do for you</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
          A full breakdown of every tool, what it automates, what it checks, and
          what it produces — so you know exactly what to expect before you start.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ---------- Feature block (left-text / right-visual) ---------- */

interface FeatureBlockProps {
  badge: string;
  badgeColor: string;
  icon: ReactNode;
  iconBg: string;
  accentBar: string;
  tag?: string;
  tagColor?: string;
  title: string;
  subtitle: string;
  body: string;
  capabilities: string[];
  outputLabel: string;
  outputItems: string[];
  ctaLabel: string;
  ctaTo: string;
  ctaStyle: string;
  reverse?: boolean;
  visual: ReactNode;
}

function FeatureBlock({
  badge,
  badgeColor,
  icon,
  iconBg,
  accentBar,
  tag,
  tagColor,
  title,
  subtitle,
  body,
  capabilities,
  outputLabel,
  outputItems,
  ctaLabel,
  ctaTo,
  ctaStyle,
  reverse = false,
  visual,
}: FeatureBlockProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
          {tag ? (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}
            >
              {tag}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
          <h2 className="text-3xl font-black text-slate-900">{title}</h2>
        </div>
        <p className="text-slate-500 text-base mb-2 font-medium">{subtitle}</p>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{body}</p>
        <ul className="space-y-2 mb-6">
          {capabilities.map((c) => (
            <li
              key={c}
              className="flex items-start gap-2.5 text-sm text-slate-600"
            >
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {outputLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {outputItems.map((o) => (
              <span
                key={o}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
        <Link
          to={ctaTo}
          className={`inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors ${ctaStyle}`}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className={`relative ${reverse ? "lg:order-1" : ""}`}>
        <div
          className={`absolute left-0 top-6 bottom-6 w-1 rounded-full ${accentBar}`}
        />
        <div className="pl-6">{visual}</div>
      </div>
    </div>
  );
}

function FeatureBlocks() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28">
      <FeatureBlock
        badge="MEL Tools"
        badgeColor="bg-primary/10 text-primary"
        icon={<ClipboardCheck className="w-6 h-6 text-primary" />}
        iconBg="bg-primary/10"
        accentBar="bg-primary/30"
        tag="Most Used"
        tagColor="bg-primary/10 text-primary"
        title="Initial MEL"
        subtitle="Turn a raw roster into a board-ready eligibility packet in one upload."
        body="The Initial Master Eligibility List is the first document produced in every WAPS promotion cycle. It lists all members being considered and their eligibility determination. PACE processes your roster file and runs every policy check automatically — no formulas, no manual lookups."
        capabilities={[
          "Reads standard MPF roster export formats (CSV/Excel)",
          "Checks Time in Grade (TIG) against per-rank DAFI 36-2502 requirements",
          "Checks Time in Service (TIS / TAFMSD) against cycle cutoffs",
          "Applies High Year Tenure (HYT) limits per rank",
          "Flags AFSC eligibility and waiver-required cases",
          "Auto-identifies members requiring manual MPF review",
          "Generates CUI-marked PDF with correct header, footer, and page numbering",
          "Provides per-member reason codes for all ineligible determinations",
        ]}
        outputLabel="Output"
        outputItems={["CUI-marked PDF", "Initial MEL Packet", "Discrepancy Report"]}
        ctaLabel="Open Initial MEL"
        ctaTo="/initial-mel"
        ctaStyle="bg-primary text-white hover:bg-primary-dark"
        visual={<InitialMelVisual />}
      />

      <FeatureBlock
        badge="MEL Tools"
        badgeColor="bg-success/10 text-success"
        icon={<FileCheck2 className="w-6 h-6 text-success" />}
        iconBg="bg-success/10"
        accentBar="bg-success/30"
        title="Final MEL"
        subtitle="Board-submission-ready PDF with senior rater signature block."
        body="After pascode information has been reviewed and confirmed, the Final MEL locks in the eligibility determinations and adds the senior rater signature block required for official board submission. PACE generates this document with the correct formatting, positioning, and CUI markings in one step."
        capabilities={[
          "Accepts PAS code and senior rater information per unit",
          "Generates signature block at correct position per AFI formatting standards",
          "Applies finalized eligibility determinations from session data",
          "Produces submission-ready CUI-marked PDF",
          "Supports multi-unit rosters with per-unit signature blocks",
          "Preserves discrepancy annotations from initial processing",
        ]}
        outputLabel="Output"
        outputItems={["Final MEL PDF", "Signature Block", "CUI Markings"]}
        ctaLabel="Open Final MEL"
        ctaTo="/final-mel"
        ctaStyle="bg-success text-white hover:bg-success-dark"
        reverse
        visual={<FinalMelVisual />}
      />

      <FeatureBlock
        badge="Calculators"
        badgeColor="bg-special/10 text-special"
        icon={<Calculator className="w-6 h-6 text-special" />}
        iconBg="bg-special/10"
        accentBar="bg-special/30"
        title="Promotion Eligibility"
        subtitle="Individual TIG, TIS, and HYT verification for any cycle year."
        body="Check whether a specific member meets promotion eligibility requirements before the board cutoff. Enter their DOR and TAFMSD, select the target cycle year, and get a full breakdown of every requirement with met/unmet status, actual values, and required dates — no spreadsheet required."
        capabilities={[
          "Checks TIG (Time in Grade) against per-rank cutoff dates",
          "Checks TIS (TAFMSD) against cycle-specific TIS requirements",
          "Applies High Year Tenure limits and calculates remaining service",
          "Determines SCOD (Sanctuary/Separation Cutoff Date) automatically",
          "Covers SSG, TSG, MSG, SMS, CMSgt, and CCC cycles",
          "Shows exact required dates and member dates side by side",
          "Lists specific unmet requirement reasons when ineligible",
          "Supports any target year from 2020–2030",
        ]}
        outputLabel="Checks Performed"
        outputItems={["TIG", "TIS / TAFMSD", "HYT", "SCOD", "Cycle Cutoff"]}
        ctaLabel="Check Promotion Eligibility"
        ctaTo="/calculators/promotion"
        ctaStyle="bg-special text-white hover:bg-special-dark"
        visual={<PromotionVisual />}
      />

      <FeatureBlock
        badge="Calculators"
        badgeColor="bg-slate-100 text-slate-600"
        icon={<Crown className="w-6 h-6 text-gold" />}
        iconBg="bg-gold/10"
        accentBar="bg-gold/40"
        tag="A1C → SRA"
        tagColor="bg-gold/10 text-gold"
        title="BTZ Eligibility"
        subtitle="Below-the-Zone board quarter, TIG window, and 36-month TIS exclusion."
        body="Below-the-Zone allows the top 10% of eligible A1Cs to compete for early promotion to Senior Airman. The eligibility window is narrow — 20-month TIG falls in a specific board quarter — and the 36-month TIS exclusion rule disqualifies members with too much service. This calculator handles all of it."
        capabilities={[
          "Calculates the exact board quarter based on A1C DOR (20-month TIG)",
          "Projects the 22-month TIG promotion date",
          "Checks the 36-month TIS exclusion rule against enlistment date",
          "Determines whether the board falls in the specified target year",
          "Shows all three criteria (board window, TIG, TIS) with pass/fail status",
          "Provides specific ineligibility reasons when applicable",
        ]}
        outputLabel="Checks Performed"
        outputItems={["20-Mo TIG Board Window", "22-Mo Promotion Date", "36-Mo TIS Exclusion"]}
        ctaLabel="Check BTZ Eligibility"
        ctaTo="/calculators/btz"
        ctaStyle="bg-slate-800 text-white hover:bg-slate-900"
        reverse
        visual={<BtzVisual />}
      />

      <FeatureBlock
        badge="Document Generation"
        badgeColor="bg-accent/10 text-accent"
        icon={<FileText className="w-6 h-6 text-accent" />}
        iconBg="bg-accent/10"
        accentBar="bg-accent/30"
        tag="New"
        tagColor="bg-accent/10 text-accent"
        title="Memorandum for Record"
        subtitle="AFH 33-337 compliant MFRs with correct header, paragraphs, and signature block."
        body="The Tongue and Quill (AFH 33-337) defines the formatting standard for all official Air Force correspondence. The MFR generator enforces those standards automatically — correct 1-inch margins, 12pt Calibri, Department of War seal, auto-numbered paragraphs, and a right-indented signature block — with no manual formatting required."
        capabilities={[
          "Enforces AFH 33-337 formatting: 12pt Calibri, 1-inch margins, portrait",
          "Inserts Department of War seal at correct position in the header",
          "Auto-numbers paragraphs only when more than one paragraph is present",
          "Right-indents signature block at 4.25 inches per standard",
          "Accepts organization, office symbol, date, FROM, SUBJECT, and body text",
          "Supports multi-paragraph body with add/remove paragraph controls",
          "Generates a downloadable PDF ready for signature or records filing",
          "All inputs are form-driven — nothing is hard-coded",
        ]}
        outputLabel="Output"
        outputItems={["PDF Memorandum", "Dept of War Seal", "Numbered Paragraphs", "Signature Block"]}
        ctaLabel="Open Memorandum Generator"
        ctaTo="/memo-generator"
        ctaStyle="bg-accent text-white hover:bg-accent-dark"
        visual={<MemoVisual />}
      />
    </div>
  );
}

/* ---------- Visuals ---------- */

function InitialMelVisual() {
  const rows = [
    { name: "SMITH, John A.", rank: "SRA", tig: "22 mo", tis: "4.2 yr", status: "ELIGIBLE" },
    { name: "JONES, Maria C.", rank: "SRA", tig: "18 mo", tis: "3.1 yr", status: "NOT ELIGIBLE" },
    { name: "BROWN, Kyle T.", rank: "SRA", tig: "24 mo", tis: "5.0 yr", status: "ELIGIBLE" },
    { name: "DAVIS, Amy L.", rank: "SRA", tig: "20 mo", tis: "3.8 yr", status: "REVIEW" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-primary px-5 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        <span className="ml-2 text-white/80 text-xs font-mono">
          initial-mel.xlsx → processing...
        </span>
      </div>
      <div className="p-5 space-y-3">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between text-sm border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
          >
            <div>
              <p className="font-semibold text-slate-800 text-xs">{r.name}</p>
              <p className="text-slate-400 text-xs">
                {r.rank} · TIG {r.tig} · TIS {r.tis}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                r.status === "ELIGIBLE"
                  ? "bg-success/10 text-success"
                  : r.status === "NOT ELIGIBLE"
                  ? "bg-danger/10 text-danger"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">
            4 members · 2 eligible · 1 flagged
          </span>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </span>
        </div>
      </div>
    </div>
  );
}

function FinalMelVisual() {
  const rows = [
    { label: "Unit", value: "1st Information Systems Sq" },
    { label: "PAS Code", value: "HAAC6L00" },
    { label: "Senior Rater", value: "Maj John A. Smith" },
    { label: "Cycle", value: "SSG · CY2025" },
    { label: "Members", value: "42 eligible of 58 total" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-success px-5 py-3">
        <p className="text-white text-xs font-semibold">
          Final MEL — Signature Block
        </p>
        <p className="text-white/60 text-xs">
          Senior rater information locked
        </p>
      </div>
      <div className="p-5 space-y-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex justify-between items-center text-sm border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
          >
            <span className="text-slate-500 text-xs">{r.label}</span>
            <span className="font-semibold text-slate-800 text-xs">
              {r.value}
            </span>
          </div>
        ))}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center font-mono text-xs text-slate-600 leading-relaxed">
          <p className="font-bold">JOHN A. SMITH, Maj, USAF</p>
          <p>Commander, 1st Information Systems Sq</p>
        </div>
        <div className="flex items-center justify-end gap-1 text-xs text-success font-semibold">
          <FileCheck2 className="w-3.5 h-3.5" /> Generate Final PDF
        </div>
      </div>
    </div>
  );
}

function PromotionVisual() {
  const checks = [
    {
      label: "Time in Grade (TIG)",
      req: "24 months",
      actual: "26 months",
    },
    {
      label: "Time in Service (TIS)",
      req: "3 years",
      actual: "3.8 years",
    },
    {
      label: "High Year Tenure",
      req: "< 20 years",
      actual: "3.8 years",
    },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-special px-5 py-3">
        <p className="text-white text-xs font-semibold">
          Promotion Eligibility Check
        </p>
        <p className="text-white/60 text-xs">SRA → SSG · Cycle 25E5</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-bold text-green-800 text-sm">ELIGIBLE</span>
          </div>
          <span className="text-xs text-green-600">All requirements met</span>
        </div>
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="font-semibold text-slate-700">{c.label}</p>
              <p className="text-slate-400">
                Required: {c.req} · Actual: {c.actual}
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BtzVisual() {
  const checks = [
    { label: "20-Month TIG Window", value: "Apr 2025 (Q2 Board)" },
    { label: "Projected Promotion", value: "Jun 2025 (22-mo TIG)" },
    { label: "36-Month TIS Exclusion", value: "TIS: 2.1 yrs at promo" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-slate-800 px-5 py-3">
        <p className="text-white text-xs font-semibold">BTZ Eligibility Check</p>
        <p className="text-white/60 text-xs">A1C → SRA Below-the-Zone</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            <span className="font-bold text-green-800 text-sm">BTZ ELIGIBLE</span>
          </div>
          <span className="text-xs text-green-600">Q2 CY25 Board</span>
        </div>
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="font-semibold text-slate-700">{c.label}</p>
              <p className="text-slate-400">{c.value}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoVisual() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-accent px-5 py-3">
        <p className="text-white text-xs font-semibold">Memorandum for Record</p>
        <p className="text-white/60 text-xs">AFH 33-337 compliant output</p>
      </div>
      <div className="p-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 leading-relaxed space-y-2">
          <p className="font-bold text-center text-slate-800">
            DEPARTMENT OF THE AIR FORCE
          </p>
          <p className="text-center text-slate-500">
            1st Information Systems Squadron
          </p>
          <p className="text-center text-slate-500">
            Joint Base Langley-Eustis VA
          </p>
          <div className="border-t border-slate-300 my-2" />
          <p className="text-center font-bold tracking-wide">
            MEMORANDUM FOR RECORD
          </p>
          <p>
            <span className="font-bold">FROM:</span> 1 ISS/CC
          </p>
          <p>
            <span className="font-bold">SUBJECT:</span> Promotion Board
            Notification
          </p>
          <div className="my-1" />
          <p>1. This memorandum documents…</p>
          <p>2. POC is the undersigned.</p>
          <div className="my-2" />
          <div className="text-right">
            <p className="font-bold">JOHN A. SMITH, Maj, USAF</p>
            <p>Commander</p>
          </div>
        </div>
      </div>
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
    icon: <Award className="w-5 h-5 text-primary" />,
    pub: "DAFI 36-2502",
    title: "Enlisted Airman Promotion",
    desc: "Governs WAPS promotion eligibility, TIG/TIS requirements, HYT limits, and board procedures.",
  },
  {
    icon: <Layers className="w-5 h-5 text-special" />,
    pub: "AFI 36-2606",
    title: "Reenlistment in the USAF",
    desc: "HYT limits and reenlistment eligibility rules referenced for TIS cap calculations.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-accent" />,
    pub: "AFH 33-337",
    title: "The Tongue and Quill",
    desc: "Official correspondence formatting standard used for MFR layout, margins, fonts, and signature blocks.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-warning" />,
    pub: "DoDM 5200.01",
    title: "CUI Program",
    desc: "Controlled Unclassified Information marking standards applied to all MEL PDF outputs.",
  },
];

function PolicyReferences() {
  return (
    <div className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Policy References
          </h2>
          <p className="text-slate-500 text-sm">
            PACE is built against these Air Force publications
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POLICIES.map((p) => (
            <div
              key={p.pub}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                {p.icon}
                <span className="font-black text-slate-800 text-sm">
                  {p.pub}
                </span>
              </div>
              <p className="font-semibold text-slate-700 text-xs mb-1">
                {p.title}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
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
    <div className="bg-gradient-to-r from-primary-dark to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-3xl font-black text-white mb-3">
          Ready to get started?
        </h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">
          Choose a tool from the dashboard or jump straight into a MEL run.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/how-to"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors"
          >
            Read the How To Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
