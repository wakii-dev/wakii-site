# wakii-site

Official website for **[Wakii](https://wakii.dev)** — *the agentic IDE with a
built-in superpowers team*.

Built with [Astro](https://astro.build) and deployed on Vercel. Bilingual
(English / Tiếng Việt) with a static, content-first architecture.

## Pages

| Route            | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `/`              | Landing page — product positioning, feature highlights, CTAs                |
| `/skills`        | Catalog of Wakii's 20 built-in skills (slash commands, EN + VI descriptions) |
| `/docs/*`        | Guides: getting started, superpowers panel, story workflow, agents & kit, FAQ |
| `/roadmap`       | Public roadmap — Now / Next / Later                                          |
| `/download`      | Direct downloads for macOS & Windows, QR code for mobile connect             |
| `/vi/*`          | Vietnamese version of the site                                              |

## Development

```bash
pnpm install
pnpm dev      # local dev server
pnpm build    # static build to dist/
pnpm preview  # preview the production build
```

Requires Node 18.17+ (Astro 5).

## Project structure

```
src/
  config.ts        # single source of truth: REPO_URL, SITE_URL, SITE_NAME,
                   # SITE_TAGLINE, DOC_SLUGS (locked contract), download flags
  content/docs/    # markdown docs (content collections)
  data/            # skills.ts (20-skill catalog), roadmap.ts (Now/Next/Later)
  i18n/            # EN + VI strings (landing, download, …)
  components/      # Astro components
  layouts/         # page layouts
  pages/           # file-based routes (+ /vi locale mirror, 404, robots.txt)
public/            # static assets
```

### Editing content

- **Docs** — add/edit markdown under `src/content/docs/`. The doc slugs are a
  locked contract (`DOC_SLUGS` in `src/config.ts`): `getting-started`,
  `superpowers-panel`, `story-workflow`, `agents-and-kit`, `faq`.
- **Skills catalog** — `src/data/skills.ts` mirrors the frontmatter of the 20
  skills in the product; `public: true` marks catalog-worthy skills.
- **Roadmap** — `src/data/roadmap.ts`, grouped by `Now / Next / Later`
  (bilingual labels).
- **Download flags** — direct-download availability is flag-controlled in
  `src/config.ts` (story FI-300). Flag flips are **user/manual only**.

## Deployment

The site deploys to **Vercel** (`vercel.json` + `.vercel/` project link).
Canonical production URL: `https://wakii.dev` — sitemap and `robots.txt`
derive from `SITE_URL` in `src/config.ts`.

> `REPO_URL` in `src/config.ts` currently points to a placeholder (the product
> fork is private). The pre-publish checklist must confirm it before the site
> goes public.

## Contributors

- **HoiVu** — author / product owner
- **Claude** (Anthropic) — AI coding agent
- **Kiro** (AWS) — AI coding agent
