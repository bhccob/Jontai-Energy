import type { CSSProperties } from 'react';
import { LIGHTS } from '@/lib/kelvin';

/**
 * The lighting island's bulb in the two colours the store's LED bulbs come in, warm white and clear white (Bob, round
 * 33: "the lightbulb brightness adjuster is not good at all ... needs to be true warm white and clear white"). Two
 * plain radio buttons, so the keyboard and screen readers know them; the page does the rest in CSS (air.css): picking
 * clear white fades the bulb baked in clear white over the warm one and turns the halo round it white. Each choice
 * carries a dot of its own light, and the chosen one is filled with it.
 */
export function LampSwitch() {
  return (
    <fieldset className="lamp-switch">
      <legend className="lamp-switch__label">Light colour</legend>
      <div className="lamp-switch__opts">
        {LIGHTS.map((l, i) => (
          <label key={l.id} className="lamp-switch__opt" style={{ '--light': l.glow.join(' ') } as CSSProperties}>
            <input type="radio" name="lamp-light" value={l.id} defaultChecked={i === 0} />
            <span className="lamp-switch__dot" aria-hidden="true" />
            <span className="lamp-switch__name">{l.name}</span>
            <span className="lamp-switch__k figure">{l.k}K</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
