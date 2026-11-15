'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Where the footer waits under the page (wide and tall screens), the browser treats it as already in view, so tabbing
 * into it would focus links still covered by the page. Focus inside the footer scrolls to the end, where it shows.
 */
export function FooterFocus() {
  const lenis = useLenis();

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('footer.footer');
    if (!footer) return;
    const lifted = window.matchMedia('(min-width: 961px) and (min-height: 720px)');
    const onFocus = () => {
      if (!lifted.matches) return;
      const end = document.documentElement.scrollHeight - window.innerHeight;
      if (lenis) lenis.scrollTo(end, { immediate: true, force: true });
      else window.scrollTo(0, end);
    };
    footer.addEventListener('focusin', onFocus);
    return () => footer.removeEventListener('focusin', onFocus);
  }, [lenis]);

  return null;
}
