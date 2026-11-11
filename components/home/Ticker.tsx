import { ISLANDS } from '@/lib/islands';

/**
 * The six ranges running across a band of forest green, under the first view: a slow, endless line in thin wide
 * capitals that pauses under the pointer, each name a way to its island. One copy is read and tabbed through; the
 * copies that keep the line full are hidden from screen readers and the keyboard. Still with reduced motion.
 */
export function Ticker() {
  const row = (copy: number) => (
    <ul className="ticker__row" aria-hidden={copy > 0 ? true : undefined} key={copy}>
      {ISLANDS.map((it) => (
        <li key={it.id}>
          <a href={`#${it.id}`} tabIndex={copy > 0 ? -1 : undefined}>
            {it.name}
          </a>
          <span className="ticker__sep" aria-hidden="true">
            ·
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <nav className="ticker" aria-label="What we sell">
      <div className="ticker__track">{[0, 1, 2].map(row)}</div>
    </nav>
  );
}
