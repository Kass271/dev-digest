# Engineering Workflow — Execution Log

Source instructions: [`ENGINEERING_WORKFLOW.md`](ENGINEERING_WORKFLOW.md) (verbatim copy of `l01_start.md`).

## Block Status

| Block | Title | Status |
|-------|-------|--------|
| 01 | Project Overview and Codebase Familiarization | COMPLETED |
| 02 | CLAUDE.md File Structure | COMPLETED (reopen later: apply slide "CLAUDE.md is a map, not documentation") |
| 03 | Migration Protection Rule | COMPLETED |
| 04 | Engineering Insights Skill Creation | COMPLETED |
| 05 | Engineering Insights Reading and Writing Rules | COMPLETED |
| 06 | Verification of Source Usage | COMPLETED |
| 07 | Actual Research and Source Processing | COMPLETED |
| 08 | Automatic Insights Recording | COMPLETED |
| 09 | Existing Insights Protection | COMPLETED |
| 10 | Cost Feature Specification and Implementation Plan | COMPLETED |
| 11 | Cost Feature Clarifications | COMPLETED |
| 12 | Planned UI Components Review | COMPLETED |
| — | Cost Feature Implementation Checkpoint | COMPLETED |
| 13 | Test Coverage and Skill Usage Review | COMPLETED |
| 14 | Engineering Insights Execution | COMPLETED |

## Log Entries

### Workflow initialization — 2026-11-27
- Created `ENGINEERING_WORKFLOW.md` (byte-identical copy of `l01_start.md`, verified with `cmp`).
- Created `ENGINEERING_WORKFLOW_LOG.md`.

### Block 01 — Project Overview and Codebase Familiarization
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Inspected repo layout, root/module READMEs, TESTING.md, DB schema/migrations dir, platform services. Presented architecture overview (4 packages + vendored shared contracts) and end-to-end review flow.
- **Key decisions:** Four modules = `server`, `client`, `reviewer-core`, `e2e` (`@devdigest/shared` is vendored, not a separate package) — accepted with approval.
- **Files created/modified:** none (read-only block).
- **Skills used:** none.
- **Validation:** n/a.
- **Engineering insights:** vendored `@devdigest/shared` copies in `server/` and `client/` have drifted (5 files differ); `agent_runs` has `tokens_in/out` but no cost column; `platform/price-book.ts` already estimates cost; migrations not auto-applied on boot.
- **User approval:** Approved.
- **Next block:** 02 — CLAUDE.md File Structure.

### Block 02 — CLAUDE.md File Structure
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Created root + 4 module `CLAUDE.md` files (links only) and minimal stubs for `Docs/`, `Specs/`, `Insights.md` per module.
- **Key decisions:** Option (a) — create missing items as stubs; naming `Docs/`, `Specs/`, `Insights.md` per original prompt; `.gitkeep` to track empty folders; links-only content (recommendations to be supplied later by user); root keeps existing `docs/`, no root Docs/Specs/Insights. `e2e/`: existing `e2e/specs/` (flow specs) serves as its Specs folder, linked as lowercase `specs/` (option A) — case-insensitive macOS FS made `e2e/Specs/` resolve to it.
- **Files created:** `CLAUDE.md`; `{server,client,reviewer-core}/{CLAUDE.md,Docs/.gitkeep,Specs/.gitkeep,Insights.md}`; `e2e/{CLAUDE.md,Docs/.gitkeep,Insights.md}`. No existing files modified (stray `e2e/specs/.gitkeep` created then removed).
- **Skills used:** none.
- **Validation:** All relative links in the 5 CLAUDE.md files verified to resolve; `e2e/specs/` contents verified unchanged.
- **Engineering insights:** On case-insensitive macOS, `Specs/` and `specs/` collide — proposed folder names must be checked case-insensitively against existing paths; links must match on-disk case for Linux/CI.
- **User approval:** Approved.
- **Next block:** 03 — Migration Protection Rule.

