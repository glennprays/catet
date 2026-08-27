# catet — Stitch Screen Prompt Deck

Preparation for Google Stitch UI generation. Pair with `DESIGN.md` at project root
(upload as the project design system via `manage-design-system`). This file supplies
the per-screen prompts, real copy, and sample data.

---

## Global conventions (read before any screen)

- **No theme leakage.** Never put hex codes, font names, or radii inside a generation
  prompt — the project design system owns tokens. Refer to them semantically only:
  "positive accent", "warning tone", "danger tone".
- **App shell (desktop):** fixed left sidebar (~240px) listing: Overview,
  Transactions, Sources, Categories, Bills & Calendar, Budgets, Analytics,
  Needs-Review, Hold Queue, Settings. Active item highlighted; badge count on
  Needs-Review and Hold Queue.
- **App shell (mobile):** same screens, bottom navigation with Overview /
  Transactions / Add / Analytics / More; long-tail screens live under "More".
- **Language:** prompts themselves are written in English for the generator;
  on-screen copy is Indonesian-first (bilingual fallback English), from the copy
  deck below. Do not invent copy.
- **Naming law (CONTEXT.md):** the entity is always a **Source** — never "account"
  or "wallet". Money figures use tabular numerals and Indonesian formatting
  (`Rp2.140.000`).
- **States:** every list/table/feed section must render Empty, Loading (skeleton),
  Filled, and Error variants per DESIGN.md §2.

Sample screen skeleton used by all prompts below:

```
PLATFORM: Desktop web application   (or: Mobile web application)
PAGE STRUCTURE:
1. ...
2. ...
INTERACTIONS: ...
STATES: empty · loading · filled · error
```

---

## 1. Overview

```
PLATFORM: Desktop web application
PURPOSE: Hero glance — one number answers "how much can I safely spend today".

PAGE STRUCTURE:
1. App shell: left sidebar navigation, active item "Overview"; Needs-Review and
   Hold Queue items carry small count badges.
2. Hero block (spacious, single focal point): the label "Safe-to-Spend" as a small
   caption above a very large Safe-to-Spend figure (teal when healthy, amber when
   thin). Beneath it two secondary stats side by side: "Runway" ("34 hari") and
   "Jatah harian" ("Rp71.300 / hari").
3. Reference-line chart card: 4-week daily-spend bar timeline with a flat horizontal
   positive-accent line marking today's Safe-to-Spend; caption explains days above
   vs below the line.
4. Two-column row: card "Terreserved besok" listing tomorrow's reserved bills
   (name, amount); card "Minggu ini" mini-glance (spend total, top category,
   uncategorized count).
5. Recent transactions preview (last 5 rows): icon, merchant, source chip, signed
   amount right-aligned; link "Lihat semua →" to Transactions.

INTERACTIONS: hero stat tooltips explaining formula; chart hover shows day detail;
sidebar navigation; "Lihat semua" navigates to Transactions.
STATES: empty ("Belum ada transaksi — mulai catet lewat WhatsApp"), loading
(skeleton hero + shimmer bars on chart), error (inline banner with retry).
```

## 2. Transactions

```
PLATFORM: Desktop web application
PURPOSE: Compact, scannable ledger feed — the densest screen in the app.

PAGE STRUCTURE:
1. App shell, active "Transactions".
2. Toolbar: search input (placeholder "Cari merchant atau catatan…"), filter chips
   (Source picker, category subtree, tag, date range, direction, review status),
   primary pill button "+ Tambah".
3. Grouped feed table: day-group headers; each row = status dot (clean / needs
   review), merchant, category chip, source name, signed amount right-aligned in
   tabular figures; hover reveals inline actions (edit, delete, reverse).
4. Pagination footer.
5. Restore-bin link in toolbar overflow ("Sampah") showing soft-deleted rows with
   restore action and remaining restore-window time.

INTERACTIONS: row click opens edit modal (form fields: amount, Source select,
direction, category, merchant, note, date, tags) showing edit history link;
delete asks named confirmation; keyboard focus visible throughout.
STATES: empty, loading skeleton rows, filled, error banner, restore bin empty state.
```

## 3. Sources

```
PLATFORM: Desktop web application
PURPOSE: Places money lives, balances, and movements between them.

PAGE STRUCTURE:
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
```

## 4. Categories

```
PLATFORM: Desktop web application
PURPOSE: Hierarchy editor with essential flags and safe restructuring.

PAGE STRUCTURE:
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
```

## 5. Bills & Calendar

```
PLATFORM: Desktop web application
PURPOSE: Expected obligations feeding reservations and the due calendar.

PAGE STRUCTURE:
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
```

## 6. Budgets

```
PLATFORM: Desktop web application
PURPOSE: Per-category monthly limits with threshold badges — pull-only, never pushy.

PAGE STRUCTURE:
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
```

## 7. Analytics

```
PLATFORM: Desktop web application
PURPOSE: Deep charts — breakdown, patterns, anomalies. Editorial spacing above,
dense charts below.

PAGE STRUCTURE:
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
STATES: empty ("Data masih tipis — catet dulu beberapa hari"), loading skeletons
per chart tile, filled, error tile with retry.
```

## 8. Needs-Review

