// Play a flow JSON in Chromium and record it. Usage: node record.mjs <flow.json> <outDir>
// Relative paths resolve against the skill folder. BASE comes from stack.sh.
import { readFileSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(join(SKILL, "package.json"))("playwright");
const at = (p) => (p.startsWith("/") ? p : join(SKILL, p));

const [flowPath, outArg] = process.argv.slice(2);
if (!flowPath || !outArg) throw new Error("usage: record.mjs <flow.json> <outDir>");
const BASE = process.env.BASE;
if (!BASE) throw new Error("BASE not set (run via stack.sh)");
const flow = JSON.parse(readFileSync(at(flowPath), "utf8"));
const outDir = at(outArg);
mkdirSync(outDir, { recursive: true });

const size = { width: 1440, height: 900 };
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: size, recordVideo: { dir: outDir, size } });
const page = await context.newPage();
page.setDefaultTimeout(30_000);

async function caption(text) {
  await page.evaluate((t) => {
    let el = document.getElementById("__demo_caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "__demo_caption";
      el.style.cssText =
        "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;" +
        "background:rgba(17,17,17,.88);color:#fff;font:600 18px/1.4 system-ui,sans-serif;" +
        "padding:10px 18px;border-radius:10px;pointer-events:none;max-width:80%;text-align:center";
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, text);
}

function locate(s) {
  if (s.role) return page.getByRole(s.role, { name: s.regex ? new RegExp(s.name) : s.name, exact: s.exact });
  if (s.label) return page.getByLabel(s.label, { exact: s.exact });
  return page.getByText(s.regex ? new RegExp(s.text) : s.text, { exact: s.exact });
}

let failed = null;
for (const [i, s] of flow.steps.entries()) {
  const tag = `#${i + 1} ${s.do}${s.note ? ` (${s.note})` : ""}`;
  try {
    if (s.do === "goto") await page.goto(BASE + s.path);
    else if (s.do === "click") await locate(s).first().click();
    else if (s.do === "waitText") await locate(s).first().waitFor({ state: "visible", timeout: s.timeout });
    else if (s.do === "waitUrl") await page.waitForURL((u) => u.href.includes(s.contains), { timeout: s.timeout });
    else if (s.do === "press") await page.keyboard.press(s.key);
    else if (s.do === "caption") await caption(s.text);
    else if (s.do === "pause") await page.waitForTimeout(s.ms);
    else throw new Error(`unknown step ${s.do}`);
    console.log(`ok   ${tag}`);
  } catch (e) {
    console.error(`FAIL ${tag}: ${e.message.split("\n")[0]}`);
    await page.screenshot({ path: join(outDir, "failure.png") });
    failed = tag;
    break;
  }
}

await context.close();
await browser.close();
const vid = readdirSync(outDir).find((f) => f.endsWith(".webm") && f !== "raw.webm");
if (vid) renameSync(join(outDir, vid), join(outDir, "raw.webm"));
if (failed) { console.error(`flow failed at ${failed}; see ${outDir}/failure.png`); process.exit(1); }
console.log(`video: ${join(outDir, "raw.webm")}`);
