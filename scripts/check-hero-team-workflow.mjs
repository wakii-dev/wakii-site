#!/usr/bin/env node
/**
 * Acceptance suite — hero-team-workflow (design A "The Window"), stage 4 TDD.
 *
 * Encodes the DoD of docs/mockups/handoff-spec-a.md at SOURCE level: build,
 * dist markup and LCP stay with stage 5 + the captain's DoD verify (captain
 * ruling on the approved [PLAN]). Written BEFORE implementation — running it
 * now must fail on all 13 checks (RED); it turns green as the stage-5 worker
 * implements the spec (RED → GREEN, the test is the measurable contract).
 *
 * Scope (captain-approved [PLAN], 02/11):
 *   A1-A3  asset exists · 1120×592 · ≤100KB
 *   B1-B2  i18n 6 new keys, copy pinned 1:1 by the spec (EN + VI)
 *   B3     orphan sweep src/ = 0 (termTitle/lastCmd/t.hero.boot,
 *          q2SlotName/q2SlotHint, boot: in landing.ts) — includes
 *          TerminalBoot.astro's own props, so the file must go in stage 5
 *   B4     LandingStrings type defs: new keys in, old keys out
 *   C1-C2  Hero.astro img src/dims/alt, no loading="lazy"
 *   C3     tilt pair intact (img inside div[data-hero-term],
 *          header[data-tilt-host], motion.ts still queries both)
 *   C4     TerminalBoot out of Hero.astro (import + JSX)
 *   D1-D2  bento q2 real img + alt key · placeholder keys gone from
 *          Understand.astro (figcaption mechanism = weaver's call)
 *
 * Read-only — never edits production files. Exit 1 when any check fails.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const heroFile = join(srcDir, 'components', 'landing', 'Hero.astro');
const understandFile = join(srcDir, 'components', 'landing', 'Understand.astro');
const landingFile = join(srcDir, 'i18n', 'landing.ts');
const motionFile = join(srcDir, 'components', 'motion.ts');
const assetPath = join(root, 'public', 'hero-team-workflow.png');
const ASSET_MAX_BYTES = 102400; // 100KB tile standard (self-enforced; check:og doesn't scan hero)

// Copy pinned EXACTLY by handoff-spec-a.md ("THÊM 5 keys mới" + "Bento q2") —
// em-dash and middle dot included; the regex compare is character-exact.
const COPY = {
  en: {
    windowTitle: 'Wakii — team workspace · session 3',
    liveBadge: 'live',
    imgAlt:
      'Wakii IDE running a live team session — captain coordinating workers in team chat while agents build in parallel terminals',
    captionChip: 'live session — captain + team chat · #launching',
    shotMeta: 'your IDE, right now',
    q2ImgAlt: 'Wakii app overview — workspace, agent terminals and team chat panel',
  },
  vi: {
    windowTitle: 'Wakii — team workspace · session 3',
    liveBadge: 'live',
    imgAlt:
      'IDE Wakii đang chạy session team thật — captain điều phối workers qua team chat trong lúc các agent build song song',
    captionChip: 'session thật — captain + team chat · #launching',
    shotMeta: 'IDE của bạn, ngay lúc này',
    q2ImgAlt: 'Toàn cảnh app Wakii — workspace, các terminal agent và panel team chat',
  },
};

const failures = [];
let total = 0;
function check(id, name, ok, detail) {
  total += 1;
  if (ok) {
    console.log(`✓ ${id} ${name}`);
  } else {
    console.error(`✗ ${id} ${name}${detail ? ` — ${detail}` : ''}`);
    failures.push(id);
  }
  return ok;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** `key: '<copy>'` — either quote style, exact copy (spec pins single quotes). */
const keyValueRe = (key, copy) => new RegExp(`${key}\\s*:\\s*['"]${escapeRe(copy)}['"]`);
const q = (v) => (v == null ? 'null' : JSON.stringify(v));

// ── load sources ────────────────────────────────────────────────────────────
const heroSrc = existsSync(heroFile) ? readFileSync(heroFile, 'utf8') : '';
const understandSrc = existsSync(understandFile) ? readFileSync(understandFile, 'utf8') : '';
const landingSrc = existsSync(landingFile) ? readFileSync(landingFile, 'utf8') : '';
const motionSrc = existsSync(motionFile) ? readFileSync(motionFile, 'utf8') : '';

// ── A1-A3 — asset: exists · 1120×592 · ≤100KB ───────────────────────────────
function pngDims(buf) {
  // PNG: 8-byte signature + IHDR chunk (len 4, 'IHDR' 4, width 4 BE, height 4 BE)
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}
function assetDims() {
  if (process.platform === 'darwin') {
    try {
      const out = execSync(`sips -g pixelWidth -g pixelHeight ${JSON.stringify(assetPath)}`, {
        encoding: 'utf8',
      });
      const w = out.match(/pixelWidth:\s*(\d+)/)?.[1];
      const h = out.match(/pixelHeight:\s*(\d+)/)?.[1];
      if (w && h) return `${w}x${h}`;
    } catch {
      /* fall through to IHDR parse */
    }
  }
  return pngDims(readFileSync(assetPath));
}

