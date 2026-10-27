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
    version: "0.7.1",
    title: "npm ecosystem wave — starter renamed, slots everywhere, presets",
    description:
      "The starter repo is now wakii-dev/microservice_microfrontend_starter. @wakii/ui-kit 0.7.1 brings classNames slots + style passthrough to all 113 components (870+ Storybook stories, animated npm README); create-wakii-app adds a preset system — demo/minimal/product/admin/landing with vite/next/astro variants; create-wakii-stack 0.1.11 hardens kafka-init topic creation and documents the seeded demo accounts. VU-53 UI redesign epic is done: 3D landing, kanban, realtime activity.",
    releaseNotesUrl:
      "https://www.npmjs.com/package/@wakii/ui-kit",
  },
  {
    version: "1.4.227",
    title: "Wakii 1.4.227",
    description:
      "Kit now spawns claude following Wakii's Agent Permissions setting — the blanket bypass ban is lifted in favor of per-user choice.",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.227",
  },
  {
    version: "1.4.226",
    title: "Wakii 1.4.226",
    description:
      "Updater changelog fetch now points at wakii.xyz — in-app release notes ride the same domain as the site.",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.226",
  },
  {
    version: "1.4.225",
    title: "Wakii 1.4.225",
    description: "Maintenance cut — release bump, no user-facing changes.",
    releaseNotesUrl:
      "https://github.com/wakii-dev/wakii/releases/tag/v1.4.225",
  },
  {
    version: "0.5.0",
    title: "npm ecosystem — ui-kit 0.5.0 + create-wakii-app / stack",
    description:
      "Ecosystem ships on npm: @wakii/ui-kit 0.5.0 (dist exports, subpaths, Experience3D), create-wakii-app 0.1.2 (CRA-style starter) and create-wakii-stack 0.1.5 (full-stack scaffold, verified end-to-end).",
    releaseNotesUrl:
      "https://www.npmjs.com/package/@wakii/ui-kit",
  },
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
