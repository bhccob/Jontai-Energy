import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIGHTS, kelvinLabel, kelvinStill, kelvinToRgb, kelvinValueText, lightById } from './kelvin.ts';

test('warm 3000K is amber and 6500K is near white', () => {
  assert.deepEqual(kelvinToRgb(3000), [255, 177, 110]);
  assert.deepEqual(kelvinToRgb(6500), [255, 254, 250]);
});

test('light gets bluer as the temperature rises', () => {
  let last = -1;
  for (let k = 3000; k <= 6500; k += 500) {
    const [, , b] = kelvinToRgb(k);
    assert.ok(b > last, `${k}K`);
    last = b;
  }
});

test('temperatures outside the physical range are clamped', () => {
  assert.deepEqual(kelvinToRgb(200), kelvinToRgb(1000));
  assert.deepEqual(kelvinToRgb(90000), kelvinToRgb(40000));
  assert.deepEqual(kelvinToRgb(Number.NaN), kelvinToRgb(6500));
});

test('labels name warm, neutral and daylight white', () => {
  assert.equal(kelvinLabel(3000), 'Warm white');
  assert.equal(kelvinLabel(3499), 'Warm white');
  assert.equal(kelvinLabel(3500), 'Neutral white');
  assert.equal(kelvinLabel(4999), 'Neutral white');
  assert.equal(kelvinLabel(5000), 'Daylight');
  assert.equal(kelvinLabel(6500), 'Daylight');
});

test('screen readers hear the value and its name', () => {
  assert.equal(kelvinValueText(4000), '4000 K, neutral white');
  assert.equal(kelvinValueText(6500), '6500 K, daylight');
});

const STILLS = [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500];

test('a temperature between two stills mixes them', () => {
  assert.deepEqual(kelvinStill(3250, STILLS), { a: 0, b: 1, t: 0.5 });
  assert.deepEqual(kelvinStill(4000, STILLS), { a: 2, b: 3, t: 0 });
});

test('the ends of the slider land on the first and last still', () => {
  assert.deepEqual(kelvinStill(6500, STILLS), { a: 7, b: 7, t: 0 });
  assert.deepEqual(kelvinStill(2000, STILLS), { a: 0, b: 1, t: 0 });
  assert.deepEqual(kelvinStill(9000, STILLS), { a: 7, b: 7, t: 0 });
});

test('the bulb comes in warm white and clear white, warm first', () => {
  assert.deepEqual(
    LIGHTS.map((l) => [l.id, l.name, l.k]),
    [
      ['warm', 'Warm white', 3000],
      ['clear', 'Clear white', 6500],
    ],
  );
  assert.equal(lightById('clear').name, 'Clear white');
});

const hue = ([r, g, b]: readonly number[]) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const h = max === r ? (g - b) / (max - min) : max === g ? 2 + (b - r) / (max - min) : 4 + (r - g) / (max - min);
  return (h * 60 + 360) % 360;
};

test('warm white glows golden, not salmon or orange', () => {
  const { glow } = lightById('warm');
  assert.equal(glow[0], 255);
  const h = hue(glow);
  assert.ok(h >= 32 && h <= 45, `hue ${h.toFixed(1)} should be gold`);
  assert.ok(glow[2] < 160, 'warm is clearly warm');
});

test('clear white is plain white: never blue, never grey', () => {
  const { glow, core } = lightById('clear');
  assert.ok(Math.min(...glow) >= 245, 'bright');
  assert.ok(glow[2] - glow[0] <= 2, 'not bluer than it is red');
  assert.deepEqual(core, [255, 255, 255]);
});
