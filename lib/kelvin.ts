// Colour temperature for the LED bulb slider. The store carries bulbs from warm 3000K to daylight 6500K (the owner's
// range); the bulb is rendered at eight temperatures and the slider mixes the two nearest renders.

export type KelvinName = 'Warm white' | 'Neutral white' | 'Daylight';

const clampByte = (v: number) => Math.round(Math.min(255, Math.max(0, v)));

/** Approximate sRGB of a black body at `k` kelvin (Tanner Helland's fit), clamped to 1000-40000K. */
export function kelvinToRgb(k: number): [number, number, number] {
  const t = (Number.isFinite(k) ? Math.min(40000, Math.max(1000, k)) : 6500) / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [clampByte(r), clampByte(g), clampByte(b)];
}

export function kelvinLabel(k: number): KelvinName {
  if (k < 3500) return 'Warm white';
  if (k < 5000) return 'Neutral white';
  return 'Daylight';
}

/** "4000 K, neutral white", for the slider's aria-valuetext. */
export function kelvinValueText(k: number): string {
  return `${Math.round(k)} K, ${kelvinLabel(k).toLowerCase()}`;
}

/** The two rendered stills either side of `k` (ascending kelvin list) and the mix from a to b. */
export function kelvinStill(k: number, stills: number[]): { a: number; b: number; t: number } {
  const last = stills.length - 1;
  const v = Math.min(stills[last], Math.max(stills[0], k));
  let a = 0;
  while (a < last && stills[a + 1] <= v) a++;
  if (a === last) return { a: last, b: last, t: 0 };
  return { a, b: a + 1, t: (v - stills[a]) / (stills[a + 1] - stills[a]) };
}

/** The temperatures the lighting island's bulb is baked at (tools/sky/bulb-light.mjs, Bob round 17). */
export const LAMP_STILLS = [2700, 3500, 4500, 5500, 6500];

/**
 * How much of each baked bulb shows at `k`. The pictures are stacked in order: the first always shows, and each next
 * one fades in between the temperature before it and its own, so the two nearest mix and the bulb never dims between.
 */
export function lampLayers(k: number, stills: number[] = LAMP_STILLS): number[] {
  return stills.map((s, i) => (i === 0 ? 1 : Math.min(1, Math.max(0, (k - stills[i - 1]) / (s - stills[i - 1])))));
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/**
 * The colour of the bulb's light as a camera balanced for neutral 4300K light sees it, at full strength: warm reads
 * amber and daylight a little cool, as in a photograph. Shared by the baked bulb (tools/sky/bulb-light.mjs) and its
 * halo on the page (LampSlider).
 */
export function lampGlow(k: number): [number, number, number] {
  const wb = kelvinToRgb(4300).map((v) => toLinear(v / 255));
  const lin = kelvinToRgb(k).map((v, c) => toLinear(v / 255) / wb[c]);
  const max = Math.max(...lin);
  return lin.map((v) => clampByte(toSrgb(v / max) * 255)) as [number, number, number];
}
