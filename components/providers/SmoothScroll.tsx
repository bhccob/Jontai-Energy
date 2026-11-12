'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollTargets } from './scrollTargets';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis drives the real window scroll, so Motion's useScroll, IntersectionObserver and ScrollTrigger all keep working.
 * One clock: GSAP's ticker advances Lenis, and every Lenis scroll tells ScrollTrigger to update, so pinned
 * GSAP sequences and Motion-driven sections never drift apart.
 * lerp 0.08 lets the page glide a little after the hand (Bob, round 27: "move slightly more delayed so its more premium
 * feeling"), and every GSAP animation runs at 85% speed for the same reason; touch keeps native momentum.
 * Reduced-motion visitors get plain native scrolling. In-page links glide to their target (InPageLinks).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const tick = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Slightly slower everywhere: reveals, scrubs settling, leans (round 27).
    gsap.globalTimeline.timeScale(0.85);
    return () => {
      gsap.ticker.remove(tick);
      gsap.globalTimeline.timeScale(1);
    };
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.08, wheelMultiplier: 1, smoothWheel: !reduced }}>
      <ScrollTriggerSync />
      <InPageLinks />
      {process.env.NODE_ENV === 'development' && <DevHandle />}
      {children}
    </ReactLenis>
  );
}

function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

/**
 * In-page links, as Lenis' own anchors option follows them, plus targets that land elsewhere than their top (the
 * products on the pinned rail, scrollTargets). Ordinary targets keep the browser's own jump too, so they land under
 * the header through scroll-padding-top alone and focus moves on as it does without scripts; behind the menu, where
 * Lenis is stopped, that jump is all there is. A rail product's link goes to its own position instead, once the menu
 * that held the page has let go, and its product takes the focus.
 */
function InPageLinks() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let wait = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.host !== location.host || url.pathname !== location.pathname || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const at = scrollTargets.get(id);
      if (!at) {
        lenis.scrollTo(url.hash);
        return;
      }
      e.preventDefault();
      history.pushState(null, '', url.hash);
      cancelAnimationFrame(wait);
      let frames = 0;
      const go = () => {
        if (lenis.isStopped) {
          if (frames++ < 90) wait = requestAnimationFrame(go);
          return;
        }
        lenis.scrollTo(at(), { duration: 1.6 });
        document.getElementById(id)?.focus({ preventScroll: true });
      };
      go();
    };
    window.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(wait);
      window.removeEventListener('click', onClick);
    };
  }, [lenis]);

  return null;
}

// Dev only: lets tooling drive Lenis (window.scrollTo gets overridden by Lenis' own position).
function DevHandle() {
  const lenis = useLenis();
  useEffect(() => {
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;
  }, [lenis]);
  return null;
}
