import { create } from "zustand";
import type { RunMeta } from "./types";

/**
 * Run metadata only (labels, descriptions, params, duty: no roster data).
 * Roster files and results live in the run page's React state and are gone
 * when the user leaves or refreshes. Nothing is written to sessionStorage or
 * localStorage for rosters.
 */
interface RosterMetaStore {
  meta: RunMeta[] | null;
  setMeta: (m: RunMeta[]) => void;
}

export const useRosterStore = create<RosterMetaStore>((set) => ({
  meta: null,
  setMeta: (m) => set({ meta: m }),
}));
