/**
 * Roadmap data — Now / Next / Later for /roadmap (SF-3).
 * FI-294 base list, updated 2026-09-12 per owner instruction ("dựa vào
 * những gì chúng ta đang làm") — reflects what actually shipped and what
 * is in flight: blog live (120+ posts), knowledge base shipped (FI-409),
 * learning loop ADOPT issues landed in product (v1.4.200–205), ADE
 * knowledge layer next (wakii#38).
 *
 * Milestones use vague time frames (quarters/years), never far dates.
 *
 * FI-300 G-B: the downloads line is FLAG-AWARE. `buildRoadmap(live)`:
 *   live=false → "Downloads for macOS & Windows" stays in Next (new copy)
 *   live=true  → that item moves to Now; "Changelog page" stays in Next.
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

/** Downloads line, live variant (G-B: Now/Shipped). */
const DOWNLOADS_LIVE_ITEM: RoadmapItem = {
  title: 'Downloads for macOS, Windows & Android',
  desc_en:
    'Direct installers from GitHub Releases, one click away on the download page. Desktop plus an Android companion APK.',
  desc_vi:
    'Bản cài tải trực tiếp từ GitHub Releases, một cú click trên trang download. Desktop kèm bản Android companion.',
};

/** Downloads line, not-live variant (G-B: stays in Next). */
const DOWNLOADS_NEXT_ITEM: RoadmapItem = {
  title: 'Downloads for macOS & Windows',
  desc_en:
    'Direct installers hosted on GitHub Releases. Not live yet — meanwhile, build from source or follow releases.',
  desc_vi:
    'Bản cài tải trực tiếp, host trên GitHub Releases. Chưa bật — hiện tại hãy build từ mã nguồn hoặc theo dõi releases.',
};

/** Changelog splits out of the old combined binaries line (G-B). */
const CHANGELOG_ITEM: RoadmapItem = {
  title: 'Changelog page',
  desc_en:
    'Tagged releases with release notes and a changelog, once there is a release cadence to stand on.',
  desc_vi:
    'Release theo tag với release notes và changelog, một khi đã có nhịp release để dựa vào.',
};

export function buildRoadmap(downloadsLive: boolean): RoadmapBucket[] {
  return [
    {
      when: 'Q4 2026',
      label_en: 'Now',
      label_vi: 'Đang làm',
      items: [
        {
          title: 'Blog & field notes',
          desc_en:
            'A living blog, 120+ bilingual posts from real builds — repo deep-dives, workflow, guides, build logs. New posts on a steady cadence.',
          desc_vi:
            'Blog sống, hơn 120 bài song ngữ từ build thật — deep-dive repo, workflow, hướng dẫn, nhật ký. Bài mới theo nhịp đều.',
        },
        {
          title: 'Knowledge base',
          desc_en:
            'A structured internal knowledge base — decision records, 50 repo deep-dives, glossary, map of content — written machine-readable so our own agents can query it.',
          desc_vi:
            'Kho tri thức nội bộ có cấu trúc — ADR quyết định, 50 bản deep-dive repo, bảng thuật ngữ, bản đồ nội dung — viết chuẩn máy đọc được để chính agents của chúng tôi tra được.',
        },
        ...(downloadsLive ? [DOWNLOADS_LIVE_ITEM] : []),
      ],
    },
    {
      when: '2027',
      label_en: 'Next',
      label_vi: 'Tiếp theo',
      items: [
        {
          title: 'Knowledge for agents (ADE layer)',
          desc_en:
            'Expose the knowledge base over MCP so any agent client can query our decisions, repo research and lessons — the mem0/letta pattern applied to our own stack.',
          desc_vi:
            'Mở kho tri thức cho agents qua MCP để mọi agent client tra được quyết định, nghiên cứu repo và bài học — pattern mem0/letta áp lên stack của chúng tôi.',
        },
        {
          title: 'Contributions in 3D',
          desc_en:
            'A 3D contributions view where review counts: measured by PRs reviewed, not just commits pushed.',
          desc_vi:
            'Xem đóng góp 3D nơi review được tính: đo bằng số PR đã review, không chỉ số commit đã push.',
        },
        {
          title: 'Skills import/export',
          desc_en:
            'Import community skills in the standard format and export Wakii public skills — two-way distribution once the plugin manifest is in place.',
          desc_vi:
            'Nhận skill chuẩn từ cộng đồng và xuất skill public của Wakii — phân phối hai chiều khi plugin manifest sẵn sàng.',
        },
        CHANGELOG_ITEM,
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
          title: 'More locales',
          desc_en:
            'New interface languages, driven by demand rather than a fixed schedule.',
          desc_vi:
            'Ngôn ngữ giao diện mới, theo nhu cầu thực chứ không theo lịch cố định.',
        },
        {
          title: 'Plugin marketplace',
          desc_en:
            'A direction toward a plugin-agent ecosystem — third-party skills and kits, discoverable and installable. First step: the plugin manifest.',
          desc_vi:
            'Hướng tới hệ sinh thái plugin-agent — skill và kit của bên thứ ba, tìm được và cài được. Bước đầu: plugin manifest.',
        },
      ],
    },
  ];
}
