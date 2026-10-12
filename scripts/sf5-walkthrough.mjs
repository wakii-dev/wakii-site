/**
 * SF-5 convergence walkthrough probe — headless Chrome + raw CDP (Node >=22
 * built-in WebSocket, zero deps). Evidence helper — NOT shipped code.
 *
 * Per page load it collects: console errors, coexistence state (all 3
 * enhancements mounted, landmark labels), affordance checks (copy code +
 * heading anchor + TOC scrollspy + progress + back-to-top + follow copy),
 * table overflow within column, CLS via PerformanceObserver layout-shift,
 * then reports JSON. Screenshots are taken separately via sf3-shot.mjs.
 *
 * Usage:
 *   node scripts/sf5-walkthrough.mjs <url> <width> <height> [--reduced-motion] [--keyboard] [--nojs]
 */
import { execFile } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, w = '1440', h = '900', ...flags] = process.argv.slice(2);
const reduced = flags.includes('--reduced-motion');
const keyboard = flags.includes('--keyboard');
const nojs = flags.includes('--nojs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9700 + Math.floor(Math.random() * 200);
const profile = mkdtempSync(join(tmpdir(), 'sf5-cdp-'));

const chromeArgs = [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--headless=new',
  '--disable-gpu',
  `--window-size=${w},${h}`,
];
if (nojs) chromeArgs.push('--blink-settings=scriptEnabled=false');
chromeArgs.push('about:blank');

const chrome = execFile(CHROME, chromeArgs);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const ws = new WebSocket(await target());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  // Coexistence: collect ALL console output — errors AND warnings.
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    consoleErrors.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`);
  }
  if (msg.method === 'Log.entryAdded' && ['error', 'warning'].includes(msg.params.entry.level)) {
    consoleErrors.push(`log.${msg.params.entry.level}: ${msg.params.entry.text}`);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(`exception: ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description ?? ''}`);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

const evalJs = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(res.result.exceptionDetails).slice(0, 400));
  return res.result?.result?.value;
};

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w,
  height: +h,
  deviceScaleFactor: 1,
  mobile: +w < 500,
});
if (reduced) {
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
}
await send('Page.navigate', { url });
await sleep(3500);

// CLS via PerformanceObserver — installed late is fine for evidence purposes:
// the load-time shifts happen before, but scroll-induced shifts (the SF risk:
// JS-injected chrome) are what this measures. For load CLS we re-navigate
// with the observer injected via Page.addScriptToEvaluateOnNewDocument.
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });`,
});
await send('Page.reload', { ignoreCache: false });
await sleep(3500);

const report = { url, viewport: `${w}x${h}`, reducedMotion: reduced, keyboard: keyboard, noJs: nojs };

// ---- coexistence: all 3 enhancements mounted, landmarks distinct ----
report.coexistence = await evalJs(`JSON.stringify({
  codeShell: document.querySelectorAll('.code-shell').length,
  codeCopy: document.querySelectorAll('.code-copy').length,
  headingAnchors: document.querySelectorAll('.heading-anchor').length,
  tocRail: !!document.querySelector('.toc--rail'),
  tocBox: !!document.querySelector('.toc--box'),
  landmarks: [...document.querySelectorAll('nav, [role="navigation"], details.toc')].map(n => n.getAttribute('aria-label')).filter(Boolean),
  progress: !!document.querySelector('.reading-progress'),
  backToTop: !!document.querySelector('.reading-top'),
  followBlock: !!document.querySelector('.fb-follow'),
  followCopy: !!document.querySelector('.fb-copy:not([hidden])'),
})`);

// ---- exactly ONE TOC visible per viewport ----
report.tocVisibility = await evalJs(`JSON.stringify((() => {
  const vis = (el) => el && getComputedStyle(el).display !== 'none';
  return {
    railVisible: vis(document.querySelector('.toc--rail')),
    boxVisible: vis(document.querySelector('.toc--box')),
    bothVisible: vis(document.querySelector('.toc--rail')) && vis(document.querySelector('.toc--box')),
  };
})())`);

