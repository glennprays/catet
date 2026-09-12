---
version: 2
name: Paper Ledger
description: "Compact personal finance dashboard for one user — Wise-like data-first clarity on a warm paper palette, semantic color rationing (teal safe / amber thin / crimson over), single Hanken Grotesk voice with tabular figures, hairline alpha-ink borders, light-only; anti-slop: no gradients, glass, glow, or decorative color; cream is product identity (paper ledger), not a beige default — see §1"
colors:
  canvas: "#f2f1ee"
  surface: "#faf9f6"
  surface-100: "#f7f5f1"
  surface-200: "#efece7"
  surface-300: "#e7e3dc"
  sheet: "#fffefc"
  ink: "#26231d"
  ink-soft: "#454139"
  muted: "#6f6a62"
  ash: "#9b968e"
  smoke: "#c3bdb4"
  safe: "#178269"
  warn: "#c47a12"
  over: "#cf3f52"
  safe-text: "#136b57"
  warn-text: "#9c5c08"
  over-text: "#b12e42"
typography:
  display-lg:  {fontFamily: Hanken Grotesk, fontSize: 40px, fontWeight: 500, lineHeight: 1.1, letterSpacing: -0.02em}
  heading-1:   {fontFamily: Hanken Grotesk, fontSize: 26px, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.015em}
  heading-2:   {fontFamily: Hanken Grotesk, fontSize: 20px, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.01em}
  body-md:     {fontFamily: Hanken Grotesk, fontSize: 15px, fontWeight: 400, lineHeight: 1.5}
  body-sm:     {fontFamily: Hanken Grotesk, fontSize: 13px, fontWeight: 400, lineHeight: 1.45}
  caption:     {fontFamily: Hanken Grotesk, fontSize: 12px, fontWeight: 400, lineHeight: 1.35}
  micro:       {fontFamily: Hanken Grotesk, fontSize: 11px, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0.05em}
  figure-xl:   {fontFamily: Hanken Grotesk, fontSize: 40px, fontWeight: 500, lineHeight: 1.05, letterSpacing: -0.01em}
  figure-md:   {fontFamily: Hanken Grotesk, fontSize: 15px, fontWeight: 500, lineHeight: 1.4}
  figure-sm:   {fontFamily: Hanken Grotesk, fontSize: 13px, fontWeight: 500, lineHeight: 1.4}
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 24px
---

# catet — Design System (DESIGN.md)

> Compact personal finance: Wise-like clarity on a warm paper palette. Data
> first, decoration never. Light theme only.

---

## 1. Visual Theme & Atmosphere

catet is a **personal** money tool for one human in Indonesia. The layout logic
is Wise's — dense, trustworthy data sitting directly on the canvas with almost no
card chrome — but the material is warm paper: cream `#f2f1ee` ground, warm
near-black ink `#26231d`, hairline borders as alpha tints of ink. Never pure
white, never clinical black, never a gray constant.

One density: **compact**. Every surface earns its pixels. The overview is not a
marketing hero — it is a working stat strip over a data feed. Ledgers are dense
40px rows. Whitespace is used for grouping, never for atmosphere.

Color is rationed to *meaning only*: teal = safe, amber = thin, crimson = over.
~97% of the interface is achromatic warm grays; when an accent appears it is
information arriving, not branding shouting.

**Why cream is not slop.** The paper-ledger metaphor is the product voice; the palette is defended, not defaulted; every accent is meaning-only. No decorative color effects exist anywhere; the only permitted 'lift' is tonal layering + hairline rings (see §6).

Key characteristics:

- Warm cream canvas `#f2f1ee`; ink `#26231d`; all borders are alpha tints of ink
- **One voice: Hanken Grotesk** for text AND numbers; every amount uses
  `font-variant-numeric: tabular-nums` so figures align in ledgers
