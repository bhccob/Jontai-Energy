import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { whatsappLink } from '@/lib/contact';
import { TEAM } from '@/lib/team';

/**
 * The people behind the store, after squared-media's "you talk to who makes it": the two photos in black and white
 * that come into colour under the pointer (or as they reach the middle of a phone's screen), each with a name and a
 * title, and a third, deep green panel that invites you to come and say hello.
 */
export function Team() {
  return (
    <section id="team" className="team" aria-labelledby="team-title">
      <div className="team__top">
        <h2 id="team-title" className="air-display team__title" data-words>
          <span>
            <Words text="The people" />
          </span>{' '}
          <span className="team__indent">
            <Words text="behind it." />
          </span>
        </h2>
        <p className="team__side" data-reveal>
          Jontai Energy is family-owned. Two of the people who shape it, from the ideas and the technical side to the way it looks.
        </p>
      </div>
      <ul className="team__grid" data-reveal>
        {TEAM.map((p, i) => (
          <li key={p.name} className="person" style={{ '--i': i } as CSSProperties}>
            <figure className="person__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} width={800} height={1000} loading="lazy" decoding="async" />
            </figure>
            <h3 className="person__name">{p.name}</h3>
            <p className="person__role">{p.role}</p>
          </li>
        ))}
        <li className="team__hello" style={{ '--i': TEAM.length } as CSSProperties}>
          <p className="team__hello-kicker">Cumana 73, Oranjestad</p>
          <p className="team__hello-title">Come say hello.</p>
          <p className="team__hello-text">Ask us anything at the counter, or send a WhatsApp and talk to a person, not a form.</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="team__hello-cta">
            WhatsApp us <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </section>
  );
}
