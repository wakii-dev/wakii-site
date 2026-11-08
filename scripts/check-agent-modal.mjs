#!/usr/bin/env node
/**
 * Acceptance check: /agents modal diagram feature (hướng C — swimlane).
 * Khuôn scripts/check-og.mjs — assert-based, node thuần (KHÔNG vitest),
 * exit 0 = đạt / exit 1 + log chi tiết = chưa đạt.
 *
 * Chạy trên SOURCE (src/pages/agents.astro + src/data/*.ts), không cần dist.
 * Feature RED trước khi implement là kết quả đúng của gate này (TDD-red).
 *
 * AC1  Mỗi trong 28 agent có <dialog> riêng trong agents.astro
 *      (id keyed theo agent id — chấp nhận literal 28 dialog HOẶC
 *      một dialog template `.map` với id interpolate `${a.id}`).
 * AC2  Card agent click được (button / role=button + tabindex) + keying
 *      data-agent + handler script gọi showModal() mở đúng dialog.
 * AC3  Dialog chứa SVG swimlane theo category (≥1 track) HOẶC fallback
 *      generic keyed theo 1 trong 5 category.
 * AC4  Dialog native (<dialog> + showModal) — Esc là hành vi native của
 *      <dialog>; backdrop-close phải có pattern click so sánh target.
 * AC5  a11y — mỗi dialog có aria-label/aria-labelledby + heading riêng
 *      (không nhân heading trang: heading trong dialog phải h2-h4).
 * AC6  Mobile ≤620px — media query tồn tại, có rule full-screen sheet
 *      cho dialog.
 * AC7  KHÔNG dependency mới trong package.json (allowlist đóng băng);
 *      KHÔNG sửa agents-skills.ts (không token modal/swimlane); KHÔNG
 *      thư viện ngoài (CDN) trong modal JS.
 * AC8  src/data/agent-flows.ts tồn tại, keyed theo agent id, đủ 28 entry.
 *
 * Bất kỳ violation → dòng ✗ (AC + lý do) và exit 1; đạt hết → đếm + exit 0.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const astroPath = join(root, 'src/pages/agents.astro');
const flowsPath = join(root, 'src/data/agent-flows.ts');
const pkgPath = join(root, 'package.json');

const CATS = ['execution', 'review', 'ops', 'knowledge', 'infra'];

/** Allowlist đóng băng lúc viết gate (2026-11-08) — thêm dep = FAIL AC7. */
const DEP_ALLOWLIST = {
  dependencies: ['@astrojs/rss', '@astrojs/sitemap', 'astro', 'qrcode'],
  devDependencies: ['@types/qrcode'],
};

const { agents } = await import(new URL('../src/data/agents-skills.ts', import.meta.url));

const astroSrc = existsSync(astroPath) ? readFileSync(astroPath, 'utf8') : '';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

/** @type {{ac: string, msg: string}[]} */
const fails = [];
/** @type {string[]} */
const passes = [];
const fail = (ac, msg) => fails.push({ ac, msg });

