#!/usr/bin/env node
/**
 * Convergence audit — story FI-373 SF-1 (Linear FI-374). Lineage: built in
 * FI-359 SF-5 (Linear FI-364), checks 2-7 carried over; scope widened from a
 * hard-coded 20-slug list to the all-non-seed manifest (both matrix tables).
 *
 * Machine sweep (the CỨNG frame). Contract sources pinned in the header of each check below:
 *   T2 — style-guide §2 D1 word-band algorithm (PINNED, verbatim)
 *   T3 — claims-registry ## FORBIDDEN parse + variants + evidence-pack §Numbers snapshot D8
 *        + ## Verify-shipped labels (DEC-8, batch-2 feature posts)
 *        + scoped FORBIDDEN entries (FI-383: `- "phrase" — scope: slug,slug`
 *          enforces ONLY on the listed slugs — parser identical to
 *          check-blog-content.mjs: same tree ⇒ same verdict from both scripts)
 *   T4 — link/locale/anchor rules (style-guide §6, D4) resolved against dist/
 *   T5 — RSS contract (FI-339 SF-1): bilingual feed, guid absolute per locale, no <language>
 *   T6 — sitemap + hreflang pair + OG article contract (FI-339 rev 2)
 *   T7 — listings live-count + frontmatter vs BOTH matrix tables (D2/D6 + DEC-6 policy a)
 *
 * READ-ONLY over src/ and dist/ — report goes to STDOUT only (never writes any
 * file). Zero-dependency: node:fs / node:path / node:url + global fetch only.
 * Home paths (os.homedir via $HOME) are scrubbed to `~` in every printed line —
 * a home-path leak in audit output was a P1 security finding on a previous SF.
 *
 * Seeds (5 slugs, FI-341) are EXEMPT from enforcement (band, locale docs-link
 * rule, forbidden grep): listed as inventory only; any rule deviation on a seed
 * prints a NOTE, never a FAIL.
 *
 * Exit code 0 only if every enforceable check has zero FAIL lines.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = (locale) => join(root, 'src', 'content', 'blog', locale);
const DIST = (...p) => join(root, 'dist', ...p);
const KIT = join(root, 'docs', 'superpowers', 'editorial', '2026-blog-longform');

const SITE_URL = 'https://wakii.xyz';
const TODAY = new Date().toISOString().slice(0, 10);

/** Frozen scope (story FI-341 seeds) — mirrors scripts/check-blog-content.mjs. */
const SEED_SLUGS = [
  'review-ai-agents-from-your-phone',
  'story-workflow-idea-to-release',
  'decision-gates-safe-ai-agents',
  'forking-an-ide-keeping-current-with-upstream',
  'building-wakii-in-the-open-log-1',
];

/* Planned scope = BOTH matrix tables parsed with the same row regex
 * (batch-1 FI-359: 20 slugs · batch-2 FI-373: 44 slugs → 64 non-seed).
 * No hard-coded slug list — matrix files are the single source of truth. */
const MATRIX_ROW = /^\|\s*(\d+)\s*\|\s*`([a-z0-9-]+)`\s*\|\s*([a-z-]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/gm;
function parseMatrix(file) {
  const src = readFileSync(join(KIT, file), 'utf8');
  const rows = new Map();
  for (const m of src.matchAll(MATRIX_ROW)) rows.set(m[2], { n: Number(m[1]), cat: m[3], pubDate: m[4] });
  return rows;
}
const BATCH1 = parseMatrix('topic-matrix.md');
const BATCH2 = parseMatrix('topic-matrix-batch2.md');
const PLANNED = new Map([...BATCH1, ...BATCH2]);

/* Category set derived from the matrix rows (single source — sitemap T6 +
 * category pages T7 read the same list; hard-coding it in N places was the
 * drift risk a batch-3 category would hit). */
const CATEGORIES = [...new Set([...PLANNED.values()].map((r) => r.cat))];

/** Owning dev SF: batch-1 (FI-359) by matrix row index (#1-7 SF-2, #8-14 SF-3,
 *  #15-20 SF-4); batch-2 (FI-373) by facet prefix (skills/features/guides/
 *  arch+oss+logs). */
function owner(slug) {
  if (SEED_SLUGS.includes(slug)) return 'seed';
  const b1 = BATCH1.get(slug);
  if (b1) return b1.n <= 7 ? 'SF-2/FI-361' : b1.n <= 14 ? 'SF-3/FI-362' : 'SF-4/FI-363';
  if (slug.startsWith('skill-')) return 'SF-2/FI-375';
  if (slug.startsWith('feature-')) return 'SF-3/FI-376';
  if (slug.startsWith('guide-')) return 'SF-4/FI-377';
  if (slug.startsWith('arch-') || slug.startsWith('oss-') || /^building-wakii-in-the-open-log-[34]$/.test(slug)) return 'SF-5/FI-378';
  return 'unowned';
}

/** Mirror of DOC_SLUGS in src/config.ts. */
const DOC_SLUGS = ['getting-started', 'superpowers-panel', 'story-workflow', 'agents-and-kit', 'faq'];

/* D1 band, style-guide §2 (PIN). */
const VI_MIN = 900, VI_WARN = 1400, VI_HARD = 1470, EN_MIN = 800;

/* Snapshot D8 (evidence-pack.md §Numbers snapshot — chụp 2026-09-08, FI-373
 * SF-1 refresh; the 21/14 capture of 2026-09-07 was a counting-pattern error,
 * see claims-registry ## Drift-note). Releases re-verified unchanged. */
const SNAPSHOT = {
  snapshotDate: '2026-09-08',
  skillsTotal: 20,
  skillsPublic: 13,
  releases: {
    'v1.4.199': '2026-09-05T19:07:31Z',
    'v1.4.198': '2026-09-05T12:47:15Z',
    'mobile-android-v0.0.48': '2026-09-05T13:00:31Z',
  },
  forbiddenRelease: 'v1.4.197',
  agents: 9,
  clis: 24,
  seedPosts: 10,
};

/* ---------- output plumbing: scrub + deterministic sort ---------- */
const HOME = process.env.HOME || process.env.USERPROFILE || '/nonexistent-home';
const scrub = (s) => String(s).split(HOME).join('~');
const out = (s = '') => console.log(scrub(s));

/* Security (P1, security-audit 2026-09-08): uncaught crashes print raw stderr
 * with absolute local paths — and this script's stdout/stderr gets pasted into
 * Linear as audit evidence. Route EVERY uncaught failure through the scrubber. */
const failHard = (err) => {
  console.error(scrub((err && (err.stack || err.message)) || err));
  process.exit(1);
};
process.on('uncaughtException', failHard);
process.on('unhandledRejection', failHard);

const CHECKS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const fails = Object.fromEntries(CHECKS.map((c) => [c, []]));
const notes = Object.fromEntries(CHECKS.map((c) => [c, []]));
const fail = (c, msg) => fails[c].push(msg);
const note = (c, msg) => notes[c].push(msg);

/* ---------- shared parsers (verbatim approach of check-blog-content.mjs) ---------- */
function splitFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: '', body: content, fmlError: 'file must start with `---`' };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: '', body: '', fmlError: 'frontmatter has no closing `---`' };
  const frontmatter = content.slice(4, end);
  const body = content.slice(end + 4).replace(/^\n/, '');
  return { frontmatter, body, fmlError: null };
}

