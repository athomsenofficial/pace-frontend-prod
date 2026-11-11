import { Link } from "react-router-dom";
import { AlertTriangle, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Guide {
  to: string;
  title: string;
  badge?: string;
  intro: string;
  steps: string[];
}

const GUIDES: Guide[] = [
  {
    to: "/initial-mel",
    title: "Generate the Initial MEL",
    badge: "Most common",
    intro:
      "The Initial Master Eligibility List is the first document produced in every WAPS promotion cycle. PACE runs every policy check automatically.",
    steps: [
      "Open Initial MEL from the top menu.",
      "Select cycle, year, and upload your roster file.",
      "Review the roster table showing all uploaded members.",
      "Review members with flags or eligibility issues.",
      "Click any row to modify member information if you need to add additional ones.",
      "Continue to Force Distributor — the system will show PASCODEs detected from your roster.",
      "Provide Senior Rater and Commander information for each PASCODE.",
      "Click Generate PDF to create the Initial MEL document.",
      "Use the download button if you need to download again.",
    ],
  },
  {
    to: "/final-mel",
    title: "Generate the Final MEL",
    badge: "After board",
    intro:
      "After pascode information has been reviewed and confirmed, the Final MEL locks in eligibility determinations and adds the senior rater signature block required for official board submission.",
    steps: [
      "Open Final MEL from the top menu.",
      "Select cycle, year, and upload your final roster file.",
      "Review the roster table showing all uploaded members.",
      "Review members with flags or eligibility issues.",
      "Continue to Force Distributor — confirm Senior Rater and Commander info.",
      "Click Generate PDF to create the Final MEL document.",
      "The PDF includes senior rater signature block and is CUI-compliant.",
    ],
  },
  {
    to: "/mpf-roster",
    title: "Build an MPF Distribution List",
    intro:
      "MPF Roster generates the distribution PDF for the Military Personnel Flight. Pick MPF list, MEL format, or both as a merged PDF.",
    steps: [
      "Open MPF Roster from the MEL Tools menu.",
      "Select cycle, year, and upload your roster file.",
      "Review the roster table.",
      "Select an output format — MPF List, MEL Format, or Both.",
      "Click Generate PDF — the file will download automatically.",
    ],
  },
  {
    to: "/calculators/promotion",
    title: "Check a single member's promotion eligibility",
    intro:
      "Enter the member's dates and current rank to check promotion eligibility against TIG, TIS, and HYT requirements for a promotion cycle.",
    steps: [
      "Open Promotion Eligibility from the Calculators menu.",
      "Enter the member's full name, current rank, DOR, and TAFMSD.",
      "Select the target cycle and year.",
      "Click Check Eligibility — the response itemizes every rule's pass/fail status.",
    ],
  },
  {
    to: "/calculators/btz",
    title: "Check BTZ eligibility (A1C → SRA)",
    intro:
      "Enter the member's enlistment date, A1C DOR, and target year to check Below-the-Zone eligibility — board quarter and 36-month TIS exclusion.",
    steps: [
      "Open BTZ Eligibility from the Calculators menu.",
      "Enter the A1C's DOR and TAFMSD (enlistment date).",
      "Select the target year.",
      "Click Check BTZ Eligibility — the calculator evaluates the 20-month TIG window and 36-month TIS exclusion.",
    ],
  },
  {
    to: "/memo-generator",
    title: "Generate an AFH 33-337 Memorandum",
    intro:
      "Generates a properly formatted USAF Memorandum per The Tongue and Quill Chapter 14 — official letterhead, Dept seal, paragraph numbering, right-indented signature block.",
    steps: [
      "Open Memorandum from the top menu.",
      "Fill in letterhead (organization, unit, office symbol, address).",
      "Pick the date format and memo type (MEMORANDUM FOR or MEMORANDUM FOR RECORD).",
      "Write the subject and body paragraphs (use sub-paragraphs for indented content).",
      "Add references, attachments, and endorsements as needed.",
      "Complete the signature block (name, rank, branch, title).",
      "Click Generate & Download PDF.",
    ],
  },
];

const TIPS = [
  "Delete all PII columns before uploading to protect sensitive information",
  "Verify TIG, TIS, DOR, and AFSC data are accurate before uploading",
  "Always review flagged members with eligibility issues before proceeding",
  "Double-check PASCODE numbers match Force Distributor data from AFPC",
  "Generated MELs contain Controlled Unclassified Information — handle appropriately",
  "You can start a new roster without reloading the page",
];

export default function HowTo() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">How-To Guide</h1>
          <p className="text-slate-600 mt-1">
            Step-by-step guide to processing Master Eligibility Lists.
          </p>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-slate-900">
              Before you upload
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                <ChevronRight className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {GUIDES.map((g) => (
          <Card key={g.to}>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {g.title}
                </h2>
                {g.badge ? <Badge color="navy">{g.badge}</Badge> : null}
              </div>
              <p className="text-sm text-slate-600">{g.intro}</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
                {g.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <Link
                to={g.to}
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Open tool →
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Reference documents
          </h2>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="font-semibold">DAFI 36-2502.</span> Governs WAPS
              promotion eligibility, TIG/TIS requirements, HYT limits, and board
              procedures.
            </li>
            <li>
              <span className="font-semibold">HYT &amp; Reenlistment.</span> HYT
              limits and reenlistment eligibility rules referenced for TIS cap
              calculations.
            </li>
            <li>
              <span className="font-semibold">CUI Marking Standards.</span>{" "}
              Controlled Unclassified Information marking standards applied to
              all MEL PDF outputs.
            </li>
            <li>
              <span className="font-semibold">AFH 33-337.</span> Official
              correspondence formatting standard used for MFR layout, margins,
              fonts, and signature blocks.
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
