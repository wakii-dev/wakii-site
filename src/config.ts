/**
 * Central site config — single source of truth.
 */

/**
 * Public repository URL (CTA "Get Wakii — build from source", footer).
 *
 * PLACEHOLDER — the fork is currently private.
 * SF-4 pre-publish checklist MUST confirm/replace this before the site goes public.
 * All links must reference this constant, never a hardcoded URL.
 */
export const REPO_URL = 'https://github.com/wakii/wakii';

/**
 * Canonical site URL (sitemap, robots.txt, OG base).
 * PLACEHOLDER — SF-4 pre-publish confirms the production domain.
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

/**
 * ── Direct downloads + mobile connect (story FI-300, SF-1 foundation) ──
 *
 * FLAG FLIP = USER/MANUAL ONLY — agents must never flip these.
 *
 * Runbook — ALL preconditions must hold before flipping DOWNLOADS_LIVE:
 *   (i)   repo is PUBLIC (it is private now — release URLs 404 for
 *         anonymous visitors on a private repo),
 *   (ii)  a GitHub release EXISTS and the assets below match the real
 *         asset names (current names are placeholders — confirm the real
 *         names at release time and update this map),
 *   (iii) the unsigned binaries actually RUN on both OSes.
 *
 * URL pattern is pinned to `releases/latest/download/<asset>` (no version
 * constant) so a flip is a one-line change, not a version chase.
 */
export const DOWNLOADS_LIVE = false;

export const DOWNLOAD_URLS: { macos: string; windows: string } = {
  macos: 'https://github.com/wakii/wakii/releases/latest/download/Wakii.dmg',
  windows:
    'https://github.com/wakii/wakii/releases/latest/download/WakiiSetup.exe',
};

/**
 * Mobile live gate — same runbook discipline as DOWNLOADS_LIVE.
 * Store channels do not exist yet: values stay EMPTY until the app is
 * published, then fill in the real store URLs (App Store / Google Play).
 */
export const MOBILE_LIVE = false;

export const MOBILE_STORE_URLS: { ios: string; android: string } = {
  ios: '',
  android: '',
};
