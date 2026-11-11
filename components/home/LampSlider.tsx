'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { kelvinLabel, kelvinToRgb, kelvinValueText } from '@/lib/kelvin';

/** The LED bulbs the store carries run from warm 2700K to daylight 6500K (Bob, round 11). */
const WARM = 2700;
const DAY = 6500;

/**
 * The lighting island's bulb, from warm 2700K to daylight 6500K: the slider sets the colour of its light (--kelvin on
 * the island), which tints the glass, its bright core and the halo it throws on the grass and the air (air.css, .lamp).
 */
export function LampSlider() {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(WARM);

  useEffect(() => {
    const island = ref.current?.closest<HTMLElement>('.island');
    if (!island) return;
    const [r, g, b] = kelvinToRgb(k);
    island.style.setProperty('--kelvin', `${r} ${g} ${b}`);
  }, [k]);

  const [wr, wg, wb] = kelvinToRgb(WARM);
  const [dr, dg, db] = kelvinToRgb(DAY);
  return (
    <div ref={ref} className="lamp-slider">
      <div className="lamp-slider__row">
        <label htmlFor={id}>Light colour</label>
        <output htmlFor={id} className="lamp-slider__value">
          <span className="figure">{k}K</span> {kelvinLabel(k)}
        </output>
      </div>
      <input
        id={id}
        className="slider lamp-slider__input"
        type="range"
        min={WARM}
        max={DAY}
        step={100}
        value={k}
        aria-valuetext={kelvinValueText(k)}
        onChange={(e) => setK(e.currentTarget.valueAsNumber)}
        style={{ '--track': `linear-gradient(90deg, rgb(${wr} ${wg} ${wb}), rgb(${dr} ${dg} ${db}))` } as CSSProperties}
      />
      <div className="lamp-slider__ends" aria-hidden="true">
        <span>2700K warm</span>
        <span>6500K daylight</span>
      </div>
    </div>
  );
}