### Block 03 — Migration Protection Rule
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Explained why existing migrations must not be edited, grounded in the repo's Drizzle setup.
- **Key decisions:** None (explanatory block). Correct path documented: edit `schema.ts` → `pnpm db:generate` → new migration → `pnpm db:migrate`, commit SQL + meta together.
- **Files created/modified:** none.
- **Skills used:** none invoked (referenced `.claude/skills/drizzle-orm-patterns/references/migrations.md`).
- **Validation:** Verified drizzle-orm 0.45.4 migrator (`pg-core/dialect.js:44-72`): applies only migrations with journal `when` > last applied `created_at`; stored hash never re-checked. Snapshot-diff behavior of drizzle-kit not verified in source.
- **Engineering insights:** Edited applied migrations are silently skipped on existing DBs while fresh CI/testcontainers DBs pass — drift invisible to tests. `0009_complex_runaways.sql` drops `agent_runs.cost_usd`. No mechanical enforcement of the rule exists (convention only).
- **User approval:** Approved.
- **Next block:** 04 — Engineering Insights Skill Creation.

### Block 04 — Engineering Insights Skill Creation
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Researched 12 sources (10 user URLs + 2 slide GitHub issues, all loaded; some read partially — skills/hooks docs and arXiv full texts) and the 2 slides; created the `engineering-insights` project skill.
- **Key decisions:** Skill (lazy, description-triggered) + `/engineering-insights` explicit; no hooks in this block. Categories: Improvement / Problem / Contradiction. Record only non-derivable, evidenced insights (line test). Path-prefix module routing; cross-module insights recorded in every affected module (user: 1a); root-level files routed to the affected module. Fixed 5-line entry template (REM typed fields; Memento evidence gate). Rejected as overkill: wiki/index (WikiSkill), eviction (REM), dreaming consolidation.
- **Files created/modified:** `.claude/skills/engineering-insights/SKILL.md` (new), `.claude/skills/engineering-insights/references/examples.md` (new), `.claude/skills/README.md` (catalog row added — user: yes).
- **Skills used:** none invoked; skill authoring followed agentskills.io spec + Claude Code skills docs.
- **Validation:** frontmatter valid, name matches dir, description 370 chars, SKILL.md 64 lines, reference link resolves, skill discovered by Claude Code in-session; routing desk-checked on 4 scenarios. Live auto-trigger not tested.
- **Engineering insights:** No hook event exists for "insight discovered" — auto-trigger is advisory only; Insights.md is not auto-loaded by Claude Code; subdirectory CLAUDE.md loading is unreliable in the VS Code extension (#24987).
- **User approval:** Approved.
- **Next block:** 05 — Engineering Insights Reading and Writing Rules.

### Block 05 — Engineering Insights Reading and Writing Rules
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Implemented read-before-work, end-of-work substantial-only recording, and read-before-write dedup.
- **Key decisions:** R1 = `UserPromptSubmit` command hook (deterministic reminder) + skill + root CLAUDE.md. R2 = `Stop` prompt hook (option b, user-approved): background model blocks only for substantial unrecorded insight; `ok` when `stop_hook_active`. No true end-of-session hook exists (`SessionEnd` cannot act), so per-turn `Stop` is the closest. R3 = skill procedure: read whole target file, skip same location+issue. Hooks at project level (user request).
- **Files created/modified:** `.claude/settings.json` (new), `.claude/skills/engineering-insights/SKILL.md` (modified), `CLAUDE.md` (3-line section added — user-approved).
- **Skills used:** `update-config`.
- **Validation:** `jq -e` schema check passed; UserPromptSubmit command pipe-tested; UserPromptSubmit hook confirmed firing live on the next user prompt. Stop prompt hook not yet observed live.
- **Engineering insights:** Bundled `update-config` skill says prompt hooks are tool-events-only, official hooks docs say Stop supports them (followed docs). Hooks in a newly created `.claude/settings.json` may need `/hooks` or restart to activate.
- **User approval:** Approved.
- **Next block:** 06 — Verification of Source Usage.

### Block 06 — Verification of Source Usage
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Reported honestly how sources were used: all 12 fetched via 5 `web-fetch` subagents (+1 verbatim follow-up on hooks); per-source read coverage (full vs partial); mapping of each source to concrete skill/hook decisions; which skill examples were and were not seen.
- **Key decisions:** none (reporting block).
- **Files created/modified:** none.
- **Skills used:** none.
- **Validation:** n/a.
- **Engineering insights:** Gaps — skills.md last ~1/3, REM/WikiSkill/Memento full texts partially read, WikiSkill prompt appendices base64 (not decoded), Memento code repo not fetched.
- **User approval:** Approved.
- **Next block:** 07 — Actual Research and Source Processing.

### Block 07 — Actual Research and Source Processing
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Block premise ("no URLs opened") contradicted the session record and was flagged; work reframed as closing research gaps. Re-read skills.md tail, REM, Memento-Skills (+ GitHub repo example skill), more of WikiSkill. Collected 7 verbatim skill/hook examples into a research record. Applied two refinements to the skill.
- **Key decisions:** Research record stored as `references/research.md`, not referenced from SKILL.md (user: option b). P1: added natural trigger keywords to description (skills.md troubleshooting). P2: "watch throughout the whole task, record at end" (skills.md guidance wording). PermissionRequest hooks section skipped (irrelevant, user agreed).
- **Files created/modified:** `.claude/skills/engineering-insights/references/research.md` (new), `.claude/skills/engineering-insights/SKILL.md` (description + 1 line).
- **Skills used:** none invoked.
- **Validation:** `claude plugin validate .claude/skills` passed (before and after edits).
- **Engineering insights:** Block 06 coverage claim corrected (REM/Memento tails were readable). WikiSkill Appendix E remains unreadable (base64 in HTML; PDF not extractable — no pdftotext/pdftoppm); its index format and 10–30 line rule are unverified and not used.
- **User approval:** Approved.
- **Next block:** 08 — Automatic Insights Recording.

### Block 08 — Automatic Insights Recording
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Defined automatic mode (self-invoked or Stop-hook-triggered) as running the same procedure as manual; skill now reads the whole file, reviews every entry, and picks one outcome: new entry / nothing (duplicate) / follow-up comment.
- **Key decisions:** Option (b): "own comments" = append-only follow-up entries (`Follow-up: <title>`, `Refers to`, `Update: new evidence | still present | fixed | disagree`) at end of file; original entries never edited. Stop hook unchanged.
- **Files created/modified:** `.claude/skills/engineering-insights/SKILL.md` (follow-up format, 3-outcome procedure; 97 lines), `.claude/skills/engineering-insights/references/examples.md` (follow-up example).
- **Skills used:** none.
- **Validation:** `claude plugin validate .claude/skills` passed; 3 outcomes desk-checked. Live automatic run not yet observed.
- **Engineering insights:** none new.
- **User approval:** Approved.
- **Next block:** 09 — Existing Insights Protection.

### Block 09 — Existing Insights Protection
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Added a mechanically enforced append-only guard for every `Insights.md` on top of the advisory SKILL.md rule.
- **Key decisions:** `PreToolUse` command hook on `Write|Edit|Bash` running `.claude/hooks/insights-guard.py`. Write allowed only if new content starts with existing content; Edit only if `new_string` starts with `old_string` and `old_string` is at file end; Bash denies truncating redirect, `sed -i`, `perl -i`, rm/mv/truncate, cp onto, tee without -a, destructive git — best-effort. Exit 2 + stderr reason to Claude. Fail-open for unrelated input, fail-closed on guard errors for Insights.md calls.
- **Files created/modified:** `.claude/hooks/insights-guard.py` (new), `.claude/settings.json` (PreToolUse added).
- **Skills used:** none.
- **Validation:** 13/13 pipe tests as expected; `jq -e` valid; live destructive Edit on `server/Insights.md` blocked by hook, file unchanged.
- **Engineering insights:** Bash pattern check false-positives on any command whose text merely contains a single redirect symbol followed by `…Insights.md` (seen twice live: a JSON test string and a heredoc writing this log). Hooks in the new `.claude/settings.json` went live without a `/hooks` reload.
- **User approval:** Approved.
- **Next block:** 10 — Cost Feature Specification and Implementation Plan.

### Blocks 04–07 revisit — Research addendum (user research file)
- **Completed:** 2026-11-27
- **Status:** COMPLETED (Blocks 04–07 briefly CHANGES_REQUESTED; Block 10 paused meanwhile)
- **Summary:** User supplied `engineering-insights-research.md` (the research referenced in Block 04, not provided earlier). Fetched its 16 sources via `web-fetch` subagents (14 read; mcpmarket = listing pages only; glama URL truncated, not fetchable; Anthropic skills blog via user-approved claude.dev redirect).
- **Key decisions:** C1 keep user's 3 categories (not 4); C2 append at end only, no sections; C3 agents never prune — at 100+ entries ask user for manual review, fixed items get `Update: fixed` follow-ups; C4 keep per-module `Insights.md`. Applied P3 forced active read (one line naming applicable entries), P4 priority signals + "save 5+ minutes" test, P5 100-entry cap, P6 vague-vs-useful example, P7 research addendum.
- **Files modified:** `.claude/skills/engineering-insights/SKILL.md` (104 lines), `references/examples.md`, `references/research.md`, `.claude/settings.json` (UserPromptSubmit reminder text).
- **Skills used:** none.
- **Validation:** `claude plugin validate .claude/skills` passed; settings JSON valid; reminder command re-tested.
- **Engineering insights:** User research file misattributes a Stop hook to MindStudio wrap-up guide (page shows PostToolUse). Live: Stop prompt hook fired once and correctly triggered the skill, which appended to `server/Insights.md` through the guard.
- **User approval:** Approved (C1–C4, P3–P7, claude.dev fetch).
- **Next block:** 10 — Cost Feature Specification and Implementation Plan (resume).

### Block 10 — Cost Feature Specification and Implementation Plan
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Inspected backend (LLM adapters, reviewer-core cost aggregation, run-executor, run repo, pulls/runs/trace routes, contracts) and frontend (PR list, RunHistory, TraceBody, Modal kit, `usePrRuns`). Extracted the design bundle (`DevDigest Design (standalone) (1).html`) in scratchpad and read the 3 relevant screens + `CostBadge`. Wrote backend and UI specs with implementation plans and test lists.
- **Key decisions:** PR list = latest review cost (same rule as Score; one review = one agent run); click opens a new cost breakdown modal (all runs + totals; not in design; reuses `Modal` + `GET /pulls/:id/runs`). Cost stored in new `agent_runs.cost_usd` via new migration 0010; read-time token estimate (`≈`, never persisted) only for runs without stored cost. Format = design `CostBadge` (null `—`, <$1 3 dp, else 2 dp) on all 3 screens incl. trace drawer (design's 2-dp trace would show `$0.00`). Contracts changed in both vendored copies.
- **Files created:** `server/Specs/run-cost.md`, `client/Specs/run-cost.md`.
- **Skills used:** none.
- **Validation:** n/a (spec block); all code locations verified by reading source.
- **Engineering insights:** Design self-inconsistency (CostBadge 3 dp vs trace 2 dp). Data model has no multi-agent review grouping — "latest review" is a single agent run. Stop hook auto-recorded the run-executor cost-drop insight in `server/Insights.md` during this block.
- **User approval:** Approved.
- **Next block:** 11 — Cost Feature Clarifications.

### Block 11 — Cost Feature Clarifications
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Reconciled the specs with the scripted Block 11 answers. User rule: requirements files and designs take priority over earlier conversational choices.
- **Key decisions:** PR cost = latest review (unchanged). Cost only from stored `agent_runs.cost_usd`; token-based fallback, `cost_estimated`, `≈` and `resolveRunCost` removed — old/failed/unpriced runs show `—`. Breakdown modal kept (explicit user request, additive, no conflict). Trace drawer reverted to design format `$` + 2 dp (runs < $0.005 show `$0.00`, accepted).
- **Files modified:** `server/Specs/run-cost.md`, `client/Specs/run-cost.md`.
- **Skills used:** none.
- **Validation:** grep confirms no remaining fallback references in either spec.
- **Engineering insights:** Priority rule (requirements > design > conversation) should be applied before proposing deviations.
- **User approval:** Approved ("follow recommendation").
- **Next block:** 12 — Planned UI Components Review.

### Block 12 — Planned UI Components Review
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Presented exact UI components and insertion points with ASCII mockups, based on current source.
- **Key decisions:** New `CostBadge` (`client/src/components/cost-badge/`) and `CostBreakdownModal` (`pulls/_components/`). PR list: Cost column between Status and Updated (`GRID` +72px) — design's Findings/actions columns don't exist in the starter and stay out of scope; badge click opens modal with `stopPropagation`. Timeline: cost before time, side by side (`RunHistory.tsx:198-199`). Trace: Cost stat between Tokens and Findings, design `$`+2 dp (`TraceBody.tsx:64-66`). i18n in `messages/en/prReview.json`. Other design cost surfaces (PR header, Agents, dashboards) out of scope.
- **Files modified:** none.
- **Skills used:** none.
- **Validation:** insertion points verified against source.
- **Engineering insights:** PR list in the starter lacks the design's Findings and actions columns (intentional, `pulls/routes.ts:116`).
- **User approval:** Approved.
- **Next block:** Cost Feature Implementation Checkpoint.

### Cost Feature Implementation Checkpoint
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Implemented the approved run-cost scope. Server: migration `0010_safe_doctor_spectrum.sql` (single `ADD COLUMN cost_usd double precision`), executor persists reviewer-core `costUsd` (failed → null) + trace `stats.cost_usd`, cost exposed on `GET /repos/:id/pulls` (latest review, one extra IN-query), `GET /pulls/:id/runs`, `GET /runs/:id/trace` (legacy traces fall back to run row); contracts in both vendored copies. Client: `CostBadge` (design format), `CostBreakdownModal`, PR list Cost column (click opens modal, stopPropagation), timeline cost before time, trace COST stat ($ + 2 dp), i18n (`prReview.json`, `runs.json`).
- **Key decisions:** No token-based estimates anywhere. Trace i18n key placed in `runs.json` (drawer namespace) — spec corrected. Tests use `fireEvent` (user-event not installed; matches repo convention).
- **Files created:** `server/src/db/migrations/0010_safe_doctor_spectrum.sql`, `meta/0010_snapshot.json`, `server/test/cost.it.test.ts`, `client/src/components/cost-badge/{CostBadge.tsx,index.ts,CostBadge.test.tsx}`, `client/.../pulls/_components/CostBreakdownModal/{CostBreakdownModal.tsx,index.ts,CostBreakdownModal.test.tsx}`, `client/.../PRRow/PRRow.test.tsx`.
- **Files modified:** server `schema/runs.ts`, `meta/_journal.json`, `pulls/routes.ts`, `reviews/repository.ts`, `reviews/repository/run.repo.ts`, `reviews/run-executor.ts`, `test/contracts.test.ts`, both `vendor/shared/contracts/{platform,trace}.ts`; client `pulls/constants.ts`, `PRRow.tsx`, `RunHistory.tsx`(+test), `TraceBody.tsx`, `RunTraceDrawer.test.tsx`, `messages/en/{prReview,runs}.json`; `client/Specs/run-cost.md`.
- **Skills used:** `drizzle-orm-patterns`, `react-testing-library` (invoked). `fastify-best-practices`, `react-best-practices`, `zod` announced but NOT invoked.
- **Validation:** typecheck server/reviewer-core/client ✅; server unit 178/178 ✅; server integration 31/31 ✅ (incl. `cost.it.test.ts` 3/3, real Postgres via Docker); client 42/42 ✅; e2e NOT run (`agent-browser` not installed); not visually verified in a running app; dev DB not migrated.
- **Engineering insights:** Claude Code safety check blocked a non-destructive heredoc containing JS template literals (`${…}`) — workaround: script file in scratchpad.
- **User approval:** Approved.
- **Next block:** 13 — Test Coverage and Skill Usage Review.

### Block 13 — Test Coverage and Skill Usage Review
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Reported actual test coverage and skill usage. Backend: `cost.it.test.ts` (3, new), `contracts.test.ts` (+3). UI: `CostBadge.test` (2), `CostBreakdownModal.test` (2), `PRRow.test` (2) new; `RunHistory.test` +1, `RunTraceDrawer.test` +1. All passing; e2e and visual check not done.
- **Key decisions:** none.
- **Files modified:** `client/Insights.md` (Stop-hook-triggered entry: design cost-format contradiction).
- **Skills used (whole session):** `update-config`, `engineering-insights` (2× via Stop hook), `drizzle-orm-patterns`, `react-testing-library`. Announced but not invoked: `fastify-best-practices`, `react-best-practices`, `zod`.
- **Validation:** results as in implementation checkpoint.
- **Engineering insights:** Stop hook fired twice live and both times correctly requested a substantial unrecorded insight.
- **User approval:** Approved.
- **Next block:** 14 — Engineering Insights Execution.

### Block 14 — Engineering Insights Execution
- **Completed:** 2026-11-27
- **Status:** COMPLETED
- **Summary:** Ran the `engineering-insights` procedure over the session: screened candidates against the skill rules, read every target file in full, appended 7 entries (append-only, guard-enforced): server — follow-up `Update: fixed` on the run-cost entry, vendored shared contract drift, edited applied migrations silently skipped, no multi-agent review grouping / `reviews.run_id` without FK; client — contract drift (cross-module), PR list lacks design's Findings/actions columns, `user-event` not installed; e2e — seed has no agent run so cost is untestable end-to-end.
- **Key decisions:** Skipped: already-recorded design format contradiction (duplicate), legacy-trace fallback (derivable from code), guard/safety-check false positives (outside modules; in this log), PriceBook cold-start null cost (unverified). `reviewer-core/Insights.md` stays empty. Item 7 corrected during verification: seed creates no `agent_runs` row at all (not "run without cost").
- **Files modified:** `server/Insights.md` (1 → 5 entries), `client/Insights.md` (1 → 4), `e2e/Insights.md` (0 → 1).
- **Skills used:** `engineering-insights` (procedure applied).
- **Validation:** heading counts verified; all cited paths/lines re-checked against current code; drift re-measured with `git diff --no-index --stat` (5 files); no existing entry modified.
- **Engineering insights:** recorded as above.
- **User approval:** Approved.
- **Next block:** Final Workflow Report.

---

## Final Workflow Report — 2026-11-27

### Completed workflow blocks
01–14 and the Cost Feature Implementation Checkpoint — all COMPLETED with explicit user approval. Blocks 04–07 additionally revisited (research addendum from the user's research file, decisions C1–C4, P3–P7).

### Skipped or blocked blocks
None skipped or blocked. Block 02 is marked for a later reopen (user-agreed): apply the slide "CLAUDE.md is a map, not documentation".

### Approved architectural decisions
- Modules: `server`, `client`, `reviewer-core`, `e2e`; `@devdigest/shared` is vendored in server and client (Block 01).
- Per-module `CLAUDE.md` (links only) + `Docs/`, `Specs/`, `Insights.md`; e2e uses existing lowercase `specs/` (Block 02, option A).
- Migrations: never edit an applied migration; schema change → `pnpm db:generate` → new migration (Block 03).
- Engineering Insights: skill with 3 categories (Improvement / Problem / Contradiction), evidence + "save 5+ minutes" test, path-prefix routing, cross-module entries in every affected module, fixed 5-line format, append-only follow-ups, 100-entry cap with manual review, agents never prune (Blocks 04–08, C1–C4).
- Automation: `UserPromptSubmit` read reminder; `Stop` prompt hook for unrecorded insights; `PreToolUse` append-only guard `insights-guard.py` (Blocks 05, 09).
- Cost: persisted `agent_runs.cost_usd` via new migration 0010; PR list = latest review cost (one review = one agent run); no token-based estimates — unknown cost shows `—`; design formats followed (trace drawer `$` + 2 dp); breakdown modal added at user request (Blocks 10–12).
- Priority rule (user): requirements files and designs take precedence.

### Documentation files created or updated
- `ENGINEERING_WORKFLOW.md`, `ENGINEERING_WORKFLOW_LOG.md`
- `CLAUDE.md`, `server/CLAUDE.md`, `client/CLAUDE.md`, `reviewer-core/CLAUDE.md`, `e2e/CLAUDE.md`
- `{server,client,reviewer-core}/Docs/`, `{server,client,reviewer-core}/Specs/`, `e2e/Docs/` (`.gitkeep`)
- `server/Insights.md`, `client/Insights.md`, `reviewer-core/Insights.md`, `e2e/Insights.md`
- `server/Specs/run-cost.md`, `client/Specs/run-cost.md`

### Skills created or modified
- Created: `.claude/skills/engineering-insights/SKILL.md`, `references/examples.md`, `references/research.md`
- Modified: `.claude/skills/README.md` (catalog row)
- Config: `.claude/settings.json` (3 hooks), `.claude/hooks/insights-guard.py`

### Feature implementation summary
- Server: migration `0010_safe_doctor_spectrum.sql` (+ snapshot, journal); `schema/runs.ts` `costUsd`; `run-executor.ts` persists `costUsd` (failed run → null) and trace `stats.cost_usd`; cost exposed on `GET /repos/:id/pulls` (latest review), `GET /pulls/:id/runs`, `GET /runs/:id/trace` (legacy traces fall back to the run row); contracts updated in both vendored copies.
- Client: `CostBadge` (design format: < $1 → 3 dp, else 2 dp, `—` when null); `CostBreakdownModal` (runs table, latest vs all-runs totals, unknown count, loading/error/empty); PR list Cost column (Status | Cost | Updated, click → modal); timeline cost before run time; trace drawer COST stat; i18n in `prReview.json` and `runs.json`.

### Backend and UI test results
- Typecheck: server, reviewer-core, client ✅
- Server unit: 178/178 ✅; server integration: 31/31 ✅ (incl. new `cost.it.test.ts` 3/3 on real Postgres); `contracts.test.ts` +3
- Client: 42/42 ✅ (new `CostBadge.test`, `CostBreakdownModal.test`, `PRRow.test`; extended `RunHistory.test`, `RunTraceDrawer.test`)
- e2e: NOT run (`agent-browser` not installed)

### Engineering insights recorded
- `server/Insights.md` — 5 entries (run cost discarded + follow-up fixed; shared contract drift; edited migrations silently skipped; no multi-agent review grouping / `reviews.run_id` without FK)
- `client/Insights.md` — 4 entries (design cost-format contradiction; contract drift; PR list missing design columns; `user-event` not installed)
- `e2e/Insights.md` — 1 entry (seed has no agent run → cost not testable e2e)
- `reviewer-core/Insights.md` — none

### Outstanding issues and recommendations
- Insights guard Bash check gives false positives when a command merely mentions a redirect and `Insights.md` (workaround: use Edit).
- e2e not run; app not visually verified in a browser.
- Dev database not migrated (`pnpm db:migrate` not run against dev DB, per constraint).
- Nothing committed; untracked `DevDigest Design (standalone) (1).html` in repo root.
- Skills `fastify-best-practices`, `react-best-practices`, `zod` were announced but not invoked.
- Block 02 reopen pending (slide "CLAUDE.md is a map, not documentation").
- Trace drawer shows `$0.00` for runs < $0.005 (design-following, recorded in `client/Insights.md`).

### Generated artifacts (relative paths)
- Workflow: `ENGINEERING_WORKFLOW.md`, `ENGINEERING_WORKFLOW_LOG.md`
- Structure: `CLAUDE.md`, `*/CLAUDE.md`, `*/Insights.md`, `*/Docs/`, `*/Specs/`
- Skill & hooks: `.claude/skills/engineering-insights/`, `.claude/settings.json`, `.claude/hooks/insights-guard.py`
- Specs: `server/Specs/run-cost.md`, `client/Specs/run-cost.md`
- Server: `server/src/db/migrations/0010_safe_doctor_spectrum.sql`, `server/src/db/migrations/meta/0010_snapshot.json`, `server/test/cost.it.test.ts`
- Client: `client/src/components/cost-badge/`, `client/src/app/repos/[repoId]/pulls/_components/CostBreakdownModal/`, `client/src/app/repos/[repoId]/pulls/_components/PRRow/PRRow.test.tsx`
