#!/usr/bin/env node
/**
 * Crawler-UA probe harness (story VU-5 SF-3, D12) — proves the social
 * meta is visible to CRAWLERS, not just to browsers.
 *
 * Fetches pages from a running preview/prod server once per crawler
 * User-Agent (facebookexternalhit, Twitterbot, Slackbot, TelegramBot,
 * Discordbot) and prints the og/twitter meta each crawler sees, per
 * page. Server default http://localhost:4321 (astro preview) — override
 * with --url http://host:port. Post path is derived from dist/ (no
 * hand-picked slug); run the build first.
 *
 * Usage:  pnpm preview &  then  node scripts/crawler-probe.mjs
 * Exit 1 if any crawler misses a required key on any page; else 0.
 */
import { readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CRAWLERS = [
  ['facebook', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
  ['twitter', 'Twitterbot/1.0'],
  ['slack', 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
  ['telegram', 'TelegramBot (like TwitterBot)'],
  ['discord', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'],
];

/** Keys every crawler must see for the unfurl card to be complete. */
const REQUIRED = ['og:title', 'og:description', 'og:image', 'og:site_name', 'og:locale', 'twitter:image'];

const argUrl = process.argv[process.argv.indexOf('--url') + 1];
const base = (argUrl && !argUrl.startsWith('-') ? argUrl : 'http://localhost:4321').replace(/\/$/, '');

/* Pages: landing + first EN post from dist (derived, deterministic). */
const pages = ['/'];
const blogDir = join(root, 'dist', 'blog');
if (existsSync(blogDir)) {
  const first = readdirSync(blogDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'category')
    .map((e) => e.name)
    .sort()[0];
  if (first) pages.push(`/blog/${first}/`);
} else {
  console.error('✗ crawler-probe: no dist/blog — run `pnpm build` first');
  process.exit(1);
}

/* Quote-aware meta tag scan (same shape as check-og.mjs — Astro leaves
   < / > unescaped inside attribute values). */
const META_TAG_RE = /<meta\b(?:"[^"]*"|'[^']*'|[^>"'])*>/gi;

function extractMeta(html) {
  const meta = new Map();
  for (const tag of html.matchAll(META_TAG_RE)) {
    const key = tag[0].match(/\b(?:property|name)=["']([^"']+)["']/i)?.[1];
    if (!key || !/^(og:|twitter:)/.test(key) || meta.has(key)) continue;
    const val = tag[0].match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? '';
    meta.set(
      key,
      val
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    );
  }
  return meta;
}

const clip = (s, n = 72) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

let missingTotal = 0;
for (const page of pages) {
  console.log(`\n=== ${base}${page} ===`);
  for (const [name, ua] of CRAWLERS) {
    let meta = new Map();
    let note = '';
    try {
      const res = await fetch(`${base}${page}`, {
        headers: { 'User-Agent': ua },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status !== 200) {
        note = `HTTP ${res.status}`;
        await res.body?.cancel();
      } else {
        meta = extractMeta(await res.text());
      }
    } catch (e) {
      note = `fetch failed (${e?.cause?.code ?? e.message})`;
    }
    console.log(`\n  crawler: ${name}  (${ua})${note ? `  — ${note}` : ''}`);
    if (meta.size === 0 && note) {
      missingTotal += REQUIRED.length;
      continue;
    }
    const missing = REQUIRED.filter((k) => !meta.get(k)?.trim());
    missingTotal += missing.length;
    for (const k of ['og:title', 'og:description', 'og:image', 'og:site_name', 'og:locale', 'og:type', 'twitter:card', 'twitter:image']) {
      const v = meta.get(k);
      console.log(`    ${k.padEnd(15)} ${v ? clip(v) : '— MISSING —'}`);
    }
    if (missing.length > 0) console.log(`    ✗ ${name}: missing ${missing.join(', ')}`);
  }
}

console.log(
  missingTotal === 0
    ? `\n✓ crawler-probe OK — ${CRAWLERS.length}/${CRAWLERS.length} crawlers see complete og meta on ${pages.length} page(s)`
    : `\n✗ crawler-probe FAILED — ${missingTotal} required meta key(s) missing across crawlers/pages`
);
process.exit(missingTotal === 0 ? 0 : 1);
