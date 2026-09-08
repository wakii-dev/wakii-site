---
title: "Skill /frontend-design: aesthetics as decisions, not preferences"
description: "The /frontend-design skill turns taste into a chain of justified decisions: ground the design in the subject's own world, pick typography and palette for this brief, and allow exactly one aesthetic risk — as long as you can defend it."
pubDate: "2026-09-11"
category: "tech"
tags: ["skills", "design", "workflow"]
draft: false
heroImage: "/blog/heroes/skill-frontend-design.png"
---

Agents build working UI fast: features run, layouts respond, forms validate. But when the result looks like a page you have already seen a dozen times, the problem is no longer technical — it is aesthetic. The /frontend-design skill in the Wakii kit takes on exactly that problem, with a fairly stubborn stance: taste is not preference, it is a chain of decisions — and each decision needs a reason you can trace. This post reads the skill's actual source (about 55 lines) and checks it against a live example: the Wakii site itself.

TL;DR:

- The skill approaches each brief like the design lead of a small studio: palette, typography, and layout must be specific to this brief — plus one justified aesthetic risk.
- Distinctiveness does not come from anyone's taste; it comes from the subject's own world — its materials, instruments, artifacts, and vernacular.
- Typography and palette are treated as real design decisions: the hero is a thesis, structure encodes information, decoration without a job gets cut.
- The closing example is real: the Wakii site's direction doc ("Modern Bento Premium") and tokens.css — where every token traces back to a written reason.

## Working UI is not the bar — intentional UI is

An agent handed "build a landing page for X" without design direction will follow probability: the most common layout, the safest palette, the most familiar typeface. The result is a landing page, all right — but place it next to twenty other products and nobody can point to yours. This skill opens by assigning a role before it lets you think about the interface at all:

```
Approach this as the design lead at a small studio known for giving
every client a visual identity that could not be mistaken for anyone
else's. This client has already rejected proposals that felt templated,
and is paying for a distinctive point of view: make deliberate,
opinionated choices about palette, typography, and layout that are
specific to this brief, and take one real aesthetic risk you can
justify.
```

*Source: ~/.claude/skills/frontend-design/SKILL.md (opening paragraph), retrieved 2026-09-08.*

Three words sit right in that passage: deliberate, opinionated, specific to this brief. The design-lead framing is not decoration — it changes the evaluation criterion, from "does this page work" to "could this page be mistaken for someone else's". The skill also states its own load condition: it applies when building new UI or reshaping an existing one — the context cost is only paid when UI is actually being shaped.

## Ground the design in the subject's own world

The "Ground it in the subject" section opens with a self-defense requirement: if the brief does not pin down the subject, the skill must pin it itself before designing — name one concrete subject, its audience, and the page's single job — and state that choice. Only then comes the definition of where distinctiveness lives:

```
The subject's own world, its materials, instruments, artifacts, and
vernacular, is where distinctive choices come from. Build with the
brief's real content and subject matter throughout.
```

*Source: ~/.claude/skills/frontend-design/SKILL.md (Ground it in the subject section), retrieved 2026-09-08.*

This is where the skill splits from the notion of "taste" as personal style. Taste is what you carry across projects — it looks the same on every brief. The subject's world changes with each brief: a page for a command-line tool has its own materials (terminals, logs, monospace), a page for a mobile app has gestures and small screens. Choosing a color because "this blue belongs to this subject's world" is a justified decision; choosing it because "I find it pretty" is a preference. The skill accepts the first kind and rejects the second.

## Typography and palette are decisions, not decoration

The "Design principles" section turns that stance into concrete directives. The hero is the page's thesis: open with the most characteristic thing in the subject's world — and the skill names the templated answer to avoid: a big number with a small label, supporting stats, and a gradient accent. Typography "carries the personality of the page": the display/body pairing is chosen deliberately, the type scale is explicit, weights and spacing carry intent — type is a memorable part of the design, not a neutral delivery vehicle. Structure is information: numbering like 01/02/03 is only legitimate when the content truly is an ordered sequence.

The process turns those principles into steps in the right order — brainstorm a token system before writing any code:

```
Color     4-6 named hex values describing the full palette
Type      2+ roles: a characterful display face (used with
          restraint), a complementary body, utility for
          captions/data if needed
Layout    one concept, ideated as ASCII wireframes to compare
Signature the ONE element this page will be remembered by
```

*Source: table built from ~/.claude/skills/frontend-design/SKILL.md (Process section), retrieved 2026-09-08.*

The next step is the hard one: review the plan against the brief — if any part reads like what you would produce for any similar page, revise it and say what changed and why. Only once the plan passes the "not a default" test may code be written, and every color and type decision must derive from the plan.

## One aesthetic risk — but it must be defensible

The demand for "one aesthetic risk" comes with strict spending rules:

```
Spend your boldness in one place. Let the signature element be the one
memorable thing, keep everything around it quiet and disciplined, and
cut any decoration that does not serve the brief. Not taking a risk can
be a risk itself! Build to a quality floor without announcing it:
responsive down to mobile, visible keyboard focus, reduced motion
respected.
```

*Source: ~/.claude/skills/frontend-design/SKILL.md (Restraint and self-critique section), retrieved 2026-09-08.*

Read closely: a risk is allowed — exactly one — but everything around it must stay quiet and disciplined. The quality floor is a floor, not a highlight: responsive down to mobile, visible keyboard focus, reduced motion respected — done without announcing it. The skill also borrows a line from Chanel: before leaving the house, look in the mirror and remove one accessory. "Justified" here means: if asked "why does this deviate from convention?", the answer has to be a clause about the brief — not "because it looks nice".

## A real example: the aesthetic direction of the Wakii site itself

None of the above lives only in a skill file. The Wakii site went through a redesign (story FI-349) and left behind exactly the kind of artifact this skill demands: a direction doc (written in Vietnamese), pinning the direction with a name and the origin of the decision — the user picked it on 2026-09-04, replacing a v1 "Terminal Mono":

```
# SF-1 Design Direction — "Modern Bento Premium"
  (D3 — user chọn 2026-09-04, thay thế v1 Terminal Mono)

> v2 BINDING (2026-09-04): thay thế hoàn toàn v1.
```

*Source: docs/superpowers/designs/sf1-direction.md (header), retrieved 2026-09-08.*

The doc continues with a token table, each value carrying a role: JetBrains Mono for headings and labels, Inter for body, a near-black `#0A0E0D` background, phosphor mint `#45E0A8` accent. And one radius decision with its reason spelled out ("over v1's 0–4px — bento needs to be softer"):

```
Radius: 8–12px bento cells (vượt v1 0–4px — bento cần mềm hơn), buttons 6px.
```

*Source: docs/superpowers/designs/sf1-direction.md (Tokens section), retrieved 2026-09-08.*

This is a textbook case of "one justified risk": it deviates from the previous version, and the reason sits right in the parentheses — bento cells need to be softer. The decision also did not stop at the doc: it was executed into the site's design system. Grep the tokens file:

```
$ grep -n "radius-cell" src/styles/tokens.css
37:  --radius-cell: 12px; /* bento cells (hand-off: 8–12px) */
```

*Source: grep on src/styles/tokens.css, retrieved 2026-09-08.*

The complete trace: an aesthetic decision ("bento needs to be softer") written into the doc, turned into a number (8–12px), executed as a token (`--radius-cell: 12px`), and every bento cell on the site now renders from that token. That is the boundary between taste and preference: taste leaves a traceable trail from decision down to the value in code; preference leaves a color nobody can explain the presence of.

/frontend-design is one of the public skills in the Wakii kit — the kit loads on demand, each skill being a `SKILL.md` file the agent opens when the situation calls for it; the full catalog gets [a tour in an earlier post](/blog/skills-catalog-tour/). Where the skill sits in the agent team — who loads what, when, and who checks the result — is covered in the [agents and kit](/docs/agents-and-kit/) docs.

Wakii is an agentic IDE with a superpowers team built in — the skill in this post ships with the kit and installs itself into `~/.claude/` on first run. Shaping a new UI? Let the agent read the brief through this skill, then settle the aesthetic direction through a decision gate — the [gate mechanics](/blog/decision-gates-safe-ai-agents/) have their own post.
