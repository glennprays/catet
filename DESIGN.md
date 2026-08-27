---
version: alpha
name: Paper Editorial
description: Warm-paper personal finance dashboard for one user — cream canvas, warm ink text, semantic color rationing (teal safe / amber thin / crimson over), Inter UI voice + JetBrains Mono money voice, hairline alpha-ink borders, calm over alarm.
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
  display:      {fontFamily: Inter, fontSize: 64px, fontWeight: 500, lineHeight: 1.05, letterSpacing: -0.03em}
  display-lg:   {fontFamily: Inter, fontSize: 44px, fontWeight: 500, lineHeight: 1.08, letterSpacing: -0.022em}
  heading-1:    {fontFamily: Inter, fontSize: 30px, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.018em}
  heading-2:    {fontFamily: Inter, fontSize: 22px, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.012em}
  body-lg:      {fontFamily: Inter, fontSize: 17px, fontWeight: 400, lineHeight: 1.55}
  body-md:      {fontFamily: Inter, fontSize: 15px, fontWeight: 400, lineHeight: 1.55}
  body-sm:      {fontFamily: Inter, fontSize: 13.5px, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0.005em}
  caption:      {fontFamily: Inter, fontSize: 12px, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.01em}
  micro:        {fontFamily: Inter, fontSize: 11px, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0.06em}
  money-hero:   {fontFamily: JetBrains Mono, fontSize: 56px, fontWeight: 450, lineHeight: 1.05, letterSpacing: -0.01em}
  money-xl:     {fontFamily: JetBrains Mono, fontSize: 40px, fontWeight: 450, lineHeight: 1.0, letterSpacing: -0.01em}
  money-md:     {fontFamily: JetBrains Mono, fontSize: 15px, fontWeight: 450, lineHeight: 1.4}
  money-sm:     {fontFamily: JetBrains Mono, fontSize: 13px, fontWeight: 450, lineHeight: 1.4}
rounded:
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  huge: 56px
  band: 72px
  section: 96px
---

# catet — Design System (DESIGN.md)

> Soft-friendly personal finance. A notebook on a desk, not a trading floor.
> Format follows the Stitch DESIGN.md specification extended to 9 sections. Dual themes defined together; frontmatter carries the light theme for machine parsing — dark-theme mapping lives in §2 and §10.

---

## 1. Visual Theme & Atmosphere

catet is a **personal** money tool for one human being in Indonesia. The entire experience is built on a **warm cream canvas (`#f2f1ee`)** with **warm near-black ink (`#26231d`)** — never pure white, never clinical black. Every surface carries warmth: cards are barely-lighter cream, borders dissolve into transparent warm overlays of the ink tone, and even errors (`#cf3f52`) are warm crimson rather than alarm-red. The mood evokes a well-kept paper ledger and a morning coffee, not a Bloomberg terminal.

Two visual identities coexist by law:

1. **Editorial rhythm (Overview):** one oversized Safe-to-Spend figure dominates the screen; everything else whispers. High whitespace, a single focal point, generous padding.
2. **Ledger rhythm (Transactions, Bills):** dense, scannable 46px rows with hairline separators, every amount in monospaced tabular figures aligned to the decimal.

Color is rationed to *meaning only*. Teal-green means safe. Amber means thin. Crimson means over. Nothing is colored for decoration — ~97% of the interface is achromatic warm grays, which makes the moment the accent appears feel like information arriving, not branding shouting.

Key characteristics:

- Warm cream canvas `#f2f1ee` — the whole system is warm-shifted; whiteness only for true elevated sheets
- Ink `#26231d` — warm near-black with a brown undertone; all borders are **alpha tints of this ink**, never gray
- Monospace voice reserved exclusively for money figures, IDs, timestamps (`tabular-nums`, always)
- Weight ceiling 590 — hierarchy comes from size and spacing, never bold
- Pill-shaped interactive controls against quiet rectangular structure
- Depth through tonal layering and hairline rings; heavy blur shadows reserved strictly for floating artifacts

### Why the defaults are what they are

