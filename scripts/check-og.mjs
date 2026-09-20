#!/usr/bin/env node
/**
 * Post-build assertion: Open Graph / Twitter preview meta across dist/
 * (story VU-5 SF-3, khuôn scripts/check-jsonld.mjs).
 *
 * Default mode — walk every *.html under dist/ and assert the SF-1 meta
 * contract holds everywhere:
 *   - og:title / og:description (non-empty, never the bare SITE_TAGLINE;
 *     desc-min: ≥55 chars on share surfaces FAIL, others WARN)
 *     fallback) / og:image (absolute https on the site origin, .png,
 *     file EXISTS in dist) / og:type / og:site_name / og:locale
 *     (en-US | vi_VN, consistent with the vi/ path prefix) /
 *     og:image:type (Base pins PNG tiles + og-default).
 *   - Post pages (path-derived from the dist layout — same shape as
 *     expectedTypes in check-jsonld, NO hand-enumerated counts):
 *     twitter:image:alt contains the headline (og:title is the fullTitle
 *     `title — wakii`; alt is the raw title — CONTAINMENT, not equality,
 *     so titles already containing the site name still pass);
 *     article:published_time present + Date-parseable; og:image
 *     resolution correctness — a hero-declaring post points at an
 *     existing dist/blog/heroes/*.png, a hero-less post at the absolute
 *     /og-default.png. Hero-less posts are NOT a violation (editorial
 *     batches may ship without heroes); only wrong resolution fails.
 *   - Size gate (absorbed from SF-2): every PNG tile under
 *     dist/blog/heroes/ and dist/og-default.png ≤ 100 KB.
 *   - Sitemap/robots sanity (criteria PIN): sitemap-index.xml +
 *     sitemap-0.xml parse structurally; the URL set equals the derived
 *     indexable set (canonical href of every non-noindex dist page —
 *     no hardcoded page counts); robots.txt byte-matches its template
 *     (User-agent/Allow/Sitemap from SITE_URL — unchanged content).
 *
 * --live mode — domain probe, deliberately SEPARATE from the build gate
 * (D9): HEAD https://wakii.xyz/ + og-default + one post URL and print
 * PASS 200 / WARN <status>. Never exits non-zero — the build must stay
 * green while the domain is not attached yet; after the owner adds
 * wakii.xyz (docs/knowledge/runbooks/link-preview-domain.md) the same
 * command becomes the 200 evidence.
 *
 * Any violation prints ✗ lines (file + reason) and exits 1; success
 * prints counts and exits 0. Site origin from src/config.ts (dynamic
 * import — node ≥22.18 strips TS types natively, same pattern as
 * check-jsonld.mjs). Regression guard contract: this check NEVER edits
 * what check-jsonld asserts (JSON-LD image stays on the SITE_URL origin).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const LIVE = process.argv.includes('--live');

const { SITE_URL, SITE_NAME, SITE_TAGLINE, OG_BASE_URL } = await import(
  new URL('../src/config.ts', import.meta.url)
);
const site = new URL(SITE_URL).origin;
// og:image lives on OG_BASE_URL while wakii.xyz is 404 (owner domain action)
const ogBase = new URL(OG_BASE_URL).origin;

/** Recursive *.html walk (dist/ missing → empty; caller reports). */
function walkHtml(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Flat *.png walk one level of globbing is not enough — same recursion. */
function walkPng(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkPng(p));
    else if (e.name.endsWith('.png')) out.push(p);
  }
  return out;
}

/** Absolute https URL on the site origin (same notion as check-jsonld). */
function absoluteSiteUrl(u) {
  if (typeof u !== 'string' || u === '') return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' && parsed.origin === site;
  } catch {
    return false;
  }
}

/** og:image may resolve on either origin (SITE_URL canonical or the
 * OG_BASE_URL image-host fallback — see config.ts). Other URL fields stay
 * site-origin strict. */
function absoluteOgImageUrl(u) {
  if (typeof u !== 'string' || u === '') return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' && (parsed.origin === site || parsed.origin === ogBase);
  } catch {
    return false;
  }
}

/** Astro attribute-escapes values — unescape the five it emits. */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/* Tag regex is quote-aware: Astro does not escape < / > inside attribute
 * values (valid HTML5 — the value ends at the closing quote), so a plain
 * [^>]* would truncate a tag whose content holds e.g. "story/<epic>-<slug>". */
