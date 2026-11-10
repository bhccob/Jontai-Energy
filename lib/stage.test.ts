import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approachShot, blendShot, damp, easeInOut, sample, shotGap, type Keyframe, type Shot } from './stage.ts';

const shot = (x: number, extra: Shot['products'] = {}): Shot => ({
  camera: { at: [x, 1, 4], look: [0, 0.5, 0], fov: 30, shift: 0 },
  light: [x, 0.3, 0],
  products: { panel: { at: [x, 0, 0], yaw: x }, ...extra },
});

test('easing starts and ends at rest and passes the middle', () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(easeInOut(0.5), 0.5);
  assert.ok(easeInOut(0.1) < 0.1);
  assert.equal(easeInOut(-1), 0);
  assert.equal(easeInOut(2), 1);
});

test('a blend halfway is halfway for the camera, the light and every product', () => {
  const b = blendShot(shot(0), shot(2), 0.5);
  assert.deepEqual(b.camera.at, [1, 1, 4]);
  assert.deepEqual(b.light, [1, 0.3, 0]);
  assert.deepEqual(b.products.panel.at, [1, 0, 0]);
  assert.equal(b.products.panel.yaw, 1);
  assert.equal(b.products.panel.scale, 1);
});

test('a product in only one shot keeps its place through the blend', () => {
  const b = blendShot(shot(0), shot(2, { chair: { at: [5, 0, 5], yaw: 0.3 } }), 0.25);
  assert.deepEqual(b.products.chair.at, [5, 0, 5]);
});

test('sampling holds the first and last shots past the ends and eases between', () => {
  const keys: Keyframe[] = [
    { at: 0, shot: shot(0) },
    { at: 1, shot: shot(4) },
    { at: 3, shot: shot(8) },
  ];
  assert.equal(sample(keys, -2).camera.at[0], 0);
  assert.equal(sample(keys, 9).camera.at[0], 8);
  assert.equal(sample(keys, 0.5).camera.at[0], 2);
  assert.equal(sample(keys, 2).camera.at[0], 6);
  assert.ok(sample(keys, 0.25).camera.at[0] < 1);
});

test('approaching a shot closes every gap and reports when nothing is left to move', () => {
  let cur = shot(0);
  const target = shot(3);
  assert.equal(shotGap(cur, target), 3);
  for (let i = 0; i < 240; i++) cur = approachShot(cur, target, 6, 1 / 60);
  assert.ok(shotGap(cur, target) < 1e-4);
  assert.equal(shotGap(target, target), 0);
});

test('damping closes the gap at the same pace whatever the frame rate', () => {
  const at60 = Array.from({ length: 60 }).reduce<number>((v) => damp(v, 10, 6, 1 / 60), 0);
  const at30 = Array.from({ length: 30 }).reduce<number>((v) => damp(v, 10, 6, 1 / 30), 0);
  assert.ok(Math.abs(at60 - at30) < 1e-9);
  assert.ok(at60 > 9.9 && at60 < 10);
});