Two of the system's base materials (a warm cream ground, Inter as UI face) coincide with common current defaults; both are deliberate positions, not reflexes, and are defended here so future changes get argued instead of drifted.

**Cream, not white** (`#f2f1ee`, warm-shifted through every neutral and shadow): the product is a paper ledger metaphor used for long daily sessions — pure white flickers harshly at night and reads clinical; cream costs nothing functionally and buys calm. The identity does not live in the background color alone: alpha-ink borders, the rationed semantic trio, and the mono-money voice would survive any ground swap.
**Inter, not something rarer**: primary content is high-density tabular data rendered at small sizes across thousands of rows; Inter's legibility and metric discipline there outweighs novelty. Personality is delegated where it compounds — the mono money voice, semantic rationing, weight ceiling — not scattered into display faces. If either default ever changes, change them together and re-test every text-contrast ratio first.

## 2. Color Palette & Roles

### Light theme (default)

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#f2f1ee` | Page background — warm cream |
| `--surface` | `#faf9f6` | Primary card/container sheet |
| `--surface-100` | `#f7f5f1` | Quietest nested fill |
| `--surface-200` | `#efece7` | Inset fills, input wells |
| `--surface-300` | `#e7e3dc` | Pressed/deeper emphasis, segmented tracks |
| `--ink` | `#26231d` | Primary text, primary button fill |
| `--ink-soft` | `#454139` | Secondary text |
| `--muted` | `#6f6a62` | Tertiary text, captions (≥4.5:1 on all card surfaces) |
| `--ash` | `#9b968e` | **Decorative only** — inactive icons, status dots; never label/body text |
| `--smoke` | `#c3bdb4` | Placeholders, disabled text |
| `--sheet` | `#fffefc` | Floating sheets only (modals, popovers, tooltips) |
| `--safe` | `#178269` | SAFE state — bars, fills, dots, rings only |
| `--safe-wash` | `rgba(23,130,105,0.10)` | Tint backgrounds behind safe signals |
| `--safe-text` | `#136b57` | Safe-state *text* (chips, deltas, badge labels) |
| `--warn` | `#c47a12` | THIN state — bars, fills, dots, rings only |
| `--warn-wash` | `rgba(196,122,18,0.12)` | Tint backgrounds behind warn signals |
| `--warn-text` | `#9c5c08` | Thin-state *text* |
| `--over` | `#cf3f52` | OVER/error — bars, fills, dots, rings only |
| `--over-wash` | `rgba(207,63,82,0.10)` | Tint backgrounds behind error |
| `--over-text` | `#b12e42` | Over/error *text* |

### Dark theme

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#201d19` | Page background — warm charcoal |
| `--surface` | `#2a2620` | Card sheet |
| `--surface-100` | `#262220` | Quietest nested fill |
| `--surface-200` | `#332e27` | Inset fills, input wells |
| `--surface-300` | `#3d372e` | Pressed emphasis, tracks |
| `--ink` | `#ece8df` | Primary text — warm cream |
| `--ink-soft` | `#c9c3b8` | Secondary text |
| `--muted` | `#a49d8f` | Tertiary text |
| `--ash` | `#6f695f` | Decorative only — inactive icons, dots |
| `--smoke` | `#4f4a41` | Placeholders, disabled |
| `--sheet` | `#33302a` | Floating sheets |
| `--safe` | `#4ec79b` | SAFE state — also serves as safe text |
| `--safe-wash` | `rgba(78,199,155,0.12)` | Safe tint |
| `--safe-text` | `#4ec79b` | Alias of `--safe` (passes ≥4.5:1 on all dark surfaces) |
| `--warn` | `#e0a04c` | THIN state — also serves as warn text |
| `--warn-wash` | `rgba(224,160,76,0.14)` | Warn tint |
| `--warn-text` | `#e0a04c` | Alias of `--warn` |
| `--over` | `#ff7a8c` | OVER/error — also serves as over text |
| `--over-wash` | `rgba(255,122,140,0.12)` | Error tint |
| `--over-text` | `#ff7a8c` | Alias of `--over` |

