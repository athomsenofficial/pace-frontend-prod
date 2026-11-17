/**
 * The PACE tool suite, grouped by job. One source for the menu drawer, the
 * footer, the home tool grid and the Features page.
 *
 * `duty` cites the CSS PSDG (5 Dec 2025) duty a tool supports, only where the
 * backend states it (roster_runs registry). Left out where it isn't known.
 */
export interface Tool {
  to: string;
  name: string;
  /** One plain line for cards and the menu. */
  description: string;
  duty?: string;
  /** Concise "what it does" bullets for the Features page. */
  does: string[];
  produces: string[];
}

export interface ToolGroup {
  id: string;
  label: string;
  /** Shorter label for the menu and footer. */
  navLabel: string;
  intro: string;
  tools: Tool[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "promotions",
    label: "Promotions",
    navLabel: "Promotions",
    intro: "Eligibility listings, MPF distribution lists and the quarterly BTZ roster.",
    tools: [
      {
        to: "/initial-mel",
        name: "Initial MEL",
        description: "Sort a unit roster into eligible, ineligible, discrepancy, BTZ and small unit, then print the Initial MEL.",
        does: [
          "Checks TIG, TIS, HYT and PAFSC skill level per DAFI 36-2502",
          "Gives the reason for every ineligible and discrepancy call",
          "Lets you edit, add, move or remove members before printing",
          "Collects commander and senior rater signature blocks per unit",
        ],
        produces: ["CUI-marked Initial MEL PDF"],
      },
      {
        to: "/final-mel",
        name: "Final MEL",
        description: "The Final MEL with NRN, P, MP and PN columns and per-unit signature blocks.",
        does: [
          "Uses the same review and Force Distributor steps as the Initial MEL",
          "Prints per-unit signature blocks for multi-unit rosters",
        ],
        produces: ["CUI-marked Final MEL PDF"],
      },
      {
        to: "/mpf-roster",
        name: "MPF roster",
        description: "MPF distribution lists by PAS code, in MPF list format, MEL format or both.",
        does: ["Uses the same upload and review steps as the MEL tools", "Merges both formats into one PDF on request"],
        produces: ["CUI-marked PDF"],
      },
      {
        to: "/rosters/btz-quarterly",
        name: "SrA BTZ Quarterly roster",
        description: "RegAF A1Cs whose BTZ date falls in a quarter, counted per unit with LARGE-unit quotas and the CBB pool.",
        duty: "CSS PSDG Table F1 item 32",
        does: [
          "Computes fully qualified and BTZ dates from DOR and TAFMSD",
          "Counts eligibles per PASCODE: 7 or more is LARGE with a 15% quota, fewer pools into the CBB",
          "Lists previously considered, non-RegAF and data-issue records separately",
        ],
        produces: ["MPF summary and unit pages (PDF)", "Excel workbook"],
      },
    ],
  },
  {
    id: "retention",
    label: "Retention & assignments",
    navLabel: "Retention",
    intro: "Watch lists built from the alpha roster export, one file per run.",
    tools: [
      {
        to: "/rosters/dos-reenlistment",
        name: "DOS / Reenlistment roster",
        description: "Enlisted members with DOS inside the window, the DOS-minus-120-days action date and reenlistment status with every reason.",
        duty: "CSS PSDG Table F1 items 3, 36; Table G1 item 1",
        does: [
          "Reads RE code, UIF, CJR window, extension history and HYT",
          "Flags overdue action-by dates",
          "Lists expired DOS, indefinite DOS and data issues separately",
        ],
        produces: ["PDF roster", "Excel workbook"],
      },
      {
        to: "/rosters/deros-option",
        name: "DEROS Option roster",
        description: "Members near DEROS with no assignment on file or not enough retainability, with their reenlistment status.",
        duty: "CSS PSDG Table F1 item 40, item 3; Table G1 items 6-7",
        does: [
          "Checks DOS against the DEROS month plus the OS-to-CONUS requirement",
          "Shows months short and whether extension room covers it",
          "Separates members leaving from overseas and blank or past DEROS",
        ],
        produces: ["PDF roster", "Excel workbook"],
      },
      {
        to: "/rosters/re-code-review",
        name: "RE Code Review roster",
        description: "Every enlisted member whose RE code starts with a review prefix (2 and 4 by default), with definition and waiver authority.",
        duty: "CSS PSDG Table F1 items 36, 37(b); Table G1 item 1",
        does: [
          "Sorted by DOS, with months to DOS and UIF",
          "Shows whether each code is waivable and who waives it",
        ],
        produces: ["PDF roster", "Excel workbook"],
      },
      {
        to: "/rosters/cjr-window",
        name: "First-Term CJR Window roster",
        description: "First-term Airmen by Career Job Reservation window: approaching, in window or past window.",
        does: [
          "Places each first-term Airman approaching, in or past the CJR window",
          "Takes the alpha roster export; the file is processed in memory and not kept",
        ],
        produces: ["PDF roster", "Excel workbook"],
      },
    ],
  },
  {
    id: "calculators",
    label: "Calculators",
    navLabel: "Calculators",
    intro: "Check one member without uploading a roster.",
    tools: [
      {
        to: "/calculators/promotion",
        name: "Promotion eligibility",
        description: "Enter DOR and TAFMSD to check TIG, TIS and High Year Tenure for a promotion cycle year.",
        does: [
          "Shows each requirement with the member's date and the required date",
          "Lists the specific unmet requirement when ineligible",
        ],
        produces: ["On-screen result"],
      },
      {
        to: "/calculators/btz",
        name: "BTZ eligibility",
        description: "Find an A1C's Below-the-Zone board quarter and check the TIG and TIS rules.",
        does: ["Projects the board quarter and promotion date", "Shows pass or fail for each criterion"],
        produces: ["On-screen result"],
      },
    ],
  },
  {
    id: "correspondence",
    label: "Correspondence",
    navLabel: "Correspondence",
    intro: "Official memoranda in Tongue and Quill format.",
    tools: [
      {
        to: "/memo-generator",
        name: "Memorandum generator",
        description: "A memorandum for record per AFH 33-337 with header, numbered paragraphs and signature block.",
        does: [
          "Applies AFH 33-337 margins, font and signature block position",
          "Numbers paragraphs only when there is more than one",
        ],
        produces: ["PDF memorandum"],
      },
    ],
  },
];

export const TOOL_COUNT = TOOL_GROUPS.reduce((n, g) => n + g.tools.length, 0);