const assetExists = existsSync(assetPath);
check('A1', 'asset exists (public/hero-team-workflow.png)', assetExists);
if (assetExists) {
  const dims = assetDims();
  check('A2', 'asset is 1120×592 (sips on darwin, IHDR fallback)', dims === '1120x592', `got ${q(dims)}`);
  const bytes = statSync(assetPath).size;
  check('A3', `asset ≤ ${ASSET_MAX_BYTES} bytes (100KB tile standard)`, bytes <= ASSET_MAX_BYTES, `got ${bytes} bytes`);
} else {
  check('A2', 'asset is 1120×592 (sips on darwin, IHDR fallback)', false, 'asset missing — dims unknown');
  check('A3', `asset ≤ ${ASSET_MAX_BYTES} bytes (100KB tile standard)`, false, 'asset missing');
}

// ── B1-B2 — i18n: 6 new keys, exact spec copy, right locale block ───────────
const enAt = landingSrc.indexOf('export const en');
const viAt = landingSrc.indexOf('export const vi');
const enBlock = viAt > enAt ? landingSrc.slice(enAt, viAt) : landingSrc.slice(enAt);
const viBlock = viAt > -1 ? landingSrc.slice(viAt) : '';
for (const [locale, block, id] of [
  ['en', enBlock, 'B1'],
  ['vi', viBlock, 'B2'],
]) {
  const missing = Object.entries(COPY[locale])
    .filter(([key, copy]) => !keyValueRe(key, copy).test(block))
    .map(([key]) => `hero.${key}`);
  check(
    id,
    `landing.ts ${locale} block has the 6 new keys with exact spec copy`,
    missing.length === 0,
    missing.length ? `missing/mismatched: ${missing.join(', ')}` : undefined
  );
}

// ── B3 — orphan sweep src/ = 0 (DoD grep 2a + 2b, + boot: in landing.ts) ────
function walkSources(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkSources(p));
    else out.push(p);
  }
  return out;
}
function lineOf(text, idx) {
  return text.slice(0, idx).split('\n').length;
}
const sweepNeedles = ['termTitle', 'lastCmd', 't.hero.boot', 'q2SlotName', 'q2SlotHint'];
const sweepHits = [];
for (const file of walkSources(srcDir)) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // binary — needles are ASCII source identifiers
  }
  for (const needle of sweepNeedles) {
    let at = text.indexOf(needle);
    while (at !== -1) {
      sweepHits.push(`${relative(root, file)}:${lineOf(text, at)}: ${needle}`);
      at = text.indexOf(needle, at + needle.length);
    }
  }
}
// `boot:` only exists as the hero.boot key line(s) — scoped to landing.ts to
// avoid false positives on prose elsewhere.
const bootHits = [];
{
  let at = landingSrc.indexOf('boot:');
  while (at !== -1) {
    bootHits.push(`${relative(root, landingFile)}:${lineOf(landingSrc, at)}: boot:`);
    at = landingSrc.indexOf('boot:', at + 5);
  }
}
const b3Detail = [...sweepHits, ...bootHits].slice(0, 12).join(' · ');
check(
  'B3',
  'orphan sweep src/ = 0 (termTitle · lastCmd · t.hero.boot · q2SlotName · q2SlotHint · boot: in landing.ts)',
  sweepHits.length === 0 && bootHits.length === 0,
  b3Detail ? `${sweepHits.length + bootHits.length} hits: ${b3Detail}` : undefined
);

// ── B4 — LandingStrings type defs: new keys in, old keys out ────────────────
const oldTypes = ['termTitle: string', 'boot: string[', 'lastCmd: string', 'q2SlotName: string', 'q2SlotHint: string'];
const newTypes = ['windowTitle: string', 'liveBadge: string', 'imgAlt: string', 'captionChip: string', 'shotMeta: string', 'q2ImgAlt: string'];
const staleTypes = oldTypes.filter((t) => landingSrc.includes(t));
const missingTypes = newTypes.filter((t) => !landingSrc.includes(t));
check(
  'B4',
  'LandingStrings type defs — 6 new `: string` keys, old term/boot/slot keys gone',
  staleTypes.length === 0 && missingTypes.length === 0,
  [staleTypes.length && `stale: ${staleTypes.join(', ')}`, missingTypes.length && `missing: ${missingTypes.join(', ')}`]
    .filter(Boolean)
    .join(' · ') || undefined
);

