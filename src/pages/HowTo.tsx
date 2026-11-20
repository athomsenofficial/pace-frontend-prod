import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { Page } from "@/components/Page";

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
    to: "/rosters",
    title: "Run a roster report",
    badge: "New",
    intro:
      "Roster reports answer recurring CSS questions — DEROS and assignment retainability, DOS windows, HYT, UIF dispositions and time on station — from a single upload.",
    steps: [
      "Open Roster reports from the Rosters menu.",
      "Upload your roster file once; PACE shows which reports your columns support.",
      "Pick a report and fill in its parameters (required ones are marked).",
      "Optionally set an as-of date, then click Run report.",
      "Review the results and any warnings, then export to PDF or Excel.",
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
    <Page>
      <PageHeader
        eyebrow="Help"
        icon={<BookOpen />}
        title="How-to guide"
        description="Step-by-step instructions for processing Master Eligibility Lists and using every PACE tool."
      />

      <Alert tone="warning" title="Before you upload">
        <ul className="mt-1 grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-warning" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Alert>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {GUIDES.map((g) => (
          <Card key={g.to} className="flex flex-col">
            <CardHeader
              title={g.title}
              description={g.intro}
              actions={g.badge ? <Badge color={g.badge === "New" ? "amber" : "navy"}>{g.badge}</Badge> : null}
            />
            <CardBody className="flex-1">
              <ol className="space-y-2">
                {g.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[13px] leading-5 text-fg">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[11px] font-semibold tabular-nums text-fg-muted">
                      {i + 1}
                    </span>
                    <span className="pt-px">{step}</span>
                  </li>
                ))}
              </ol>
            </CardBody>
            <CardFooter className="py-2.5">
              <Link to={g.to} className="link inline-flex items-center gap-1 text-[13px]">
                Open tool
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Reference documents" />
        <CardBody>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REFERENCES.map((r) => (
              <div key={r.pub}>
                <dt className="text-[13px] font-semibold text-fg">{r.pub}</dt>
                <dd className="mt-0.5 text-[13px] leading-5 text-fg-muted">{r.desc}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </Page>
  );
}

const REFERENCES = [
  {
    pub: "DAFI 36-2502",
    desc: "Governs WAPS promotion eligibility, TIG/TIS requirements, HYT limits, and board procedures.",
  },
  {
    pub: "HYT & Reenlistment",
    desc: "HYT limits and reenlistment eligibility rules referenced for TIS cap calculations.",
  },
  {
    pub: "CUI Marking Standards",
    desc: "Controlled Unclassified Information marking standards applied to all MEL PDF outputs.",
  },
  {
    pub: "AFH 33-337",
    desc: "Official correspondence formatting standard used for MFR layout, margins, fonts, and signature blocks.",
  },
];
