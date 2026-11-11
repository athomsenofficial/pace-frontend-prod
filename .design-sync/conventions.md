# PACE UI — conventions

PACE UI is the React component kit behind a U.S. Air Force promotion-management
app (rosters, eligibility, memo generation). Every component is exported on
`window.PaceUI` and built with **Tailwind CSS** against a custom brand theme.
Build screens by composing these components and styling your own layout glue
with the Tailwind classes named below.

## Setup — no provider needed

Components are self-contained. There is **no theme provider or root wrapper to
mount** — render any component directly. The brand fonts (Inter for body,
Poppins for headings, Black Ops One for display/brand) and all color tokens ship
in `styles.css`, which is already loaded. Just use the components.

## Styling idiom — Tailwind utilities with a brand theme

Style your own layout (wrappers, grids, spacing) with Tailwind utility classes.
Use the brand palette below — these are the real, shipped class families:

| Purpose | Classes |
|---|---|
| Dark brand surfaces | `bg-navy-950` `bg-navy-900` `bg-navy-800` (and `bg-hero-gradient` for hero sections) |
| Gold accent | `bg-gold` `bg-gold-light` `bg-gold-dark` |
| Primary scale | `bg-primary` `text-primary` `border-primary` (also `-50/-100/-500/-600/-700/-900`) |
| Neutral surfaces | `bg-white` `bg-slate-50` `border-slate-200` `border-slate-300` |
| Text | `text-navy-900` (headings/strong) · `text-slate-700` `text-slate-600` `text-slate-500` (body/muted) · `text-white` |
| Semantic (badges, alerts) | `emerald` (success), `red` (danger), `amber` (warning), `blue`, `cyan` — each as `bg-<c>-100` + `text-<c>-800` |
| Font families | `font-sans` (Inter, default) · `font-heading` (Poppins) · `font-brand` (Black Ops One) |

Prefer component **props** over restyling: a button's color comes from
`variant`, a badge's from `color` — don't override them with classes.

## The components (all on `window.PaceUI`)

- **Button** — `variant` `primary|secondary|outline|ghost|danger|white`, `size` `sm|md|lg`, `leftIcon`/`rightIcon`, `loading`. Accepts all native `<button>` props.
- **Badge** — `color` `neutral|navy|green|red|amber|blue|teal`. Status pills.
- **Card** — compose with **CardHeader**, **CardBody**, **CardFooter**.
- **Input** / **Select** — `label`, `hint`, `error`, plus native field props. Select also takes `options={[{value,label}]}` or `<option>` children.
- **Modal** — controlled via `open`/`onClose`; `title`, `description`, `footer`, `size` `sm|md|lg|xl`.
- **Table** — compose with **THead**, **TBody**, **TR**, **TH**, **TD**.
- **Tabs** — controlled via `value`/`onChange`; `items={[{value,label,count?}]}`.

## Where the truth lives

Read the bound `styles.css` (and the `_ds_bundle.css` it imports) for the full
shipped class set, and each component's `.d.ts` (its exact props) and
`.prompt.md` (usage) before composing.

## One idiomatic example

```tsx
const { Card, CardHeader, CardBody, CardFooter, Button, Badge } = window.PaceUI;

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3 className="font-heading text-navy-900 font-semibold">Promotion Eligibility</h3>
      <Badge color="green">Eligible</Badge>
    </div>
  </CardHeader>
  <CardBody>
    <p className="text-sm text-slate-600">SMITH, JOHN A. — SSgt → TSgt</p>
  </CardBody>
  <CardFooter>
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm">Edit</Button>
      <Button variant="primary" size="sm">Approve</Button>
    </div>
  </CardFooter>
</Card>
```
