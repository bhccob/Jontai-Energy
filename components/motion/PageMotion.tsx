'use client';

import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { countUpText, hasCount } from '@/lib/countup';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The first view's words and the JONTAI behind them (.sky) have their own entrance in CSS (sky.css). */
const outsideHero = (el: Element) => !el.closest('#hero, .sky');

// Words and letters start below their line in CSS (so nothing flashes before this runs). GSAP reads that CSS offset as
// a pixel y and would keep it under its own yPercent, so every rise also zeroes y.
const BELOW = (percent: number) => ({ y: 0, yPercent: percent });

const MOTION = '(prefers-reduced-motion: no-preference)';
/** Wide and tall enough for the footer to wait under the page (shell.css). */
const LIFTED = '(min-width: 961px) and (min-height: 720px)';

/**
 * The page's scroll motion, read from data attributes the sections render (see the redesign plan's attribute
 * contract). Entrances play once and never reverse; scrubbed motion follows the scroll and never holds it. Rebuilt on
 * every route so client navigation never doubles a trigger. Reduced motion gets none of it, and without scripts the
 * sections are already complete.
 *
 * A matchMedia block re-runs from scratch whenever one of its conditions flips (a phone or tablet turned on its
 * side), so everything once-only lives in a block that depends on motion alone, and only the motion that truly
 * depends on the screen's size sits in its own small blocks.
 */
