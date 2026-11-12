import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMP_STILLS, kelvinLabel, kelvinStill, kelvinToRgb, kelvinValueText, lampGlow, lampLayers } from './kelvin.ts';

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

test('the baked bulbs run from warm 2700K to daylight 6500K', () => {
  assert.equal(LAMP_STILLS[0], 2700);
  assert.equal(LAMP_STILLS.at(-1), 6500);
});

test('the bulb layers mix the two nearest temperatures and never dim', () => {
  assert.deepEqual(lampLayers(2700), [1, 0, 0, 0, 0]);
  assert.deepEqual(lampLayers(6500), [1, 1, 1, 1, 1]);
  assert.deepEqual(lampLayers(4000), [1, 1, 0.5, 0, 0]);
  assert.deepEqual(lampLayers(1000), [1, 0, 0, 0, 0]);
  for (let k = 2700; k <= 6500; k += 100) assert.equal(lampLayers(k)[0], 1);
});

test('the bulb glows amber when warm and clean white in daylight, never blue', () => {
  const [wr, , wb] = lampGlow(2700);
  assert.equal(wr, 255);
  assert.ok(wb < 160, 'warm is amber');
  assert.deepEqual(lampGlow(6500), [255, 255, 255]);
  for (let k = 2700; k <= 6500; k += 100) {
    const [r, , b] = lampGlow(k);
    assert.ok(b <= r, `${k}K is never bluer than it is red`);
  }
});
