# PACE MEL redesign: token notes

Companion to `pace-concept.html` in this folder. These are the exact tokens taken from each source and a proposed Tailwind mapping for `pace-frontend-test`. That repo is on **Tailwind v3** (`tailwind.config.js` + `@tailwind` directives). Hollow Root and MTL are on Tailwind v4 (`@theme inline`).

## 1. Extracted from MTL Services

Source: `/Users/drew/Coding/mtl-services/platform/src/app/globals.css` (tokens), `platform/src/app/fonts.ts` (fonts), `platform/src/components/ui/{Button,Field,Table,Tag,Tabs,PageHeader}.tsx`, `platform/src/components/shells/app/{AppShell,SideNav}.tsx`.

| Token | Light | Dark ("Harbor night") |
|---|---|---|
| paper | `#F4F1EA` | `#0B1418` |
| surface | `#FFFFFF` | `#122028` |
| surface-2 | `#EAE5DA` | `#1A2C36` |
| line | `#D8D2C6` | `#243944` |
| line-strong | `#B9B1A2` | `#345261` |
| ink / ink-2 / ink-3 | `#14181C` / `#3A4046` / `#5F656C` | `#ECE7DD` / `#C9C3B8` / `#98A098` |
| harbor / harbor-2 / on-harbor | `#0E2A35` / `#173E4D` / `#F4F1EA` | `#ECE7DD` / `#D8D2C6` / `#0B1418` |
| clay / clay-2 (not used) | `#B65A32` / `#9A4A27` | `#D0754A` / `#DC8A62` |
| palm | `#2F6B4F` | `#5FA37F` |
| brass / brass-ink | `#B8862B` / `#7E5B1C` | `#D3A24A` / `#D3A24A` |
| brick / brick-ink | `#A8362E` / `#A8362E` | `#D45A50` / `#E27D73` |
| focus | `#1F6F8B` | `#6FB3CC` |
| radius | `--r-1: 4px`, `--r-2: 8px` | |
| shadow-1 | `0 1px 2px rgba(20,24,28,.06), 0 8px 24px rgba(20,24,28,.08)` | `0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35)` |
| motion | `--d-1: 120ms`, `--ease-out: cubic-bezier(0.2,0,0,1)` | |
| type scale (rem) | xs .75 · sm .875 · base 1.0625 · md 1.125 · lg 1.375 · xl 1.75 · 2xl 2.5 · 3xl 3.5 · 4xl 4.5 | |
| spacing | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 | |

- **Fonts:** Newsreader 400 (display, opsz 18–72, self-hosted subset) and Instrument Sans (UI). IBM Plex Mono comes from the older `mtl-services/web/app/layout.tsx` (`Fraunces, IBM_Plex_Sans, IBM_Plex_Mono`). The new platform dropped mono; PACE brings it back for codes only.
- **Component rules (taken as-is):**
  - Buttons: 40px app height (`h-10 px-4`), sm `h-8 px-3 text-[13px]`, radius 4, 15px/500. Hover changes colour only. One primary per view.
  - Fields: label above, 13px hint/error below, `aria-invalid` + `aria-describedby`.
  - Table: TH on surface-2, `text-xs font-semibold uppercase tracking-[0.08em]`, rows `border-b border-line`, wrapped in an `overflow-x-auto rounded-2 border` region.
  - Tag: 22px pill with an 8px dot. It is the only round shape.
  - Badge: 20px square, 11px caps, `tracking-[0.08em]`.
  - Tabs: h-11 with a 2px underline and a count.
  - Shell: `lg:grid-cols-[248px_1fr]` side nav, 64px top bar, `.app-surface` at 15px/1.5.
- Eyebrow: 13px/600, `letter-spacing .12em`, uppercase, with a 20×2px rule before it.

## 2. Extracted from Hollow Root

Source: `/Users/drew/Coding/hollowroot/platform/src/app/globals.css`, `platform/src/app/fonts.ts`, `platform/src/components/ui/*` (the same component set as MTL, re-tokened).