### Text-color law (load-bearing)

Raw accent hues (`--safe/--warn/--over`) belong to **bars, fills, dots, rings, chart strokes**. Any time an accent appears as *text* — chip labels, delta figures, badge counts, threshold badges — it must use the `-text` variant, which holds ≥4.5:1 against every card/well surface in its theme. `--ash` is decoration: it may draw icons and dots but never carries a word a user must read; the quietest legal reading color is `--muted`. Chart expense-series at 80% opacity is exempt as a *fill* (§2 Chart palette).

### Border system (alpha tints of ink — this is load-bearing)

Borders are never gray constants. They are the ink color at alpha, so they sit naturally on any surface:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--border` | `rgba(38,35,29,0.10)` | `rgba(236,232,223,0.10)` | Standard hairline |
| `--border-strong` | `rgba(38,35,29,0.22)` | `rgba(236,232,223,0.24)` | Hover edges, emphasized sections |
| `--border-solid` | `rgba(38,35,29,0.55)` | `rgba(236,232,223,0.60)` | Table rules, max contrast |

(CSS fallback where alpha-in-ink is impractical: use `color-mix(in srgb, var(--ink) 10%, transparent)`.)

### Chart palette

- Base series: `--ink-soft`, `--ash`
- Income series: `--safe`. Expense series: `--over` at 80% opacity — a deliberate, documented exception to semantic rationing: routine spend renders as a quiet warning, so the anomaly markers must escalate instead to solid `--over` dots at full opacity, 6px. Transfers excluded from spend math entirely
- Reference lines: `--safe`, dashed 4-4
- Heatmap ramp: `canvas → surface-300 → warn-wash → warn` (zero outflow renders as pure canvas)
- Donut slices: warm neutral ladder first (`ink-soft/muted/ash/smoke`), then safe, then warn — a slice renders red only when its category is over budget (>100%).

### Quick color reference

- Light: background `#f2f1ee` · card `#faf9f6` · text `#26231d` · secondary text `#6f6a62` · safe `#178269` (text `#136b57`) · thin `#c47a12` (text `#9c5c08`) · over `#cf3f52` (text `#b12e42`)
- Dark: background `#201d19` · card `#2a2620` · text `#ece8df` · secondary `#a49d8f` · safe `#4ec79b` · thin `#e0a04c` · over `#ff7a8c`

## 3. Typography Rules

Two voices. **Inter** speaks structure; **monospace speaks money**. There is no serif — this is a friendly tool, not a magazine.

### Voices

| Voice | Family | Fallbacks | Domain |
|---|---|---|---|
| UI/Display | Inter | system-ui, Segoe UI, Helvetica Neue | Everything structural |
| Numerals/Money | JetBrains Mono | ui-monospace, SFMono-Regular, Menlo | Every currency figure, IDs, timestamps |

Absolute rules:

1. **Every amount in the mono voice with `font-feature-settings: 'tnum'`.** No exceptions anywhere, including charts' axis ticks for currency.
2. **The Safe-to-Spend hero figure is money-voiced at `money-hero` size** — never the UI voice, never a bespoke one-off. It is the only step allowed above `money-xl`.
3. Weights never exceed **590**. Bold is banned; hierarchy is size × spacing × color.
4. Display sizes carry negative tracking; body and below carry none or positive micro-tracking.

### Hierarchy

| Role | Font | Size | Weight | Line height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Display | Inter | 44px | 500 | 1.08 | −0.022em | Screen titles |
| Heading | Inter | 30px | 500 | 1.15 | −0.018em | Section headers |
| Heading SM | Inter | 22px | 500 | 1.2 | −0.012em | Card headers |
| Body LG | Inter | 17px | 400 | 1.55 | normal | Lead copy |
| Body | Inter | 15px | 400 | 1.55 | normal | Default UI text |
| Body SM | Inter | 13.5px | 400 | 1.5 | 0.005em | Dense UI, meta, form labels (weight 500) |
| Caption | Inter | 12px | 400 | 1.4 | 0.01em | Timestamps, hints, stat labels |
| Micro-label | Inter | 11px | 500 | 1.3 | 0.06em uppercase | Table column heads only — never above the hero figure |
| Money Hero | JetBrains Mono | 56px | 450 | 1.05 | −0.01em tnum | Safe-to-Spend figure (scales per §8) |
| Money XL | JetBrains Mono | 40px | 450 | 1.0 | −0.01em tnum | Large single figures elsewhere |
| Money MD | JetBrains Mono | 15px | 450 | 1.4 | tnum | Ledger rows, stats |
| Money SM | JetBrains Mono | 13px | 450 | 1.4 | tnum | Compact amounts |