- **No monospace anywhere** — mono reads as a developer tool, not a money tool
- Weight ceiling 500 — hierarchy from size × spacing × color, never bold
- Tight geometry: wells 8px, cards 12px cap, pills reserved for primary buttons
- Depth via tonal layering + hairline rings; wide shadows only for floating sheets
- App-like density, **quantified**: page padding ≤24px, section gaps ≤24px, card
  padding 12–16px, ledger rows 36px, rail rows 32px. Modules fill the viewport;
  whitespace groups, it never stretches

## 2. Color Palette & Roles (light only)

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#f2f1ee` | Page background — warm cream |
| `--surface` | `#faf9f6` | Card/container sheet |
| `--surface-100` | `#f7f5f1` | Quietest nested fill |
| `--surface-200` | `#efece7` | Inset fills, input wells |
| `--surface-300` | `#e7e3dc` | Pressed emphasis, segmented tracks |
| `--ink` | `#26231d` | Primary text, primary button fill |
| `--ink-soft` | `#454139` | Secondary text |
| `--muted` | `#6f6a62` | Tertiary text, captions (≥4.5:1 on card surfaces), input/select placeholder text (≥4.5:1) |
| `--ash` | `#9b968e` | **Decorative only** — inactive icons, dots; never label/body text |
| `--smoke` | `#c3bdb4` | Disabled text, decorative only — never placeholder or readable text |
| `--sheet` | `#fffefc` | Floating sheets only (modals, popovers, tooltips) |
| `--safe` | `#178269` | SAFE state — bars, fills, dots, rings only |
| `--safe-wash` | `rgba(23,130,105,0.10)` | Tint backgrounds behind safe signals |
| `--safe-text` | `#136b57` | Safe-state *text* |
| `--warn` | `#c47a12` | THIN state — bars, fills, dots, rings only |
| `--warn-wash` | `rgba(196,122,18,0.12)` | Tint backgrounds behind warn signals |
| `--warn-text` | `#9c5c08` | Thin-state *text* |
| `--over` | `#cf3f52` | OVER/error — bars, fills, dots, rings only |
| `--over-wash` | `rgba(207,63,82,0.10)` | Tint backgrounds behind error |
| `--over-text` | `#b12e42` | Over/error *text* |

### Text-color law (load-bearing)

Raw accent hues (`--safe/--warn/--over`) belong to **bars, fills, dots, rings,
chart strokes**. Any accent shown as *text* — chip labels, delta figures, badge
counts, threshold badges — must use the `-text` variant (≥4.5:1 on every
surface). `--ash` is decoration only; the quietest legal reading color is
`--muted`.

### Border system (alpha tints of ink)

Borders are never gray constants — they are ink at alpha, so they sit on any
surface:

| Token | Value | Use |
|---|---|---|
| `--border` | `rgba(38,35,29,0.10)` | Standard hairline |
| `--border-strong` | `rgba(38,35,29,0.22)` | Hover edges, emphasized sections |
| `--border-solid` | `rgba(38,35,29,0.55)` | Table rules, max contrast |

(CSS fallback: `color-mix(in srgb, var(--ink) 10%, transparent)`.)

### Chart palette

- Base series: `--ink-soft`, `--ash`
- Income series: `--safe`. Expense series: `--over` at 80% opacity — documented
  exception: routine spend renders as a quiet warning so anomaly markers can
  escalate to solid `--over` dots (6px). Transfers excluded from spend math.
- Reference lines: `--safe`, dashed 4-4
- Heatmap ramp: `canvas → surface-300 → warn-wash → warn` (zero = pure canvas)
- Donut slices: warm neutral ladder first (`ink-soft/muted/ash/smoke`), then
  safe, then warn — red only for over-budget (>100%) categories.
- Runway/STS dual-axis: runway y-axis capped at 90 hari; clipped values render ≥90 on the axis and full value in the tooltip.
- Donut: inline labels only ≥1024px; below that label.show: false and a plain-text legend list beneath (caption rows, ≤8px color squares).

## 3. Typography Rules

**One voice.** Hanken Grotesk speaks everything — text and numbers. No serif,
no monospace. Numbers differentiate by *tabular figures and weight*, not by
family.

