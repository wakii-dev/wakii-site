import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL } from '../config';

/** RSS feed — all published posts, both locales (guid = full URL so entries are unique). */
export async function GET(context) {
  const posts = (await getCollection('blog', (b) => !b.data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return rss({
    title: `${SITE_NAME} blog`,
    description:
      'Tutorials, tech notes and build logs — agentic workflows and shipping software with AI agents.',
    site: context.site ?? SITE_URL,
    items: posts.map((post) => {
      const locale = post.id.startsWith('vi/') ? 'vi' : 'en';
      const prefix = locale === 'vi' ? '/vi' : '';
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `${prefix}/blog/${post.id.replace(/^(en|vi)\//, '')}/`
      };
    }),
    customData: '<language>en-vi</language>'
  });
}