const META_TAG_RE = /<meta\b(?:"[^"]*"|'[^']*'|[^>"'])*>/gi;
const KEY_RE = /\b(?:property|name)=["']([^"']+)["']/i;
const CONTENT_RE = /\bcontent=["']([^"']*)["']/i;

/** Map of og:/twitter:/article: keys → first content value on the page. */
function extractMeta(html) {
  const meta = new Map();
  for (const tag of html.matchAll(META_TAG_RE)) {
    const key = tag[0].match(KEY_RE)?.[1];
    if (!key || !/^(og:|twitter:|article:)/.test(key) || meta.has(key)) continue;
    meta.set(key, decodeEntities(tag[0].match(CONTENT_RE)?.[1] ?? ''));
  }
  return meta;
}

/** Canonical <link> href (absolute, per Base.astro self-reference). */
function canonicalHref(html) {
  for (const tag of html.matchAll(/<link\b(?:"[^"]*"|'[^']*'|[^>"'])*>/gi)) {
    const t = tag[0];
    if (!/\brel=["']canonical["']/.test(t)) continue;
    const href = t.match(/\bhref=["']([^"']*)["']/i)?.[1];
    return href ? decodeEntities(href) : '';
  }
  return '';
}

/** Post-page predicate derived from the dist path (khuôn expectedTypes). */
function postSlugOf(relPath) {
  const m = relPath.match(/^(?:(vi)\/)?blog\/(.+)$/);
  if (!m) return null;
  const rest = m[2].split('/');
  return rest.length === 2 && rest[1] === 'index.html' ? rest[0] : null;
}

const failures = [];
function fail(file, reason) {
  failures.push(`  ✗ ${file}: ${reason}`);
}
/* Non-blocking notes (desc-min on non-share surfaces) — printed, never exit-1. */
const warnings = [];
function warn(file, reason) {
  warnings.push(`  ⚠ ${file}: ${reason}`);
}

/* ── --live: network probe, never fails (D9) ─────────────────────────── */

if (LIVE) {
  const targets = [`${site}/`, `${site}/og-default.png`, `${ogBase}/`, `${ogBase}/og-default.png`];
  const postDirs = existsSync(join(distDir, 'blog'))
    ? readdirSync(join(distDir, 'blog'), { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name !== 'category')
        .map((e) => e.name)
        .sort()
    : [];
  if (postDirs.length > 0) {
    targets.push(`${site}/blog/${postDirs[0]}/`);
  } else {
    console.log('  ~ no dist/blog — post URL probe skipped (run the build first)');
  }

  console.log(`--live domain probe (${site}) — never fails the build;`);
  console.log('  runbook: docs/knowledge/runbooks/link-preview-domain.md');
  let pass = 0;
  for (const url of targets) {
    let line;
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15_000) });
      if (res.status === 405) {
        // HEAD rejected — retry once with GET (same evidence, bigger body).
        const get = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(15_000) });
        await get.body?.cancel();
        line = get.status === 200 ? `PASS ${get.status} (via GET)` : `WARN ${get.status}`;
        if (get.status === 200) pass++;
      } else {
        await res.body?.cancel();
        line = res.status === 200 ? 'PASS 200' : `WARN ${res.status}`;
        if (res.status === 200) pass++;
      }
    } catch (e) {
      line = `WARN network (${e?.cause?.code ?? e.message})`;
    }
    console.log(`  ${line}  ${url}`);
  }
  console.log(
    pass === targets.length
      ? `✓ live: ${pass}/${targets.length} URLs return 200 — domain is serving; re-scrape FB/Zalo per runbook`
      : `~ live: ${pass}/${targets.length} URLs return 200 — domain not serving yet (expected until the owner adds wakii.xyz; see runbook)`
  );
  process.exit(0);
}

/* ── default: dist gate ──────────────────────────────────────────────── */

const htmlFiles = walkHtml(distDir);
if (htmlFiles.length === 0) {
  console.error('✗ check-og FAILED: no *.html under dist/ — run `pnpm build` first');
  process.exit(1);
}

const KB = 1024;
const TILE_MAX = 100 * KB;
const OG_DEFAULT = '/og-default.png';
const LOCALES = new Set(['en-US', 'vi_VN']);

let posts = 0;
let heroPosts = 0;
let ogDefaultPosts = 0;

