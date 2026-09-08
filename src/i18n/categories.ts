/**
 * Category label map — shared i18n surface for the blog taxonomy (story FI-349).
 *
 * Keys mirror the blog schema enum in src/content.config.ts
 * ('tutorial' | 'tech' | 'build-log'). Labels are the pre-drafted strings from
 * spec rev 3 §SF-3 (VI copy user-approved at the SF-3 verify gate).
 *
 * SF-1 scope: CREATE ONLY — listing/detail pages adopt this map in SF-3/SF-4
 * (avoids double-touching the same pages in this story).
 */
export const CATEGORY_LABELS: Record<'en' | 'vi', Record<string, string>> = {
  en: {
    tutorial: 'tutorial',
    tech: 'tech notes',
    'build-log': 'build log',
  },
  vi: {
    tutorial: 'hướng dẫn',
    tech: 'kỹ thuật',
    'build-log': 'nhật ký xây dựng',
  },
};
