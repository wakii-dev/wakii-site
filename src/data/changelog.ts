/**
 * Changelog data — served at /whats-new/changelog.json for the Wakii app's
 * update card ("What's new" showcase). Schema mirrors the app's ChangelogEntry
 * (src/main/updater-changelog.ts): version | title | description | mediaUrl? |
 * releaseNotesUrl. Entries WITHOUT mediaUrl never render as the rich showcase
 * card — the app falls back to the plain card with the fork release link.
 *
 * Add an entry per release (newest first). mediaUrl: gif/screenshot demoing
 * the release highlight; when present the app shows the rich card with
 * releasesBehind counting.
 */

export interface ChangelogEntry {
  version: string;
  title: string;
  description: string;
  mediaUrl?: string;
  releaseNotesUrl: string;
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "1.4.224",
    title: "Wakii 1.4.224",
    description:
      "Updater now checks Wakii's own releases end-to-end: readiness manifest matches uploaded assets, and release links point to wakii-dev/wakii.",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.224",
  },
  {
    version: "1.4.223",
    title: "Wakii 1.4.223",
    description:
      "In-app updater reads its release feed from the packaged app-update.yml — Wakii releases are no longer invisible to the update check.",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.223",
  },
  {
    version: "1.4.222",
    title: "Wakii 1.4.222",
    description:
      "Kit 2.22: HITL pane-watch, BA Layer, --local mode, driver hardening (PR #129/#134/#135).",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.222",
  },
];
