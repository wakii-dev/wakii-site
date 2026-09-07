/**
 * Blog taxonomy helpers (story FI-349 SF-3).
 *
 * BLOG_CATEGORIES derives from the SF-1 label map (src/i18n/categories.ts),
 * whose keys mirror the blog schema enum in src/content.config.ts
 * ('tutorial' | 'tech' | 'build-log'). The derivation stays one-directional
 * (label map → routes): a new category ships routes as soon as it has
 * labels, and the zod schema still gates every stored value at load time.
 * This file deliberately does NOT import content.config — pages may, this
 * helper keeps the taxonomy surface import-light.
 */
import { CATEGORY_LABELS } from '../../i18n/categories';

export type BlogLocale = 'en' | 'vi';

export const BLOG_CATEGORIES: string[] = Object.keys(CATEGORY_LABELS.en);

export function categoryLabel(category: string, locale: BlogLocale): string {
  return CATEGORY_LABELS[locale][category] ?? category;
}

/**
 * Category-page cell spans: pairs of sp6; the last cell goes sp12 wide when
 * the count is odd (hand-off surface 2: 3 posts → 6 + 6 + wide). Even counts
 * stay all-sp6 so the grid never ends on a lone wide row.
 */
export function categorySpan(index: number, total: number): 6 | 12 {
  return index === total - 1 && total % 2 === 1 ? 12 : 6;
}
