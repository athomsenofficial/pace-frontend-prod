import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "pace-theme";

function readPreference(): ThemePreference {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // Storage blocked (private mode, policy) — fall back to system.
  }
  return "system";
}

function writePreference(pref: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // Ignore — the choice still applies for this page view.
  }
}

function systemPrefersDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function resolve(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") return systemPrefersDark() ? "dark" : "light";
  return pref;
}

function apply(resolved: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

interface ThemeState {
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (pref: ThemePreference) => void;
}

export const useTheme = create<ThemeState>((set) => ({
  preference: "system",
  resolved: "light",
  setPreference: (preference) => {
    writePreference(preference);
    const resolved = resolve(preference);
    apply(resolved);
    set({ preference, resolved });
  },
}));

let initialised = false;

/** Reads the saved preference, applies it, and follows OS changes in "system" mode. */
export function initTheme(): void {
  if (initialised) return;
  initialised = true;
  const preference = readPreference();
  const resolved = resolve(preference);
  apply(resolved);
  useTheme.setState({ preference, resolved });

  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const { preference: current } = useTheme.getState();
      if (current !== "system") return;
      const next = resolve("system");
      apply(next);
      useTheme.setState({ resolved: next });
    };
    mq.addEventListener("change", onChange);
  } catch {
    // matchMedia unsupported — nothing to follow.
  }
}
