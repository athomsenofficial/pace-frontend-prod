# design-sync notes — pace-frontend-test → PACE UI

## What this sync is

This repo is a **Vite + React 19 + Tailwind application**, not a published
design-system package. The sync imports the reusable UI primitives in
`src/components/ui/` (Badge, Button, Card, Input, Modal, Select, Table, Tabs)
as the "package shape" via a synthesized barrel entry.

- **Barrel entry:** `src/ds-entry.ts` re-exports the 8 primitives plus their
  compound sub-parts (CardHeader/Body/Footer, THead/TBody/TR/TH/TD). The
  converter is run with `--entry ./src/ds-entry.ts`. If you add a new ui
  component, add it to the barrel AND to `cfg.componentSrcMap` AND give it a
  `cfg.dtsPropsFor` entry (see next point).
- **No built `.d.ts`.** The app has no library build, so ts-morph can't extract
  props (the components keep their `*Props` interfaces local/non-exported).
  Every component's contract is hand-written in `cfg.dtsPropsFor` — **preserve
  and update these by hand** when a component's props change; they are NOT
  auto-extracted and will silently drift otherwise.

## Stylesheet (cssEntry is generated — must rebuild on re-sync)

- `cfg.cssEntry` points at `.design-sync/ds-styles.css`, which is **generated**
  by `cfg.buildCmd` (`npx tailwindcss -c .design-sync/tailwind.ds.js ...`).
  **Run `buildCmd` before the converter on every re-sync** or the CSS is stale.
- The dist CSS (`dist/assets/index-*.css`) was NOT used as cssEntry: its
  `@font-face` URLs are absolute (`/assets/...`) and don't resolve on disk, and
  the filename is content-hashed. The generated stylesheet avoids both.
- **Tailwind purge caveat:** the shipped CSS only contains classes found in
  `src/**` + `.design-sync/previews/**` + the **safelist** in
  `.design-sync/tailwind.ds.js`. The safelist ships the full brand + semantic
  color palette so designs can use the whole on-brand vocabulary. If a design
  needs a Tailwind utility outside that set, it won't be styled — widen the
  safelist if this comes up. (This is why `_ds_bundle.css` is ~850 KB.)

## Fonts

Shipped from the `@fontsource` packages via `cfg.extraFonts` (Inter, Poppins,
Black Ops One — all weights main.tsx imports). All Unicode subsets are copied
(83 files). Trim subsets in `extraFonts` if size ever matters.

## Previews

- Layout glue in previews uses **inline styles**, not Tailwind classes, so a
  preview never depends on a class being in the purged CSS.
- **Modal** renders a `fixed inset-0` overlay; in the capture harness `fixed`
  collapses against a transformed ancestor, clipping the header. Fix: the
  `AddMember` preview wraps the Modal in a `transform: translateZ(0)` +
  `minHeight` div so the overlay sizes to the wrapper and the full dialog shows.
  `cfg.overrides.Modal` pins `cardMode: single`, `viewport: 760x480`.

## Known render warns

None — render check is 8/8 clean (no thin/blank/variants-identical warns).

## Misc

- 1 CSS custom property is referenced but undefined (below validate's threshold,
  non-blocking). Not chased.
- All grades carry forward on rebuild (styling/bundle churn doesn't invalidate);
  a full `package-capture.mjs` prints 8 carried-forward, 0 cleared.

## Re-sync risks (what can silently go stale)

- **`dtsPropsFor` drift:** contracts are hand-maintained. If a component's real
  props change in source, the `.d.ts` the design agent sees won't, unless you
  update `cfg.dtsPropsFor`. Re-check against `src/components/ui/*.tsx`.
- **Stale `ds-styles.css`:** if you skip `buildCmd` before the converter, the
  shipped CSS won't reflect source/preview/safelist changes.
- **New ui components** added to `src/components/ui/` are invisible to the sync
  until added to `src/ds-entry.ts` + `componentSrcMap` + `dtsPropsFor`.
- **Conventions header** names specific classes/components — re-validate it
  against the fresh build (the conventions step does this) and fix any drift.