/** D1: strip fenced blocks (unclosed fence = unbalanced). */
function stripFences(text) {
  const lines = text.split('\n');
  const kept = [];
  let fences = 0;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      fences += 1;
      inFence = !inFence;
      continue;
    }
    if (!inFence) kept.push(line);
  }
  return { prose: kept.join('\n'), balanced: fences % 2 === 0 };
}

function parseFields(frontmatter) {
  const fields = {};
  for (const line of frontmatter.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}
const unquote = (v) => v.replace(/^["'](.*)["']$/s, '$1').trim();

/* FORBIDDEN section parse — same contract as check-blog-content.mjs:
   one literal per `- ` line, reason stripped at " — ", stop at next `## `.
   Scoped entries (FI-383 SF-1): `- "phrase" — scope: slug-a,slug-b` enforces
   the phrase ONLY on the listed slugs; an entry without ` — scope:` is
   unscoped (greps every non-seed file). Parser IDENTICAL to lint — same
   tree ⇒ same verdict from both scripts. */
function forbiddenPhrases() {
  const src = readFileSync(join(KIT, 'claims-registry.md'), 'utf8');
  const start = src.match(/^## FORBIDDEN\s*$/m);
  if (!start) throw new Error('claims registry has no `## FORBIDDEN` section');
  const rest = src.slice(start.index + start[0].length);
  const end = rest.indexOf('\n## ');
  const section = end === -1 ? rest : rest.slice(0, end);
  const phrases = [];
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('- ')) continue;
    const scoped = t.match(/^- (.+?) — scope: ([a-z0-9,-]+)\s*$/);
    if (scoped) {
      const phrase = scoped[1].replace(/^"(.*)"$/s, '$1').trim();
      if (phrase) phrases.push({ phrase, scope: scoped[2].split(',').map((s) => s.trim()).filter(Boolean) });
      continue;
    }
    // strip surrounding quotes — harmless for the legacy unquoted entries
    const phrase = t.slice(2).split(' — ')[0].trim().replace(/^"(.*)"$/s, '$1');
    if (phrase) phrases.push({ phrase, scope: null });
  }
  return phrases;
}

/* ---------- content inventory — readdir, not a slug list (FI-373 SF-1) ---------- */
const posts = new Map(); // key `${locale}/${slug}` -> { locale, slug, content, fml, body, isSeed }
for (const locale of ['en', 'vi']) {
  const dir = BLOG(locale);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    const p = join(dir, f);
    const content = readFileSync(p, 'utf8');
    const { frontmatter, body, fmlError } = splitFrontmatter(content);
    if (fmlError) fail('T7', `src/content/blog/${locale}/${slug}.md: frontmatter error: ${fmlError}`);
    const fml = parseFields(frontmatter);
    posts.set(`${locale}/${slug}`, {
      locale, slug, content, fml, body,
      pubDate: unquote(fml.pubDate || ''),
      category: unquote(fml.category || ''),
      draft: (fml.draft || '').trim() === 'true',
      isSeed: SEED_SLUGS.includes(slug),
    });
  }
}
const newPosts = [...posts.values()].filter((p) => !p.isSeed)
  .sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale));
const seedPosts = [...posts.values()].filter((p) => p.isSeed)
  .sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale));
const draftSlugs = [...new Set([...posts.values()].filter((p) => p.draft).map((p) => p.slug))].sort();

out('=== convergence audit — FI-373 SF-1 (checks 2-7; lineage FI-359 SF-5) ===');
out(`scope: manifest all-non-seed — ${PLANNED.size} planned slugs (batch-1 ${BATCH1.size} + batch-2 ${BATCH2.size}) x 2 locales; ` +
  `${newPosts.length} files present/enforced; ${SEED_SLUGS.length} seed slugs (FI-341) = inventory-only`);
out(`draft slugs (D7 fallback): ${draftSlugs.length === 0 ? 'none' : draftSlugs.join(', ')}`);
out('seeds (exempt inventory): ' + SEED_SLUGS.join(' · '));

/* ================================================================
 * T2 — D1 word band sweep (style-guide §2, PINNED algorithm)
 * ================================================================ */
out(`\n--- T2: D1 word-band sweep (${newPosts.length} non-seed files; seeds exempt) ---`);
out('slug | locale | words | verdict');
const viWarnRows = [];
for (const p of newPosts) {
  const { prose, balanced } = stripFences(p.body);
  if (!balanced) {
    fail('T2', `${p.locale}/${p.slug}.md: unclosed fenced code block (` + '```' + ` opened but never closed) [${owner(p.slug)}]`);
    out(`${p.slug} | ${p.locale} | — | FAIL (unclosed fence — not counted)`);
    continue;
  }
  const words = prose.split(/\s+/).filter(Boolean).length;
  let verdict = 'PASS';
  if (p.locale === 'vi') {
    if (words < VI_MIN) { verdict = 'FAIL'; fail('T2', `${p.locale}/${p.slug}.md: ${words} words < VI floor ${VI_MIN} (D1) [${owner(p.slug)}]`); }
    else if (words > VI_HARD) { verdict = 'FAIL'; fail('T2', `${p.locale}/${p.slug}.md: ${words} words > VI hard cap ${VI_HARD} (D1) [${owner(p.slug)}]`); }
    else if (words > VI_WARN) {
      verdict = 'WARN';
      viWarnRows.push(p);
      // required in-post justification: visible reason near the end (CTA/notes)
      const tail = prose.split('\n').filter((l) => l.trim()).slice(-30).join('\n');
      const hasReason = /(band|1400|giới hạn từ|số từ|độ dài|lý do|over|length|word count|dài hơn)/i.test(tail);
      if (!hasReason) note('T2', `${p.locale}/${p.slug}.md: ${words} words in WARN band (${VI_WARN + 1}-${VI_HARD}) but no visible justification near end of post (CTA/notes) [${owner(p.slug)}]`);
      else note('T2', `${p.locale}/${p.slug}.md: ${words} words in WARN band — in-post justification found`);
    }
  } else if (words < EN_MIN) {
    verdict = 'FAIL'; fail('T2', `${p.locale}/${p.slug}.md: ${words} words < EN floor ${EN_MIN} (D1) [${owner(p.slug)}]`);
  }
  out(`${p.slug} | ${p.locale} | ${words} | ${verdict}`);
}

/* ================================================================
 * T3 — claims sweep vs snapshot D8
 * ================================================================ */
out(`\n--- T3: claims sweep vs snapshot D8 (evidence-pack §Numbers, ${SNAPSHOT.snapshotDate}) ---`);

/* (a) FORBIDDEN literals — exact lint parse, full file, case-insensitive.
   Scoped entries (FI-383) hit only their listed slugs. */