Absolute rules:

1. Every amount uses `font-variant-numeric: tabular-nums` — right-aligned in
   ledgers, aligned to the decimal, no exceptions (including chart axis ticks).
2. Weights never exceed **500**. Bold is banned; hierarchy is size × spacing ×
   color.
3. Display sizes carry negative tracking; body and below none or slight positive.
4. Money formatting Indonesian style always: `Rp8.003.500`, negative as
   `−Rp685.000` (true minus sign), zero decimals unless cents exist.

### Hierarchy

| Role | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| Display LG | 40px | 500 | 1.1 | −0.02em | Screen titles |
| Heading | 26px | 500 | 1.15 | −0.015em | Section headers |
| Heading SM | 20px | 500 | 1.2 | −0.01em | Card headers |
| Body | 15px | 400 | 1.5 | normal | Default UI text |
| Body SM | 13px | 400 | 1.45 | normal | Dense UI, meta, form labels (500) |
| Caption | 12px | 400 | 1.35 | normal | Timestamps, hints, stat labels |
| Micro-label | 11px | 500 | 1.3 | 0.05em uppercase | Table column heads only |
| Figure XL | 40px | 500 | 1.05 | −0.01em tnum | Safe-to-Spend figure |
| Figure MD | 15px | 500 | 1.4 | tnum | Ledger amounts, stats |
| Figure SM | 13px | 500 | 1.4 | tnum | Compact amounts |

## 4. Component Stylings

Every component implements five states: **Empty · Loading · Success · Filled ·
Error**. Listed as `states:` per component.

### Buttons

**Primary (Ink Fill)** — `--ink` fill, `--canvas` text; radius `pill`; padding
8px 16px; Body SM 500. Hover: fill shifts to `color-mix(in srgb, var(--ink) 92%,
var(--surface) 8%)`. Active: 98% scale. Disabled: `--surface-300` fill, `--smoke`
text. Loading: inline 14px spinner, label dims, width locked.
states: empty n/a · loading spinner-lock-width · success check-icon swap (900ms)
· filled default · error shake-×2 + tooltip.

**Secondary (Outline)** — transparent fill, 1px `--border-strong`, ink text;
hover `--surface-200`.
**Ghost** — no fill/border; ink-soft text; hover `--surface-200`.
**Danger Ghost** — ghost geometry, `--over-text` text, `--over-wash` hover.
Minimum hit area 44×44px on every variant (icon buttons `size-11` = 44px); visual size may be smaller only when an ancestor guarantees ≥44px.
Destructive flows additionally require typed confirmation elsewhere — the button
alone is never the gate.

### Chips & Badges

Category chips: pill, `--surface-200` fill, ink-soft text, 12px, 3px 10px
padding. Status badges swap semantics per the Text-color law: safe/warn/over
**`-text` variants** over matching tint-wash backgrounds. Source chips add a
leading 14px type-glyph (cash/bank/ewallet).
states: filled default · loading skeleton-pill · empty never shown · success
pop-scale on filter apply · error n/a.

### Cards

Background `--surface`, radius **12px**, padding 12–16px, 1px `--border` ring.
Hover (interactive only): ring → `--border-strong`; **no shadow lift**. Prefer
hairline-separated tables on the canvas over cards wherever a list will do.
states: empty → ash glyph + one line + optional action; loading → skeleton
matching final layout; success → 900ms `--safe-wash`; filled default; error →
inline banner strip + retry.

### Source Cards

Action buttons (Ubah / Setor koreksi / Arsipkan) are always visible ghost buttons — never hover-hidden, never opacity-0 reserving dead space. No empty padding zone under the card content.

### Inputs & Forms

Wells: `--surface-200` fill, radius **8px**, 1px transparent border, 10px 12px
padding. Focus: inner `box-shadow: 0 0 0 1px var(--border-strong)` + outer
`0 0 0 3px var(--safe-wash)`. Placeholder `--muted`. Validation error: border
paints `--over`, 12px message below.
- **Amount field**: tabular figures, right-aligned, `Rp` prefix slot.
- **Segmented direction control**: track `--surface-300`, thumb `--surface`
  sheet + hairline ring; selected label 500.
