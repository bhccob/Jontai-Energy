import { Contours } from '@/components/ui/Contours';
import { FitText } from '@/components/ui/FitText';
import { DIRECTIONS_URL } from '@/lib/contact';
import { VISIT_HILLS } from '@/lib/contours';
import { QUOTE_ACTION } from '@/lib/quote';
import { STORE } from '@/lib/store';
import { QUESTIONS } from '@/lib/support';
import { StoreDetails } from './StoreDetails';

/**
 * The store, said big: CUMANA 73 across the width on forest with contour lines, then hours with the live open line,
 * how to reach us and the service line in ruled columns, the questions people ask most (the rest, with warranty and
 * returns, on the Support page), and the ways to come by or get in touch.
 */
export function Visit() {
  return (
    <section id="visit" className="visit" data-tone="dark" data-expand aria-labelledby="visit-title">
      <Contours hills={VISIT_HILLS} />
      <h2 id="visit-title" className="label" data-reveal>
        Visit the store
      </h2>
      <FitText text={STORE.street} chars label={`${STORE.street}, ${STORE.city}, ${STORE.country}`} className="visit__street" />
      <p className="visit__city" data-reveal>
        {STORE.city}, {STORE.country}
      </p>

      <StoreDetails />

      <section id="faq" className="faq" aria-labelledby="faq-title">
        <h3 id="faq-title" className="label" data-reveal>
          Questions
        </h3>
        {QUESTIONS.slice(0, 4).map((f) => (
          <details key={f.q} data-reveal>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
        <a href="/support#questions" className="textlink faq__more" data-reveal>
          More questions, warranty and returns
        </a>
      </section>

      <div className="actions" data-reveal>
        <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
          Get directions
        </a>
        <a href="/contact" className="btn btn--ghost">
          Send a message
        </a>
        <a href="/quote" className="btn btn--ghost">
          {QUOTE_ACTION}
        </a>
      </div>
    </section>
  );
}
