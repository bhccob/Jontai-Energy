import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { ISLANDS } from '@/lib/islands';
import { QUOTE_ACTION } from '@/lib/quote';
import { IslandWalk } from './IslandWalk';

/**
 * What we sell, as six islands over the valley. On wide screens with motion the section holds still and the scroll
 * walks from one island to the next (IslandWalk): each holds long enough to read, then the next drifts in. On phones,
 * with reduced motion or without scripts, the islands simply stack, one after another.
 */
export function Islands() {
  return (
    <section id="products" className="islands" aria-labelledby="islands-title">
      <header className="islands__intro">
        <h2 id="islands-title" className="air-display islands__title">
          <span>Six ranges,</span> <span>one store.</span>
        </h2>
        <p className="islands__lead">Power and light on the ground floor, furniture upstairs. Pictures are illustrations, not specific stock.</p>
      </header>

      <div className="islands__rail">
        <div className="islands__bg" aria-hidden="true" />
        <div className="islands__track">
          {ISLANDS.map((it) => (
            <article key={it.id} id={it.id} className="island" aria-labelledby={`${it.id}-title`} tabIndex={-1}>
              <div className="island__text">
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
        <IslandWalk items={ISLANDS.map(({ id, name }) => ({ id, name }))} />
      </div>
    </section>
  );
}
