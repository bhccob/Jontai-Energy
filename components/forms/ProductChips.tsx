import { Check, DotsThree, GasCan } from '@phosphor-icons/react/dist/ssr';
import { QUOTE_TOPICS, type QuoteTopic } from '@/lib/quote';

/**
 * The picture that shows each product: its range's island (public/sky, tools/sky/thumbs.mjs), or for a product with no
 * island of its own a cut-out of its catalogue picture (tools/sky/catalog-thumbs.mjs). The generator and "Something
 * else" have none, so an icon.
 */
const PICS: Partial<Record<QuoteTopic, string>> = {
  inverter: '/sky/island-solar-160.webp',
  'solar-panels': '/sky/island-array-160.webp',
  'solar-ac': '/sky/island-cooling-160.webp',
  'solar-fan': '/sky/thumb-solar-fan-160.webp',
  'power-station': '/sky/island-power-160.webp',
  led: '/sky/island-light-160.webp',
  'street-lamp': '/sky/thumb-street-lamp-160.webp',
  cameras: '/sky/island-security-160.webp',
  furniture: '/sky/island-furniture-160.webp',
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
                <img src={pic} alt="" width={80} height={80} loading="lazy" decoding="async" />
              ) : t.id === 'other' ? (
                <DotsThree size={26} weight="bold" />
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
