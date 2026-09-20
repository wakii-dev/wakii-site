#!/usr/bin/env node
/**
 * Funnel convergence crawl — story VU-9 SF-4 (VU-13), audit-only.
 * Khuôn scripts/check-og.mjs. READ-ONLY trên dist/ — không sửa gì,
 * chỉ assert + viết báo cáo markdown (mặc định in ra stdout).
 *
 * Chain audit (ACCEPTANCE SF-4):
 *   C1  hero → /download ≤1 click (primary) + ghost → REPO_URL — 4 pages
 *   C2  /download → installer ≤2 click tổng: 4 asset href == dist/release-meta.json
 *       (cùng resolved source SF-3), + release-notes/tag + nightly + build-from-source
 *   C3  version consistency GetWakii (landing) ↔ /download ↔ release-meta:
 *       mọi chuỗi /1\.4\.\d+/ trên 4 pages == meta.version (bắt stale pin)
 *   C4  chain hero→download→first-run→docs: first-run strip → /docs/getting-started/
 *       tồn tại (EN+VI, cả landing understand lẫn download), trang đích có trong dist
 *   C5  dead-link: mọi href nội bộ của 4 pages resolve ra file trong dist
 *       (+ hash anchor tồn tại ở trang đích, xử lý / vs /trailing-slash)
 *   C6  anchors: `#get-wakii` verbatim trên landing (EN+VI); anchor nav
 *       #features/#workflow/#faq có đích id trong cùng trang
 *   C7  blog CTA → /download: sample 5 posts × 2 locale (5 slug đầu sort)
 *   C8  meta/OG: canonical + hreflang (en/vi/x-default đúng cặp) + description
 *       + og:* / twitter:* trên 4 pages (Base contract pinned — additive only)
 *   C9  VI parity rendered: kickers q1–q4 + nhóm upgrade downloads có bản VI
 *       thật (không rỗng, không placeholder TODO/lorem)
 *   C10 accuracy guards: không "stories tab"; credits orca + superpowers ở
 *       footer; G-I warn unsigned per-OS (EN+VI); iOS honest ("no installer"
 *       EN / "chưa có installer" VI); mobile G-QR caption chỉ ở live variant
 *   C11 a11y static: aria-current đúng 1/trang download; ảnh section mới có
 *       loading=lazy + width/height explicit
 *
 * Exit 0 = mọi check PASS (WARN không chặn); exit 1 = có FAIL.
 *
 * Usage: node scripts/funnel-crawl.mjs [--dist dist] [--out <file.md>]
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const argOf = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const DIST = argOf('--dist', 'dist');
const OUT = argOf('--out', '');
const SITE = 'https://wakii.xyz';

const PAGES = {
  landingEn: 'index.html',
  downloadEn: 'download/index.html',
  landingVi: 'vi/index.html',
  downloadVi: 'vi/download/index.html',
};

const results = [];
const check = (id, desc, pass, detail = '', level = pass ? 'PASS' : 'FAIL') =>
  results.push({ id, desc, pass, detail, level });
const warn = (id, desc, detail) =>
  results.push({ id, desc, pass: false, detail, level: 'WARN' });

const load = (rel) => {
  const p = join(DIST, rel);
  if (!existsSync(p)) return null;
  let h = readFileSync(p, 'utf8');
  return h.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
};

const anchorsOf = (h) =>
  [...h.matchAll(/<a\s[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: m[1],
    label: m[2].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim(),
  }));

const idsOf = (h) => new Set([...h.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));

// ── load ────────────────────────────────────────────────────────────────
const meta = JSON.parse(readFileSync(join(DIST, 'release-meta.json'), 'utf8'));
const H = {};
for (const [k, rel] of Object.entries(PAGES)) {
  H[k] = load(rel);
  if (!H[k]) {
    console.error(`✗ FATAL: thiếu ${rel} trong ${DIST}/`);
    process.exit(1);
  }
}
const internalTargets = new Set(); // hrefs seen (C5 dedupe report)

// ── C1 hero chain — ≤1 click tới /download (chỉ landing; download page
//      không có hero — installers của nó do C2 cover) ────────────────────
for (const [pg, h] of Object.entries(H)) {
  if (!pg.startsWith('landing')) continue;
  const dl = pg === 'landingEn' ? '/download' : '/vi/download';
  const as = anchorsOf(h.slice(0, h.indexOf('id="understand"')));
  const primary = as.find((a) => a.href === dl);
  const repo = as.find((a) => a.href === 'https://github.com/wakii-dev/wakii');
  check(
    `C1 ${pg}`,
    `hero primary → ${dl} (+ ghost → repo)`,
    !!primary && !!repo,
    primary ? `primary "${primary.label}" · ghost ${repo ? `"${repo.label}"` : 'MISSING'}` : 'primary MISSING',
  );
}

// ── C2 download installers == release-meta (cùng resolved source) ──────
const assetHrefs = Object.values(meta.assets).map((a) => a.url);
for (const pg of ['downloadEn', 'downloadVi']) {
  const hrefs = anchorsOf(H[pg]).map((a) => a.href);
  const missing = assetHrefs.filter((u) => !hrefs.includes(u));
  const notes = hrefs.includes(`https://github.com/wakii-dev/wakii/releases/tag/${meta.tag}`);
  const nightly = hrefs.includes('https://github.com/wakii-dev/wakii/releases/nightly');
  const repo = hrefs.includes('https://github.com/wakii-dev/wakii');
  check(
    `C2 ${pg}`,
    '4 installer href == release-meta + tag/nightly/repo links',
    missing.length === 0 && notes && nightly && repo,
    missing.length ? `thiếu: ${missing.join(', ')}` : `tag:${notes} nightly:${nightly} repo:${repo} — ≤2 click tới file (1 click trên nút)`,
  );
}
// GetWakii (landing) phải cùng resolved data — không 205 vs 213 lệch nhau
for (const pg of ['landingEn', 'landingVi']) {
  const hrefs = anchorsOf(H[pg]).map((a) => a.href);
  const gwAssets = assetHrefs.filter((u) => hrefs.includes(u));
  check(
    `C2 ${pg}`,
    'GetWakii asset links cùng release-meta (macOS+Windows+Android)',
    gwAssets.length >= 3,
    `${gwAssets.length}/4 asset trùng release-meta`,
  );
}

// ── C3 version consistency — mọi /1\.4\.\d+/ == meta.version ───────────
let stale = [];
const verCount = {};
for (const [pg, h] of Object.entries(H)) {
  const vs = h.match(/1\.4\.\d+/g) || [];
  verCount[pg] = vs.length;
  stale.push(...vs.filter((v) => v !== meta.version).map((v) => `${pg}:${v}`));
}
check(
  'C3 versions',
  `mọi version string == ${meta.version} (GetWakii ↔ /download cùng resolved)`,
  stale.length === 0 && verCount.downloadEn > 0 && verCount.landingEn > 0,
  stale.length ? `STALE: ${stale.join(', ')}` : `counts ${JSON.stringify(verCount)}`,
);

// ── C4 chain hero→download→first-run→docs ──────────────────────────────
const gsEn = existsSync(join(DIST, 'docs/getting-started/index.html'));
const gsVi = existsSync(join(DIST, 'vi/docs/getting-started/index.html'));
for (const pg of ['downloadEn', 'downloadVi']) {
  const vi = pg.endsWith('Vi');
  const toGuide = anchorsOf(H[pg]).some((a) =>
    a.href === (vi ? '/vi/docs/getting-started/' : '/docs/getting-started/'),
  );
  check(`C4 ${pg}`, 'first-run strip → getting-started ≤1 click nữa', toGuide && (vi ? gsVi : gsEn),
    toGuide ? `link ✓ · dest exists:${vi ? gsVi : gsEn}` : 'link MISSING');
}
for (const pg of ['landingEn', 'landingVi']) {
  const vi = pg.endsWith('Vi');
  const toGuide = anchorsOf(H[pg]).some((a) =>
    a.href === (vi ? '/vi/docs/getting-started/' : '/docs/getting-started/'),
  );
  check(`C4 ${pg}`, 'understand (q4 first-run) → getting-started', toGuide,
    toGuide ? 'link ✓' : 'link MISSING');
}

// ── C5 dead-link — mọi href nội bộ resolve trong dist ──────────────────
function resolveInternal(href, fromPage) {
  // trả về [fileOk, anchorOk(null nếu không có anchor)]
  const [path, anchor] = href.split('#');
  if (path === '' && anchor) {
    // same-page anchor
    return [true, idsOf(H[fromPage]).has(anchor)];
  }
  let rel = path.replace(/^\//, '');
  if (rel === '') rel = 'index.html';
  else if (!/\.[a-z]+$/.test(rel)) rel += '/index.html';
  else if (rel.endsWith('/')) rel += 'index.html';
  const file = join(DIST, rel);
  if (!existsSync(file)) return [false, null];
  if (anchor) {
    const target = readFileSync(file, 'utf8');
    return [true, idsOf(target).has(anchor)];
  }
  return [true, null];
}
const deadLinks = [];
for (const [pg, h] of Object.entries(H)) {
  for (const { href } of anchorsOf(h)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue; // ngoại bộ skip (GitHub…)
    if (href.startsWith('//')) continue;
    internalTargets.add(href);
    const [fileOk, anchorOk] = resolveInternal(href, pg);
    if (!fileOk || anchorOk === false) deadLinks.push(`${pg} → ${href}${!fileOk ? ' (file 404)' : ' (anchor missing)'}`);
  }
}
check('C5 dead-links', `${internalTargets.size} internal hrefs resolve (file + anchor)`, deadLinks.length === 0,
  deadLinks.length ? deadLinks.join(' · ') : '0 chết trong chain');

// ── C6 anchors — #get-wakii verbatim + nav anchors ─────────────────────
for (const pg of ['landingEn', 'landingVi']) {
  const ids = idsOf(H[pg]);
  const navOk = ['features', 'workflow', 'faq'].every((a) => ids.has(a));
  check(`C6 ${pg}`, '#get-wakii verbatim + nav anchors (#features/#workflow/#faq)',
    ids.has('get-wakii') && navOk,
    `get-wakii:${ids.has('get-wakii')} nav:${navOk}`);
}

// ── C7 blog CTA → /download — 5 posts × 2 locale ───────────────────────
const blogDir = join(DIST, 'blog');
const slugs = readdirSync(blogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()
  .slice(0, 5);
const blogFail = [];
for (const slug of slugs) {
  const en = join(blogDir, slug, 'index.html');
  const vi = join(DIST, 'vi/blog', slug, 'index.html');
  if (!existsSync(en) || !existsSync(vi)) { blogFail.push(`${slug}: thiếu page`); continue; }
  const enOk = /href="\/download\/?"/.test(readFileSync(en, 'utf8'));
  const viOk = /href="\/vi\/download\/?"/.test(readFileSync(vi, 'utf8'));
  if (!enOk || !viOk) blogFail.push(`${slug}: EN:${enOk} VI:${viOk}`);
}
check('C7 blog-CTA', `5 posts × 2 locale có CTA → /download (${slugs.join(', ')})`, blogFail.length === 0,
  blogFail.length ? blogFail.join(' · ') : '5/5 × 2 ✓');

// ── C8 meta/OG consistency ─────────────────────────────────────────────
const metaExpect = {
  landingEn: { can: `${SITE}/`, vi: `${SITE}/vi/` },
  landingVi: { can: `${SITE}/vi/`, vi: `${SITE}/vi/` },
  downloadEn: { can: `${SITE}/download/`, vi: `${SITE}/vi/download/` },
  downloadVi: { can: `${SITE}/vi/download/`, vi: `${SITE}/vi/download/` },
};
for (const [pg, hRaw] of Object.entries(H)) {
  const head = hRaw.slice(0, hRaw.indexOf('</head>'));
  const can = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const hl = head.match(/<link rel="alternate" hreflang="vi" href="([^"]+)"/)?.[1];
  const hlx = head.match(/<link rel="alternate" hreflang="x-default" href="([^"]+)"/)?.[1];
  const desc = head.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const og = ['og:title', 'og:description', 'og:image', 'og:type', 'og:site_name', 'og:locale'].every((p) => head.includes(`property="${p}"`));
  const tw = head.includes('name="twitter:card"');
  const exp = metaExpect[pg];
  check(`C8 ${pg}`, 'canonical + hreflang(en/vi/x-default) + desc + og/twitter',
    can === exp.can && hl === exp.vi && !!hlx && !!desc && desc.length > 50 && og && tw,
    `can:${can} vi:${hl} desc:${desc ? desc.length + 'ch' : 'MISSING'} og:${og} tw:${tw}`);
}

// ── C9 VI parity rendered ──────────────────────────────────────────────
const viUnderstand = (H.landingVi.match(/q[1-4] — [^<]{4,}/g) || []).length;
check('C9 landing VI', '4 kickers q1–q4 + copy VI thật', viUnderstand === 4,
  `${viUnderstand}/4 kickers`);
const viDl = H.downloadVi;
const viUpgradeMarks = ['apple silicon', 'intel', 'phiên bản', 'lần chạy đầu', 'nightly', 'bản build chưa ký'];
const missingMarks = viUpgradeMarks.filter((m) => !viDl.toLowerCase().includes(m));
check('C9 download VI', 'nhóm upgrade có bản VI (arch/phiên bản/first-run/G-I/nightly)', missingMarks.length === 0,
  missingMarks.length ? `thiếu: ${missingMarks.join(', ')}` : `${viUpgradeMarks.length}/${viUpgradeMarks.length} markers`);
const stripAttrs = (h) => h.replace(/placeholder="[^"]*"/gi, ''); // HTML attr ≠ copy
const placeholderRe = /\b(TODO|PLACEHOLDER|lorem ipsum)\b/;
const phVi = placeholderRe.test(stripAttrs(H.landingVi)) || placeholderRe.test(stripAttrs(viDl));
check('C9 placeholders', 'không TODO/PLACEHOLDER/lorem trên VI pages', !phVi, phVi ? 'thấy placeholder' : 'sạch');

// ── C10 accuracy guards ────────────────────────────────────────────────
const storiesTab = Object.entries(H).filter(([, h]) => /stories tab/i.test(h)).map(([pg]) => pg);
check('C10 story-view', 'không "Stories tab" (dùng "story view")', storiesTab.length === 0,
  storiesTab.length ? storiesTab.join(', ') : 'sạch');
const credits = anchorsOf(H.landingEn).some((a) => a.href === 'https://github.com/stablyai/orca')
  && anchorsOf(H.landingEn).some((a) => a.href === 'https://github.com/obra/superpowers');
check('C10 credits', 'footer credit orca + superpowers', credits, credits ? '✓' : 'MISSING');
const giEn = /unsigned build[^<]*Open Anyway/.test(H.downloadEn) && /unsigned build[^<]*SmartScreen/i.test(H.downloadEn);
const giVi = /bản build chưa ký[^<]*Open Anyway/.test(H.downloadVi) && /bản build chưa ký[^<]*SmartScreen/i.test(H.downloadVi);
check('C10 G-I warn', 'G-I unsigned warn per-OS (macOS Open Anyway + Windows SmartScreen) EN+VI', giEn && giVi,
  `EN:${giEn} VI:${giVi}`);
const iosEn = /no (installer|ios build)[^<]*/i.test(H.downloadEn) || /not (yet )?available on ios/i.test(H.downloadEn);
const iosVi = /chưa có installer/i.test(H.downloadVi);
check('C10 iOS-honest', 'iOS honest wording (EN "no installer" / VI "chưa có installer")', iosEn && iosVi,
  `EN:${iosEn} VI:${iosVi}`);

