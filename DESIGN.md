# catet — Design System (DESIGN.md)

> Soft-friendly personal finance. A notebook on a desk, not a trading floor.
> Format follows the Stitch DESIGN.md specification extended to 9 sections.

---

## 1. Visual Theme & Atmosphere

catet is a **personal** money tool for one human being in Indonesia. The entire experience is built on a **warm cream canvas (`#f2f1ee`)** with **warm near-black ink (`#26231d`)** — never pure white, never clinical black. Every surface carries warmth: cards are barely-lighter cream, borders dissolve into transparent warm overlays of the ink tone, and even errors (`#cf3f52`) are warm crimson rather than alarm-red. The mood evokes a well-kept paper ledger and a morning coffee, not a Bloomberg terminal.

Two visual identities coexist by law:

1. **Editorial rhythm (Overview):** one oversized Safe-to-Spend figure dominates the screen; everything else whispers. High whitespace, a single focal point, generous padding.
2. **Ledger rhythm (Transactions, Bills):** dense, scannable rows at 44–48px with hairline separators, every amount in monospaced tabular figures aligned to the decimal.

Color is rationed to *meaning only*. Teal-green means safe. Amber means thin. Crimson means over. Nothing is colored for decoration — ~97% of the interface is achromatic warm grays, which makes the moment the accent appears feel like information arriving, not branding shouting.

Key characteristics:

- Warm cream canvas `#f2f1ee` — the whole system is warm-shifted; whiteness only for true elevated sheets
- Ink `#26231d` — warm near-black with a brown undertone; all borders are **alpha tints of this ink**, never gray
- Monospace voice reserved exclusively for money figures, IDs, timestamps (`tabular-nums`, always)
- Weight ceiling 590 — hierarchy comes from size and spacing, never bold
- Pill-shaped interactive controls against quiet rectangular structure
- Depth through tonal layering and hairline rings; heavy blur shadows reserved strictly for floating artifacts

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
| `--muted` | `#75706a` | Tertiary text, captions |
| `--ash` | `#9b968e` | Labels, inactive icons |
| `--smoke` | `#c3bdb4` | Placeholders, disabled text |
| `--sheet` | `#fffefc` | Floating sheets only (modals, popovers, tooltips) |
| `--safe` | `#178269` | SAFE state, positive deltas, healthy STS |
| `--safe-wash` | `rgba(23,130,105,0.10)` | Tint backgrounds behind safe signals |
| `--warn` | `#c47a12` | THIN state, 80–100% budgets |
| `--warn-wash` | `rgba(196,122,18,0.12)` | Tint backgrounds behind warn signals |
| `--over` | `#cf3f52` | OVER/error state, >100% budgets |
| `--over-wash` | `rgba(207,63,82,0.10)` | Tint backgrounds behind error |

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
| `--muted` | `#989184` | Tertiary text |
| `--ash` | `#6f695f` | Labels, inactive icons |
| `--smoke` | `#4f4a41` | Placeholders, disabled |
| `--sheet` | `#33302a` | Floating sheets |
| `--safe` | `#4ec79b` | SAFE state |
| `--safe-wash` | `rgba(78,199,155,0.12)` | Safe tint |
| `--warn` | `#e0a04c` | THIN state |
| `--warn-wash` | `rgba(224,160,76,0.14)` | Warn tint |
| `--over` | `#ff7a8c` | OVER/error |
| `--over-wash` | `rgba(255,122,140,0.12)` | Error tint |

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
- Income series: `--safe`; Expense series: `--over` at 80% opacity; Transfers excluded from spend math entirely
- Reference lines: `--safe`, dashed 4-4
- Heatmap ramp: `canvas → surface-300 → warn-wash → warn` (zero outflow renders as pure canvas)
- Donut slices: warm neutral ladder first (`ink-soft/muted/ash/smoke`), then safe, then warn — only if a slice needs alarming does red appear

### Quick color reference

- Light: background `#f2f1ee` · card `#faf9f6` · text `#26231d` · secondary text `#75706a` · safe `#178269` · thin `#c47a12` · over `#cf3f52`
- Dark: background `#201d19` · card `#2a2620` · text `#ece8df` · secondary `#989184` · safe `#4ec79b` · thin `#e0a04c` · over `#ff7a8c`

## 3. Typography Rules

Two voices. **Inter** speaks structure; **monospace speaks money**. There is no serif — this is a friendly tool, not a magazine.

### Voices

| Voice | Family | Fallbacks | Domain |
|---|---|---|---|
| UI/Display | Inter | system-ui, Segoe UI, Helvetica Neue | Everything structural |
| Numerals/Money | JetBrains Mono | ui-monospace, SFMono-Regular, Menlo | Every currency figure, IDs, timestamps |

