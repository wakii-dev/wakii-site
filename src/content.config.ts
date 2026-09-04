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

export const collections = { docs };

export function docLocale(id: string): 'en' | 'vi' {
  return id.startsWith('vi/') ? 'vi' : 'en';
}

export function docSlug(id: string): string {
  return id.replace(/^(en|vi)\//, '');
}