for (const abs of htmlFiles) {
  const file = relative(distDir, abs).split(sep).join('/');
  const html = readFileSync(abs, 'utf8');
  const meta = extractMeta(html);
  const isVi = file === 'vi/index.html' || file.startsWith('vi/');

  const ogTitle = meta.get('og:title') ?? '';
  const ogDesc = meta.get('og:description') ?? '';
  const ogImage = meta.get('og:image') ?? '';

  if (!ogTitle.trim()) fail(file, 'og:title empty');
  if (!ogDesc.trim()) fail(file, 'og:description empty');
  if (ogDesc.trim() === SITE_TAGLINE) {
  // desc-min (owner request 09-20): share surfaces (landing, /download, blog
  // posts) hard-fail below the 55-char share-card floor; other surfaces warn.
  {
    const descLen = ogDesc.trim().length;
    const isPost = Boolean(postSlugOf(file));
    const isShareSurface =
      file === 'index.html' || file === 'vi/index.html' ||
      file === 'download/index.html' || file === 'vi/download/index.html' ||
      isPost;
    if (descLen < 55) {
      const reason = `og:description ${descLen} chars < 55 (share-card floor)`;
      if (isShareSurface) fail(file, reason);
      else warn(file, `${reason} — non-share surface`);
    }
  }
    fail(file, 'og:description is the bare SITE_TAGLINE fallback (page must pass its own description)');
  }
  if (!['website', 'article'].includes(meta.get('og:type') ?? '')) {
    fail(file, `og:type must be "website"|"article" (got "${meta.get('og:type') ?? 'missing'}")`);
  }
  if (meta.get('og:site_name') !== SITE_NAME) {
    fail(file, `og:site_name must be "${SITE_NAME}" (got "${meta.get('og:site_name') ?? 'missing'}")`);
  }
  const ogLocale = meta.get('og:locale') ?? '';
  if (!LOCALES.has(ogLocale)) {
    fail(file, `og:locale must be en-US|vi_VN (got "${ogLocale}")`);
  } else if (isVi !== (ogLocale === 'vi_VN')) {
    fail(file, `og:locale "${ogLocale}" inconsistent with ${isVi ? 'a vi/' : 'an EN'} path`);
  }

  // og:image — absolute https on SITE or OG_BASE origin, PNG, ships in dist.
  if (!absoluteOgImageUrl(ogImage)) {
    fail(file, `og:image not absolute https on ${site} or ${ogBase}`);
  } else {
    let imgPath = '';
    try {
      imgPath = new URL(ogImage).pathname;
    } catch {
      /* unreachable — absoluteOgImageUrl passed */
    }
    if (!imgPath.endsWith('.png') || meta.get('og:image:type') !== 'image/png') {
      fail(file, `og:image must be a PNG declared as image/png (got ${imgPath} / type "${meta.get('og:image:type')}")`);
    }
    const imgFile = join(distDir, imgPath.replace(/^\//, ''));
    if (!existsSync(imgFile)) fail(file, `og:image file missing from dist: ${imgPath}`);
  }

  const slug = postSlugOf(file);
  if (slug === null) continue;
  posts++;

  // twitter:image:alt CONTAINS the headline — og:title is the fullTitle
  // `title — wakii`, alt is the raw title; equality would false-fail any
  // title that already embeds the site name.
  const alt = meta.get('twitter:image:alt') ?? '';
  const fullTitleSuffix = ` — ${SITE_NAME}`;
  const headline = ogTitle.endsWith(fullTitleSuffix) ? ogTitle.slice(0, -fullTitleSuffix.length) : ogTitle;
  if (!alt.trim()) fail(file, 'twitter:image:alt empty');
  else if (!alt.includes(headline)) {
    fail(file, `twitter:image:alt must contain the headline ${JSON.stringify(headline)} (got ${JSON.stringify(alt)})`);
  }

  const published = meta.get('article:published_time') ?? '';
  if (!published || Number.isNaN(new Date(published).getTime())) {
    fail(file, `article:published_time missing/not Date-parseable (got "${published}")`);
  }

  // Resolution correctness — hero → existing dist tile; hero-less → the
  // absolute og-default. No hero-count gate (editorial batches may ship
  // hero-less posts; only WRONG resolution fails).
  if (absoluteOgImageUrl(ogImage)) {
    const imgPath = new URL(ogImage).pathname;
    if (imgPath === OG_DEFAULT) {
      ogDefaultPosts++;
    } else {
      heroPosts++;
      if (!imgPath.startsWith('/blog/heroes/') || !imgPath.endsWith('.png')) {
        fail(file, `hero og:image must be a /blog/heroes/*.png tile (got ${imgPath})`);
      }
    }
  }
}

/* Size gate (SF-2 P2 absorb): tiles + og-default ≤ 100 KB each. */
let tiles = 0;
let tileMax = 0;
for (const abs of walkPng(join(distDir, 'blog', 'heroes')).concat([join(distDir, 'og-default.png')])) {
  if (!existsSync(abs)) {
    fail(relative(distDir, abs).split(sep).join('/'), 'size gate: file missing');
    continue;
  }
  tiles++;
  const size = statSync(abs).size;
  tileMax = Math.max(tileMax, size);
  const rel = relative(distDir, abs).split(sep).join('/');
  if (size > TILE_MAX) fail(rel, `PNG tile ${(size / KB).toFixed(0)}KB > ${TILE_MAX / KB}KB gate`);
}

/* Sitemap/robots sanity (criteria PIN). */
const indexable = new Map(); // canonical URL → dist file
for (const abs of htmlFiles) {
  const file = relative(distDir, abs).split(sep).join('/');
  const html = readFileSync(abs, 'utf8');
  if (/<meta\b(?:"[^"]*"|'[^']*'|[^>"'])*name=["']robots["'](?:"[^"]*"|'[^']*'|[^>"'])*content=["'][^"']*noindex/i.test(html)) continue;
  const href = canonicalHref(html);
  if (absoluteSiteUrl(href)) indexable.set(href, file);
}

const sitemapIndex = join(distDir, 'sitemap-index.xml');
if (!existsSync(sitemapIndex)) {
  fail('sitemap-index.xml', 'missing from dist');
} else {
  const idx = readFileSync(sitemapIndex, 'utf8');
  if (!idx.includes('<sitemapindex')) fail('sitemap-index.xml', 'not a sitemapindex document');
  const childMaps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (childMaps.length === 0) fail('sitemap-index.xml', 'no child <sitemap> <loc> entries');

  const sitemapUrls = new Set();
  for (const mapUrl of childMaps) {
    const mapFile = join(distDir, mapUrl.replace(`${site}/`, ''));
    if (!existsSync(mapFile)) {
      fail('sitemap-index.xml', `child sitemap missing from dist: ${mapUrl}`);
      continue;
    }
    const xml = readFileSync(mapFile, 'utf8');
    if (!xml.includes('<urlset')) fail(mapUrl, 'not a urlset document');
    for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1]);
  }

  const missing = [...indexable.keys()].filter((u) => !sitemapUrls.has(u));
  const extra = [...sitemapUrls].filter((u) => !indexable.has(u));
  if (missing.length > 0) {
    fail('sitemap-0.xml', `${missing.length} indexable page(s) absent from sitemap — e.g. ${missing.slice(0, 3).join(', ')}`);
  }
  if (extra.length > 0) {
    fail('sitemap-0.xml', `${extra.length} sitemap URL(s) have no indexable page — e.g. ${extra.slice(0, 3).join(', ')}`);
  }
}

const robotsFile = join(distDir, 'robots.txt');
const robotsWant = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`;
if (!existsSync(robotsFile)) {
  fail('robots.txt', 'missing from dist');
} else if (readFileSync(robotsFile, 'utf8') !== robotsWant) {
  fail('robots.txt', 'content drifted from the pinned template (src/pages/robots.txt.ts)');
}

if (warnings.length > 0) {
  console.log(`⚠ check-og warnings (${warnings.length}):`);
  for (const w of warnings) console.log(w);
}
if (failures.length > 0) {
  console.error(`✗ check-og FAILED (${failures.length} violation${failures.length === 1 ? '' : 's'}):`);
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log(
  `✓ OG OK (${htmlFiles.length} pages checked · ${posts} posts: ${heroPosts} hero tile / ` +
    `${ogDefaultPosts} og-default · size gate ${tiles} PNG ≤ ${TILE_MAX / KB}KB (max ${(tileMax / KB).toFixed(0)}KB) · ` +
    `sitemap ${indexable.size} URLs · robots pinned)`
);
