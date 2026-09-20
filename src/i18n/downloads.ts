/**
 * Downloads + mobile-connect strings — story FI-300 SF-1 pre-add.
 *
 * KEY-OWNERSHIP RULE: SF-1 owns this file. After SF-1, SF-2/SF-3 must NOT
 * add new keys here — a missing key is flagged to the epic
 * (pattern: landing.ts pre-add, story FI-294). VU-9 SF-1 added the
 * `upgrade` group (design hand-off:
 * docs/superpowers/designs/ux-funnel-direction.md — supersedes
 * sf-downloads-direction.md for /download surfaces); SF-3 consumes it.
 *
 * Every flag-conditional key carries BOTH variants under `live` /
 * `notLive` (gate G-D) so a flag flip can never surface unreviewed copy.
 * The `upgrade` group follows the same split by STATE: upgrade.mobile.*
 * is the honest not-live wording — when MOBILE_LIVE flips true, the page
 * falls back to the `mobile.*` store-link keys instead. Version/date/
 * asset names render from the SF-3 resolution module (never hardcoded
 * here); `publishedLabel`/`pillSuffix` are the only copy fragments.
 * VI is a draft — final approval happens at the convergence gate (SF-4).
 *
 * Gates baked into this copy (spec 2026-09-04-site-downloads-mobile.md):
 *   G-C  capabilities — exactly the 3 user-approved, nothing more
 *   G-I  unsigned-binary warn — per-OS, live variant only (also baked
 *        into upgrade.primary/windows feet — keep them on every CTA)
 *   G-QR QR caption — safe claim only ("get the app, connect in-app");
 *        rendered exclusively in the live variant
 */

export interface DownloadStrings {
  lang: 'en' | 'vi';
  page: {
    title: string;
    kicker: string;
    h2: string;
    /** SEO meta + sub are flag-conditional too — "installers for macOS &
     *  Windows" is only a true statement when DOWNLOADS_LIVE (review P2). */
    live: { description: string; sub: string };
    notLive: { description: string; sub: string };
  };
  desktop: {
    label: string;
    tabMacos: string;
    tabWindows: string;
    /** flag=true — real download buttons + unsigned warn (G-I) */
    live: {
      btnMacos: string;
      btnWindows: string;
      warnMacos: string;
      warnWindows: string;
      sourceAlt: string;
    };
    /** flag=false — no buttons; build-from-source prominent + follow releases */
    notLive: {
      note: string;
      buildFromSource: string;
      followReleases: string;
    };
    nightly: {
      title: string;
      desc: string;
      btn: string;
      warn: string;
    };
  };
  mobile: {
    label: string;
    title: string;
    sub: string;
    badgeIos: string;
    badgeAndroid: string;
    capsIntro: string;
    caps: string[];
    /** flag=true — QR rendered (G-QR: encode store page, never pairing) */
    live: {
      qrCaption: string;
    };
    /** flag=false — badges honest, no store links, no QR */
    notLive: {
      comingSoon: string;
      followUpdates: string;
    };
  };
  /** Landing mobile teaser (SF-3 placement, component from SF-2) */
  teaser: {
    kicker: string;
    title: string;
    sub: string;
    cta: string;
  };
  /** VU-9 SF-1 pre-add — /download upgrade ("Terminal Conveyor" direction):
   *  one primary action + real version + first-run strip. Structure lives in
   *  the design hand-off (docs/superpowers/designs/ux-funnel-direction.md);
   *  SF-3 wires it. Version/date/URLs come from the resolution module —
   *  only the copy fragments below live here. */
  upgrade: {
    head: { title: string; lead: string; micro: string };
    version: {
      label: string;
      pillSuffix: string;
      publishedLabel: string;
      notesLink: string;
      foot: string;
    };
    primary: {
      label: string;
      btnArm64: string;
      tagArm64: string;
      btnX64: string;
      or: string;
      note: string;
      foot: string;
    };
    windows: { label: string; btn: string; orcaNote: string; foot: string };
    linux: { label: string; meta: string; body: string; btn: string; foot: string };
    /** honest not-live wording — MOBILE_LIVE=true renders `mobile.*` instead */
    mobile: { label: string; meta: string; body: string; btn: string; apkFoot: string };
    firstRun: {
      label: string;
      meta: string;
      steps: { n: string; title: string; desc: string }[];
      cta: string;
      foot: string;
    };
    osChip: string;
    archYours: string;
    mainWindowSlot: { name: string; hint: string };
  };
}

