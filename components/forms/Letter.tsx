import type { ReactNode } from 'react';
import { StoreCard } from '@/components/quote/StoreCard';
import { Words } from '@/components/ui/Split';
import { SERVICE_LINE } from '@/lib/store';

/**
 * The page a letter to the store is written on, the quote request or a message (Bob, round 18: creative, less boxy,
 * liquid glass): the green valley of the first view behind everything under a morning mist; on the left the title in
 * the page's thin wide capitals, one line, and the store's hours and ways in as plain lines; on the right the form,
 * one sheet of glass over the valley.
 */
export function Letter({ kicker, title, lead, children }: { kicker: string; title: [string, string]; lead: string; children: ReactNode }) {
  return (
    <main id="main" className="letter">
      <div className="letter__backdrop" aria-hidden="true" />
      <div className="letter__grid">
        <header className="letter__intro">
          <p className="letter__kicker">{kicker}</p>
          <h1 className="air-display letter__title" data-words>
            <span>
              <Words text={title[0]} />
            </span>{' '}
            <span className="letter__indent">
              <Words text={title[1]} />
            </span>
          </h1>
          <p className="letter__lead">{lead}</p>
          <StoreCard />
          <p className="letter__fine">{SERVICE_LINE}</p>
        </header>
        <div className="letter__form">{children}</div>
      </div>
    </main>
  );
}
