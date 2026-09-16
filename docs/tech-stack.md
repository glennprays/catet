# catet Dashboard Tech Stack Decision

This note records the current stack direction from the planning discussion. It is a frontend-repo note for `/home/glenn/projects/catet`; backend domain/API truth remains in `/home/glenn/projects/catet-backend`.

## Decision

Build dashboard-first UX now, without moving domain authority into the frontend.

- The dashboard is the primary user surface for the first implementation slice.
- WhatsApp is an input gateway only for now.
- The Go backend remains the source of truth for ledger behavior, money math, analytics computations, confirmations, deduplication, and domain state.
- The frontend renders, validates for UX, mediates browser requests, and caches server state. It does not own ledger invariants.

## Repository Boundary

- UI/dashboard repo: `/home/glenn/projects/catet`
- Backend/API/domain repo: `/home/glenn/projects/catet-backend`
- Backend source-of-truth docs:
  - `/home/glenn/projects/catet-backend/CONTEXT.md`
  - `/home/glenn/projects/catet-backend/docs/spec.md`
  - `/home/glenn/projects/catet-backend/docs/adr/`
  - `/home/glenn/projects/catet-backend/api/openapi.yaml`

Contract changes start in the backend, then the frontend regenerates/updates its typed API client.

## Frontend Architecture

- Framework: Next.js App Router.
- Browser boundary: browser talks only to Next.js Route Handlers.
- BFF shape: domain route handlers, not a generic proxy tunnel.
- Go API exposure: internal-only, reachable from Next.js over the deployment network.
- Rendering split: SSR authenticated app shell/navigation; client-side screen data through TanStack Query.
- API client: `openapi-typescript` generated types plus a small typed fetch client used from the BFF layer.
- API shape: mixed by need:
  - CRUD endpoints for forms and entity management.
  - Page-shaped/aggregate read endpoints for overview, analytics, charts, and hero numbers.

## UI and State

- Component foundation: shadcn/ui.
- Styling: Tailwind backed by `DESIGN.md` tokens.
- Data blocks: Tremor-style composition where useful, not a hard dependency on generic dashboard layouts.
- Charts: ECharts.
- Server state: TanStack Query for queries, mutations, invalidation, and stale-time behavior.
- Local global store: defer until a real client-only workflow forces it.

## Analytics Boundary

Go returns ready-to-render chart data:

- series
- labels
- rollups
- annotations
- pre-aggregated scalar values

The frontend renders those values with ECharts and UI components. It does not recompute Safe-to-Spend, Runway, budget status, category rollups, daily heatmap intensity, or source balances.

## Forms and Validation

Frontend validation is for UX only:

- required fields
- input shape
- obvious ranges
- friendly inline errors

The backend remains final authority for ledger invariants, money rules, permissions, deduplication, and mutation validity.

## Auth

- Phone + password login (argon2id on the backend); WhatsApp OTP verifies the phone at signup and resets a forgotten password.
- Session uses an httpOnly cookie carrying the backend's JWT (user id + `session_epoch`); bumping the epoch signs every device out.
- Browser-visible JWT storage is out of scope.
- Accounts exist only by admin invite; the dashboard hosts the register and reset flows and the admin users page.

## Deployment

First real deployment target:

- Next.js built as Docker standalone output.
- Traefik routes to the Next.js container.
- Cloudflare Tunnel provides public HTTPS reachability without exposing the origin port directly.
- Go API and PostgreSQL remain internal services.
- Go API has no public DNS and no browser CORS surface.

## Secrets

Use SOPS-managed env files for deployment secrets:

- session secrets
- Go-facing service token
- WhatsApp gateway token
- LLM/API provider credentials

Plaintext `.env` files may exist only as local/deploy artifacts and must not be committed.

## Verification Stack

- Vitest for pure helpers, typed client glue, and isolated UI behavior where useful.
- Playwright smoke tests for critical flows:
  - login/session path
  - manual dashboard capture
  - transaction/source/category CRUD surfaces
  - overview/dashboard render path
- Prefer behavior checks over source-text checks.

## WhatsApp Scope

For now, WhatsApp is only a data input gateway into the Go backend.

- No proactive bot behavior.
- No dashboard chat advisor yet.
- No separate WhatsApp domain path.
- Dashboard and WhatsApp writes both flow through the same backend ledger engine.

## OMP Tooling Note

Frontend package manager: Bun. OMP Superpowers also needs Bun on PATH.

Correct Superpowers install target:

```bash
omp install https://github.com/obra/superpowers
```
