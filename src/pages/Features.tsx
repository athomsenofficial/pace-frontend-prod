import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  FileCheck2,
  FileText,
  Info,
  Layers,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Page } from "@/components/Page";

interface Feature {
  group: string;
  icon: LucideIcon;
  tag?: string;
  title: string;
  subtitle: string;
  body: string;
  capabilities: string[];
  outputLabel: string;
  outputItems: string[];
  ctaLabel: string;
  ctaTo: string;
}

const FEATURES: Feature[] = [
  {
    group: "Promotions",
    icon: ClipboardCheck,
    tag: "Most used",
    title: "Initial MEL",
    subtitle: "Turn a raw roster into a board-ready eligibility packet in one upload.",
    body: "The Initial Master Eligibility List is the first document produced in every WAPS promotion cycle. It lists all members being considered and their eligibility determination. PACE processes your roster file and runs every policy check automatically — no formulas, no manual lookups.",
    capabilities: [
      "Reads standard MPF roster export formats (CSV/Excel)",
      "Checks Time in Grade (TIG) against per-rank DAFI 36-2502 requirements",
      "Checks Time in Service (TIS / TAFMSD) against cycle cutoffs",
      "Applies High Year Tenure (HYT) limits per rank",
      "Flags AFSC eligibility and waiver-required cases",
      "Auto-identifies members requiring manual MPF review",
      "Generates CUI-marked PDF with correct header, footer, and page numbering",
      "Provides per-member reason codes for all ineligible determinations",
    ],
    outputLabel: "Output",
    outputItems: ["CUI-marked PDF", "Initial MEL Packet", "Discrepancy Report"],
    ctaLabel: "Open Initial MEL",
    ctaTo: "/initial-mel",
  },
  {
    group: "Promotions",
    icon: FileCheck2,
    title: "Final MEL",
    subtitle: "Board-submission-ready PDF with senior rater signature block.",
    body: "After pascode information has been reviewed and confirmed, the Final MEL locks in the eligibility determinations and adds the senior rater signature block required for official board submission. PACE generates this document with the correct formatting, positioning, and CUI markings in one step.",
    capabilities: [
      "Accepts PAS code and senior rater information per unit",
      "Generates signature block at correct position per AFI formatting standards",
      "Applies finalized eligibility determinations from session data",
      "Produces submission-ready CUI-marked PDF",
      "Supports multi-unit rosters with per-unit signature blocks",
      "Preserves discrepancy annotations from initial processing",
    ],
    outputLabel: "Output",
    outputItems: ["Final MEL PDF", "Signature Block", "CUI Markings"],
    ctaLabel: "Open Final MEL",
    ctaTo: "/final-mel",
  },
  {
    group: "Promotions",
    icon: Layers,
    title: "MPF Roster",
    subtitle: "Distribution lists for the Military Personnel Flight.",
    body: "Upload a roster to generate an MPF list, MEL format, or both as a merged PDF.",
    capabilities: [
      "Simple roster listing: Name, Grade, Unit, DAFSC, DOR, TAFMSD",
      "Master Eligibility List format with full eligibility determinations",
      "MPF List and MEL merged into a single PDF document",
    ],
    outputLabel: "Output",
    outputItems: ["MPF List PDF", "MEL PDF", "Merged PDF"],
    ctaLabel: "Open MPF Roster",
    ctaTo: "/mpf-roster",
  },
  {
    group: "Calculators",
    icon: Calculator,
    title: "Promotion Eligibility",
    subtitle: "Individual TIG, TIS, and HYT verification for any cycle year.",
    body: "Check whether a specific member meets promotion eligibility requirements before the board cutoff. Enter their DOR and TAFMSD, select the target cycle year, and get a full breakdown of every requirement with met/unmet status, actual values, and required dates — no spreadsheet required.",
    capabilities: [
      "Checks TIG (Time in Grade) against per-rank cutoff dates",
      "Checks TIS (TAFMSD) against cycle-specific TIS requirements",
      "Applies High Year Tenure limits and calculates remaining service",
      "Determines SCOD (Sanctuary/Separation Cutoff Date) automatically",
      "Covers SSG, TSG, MSG, SMS, CMSgt, and CCC cycles",
      "Shows exact required dates and member dates side by side",
      "Lists specific unmet requirement reasons when ineligible",
      "Supports any target year from 2020–2030",
    ],
    outputLabel: "Checks performed",
    outputItems: ["TIG", "TIS / TAFMSD", "HYT", "SCOD", "Cycle Cutoff"],
    ctaLabel: "Check promotion eligibility",
    ctaTo: "/calculators/promotion",
  },
  {
    group: "Calculators",
    icon: Crown,
    tag: "A1C → SrA",
    title: "BTZ Eligibility",
    subtitle: "Below-the-Zone board quarter, TIG window, and 36-month TIS exclusion.",
    body: "Below-the-Zone allows the top 10% of eligible A1Cs to compete for early promotion to Senior Airman. The eligibility window is narrow — 20-month TIG falls in a specific board quarter — and the 36-month TIS exclusion rule disqualifies members with too much service. This calculator handles all of it.",
    capabilities: [
      "Calculates the exact board quarter based on A1C DOR (20-month TIG)",
      "Projects the 22-month TIG promotion date",
      "Checks the 36-month TIS exclusion rule against enlistment date",
      "Determines whether the board falls in the specified target year",
      "Shows all three criteria (board window, TIG, TIS) with pass/fail status",
      "Provides specific ineligibility reasons when applicable",
    ],
    outputLabel: "Checks performed",
    outputItems: ["20-Mo TIG Board Window", "22-Mo Promotion Date", "36-Mo TIS Exclusion"],
    ctaLabel: "Check BTZ eligibility",
    ctaTo: "/calculators/btz",
  },
  {
    group: "Documents",
    icon: FileText,
    title: "Memorandum for Record",
    subtitle: "AFH 33-337 compliant MFRs with correct header, paragraphs, and signature block.",
    body: "The Tongue and Quill (AFH 33-337) defines the formatting standard for all official Air Force correspondence. The MFR generator enforces those standards automatically — correct 1-inch margins, 12pt Calibri, Department of War seal, auto-numbered paragraphs, and a right-indented signature block — with no manual formatting required.",
    capabilities: [
      "Enforces AFH 33-337 formatting: 12pt Calibri, 1-inch margins, portrait",
      "Inserts Department of War seal at correct position in the header",
      "Auto-numbers paragraphs only when more than one paragraph is present",
      "Right-indents signature block at 4.25 inches per standard",
      "Accepts organization, office symbol, date, FROM, SUBJECT, and body text",
      "Supports multi-paragraph body with add/remove paragraph controls",
      "Generates a downloadable document ready for signature or records filing",
      "All inputs are form-driven — nothing is hard-coded",
    ],
    outputLabel: "Output",
    outputItems: ["Memorandum", "Dept of War Seal", "Numbered Paragraphs", "Signature Block"],
    ctaLabel: "Open memorandum generator",
    ctaTo: "/memo-generator",
  },
];

