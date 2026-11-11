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
};