- **Selects**: wells with chevron; selected value never duplicates placeholder.
Empty state shows the placeholder in --muted (never --smoke); the trigger chevron stays --ink-soft at all times so the control never reads as disabled.
- Label convention: sentence-case Body SM 500 above field; caption below in
  `--muted`. Tracked-uppercase Micro-labels only for table column heads.
states: five mandatory, per-field error with contextual copy from the copy deck.

### Redundant-information law (product-wide)

A row never shows the same datum twice as two controls/labels — e.g. needs-review rows show the category correction select OR the category chip, not both.

### Accounts Rail (app shell, desktop)

Fixed left rail 240px, `--canvas` background, right edge 1px `--border`. This is
a **money view**, not a feature list:

1. Wordmark "catet" (Heading SM) at top.
2. Group label "Aset" (Micro-label) → Source rows: 14px type glyph, name (Body
   SM), balance right-aligned in Figure SM tabular — BCA Rp8.420.000 · Cash
   Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000.
3. Group label "Utang" → Debt Source rows in danger-tone balance with a "Debt
   Source" tag — SPayLater −Rp1.240.000 · Kredivo −Rp685.000.
4. Pinned footer: "Total tersedia" Rp9.073.500 · "Utang" Rp1.925.000 in
   `--over-text`, separated by a hairline.
5. Divider, then "Kelola" group (Micro-label) → screen links at 32px height:
   Overview · Transactions · Categories · Bills & Calendar · Budgets ·
   Analytics · Needs-Review · Hold Queue · Settings. Active = `--surface` sheet
   + 1px ring + ink text. Needs-Review / Hold Queue carry pill badges
   (`--over-wash` fill, over-text) hidden when zero.

Mobile (<768px): bottom navigation — Overview · Transactions · Add (center FAB)
· Analytics · More.
states: filled default · empty = zero badges hidden · loading n/a · error
session-expired strip at rail bottom.

### Stat Strip (overview hero)

A compact horizontal band, **not a card**: sentence-case caption label
"Safe-to-Spend" above the figure `Rp8.003.500` in Figure XL (`--safe-text` when
healthy, `--warn-text` thin, `--over-text` negative). To its right, inline
caption-size stats: Runway 34 hari · Jatah harian Rp266.800 / hari ·
Tereservasi besok Rp1.070.000. Hairline `--border` rule underneath.
states: empty = zero-Sources links onboarding; loading skeleton lines at final
heights; success n/a (live); filled default; error last-known value + muted
stale caption.

### Quick-Actions Grid (overview)

Six icon tiles in one row (6-up desktop, 3×2 mobile): Tambah · Transfer · Bayar
tagihan · Perbaiki kategori · Rekap mingguan · Lihat semua. Tile = 48px glyph in
a `--surface-200` square (radius 12px) + caption label beneath; hover ring
`--border-strong`; the whole tile is one ≥44px hit target. These are catet-domain
actions (logging/transfers/reviews), never payment rails.
states: loading skeleton tiles · filled default · empty n/a (static affordances)
· error n/a.

### Ledger Row (transaction)

Height **36px**, grid: [status dot 8px] [merchant + timestamp stack] [category
chip] [source chip] [signed Figure MD right-aligned]. Separators 1px `--border`
between rows only — never boxed cards. Needs-review dot `--warn`; clean `--ash`
40%; reversed = strike-through + linked-reversal chip. Trailing actions (edit, reverse, delete): ≥1024px — reveal on row hover/focus-within, size-11 (44px) ghost icon buttons, each aria-label="Ubah {merchant}". <1024px — always visible, same 44px buttons, row grows to 48px, and the row itself is a tap target that opens the edit sheet (buttons stopPropagation); this is the fold-in-detail mechanism for hidden chips.
states: empty screen-level ("Belum ada transaksi…"); loading shimmer ×8
preserving columns; success 900ms safe-wash; filled; error per-action toast.

