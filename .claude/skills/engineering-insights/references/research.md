# Engineering Insights — research record

Provenance of the `engineering-insights` skill design (workflow Blocks 04–07, 2026-11-27).
Not referenced from SKILL.md, so it is never loaded during normal skill use.
All pages fetched via `web-fetch` subagents; quotes are as reported by those fetches.

## Sources and read coverage

| # | Source | Loaded | Coverage |
|---|--------|--------|----------|
| 1 | https://code.claude.com/docs/en/skills.md | yes | full (verbatim, in 2 passes) |
| 2 | https://code.claude.com/docs/en/hooks.md | yes | needed sections verbatim; ~160K–180K chars (PermissionRequest) skipped — irrelevant |
| 3 | https://code.claude.com/docs/en/memory.md | yes | full |
| 4 | https://agentskills.io/specification | yes | full |
| 5 | https://claude.com/resources/articles/steering-claude-code-skills-hooks-rules-subagents-and-more | yes | full |
| 6 | https://www.anthropic.com/research/components-of-agent-memory | yes | full |
| 7 | https://www.anthropic.com/research/effective-context-engineering-for-ai-agents | yes | full |
| 8 | https://arxiv.org/abs/2610.27377 (REM) | yes | full HTML |
| 9 | https://arxiv.org/abs/2608.27454 (WikiSkill) | partial | HTML to ~120K of 146K chars; Appendix E prompts are base64 in HTML; PDF/e-print downloaded but not extractable (no pdftotext/pdftoppm locally) |
| 10 | https://arxiv.org/abs/2603.18743 (Memento-Skills) | yes | full HTML + repo `github.com/Memento-Teams/Memento-Skills` (README partial, 1 of 4 builtin skills) |
| 11 | https://github.com/anthropics/claude-code/issues/11759 | yes | full |
| 12 | https://github.com/anthropics/claude-code/issues/24987 | yes | full |
| — | Slides: "CLAUDE.md — a map, not documentation"; "Lazy load context: 5 mechanisms" | images | full |

## Key facts used

- **Triggering (1, 4):** only `description` drives auto-invocation; keep key use case first; include
  keywords users would naturally say. Description+`when_to_use` capped at 1,536 chars (CC), 1,024 (spec).
  SKILL.md < 500 lines; supporting files load only when referenced.
- **Skill troubleshooting (1):** "Claude skipped a rule that must hold every time: move the rule into a
  hook"; "word the guidance so it applies to the whole task". Validate with `claude plugin validate .claude/skills`.
- **Hooks (2):** no "insight discovered" event. `UserPromptSubmit` stdout -> context (receives `prompt`, `cwd`).
  `Stop` fires per turn; `decision: block` + `reason` continues; `stop_hook_active`; 8-continuation cap.
  `SessionEnd` has no decision control. `prompt` hooks return `{"ok", "reason"}`; see only hook input.
- **Memory (3):** Insights.md is not auto-loaded; CLAUDE.md is context, not enforced; subdirectory
  CLAUDE.md loads lazily; `@` imports load eagerly (also 11).
- **Steering (5):** skills = procedures visible in main thread; "every time X, always Y" = hook.
- **Agent memory (6):** store what can't be read from the environment; record how you know; tell agent
  to read memory first (nearly doubled score); keep always-loaded layer small.
- **Context engineering (7):** smallest high-signal token set; few canonical examples > rule lists;
  simplest thing that works.
- **REM (8):** typed, phase-structured docs (~270 tokens) beat prose (identifier coverage 69.1% vs 45.7%).
  Discovered fields: files_modified, root_cause, fix_approach, related_functions, test_cases,
  bug_description, repository_info, error_messages. Staleness/dedup not studied.
- **WikiSkill (9):** patch-based edits (append/replace/insert); wiki "never rolled back"; append-only
  skill-impact.md records accepted AND rejected proposals so they are not re-proposed; no pruning.
  Index format / 10–30 line rule: UNVERIFIED (appendix not readable).
- **Memento-Skills (10):** write back on failure only; attribute to a single skill; every mutation behind
  a unit-test gate with rollback.
- **Issues (11, 12):** `@` imports are eager; subdirectory CLAUDE.md not loaded in VS Code extension.

## Collected skill examples (verbatim)

