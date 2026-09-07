/**
 * Blog listing view-models (story FI-349 SF-3).
 *
 * Shared by the listing index pages and the taxonomy pages: one mapping from
 * a collection entry to the plain object PostCard renders. Locale-aware
 * hrefs follow the locked i18n contract (EN at /blog, VI at /vi/blog).
 * Reading time is the SF-1 computed util — never hardcoded.
 */
import type { CollectionEntry } from 'astro:content';
import { blogSlug } from '../../content.config';
import { postReadingTime } from '../../utils/blog';

export interface PostCardPost {
  href: string;
  title: string;
  description: string;
  category: string;
  /** YYYY-MM-DD */
  date: string;
  minutes: number;
  heroImage?: string;
}

export function toCard(post: CollectionEntry<'blog'>): PostCardPost {
  const isVi = post.id.startsWith('vi/');
  return {
    href: `${isVi ? '/vi' : ''}/blog/${blogSlug(post.id)}/`,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    date: post.data.pubDate.toISOString().slice(0, 10),
    minutes: postReadingTime({ id: post.id, body: post.body ?? '' }),
    heroImage: post.data.heroImage,
  };
}
