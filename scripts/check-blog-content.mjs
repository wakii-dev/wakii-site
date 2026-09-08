#!/usr/bin/env node
/**
 * Build-time assertion: blog content rules for the 20 NEW longform slugs
 * (story FI-359, decision D5).
 *
 * Scope: ONLY the 20 new slugs listed in NEW_SLUGS. The 5 SEED_SLUGS are the
 * frozen exclusion list — seeds are exempt from the word band and the locale
 * docs-link rule (their 350-500 word band is the approved FI-341 standard).
 * A slug is checked only when its file exists in the tree, so a mid-story
 * worktree stays green (partial pass by design — matrix completeness is
 * SF-5's job, not lint's).
 *
 * Checks per new-slug file:
 *   1. Word band (decision D1 — body after frontmatter, fenced code blocks
 *      excluded, split on /\s+/): VI 900-1400 (warn >1400, fail >1470),
 *      EN floor 800. `draft: true` → "skipped-draft" (band + docs-link
 *      skipped, so a late-SF fallback post never breaks the build; frontmatter,
 *      kebab and forbidden-phrase checks still apply).
 *   2. ≥1 docs link in prose: EN `](/docs/<slug>/)`, VI `](/vi/docs/<slug>/)`,
 *      slug ∈ DOC_SLUGS.
 *   3. Frontmatter: 6 required fields, types per src/content.config.ts.
 *   4. Forbidden phrases from claims-registry.md (## FORBIDDEN section,
 *      one literal per `- ` line, case-insensitive) — grepped on the FULL
 *      file (claims can hide in title/description too).
 *   5. kebab-case filename — checked on every blog .md (pure filename
 *      hygiene; all seeds pass it, so it cannot fail on frozen files).
 *
 * The forbidden list is parsed from the registry at run time — the registry
 * is the single source of truth, the script never duplicates it.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = join(root, 'src', 'content', 'blog');
const registryPath = join(
  root,
  'docs',
  'superpowers',
  'editorial',
  '2026-blog-longform',
  'claims-registry.md',
);

/** Frozen scope (story FI-359) — mirrors topic-matrix.md. Never edit casually. */
const SEED_SLUGS = [
  'review-ai-agents-from-your-phone',
  'story-workflow-idea-to-release',
  'decision-gates-safe-ai-agents',
  'forking-an-ide-keeping-current-with-upstream',
  'building-wakii-in-the-open-log-1',
];
const NEW_SLUGS = [
  'zero-setup-agent-team',
  'nine-agents-separated-powers',
  'gates-not-trust-rule-zero',
  'watchdog-idle-is-not-dead',
  'story-memory-learning-loop',
  'defensive-by-design',
  'controlled-rework-rollback',
  'long-tasks-bracket-tiers',
  'parallel-worktrees-isolation',
  'linear-as-external-memory',
  'one-branch-one-pr',
  'done-means-evidence',
  'convergence-qa-last-tier',
  'shipping-cadence-two-releases-one-day',
  'blog-story-case-study',
  'wakii-in-production-hub-store',
  'og-article-contract-anatomy',
  'rss-bilingual-feed-anatomy',
  'skills-catalog-tour',
  'building-wakii-in-the-open-log-2',
];

/** Mirror of DOC_SLUGS in src/config.ts (this script cannot import TS). */
const DOC_SLUGS = ['getting-started', 'superpowers-panel', 'story-workflow', 'agents-and-kit', 'faq'];

const CATEGORY_ENUM = ['tutorial', 'tech', 'build-log'];

/* Word band, decision D1 (words = prose excluding fenced blocks). */
const VI_MIN = 900;
const VI_WARN = 1400;
const VI_HARD = 1470;
const EN_MIN = 800;

const REQUIRED_FIELDS = ['title', 'description', 'pubDate', 'category', 'tags', 'draft'];

/** Literals from the registry's `## FORBIDDEN` section (one per `- ` line,
 *  reason stripped at the " — " separator). Section parse stops at the next
 *  `## ` heading — the review-only variants section is ignored by design. */
function forbiddenPhrases() {
  if (!existsSync(registryPath)) {
    console.error(`✗ blog content FAILED: claims registry missing at ${registryPath}`);
    process.exit(1);
  }
  const src = readFileSync(registryPath, 'utf8');
  const start = src.match(/^## FORBIDDEN\s*$/m);
  if (!start) {
    console.error('✗ blog content FAILED: claims registry has no `## FORBIDDEN` section');
    process.exit(1);
  }
  const rest = src.slice(start.index + start[0].length);
  const end = rest.indexOf('\n## ');
  const section = end === -1 ? rest : rest.slice(0, end);
  const phrases = [];
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('- ')) continue;
    const phrase = t.slice(2).split(' — ')[0].trim();
    if (phrase) phrases.push(phrase);
  }
  if (phrases.length === 0) {
    console.error('✗ blog content FAILED: `## FORBIDDEN` section has no `- ` lines');
    process.exit(1);
  }
  return phrases;
}

/** Body after the frontmatter pair (leading `---` … `---`). */
function splitFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: '', body: content, fmlError: 'file must start with `---`' };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: '', body: '', fmlError: 'frontmatter has no closing `---`' };
  const frontmatter = content.slice(4, end);
  const body = content.slice(end + 4).replace(/^\n/, '');
  return { frontmatter, body, fmlError: null };
}

/** D1: strip fenced blocks (unclosed fence = unbalanced), count /\s+/ words. */
function proseStats(body) {
  const lines = body.split('\n');
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
  const prose = kept.join('\n');
  return { words: prose.split(/\s+/).filter(Boolean).length, prose, balanced: fences % 2 === 0 };
}

