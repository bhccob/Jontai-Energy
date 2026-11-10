// The stage's poses, as plain numbers: where the camera is, what the key light looks at, and where each product stands,
// for every beat of the home page (lib/shots.ts). The scene (components/stage) asks for the pose at a scroll position
// and moves toward it. Pure, so it is tested without three.js.

export type Vec3 = [number, number, number];

/** A product in a shot: where its base stands (metres, Y up), how far it is turned (radians), and its size. */
export interface Placement {
  at: Vec3;
  yaw: number;
  scale?: number;
}

export interface CameraPose {
  at: Vec3;
  look: Vec3;
  /** Vertical field of view, degrees. */
  fov: number;
  /** Shifts the picture sideways, as a share of the screen width: 0.18 puts the subject right of centre. */
  shift: number;
}

export interface Shot {
  camera: CameraPose;
  /** Where the key light points. */
  light: Vec3;
  products: Record<string, Placement>;
}

/** A shot pinned to a position along the page's beats (0 = the first view). */
export interface Keyframe {
  at: number;
  shot: Shot;
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

/** Ease in and out (cubic): camera moves start and finish gently. */
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

function blendPlacement(a: Placement | undefined, b: Placement | undefined, t: number): Placement | undefined {
  if (!a) return b;
  if (!b) return a;
  return { at: mix3(a.at, b.at, t), yaw: mix(a.yaw, b.yaw, t), scale: mix(a.scale ?? 1, b.scale ?? 1, t) };
}

/** The shot `t` of the way from `a` to `b` (t is used as given; ease it first if wanted). */
export function blendShot(a: Shot, b: Shot, t: number): Shot {
  const products: Record<string, Placement> = {};
  for (const id of new Set([...Object.keys(a.products), ...Object.keys(b.products)])) {
    const p = blendPlacement(a.products[id], b.products[id], t);
    if (p) products[id] = p;
  }
  return {
    camera: {
      at: mix3(a.camera.at, b.camera.at, t),
      look: mix3(a.camera.look, b.camera.look, t),
      fov: mix(a.camera.fov, b.camera.fov, t),
      shift: mix(a.camera.shift, b.camera.shift, t),
    },
    light: mix3(a.light, b.light, t),
    products,
  };
}

/** The shot at position `at` along the keyframes (sorted by `at`), eased between neighbours and held past the ends. */
export function sample(keys: Keyframe[], at: number): Shot {
  if (!keys.length) throw new Error('no keyframes');
  if (at <= keys[0].at) return keys[0].shot;
  const last = keys[keys.length - 1];
  if (at >= last.at) return last.shot;
  let i = 0;
  while (keys[i + 1].at < at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  return blendShot(a.shot, b.shot, easeInOut((at - a.at) / (b.at - a.at)));
}

/**
 * Frame-rate independent smoothing: moves `current` toward `target` so that after `dt` seconds the gap has shrunk by
 * e^(-rate * dt). A rate of 6 closes 95% of the gap in half a second.
 */
export const damp = (current: number, target: number, rate: number, dt: number) => target + (current - target) * Math.exp(-rate * dt);

/** `current` moved toward `target` by damp(); the same fraction of the gap closes for every number in the shot. */
export function approachShot(current: Shot, target: Shot, rate: number, dt: number): Shot {
  return blendShot(current, target, 1 - Math.exp(-rate * dt));
}

/** The largest gap between two shots, in metres, radians or degrees: below a small threshold nothing visibly moves. */
export function shotGap(a: Shot, b: Shot): number {
  let gap = 0;
  const take = (x: number, y: number) => {
    gap = Math.max(gap, Math.abs(x - y));
  };
  for (let i = 0; i < 3; i++) {
    take(a.camera.at[i], b.camera.at[i]);
    take(a.camera.look[i], b.camera.look[i]);
    take(a.light[i], b.light[i]);
  }
  take(a.camera.fov, b.camera.fov);
  take(a.camera.shift, b.camera.shift);
  for (const id of Object.keys(b.products)) {
    const p = a.products[id];
    const q = b.products[id];
    if (!p) continue;
    for (let i = 0; i < 3; i++) take(p.at[i], q.at[i]);
    take(p.yaw, q.yaw);
    take(p.scale ?? 1, q.scale ?? 1);
  }
  return gap;
}
