'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { kelvinLabel, kelvinToRgb, kelvinValueText, lampGlow, lampLayers } from '@/lib/kelvin';

/** The LED bulbs the store carries run from warm 2700K to daylight 6500K (Bob, round 11). */
const WARM = 2700;
const DAY = 6500;

/**
 * The lighting island's bulb, from warm 2700K to daylight 6500K. The bulb is baked lit from inside at five temperatures
 * (lib/kelvin LAMP_STILLS); the slider sets how much of each shows (--lamp-1 to --lamp-4 on the island), so the two
 * nearest mix and the light changes inside the glass, not on top of it (Bob, round 17), and the colour of the halo
 * round it (--glow).
 */
export function LampSlider() {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(WARM);

  useEffect(() => {
    const island = ref.current?.closest<HTMLElement>('[data-lamp]');
    if (!island) return;
    // The slider's own handle and figure in the light's colour, and the halo round the bulb.
    island.style.setProperty('--kelvin', kelvinToRgb(k).join(' '));
    island.style.setProperty('--glow', lampGlow(k).join(' '));
    lampLayers(k).forEach((w, j) => {
      if (j > 0) island.style.setProperty(`--lamp-${j}`, w.toFixed(3));
    });
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