| Token | Light | Dark (admin only) |
|---|---|---|
| paper / surface / surface-2 | `#F6F3EC` / `#FBF9F5` / `#EDE8DD` | `#1B2622` / `#22302B` / `#2A3934` |
| line / line-strong (Stone) | `#DDD6C8` / `#8B7B6E` (3.68:1, "UI borders only") | `#37463F` / `#6B7A70` |
| ink / ink-2 / ink-3 | `#1F332B` / `#42524A` / `#5C6B62` | `#E8E1D2` / `#C8C1B2` / `#A39B8C` |
| root (Root Green) / hover | `#2F4A3F` / `#243B32` | `#9DBFAA` |
| sage / sage-tint / sage-ink | `#A8B7A2` / `#E1E7DC` / `#4F5D4A` | tint `#263630` |
| rose / rose-tint / rose-ink | `#C9A3A0` / `#F1E3E1` / `#7E5450` | tint `#3A2F2E` |
| stone / stone-ink | `#8B7B6E` / `#5E5148` | `#C8BCB0` |
| gold / gold-light / gold-ink | `#B8963F` / `#D9C48A` / `#7A672F` | |
| error / focus | `#8C3B2E` / `#7A672F` | `#E4907F` / `#D9C48A` |
| admin-ui override | paper `#F5F6F7`, surface `#FFFFFF`, line `#E1E4E8`, ink `#12171C` | |
| radius / motion | identical to MTL (4 / 8, 120ms) | |

- **Fonts:** Cormorant Garamond 500/600 (display) and Figtree 400/500/600. Neither is used in PACE: they are too soft for a USAF tool.
- **Taken:**
  - sage-tint `#E1E7DC` (Eligible ground) and rose-tint `#F1E3E1` (Ineligible / PII ground).
  - Stone `#8B7B6E` as the **input border**. MTL's `#D8D2C6` input border is under the 3:1 non-text contrast minimum.
  - stone-ink `#5E5148` for Small Unit text.
  - The `.linen` weave on the upload drop zone.
  - The admin rule: the serif stays in titles only.
  - Measured-contrast comments, plus the `prefers-reduced-motion` kill switch.
- **Not found / not applicable:** HR has no dense data-table styling beyond the shared `Table.tsx`, which is identical to MTL's.

## 3. Proposed PACE tokens (as used in the concept)

Contrast is WCAG 2.x, measured against paper / white.

| Role | Light | Contrast | Dark |
|---|---|---|---|
| paper | `#F4F1EA` | — | `#0B1418` |
| surface | `#FFFFFF` | — | `#122028` |
| surface-2 | `#EAE5DA` | — | `#1A2C36` |
| line (decorative) | `#D8D2C6` | — | `#243944` |
| line-strong | `#B9B1A2` | — | `#345261` |
| ctrl (input border) | `#8B7B6E` | 3.6 / 4.1 | `#6B8494` (4.2 on surface) |
| ink | `#14181C` | 15.8 / 17.8 | `#ECE7DD` |
| ink-2 | `#3A4046` | 9.3 / 10.5 | `#C9C3B8` |
| ink-3 | `#5F656C` | 5.2 / 5.9 | `#98A098` |
| harbor (primary) | `#0E2A35`, hover `#173E4D` | paper on it 13.3 | `#ECE7DD` fill, `#0B1418` text |
| focus | `#1F6F8B` | 5.0 | `#6FB3CC` |
| eligible | `#2F6B4F` / tint `#E1E7DC` | 5.6 · 5.0 on tint | `#5FA37F` / `#1C3027` |
| ineligible + error | `#A8362E` / tint `#F1E3E1` | 5.8 · 5.2 on tint | `#E27D73` / `#3A2422` |
| discrepancy | dot `#B8862B`, ink `#7E5B1C`, tint `#F4EAD2` | ink 5.5 · 5.2 on tint | `#D3A24A` / `#3A2C0C` |
| BTZ | dot `#1F6F8B`, ink `#175A72`, tint `#DCEAF0` | ink 6.2 on tint | `#6FB3CC` / `#13303B` |
| small unit | dot `#8B7B6E`, ink `#5E5148`, tint `#EAE5DA` | 6.1 on tint | `#C8BCB0` |

**Type:**

| Role | Font | Size / line height | Notes |
|---|---|---|---|
| Page title | Newsreader 400 | 30/33 | |
| Dialog title | Newsreader 400 | 26/29 | |
| Panel heading | Instrument Sans 600 | 16 | |
| Body / control | Instrument Sans | 15/22 | |
| Table cell | Instrument Sans | 14/20 | |
| Hint / error | Instrument Sans | 13 | |
| Table header caps | Instrument Sans 600 | 11.5 | +0.08em tracking |
| Codes | IBM Plex Mono | 13 | PAS, AFSC, SRID, RE/UIF |

Tabular numerals on all dates and counts.

## 4. Tailwind v3 mapping for pace-frontend-test