const POLICIES = [
  {
    icon: Award,
    pub: "DAFI 36-2502",
    title: "Enlisted Airman Promotion",
    desc: "Governs WAPS promotion eligibility, TIG/TIS requirements, HYT limits, and board procedures.",
  },
  {
    icon: Layers,
    pub: "AFI 36-2606",
    title: "Reenlistment in the USAF",
    desc: "HYT limits and reenlistment eligibility rules referenced for TIS cap calculations.",
  },
  {
    icon: BookOpen,
    pub: "AFH 33-337",
    title: "The Tongue and Quill",
    desc: "Official correspondence formatting standard used for MFR layout, margins, fonts, and signature blocks.",
  },
  {
    icon: ShieldCheck,
    pub: "DoDM 5200.01",
    title: "CUI Program",
    desc: "Controlled Unclassified Information marking standards applied to all MEL PDF outputs.",
  },
];

export default function Features() {
  return (
    <Page>
      <PageHeader
        eyebrow="Help"
        icon={<Info />}
        title="About PACE"
        description="What each tool automates, what it checks, and what it produces — so you know exactly what to expect before you start."
      />

      <div className="space-y-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>

      <section aria-labelledby="policy-heading">
        <h2 id="policy-heading" className="eyebrow mb-2.5">
          Policy references
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLICIES.map((p) => (
            <Card key={p.pub}>
              <CardBody>
                <div className="flex items-center gap-2">
                  <p.icon className="h-4 w-4 text-primary-text" aria-hidden="true" />
                  <span className="text-sm font-semibold text-fg">{p.pub}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-fg">{p.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-fg-muted">{p.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </Page>
  );
}

function FeatureCard({ feature: f }: { feature: Feature }) {
  const Icon = f.icon;
  return (
    <Card>
      <CardBody className="grid grid-cols-1 gap-5 py-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary-text">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="eyebrow">{f.group}</span>
            {f.tag ? <Badge color="navy">{f.tag}</Badge> : null}
          </div>
          <h2 className="mt-3 text-base font-semibold text-fg">{f.title}</h2>
          <p className="mt-0.5 text-[13px] font-medium text-fg-muted">{f.subtitle}</p>
          <p className="mt-2 text-[13px] leading-5 text-fg-muted">{f.body}</p>
        </div>
        <div className="lg:col-span-3">
          <ul className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {f.capabilities.map((c) => (
              <li key={c} className="flex gap-2 text-[13px] leading-5 text-fg">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col gap-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-fg-subtle">{f.outputLabel}:</span>
          {f.outputItems.map((o) => (
            <span
              key={o}
              className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-fg-muted"
            >
              {o}
            </span>
          ))}
        </div>
        <Link to={f.ctaTo} className="link inline-flex shrink-0 items-center gap-1 text-[13px]">
          {f.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
