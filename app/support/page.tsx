import type { Metadata } from 'next';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Footer } from '@/components/sections/Footer';
import { StoreDetails } from '@/components/sections/StoreDetails';
import { Contours } from '@/components/ui/Contours';
import { Header } from '@/components/ui/Header';
import { Words } from '@/components/ui/Split';
import { DIRECTIONS_URL } from '@/lib/contact';
import { VISIT_HILLS } from '@/lib/contours';
import { QUOTE_ACTION } from '@/lib/quote';
import { STORE } from '@/lib/store';
import { QUESTIONS, RETURNS, SERVICE, WARRANTY, type Point } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Support | Jontai Energy',
  description: 'Questions, warranty, returns and repairs at Jontai Energy, Cumana 73, Oranjestad. Bring the product and its receipt to the store.',
};

const SECTIONS = [
  { id: 'questions', label: 'Questions' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'returns', label: 'Returns' },
  { id: 'service', label: 'Service' },
  { id: 'contact', label: 'Contact' },
];

/** Things that happen in order, numbered. */
function Steps({ items }: { items: Point[] }) {
  return (
    <ol className="steps">
      {items.map((s) => (
        <li key={s.title} data-reveal>
          <strong>{s.title}</strong>
          <p>{s.line}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Help after you buy: the questions people ask, the warranty, returns and service, from the store's own policies
 * (lib/support.ts), with a list of the sections that stays in view on wide screens and the store's contact block at
 * the end. The header's Support link, the footer's FAQ and Visit's questions lead here.
 */
export default function SupportPage() {
  return (
    <CatalogProvider>
      <Header base="/" />
      <main id="main" className="support">
        <header className="support__head">
          <p className="label" data-reveal>
            Support
          </p>
          <h1 className="support__title" data-words>
            <Words text="Help after you buy." />
          </h1>
          <p className="lead" data-reveal>
            Questions, warranty, returns and repairs, in plain words. For anything else, call, send a message or come by Cumana 73.
          </p>
        </header>

        <div className="support__body">
          <nav className="support__nav" aria-label="On this page">
            <ol>
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="support__n">{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="support__main">
            <section id="questions" className="support__section" aria-labelledby="questions-title">
              <h2 id="questions-title" className="support__h">
                Questions
              </h2>
              <div className="qa">
                {QUESTIONS.map((f) => (
                  <details key={f.q} data-reveal>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            <section id="warranty" className="support__section" aria-labelledby="warranty-title">
              <h2 id="warranty-title" className="support__h">
                Warranty
              </h2>
              <p className="lead" data-reveal>
                {WARRANTY.lead}
              </p>
              <dl className="periods">
                {WARRANTY.periods.map((p) => (
                  <div key={p.what} data-reveal>
                    <dt>
                      <span className="periods__what">{p.what}</span>
                      <span className="periods__note">{p.note}</span>
                    </dt>
                    <dd className="figure">{p.period}</dd>
                  </div>
                ))}
              </dl>
              <p className="note" data-reveal>
                {WARRANTY.from}
              </p>
              <div className="support__split">
                <div>
                  <h3 className="label" data-reveal>
                    Making a claim
                  </h3>
                  <Steps items={WARRANTY.claim} />
                  <p className="note" data-reveal>
                    {WARRANTY.caution}
                  </p>
                </div>
                <div>
                  <h3 className="label" data-reveal>
                    Not covered
                  </h3>
                  <ul className="dashes">
                    {WARRANTY.excluded.map((x) => (
                      <li key={x} data-reveal>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="body" data-reveal>
                {WARRANTY.remedy}
              </p>
              <p className="note" data-reveal>
                {WARRANTY.law}
              </p>
            </section>

            <section id="returns" className="support__section" aria-labelledby="returns-title">
              <h2 id="returns-title" className="support__h">
                Returns
              </h2>
              <p className="lead" data-reveal>
                {RETURNS.lead}
              </p>
              <ul className="points">
                {RETURNS.can.map((p) => (
                  <li key={p.title} data-reveal>
                    <strong>{p.title}</strong>
                    <p>{p.line}</p>
                  </li>
                ))}
              </ul>
              <div className="support__split">
                <div>
                  <h3 className="label" data-reveal>
                    How it works
                  </h3>
                  <Steps items={RETURNS.steps} />
                </div>
                <div>
                  <h3 className="label" data-reveal>
                    Cannot come back
                  </h3>
                  <ul className="dashes">
                    {RETURNS.cannot.map((x) => (
                      <li key={x} data-reveal>
                        {x}
                      </li>
                    ))}
                  </ul>
                  <p className="note" data-reveal>
                    {RETURNS.furniture}
                  </p>
                </div>
              </div>
            </section>

            <section id="service" className="support__section" aria-labelledby="service-title">
              <h2 id="service-title" className="support__h">
                Service
              </h2>
              <p className="lead" data-reveal>
                {SERVICE.lead}
              </p>
              <Steps items={SERVICE.steps} />
              <p className="body" data-reveal>
                {SERVICE.covers} {SERVICE.updates}
              </p>
            </section>
          </div>
        </div>

        <section id="contact" className="visit support__contact" data-tone="dark" aria-labelledby="contact-title">
          <Contours hills={VISIT_HILLS} />
          <p className="label" data-reveal>
            Contact
          </p>
          <h2 id="contact-title" className="h-section" data-words>
            <Words text="Still need a hand?" />
          </h2>
          <p className="visit__city" data-reveal>
            {STORE.street}, {STORE.city}
          </p>
          <StoreDetails />
          <div className="actions" data-reveal>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              Get directions <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </a>
            <a href="/contact" className="btn btn--ghost">
              Send a message
            </a>
            <a href="/quote" className="btn btn--ghost">
              {QUOTE_ACTION}
            </a>
          </div>
        </section>
      </main>
      <Footer base="/" />
    </CatalogProvider>
  );
}
