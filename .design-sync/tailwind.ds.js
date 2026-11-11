// Tailwind config for the design-sync DS stylesheet.
// Extends the app's theme and scans src + authored previews. A safelist ships
// the full brand + semantic color palette (bg/text/border/ring, incl. hover/
// focus/active) so designs the Claude Design agent builds can use the whole
// on-brand vocabulary — not just the classes the 8 components happen to emit.
import base from "../tailwind.config.js";

export default {
  ...base,
  content: ["./src/**/*.{ts,tsx}", "./.design-sync/previews/**/*.tsx"],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-navy-(50|100|500|600|700|800|900|950)/,
      variants: ["hover", "focus", "active", "focus-visible"],
    },
    {
      pattern: /(bg|text|border|ring)-gold(-light|-dark)?/,
      variants: ["hover", "focus", "active", "focus-visible"],
    },
    {
      pattern: /(bg|text|border|ring)-primary(-dark|-light|-50|-100|-500|-600|-700|-900)?/,
      variants: ["hover", "focus", "active"],
    },
    {
      pattern: /(bg|text|border)-(slate|red|emerald|amber|blue|cyan)-(50|100|200|500|600|700|800|900)/,
      variants: ["hover"],
    },
    "font-sans",
    "font-heading",
    "font-brand",
    "bg-hero-gradient",
  ],
};
