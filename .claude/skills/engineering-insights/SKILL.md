---
name: engineering-insights
description: "Records engineering insights discovered while working in this repo into the Insights.md of the affected module (server, client, reviewer-core, e2e). Use whenever, during any task, you notice an idea to clarify or improve something, a potential problem, or a contradiction (code vs docs, docs vs docs, code vs tests, spec vs implementation) - not only when the user asks. Also use when the user says record/note/remember an insight, gotcha, pitfall, inconsistency, mismatch, outdated docs, or tech debt."
---

# Engineering Insights

Capture what you learned while working that the next agent could NOT read off the code,
and record it in the Insights.md of the module it concerns.

## Before work: read

After the user's prompt and before starting work, identify the module(s) the task
touches or discusses and Read their Insights.md (see "Where to record" for paths).
Use what is there; do not re-discover known issues.
Then state in ONE line which entries apply to this task (by title), or "No recorded
insights apply" - this proves the file was actually read.

## When to record

Watch for insights throughout the whole task, not only at the end; record them at the
end of the work (end of the task/session), not mid-flight. Record only
SUBSTANTIAL insights - if you found nothing beyond what is already documented, write nothing.

Record an insight only when ALL of these hold:

1. It fits one of the three categories:
   - **Improvement** - an idea to clarify or improve code, docs, tests, or workflow.
   - **Problem** - a potential bug, risk, fragile spot, or trap.
   - **Contradiction** - two sources disagree: code vs docs, docs vs docs,
     code vs tests, spec vs implementation, one copy vs another copy.
2. It is not derivable from simply reading the code (no restating what a file does).
3. You have concrete evidence: a file/line, a command output, a diff, a failing test.
4. Line test: would it save a future agent 5+ minutes or prevent a mistake? If no, skip it.

Strongest signals, in priority order: (1) the user corrected you, (2) an attempt failed
and you found why, (3) two sources disagreed, (4) something worked only in a non-obvious way.

Do NOT record: style nitpicks, what a linter/typechecker catches, generic language
best practices, task progress notes, or speculation without evidence.

## Where to record (module routing)

Route by the path of the file(s) the insight concerns:

| Path prefix       | Insights file               |
|-------------------|-----------------------------|
| `server/`         | `server/Insights.md`        |
| `client/`         | `client/Insights.md`        |
| `reviewer-core/`  | `reviewer-core/Insights.md` |
| `e2e/`            | `e2e/Insights.md`           |

- **Spans several modules** (e.g. drift between `server/` and `client/` copies):
  record it in EVERY affected module's Insights.md, each entry naming the other modules.
- **Outside all modules** (root `README.md`, `TESTING.md`, `.github/`, `scripts/`, `docs/`):
  record it in the module(s) the insight affects in practice
  (e.g. a CI workflow for server tests -> `server/Insights.md`).

## Entry format

Append exactly this block at the END of the target file:

```markdown
### YYYY-MM-DD - <short title>
- **Category:** Improvement | Problem | Contradiction
- **Where:** `path/to/file.ts:123` (one or more locations)
- **Evidence:** <what you observed and how you verified it>
- **Suggestion:** <what should be done about it>
```

Keep each entry to these 5 lines; be specific (paths, identifiers, numbers).
See [references/examples.md](references/examples.md) for one example per category.

### Follow-up format (comment on an existing entry)

When your finding relates to an EXISTING entry, never edit that entry. Append a
follow-up at the END of the file instead:

```markdown
### YYYY-MM-DD - Follow-up: <exact title of the existing entry>
- **Category:** <same category as the existing entry>
- **Refers to:** "<YYYY-MM-DD - exact title of the existing entry>"
- **Update:** new evidence | still present | fixed | disagree
- **Evidence:** <what you observed and how you verified it>
```

## Procedure

This procedure is the same in manual mode (`/engineering-insights`) and automatic mode
(invoked on your own, or because a Stop hook asked you to run this skill).

1. Decide the insight passes "When to record".
2. Pick the target file(s) via "Where to record".
3. Read the WHOLE target file and review every existing entry. If it already has 100 or
   more entries (`### ` headings), do NOT write: tell the user the file needs a manual
   review/consolidation (agents never prune). Otherwise choose ONE outcome:
   - **Not covered** by any entry -> append a new entry ("Entry format").
   - **Same issue, nothing new** -> record nothing in that file.
   - **Related to an existing entry** and you have new evidence, a status change
     (still present / fixed), or you disagree with it -> append a follow-up
     ("Follow-up format").
4. Append at the end of the file. Never rewrite or reorder existing content.
5. Tell the user in one line which file(s) you recorded in and which outcome applied,
   or that nothing was recorded (and why: duplicate / not substantial).
