import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Docs content — locale subdirectories strategy, LOCKED at SF-1.
 *   src/content/docs/en/<slug>.md   (source of truth)
 *   src/content/docs/vi/<slug>.md   (translation; may lag EN → lang switcher falls back to EN)
 *
 * Entry ids look like `en/getting-started` / `vi/getting-started`.
 * Use `docLocale()` / `docSlug()` helpers to split them.
 */
const docs = defineCollection({
  loader: glob({ pattern: ['en/*.md', 'vi/*.md'], base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** Docs order in the sidebar (SF-3 consumes). */
    order: z.number().default(0),
  }),
});

/**
 * Blog content — same locale subdirectories strategy as docs (LOCKED i18n:
 * EN at /blog, VI at /vi/blog). Entry ids like `en/my-post` / `vi/my-post`.
 */
const blog = defineCollection({
  loader: glob({ pattern: ['en/*.md', 'vi/*.md'], base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    /** tutorial | tech | build-log — drives the listing badge. */
    category: z.enum(['tutorial', 'tech', 'build-log']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /**
     * Optional hero tile — public path to a 1200×630 PNG (spec FI-349 D5:
     * string path in public/, no astro:assets). Posts without one fall back
     * to /og-default.png in the og wiring. VI mirror shares the EN hero.
     */
    heroImage: z.string().optional(),
    /** Single-author default — multi-author is a future additive union (FI-349 D4). */
    author: z.string().default('Wakii team'),
  }),
});

export const collections = { docs, blog };

export function docLocale(id: string): 'en' | 'vi' {
  return id.startsWith('vi/') ? 'vi' : 'en';
}

export function docSlug(id: string): string {
  return id.replace(/^(en|vi)\//, '');
}

export function blogLocale(id: string): 'en' | 'vi' {
  return id.startsWith('vi/') ? 'vi' : 'en';
}

export function blogSlug(id: string): string {
  return id.replace(/^(en|vi)\//, '');
}