export const en: DownloadStrings = {
  lang: 'en',
  page: {
    title: 'Download',
    kicker: 'download',
    h2: 'get wakii',
    live: {
      description:
        'Get Wakii — download installers for macOS and Windows, or build from source. Mobile apps for iOS and Android.',
      sub: 'Installers for macOS and Windows, or build from source — and a mobile companion for your agent team.',
    },
    notLive: {
      description:
        'Get Wakii — build from source for now, installers are on the roadmap. Mobile apps for iOS and Android.',
      sub: 'Wakii is built from source for now (installers are on the roadmap) — and a mobile companion for your agent team is coming.',
    },
  },
  desktop: {
    label: 'desktop',
    tabMacos: 'macOS',
    tabWindows: 'Windows',
    live: {
      btnMacos: 'download for macOS',
      btnWindows: 'download for Windows',
      warnMacos:
        'Unsigned build — macOS apps outside the App Store need to be allowed in System Settings → Privacy & Security.',
      warnWindows:
        'Unsigned build — SmartScreen may show a warning. Choose "Run anyway".',
      sourceAlt: 'Prefer building yourself? Build from source.',
    },
    notLive: {
      note: 'Installers are not available yet — for now, Wakii is built from source. It takes a few minutes and always matches the docs.',
      buildFromSource: 'build from source',
      followReleases: 'follow releases on github',
    },
    nightly: {
      title: 'Nightly build — for power users',
      desc: 'Rolling daily build from the development branch. May break at any time — stable channel remains the default.',
      btn: 'grab the nightly',
      warn: 'Unstable by design — report anything odd as an issue.',
    },
  },
  mobile: {
    label: 'mobile connect',
    title: 'your team, in your pocket',
    sub: 'A companion app for iOS and Android — work with your agents from anywhere via QR pairing.',
    badgeIos: 'iOS',
    badgeAndroid: 'Android',
    capsIntro: 'The mobile app lets you:',
    caps: [
      'See your running agent sessions',
      'Approve gates from your phone',
      'Send tasks to your team',
    ],
    live: {
      qrCaption: 'Scan to get the app — then connect from inside the app.',
    },
    notLive: {
      comingSoon: 'Mobile apps are coming soon.',
      followUpdates: 'follow updates',
    },
  },
  teaser: {
    kicker: 'mobile',
    title: 'wakii in your pocket',
    sub: 'A companion app for iOS and Android — check on your agents, approve gates, and send tasks from anywhere.',
    cta: 'about the mobile app',
  },
  upgrade: {
    head: {
      title: 'Get Wakii.',
      lead: 'One button for your machine. Everything else is here so nobody has to hunt — including the honest caveats.',
      micro: 'free · open source · unsigned build',
    },
    version: {
      label: 'version',
      pillSuffix: 'latest',
      publishedLabel: 'published',
      notesLink: 'release notes & older builds',
      foot: 'this page tracks the latest release, not a pinned one',
    },
    primary: {
      label: 'macos — primary download',
      btnArm64: 'get wakii — apple silicon',
      tagArm64: 'recommended · most macs',
      btnX64: 'mac with intel',
      or: 'or',
      note: 'Not sure which chip? Apple silicon = M-series. When in doubt, take arm64.',
      foot: 'unsigned build — first launch: System Settings → Privacy & Security → Open Anyway',
    },
    windows: {
      label: 'windows',
      btn: 'get wakii for windows',
      orcaNote: 'The installer keeps its original orca name — same app, Wakii inside.',
      foot: 'unsigned build — SmartScreen: More info → Run anyway',
    },
    linux: {
      label: 'linux',
      meta: 'build from source',
      body: 'No packaged Linux binary yet. Clone the repo and build — same app, same kit, same gates.',
      btn: 'build from source',
      foot: 'no installer — source only (for now)',
    },
    mobile: {
      label: 'mobile',
      meta: 'soon',
      body: 'iOS and Android apps are coming soon. No store links yet — this cell is the honest placeholder, not a teaser.',
      btn: 'app stores — soon',
      apkFoot: 'android tinkerers: raw app-release.apk ships in releases — unsigned',
    },
    firstRun: {
      label: 'first run — three steps after install',
      meta: '→ /docs/getting-started/',
      steps: [
        { n: '01', title: 'open a project', desc: 'Any folder. Wakii opens it like the editor you already know.' },
        { n: '02', title: 'kit auto-installs', desc: 'The superpowers kit lands in ~/.claude on first run.' },
        { n: '03', title: 'describe your first idea', desc: 'Type /superpowers "…" and the team picks it up.' },
      ],
      cta: 'read getting-started',
      foot: "~/.claude — the kit's home; nothing to configure by hand",
    },
    osChip: '→ for your machine',
    archYours: '→ matches your mac',
    mainWindowSlot: {
      name: 'main window',
      hint: "what you'll see right after install — project open, team online",
    },
  },
};

