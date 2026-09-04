/**
 * Central site config — single source of truth.
 */

/**
 * Public repository URL (CTA "Get Wakii — build from source", footer).
 *
 * CONFIRMED by user — SF-4 pre-publish gate 2 (2026-09-04, FI-293).
 * All links must reference this constant, never a hardcoded URL.
 */
export const REPO_URL = 'https://github.com/wakii/wakii';

/**
 * Canonical site URL (sitemap, robots.txt, OG base).
 * CONFIRMED by user — SF-4 pre-publish gate 2 (2026-09-04, FI-293).
 */
export const SITE_URL = 'https://wakii.dev';

export const SITE_NAME = 'wakii';

/**
 * Doc slug contract — LOCKED at SF-1 (SF-2 teaser links + SF-3 docs build on it).
 */
export const DOC_SLUGS = [
  'getting-started',
  'superpowers-panel',
  'story-workflow',
  'agents-and-kit',
  'faq',
] as const;

export type DocSlug = (typeof DOC_SLUGS)[number];

export const SITE_TAGLINE = 'Agentic IDE with a built-in superpowers team';
