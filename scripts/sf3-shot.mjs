/**
 * SF-3 evidence helper — headless Chrome + raw CDP (Node >=22 built-in
 * WebSocket, zero deps). Loads a page, scrolls to a fraction of the document,
 * waits, screenshots. Usage:
 *   node scripts/sf3-shot.mjs <url> <out.png> <scrollFraction> [width] [height]
 */
import { execFile } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, frac = '0.6', w = '1440', h = '900'] = process.argv.slice(2);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9333 + Math.floor(Math.random() * 300);
const profile = mkdtempSync(join(tmpdir(), 'sf3-cdp-'));

const chrome = execFile(CHROME, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--headless=new',
  '--disable-gpu',
  `--window-size=${w},${h}`,
  'about:blank',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Poll http://127.0.0.1:<port>/json/list until a page target is up. */
async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('chrome CDP not reachable');
}

const wsUrl = await target();
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w,
  height: +h,
  deviceScaleFactor: 1,
  mobile: +w < 500,
});
await send('Page.navigate', { url });
await sleep(3500); // load + fonts + observers

// Optional 6th arg: CSS selector to click before the shot (e.g. open the
// mobile TOC <details> summary for the expanded-state evidence).
if (process.argv[7]) {
  await send('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(process.argv[7])})?.click()`,
  });
  await sleep(600);
}

// Scroll to the requested fraction of the document (wheel events fire the
// passive scroll listener → progress bar + back-to-top + scrollspy all run).
await send('Runtime.evaluate', {
  expression: `(() => { const max = document.documentElement.scrollHeight - innerHeight;
     scrollTo({ top: Math.round(max * ${frac}), behavior: 'instant' }); })()`,
  awaitPromise: true,
});
await sleep(1200); // rAF + IO callbacks settle

const shot = await send('Page.captureScreenshot', { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('written', out);

// Report the live state for the evidence log.
const state = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    scrollY: scrollY,
    progress: document.querySelector('.reading-progress')?.style.transform,
    topVisible: document.querySelector('.reading-top')?.classList.contains('is-visible'),
    current: document.querySelector('.toc-link[aria-current]')?.getAttribute('href') ?? null,
  })`,
  returnByValue: true,
});
console.log('state', state.result?.result?.value);

ws.close();
chrome.kill();
process.exit(0);
