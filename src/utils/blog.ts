/**
 * Blog content utils — shared computed helpers (story FI-349 SF-1).
 *
 * SELF-CONTAINED on purpose: this module must stay importable from plain
 * node scripts (scripts/check-blog-utils.mjs runs it under node's native
 * TS stripping), so it must NOT import from 'astro:content' or
 * src/content.config.ts. Blog ids carry the locale prefix ('en/slug' |
 * 'vi/slug') — the same convention as blogLocale()/blogSlug() in
 * content.config.ts, re-declared here without the astro:content dependency.
 */

/** Reading speed per locale — pinned in spec FI-349 rev 3 common rules. */
const WPM: Record<'en' | 'vi', number> = { en: 200, vi: 160 };

function localeOf(id: string): 'en' | 'vi' {
  return id.startsWith('vi/') ? 'vi' : 'en';
}

function slugOf(id: string): string {
  return id.replace(/^(en|vi)\//, '');
}

export function blogLocaleOf(id: string): 'en' | 'vi' {
  return localeOf(id);
}

export function blogSlugOf(id: string): string {
  return slugOf(id);
}

/** Strip a leading frontmatter block if one is still attached to the body. */
function stripFrontmatter(md: string): string {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/**
 * Reading time in whole minutes: whitespace word count ÷ per-locale WPM,
 * rounded UP, minimum 1. Input is the markdown body (frontmatter tolerated
 * and stripped).
 */
export function readingTime(body: string, locale: 'en' | 'vi'): number {
  const words = stripFrontmatter(body).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WPM[locale]));
}

/** Convenience wrapper: entry-shaped input ({ id, body }) → minutes. */
export function postReadingTime(entry: { id: string; body: string }): number {
  return readingTime(entry.body, localeOf(entry.id));
}

/** Structural slice of a blog entry the related algorithm needs. */
export interface RelatedEntry {
  id: string;
  data: {
    category: string;
    tags: string[];
    draft: boolean;
    pubDate: Date;
  };
}

/**
 * Related posts, priority fill-chain (spec FI-349 rev 3 SF-1 pin):
 *   tier 1  same category            (latest first)
 *   tier 2  ≥ 1 shared tag           (latest first, other categories only)
 *   tier 3  latest in the same locale
 * Tiers FILL the list until `max` — an entry seen in an earlier tier is
 * never repeated; same locale and draft:false hold for every tier; the
 * current post itself is always excluded. Max 3 by default; a shorter
 * pool yields a shorter list (callers hide the section when empty).
 */
export function relatedPosts<T extends RelatedEntry>(current: T, all: T[], max = 3): T[] {
  const locale = localeOf(current.id);
  const pool = all
    .filter((e) => localeOf(e.id) === locale)
    .filter((e) => !e.data.draft && e.id !== current.id)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const sameCategory = pool.filter((e) => e.data.category === current.data.category);
  const sharedTags = pool.filter(
    (e) => e.data.category !== current.data.category && e.data.tags.some((t) => current.data.tags.includes(t)),
  );

  const picked: T[] = [];
  const seen = new Set<string>([current.id]);
  for (const tier of [sameCategory, sharedTags, pool]) {
    for (const e of tier) {
      if (picked.length >= max) return picked;
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      picked.push(e);
    }
  }
  return picked;
}
