import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL } from '../config';
import { blogSlug } from '../content.config';

/**
 * RSS feed — all published posts, both locales.
 * Contract (FI-339 SF-1): bilingual feed → NO <language> element; every item
 * carries an explicit <guid> = absolute permalink URL (unique per locale).
 */
export async function GET(context) {
  const site = context.site ?? SITE_URL;
  const posts = (await getCollection('blog', (b) => !b.data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return rss({
    title: `${SITE_NAME} blog`,
    description:
      'Tutorials, tech notes and build logs — agentic workflows and shipping software with AI agents.',
    site,
    items: posts.map((post) => {
      const locale = post.id.startsWith('vi/') ? 'vi' : 'en';
      const prefix = locale === 'vi' ? '/vi' : '';
      const link = `${prefix}/blog/${blogSlug(post.id)}/`;
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link,
        customData: `<guid>${new URL(link, site).href}</guid>`
      };
    })
  });
}
