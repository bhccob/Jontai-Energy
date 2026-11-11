'use client';

import { useEffect, useState } from 'react';
import { sunNow } from '@/lib/sun';

/**
 * "10:55 AM in Oranjestad · Sun up until 6:12 PM": the sun over the store right now, worked out from the date (lib/sun).
 * It also tells the page what the light is doing (html[data-daypart]), so the valley in the first view warms at golden
 * hour and darkens at night. Filled in after load, so the server's clock and the visitor's never disagree.
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
    <p className={`sunclock ${className}`.trim()} data-up={now?.up}>
      <i aria-hidden="true" />
      {now ? (
        <span>
          <span className="sunclock__time">{now.time} in Oranjestad</span> <span aria-hidden="true">·</span> {now.line}
        </span>
      ) : (
        <span>Under the Aruba sun, Cumana 73</span>
      )}
    </p>
  );
}
