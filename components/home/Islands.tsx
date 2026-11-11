import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS, dayVars } from '@/lib/islands';
import { QUOTE_ACTION } from '@/lib/quote';
import { IslandWalk } from './IslandWalk';

/**
 * What we sell, as six islands through one Aruban day: the panels in the morning sun, cooling at midday, backup power
 * in the evening, lighting after dark, cameras at night, furniture at the weekend. Not the valley of the first view:
 * here the air itself changes colour. On wide screens with motion the section holds still and the scroll walks from
 * one island to the next while the light moves with it (IslandWalk); on phones, with reduced motion or without
 * scripts, the islands stack, each in its own light.
 */
export function Islands() {
  return (
    <section id="products" className="islands" aria-labelledby="islands-title">
      <header className="islands__intro">
        <h2 id="islands-title" className="air-display islands__title" data-words>
          <span className="line">
            <Words text="Six ranges," />
          </span>{' '}
          <span className="line">
            <Words text="one store." />
          </span>
        </h2>
        <p className="islands__lead" data-reveal>
          One Aruban day, from the morning sun on the panels to the weekend upstairs. Pictures are illustrations, not specific stock.
        </p>
      </header>

      <div className="islands__rail" style={dayVars(ISLANDS[0].day) as CSSProperties}>
        <div className="islands__air" aria-hidden="true">
          <div className="islands__glow" />
        </div>
        <div className="islands__track">
          {ISLANDS.map((it, i) => (
            <article key={it.id} id={it.id} className="island" aria-labelledby={`${it.id}-title`} tabIndex={-1} style={dayVars(it.day) as CSSProperties}>
              <div className="island__text">
                <p className="island__when">
                  <span className="island__count">{String(i + 1).padStart(2, '0')}</span> {it.day.label}
                </p>
                <h3 id={`${it.id}-title`} className="air-display island__name">
                  {it.name}
                </h3>
                <p className="island__line">{it.line}</p>
                {it.facts && (
                  <dl className="island__facts">
                    {it.facts.map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd className="figure">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {it.note && <p className="island__note">{it.note}</p>}
                <div className="island__actions">
                  {it.actions.map((a) => (
                    <OpenCategoryButton key={a.panel} id={a.panel} className="textlink">
                      {a.label} <ArrowRight size={18} weight="bold" aria-hidden="true" />
                    </OpenCategoryButton>
                  ))}
                  <a href={`/quote?for=${it.quote}`} className="textlink">
                    {QUOTE_ACTION}
                  </a>
                </div>
              </div>
              <figure className="island__pic" aria-hidden="true">
                <div className="island__float">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/sky/island-${it.image}-1200.webp`}
                    srcSet={`/sky/island-${it.image}-700.webp 700w, /sky/island-${it.image}-1200.webp 1200w`}
                    sizes="(max-width: 60rem) 86vw, 44vw"
                    alt=""
                    width={it.size[0]}
                    height={it.size[1]}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </figure>
            </article>
          ))}
        </div>
        <IslandWalk items={ISLANDS.map(({ id, name, day }) => ({ id, name, day }))} />
      </div>
    </section>
  );
}
