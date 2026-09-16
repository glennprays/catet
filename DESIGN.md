---
version: 5
name: Ledger Blue — Wallet
description: "Dense personal-finance dashboard for one user — one hero figure per screen over 36px list rows: borderless white cards on one soft shadow over a cool-gray canvas #f2f4f7, chrome (rail, page header, filter bar, day dividers, bottom nav) ruled with hairlines, secondary figures demoted into tinted wells, an 8-hue identity palette that names accounts and categories (every Source is a solid-hue wallet card, debt is the ink card) while green/amber/red stay the only status colours, Coinbase blue #0052ff reserved for interactive surfaces plus exactly one chart series (the Safe-to-Spend sparkline), single Inter voice with tabular figures (no monospace), light-only; anti-slop: no gradients, glass, glow, decorative shadow stacking, or equal-weight KPI card rows; see §1"
colors:
  canvas: "#f2f4f7"
  surface: "#ffffff"
  surface-100: "#f5f7fa"
  surface-200: "#eef0f3"
  surface-300: "#e2e5ea"
  ink: "#050f1a"
  ink-soft: "#374151"
  muted: "#5b616e"
  ash: "#646b78"
  smoke: "#d1d5db"
  primary: "#0052ff"
  primary-hover: "#003ecb"
  primary-wash: "#ebf1ff"
  safe: "#05b169"
  warn: "#f0ad4e"
  over: "#df2935"
  safe-text: "#047a49"
  warn-text: "#9a5b00"
  over-text: "#b71f2a"
  hue-blue: "#0052ff"
  hue-blue-wash: "#ebf1ff"
  hue-indigo: "#4f46e5"
  hue-indigo-wash: "#eef0fe"
  hue-violet: "#7c3aed"
  hue-violet-wash: "#f3eefe"
  hue-teal: "#0f766e"
  hue-teal-wash: "#e6f5f3"
  hue-green: "#047857"
  hue-green-wash: "#e6f4ee"
  hue-amber: "#a84b06"
  hue-amber-wash: "#fdf3e8"
  hue-rose: "#be123c"
  hue-rose-wash: "#fdeaee"
  hue-sky: "#0369a1"
  hue-sky-wash: "#e6f2fa"
  hue-ink: "#111827"
typography:
  hero-figure: {fontFamily: Inter, fontSize: 32px, fontWeight: 600, lineHeight: 1.0, letterSpacing: -0.02em}
  figure-lg:   {fontFamily: Inter, fontSize: 18px, fontWeight: 600, lineHeight: 1.0, letterSpacing: -0.01em}
  page-title:  {fontFamily: Inter, fontSize: 16px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.01em}
  figure-md:   {fontFamily: Inter, fontSize: 14px, fontWeight: 500, lineHeight: 1.3}
  section-title: {fontFamily: Inter, fontSize: 13px, fontWeight: 600, lineHeight: 1.3}
  row-title:   {fontFamily: Inter, fontSize: 13px, fontWeight: 500, lineHeight: 1.35}
  body:        {fontFamily: Inter, fontSize: 13px, fontWeight: 400, lineHeight: 1.45}
  meta:        {fontFamily: Inter, fontSize: 12px, fontWeight: 400, lineHeight: 1.35}
  label:       {fontFamily: Inter, fontSize: 11px, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0.06em}
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  section: 12px
---

# catet — Design System (DESIGN.md)

> Dense personal finance: one hero figure per screen, everything else a 36px
> row. Data first, decoration never. Light theme only.

---

## 1. Visual Theme & Atmosphere

catet is a **personal** money tool for one human in Indonesia. The layout logic
is a dense financial workspace — a hero number, then rows — and the material is
the Crypto Blue palette: cool-gray canvas `#f2f4f7`, white `#ffffff` cards on
one soft shadow, near-black ink `#050f1a`, hairline gray rules on chrome.

**Blue is interactive only.** `#0052ff` paints primary buttons, links, the
active rail row, focus rings, the switch track, the wordmark — and exactly one
data series in the whole product, the Safe-to-Spend sparkline inside the
Balance Hero (§2 "Chart palette"). It never paints a figure, a status, or a
decoration. A number is never blue — money state is green/amber/red, or it is
ink.

### The five density laws (v4, edges revised in v5)

1. **One hero number per screen.** Safe-to-Spend at 32px on Overview; nothing
   else on any screen exceeds 18px. Four equal 32px figures is four heroes,
   which is none — the previous version's KPI row is deleted, not restyled.
2. **Secondary figures live in wells.** Derived context (Runway, Jatah harian,
   Tereservasi besok, Kebutuhan · Gaya hidup) sits in one `--surface-100` well
   under the hero as 11px-label/14px-figure `Metric` pairs, never as peer cards.
3. **Cards are for concepts, not for values.** A card wraps a *list* or a
   *module* (Akun, Arus kas, Mendatang, Aktivitas terakhir). A single number
   never earns a border.
4. **Cards float, chrome is ruled.** Cards have no border — one soft shadow
   (`--shadow-card`) on a cool canvas does the separating; hairlines remain for
   row dividers and chrome rules (rail edge, page header, bottom nav, day
   dividers), and `--border-strong` stays on controls and floaters.
5. **Chrome lives on the canvas.** The 48px page header, the filter toolbar and
   the sticky day dividers are `--canvas` with a hairline under them — never a
   second white slab stacked on the card stack. Chrome costs 48px, not 100px.

Color is rationed by *job*: green = safe, amber = thin, red = over — and the
`--hue-*` family (§2) names *which* account or category a row belongs to.
Status colours never identify an account; hues never report a state. Outside
those two jobs and `--primary` the interface is achromatic gray: when an accent
appears it is information arriving, not branding shouting.

Key characteristics:

- Cool-gray canvas `#f2f4f7`; borderless white cards on `--shadow-card`; ink
  `#050f1a`; hairlines only on chrome and row dividers
- **One voice: Inter** for text AND numbers; every amount uses
  `font-variant-numeric: tabular-nums` so figures align in ledgers
- **No monospace anywhere** — Crypto Blue asks for JetBrains Mono on money; we
  decline. Mono reads as a developer tool, and Inter ships true tabular
  figures, so alignment costs no second family
- Weight ceiling 600 — hierarchy from size × spacing × color; 700 appears only
  in the wordmark (§4 Brand)
- Tight geometry: 6px chips/badges/menu items, 8px wells, tiles, buttons,
  inputs and controls, 12px cards and dialogs; no pills except dots, progress
  tracks, switches, FAB
- One shadow per card, never two: `--shadow-card` is ambient (L1),
  `--shadow-pop` is a menu/popover, `--shadow-float` is a dialog/sheet. No
  decorative shadow in a table, no shadow on chrome
- App-like density, **quantified**: rail 224px, page header 48px, content
  max-width 1600px, card gap 10px, card body padding 12px (`compact`) / 14px
  (`comfortable`), list rows 36px desktop / 44px touch, bill rows 40px, source
  cards 56px (row) / 112px (tile), rail nav rows 32px. Modules fill their grid
  cell; whitespace groups, it never stretches