export function PageMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      // The scripts arrived: the head script's fallback (lift the loader and the starting states) must not fire.
      (window as unknown as { __jontaiReady?: boolean }).__jontaiReady = true;
      if (process.env.NODE_ENV === 'development') (window as unknown as { __st?: typeof ScrollTrigger }).__st = ScrollTrigger;
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const undo: (() => void)[] = [];

        // Headings rise word by word out of their own line.
        gsap.utils.toArray<HTMLElement>('[data-words]').filter(outsideHero).forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll('.wi'),
            BELOW(115),
            { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.045, scrollTrigger: { trigger: el, start: 'top 88%', once: true } },
          );
        });

        // A statement fills in word by word, done before it reaches the middle of the screen.
        gsap.utils.toArray<HTMLElement>('[data-fill]').forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll('.wi'),
            { opacity: 0.14 },
            { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 58%', scrub: 0.8 } },
          );
        });

        // Rules draw from the left.
        gsap.utils.toArray<HTMLElement>('[data-line]').forEach((el) => {
          gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        });

        // Depth: an element drifts against the scroll while its parent crosses the screen. data-parallax="from,to".
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const [from, to] = (el.dataset.parallax ?? '0,0').split(',').map(Number);
          gsap.fromTo(
            el,
            { yPercent: from },
            { yPercent: to, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
          );
        });

        // An object swings up into place as it comes into view, as if lifted off a table: tilted back and low at first,
        // upright by the time it is well on screen. Scrubbed, so it follows the scroll both ways.
        gsap.utils.toArray<HTMLElement>('[data-swing]').forEach((el) => {
          gsap.fromTo(
            el,
            { rotateX: 32, rotateZ: -7, yPercent: 26, scale: 0.9, transformPerspective: 1400, transformOrigin: '50% 100%' },
            { rotateX: 0, rotateZ: 0, yPercent: 0, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 62%', scrub: 0.9 } },
          );
        });

        // Figures count up the first time they are seen, holding their final width so nothing shifts.
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const original = el.textContent ?? '';
          if (!hasCount(original)) return;
          el.style.minWidth = `${Math.ceil(el.getBoundingClientRect().width)}px`;
          el.textContent = countUpText(original, 0);
          const state = { p: 0 };
          gsap.to(state, {
            p: 1,
            duration: 1.6,
            delay: 0.2,
            ease: 'expo.out',
            onUpdate: () => {
              el.textContent = countUpText(original, state.p);
            },
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
          undo.push(() => {
            el.textContent = original;
            el.style.minWidth = '';
          });
        });

        // Odometers roll to their number, one after another within a section.
        gsap.utils.toArray<HTMLElement>('[data-odometer]').forEach((el) => {
          const n = Number(el.dataset.odometer);
          const strip = el.querySelector('.stat__strip');
          if (!strip || !Number.isFinite(n)) return;
          const order = [...(el.closest('section')?.querySelectorAll('[data-odometer]') ?? [el])].indexOf(el);
          // The strip rests on its number in CSS (no motion, no scripts); start from 0 and roll back to it.
          gsap.fromTo(
            strip,
            { y: 0, yPercent: 0 },
            { yPercent: (-100 * n) / (n + 1), duration: 1.9, delay: Math.max(0, order) * 0.15, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
          );
        });

        // Lines draw themselves: contour rings scrub with their section; a data-draw="once" stroke draws once.
        const scrubbed = new Map<Element, SVGPathElement[]>();
        gsap.utils.toArray<SVGPathElement>('path[data-draw]').forEach((path) => {
          if (path.dataset.draw === 'once') {
            gsap.fromTo(
              path,
              { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } },
              { attr: { 'stroke-dashoffset': 0 }, duration: 1.1, delay: 0.6, ease: 'expo.out', scrollTrigger: { trigger: path.closest('section') ?? path, start: 'top 65%', once: true } },
            );
            return;
          }
          const section = path.closest('section') ?? path;
          scrubbed.set(section, [...(scrubbed.get(section) ?? []), path]);
        });
        scrubbed.forEach((paths, section) => {
          gsap.fromTo(
            paths,
            { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } },
            { attr: { 'stroke-dashoffset': 0 }, ease: 'none', stagger: 0.03, scrollTrigger: { trigger: section, start: 'top 85%', end: 'center 45%', scrub: 1.4 } },
          );
        });

        // Fitted words rise letter by letter (data-chars="end" is handled with the screen's size, below).
        gsap.utils.toArray<HTMLElement>('[data-chars]').filter((el) => outsideHero(el) && el.dataset.chars !== 'end').forEach((el) => {
          gsap.fromTo(el.querySelectorAll('.ci'), BELOW(110), { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        });

        return () => undo.forEach((fn) => fn());
      });

      // Dark fields grow from a rounded inset to full bleed as they arrive; the inset is smaller on phones. Scrubbed,
      // so rebuilding it when the width crosses 961px loses nothing.
      mm.add({ motion: MOTION, wide: '(min-width: 961px)' }, (ctx) => {
        const { motion, wide } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const inset = wide ? 'inset(64px 4vw 0px 4vw round 36px)' : 'inset(24px 3vw 0px 3vw round 24px)';
        gsap.utils.toArray<HTMLElement>('[data-expand]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: inset },
            { clipPath: 'inset(0px 0vw 0px 0vw round 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 12%', scrub: 0.6 } },
          );
        });
      });

      // data-chars="end" (the footer's JONTAI ENERGY) rises with the last stretch of the page: across the lift where
      // the footer waits under the page, otherwise as it arrives, finishing by the end of the page however little
      // follows it.
      mm.add({ motion: MOTION, lifted: LIFTED }, (ctx) => {
        const { motion, lifted } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        gsap.utils.toArray<HTMLElement>('[data-chars="end"]').forEach((el) => {
          gsap.fromTo(el.querySelectorAll('.ci'), BELOW(105), {
            yPercent: 0,
            ease: 'none',
            stagger: 0.05,
            scrollTrigger: lifted
              ? { trigger: 'main', start: 'bottom bottom', end: 'max', scrub: true }
              : { trigger: el, start: 'top bottom', end: 'clamp(bottom 85%)', scrub: true },
          });
        });
      });

      // Buttons lean toward the pointer and spring back when it leaves.
      mm.add(`${MOTION} and (hover: hover) and (pointer: fine)`, () => {
        const undo: (() => void)[] = [];
        gsap.utils.toArray<HTMLElement>('.btn').forEach((btn) => {
          const toX = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3' });
          const toY = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3' });
          let box = btn.getBoundingClientRect();
          const enter = () => {
            box = btn.getBoundingClientRect();
          };
          const move = (e: PointerEvent) => {
            toX((e.clientX - box.left - box.width / 2) * 0.22);
            toY((e.clientY - box.top - box.height / 2) * 0.32);
          };
          const leave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: true });
          btn.addEventListener('pointerenter', enter);
          btn.addEventListener('pointermove', move);
          btn.addEventListener('pointerleave', leave);
          undo.push(() => {
            btn.removeEventListener('pointerenter', enter);
            btn.removeEventListener('pointermove', move);
            btn.removeEventListener('pointerleave', leave);
          });
        });
        return () => undo.forEach((fn) => fn());
      });

      let live = true;
      document.fonts?.ready.then(() => live && ScrollTrigger.refresh());
      return () => {
        live = false;
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
