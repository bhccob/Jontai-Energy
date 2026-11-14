'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The valley, moving: mist and cloud drift across it in a loop whose first and last frames are the still under it, so
 * it fades in over the still without a jump. Played slower than shot, only while the first view is on screen, and
 * never with reduced motion or when the visitor asked to save data; then the still stays.
 */
export function SkyVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const scope = video?.closest('.sky-scope');
    if (!video || !scope) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    // Phones keep their portrait still (a different slice of the valley from the landscape loop) and their data.
    if (saveData || window.matchMedia('(max-width: 40rem)').matches) return;

    let visible = true;
    // Rewards slides over the first view and covers it while it holds (HeroSkyMotion): on screen, but not seen.
    let covered = false;
    const sync = () => {
      if (calm.matches || !visible || covered || document.hidden) video.pause();
      else void video.play().catch(() => {});
    };
    const onCover = (e: Event) => {
      covered = (e as CustomEvent<boolean>).detail;
      sync();
    };
    scope.addEventListener('sky:cover', onCover);
    const load = () => {
      if (calm.matches || video.dataset.loaded) return;
      video.dataset.loaded = 'true';
      video.querySelectorAll('source').forEach((s) => s.setAttribute('src', s.dataset.src ?? ''));
      video.load();
    };
    const playing = () => {
      video.playbackRate = 0.75;
      setOn(true);
    };
    video.addEventListener('playing', playing);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) load();
      sync();
    });
    io.observe(scope);
    const onCalm = () => {
      load();
      sync();
    };
    calm.addEventListener('change', onCalm);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      scope.removeEventListener('sky:cover', onCover);
      calm.removeEventListener('change', onCalm);
      document.removeEventListener('visibilitychange', sync);
      video.removeEventListener('playing', playing);
    };
  }, []);

  return (
    <video ref={ref} className="sky__img sky__video" data-on={on} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}>
      <source data-src="/sky/valley-loop-1920.webm" type="video/webm" />
      <source data-src="/sky/valley-loop-1920.mp4" type="video/mp4" />
    </video>
  );
}
