import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arubaClock, clockText, sunNow, sunTimes } from './sun.ts';

test('Aruba keeps UTC-4 all year', () => {
  assert.deepEqual(arubaClock(new Date('2026-11-11T14:55:00Z')), { year: 2026, month: 10, day: 11, minutes: 10 * 60 + 55 });
  assert.equal(arubaClock(new Date('2026-07-01T02:30:00Z')).day, 30);
});

test('sunrise and sunset stay in the range Oranjestad sees through the year', () => {
  for (let m = 0; m < 12; m++) {
    for (const d of [1, 15]) {
      const { rise, set } = sunTimes(2026, m, d);
      assert.ok(rise >= 6 * 60 + 10 && rise <= 7 * 60 + 10, `rise ${m + 1}/${d} ${clockText(rise)}`);
      assert.ok(set >= 18 * 60 + 5 && set <= 19 * 60 + 15, `set ${m + 1}/${d} ${clockText(set)}`);
      const length = set - rise;
      assert.ok(length > 11 * 60 && length < 13 * 60, `day length ${m + 1}/${d}`);
    }
  }
});

test('the longest day is in June and the shortest in December', () => {
  const june = sunTimes(2026, 5, 21);
  const dec = sunTimes(2026, 11, 21);
  assert.ok(june.set - june.rise > dec.set - dec.rise);
});

test('times read the way the site writes them', () => {
  assert.equal(clockText(0), '12:00 AM');
  assert.equal(clockText(6 * 60 + 41), '6:41 AM');
  assert.equal(clockText(12 * 60 + 5), '12:05 PM');
  assert.equal(clockText(18 * 60 + 12), '6:12 PM');
});

test('the line follows the sun', () => {
  const morning = sunNow(new Date('2026-11-11T14:55:00Z'));
  assert.equal(morning.up, true);
  assert.equal(morning.part, 'day');
  assert.match(morning.line, /^Sun up until 6:\d\d PM$/);
  const night = sunNow(new Date('2026-11-12T02:00:00Z'));
  assert.equal(night.up, false);
  assert.equal(night.part, 'night');
  assert.match(night.line, /^Sunrise at 6:\d\d AM$/);
  const early = sunNow(new Date('2026-11-11T09:00:00Z'));
  assert.match(early.line, /^Sunrise at 6:\d\d AM$/);
});
