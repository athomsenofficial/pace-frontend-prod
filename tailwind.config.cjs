/** @type {import('tailwindcss').Config} */
// CommonJS on purpose: on Node 22+, an ESM config is loaded via require(esm),
// whose cache Tailwind can't clear, so config edits never reach a running dev server.

// Semantic colour tokens are CSS custom properties (RGB channels) defined in
// src/index.css for light (:root) and dark (.dark). Components use these
// semantic names, so they switch theme without per-class `dark:` variants.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const tone = (name) => ({
  DEFAULT: token(name), // text / icon colour (AA on surface)
  soft: token(`${name}-soft`), // tinted background
  line: token(`${name}-line`), // border on tinted background
  solid: token(`${name}-solid`), // filled background (white text)
});

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          muted: token("surface-muted"),
          hover: token("surface-hover"),
        },
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },
        fg: {
          DEFAULT: token("fg"),
          muted: token("fg-muted"),
          subtle: token("fg-subtle"),
        },
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          fg: token("primary-fg"),
          soft: token("primary-soft"),
          text: token("primary-text"),
        },
        focus: token("focus"),
        success: tone("success"),
        warning: tone("warning"),
        danger: tone("danger"),
        info: tone("info"),
        violet: tone("violet"),
        sidebar: {
          DEFAULT: token("sidebar"),
          fg: token("sidebar-fg"),
          muted: token("sidebar-muted"),
          hover: token("sidebar-hover"),
          active: token("sidebar-active"),
          line: token("sidebar-line"),
        },
        // Static brand palette (theme-independent) — wordmark, accents.
        navy: {
          50: "#eef2fa",
          100: "#dbe3f3",
          500: "#3656a3",
          600: "#27407f",
          700: "#1c3066",
          800: "#152652",
          900: "#0f1e3d",
          950: "#0a1530",
        },
        gold: {
          DEFAULT: "#d4a23a",
          light: "#f2cf73",
          dark: "#a87a1c",
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        // Legacy aliases — kept so older class names still resolve to Inter.
        heading: ['"Inter"', "system-ui", "sans-serif"],
        brand: ['"Inter"', "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          '"SFMono-Regular"',
          '"Cascadia Mono"',
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px — table headers, eyebrows
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        raised:
          "0 4px 12px -2px rgb(15 23 42 / 0.10), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
        overlay:
          "0 20px 40px -12px rgb(2 6 23 / 0.35), 0 8px 16px -8px rgb(2 6 23 / 0.20)",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
      },
      maxWidth: {
        content: "80rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "dialog-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-in-left": "slide-in-left 200ms ease-out",
        "dialog-in": "dialog-in 160ms ease-out",
      },
    },
  },
  plugins: [],
};
