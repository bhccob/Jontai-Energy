'use client';

import { useEffect, type RefObject } from 'react';

/**
 * What the header gives up, in this order, when its row does not fit: Menu's word, the language button (it is in the menu
 * too), and last the store's name beside its mark. (Support, Member and the language are their icons already, rounds 49
 * and 50.) Each step is a word in the header's data-fit (shell.css).
 */
const STEPS = ['menu', 'lang', 'brand'] as const;

/**
 * Keeps the header's row inside the header, in every language. The breakpoints in shell.css are set for English;
 * Spanish labels are longer, so this measures the row instead and sheds labels step by step until the mark and the
 * buttons fit with air between them. It runs again whenever a label changes (a new language, Menu turning to Close, a
 * font arriving) or the window does. Without scripts the breakpoints alone apply.
 */
export function useHeaderFit(bar: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const nav = bar.current;
    const brand = nav?.querySelector<HTMLElement>('.brand');
    const end = nav?.querySelector<HTMLElement>('.nav__end');
    if (!nav || !brand || !end) return;
    const fit = () => {
      const page = document.documentElement.clientWidth;
      const gutter = parseFloat(getComputedStyle(nav).getPropertyValue('--gutter')) || 24;
      // Air between the mark and the buttons: a clear gap on wide screens, a sliver on phones.
      const air = page > 512 ? 28 : 8;
      const room = page - 2 * gutter - air;
      const row = () => brand.getBoundingClientRect().width + end.getBoundingClientRect().width;
      let n = 0;
      nav.dataset.fit = '';
      while (row() > room && n < STEPS.length) {
        n += 1;
        nav.dataset.fit = STEPS.slice(0, n).join(' ');
      }
    };

    fit();
    // A label's words changed (a new language, Menu turning to Close): fit before the next paint, so the row is never
    // drawn overflowing. Only text is watched, and a fit changes no text, so it cannot call itself.
    const words = new MutationObserver(fit);
    words.observe(nav, { subtree: true, childList: true, characterData: true });
    // A label changed size for another reason (a font arriving): fit again on the next frame, outside the observer's
    // own pass. A fit that changes nothing ends the chain: every fit starts from the full row, so the same room always
    // gives the same answer.
    let frame = 0;
    const sizes = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    sizes.observe(brand);
    sizes.observe(end);
    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(frame);
      words.disconnect();
      sizes.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [bar]);
}
