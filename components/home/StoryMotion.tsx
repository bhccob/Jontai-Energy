'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import { scrollTargets } from '@/components/providers/scrollTargets';
import { rangeIndexFromHash } from '@/lib/wheel';
import {
  SCENE_MEDIA,
  leaving,
  pad2,
  promiseRest,
  rangeRest,
  sentenceRest,
  storyAt,
  storyLayout,
  storySettle,
  storyText,
  wordLight,
} from '@/lib/story';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** The drum: its radius in name heights, and the turn between two names (wider on phones, where the names are
 *  smaller). Neighbours sit one and a half to two name heights apart (Bob: "more seperated"), at every size. */
const RADIUS = 3.4;
const STEP = 26;
const STEP_PHONE = 31;
/** How long the scroll must be still, in ms, before the wheel settles on a name. */
const SETTLE = 170;
/** The two lists the wheel opens into: each name's size in the list, and the room between two, in drum name heights. */
const LIST_RANGES = { scale: 0.46, gap: 0.6 };
const LIST_PROMISES = { scale: 0.62, gap: 0.8 };
/** Apart from the wheel itself nothing travels more than about 40px: a leaving name lifts, a line rises into place,
 *  the sentence comes up and goes up. */
const LIFT = 20;
const RISE = 10;
const LINE_IN = 18;
const LINE_OUT = 30;

/**
 * The one held stage of round 56 (Design 1; Story, lib/story), in place of round 55's WheelMotion and SolutionScenes.
 * Where SCENE_MEDIA matches it marks the stage held (story.css lays What we sell and Our solution into one screen) and
 * draws it for how far the page has scrolled, nothing on a timer: the drum of ranges with its rest on each, the list it
 * opens into, the handoff (the names leave; the kicker, the figure and the word roll in one move; the ground deepens
 * once), the sentence lit word by word, the promises on the same drum, and their list. Under the heading, the line for
 * whatever rests in front (lib/story storyText). Kept from round 54: the 7 counts up from 0 as it arrives, the stage
 * grows from a rounded card out to the screen's edges, a name turns the wheel to its range and the one in front opens
 * its products, and a scroll stopped part way through a turn glides on to the next name, as a phone's date picker
 * clicks into place (now on both wheels). The menu's and the footer's links land where the stage rests on their range,
 * and Our solution's on the sentence. With reduced motion, on a short screen or without scripts none of this runs and
 * the still sections show instead.
 */