Money formatting: Indonesian style always — `Rp8.003.500`, negative as `−Rp685.000` (true minus sign), zero decimals unless cents exist.

## 4. Component Stylings

Every component implements five states without exception: **Empty · Loading · Success · Filled · Error**. Listed as `states:` per component below.

### Buttons

**Primary (Ink Fill)** — background `var(--ink)`, text `var(--canvas)`; radius `pill`; padding 10px 20px; Body SM weight 500. Hover: fill shifts to `color-mix(in srgb, var(--ink) 92%, var(--surface) 8%)`. Active: 98% scale. Disabled: `--surface-300` fill, `--smoke` text. Loading: inline 14px spinner replaces icon, label dims 60%, width locked.
states: empty n/a · loading spinner-lock-width · success brief check-icon swap (900ms) · filled default · error shake-×2 + tooltip.

**Secondary (Outline)** — transparent fill, 1px `--border-strong`, ink text. Hover: background `--surface-200`.
**Ghost** — no fill/border; ink-soft text; hover background `--surface-200`. For tertiary/dismiss.
**Danger Ghost** — ghost geometry, `--over` text, `--over-wash` on hover. Destructive affordances only, and destructive flows additionally require typed confirmation elsewhere in the product — the button alone is never the gate.

### Chips & Badges

Category chips: pill, `--surface-200` fill, ink-soft text, 12px, padding 3px 10px. Status badges swap semantics per the Text-color law: safe/warn/over **`-text` variants** for label text over matching tint-wash backgrounds — never raw accent hues as text. Source chips add a leading 14px type-glyph (cash/bank/ewallet icons).
states: filled default · loading skeleton-pill pulse · empty rendered only when a value exists (never show empty chips) · success pop-scale on newly applied filter · error n/a.

### Cards

Background `--surface`, radius 20px, padding 24px, 1px `--border` ring. Hover (interactive cards only): ring becomes `--border-strong`; **no shadow lift**. Nested sections inside a card use `--surface-100` wells.
states: empty → centered ash-tone glyph + one-line copy + optional action link; loading → skeleton blocks matching final layout exactly; success → 900ms `--safe-wash` background wash then settle; filled default; error → inline banner strip inside card, over-wash, retry link.

### Inputs & Forms

Wells: `--surface-200` fill, radius 12px, 1px transparent border, 12px 14px padding. Focus ring: inner `box-shadow: 0 0 0 1px var(--border-strong)` plus outer `0 0 0 3px var(--safe-wash)`. Placeholder `--smoke`. Validation error: border paints `--over`, message in 12px under field with contextual copy from the product copy deck.
- **Segmented direction control** (in/out/transfer): track `--surface-300`, thumb `--surface` sheet with hairline ring; selected segment label 500.
- **Amount field**: always the mono voice, right-aligned, `Rp` prefix slot.
- **Selects** render as wells with chevron; selected value never duplicates placeholder smoke color.
- Label convention: sentence-case Body SM (weight 500) above field; helper/caption below in `--muted`. Tracked-uppercase Micro-labels are reserved for table column heads, not forms or stats.
states: five mandatory, including per-field error with contextual copy from `docs/stitch-prompts.md` copy deck.

### Sidebar Navigation (app shell, desktop)

