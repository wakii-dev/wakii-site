/**
 * Release resolution (VU-9 SF-3, D5) — THE single source of truth for
 * version / published date / download URLs on the site. Components
 * consume `getRelease()`; they never import DOWNLOAD_URLS or
 * MOBILE_STORE_URLS directly (consumers-rewire exit: zero direct
 * consumers outside this module).
 *
 * Mechanism (build-time — static output, frontmatter awaits this):
 *   1. fetch GitHub API `releases/latest` (one call per process, 3s
 *      timeout — unauthenticated 60/hr is plenty for one build);
 *   2. per-asset validation: the expected file name (constructed from
 *      the fetched tag via RELEASE_ASSET_FILES) must exist as an asset
 *      on that SAME response — otherwise that target falls back to its
 *      pinned URL;
 *   3. fetch failure (offline, rate-limit, bad payload) → the whole pin
 *      (LATEST_RELEASE) is used, so a build never breaks and the page
 *      never advertises a 404: a target missing from BOTH fetched and
 *      pinned data resolves to `source: 'none'` and the component hides
 *      that button (honest absence, per accuracy gate).
 *
 * Artifact: the first resolve of a production build writes
 * `dist/release-meta.json` (version + tag + publishedAt + source +
 * fetchedAt + resolved assets) so a verifier can cross-check the
 * rendered page against exactly what the build resolved. Best-effort:
 * an artifact write failure never fails the build.
 */
import {
  LATEST_RELEASE,
  MOBILE_STORE_URLS,
  RELEASE_ASSET_FILES,
  RELEASE_PIN_URLS,
  REPO_URL,
  type ReleaseAssetKey,
} from '../config';

export type ResolvedSource = 'fetched' | 'pinned' | 'none';

export interface ReleaseAsset {
  /** Download URL — null means "not available": render no button. */
  url: string | null;
  /** Asset file name as shipped on the release (button `fname` line). */
  name: string | null;
  source: ResolvedSource;
}

export interface ReleaseInfo {
  /** Release version without the leading `v` (e.g. `1.4.213`). */
  version: string | null;
  tag: string | null;
  /** ISO timestamp from the release, or the pin's date (date-only). */
  publishedAt: string | null;
  /** Where version/tag came from: the live fetch or the pin. */
  source: 'fetched' | 'pinned';
  assets: Record<ReleaseAssetKey, ReleaseAsset>;
  /**
   * App Store URL (not release-resolvable) — passthrough from config;
   * empty string → null so consumers can truthiness-check.
   */
  mobileIos: string | null;
}

const API_URL = `${REPO_URL.replace('https://github.com', 'https://api.github.com/repos')}/releases/latest`;
const FETCH_TIMEOUT_MS = 3000;

interface GithubReleasePayload {
  tag_name?: unknown;
  published_at?: unknown;
  assets?: { name?: unknown; browser_download_url?: unknown }[];
}

function toAsset(url: string | null, source: ResolvedSource): ReleaseAsset {
  return { url, name: url ? url.split('/').pop() || null : null, source };
}

function pinAsset(key: ReleaseAssetKey): ReleaseAsset {
  const url = RELEASE_PIN_URLS[key] || null;
  return toAsset(url, url ? 'pinned' : 'none');
}

function pinRelease(): ReleaseInfo {
  return {
    version: LATEST_RELEASE.version || null,
    tag: LATEST_RELEASE.tag || null,
    publishedAt: LATEST_RELEASE.publishedAt || null,
    source: 'pinned',
    assets: {
      macosArm64: pinAsset('macosArm64'),
      macosX64: pinAsset('macosX64'),
      windows: pinAsset('windows'),
      androidApk: pinAsset('androidApk'),
    },
    mobileIos: MOBILE_STORE_URLS.ios || null,
  };
}

async function fetchLatestRelease(): Promise<ReleaseInfo> {
  const res = await fetch(API_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'wakii-site (static site build)',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`github api ${res.status}`);
  const body = (await res.json()) as GithubReleasePayload;
  const tag = typeof body.tag_name === 'string' && body.tag_name ? body.tag_name : null;
  if (!tag) throw new Error('github api response without tag_name');
  const version = tag.replace(/^v/, '');
  const publishedAt = typeof body.published_at === 'string' ? body.published_at : null;

  const byName = new Map<string, string>();
  for (const asset of body.assets ?? []) {
    if (typeof asset.name === 'string' && typeof asset.browser_download_url === 'string') {
      byName.set(asset.name, asset.browser_download_url);
    }
  }

  const resolveAsset = (key: ReleaseAssetKey): ReleaseAsset => {
    const expected = RELEASE_ASSET_FILES[key](version);
    const hit = byName.get(expected);
    if (hit) return toAsset(hit, 'fetched');
    return pinAsset(key); // asset missing/renamed → pinned URL for this target
  };

  return {
    version: version || null,
    tag,
    publishedAt,
    source: 'fetched',
    assets: {
      macosArm64: resolveAsset('macosArm64'),
      macosX64: resolveAsset('macosX64'),
      windows: resolveAsset('windows'),
      androidApk: resolveAsset('androidApk'),
    },
    mobileIos: MOBILE_STORE_URLS.ios || null,
  };
}

async function writeArtifact(info: ReleaseInfo): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return; // dev server: no dist writes
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const dir = join(process.cwd(), 'dist');
    await mkdir(dir, { recursive: true });
    const meta = {
      version: info.version,
      tag: info.tag,
      publishedAt: info.publishedAt,
      source: info.source,
      fetchedAt: new Date().toISOString(),
      assets: info.assets,
    };
    await writeFile(join(dir, 'release-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  } catch {
    // best-effort artifact — never fail a build over it
  }
}

let inflight: Promise<ReleaseInfo> | null = null;

/**
 * Resolved release for this build. Memoized per process — parallel page
 * renders share one fetch (one GitHub API call per build).
 */
export function getRelease(): Promise<ReleaseInfo> {
  if (!inflight) {
    inflight = (async () => {
      let info: ReleaseInfo;
      try {
        info = await fetchLatestRelease();
      } catch (err) {
        // fetch fail/timeout/bad payload → full pin; the reason is logged
        // so a pinned (stale-looking) build is never silent about why.
        console.warn(`[release] github fetch failed — using pin ${LATEST_RELEASE.tag}:`, err);
        info = pinRelease();
      }
      await writeArtifact(info);
      return info;
    })();
  }
  return inflight;
}