const phrases = forbiddenPhrases();
let t3aHits = 0;
out(`(a) FORBIDDEN literals parsed from claims-registry.md: ${phrases.length} (${phrases.filter((x) => x.scope).length} scoped)`);
for (const p of newPosts) {
  const lower = p.content.toLowerCase();
  for (const { phrase, scope } of phrases) {
    if (scope && !scope.includes(p.slug)) continue;
    if (lower.includes(phrase.toLowerCase())) {
      t3aHits += 1;
      fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: forbidden phrase "${phrase}" (claims-registry ## FORBIDDEN${scope ? ` — scoped to ${scope.length} slug †` : ''}) [${owner(p.slug)}]`);
    }
  }
}
out(`(a) forbidden-phrase hits on ${newPosts.length} non-seed files: ${t3aHits} (expect 0)`);

/* (b) review-only variants — lint skips these, SF-5 sweep catches them. */
const LITERAL_VARIANTS = [
  'stories tab', 'tab stories', 'stories view', 'pairing persist',
  'every state', 'mọi state', 'pick up where you left off',
];
function proximityHits(text, anchorRe, nearRe) {
  const hits = [];
  const tokens = text.toLowerCase().split(/\s+/).map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''));
  const near = new Set(nearRe);
  for (let i = 0; i < tokens.length; i++) {
    if (!anchorRe.test(tokens[i])) continue;
    for (let j = Math.max(0, i - 5); j <= Math.min(tokens.length - 1, i + 5); j++) {
      if (j === i) continue;
      const two = tokens[j] + ' ' + (tokens[j + 1] || '');
      if (near.has(tokens[j]) || (near.has('điện thoại') && two === 'điện thoại')) {
        hits.push({ i });
        break;
      }
    }
  }
  return hits.length;
}
let t3bHits = 0;
for (const p of newPosts) {
  const lower = p.content.toLowerCase();
  for (const v of LITERAL_VARIANTS) {
    if (lower.includes(v)) {
      t3bHits += 1;
      fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: review-only variant "${v}" (claims-registry variants) [${owner(p.slug)}]`);
    }
  }
  const n1 = proximityHits(p.content, /^sync/, ['state', 'phone']);
  const n2 = proximityHits(p.content, /^worktree/, ['phone', 'điện thoại']);
  if (n1 > 0) { t3bHits += n1; fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: "sync" within 5 words of "state/phone" x${n1} (review-only variant) [${owner(p.slug)}]`); }
  if (n2 > 0) { t3bHits += n2; fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: "worktree" within 5 words of "phone/điện thoại" x${n2} (review-only variant) [${owner(p.slug)}]`); }
}
out(`(b) review-only variant hits on ${newPosts.length} non-seed files: ${t3bHits} (expect 0)`);

/* (c) number citations vs snapshot. Scan body (frontmatter is listing meta,
       not a claim block). Window = ±chars around each occurrence.
       Verdict rules implement the pinned D8 clause (claims-registry §Quy tắc
       snapshot D8 + plan §6): a citation that mismatches the snapshot BUT
       carries a dated-source marker ("tại thời điểm viết" / ngày) is the
       documented skills drift → NOTE, not FAIL ("bài đã ghi 'tại thời điểm
       viết' là đúng contract"). A claim with no dated-source marker is a FAIL
       regardless of value (D8: "không nguồn = không đăng"). Occurrences that
       are link-title or section-heading mentions (not evidence claims) are
       counted as references — missing date on a reference is not a FAIL. */
const SOURCE_MARKER = /(tại thời điểm viết|as of|snapshot|nguồn|source|lấy\s+\d|\d{4}-\d{2}-\d{2}|\b\d{1,2}-\d{1,2}\b)/i;
/* marker window: ±1200 chars ≈ the surrounding section/evidence block —
   *Nguồn* lines trail their diagram/table, prose claims precede them. */
const MARKER_WINDOW = 1200;
function classifyOccurrence(body, idx) {
  const lineStart = body.lastIndexOf('\n', idx) + 1;
  const line = body.slice(lineStart, body.indexOf('\n', idx) === -1 ? undefined : body.indexOf('\n', idx));
  if (/^#{1,6}\s/.test(line.trim())) return 'ref-heading';
  for (const m of body.matchAll(/\[[^\]]*\]\([^)]*\)/g)) {
    if (idx >= m.index && idx < m.index + m[0].length) return 'ref-link-title';
  }
  return 'claim';
}
const FAMILIES = [
  {
    id: 'skills', drift: true, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\b(13|14|20|21)\b/g)) {
        const w = body.slice(Math.max(0, m.index - 80), m.index + 80);
        if (/skill/i.test(w)) {
          const v = m[1];
          // Snapshot refresh 2026-09-08 (FI-373 SF-1): allowed values are
          // 20/13. 21/14 are now the documented drift narrative — the generic
          // badMatch branch below handles them (dated-source marker → NOTE
          // per D8; no marker → FAIL).
          rows.push({ idx: m.index, claim: `skills=${v}`, ok: v === '20' || v === '13', ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
        }
      }
      return rows;
    },
  },
  {
    id: 'release-v1.4.197', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\bv?1\.4\.197\b/g)) {
        const w = body.slice(Math.max(0, m.index - 60), m.index + 60);
        const negative = /(không có|no\s|chưa có|không tồn tại|never|does not exist|not exist|không phát hành|never shipped)/i.test(w);
        rows.push({ idx: m.index, claim: `${m[0]} (claimed ${negative ? 'ABSENT' : 'PRESENT'})`, ok: negative, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
      }
      return rows;
    },
  },
  {
    id: 'release-v1.4.198/v1.4.199', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\b(1\.4\.(198|199))\b/g)) {
        const w = body.slice(Math.max(0, m.index - 60), m.index + 60);
        rows.push({ idx: m.index, claim: `v${m[1]}`, ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
      }
      return rows;
    },
  },
  {
    id: 'release-android-v0.0.48', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\b(mobile-android-)?v?0\.0\.48\b/g)) {
        const w = body.slice(Math.max(0, m.index - 60), m.index + 60);
        rows.push({ idx: m.index, claim: `android ${m[0]}`, ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
      }
      return rows;
    },
  },
  {
    id: 'agents=9', drift: false, staticClaim: true, find: (body) => {
      const rows = [];
      // \b anchors: "chín" must not match inside "chính", "nine" not in "ninety"
      for (const m of body.matchAll(/\b(?:9|chín|nine)\b/gi)) {
        const w = body.slice(Math.max(0, m.index - 80), m.index + 80);
        if (/agent/i.test(w)) {
          rows.push({ idx: m.index, claim: 'agents=9', ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
        }
      }
      return rows;
    },
  },
  {
    id: 'clis=24', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\b24\b/g)) {
        const w = body.slice(Math.max(0, m.index - 80), m.index + 80);
        if (/(cli|story-)/i.test(w)) {
          rows.push({ idx: m.index, claim: 'clis=24', ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
        }
      }
      return rows;
    },
  },
  {
    id: 'seed-posts=10', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/\b10\b/g)) {
        const w = body.slice(Math.max(0, m.index - 80), m.index + 80);
        if (/(seed|post|bài)/i.test(w)) {
          rows.push({ idx: m.index, claim: 'seed-posts=10', ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
        }
      }
      return rows;
    },
  },
  {
    id: 'hub-store=public', drift: false, find: (body) => {
      const rows = [];
      for (const m of body.matchAll(/hub-store/gi)) {
        const w = body.slice(Math.max(0, m.index - 120), m.index + 120);
        if (/(public|công khai|isPrivate)/i.test(w)) {
          rows.push({ idx: m.index, claim: 'hub-store=public', ok: true, ctx: w.replace(/\s+/g, ' ').trim().slice(0, 140) });
        }
      }
      return rows;
    },
  },
];
out(`(c) number citations vs snapshot D8 (body scan, ${newPosts.length} non-seed files):`);
out('file | family | n | class | matches-snapshot | dated-source');
for (const p of newPosts) {
  for (const fam of FAMILIES) {
    const rows = fam.find(p.body).map((r) => ({
      ...r,
      cls: classifyOccurrence(p.body, r.idx),
      dated: SOURCE_MARKER.test(p.body.slice(Math.max(0, r.idx - MARKER_WINDOW), r.idx + MARKER_WINDOW)),
    }));
    if (rows.length === 0) continue;
    const claims = rows.filter((r) => r.cls === 'claim');
    const refs = rows.filter((r) => r.cls !== 'claim');
    const badMatch = rows.filter((r) => !r.ok);
    const noDate = claims.filter((r) => !r.dated);
    out(`${p.locale}/${p.slug}.md | ${fam.id} | ${rows.length} (claims ${claims.length}, refs ${refs.length}) | ${badMatch.length === 0 ? 'yes' : `NO x${badMatch.length}`} | ${noDate.length === 0 ? 'yes' : `${claims.length - noDate.length}/${claims.length} claims dated`}`);
    for (const r of badMatch) {
      if (fam.drift && r.dated) {
        note('T3', `src/content/blog/${p.locale}/${p.slug}.md: D8 DRIFT note — citation "${r.claim}" matches the live source but not snapshot ${SNAPSHOT.skillsTotal}/${SNAPSHOT.skillsPublic}; dated-source present so compliant per D8/plan §6 — context: "${r.ctx}" [${owner(p.slug)}]`);
      } else {
        fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: citation "${r.claim}" does not match snapshot D8 — context: "${r.ctx}" [${owner(p.slug)}]`);
      }
    }
    for (const r of noDate) {
      if (fam.staticClaim) {
        // registry-ALLOWED static claim (agents=9, source = in-repo docs page,
        // not snapshot-tracked): value verified, marker not found near this
        // mention → review-judgment flag, not a machine FAIL.
        note('T3', `src/content/blog/${p.locale}/${p.slug}.md: claim "${r.claim}" (static, registry-ALLOWED) has no dated-source marker within ±${MARKER_WINDOW} chars — value matches; reviewer judges placement — context: "${r.ctx}" [${owner(p.slug)}]`);
      } else {
        fail('T3', `src/content/blog/${p.locale}/${p.slug}.md: citation "${r.claim}" has no dated-source marker within ±${MARKER_WINDOW} chars (D8 rule "nguồn + ngày") — context: "${r.ctx}" [${owner(p.slug)}]`);
      }
    }
  }
}

