import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  UploadResponse,
  RosterPreviewResponse,
  Member,
  PascodeSubmission,
  PromotionEligibilityRequest,
  PromotionEligibilityResult,
  BtzEligibilityRequest,
  BtzEligibilityResult,
  MfrRequest,
  MpfFormat,
} from "@/types";
import type {
  RunsListResponse,
  RunResult,
  RunRequest,
} from "@/features/rosters/types";

const baseURL = import.meta.env.VITE_API_URL || "https://tapi.businessbydrew.cloud";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 120_000,
  headers: { Accept: "application/json" },
});

export type MelType = "initial-mel" | "final-mel" | "mpf-roster";

export const api = {
  health: () => apiClient.get("/api/health"),

  uploadRoster: (type: MelType, file: File, cycle: string, year: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("cycle", cycle);
    fd.append("year", year);
    return apiClient.post<UploadResponse>(`/api/upload/${type}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  rosterPreview: (sessionId: string) =>
    apiClient.get<RosterPreviewResponse>(`/api/roster/preview/${sessionId}`),

  editMember: (sessionId: string, memberId: string, data: Partial<Member>) =>
    apiClient.put(`/api/roster/member/${sessionId}/${memberId}`, data),

  addMember: (sessionId: string, data: Partial<Member>) =>
    apiClient.post(`/api/roster/member/${sessionId}`, data),

  deleteMember: (sessionId: string, memberId: string, hard: boolean = false) =>
    apiClient.delete(`/api/roster/member/${sessionId}/${memberId}`, {
      params: { hard },
    }),

  reprocessRoster: (sessionId: string) =>
    apiClient.post(`/api/roster/reprocess/${sessionId}`),

  uploadLogo: (sessionId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post(`/api/roster/logo/${sessionId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getLogo: (sessionId: string) => apiClient.get(`/api/roster/logo/${sessionId}`),

  deleteLogo: (sessionId: string) =>
    apiClient.delete(`/api/roster/logo/${sessionId}`),

  submitPascodeInfo: (type: MelType, payload: PascodeSubmission) =>
    apiClient.post(`/api/${type}/submit/pascode-info`, payload),

  downloadDocument: (
    type: MelType,
    sessionId: string,
    format?: MpfFormat,
  ): Promise<AxiosResponse<Blob>> =>
    apiClient.get(`/api/download/${type}/${sessionId}`, {
      responseType: "blob",
      params: format ? { format } : undefined,
    }),

  generateMfr: (payload: MfrRequest): Promise<AxiosResponse<Blob>> =>
    apiClient.post(`/api/generate/mfr`, payload, { responseType: "blob" }),

  promotionEligibility: (payload: PromotionEligibilityRequest) =>
    apiClient.post<PromotionEligibilityResult>(
      `/api/calculators/promotion-eligibility`,
      payload,
    ),

  btzEligibility: (payload: BtzEligibilityRequest) =>
    apiClient.post<BtzEligibilityResult>(
      `/api/calculators/btz-eligibility`,
      payload,
    ),

  /* ---- Roster runs (retention + BTZ). Each run takes its own upload: the
     file is sent with every run and export, processed in memory on the
     server and not kept. Called on /api/v1 directly. */

  listRosterRuns: (params: { as_of_date?: string } = {}) =>
    apiClient.get<RunsListResponse>(`/api/v1/rosters/runs`, { params }),

  processRun: (runId: string, file: File, body: RunRequest) =>
    apiClient.post<RunResult>(
      `/api/v1/rosters/runs/${encodeURIComponent(runId)}/process`,
      runForm(file, body),
      { headers: { "Content-Type": "multipart/form-data" } },
    ),

  exportRun: (
    runId: string,
    format: "pdf" | "xlsx",
    file: File,
    body: RunRequest,
  ): Promise<AxiosResponse<Blob>> =>
    apiClient.post(`/api/v1/rosters/runs/${encodeURIComponent(runId)}/process/export`, runForm(file, body), {
      params: { format },
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/** multipart body for a roster run: file, as_of_date, params (JSON), pascodes (JSON array). */
function runForm(file: File, body: RunRequest): FormData {
  const fd = new FormData();
  fd.append("file", file);
  if (body.as_of_date) fd.append("as_of_date", body.as_of_date);
  if (body.params && Object.keys(body.params).length) fd.append("params", JSON.stringify(body.params));
  if (body.pascodes && body.pascodes.length) fd.append("pascodes", JSON.stringify(body.pascodes));
  return fd;
}

/** Reads the filename from a Content-Disposition header (exposed by the API's CORS config). */
export function filenameFromDisposition(header: unknown, fallback: string): string {
  if (typeof header !== "string") return fallback;
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
      /* fall through */
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : fallback;
}

export interface ApiProblem {
  status?: number;
  message: string;
  missingColumns: string[];
  invalidParams: string[];
}

/**
 * Turns an axios error into one readable message plus the backend's
 * {error, missing_columns, invalid_params} lists. Handles FastAPI's {detail}
 * too, and JSON error bodies that arrive as a Blob on file downloads.
 */
export async function parseApiError(e: unknown, fallback: string): Promise<ApiProblem> {
  const err = e as { response?: { status?: number; data?: unknown }; message?: string };
  let data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = null;
    }
  }
  const out: ApiProblem = {
    status: err?.response?.status,
    message: fallback,
    missingColumns: [],
    invalidParams: [],
  };
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const strings = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    out.missingColumns = strings(d.missing_columns);
    out.invalidParams = strings(d.invalid_params);
    if (typeof d.error === "string") out.message = d.error;
    else if (typeof d.detail === "string") out.message = d.detail;
  } else if (!err?.response && err?.message) {
    out.message = `Couldn't reach the PACE server (${err.message}).`;
  }
  return out;
}
