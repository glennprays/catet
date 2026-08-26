# catet — Design.md

## 1. Philosophy

**Calm over alarm.** Money anxiety reads better in a warm, quiet surface than a hacker terminal. catet is personal — a notebook on a desk, not a trading floor. The Safe-to-Spend number *is* the product; everything else is context around it.

**Editorial restraint.** ~97% achromatic + one accent. Color is rationed to *meaning*: teal = safe, amber = thin, red = over. Never decoration.

**Two rhythms.** Hero/overview breathes (one focal point per screen); the transaction feed is dense and scannable. Editorial above, ledger below.

## 2. Design Tokens

### Color — warm paper

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#fafaf9` | page background (warm stone) |
| `--surface` | `#ffffff` | elevated white |
| `--card` | `#f2f2f3` | mist (nested content) |
| `--fog` | `#fafafb` | section bands |
| `--ink` | `#17191c` | primary text (near-black) |
| `--ink-soft` | `#3f4145` | secondary text |
| `--muted` | `#777b86` | tertiary text |
| `--ash` | `#979799` | labels |
| `--smoke` | `#a3a6af` | placeholders |
| `--accent` | `#0d9488` | SAFE (teal — positive) |
| `--accent-deep` | `#0f766e` | accent hover |
| `--warn` | `#d97706` | THIN (amber) |
| `--danger` | `#dc2626` | OVER (red) |
| `--border` | `#ececec` | hairline |
| `--border-strong` | `#d4d4d8` | strong hairline |

### Type scale

| Role | Size | Weight | Tracking |
|---|---|---|---|
| display | 72px | 500 | -0.022em |
| heading | 48px | 500 | -0.022em |
| heading-sm | 32px | 500 | -0.022em |
| subheading | 24px | 400 | -0.012em |
| body-lg | 20px | 590 | -0.012em |
| body | 16px | 400 | 1.5 lh |
| body-sm | 15px | 400 | 1.6 lh |
| caption | 13px | 400 | 1.2 lh |
| label | 12px | 400 | 1.4 lh |

- Font: **Inter** (sans), weight 400–590 (never 700+). **tabular-nums** on all money figures.

### Spacing (4px base)

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 64 · 80 · 96 · 128`

### Radius

| Element | Value |
|---|---|
| cards | 24px |
| inputs | 16px |
| buttons | 9999px |
| small | 16px |
| elevated | 20px |

### Shadows

Hairline borders over drop shadows. Elevation = surface-tone progression, not glow. Only floating artifacts (modals, popovers) earn real shadow.

## 3. The Hero (Overview)

One number dominates: **Safe-to-Spend**, display scale, teal when healthy / amber when thin. Beneath it: runway-in-days + daily allowance. A horizontal teal reference line over a 4-week spend timeline shows whether today is above or below the safe line.

## 4. Screens

1. **Overview** — hero + reference-line timeline + today's reserved + this-week glance
2. **Transactions** — compact feed, inline edit, filters, soft-delete/restore
3. **Sources** — balance bars, transfer wizard, adjustment entries
4. **Categories** — hierarchy tree, essential flags, merge/split
5. **Bills & Calendar** — due calendar + bill list
6. **Budgets** — progress bars, threshold badges
7. **Analytics** — breakdown, heatmap, top merchants, anomalies
8. **Needs-Review** — the weekly ritual's uncategorized queue
9. **Hold Queue** — drafts + parked actions
10. **Settings** — auth, provider config, tags

## 5. Distinct from letpai

No coral-red, no Space Grotesk, no brutalist edges. catet is its own quiet, trustworthy brand — warm paper, teal signal, editorial calm.
