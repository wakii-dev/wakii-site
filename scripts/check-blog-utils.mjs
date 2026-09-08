#!/usr/bin/env node
/**
 * Build-time assertion: blog shared utils against the REAL 10 posts
 * (story FI-349 SF-1 demo — "node assert utils" at util level).
 *
 * Imports src/utils/blog.ts directly (node ≥22.18 strips TS types natively
 * without flags — 23.6+ unflagged; CI pins 22 in ci.yml/deploy.yml;
 * the util module is deliberately self-contained — no astro:content).
 *
 * Asserts, per spec rev 3 §SF-1:
 *   - readingTime: ≥ 1 minute, rounded up (exact vs word-count/WPM math),
 *     VI (160 wpm) ≥ EN (200 wpm) for the same post.
 *   - relatedPosts: max 3, same locale only, never contains the current
 *     post, draft:false; 'building-wakii-in-the-open-log-1' (only build-log
 *     post, no shared tags) falls through to latest-same-locale ×3.
 *   - author default: every current post omits `author` (default path is
 *     the live path) and the schema keeps the 'Wakii team' default literal.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = join(root, 'src', 'content', 'blog');
const configSrc = readFileSync(join(root, 'src', 'content.config.ts'), 'utf8');

const { readingTime, postReadingTime, relatedPosts } = await import(
  new URL('../src/utils/blog.ts', import.meta.url)
);

let failures = 0;
function assert(ok, message) {
  if (!ok) {
    failures += 1;
    console.error(`  ✗ ${message}`);
  }
}

/** Minimal frontmatter/body split — fields SF-1 introduced or asserts on. */
function parsePost(file) {
  const raw = readFileSync(file, 'utf8');
  const [, fm, body] = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/) ?? [];
  if (!fm) throw new Error(`no frontmatter: ${file}`);
  const field = (name) => {
    const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };
  return {
    id: null, // set by caller
    body,
    title: field('title'),
    heroImage: field('heroImage'),
    author: field('author'),
    wordCount: body.trim().split(/\s+/).filter(Boolean).length,
    // entry shape the utils expect (mirrors Astro CollectionEntry.data)
    data: {
      category: field('category'),
      tags: (fm.match(/^tags:\s*\[(.*?)\]/m)?.[1] ?? '')
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean),
      draft: field('draft') === 'true',
      pubDate: new Date(field('pubDate')),
    },
  };
}

function load(locale) {
  const dir = join(blogDir, locale);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const post = parsePost(join(dir, f));
      post.id = `${locale}/${f.replace(/\.md$/, '')}`;
      return post;
    });
}

const en = load('en');
const vi = load('vi');
const all = [...en, ...vi];
console.log(`✓ loaded ${all.length} posts (EN ${en.length} + VI ${vi.length})`);

// ── readingTime ─────────────────────────────────────────────────────────
console.log('readingTime:');
for (const slug of en.map((p) => p.id.replace(/^en\//, ''))) {
  const e = en.find((p) => p.id === `en/${slug}`);
  const v = vi.find((p) => p.id === `vi/${slug}`);
  const rtEn = readingTime(e.body, 'en');
  const rtVi = readingTime(v.body, 'vi');
  assert(rtEn >= 1, `${slug}: EN readingTime must be ≥ 1 minute`);
  assert(rtVi >= 1, `${slug}: VI readingTime must be ≥ 1 minute`);
  assert(rtVi >= rtEn, `${slug}: VI (160wpm) must be ≥ EN (200wpm), got VI ${rtVi} vs EN ${rtEn}`);
  const exactEn = Math.max(1, Math.ceil(e.wordCount / 200));
  const exactVi = Math.max(1, Math.ceil(v.wordCount / 160));
  assert(rtEn === exactEn, `${slug}: EN exact ceil(w/200), expected ${exactEn}, got ${rtEn}`);
  assert(rtVi === exactVi, `${slug}: VI exact ceil(w/160), expected ${exactVi}, got ${rtVi}`);
  assert(postReadingTime(e) === rtEn, `${slug}: postReadingTime(entry) must match readingTime`);
  console.log(`  ${slug}: EN ${rtEn}m (${e.wordCount}w) · VI ${rtVi}m (${v.wordCount}w)`);
}

// ── relatedPosts ────────────────────────────────────────────────────────
console.log('relatedPosts:');
for (const current of all) {
  const rel = relatedPosts(current, all);
  assert(rel.length <= 3, `${current.id}: more than 3 related (${rel.length})`);
  assert(!rel.some((r) => r.id === current.id), `${current.id}: related contains itself`);
  assert(
    rel.every((r) => r.id.split('/')[0] === current.id.split('/')[0]),
    `${current.id}: cross-locale related leaked`,
  );
  assert(
    rel.every((r) => !r.data.draft),
    `${current.id}: draft leaked into related`,
  );
}
// Fallback chain — synthetic entry guarantees the deepest path deterministically:
// unique category + no shared tags + oldest pubDate → must fall through to
// latest-same-locale ×3. (Was pinned to 'building-wakii-in-the-open-log-1'
// "the only build-log post" — stale since FI-359 added log-2 + build-log
// case studies; the util itself was behaving correctly.)
const bLog = {
  id: 'en/__synthetic-fallback-probe__',
  data: { category: '__unique-cat__', tags: ['__no-such-tag__'], draft: false, pubDate: new Date('2000-01-01') },
};
const rel = relatedPosts(bLog, all).map((r) => r.id);
const latestThree = en
  .filter((p) => !p.data.draft)
  .sort((a, b) => b.data.pubDate - a.data.pubDate)
  .slice(0, 3)
  .map((p) => p.id);
assert(
  JSON.stringify(rel) === JSON.stringify(latestThree),
  `fallback chain: expected latest-3 ${JSON.stringify(latestThree)}, got ${JSON.stringify(rel)}`,
);
console.log(`  synthetic fallback probe (unique cat, no shared tags) → ${rel.join(', ')}`);

// ── author default ──────────────────────────────────────────────────────
console.log('author default:');
const withAuthor = all.filter((p) => p.author !== undefined);
assert(
  withAuthor.length === 0,
  `posts declare author in frontmatter (default path must stay exercised): ${withAuthor.map((p) => p.id).join(', ')}`,
);
assert(
  /author:\s*z\.string\(\)\.default\('Wakii team'\)/.test(configSrc),
  'content.config.ts must keep author: z.string().default(\'Wakii team\')',
);
console.log(`  ${all.length}/${all.length} posts omit author → schema default "Wakii team" (literal pinned in content.config.ts)`);

if (failures > 0) {
  console.error(`✗ blog utils FAILED (${failures} assertion${failures === 1 ? '' : 's'})`);
  process.exit(1);
}
console.log('✓ blog utils OK (readingTime / relatedPosts / author default)');
