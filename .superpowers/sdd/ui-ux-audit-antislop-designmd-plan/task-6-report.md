# Task 6 Report

## Files changed

- `src/app/(app)/sources/page.tsx`
  - Removed hover/focus opacity gating from source-card actions.
  - Kept the existing Ubah, Setor koreksi, and Arsipkan handlers and copy.
  - Increased each visible ghost action to `h-11` (44px) without a hidden reserved action zone.
- `src/app/(app)/categories/page.tsx`
  - Removed hover-only opacity from the Sub, Ubah, and Arsip action group.
  - Increased each action to `h-11` (44px); tree structure, handlers, and copy are unchanged.
- `src/components/ledger-row.tsx`
  - Added optional `showCategory` presentation prop, defaulting to `true`.
  - Category presentation is conditionally omitted when the prop is false; existing row interaction and mutation seams are unchanged.
- `src/app/(app)/needs-review/page.tsx`
  - Renders `LedgerRow` with `showCategory={false}` so the correction Select is the sole category control.
  - Removed the unused `useSources` import/state and hidden `sources.data?.sources.length` span.
  - Existing Select draft state, save handler, mutation, and all other row data remain unchanged.

## Per-surface behavior

- Sources: all available card actions are always visible and have 44px vertical hit areas; no hover is required.
- Categories: Sub/Ubah/Arsip actions are always keyboard- and pointer-visible and have 44px hit areas; the category tree layout remains intact.
- Needs-Review: rows do not gain `onEdit` or a tap handler. The category chip is omitted through the optional LedgerRow presentation prop, while the correction Select and Simpan flow remain in place.

## Checks

- `bunx tsc --noEmit --pretty false --incremental false src/components/ledger-row.tsx src/app/'(app)'/sources/page.tsx src/app/'(app)'/categories/page.tsx src/app/'(app)'/needs-review/page.tsx`
  - Output: 29 diagnostics in 2 files (the direct file-list invocation did not inherit JSX/path compiler settings; no source conclusion was taken from this invocation).
- `bunx tsc --noEmit --pretty false --project /tmp/catet-task6-tsconfig.json`
  - Output: no output; exit 0.
  - The temporary config extends the repository `tsconfig.json` and includes only the four changed TypeScript/TSX targets (plus their imported dependency closure).
- `git diff --cached --check`
  - Output: no output; exit 0.

- `git diff --check`
  - Output: no output; exit 0.
No formatter, linter, project-wide suite, backend/API check, or subagent was run.

## Commit

Implementation commit: `6e76ce0` (`Conform source and review actions to Paper Ledger v2`).

## Concerns

- The three app page targets were pre-existing untracked files in the worktree, so the implementation commit records those complete target pages as newly tracked files; no unrelated paths were staged.
- Verification was static/scoped TypeScript only; no browser smoke test was run in this worker task.

## Review fix round 1

- Routed category Sub and Ubah callbacks through `openAddChild`/`openEdit`, which set the selected parent/category and open `CategoryFormDialog`.
- `bunx tsc --noEmit --pretty false --project /tmp/catet-task6-tsconfig.json && git diff --check`
  - Output: no output; exit 0.
- Fix commit: `f319b7a` (`Open category form from row actions`).