export const vi: DownloadStrings = {
  lang: 'vi',
  page: {
    title: 'Tải xuống',
    kicker: 'tải xuống',
    h2: 'tải wakii',
    live: {
      description:
        'Tải Wakii — bản cài cho macOS và Windows, hoặc build từ mã nguồn. App mobile cho iOS và Android.',
      sub: 'Bản cài cho macOS và Windows, hoặc build từ mã nguồn — kèm app mobile đồng hành cho team agent của bạn.',
    },
    notLive: {
      description:
        'Tải Wakii — hiện tại build từ mã nguồn, bản cài nằm trong roadmap. App mobile cho iOS và Android.',
      sub: 'Hiện tại Wakii được build từ mã nguồn (bản cài nằm trong roadmap) — app mobile đồng hành cho team agent của bạn sắp đến.',
    },
  },
  desktop: {
    label: 'desktop',
    tabMacos: 'macOS',
    tabWindows: 'Windows',
    live: {
      btnMacos: 'tải cho macOS',
      btnWindows: 'tải cho Windows',
      warnMacos:
        'Bản build chưa ký — app macOS ngoài App Store cần được cho phép trong System Settings → Privacy & Security.',
      warnWindows:
        'Bản build chưa ký — SmartScreen có thể hiện cảnh báo. Chọn "Run anyway".',
      sourceAlt: 'Muốn tự build? Build từ mã nguồn.',
    },
    notLive: {
      note: 'Bản cài chưa có — hiện tại Wakii được build từ mã nguồn. Mất vài phút và luôn khớp với docs.',
      buildFromSource: 'build từ mã nguồn',
      followReleases: 'theo dõi releases trên github',
    },
    nightly: {
      title: 'Bản build hằng ngày — cho power users',
      desc: 'Build rolling hằng ngày từ nhánh phát triển. Có thể hỏng bất cứ lúc nào — kênh stable vẫn là mặc định.',
      btn: 'tải bản nightly',
      warn: 'Không ổn định do thiết kế — gặp gì lạ thì lập issue nhé.',
    },
  },
  mobile: {
    label: 'kết nối mobile',
    title: 'cả team trong túi của bạn',
    sub: 'App đồng hành cho iOS và Android — làm việc với các agent của bạn từ bất cứ đâu qua QR pairing.',
    badgeIos: 'iOS',
    badgeAndroid: 'Android',
    capsIntro: 'App mobile cho phép bạn:',
    caps: [
      'Xem các phiên agent đang chạy',
      'Duyệt gates ngay trên điện thoại',
      'Gửi task cho team của bạn',
    ],
    live: {
      qrCaption: 'Quét mã để tải app — rồi kết nối từ trong app.',
    },
    notLive: {
      comingSoon: 'App mobile sắp ra mắt.',
      followUpdates: 'theo dõi cập nhật',
    },
  },
  teaser: {
    kicker: 'mobile',
    title: 'wakii trong túi của bạn',
    sub: 'App đồng hành cho iOS và Android — xem agents đang chạy, duyệt gates, và gửi task từ bất cứ đâu.',
    cta: 'về app mobile',
  },
  upgrade: {
    head: {
      title: 'Tải Wakii.',
      lead: 'Một nút cho máy của bạn. Mọi thứ còn lại nằm ở đây để không ai phải đi tìm — kể cả những lưu ý thật.',
      micro: 'miễn phí · mã nguồn mở · bản build chưa ký',
    },
    version: {
      label: 'phiên bản',
      pillSuffix: 'mới nhất',
      publishedLabel: 'phát hành',
      notesLink: 'release notes & các bản cũ',
      foot: 'trang này theo dõi bản phát hành mới nhất, không phải bản pin',
    },
    primary: {
      label: 'macos — tải chính',
      btnArm64: 'tải wakii — apple silicon',
      tagArm64: 'khuyên dùng · đa số mac',
      btnX64: 'mac dùng intel',
      or: 'hoặc',
      note: 'Chưa rõ chip của mình? Apple silicon là dòng M. Không chắc thì lấy arm64.',
      foot: 'bản build chưa ký — lần mở đầu: System Settings → Privacy & Security → Open Anyway',
    },
    windows: {
      label: 'windows',
      btn: 'tải wakii cho windows',
      orcaNote: 'Bộ cài giữ nguyên tên orca gốc — cùng một app, Wakii ở bên trong.',
      foot: 'bản build chưa ký — SmartScreen: More info → Run anyway',
    },
    linux: {
      label: 'linux',
      meta: 'build từ mã nguồn',
      body: 'Chưa có bản nhị phân đóng gói cho Linux. Clone repo và build — cùng app, cùng kit, cùng gates.',
      btn: 'build từ mã nguồn',
      foot: 'chưa có installer — chỉ có mã nguồn (hiện tại)',
    },
    mobile: {
      label: 'mobile',
      meta: 'sắp có',
      body: 'App iOS và Android sắp ra mắt. Chưa có link store — cell này là chỗ trống trung thực, không phải teaser.',
      btn: 'app stores — sắp có',
      apkFoot: 'ai thích vọc android: app-release.apk thô nằm trong releases — chưa ký',
    },
    firstRun: {
      label: 'lần chạy đầu — ba bước sau khi cài',
      meta: '→ /vi/docs/getting-started/',
      steps: [
        { n: '01', title: 'mở một dự án', desc: 'Folder nào cũng được. Wakii mở nó như editor bạn vẫn dùng.' },
        { n: '02', title: 'kit tự cài', desc: 'Superpowers kit nằm vào ~/.claude ngay lần chạy đầu.' },
        { n: '03', title: 'mô tả ý tưởng đầu tiên', desc: 'Gõ /superpowers "…" và team nhận việc.' },
      ],
      cta: 'đọc getting-started',
      foot: '~/.claude — nhà của kit; không phải cấu hình gì bằng tay',
    },
    osChip: '→ cho máy bạn',
    archYours: '→ khớp mac của bạn',
    mainWindowSlot: {
      name: 'cửa sổ chính',
      hint: 'thứ bạn thấy ngay sau khi cài — dự án đã mở, team online',
    },
  },
};