/* (c2) verify-shipped family — batch-2 feature posts (SF-3) may only claim the
   label recorded in claims-registry ## Verify-shipped (DEC-8). Registry lines:
   `- feature-<name> — <SHIPPED|MAIN-ONLY|ROADMAP> — evidence...`; PENDING-VERIFY
   = placeholder, skipped (no feature post may exist while pending). A canonical
   uppercase label in the SAME SENTENCE as a `feature-<name>` mention (nearest
   label wins) must MATCH the registry or it is a FAIL — a matching label is
   compliant and silent (review P1 2026-09-08: never fail a correct claim);
   soft VI/EN phrasings ("đã ship" / "trên main" / "roadmap") mismatching the
   registry are a NOTE (false-positive bar stays low — content SFs get
   hard-blocked on canonical labels only). A mention with NO label in its
   sentence is skipped entirely (bare mention). */
function verifyShippedLabels() {
  const src = readFileSync(join(KIT, 'claims-registry.md'), 'utf8');
  const start = src.match(/^## Verify-shipped[^\n]*$/m); // heading may carry a suffix (date/scope)
  if (!start) return new Map(); // section becomes mandatory with SF-3 (FI-376)
  const rest = src.slice(start.index + start[0].length);
  const end = rest.indexOf('\n## ');
  const section = end === -1 ? rest : rest.slice(0, end);
  const labels = new Map();
  for (const line of section.split('\n')) {
    const m = line.trim().match(/^- feature-([a-z0-9-]+)\s*—\s*([A-Z-]+)/);
    if (m) labels.set(m[1], m[2]);
  }
  return labels;
}
{
  const labels = verifyShippedLabels();
  const enforced = [...labels.entries()].filter(([, l]) => l !== 'PENDING-VERIFY');
  out(`(c2) verify-shipped labels parsed from claims-registry.md: ${labels.size} entries, ${enforced.length} verified (PENDING-VERIFY skipped: ${labels.size - enforced.length})`);
  const CANON = /\b(SHIPPED|MAIN-ONLY|ROADMAP)\b/g;
  const SOFT = /(đã ship|trên main|roadmap)/gi;
  const NORMALIZE = { 'đã ship': 'SHIPPED', 'trên main': 'MAIN-ONLY', roadmap: 'ROADMAP' };
  let vsClaims = 0, vsBare = 0;
  for (const p of newPosts) {
    for (const [name, label] of enforced) {
      const re = new RegExp(`feature-${name}(?![a-z0-9-])`, 'g');
      for (const m of p.body.matchAll(re)) {
        // Canon AND soft claims are sentence-scoped within the line (markdown
        // paragraphs are single lines; two feature sentences on one line must
        // not borrow each other's label — review P1/P2 2026-09-08). The ±120
        // window is context-print only. A soft candidate whose text IS an
        // exact uppercase canonical word ("ROADMAP") is skipped — /i would
        // otherwise re-read a neighbour's canonical label as a soft phrase.
        const lineStart = p.body.lastIndexOf('\n', m.index) + 1;
        const nl = p.body.indexOf('\n', m.index);
        const line = p.body.slice(lineStart, nl === -1 ? p.body.length : nl);
        const off = m.index - lineStart;
        const segs = [];
        let last = 0;
        for (const sm of line.matchAll(/[.!?;]+(?=\s|$)/g)) {
          segs.push([last, sm.index + sm[0].length]);
          last = sm.index + sm[0].length;
        }
        segs.push([last, line.length]);
        const seg = segs.find(([a, b]) => off >= a && off < b) || [0, line.length];
        const segText = line.slice(seg[0], seg[1]);
        let canon = null, best = Infinity;
        for (const cm of segText.matchAll(CANON)) {
          const d = Math.abs(seg[0] + cm.index - off);
          if (d < best) { best = d; canon = cm; }
        }
        let soft = null;
        if (!canon) {
          for (const sm of segText.matchAll(SOFT)) {
            if (/^(SHIPPED|MAIN-ONLY|ROADMAP)$/.test(sm[0])) continue;
            soft = sm;
            break;
          }
        }
        const w = p.body.slice(Math.max(0, m.index - 120), m.index + 120);
        if (!canon && !soft) { vsBare += 1; continue; } // bare mention — no claim made
        const claimed = canon ? canon[1] : NORMALIZE[soft[1].toLowerCase()];
        if (claimed === label) continue; // compliant claim — silent (P1: fail mismatch only)
        vsClaims += 1;
        const rel = `src/content/blog/${p.locale}/${p.slug}.md`;
        const msg = `${rel}: feature-${name} claimed "${claimed}" but registry Verify-shipped says "${label}" — context: "${w.replace(/\s+/g, ' ').trim().slice(0, 140)}" [${owner(p.slug)}]`;
        if (canon) fail('T3', msg);
        else note('T3', msg);
      }
    }
  }
  out(`(c2) verify-shipped label mismatches: ${vsClaims} (FAIL/NOTE above), bare mentions skipped: ${vsBare}`);
}

/* (d) drift probes at QA time — NOTES only, never FAIL. */
out('(d) drift probes (QA-time source re-extract — NOTES only):');
const skillsSrc = readFileSync(join(root, 'src', 'data', 'skills.ts'), 'utf8');
const skillsArr = skillsSrc.slice(skillsSrc.indexOf('export const skills'));
const skTotal = (skillsArr.match(/^\s*id: '/gm) || []).length;
const skPublic = (skillsArr.match(/\bpublic: true\b/g) || []).length;
out(`    skills.ts re-extract: ${skTotal} entries / ${skPublic} public — snapshot: ${SNAPSHOT.skillsTotal}/${SNAPSHOT.skillsPublic}` +
  (skTotal === SNAPSHOT.skillsTotal && skPublic === SNAPSHOT.skillsPublic ? ' → match' : ' → DRIFT (known: posts must cite snapshot + "tại thời điểm viết")'));

async function fetchJson(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'fi359-sf5-convergence-audit', 'Accept': 'application/vnd.github+json' }, signal: ctrl.signal });
    return { status: res.status, json: await res.json().catch(() => null) };
  } finally {
    clearTimeout(t);
  }
}

