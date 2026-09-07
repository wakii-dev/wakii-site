#!/usr/bin/env node
/**
 * Build-time assertion: blog slug parity across locales (contract FI-339).
 *
 * The blog collection uses locale subdirectories (src/content/blog/en/*.md,
 * src/content/blog/vi/*.md) and the i18n contract is LOCKED: EN and VI slug
 * sets must match 1:1 — hreflang pairs and the /vi/blog/ routes are derived
 * from the same slugs. A mismatch fails the build before `astro build` runs.
 *
 * 0 posts in BOTH locales is a pass (vacuous) — seeding (SF-2) makes the
 * check non-vacuous.
 */
import { existsSync, readdirSync } from 'node:fs';
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

console.log(
  `✓ blog slug parity OK (${en.length} post${en.length === 1 ? '' : 's'} × 2 locales)`
);