### Progress Bars (budgets)

Track 6px `--surface-300` radius-full; fill `--safe` <80%, `--warn` 80–99%,
`--over` ≥100%. Spent÷limit as Figure SM pair beside it; threshold badge
("80%", "100%") badge-chip, dashboard-only.
states: filled default · loading skeleton track · empty not rendered · error n/a.

### Modals, Drawers, Popovers

`--sheet` background, radius **16px**. Scrimmed floaters (modals, drawers):
shadow-only — no ring behind a scrim. Unscrimmed floaters (popovers, tooltips):
1px `--border` ring + half-strength shadow. Scrim `rgba(28,25,19,0.32)`. Drawer
slides 240ms cubic-bezier(0.2, 0.8, 0.2, 1).
states: filled default · loading skeleton inside sheet · success auto-close with
safe-wash flash · error inline block (never self-closes).

### Toasts

Bottom-right floating sheet, radius 12px, 1px `--border` ring + half-strength
shadow, auto-dismiss 4s, one visible at a time.
states: neutral · success check-glyph + safe edge · error over-tone + retry
link (does not auto-dismiss).

### Empty-state pattern (product-wide)

No illustrations. Layout = 32px ash glyph → heading-sm copy → one caption →
optional ghost action. Copy deck supplies exact strings.

### Skeleton rule

Skeletons reproduce final geometry exactly (heights, radii, gaps) in
`--surface-200`, left-to-right `--surface-100` shimmer, 1.4s loop. implementation: catet-shimmer keyframes (translateX −100%→100% over a --surface-100 gradient on --surface-200), never animate-pulse. Spinners only
inside buttons.

### Charts (ECharts conventions)

Gridlines: 1px dashed `--border`, horizontal only. Axis labels: caption size,
`--muted`; currency ticks in tabular figures (same sans voice). Tooltip:
floating sheet card, ring + half shadow, title Body SM 500 + label:value rows
with values tabular-aligned. Reference line `--safe` dashed. Anomaly markers:
`--over` 6px dots. Heatmap cell radius 4px, gap 3px. Legends are plain text
rows, never color boxes larger than 8px; never default ECharts color chips.

## 5. Layout Principles

Base unit **4px**; ladder 8·12·16·20·24·32. The largest standard gap is
`section` at **24px** — density is quantified, not vibes.

Desktop app shell: fixed 240px accounts rail + fluid main, content max-width
1160px, 24px gutters. One compact rhythm governs all screens:

- Stat strip + quick-actions grid at top (Overview), then content flows
  directly — sections separated by at most 24px.
- Ledger screens: sticky toolbar under a 56px header; day-sticky headers
  (opaque tonal `--canvas` background); rows touch via separators (0 internal gaps).
- Section separation: `section` (24px) max; related items group at `md`–`xl`.
- Settings: grid gap-6 lg:grid-cols-2, final odd card lg:col-span-2 — no left-hung single column on wide viewports.

Density is the default; generosity is earned only where a decision needs it.

## 6. Depth & Elevation

Hierarchy = tonal layering + hairline rings. Shadows are scarce.

| Level | Treatment | Use |
|---|---|---|
| 0 Flat | none | page, text |
| 1 Ring | `0 0 0 1px var(--border)` | cards, inputs resting |
| 2 Hover | `0 2px 8px rgba(28,25,19,0.05)` | interactive card hover |
| 3 Floating (scrimmed) | shadow only — **no ring**: `0 12px 32px rgba(28,25,19,0.14), 0 2px 8px rgba(28,25,19,0.06)` | modals, drawers |
| 3·f Floater (unscrimmed) | ring + Level 3 shadow at half blur | popovers, tooltips, toasts |
| Focus | `0 0 0 3px var(--safe-wash)` + inner border-strong | keyboard focus |

