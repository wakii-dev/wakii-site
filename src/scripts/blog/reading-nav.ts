/**
 * reading-nav — SF-3 (FI-67) blog reading enhancements. Own module (P0-2:
 * SF-2 has code-enhancements; two SFs never share a client file). Additive:
 * no JS → TOC box/rail still work as plain anchor lists; progress bar +
 * button are JS-injected so they simply never appear (no-JS hidden).
 *
 * Scrollspy: active = last h2 above the 40% reading line → aria-current on
 * the TOC link (SR-readable, not color-only); rail auto-scrolls its active
 * link (10+ h2 posts). Progress: transform-only scaleX bar under the 58px
 * site-nav, aria-hidden (decorative). Back-to-top: past ~1 viewport.
 * Reduced motion: features keep working (function, not décor) — only
 * smooth-scrolling is skipped.
 */

/** en/vi strings for JS-injected chrome — locale via <html lang> (Base). */
const LABELS: Record<string, string> = { en: 'Back to top', vi: 'Về đầu trang' };

export function initReadingNav(): void {
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth: ScrollBehavior = motionOK ? 'smooth' : 'auto';
  /* Scrollspy hook — wired below; runs in the shared rAF loop so instant
     jumps never leave a stale highlight (IO alone misses crossings that
     start AND end outside its band). */
  let onSpy: () => void = () => {};

  /* ---- progress bar (aria-hidden, decorative) ---- */
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ---- back-to-top button ---- */
  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'reading-top';
  top.textContent = '↑';
  top.setAttribute('aria-label', LABELS[document.documentElement.lang] ?? LABELS.en);
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: smooth }));
  document.body.appendChild(top);

  /* ---- shared rAF scroll loop ---- */
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    top.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    onSpy();
  };
  let raf = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(() => (raf = 0) || update());
    },
    { passive: true },
  );
  update();

  /* ---- scrollspy: aria-current="location" + rail auto-scroll ---- */
  // Map slug → ALL matching links (rail + box twins) so the mobile box
  // highlight works too (document order puts rail last — a 1-link map would
  // leave the visible box link unhighlighted).
  const links = new Map<string, HTMLAnchorElement[]>();
  document.querySelectorAll<HTMLAnchorElement>('.toc-link').forEach((a) => {
    if (!a.hash) return;
    const key = decodeURIComponent(a.hash.slice(1));
    links.set(key, [...(links.get(key) ?? []), a]);
  });
  const headings = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter((h): h is HTMLElement => h !== null);
  if (headings.length === 0) return;

  let currentId = '';
  const setActive = (id: string) => {
    if (id === currentId) return; // per-frame guard — skip DOM churn + smooth-restart
    currentId = id;
    for (const group of links.values()) {
      for (const a of group) a.removeAttribute('aria-current');
    }
    for (const a of links.get(id) ?? []) {
      a.setAttribute('aria-current', 'location');
      // Keep the active item inside the rail's own scroll area (rail is
      // position:relative → offsetTop is rail-relative). No-op without overflow.
      const rail = a.closest('.toc--rail');
      if (rail instanceof HTMLElement) {
        rail.scrollTo({
          top: a.offsetTop - rail.clientHeight / 2 + a.offsetHeight / 2,
          behavior: smooth,
        });
      }
    }
  };
  const scan = () => {
    const line = innerHeight * 0.4;
    let active: HTMLElement | null = null;
    for (const h of headings) if (h.getBoundingClientRect().top <= line) active = h;
    setActive((active ?? headings[0]).id);
  };
  onSpy = scan;
  // IO (40% band) = extra trigger for non-scroll shifts (anchor load, resize).
  const spy = new IntersectionObserver(scan, { rootMargin: '0px 0px -60% 0px' });
  headings.forEach((h) => spy.observe(h));
  scan();
}
