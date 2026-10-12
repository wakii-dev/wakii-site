// SF-4 functional probe: click the FollowBlock copy button in headless Chrome
// (CDP), grant clipboard permission, verify the real clipboard holds the feed
// URL and the ✓ status is announced. Evidence helper — not shipped code.
import { execFile } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9223;
const URL_PAGE = 'http://localhost:4399/blog/arch-ci-gates/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = execFile(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=' + process.env.TEMP + '/sf4-cdp-profile',
  URL_PAGE,
]);
chrome.stdout.resume(); chrome.stderr.resume();
await sleep(3500);

const targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
const page = targets.find((t) => t.type === 'page' && t.url.includes('/blog/'));
if (!page) throw new Error('no page target: ' + JSON.stringify(targets.map(t => t.url)));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
const send = (method, params = {}) =>
  new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Runtime.enable');
// Grant real clipboard access, then click + read back.
await send('Browser.grantPermissions', { permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });

const evalJs = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return res.result?.result?.value ?? JSON.stringify(res.result ?? res);
};

const out = await evalJs(`(async () => {
  const btn = document.querySelector('.fb-copy');
  const status = document.querySelector('.fb-status');
  for (let i = 0; i < 50 && btn && btn.hidden; i++) await new Promise((r) => setTimeout(r, 100));
  if (!btn || btn.hidden) return 'FAIL: button missing or hidden';
  btn.click();
  await new Promise((r) => setTimeout(r, 300));
  let clip = '(read failed)';
  try { clip = await navigator.clipboard.readText(); } catch (e) { clip = '(read failed: ' + e.message + ')'; }
  return JSON.stringify({
    clip,
    statusText: status ? status.textContent : null,
    btnDisabled: btn.disabled,
    btnLabel: btn.textContent.trim(),
  });
})()`);
console.log('COPY-PROBE RESULT:', out);

ws.close();
chrome.kill();
process.exit(0);
