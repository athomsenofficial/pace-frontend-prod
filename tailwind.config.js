/** @type {import('tailwindcss').Config} */

// Every colour reads a CSS custom property from src/index.css, stored as
// RGB channels so opacity modifiers (bg-primary/10) keep working.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: v("ground"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        line: v("line"),
        "line-strong": v("line-strong"),
        ctrl: v("ctrl"),
        silver: v("silver"),
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3") },
        primary: {
          DEFAULT: v("primary"),
          hover: v("primary-hover"),
          tint: v("primary-tint"),
          // legacy aliases kept so older class names still resolve to the theme
          dark: v("primary-hover"),
          light: v("primary"),
          50: v("primary-tint"),
          100: v("primary-tint"),
          500: v("primary"),
          600: v("primary"),
          700: v("primary"),
          900: v("primary-hover"),
        },
        navy: {
          DEFAULT: v("navy"),
          2: v("navy-2"),
          on: v("on-navy"),
          "on-2": v("on-navy-2"),
          // legacy aliases
          950: v("navy"),
          900: v("navy"),
          800: v("navy-2"),
          700: v("navy-2"),
          600: v("primary"),
          500: v("primary"),
        },
        gold: { DEFAULT: v("gold"), light: v("gold"), dark: v("gold") },
        focus: v("focus"),
        elig: { DEFAULT: v("elig"), tint: v("elig-tint") },
        inel: { DEFAULT: v("inel"), tint: v("inel-tint") },
        disc: { DEFAULT: v("disc"), ink: v("disc-ink"), tint: v("disc-tint") },
        btz: { DEFAULT: v("btz"), ink: v("btz-ink"), tint: v("btz-tint") },
        small: { DEFAULT: v("small"), ink: v("small-ink"), tint: v("small-tint") },
        error: v("error"),
        // Legacy semantic names remapped onto the category tokens
        success: { DEFAULT: v("elig"), dark: v("elig"), tint: v("elig-tint") },
        danger: { DEFAULT: v("inel"), dark: v("inel"), tint: v("inel-tint") },
        warning: { DEFAULT: v("disc"), dark: v("disc-ink"), tint: v("disc-tint") },
        special: { DEFAULT: v("btz"), dark: v("btz-ink") },
        accent: { DEFAULT: v("btz"), dark: v("btz-ink") },
        // Tailwind's slate scale remapped onto the cool neutral tokens so any
        // remaining slate-* class follows the theme.
        slate: {
          50: v("ground"),
          100: v("surface-2"),
          200: v("line"),
          300: v("line-strong"),
          400: v("ctrl"),
          500: v("ink-3"),
          600: v("ink-3"),
          700: v("ink-2"),
          800: v("ink"),
          900: v("ink"),
          950: v("ink"),
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', "ui-sans-serif", "system-ui", '"Segoe UI"', "sans-serif"],
        display: ['"Newsreader"', '"Iowan Old Style"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Consolas", '"Courier New"', "monospace"],
      },
      borderRadius: { 1: "4px", 2: "8px" },
      boxShadow: { 1: "var(--shadow-1)" },
      transitionDuration: { 1: "120ms" },
      transitionTimingFunction: { out: "cubic-bezier(0.2, 0, 0, 1)" },
    },
  },
  plugins: [],
};