Fixed left rail 240px, `--canvas` background, right edge 1px `--border`. Items: 36px height, 12px radius, Body SM; inactive `--muted`; hover `--surface-200`; **active = `--surface` sheet + 1px ring + ink text**. Badge counts: pill 18px, `--over-wash` fill with over-text when non-zero (Needs-Review, Hold Queue); hidden entirely when zero. Bottom of rail: user/settings cluster.
Mobile (<768px): same IA collapses into bottom navigation — Overview, Transactions, Add (center, primary-ink circular FAB), Analytics, More.
states: filled default · empty = zero-count badges hidden entirely · loading n/a (shell persists) · error session-expired inline strip at rail bottom.

### Ledger Row (transaction)

Height 46px, grid: [status dot 8px] [merchant + timestamp stack] [category chip] [source chip] [signed Money MD right-aligned]. Separators 1px `--border` between rows only, not boxed cards. Needs-review dot `--warn`; clean `--ash` at 40%; reversed transactions get strike-through original + linked-reversal chip. Trailing inline actions (edit, reverse, delete) reveal on hover **and** on keyboard focus (`tr:focus-within`) — identical fade-slide in over the whitespace right of the source chip; they are reachable by tab alone. Every icon-only action carries an explicit accessible name (`aria-label="Ubah {merchant}"`, `"Hapus {merchant}"`, …). Whole-row click opens edit; hit areas ≥44px at every breakpoint (see §8).
states: empty screen-level ("Belum ada transaksi…"); loading shimmer row ×8 preserving grid columns; success post-write 900ms safe-wash; filled; error per-action toast.

### Progress Bars (budgets)

Track 8px `--surface-300` radius-full; fill dynamic: `--safe` <80%, `--warn` 80–99%, `--over` ≥100%. Spent÷limit printed as Money SM pair beside it; threshold badge ("80%", "100%") is badge-chip, dashboard-only signal.
states: filled default · loading skeleton track at final geometry · empty not rendered (no budget row exists) · error n/a.

### Modals, Drawers, Popovers

`--sheet` background, radius 24px. **Scrimmed floaters (modals, drawers): shadow-only Level 3 — no ring** behind a scrim an edge just doubles itself. Unscrimmed floaters (popovers, tooltips): keep the 1px `--border` ring and halve the Level 3 blur/y-offset. Scrim `rgba(28,25,19,0.32)` light / `rgba(0,0,0,0.5)` dark. Drawer slides 240ms cubic-bezier(0.2, 0.8, 0.2, 1).
states: filled default · loading content-area skeleton inside the sheet · success auto-close with brief safe-wash flash · error inline error block within sheet (never closes itself).

### Stat Block (hero cluster)

Structure: sentence-case caption label ("Safe-to-Spend", weight 500, no tracking — never an uppercase eyebrow) → Money Hero figure → delta/sub-caption in caption size. Healthy STS: figure `--safe-text`; thin: `--warn-text`; negative runway: `--over-text`.
states: five mandatory — empty = zero-Sources state links to onboarding; loading skeleton lines matching final heights; success n/a (live value); filled default; error last-known value + muted stale caption.

### Toasts

Bottom-right floating sheet, radius 16px, unscrimmed-floater treatment (1px `--border` ring + half-strength Level 3 shadow), auto-dismiss 4s, one visible at a time.
states: filled neutral variant · success variant check-glyph + safe accent edge · error variant over-tone + retry link (does not auto-dismiss).

### Empty-state pattern (product-wide)

No illustrations. Layout = 40px ash glyph → heading-sm copy → one supporting caption → optional ghost action. Copy deck supplies exact strings (e.g., "Belum ada transaksi. Mulai catet lewat WhatsApp.").

### Skeleton rule

Skeletons reproduce final geometry *exactly* (same heights, radii, gaps) in `--surface-200`, animated as a left-to-right `--surface-100` shimmer, 1.4s loop. Never spinners for lists/charts; spinners belong only inside buttons.

### Charts (ECharts conventions)

