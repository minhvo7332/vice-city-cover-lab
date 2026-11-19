// Takes the 4 dossier screenshots for Vice City Cover Lab v1 in headless
// Chromium (Playwright, ~/.cache/ms-playwright). Serves app/ itself on a
// scratch port — no desktop Chrome, no network. The first screenshot by name
// is an exported cover; the second shows the editor with a photo loaded.
// Run from the repo root: node tools/shoot.mjs
// Requires: node serve.ts already running is NOT needed; this script starts
// its own server on :8091 and stops it when done.

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/.shot-tools/node_modules/playwright-core');

const EXE = '/home/hatch/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';
const PORT = 8091;
const BASE = `http://localhost:${PORT}`;
const ROOT = dirname(fileURLToPath(new URL('.', import.meta.url))).replace(/\/tools$/, '');
const OUT = join(ROOT, 'screenshots');

const SHOTS = [
  {
    file: '1-cover.jpg',
    viewport: { width: 1280, height: 720 },
    url: '/?shot=cover&photo=sunset-drive&photo2=pier&photo3=boulevard&photo4=neon-avenue&layout=heroStrip&grade=sunset&size=wide&title=SUNSET%20DRIVE&subtitle=A%20vice%20city%20story%20in%20four%20frames',
  },
  {
    file: '2-editor.jpg',
    viewport: { width: 1280, height: 960 },
    url: '/?shot=editor&photo=pier&photo2=boulevard&photo3=sunset-drive&photo4=neon-avenue&layout=heroStrip&grade=sunset&size=square&title=VICE%20CITY%20NIGHTS&subtitle=A%20sunset%20heist%20in%20four%20frames',
  },
  {
    file: '3-cover-square.jpg',
    viewport: { width: 1024, height: 1024 },
    url: '/?shot=cover&photo=pier&photo2=boulevard&photo3=sunset-drive&photo4=neon-avenue&layout=quad&grade=neon&size=square&title=NEON%20BOULEVARD&subtitle=Four%20frames%2C%20one%20night',
  },
  {
    file: '4-cover-portrait.jpg',
    viewport: { width: 1024, height: 1280 },
    url: '/?shot=cover&photo=sunset-drive&photo2=neon-avenue&photo3=pier&photo4=boulevard&layout=trio&grade=sunset&size=portrait&title=GOLDEN%20HOUR%20HEIST&subtitle=Three%20panels%2C%20one%20getaway',
  },
];

const server = spawn('node', ['serve.ts', '--port', String(PORT)], {
  cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
});
await new Promise((resolve) => setTimeout(resolve, 1200));

const errors = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`reqfail: ${r.url()} ${r.failure()?.errorText}`));

  for (const shot of SHOTS) {
    await page.setViewportSize(shot.viewport);
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(150);
    const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
    writeFileSync(join(OUT, shot.file), buf);
    console.log(`shot ${shot.file}: ${buf.length} bytes`);
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}

if (errors.length) {
  console.log('ERRORS:');
  for (const e of errors) console.log(`  ${e}`);
  process.exitCode = 1;
} else {
  console.log('shots: no console/page/request errors');
}
