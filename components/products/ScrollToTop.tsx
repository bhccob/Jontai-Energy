'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';

/**
 * Opens a page at its top (round 44, Bob: "when clicked on the product it shows bottom of the page of the product"):
 * after a client-side move the smooth scroll still held the last page's place, so the new page opened part way down.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);
  return null;
}
