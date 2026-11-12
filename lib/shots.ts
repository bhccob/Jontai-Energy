// The home page's shots on the after-hours stage, by beat: 0 is the first view, 1 is Jontai Rewards. (The product walk
// adds its stops after these.) Distances are metres at true scale; yaw is radians, positive turning a product's front
// toward the right. Each product's contact shadow (public/stage) has the size it was baked at in Blender.

import type { Keyframe, Shot, Vec3 } from './stage.ts';

/** Every product on the stage, as named in public/models/showroom.v1.glb (plus the bulb, built in code). */
export const PRODUCTS = ['solar_panel', 'inverter', 'power_station', 'ac_outdoor', 'ac_indoor', 'site_camera', 'lounge_chair', 'bulb'] as const;
export type ProductId = (typeof PRODUCTS)[number];

/** Contact shadow sizes (width, depth) from tools/blender/products (export.py bake sizes). Hanging things have none. */
export const SHADOWS: Partial<Record<ProductId, [number, number]>> = {
  inverter: [0.9, 0.6],
  solar_panel: [1.5, 0.6],
  power_station: [0.9, 0.8],
  ac_outdoor: [1.3, 0.8],
  site_camera: [0.6, 0.6],
  lounge_chair: [1.1, 1.2],
};

const AWAY: Vec3 = [0, -20, 0];

/** The first view: the whole range together at true scale, in the right of the screen (the words take the left). */
export const HERO: Shot = {
  camera: { at: [-0.7, 1.4, 4.6], look: [0.55, 0.6, -0.3], fov: 30, shift: 0.25 },
  light: [0.45, 0.45, -0.3],
  products: {
    lounge_chair: { at: [-0.5, 0, -1.75], yaw: 0.4 },
    solar_panel: { at: [0.45, 0, -1.1], yaw: -0.5 },
    inverter: { at: [-0.2, 0, -0.35], yaw: 0.35 },
    site_camera: { at: [1.9, 0, -0.95], yaw: -0.55 },
    ac_outdoor: { at: [1.3, 0, 0.0], yaw: -0.45 },
    power_station: { at: [0.5, 0, 0.5], yaw: -0.35 },
    ac_indoor: { at: AWAY, yaw: 0, scale: 0 },
    bulb: { at: [0.0, 1.3, 0.15], yaw: 0 },
  },
};

/** The same group for the phone picture (9:10, under the words): centred, a step further back. Used for the still only. */
export const HERO_PHONE: Shot = {
  ...HERO,
  camera: { at: [0.15, 1.25, 4.85], look: [0.62, 0.47, -0.45], fov: 33, shift: 0 },
};

/** The six ranges as the first view lists them; pointing at one moves the key light onto its product (at `aim` m up). */
const range = (id: string, name: string, product: ProductId, aim: number) => {
  const p = HERO.products[product]!;
  return { id, name, product, light: [p.at[0], product === 'bulb' ? p.at[1] - 0.1 : aim, p.at[2]] as Vec3 };
};
export const RANGES = [
  range('solar', 'Solar', 'solar_panel', 0.8),
  range('backup', 'Backup power', 'power_station', 0.2),
  range('light', 'LED lighting', 'bulb', 0),
  range('cooling', 'Cooling', 'ac_outdoor', 0.3),
  range('security', 'Security', 'site_camera', 0.9),
  range('upstairs', 'Furniture', 'lounge_chair', 0.45),
];

/** Jontai Rewards: the products part to either side and the camera moves in a little; the card takes the middle. */
export const REWARDS: Shot = {
  camera: { at: [-0.4, 1.3, 3.6], look: [0.3, 0.7, -0.3], fov: 30, shift: 0.2 },
  light: [0.3, 0.8, 0],
  products: {
    solar_panel: { at: [-1.6, 0, -1.6], yaw: 0.2 },
    inverter: { at: [-1.9, 0, -0.6], yaw: 0.5 },
    site_camera: { at: [2.6, 0, -1.4], yaw: -0.6 },
    ac_outdoor: { at: [2.3, 0, -0.3], yaw: -0.6 },
    power_station: { at: [1.7, 0, 0.9], yaw: -0.7 },
    lounge_chair: { at: [-2.4, 0, 0.6], yaw: 0.8 },
    ac_indoor: { at: AWAY, yaw: 0, scale: 0 },
    bulb: { at: [-0.9, 1.9, -0.4], yaw: 0 },
  },
};

export const KEYS: Keyframe[] = [
  { at: 0, shot: HERO },
  { at: 1, shot: REWARDS },
];
