import Link from 'next/link';
import { SpecTables } from '@/components/catalog/ProductView';
import { ProductRail } from '@/components/home/ProductRail';
import { ProductPicture, ProductTile } from '@/components/home/ProductTile';
import { productBySlug } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { DETAILS } from '@/lib/productPages';
import { panelById, productById } from '@/lib/products';
import { QUOTE_ACTION } from '@/lib/quote';

/** Everything a product's page says: its own words first, then its product panel's (lib/productPages.ts). */
export function pageOf(slug: string) {
  const product = productBySlug(slug);
  if (!product) return null;
  const d = DETAILS[product.id] ?? {};
  const panel = d.panel ? panelById(d.panel) : null;
  const specsId = d.specs ?? panel?.specs;
  return {
    product,
    title: d.title ?? product.name,
    model: d.model ?? panel?.model,
    intro: d.intro ?? panel?.intro ?? product.line,
    highlight: panel?.highlight,
    figures: panel?.figures,
    points: d.points ?? panel?.points ?? [],
    steps: panel?.steps,
    specs: specsId ? productById(specsId) : null,
    note: d.note ?? panel?.note,
  };
}

/**
 * One product told in full (round 41, Bob: "i want each individual item to get their own page when clicked on and be
 * more specific on products"): where it sits in the store, its picture in a pane of dark glass beside its name, what it
 * is, the figures from its manufacturer's document when there is one, and the way to ask for a quote; then what to know
 * as ruled points, the full specifications when there are some, and the other products in its range. No figure appears
 * that is not in a supplied document. Shown on its own page (app/products/[slug]) and, from the home page, in a sheet
 * over it (ProductSheet, round 44), so going back never reloads the home page.
 */
export function ProductDetail({ slug }: { slug: string }) {
  const page = pageOf(slug);
  if (!page) return null;
  const { product, title, model, intro, highlight, figures, points, steps, specs, note } = page;
  const range = product.range;
  const others = range.products.filter((p) => p.id !== product.id);
  const List = steps ? 'ol' : 'ul';

  return (
    <>
      <section className="pp__top" aria-labelledby="pp-title">
        <nav className="pp__crumbs" aria-label="Breadcrumb">
          <Link href="/#products">What we sell</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/#${range.id}`}>{range.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <div className="pp__grid">
          <div className="pp__frame product__frame" data-bulb={product.bulb || undefined}>
            <ProductPicture p={product} sizes="(max-width: 60rem) 92vw, 54vw" eager />
          </div>
          <div className="pp__info">
            <p className="pp__range">{range.name}</p>
            <h1 id="pp-title" className="pp__name">
              {title}
            </h1>
            {model && <p className="pp__model">{model}</p>}
            <p className="pp__intro">{intro}</p>
            {highlight && <p className="pp__highlight">{highlight}</p>}
            {figures && (
              <dl className="range__facts pp__figures">
                {figures.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="pp__actions">
              <a href={`/quote?for=${product.quote}`} className="btn btn--primary">
                {QUOTE_ACTION}
              </a>
              <a href={contactHref('question')} className="textlink">
                Ask us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pp__details" aria-labelledby="pp-know">
        <h2 id="pp-know" className="pp__heading">
          What to know
        </h2>
        <div>
          <List className="pp__points" data-steps={steps || undefined}>
            {points.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.line}</p>
              </li>
            ))}
          </List>
          {specs && (
            <div className="pp__specs">
              <h3 className="pp__subheading">Full specifications</h3>
              <SpecTables product={specs} />
            </div>
          )}
          {note && <p className="pp__note">{note}</p>}
          <p className="pp__note">Pictures are illustrations, not specific stock.</p>
        </div>
      </section>

      {others.length > 0 && (
        <section className="pp__more" aria-labelledby="pp-more">
          <h2 id="pp-more" className="pp__heading">
            More in {range.name}
          </h2>
          {others.length > 2 ? (
            <ProductRail count={others.length} labelledBy="pp-more">
              {others.map((p) => (
                <li key={p.id} className="product" data-bulb={p.bulb || undefined}>
                  <ProductTile p={p} />
                </li>
              ))}
            </ProductRail>
          ) : (
            <ul className="range__products" aria-labelledby="pp-more">
              {others.map((p) => (
                <li key={p.id} className="product" data-bulb={p.bulb || undefined}>
                  <ProductTile p={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
