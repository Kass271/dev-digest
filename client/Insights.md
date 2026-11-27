# client — Insights

### 2026-11-27 - Design formats run cost inconsistently: trace drawer shows $0.00 for typical runs
- **Category:** Contradiction
- **Where:** `client/src/app/repos/[repoId]/pulls/[number]/_components/RunTraceDrawer/_components/TraceBody/TraceBody.tsx:66`, `client/src/components/cost-badge/CostBadge.tsx:11`; design bundle `ScreenTrace` vs `CostBadge`
- **Evidence:** Design `CostBadge` uses 3 dp below $1 (`$0.014`), design trace drawer uses `"$" + cost.toFixed(2)`; mock/real runs cost ~$0.001–0.01, so the drawer renders `$0.00`. Kept per user rule "requirements and design take priority" (workflow Block 11).
- **Suggestion:** Ask design to align the trace drawer with `CostBadge` (reuse `formatCost`); until then don't "fix" TraceBody silently — it is an accepted, deliberate design-following choice.

### 2026-11-27 - Vendored @devdigest/shared copies have drifted between client and server
- **Category:** Contradiction
- **Where:** `client/src/vendor/shared/`, `server/src/vendor/shared/` (also recorded in `server/Insights.md`)
- **Evidence:** `git diff --no-index --stat server/src/vendor/shared client/src/vendor/shared` -> 5 files differ (`adapters.ts`, `contracts/eval-ci.ts`, `contracts/knowledge.ts`, `contracts/productionize.ts`, `contracts/trace.ts`). Client types can silently disagree with what the server sends.
- **Suggestion:** Apply every contract change to BOTH copies and re-diff; don't assume the client copy matches the server.

### 2026-11-27 - PR list lacks the design's Findings and actions columns
- **Category:** Contradiction
- **Where:** `client/src/app/repos/[repoId]/pulls/constants.ts:42` (`COLUMN_KEYS`), `server/src/modules/pulls/routes.ts:116`
- **Evidence:** Design PR list: `Pull request · Author · Size · Score · Findings · Status · Cost · (actions) · Updated`; the starter has no Findings or actions column. The server comment says the per-severity FINDINGS breakdown is intentionally not surfaced on the list.
- **Suggestion:** Don't treat the missing columns as a bug when implementing design changes; place new columns relative to the existing ones (Cost went between Status and Updated).

### 2026-11-27 - @testing-library/user-event is not installed; tests use fireEvent
- **Category:** Improvement
- **Where:** `client/package.json`, `client/node_modules/@testing-library/` (only `dom`, `jest-dom`, `react`)
- **Evidence:** The project `react-testing-library` skill mandates `userEvent`, but importing it fails; all existing client tests (e.g. `RunTraceDrawer.test.tsx`, `PRRow.test.tsx`) use `fireEvent`.
- **Suggestion:** Either add `@testing-library/user-event` as a devDependency or note in the skill that this repo uses `fireEvent`; until then, use `fireEvent` to match existing tests.
