/**
 * Roadmap data — Now / Next / Later for /roadmap (SF-3).
 * Content is the exact list approved at FI-294 bracket APPROVE
 * (epic spec §4 "Roadmap content") — no SF may invent extra items.
 * Milestones use vague time frames (quarters/years), never far dates —
 * there is no release cadence yet.
 */

export interface RoadmapItem {
  title: string;
  desc_en: string;
  desc_vi: string;
}

export interface RoadmapBucket {
  /** vague time frame, e.g. "Q4 2026" — kept intentionally fuzzy */
  when: string;
  label_en: string;
  label_vi: string;
  items: RoadmapItem[];
}

export const roadmap: RoadmapBucket[] = [
  {
    when: 'Q4 2026',
    label_en: 'Now',
    label_vi: 'Đang làm',
    items: [
      {
        title: 'Content depth',
        desc_en:
          'The story in flight: skills catalog, roadmap (this page), the philosophy behind the workflow, and a proper download section.',
        desc_vi:
          'Story đang chạy: skills catalog, roadmap (chính trang này), triết lý đằng sau workflow, và một section download đúng nghĩa.',
      },
      {
        title: 'Public repo preparation',
        desc_en:
          'LICENSE file in the repo, a real repository URL to replace the placeholder — the housekeeping that makes build-from-source real.',
        desc_vi:
          'File LICENSE trong repo, URL repository thật thay cho placeholder — những việc cần làm để build-from-source trở thành hiện thực.',
      },
    ],
  },
  {
    when: '2027',
    label_en: 'Next',
    label_vi: 'Tiếp theo',
    items: [
      {
        title: 'GitHub Releases + binaries',
        desc_en:
          'Tagged releases with downloadable binaries and a changelog, once there is a release cadence to stand on.',
        desc_vi:
          'Release theo tag với binary tải về và changelog, một khi đã có nhịp release để dựa vào.',
      },
      {
        title: 'Per-skill detail pages',
        desc_en:
          'A dedicated page per skill, if the catalog shows people actually want that depth.',
        desc_vi:
          'Một trang riêng cho từng skill, nếu catalog cho thấy người dùng thật sự cần độ sâu đó.',
      },
      {
        title: 'Full Vietnamese review pass',
        desc_en:
          'A native-speaker review of every Vietnamese page, end to end.',
        desc_vi:
          'Một lượt review bởi người bản xứ cho toàn bộ trang tiếng Việt, từ đầu tới cuối.',
      },
    ],
  },
  {
    when: 'later',
    label_en: 'Later',
    label_vi: 'Tầm nhìn',
    items: [
      {
        title: 'Blog / field notes',
        desc_en:
          'Short write-ups from real stories — what worked, what broke, what changed our minds.',
        desc_vi:
          'Những bài ngắn từ story thật — cái gì hiệu quả, cái gì vỡ, cái gì khiến chúng ta đổi ý.',
      },
      {
        title: 'More locales',
        desc_en:
          'New interface languages, driven by demand rather than a fixed schedule.',
        desc_vi:
          'Ngôn ngữ giao diện mới, theo nhu cầu thực chứ không theo lịch cố định.',
      },
      {
        title: 'Plugin marketplace',
        desc_en:
          'A direction toward a plugin-agent ecosystem — third-party skills and kits, discoverable and installable.',
        desc_vi:
          'Hướng tới hệ sinh thái plugin-agent — skill và kit của bên thứ ba, tìm được và cài được.',
      },
    ],
  },
];
