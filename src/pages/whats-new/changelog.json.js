import { changelogEntries } from '../../data/changelog';

/**
 * GET /whats-new/changelog.json — consumed by the Wakii app's updater
 * (src/main/updater-changelog.ts) for the update-available "What's new"
 * card. Array of ChangelogEntry, newest first; the app picks the exact
 * incoming version when it has media, else the newest rich entry.
 */
export async function GET() {
  return new Response(JSON.stringify(changelogEntries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
