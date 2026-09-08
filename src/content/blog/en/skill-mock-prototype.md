---
title: "Skill /mock-prototype: prototype before a line of production code"
description: "Three self-contained HTML directions posted as links that open right in the browser; you pick one before any refinement — the mock never enters the codebase, what crosses over is a direction doc."
pubDate: "2026-09-13"
category: "tech"
tags: ["skills", "design", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-mock-prototype.png"
---

You describe a landing page vaguely, in one sentence: "minimal, modern, with a terminal feel." The agent builds something genuinely nice, you open it, and you know immediately: not this. The problem is not that the agent builds badly — the problem is that a visual decision just got locked in with words, and everyone reads words differently. The /mock-prototype skill in Wakii's kit moves the lock-in earlier: instead of choosing from a description, you choose from three things you can look at — before a single line of production code exists.

TL;DR:

- /mock-prototype turns a UI idea into three self-contained HTML prototype directions, genuinely different from each other — not three color variants.
- Each direction is posted as an unlisted link that opens right in your browser; no local files needed.
- You pick A/B/C — the skill is forbidden from choosing for you and from merging the three into one.
- What continues into real code is not a mock diff but a direction doc: tokens, structure, behavior, out-of-scope.
- This process has real artifacts in the repo of the very site you are reading — two direction docs from an earlier story.

## Descriptions lose to eyes

A one-sentence UI description compresses a huge decision space into a few words. "Modern" has at least a dozen visual readings; "terminal feel" looks different to everyone. Words work for conveying intent, but they are the wrong tool for locking down an image — and UI is about the image. So the skill's first step is not drawing, it is asking: at most three questions, batched into one round — goal, audience, desired feeling, size (web? which pixel width?). The rule in the source puts the emphasis exactly right: "Chưa rõ thì hỏi — KHÔNG tự đoán taste." (If it is unclear, ask — do not guess taste.)

Why three directions and not one? A single mock still forces a binary decision: approve, or start over. Three genuinely different directions turn deciding into comparing — you see the boundary between the directions, and you point at one. The source is explicit about how different they must be: "mỗi hướng khác biệt thật (không phải 3 biến thể màu)" (each direction genuinely different — not three color variants).

Two ways to lock a visual decision, side by side:

```ascii
lock with words:  idea → description → build → "not what I meant" → rebuild
lock with eyes:   idea → 3 HTML directions → you point → build the right one
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (step 1 CLARIFY + the 3-direction requirement), lấy 2026-09-08.*

## The pipeline: three HTML files, three links, one choice

The full pipeline has five steps, each with hard rules; step one is the CLARIFY above. Step two, the skill invokes huashu-design to produce the three directions — each direction one self-contained HTML file: single-file, assets base64 inline, no external dependency besides a CDN font if needed, placed at `docs/superpowers/prototypes/<slug>/{a,b,c}.html`. Single-file is a technical requirement of artifact share, not elegance: "Single-file HTML bắt buộc cho artifact share (assets base64 inline — artifacts render từ cloud, file rời sẽ vỡ)" (artifacts render from the cloud; a file with loose references breaks).

Step three, publish each direction through artifact share with three separate commands:

```bash
orca artifacts share docs/superpowers/prototypes/<slug>/a.html --json
orca artifacts share docs/superpowers/prototypes/<slug>/b.html --json
orca artifacts share docs/superpowers/prototypes/<slug>/c.html --json
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (step 3), lấy 2026-09-08.*

Each command returns a URL — the "unlisted links" this post keeps mentioning: hosted pages that open directly in your browser, no repo clone, no local file. Unlisted does not mean private — anyone holding the link can view, so the source pairs the feature with a rule: do not share anything sensitive.

Step four is the gate: present the three links with a one-line description of each direction, in exactly the shape the source specifies:

```
3 hướng prototype:
  A: <link-a> — <concept ngắn>
  B: <link-b> — <concept ngắn>
  C: <link-c> — <concept ngắn>
Chọn hướng (A/B/C) hoặc yêu cầu đổi gì?
```

(Pick a direction A/B/C, or ask for changes.) The two sentences right below that template are bolded in the source: "KHÔNG tự chọn. KHÔNG merge 3 thành 1." (Do not choose on the user's behalf. Do not merge the three into one.) The agent may not pick for you, and may not blend "this bit from A plus that bit from B" — a blend is no longer the thing you looked at when you chose.

Why does none of this touch the app repo? All three files live under `docs/superpowers/prototypes/` — documentation, not source; the share command uploads a copy to cloud artifacts, and the app's source tree does not change by a single byte.

## Zero production code: the boundary between mock and app

The mock stops at a boundary drawn in advance, and the only thing allowed across it is a spec. After you pick, the skill refines that direction, re-publishes the final artifact, and writes the hand-off: a file at `docs/superpowers/designs/<slug>-direction.md` — tokens / structure / behavior / out-of-scope — plus the final artifact link. The completion line in the source: "DIRECTION-FINAL: <link> — hand-off tại <path>" (hand-off at path).

That boundary exists for a technical reason, not as ritual. A prototype is optimized for being judged quickly: it is allowed to skip i18n, responsive behavior, accessibility, real data. A real app optimizes for the opposite. If a mock entered the codebase as a diff, every shortcut the prototype took would ship as technical debt from day one. So the hand-off is a spec, not a diff: whoever builds reads the direction doc and implements to production standards, not copy-pasting something that was allowed to be sloppy.

And the final gate cannot be skipped, even when the agent runs autonomously: "User gate không bỏ kể cả autonomous mode (đúng designer protocol)" (the user gate is not waived even in autonomous mode). The agent can own every other stretch of the pipeline; the exact point where human eyes are required is where it stops.

```ascii
docs/superpowers/prototypes/<slug>/{a,b,c}.html   (mock — outside src/)
        │  user picks 1 direction → refine that direction
        ▼
docs/superpowers/designs/<slug>-direction.md      (hand-off = spec)
   tokens · structure · behavior · out-of-scope
        │
        ▼
build the real app — production code starts here
```

*Nguồn: ~/.claude/skills/mock-prototype/SKILL.md (step 5 + the rules section), lấy 2026-09-08.*

## Direction docs: this process family already ran in this repo

Let me state the scope of the evidence: /mock-prototype is the skill that packages the pipeline "three draft directions → user picks → direction doc locks it → build follows the doc" into a one-command process. The direction docs in this site's repo are artifacts of the same process family, run in an earlier story — not the output of invoking this skill. The common ground is the artifact structure, and that structure can be read verbatim.

`sf1-direction.md` — the direction doc of the landing redesign — opens with:

```
# SF-1 Design Direction — "Modern Bento Premium"
  (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> v2 BINDING (2026-09-04): thay thế hoàn toàn v1. Nguồn duyệt:
> docs/superpowers/designs/direction-d3-bento.html (implement theo
> file này + file nguồn, không tự biến đổi hướng).
```

(D3 — chosen by the user 2026-09-04, replacing the v1 Terminal Mono direction; v2 is binding, its source of approval is an HTML file, and implementers follow it without reinterpreting the direction.)

*Nguồn: docs/superpowers/designs/sf1-direction.md, lấy 2026-09-08.*

A locked direction doc carries exactly the three things visible there: which direction won (D3, picked on 2026-09-04), a source of approval that is a viewable HTML file rather than a chat thread, and a builder whose hands are tied ("không tự biến đổi hướng" — do not reinterpret the direction). The doc's "Cấm" (forbidden) section even lists what must not appear: "Gradient tím/xanh AI-slop, glow bóng đổ lớn, stock illustration, emoji UI" — a hand-off spec says what to do and also what not to do.

The second direction doc, `sf-downloads-direction.md` for the downloads page, states it in its very first line: "USER-PICK-APPROVED 2026-09-04 (chat: "a" → đổi sang "b")" — the user picked a, then switched to b. A gate that really runs means you are allowed to change your mind, and the process records the change instead of erasing it. The same line carries "Source of truth visual: /tmp/story/fi300/design/sf-dl-b.html (tham chiếu — /tmp không sống theo repo, hand-off này là binding)": the chosen HTML file remains the source of truth for the visuals, while the doc is the binding source for the build.

*Nguồn: docs/superpowers/designs/sf-downloads-direction.md, lấy 2026-09-08.*

mock-prototype is one of the kit's 13 public skills — the kit has 20 total / 13 public, at the time of writing, 2026-09-08. How the kit works and how it installs into ~/.claude/ is laid out in the [agents and kit docs](/docs/agents-and-kit/). For the big picture before opening individual books, the [skills catalog tour](/blog/skills-catalog-tour/) walks through all three groups. And once a direction is picked and it is time to build for real, the work moves to a different skill in the same design group: [frontend-design](/blog/skill-frontend-design/) owns principled taste on the production-code side.

Wakii is an agentic IDE with a superpowers team built in — the three-direction pipeline is one of the skills the agent loads when you say "make me a mock." Download Wakii, describe the idea, and this time let your eyes choose before the keyboard starts.