// ---- scroll: scrollspy + progress + back-to-top + rail auto-scroll + CLS ----
await evalJs(`(() => { const max = document.documentElement.scrollHeight - innerHeight;
   scrollTo({ top: Math.round(max * 0.5), behavior: 'instant' }); })()`);
await sleep(1500);
report.scrollState = await evalJs(`JSON.stringify({
  scrollY: Math.round(scrollY),
  progressTransform: document.querySelector('.reading-progress')?.style.transform,
  backToTopVisible: document.querySelector('.reading-top')?.classList.contains('is-visible'),
  ariaCurrent: document.querySelector('.toc-link[aria-current="location"]')?.getAttribute('href') ?? null,
  ariaCurrentCount: document.querySelectorAll('.toc-link[aria-current="location"]').length,
  cls: +window.__cls.toFixed(4),
})`);

// ---- back-to-top click → scrollY ~0 ----
await evalJs(`document.querySelector('.reading-top')?.click()`);
await sleep(reduced ? 600 : 1800);
report.backToTopClick = await evalJs(`JSON.stringify({ scrollY: Math.round(scrollY) })`);

// ---- code copy: grant clipboard happens outside; click + read feedback ----
await evalJs(`document.querySelector('.code-copy')?.click()`);
await sleep(300);
report.codeCopyFeedback = await evalJs(
  `document.querySelector('.code-copy [aria-live]')?.textContent ?? null`,
);

// ---- heading anchor click (native hash jump + ✓ swap) ----
await evalJs(`document.querySelector('.heading-anchor')?.click()`);
await sleep(600);
report.headingAnchor = await evalJs(
  `JSON.stringify({
     hash: location.hash,
     label: document.querySelector('.heading-anchor')?.getAttribute('aria-label'),
     text: document.querySelector('.heading-anchor')?.textContent,
   })`,
);

// ---- keyboard-only pass: Tab through page, collect focused affordances ----
if (keyboard) {
  const keys = [];
  for (let i = 0; i < 80; i++) keys.push(['Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }]);
  for (const [m, p] of keys) {
    await send(m, p);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  }
  // Collect the tab path: walk focus forward in DOM order instead (focus
  // already moved; report what IS focusable + focus-visible styling present).
  report.keyboard = await evalJs(`JSON.stringify((() => {
    const sel = '.code-copy, .heading-anchor, .toc-link, .reading-top, .fb-copy, .toc--box summary, .fb-link';
    const els = [...document.querySelectorAll(sel)];
    return {
      focusableCount: els.filter(e => e.tabIndex >= 0 && !e.hasAttribute('hidden')).length,
      focusVisibleCss: els.some(e => e.matches(':focus-visible')),
      hiddenOutOfTab: !document.querySelector('.fb-copy[hidden]'),
    };
  })())`);
}

// ---- table within column at this viewport (no horizontal page overflow) ----
report.tableOverflow = await evalJs(`JSON.stringify((() => {
  const t = document.querySelector('.prose table');
  if (!t) return { present: false };
  const r = t.getBoundingClientRect();
  return {
    present: true,
    tableScrollable: t.scrollWidth > t.clientWidth,
    pageHorizOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
})())`);

// ---- reduced-motion: no animation-based movement (bar still functional) ----
if (reduced) {
  report.reducedMotion = await evalJs(`JSON.stringify({
    mediaMatched: matchMedia('(prefers-reduced-motion: reduce)').matches,
    progressWorks: !!document.querySelector('.reading-progress')?.style.transform,
    revealAnimated: [...document.querySelectorAll('.prose .reveal-in')].length,
  })`);
}

report.consoleIssues = consoleErrors;
console.log(JSON.stringify(report, null, 2));

ws.close();
chrome.kill();
process.exit(0);
