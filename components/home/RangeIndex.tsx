import { ISLANDS } from '@/lib/islands';

/** The six ranges on one ruled line along the bottom of the first view, in the order the islands walk them. */
export function RangeIndex() {
  return (
    <nav className="ranges" aria-label="What we sell">
      <ul>
        {ISLANDS.map((r, i) => (
          <li key={r.id} data-hero style={{ ['--i' as string]: i }}>
            <a href={`#${r.id}`}>{r.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
