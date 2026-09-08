#!/usr/bin/env node
/**
 * Post-build assertion: JSON-LD across dist/ (story FI-349 SF-4).
 *
 * Walks every *.html under dist/, extracts all
 * `<script type="application/ld+json">` blocks (regex tolerates extra
 * attributes around `type`) and JSON.parses each directly (the layouts
 * escape "<" as \u003c — valid JSON inside a string).
 *
 * Structural asserts per @type:
 *   - BlogPosting: schema.org context, non-empty headline, Date-parseable
 *     datePublished, author object with non-empty @type + name, url /
 *     image / mainEntityOfPage.@id absolute https on the site origin.
 *   - Blog: non-empty name, absolute url, blogPost array ≥1 — each item a
 *     BlogPosting with headline + datePublished + absolute url.
 *   - BreadcrumbList: itemListElement ≥2, positions integers strictly
 *     ascending starting at 1, every element name + absolute item URL.
 *
 * Path-derived expectations (derived from the dist layout, NO hardcoded
 * page counts): blog/<slug>/ + vi/blog/<slug>/ (excluding index.html and
 * category/) each carry ≥1 BlogPosting; blog/index.html + vi/blog/ a Blog;
 * every blog/category/<cat>/index.html both locales a BreadcrumbList.
 *
 * Site origin comes from src/config.ts (dynamic import — node ≥22.18
 * strips TS types natively, same pattern as check-blog-utils.mjs).
 * Any violation prints ✗ lines (file + reason) and exits 1; success
 * prints per-@type counts + pages checked and exits 0.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const { SITE_URL } = await import(new URL('../src/config.ts', import.meta.url));
const site = new URL(SITE_URL).origin;

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

/** Absolute https URL on the site origin (the SF-4 notion of "absolute"). */
function absoluteSiteUrl(u) {
  if (typeof u !== 'string' || u === '') return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' && parsed.origin === site;
  } catch {
    return false;
  }
}

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function dateParseable(v) {
  return !Number.isNaN(new Date(v).getTime());
}

const failures = [];
function fail(file, reason) {
  failures.push(`  ✗ ${file}: ${reason}`);
}

function checkBlogPosting(obj, file) {
  if (obj['@context'] !== 'https://schema.org') {
    fail(file, 'BlogPosting @context must be "https://schema.org"');
  }
  if (!nonEmptyString(obj.headline)) fail(file, 'BlogPosting headline empty');
  if (!dateParseable(obj.datePublished)) fail(file, 'BlogPosting datePublished not Date-parseable');
  const author = obj.author;
  if (typeof author !== 'object' || author === null || Array.isArray(author)) {
    fail(file, 'BlogPosting author must be an object');
  } else {
    if (!nonEmptyString(author['@type'])) fail(file, 'BlogPosting author.@type empty');
    if (!nonEmptyString(author.name)) fail(file, 'BlogPosting author.name empty');
  }
  if (!absoluteSiteUrl(obj.url)) fail(file, 'BlogPosting url not absolute https on site origin');
  if (!absoluteSiteUrl(obj.image)) fail(file, 'BlogPosting image not absolute https on site origin');
  if (!absoluteSiteUrl(obj.mainEntityOfPage?.['@id'])) {
    fail(file, 'BlogPosting mainEntityOfPage.@id not absolute https on site origin');
  }
}

function checkBlogPostItem(item, file, i) {
  if (item['@type'] !== 'BlogPosting') fail(file, `blogPost[${i}] @type must be "BlogPosting"`);
  if (!nonEmptyString(item.headline)) fail(file, `blogPost[${i}] headline empty`);
  if (!dateParseable(item.datePublished)) fail(file, `blogPost[${i}] datePublished not Date-parseable`);
  if (!absoluteSiteUrl(item.url)) fail(file, `blogPost[${i}] url not absolute https on site origin`);
}

function checkBlog(obj, file) {
  if (obj['@context'] !== 'https://schema.org') fail(file, 'Blog @context must be "https://schema.org"');
  if (!nonEmptyString(obj.name)) fail(file, 'Blog name empty');
  if (!absoluteSiteUrl(obj.url)) fail(file, 'Blog url not absolute https on site origin');
  if (!Array.isArray(obj.blogPost) || obj.blogPost.length < 1) {
    fail(file, 'Blog blogPost must be an array with ≥1 item');
    return;
  }
  obj.blogPost.forEach((item, i) => checkBlogPostItem(item ?? {}, file, i));
}

