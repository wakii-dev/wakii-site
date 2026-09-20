/**
 * Landing strings — v2 "Modern Bento Premium" (direction-d3-bento.html).
 * EN is source of truth; VI mirrors it at merge (VU-9 ack rule).
 *
 * COPY OWNERSHIP (VU-9 SF-1 update — supersedes the blanket placeholder
 * note): OWNED = hero CTA-split keys (ctaDownload/ctaBuild/ctaMicro) +
 * the `understand` group (design hand-off:
 * docs/superpowers/designs/ux-funnel-direction.md). ctaPrimary stays in
 * the store but goes orphan once SF-2 retargets the Hero (cleanup
 * candidate then); ctaGhost STAYS — still consumed by GetWakii gw-b.
 * STILL PLACEHOLDER: bento / zero / workflow / faq / philosophy /
 * workflowDeep / getWakii copy (final pass out of VU-9 scope — D4).
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
    /** VU-9 SF-1 CTA split — new primary → /download, new ghost → REPO_URL.
     *  ctaPrimary above stays in the store (orphan after SF-2 retargets the
     *  Hero); ctaGhost above STAYS — consumer GetWakii gw-b. */
    ctaDownload: string;
    ctaBuild: string;
    ctaMicro: string;
    stats: { v: string; k: string }[];
  };
  /** VU-9 SF-1 — understand-layer, inserted right after the hero (design
   *  hand-off: docs/superpowers/designs/ux-funnel-direction.md). Answers the
   *  4 newcomer questions in copy (D1); q2/q3/q4 carry screenshot placeholder
   *  slots (real shots land via SF-2 GAP); moreDocs/moreBlog = owner add-on
   *  links into /docs/ + /blog/ (links only — docs/blog content untouched). */
  understand: {
    q1Kicker: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    leadBefore: string;
    leadCode: string;
    leadAfter: string;
    q2Label: string;
    q2Meta: string;
    q2Body: string;
    q2SlotName: string;
    q2SlotHint: string;
    q2Foot: string;
    q3Label: string;
    q3Meta: string;
    q3BodyBefore: string;
    q3BodyEm: string;
    q3BodyAfter: string;
    q3SlotName: string;
    q3SlotHint: string;
    q3Foot: string;
    q4Label: string;
    q4Meta: string;
    q4TermTitle: string;
    q4Cmd: string;
    q4Comment: string;
    q4Out: string;
    q4BodyBefore: string;
    q4BodyCmd: string;
    q4BodyAfter: string;
    q4Dim: string;
    q4Link: string;
    moreLabel: string;
    moreDocs: string;
    moreBlog: string;
    q4Foot: string;
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
    figma: {
      label: string;
      meta: string;
      rows: { k: string; v: string }[];
      verdict: string;
      verdictOk: boolean;
      desc: string;
    };
  };
  zero: { status: string; title: string; desc: string }[];
  workflow: { kicker: string; title: string; sub: string; stages: string[]; planNote: string; legend: string; note: string };
  faq: { kicker: string; title: string; more: string; moreLink: string; items: { q: string; a: string }[] };
  /** Philosophy section (SF-4 wires markup) — 8 pillars, condensed from story-workflow.md */
  philosophy: {
    kicker: string;
    title: string;
    sub: string;
    docLink: string;
    pillars: { name: string; line: string }[];
  };
  /** #workflow deepen (SF-4 wires markup) — how the 9 agents + gates B0-B5 work */
  workflowDeep: {
    agentsTitle: string;
    agentsIntro: string;
    gatesTitle: string;
    gatesIntro: string;
    gates: { id: string; label: string; desc: string }[];
  };
  /** Get Wakii / download section (replaced the removed quickstart group —
   *  VU-9 SF-1 orphan cleanup; SF-3 rewires its data to the resolution module) */
  getWakii: {
    kicker: string;
    title: string;
    sub: string;
    steps: { n: string; comment: string; title: string; desc: string; cmd: string }[];
    reqTitle: string;
    reqItems: string[];
    repoCta: string;
    note: string;
    /** FI-300 G-D: note variant when DOWNLOADS_LIVE=true (SF-3 wires the
     *  conditional — GetWakii.astro is SF-3-owned; key pre-added in SF-1). */
    noteLive: string;
  };
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
    ctaDownload: 'download wakii',
    ctaBuild: 'build from source',
    ctaMicro: 'free · open source · unsigned build',
    stats: [
      { v: '9', k: 'agents, role-gated' },
      { v: '0', k: 'setup steps' },
      { v: '1', k: 'PR per story' },
    ],
  },
  understand: {
    q1Kicker: 'q1 — what is wakii?',
    titleBefore: 'Wakii is an agentic IDE with a ',
    titleHighlight: 'superpowers team',
    titleAfter: ' built in.',
    leadBefore:
      'A free, open-source fork of Orca. Nine agents plan, build, verify, and watch each other\'s work behind gates B0–B5. The plugin ships inside the app and the kit lands in ',
    leadCode: '~/.claude',
    leadAfter: ' on first run — zero setup steps.',
    q2Label: 'q2 — open the app: what do you see first?',
    q2Meta: 'team = online',
    q2Body:
      'The superpowers panel. All nine agents are already in there, marked online — each with a distinct role in one pipeline, and a watchdog on the floor. No wizard, no config file, nothing to toggle.',
    q2SlotName: '⚡ superpowers panel',
    q2SlotHint: '9 agents online · watchdog active · zero-setup state',
    q2Foot: '0 setup steps — the panel is live before your first click',
    q3Label: 'q3 — who is wakii for?',
    q3Meta: "delegate, don't drive",
    q3BodyBefore:
      'Devs who want to hand off the mechanical middle. You give Wakii an idea; the team brackets it, works it behind gates B0–B5, and hands back ',
    q3BodyEm: 'one clean, verified PR',
    q3BodyAfter: '. You review the diff, not the process.',
    q3SlotName: 'bracket canvas',
    q3SlotHint: 'every story leaves a readable bracket — open it in the story view',
    q3Foot: '1 PR per story — verified through gates B0–B5',
    q4Label: 'q4 — what should i try first?',
    q4Meta: 'one command',
    q4TermTitle: 'wakii — first run',
    q4Cmd: '/superpowers "<your idea, one line>"',
    q4Comment: '// e.g. /superpowers "add a /metrics endpoint — with tests"',
    q4Out: '→ team picked it up · bracket created · gates queued',
    q4BodyBefore: 'In the superpowers panel, type ',
    q4BodyCmd: '/superpowers',
    q4BodyAfter:
      ' plus your idea. The team takes it from there: bracket, gates, PR. No flags, no config, no second command to learn.',
    q4Dim:
      "That's the whole interface. Everything else — planning, verification, the watchdog — happens where you can watch it.",
    q4Link: 'first-run walkthrough — getting-started',
    moreLabel: 'keep reading',
    moreDocs: '/docs/ — how to use wakii',
    moreBlog: '/blog/ — what\'s new from github',
    q4Foot: 'try this first — one command, no flags, no config',
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
    figma: {
      label: 'figma → verify pipeline',
      meta: 'design → shipped, diffed',
      rows: [
        { k: 'capture', v: 'frame + tokens captured, committed to the repo' },
        { k: 'implement', v: 'tokens-only, component map before code' },
        { k: 'verify', v: 'screenshot diff vs capture, side by side' },
      ],
      verdict: 'visual diff: 0 unexpected deltas',
      verdictOk: true,
      desc: 'SF.006 — figma-to-verify: the build is checked against the design, pixel by pixel, before merge.',
    },
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
  faq: {
    kicker: 'faq',
    title: 'frequently asked',
    more: 'only the short version — the',
    moreLink: 'full FAQ',
    items: [
      { q: 'Is Wakii really zero-setup?', a: 'Yes. The plugin is bundled in the app and the skills kit installs itself to ~/.claude on first launch, enabled by default. Open Wakii — the team is already there.' },
      { q: 'How is this different from an AI plugin in my editor?', a: 'A plugin gives you a chat window. Wakii gives you a team: nine agents with defined roles, gates between them, a watchdog that completes stalled work, and memory that compounds across sessions.' },
      { q: 'What does "one PR per story" mean?', a: 'Each story — however many agents and spec slices it takes — lands as one clean, reviewable pull request with verification behind it. No PR storms, no half-merged states.' },
      { q: "What is Wakii's relationship to Orca?", a: 'Wakii is an open-source fork of Orca, which is MIT licensed. We credit the upstream project fully and build the superpowers team on top of it.' },
    ],
  },
  philosophy: {
    kicker: 'philosophy',
    title: 'Eight pillars, one pipeline',
    sub: 'The mechanics are public — the reasons they are built this way matter more. Condensed from the full story workflow; each pillar has a deeper write-up in the docs.',
    docLink: 'read the full philosophy',
    pillars: [
      { name: 'Analyze once, inherit many', line: 'Deep analysis is expensive, so it runs exactly once at the epic level — every sub-feature inherits the results through a context pack.' },
      { name: 'A team with separated powers', line: 'The PM specs but never codes; the developer builds but never approves its own work; the tester hunts failures but never fixes them.' },
      { name: 'Gates, not trust', line: 'Tool-enforced gates plus a real browser walkthrough demand evidence — "the agent says it works" is not a verdict.' },
      { name: 'Humans own the irreversibles', line: 'Architecture decisions and the merge to your branch are human gates — nothing irreversible happens without a person saying yes.' },
      { name: 'Tiers and one destination branch', line: 'Dependencies are explicit tiers; every tier merges into one story branch, so parallelism never means divergent histories.' },
      { name: 'Watchdog: idle is not dead', line: 'A silent agent might be running a long build — the watchdog checks three layers before resuming a stall from its last good state.' },
      { name: 'Memory and the learning loop', line: 'Every task ends with a ritual — what broke, what fixed it — so the next story starts smarter instead of rediscovering the same trap.' },
      { name: 'Defensive by design', line: 'The workflow assumes it will be the one making the mistake — so mistakes are cheap, visible, and revertable by default.' },
    ],
  },
  workflowDeep: {
    agentsTitle: 'who does what',
    agentsIntro:
      'Nine role-gated agents run every story. Analysts frame the problem, critics attack the spec and the plan, an executor builds in an isolated worktree, a designer prototypes the UI before code — and an independent reviewer plus a verifier check everything the executor claims. No agent approves its own work.',
    gatesTitle: 'six gates per story',
    gatesIntro:
      'Every sub-feature passes the Story Ops gates before it counts. Gates are tool-enforced — a gate that could self-approve would not be a gate.',
    gates: [
      { id: 'B0', label: 'browser test', desc: 'A real three-tier walkthrough — DOM, screenshots, click-through flow — before anything is called done.' },
      { id: 'B1', label: 'code + tests', desc: 'Implementation complete, tests green on the touched surface. No green, no gate.' },
      { id: 'B2', label: 'plan', desc: 'Every plan step ticked off with evidence — nothing silently skipped.' },
      { id: 'B3', label: 'review', desc: 'An independent reviewer attacks the diff: bugs, security, scope creep.' },
      { id: 'B4', label: 'merge', desc: 'Merge into the story destination branch, audit trail recorded.' },
      { id: 'B5', label: 'done', desc: 'The issue closes only after verification is clean — tracking truth matches the repo.' },
    ],
  },
  getWakii: {
    kicker: 'get wakii',
    title: 'build it from source',
    sub: 'Wakii is a desktop app built from an open repo. Three commands from clone to the Superpowers panel — no configuration along the way.',
    steps: [
      { n: 'step 01', comment: '// clone', title: 'Get the source', desc: 'Clone the repository from GitHub — the link is in the site footer.', cmd: 'git clone <repo-url> wakii && cd wakii' },
      { n: 'step 02', comment: '// install', title: 'Install dependencies', desc: 'Pulls the JavaScript deps and builds the native modules for your platform. First run takes a few minutes.', cmd: 'pnpm install' },
      { n: 'step 03', comment: '// run', title: 'Run the app', desc: 'Dev mode for looking around, or a production build. The Wakii window opens with the team already inside.', cmd: 'pnpm dev   # or: pnpm build && pnpm start' },
    ],
    reqTitle: 'requirements',
    reqItems: ['Node.js 24', 'pnpm 12', 'git'],
    repoCta: 'view the repo on github',
    note: 'No binaries yet — releases are on the roadmap. Building from source takes a few minutes and always matches the docs.',
    noteLive:
      'Prefer an installer? Grab Wakii for macOS or Windows straight from the download page.',
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
    ctaDownload: 'tải wakii',
    ctaBuild: 'build từ mã nguồn',
    ctaMicro: 'miễn phí · mã nguồn mở · bản build chưa ký',
    stats: [
      { v: '9', k: 'agents, phân vai' },
      { v: '0', k: 'bước cài đặt' },
      { v: '1', k: 'PR mỗi story' },
    ],
  },
  understand: {
    q1Kicker: 'q1 — wakii là gì?',
    titleBefore: 'Wakii là một agentic IDE với ',
    titleHighlight: 'team superpowers',
    titleAfter: ' có sẵn.',
    leadBefore:
      'Fork mã nguồn mở miễn phí của Orca. Chín agent lên kế hoạch, xây, verify và canh công việc của nhau sau các gates B0–B5. Plugin nằm sẵn trong app và kit tự cài vào ',
    leadCode: '~/.claude',
    leadAfter: ' ngay lần chạy đầu — không bước cài đặt.',
    q2Label: 'q2 — mở app lên: thấy gì đầu tiên?',
    q2Meta: 'team = online',
    q2Body:
      'Superpowers panel. Cả chín agent đã ở đó, đánh dấu online — mỗi agent một vai trò riêng trong cùng một pipeline, và một watchdog luôn trực. Không wizard, không file config, không gì phải bật.',
    q2SlotName: '⚡ superpowers panel',
    q2SlotHint: '9 agents online · watchdog hoạt động · trạng thái zero-setup',
    q2Foot: '0 bước cài đặt — panel sống trước cả cú click đầu tiên của bạn',
    q3Label: 'q3 — wakii dành cho ai?',
    q3Meta: 'giao việc, không lái',
    q3BodyBefore:
      'Devs muốn giao phần việc cơ học ở giữa. Bạn đưa Wakii một ý tưởng; team dựng bracket, làm việc sau các gates B0–B5, và trao lại ',
    q3BodyEm: 'một PR sạch, đã verify',
    q3BodyAfter: '. Bạn review diff, không review quy trình.',
    q3SlotName: 'bracket canvas',
    q3SlotHint: 'mỗi story để lại một bracket đọc được — mở trong story view',
    q3Foot: '1 PR mỗi story — được verify qua gates B0–B5',
    q4Label: 'q4 — thử gì đầu tiên?',
    q4Meta: 'một lệnh',
    q4TermTitle: 'wakii — lần chạy đầu',
    q4Cmd: '/superpowers "<ý tưởng của bạn, một dòng>"',
    q4Comment: '// vd: /superpowers "thêm /metrics endpoint — kèm tests"',
    q4Out: '→ team nhận việc · bracket tạo xong · gates xếp hàng',
    q4BodyBefore: 'Trong superpowers panel, gõ ',
    q4BodyCmd: '/superpowers',
    q4BodyAfter:
      ' cộng với ý tưởng của bạn. Team lo phần còn lại: bracket, gates, PR. Không flags, không config, không lệnh thứ hai phải học.',
    q4Dim:
      'Đó là toàn bộ giao diện. Mọi thứ khác — lập kế hoạch, verification, watchdog — diễn ra ngay nơi bạn nhìn thấy.',
    q4Link: 'walkthrough lần chạy đầu — getting-started',
    moreLabel: 'đọc tiếp',
    moreDocs: '/docs/ — hướng dẫn sử dụng wakii',
    moreBlog: '/blog/ — công nghệ mới từ github',
    q4Foot: 'thử cái này trước — một lệnh, không flags, không config',
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
    figma: {
      label: 'pipeline figma → verify',
      meta: 'thiết kế → shipped, so từng pixel',
      rows: [
        { k: 'capture', v: 'frame + tokens được chụp, commit vào repo' },
        { k: 'implement', v: 'chỉ dùng tokens, vẽ component map trước khi code' },
        { k: 'verify', v: 'soi screenshot với capture chuẩn, cạnh nhau' },
      ],
      verdict: 'visual diff: 0 sai lệch ngoài dự kiến',
      verdictOk: true,
      desc: 'SF.006 — figma-to-verify: bản build được đối chiếu với thiết kế, từng pixel, trước khi merge.',
    },
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
  faq: {
    kicker: 'faq',
    title: 'câu hỏi thường gặp',
    more: 'chỉ là bản rút gọn —',
    moreLink: 'toàn bộ FAQ',
    items: [
      { q: 'Wakii có thật sự zero-setup?', a: 'Có. Plugin được đóng gói sẵn trong app và bộ skills kit tự cài vào ~/.claude ngay lần mở đầu, bật sẵn mặc định. Mở Wakii — team đã ở đó.' },
      { q: 'Khác gì một AI plugin trong editor?', a: 'Plugin cho bạn một cửa sổ chat. Wakii cho bạn một team: chín agent với vai trò rõ ràng, gate giữa chúng, một watchdog hoàn tất work stalled, và memory tích lũy qua các session.' },
      { q: '"Một PR mỗi story" nghĩa là gì?', a: 'Mỗi story — dù cần bao nhiêu agent và spec slice — hạ cánh thành một pull request sạch, review được, có verify phía sau. Không mưa PR, không trạng thái merge dở.' },
      { q: 'Wakii liên quan gì tới Orca?', a: 'Wakii là fork mã nguồn mở của Orca, vốn MIT licensed. Chúng tôi credit đầy đủ dự án upstream và xây team superpowers trên đó.' },
    ],
  },
  philosophy: {
    kicker: 'triết lý',
    title: 'Tám trụ cột, một pipeline',
    sub: 'Cơ chế thì công khai — nhưng lý do nó được xây như vậy mới là điều quan trọng. Bản rút gọn từ story workflow đầy đủ; mỗi trụ cột có bài viết sâu hơn trong docs.',
    docLink: 'đọc toàn bộ triết lý',
    pillars: [
      { name: 'Phân tích một lần, kế thừa nhiều lần', line: 'Phân tích sâu tốn kém nên chỉ chạy đúng một lần ở cấp epic — mọi sub-feature kế thừa kết quả qua context pack.' },
      { name: 'Team có quyền lực tách bạch', line: 'PM viết spec nhưng không code; developer xây nhưng không duyệt chính mình; tester săn lỗi nhưng không sửa.' },
      { name: 'Gate, không phải niềm tin', line: 'Gate ép bởi công cụ cộng walkthrough browser thật đòi bằng chứng — "agent nói nó chạy" không phải verdict.' },
      { name: 'Con người nắm những gì không thể hoàn tác', line: 'Quyết định kiến trúc và merge vào nhánh của bạn là gate của con người — không gì không thể hoàn tác xảy ra nếu thiếu một người gật đầu.' },
      { name: 'Tier và một nhánh đích duy nhất', line: 'Dependency là tier tường minh; mọi tier merge vào một nhánh story — chạy song song không đồng nghĩa lịch sử phân tách.' },
      { name: 'Watchdog: im lặng không phải là chết', line: 'Agent im lặng có thể đang chạy build dài — watchdog kiểm ba lớp trước khi resume một stall từ trạng thái tốt cuối.' },
      { name: 'Memory và vòng học hỏi', line: 'Mỗi task kết thúc bằng một nghi thức — cái gì vỡ, cái gì sửa — để story sau bắt đầu thông minh hơn thay vì dính lại cùng một bẫy.' },
      { name: 'Phòng thủ by design', line: 'Workflow giả định chính nó sẽ là người mắc lỗi — nên lỗi rẻ, nhìn thấy được, và revert được theo mặc định.' },
    ],
  },
  workflowDeep: {
    agentsTitle: 'ai làm gì',
    agentsIntro:
      'Chín agent phân vai chạy mọi story. Nhóm phân tích dựng khung vấn đề, nhóm critic tấn công spec và plan, một executor xây trong worktree cách ly, một designer vẽ UI trước khi code — và reviewer độc lập cùng verifier kiểm tra mọi thứ executor tuyên bố. Không agent nào duyệt chính công việc của mình.',
    gatesTitle: 'sáu gate mỗi story',
    gatesIntro:
      'Mọi sub-feature phải qua các gate Story Ops mới được tính. Gate được công cụ ép thực thi — một gate có thể tự duyệt chính nó thì không phải gate.',
    gates: [
      { id: 'B0', label: 'browser test', desc: 'Walkthrough thật ba tầng — DOM, screenshot, flow click-through — trước khi gọi cái gì là xong.' },
      { id: 'B1', label: 'code + tests', desc: 'Implement hoàn tất, test xanh trên bề mặt bị sửa. Không xanh, không qua gate.' },
      { id: 'B2', label: 'plan', desc: 'Mỗi bước plan được tick kèm bằng chứng — không gì bị bỏ qua trong im lặng.' },
      { id: 'B3', label: 'review', desc: 'Một reviewer độc lập tấn công diff: bug, bảo mật, lan man phạm vi.' },
      { id: 'B4', label: 'merge', desc: 'Merge vào nhánh đích của story, audit trail được ghi lại.' },
      { id: 'B5', label: 'done', desc: 'Issue chỉ đóng sau khi verification sạch — sự thật trên tracking khớp với repo.' },
    ],
  },
  getWakii: {
    kicker: 'get wakii',
    title: 'build từ mã nguồn',
    sub: 'Wakii là app desktop build từ repo mở. Ba lệnh từ clone tới Superpowers panel — không cần cấu hình gì trên đường đi.',
    steps: [
      { n: 'bước 01', comment: '// clone', title: 'Lấy mã nguồn', desc: 'Clone repository từ GitHub — link nằm ở footer của site.', cmd: 'git clone <repo-url> wakii && cd wakii' },
      { n: 'bước 02', comment: '// cài', title: 'Cài dependencies', desc: 'Kéo JavaScript deps và build native module cho hệ điều hành của bạn. Lần đầu mất vài phút.', cmd: 'pnpm install' },
      { n: 'bước 03', comment: '// chạy', title: 'Chạy app', desc: 'Chế độ dev để xem quanh, hoặc build production. Cửa sổ Wakii mở ra với team đã ở bên trong.', cmd: 'pnpm dev   # hoặc: pnpm build && pnpm start' },
    ],
    reqTitle: 'yêu cầu',
    reqItems: ['Node.js 24', 'pnpm 12', 'git'],
    repoCta: 'xem repo trên github',
    note: 'Chưa có binary — release nằm trong roadmap. Build từ mã nguồn mất vài phút và luôn khớp với docs.',
    noteLive:
      'Thích bản cài sẵn? Tải Wakii cho macOS hoặc Windows thẳng từ trang download.',
  },
};
