#!/usr/bin/env node
/**
 * Build-time assertion: blog slug parity across locales (contract FI-339).
 *
 * The blog collection uses locale subdirectories (src/content/blog/en/*.md,
 * src/content/blog/vi/*.md) and the i18n contract is LOCKED: EN and VI slug
 * sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
 * from the same slugs. A mismatch fails the build before `astro build` runs.
 *
 * Schema parity (story FI-349 SF-1): the newer frontmatter fields must also
 * match 1:1 — `heroImage` presence AND value (VI mirrors share the EN hero),
 * `author` presence. Ordinary prose fields (title/description/tags) stay
 * free to differ per locale.
 *
 * 0 posts in BOTH locales is a pass (vacuous) — seeding (SF-2) makes the
 * check non-vacuous.
 *
 * Category ROUTES parity (story FI-349 SF-4): with `--dist` the src checks
 * above run first, then every BLOG_CATEGORIES route must exist in dist/
 * (EN + VI, all-or-nothing). Routes only exist post-build, so this mode is
 * a verify-step, NOT part of the build gate (`pnpm build` keeps running the
 * src-only pass; without the flag behaviour is unchanged).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = join(root, 'src', 'content', 'blog');

/** Slugs of one locale — mirrors the collection pattern `en/*.md` / `vi/*.md`. */
function slugs(locale) {
  const dir = join(blogDir, locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

/** Frontmatter field of one post file, quotes stripped (undefined when absent). */
function frontmatterField(locale, slug, field) {
  const raw = readFileSync(join(blogDir, locale, `${slug}.md`), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return undefined;
  const m = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

const en = slugs('en');
const vi = slugs('vi');

const missingInVi = en.filter((s) => !vi.includes(s));
const missingInEn = vi.filter((s) => !en.includes(s));

if (missingInVi.length > 0 || missingInEn.length > 0) {
  console.error('✗ blog slug parity FAILED (src/content/blog/):');
  if (missingInVi.length > 0) console.error(`  missing in vi/: ${missingInVi.join(', ')}`);
  if (missingInEn.length > 0) console.error(`  missing in en/: ${missingInEn.join(', ')}`);
  console.error('  EN and VI slug sets must be identical (locked i18n contract).');
  process.exit(1);
}

// Schema parity for the fields introduced in FI-349 (spec SF-1). Both
// directions must agree on PRESENCE; heroImage must additionally agree on
// VALUE — the VI mirror shares the EN hero file path.
const schemaDrift = [];
for (const slug of en) {
  for (const field of ['heroImage', 'author']) {
    const enVal = frontmatterField('en', slug, field);
    const viVal = frontmatterField('vi', slug, field);
    if ((enVal === undefined) !== (viVal === undefined)) {
      schemaDrift.push(`${slug}: ${field} declared in ${enVal !== undefined ? 'en' : 'vi'} only`);
    } else if (field === 'heroImage' && enVal !== viVal) {
      schemaDrift.push(`${slug}: heroImage differs (en "${enVal}" vs vi "${viVal}") — VI shares the EN hero`);
    }
  }
}

if (schemaDrift.length > 0) {
  console.error('✗ blog schema parity FAILED (new frontmatter fields, FI-349):');
  for (const d of schemaDrift) console.error(`  ${d}`);
  process.exit(1);
}

console.log(
  `✓ blog slug parity OK (${en.length} post${en.length === 1 ? '' : 's'} × 2 locales, schema fields heroImage/author in sync)`
);

// ── --dist: category ROUTES exist in the build output (SF-4, all-or-nothing) ──
if (process.argv.includes('--dist')) {
  const distDir = join(root, 'dist');
  // Derive from the label map — the one-directional source categories.ts
  // itself uses (BLOG_CATEGORIES = Object.keys(CATEGORY_LABELS.en)).
  // Importing categories.ts here breaks: its `from '../../i18n/categories'`
  // is extensionless (fine for Astro/Vite, unresolvable by bare node ESM).
  const { CATEGORY_LABELS } = await import(new URL('../src/i18n/categories.ts', import.meta.url));
  const categories = Object.keys(CATEGORY_LABELS.en);

  const missing = [];
  for (const cat of categories) {
    for (const route of [`blog/category/${cat}/index.html`, `vi/blog/category/${cat}/index.html`]) {
      if (!existsSync(join(distDir, ...route.split('/')))) missing.push(route);
    }
  }

  if (missing.length > 0) {
    console.error('✗ blog category routes FAILED (dist/):');
    for (const route of missing) console.error(`  missing dist/${route}`);
    process.exit(1);
  }
  const total = categories.length * 2;
  console.log(`✓ blog category routes OK (${total}/${total} present in dist/)`);
}
