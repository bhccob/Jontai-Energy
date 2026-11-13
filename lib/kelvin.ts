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

/** The two colours the store's LED bulbs come in, as the lighting island's bulb shows them. */
export type LightId = 'warm' | 'clear';

export interface Light {
  id: LightId;
  name: 'Warm white' | 'Clear white';
  /** The colour temperature printed on the box. */
  k: number;
  /** The light where it glows (round the filaments, in the glass, in the air), as an eye used to daylight sees it. */
  glow: [number, number, number];
  /** The filaments' burning cores: nearly white, a touch of the colour. */
  core: [number, number, number];
}

/**
 * Warm white and clear white (Bob, round 33: "it doesnt match the real colors needs to be true warm white and clear
 * white"). Not a black body run through a camera: a 3000K filament looks golden, not salmon, and a 6500K one looks
 * plain bright white, never grey and never blue. The lighting island's bulb is baked lit in each
 * (tools/sky/bulb-light.mjs) and the page switches between the two (LampSwitch).
 */
export const LIGHTS: readonly Light[] = [
  { id: 'warm', name: 'Warm white', k: 3000, glow: [255, 196, 112], core: [255, 244, 222] },
  { id: 'clear', name: 'Clear white', k: 6500, glow: [250, 251, 250], core: [255, 255, 255] },
];

export function lightById(id: LightId): Light {
  return LIGHTS.find((l) => l.id === id) ?? LIGHTS[0];
}
