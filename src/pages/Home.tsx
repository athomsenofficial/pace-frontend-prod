import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ClipboardCheck, ListChecks } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { NAV_GROUPS, type NavItem } from "@/components/layout/nav";
import { api } from "@/lib/api";

// Balanced two-column launcher: 4 tools per column.
const LEFT_GROUPS = ["Promotions", "Documents"];
const RIGHT_GROUPS = ["Rosters", "Calculators"];
const HELP_GROUP = NAV_GROUPS.find((g) => g.label === "Help");

const CYCLE_PHASES = [
  {
    title: "Eligibility determination",
    desc: "Run the roster through TIG, TIS, HYT and AFSC checks.",
    to: "/initial-mel",
    tool: "Initial MEL",
  },
  {
    title: "Individual verification",
    desc: "Confirm dates for specific members before the cutoff.",
    to: "/calculators/promotion",
    tool: "Promotion eligibility",
  },
  {
    title: "Final packet",
    desc: "Produce the Final MEL with senior rater signature blocks.",
    to: "/final-mel",
    tool: "Final MEL",
  },
  {
    title: "Correspondence",
    desc: "Document post-board actions with a formatted MFR.",
    to: "/memo-generator",
    tool: "Memo / MFR",
  },
];

const CHECKLIST = [
  "Delete PII columns (SSAN, DOB, home address, phone…) before uploading.",
  "Verify DOR, TAFMSD and AFSC data are accurate in the source roster.",
  "Review every flagged member before generating documents.",
  "Confirm PASCODEs match Force Distributor data from AFPC.",
  "Generated MELs contain CUI — handle and store them appropriately.",
];

export default function Home() {
  return (
    <Page>
      <PageHeader
        title="Dashboard"
        description="Promotion eligibility, roster reports and correspondence tools for Commander's Support Staff."
        actions={
          <>
            <Link
              to="/rosters"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong/60 bg-surface px-4 text-sm font-medium text-fg shadow-sm transition-colors hover:bg-surface-hover"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Roster reports
            </Link>
            <Link
              to="/initial-mel"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Start Initial MEL
            </Link>
          </>
        }
      />

      <Alert tone="info" title="PACE processes uploaded data but does not store it.">
        Rosters you upload are used only to build your documents for this session.
        Remove PII columns before uploading, and treat generated MELs as CUI.
      </Alert>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {LEFT_GROUPS.map((label) => (
                <ToolGroup key={label} label={label} />
              ))}
            </div>
            <div className="space-y-4">
              {RIGHT_GROUPS.map((label) => (
                <ToolGroup key={label} label={label} />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader
              title="Typical WAPS cycle"
              description="Where each tool fits in the annual promotion calendar."
            />
            <CardBody>
              <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CYCLE_PHASES.map((p, i) => (
                  <li key={p.title} className="flex gap-3 lg:flex-col lg:gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold tabular-nums text-primary-text">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-fg">{p.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-fg-muted">{p.desc}</p>
                      <Link to={p.to} className="link mt-1 inline-flex items-center gap-1 text-xs">
                        {p.tool}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6">
          <ServiceStatus />

          <Card>
            <CardHeader title="Before you upload" />
            <CardBody className="py-3">
              <ul className="space-y-2">
                {CHECKLIST.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13px] leading-5 text-fg-muted">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {HELP_GROUP ? (
            <Card>
              <CardHeader title="Help" />
              <ul className="divide-y divide-line">
                {HELP_GROUP.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-hover sm:px-5"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-fg">{item.label}</span>
                        <span className="block text-xs text-fg-muted">{item.description}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>
      </div>
    </Page>
  );
}

function ToolGroup({ label }: { label: string }) {
  const group = NAV_GROUPS.find((g) => g.label === label);
  if (!group) return null;
  return (
    <Card>
      <CardHeader className="py-2.5">
        <h2 className="eyebrow">{group.label}</h2>
      </CardHeader>
      <ul className="divide-y divide-line">
        {group.items.map((item) => (
          <li key={item.to}>
            <ToolRow item={item} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ToolRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover sm:px-5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-text">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-fg group-hover:text-primary-text">
            {item.label}
          </span>
          {item.badge ? <Badge color="amber">{item.badge}</Badge> : null}
        </span>
        <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">
          {item.description}
        </span>
        {item.io ? (
          <span className="mt-1 block text-xs text-fg-subtle">{item.io}</span>
        ) : null}
      </span>
      <ArrowRight
        className="mt-2.5 h-4 w-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary-text"
        aria-hidden="true"
      />
    </Link>
  );
}

function ServiceStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then(() => !cancelled && setStatus("online"))
      .catch(() => !cancelled && setStatus("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-3 py-3.5">
        <div>
          <p className="text-[13px] font-medium text-fg">PACE service</p>
          <p className="text-xs text-fg-muted">
            {status === "offline"
              ? "Uploads and document generation are unavailable right now."
              : "Processing server for uploads and documents."}
          </p>
        </div>
        {status === "checking" ? (
          <Badge color="neutral" dot>
            Checking
          </Badge>
        ) : status === "online" ? (
          <Badge color="green" dot>
            Online
          </Badge>
        ) : (
          <Badge color="red" dot>
            Unreachable
          </Badge>
        )}
      </CardBody>
    </Card>
  );
}