Absolute rules:

1. **Every amount in the mono voice with `font-feature-settings: 'tnum'`.** No exceptions anywhere, including charts' axis ticks for currency.
2. Weights never exceed **590**. Bold is banned; hierarchy is size × spacing × color.
3. Display sizes carry negative tracking; body and below carry none or positive micro-tracking.

### Hierarchy

| Role | Font | Size | Weight | Line height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Hero figure | Inter | 64px | 500 | 1.05 | −0.03em | Safe-to-Spend only |
| Display | Inter | 44px | 500 | 1.08 | −0.022em | Screen titles |
| Heading | Inter | 30px | 500 | 1.15 | −0.018em | Section headers |
| Heading SM | Inter | 22px | 500 | 1.2 | −0.012em | Card headers |
| Subheading | Inter | 18px | 500 | 1.35 | −0.008em | Secondary emphasis |
| Body LG | Inter | 17px | 400 | 1.55 | normal | Lead copy |
| Body | Inter | 15px | 400 | 1.55 | normal | Default UI text |
| Body SM | Inter | 13.5px | 400 | 1.5 | 0.005em | Dense UI, meta |
| Caption | Inter | 12px | 400 | 1.4 | 0.01em | Timestamps, hints |
| Micro-label | Inter | 11px | 500 | 1.3 | 0.06em uppercase | Eyebrow labels, column heads |
| Money XL | JetBrains Mono | 40px | 450 | 1.0 | −0.01em tnum | Hero number itself |
| Money MD | JetBrains Mono | 15px | 450 | 1.4 | tnum | Ledger rows, stats |
| Money SM | JetBrains Mono | 13px | 450 | 1.4 | tnum | Compact amounts |

Money formatting: Indonesian style always — `Rp2.140.000`, negative as `−Rp685.000` (true minus sign), zero decimals unless cents exist.

## 4. Component Stylings

Every component implements five states without exception: **Empty · Loading · Success · Filled · Error**. Listed as `states:` per component below.

### Buttons

**Primary (Ink Fill)** — background `var(--ink)`, text `var(--canvas)`; radius `pill`; padding 10px 20px; Body SM weight 500. Hover: fill shifts to `color-mix(in var(--ink), var(--surface) 8%)`. Active: 98% scale. Disabled: `--surface-300` fill, `--smoke` text. Loading: inline 14px spinner replaces icon, label dims 60%, width locked.
states: empty n/a · loading spinner-lock-width · success brief check-icon swap (900ms) · filled default · error shake-×2 + tooltip.

**Secondary (Outline)** — transparent fill, 1px `--border-strong`, ink text. Hover: background `--surface-200`.
**Ghost** — no fill/border; ink-soft text; hover background `--surface-200`. For tertiary/dismiss.
**Danger Ghost** — ghost geometry, `--over` text, `--over-wash` on hover. Destructive affordances only, and destructive flows additionally require typed confirmation elsewhere in the product — the button alone is never the gate.

### Chips & Badges

Category chips: pill, `--surface-200` fill, ink-soft text, 12px, padding 3px 10px. Status badges swap semantics: safe/warn/over text+tint-wash backgrounds. Source chips add a leading 14px type-glyph (cash/bank/ewallet icons).
states: filled default · loading skeleton-pill pulse · empty rendered only when a value exists (never show empty chips) · success pop-scale on newly applied filter · error n/a.

### Cards

Background `--surface`, radius 20px, padding 24px, 1px `--border` ring. Hover (interactive cards only): ring becomes `--border-strong`; **no shadow lift**. Nested sections inside a card use `--surface-100` wells.
states: empty → centered ash-tone glyph + one-line copy + optional action link; loading → skeleton blocks matching final layout exactly; success → 900ms `--safe-wash` background wash then settle; filled default; error → inline banner strip inside card, over-wash, retry link.

### Inputs & Forms

Wells: `--surface-200` fill, radius 12px, 1px transparent border, 12px 14px padding. Focus: 1px `--accent-focused ring` — implement as `box-shadow: 0 0 0 1px var(--border-strong)` plus outer `0 0 0 3px --safe-wash`. Placeholder `--smoke`. Validation error: border paints `--over`, message in 12px under field.
- **Segmented direction control** (in/out/transfer): track `--surface-300`, thumb `--surface` sheet with hairline ring; selected segment label 500.
- **Amount field**: always the mono voice, right-aligned, `Rp` prefix slot.
- **Selects** render as wells with chevron; selected value never duplicates placeholder smoke color.
- Label convention: Micro-label above field; helper/caption below.
states: five mandatory, including per-field error with contextual copy from `docs/stitch-prompts.md` copy deck.

