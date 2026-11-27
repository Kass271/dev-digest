# server — Insights

### 2026-11-27 - Run cost is computed by reviewer-core but discarded by the server
- **Category:** Problem
- **Where:** `server/src/modules/reviews/run-executor.ts:213`, `reviewer-core/src/review/run.ts:157-216`, `server/src/db/migrations/0009_complex_runaways.sql`
- **Evidence:** reviewer-core sums per-call `costUsd` (null if any call's price is unknown); run-executor destructures only `tokensIn, tokensOut, grounding`, and `agent_runs.cost_usd` was dropped in migration 0009, so cost never reaches DB, contracts (`RunStats`, `RunSummary`) or UI.
- **Suggestion:** To surface cost, persist `outcome.costUsd` via a NEW migration (0010+, never edit 0009) and add it to both vendored shared contract copies.

### 2026-11-27 - Follow-up: Run cost is computed by reviewer-core but discarded by the server
- **Category:** Problem
- **Refers to:** "2026-11-27 - Run cost is computed by reviewer-core but discarded by the server"
- **Update:** fixed
- **Evidence:** Migration `0010_safe_doctor_spectrum.sql` re-adds `agent_runs.cost_usd`; `run-executor.ts` passes `costUsd` to `completeAgentRun` and trace stats; exposed on `GET /pulls`, `/pulls/:id/runs`, `/runs/:id/trace`; `server/test/cost.it.test.ts` 3/3 green on real Postgres. Runs created before 0010 stay `null` (no token-based derivation, per `server/Specs/run-cost.md` F3).

### 2026-11-27 - Vendored @devdigest/shared copies have drifted between server and client
- **Category:** Contradiction
- **Where:** `server/src/vendor/shared/`, `client/src/vendor/shared/` (also recorded in `client/Insights.md`)
- **Evidence:** `git diff --no-index --stat server/src/vendor/shared client/src/vendor/shared` -> 5 files differ (`adapters.ts`, `contracts/eval-ci.ts`, `contracts/knowledge.ts`, `contracts/productionize.ts`, `contracts/trace.ts`), 112 lines removed on the client side. Cost contract fields had to be added to both copies by hand.
- **Suggestion:** Any contract change must be applied to BOTH copies and re-diffed; long term, reconcile the copies or generate one from the other.

### 2026-11-27 - Editing an already-applied migration is silently skipped on existing databases
- **Category:** Problem
- **Where:** `server/src/db/migrations/`, `server/node_modules/drizzle-orm/pg-core/dialect.js:44-72`
- **Evidence:** drizzle-orm 0.45.4 migrator applies only journal entries whose `when` is newer than the last applied `created_at`; the stored hash is never re-checked. CI and testcontainers start from an empty DB, so an edited old migration passes tests but never runs on dev/prod DBs.
- **Suggestion:** Never edit an applied migration; always add a new one (`pnpm db:generate`). Reviewers should reject diffs touching existing `migrations/*.sql`.

### 2026-11-27 - No record groups a multi-agent review; reviews.run_id has no FK
- **Category:** Problem
- **Where:** `server/src/db/schema/reviews.ts:19`, `server/src/modules/pulls/routes.ts:114-130`, `server/src/modules/reviews/repository/run.repo.ts:70-77`
- **Evidence:** One `reviews` row per agent run; "latest review" (Score, Cost on the PR list) is the single newest agent run, not all agents of one review pass. `reviews.run_id` is a plain uuid without FK, so `deleteAgentRun` must delete the review explicitly to avoid orphaned findings.
- **Suggestion:** If "review = all agents run together" is ever required, add a review-session/group id first; any new code deleting runs must also clean up `reviews` manually.

### 2026-11-27 - Reviewing the seeded PR #482 reviews an empty diff
- **Category:** Problem
- **Where:** `server/src/db/seed.ts:119-124`, `server/src/modules/reviews/diff-loader.ts:12-30`
- **Evidence:** Seeded `pr_files` have no `patch`, and `acme/payments-api` is not a real GitHub repo, so `loadDiff` falls back to `diffFromPrFiles` -> 0 files. A real run in the isolated stack logged "Diff ready — 0 changed file(s)", approved with 0 findings and cost $0.000; with patches added it reviewed 4 files (4 findings, $0.001).
- **Suggestion:** Add `patch` text to the seeded `pr_files` so a "Run Review" on the demo PR is meaningful; until then demos use `.claude/skills/feature-demo-pr/fixtures/run-cost.sql`.
