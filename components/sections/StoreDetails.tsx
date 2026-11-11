import { OpenStatus } from '@/components/home/OpenStatus';
import { SERVICE_LINE, STORE } from '@/lib/store';

/** The store's hours with the live open line, how to reach it and the service line, in three ruled columns on forest. */
export function StoreDetails() {
  return (
    <div className="visit__grid">
      <div className="visit__panel">
        <span className="label" data-reveal>
          Opening hours
        </span>
        <dl className="hours" data-reveal>
          {STORE.hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.time}</dd>
            </div>
          ))}
        </dl>
        <OpenStatus data-reveal />
      </div>
      <div className="contact visit__panel">
        <span className="label" data-reveal>
          Talk to us
        </span>
        <div data-reveal>
          <a href={`tel:${STORE.phone.replace(/\s/g, '')}`}>{STORE.phone}</a>
          <a href="/contact">Send a message</a>
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
        </div>
      </div>
      <div className="visit__panel">
        <span className="label" data-reveal>
          Good to know
        </span>
        <p className="fine" data-reveal>
          {SERVICE_LINE}
        </p>
      </div>
    </div>
  );
}
