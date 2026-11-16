'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SCENE_MEDIA, sceneAt } from '@/lib/solutionScenes';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Holds Our solution while its scenes play (Solution, lib/solutionScenes): the sentence, then the six promises one at a
 * time (Bob picked "B. One promise at a time"). Where SCENE_MEDIA matches it marks the section held, so air.css gives
 * it a share of the scroll for each scene and a held stage, and it shows the scene for how far the page has scrolled:
 * the one shown is data-on, the ones before it data-past (they have risen away), and its name in the column on the
 * right is marked. The change itself is a CSS transition, so a scene arrives whole however fast the page moves.
 * Elsewhere (reduced motion, a short screen) nothing runs and every scene stands still in order.
 */
export function SolutionScenes() {
  useGSAP(() => {
    const section = document.getElementById('solution');
    const track = section?.querySelector<HTMLElement>('.solution__track');
    const open = section?.querySelector<HTMLElement>('.solution__open');
    if (!section || !track || !open) return;
    const scenes = [open, ...section.querySelectorAll<HTMLElement>('.solution__promise')];
    const names = [...section.querySelectorAll<HTMLElement>('.solution__index li')];

    const mm = gsap.matchMedia();
    mm.add(SCENE_MEDIA, () => {
      section.dataset.held = 'true';
      let shown = -1;
      const show = (k: number) => {
        if (k === shown) return;
        shown = k;
        scenes.forEach((s, i) => {
          s.dataset.on = String(i === k);
          s.dataset.past = String(i < k);
        });
        names.forEach((n, i) => (n.dataset.on = String(i === k - 1)));
      };
      const hold = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => show(sceneAt(st.progress, scenes.length)),
        onRefresh: (st) => show(sceneAt(st.progress, scenes.length)),
      });
      show(sceneAt(hold.progress, scenes.length));
      // The section has just grown to its held height, so everything after it has moved down the page.
      const settle = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(settle);
        hold.kill();
        delete section.dataset.held;
        scenes.forEach((s, i) => {
          s.dataset.on = String(i === 0);
          delete s.dataset.past;
        });
        names.forEach((n) => delete n.dataset.on);
      };
    });
    return () => mm.revert();
  });
  return null;
}