function checkBreadcrumb(obj, file) {
  if (obj['@context'] !== 'https://schema.org') {
    fail(file, 'BreadcrumbList @context must be "https://schema.org"');
  }
  const items = obj.itemListElement;
  if (!Array.isArray(items) || items.length < 2) {
    fail(file, 'BreadcrumbList itemListElement must have ≥2 entries');
    return;
  }
  let prev = -Infinity;
  items.forEach((el, i) => {
    const item = el ?? {};
    if (!Number.isInteger(item.position)) {
      fail(file, `itemListElement[${i}] position must be an integer (got ${JSON.stringify(item.position)})`);
    } else {
      if (i === 0 && item.position !== 1) fail(file, 'BreadcrumbList positions must start at 1');
      if (item.position <= prev) {
        fail(file, `itemListElement[${i}] position ${item.position} not strictly ascending`);
      }
      prev = item.position;
    }
    if (!nonEmptyString(item.name)) fail(file, `itemListElement[${i}] name empty`);
    if (!absoluteSiteUrl(item.item)) fail(file, `itemListElement[${i}] item not absolute https on site origin`);
  });
}

/** Expected @type set for a dist page — derived from the path alone. */
function expectedTypes(relPath) {
  const m = relPath.match(/^(?:(vi)\/)?blog\/(.+)$/);
  if (!m) return [];
  const rest = m[2].split('/');
  if (rest[0] === 'category') {
    return rest.length === 3 && rest[2] === 'index.html' ? ['BreadcrumbList'] : [];
  }
  if (rest.length === 2 && rest[1] === 'index.html') return ['BlogPosting'];
  if (rest.length === 1 && rest[0] === 'index.html') return ['Blog'];
  return [];
}

const LD_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;

const htmlFiles = walkHtml(distDir);
if (htmlFiles.length === 0) {
  console.error('✗ check-jsonld FAILED: no *.html under dist/ — run `pnpm build` first');
  process.exit(1);
}

const typeCounts = new Map();
for (const abs of htmlFiles) {
  const file = relative(distDir, abs).split(sep).join('/');
  const html = readFileSync(abs, 'utf8');
  const found = new Set();

  for (const match of html.matchAll(LD_RE)) {
    let parsed;
    try {
      parsed = JSON.parse(match[1]);
    } catch (e) {
      fail(file, `ld+json does not parse: ${e.message}`);
      continue;
    }
    for (const obj of Array.isArray(parsed) ? parsed : [parsed]) {
      const type = obj?.['@type'];
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      found.add(type);
      if (type === 'BlogPosting') checkBlogPosting(obj, file);
      else if (type === 'Blog') checkBlog(obj, file);
      else if (type === 'BreadcrumbList') checkBreadcrumb(obj, file);
    }
  }

  for (const want of expectedTypes(file)) {
    if (!found.has(want)) fail(file, `expected ≥1 ${want} block (path-derived)`);
  }
}

/* Strict coverage — batch-3 (story FI-383 SF-6, Linear FI-389): every matrix
 * row MUST have its EN+VI source file on disk (100 files). The convergence
 * audit treats a missing batch-2/3 row as a NOTE (mid-story expectation);
 * here it is a HARD failure — SF-6 is the convergence gate against silent
 * scope shrink (pack `fi383-sf-6.md` acceptance #1, T7 pendingRows == 0). */
{
  const matrixPath = join(root, 'docs', 'superpowers', 'editorial', '2026-blog-longform', 'topic-matrix-batch3.md');
  if (!existsSync(matrixPath)) {
    fail('src/content/blog', `strict coverage: batch-3 matrix missing at ${relative(root, matrixPath)}`);
  } else {
    const slugRe = /^\|\s*\d+\s*\|\s*`([a-z0-9-]+)`\s*\|/gm;
    const slugs = [...readFileSync(matrixPath, 'utf8').matchAll(slugRe)].map((m) => m[1]);
    if (slugs.length !== 50) {
      fail('src/content/blog', `strict coverage: batch-3 matrix parsed ${slugs.length} rows, want 50`);
    }
    if (new Set(slugs).size !== slugs.length) {
      fail('src/content/blog', 'strict coverage: duplicate slug rows in batch-3 matrix');
    }
    const missing = [];
    for (const slug of slugs) {
      for (const locale of ['en', 'vi']) {
        if (!existsSync(join(root, 'src', 'content', 'blog', locale, `${slug}.md`))) {
          missing.push(`${locale}/${slug}.md`);
        }
      }
    }
    if (missing.length > 0) {
      fail('src/content/blog', `strict coverage: ${missing.length} batch-3 file(s) missing — ${missing.join(', ')}`);
    } else {
      console.log(`✓ strict coverage OK (batch-3: ${slugs.length} slugs × 2 locales = ${slugs.length * 2} files present)`);
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ check-jsonld FAILED (${failures.length} violation${failures.length === 1 ? '' : 's'}):`);
  for (const f of failures) console.error(f);
  process.exit(1);
}

const counts = [...typeCounts.entries()].map(([t, n]) => `${t ?? 'unknown'} ${n}`).join(' · ');
console.log(`✓ JSON-LD OK (${htmlFiles.length} pages checked · ${counts})`);
