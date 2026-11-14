'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { ArrowLeft, X } from '@phosphor-icons/react';

/**
 * A product opened from the home page (round 44, Bob: "when clicked on the product it shows bottom of the page of the
 * product which is not ideal and when they click back dont need to reload the whole site"): it rises over the home page
 * as a full-screen sheet, starting at its top, while the home page stays as it was underneath, scroll and all. Back, the
 * close button or Escape take it away again with nothing reloaded. Moving to another product in the sheet starts that
 * one at its top too. Opened directly (a shared link, a reload), the product has its own page instead.
 */
export function ProductSheet({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const box = useRef<HTMLDivElement>(null);

  // The home page holds still underneath while the sheet is up.
  useEffect(() => {
    lenis?.stop();
    document.documentElement.dataset.sheet = 'open';
    return () => {
      delete document.documentElement.dataset.sheet;
      lenis?.start();
    };
  }, [lenis]);

  // Each product starts at its top, and the sheet takes the focus so the keyboard and screen readers are in it.
  useEffect(() => {
    box.current?.scrollTo({ top: 0 });
    box.current?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div ref={box} className="psheet" role="dialog" aria-modal="true" aria-labelledby="pp-title" tabIndex={-1} data-lenis-prevent>
      <div className="psheet__bar">
        <button type="button" className="psheet__back" onClick={() => router.back()}>
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          Back to the ranges
        </button>
        <button type="button" className="psheet__close" aria-label="Close" onClick={() => router.back()}>
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>
      <div className="pp" data-tone="dark">
        {children}
      </div>
    </div>
  );
}