Gridlines: 1px dashed `--border`, horizontal only. Axis labels: caption size, `--muted`; currency ticks in mono. Tooltip: floating sheet card, unscrimmed floater treatment (ring + halved Level 3 shadow), title Body SM 500 + rows label:value with values mono-aligned. Reference line: `--safe` dashed. Anomaly day markers: `--over` 6px dots above bars. Heatmap: cell radius 4px, gap 3px; anomaly cells inherit over-dot. Legends are plain text rows, never colored boxes larger than 8px squares.

## 5. Layout Principles

Base unit **4px**; fine sub-scale 2·3·5 for icon/text micro-alignment; ladder 8·12·16·20·24·32·40·56·72·96.

Desktop app shell: fixed 240px sidebar + fluid main, main content max-width 1160px with 40px gutters. Two rhythms:

- **Overview rhythm:** hero block gets 72px top clearance, stat gap 24px, sections separated by 96px breathing bands using `--surface-100` full-bleed strips.
- **Ledger rhythm:** toolbar sticky under a 64px header; row groups separated by day-sticky headers (`--canvas` background blur); internal gaps 0 (rows touch via separators).

Whitespace philosophy: emptiness is warm because the canvas is cream. Density is earned — compactness belongs to ledgers, generosity belongs to decisions. Never mix rhythms inside one viewport region.

Breakpoint summary lives in §8.

## 6. Depth & Elevation

Hierarchy = tonal layering + hairline rings. Shadows are scarce and atmospheric.

| Level | Treatment (light / dark) | Use |
|---|---|---|
| 0 Flat | none | page, text |
| 1 Ring | `0 0 0 1px var(--border)` | cards, inputs resting |
| 2 Hover | light `0 2px 8px rgba(28,25,19,0.05)` · dark `0 2px 10px rgba(0,0,0,0.35)` | interactive card hover |
| 3 Floating (scrimmed) | shadow only — **no ring**: light `0 12px 32px rgba(28,25,19,0.14), 0 2px 8px rgba(28,25,19,0.06)` · dark `0 16px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)` | modals, drawers — anything behind a scrim |
| 3·f Floater (unscrimmed) | ring `0 0 0 1px var(--border)` + Level 3 shadow at half blur/y-offset | popovers, tooltips, toasts |
| Focus | `0 0 0 3px var(--safe-wash)` + inner border-strong | keyboard focus everywhere |

Edge/elevation law: **a surface commits to one depth signal** — a defined ring *or* a soft wide shadow, never both at full strength. Rings describe docked structure; shadows describe lift. Behind a scrim the ring is redundant; without one it is what keeps the floater legible. Blurs stay wide and opacities low so sheets feel placed, not dropped; if a docked element ever wants a Level 2+ shadow while sitting in flow, that's a layout smell: promote it to `--sheet` on `--surface` instead.

## 7. Interaction & Motion (extension)

Grammar, not decoration:

| Interaction | Spec |
|---|---|
| Color/hover transitions | 150ms ease |
| Elevation changes | 200ms ease-out |
| Modal enter | 240ms cubic-bezier(0.2, 0.8, 0.2, 1); exit 160ms |
| Success flash (card writes, form saves) | background → wash color 120ms, hold 700ms, decay 500ms |
| Action reveal (ledger hover) | opacity + translateX(4px), 120ms |
| Filter chip apply | scale 0.96→1 with ease-out-expo, 180ms (no overshoot) |
| Skeleton shimmer | 1.4s linear infinite loop |

Hover semantics: primary buttons darken fill (not brighten); rows expose actions in-place; links underline with 2px offset rather than recolor — color-coding stays semantic. Focus is always visible: 3px safe-wash ring, keyboard-first honored throughout. Honor `prefers-reduced-motion`: kill shimmer, scale pops, and slide-ins; keep opacity fades ≤120ms. Nothing ever bounces twice; celebration is a single wash, in keeping with calm-over-alarm.

## 8. Responsive Behavior

| Breakpoint | Shell change |
|---|---|
| ≥1280px | Full: 240px sidebar, 1160px content max, 40px gutters |
| 1024–1279px | Identical; grid columns compress 2→2 with tighter gutters (24px) |
| 768–1023px | Sidebar collapses to 72px icon rail with tooltips; chart grids stack |
| <768px | Bottom navigation (Overview · Transactions · Add-FAB · Analytics · More); long-tail screens under More; 16px gutters; day-group headers become sticky pills |

