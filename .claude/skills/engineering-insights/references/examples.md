# Example insight entries

One canonical example per category. Illustrative format only — these are examples, not
recorded insights.

## Vague vs useful

- Vague (do NOT record): "Be careful with migrations." / "Cost handling is tricky."
- Useful: "`run-executor.ts:213` drops `outcome.costUsd` from reviewer-core - persist it via a new migration (0010+), never by editing 0009."

## Contradiction (cross-module -> recorded in both server/ and client/)

```markdown
### 2026-11-27 - Vendored @devdigest/shared copies have drifted
- **Category:** Contradiction
- **Where:** `server/src/vendor/shared/contracts/trace.ts`, `client/src/vendor/shared/contracts/trace.ts` (+4 other files)
- **Evidence:** `git diff --no-index --stat client/src/vendor/shared server/src/vendor/shared` -> 5 files differ; README calls it "one schema, every package". Also recorded in client/Insights.md.
- **Suggestion:** Decide which copy is canonical and sync; consider a CI check that diffs the two copies.
```

## Problem

```markdown
### 2026-11-27 - Edited migrations are silently skipped on existing DBs
- **Category:** Problem
- **Where:** `server/src/db/migrations/`, drizzle-orm `pg-core/dialect.js:44-72`
- **Evidence:** Migrator applies only journal entries newer than the last applied `created_at`; stored hash is never re-checked. Fresh CI/testcontainers DBs still pass.
- **Suggestion:** Never edit applied migrations; change `schema.ts` and run `pnpm db:generate`.
```

## Improvement

```markdown
### 2026-11-27 - Run cost groundwork already exists
- **Category:** Improvement
- **Where:** `server/src/platform/price-book.ts`, `server/src/db/schema/runs.ts`
- **Evidence:** PriceBook estimates USD from live OpenRouter prices; `agent_runs` has `tokens_in/out` but `cost_usd` was dropped in migration `0009_complex_runaways.sql`.
- **Suggestion:** Reuse PriceBook when reintroducing run cost instead of a new pricing table.
```

## Follow-up (comment on an existing entry - appended, original untouched)

```markdown
### 2026-11-28 - Follow-up: Vendored @devdigest/shared copies have drifted
- **Category:** Contradiction
- **Refers to:** "2026-11-27 - Vendored @devdigest/shared copies have drifted"
- **Update:** new evidence
- **Evidence:** `contracts/knowledge.ts` now also differs in the `MemoryItem` shape (illustrative).
```
