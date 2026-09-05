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
 * Flag flips remain USER/MANUAL decisions — flipped by explicit user
 * instruction on 2026-09-05 against release v1.4.198 on wakii-dev/wakii
 * (Android APK followed via the mobile-android-v0.0.48 pre-release).
 *
 * State at flip:
 *   (i)   repo is PUBLIC ✓,
 *   (ii)  release EXISTS, URLs point at the real assets ✓,
 *   (iii) macOS + Android builds run (user-verified).
 *
 * WINDOWS: empty string = pending — components render an honest "soon"
 * cell. The `orca-windows-setup.exe` asset in v1.4.198 is deliberately
 * NOT linked (orca-branded; release notes mark Windows ⛔ until a real
 * Windows-host build exists).
 *
 * URL pattern: v1.4.198 switched to VERSION-NAMED assets, so URLs pin an
 * exact release — a version bump means updating these two lines.
 */
export const DOWNLOADS_LIVE = true;

export const DOWNLOAD_URLS: { macos: string; windows: string } = {
  macos: `${REPO_URL}/releases/download/v1.4.198/Wakii-1.4.198-arm64.dmg`,
  windows: '',
};

/**
 * Mobile live gate — per-OS partial fill (G-A2): an empty URL renders the
 * honest coming-soon badge, a filled one becomes the real link (and the
 * QR target). Android ships as a GitHub-release APK (sideload, no store).
 */
export const MOBILE_LIVE = true;

export const MOBILE_STORE_URLS: { ios: string; android: string } = {
  ios: '',
  android: `${REPO_URL}/releases/download/mobile-android-v0.0.48/app-release.apk`,
};