Touch targets ≥44px at **every** breakpoint — never hover-only affordances: inline row actions render persistently under 1024px and are always reachable via keyboard focus everywhere. Ledger rows grow to 52px below 1024px. Hero money figure scales 56→44→34px across the three lower bands; stat pairs stack vertically. Tables transform: hidden columns fold into an expandable row-detail drawer rather than horizontal scroll — only chip filters may scroll horizontally. Modals become full-height sheets from the bottom. The heatmap swaps year-grid for a trailing-90-day strip.

## 9. Do's and Don'ts

Do: cream canvas always · alpha-ink borders · semantic-only color · accent text only via `-text` variants · mono for every rupiah incl. the hero figure · pill controls vs quiet rectangles · skeletons matching final geometry · one focal point per overview screen.
Don't: pure white/black surfaces · bold ≥600 · gray constant borders · decorative gradients/glows · colored decoration without meaning · raw `--safe/--warn/--over` as reading text · ash for anything a user must read · uppercase eyebrows above the hero number · illustration-heavy empties · push-style banners (alerts live as badges) · emoji anywhere in UI · mixing hero and ledger densities in one region · horizontal-scrolling data tables · hover-only affordances.

## 10. Agent Prompt Guide

Never place raw hex/fonts/radii inside a generation prompt when this design system is attached — refer semantically ("positive accent", "warning tone", "sheet surface"). On-screen copy is Indonesian-first; core strings appear inline below and in the product copy deck. Entity language law: **Source** (never account/wallet/vault). All money uses tabular mono with true minus `−`.

### Quick reference (semantic)

- Page = cream canvas · card = surface sheet · structure = hairline ink ring
- Positive/safe = `--safe` (text `--safe-text`) · thin = `--warn` (text `--warn-text`) · over/error = `--over` (text `--over-text`)
- Text steps: ink → ink-soft → muted → ash
- Money = mono voice, tabular; UI = Inter; weights ≤590

### Example component prompts

1. "Hero stat block on the Overview: sentence-case caption label 'Safe-to-Spend' (weight 500, no tracking), below it the amount `Rp8.003.500` in the money monospace voice at hero size in the safe-text variant, negativity rendered as `−Rp…`; beneath, two small paired stats 'Runway 34 hari' and 'Jatah harian Rp266.800 / hari' in body-sm."
2. "Ledger row: 46px tall, leading 8px status dot, merchant 'Kopi Kenangan' with caption timestamp 'Hari ini · 08.14', category chip 'Makanan & Minuman', source chip 'Cash', right-aligned signed amount `−Rp25.000` in the money mono voice; 1px hairline separator below; three ghost icon actions with accessible names revealed on hover or keyboard focus after the source chip."
3. "Budget card: heading-sm category 'Makanan & Minuman', spent ÷ limit as `Rp1.284.000 / Rp1.500.000` money-pair, 8px rounded progress bar at 86% filled with warning tone and a small '80%' threshold badge in warning-text variant, overflow menu top-right."
4. "Source card for BCA: bank-type glyph, name, computed balance `Rp8.420.000` money mono right-aligned, thin balance bar beneath, overflow menu (rename · adjust balance · archive); ring-border card, no hover shadow."
5. "Empty transactions panel: centered ash-tone inbox glyph, heading 'Belum ada transaksi', caption 'Mulai catet lewat WhatsApp.', ghost button 'Buka panduan'."
6. "Confirmation dialog for delete: sheet-radius modal, heading 'Hapus \"Kopi Kenangan 25.000\"?', body caption explaining 30-day restore window, ghost 'Batal' + danger-ghost 'Hapus'; typed confirmation not shown here — outside flow."

### Theme handoff for generators

Dual-theme is mandatory context: generate light by default; when asked for dark, invert per the palette table (cream↔charcoal, luminosity-lifted semantic trio), keeping ring/border alpha strategy identical.
