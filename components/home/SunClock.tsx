'use client';

import { useEffect, useState } from 'react';
import { sunNow } from '@/lib/sun';

/**
 * "Bon bini — 1:14 PM in Oranjestad": Aruba's welcome and the time at the store, as a plain line of small capitals over
 * the headline (Bob, round 22: the pill with its dot "looks ai generated"). It also tells the page what the light is
 * doing (html[data-daypart], lib/sun), so the valley in the first view warms at golden hour and darkens at night.
 * Filled in after load, so the server's clock and the visitor's never disagree.
 */
export function SunClock({ className = '' }: { className?: string }) {
  const [now, setNow] = useState<ReturnType<typeof sunNow> | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = sunNow(new Date());
      setNow(s);
      document.documentElement.dataset.daypart = s.part;
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => {
      window.clearInterval(id);
      delete document.documentElement.dataset.daypart;
    };
  }, []);
  return (
    <p className={`sunclock ${className}`.trim()}>
      {/* Aruba's own welcome, in Papiamento. */}
      <span className="sunclock__hi" lang="pap" title="Welcome, in Papiamento">
        Bon bini
      </span>
      <span className="sunclock__rule" aria-hidden="true" />
      <span className="sunclock__time">{now ? `${now.time} in Oranjestad` : 'Cumana 73, Oranjestad'}</span>
    </p>
  );
}
