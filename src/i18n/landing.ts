/**
 * Landing strings — v2 "Modern Bento Premium" (direction-d3-bento.html).
 * PLACEHOLDER copy; EN is source of truth. SF-2 owns real landing copy.
 * Bento mockup data (nodes/agents/gates/watchdog) lives here so the mockup
 * kit components (src/components/mockups/) stay pure renderers with props.
 */

export interface BentoNode {
  id: string;
  title: string;
  agent?: string;
  status: 'epic' | 'done' | 'running' | 'queued';
  x: number;
  y: number;
  /** progress 0-1 → animated bar; done nodes hide it */
  progress?: number;
}

export interface BentoEdge {
  d: string;
  live?: boolean;
}

export interface LandingStrings {
  lang: 'en' | 'vi';
  hero: {
    termTitle: string;
    boot: string[];
    lastCmd: string;
    kicker: string;
    headlineBefore: string;
    headlineHighlight: string;
    tagline: string;
    taglineCode: string;
    ctaPrimary: string;
    ctaGhost: string;
    stats: { v: string; k: string }[];
  };
  bento: {
    kicker: string;
    title: string;
    sub: string;
    bracket: {
      label: string;
      meta: string;
      pills: { run: string; done: string };
      tiers: { label: string; x: number; w: number }[];
      nodes: BentoNode[];
      edges: BentoEdge[];
      desc: string;
    };
    agents: {
      label: string;
      pill: string;
      items: { name: string; role: string; state: string; working: boolean }[];
      desc: string;
    };
    gates: {
      label: string;
      pill: string;
      items: { id: string; label: string; status: 'done' | 'run' | 'pending' }[];
      desc: string;
    };
    memory: {
      label: string;
      meta: string;
      lines: { t: string; src: string; srcKind: 'gate' | 'watch' | 'plain'; tx: string }[];
      desc: string;
    };
    watchdog: {
      label: string;
      pill: string;
      lines: { text: string; kind: 'plain' | 'warn' | 'ok' }[];
      foot: string;
    };
    stats: { v: string; k: string }[];
  };
  zero: { status: string; title: string; desc: string }[];
  workflow: { kicker: string; title: string; sub: string; stages: string[]; planNote: string; legend: string; note: string };
  quickstart: {
    kicker: string;
    title: string;
    steps: { n: string; comment: string; title: string; desc: string; cmd: string }[];
    more: string;
    moreLink: string;
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
}

const BRACKET_GEOMETRY = {
  tiers: [
    { label: 'epic', x: 20, w: 172 },
    { label: 'spec & plan', x: 220, w: 172 },
    { label: 'parallel SFs', x: 430, w: 180 },
  ],
  nodes: [
    { id: 'FI-289', y: 150, status: 'epic' as const },
    { id: 'SF-1', y: 72, status: 'done' as const },
    { id: 'SF-2', y: 192, status: 'running' as const, progress: 0.64 },
    { id: 'SF-3', y: 302, status: 'queued' as const },
    { id: 'SF-4', y: 126, x: 430, status: 'running' as const, progress: 0.38 },
  ],
  edges: [
    { d: 'M 192 186 C 210 186, 202 106, 220 106' },
    { d: 'M 192 186 C 210 186, 202 226, 220 226', live: true },
    { d: 'M 192 186 C 210 186, 202 336, 220 336' },
    { d: 'M 392 226 C 412 226, 412 160, 430 160', live: true },
    { d: 'M 392 106 C 412 106, 412 148, 430 148' },
  ],
};

export const en: LandingStrings = {
  lang: 'en',
  hero: {
    termTitle: 'wakii — zsh',
    boot: [
      '› resolving project context … done',
      '› bundled plugin loaded · kit → ~/.claude · team enabled',
      '› 9 agents online · superpowers panel ready',
      '› memory restored: 47 verdicts, 12 learned patterns',
    ],
    lastCmd: '/superpowers "ship the next feature while I get coffee"',
    kicker: 'agentic ide // open source // fork of orca',
    headlineBefore: 'Your IDE just hired ',
    headlineHighlight: 'a team',
    tagline: 'Wakii is an agentic IDE with a built-in superpowers team — plugin bundled, kit auto-installed to ',
    taglineCode: '~/.claude',
    ctaPrimary: 'get wakii — build from source',
    ctaGhost: 'read the guide',
    stats: [
      { v: '9', k: 'agents, role-gated' },
      { v: '0', k: 'setup steps' },
      { v: '1', k: 'PR per story' },
    ],
  },
  bento: {
    kicker: 'features // live demos',
    title: 'Watch the team work',
    sub: 'Every cell below is a live piece of the Superpowers panel, mid-flight on a real story. Hover to pick one up — this is what "agentic IDE" actually looks like.',
    bracket: {
      label: 'bracket canvas',
      meta: 'FI-289 · wakii-site',
      pills: { run: '2 running', done: '1 done' },
      ...BRACKET_GEOMETRY,
      nodes: BRACKET_GEOMETRY.nodes.map((n, i) => ({
        ...n,
        x: n.x ?? [20, 220, 220, 220, 430][i],
        title: [
          'agentic IDE landing',
          'spec + design direction',
          'bento landing EN+VI',
          'docs × 2 locales',
          'perf budget ≥ 90',
        ][i],
        agent: ['coordinator', 'designer · spec-critic', 'task-executor', '—', 'verifier'][i],
      })),
      desc: 'SF.002 — bracket canvas: epic → SF nodes with dependency edges, drawn live as the pipeline resolves them.',
    },
    agents: {
      label: 'superpowers team',
      pill: '4 working',
      items: [
        { name: 'task-executor', role: 'ships SF slices', state: 'working', working: true },
        { name: 'code-reviewer', role: 'reviews at B3', state: 'reviewing', working: true },
        { name: 'verifier', role: 'tests + browser', state: '47 green', working: true },
        { name: 'spec-critic', role: 'attacks specs', state: 'online', working: false },
        { name: 'plan-critic', role: 'stress-tests plans', state: 'online', working: false },
        { name: 'phase0-impact-analyst', role: 'blast radius', state: 'online', working: false },
        { name: 'security-audit', role: 'leaks & injection', state: 'online', working: false },
        { name: 'rollback-fixer', role: 'clean reverts', state: 'online', working: false },
        { name: 'designer', role: 'direction + UI', state: 'drafting', working: true },
      ],
      desc: 'SF.003 — 9-agent team: role-gated. No agent ships outside its job.',
    },
    gates: {
      label: 'story ops — gates',
      pill: 'B3 in progress',
      items: [
        { id: 'B0', label: 'browser test', status: 'done' },
        { id: 'B1', label: 'code + tests', status: 'done' },
        { id: 'B2', label: 'plan', status: 'done' },
        { id: 'B3', label: 'review', status: 'run' },
        { id: 'B4', label: 'merge', status: 'pending' },
        { id: 'B5', label: 'done', status: 'pending' },
      ],
      desc: 'Story Ops: six gates per story. B3 review — APPROVE · 47/47 tests.',
    },
    memory: {
      label: 'wakii memory — verdicts.log',
      meta: 'session 47',
      lines: [
        { t: '09:41:07', src: 'B3', srcKind: 'gate', tx: 'SF-1 PASS — matches design tokens' },
        { t: '10:02:33', src: 'B3', srcKind: 'gate', tx: 'SF-2 APPROVED — "extracted cleanly"' },
        { t: '10:14:58', src: 'watchdog', srcKind: 'watch', tx: 'stall → resumed on SF-3' },
        { t: '10:15:02', src: 'pattern', srcKind: 'plain', tx: 'learned: verify-first · 12 stories' },
      ],
      desc: 'SF.005 — memory loop: verdicts persist. Story #20 never re-argues story #3.',
    },
    watchdog: {
      label: 'watchdog — live',
      pill: 'monitoring',
      lines: [
        { text: '▸ watching SF-3 hand-off … silence threshold 45s', kind: 'plain' },
        { text: '⚠ stall detected — executor idle 52s, checkpoint found', kind: 'warn' },
        { text: '▸ resuming SF-3 from last checkpoint …', kind: 'plain' },
        { text: '✓ SF-3 back on track — no human involved', kind: 'ok' },
      ],
      foot: 'SF.004 — watchdog auto-complete: stalled work finishes itself. You get coffee.',
    },
    stats: [
      { v: '9', k: 'role-gated agents' },
      { v: '6', k: 'gates before merge' },
      { v: '1', k: 'PR per story' },
      { v: '0', k: 'setup steps' },
    ],
  },
  zero: [
    { status: 'bootstrap 0.0s', title: 'Bundled plugin', desc: 'Superpowers ships inside the app. No marketplace, no version juggling.' },
    { status: 'install ~/.claude', title: 'Kit auto-installs', desc: 'Skills land in ~/.claude on first launch. You never touch a config file.' },
    { status: 'config enabled=true', title: 'Enabled by default', desc: 'The team is on when you open Wakii. Opt out per-project — not opt in.' },
  ],
  workflow: {
    kicker: 'pipeline',
    title: 'cat workflow.md',
    sub: 'One pipeline from spoken idea to merged PR — visible end to end in the Superpowers panel.',
    stages: ['idea', 'impact', 'plan', 'parallel SFs', 'verify gates', '1 PR / story'],
    planNote: '(linear subtasks)',
    legend: '▮ highlighted stage = agents executing concurrently',
    note: 'The pipeline runs in the open. Track every slice, gate and verdict live in the Superpowers panel and the bracket canvas — while the watchdog makes sure nothing stalls.',
  },
  quickstart: {
    kicker: 'getting started',
    title: 'quickstart — 3 steps',
    steps: [
      { n: 'step 01', comment: '// build', title: 'Build Wakii', desc: 'Clone and build from source. One command, fully self-contained.', cmd: 'git clone wakii && make' },
      { n: 'step 02', comment: '// open', title: 'Open a project', desc: 'The kit installs itself on first launch. Nothing to configure.', cmd: 'wakii ./your-project' },
      { n: 'step 03', comment: '// delegate', title: 'Describe an idea', desc: 'The team plans, executes in parallel, hands you one verified PR.', cmd: '/superpowers "add dark mode"' },
    ],
    more: 'just the teaser — the',
    moreLink: 'full usage guide',
  },
  faq: {
    kicker: 'faq',
    title: 'frequently asked',
    items: [
      { q: 'Is Wakii really zero-setup?', a: 'Yes. The plugin is bundled in the app and the skills kit installs itself to ~/.claude on first launch, enabled by default. Open Wakii — the team is already there.' },
      { q: 'How is this different from an AI plugin in my editor?', a: 'A plugin gives you a chat window. Wakii gives you a team: nine agents with defined roles, gates between them, a watchdog that completes stalled work, and memory that compounds across sessions.' },
      { q: 'What does "one PR per story" mean?', a: 'Each story — however many agents and spec slices it takes — lands as one clean, reviewable pull request with verification behind it. No PR storms, no half-merged states.' },
      { q: "What is Wakii's relationship to Orca?", a: 'Wakii is an open-source fork of Orca, which is MIT licensed. We credit the upstream project fully and build the superpowers team on top of it.' },
    ],
  },
};

export const vi: LandingStrings = {
  lang: 'vi',
  hero: {
    termTitle: 'wakii — zsh',
    boot: [
      '› đang đọc ngữ cảnh dự án … xong',
      '› plugin đóng gói sẵn đã load · kit → ~/.claude · team đã bật',
      '› 9 agents online · superpowers panel sẵn sàng',
      '› đã khôi phục memory: 47 verdicts, 12 pattern đã học',
    ],
    lastCmd: '/superpowers "ship tính năng tiếp theo trong lúc tôi pha cà phê"',
    kicker: 'agentic ide // mã nguồn mở // fork của orca',
    headlineBefore: 'IDE của bạn vừa có ',
    headlineHighlight: 'một team',
    tagline: 'Wakii là một agentic IDE với team superpowers tích hợp sẵn — plugin đóng gói sẵn, kit tự cài vào ',
    taglineCode: '~/.claude',
    ctaPrimary: 'get wakii — build từ mã nguồn',
    ctaGhost: 'đọc hướng dẫn',
    stats: [
      { v: '9', k: 'agents, phân vai' },
      { v: '0', k: 'bước cài đặt' },
      { v: '1', k: 'PR mỗi story' },
    ],
  },
  bento: {
    kicker: 'tính năng // demo trực tiếp',
    title: 'Xem team làm việc',
    sub: 'Mỗi cell dưới đây là một phần sống của Superpowers panel, đang chạy giữa chừng trên một story thật. Di chuột để nhấc lên — "agentic IDE" nhìn thế này đây.',
    bracket: {
      label: 'bracket canvas',
      meta: 'FI-289 · wakii-site',
      pills: { run: '2 đang chạy', done: '1 xong' },
      ...BRACKET_GEOMETRY,
      nodes: BRACKET_GEOMETRY.nodes.map((n, i) => ({
        ...n,
        x: n.x ?? [20, 220, 220, 220, 430][i],
        title: [
          'landing agentic IDE',
          'spec + hướng thiết kế',
          'landing bento EN+VI',
          'docs × 2 locales',
          'budget perf ≥ 90',
        ][i],
        agent: ['coordinator', 'designer · spec-critic', 'task-executor', '—', 'verifier'][i],
      })),
      desc: 'SF.002 — bracket canvas: node epic → SF với cạnh dependency, vẽ sống động theo tiến độ pipeline.',
    },
    agents: {
      label: 'superpowers team',
      pill: '4 đang làm',
      items: [
        { name: 'task-executor', role: 'ship SF slice', state: 'đang làm', working: true },
        { name: 'code-reviewer', role: 'review ở B3', state: 'đang review', working: true },
        { name: 'verifier', role: 'tests + browser', state: '47 xanh', working: true },
        { name: 'spec-critic', role: 'tấn công spec', state: 'online', working: false },
        { name: 'plan-critic', role: 'stress-test plan', state: 'online', working: false },
        { name: 'phase0-impact-analyst', role: 'bán kính ảnh hưởng', state: 'online', working: false },
        { name: 'security-audit', role: 'leak & injection', state: 'online', working: false },
        { name: 'rollback-fixer', role: 'revert sạch', state: 'online', working: false },
        { name: 'designer', role: 'direction + UI', state: 'đang vẽ', working: true },
      ],
      desc: 'SF.003 — team 9 agents: phân vai. Không agent nào ship ngoài phạm vi job của mình.',
    },
    gates: {
      label: 'story ops — gates',
      pill: 'B3 đang chạy',
      items: [
        { id: 'B0', label: 'browser test', status: 'done' },
        { id: 'B1', label: 'code + tests', status: 'done' },
        { id: 'B2', label: 'plan', status: 'done' },
        { id: 'B3', label: 'review', status: 'run' },
        { id: 'B4', label: 'merge', status: 'pending' },
        { id: 'B5', label: 'done', status: 'pending' },
      ],
      desc: 'Story Ops: sáu gate mỗi story. B3 review — APPROVE · 47/47 tests.',
    },
    memory: {
      label: 'wakii memory — verdicts.log',
      meta: 'session 47',
      lines: [
        { t: '09:41:07', src: 'B3', srcKind: 'gate', tx: 'SF-1 PASS — khớp design tokens' },
        { t: '10:02:33', src: 'B3', srcKind: 'gate', tx: 'SF-2 APPROVED — "extracted cleanly"' },
        { t: '10:14:58', src: 'watchdog', srcKind: 'watch', tx: 'stall → resume SF-3' },
        { t: '10:15:02', src: 'pattern', srcKind: 'plain', tx: 'đã học: verify-first · 12 stories' },
      ],
      desc: 'SF.005 — vòng memory: verdict được lưu lại. Story #20 không tranh luận lại story #3.',
    },
    watchdog: {
      label: 'watchdog — live',
      pill: 'đang giám sát',
      lines: [
        { text: '▸ đang theo dõi hand-off SF-3 … ngưỡng im lặng 45s', kind: 'plain' },
        { text: '⚠ phát hiện stall — executor idle 52s, đã có checkpoint', kind: 'warn' },
        { text: '▸ resume SF-3 từ checkpoint cuối …', kind: 'plain' },
        { text: '✓ SF-3 trở lại lộ trình — không cần con người', kind: 'ok' },
      ],
      foot: 'SF.004 — watchdog tự hoàn tất: work stalled tự kết thúc. Bạn cứ đi pha cà phê.',
    },
    stats: [
      { v: '9', k: 'agents phân vai' },
      { v: '6', k: 'gates trước merge' },
      { v: '1', k: 'PR mỗi story' },
      { v: '0', k: 'bước cài đặt' },
    ],
  },
  zero: [
    { status: 'bootstrap 0.0s', title: 'Plugin đóng gói sẵn', desc: 'Superpowers nằm sẵn trong app. Không marketplace, không lo version.' },
    { status: 'install ~/.claude', title: 'Kit tự cài đặt', desc: 'Skills nằm trong ~/.claude ngay lần mở đầu tiên. Bạn không đụng vào config nào.' },
    { status: 'config enabled=true', title: 'Bật sẵn mặc định', desc: 'Team đã bật khi bạn mở Wakii. Tắt theo từng dự án — không phải opt in.' },
  ],
  workflow: {
    kicker: 'pipeline',
    title: 'cat workflow.md',
    sub: 'Một pipeline từ ý tưởng nói ra tới PR được merge — nhìn thấy hết đầu-cuối trong Superpowers panel.',
    stages: ['ý tưởng', 'tác động', 'kế hoạch', 'SF song song', 'cổng verify', '1 PR / story'],
    planNote: '(subtask linear)',
    legend: '▮ stage nổi bật = các agent chạy đồng thời',
    note: 'Pipeline chạy công khai. Theo dõi từng slice, gate và verdict trực tiếp trong Superpowers panel và bracket canvas — trong khi watchdog đảm bảo không gì bị stall.',
  },
  quickstart: {
    kicker: 'bắt đầu',
    title: 'quickstart — 3 bước',
    steps: [
      { n: 'bước 01', comment: '// build', title: 'Build Wakii', desc: 'Clone và build từ mã nguồn. Một lệnh, tự chứa đầy đủ.', cmd: 'git clone wakii && make' },
      { n: 'bước 02', comment: '// mở', title: 'Mở một dự án', desc: 'Kit tự cài ngay lần mở đầu tiên. Không cần cấu hình gì.', cmd: 'wakii ./your-project' },
      { n: 'bước 03', comment: '// giao việc', title: 'Mô tả ý tưởng', desc: 'Team lên kế hoạch, chạy song song, trao bạn một PR đã verify.', cmd: '/superpowers "thêm dark mode"' },
    ],
    more: 'chỉ là teaser —',
    moreLink: 'toàn bộ hướng dẫn sử dụng',
  },
  faq: {
    kicker: 'faq',
    title: 'câu hỏi thường gặp',
    items: [
      { q: 'Wakii có thật sự zero-setup?', a: 'Có. Plugin được đóng gói sẵn trong app và bộ skills kit tự cài vào ~/.claude ngay lần mở đầu, bật sẵn mặc định. Mở Wakii — team đã ở đó.' },
      { q: 'Khác gì một AI plugin trong editor?', a: 'Plugin cho bạn một cửa sổ chat. Wakii cho bạn một team: chín agent với vai trò rõ ràng, gate giữa chúng, một watchdog hoàn tất work stalled, và memory tích lũy qua các session.' },
      { q: '"Một PR mỗi story" nghĩa là gì?', a: 'Mỗi story — dù cần bao nhiêu agent và spec slice — hạ cánh thành một pull request sạch, review được, có verify phía sau. Không mưa PR, không trạng thái merge dở.' },
      { q: 'Wakii liên quan gì tới Orca?', a: 'Wakii là fork mã nguồn mở của Orca, vốn MIT licensed. Chúng tôi credit đầy đủ dự án upstream và xây team superpowers trên đó.' },
    ],
  },
};
