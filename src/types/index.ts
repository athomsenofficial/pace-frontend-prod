export type Disposition = "eligible" | "ineligible" | "discrepancy" | "btz";

export interface Member {
  member_id: string;
  FULL_NAME: string;
  GRADE: string;
  DOR: string | null;
  TAFMSD: string | null;
  DAFSC: string | null;
  PAFSC?: string | null;
  ASSIGNED_PAS: string;
  ASSIGNED_PAS_CLEARTEXT?: string;
  UIF_CODE?: string | null;
  UIF_DISPOSITION_DATE?: string | null;
  REENL_ELIG_STATUS?: string | null;
  DATE_ARRIVED_STATION?: string | null;
  GRADE_PERM_PROJ?: string | null;
  disposition: Disposition;
  reason?: string | null;
  deleted?: boolean;
  /** Reviewer moved this member to eligible ("Move to Eligible"). */
  override?: boolean;
  override_reason?: string | null;
  /** Added by hand in the roster editor. */
  manual?: boolean;
}

export interface UploadResponse {
  session_id: string;
  pascodes: string[];
  pascode_unit_map: Record<string, string>;
  senior_rater_needed: boolean;
  small_units?: string[];
  message: string;
  errors: string[];
}

export interface RosterCategoryCounts {
  eligible: number;
  ineligible: number;
  discrepancy: number;
  btz: number;
  total: number;
}

export interface RosterPreviewResponse {
  members: Member[];
  counts: RosterCategoryCounts;
  pascodes: string[];
  pascode_unit_map: Record<string, string>;
  small_units?: string[];
  cycle: string;
  year: string;
}

export interface PascodeInfo {
  pascode: string;
  unit_name: string;
  senior_rater_rank: string;
  senior_rater_title: string;
  senior_rater_first_name: string;
  senior_rater_middle_name?: string;
  senior_rater_last_name: string;
  commander_rank: string;
  commander_title: string;
  commander_first_name: string;
  commander_middle_name?: string;
  commander_last_name: string;
}

export interface PascodeSubmission {
  session_id: string;
  pascode_info: PascodeInfo[];
}

export interface PromotionEligibilityRequest {
  tig_date: string;
  tis_date: string;
  current_rank: string;
  target_year: number;
}

export interface TigRequirement {
  met: boolean;
  required: string;
  actual: string;
  required_date: string;
  member_date: string;
}

export interface TisRequirement {
  met: boolean;
  required: string;
  actual: string;
  required_date: string;
  member_date: string;
}

export interface HytRequirement {
  met: boolean;
  limit: string;
  current: string;
  hyt_date: string;
  mdos_date: string;
}

export interface PromotionEligibilityResult {
  eligible: boolean;
  cycle: string;
  year: string | number;
  scod: string;
  requirements: {
    tig: TigRequirement;
    tis: TisRequirement;
    hyt: HytRequirement;
  };
  unmet_requirements?: string[];
}

export interface BtzEligibilityRequest {
  enlistment_date: string;
  a1c_dor: string;
  target_year: number;
}

export interface BtzTigRequirement {
  met: boolean;
  board_quarter: string;
  consideration_date: string;
  promotion_date: string;
  a1c_dor: string;
}

export interface BtzTisRequirement {
  met: boolean;
  tis_at_promotion: string;
  three_year_date: string;
  enlistment_date: string;
}

export interface BtzEligibilityResult {
  eligible: boolean;
  board_quarter: string;
  promotion_date?: string;
  requirements: {
    tig_20_months: BtzTigRequirement;
    three_year_tis_exclusion: BtzTisRequirement;
  };
  ineligible_reasons?: string[];
}

export type DateFormat = "short" | "long";
export type MemoType = "for" | "record";

export interface MemoParagraph {
  text: string;
  level: 0 | 1 | 2;
}

export interface MfrEndorsement {
  office_symbol: string;
  date: string;
  date_format: DateFormat;
  paragraphs: MemoParagraph[];
  signer_name: string;
  signer_rank: string;
  signer_branch: string;
  signer_title: string;
  attachments: string[];
}

export interface MfrRequest {
  organization: string;
  address_line_1: string;
  address_line_2: string;
  date: string;
  date_format: DateFormat;
  office_symbol: string;
  memo_for: string;
  subject: string;
  paragraphs: MemoParagraph[];
  signer_name: string;
  signer_rank: string;
  signer_branch: string;
  signer_title: string;
  references: string[];
  attachments: string[];
  endorsements: MfrEndorsement[];
}

export type MpfFormat = "list" | "mel" | "both";