From (1) — description-driven auto-invocation:
```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---
```
From (1) — manual-only:
```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```
From (1) — forked:
```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---
```
From (1) — script-backed:
```yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python3 *)
---
```
From (4) — minimal: `name: skill-name` / `description: A description of what this skill does and when to use it.`
Good description (4): "Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction." Poor: "Helps with PDFs."
From (10) repo — `builtin/skills/filesystem/SKILL.md` description: "Direct filesystem operations (read, write, edit, list, search files). Use for any file manipulation tasks."
From (2) — Stop agent hook: `{"type": "agent", "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS", "timeout": 120}`

Common pattern: **"<what it does>. Use when <triggers, incl. words users say>."**

## Adopted / rejected

Adopted: description-triggered skill + `/engineering-insights`; UserPromptSubmit reminder hook; Stop
prompt hook; typed 5-field entry (REM); Evidence field (6, 10); append-only (9); 3 canonical examples (7).
Rejected as overkill for 4 small files: wiki+index (9), eviction (8), dreaming consolidation (6),
rejected-proposal log (9), unit-test gate (10).

## Addendum (2026-11-27) — user research file `engineering-insights-research.md`

| # | Source | Loaded | Taken / rejected |
|---|--------|--------|------------------|
| A1 | mindstudio.ai/blog/self-learning-ai-skill-system-learnings-md-wrap-up | yes | vague-vs-useful examples (P6); 200+ entries -> signal drops (P5). Its "post-session" trigger is actually a PostToolUse hook, not Stop |
| A2 | mindstudio.ai/blog/how-to-build-learnings-loop-claude-code-skills | yes | "confirm you've read … summarize the top 3 most relevant points" -> forced active read (P3); consolidate at ~80–100 bullets (P5) |
| A3 | mindstudio.ai/blog/compounding-knowledge-loop-claude-code | yes | Stop-hook capture script calling Anthropic API — rejected (API key, transcript leaves machine, "not production-ready") |
| A4 | mindstudio.ai/blog/self-learning-claude-code-skill-learnings-md | yes | "summarize … in 3–5 bullets" (P3); 80–100 lines -> trim (P5); Confidence field — rejected (Evidence covers it) |
| A5 | mindstudio.ai/blog/self-evolving-claude-code-memory-obsidian-hooks | yes | 4 categories Patterns/Mistakes/Decisions/Context — rejected (user's 3 categories kept, C1) |
| A6 | mindstudio.ai/blog/what-is-claude-code-auto-memory | yes | store recurring, non-inferable, stable, project-specific facts — confirms existing rules |
| A7 | mindstudio.ai/blog/claude-code-skills-code-scripts-vs-markdown-instructions | yes | deterministic parts -> scripts (vendor numbers, unbenchmarked) — confirms insights-guard.py |
| A8 | mindstudio.ai/blog/claude-code-skills-vs-hooks-difference | yes | "hooks aren't called by Claude" — confirms hook/skill split |
| A9 | mindstudio.ai/blog/claude-code-context-compounding-explained | yes | keep always-loaded context small (outdated pricing/models on page) |
| A10 | dev.to Rozenhek "Self-Improving AI" | yes | NEVER/ALWAYS, lead with why — style only; its rewrite-rules approach rejected (append-only) |
| A11 | dev.to evoleinik "CLAUDE.md persistent memory" | yes | "save 5+ minutes next time" test (P4); max 30 items/monthly prune — pruning rejected for agents (C3) |
| A12 | github.com/glebis/claude-skills retrospective/SKILL.md | yes | user corrections rank above tool failures (P4); dedup vs existing files — confirms |
| A13 | claude.com/blog/lessons-from-building-claude-code-how-we-use-skills | yes (via claude.dev redirect, user-approved) | skills = folders; skill-scoped hooks (/careful, /freeze); append-only log in skills; "Gotchas section = highest signal"; description = when to trigger; measure usage via PreToolUse logging (not adopted yet) |
| A14 | platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | yes | third-person description with what+when (ours complies); gerund names (kept user's name); ≥3 evals, test across models (relevant to Block 13) |
| A15 | mcpmarket.com lessons-learned-retrospectives / claude-md-lessons-manager | listing pages only | "specific, actionable, reusable"; duplicate-detection claims unverifiable |
| A16 | glama.ai Omega reddit-drafts | no (URL contains literal `...`) | user's excerpt only |

Conflicts resolved with user (C1–C4): keep 3 categories; append at end only (no sections);
agents never prune — at 100+ entries ask for manual review; keep `Insights.md` per module.
Applied: P3 forced active read (SKILL.md + UserPromptSubmit reminder), P4 signals + 5-min test,
P5 100-entry cap, P6 vague-vs-useful example, P7 this addendum.