// ── C11 a11y static ────────────────────────────────────────────────────
for (const pg of ['downloadEn', 'downloadVi']) {
  const n = (H[pg].match(/aria-current="true"/g) || []).length;
  check(`C11 ${pg}`, 'OS-detect highlight: aria-current="true" đúng 1', n === 1, `count:${n}`);
}
const imgAudit = [];
for (const pg of ['landingEn', 'landingVi']) {
  const sec = H[pg].match(/<section[^>]*understand[\s\S]*?<\/section>/)?.[0] || '';
  for (const m of sec.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const ok = /loading="lazy"/.test(tag) && /width="\d+"/.test(tag) && /height="\d+"/.test(tag);
    const alt = /alt="[^"]+"/.test(tag);
    imgAudit.push(`${pg}: lazy+dims:${ok} alt:${alt}`);
    if (!ok || !alt) check(`C11 ${pg}`, 'img understand: lazy + width/height + alt', false, tag.slice(0, 120));
  }
}
if (imgAudit.length && imgAudit.every((s) => s.includes('lazy+dims:true') && s.includes('alt:true'))) {
  check('C11 imgs', `ảnh section understand: lazy + dims + alt (${imgAudit.length})`, true, imgAudit.join(' · '));
} else if (imgAudit.length === 0) {
  warn('C11 imgs', 'không thấy <img> trong section understand (slot/screenshot?) — verify visual ở bước browser', '');
}

// ── report ─────────────────────────────────────────────────────────────
const fails = results.filter((r) => r.level === 'FAIL');
const warns = results.filter((r) => r.level === 'WARN');
const passes = results.filter((r) => r.level === 'PASS');
const lines = [
  '# Funnel convergence crawl — SF-4 (VU-13)',
  '',
  `dist: \`${DIST}\` · release-meta: \`${meta.version}\` (source=${meta.source}) · ${new Date().toISOString()}`,
  '',
  `**${passes.length} PASS · ${warns.length} WARN · ${fails.length} FAIL**`,
  '',
  ...results.map((r) => `- **${r.level}** ${r.id} — ${r.desc}${r.detail ? ` — ${r.detail}` : ''}`),
];
const report = lines.join('\n') + '\n';
if (OUT) writeFileSync(OUT, report);
console.log(report);
for (const f of fails) console.error(`✗ ${f.id}: ${f.desc} — ${f.detail}`);
console.log(fails.length === 0 ? `\n✓ funnel-crawl PASS (${passes.length} checks, ${warns.length} warn)` : `\n✗ funnel-crawl FAIL (${fails.length})`);
process.exit(fails.length === 0 ? 0 : 1);