```
PLATFORM: Desktop web application
PURPOSE: The weekly ritual's queue — low-category-confidence transactions awaiting
a one-click fix.

PAGE STRUCTURE:
1. App shell, active "Needs-Review" with count badge.
2. Ritual header: "X transaksi belum yakin kategori minggu ini" plus progress
   caption; completing all items shows a quiet success confirmation.
3. Review list: each row shows the parsed transaction (merchant, amount, Source,
   captured wording) and an inline category picker pre-seeded with the model's
   best guess plus three likely alternatives from user history.
4. Actions per row: pick category (writes through, provenance becomes "user"),
   skip, open full edit modal.

INTERACTIONS: bulk-fix repeated merchants ("Terapkan ke 6 transaksi serupa");
resolving updates counter instantly.
STATES: clean-empty ("Semua beres ✦ tidak ada yang menunggu" — plain text, no
emoji glyph dependency), loading, filled, error.
```

Note: replace the star glyph above with plain copy in implementation — UI never
depends on emoji. Wording: "Semua beres — tidak ada yang menunggu."

## 9. Hold Queue

```
PLATFORM: Desktop web application
PURPOSE: Drafts parked by the fail-closed gate + chat actions awaiting named
confirmation. Same confirmations resolvable here as in WhatsApp.

PAGE STRUCTURE:
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
```

## 10. Settings

```
PLATFORM: Desktop web application
PURPOSE: Auth, provider config, tags, and planning inputs. Quiet utility styling.

PAGE STRUCTURE:
1. App shell, active "Settings".
2. Sectioned form pages (left in-page anchor nav):
   - Autentikasi: passkey management list (register/revoke, last-used captions).
   - Model: LLM provider config readout (vision model, text model — config
     values, masked keys) with test-connection affordance.
   - Tagihan & reservasi: income horizon setter ("Perkiraan income berikutnya ~__
     hari") with explainer text.
   - Tag: namespaced tag table (trip:bali, social, impulsive) create/rename/delete.
   - Data: backup status, export CSV, danger zone (archive account) behind named
     confirmation.

INTERACTIONS: every save gives inline success confirmation; masked secrets
reveal-on-demand only; test-connection shows provider latency result inline.
STATES: per-section empty/loading/filled/error.
```

---

## Copy deck (Indonesian-first)

| Key | ID | EN |
|---|---|---|
| `sts.label` | Safe-to-Spend | Safe-to-Spend |
| `runway.label` | Runway | Runway |
| `allowance.label` | Jatah harian | Daily allowance |
| `reserved.tomorrow` | Tereservasi besok | Reserved tomorrow |
| `week.glance` | Minggu ini | This week |
| `tx.add` | Tambah | Add |
| `tx.search.placeholder` | Cari merchant atau catatan… | Search merchant or note… |
| `tx.empty` | Belum ada transaksi — mulai catet lewat WhatsApp | No transactions yet — start logging via WhatsApp |
| `trash` | Sampah | Trash |
| `restore` | Pulihkan | Restore |
| `confirm.delete` | Hapus "{record}"? | Delete "{record}"? |
| `src.new` | Source baru | New Source |
| `transfer.action` | Transfer | Transfer |
| `adjust.balance` | Sesuaikan saldo | Adjust balance |
| `bill.paid` | Tandai lunas | Mark paid |
| `budget.suggestion.use` | Pakai saran | Use suggestion |
| `review.header` | {n} transaksi belum yakin kategori minggu ini | {n} transactions unsure of category this week |
| `review.clean` | Semua beres — tidak ada yang menunggu | All clear — nothing waiting |
| `hold.drafts` | Draft | Drafts |
| `hold.confirm` | Menunggu konfirmasi | Awaiting confirmation |
| `approve` | Setujui | Approve |
| `reject` | Tolak | Reject |
| `analytics.empty` | Data masih tipis — catet dulu beberapa hari | Data is thin — log a few days first |
| `save` | Simpan | Save |
| `cancel` | Batal | Cancel |
| `retry` | Coba lagi | Retry |

## Sample data (mock seed, use verbatim — never fabricate others)

**Sources:** BCA (bank, Rp8.420.000) · Cash (cash, Rp340.000) · GoPay (ewallet,
Rp215.500) · ShopeePay (ewallet, Rp98.000) · SPayLater (Debt Source, −Rp1.240.000)
· Kredivo (Debt Source, −Rp685.000)

**Categories:** Makanan & Minuman (essential) · Transportasi (essential) · Kos
(essential) · Tagihan (essential) · Hiburan · Belanja · Gaji (income)

**Merchants:** Kopi Kenangan · Indomaret · Gojek · Pertamina · Tokopedia ·
Laundry Kilat

**Representative transactions:** kopi Rp25.000 (Kopi Kenangan, Cash) · gojek
Rp18.000 (Gojek, GoPay) · gajian +Rp8.500.000 (Gaji, BCA) · kos Rp750.000 (Kos,
BCA, matched Bill) · bensin Rp30.000 (Pertamina, Cash) · sepatu Rp800.000
(SPayLater purchase — Debt Source goes more negative)

**Hero figures:** Safe-to-Spend Rp2.140.000 · Runway 34 hari · Jatah harian
Rp71.300/hari · Reserved besok: kos Rp750.000 + internet Rp320.000

**Needs-Review samples:** "kopi kenangan 25rb" guessed Makanan & Minuman (llm,
low confidence) · "tokopedia 150rb" guessed Belanja (llm, low confidence)
