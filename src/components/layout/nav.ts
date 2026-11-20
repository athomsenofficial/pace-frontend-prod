import {
  BookOpen,
  Calculator,
  ClipboardCheck,
  Crown,
  FileCheck2,
  FileText,
  Info,
  Layers,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** One-line description used by the dashboard launcher. */
  description: string;
  /** What goes in / comes out — shown on dashboard cards. */
  io?: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const DASHBOARD_ITEM: NavItem = {
  to: "/",
  label: "Dashboard",
  icon: LayoutDashboard,
  description: "Start here",
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Promotions",
    items: [
      {
        to: "/initial-mel",
        label: "Initial MEL",
        icon: ClipboardCheck,
        description:
          "Run TIG, TIS, HYT and AFSC checks on a roster and produce the Initial Master Eligibility Listing.",
        io: "Roster → PDF",
      },
      {
        to: "/final-mel",
        label: "Final MEL",
        icon: FileCheck2,
        description:
          "Generate the Final MEL with senior rater signature blocks for board submission.",
        io: "Roster → PDF",
      },
      {
        to: "/mpf-roster",
        label: "MPF Roster",
        icon: Layers,
        description:
          "Produce an MPF distribution list, MEL format, or both merged into one PDF.",
        io: "Roster → PDF",
      },
    ],
  },
  {
    label: "Calculators",
    items: [
      {
        to: "/calculators/promotion",
        label: "Promotion eligibility",
        icon: Calculator,
        description:
          "Check one member's TIG, TIS and HYT against a promotion cycle.",
        io: "Dates → result",
      },
      {
        to: "/calculators/btz",
        label: "BTZ eligibility",
        icon: Crown,
        description:
          "A1C → SrA Below-the-Zone board quarter and 36-month TIS exclusion.",
        io: "Dates → result",
      },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        to: "/memo-generator",
        label: "Memo / MFR",
        icon: FileText,
        description:
          "Build an AFH 33-337 memorandum with letterhead, numbered paragraphs and signature block.",
        io: "Form → Word",
      },
    ],
  },
  {
    label: "Rosters",
    items: [
      {
        to: "/rosters",
        label: "Roster reports",
        icon: ListChecks,
        description:
          "Upload once, then run DEROS, retainability, DOS, HYT, UIF and time-on-station rosters.",
        io: "Roster → PDF / Excel",
        badge: "New",
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        to: "/how-to",
        label: "How-to guide",
        icon: BookOpen,
        description: "Step-by-step instructions for every tool.",
      },
      {
        to: "/features",
        label: "About PACE",
        icon: Info,
        description: "What each tool checks and produces, and the policy behind it.",
      },
    ],
  },
];

/** Finds the nav group + item for a pathname (for breadcrumbs). */
export function findNav(pathname: string): { group?: NavGroup; item?: NavItem } {
  if (pathname === "/") return { item: DASHBOARD_ITEM };
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(item.to + "/")) {
        return { group, item };
      }
    }
  }
  return {};
}