## 2. Color Palette & Roles (light only)

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#f2f4f7` | Page background, page header, filter toolbar, sticky day dividers |
| `--surface` | `#ffffff` | Cards, rail, bottom nav, popovers, menus, sheets, toasts |
| `--surface-100` | `#f5f7fa` | **Wells** (L1-inset), row hover inside white cards |
| `--surface-200` | `#eef0f3` | Icon tiles, neutral chip fill, segmented track, skeleton, ghost hover |
| `--surface-300` | `#e2e5ea` | Progress/allocation track, pressed emphasis |
| `--ink` | `#050f1a` | Primary text |
| `--ink-soft` | `#374151` | Secondary text |
| `--muted` | `#5b616e` | Tertiary text, captions, placeholders (6.21:1 on white) |
| `--ash` | `#646b78` | Meta text, 11px micro-labels, inactive icons (5.36:1 white, 4.87:1 canvas) |
| `--smoke` | `#d1d5db` | Disabled decoration only — never placeholder or readable text |
| `--primary` | `#0052ff` | **Interactive only** — primary fill, links, active nav, focus |
| `--primary-hover` | `#003ecb` | Primary button hover |
| `--primary-wash` | `#ebf1ff` | Active nav row tint (blue text on it: 5.08:1) |
| `--safe` | `#05b169` | SAFE state — bars, fills, dots, rings only |
| `--safe-wash` | `#e6f7f0` | Tint backgrounds behind safe signals |
| `--safe-text` | `#047a49` | Safe-state *text* (5.41:1 white, 4.87:1 on wash) |
| `--warn` | `#f0ad4e` | THIN state — bars, fills, dots, rings only (1.95:1 — never text) |
| `--warn-wash` | `#fdf5ea` | Tint backgrounds behind warn signals |
| `--warn-text` | `#9a5b00` | Thin-state *text* (5.43:1 white, 5.02:1 on wash) |
| `--over` | `#df2935` | OVER/error — bars, fills, dots, rings only |
| `--over-wash` | `#fceaeb` | Tint backgrounds behind error |
| `--over-text` | `#b71f2a` | Over/error *text* (6.48:1 white, 5.58:1 on wash) |

### Hue palette (identity, not status)

Eight identity hues plus ink. A hue answers **which** account or category a
thing belongs to; `--safe/--warn/--over` answer **how it is doing**. A hue
never carries status, and a status colour never identifies an account. Hues are
assigned deterministically from the entity id (`src/lib/hue.ts`, djb2 over the
uuid) so a source or category keeps its colour across list order and reloads;
a debt source is always the ink card, because a liability is not an identity
colour.

| Token | Solid | Wash | White on solid | Solid on wash |
|---|---|---|---|---|
| `--hue-blue` | `#0052ff` | `#ebf1ff` | 5.75:1 | 5.08:1 |
| `--hue-indigo` | `#4f46e5` | `#eef0fe` | 6.29:1 | 5.55:1 |
| `--hue-violet` | `#7c3aed` | `#f3eefe` | 5.70:1 | 5.01:1 |
| `--hue-teal` | `#0f766e` | `#e6f5f3` | 5.47:1 | 4.88:1 |
| `--hue-green` | `#047857` | `#e6f4ee` | 5.48:1 | 4.84:1 |
| `--hue-amber` | `#a84b06` | `#fdf3e8` | 5.72:1 | 5.22:1 |
| `--hue-rose` | `#be123c` | `#fdeaee` | 6.29:1 | 5.44:1 |
| `--hue-sky` | `#0369a1` | `#e6f2fa` | 5.93:1 | 5.21:1 |
| `--hue-ink` | `#111827` | `--surface-200` | 17.74:1 | 15.54:1 |

Two uses only: a **solid** hue card (`SourceCard`, §4) carrying white text, and
a **wash** icon tile carrying the saturated glyph (`IconTile tone={hue}`).
Hues never enter a chart — the chart palette below is unchanged — and they
never paint text on a white surface.

On a solid hue, **white text is never quieter than `white/90`**: the ramp is
opaque white for figures and `white/90` for the 11px label (4.75:1 at worst,
on `--hue-teal`). `white/70` reads at 3.5:1 on `--hue-green` and is illegal
under the text law below; sub-90% white survives only on non-text — the
`white/80` glyph (4.1:1, clears the 3:1 non-text floor) and the `white/25`
allocation track.

### Text-color law (load-bearing)

Raw accent hues (`--safe/--warn/--over`) belong to **bars, fills, dots, rings,
chart strokes**. Any accent shown as *text* — chip labels, delta figures, badge
counts, threshold badges — must use the `-text` variant (≥4.5:1 on every
surface). Crypto Blue's `#f0ad4e` is 1.95:1 on white; it is a fill, never a
word.

v4 raised `--ash` from `#8a919e` (3.17:1 — illegal as text) to a legal value
because the dense type scale spends `--ash` on meta and every 11px micro-label;
v5 re-darkened it to `#646b78` for the cooler canvas. `--ash` is the quietest
**legal** reading colour; `--smoke` `#d1d5db` stays decoration only. Nothing
readable is lighter than `--ash`, and `--ash` on `--surface-200` (4.70:1) is
legal but reserved — text on an icon tile is still `--ink-soft`, a `-text`
variant, or (on a solid hue) white.

### Border system (two solid tiers)

Borders are solid grays from the Tailwind gray scale. v5 narrows where they
appear at all: a *card* has no border (it floats on `--shadow-card`), so the
hairline is now the language of **chrome and dividers**, and the strong tier
stays on controls and floaters.

| Token | Value | Use |
|---|---|---|
| `--border` | `#e5e7eb` | Row dividers, card header rule, rail edge, page-header/bottom-nav/day-divider rules |
| `--border-strong` | `#d1d5db` | Controls (input, select, secondary button) and L2/L3 floaters (menu, popover, sheet, dialog, toast) |

A card **never** uses a border at all; chrome **never** uses
`--border-strong`; a floating menu **never** uses `--border`.

### Chart palette

**`--primary` is a series colour exactly once in the product**: the
Safe-to-Spend `Sparkline` inside `BalanceHero`, where the line *is* the brand's
one number and there is no second series to confuse it with. Every other chart
is neutral/semantic and never blue.

- Base series: `--ink-soft`, `--muted`, `--ash`
- Income series: `--safe`. Expense series: `--over` at 80% opacity — documented
  exception: routine spend renders as a quiet warning so anomaly markers can
  escalate to solid `--over` dots (6px). Transfers excluded from spend math.
- Cash-flow bars (Overview): `--safe` in, `--over` out, 8px bars, 2px top radius
- Reference lines: `--safe`, dashed 4-4
- Heatmap ramp: `canvas → surface-300 → warn-wash → warn` (zero = pure canvas)
- Donut slices: neutral ladder first (`ink-soft/muted/ash/smoke`), then safe,
  then warn — red only for over-budget (>100%) categories.
- Allocation bars (Sources): a neutral ink ramp `#050f1a · #374151 · #8a919e ·
  #d1d5db`, never a semantic hue — a proportion is not a status.
- Flat fills only: no gradient area fills, no glow. The sparkline's
  `--primary` → transparent area wash is the one functional exception.
- Runway/STS dual-axis: runway y-axis capped at 90 hari; clipped values render ≥90 on the axis and full value in the tooltip.
- Donut: inline labels only ≥1024px; below that label.show: false and a plain-text legend list beneath (caption rows, ≤8px color squares).

## 3. Typography Rules

**One voice.** Inter speaks everything — text and numbers. No serif, no
monospace. Numbers differentiate by *tabular figures and weight*, not by family.

Absolute rules:

1. Every amount uses `font-variant-numeric: tabular-nums` — right-aligned in
   ledgers, no exceptions (including chart axis ticks).
