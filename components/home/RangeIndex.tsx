/** The six ranges as the first view lists them, and where each link lands (Security sits in the Lighting and cameras
 *  chapter until it has a stop of its own). */
const RANGES = [
  { name: 'Solar', href: '#solar' },
  { name: 'Backup power', href: '#backup' },
  { name: 'Lighting', href: '#light' },
  { name: 'Cooling', href: '#cooling' },
  { name: 'Security', href: '#light' },
  { name: 'Furniture', href: '#upstairs' },
];

/** The six ranges on one ruled line along the bottom of the first view. */
export function RangeIndex() {
  return (
    <nav className="ranges" aria-label="What we sell">
      <ul>
        {RANGES.map((r, i) => (
          <li key={r.name} data-hero style={{ ['--i' as string]: i }}>
            <a href={r.href}>{r.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
