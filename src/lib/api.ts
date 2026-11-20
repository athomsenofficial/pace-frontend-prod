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
  RosterDefinition,
  RosterExportRequest,
  RosterRunRequest,
  RosterRunResult,
  RosterUploadResponse,
} from "@/types";

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

  /* ---------- Rosters (v1) ---------- */
  rosters: {
    upload: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiClient.post<RosterUploadResponse>(`/api/v1/rosters/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    list: (sessionId?: string | null) =>
      apiClient.get<RosterDefinition[]>(`/api/v1/rosters`, {
        params: sessionId ? { session_id: sessionId } : undefined,
      }),

    run: (rosterId: string, payload: RosterRunRequest) =>
      apiClient.post<RosterRunResult>(
        `/api/v1/rosters/${encodeURIComponent(rosterId)}/run`,
        payload,
      ),

    export: (
      rosterId: string,
      payload: RosterExportRequest,
    ): Promise<AxiosResponse<Blob>> =>
      apiClient.post(
        `/api/v1/rosters/${encodeURIComponent(rosterId)}/export`,
        payload,
        { responseType: "blob" },
      ),
  },
};

/** Extracts a filename from a Content-Disposition header, if present. */
export function filenameFromDisposition(
  header: string | undefined | null,
): string | null {
  if (!header) return null;
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // fall through to the plain form
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

/**
 * Human-readable message for an axios/fetch error. Handles FastAPI `detail`
 * (string or validation-error array), `message`/`error` fields, blob error
 * bodies from file downloads, and network failures.
 */
export async function apiErrorMessage(e: unknown, fallback: string): Promise<string> {
  const err = e as {
    response?: { status?: number; data?: unknown };
    message?: string;
    code?: string;
  };
  let data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } catch {
      data = undefined;
    }
  }
  const fromData = (() => {
    if (!data) return null;
    if (typeof data === "string") return data.trim() || null;
    if (typeof data === "object") {
      const d = data as Record<string, unknown>;
      const detail = d.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const msgs = detail
          .map((x) =>
            x && typeof x === "object" && "msg" in x
              ? String((x as { msg: unknown }).msg)
              : String(x),
          )
          .filter(Boolean);
        if (msgs.length) return msgs.join("; ");
      }
      if (typeof d.message === "string") return d.message;
      if (typeof d.error === "string") return d.error;
    }
    return null;
  })();
  if (fromData) return fromData;
  const status = err?.response?.status;
  if (status === 404) return `${fallback} (the server doesn't support this yet).`;
  if (!err?.response) {
    return "Couldn't reach the PACE server. Check your connection and try again.";
  }
  return err?.message || fallback;
}
