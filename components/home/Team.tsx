import type { CSSProperties } from 'react';
import { ArrowRight, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { whatsappLink } from '@/lib/contact';
import { APPLY_MESSAGE, TEAM, TEAM_TO_COME } from '@/lib/team';

/**
 * The people behind the store, after squared-media's "you talk to who makes it": the photos in black and white that
 * come into colour under the pointer, each with a name and a title; the third place is "You?", for anyone who wants
 * to work at Jontai Energy, with a WhatsApp to apply. A second row keeps places for the CEO / founder, the CTO and the
 * store manager until they have names and photos (Bob, round 13).
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
          Jontai Energy is family-owned. These are the people who shape it, and a place for the next one.
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
        <li className="person person--you" style={{ '--i': TEAM.length } as CSSProperties}>
          <div className="team__you">
            <p className="team__you-kicker">Work with us</p>
            <p className="team__you-title">Love solar, light and good design?</p>
            <p className="team__you-text">Tell us a little about yourself and what you would like to do. Send it on WhatsApp; a person reads every message.</p>
            <a href={whatsappLink(APPLY_MESSAGE)} target="_blank" rel="noopener noreferrer" className="team__you-cta">
              Apply on WhatsApp <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </a>
          </div>
          <h3 className="person__name">You?</h3>
          <p className="person__role">Your title here</p>
        </li>
        {TEAM_TO_COME.map((p, i) => (
          <li key={p.name} className="person person--soon" style={{ '--i': TEAM.length + 1 + i } as CSSProperties}>
            <figure className="person__frame person__frame--soon" aria-hidden="true">
              <UserCircle size={72} weight="thin" />
              <span>Photo to come</span>
            </figure>
            <h3 className="person__name">{p.name}</h3>
            <p className="person__role">{p.role}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