Edge/elevation law: a surface commits to one depth signal — ring *or* wide
shadow, never both at full strength. Rings describe docked structure; shadows
describe lift.

## 7. Interaction & Motion

Grammar, not decoration:

| Interaction | Spec |
|---|---|
| Color/hover transitions | 150ms ease |
| Elevation changes | 200ms ease-out |
| Modal enter | 240ms cubic-bezier(0.2, 0.8, 0.2, 1); exit 160ms |
| Success flash | background → wash 120ms, hold 700ms, decay 500ms |
| Action reveal (ledger) | opacity + translateX(4px), 120ms |
| Filter chip apply | scale 0.96→1 ease-out-expo, 180ms (no overshoot) |
| Skeleton shimmer | 1.4s linear infinite |

Focus is always visible (3px safe-wash ring). Honor `prefers-reduced-motion`:
kill shimmer, scale pops, slide-ins; keep opacity fades ≤120ms. Nothing bounces
twice; success is a single wash.

global @media (prefers-reduced-motion: reduce) kill-switch (animations/transitions ≈0.01ms, scroll-behavior: auto) lives in globals.css.

## 8. Responsive Behavior

| Breakpoint | Shell change |
|---|---|
| ≥1280px | Full: 240px rail, 1160px content max, 32px gutters |
| 1024–1279px | Identical; grid columns compress with 24px gutters |
| 768–1023px | Rail collapses to 72px icon strip with tooltips; grids stack |
| <768px | Bottom nav (Overview · Transactions · Add-FAB · Analytics · More); 16px gutters; day headers sticky pills |

Bottom nav pads env(safe-area-inset-bottom). Mobile toolbar: filters wrap 2-up (grid-cols-2), the last odd item spans both columns — never an orphan cell.

Touch targets ≥44px everywhere; row actions persistent under 1024px and
keyboard-reachable always. Ledger rows grow to 48px below 1024px. Figure XL
scales 40→32→28px. Tables fold hidden columns into an expandable row-detail
drawer (never horizontal scroll). Modals become full-height bottom sheets. The
heatmap swaps year-grid for a trailing-90-day strip.

## 9. Do's and Don'ts

Do: cream canvas always · alpha-ink borders · semantic-only color · accent text
only via `-text` variants · tabular figures for every rupiah (single sans voice,
never monospace) · hairline tables on canvas over card chrome · tight geometry
(8/12/16 radii, pills only for primary buttons) · skeletons matching final
geometry · compact over spacious.
Don't: pure white/black surfaces · bold ≥600 · gray constant borders · decorative
gradients/glows · colored decoration without meaning · raw accents as reading
text · ash for readable text · monospace anywhere · uppercase eyebrows above the
hero figure · illustration-heavy empties · push-style banners · emoji in UI ·
horizontal-scrolling data tables · hover-only affordances · oversized hero
marketing layouts.

Anti-slop bans: no gradient text or decorative gradient fills of any kind (the functional skeleton shimmer in §4 is the sole permitted gradient) · no backdrop-blur/glass · no radial halos or soft spotlights · no icon-tiles-above-caption outside the quick-actions domain case · no label-above-heading eyebrows · no control text below 12px, no readable text below 13px · no duplicate presentation of one datum · no bounce/wiggle attention animations · no full-strength hairline+wide-shadow pairs (the §6 half-strength floater treatment remains permitted).
cream base is a defended product choice (§1) — detector flags are answered with an ignore + reason, not by palette drift.

## 10. Agent Prompt Guide

Never place raw hex/fonts/radii inside a generation prompt when this design
system is attached — refer semantically ("positive accent", "warning tone",
"sheet surface"). Stitch generation prompts never mention token names, hex, fonts, or radii — semantics only; DESIGN.md is uploaded as the project design system instead. On-screen copy is Indonesian-first. Entity language law:
**Source** (never account/wallet/vault). All money uses tabular figures in the
single sans voice.

### Quick reference (semantic)

