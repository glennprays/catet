# catet — Stitch Generation Runbook

Paste-ready prompts for generating all 10 screens in Google Stitch, one at a time,
in dependency order. Prompts are verbatim copies from `docs/stitch-prompts.md`
(that file remains the editing source of truth — change prompts THERE, then sync here).

## Setup (once)

1. Project: **catet — Paper Editorial v2** (`projects/8388192028915929441`) —
   created fresh so no screen inherits conventions from earlier generations.
   Two older projects are now obsolete ("catet — Paper Editorial" and the
   original contaminated one); delete both from the Stitch dashboard when convenient.
2. Attach the design system built from `/home/glenn/projects/catet/DESIGN.md`.
3. If the UI asks for a brand/primary color while parsing: enter `#178269`.
4. Sanity-check the parsed theme shows canvas `#f2f1ee`, ink `#26231d`,
   Hanken Grotesk as the single type family (no monospace) before generating
   anything.

## Rules during generation

- Generate screens **strictly in the order below** — later screens inherit the
  shell and component conventions established by earlier accepted ones.
- One screen at a time. After each generation, run that screen's checkpoint
  (one line under each prompt) before moving on. Fix with a targeted edit,
  or regenerate once, before proceeding.
- Never append hex codes, font names, or radii to a prompt — the attached design
  system owns all tokens. If tabular figures render as monospace or wrong-face,
  fix by strengthening the DS attachment, not by injecting font names into prompts.
- **Data discipline:** every paste block ends with a `SAMPLE DATA` tail. These are
  the ONLY records the screen may show — no invented merchants, balances, or other
  filler. Figures are internally consistent across screens (assets total
  Rp9.073.500, reserved tomorrow Rp1.070.000, Safe-to-Spend Rp8.003.500).
- **Painter, not micromanager:** prompts give vision, principles, and
  ingredients — the attached design system owns component specs, radii, and
  rhythm. Never re-dictate pixels, fonts, or exact orderings in a prompt;
  requirements are the *what*, the generator owns the *how*.
- **Role + validation framing:** every block opens by casting the generator as
  an expert front-end design agent bound to the design system (anti-drift), and
  closes with a self-validation requirement — the model checks its own render
  against the DS and the data before finishing.
- **Self-contained prompts:** every block opens with an identical context
  header on purpose — each generation runs in isolation inside Stitch, so the
  product's identity travels with its prompt. Paste blocks whole.

---

## Phase 1 — Calibration

### Screen 1 · Overview

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
ANCHOR: this is the FIRST screen of the set; everything established here (app
shell, spacing rhythm, component styling) becomes the visual reference the nine
screens generated after you will follow.
PURPOSE: Hero glance — one number answers "how much can I safely spend today".
The user should leave knowing whether today is a spend-carefully or
spend-freely day, in one glance, without reading anything else.

