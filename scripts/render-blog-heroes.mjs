#!/usr/bin/env node
/**
 * Hero tile pipeline (story FI-349 SF-1): SVG template per post → headless
 * Chrome screenshot → public/blog/heroes/<slug>.png (1200×630, brand mint on
 * dark — same DNA as public/og-default.svg).
 *
 * - SVG sources are committed next to the PNGs so the tiles stay reviewable
 *   and re-renderable; the PNG is the canonical asset referenced by
 *   frontmatter `heroImage` (public path — spec D5, no astro:assets).
 * - `building-wakii-in-the-open-log-1` deliberately has NO hero: it exercises
 *   the og-default fallback path (spec SF-1 pin).
 * - VI mirrors share the EN hero — 4 PNGs total.
 *
 * Usage: node scripts/render-blog-heroes.mjs [--check]
 *   --check  verify existing PNG dimensions without re-rendering (IHDR read).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'blog', 'heroes');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHECK_ONLY = process.argv.includes('--check');

/** Posts that get a hero — building-wakii-in-the-open-log-1 stays hero-less (fallback demo). */
const HERO_SLUGS = [
  'decision-gates-safe-ai-agents',
  'forking-an-ide-keeping-current-with-upstream',
  'review-ai-agents-from-your-phone',
  'story-workflow-idea-to-release',
];

function readTitleAndCategory(slug) {
  const raw = readFileSync(join(root, 'src', 'content', 'blog', 'en', `${slug}.md`), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
  const field = (name) => fm.match(new RegExp(`^${name}:\\s*"?(.*?)"?$`, 'm'))[1].trim();
  return { title: field('title'), category: field('category') };
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Word-wrap for the mono title: chars/line from font size (Menlo ~0.6em advance). */
function wrap(text, size) {
  const perLine = Math.floor(880 / (size * 0.6));
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && `${line} ${w}`.length > perLine) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function heroSvg(title, category) {
  const size = title.length <= 40 ? 60 : title.length <= 70 ? 52 : 44;
  const lines = wrap(title, size);
  const lineHeight = Math.round(size * 1.28);
  const titleStart = 560 - lines.length * lineHeight - 76;
  const categoryLabels = { tutorial: 'tutorial', tech: 'tech notes', 'build-log': 'build log' };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- hero ${esc(title).replace(/--/g, '—')} — brand mono aesthetic (tokens.css: bg #0A0E0D, accent #45E0A8, text #D7E2DD, dim #6B7A74).
       Re-render: node scripts/render-blog-heroes.mjs -->
  <defs>
    <radialGradient id="glow" cx="30%" cy="34%" r="60%">
      <stop offset="0%" stop-color="#45E0A8" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#45E0A8" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#45E0A8" fill-opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#0A0E0D"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#45E0A8" stroke-opacity="0.18" stroke-width="2" rx="16"/>

  <g font-family="'JetBrains Mono', Menlo, monospace">
    <text x="120" y="${titleStart - 78}" font-size="42" font-weight="700">
      <tspan fill="#6B7A74">~/</tspan><tspan fill="#D7E2DD">wakii</tspan><tspan fill="#45E0A8">.</tspan>
    </text>
    <text x="120" font-size="${size}" font-weight="700" fill="#D7E2DD">
${lines.map((l, i) => `    <tspan x="120" y="${titleStart + i * lineHeight}">${esc(l)}</tspan>`).join('\n')}
    </text>
    <text x="120" y="${titleStart + lines.length * lineHeight + 18}" font-size="30" fill="#45E0A8"># ${esc(categoryLabels[category] ?? category)}</text>
  </g>

  <text x="1120" y="548" font-family="'JetBrains Mono', Menlo, monospace" font-size="26" fill="#6B7A74" text-anchor="end">wakii.xyz</text>
</svg>
`;
}

/** PNG IHDR: width @ byte 16, height @ byte 20 (big-endian). */
function pngSize(path) {
  const buf = readFileSync(path);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

if (CHECK_ONLY) {
  let bad = 0;
  for (const slug of HERO_SLUGS) {
    const png = join(outDir, `${slug}.png`);
    if (!existsSync(png)) {
      console.error(`✗ missing ${png}`);
      bad += 1;
      continue;
    }
    const { w, h } = pngSize(png);
    if (w !== 1200 || h !== 630) {
      console.error(`✗ ${slug}.png is ${w}×${h}, expected 1200×630`);
      bad += 1;
    } else {
      console.log(`✓ ${slug}.png ${w}×${h}`);
    }
  }
  process.exit(bad ? 1 : 0);
}

mkdirSync(outDir, { recursive: true });
for (const slug of HERO_SLUGS) {
  const { title, category } = readTitleAndCategory(slug);
  const svgPath = join(outDir, `${slug}.svg`);
  const pngPath = join(outDir, `${slug}.png`);
  writeFileSync(svgPath, heroSvg(title, category));
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--screenshot=${pngPath}`,
    '--window-size=1200,630',
    `file://${svgPath}`,
  ]);
  const { w, h } = pngSize(pngPath);
  if (w !== 1200 || h !== 630) {
    console.error(`✗ ${slug}.png rendered ${w}×${h}, expected 1200×630 — NOT overwriting a bad tile silently`);
    process.exit(1);
  }
  console.log(`✓ ${slug}.png ${w}×${h} (${title})`);
}
console.log(`✓ ${HERO_SLUGS.length} heroes rendered to public/blog/heroes/`);
