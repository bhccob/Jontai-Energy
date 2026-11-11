import type { CSSProperties } from 'react';
import { MapPin } from '@phosphor-icons/react/dist/ssr';
import { OpenStatus } from '@/components/home/OpenStatus';
import { ISLANDS } from '@/lib/islands';
import { STORE } from '@/lib/store';

const UP = ISLANDS.filter((i) => i.id === 'upstairs');
const GROUND = ISLANDS.filter((i) => i.id !== 'upstairs');

function Floor({ id, level, what, islands }: { id: 'ground' | 'upstairs'; level: string; what: string; islands: typeof ISLANDS }) {
  return (
    <div className={`floor floor--${id}`} data-floor={id}>
      <span className="glare" aria-hidden="true" />
      <p className="floor__label">
        <span>{level}</span> {what}
      </p>
      <ul className="floor__row">
        {islands.map((it, i) => (
          <li key={it.id} style={{ '--i': i } as CSSProperties}>
            <a href={`#${it.id}`} className="floor__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/sky/island-${it.image}-320.webp`} alt="" width={160} height={160} loading="lazy" decoding="async" />
              <span className="floor__name">{it.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The store in two floors, drawn beside the "why" sentence (Bob, round 20: the section "need a better design"): a cut
 * through the building at Cumana 73, two panes of glass stacked like floors, furniture on the first and the five power
 * ranges on the ground floor, each a small island that leads to its range, and the street under them with whether the
 * store is open now. The sentence's key words light their floor (air.css, :has), and a floor lights its words.
 */
export function WhyStore() {
  return (
    <figure className="store-cut" aria-label={`The store at ${STORE.street}: furniture on the first floor, power, light, cooling and security on the ground floor`}>
      <Floor id="upstairs" level="1st floor" what="Furniture" islands={UP} />
      <Floor id="ground" level="Ground floor" what="Power, light, cooling and security" islands={GROUND} />
      <figcaption className="store-cut__street" data-floor="street">
        <MapPin size={18} weight="fill" aria-hidden="true" />
        <span className="store-cut__address">
          {STORE.street}, {STORE.city}
        </span>
        <OpenStatus />
      </figcaption>
    </figure>
  );
}
