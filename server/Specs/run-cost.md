# Run Cost — backend specification & implementation plan

Status: DRAFT (workflow Block 10) · UI part: [client/Specs/run-cost.md](../../client/Specs/run-cost.md)
Design source: `DevDigest Design (standalone) (1).html` — artboard "Pull Requests · Run Review + auto-status + Cost".

## 1. Goal

Show what each review cost (USD) on three screens: the PR list, each agent run in the
PR timeline, and the run trace drawer. Roadmap item M1 "Run cost badge".

## 2. Definitions

| Term | Meaning |
|------|---------|
| **Run cost** | USD cost of one `agent_runs` row = sum of its LLM calls' `costUsd`, as already computed by reviewer-core (`reviewer-core/src/review/run.ts:157-216`). `null` if any call's price is unknown. |
| **Latest review cost** (PR list column) | Run cost of the run behind the PR's newest `reviews` row (`kind='review'`). Same "latest review" rule the list already uses for **Score** (`server/src/modules/pulls/routes.ts:113-130`). |
| **All runs total** (breakdown modal) | Sum of run costs over all `agent_runs` of the PR, plus the count of runs whose cost is unknown. |

Note: a "review" in this codebase is one row per agent run (`reviews.run_id`); running "all
agents" creates several reviews. There is no multi-agent review group.

## 3. Current state (verified)

- LLM adapters return `costUsd` per call (`adapters/llm/*`, live OpenRouter prices via `platform/price-book.ts`).
- reviewer-core sums it per run, but `modules/reviews/run-executor.ts:213` keeps only `tokensIn/tokensOut/grounding` → cost is lost.
- `agent_runs.cost_usd` existed in `0000_init.sql` and was dropped by `0009_complex_runaways.sql`.
- Contracts `RunStats`, `RunSummary` (`contracts/trace.ts`) and `PrMeta` (`contracts/platform.ts`) have no cost field.

## 4. Requirements

**Functional**
- F1 Persist run cost (USD) in a new nullable column `agent_runs.cost_usd` when a run finishes. Failed/cancelled runs: `null`.
- F2 Expose cost on: `GET /repos/:id/pulls` (latest review cost), `GET /pulls/:id/runs` (per run), `GET /runs/:id/trace` (`stats`).
- F3 **No derivation from tokens** (Block 11 requirement): cost is never computed from `tokens_in/out` at read time. Runs without a stored cost (created before this feature, failed/cancelled, or unknown model price) → `null` (UI shows `—`, as in the design `CostBadge`).

**Non-functional**
- N1 Schema change ONLY via `schema.ts` + `pnpm db:generate` → new migration `0010_*`. Never edit existing migrations (see Block 03).
- N2 Contract changes applied to BOTH vendored copies (`server/src/vendor/shared`, `client/src/vendor/shared`) — they have already drifted.
- N3 New fields optional/nullable → old traces and clients keep working.
- N4 No extra query per PR on the list (reuse the existing single `IN` query).

## 5. Design

**DB** — `server/src/db/schema/runs.ts`: `costUsd: doublePrecision('cost_usd')` (nullable) → `pnpm db:generate`.

**Write path** — `run-executor.ts`: take `costUsd` from the reviewer-core outcome; pass to run completion (`repository/run.repo.ts` completion values) and to trace `stats.cost_usd`.

**Read path**
- `GET /repos/:id/pulls`: extend the latest-review query with `reviews.runId` → join `agent_runs.cost_usd` → `PrMeta.cost_usd`.
- `GET /pulls/:id/runs`: add `cost_usd` to each `RunSummary`.
- `GET /runs/:id/trace`: `stats.cost_usd` from the stored trace; if absent (traces written before this feature), from `agent_runs.cost_usd`.

**Contracts** (both copies)
- `RunStats.cost_usd: number.nullish()`
- `RunSummary.cost_usd: number.nullable()`
- `PrMeta.cost_usd: number.nullish()`

## 6. Implementation plan

1. Contracts: add fields to both vendored copies.
2. Schema + `pnpm db:generate` → review generated `0010_*.sql` (expect a single `ADD COLUMN`).
3. run-executor + run.repo: persist `cost_usd`, add `stats.cost_usd` to trace.
4. Routes: pulls list, runs list, trace.
5. Integration tests (`*.it.test.ts`).
6. `pnpm typecheck` + unit + integration suites.

## 7. Tests

| Kind | File (new/extended) | Covers |
|------|---------------------|--------|
| unit | run-executor test | completed run persists `costUsd` from mocked LLM (`adapters/mocks.ts` returns `costUsd: 0.001`); failed run → null |
| integration | `cost.it.test.ts` | migrate (0010 applies), run review with mock LLM → `GET /pulls/:id/runs`, `GET /repos/:id/pulls`, `GET /runs/:id/trace` return cost; pre-feature run (null cost) → `null` everywhere |

## 8. Out of scope

Agent performance / 30-day cost dashboards, per-call cost in the trace, cost budgets/limits,
backfilling `cost_usd` for old rows, CI runs.

## 9. Decisions

- Cost source: stored `agent_runs.cost_usd` only; no derivation from tokens (§4 F3). Requirements file (Block 11) and design take priority over earlier conversational choices.
- PR list shows latest review cost; all-runs detail lives in the client breakdown modal.
- Number format follows the design: `CostBadge` on PR list, timeline and modal; trace drawer `$` + 2 dp (client spec §2, §5).