### Sidebar Navigation (app shell, desktop)

Fixed left rail 240px, `--canvas` background, right edge 1px `--border`. Items: 36px height, 12px radius, Body SM; inactive `--muted`; hover `--surface-200`; **active = `--surface` sheet + 1px ring + ink text**. Badge counts: pill 18px, `--over-wash` fill with over-text when non-zero (Needs-Review, Hold Queue); hidden entirely when zero. Bottom of rail: user/settings cluster.
Mobile (<768px): same IA collapses into bottom navigation — Overview, Transactions, Add (center, primary-ink circular FAB), Analytics, More.

### Ledger Row (transaction)

Height 46px, grid: [status dot 8px] [merchant + timestamp stack] [category chip] [source chip] [signed Money MD right-aligned]. Separators 1px `--border` between rows only, not boxed cards. Needs-review dot `--warn`; clean `--ash` at 40%; reversed transactions get strike-through original + linked-reversal chip. Hover reveals trailing inline actions (edit, reverse, delete) replacing nothing — they fade-slide in over the whitespace right of the source chip. Whole-row click opens edit modal.
states: empty screen-level ("Belum ada transaksi…"); loading shimmer row ×8 preserving grid columns; success post-write 900ms safe-wash; filled; error per-action toast.

### Progress Bars (budgets)

Track 8px `--surface-300` radius-full; fill dynamic: `--safe` <80%, `--warn` 80–99%, `--over` ≥100%. Spent÷limit printed as Money SM pair beside it; threshold badge ("80%", "100%") is badge-chip, dashboard-only signal.

### Modals, Drawers, Popovers

`--sheet` background, radius 24px, ring `--border`, shadow Level 3. Scrim `rgba(28,25,19,0.32)` light / `rgba(0,0,0,0.5)` dark. Drawer slides 240ms ease-out.

### Stat Block (hero cluster)

Structure: Micro-label caption → Money XL figure → delta/sub-caption in caption size. Healthy STS: figure `--safe`; thin: `--warn`; negative runway: `--over`.

### Toasts

Bottom-right floating sheet, radius 16px, Level 3 shadow, auto-dismiss 4s, one visible at a time.

### Empty-state pattern (product-wide)

No illustrations. Layout = 40px ash glyph → heading-sm copy → one supporting caption → optional ghost action. Copy deck supplies exact strings (e.g., "Belum ada transaksi — mulai catet lewat WhatsApp").

### Skeleton rule

Skeletons reproduce final geometry *exactly* (same heights, radii, gaps) in `--surface-200`, animated as a left-to-right `--surface-100` shimmer, 1.4s loop. Never spinners for lists/charts; spinners belong only inside buttons.

### Charts (ECharts conventions)

Gridlines: 1px dashed `--border`, horizontal only. Axis labels: caption size, `--muted`; currency ticks in mono. Tooltip: floating sheet card, Level 3 shadow, title Body SM 500 + rows label:value with values mono-aligned. Reference line: `--safe` dashed. Anomaly day markers: `--over` 6px dots above bars. Heatmap: cell radius 4px, gap 3px; anomaly cells inherit over-dot. Legends are plain text rows, never colored boxes larger than 8px squares.

## 5. Layout Principles

Base unit **4px**; fine sub-scale 2·3·5 for icon/text micro-alignment; ladder 8·12·16·20·24·32·40·56·72·96.

Desktop app shell: fixed 240px sidebar + fluid main, main content max-width 1160px with 40px gutters. Two rhythms:

- **Overview rhythm:** hero block gets 72px top clearance, stat gap 24px, sections separated by 96px breathing bands using `--fog` equivalent = `--surface-100` full-bleed strips.
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
| 3 Floating | light `0 12px 32px rgba(28,25,19,0.14), 0 2px 8px rgba(28,25,19,0.06)` · dark `0 16px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)` + ring `border` | modals, drawers, popovers, tooltips |
| Focus | `0 0 0 3px var(--safe-wash)` + inner border-strong | keyboard focus everywhere |

Blurs are wide and opacities low — sheets feel placed, not dropped. If an element needs a Level 2+ shadow while docked, that's a layout smell: promote it to `--sheet` on `--surface` instead.

Toots above must read "tooltips" conceptually — popover-class; treat equal to modals minus scrim.

## 7. Interaction & Motion

Grammar, not decoration:

| Interaction | Spec |
|---|---|
| Color/hover transitions | 150ms ease |
| Elevation changes | 200ms ease-out |
| Modal enter | 240ms cubic-bezier(0.2, 0.8, 0.2, 1); exit 160ms |
| Success flash (card writes, form saves) | background → wash color 120ms, hold 700ms, decay 500ms |
| Action reveal (ledger hover) | opacity + translateX(4px), 120ms |
| Filter chip apply | spring pop scale 0.96→1.02→1, 180ms |
| Skeleton shimmer | 1.4s linear infinite loop |

Hover semantics: primary buttons darken fill (not brighten); rows expose actions in-place; links underline with 2px offset rather than recolor — color-coding stays semantic. Focus is always visible: 3px safe-wash ring, keyboard-first honored throughout. Honor `prefers-reduced-motion`: kill shimmer, springs, and slide-ins; keep opacity fades ≤120ms. Nothing ever bounces twice; celebration is a single wash, in keeping with calm-over-alarm.

## 8. Responsive Behavior

| Breakpoint | Shell change |
|---|---|
| ≥1280px | Full: 240px sidebar, 1160px content max, 40px gutters |
| 1024–1279px | Identical; grid columns compress 2→2 with tighter gutters (24px) |
| 768–1023px | Sidebar collapses to 72px icon rail with tooltips; chart grids stack |
| <768px | Bottom navigation (Overview · Transactions · Add-FAB · Analytics · More); long-tail screens under More; 16px gutters; day-group headers become sticky pills |

Touch targets ≥44px under 1024px; ledger rows grow to 52px with action buttons permanently visible instead of hover-revealed. Hero figure scales 64→44→34px; stat pairs stack vertically. Tables transform: hidden columns fold into an expandable row-detail drawer rather than horizontal scroll — only chip filters may scroll horizontally. Modals become full-height sheets from the bottom. The heatmap swaps year-grid for a trailing-90-day strip.

## 9. Agent Prompt Guide

Never place raw hex/fonts/radii inside a generation prompt when this design system is attached — refer semantically ("positive accent", "warning tone", "sheet surface"). On-screen copy is Indonesian-first from the copy deck; prompts to generators are English. Entity language law: **Source** (never account/wallet/vault). All money uses tabular mono.

### Quick reference (semantic)

- Page = cream canvas · card = surface sheet · structure = hairline ink ring
- Positive/safe = `--safe` · thin = `--warn` · over/error = `--over`
- Text steps: ink → ink-soft → muted → ash
- Money = mono voice, tabular; UI = Inter; weights ≤590

### Example component prompts

1. "Hero stat block on the Overview: eyebrow micro-label 'SAFE-TO-SPEND' uppercase tracked, below it the amount Rp2.140.000 in the money monospace voice at hero size with `-Rp` negativity support, colored semantic-safe; beneath, two small paired stats 'Runway 34 hari' and 'Jatah harian Rp71.300 / hari' in body-sm."
2. "Ledger row: 46px tall, leading 8px status dot, merchant 'Kopi Kenangan' with caption timestamp 'Hari ini · 08.14', category chip 'Makanan & Minuman', source chip 'Cash', right-aligned signed amount `-Rp25.000` in the money mono voice; 1px hairline separator below; three ghost icon actions revealed on hover after the source chip."
3. "Budget card: heading-sm category 'Makanan & Minuman', spent ÷ limit as `Rp1.284.000 / Rp1.500.000` money-pair, 8px rounded progress bar at 86% filled with warning tone and a small '80%' threshold badge, overflow menu top-right."
4. "Source card for BCA: bank-type glyph, name, computed balance `Rp8.420.000` money mono right-aligned, thin balance bar beneath, overflow menu (rename · adjust balance · archive); ring-border card, no hover shadow."
5. "Empty transactions panel: centered ash-tone inbox glyph, heading 'Belum ada transaksi', caption 'mulai catet lewat WhatsApp', ghost button 'Buka panduan'."
6. "Confirmation dialog for delete: sheet-radius modal, heading 'Hapus \"Kopi Kenangan 25.000\"?', body caption explaining 30-day restore window, ghost 'Batal' + danger-ghost 'Hapus'; typed confirmation not shown here — outside flow."

### Guardrails (Do / Don't)

Do: cream canvas always · alpha-ink borders · semantic-only color · mono for every rupiah · pill controls vs quiet rectangles · skeletons matching final geometry · one focal point per overview screen.
Don't: pure white/black surfaces · bold ≥600 · gray constant borders · decorative gradients/glows · colored decoration without meaning · illustration-heavy empties · push-style banners (alerts live as badges) · emoji anywhere in UI · mixing hero and ledger densities in one region · horizontal-scrolling data tables.

### Theme handoff for generators

Dual-theme is mandatory context: generate light by default; when asked for dark, invert per the palette table (cream↔charcoal, luminosity-lifted semantic trio), keeping ring/border alpha strategy identical.
