import { create } from "zustand";

interface SessionState {
  sessionId: string | null;
  type: "initial-mel" | "final-mel" | "mpf-roster" | null;
  cycle: string | null;
  year: string | null;
  setSession: (
    sessionId: string,
    type: "initial-mel" | "final-mel" | "mpf-roster",
    cycle: string,
    year: string,
  ) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  type: null,
  cycle: null,
  year: null,
  setSession: (sessionId, type, cycle, year) =>
    set({ sessionId, type, cycle, year }),
  clear: () => set({ sessionId: null, type: null, cycle: null, year: null }),
}));
