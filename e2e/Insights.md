# e2e — Insights

### 2026-11-27 - Seed data has no agent run, so e2e can only ever see "—" for cost
- **Category:** Improvement
- **Where:** `server/src/db/seed.ts:135-147`, `e2e/specs/`
- **Evidence:** The seed inserts a sample review for PR #482 without an `agent_runs` row (`runId` unset), so `cost_usd` is null on the PR list and no run exists in the timeline/trace. Cost is covered only by `server/test/cost.it.test.ts` and client unit tests; e2e was not run (agent-browser not installed locally).
- **Suggestion:** To cover cost end-to-end, seed an `agent_runs` row with `cost_usd` linked via `reviews.run_id`, then add a flow asserting the PR list Cost cell and breakdown modal.

### 2026-11-27 - Follow-up: Seed data has no agent run, so e2e can only ever see "—" for cost
- **Category:** Improvement
- **Refers to:** "2026-11-27 - Seed data has no agent run, so e2e can only ever see "—" for cost"
- **Update:** new evidence
- **Evidence:** Running a real review in the flow instead does not help on its own: seeded `pr_files` lack patches, so the run reviews an empty diff ($0.000; see `server/Insights.md`). The Playwright flow `.claude/skills/feature-demo-pr/flows/run-cost.flow.json` with fixture `fixtures/run-cost.sql` covers all 5 cost screens with a real non-zero cost. Also: the PR list defaults to the "Needs review" filter, so after a run PR #482 disappears until "Reviewed"/"All" is clicked.
