/**
 * Blog listing/taxonomy copy — EN/VI (story FI-349 SF-3).
 *
 * Category labels come from the SF-1 shared map (src/i18n/categories.ts);
 * this module holds everything around them: rail copy, ledes, cell chrome,
 * empty-state, page titles/meta descriptions, JSON-LD node names.
 *
 * EN strings follow the approved prototype (fi349-sf3-hybrid.html) and the
 * existing listing pages. VI copy is Dev-drafted per the spec rev 3 §SF-3
 * pattern ("N min read" → "<N> phút đọc" keeps the computed number instead
 * of the vaguer "vài phút đọc") — user-approve at the SF-3 verify gate
 * (G-D style, same as story FI-300).
 */
import type { BlogLocale } from './categories';

export interface BlogStrings {
  /** Base <title> — "Blog" | "Bài viết" */
  listingTitle: string;
  /** Listing meta description */
  description: string;
  /** Rail identity line on the listing */
  listingRsub: string;
  /** s-head lede on the listing */
  listingLede: string;
  /** Rail nav first item */
  all: string;
  /** Rail nav aria-label */
  categoriesAria: string;
  newestFirst: string;
  postsCount: (n: number) => string;
  entriesCount: (n: number) => string;
  updated: (date: string) => string;
  rssFeed: string;
  minRead: (n: number) => string;
  read: string;
  noPosts: string;
  emptyHint: string;
  /** Crumb parent link text — terminal path, both locales */
  crumbBlog: string;
  /** Breadcrumb JSON-LD node names */
  homeName: string;
  blogName: string;
  /** Category page <title> pattern — "Category: <label>" | "Chuyên mục: <label>" */
  categoryTitle: (label: string) => string;
  /** Rail sub-line per category (also the category meta description) */
  categoryRsub: Record<string, string>;
}

const EN: BlogStrings = {
  listingTitle: 'Blog',
  description:
    'Tutorials, tech notes and build logs from the Wakii team — agentic workflows, AI pair-programming and shipping software with AI agents.',
  listingRsub: 'Field notes from building an agentic IDE — in the open.',
  listingLede:
    'Tutorials, tech notes and build logs — how Wakii works under the hood and how to get the most out of an agentic IDE.',
  all: 'all',
  categoriesAria: 'Categories',
  newestFirst: 'newest first',
  postsCount: (n) => (n === 1 ? '1 post' : `${n} posts`),
  entriesCount: (n) => (n === 1 ? '1 entry' : `${n} entries`),
  updated: (date) => `updated ${date}`,
  rssFeed: 'rss feed →',
  minRead: (n) => `${n} min read`,
  read: 'read',
  noPosts: 'No posts yet — check back soon.',
  emptyHint: '← all posts · rss feed',
  crumbBlog: '~/blog',
  homeName: 'Home',
  blogName: 'Blog',
  categoryTitle: (label) => `Category: ${label}`,
  categoryRsub: {
    tutorial: 'Step-by-step guides — get things done with Wakii, end to end.',
    tech: 'How Wakii works under the hood — architecture, agents and the decisions in between.',
    'build-log': 'Progress logs from building Wakii in the open.',
  },
};

const VI: BlogStrings = {
  listingTitle: 'Bài viết',
  description:
    'Hướng dẫn, ghi chú kỹ thuật và nhật ký xây dựng từ đội Wakii — agentic workflow, AI pair-programming và cách ship phần mềm cùng AI agent.',
  listingRsub: 'Ghi chép công khai hành trình xây một IDE agentic.',
  listingLede:
    'Hướng dẫn, ghi chú kỹ thuật và nhật ký xây dựng — Wakii hoạt động thế nào bên dưới màn hình và cách khai thác tối đa một IDE có đội AI agent đi kèm.',
  all: 'tất cả',
  categoriesAria: 'Chuyên mục',
  newestFirst: 'mới nhất trước',
  postsCount: (n) => `${n} bài viết`,
  entriesCount: (n) => `${n} bài viết`,
  updated: (date) => `cập nhật ${date}`,
  rssFeed: 'rss feed →',
  minRead: (n) => `${n} phút đọc`,
  read: 'đọc',
  noPosts: 'Chưa có bài viết — quay lại sau nhé.',
  emptyHint: '← tất cả bài viết · rss feed',
  crumbBlog: '~/blog',
  homeName: 'Trang chủ',
  blogName: 'Bài viết',
  categoryTitle: (label) => `Chuyên mục: ${label}`,
  categoryRsub: {
    tutorial: 'Hướng dẫn từng bước — làm được việc với Wakii từ đầu đến cuối.',
    tech: 'Wakii hoạt động thế nào bên dưới màn hình — kiến trúc, agent và những quyết định ở giữa.',
    'build-log': 'Nhật ký tiến độ khi xây Wakii công khai.',
  },
};

export function blogStrings(locale: BlogLocale): BlogStrings {
  return locale === 'vi' ? VI : EN;
}
