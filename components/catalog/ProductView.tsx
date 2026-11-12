'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { productById, type Product, type ProductPanel } from '@/lib/products';

/** The entrance each part of the panel gets, from CategoryDrawer (staggered, or a plain fade with reduced motion). */
type Rise = (i: number) => Pick<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'>;

/**
 * One product told in full, on the panel's forest side (round 31): what it does, its figures in a ruled row, the points
 * that matter as ruled lines (numbered when they happen in order, as delivery does), and the manufacturer's full table
 * behind a disclosure. The picture stands in the panel's studio (CategoryDrawer). Figures come only from supplied
 * documents.
 */
export function ProductView({ panel, rise }: { panel: ProductPanel; rise: Rise }) {
  const spec = panel.specs ? productById(panel.specs) : null;
  const List = panel.steps ? 'ol' : 'ul';

  return (
    <div className="drawer__body pv">
      <motion.div className="pv__intro" {...rise(1)}>
        <p className="pv__lead">{panel.intro}</p>
        {panel.highlight && <p className="pv__highlight">{panel.highlight}</p>}
      </motion.div>

      {panel.figures && (
        <motion.dl className="pv__figures" {...rise(2)}>
          {panel.figures.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </motion.dl>
      )}

      <motion.div {...rise(3)}>
        <List className="pv__points" data-steps={panel.steps || undefined}>
          {panel.points.map((p) => (
            <li key={p.title}>
              <h3 className="pv__point">{p.title}</h3>
              <p>{p.line}</p>
            </li>
          ))}
        </List>
      </motion.div>

      {spec && (
        <motion.details className="pv__specs" {...rise(4)}>
          <summary>
            Full specifications
            <Plus size={16} weight="bold" aria-hidden="true" />
          </summary>
          <SpecTables product={spec} />
        </motion.details>
      )}
      {panel.note && (
        <motion.p className="pv__note" {...rise(5)}>
          {panel.note}
        </motion.p>
      )}
    </div>
  );
}

/** The manufacturer's table: datasheet groups when there is a datasheet, otherwise the key specs and the model list. */
function SpecTables({ product }: { product: Product }) {
  const sheet = product.datasheet;
  if (sheet) {
    return (
      <div className="specs">
        {sheet.groups.map((g) => (
          <table key={g.title} className="specs__table">
            <caption>{g.title}</caption>
            {/* Model names head a group only when its values differ by model. */}
            {sheet.columns && g.rows.some((r) => r.values) && (
              <thead>
                <tr>
                  <td />
                  {sheet.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.values ? r.values.map((v, i) => <td key={i}>{v}</td>) : <td colSpan={sheet.columns?.length ?? 1}>{r.value}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    );
  }
  return (
    <div className="specs">
      {product.specs.length > 0 && (
        <table className="specs__table">
          <caption>At a glance</caption>
          <tbody>
            {product.specs.map((s) => (
              <tr key={s.label}>
                <th scope="row">{s.label}</th>
                <td>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {product.models && (
        <table className="specs__table">
          <caption>{product.models.caption}</caption>
          <thead>
            <tr>
              {product.models.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {product.models.rows.map(([model, ...rest]) => (
              <tr key={model}>
                <th scope="row">{model}</th>
                {rest.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