/* ================================================================
 * T4 — links resolve / locale e2e / no dead anchor
 * ================================================================ */
function routeExists(target) {
  const [pathOnly] = target.split('#');
  let rel = pathOnly;
  if (rel.endsWith('/')) rel += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(rel)) rel += '/index.html';
  return existsSync(DIST(rel.replace(/^\//, '')));
}

function extractLinks(content) {
  const { prose } = stripFences(content); // links inside fenced examples are not real links
  const noImages = prose.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const links = [];
  for (const m of noImages.matchAll(/(?<!\!)\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g)) links.push({ target: m[1], index: m.index });
  const defs = new Map();
  for (const m of noImages.matchAll(/^\s{0,3}\[([^\]]+)\]:\s+(\S+)\s*$/gm)) defs.set(m[1].toLowerCase(), m[2]);
  for (const m of noImages.matchAll(/\[([^\]]+)\](?!\s*\(|:)/g)) {
    const t = defs.get(m[1].toLowerCase());
    if (t) links.push({ target: t, index: m.index });
  }
  return links;
}

function hasQuoteNear(content, index) {
  const w = content.slice(Math.max(0, index - 500), index + 3000);
  return /```/.test(w) || /(^|\n)\s{0,3}>/.test(w) || /[""][^""\n]{30,}[""]|"[^"\n]{30,}"/.test(w);
}

const githubArtifacts = new Map(); // path -> { count, quoted }
const t4Rows = [];
function auditLinks(list, enforce) {
  const tag = enforce ? '' : ' (seed — inventory)';
  for (const p of list) {
    const own = enforce ? `[${owner(p.slug)}]` : '[seed]';
    for (const { target, index } of extractLinks(p.content)) {
      const rel = `src/content/blog/${p.locale}/${p.slug}.md`;
      const F = (msg) => (enforce ? fail('T4', `${rel}: ${msg} ${own}`) : note('T4', `${rel}: ${msg} ${own}`));
      const N = (msg) => note('T4', `${rel}: ${msg} ${own}`);
      if (target.startsWith('#')) {
        const html = p.locale === 'vi' ? DIST('vi', 'blog', p.slug, 'index.html') : DIST('blog', p.slug, 'index.html');
        const ids = new Set([...readFileSync(html, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
        if (!ids.has(target.slice(1))) F(`in-post anchor ${target} — no id in rendered dist HTML`);
        else t4Rows.push(`${p.locale}/${p.slug} | anchor ${target} | OK`);
      } else if (target.startsWith('http://') || target.startsWith('https://')) {
        const gh = target.match(/^https?:\/\/github\.com\/wakii-dev\/hub-store\/blob\/main\/(.+?)(?:\?.*)?$/);
        const ghAny = target.match(/^https?:\/\/github\.com\/wakii-dev\//);
        if (gh) {
          const path = gh[1];
          const quoted = hasQuoteNear(p.content, index);
          const e = githubArtifacts.get(path) || { count: 0, quoted: 0 };
          e.count += 1;
          if (quoted) e.quoted += 1;
          githubArtifacts.set(path, e);
          if (!quoted) F(`GitHub artifact link without adjacent verbatim quote (anti-link-rot): ${target}`);
          else t4Rows.push(`${p.locale}/${p.slug} | hub-store artifact + quote | OK`);
        } else if (ghAny) {
          if (!hasQuoteNear(p.content, index)) F(`GitHub link without adjacent verbatim quote (anti-link-rot): ${target}`);
          else t4Rows.push(`${p.locale}/${p.slug} | github + quote | OK`);
        } else if (!target.startsWith('https://')) {
          N(`non-https external link: ${target}`);
        } else {
          t4Rows.push(`${p.locale}/${p.slug} | external | ${target}`);
        }
      } else if (target.startsWith('/')) {
        if (target.includes('#')) {
          F(`cross-file link carrying #fragment (dead-anchor rule §6): ${target}`);
          continue;
        }
        const docs = target.match(/^\/(vi\/)?docs\/([a-z0-9-]+)\/$/);
        const blog = target.match(/^\/(vi\/)?blog\/([a-z0-9-]+)\/$/);
        if (docs) {
          const isVi = Boolean(docs[1]);
          if (isVi !== (p.locale === 'vi')) F(`locale mismatch: ${p.locale} post links ${target} (D4: VI→/vi/docs/, EN→/docs/)`);
          if (!DOC_SLUGS.includes(docs[2])) F(`docs link to non-DOC_SLUGS page: ${target}`);
          if (!routeExists(target)) F(`docs link has no dist route: ${target}`);
          else t4Rows.push(`${p.locale}/${p.slug} | docs | ${target} | OK`);
        } else if (blog) {
          const isVi = Boolean(blog[1]);
          if (isVi !== (p.locale === 'vi')) N(`cross-locale blog link (${p.locale} post → ${target})`);
          if (!routeExists(target)) F(`blog cross-link has no dist route: ${target}`);
          else t4Rows.push(`${p.locale}/${p.slug} | blog | ${target} | OK`);
        } else if (routeExists(target)) {
          t4Rows.push(`${p.locale}/${p.slug} | site | ${target} | OK`);
        } else {
          F(`internal link has no dist route: ${target}`);
        }
      } else {
        N(`non-absolute link target (inventory): ${target}`);
      }
    }
  }
}
out('\n--- T4: links / locale / anchors (enforce on 40 new files; seeds NOTE-only) ---');
auditLinks(newPosts, true);
auditLinks(seedPosts.sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale)), false);
out(`link rows scanned: ${t4Rows.length} OK-classified (details above threshold in FAIL/NOTE lines)`);
out('hub-store artifacts linked (count / with-quote):');
for (const path of [...githubArtifacts.keys()].sort()) {
  const e = githubArtifacts.get(path);
  out(`    ${e.quoted}/${e.count} quoted — docs/superpowers/${path.replace(/^docs\/superpowers\//, '')}`);
}

/* spot-check exactly 3 sample links via GitHub contents API:
   top-2 most-linked hub-store paths (deterministic) + the fi338 spec drift probe.
   Allowlist (P2, security-audit 2026-09-08): only repo-relative paths under
   docs/superpowers/ may be interpolated into the API URL, whatever a post links
   (`..` rejected — URL normalization would strip the prefix after it). */
const spot = [...githubArtifacts.entries()]
  .filter(([p]) => p.startsWith('docs/superpowers/') && !p.includes('..'))
  .sort((a, b) => (b[1].count - a[1].count) || a[0].localeCompare(b[0]))
  .slice(0, 2).map(([p]) => p);
const FI338_SPEC = 'docs/superpowers/specs/2026-09-07-dispatch-queue-design.md';

/* ================================================================
 * run network probes + T5/T6/T7 (fs-only), then summary
 * ================================================================ */
