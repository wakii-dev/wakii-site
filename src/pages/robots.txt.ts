import { SITE_URL } from '../config';

/**
 * robots.txt generated from SITE_URL (single source of truth) so the sitemap
 * URL never desyncs from the canonical domain.
 */
export const GET = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
