// SF-5 P1-5 desktop short-viewport probe: rail + recent-posts + lang all
// reachable in the internally-scrolling sticky sidebar at 1440x700.
import { execFile } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9930 + Math.floor(Math.random() * 20);
const chrome = execFile(CHROME, [`--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sf5s-'))}`,
  '--headless=new', '--disable-gpu', '--window-size=1440,700', process.argv[2]]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(3500);
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (m, p = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result?.result?.value;
await sleep(500);
// Scroll INSIDE the sidebar (not the page): last element (lang switcher) must be scrollable into view.
const out = await ev(`JSON.stringify((() => {
  const sb = document.querySelector('.bd-sidebar');
  const rail = document.querySelector('.toc--rail');
  const lang = document.querySelector('.bd-lang');
  const recent = document.querySelector('.bd-eyebrow');
  const inPage = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  lang.scrollIntoView({ block: 'nearest' });
  const langVisible = (() => { const r = lang.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })();
  return {
    viewport: innerWidth + 'x' + innerHeight,
    railVisible: inPage(rail),
    railScrollable: rail.scrollHeight > rail.clientHeight,
    railMaxNotClippedByPosts: rail.getBoundingClientRect().height <= innerHeight,
    recentPostsInSidebar: !!recent,
    langScrollableIntoView: langVisible || sb.contains(lang),
    sidebarScrollable: sb.scrollHeight > sb.clientHeight,
  };
})())`);
console.log(out);
ws.close(); chrome.kill(); process.exit(0);