const releasesProbe = fetchJson(`https://api.github.com/repos/wakii-dev/wakii/releases?per_page=6`)
  .then((r) => ({ kind: 'releases', ...r }))
  .catch((e) => ({ kind: 'releases', error: String(e && e.message || e) }));

const spotProbes = Promise.all([...spot, FI338_SPEC].map(async (path) => {
  try {
    const r = await fetchJson(`https://api.github.com/repos/wakii-dev/hub-store/contents/${path}?ref=main`);
    return { path, status: r.status, name: r.json && r.json.name };
  } catch (e) {
    return { path, error: String(e && e.message || e) };
  }
}));

/* T5 — RSS expected-live contract */
out('\n--- T5: RSS contract (dist/rss.xml, FI-339 SF-1) ---');
{
  const xml = readFileSync(DIST('rss.xml'), 'utf8');
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  // derived from inventory (FI-373 SF-1) — every present, non-draft post file,
  // both locales; no literal count to go stale when the matrix grows.
  const expectedLive = [...posts.values()].filter((p) => !p.draft).length;
  out(`items: ${items.length} (expected-live = derived from inventory: ${expectedLive} non-draft files; draft slugs: ${draftSlugs.length})`);
  if (items.length !== expectedLive) fail('T5', `rss item count ${items.length} != expected-live ${expectedLive} (draft slugs: ${draftSlugs.join(', ') || 'none'})`);
  const langs = (xml.match(/<language>/g) || []).length;
  out(`<language> elements: ${langs} (contract: 0)`);
  if (langs !== 0) fail('T5', `rss contains ${langs} <language> element(s) — bilingual feed contract forbids it`);
  let en = 0, vi = 0;
  const mismatches = [];
  for (const it of items) {
    const link = (it.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const guid = (it.match(/<guid>([^<]+)<\/guid>/) || [])[1] || '';
    const pub = (it.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    const isVi = /\/vi\/blog\//.test(link);
    const slug = (link.match(/\/(?:vi\/)?blog\/([a-z0-9-]+)\//) || [])[1];
    if (isVi) vi++; else en++;
    if (!guid.startsWith('https://')) mismatches.push(`guid not absolute https: ${guid} (${link})`);
    if (isVi !== /\/vi\/blog\//.test(guid)) mismatches.push(`guid locale path mismatch: guid=${guid} link=${link}`);
    if (guid !== link) mismatches.push(`guid != permalink: guid=${guid} link=${link}`);
    const key = `${isVi ? 'vi' : 'en'}/${slug}`;
    const p = posts.get(key);
    if (!p) mismatches.push(`rss item has no matching content file: ${key}`);
    else {
      const rssDate = new Date(pub);
      if (Number.isNaN(rssDate.valueOf())) mismatches.push(`unparseable pubDate "${pub}" for ${key}`);
      else if (rssDate.toISOString().slice(0, 10) !== p.pubDate) mismatches.push(`pubDate ${rssDate.toISOString().slice(0, 10)} != frontmatter ${p.pubDate} for ${key}`);
    }
  }
  out(`locale split: EN ${en} / VI ${vi}`);
  if (mismatches.length) for (const m of mismatches.slice(0, 12)) fail('T5', `dist/rss.xml: ${m}`);
  out(mismatches.length ? `guid/pubDate mismatches: ${mismatches.length} (first shown above in FAIL lines)` : 'guid + pubDate vs frontmatter: all consistent');
}

/* T6 — sitemap + hreflang + OG */
out('\n--- T6: sitemap + hreflang pair + OG article contract (FI-339 rev 2) ---');
{
  const sxml = readFileSync(DIST('sitemap-0.xml'), 'utf8');
  const locs = new Set([...sxml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const missingUrls = [];
  for (const p of posts.values()) {
    if (p.draft) continue;
    const u = p.locale === 'vi' ? `${SITE_URL}/vi/blog/${p.slug}/` : `${SITE_URL}/blog/${p.slug}/`;
    if (!locs.has(u)) missingUrls.push(u);
  }
  for (const l of [`${SITE_URL}/blog/`, `${SITE_URL}/vi/blog/`]) if (!locs.has(l)) missingUrls.push(l);
  // SF-6: the taxonomy routes belong in the sitemap too (posts + listings + categories).
  for (const cat of CATEGORIES) {
    for (const u of [`${SITE_URL}/blog/category/${cat}/`, `${SITE_URL}/vi/blog/category/${cat}/`]) {
      if (!locs.has(u)) missingUrls.push(u);
    }
  }
  out(`sitemap-0.xml: ${locs.size} urls; missing required (posts + listings + 6 category): ${missingUrls.length === 0 ? 'none' : missingUrls.length}`);
  for (const u of missingUrls) fail('T6', `dist/sitemap-0.xml: missing URL ${u}`);

  // Full sweep (FI-373 SF-1): the SAMPLES hard-code is gone — every present
  // post in both locales gets the hreflang/canonical/og/published_time check.
  // Non-seed = enforce (FAIL); seeds stay inventory-only (deviation → NOTE).
  let t6Ok = 0;
  for (const p of [...posts.values()].sort((a, b) => (a.slug + a.locale).localeCompare(b.slug + b.locale))) {
    if (p.draft) continue; // drafts render no dist page (lint still checks metadata)
    const htmlPath = p.locale === 'vi' ? DIST('vi', 'blog', p.slug, 'index.html') : DIST('blog', p.slug, 'index.html');
    if (!existsSync(htmlPath)) {
      const msg = `${p.locale}/${p.slug} (${scrub(htmlPath).replace(scrub(root) + '/', '')}): dist HTML missing (build stale or page dropped)`;
      if (p.isSeed) note('T6', `seed ${msg}`);
      else fail('T6', msg);
      continue;
    }
    const html = readFileSync(htmlPath, 'utf8');
    const href = new Map([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    const selfUrl = p.locale === 'vi' ? `${SITE_URL}/vi/blog/${p.slug}/` : `${SITE_URL}/blog/${p.slug}/`;
    const twinUrl = p.locale === 'vi' ? `${SITE_URL}/blog/${p.slug}/` : `${SITE_URL}/vi/blog/${p.slug}/`;
    const probs = [];
    if (href.get('en') !== (p.locale === 'en' ? selfUrl : twinUrl)) probs.push(`hreflang en=${href.get('en') || 'MISSING'}`);
    if (href.get('vi') !== (p.locale === 'vi' ? selfUrl : twinUrl)) probs.push(`hreflang vi=${href.get('vi') || 'MISSING'}`);
    if (!href.has('x-default')) probs.push('hreflang x-default MISSING');
    const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (canon !== selfUrl) probs.push(`canonical=${canon || 'MISSING'} (want self ${selfUrl})`);
    const ogType = (html.match(/<meta property="og:type" content="([^"]*)"/) || [])[1];
    if (ogType !== 'article') probs.push(`og:type=${ogType || 'MISSING'} (want article)`);
    const pub = (html.match(/<meta property="(?:article|og):published_time" content="([^"]*)"/) || [])[1];
    if (!pub || pub.slice(0, 10) !== p.pubDate) probs.push(`published_time=${pub || 'MISSING'} != frontmatter ${p.pubDate}`);
    // SF-6 supplemental: og:image per-post — absolute on site origin, hero per
    // frontmatter else /og-default.png (Base.astro pinned contract FI-339 rev 2).
    const ogImg = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
    let wantImg;
    try {
      wantImg = new URL(unquote(p.fml.heroImage || '') || '/og-default.png', SITE_URL).toString();
    } catch {
      // frontmatter is author-controlled; a malformed ABSOLUTE value must not
      // abort the audit mid-T6 (security-audit P2 2026-09-08) — report + skip.
      probs.push(`frontmatter heroImage unparseable as URL: "${unquote(p.fml.heroImage || '')}"`);
      continue;
    }
    if (ogImg !== wantImg) probs.push(`og:image=${ogImg || 'MISSING'} (want ${wantImg})`);
    // SF-6 supplemental: related-posts dist invariants (the "25 old posts"
    // contract, enforced on every present post — output intentionally changes
    // as the pool grows): ≥1 related, same-locale links, every link resolves
    // to a live non-draft route (draft leak = route exists + frontmatter draft).
    const relMatch = html.match(/<section class="bd-related"[\s\S]*?<\/section>/);
    const relSeg = relMatch ? relMatch[0] : '';
    const relHrefs = [...relSeg.matchAll(/href="(\/(?:vi\/)?blog\/([a-z0-9-]+)\/)"/g)];
    if (relHrefs.length === 0) probs.push('related section empty (invariant: ≥1 related)');
    for (const rh of relHrefs) {
      const hrefLocale = rh[1].startsWith('/vi/') ? 'vi' : 'en';
      if (hrefLocale !== p.locale) probs.push(`related link cross-locale: ${rh[1]}`);
      if (!routeExists(rh[1])) probs.push(`related link has no dist route: ${rh[1]}`);
      const rp = posts.get(`${hrefLocale}/${rh[2]}`);
      if (!rp) probs.push(`related link has no content file: ${rh[1]}`);
      else if (rp.draft) probs.push(`related link draft leak: ${rh[1]}`);
    }
    if (probs.length) {
      for (const pr of probs) {
        const msg = `${p.locale}/${p.slug} (${scrub(htmlPath).replace(scrub(root) + '/', '')}): ${pr}`;
        if (p.isSeed) note('T6', `seed ${msg}`);
        else fail('T6', msg);
      }
    } else {
      t6Ok += 1;
    }
  }
  out(`T6 full sweep: ${t6Ok} post pages OK (hreflang en+vi+x-default 2-way pair, canonical self, og:type article, published_time == frontmatter); seeds included — a seed deviation would appear as a NOTE above`);
}

/* T7 — listings + matrix gate */
out(`\n--- T7: listings (EN/VI) + frontmatter-vs-matrix ${PLANNED.size}/${PLANNED.size} (D2/D6 + DEC-6 policy a) ---`);
{
  for (const [locale, file] of [['en', DIST('blog', 'index.html')], ['vi', DIST('vi', 'blog', 'index.html')]]) {
    const html = readFileSync(file, 'utf8');
    const cards = [];
    // Listing markup since the FI-349 redesign integration: card anchor is
    // `<a class="bx…" href="/blog/<slug>/">`; category is a DISPLAY LABEL in
    // span.name (EN "tutorial" / "tech notes" / "build log", VI "hướng dẫn" /
    // "kỹ thuật" / "nhật ký xây dựng"); the date is the visible text of
    // span.dt (no <time datetime> attribute anymore).
    const CARD_LABELS = {
      tutorial: 'tutorial', 'tech notes': 'tech', 'build log': 'build-log',
      'hướng dẫn': 'tutorial', 'kỹ thuật': 'tech', 'nhật ký xây dựng': 'build-log',
    };
    for (const m of html.matchAll(/<a class="bx[^"]*" href="(\/(?:vi\/)?blog\/([a-z0-9-]+)\/)"([\s\S]*?)<\/a>/g)) {
      const isVi = m[1].startsWith('/vi/');
      if (isVi !== (locale === 'vi')) continue; // other-locale hrefs are not this listing's cards
      const label = (m[3].match(/<span class="name"[^>]*>\s*([^<]*?)\s*<\/span>/) || [])[1] || 'MISSING';
      const cat = Object.prototype.hasOwnProperty.call(CARD_LABELS, label) ? CARD_LABELS[label] : label;
      const dt = (m[3].match(/<span class="dt"[^>]*>\s*([^<]*?)\s*<\/span>/) || [])[1] || 'MISSING';
      cards.push({ slug: m[2], cat, dt });
    }
    const slugs = cards.map((c) => c.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    // live-derived expectation (FI-373 SF-1): non-draft slugs present in THIS locale
    const expectedCards = [...posts.values()].filter((p) => p.locale === locale && !p.draft).length;
    out(`dist${locale === 'vi' ? '/vi' : ''}/blog/index.html: ${cards.length} cards (want ${expectedCards}, derived from inventory), dupes: ${dupes.length === 0 ? 'none' : dupes.join(',')}`);
    if (cards.length !== expectedCards) fail('T7', `listing ${locale} has ${cards.length} cards, want ${expectedCards} (derived: non-draft slugs present in ${locale}/)`);
    if (dupes.length) fail('T7', `listing ${locale} duplicate slugs: ${dupes.join(', ')}`);
    const probs = [];
    let prev = null;
    for (const c of cards) {
      const p = posts.get(`${locale}/${c.slug}`);
      if (!p) { probs.push(`card ${c.slug} has no content file`); continue; }
      if (p.draft) probs.push(`draft leaked into listing: ${c.slug}`);
      if (c.cat !== p.category) probs.push(`card ${c.slug} category ${c.cat} != frontmatter ${p.category}`);
      if (c.dt.slice(0, 10) !== p.pubDate) probs.push(`card ${c.slug} date ${c.dt.slice(0, 10)} != frontmatter ${p.pubDate}`);
      // DEC-6 policy (a): a future date is legitimate when it equals the
      // post's matrix row (scheduled announce); only a future date that does
      // NOT match its matrix pubDate is a FAIL.
      if (c.dt.slice(0, 10) > TODAY) {
        const row = PLANNED.get(c.slug);
        if (!row || p.pubDate !== row.pubDate) {
          probs.push(`card ${c.slug} future date ${c.dt.slice(0, 10)} — pubDate not matching its matrix row (policy a: future only with scheduled matrix date)`);
        } else {
          note('T7', `card ${c.slug} future date ${row.pubDate} == matrix #${row.n} — scheduled (matrix #${row.n}) — policy (a)`);
        }
      }
      if (prev && c.dt > prev) probs.push(`sort violation at ${c.slug}: ${c.dt} after ${prev} (want pubDate DESC)`);
      prev = c.dt;
    }
    if (probs.length) for (const pr of probs) fail('T7', `listing ${locale}: ${pr}`);
    else out(`listing ${locale}: badges + dates match frontmatter, no drafts, no future dates outside matrix, pubDate DESC — OK`);
  }

  // SF-6 supplemental: the 6 category pages — card count must equal the
  // non-draft frontmatter category total for that locale, no dupes, and every
  // card genuinely belongs to the category (count-honesty, not just markup).
  for (const cat of CATEGORIES) {
    for (const locale of ['en', 'vi']) {
      const file = locale === 'vi' ? DIST('vi', 'blog', 'category', cat, 'index.html') : DIST('blog', 'category', cat, 'index.html');
      if (!existsSync(file)) {
        fail('T7', `category page missing: dist/${locale === 'vi' ? 'vi/' : ''}blog/category/${cat}/`);
        continue;
      }
      const html = readFileSync(file, 'utf8');
      const allCards = [];
      for (const m of html.matchAll(/<a class="bx[^"]*" href="(\/(?:vi\/)?blog\/([a-z0-9-]+)\/)"([\s\S]*?)<\/a>/g)) {
        allCards.push({ href: m[1], slug: m[2] });
      }
      // a cross-locale card link is a locale leak — counted out of catCards but never silent
      const crossLocale = allCards.filter((c) => c.href.startsWith('/vi/') !== (locale === 'vi'));
      const catCards = allCards.filter((c) => c.href.startsWith('/vi/') === (locale === 'vi')).map((c) => c.slug);
      const expected = [...posts.values()].filter((p) => p.locale === locale && !p.draft && p.category === cat).length;
      const dupes = catCards.filter((s, i) => catCards.indexOf(s) !== i);
      const foreign = [...new Set(catCards.filter((s) => {
        const cp = posts.get(`${locale}/${s}`);
        return !cp || cp.category !== cat;
      }))];
      out(`category ${cat} (${locale}): ${catCards.length} cards (want ${expected}), dupes: ${dupes.length === 0 ? 'none' : dupes.join(',')}${foreign.length ? `, foreign: ${foreign.join(',')}` : ''}`);
      if (catCards.length !== expected) fail('T7', `category page ${locale}/${cat}: ${catCards.length} cards, want ${expected} (non-draft frontmatter total)`);
      if (dupes.length) fail('T7', `category page ${locale}/${cat}: duplicate cards ${dupes.join(', ')}`);
      for (const s of foreign) fail('T7', `category page ${locale}/${cat}: card ${s} does not belong to category ${cat}`);
      for (const c of crossLocale) fail('T7', `category page ${locale}/${cat}: cross-locale card link ${c.href} (locale leak)`);
    }
  }

  // matrix gate — BOTH tables (already parsed up top; no per-table re-read here).
  // Batch-1: a row without files is a REGRESSION (those posts shipped with
  // FI-359) → FAIL. Batch-2: a row without files is EXPECTED mid-story →
  // NOTE "pending (owner SF-x)"; rows with files get the same enforcement.
  out(`matrix rows parsed: batch-1 ${BATCH1.size} (want 20) + batch-2 ${BATCH2.size} (want 44) = ${PLANNED.size} (want 64)`);
  if (BATCH1.size !== 20) fail('T7', `topic-matrix.md: parsed ${BATCH1.size} rows, want 20`);
  if (BATCH2.size !== 44) fail('T7', `topic-matrix-batch2.md: parsed ${BATCH2.size} rows, want 44`);
  if (PLANNED.size !== 64) fail('T7', `combined matrix: ${PLANNED.size} unique slugs, want 64 (slug collision between tables?)`);
  let okRows = 0;
  const matrixFails = [];
  const pendingRows = [];
  for (const [slug, row] of PLANNED) {
    const en = posts.get(`en/${slug}`);
    const vi = posts.get(`vi/${slug}`);
    if (!en && !vi) {
      if (BATCH1.has(slug)) matrixFails.push(`#${row.n} ${slug}: EN+VI files missing (batch-1 regression guard)`);
      else pendingRows.push(`#${row.n} ${slug} — pending (owner ${owner(slug)})`);
      continue;
    }
    const bad = [];
    for (const [tag, p] of [['EN', en], ['VI', vi]]) {
      if (!p) { bad.push(`${tag} file missing`); continue; }
      if (p.category !== row.cat) bad.push(`${tag} category "${p.category}" != matrix "${row.cat}"`);
      if (p.pubDate !== row.pubDate) bad.push(`${tag} pubDate ${p.pubDate} != matrix ${row.pubDate}`);
    }
    if (bad.length) matrixFails.push(`#${row.n} ${slug}: ${bad.join('; ')}`);
    else okRows += 1;
  }
  out(`matrix gate: slug + category + pubDate match ${okRows}/${PLANNED.size}; batch-2 pending (NOTE): ${pendingRows.length}`);
  for (const f of matrixFails) fail('T7', `matrix mismatch — ${f}`);
  for (const p of pendingRows) note('T7', `matrix row ${p}`);
  // extra slugs not in matrix/seeds
  for (const p of posts.values()) {
    if (!PLANNED.has(p.slug) && !SEED_SLUGS.includes(p.slug)) note('T7', `file outside matrix+seeds: ${p.locale}/${p.slug}.md`);
  }
}

/* network probe results (T3d + T4 spot-check) */
const rel = await releasesProbe;
if (rel.error) {
  note('T3', `releases drift probe unavailable (network): ${rel.error} — manual: gh release list --repo wakii-dev/wakii --limit 6 vs snapshot ${Object.entries(SNAPSHOT.releases).map(([t, d]) => `${t}@${d.slice(0, 10)}`).join(' ')}`);
} else if (!Array.isArray(rel.json)) {
  /* P1 fix (security-audit 2026-09-08): rate-limit/403 returns an object —
     .map on it used to throw uncaught and leak paths via stderr. */
  note('T3', `releases probe returned non-array (rate-limit or API change) — manual: gh release list --repo wakii-dev/wakii --limit 6 vs snapshot ${Object.entries(SNAPSHOT.releases).map(([t, d]) => `${t}@${d.slice(0, 10)}`).join(' ')}`);
} else {
  const tags = rel.json.map((r) => `${r.tag_name} ${r.published_at}`);
  out(`    releases probe (api.github.com, top ${rel.json.length}): ${tags.join(' | ')}`);
  for (const [tag, date] of Object.entries(SNAPSHOT.releases)) {
    const hit = rel.json.find((r) => r.tag_name === tag);
    if (!hit) note('T3', `DRIFT: release ${tag} from snapshot no longer in top 6`);
    else if ((hit.published_at || '').slice(0, 10) !== date.slice(0, 10)) note('T3', `DRIFT: release ${tag} published ${hit.published_at} vs snapshot ${date}`);
  }
  if (rel.json.some((r) => r.tag_name === SNAPSHOT.forbiddenRelease)) note('T3', `DRIFT: ${SNAPSHOT.forbiddenRelease} NOW EXISTS (snapshot said absent) — re-check posts that call it absent`);
}

out('    hub-store spot-check (exactly 3):');
const spotResults = await spotProbes;
for (const s of spotResults) {
  const linked = spot.includes(s.path);
  if (s.error) {
    note('T4', `spot-check ${s.path}: probe error ${s.error}`);
  } else if (s.status === 200) {
    out(`      200 OK — ${s.path}${linked ? '' : ' (drift probe: memory-flagged path EXISTS now)'}`);
  } else if (s.status === 404) {
    if (linked) note('T4', `spot-check ${s.path}: 404 — quote present in post → NOTE per contract (fix link after merge = coordinator)`);
    else note('T4', `spot-check ${s.path}: 404 — drift probe (memory flag: fi338 spec on hub-store main); no post links it`);
  } else {
    note('T4', `spot-check ${s.path}: HTTP ${s.status}`);
  }
}

/* ---------- summary ---------- */
out('\n=== SUMMARY ===');
let anyFail = false;
for (const c of CHECKS) {
  const verdict = fails[c].length > 0 ? 'FAIL' : (notes[c].length > 0 ? 'NOTE' : 'PASS');
  if (fails[c].length > 0) anyFail = true;
  out(`${c}: ${verdict} — fails: ${fails[c].length}, notes: ${notes[c].length}`);
  for (const f of fails[c]) out(`  FAIL ${f}`);
  for (const n of notes[c]) out(`  NOTE ${n}`);
}
out(anyFail ? 'AUDIT: FAIL (content deviations — escalate to owning SF; QA does not fix)' : 'AUDIT: PASS (all enforceable checks clean)');
process.exit(anyFail ? 1 : 0);