/** Simple per-line key reader for the flat frontmatter this collection uses. */
function parseFields(frontmatter) {
  const fields = {};
  for (const line of frontmatter.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

function unquote(value) {
  return value.replace(/^["'](.*)["']$/s, '$1').trim();
}

function parseTags(value) {
  const t = value.trim();
  if (!t.startsWith('[') || !t.endsWith(']')) return { error: 'tags must be an array like ["a", "b"]' };
  const items = t
    .slice(1, -1)
    .split(',')
    .map((s) => unquote(s.trim()))
    .filter(Boolean);
  return { tags: items };
}

function checkNewSlugFile(locale, slug, content, phrases, errors, warnings, skips) {
  const rel = `${locale}/${slug}.md`;
  const fileErrors = [];
  const { frontmatter, body, fmlError } = splitFrontmatter(content);

  // Frontmatter (always checked — a draft still cannot carry bad metadata).
  if (fmlError) {
    fileErrors.push(`frontmatter: ${fmlError}`);
  } else {
    const fields = parseFields(frontmatter);
    for (const key of REQUIRED_FIELDS) {
      if (!(key in fields)) fileErrors.push(`frontmatter: missing \`${key}\``);
    }
    if (fileErrors.length === 0) {
      if (!unquote(fields.title)) fileErrors.push('frontmatter: `title` must be a non-empty string');
      if (!unquote(fields.description)) fileErrors.push('frontmatter: `description` must be a non-empty string');
      const date = new Date(unquote(fields.pubDate));
      if (Number.isNaN(date.valueOf())) fileErrors.push(`frontmatter: \`pubDate\` not parseable ("${fields.pubDate}")`);
      if (!CATEGORY_ENUM.includes(unquote(fields.category))) {
        fileErrors.push(`frontmatter: \`category\` "${fields.category}" not in ${CATEGORY_ENUM.join(' | ')}`);
      }
      const tags = parseTags(fields.tags);
      if (tags.error) fileErrors.push(`frontmatter: ${tags.error}`);
      if (fields.draft !== 'true' && fields.draft !== 'false') {
        fileErrors.push('frontmatter: `draft` must be boolean true/false');
      }

      const isDraft = fields.draft === 'true';
      const stats = proseStats(body);
      if (!stats.balanced) fileErrors.push('body: unclosed fenced code block (``` opened but never closed)');

      if (isDraft) {
        skips.push(`${rel} — skipped-draft (band + docs-link skipped, D7 fallback)`);
      } else {
        // Word band (D1).
        const words = stats.words;
        if (locale === 'vi') {
          if (words < VI_MIN) fileErrors.push(`band: ${words} words < VI floor ${VI_MIN} (D1)`);
          else if (words > VI_HARD) fileErrors.push(`band: ${words} words > VI hard cap ${VI_HARD} (D1)`);
          else if (words > VI_WARN) warnings.push(`${rel} — ${words} words > VI warn band ${VI_WARN} (still passing, trim before QA)`);
        } else if (words < EN_MIN) {
          fileErrors.push(`band: ${words} words < EN floor ${EN_MIN} (D1)`);
        }

        // Docs link, D4 — checked on prose (fenced blocks excluded).
        const docPattern = locale === 'vi'
          ? /\]\(\/vi\/docs\/([a-z0-9-]+)\/\)/g
          : /\]\(\/docs\/([a-z0-9-]+)\/\)/g;
        const expected = locale === 'vi' ? '/vi/docs/' : '/docs/';
        let found = false;
        for (const m of stats.prose.matchAll(docPattern)) {
          if (DOC_SLUGS.includes(m[1])) {
            found = true;
            break;
          }
        }
        if (!found) {
          fileErrors.push(`link: no docs link to a DOC_SLUGS page under ${expected} (D4)`);
        }
      }
    }
  }

  // Forbidden phrases — full file, case-insensitive.
  const lower = content.toLowerCase();
  for (const phrase of phrases) {
    if (lower.includes(phrase.toLowerCase())) {
      fileErrors.push(`claims: forbidden phrase "${phrase}" (claims-registry ## FORBIDDEN)`);
    }
  }

  if (fileErrors.length > 0) errors.push({ file: rel, messages: fileErrors });
}

const phrases = forbiddenPhrases();
const errors = [];
const warnings = [];
const skips = [];
let checked = 0;

for (const locale of ['en', 'vi']) {
  const dir = join(blogDir, locale);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

  // kebab-case hygiene on every blog file (all seeds pass it — frozen, safe).
  for (const f of files) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(f)) {
      errors.push({ file: `${locale}/${f}`, messages: ['filename: not kebab-case (expected like zero-setup-agent-team.md)'] });
    }
  }

  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    if (!NEW_SLUGS.includes(slug)) continue; // seeds + out-of-matrix slugs: out of scope
    checked += 1;
    const content = readFileSync(join(dir, f), 'utf8');
    checkNewSlugFile(locale, slug, content, phrases, errors, warnings, skips);
  }
}

for (const s of skips) console.log(`  ◦ skipped-draft: ${s}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);

if (errors.length > 0) {
  console.error('✗ blog content FAILED (src/content/blog/):');
  for (const e of errors) {
    console.error(`  ${e.file}:`);
    for (const m of e.messages) console.error(`    - ${m}`);
  }
  console.error('  Rules: docs/superpowers/editorial/2026-blog-longform/ (style-guide D1/D4, claims-registry).');
  process.exit(1);
}

console.log(
  `✓ blog content OK (${checked} new-slug file${checked === 1 ? '' : 's'} checked, ` +
    `${skips.length} skipped-draft, ${SEED_SLUGS.length} seeds exempt)`
);
