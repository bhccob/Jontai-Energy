import { Check, GasCan } from '@phosphor-icons/react/dist/ssr';
import { QUOTE_TOPICS, type QuoteTopic } from '@/lib/quote';

/** The island picture that shows each product (public/sky, tools/sky/thumbs.mjs); the generator has none, so an icon. */
const PICS: Partial<Record<QuoteTopic, string>> = {
  inverter: 'solar',
  'solar-panels': 'array',
  'solar-ac': 'cooling',
  'power-station': 'power',
  led: 'light',
  cameras: 'security',
  furniture: 'furniture',
};

/**
 * What the quote is for, as glass chips with the range's own island in each (Bob, round 18: the quote page creative
 * and not boxy). Real checkboxes, so they work with a keyboard and a screen reader as a group; pick one or more.
 */
export function ProductChips({
  labelId,
  value,
  onChange,
  error,
  describedBy,
}: {
  labelId: string;
  value: QuoteTopic[];
  onChange: (next: QuoteTopic[]) => void;
  error?: string;
  describedBy?: string;
}) {
  return (
    <div className="chips chips--pics" role="group" aria-labelledby={labelId} aria-describedby={describedBy} data-invalid={Boolean(error) || undefined}>
      {QUOTE_TOPICS.map((t, i) => {
        const on = value.includes(t.id);
        const pic = PICS[t.id];
        return (
          <label key={t.id} className="chip chip--pic" data-on={on || undefined}>
            <input
              type="checkbox"
              name="topics"
              value={t.id}
              checked={on}
              data-field={i === 0 ? 'topics' : undefined}
              onChange={() => onChange(on ? value.filter((x) => x !== t.id) : [...value, t.id])}
            />
            <span className="chip__pic" aria-hidden="true">
              {pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/sky/island-${pic}-160.webp`} alt="" width={80} height={80} loading="lazy" decoding="async" />
              ) : (
                <GasCan size={22} weight="light" />
              )}
            </span>
            <span className="chip__label">{t.label}</span>
            <span className="chip__tick" aria-hidden="true">
              <Check size={12} weight="bold" />
            </span>
          </label>
        );
      })}
    </div>
  );
}