- Page = cream canvas · card = surface sheet · structure = hairline ink ring
- Positive/safe = `--safe` (text `--safe-text`) · thin = `--warn` (text
  `--warn-text`) · over/error = `--over` (text `--over-text`)
- Text steps: ink → ink-soft → muted → ash
- One voice: Hanken Grotesk; numbers = tabular figures (never monospace);
  weights ≤500

### Example component prompts

1. "Stat strip on the Overview: sentence-case caption label 'Safe-to-Spend', the
   figure `Rp8.003.500` at Figure XL in the safe-text variant (negativity as
   `−Rp…`), with inline caption stats to the right — Runway 34 hari · Jatah
   harian Rp266.800 / hari · Tereservasi besok Rp1.070.000 — and a hairline rule
   underneath. No card, no hero whitespace."
2. "Ledger row: 40px tall, 8px status dot, merchant 'Kopi Kenangan' with caption
   timestamp 'Hari ini · 08.14', category chip 'Makanan & Minuman', source chip
   'Cash', right-aligned signed amount `−Rp25.000` in tabular figures; 1px
   hairline separator below; three ghost icon actions with accessible names on
   hover or keyboard focus."
3. "Accounts rail: wordmark 'catet', group 'Aset' listing Source rows with type
   glyph, name, right-aligned balance (BCA Rp8.420.000 · Cash Rp340.000 · GoPay
   Rp215.500 · ShopeePay Rp98.000), group 'Utang' with danger-tone balances
   (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer 'Total tersedia
   Rp9.073.500 · Utang Rp1.925.000', then a 'Kelola' group of screen links with
   count badges on Needs-Review and Hold Queue."
4. "Budget row: heading-sm category 'Makanan & Minuman', spent ÷ limit
   `Rp1.284.000 / Rp1.500.000`, 6px progress bar at 86% warning tone with an
   '80%' threshold badge in warning-text variant."
5. "Empty transactions panel: centered ash glyph, heading 'Belum ada transaksi',
   caption 'Mulai catet lewat WhatsApp.', ghost button 'Buka panduan'."
6. "Confirmation dialog for delete: sheet-radius modal, heading 'Hapus \"Kopi
   Kenangan 25.000\"?', caption explaining 30-day restore window, ghost 'Batal'
   + danger-ghost 'Hapus'; typed confirmation lives elsewhere in the flow."
7. "Quick-actions grid under the stat strip: six tiles in one row — Tambah ·
   Transfer · Bayar tagihan · Perbaiki kategori · Rekap mingguan · Lihat semua —
   each a 48px glyph in a 12px-radius surface tile with a caption label beneath."

## 11. Implementation Foundation (build-time mapping)

> Stitch project `catet — Paper Editorial v2` (id `projects/8388192028915929441`) retains the prior blue/Inter “Modern Professional” system. The raw Overview reference archived in `.stitch/designs/overview-raw.*` is exploratory evidence only; this repository's Paper Ledger v2 remains the implementation authority because the Stitch system refresh was intentionally skipped.

The Next.js frontend adopts **shadcn/ui ("new-york") + Tremor data blocks** as
its component foundation. Generator prompts never mention these names; this
section binds our tokens to the codebase so design and build never fork:

| Paper Ledger token | shadcn variable |
|---|---|
| `--canvas` | `--background` |
| `--surface` | `--card` |
| `--ink` | `--foreground` + `--primary` (ink-fill buttons) |
| `--ink-soft` / `--muted` | `--accent-foreground` / `--muted-foreground` |
| `--surface-200` | `--secondary` / `--muted` |
| `--muted` | placeholder color |
| `--over` | `--destructive` |
| radii 8 / 12 / 16 | `--radius` + derived `sm / md / lg` |
| Hanken Grotesk | `--font-sans` |

Adaptation laws: shadcn default zinc borders → **alpha-ink borders**; neutral
gray text → warm ink ladder; the semantic `-text` variant law overlays all
Tailwind color classes; charts remain **ECharts** per AGENTS.md (not Recharts).