MODULES (required — arrange per the design system's rhythm):
1. App shell with the accounts rail, active "Overview"; Needs-Review and Hold
   Queue carry small count badges.
2. Stat strip: Safe-to-Spend as the focal figure with Runway, Jatah harian and
   Tereservasi besok beside it — the number answers "how much can I safely
   spend today".
3. Quick-actions grid: Tambah · Transfer · Bayar tagihan · Perbaiki kategori ·
   Rekap mingguan · Lihat semua.
4. 4-week daily-spend chart with today's Safe-to-Spend as a reference line.
5. Tereservasi besok (tomorrow's reserved bills) beside a Minggu ini glance.
6. Recent transactions preview (last 5) with a link to Transactions.

INTERACTIONS: hero stat tooltips explaining formula; chart hover shows day detail;
sidebar navigation; "Lihat semua" navigates to Transactions.
STATES: empty ("Belum ada transaksi. Mulai catet lewat WhatsApp."), loading
(skeleton hero + shimmer bars on chart), error (inline banner with retry).
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: hero figures Safe-to-Spend Rp8.003.500 (healthy teal) · Runway 34
hari · Jatah harian Rp266.800 / hari. Tereservasi besok list: Kos Rp750.000 ·
Internet Rp320.000. Minggu ini glance: spend Rp612.000 · top category Makanan &
Minuman · 2 belum kategori. Recent 5 rows: Kopi Kenangan −Rp25.000 (Cash) · Gojek
−Rp18.000 (GoPay) · Indomaret −Rp45.000 (Cash) · Gaji +Rp8.500.000 (BCA) ·
Pertamina −Rp30.000 (Cash); first row timestamped "Hari ini · 08.14".
```

Checkpoint: stat strip is compact with ~40px figure in tabular sans (never
monospace) · quick-actions grid of 6 tiles present · dense page — sections
≤24px apart, no oversized whitespace · accounts rail shows balances grouped
Aset/Utang with totals footer · page background warm cream · preview amounts
tabular right-aligned · no gradients/glow/purple anywhere.

### Screen 2 · Transactions

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Compact, scannable ledger feed — the densest screen in the app. This
is the weekly-review workhorse: find a row, fix its category, move on. Density
and speed beat decoration here.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Transactions".
2. Toolbar: search input (placeholder "Cari merchant atau catatan…"), filter chips
   (Source picker, category subtree, tag, date range, direction, review status),
   primary pill button "+ Tambah".
3. Grouped feed table: one continuous dense table — ~36px rows, zero filler
   spacing between groups; day-group headers; each row = status dot (clean /
   needs review), merchant, category chip, source name, signed amount
   right-aligned in tabular figures; inline actions (edit, delete, reverse)
   reveal on hover and on keyboard focus, with accessible names; permanently
   visible under 1024px.
4. Pagination footer.
5. Restore-bin link in toolbar overflow ("Sampah") showing soft-deleted rows with
   restore action and remaining restore-window time.

INTERACTIONS: row click opens a quick-edit sheet (amount, date, category, note
only); overflow menu "Ubah lengkap" opens a full edit page carrying amount,
Source select, direction, category, merchant, note, date, tags, reversal link,
adjustment entry, and edit history; delete asks named confirmation; keyboard
focus visible throughout.
STATES: empty, loading skeleton rows, filled, error banner, restore bin empty state.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: rows in day groups — Hari ini: Kopi Kenangan −Rp25.000 (Makanan &
Minuman, Cash) · Gojek −Rp18.000 (Transportasi, GoPay). Kemarin: Gaji
+Rp8.500.000 (Gaji, BCA) · Indomaret −Rp45.000 (Belanja, Cash) · Pertamina
−Rp30.000 (Transportasi, Cash). Sebelumnya: Tokopedia −Rp150.000 (Belanja,
SPayLater — needs-review warning dot) · Laundry Kilat −Rp20.000 (Kos, Cash) ·
Kos −Rp750.000 (Kos, BCA, matched bill chip) · Spotify −Rp54.999 (Hiburan,
GoPay) · Sepatu −Rp800.000 (Belanja, SPayLater) · Pulsa −Rp50.000 (Tagihan,
GoPay) · Transfer BCA→GoPay +Rp200.000/−Rp200.000 (transfer chip, bukan
pengeluaran).
```

Checkpoint: rows are hairline-separated (never boxed cards) · consistent row
grid dot → merchant → category chip → source chip → tabular-sans amount · primary button
is ink-fill pill.

### Screen 3 · Sources

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Places money lives, balances, and movements between them. Debt
visibility is the emotional core of this screen: two negative paylater balances
exist in the sample on purpose, rendered as information not shame.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Sources".
2. Summary strip: total available, combined debt exposure (danger tone when > 0),
   last-reconciled freshness captions per Source.
3. Source cards grid: each card shows name, type icon (cash / bank / ewallet /
   custom), ledger-computed balance, negative balances styled in danger tone with
   a "Debt Source" tag, hairline balance bar, overflow menu (rename, adjust
   balance, archive).
4. Action row: primary button "+ Source baru", secondary button "Transfer".
5. Transfer wizard (modal): From select → To select → amount → summary line
   "BCA −Rp500.000 → GoPay +Rp500.000" → confirm.

INTERACTIONS: adjust-balance writes an Adjustment Entry and shows an audit
explainer; archived sources collapse into a muted section; every destructive
action names the record being changed.
STATES: no-sources onboarding empty state pointing at first-run setup, loading,
filled, error.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: cards — BCA Rp8.420.000 (bank) · Cash Rp340.000 (cash) · GoPay
Rp215.500 (ewallet) · ShopeePay Rp98.000 (ewallet) · SPayLater −Rp1.240.000
(Debt Source tag, danger tone) · Kredivo −Rp685.000 (Debt Source tag). Summary
strip: total available Rp9.073.500 · debt exposure Rp1.925.000 in danger tone.
Transfer wizard example line: "BCA −Rp500.000 → GoPay +Rp500.000".
```

Checkpoint: negative balances carry danger-tone TEXT variant plus "Debt Source"
tag · cards are ring-only (no hover shadow lift) · balances tabular right-aligned.

---

## Phase 2 — Planning

### Screen 4 · Categories

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Hierarchy editor with essential flags and safe restructuring.
Restructuring must always preview its blast radius (affected transactions)
before committing.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Categories".
2. Toolbar: search, "+ Kategori baru", bulk actions menu (merge, re-parent,
   apply-rules-to-history — disabled until selection exists).
3. Tree view: parent rows expandable, child rows indented; each row has essential
   toggle (semantic positive accent when on), transaction count, edit menu
   (rename, re-parent, merge into…, split, archive).
4. Merge flow (modal): pick surviving category, show affected transaction count,
   require typed confirmation of the category name.

INTERACTIONS: drag handles for re-parenting; merge/split previews counts before
committing; retroactive recategorization shows progress then success toast.
STATES: empty tree with starter suggestions, loading, filled, error, merge
confirmation state.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: tree — Makanan & Minuman (essential; children: Kopi 142 tx ·
Warung 89 tx) · Transportasi (essential, 203) · Kos (essential, 58) · Tagihan
(essential, 41) · Hiburan (77) · Belanja (66) · Gaji — income (12). Merge modal
example: merging "Warung" into "Makanan & Minuman" affects 89 transaksi.
```

Checkpoint: essential toggle uses the safe accent as a FILL/state, toggle labels
stay readable · merge modal demands typed confirmation · counts in tabular digits.

### Screen 5 · Bills & Calendar

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Expected obligations feeding reservations and the due calendar. A
glance answers: what is due, when, and from which Source it will be paid.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Bills & Calendar".
2. Month calendar view: due-date dots sized by amount, today highlighted; clicking
   a day opens its bill list panel on the right.
3. Side panel: bills due that day (name, amount band, linked Source) with actions
   "Tandai lunas" and "Edit".
4. Bill list table under calendar: name, cadence, next due, est amount, active
   toggle, match status caption ("Auto-match aktif" / manual).
5. Primary button "+ Tagihan baru" opening form (name, amount min–max band,
   cadence, next due, linked Source, optional category).

INTERACTIONS: calendar month paging; marking paid confirms with the named bill;
inactive bills render muted and stop feeding reservations.
STATES: empty ("Belum ada tagihan"), loading, filled, error, paid-state success
micro-interaction.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: bill rows — Kos (bulanan, tgl 1, Rp700.000–750.000, BCA) ·
Internet (bulanan, tgl 5, Rp300.000–320.000, BCA) · Spotify (bulanan, tgl 15,
Rp54.999, GoPay). Calendar sample: dots on tgl 1 and 5 sized by amount; today
highlights mid-month.
```

Checkpoint: day detail is a side panel (not stacked modals) · inactive bills mute
without disappearing · "Tandai lunas" success reads as a single calm wash.

### Screen 6 · Budgets

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Per-category monthly limits with threshold badges — pull-only, never
pushy. Badges inform at a glance; nothing nags, pings, or pushes here.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Budgets".
2. Period selector (month).
3. Budget cards list: category name, spent ÷ budget figures in tabular numerals,
   progress bar turning warning tone ≥80% and danger tone ≥100%, threshold badge
   ("80%", "100%"), overflow menu (edit, delete).
4. Suggestion strip: system-proposed next-month amounts from trailing average,
   each with "Pakai saran" accept affordance, marked auto_suggested until edited.
5. Primary button "+ Budget baru".

INTERACTIONS: inline editing of budget amounts; rollover toggle per budget;
threshold states are badges on this screen only — no notifications anywhere.
STATES: empty ("Belum ada budget — pakai saran otomatis?"), loading, filled,
error.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: budget cards — Makanan & Minuman Rp1.284.000 / Rp1.500.000 (86%,
warning bar + "80%" badge) · Transportasi Rp310.000 / Rp600.000 (52%, safe
bar) · Kos Rp750.000 / Rp750.000 (100%, danger bar + "100%" badge). Suggestion
strip example: "Hiburan — saran bulan depan Rp350.000" with "Pakai saran".
```

Checkpoint: progress fill colors are the raw accents; threshold BADGE labels use
the darker accessible text variants · spent÷limit pair tabular · no banner/notification
chrome anywhere.

---

## Phase 3 — Analysis

### Screen 7 · Analytics

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Deep charts — breakdown, patterns, anomalies. Editorial spacing above,
dense charts below. Pattern-finding without dashboard fatigue.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Analytics".
2. Period selector row (week / month / quarter / year).
3. Chart grid (two columns):
   - Category donut with hierarchical drill-down; breadcrumb trail when drilled;
     leaf totals always sum to parent slice.
   - Income-vs-expense weekly timeline (two series bar+line).
   - Daily heatmap (year of outflow intensity; anomaly days carry a badge; click
     opens flagged-days list drawer).
   - Top merchants ranked list.
   - Essential-vs-Lifestyle split bar (static flags snapshot).
4. Anomaly drawer content: flagged dates with z-score context and jump-link to
   that day's transactions.

INTERACTIONS: cross-filtering from donut slices into Transactions; tooltips on
all series; period switch refetches series.
STATES: empty ("Data masih tipis. Catet dulu beberapa hari."), loading skeletons
per chart tile, filled, error tile with retry.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: period Agustus 2026. Top merchants: Indomaret Rp612.000 · Kopi
Kenangan Rp340.000 · Gojek Rp285.000 · Pertamina Rp180.000. Donut: Makanan &
Minuman Rp780.000 · Transportasi Rp420.000 · Belanja Rp305.000 · Kos Rp750.000
· Hiburan Rp480.000 (over-budget slice in danger tone only). Heatmap: anomaly
badges on tgl 9 and tgl 17. Essential-vs-Lifestyle split 62% / 38%.
```

Checkpoint: gridlines horizontal-only dashed hairlines · currency ticks tabular ·
donut starts from warm neutrals (red slice only for over-budget categories) ·
heatmap ramps canvas→amber, zero days read as plain background · anomaly markers
small solid danger dots.

---

## Phase 4 — Long-tail

### Screen 8 · Needs-Review

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: The weekly ritual's queue — low-category-confidence transactions awaiting
a one-click fix. Clearing the queue is a small quiet win, not a celebration.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Needs-Review" with count badge.
2. Ritual header: "X transaksi belum yakin kategori minggu ini" plus progress
   caption; completing all items shows a quiet success confirmation.
3. Review list: each row shows the parsed transaction (merchant, amount, Source,
   captured wording) and an inline category picker pre-seeded with the model's
   best guess plus three likely alternatives from user history.
4. Actions per row: pick category (writes through, provenance becomes "user"),
   skip, open the full edit page.

INTERACTIONS: bulk-fix repeated merchants ("Terapkan ke 6 transaksi serupa");
resolving updates counter instantly.
STATES: clean-empty ("Semua beres, tidak ada yang menunggu."), loading, filled,
error.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: header "2 transaksi belum yakin kategori minggu ini". Rows —
"kopi kenangan 25rb" (−Rp25.000, Cash; guess Makanan & Minuman) with
alternatives Hiburan · Belanja · Tagihan · "tokopedia 150rb" (−Rp150.000,
SPayLater; guess Belanja) with alternatives Hiburan · Tagihan · Kos. Bulk-fix
affordance example: "Terapkan ke 6 transaksi serupa".
```

Checkpoint: queue rows reuse the calibrated ledger-row DNA · picker shows guess +
alternatives without dropdown clutter · completion confirmation stays quiet
(single wash, no confetti/animation).

### Screen 9 · Hold Queue

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Drafts parked by the fail-closed gate + chat actions awaiting named
confirmation. Same confirmations resolvable here as in WhatsApp chat — this is
the web twin of the bot's confirmation flow, not a separate system.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Hold Queue" with count badge.
2. Tab strip: "Draft" | "Menunggu konfirmasi".
3. Draft tab: parse-result cards showing the raw message, extracted fields with
   unresolved ones outlined in warning tone, question the bot asked, and inline
   resolution inputs (source picker, amount fix, destination pick) — answering
   here completes the write with provenance stamp shown.
4. Confirmation tab: parked Tier 1–3 actions rendered as "intent cards" naming the
   exact record and change, with Setujui / Tolak buttons mirroring ya/tidak.

INTERACTIONS: resolving a draft turns its card green then archives it; rejecting
asks nothing further — instant.
STATES: empty queue, loading, filled, error.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: Draft tab — card one: raw message "kopi 25k bayar 50k", extracted
amounts Rp25.000 + Rp50.000 with role field unresolved (outlined warning), bot
question "Mana yang dibayar, kopi atau bayar 50k?", inline resolution inputs;
card two: raw message "pindah 500k", amount resolved, destination Source
unresolved, question "Pindah ke Source mana?", destination picker input.
Confirmation tab — intent card: "Hapus 'Kopi Kenangan −Rp25.000'?" with caption
"Bisa dipulihkan 30 hari" and Setujui / Tolak; intent card: "Pindah Rp500.000
dari BCA ke GoPay?" with Setujui / Tolak.
```

Checkpoint: intent cards NAME the exact record ("Hapus 'Kopi Kenangan 25.000'?")
· unresolved fields outlined warn, resolved ones normal · Approve/Reject never
colored destructively except Reject-as-danger-ghost where shown.

### Screen 10 · Settings

```
PLATFORM: Desktop web application
ROLE: You are an expert front-end design agent. The attached design system is
the single source of visual truth — treat it as binding spec, never drift into
random layouts, generic padding, default palettes, or off-system type.
APP CONTEXT: catet — a self-hosted personal finance tracker for ONE person in
Indonesia. Daily spending is logged through a WhatsApp bot; this desktop
dashboard is where they see, plan, and clean up their money. UI copy is Bahasa
Indonesia; amounts are Rupiah (Rp8.003.500). Feel: compact, calm, trustworthy —
Wise's data-first clarity rendered on warm paper. A living money view, not a
marketing dashboard.
VOCABULARY: a place money lives is a "Source" (never account/wallet);
low-confidence category guesses wait in Needs-Review; drafted actions park in
Hold Queue until confirmed by name.
PRINCIPLES (non-negotiable): dense app-like rhythm — modules fill the
viewport, whitespace only groups · tables sit on the canvas with hairlines,
minimal cards · every number in tabular figures of the single sans (never
monospace) · color carries meaning only · every visible label — nav items,
buttons, headers, table heads — is Bahasa Indonesia (translate screen names) ·
the rail always shows name + balance rows, never icon-only stubs · reproduce
every figure and name in SAMPLE DATA verbatim — real household data, never
invent.
RAIL: left accounts rail (240px) is the money itself — Aset group (BCA
Rp8.420.000 · Cash Rp340.000 · GoPay Rp215.500 · ShopeePay Rp98.000), Utang
group (SPayLater −Rp1.240.000 · Kredivo −Rp685.000), pinned footer Total
tersedia Rp9.073.500 · Utang Rp1.925.000, then Kelola links to the screens.
Rail rows always show name + balance exactly as listed — icon-only or omitted
balances fail the generation.
ROADMAP: exactly these 10 screens exist; invent no others.
PURPOSE: Auth, provider config, tags, and planning inputs. Quiet utility styling
— read more than changed, every save confirms inline, secrets stay masked.

MODULES (required — arrange per the design system's rhythm):
1. App shell, active "Settings".
2. Sectioned form pages (left in-page anchor nav):
   - Autentikasi: passkey management list (register/revoke, last-used captions).
   - Model: LLM provider config readout (vision model, text model — config
     values, masked keys) with test-connection affordance.
   - Tagihan & reservasi: income horizon setter ("Perkiraan income berikutnya ~__
     hari") with explainer text.
   - Tag: namespaced tag table (trip:bali, social, impulsive) create/rename/delete.
   - Data: backup status, export CSV, danger zone (deactivate catet) behind named
     confirmation.

INTERACTIONS: every save gives inline success confirmation; masked secrets
reveal-on-demand only; test-connection shows provider latency result inline.
STATES: per-section empty/loading/filled/error.
VALIDATION: before finishing, re-check your render against the design system
and this brief — palette, type scale, radii, rhythm, Bahasa copy, and the
verbatim SAMPLE DATA below; correct any deviation.
SAMPLE DATA: Autentikasi — passkey "Pixel 8" last used "Hari ini · 08.02",
button "Tambah passkey". Model — Vision model "gemini-3.1-flash-lite", Text
model "gpt-4o-mini", API key "••••••••••••3f9a" with reveal affordance, button
"Tes koneksi". Tagihan & reservasi — horizon setter showing "~30 hari". Tag —
rows trip:bali · social · impulsive. Data — backup status "Berhasil · 02.00",
"Ekspor CSV" ghost button, danger zone "Matikan catet…" behind typed
confirmation.
```

Checkpoint: masked keys stay masked · every save confirms inline · danger zone
names the action and lives behind typed confirmation flow · forms follow the
sentence-case-label input pattern from Phase 1.

---

## After each generation

Send me the screen name — I pull it back via MCP (`get_screen`) and score it against
the checkpoint line above plus the standing red-lines (cream canvas present, tabular-sans figures everywhere — never monospace, hairline-only cards, no ring+shadow doubles, `-text` badge colors,
no uppercase eyebrows, no purple/glass/glow). Only then paste the next prompt.