2. Weights never exceed **600**. 600 is for the hero figure, page titles, card
   titles and `Metric` figures; 500 for row titles, micro-labels and ledger
   amounts; 400 for body and meta. 700 is banned outside the wordmark (§4 Brand).
3. The hero figure carries −0.02em tracking and 16–18px steps carry −0.01em;
   13px and below carry none. Micro-labels carry +0.06em and are uppercase.
4. Money formatting Indonesian style always: `Rp8.003.500`, negative as
   `−Rp685.000` (true minus sign), zero decimals unless cents exist.

### Hierarchy

Eight steps, and only eight. The gap between the 32px hero and the 13px rows
*is* the hierarchy; anything that needs a ninth step is a layout problem.

Every step is a token (`--text-*` in `globals.css`, utility `text-<name>`), and
below 640px the tokens are redefined once, in one `:root` block — so the phone
scale is +2 steps everywhere without a single `sm:` class at a call site. Never
write a px font-size literal; use the utility.

| Role | Utility | Desktop | Phone (<640px) | Tracking | Where |
|---|---|---|---|---|---|
| Hero figure | `text-hero` | 32/600 | 32/600 | −0.02em tnum | `BalanceHero` Safe-to-Spend **only** |
| Figure LG | `text-figure-lg` | 18/600 | 20/600 | −0.01em tnum | net position, group totals, sheet titles |
| Page title | `text-title` | 16/600 | 18/600 | −0.01em | `PageHeader` |
| Figure MD / row amount | `text-figure-md` | 14/500 | 16/500 | tnum | ledger amounts, account balances, `Metric` figures (600) |
| Section title · row title · body | `text-body` | 13 | 15 | normal | card headers, merchant, bill name, body copy |
| Meta | `text-meta` | 12/400 `--ash` | 13/400 | normal | time, notes, captions, bottom-nav labels |
| Label | `text-label` | 11/500 uppercase `--ash` | 12/500 | +0.06em | column heads, `Metric` labels, `GroupLabel`, badges |
| Control text | `text-control` | 13 | 16 | normal | buttons, inputs, textareas, select triggers and items |
| Amount input | `text-amount` · `text-amount-lg` | 15 · 20 | 17 · 24 | tnum | `AmountInput`, empty-state headings |

The hero does **not** drop to 28px on phones: it is the one figure the screen
exists to show, and 32px still fits 360px.

`text-control: 16px` below 640px is load-bearing, not taste: iOS zooms the
viewport when a focused field is under 16px. The viewport therefore never sets
`maximumScale` — pinch-zoom stays available, focus-zoom is prevented by size.

10px appears twice and only as decoration inside a tile or under a chart (the
bill date tile's month abbreviation in `--ink-soft`, the sparkline's end-date
pair). No control text below 11px; no sentence below 12px.

## 4. Component Stylings

Every component implements five states: **Empty · Loading · Success · Filled ·
Error**. Listed as `states:` per component.

### Component vocabulary (product layer, `src/components/*`)

Screens compose these; they never hand-roll an equivalent. A second
convention beside one of these is a bug.

