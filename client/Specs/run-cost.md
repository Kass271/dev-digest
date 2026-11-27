# Run Cost — UI specification & implementation plan

Status: DRAFT (workflow Block 10) · Backend, definitions, API: [server/Specs/run-cost.md](../../server/Specs/run-cost.md)
Design source: `DevDigest Design (standalone) (1).html` (`CostBadge`, `ScreenDashboard`, PR timeline, `ScreenTrace`).

## 1. Screens

| # | Screen | File | Change (per design) |
|---|--------|------|---------------------|
| 1 | Pull Requests list | `app/repos/[repoId]/pulls/page.tsx` (headers), `_components/PRRow/PRRow.tsx` (cells) | New **Cost** column between **Status** and the actions column: `Pull request · Author · Size · Score · Findings · Status · Cost · (actions) · Updated`. Value = latest review cost. **Click → Cost breakdown modal** (§3). |
| 2 | PR timeline — agent run row | `pulls/[number]/_components/RunHistory/RunHistory.tsx` (~line 199) | `CostBadge` immediately **before the run time**: `score · cost · time`. |
| 3 | Run trace drawer — Stats | `RunTraceDrawer/_components/TraceBody/TraceBody.tsx` (~line 65) | New stat **Cost** between **Tokens** and **Findings**: `Duration · Tokens · Cost · Findings`. |

## 2. `CostBadge` (from design)

New shared component (location: next to other PR-review atoms, e.g. `components/cost-badge/CostBadge.tsx`).
- Props: `usd: number | null | undefined`, `size?: "sm" | "lg"`, `onClick?`.
- `null`/`undefined` → muted `—`.
- Format **as in design**: `usd < 1` → `"$" + usd.toFixed(3)`, otherwise `toFixed(2)`.
- Monospace, tabular numbers; title "Cost of this review".
- With `onClick` it renders as a button (keyboard-accessible).

## 3. Cost breakdown modal (NOT in design — new)

Opened by clicking the cost in the PR list row. Uses existing `vendor/ui/kit/Modal` and the existing
`usePrRuns(prId)` hook (`GET /pulls/:id/runs`) — no new endpoint.
- Title: `Cost · #<number>` ; subtitle: PR title.
- Table of runs (newest first): Agent · Model · Ran at · Tokens (in→out) · Cost (`CostBadge`).
- Footer: **Latest review** `$x` · **All runs** `$y` (`N runs`, `M with unknown cost` if any).
- States: loading skeleton, error state, empty ("No runs yet").
- Clicking a run row is out of scope (no navigation).

## 4. Data & i18n

- Types come from `vendor/shared` contracts (`PrMeta.cost_usd`, `RunSummary.cost_usd`, `RunStats.cost_usd`).
- New keys in `messages/en/prReview.json`: `list.columns.cost`, `cost.badgeLabel`, `cost.modal.*`;
  in `messages/en/runs.json`: `trace.stat.cost` (the trace drawer uses the `runs` namespace).

## 5. Decision — trace number format

The design's trace drawer formats cost as `"$" + cost.toFixed(2)`, while `CostBadge` uses 3 decimals
below $1. **Decided (Block 11: requirements and design take priority):** the drawer follows the design —
`"$" + cost.toFixed(2)`, `—` when null. Known consequence: runs under $0.005 display `$0.00`.

## 6. Implementation plan

1. `CostBadge` + tests.
2. Screen 1: column header + `PRRow` cell + i18n.
3. `CostBreakdownModal` + wire click in `PRRow`.
4. Screen 2: `RunHistory` row.
5. Screen 3: `TraceBody` stat.
6. `pnpm typecheck` + `pnpm test`.

## 7. Tests (vitest + RTL, fetch mocked)

| File | Covers |
|------|--------|
| `CostBadge.test.tsx` | `—` for null; `$0.014` (<$1, 3 dp); `$1.25` (≥$1, 2 dp); renders button + fires onClick |
| `PRRow.test.tsx` (extend/new) | Cost cell shows latest review cost; click opens modal |
| `CostBreakdownModal.test.tsx` | runs table, latest vs all-runs totals, unknown-cost count, loading/error/empty |
| `RunHistory.test.tsx` (extend) | cost shown before run time; `—` for failed run |
| `RunTraceDrawer.test.tsx` (extend) | Cost stat between Tokens and Findings; `$0.06` (2 dp, design format); `—` when null |

e2e (`e2e/specs`): not planned — the seeded run on PR #482 has no stored cost (seed would need a `cost_usd`); optional later.
