/**
 * Downloads + mobile-connect strings — story FI-300 SF-1 pre-add.
 *
 * KEY-OWNERSHIP RULE: SF-1 owns this file. After SF-1, SF-2/SF-3 must NOT
 * add new keys here — a missing key is flagged to epic FI-300
 * (pattern: landing.ts pre-add, story FI-294).
 *
 * Every flag-conditional key carries BOTH variants under `live` /
 * `notLive` (gate G-D) so a flag flip can never surface unreviewed copy.
 * VI is a draft — final approval happens at the G-D convergence gate (SF-4).
 *
 * Gates baked into this copy (spec 2026-09-04-site-downloads-mobile.md):
 *   G-C  capabilities — exactly the 3 user-approved, nothing more
 *   G-I  unsigned-binary warn — per-OS, live variant only
 *   G-QR QR caption — safe claim only ("get the app, connect in-app");
 *        rendered exclusively in the live variant
 */

export interface DownloadStrings {
  lang: 'en' | 'vi';
  page: {
    title: string;
    description: string;
    kicker: string;
    h2: string;
    sub: string;
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
}

export const en: DownloadStrings = {
  lang: 'en',
  page: {
    title: 'Download',
    description:
      'Get Wakii — download installers for macOS and Windows, or build from source. Mobile apps for iOS and Android.',
    kicker: 'download',
    h2: 'get wakii',
    sub: 'Installers for macOS and Windows, or build from source — and a mobile companion for your agent team.',
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
};

export const vi: DownloadStrings = {
  lang: 'vi',
  page: {
    title: 'Tải xuống',
    description:
      'Tải Wakii — bản cài cho macOS và Windows, hoặc build từ mã nguồn. App mobile cho iOS và Android.',
    kicker: 'tải xuống',
    h2: 'tải wakii',
    sub: 'Bản cài cho macOS và Windows, hoặc build từ mã nguồn — kèm app mobile đồng hành cho team agent của bạn.',
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
};
