---
name: feature-demo-pr
description: Records a video of a feature delivered through the engineering workflow (real user flow in the UI via Playwright on an isolated stack), then pushes a branch and opens a GitHub PR whose description explains the feature and what was done in the workflow. Run only when the user asks for a feature demo video / demo PR / "record and open a PR".
disable-model-invocation: true
argument-hint: "[feature slug, e.g. run-cost]"
---

# Feature demo + PR

Turn a feature finished in the engineering workflow into: (1) a screen recording of its
real user flow, (2) a pushed branch, (3) a PR with a description of the feature and the
workflow, plus one comment on how the video was made.

Paths below are relative to this skill's folder (`.claude/skills/feature-demo-pr/`) unless
they start with a repo folder.

## 1. Identify the feature

1. Read `ENGINEERING_WORKFLOW_LOG.md` (block entries + Final Workflow Report) and the
   feature specs (`*/Specs/<slug>.md`). The slug is `$ARGUMENTS`; if empty, take the
   feature from the latest Final Workflow Report and confirm it with the user.
2. From the specs' screen list, derive the user flow to record: every UI place the
   feature changed, in the order a user would meet them.

## 2. Write the flow

Create `flows/<slug>.flow.json` (keep it; it is the reproducible script for the video).
Step types understood by `scripts/record.mjs`:

| Step | Fields | Effect |
|------|--------|--------|
| `goto` | `path` | open `BASE + path` |
| `click` | one of `text`, `role`+`name`, `label`; optional `exact` | click the element |
| `waitText` | `text` or `regex`; optional `timeout` (ms) | wait until visible |
| `waitUrl` | `contains` | wait for URL |
| `press` | `key` | keyboard key (e.g. `Escape`) |
| `caption` | `text` | show a caption bar in the video |
| `pause` | `ms` | hold so viewers can read |

Rules: use visible texts / ARIA names from `client/messages/en/*.json` (no CSS selectors);
add a `caption` before each feature screen; `pause` ≥ 1500 ms on each result.
If the flow needs data the seed lacks (see `e2e/Insights.md`), produce it through the UI
(e.g. run a real review) rather than inserting result rows. Inputs the seed lacks (e.g.
PR #482 has no file patches, so a review sees an empty diff) go in `fixtures/<slug>.sql`,
applied to the throwaway DB only via `DEMO_FIXTURE`; say so in the PR comment.

## 3. Preflight

- `docker info`, `ffmpeg -version`, `gh auth status` must succeed.
- LLM key for the agents used in the flow must be configured (Settings store
  `~/.devdigest/secrets.json` or `server/.env`). Check presence only — NEVER print a key.
- First run only: `cd .claude/skills/feature-demo-pr && npm install` (Playwright, local to
  the skill; reuses the cached Chromium, else `npx playwright install chromium`).

## 4. Record

```bash
DEMO_FIXTURE=.claude/skills/feature-demo-pr/fixtures/<slug>.sql \
.claude/skills/feature-demo-pr/scripts/stack.sh \
  node .claude/skills/feature-demo-pr/scripts/record.mjs flows/<slug>.flow.json out/<slug>
.claude/skills/feature-demo-pr/scripts/to-media.sh out/<slug> docs/demos/<slug>
```

`stack.sh` boots an isolated, freshly seeded stack (Postgres :5441, API :3121, web :3120 — override with `DEMO_*_PORT`;
never the dev DB), runs the given command with `BASE` set, and always tears it down.
`to-media.sh` writes `docs/demos/<slug>/demo.mp4` and `demo.gif` (GIF ≤ ~8 MB).
Open a few frames (Read the GIF or extract PNGs) and check the feature is actually visible
before continuing. If a step fails, report it — do not fake or stitch footage.

## 5. Prepare the PR (show the user, do not push yet)

1. Branch: `feature/<slug>` from the current branch (never commit on `main`).
2. Stage the feature's files from the workflow log ("Files created/modified" + artifacts
   list) plus `docs/demos/<slug>/` and the flow file. Ask about anything unrelated or
   untracked that is not in the log. Never stage secrets (`.env`, `secrets.json`).
3. Fill `references/pr-template.md` from the workflow log and specs — facts only, copy
   real test numbers; list limitations honestly.
4. Show the user: branch, `git status --short` of staged files, PR title and body.
   **Wait for explicit approval** before step 6.

## 6. Push and open the PR (after approval)

```bash
git commit -m "<type>: <feature summary>"      # include attribution lines if required
git push -u origin feature/<slug>
gh pr create --base main --title "<title>" --body-file <filled template>
gh pr comment <number> --body "<how the demo was recorded: flow file, stack, real LLM run, model>"
```

The GIF in the body must use an absolute URL that renders after push:
`https://github.com/<owner>/<repo>/raw/feature/<slug>/docs/demos/<slug>/demo.gif`.
Report the PR URL. Do not merge.