// ── C1-C2 — Hero.astro img: src + dims + alt, no loading="lazy" ─────────────
const heroImg = heroSrc.match(/<img\b[^>]*hero-team-workflow[^>]*>/)?.[0] ?? null;
check(
  'C1',
  'Hero.astro img: src=/hero-team-workflow.png · width=1120 · height=592 · alt={t.hero.imgAlt}',
  Boolean(
    heroImg &&
      /src=["']\/hero-team-workflow\.png["']/.test(heroImg) &&
      /width=["']1120["']/.test(heroImg) &&
      /height=["']592["']/.test(heroImg) &&
      heroImg.includes('alt={t.hero.imgAlt}')
  ),
  heroImg ? `img tag found but attributes off: ${heroImg.slice(0, 160)}` : 'no hero-team-workflow img in Hero.astro'
);
check(
  'C2',
  'Hero.astro img has NO loading="lazy" (first-viewport LCP candidate)',
  Boolean(heroImg) && !/loading=["']lazy["']/.test(heroImg ?? ''),
  heroImg ? undefined : 'no img — composite (turns red-green with C1)'
);

// ── C3 — tilt pair intact: img inside div[data-hero-term] + motion queries ──
function heroTermBlock(text) {
  const at = text.indexOf('data-hero-term');
  if (at === -1) return null;
  const open = text.lastIndexOf('<div', at);
  if (open === -1) return null;
  let depth = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(text))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return text.slice(open, re.lastIndex);
  }
  return null;
}
const termBlock = heroTermBlock(heroSrc);
const tiltHost = /<header[^>]*data-tilt-host/.test(heroSrc);
const motionPair =
  motionSrc.includes("querySelector<HTMLElement>('[data-tilt-host]')") &&
  motionSrc.includes("querySelector<HTMLElement>('[data-hero-term]')");
const imgInBlock = Boolean(termBlock && heroImg && termBlock.includes(heroImg));
check(
  'C3',
  'tilt pair intact — img inside div[data-hero-term] · header[data-tilt-host] · motion.ts queries both',
  imgInBlock && tiltHost && motionPair,
  [
    !imgInBlock && 'img not inside div[data-hero-term] block',
    !tiltHost && 'header[data-tilt-host] missing',
    !motionPair && 'motion.ts selector pair broken',
  ]
    .filter(Boolean)
    .join(' · ') || undefined
);

// ── C4 — TerminalBoot out of Hero.astro (import + JSX, DoD grep 2c) ─────────
const tbAt = heroSrc.indexOf('TerminalBoot');
const tbHits = [];
{
  let at = tbAt;
  while (at !== -1) {
    tbHits.push(`${relative(root, heroFile)}:${lineOf(heroSrc, at)}`);
    at = heroSrc.indexOf('TerminalBoot', at + 'TerminalBoot'.length);
  }
}
check('C4', 'TerminalBoot fully out of Hero.astro (import + JSX)', tbHits.length === 0, tbHits.length ? `${tbHits.length} refs: ${tbHits.join(', ')}` : undefined);

// ── D1 — bento q2: figure.shot with the real img + alt key binding ──────────
const figAt = understandSrc.search(/<figure[^>]*class="[^"]*\bshot\b[^"]*"/);
const figBlock = figAt !== -1 ? understandSrc.slice(figAt, understandSrc.indexOf('</figure>', figAt)) : null;
const q2ImgOk = Boolean(
  figBlock &&
    /src=["']\/hero-team-workflow\.png["']/.test(figBlock) &&
    /width=["']1120["']/.test(figBlock) &&
    /height=["']592["']/.test(figBlock) &&
    figBlock.includes('alt={t.understand.q2ImgAlt}')
);
check(
  'D1',
  'Understand.astro q2 — figure.shot with real img (src/dims) + alt={t.understand.q2ImgAlt}',
  q2ImgOk,
  figBlock ? 'figure.shot found but img attrs/alt binding off' : 'no figure.shot in Understand.astro'
);

// ── D2 — placeholder q2 keys gone from Understand.astro (q3 slot untouched) ─
const d2Hits = ['q2SlotName', 'q2SlotHint'].flatMap((needle) => {
  const hits = [];
  let at = understandSrc.indexOf(needle);
  while (at !== -1) {
    hits.push(`:${lineOf(understandSrc, at)} ${needle}`);
    at = understandSrc.indexOf(needle, at + needle.length);
  }
  return hits;
});
check(
  'D2',
  'Understand.astro q2SlotName/q2SlotHint = 0 (q3 slot-sm stays)',
  d2Hits.length === 0,
  d2Hits.length ? `${d2Hits.length} refs: ${d2Hits.join(', ')}` : undefined
);

// ── summary ─────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(
    `\n✗ hero-team-workflow acceptance FAILED: ${total - failures.length}/${total} PASS` +
      ` (RED is expected until stage 5 implements handoff-spec-a.md — green = DoD met)`
  );
  process.exit(1);
}
console.log(`\n✓ hero-team-workflow acceptance: ${total}/${total} PASS`);