| Component | Owns |
|---|---|
| `Panel` | the one boxed surface (`compact` 12px, `comfortable` 14px, `list` flush rows + 40px ruled header with an inline caption) |
| `BalanceHero` | the single 32px figure, its inputs sub-line, its four-`Metric` well and its 30-day sparkline |
| `Well` · `Metric` · `IconTile` | the tinted recess, the label/figure pair inside it, the tinted leading glyph (status or identity-hue tones) |
| `SourceCard` · `CategoryTile` | one account as a solid-hue wallet card (`row` in Overview's Akun module, `tile` on Sources); one category as a hue-washed glyph tile |
| `SectionHeader` · `GroupLabel` | section titles and group/day labels |
| `MoneyText` | every rupiah figure, tone and tabular figures included |
| `FormField` · `AmountInput` · `SwitchRow` | labelled controls; `htmlFor` mandatory |
| `ResponsiveSheet` | every form and detail view (right sheet ≥640px, bottom sheet below) |
| `ConfirmDialog` | the whole destructive ladder, typed gate included |
| `ListRow` · `LedgerHead` · `LedgerRow` | rows and their column header |
| `RowMenu` · `RowActions` | rare/destructive row actions behind `⋯`; the inline cluster survives **only** where acting is the point of the row (Inbox) |
| `UpcomingBillRow` · `BudgetProgressRow` · `BillAmount` | one bill, one budget as a row; a bill's amount or min–max range |
| `AttentionList` · `CashflowCard` | the risk-ordered "what needs me" list; money in vs out over 30 days |
| `StatusBadge` · `SourceChip` | exceptional state; a source inside the detail sheet |
| `Sparkline` | the one blue series; axis-less direction beside a hero figure |
| `QueryBoundary` · `ChartFrame` | the five states of any query-backed surface |
| `SegmentedControl` · `FilterBar` | range/segment choice and sticky toolbars |
| `PrivacyToggle` | the one privacy control; every `PageHeader` renders it (§4 Privacy mode) |

### Truthfulness law (branch order, product-wide)

Every query-backed surface branches in exactly this order:

1. `isPending` → skeleton in the **final geometry** (row heights, column bars).
2. `isError` → `QueryErrorState` with a retry that refetches.
3. empty → `EmptyState` (a real sentence, not a blank box).
4. data → data.

Never render `0`, an em dash, or a default where the value is unknown. A failed
fetch is never drawn as "you have nothing".

### Buttons

**Primary (Blue Fill)** — `--primary` fill, white text; radius **8px**; height
**32px at ≥640px, 44px below** (`lg` 40px desktop / 44px phone, `sm` 28px),
padding 12px. Hover `--primary-hover`. Active: 98% scale. Disabled: 40%
opacity. Loading: inline 14px spinner, label dims, width locked.
states: empty n/a · loading spinner-lock-width · success check-icon swap (900ms)
· filled default · error shake-×2 + tooltip.

**Secondary (Outline)** — white fill, 1px `--border-strong`, ink text; hover
`--surface-100`.
**Ghost** — no fill/border; ink-soft text; hover `--surface-200`. Ghost stays
neutral: icon-only ghosts in blue would make every chevron shout.
**Danger Ghost** — ghost geometry, `--over-text` text, `--over-wash` hover.
Compact sizes (`sm`, `icon-sm`) stay visually compact at 28px and restore reach
with a transparent hit-area expander (`before:absolute before:inset-[-8px]` →
44px) — never with a `min-height` that would make every dense row 44px tall.
`Switch` and `Checkbox` carry the same invisible 44px hit box below 640px, and
so does a bare text link that acts as a row action. Density above 640px is
untouched by any of this.

### Action hierarchy law (load-bearing)

Exactly one **primary** button per screen — the capture action (Tambah).
**Secondary** (white, `--border-strong`) carries the peer action beside it
(Transfer, Lihat kalender). **Inline ghost clusters** survive only where acting
*is* the point of the row: the Inbox's Benar / Konfirmasi / Buang. Every other
per-row action — Ubah, Koreksi saldo, Arsipkan, Hapus, Nonaktifkan, Sub — lives
in a `RowMenu`: one `⋯` icon-button, `aria-label="Aksi {name}"`, menu items at
13px/32px, destructive items last, below a `--border` rule, in `--over-text`.
Three equal-weight text buttons on every row is a bug: it makes `Arsipkan` in
red the loudest thing on a page about money. Card-level "see all" links are
12/500 `--primary` with a trailing 12px arrow.
Destructive flows additionally require typed confirmation elsewhere — the button
alone is never the gate.

### Chips & Badges

Radius **6px**. Category/source chips: `--surface-200` fill, ink-soft text,
12px, 2px 8px padding; source chips add a leading 14px type-glyph
(cash/bank/ewallet). Status badges swap semantics per the Text-color law:
safe/warn/over **`-text` variants** over matching wash backgrounds; neutral uses
`--surface-200` + ink-soft.
states: filled default · loading skeleton-pill · empty never shown · success
pop-scale on filter apply · error n/a.

### Brand

**Mark** — a 24px tile, radius 6, filled `--hue-ink` `#111827`, holding a stack
of three offset cards, each 7.5px tall with radius 2: amber `#f59e0b` at
`x6 y5 w12`, teal `#14b8a6` at `x5 y8.75 w14`, and the front card in
`--primary` `#0052ff` at `x4 y12.5 w16` with one white stripe
(`M7 16.25h4`, stroke 1.5, round caps). The meaning is three cards in a
wallet — bank, e-wallet, paylater — everything in one place. The front card is
brand blue; the stack behind it is the only place amber and teal appear as
decoration in the whole product, and they appear at 24px, nowhere else.

**Wordmark** — `catet` in **Bricolage Grotesque 700**, lowercase, −0.03em,
`--ink`; 16px beside a 24px mark in the rail, 24px beside a 32px mark on
`/login`. All colour lives in the tile, so the lockup carries the palette in
one 24px square and the word stays ink.

Laws: the wordmark **never appears without the mark**; the mark alone is the
favicon (`src/app/icon.svg`, literal hexes — a favicon cannot read CSS tokens,
so the mark uses no `currentColor`); the lockup appears in the rail (linked to
Overview), above the `/login` form, and in the landing page's nav and footer
(§5). 700 appears nowhere else — the brand face is the one exception to §3 rule
2, and it is the only non-Inter family in the product.

states: filled default; no loading, empty or error variants — the brand never
depends on data.

### Cards

Background `--surface` (white), radius **12px**, **no border**, and exactly one
ambient shadow `--shadow-card`. Body padding 12px (`compact`) or 14px
(`comfortable`), or `density="list"` (padding 0) when the card holds rows: the
header becomes a 40px ruled bar (`h-10 px-4`, 1px `--border` below) and rows
run flush to the card edge with 16px inner gutters. The shadow is the card's
only edge — adding a border back doubles the edge and flattens §6.

A card header is **one line**: 13/600 title with the caption inline beside it
in 12/400 `--ash`, and at most one trailing action (a "see all" link or a
single ghost button). A two-line header on a 36px-row card is chrome eating
content.

Every list on every screen lives inside a card — lists never sit bare on the
canvas. A single figure never lives inside its own card; it lives in a `Well`
as a `Metric`.
Every card is a **container-query context**. Row components drop optional
columns against the *card's* width (`@md`), never the viewport's: the Overview
Anggaran card is 4-of-12 on a 1440px screen, so a viewport breakpoint would
wrongly keep a column that has no room.

states: empty → ash glyph + one line + optional action; loading → skeleton
matching final layout; success → 900ms `--safe-wash`; filled default; error →
inline banner strip + retry.

### Balance Hero

One card, two panes: left the answer, right the direction. Both splits are
**container** queries, never viewport ones (§4 Cards): the panes divide when
the *card* clears 48rem and the metric strip goes 4-up when the *left pane*
clears 28rem. The same component is 1040px wide on Overview and 440px in the
landing hero (§5), and a viewport breakpoint cannot tell those apart.

- Left (`p-3.5`, a flex column): 11px uppercase `Safe-to-Spend` label + `StatusBadge` — **Aman**
  (>0) · **Tipis** (=0) · **Minus** (<0); the 32px/600 figure (28px <640px) in
  **ink** — state lives in the badge, never in a coloured hero number; a 12px
  `--ash` sub-line spelling the arithmetic (`Tersedia … − Tereservasi …`, plus
  `· diperbarui … WIB` when stale); then one `Well` holding four `Metric`s —
  Runway · Jatah harian · Tereservasi besok · Kebutuhan · Gaya hidup. The well
  is pinned to the bottom of the pane (`mt-auto`) so a taller neighbour module
  stretches the card without leaving a dead band under the metrics (§5).
- Right (260px once the card splits, stacked below with a top rule, `p-3.5`): `Tren 30 hari` label, the
  signed 30-day delta, a 72px `Sparkline` in `--primary`, and the window's two
  end dates at 10px. Fewer than two points renders "Belum ada tren." — never a
  flat line through fabricated zeros.

states: loading = one 220px shimmer at the card's final size; error =
`QueryErrorState` inside the same grid slot; the trend pane fails independently
of the figure.

### Privacy mode

The dashboard opens **masked on every load** — it has to be safe to open in a
café. A reveal lasts for the tab only (`sessionStorage`, never `localStorage`):
a reload keeps it, a new tab starts hidden again.

- Masked figure = the literal `Rp••••••` at the figure's normal size, weight
  and tone. Fixed width, so it leaks neither magnitude nor sign; the tone stays
  because green-vs-ink is direction, not amount.
- Masked chart = value-axis ticks become `•••` and tooltips are off; **series
  geometry is untouched** — the shape of the month is not a number. Category
  axes (merchants, dates, categories) and pie labels are names and stay.
- Toggle = an `Eye`/`EyeOff` ghost icon button at the right of **every**
  `PageHeader`, plus the `.` key anywhere outside a text field. The icon shows
  the current state (crossed eye = hidden) and `aria-pressed` agrees.
- Never masked: user-typed inputs (the capture form's amount) and non-visible
  aria text — this defends against shoulder-surfing, not screen readers.

states: masked default · revealed · no loading or error variant — the mask is
client state, never a fetch.

### Well, Metric & Icon Tile

**Well** — `--surface-100`, radius **8px**, **no border, no shadow**, 12px
padding. The L1 recess that demotes secondary figures inside a card (hero
metrics, the rail's account block, summary strips).
**Metric** — 11px uppercase `--ash` label over a 14/600 tabular figure, with an
optional 12px `--ash` hint. Right-aligned only as the last cell of a summary
strip. A `Metric` is never boxed.
**IconTile** — 24px (`sm`) or 32px (`md`) rounded-**8px** square, 14/16px
Lucide glyph at 1.75 stroke. Tones: `neutral` `--surface-200`/ink-soft, a
wash/`-text` pair for `safe`/`warn`/`over`/`primary`, or one of the eight
identity hues (`--hue-*-wash` fill + saturated `--hue-*` glyph) plus `ink`
(solid `--hue-ink`, white glyph) — see §2 "Hue palette". It is the leading
glyph of a row; the hue tones identify the row's source or category and never
report a status. On the landing page (§5) it may head a feature card; inside
the app it never appears above a caption as a marketing feature tile.

### Source Card

Every account is a **wallet card** in its own identity hue (§2 "Hue palette"),
white text on the solid fill, radius 12, `--shadow-card`. A debt source is
always the `--hue-ink` card — a liability is not an identity colour, and the
ink card is the one place the stack reads as "this is owed".

- `row` — 56px, used in Overview's Akun module:
  `[glyph] [name 13/600 · type 11px white/90] [balance 14/600 white]` on one
  line, with a 2px allocation bar (`bg-white/25` track, white fill) underneath.
- `tile` — 112px, used on Sources: the same identity on top (with the
  `RowMenu` in white at the top-right), the balance at 18/600 pinned to the
  bottom, and a 3px allocation bar. Cards sit in a
  `sm:grid-cols-2 xl:grid-cols-3` grid inside the group's `Panel`.

`share` is caller-computed against the row's **own group total** — assets
divide by assets, debts by debts, so a paylater balance never claims a share
of cash. The balance uses `MoneyText tone="inherit"` (no colour class) because
a status tone on a hue card would claim a state the card is not reporting;
privacy masking still applies, unchanged. The rail keeps quiet 32px text rows
and shows the hue only as the 24px `IconTile` — one screen never carries two
full-colour treatments of the same account.

### Category Tile

`IconTile` with `tone={hueFor(category.id)}` and a glyph read from the
category *name* (`src/lib/category-glyph.tsx`: keyword → Lucide icon, first
hit wins, `Tag` as the fallback — the backend's `Category.icon` field is
untyped, so the name is the deterministic source until the contract types it).
It leads category rows and budget rows. Ledger rows keep text categories: a
36px row already carries a source glyph, and a second tile would break the
density law.

### Upcoming Bill Row

40px, `[date tile] [name · cadence · source] [amount] [due] [RowMenu?]`. The
date tile is a 36px-wide `--surface-200` block with the day at 13/600 and the
month at 10px `--ink-soft`; overdue flips the tile to `--over-wash`/`--over-text`.
The due cell is a badge only when it is urgent — `Terlambat` (over), `Hari ini`
and `≤3 hari` (warn) — otherwise plain `N hari` in `--ash`. Inactive bills
render `muted` (60% opacity on name and amount), never greyed to illegibility.

### Inputs & Forms

White fill, radius **8px**, 1px `--border-strong`, 4px 10px padding, height
**32px at ≥640px, 44px below**; text is `text-control` (13px desktop, 16px
phone, which is what stops iOS focus-zoom). Focus: border → `--primary` + 4px
`--primary`/10% ring. Placeholder `--muted`. Validation error: border paints
`--over`, 12px message below.
- **Amount field**: tabular figures, right-aligned, `Rp` prefix slot.
- **Segmented control**: track `--surface-200`, selected option white with a
  1px-scale shadow; option height 28px (36px below 640px, reaching 44px through
  the invisible expander — a 44px track would read as a button bar).
- **Selects**: same shell as inputs with a chevron; selected value never
  duplicates placeholder. Empty state shows the placeholder in `--muted` (never
  `--smoke`); the trigger chevron stays `--ink-soft` at all times so the control
  never reads as disabled.
- Label convention: sentence-case 13/500 above field; caption below in
  `--muted`. Tracked-uppercase 11px labels only for table column heads, metric
  labels and group labels.
states: five mandatory, per-field error with contextual copy from the copy deck.

### Redundant-information law (product-wide)

A row never shows the same datum twice as two controls/labels — e.g. needs-review rows show the category correction select OR the category text, not both.

### Accounts Rail (app shell, desktop)

Fixed left rail **224px**, white, right edge 1px `--border`. It is
**navigation first, money second** — v3 buried nine screen links under the
balances, which made the app's primary control the last thing on the page.

1. Wordmark "catet" — 16px/600, `--primary`, in a 32px row.
2. Primary `nav` (`aria-label="Navigasi utama"`): seven 32px rows, each a 16px
   Lucide glyph + 13/500 label — Overview · Transactions · Inbox · Sources ·
   Bills & Calendar · Budgets · Analytics. Active row = `--primary-wash` fill,
   `--primary` text **and glyph**, `aria-current="page"`; idle = ink-soft glyph
   `--ash`, hover `--surface-100`. Inbox carries a count pill (`--over-wash`
   fill, `--over-text`, 11px tabular) hidden when zero.
3. `Akun` block: an 11px group label with a `Kelola` link, then one `Well`
   holding `Bersih` (available − debt) as an 18/600 figure and 28px account
   rows — 14px glyph, name in 12px ink-soft, balance in 12px tabular; debts
   follow a 10px `Utang` divider with `--over-text` balances.
4. Pinned footer: Categories · Settings, same 32px nav rows.

Mobile (<1024px): bottom navigation 56px + safe-area — Overview · Transactions
· Add (center 40px blue FAB) · Inbox · More. The active tab is a
`--primary-wash` pill with `--primary` text.
states: filled default · empty = zero badges hidden · loading = 4 × 28px
shimmer rows in the well · error = `role="alert"` strip + `Muat ulang`.

### Ledger Table

`LedgerHead` + `LedgerRow` share one column template (`LEDGER_GRID`) so header,
rows and skeleton can never drift.

Header row: 32px, 11px uppercase label in `--ash`, 1px `--border` below —
`Jam · Transaksi · Kategori · Sumber · Jumlah` (amount right-aligned). Hidden
below 768px.

Row: **36px** at md+, 44px below, 16px gutters, five columns
`[44px time] [merchant + inline note + status badge] [category text] [source
glyph + name] [signed 14/500 amount right-aligned]`. Category and source are
**plain text**, never chips: a pill on 100% of rows carries zero information
and costs the row its scannability. Time is its own leading column, not a
second line under the merchant.

Status is text, not a dot, and only for the exceptional: needs-review rows
carry a warn `StatusBadge` ("Perlu review") beside the merchant, voided rows a
neutral "Di-void" plus strike-through, reversals a safe "Pembalikan".
Separators 1px `--border`; the last row in a card drops its rule. Whole row is
one button behind the content (`absolute inset-0`) so the amount is never
covered.

Below 768px the row folds to two lines inside 44px: merchant + amount, then an
11px `--ash` meta line `time · source · category`. The table never scrolls
horizontally.
Trailing actions (Inbox): the row grows (`min-h-11 py-1.5`) and the controls
sit above the overlay button.
Day grouping: a sticky 28px `--canvas` divider **on the canvas**, 11px
uppercase, 1px `--border` below, offset `48px + var(--toolbar-h)`.
states: empty screen-level ("Belum ada transaksi…"); loading `LedgerRowSkeleton`
×8–10 preserving columns; success 900ms safe-wash; filled; error per-action toast.

### Progress Bars (budgets)

One 36px line: `[CategoryTile] [category] [4px bar] [spent / limit] [percent]`.
The category label is 96px on a narrow card and 128px on a wide one; the bar
takes the slack up to 420px so a full-width card does not draw a 700px
hairline. Track
`--surface-300` radius-full; fill `--safe` <80%, `--warn` 80–99%, `--over`
≥100%, width clamped at 100% so an over-budget bar is full, not overflowing.
Figures are 12px tabular `--ash`; the percent is 12/500 `--ink-soft`, or
`--over-text` at ≥100% — the threshold no longer needs a badge because the row
is one line and the colour is on the number itself. The bar carries
`role="progressbar"` with `aria-valuenow/min/max` and `aria-label` = the
category, so it is never colour-only.
states: filled default · loading skeleton track · empty not rendered · error n/a.

### Modals, Drawers, Menus, Popovers

White background, radius **12px** (menu items 6px, controls 8px). Scrimmed
floaters (modals, drawers): L3 `--shadow-float`, no ring. Unscrimmed
floaters (row menus, popovers, selects, toasts): 1px `--border-strong` + L2
`--shadow-pop`. Scrim `rgba(5,15,26,0.40)`. Drawer
slides 240ms cubic-bezier(0.2, 0.8, 0.2, 1).
**Row menu** — min-width 160px, 4px padding, 32px items at 13px, hover/focus
`--surface-100`; destructive items `--over-text` on `--over-wash`, always last
and always below a 1px `--border` separator.
states: filled default · loading skeleton inside sheet · success auto-close with
safe-wash flash · error inline block (never self-closes).

**Sheet policy.** Every form and detail view goes through `ResponsiveSheet`:
right sheet (`sm:max-w-md|lg`) at ≥640px, bottom sheet (`h-[92dvh]`) below. No
screen opens its own `Dialog` for a form.

**Confirmation ladder.** `ConfirmDialog` owns all of it, graduated by
reversibility: plain confirm for reversible actions (archive, deactivate),
confirm-with-preview for consequential ones (reversal shows the mirrored
amount), typed phrase (`HAPUS`) only for void. Copy says `di-void`, never
`dihapus`.

### Toasts

Bottom-right white sheet, radius 8px, 1px `--border-strong` + L2 shadow,
auto-dismiss 4s for success, one visible at a time. Error toasts **never
auto-dismiss** and carry a retry when one exists (`toastError`).
states: neutral · success check-glyph + safe edge · error over-tone + retry
link (does not auto-dismiss).

### Empty-state pattern (product-wide)

No illustrations. Layout = 32px ash glyph → heading copy → one caption →
optional ghost action, inside a `p-4` well within the owning card. Copy deck
supplies exact strings.

### Skeleton rule

Skeletons reproduce final geometry exactly (heights, radii, gaps) in
`--surface-200`, left-to-right `--surface-100` shimmer, 1.4s loop.
implementation: catet-shimmer keyframes (translateX −100%→100% over a
`--surface-100` gradient on `--surface-200`), never animate-pulse. Spinners only
inside buttons.

### Charts (ECharts conventions)

Gridlines: 1px dashed `--border`, horizontal only. Axis labels: caption size,
`--muted`; currency ticks in tabular figures (same sans voice). Tooltip: white
card, 1px border + L2 shadow, title Body SM 500 + label:value rows with values
tabular-aligned. Reference line `--safe` dashed. Anomaly markers: `--over` 6px
dots. Heatmap cell radius 4px, gap 3px. Legends are plain text rows, never color
boxes larger than 8px; never default ECharts color chips. Series colours come
from `CHART_COLORS` — neutral (ink-soft/muted/ash) or semantic (safe/warn/over)
— and `--primary` only in the `BalanceHero` sparkline (§2).

## 5. Layout Principles

Base unit **4px**; ladder 8·10·12·16·20. The standard gap between cards and
sections is `section` at **10px** — density is quantified, not vibes.

Desktop app shell: fixed **224px** accounts rail + fluid main, content
max-width **1600px**, 20px gutters, vertical rhythm `py-2.5`. Chrome budget: a
48px page header plus (on ledger screens) a ~48px filter toolbar — under 12% of
a 900px viewport, against ~30% in v3. The 1600px cap exists because the grid
is dense: at 1280px a 12-column Overview row had to drop content, and past
1600px the eye loses the row.

One compact rhythm governs all screens:

- Overview: a 12-column grid, 10px gaps, seven modules — Balance Hero (8) +
  Akun (4); Arus kas (5) + Mendatang (4) + Perlu perhatian (3); Aktivitas
  terakhir (8) + Anggaran (4). Three rows, no scroll needed for the answer.
- **Modules fill their grid cell.** A grid row is as tall as its tallest
  module, and the shorter ones stretch: charts grow (the cash-flow bars take
  the slack above a 120px floor, `ChartFrame`'s `height` is a *minimum*),
  wells pin to the bottom of their pane (`mt-auto` in `BalanceHero`), lists
  grow their row count instead of their padding. Dead space under a module's
  content is a bug, not breathing room.
- Row counts are set so a 900px viewport is filled, not padded: Akun lists
  **all** sources, Mendatang 6 bills, Aktivitas 12 transactions (or as many as
  `overview.recent` returns), Anggaran 8 budgets.
- Ledger screens: 48px sticky header → sticky canvas filter toolbar → one card
  holding the column header, the day dividers and every row.
- Grouped-row screens (Sources, Bills, Budgets, Categories): a summary strip of
  `Metric`s, then one `list` card per group with an inline count caption.
- Section separation: `section` (10px); related items group at `xxs`–`sm`.
- Settings: **one** card, three `sm:grid-cols-[220px_minmax(0,1fr)]` rows
  divided by `--border` — a field is a row, not a card.
- Landing (`/welcome`, served at `/` for visitors by a middleware rewrite):
  a **1120px** column, 48/80px section rhythm, and the only screen allowed a
  36–44px headline. It composes app components against fixture data
  (`src/components/landing/demo-data.ts`) — `BalanceHero`, `SourceCard`,
  `BudgetProgressRow`, `IconTile` — never a screenshot, so the product page
  cannot drift from the product. It renders **unmasked**: a product page that
  masks its own figures says nothing. The WhatsApp phone beside it is CSS, and
  its money strings are copy, not data.

Density is the default; generosity is earned only where a decision needs it.

## 6. Depth & Elevation

Hierarchy = white-on-gray + one soft shadow per card + hairlines on chrome.
Shadow is ambient at L1 and means "this is a card"; a bigger shadow means
"floating above the page". Three tokens, no arbitrary shadow anywhere.

| Level | Treatment | Use |
|---|---|---|
| L0 Canvas | none | page, page header, filter toolbar, sticky day dividers |
| Chrome | white + `1px var(--border)` on the docked edge | rail, page header, bottom nav, day dividers |
| L1 Card | white + `var(--shadow-card)`, 12px, **no border** | every card; a card never has an outline |
| L1-inset Well | `--surface-100`, 8px, **no border, no shadow** | metric strips, the rail's account block, in-card summaries |
| Tile | `--surface-200` or a `--hue-*-wash`, 8px | leading glyphs, date tiles |
| Hue card | solid `--hue-*` (ink for debt), 12px, `var(--shadow-card)` | `SourceCard` — one account as a wallet card |
| Control | white + `1px var(--border-strong)`, 8px | inputs, selects, secondary buttons |
| Selected | `--primary-wash` + `--primary` text | active nav row, active segmented option, active bottom tab |
| L2 Popover | `var(--shadow-pop)` + `--border-strong` | row menus, popovers, select menus, toasts |
| L3 Floating | `var(--shadow-float)` | modals, drawers, sheets |
| Focus | `4px var(--primary)/10%` ring + `--primary` border | keyboard focus |

Edge/elevation law: a docked **chrome** surface (rail, header, bottom nav, day
divider) uses a border and never a shadow; a **card** uses `--shadow-card` and
never a border; a **floater** uses `--shadow-pop`/`--shadow-float` plus
`--border-strong`. Never stack two shadows on one element, never a decorative
shadow in a table, and never `shadow-[...]` — use the tokens.

## 7. Interaction & Motion

Grammar, not decoration:

| Interaction | Spec |
|---|---|
| Color/hover transitions | 150ms ease |
| Elevation changes | 200ms ease-out |
| Modal enter | 240ms cubic-bezier(0.2, 0.8, 0.2, 1); exit 160ms |
| Success flash | background → wash 120ms, hold 700ms, decay 500ms |
| Filter chip apply | scale 0.96→1 ease-out-expo, 180ms (no overshoot) |
| Skeleton shimmer | 1.4s linear infinite |

Focus is always visible (4px `--primary`/10% ring + blue border). Honor
`prefers-reduced-motion`: kill shimmer, scale pops, slide-ins; keep opacity
fades ≤120ms. Nothing bounces twice; success is a single wash.

global @media (prefers-reduced-motion: reduce) kill-switch (animations/transitions ≈0.01ms, scroll-behavior: auto) lives in globals.css.

## 8. Responsive Behavior

| Breakpoint | Shell change |
|---|---|
| ≥1280px | Full: 224px rail, **1600px** content max, 20px gutters, Overview on 12 columns; Sources cards 3-up |
| 1024–1279px | Identical shell; Overview modules compress within the same 12-column grid |
| 768–1023px | Rail hidden, bottom nav; Overview 2-up; ledger keeps all five columns |
| 640–767px | Ledger folds to two lines in 44px (merchant + amount, then meta); Overview 2-up |
| <640px | Bottom nav (Overview · Transactions · Add-FAB · Inbox · More), labels 12px; 16px gutters; single column; controls 44px; type +2 steps; toolbars collapse to search + a Filter sheet; Bills becomes `Daftar | Kalender` tabs; metric strips stack as label–figure rows; day dividers sticky |

### Overview module order

DOM order is the desktop reading order; the phone re-orders with `order-*` so
"what needs me" and "what changed" come before the reference data.

| Module | Phone | md (2-col) | lg (12-col) |
|---|---|---|---|
| Balance Hero | 1 | span 2 | span 8 |
| Perlu perhatian | 2 | span 2 | span 3 |
| Aktivitas terakhir | 3 | span 2 | span 8 |
| Akun | 4 | span 1 | span 4 |
| Mendatang | 5 | span 1 | span 4 |
| Arus kas | 6 | span 1 | span 5 |
| Anggaran | 7 | span 2 | span 4 |

Bottom nav pads env(safe-area-inset-bottom). Mobile toolbar: the search field
takes the full width and the filters move into a bottom sheet behind one
`Filter` button (with an active-count badge and a chip row for what is on) —
three selects in a 360px bar can only truncate to `Semua ar…`, which is not a
filter, it is a rumour.

Touch targets ≥44px for rows and every control; compact buttons, switches,
checkboxes and row-action text links keep their visual size and reach 44px with
a transparent hit-area expander. Ledger rows grow 36→44px below 768px. The hero
figure stays 32px. Tables drop the time, category and source columns below
768px into the meta line (never horizontal scroll). Modals become full-height
bottom sheets, and a sheet footer pads the home indicator
(`calc(1rem+env(safe-area-inset-bottom))`). The heatmap swaps year-grid for a
trailing-90-day strip; donut labels give way to a bottom legend below 768px.

### Installed app

The dashboard is installable (backend ADR-0007), and the installed window is
the same UI under four extra rules:

- **Launch.** `manifest.webmanifest` declares `display: standalone`,
  `orientation: portrait`, `theme_color`/`background_color` `#f2f4f7` and
  `start_url: /?source=pwa`. Signed out, that launch goes straight to `/login`
  — the landing page is for browsers, not for a home-screen icon.
- **Chrome.** `viewport-fit=cover` plus the safe-area padding above; iOS status
  bar stays `default` (opaque), so the 48px `PageHeader` needs no top inset.
  `overscroll-behavior-y: none`: no pull-to-refresh, no rubber-band.
- **Connectivity.** A failed navigation shows the branded `/offline` page (the
  only page the service worker precaches). In-session, an 8px-tall `role=status`
  bar sits above the bottom nav and mutations fail fast with one toast — never a
  silently queued write. No offline data: capture stays on WhatsApp.
- **Privacy and updates.** Hiding the installed app re-masks revealed amounts
  (a browser tab keeps them). A new build never swaps itself in: the user gets
  a `Versi baru tersedia` toast and decides.

Web Push is out of scope — reminders are WhatsApp's job (ADR-0006).

## 9. Do's and Don'ts

Do: white hairline cards on the gray canvas · chrome left on the canvas · one
hero figure per screen · secondary figures as `Metric`s inside a `Well` · blue
for interaction (plus the single hero sparkline) · semantic-only color for
state · accent text only via `-text` variants · tabular figures for every
rupiah (single sans voice, never monospace) · every list inside a card with an
11px column header · plain-text category and source in the ledger ·
right-aligned amounts · rare and destructive row actions inside a `RowMenu` ·
skeletons matching final geometry · compact over spacious.
Don't: `--primary` on a figure, or as a series anywhere but the hero sparkline
· a row of equal-weight KPI cards · a card around a single number · a two-line
card header · `--border-strong` on a card · a white slab behind the page title
· a chip on 100% of rows · three text buttons on every row (especially a red
one) · bold 700 · decorative gradients/glows/glass · shadows on cards or table
rows · colored decoration without meaning · raw `--warn` as text · `--smoke` as
readable text · monospace anywhere · routine expenses painted red ·
illustration-heavy empties · push-style banners · emoji in UI ·
horizontal-scrolling data tables · hover-only affordances · oversized hero
marketing layouts.

Anti-slop bans: no gradient text or decorative gradient fills of any kind (the functional skeleton shimmer in §4 and the hero sparkline's area wash are the only permitted gradients) · no backdrop-blur/glass · no radial halos or soft spotlights · no icon-tiles-above-caption (tiles lead rows, never headline a card) · no label-above-heading eyebrows · no control text below 11px, no sentence below 12px · no duplicate presentation of one datum · no bounce/wiggle attention animations · no card shadow at any level.

## 10. Agent Prompt Guide

Never place raw hex/fonts/radii inside a generation prompt when this design
system is attached — refer semantically ("positive accent", "warning tone",
"card surface"). Stitch generation prompts never mention token names, hex,
fonts, or radii. When the system is not attached, keep prompts semantic and
treat generated screens as raw exploratory references. On-screen copy is
Indonesian-first. Entity language law:
**Source** (never account/wallet/vault). All money uses tabular figures in the
single sans voice.

### Copy law

Chrome (navigation, page titles) is **English**: Overview · Transactions ·
Inbox · Sources · Categories · Bills & Calendar · Budgets · Analytics ·
Settings · More. Body copy is **Indonesian**, informal register ("kamu").

Vocabulary (binding):

| Use | Never |
|---|---|
| Koreksi saldo | Setor koreksi |
| Balikkan / pembalikan | Balaskan / reversal |
| Siklus | Kadence |
| Rentang nominal | Band |
| Kebutuhan / Gaya hidup | Essential / Lifestyle (body copy) |
| di-void | dihapus (soft) |
| Tutup | Close |

Safe-to-Spend state words are fixed: **Aman · Tipis · Minus**.

Absolute timestamps always carry `WIB`; every date is formatted in
`Asia/Jakarta` through `src/lib/time.ts`, never in the browser's timezone.

### Quick reference (semantic)

- Page = gray canvas · card = white + 1px hairline · control = white + strong
  1px edge · structure = borders, not shadows
- Chrome (page title bar, filter bar, day dividers) sits on the canvas
- One hero figure per screen; every other figure is a `Metric` in a tinted well
- Interactive = blue (buttons, links, active nav, focus) + the one hero
  sparkline — nothing else
- Positive/safe = `--safe` (text `--safe-text`) · thin = `--warn` (text
  `--warn-text`) · over/error = `--over` (text `--over-text`)
- Text steps: ink → ink-soft → muted → ash (ash is the quietest legal reading
  colour; `--smoke` is decoration)
- One voice: Inter; numbers = tabular figures (never monospace); weights ≤600

### Example component prompts

1. "Balance hero card, two panes: left a small uppercase 'Safe-to-Spend' label
   with an 'Aman' status badge, one very large tabular figure `Rp8.003.500` in
   ink, a quiet sub-line 'Tersedia Rp9.073.500 − Tereservasi Rp1.070.000', and
   a tinted inset strip of four small label/figure pairs — Runway '34 hari',
   Jatah harian `Rp266.800`, Tereservasi besok `Rp1.070.000` in warning tone,
   'Kebutuhan · Gaya hidup'. Right pane: a 'Tren 30 hari' label, a signed
   delta, and a small axis-less brand-coloured trend line with its two end
   dates beneath."
2. "Ledger table inside one card: uppercase column header row 'Jam · Transaksi
   · Kategori · Sumber · Jumlah', then single-line 36px rows — time '08.14',
   merchant 'Kopi Kenangan', category as plain text 'Makanan & Minuman', source
   as a small type glyph plus 'Cash', right-aligned `−Rp25.000` in tabular
   figures; a warning 'Perlu review' badge beside the merchant when unreviewed;
   canvas-tinted day-divider rows between days. No pills on ordinary rows."
3. "Accounts rail: ink card-stack mark + 'catet' wordmark, then a seven-item icon+label
   navigation list where the active row is a blue-tinted pill with blue text
   and Inbox carries a count badge; below it an 'Akun' group label with a
   'Kelola' link and a tinted inset block holding 'Bersih' with a medium
   figure and compact account rows (hue-washed glyph tile, name, balance), debts after a
   small 'Utang' divider in danger tone; Categories and Settings pinned at the
   bottom."
4. "Source card: a 56px card filled in this account's identity hue (ink when it
   is a paylater), white contents — a small type glyph, 'BCA' over 'Bank' in
   11px white/90, a right-aligned tabular balance `Rp12.480.000` — and a 2px
   white allocation bar underneath showing its share of total assets; on the
   Sources screen the same card at 112px carries an ellipsis icon button for
   edit / correct / archive."
5. "Budget row on one line: a hue-washed glyph tile, category 'Makanan & Minuman', a thin progress bar
   at 86% in warning tone, `Rp1.284.000 / Rp1.500.000` in quiet tabular
   figures, then '86%' — no badge, the percentage itself carries the tone."
6. "Empty transactions card: centered ash glyph, heading 'Belum ada transaksi',
   caption 'Mulai catet lewat WhatsApp.', ghost button 'Buka panduan'."
7. "Confirmation dialog for delete: 12px-radius modal, heading 'Hapus \"Kopi
   Kenangan 25.000\"?', caption explaining the 30-day restore window, ghost
   'Batal' + danger-ghost 'Hapus'; typed confirmation lives elsewhere in the
   flow."

## 11. Implementation Foundation (build-time mapping)

> Ledger Blue derives from the MIT-licensed **Crypto Blue** kit
> (`designmd.ai/chef/crypto-blue`) for palette, geometry and elevation, and from
> Stripe Dashboard density conventions for type scale and row rhythm. Two
> deliberate departures from Crypto Blue: **no JetBrains Mono** (Inter tabular
> figures carry every figure, §3) and **weight ceiling 600** instead of 700.

The Next.js frontend adopts **shadcn/ui ("new-york") + Tremor data blocks** as
its component foundation. Generator prompts never mention these names; this
section binds our tokens to the codebase so design and build never fork:

| Ledger Blue token | shadcn variable |
|---|---|
| `--canvas` | `--background` |
| `--surface` | `--card` / `--popover` |
| `--ink` | `--foreground` |
| `--primary` `#0052ff` | `--primary` (+ `--ring`) |
| white | `--primary-foreground` / `--destructive-foreground` |
| `--ink-soft` / `--muted` | `--accent-foreground` / `--muted-foreground` |
| `--surface-200` | `--secondary` / `--muted` |
| `--muted` | placeholder color |
| `--over` | `--destructive` |
| `--border-strong` | `--input` |
| radii 6 / 8 / 12 | `--radius-sm` / `--radius-md` / `--radius-lg` |
| `--shadow-card` / `-pop` / `-float` | `shadow-card` / `shadow-pop` / `shadow-float` utilities |
| `--hue-*` / `--hue-*-wash` | `bg-hue-*` / `bg-hue-*-wash` / `text-hue-*` utilities |
| Inter | `--font-sans` |
| Bricolage Grotesque 700 | `--font-brand` (wordmark only, §4 Brand) |
| `--text-hero` 32 | `text-hero` |
| `--text-figure-lg` 18/20 | `text-figure-lg` |
| `--text-title` 16/18 | `text-title` |
| `--text-figure-md` 14/16 | `text-figure-md` |
| `--text-body` 13/15 | `text-body` |
| `--text-meta` 12/13 | `text-meta` |
| `--text-label` 11/12 | `text-label` (uppercase + 0.06em baked in) |
| `--text-control` 13/16 | `text-control` |
| `--text-amount` 15/17 · `--text-amount-lg` 20/24 | `text-amount` / `text-amount-lg` |

Both faces are **self-hosted** (`src/fonts/*.woff2`, latin subsets taken from
the Fontsource packages) and loaded with `next/font/local` in
`src/app/layout.tsx`. Do not move them back to `next/font/google`: a
production build then depends on a live fetch to `fonts.googleapis.com`, which
fails closed on a blocked network.

`--radius-sm` (6px) is the chip, badge and menu-item radius; `--radius-md`
(8px) is the well, tile, button, input and control radius; `--radius-lg`
(12px) is the card, hue card and dialog radius. Elevation is declared in a
**non-inline** `@theme` block so `--shadow-card/-pop/-float` are emitted once
on `:root`; a self-referencing copy in `:root` would be invalid at
computed-value time. v5 changed the neutral ramp (`--canvas` `#f9fafb` →
`#f2f4f7`, `--surface-100` → `#f5f7fa`, `--surface-200` → `#eef0f3`,
`--surface-300` → `#e2e5ea`, `--ash` `#6b7280` → `#646b78`) and added the
`--hue-*` and `--shadow-*` families; every other value in `globals.css` is
unchanged. No `shadow-[...]` arbitrary class may exist outside
`segmented-control.tsx`'s 1px thumb shadow.

The type scale is declared in a **non-inline** `@theme` block too, so every
`text-*` utility resolves `var(--text-*)` at runtime and one `:root` override
under 640px re-scales the whole app (§3). Two consequences: never use
`@theme inline` for these, and `cn()` must extend tailwind-merge's `font-size`
group with the token names (`src/lib/utils.ts`) — otherwise `text-body` is
mistaken for a colour class and dropped next to `text-ash`.

Adaptation laws: shadcn default zinc borders → **Crypto Blue gray tiers**, with
the card on `--border` and the control on `--border-strong` (§2); the semantic
`-text` variant law overlays all Tailwind color classes; charts remain
**ECharts** per AGENTS.md (not Recharts) and use `--primary` only in the
`BalanceHero` sparkline.
