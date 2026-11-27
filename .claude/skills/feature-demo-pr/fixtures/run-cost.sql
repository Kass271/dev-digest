-- Demo fixture for the run-cost recording. Applied by stack.sh to the THROWAWAY
-- demo DB only (never the dev DB; seed.ts untouched). The seed creates PR #482's
-- pr_files without patches, so a real review would see an empty diff and cost ~$0.
-- These patches match the seeded PR story (rate limiter, Stripe key, N+1).
UPDATE pr_files f SET patch = $p$@@ -0,0 +1,24 @@
+import type { Request, Response, NextFunction } from 'express';
+
+type Bucket = { tokens: number; updatedAt: number };
+const buckets = new Map<string, Bucket>();
+
+export function rateLimit(limit = 60, windowMs = 60_000) {
+  return (req: Request, res: Response, next: NextFunction) => {
+    const key = req.ip ?? 'unknown';
+    const now = Date.now();
+    const b = buckets.get(key) ?? { tokens: limit, updatedAt: now };
+    const refill = ((now - b.updatedAt) / windowMs) * limit;
+    b.tokens = Math.min(limit, b.tokens + refill);
+    b.updatedAt = now;
+    if (b.tokens < 1) {
+      res.status(429).json({ error: 'Too many requests' });
+      return;
+    }
+    b.tokens -= 1;
+    buckets.set(key, b);
+    next();
+  };
+}
$p$
FROM pull_requests p WHERE f.pr_id = p.id AND p.number = 482 AND f.path = 'src/middleware/ratelimit.ts';

UPDATE pr_files f SET patch = $p$@@ -1,10 +1,14 @@
 import { Router } from 'express';
+import { rateLimit } from '../../middleware/ratelimit';
 import { handleStripeEvent } from '../../billing/stripe';

 export const webhooks = Router();

-webhooks.post('/stripe', async (req, res) => {
+webhooks.post('/stripe', rateLimit(30), async (req, res) => {
+  // TODO: verify signature
   const event = req.body;
   await handleStripeEvent(event);
   res.sendStatus(200);
 });
$p$
FROM pull_requests p WHERE f.pr_id = p.id AND p.number = 482 AND f.path = 'src/api/public/webhooks.ts';

UPDATE pr_files f SET patch = $p$@@ -3,3 +3,7 @@ export const config = {
   port: Number(process.env.PORT ?? 3000),
   dbUrl: process.env.DATABASE_URL!,
+  rateLimitPerMinute: 60,
+  stripe: {
+    secretKey: 'sk_live_DEMO-NOT-A-REAL-KEY',
+  },
 };
$p$
FROM pull_requests p WHERE f.pr_id = p.id AND p.number = 482 AND f.path = 'src/config.ts';

UPDATE pr_files f SET patch = $p$@@ -8,9 +8,14 @@ import { db } from '../db';
 export const users = Router();

-users.get('/', async (_req, res) => {
-  res.json(await db.user.findMany({ include: { orders: true } }));
+users.get('/', rateLimit(), async (_req, res) => {
+  const list = await db.user.findMany();
+  for (const u of list) {
+    (u as any).orders = await db.order.findMany({ where: { userId: u.id } });
+  }
+  res.json(list);
 });
$p$
FROM pull_requests p WHERE f.pr_id = p.id AND p.number = 482 AND f.path = 'src/api/users.ts';
