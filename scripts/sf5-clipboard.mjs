// SF-5 clipboard success-path probe — grant clipboard permission, click all
// three copy affordances (code copy, heading anchor, follow copy), verify the
// real clipboard content + ✓ feedback swap. Evidence helper — not shipped.
import { execFile } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9950 + Math.floor(Math.random() * 40);
const chrome = execFile(CHROME, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sf5-clip-'))}`,
  '--headless=new', '--disable-gpu', '--window-size=1440,900', url,
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(3500);
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Runtime.enable');
await send('Browser.grantPermissions', { permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
await sleep(300);

const out = {};
// 1) code copy — click first button, clipboard must hold the code text
const code = await evalJs(`document.querySelector('.prose pre code')?.textContent.slice(0, 60)`);
await evalJs(`document.querySelector('.code-copy').click()`);
await sleep(400);
out.codeCopy = {
  expected: code,
  clipboard: (await evalJs(`navigator.clipboard.readText()`))?.slice(0, 60),
  feedback: await evalJs(`document.querySelector('.code-copy [aria-live]')?.textContent`),
};
// 2) heading anchor — clipboard holds full section URL
await evalJs(`document.querySelector('.heading-anchor').click()`);
await sleep(400);
out.headingAnchor = {
  clipboard: await evalJs(`navigator.clipboard.readText()`),
  feedbackText: await evalJs(`document.querySelector('.heading-anchor')?.textContent`),
  hash: await evalJs(`location.hash`),
};
// 3) follow copy — clipboard holds absolute feed URL, status announced
await evalJs(`scrollTo(0, document.body.scrollHeight); document.querySelector('.fb-copy').click()`);
await sleep(400);
out.followCopy = {
  clipboard: await evalJs(`navigator.clipboard.readText()`),
  status: await evalJs(`document.querySelector('.fb-status')?.textContent`),
  btnDisabled: await evalJs(`document.querySelector('.fb-copy')?.disabled`),
};
console.log(JSON.stringify(out, null, 2));
ws.close(); chrome.kill(); process.exit(0);
