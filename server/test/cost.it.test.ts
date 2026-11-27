import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startPg, dockerAvailable, type PgFixture } from './helpers/pg.js';
import { waitForPrRuns } from './helpers/runs.js';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/platform/config.js';
import { seed } from '../src/db/seed.js';
import { MockLLMProvider, MockEmbedder, MockGitClient } from '../src/adapters/mocks.js';
import * as t from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import type { Review } from '@devdigest/shared';

/**
 * Run cost (server/Specs/run-cost.md): migration 0010 adds agent_runs.cost_usd,
 * the run executor persists reviewer-core's costUsd, and the PR list, run
 * history and run trace expose it. No derivation from tokens: runs without a
 * stored cost surface `null`.
 */
const hasDocker = await dockerAvailable();
const d = hasDocker ? describe : describe.skip;

const config = () => loadConfig({ ...process.env, NODE_ENV: 'test' } as NodeJS.ProcessEnv);

const DIFF = `diff --git a/src/config.ts b/src/config.ts
--- a/src/config.ts
+++ b/src/config.ts
@@ -10,3 +10,4 @@
   port: 3000,
+  stripeKey: "sk_live_xxx",
   redisUrl: x,`;

const REVIEW_FIXTURE: Review = {
  verdict: 'request_changes',
  summary: 'Hardcoded Stripe secret introduced.',
  score: 42,
  findings: [
    {
      id: 'f-valid',
      severity: 'CRITICAL',
      category: 'security',
      title: 'Hardcoded Stripe secret key',
      file: 'src/config.ts',
      start_line: 11,
      end_line: 11,
      rationale: 'A live Stripe key is committed in source.',
      confidence: 0.95,
      kind: 'finding',
    },
  ],
};

let seq = 0;
async function setupRepoAndPr(db: PgFixture['handle']['db'], workspaceId: string) {
  const name = `cost-api-${seq++}`;
  const [repo] = await db
    .insert(t.repos)
    .values({ workspaceId, owner: 'acme', name, fullName: `acme/${name}` })
    .returning();
  const [pr] = await db
    .insert(t.pullRequests)
    .values({
      workspaceId,
      repoId: repo!.id,
      number: 900 + seq,
      title: 'Cost test PR',
      author: 'tester',
      branch: 'feat/cost',
      base: 'main',
      headSha: 'c0ffee00',
      additions: 1,
      deletions: 0,
      filesCount: 1,
      status: 'needs_review',
    })
    .returning();
  await db.insert(t.prFiles).values({
    prId: pr!.id,
    path: 'src/config.ts',
    additions: 1,
    deletions: 0,
    patch: '@@ -10,3 +10,4 @@\n   port: 3000,\n+  stripeKey: "sk_live_xxx",\n   redisUrl: x,',
  });
  return { repo: repo!, pr: pr! };
}

