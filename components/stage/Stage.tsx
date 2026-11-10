'use client';

import { useEffect, useRef, useState } from 'react';
import { stageAllowed } from './gate';

/**
 * The stage behind the first view: a still picture of the products (painted at once, and all that phones, reduced
 * motion, Save-Data and no-WebGL visitors get), and over it the live scene, loaded when the browser is idle and faded
 * in once it has drawn. The canvas is decoration: every word is in the sections that scroll over it.
 */
export function Stage() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || !stageAllowed()) return;
    let gone = false;
    let stop: (() => void) | undefined;
    const start = () => {
      import('./stageScene')
        .then(({ createStage }) => (gone ? undefined : createStage(el, { onReady: () => setLive(true), onLost: () => setLive(false) })))
        .then((s) => {
          if (!s) return;
          if (gone) s();
          else stop = s;
        })
        .catch(() => {
          // No WebGL after all, or the models failed to load: the still stays.
        });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 300);
    return () => {
      gone = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      stop?.();
    };
  }, []);

  return (
    <div ref={host} className="stage" data-live={live} aria-hidden="true">
      <picture>
        <source media="(max-width: 960px)" srcSet="/stage/hero-mobile.webp" width={900} height={1000} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="stage__poster" src="/stage/hero-desktop.webp" alt="" width={1920} height={1200} fetchPriority="high" decoding="async" />
      </picture>
    </div>
  );
}
