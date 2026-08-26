# AGENTS.md - catet Dashboard (Frontend)

**This file provides guidance to AI agents when working with code in this repository.**

---

## Project Overview

catet is a self-hosted, WhatsApp-first personal finance tracker for one user, solving visibility first (safe-to-spend clarity), then budgeting, goals, and scattered BNPL/paylater debt.

This repo is the **web dashboard** (Next.js App Router). The **backend** lives in a separate repo:

```
catet-backend/   Go API + domain + docs (source of truth)
catet/           Next.js dashboard (this repo — consumes the backend)
```

---

## Two-Repo Relationship

- **Backend (`catet-backend`) is the SOURCE OF TRUTH** for the domain model, the ledger engine, the AI harness, and all documentation:
  - `~/projects/catet-backend/CONTEXT.md` — canonical vocabulary (Source, Leg, Transfer, Draft, Safe-to-Spend, …). Read this before naming anything.
  - `~/projects/catet-backend/docs/spec.md` — product & technical spec v2 (plan of record).
  - `~/projects/catet-backend/docs/adr/` — architecture decision records.
  - `~/projects/catet-backend/api/openapi.yaml` — the API contract (to be generated from Go).
- **This repo (`catet`) CONSUMES the backend** — it never owns domain truth.
- The browser talks **only** to Next.js Route Handlers (BFF pattern); the Go API is **internal-only** (docker network, no CORS, no public DNS).
- The frontend uses a **generated, typed API client** from the backend's `openapi.yaml` — contract changes are a PR in the backend, then a regenerate here. No hand-written API types.
- Dashboard manual entry is a **peer capture surface** (`origin=dashboard_manual`, `category_source=user`, no AI gate) — it writes through the same ledger engine as the WhatsApp bot.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Charts**: ECharts
- **Server state**: TanStack Query
- **Auth**: httpOnly-cookie session (passkey via WebAuthn)
- **Package manager**: pnpm

---

## Before Starting Any Task

1. Read `~/projects/catet-backend/CONTEXT.md` for vocabulary.
2. Read `~/projects/catet-backend/docs/spec.md` for the plan of record.
3. Reference `~/projects/catet-backend/api/openapi.yaml` for API shapes.

---

## Dashboard Screens

Overview · Transactions · Sources · Categories · Bills & Calendar · Budgets · Goals (Later) · Analytics · Needs-Review · Hold Queue · Settings · Audit Log (Later)

## Charts (Now tier, ECharts)

Category breakdown · income-vs-expense timeline · Safe-to-Spend + Runway trend · daily heatmap · top merchants · Essential-vs-Lifestyle split

---

## Important Notes

- **NEVER** hand-write API response types — regenerate the client from the backend's OpenAPI spec.
- **NO EMOJIS** in UI — use Lucide icons.
- **REFERENCE** the spec before implementing any screen or chart.
- The Go API is internal-only; do not add browser→Go direct calls or CORS.