export function StoryMotion() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(() => {
    const story = document.getElementById('products');
    const pin = story?.querySelector<HTMLElement>('.story__pin');
    if (!story || !pin) return;
    const all = <T extends HTMLElement>(sel: string) => [...story.querySelectorAll<T>(sel)];
    const one = (sel: string) => story.querySelector<HTMLElement>(sel);
    const names = all<HTMLButtonElement>('.wn');
    const promiseNames = all('.sn');
    const feet = all('.wheel__foot');
    const promiseLines = all('.solution__promise');
    const listLine = one('.sell__end');
    const endLine = one('.solution__foot');
    const sentence = one('.solution__line');
    const rangeDrum = one('.wheel__names');
    const promiseDrum = one('.solution__names');
    const band = one('.wheel__band');
    const strips = all('.sell__head .roll__strip');
    const num = one('.sell__num');
    const deep = one('.story__deep');
    const glow = one('.story__glow');
    // The count and the ticks (StoryMeter) may be taken away; then there is nothing to draw for them.
    const count = one('.meter__count');
    const ticks = all('.meter__tick i');
    if (!names.length || !promiseNames.length || !rangeDrum || !promiseDrum) return;
    const ids = names.map((n) => n.dataset.id ?? '');
    const layout = storyLayout(names.length, promiseNames.length);
    const touched = [...names, ...promiseNames, ...feet, ...promiseLines, ...strips, ...ticks];
    for (const el of [listLine, endLine, sentence, band, deep, glow]) if (el) touched.push(el);

    const mm = gsap.matchMedia();
    mm.add(SCENE_MEDIA, () => {
      // "A. The big number": the 7 counts up from 0 the first time it comes into view (Bob: "more prominent and
      // creative").
      const final = Number(num?.textContent) || 0;
      let counting: gsap.core.Tween | undefined;
      if (num && final) {
        const state = { v: 0 };
        num.textContent = '0';
        counting = gsap.to(state, {
          v: final,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            num.textContent = String(Math.round(state.v));
          },
          scrollTrigger: { trigger: num, start: 'top 80%', once: true },
        });
      }

      story.dataset.held = 'true';
      let front = -1;
      let listed = false;
      let shownCount = '';
      /** The drums' name heights (px) and the stage's size, read again whenever the layout or the language changes. */
      let em = 100;
      let pem = 60;
      let glowSize = 0;
      let words: HTMLElement[] = [];

      // Each name as large as the width allows: one too wide (its words, and a range's arrow) is set down to fit.
      const fitNames = (els: HTMLElement[], prop: string) =>
        els.forEach((el) => {
          el.style.setProperty(prop, '1');
          const room = el.clientWidth;
          const name = el.firstElementChild as HTMLElement | null;
          const go = el.querySelector<HTMLElement>('.wn__go');
          const w = (name?.offsetWidth ?? 0) + (go ? go.offsetWidth + parseFloat(getComputedStyle(go).marginLeft) : 0);
          if (room && w > room) el.style.setProperty(prop, Math.max(0.4, (room / w) * 0.98).toFixed(4));
        });
      const fit = () => {
        fitNames(names, '--wn-fit');
        fitNames(promiseNames, '--sn-fit');
        em = parseFloat(getComputedStyle(rangeDrum).fontSize) || em;
        pem = parseFloat(getComputedStyle(promiseDrum).fontSize) || pem;
        glowSize = glow?.offsetWidth ?? 0;
        words = sentence ? [...sentence.querySelectorAll<HTMLElement>('.wi')] : [];
      };

      /** A name on its drum (`d` names from the front), opened `list` of the way into a flat list. */
      const place = (el: HTMLElement, d: number, list: number, listY: number, scale: number, alpha: number, lift: number, size: number, step: number) => {
        const o = lerp(Math.max(0, 1 - Math.abs(d) * 0.4), 1, list) * alpha;
        const radius = size * RADIUS;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.004 ? 'hidden' : '';
        el.style.transform =
          `translateY(calc(-50% + ${(listY * list - lift).toFixed(2)}px)) translateZ(${-radius}px) ` +
          `rotateX(${(-d * step * (1 - list)).toFixed(3)}deg) translateZ(${radius}px) scale(${lerp(1, scale, list).toFixed(4)})`;
      };
      /** A line under the heading: it rises a little into place as it shows. One with a link is taken out of the page
       *  while it is gone; the promises' lines only fade, so each stays readable to a screen reader. */
      const show = (el: HTMLElement, o: number, linked: boolean) => {
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - o) * RISE).toFixed(2)}px, 0)`;
        el.dataset.on = String(o > 0.6);
        if (linked) el.style.visibility = o < 0.004 ? 'hidden' : 'visible';
      };

      const draw = (progress: number) => {
        const s = storyAt(progress, layout);
        const text = storyText(s, layout);
        const step = window.innerWidth < 760 ? STEP_PHONE : STEP;
        const n = names.length;
        const m = promiseNames.length;

        names.forEach((el, k) => {
          const left = leaving(s.handoff, k);
          place(el, k - s.pos, s.open, (k - (n - 1) / 2) * em * LIST_RANGES.gap, LIST_RANGES.scale, left, (1 - left) * LIFT, em, step);
        });
        // The name in front carries its arrow, until the wheel opens into its list.
        const now = s.open < 0.5 && s.handoff === 0 ? Math.round(s.pos) : -1;
        if (now !== front) {
          front = now;
          names.forEach((b, k) => (k === now ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        }
        listed = s.open >= 0.5;
        promiseNames.forEach((el, k) =>
          place(el, k - s.ppos, s.close, (k - (m - 1) / 2) * pem * LIST_PROMISES.gap, LIST_PROMISES.scale, s.arrive, 0, pem, step),
        );
        if (band) {
          const promises = s.handoff >= 0.5;
          band.dataset.side = promises ? 'promises' : 'ranges';
          band.style.opacity = (promises ? s.arrive * (1 - s.close) : 1 - s.open).toFixed(3);
        }

        feet.forEach((el, k) => show(el, text.ranges[k] ?? 0, true));
        if (listLine) show(listLine, text.all, true);
        promiseLines.forEach((el, k) => show(el, text.promises[k] ?? 0, false));
        if (endLine) show(endLine, text.end, true);

        if (sentence) {
          sentence.style.opacity = (s.sentence * (1 - s.gone)).toFixed(3);
          sentence.style.transform = `translate3d(0, ${((1 - s.sentence) * LINE_IN - s.gone * LINE_OUT).toFixed(2)}px, 0)`;
          words.forEach((w, k) => (w.style.opacity = (0.14 + 0.86 * wordLight(s.lit, k, words.length)).toFixed(3)));
        }

        // The kicker, the figure and the word: one roll for all three.
        strips.forEach((el) => (el.style.transform = `translate3d(0, ${(-50 * s.roll).toFixed(3)}%, 0)`));
        if (deep) deep.style.opacity = s.deep.toFixed(3);
        // A soft warm light crosses the stage from lower left to lower right, highest at the handoff.
        if (glow && glowSize) {
          const x = (0.08 + 0.84 * progress) * pin.clientWidth - glowSize / 2;
          const y = (0.82 - Math.sin(progress * Math.PI) * 0.74) * pin.clientHeight - glowSize / 2;
          glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        }

        if (count) {
          const label = `${pad2(text.count.at)} / ${pad2(text.count.of)}`;
          if (label !== shownCount) count.textContent = shownCount = label;
          count.style.opacity = text.count.light.toFixed(3);
        }
        ticks.forEach((el, i) => {
          const f = i < n ? s.rangeFill - i : s.promiseFill - (i - n);
          el.style.transform = `scaleX(${Math.min(1, Math.max(0, f)).toFixed(3)})`;
        });
      };

      fit();
      const turn = ScrollTrigger.create({
        trigger: story,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => draw(st.progress),
        onRefresh: (st) => {
          fit();
          draw(st.progress);
        },
      });
      draw(turn.progress);
      // A new language changes the names' widths and the sentence's words; a font arriving changes them too.
      const relang = new MutationObserver(() => {
        fit();
        draw(turn.progress);
      });
      for (const el of [rangeDrum, promiseDrum, sentence]) if (el) relang.observe(el, { subtree: true, childList: true, characterData: true });
      void document.fonts?.ready.then(() => {
        fit();
        draw(turn.progress);
      });

      // The stage grows out to the screen's edges as it arrives.
      const grow = ScrollTrigger.create({
        trigger: story,
        start: 'top bottom',
        end: 'top top',
        onUpdate: (st) => {
          const k = 1 - easeOut(st.progress);
          story.style.setProperty('--sx', `${(k * window.innerWidth * 0.04).toFixed(1)}px`);
          story.style.setProperty('--sr', `${(k * 44).toFixed(1)}px`);
        },
      });

      const restAt = (p: number) => turn.start + p * (turn.end - turn.start);
      const glide = (y: number, duration: number) => {
        const l = lenisRef.current;
        if (l) l.scrollTo(y, { duration });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      };
      // A name turns the wheel to its range; the one in front, or any once the wheel has opened into its list, opens
      // its products.
      const onClick = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        const k = Number(el.dataset.k);
        if (k === front || listed) {
          window.location.assign(el.dataset.href ?? '/products');
          return;
        }
        glide(restAt(rangeRest(k, layout)), 1.4);
      };
      names.forEach((b) => b.addEventListener('click', onClick));

      // Stopped part way through a turn, the page glides on to the next name the way it was going. Not while a finger
      // is still on the screen, and never outside the two wheels' turns (lib/story storySettle).
      let still = 0;
      let touching = false;
      let lastY = window.scrollY;
      let way = 0;
      const settle = () => {
        still = 0;
        if (touching || turn.end <= turn.start) return;
        const target = storySettle((window.scrollY - turn.start) / (turn.end - turn.start), layout, way);
        if (target >= 0) glide(restAt(target), 0.75);
      };
      const onScroll = () => {
        const y = window.scrollY;
        if (y !== lastY) way = Math.sign(y - lastY);
        lastY = y;
        window.clearTimeout(still);
        still = window.setTimeout(settle, SETTLE);
      };
      const onTouch = (e: TouchEvent) => {
        touching = e.type === 'touchstart';
        if (!touching) onScroll();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchend', onTouch, { passive: true });
      window.addEventListener('touchcancel', onTouch, { passive: true });

      // The menu's and the footer's links land where the stage rests on their range, and Our solution's on the
      // sentence, fully lit: in-page through scrollTargets (SmoothScroll), and from another page once the stage has its
      // held height.
      const delivery = rangeIndexFromHash('delivery', ids);
      ids.forEach((id, k) => scrollTargets.set(id, () => restAt(rangeRest(k, layout))));
      scrollTargets.set('delivery', () => restAt(rangeRest(delivery, layout)));
      scrollTargets.set('solution', () => restAt(sentenceRest(layout)));
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      const arrivedRange = rangeIndexFromHash(hash, ids);
      const arrived = arrivedRange >= 0 ? rangeRest(arrivedRange, layout) : hash === 'solution' ? sentenceRest(layout) : -1;
      // The stage has just grown to its held height, so everything after it has moved down the page.
      const settleIn = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (arrived < 0) return;
        const y = restAt(arrived);
        const l = lenisRef.current;
        if (l) l.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      });

      return () => {
        names.forEach((b) => b.removeEventListener('click', onClick));
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchend', onTouch);
        window.removeEventListener('touchcancel', onTouch);
        window.clearTimeout(still);
        relang.disconnect();
        [...ids, 'delivery', 'solution'].forEach((id) => scrollTargets.delete(id));
        cancelAnimationFrame(settleIn);
        turn.kill();
        grow.kill();
        delete story.dataset.held;
        story.style.removeProperty('--sx');
        story.style.removeProperty('--sr');
        touched.forEach((el) => {
          el.removeAttribute('style');
          delete el.dataset.on;
          delete el.dataset.side;
        });
        words.forEach((w) => w.style.removeProperty('opacity'));
        names.forEach((b) => b.removeAttribute('aria-current'));
        if (count) {
          count.removeAttribute('style');
          count.textContent = `01 / ${pad2(names.length)}`;
        }
        counting?.scrollTrigger?.kill();
        counting?.kill();
        if (num && final) num.textContent = String(final);
      };
    });
    return () => mm.revert();
  });
  return null;
}