Replace the current `primary` (indigo `#1e3a8a`), `navy`, `accent`, `special` (`#7c3aed`) and `gold` scales. Also replace the fonts `Inter` / `Poppins` / `Black Ops One`.

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)", surface: "var(--surface)", "surface-2": "var(--surface-2)",
        line: "var(--line)", "line-strong": "var(--line-strong)", ctrl: "var(--ctrl)",
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        harbor: { DEFAULT: "var(--harbor)", 2: "var(--harbor-2)", on: "var(--on-harbor)" },
        focus: "var(--focus)",
        elig:  { DEFAULT: "var(--elig)", tint: "var(--elig-tint)" },
        inel:  { DEFAULT: "var(--inel)", tint: "var(--inel-tint)" },
        disc:  { DEFAULT: "var(--disc)", ink: "var(--disc-ink)", tint: "var(--disc-tint)" },
        btz:   { DEFAULT: "var(--btz)",  ink: "var(--btz-ink)",  tint: "var(--btz-tint)" },
        small: { DEFAULT: "var(--small)", ink: "var(--small-ink)", tint: "var(--small-tint)" },
        error: "var(--error)",
      },
      fontFamily: {
        sans: ['"Instrument Sans"', "ui-sans-serif", "system-ui", '"Segoe UI"', "sans-serif"],
        display: ['"Newsreader"', '"Iowan Old Style"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Consolas", "monospace"],
      },
      borderRadius: { 1: "4px", 2: "8px" },
      boxShadow: { 1: "var(--shadow-1)" },
      transitionDuration: { 1: "120ms" },
      transitionTimingFunction: { out: "cubic-bezier(0.2, 0, 0, 1)" },
    },
  },
};
```

Put the CSS variables (light, `@media (prefers-color-scheme: dark) :root:not([data-theme=light])`, and `[data-theme=dark]`) in `src/index.css` exactly as in the `<style>` block of `pace-concept.html`. Because every utility reads a variable, dark mode needs no `dark:` prefixes.

**Fonts on government networks:** self-host the three families (e.g. `@fontsource/instrument-sans`, `@fontsource-variable/newsreader`, `@fontsource/ibm-plex-mono`) rather than calling Google Fonts. Some DoD networks block `fonts.gstatic.com`; MTL/HR self-host via next/font for the same reason (`font-src 'self'`).

## 5. Component mapping (current file → concept)

| Current | Change |
|---|---|
| `features/mel/StepIndicator.tsx` | Replace with a `StepRail` (vertical, 208–248px). Each step gets a status line from session state. Below `lg` it becomes a 4-column strip. Drop the `animate-pulse` / `scale-110` / staggered delays. |
| `features/mel/MelWizard.tsx` | Becomes the app shell: rail + main + sticky `ActionBar` (Back · status · one primary). Remove the "Step X of Y" badge (the rail says it). |
| `ReviewStep.tsx` `StatTile` grid | Delete. Counts move into the category `Tabs` (`role=tablist`, with an "All" tab). Add a `NeedsAttention` bar with filter links and a "re-process needed" warning (track an edits-since-process counter client-side). |
| `ReviewStep.tsx` table | Columns: Name · Grade · DAFSC · DOR · PAS · Status & reason · Actions. Show the plain-language reason with the raw backend `reason` in mono underneath. Needs a reason → label map (e.g. `TIG: < 6 months` → "Under 6 months time in grade"). Labelled row actions; Move to eligible opens inline with a required reason; OVERRIDE badge plus `shadow-[inset_3px_0_0_var(--harbor)]` on the row. |
| Upload Logo button in ReviewStep | Move to the Download step. |
| `UploadStep.tsx` | One two-column layout. Optional: client-side header check before POST (`xlsx` ^0.18.5 is already in package.json, so reading row 1 in the browser adds no dependency). The PII list goes in a `<details>`. |
| `PascodeStep.tsx` | PASCODE tabs → unit list with completion status. Error summary + per-field errors. "Prints as" preview. "Copy from <PAS>" for the senior rater. The small-unit SR becomes its own list item. |
| `AddMemberModal.tsx` / `EditMemberModal.tsx` | Replace `type="date"` with text inputs in `DD-MMM-YYYY` plus lenient parse-on-blur. "Why it's flagged" message at top. "Edited" markers. Add: a required "Reason for adding" field (backend already stores `Manual add: {reason}`). |
| `components/ui/Badge.tsx` | Split into `Tag` (dot pill, status) and `Badge` (square caps, e.g. OVERRIDE), as in MTL. |

## 6. Open questions for Drew

1. Should unreviewed discrepancies block "Continue", or only warn (the concept warns)?
2. Is a "Move to eligible" override expected to survive Re-process (the backend needs to keep override flags), and should the reason print on the PDF?
3. Is the "Prints as" signature format correct (`FIRST M. LAST, Rank, USAF` / title)? Match it to the PDF generator.
4. Do we want client-side header pre-checking on Upload (the `xlsx` package is already installed)?
