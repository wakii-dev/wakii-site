/**
 * Shared motion util — reveal / stagger / tilt / parallax, data-attribute driven.
 * Extracted verbatim from Landing.astro v2 (SF-1, FI-295). SF-2..5 CONSUME this
 * as-is; only SF-5 may extend it.
 *
 * Contract:
 *   initMotion() once per page (e.g. in a component <script>).
 *   [data-reveal] | .reveal        — reveal-on-scroll, 60ms stagger per batch
 *   [data-tilt]                    — hover tilt-3D on the element itself
 *   [data-tilt-host]               — mouse-parallax host; moves a child
 *                                    matching [data-hero-term]
 *   [data-parallax]                — scroll parallax container; direct
 *                                    descendants with [data-depth] translate
 * The util respects prefers-reduced-motion AND coarse pointers: when motion
 * is off it exits before adding .anim, so everything renders fully visible
 * and static (matches the global.css kill-switch contract).
 */

export function initMotion(): void {
  // v2 motion — transform/opacity ONLY.
  // prefers-reduced-motion OR coarse pointer → static fallback (no .anim,
  // no tilt/parallax; board auto-scale still runs inside BracketCanvas).
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (RM.matches || !finePointer.matches) return;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Reveal styling is gated on .anim (added here, only when motion is OK)
  document.documentElement.classList.add('anim');

  /* ---- hover tilt-3D (±4-7deg, lerp 0.12) ---- */
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    let rx = 0,
      ry = 0,
      trx = 0,
      try_ = 0,
      raf: number | null = null,
      active = false;
    function frame() {
      rx = lerp(rx, trx, 0.12);
      ry = lerp(ry, try_, 0.12);
      el.style.transform =
        'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(6px)';
      if (active || Math.abs(rx - trx) > 0.01 || Math.abs(ry - try_) > 0.01) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        el.style.transform = '';
      }
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      try_ = ((e.clientX - r.left) / r.width - 0.5) * 7;
      trx = -((e.clientY - r.top) / r.height - 0.5) * 6;
      active = true;
      kick();
    });
    el.addEventListener('mouseleave', () => {
      trx = 0;
      try_ = 0;
      active = false;
      kick();
    });
  });

  /* ---- scroll: host mouse-tilt + parallax ---- */
  const tiltHost = document.querySelector<HTMLElement>('[data-tilt-host]');
  const heroTerm = document.querySelector<HTMLElement>('[data-hero-term]');
  let tx = 0,
    ty = 0,
    cx = 0,
    cy = 0;
  if (tiltHost && heroTerm) {
    tiltHost.addEventListener('mousemove', (e) => {
      const r = tiltHost.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    tiltHost.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });
  }

  const parallaxHosts = Array.from(
    document.querySelectorAll<HTMLElement>('[data-parallax]')
  );

  function update() {
    const vh = window.innerHeight;
    if (tiltHost && heroTerm) {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      heroTerm.style.transform =
        'rotateX(' + (-cy * 6).toFixed(2) + 'deg) rotateY(' + (cx * 8).toFixed(2) + 'deg)';
    }
    // depth parallax between children (3 tốc độ qua data-depth)
    parallaxHosts.forEach((host) => {
      const b = host.getBoundingClientRect();
      if (b.top < vh && b.bottom > 0) {
        const prog = (b.top + b.height / 2 - vh / 2) / (vh + b.height);
        host.querySelectorAll<HTMLElement>('[data-depth]').forEach((c) => {
          const d = parseFloat(c.dataset.depth || '') || 0.05;
          c.style.transform = 'translate3d(0,' + (prog * d * 900).toFixed(1) + 'px,0)';
        });
      }
    });
  }

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', update);
  update();

  /* ---- reveal-on-scroll, stagger 60ms trong từng batch ---- */
  const io = new IntersectionObserver(
    (entries) => {
      const pending = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      pending.forEach((e, i) => {
        const el = e.target as HTMLElement;
        el.style.animationDelay = i * 60 + 'ms';
        el.classList.add('reveal-in');
        el.addEventListener(
          'animationend',
          () => {
            // dọn class + delay để tilt inline transform không bị animation giữ
            el.classList.remove('reveal', 'reveal-in');
            el.style.animationDelay = '';
          },
          { once: true }
        );
        io.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal, [data-reveal]').forEach((el) => {
    io.observe(el);
  });
}