d('Run cost (Testcontainers pg)', () => {
  let pg: PgFixture;
  let workspaceId: string;

  beforeAll(async () => {
    pg = await startPg(); // applies all migrations, incl. 0010 (agent_runs.cost_usd)
    await seed(pg.handle.db);
    const [ws] = await pg.handle.db.select().from(t.workspaces);
    workspaceId = ws!.id;
  });
  afterAll(async () => {
    await pg?.stop();
  });

  function app() {
    return buildApp({
      config: config(),
      db: pg.handle.db,
      overrides: {
        embedder: new MockEmbedder(),
        git: new MockGitClient({ diff: DIFF }),
        // MockLLMProvider reports costUsd: 0.001 per call
        llm: { openai: new MockLLMProvider('openai', { structured: REVIEW_FIXTURE }) },
      },
    });
  }

  it('persists run cost and exposes it on runs, trace and the PR list', async () => {
    const a = await app();
    const { repo, pr } = await setupRepoAndPr(pg.handle.db, workspaceId);
    const agent = (
      await a.inject({
        method: 'POST',
        url: '/agents',
        payload: { name: 'Cost Sec', provider: 'openai', model: 'gpt-4.1', system_prompt: 'sec' },
      })
    ).json();

    const res = await a.inject({ method: 'POST', url: `/pulls/${pr.id}/review`, payload: { agentId: agent.id } });
    expect(res.statusCode).toBe(200);
    const [run] = await waitForPrRuns(pg.handle.db, pr.id, { expected: 1 });
    expect(run!.status).toBe('done');

    // DB: cost persisted from reviewer-core (sum of mock calls, each 0.001)
    expect(run!.costUsd).not.toBeNull();
    expect(run!.costUsd!).toBeGreaterThan(0);
    const cost = run!.costUsd!;

    // GET /pulls/:id/runs
    const runs = (await a.inject({ method: 'GET', url: `/pulls/${pr.id}/runs` })).json();
    expect(runs[0].cost_usd).toBeCloseTo(cost, 10);

    // GET /runs/:id/trace
    const trace = (await a.inject({ method: 'GET', url: `/runs/${run!.id}/trace` })).json();
    expect(trace.stats.cost_usd).toBeCloseTo(cost, 10);

    // GET /repos/:id/pulls — latest review cost
    const list = (await a.inject({ method: 'GET', url: `/repos/${repo.id}/pulls` })).json();
    const row = list.find((p: { id: string }) => p.id === pr.id);
    expect(row.cost_usd).toBeCloseTo(cost, 10);

    await a.close();
  });

  it('a failed run stores cost_usd = null', async () => {
    class FailingLLM extends MockLLMProvider {
      override async completeStructured<T>(): Promise<never> {
        throw new Error('provider exploded');
      }
    }
    const a = await buildApp({
      config: config(),
      db: pg.handle.db,
      overrides: {
        embedder: new MockEmbedder(),
        git: new MockGitClient({ diff: DIFF }),
        llm: { openai: new FailingLLM('openai') },
      },
    });
    const { pr } = await setupRepoAndPr(pg.handle.db, workspaceId);
    const agent = (
      await a.inject({
        method: 'POST',
        url: '/agents',
        payload: { name: 'Cost Fail', provider: 'openai', model: 'gpt-4.1', system_prompt: 'x' },
      })
    ).json();
    await a.inject({ method: 'POST', url: `/pulls/${pr.id}/review`, payload: { agentId: agent.id } });
    const [run] = await waitForPrRuns(pg.handle.db, pr.id, { expected: 1 });
    expect(run!.status).toBe('failed');
    expect(run!.costUsd).toBeNull();
    const runs = (await a.inject({ method: 'GET', url: `/pulls/${pr.id}/runs` })).json();
    expect(runs[0].cost_usd).toBeNull();
    await a.close();
  });

  it('runs without a stored cost (pre-feature) surface null everywhere — no token-based estimate', async () => {
    const a = await app();
    const { repo, pr } = await setupRepoAndPr(pg.handle.db, workspaceId);
    const db = pg.handle.db;

    // A "legacy" run: tokens known, cost_usd NULL, trace without stats.cost_usd.
    const [legacy] = await db
      .insert(t.agentRuns)
      .values({
        workspaceId,
        prId: pr.id,
        provider: 'openai',
        model: 'gpt-4.1',
        status: 'done',
        durationMs: 1000,
        tokensIn: 5000,
        tokensOut: 800,
        findingsCount: 0,
        grounding: '0/0 passed',
      })
      .returning();
    await db.insert(t.runTraces).values({
      runId: legacy!.id,
      trace: {
        config: { agent: 'Legacy', model: 'gpt-4.1', source: 'local' },
        stats: { duration_ms: 1000, tokens_in: 5000, tokens_out: 800, findings: 0, grounding: '0/0 passed' },
        prompt_assembly: { system: '', user: '', blocks: [] },
        tool_calls: [],
        raw_output: '',
        memory_pulled: [],
        specs_read: [],
        log: [],
      },
    });
    await db.insert(t.reviews).values({
      workspaceId,
      prId: pr.id,
      runId: legacy!.id,
      kind: 'review',
      verdict: 'comment',
      summary: 'legacy',
      score: 80,
      model: 'gpt-4.1',
    });

    const runs = (await a.inject({ method: 'GET', url: `/pulls/${pr.id}/runs` })).json();
    expect(runs[0].cost_usd).toBeNull();

    const traceRes = await a.inject({ method: 'GET', url: `/runs/${legacy!.id}/trace` });
    expect(traceRes.statusCode).toBe(200);
    expect(traceRes.json().stats.cost_usd).toBeNull();

    const list = (await a.inject({ method: 'GET', url: `/repos/${repo.id}/pulls` })).json();
    expect(list.find((p: { id: string }) => p.id === pr.id).cost_usd).toBeNull();

    // never written back
    const [after] = await db.select().from(t.agentRuns).where(eq(t.agentRuns.id, legacy!.id));
    expect(after!.costUsd).toBeNull();

    await a.close();
  });
});
