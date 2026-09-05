/**
 * Central site config — single source of truth.
 */

/**
 * Public repository URL (CTA "Get Wakii — build from source", footer,
 * release asset base for DOWNLOAD_URLS).
 *
 * Public repo — confirmed 2026-09-05 (was the `wakii/wakii` placeholder,
 * which never existed). All links must reference this constant, never a
 * hardcoded URL.
 */
export const REPO_URL = 'https://github.com/wakii-dev/wakii';

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
 * Flag flips remain USER/MANUAL decisions — this one was flipped by explicit
 * user instruction on 2026-09-05 (release v1.4.197 on wakii-dev/wakii).
 *
 * State at flip:
 *   (i)   repo is PUBLIC ✓,
 *   (ii)  release EXISTS, `Wakii.dmg` matches the real asset ✓,
 *   (iii) macOS build runs (user-verified locally); **WINDOWS PENDING** —
 *         no `WakiiSetup.exe` asset yet, so the Windows button 404s until
 *         a Windows build lands in the release. Accepted at flip time.
 *
 * URL pattern is pinned to `releases/latest/download/<asset>` (no version
 * constant) so a bump is a re-upload of the asset, not a version chase.
 */
export const DOWNLOADS_LIVE = true;

export const DOWNLOAD_URLS: { macos: string; windows: string } = {
  macos: `${REPO_URL}/releases/latest/download/Wakii.dmg`,
  windows: `${REPO_URL}/releases/latest/download/WakiiSetup.exe`,
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
