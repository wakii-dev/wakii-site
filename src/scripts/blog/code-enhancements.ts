/**
 * SF-2 (FI-66) — code block copy button + heading anchor links.
 * SF-2-OWNED module (P0-2) — reading-nav (SF-3) must not touch this file.
 *
 * Progressive enhancement only: without JS there are no buttons/anchor links
 * (plain headings, code still readable/copyable by hand — spec P0-3); the
 * language label is CSS-only (`pre[data-language]::before`, layout region SF-2)
 * so it survives no-JS.
 *
 * i18n: dict en/vi HERE (P0 strings rule — layout UI record gets 0 new keys);
 * locale read from `<html lang>` (Base.astro:77).
 */

const STRINGS = {
  en: {
    copy: 'copy',
    copied: '✓ copied',
    copyTitle: 'Copy code to clipboard',
    anchor: 'Link to this section',
  },
  vi: {
    copy: 'sao chép',
    copied: '✓ đã sao chép',
    copyTitle: 'Sao chép mã vào clipboard',
    anchor: 'Liên kết đến mục này',
  },
} as const;

export function initCodeEnhancements(): void {
  const t = STRINGS[document.documentElement.lang.toLowerCase().startsWith('vi') ? 'vi' : 'en'];

  /* Copy button per shiki block (probe FI-66: `<pre data-language>` verified).
     Each pre is wrapped in .code-shell so the pinned button doesn't scroll
     away with overflow-x code lines. */
  document.querySelectorAll<HTMLElement>('.prose pre[data-language]').forEach((pre) => {
    const shell = document.createElement('div');
    shell.className = 'code-shell';
    pre.replaceWith(shell);
    shell.appendChild(pre);

    // aria-live span — text swap announces to screen readers.
    const live = document.createElement('span');
    live.setAttribute('aria-live', 'polite');
    live.textContent = t.copy;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.title = t.copyTitle;
    btn.appendChild(live);
    let timer: ReturnType<typeof setTimeout> | undefined;
    btn.addEventListener('click', () => {
      navigator.clipboard
        .writeText(pre.querySelector('code')?.textContent ?? '')
        .then(() => {
          live.textContent = t.copied;
          clearTimeout(timer);
          timer = setTimeout(() => (live.textContent = t.copy), 2000);
        })
        .catch(() => {
          // Clipboard fail (non-secure context / permission denied) — giữ nút
          // ở trạng thái copy, để lại dấu vết đọc được trong console.
          console.warn('[code-enhancements] clipboard write failed');
        });
    });
    shell.appendChild(btn);
  });

  /* Heading anchors h2/h3 — JS-injected DOM decoration (P0-3). Click keeps
     the native hash jump AND copies the section URL (decision: both — hash
     updates in place for shareability, clipboard gets the full URL). */
  document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]').forEach((h) => {
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = `#${h.id}`;
    a.setAttribute('aria-label', t.anchor);
    a.textContent = '#';
    let atimer: ReturnType<typeof setTimeout> | undefined;
    a.addEventListener('click', () => {
      navigator.clipboard
        .writeText(`${location.origin}${location.pathname}#${h.id}`)
        .then(() => {
          a.textContent = '✓';
          clearTimeout(atimer);
          atimer = setTimeout(() => (a.textContent = '#'), 2000);
        })
        .catch(() => console.warn('[code-enhancements] clipboard write failed'));
    });
    h.appendChild(a);
  });
}
