import type { CSSProperties } from 'react';
import { ArrowRight, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { whatsappLink } from '@/lib/contact';
import { APPLY_MESSAGE, TEAM } from '@/lib/team';
import { TeamRail } from './TeamRail';

/**
 * The people behind the store, after squared-media's "you talk to who makes it". One row (Bob, round 14: not so many
 * people at one glance): on the left the team slides, two at a time, in black and white that comes into colour under
 * the pointer, each with a name and a title (a photo still to come shows a quiet placeholder); on the right, held
 * still, "You?", for anyone who wants to work at Jontai Energy, with a WhatsApp to apply.
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
      <div className="team__row" data-reveal>
        <TeamRail count={TEAM.length}>
          {TEAM.map((p, i) => (
            <li key={p.name} className={`person${p.photo ? '' : ' person--soon'}`} style={{ '--i': i } as CSSProperties}>
              {p.photo ? (
                <figure className="person__frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.name} width={800} height={1000} loading="lazy" decoding="async" draggable={false} />
                </figure>
              ) : (
                <figure className="person__frame person__frame--soon" aria-hidden="true">
                  <UserCircle size={72} weight="thin" />
                  <span>Photo to come</span>
                </figure>
              )}
              <h3 className="person__name">{p.name}</h3>
              <p className="person__role">{p.role}</p>
            </li>
          ))}
        </TeamRail>
        <div className="person person--you">
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
        </div>
      </div>
    </section>
  );
}
