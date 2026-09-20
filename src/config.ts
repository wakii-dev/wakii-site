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
 * Production domain — confirmed by owner 2026-09-07 (wakii.xyz, not .dev).
 */
export const SITE_URL = 'https://wakii.xyz';

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
 * ── Direct downloads + mobile connect (story FI-300, SF-1 foundation;
 * VU-9 SF-3 rewire) ──
 *
 * VU-9 SF-3 (D5): download URLs are RESOLVED AT BUILD TIME by
 * src/utils/release.ts — one GitHub API `releases/latest` fetch per
 * build (3s timeout), every asset name validated against that SAME
 * response, falling back to the pin below when the fetch or an asset
 * is missing. THIS file holds the pin: bump `LATEST_RELEASE` +
 * `RELEASE_PIN_URLS` when a release is dropped (single place —
 * `DOWNLOAD_URLS` / `MOBILE_STORE_URLS.android` derive from them).
 * Each build records what it resolved in `dist/release-meta.json`.
 * Components never import DOWNLOAD_URLS / MOBILE_STORE_URLS directly —
 * they consume the release module (consumers-rewire exit: zero direct
 * consumers outside src/utils/release.ts).
 *
 * Flag flips remain USER/MANUAL decisions — flipped by explicit user
 * instruction on 2026-09-05 against release v1.4.198 on wakii-dev/wakii.
 *
 * State at flip:
 *   (i)   repo is PUBLIC ✓,
 *   (ii)  release EXISTS, URLs point at the real assets ✓,
 *   (iii) macOS + Android builds run (user-verified).
 *
 * WINDOWS: linked to the `orca-windows-setup.exe` asset (user
 * instruction 2026-09-05 — the file is live on the release even though
 * the asset name still carries orca branding). An empty string would
 * render the per-OS "soon" cell instead.
 */
export const DOWNLOADS_LIVE = true;

/**
 * Fallback pin (D5) — used when the build-time GitHub fetch fails or a
 * release asset is missing/renamed. v1.4.205 was the last hand-pinned
 * cut (2026-09-12; the same release first shipped the Android APK —
 * newer than the mobile-android-v0.0.48 pre-release).
 */
export const LATEST_RELEASE = {
  tag: 'v1.4.205',
  version: '1.4.205',
  publishedAt: '2026-09-12',
} as const;

/**
 * Asset matrix (D5) — expected asset FILE names on a release, per
 * download target. dmg assets are version-named (`Wakii-<v>-*.dmg`,
 * pattern since v1.4.198); the Windows installer + Android APK keep
 * static names. Validation: the constructed name must exist on the
 * SAME `releases/latest` response, else the pin below is used for that
 * target; a missing pin hides the button (never advertise a 404).
 */
export const RELEASE_ASSET_FILES = {
  macosArm64: (version: string) => `Wakii-${version}-arm64.dmg`,
  macosX64: (version: string) => `Wakii-${version}-x64.dmg`,
  windows: (_version: string) => 'orca-windows-setup.exe',
  androidApk: (_version: string) => 'app-release.apk',
} as const;

export type ReleaseAssetKey = keyof typeof RELEASE_ASSET_FILES;

/** Pinned download URL — the per-target fallback (D5). */
export const RELEASE_PIN_URLS: Record<ReleaseAssetKey, string> = {
  macosArm64: `${REPO_URL}/releases/download/v1.4.205/Wakii-1.4.205-arm64.dmg`,
  macosX64: `${REPO_URL}/releases/download/v1.4.205/Wakii-1.4.205-x64.dmg`,
  windows: `${REPO_URL}/releases/download/v1.4.205/orca-windows-setup.exe`,
  androidApk: `${REPO_URL}/releases/download/v1.4.205/app-release.apk`,
};

/**
 * Derived fallback URLs — flag-era contract kept (same shape as before
 * VU-9 SF-3); values ARE the pins above (single source of truth).
 */
export const DOWNLOAD_URLS: { macos: string; windows: string } = {
  macos: RELEASE_PIN_URLS.macosArm64,
  windows: RELEASE_PIN_URLS.windows,
};

/**
 * Mobile live gate — per-OS partial fill (G-A2): an empty URL renders the
 * honest coming-soon badge, a filled one becomes the real link (and the
 * QR target). Android ships as a GitHub-release APK (sideload, no store).
 */
export const MOBILE_LIVE = true;

export const MOBILE_STORE_URLS: { ios: string; android: string } = {
  ios: '',
  android: RELEASE_PIN_URLS.androidApk,
};