// ---- dialog extraction (literal hoặc template .map) --------------------
const DIALOG_RE = /<dialog\b([^>]*)>([\s\S]*?)<\/dialog>/g;
const dialogs = [];
for (const m of astroSrc.matchAll(DIALOG_RE)) {
  dialogs.push({ attrs: m[1], body: m[2] });
}
// Template mode: một dialog duy nhất nhưng id interpolate agent id.
const templateMode =
  dialogs.length === 1 &&
  /\bid=\{?`[^`]*\$\{\s*(?:a|agent)\.id/.test(dialogs[0].attrs);

const dialogIdOf = (d) => {
  const m = d.attrs.match(/\bid=["'{]?`?([^"'`}]+)/);
  return m ? m[1] : '';
};

// ---- AC1: 28 dialog riêng, keyed theo agent id --------------------------
{
  const ac = 'AC1';
  if (astroSrc === '') {
    fail(ac, `src/pages/agents.astro không đọc được`);
  } else if (dialogs.length === 0) {
    fail(ac, 'không tìm thấy <dialog> nào trong agents.astro');
  } else if (templateMode) {
    if (!/agents\s*\.\s*map/.test(astroSrc)) {
      fail(ac, 'dialog template nhưng không render qua agents.map()');
    } else {
      passes.push(`${ac}: dialog template id=${dialogIdOf(dialogs[0])} render qua agents.map() (28 agent)`);
    }
  } else {
    const ids = dialogs.map(dialogIdOf);
    const missing = agents.filter((a) => !ids.some((id) => id.includes(a.id)));
    const dupes = agents.filter((a) => ids.filter((id) => id.includes(a.id)).length > 1);
    if (dialogs.length < agents.length) {
      fail(ac, `chỉ ${dialogs.length} dialog cho ${agents.length} agent`);
    }
    if (missing.length > 0) {
      fail(ac, `thiếu dialog cho ${missing.length} agent: ${missing.slice(0, 5).map((a) => a.id).join(', ')}${missing.length > 5 ? ', …' : ''}`);
    }
    if (dupes.length > 0) {
      fail(ac, `dialog trùng cho: ${dupes.map((a) => a.id).join(', ')}`);
    }
    if (missing.length === 0 && dupes.length === 0 && dialogs.length >= agents.length) {
      passes.push(`${ac}: ${dialogs.length} dialog, đủ ${agents.length} agent`);
    }
  }
}

// ---- AC2: card click được + mở đúng dialog ------------------------------
{
  const ac = 'AC2';
  const cardIdx = astroSrc.indexOf('class="card agent-card"');
  if (cardIdx === -1) {
    fail(ac, 'không tìm thấy agent card trong agents.astro');
  } else {
    const cardBlock = astroSrc.slice(cardIdx, cardIdx + 500);
    const clickable = /<button|role=["']button["']|tabindex/.test(cardBlock);
    const keyed = /data-agent/.test(cardBlock);
    const scriptHasShowModal = /showModal\s*\(/.test(astroSrc);
    const handlerKeyed = /dataset\.agent|dataset\[['"]agent/.test(astroSrc);
    if (!clickable) fail(ac, 'card không click được (thiếu button / role=button / tabindex)');
    if (!keyed) fail(ac, 'card thiếu data-agent keying sang dialog');
    if (!scriptHasShowModal) fail(ac, 'script không gọi showModal() — dialog native không mở');
    if (!handlerKeyed) fail(ac, 'script không đọc data-agent để mở đúng dialog của agent');
    if (clickable && keyed && scriptHasShowModal && handlerKeyed) {
      passes.push(`${ac}: card clickable + data-agent + showModal keyed`);
    }
  }
}

// ---- AC3: SVG swimlane theo category hoặc fallback generic --------------
(() => {
  const ac = 'AC3';
  const targets = templateMode ? [dialogs[0]] : dialogs;
  if (targets.length === 0) {
    fail(ac, 'không có dialog nào để kiểm swimlane/fallback');
    return;
  }
  const seen = new Set();
  for (const d of targets) {
    const id = dialogIdOf(d);
    const hasSwimlane = /<svg[^>]*(data-swimlane|class=["'][^"']*swimlane)/.test(d.body) ||
      /<svg[\s\S]{0,200}?swimlane/.test(d.body);
    const hasTrack = /data-track|class=["'][^"']*(?:swimlane-)?track/.test(d.body);
    const fbMatch = d.body.match(/data-flow-fallback=(?:\{?["'`]?)([a-z-]+)/);
    const fbCat = fbMatch ? fbMatch[1] : null;
    if (hasSwimlane) {
      if (!hasTrack) fail(ac, `dialog ${id}: SVG swimlane nhưng không có track nào`);
      else seen.add(id);
    } else if (fbCat) {
      if (!CATS.includes(fbCat)) {
        fail(ac, `dialog ${id}: fallback "${fbCat}" không thuộc 5 category (${CATS.join('|')})`);
      } else {
        seen.add(id);
      }
    } else {
      fail(ac, `dialog ${id}: không có SVG swimlane lẫn data-flow-fallback`);
    }
  }
  const expected = templateMode ? 1 : agents.length;
  if (seen.size < expected && targets.length >= expected) {
    fail(ac, `chỉ ${seen.size}/${expected} dialog có swimlane/fallback hợp lệ`);
  } else if (seen.size >= expected && fails.every((f) => f.ac !== ac)) {
    passes.push(`${ac}: swimlane/fallback đạt ở ${seen.size}/${expected} dialog`);
  }
})();

// ---- AC4: dialog native đóng bằng Esc + click backdrop ------------------
{
  const ac = 'AC4';
  const native = dialogs.length > 0; // phần tử thật là <dialog> (regex ở trên)
  const modal = /showModal\s*\(/.test(astroSrc);
  const backdrop =
    /(?:event|e|ev)\.target\s*===/.test(astroSrc) &&
    /\.(?:close)\s*\(/.test(astroSrc);
  if (!native) fail(ac, 'không dùng phần tử <dialog> native');
  if (!modal) fail(ac, 'không có showModal() — Esc/backdrop native không hoạt động');
  if (!backdrop) fail(ac, 'thiếu pattern backdrop-close (so sánh event.target === dialog + close())');
  if (native && modal && backdrop) {
    passes.push(`${ac}: <dialog> native + showModal + backdrop-close pattern (Esc = native cancel)`);
  }
}

// ---- AC5: a11y — label + heading riêng mỗi dialog -----------------------
(() => {
  const ac = 'AC5';
  const targets = templateMode ? [dialogs[0]] : dialogs;
  if (targets.length === 0) {
    fail(ac, 'không có dialog nào để kiểm a11y label/heading');
    return;
  }
  let ok = true;
  for (const d of targets) {
    const id = dialogIdOf(d);
    const labelled = /aria-(?:label=|labelledby=)/.test(d.attrs);
    const lb = d.attrs.match(/aria-labelledby=["'{]?`?([\w-]+)/);
    if (lb && !/\$\{/.test(lb[1]) && !new RegExp(`id=["']${lb[1]}["']`).test(astroSrc)) {
      fail(ac, `dialog ${id}: aria-labelledby="${lb[1]}" không trỏ tới id nào`);
      ok = false;
    }
    const hasHeading = /<h[2-4][\s>]/.test(d.body);
    if (!labelled) {
      fail(ac, `dialog ${id}: thiếu aria-label/aria-labelledby`);
      ok = false;
    }
    if (!hasHeading) {
      fail(ac, `dialog ${id}: thiếu heading riêng (h2-h4) trong dialog`);
      ok = false;
    }
  }
  if (ok) passes.push(`${ac}: ${targets.length} dialog đều có label + heading riêng`);
})();

// ---- AC6: mobile ≤620px full-screen sheet -------------------------------
{
  const ac = 'AC6';
  const mq = astroSrc.match(/@media\s*\(max-width:\s*620px\)\s*\{/);
  if (!mq) {
    fail(ac, 'không có media query max-width: 620px');
  } else {
    // Cắt body của media block bằng cân bằng ngoặc.
    let i = mq.index + mq[0].length;
    let depth = 1;
    let end = i;
    while (depth > 0 && end < astroSrc.length) {
      if (astroSrc[end] === '{') depth++;
      else if (astroSrc[end] === '}') depth--;
      end++;
    }
    const block = astroSrc.slice(i, end);
    const dialogStyled = /(?:^|\})[^{}]*dialog[^{]*\{/.test(block);
    const fullScreen = /inset:\s*0|width:\s*100%|height:\s*(?:100%|100dvh|100vh)/.test(block);
    if (!dialogStyled) fail(ac, 'media 620px không có rule cho dialog');
    if (!fullScreen) fail(ac, 'media 620px: dialog chưa full-screen sheet (inset:0 / width:100% / height:100%)');
    if (dialogStyled && fullScreen) passes.push(`${ac}: media 620px có dialog full-screen sheet`);
  }
}

// ---- AC7: không dep mới, không sửa agents-skills.ts, không CDN ----------
{
  const ac = 'AC7';
  for (const kind of ['dependencies', 'devDependencies']) {
    const actual = Object.keys(pkg[kind] ?? {});
    const extra = actual.filter((k) => !DEP_ALLOWLIST[kind].includes(k));
    if (extra.length > 0) fail(ac, `${kind} có dependency mới: ${extra.join(', ')}`);
  }
  // agents-skills.ts phải nguyên vẹn so với HEAD (desc agent có thể tự chứa
  // chữ "modal"/"dialogs" — chỉ diff git mới là guard đúng cho READ-ONLY).
  try {
    const rel = 'src/data/agents-skills.ts';
    const head = execSync(`git -C ${JSON.stringify(root)} show HEAD:${rel}`, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (head !== readFileSync(join(root, rel), 'utf8')) {
      fail(ac, 'agents-skills.ts khác HEAD — file này READ-ONLY, không sửa');
    }
  } catch {
    // ngoài git worktree → bỏ qua nhánh này (các AC khác vẫn gác feature)
  }
  for (const m of astroSrc.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/https?:\/\/|cdn\.|unpkg|jsdelivr/.test(m[1])) {
      fail(ac, 'modal JS tham chiếu thư viện ngoài (CDN/URL) — chỉ dùng platform feature');
    }
  }
  if (!fails.some((f) => f.ac === ac)) passes.push(`${ac}: deps nguyên vẹn, agents-skills.ts sạch, JS không CDN`);
}

// ---- AC8: agent-flows.ts keyed theo agent id, đủ 28 entry ---------------
{
  const ac = 'AC8';
  if (!existsSync(flowsPath)) {
    fail(ac, 'src/data/agent-flows.ts không tồn tại');
  } else {
    try {
      const { agentFlows } = await import(new URL('../src/data/agent-flows.ts', import.meta.url));
      const missing = agents.filter((a) => !agentFlows[a.id]);
      if (missing.length > 0) {
        fail(ac, `agentFlows thiếu ${missing.length}/${agents.length} entry: ${missing.slice(0, 5).map((a) => a.id).join(', ')}${missing.length > 5 ? ', …' : ''}`);
      } else {
        passes.push(`${ac}: agent-flows.ts đủ ${agents.length} entry keyed theo agent id`);
      }
    } catch (err) {
      fail(ac, `agent-flows.ts import lỗi: ${err?.message ?? err}`);
    }
  }
}

// ---- report --------------------------------------------------------------
for (const p of passes) console.log(`✓ ${p}`);
for (const f of fails) console.log(`✗ ${f.ac}: ${f.msg}`);
console.log('');
if (fails.length > 0) {
  console.log(`RED — ${fails.length} violation trên ${CATS.length}-category modal contract (AC1-AC8)`);
  process.exit(1);
}
console.log(`GREEN — agent-modal contract đạt (AC1-AC8, ${agents.length} agents, ${CATS.length} categories)`);
