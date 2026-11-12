import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESS_GOAL, POINTS_MAX, businessCard, formatAfl, formatPoints, regularCard, rewardFor } from './loyalty.ts';

test('every full Afl. 500 spent gives Afl. 25 back', () => {
  assert.deepEqual(rewardFor(2000), { vouchers: 4, back: 100, toNext: 500 });
  assert.deepEqual(rewardFor(1250), { vouchers: 2, back: 50, toNext: 250 });
  assert.equal(rewardFor(499).back, 0);
  assert.equal(rewardFor(-10).back, 0);
  assert.equal(rewardFor(Number.NaN).vouchers, 0);
});

test('regular members unlock an Afl. 25 voucher for every 500 points', () => {
  assert.deepEqual(regularCard(1250), { vouchers: 2, credit: 50, fraction: 0.5, toNext: 250 });
  assert.deepEqual(regularCard(500), { vouchers: 1, credit: 25, fraction: 0, toNext: 500 });
  assert.equal(regularCard(499).vouchers, 0);
  assert.equal(regularCard(5000).credit, 250);
});

test('business members reach 5,000 points for 10% off', () => {
  assert.deepEqual(businessCard(3750), { reached: false, fraction: 0.75, toGoal: 1250 });
  assert.deepEqual(businessCard(5000), { reached: true, fraction: 1, toGoal: 0 });
  assert.equal(BUSINESS_GOAL, 5000);
  assert.equal(POINTS_MAX, 5000);
});

test('nonsense points earn nothing', () => {
  for (const p of [-5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(regularCard(p).vouchers, 0);
    assert.equal(businessCard(p).fraction, 0);
  }
});

test('amounts and points read the site\'s way', () => {
  assert.equal(formatAfl(1500), 'Afl. 1,500');
  assert.equal(formatAfl(25), 'Afl. 25');
  assert.equal(formatPoints(3750), '3,750 points');
  assert.equal(formatPoints(1), '1 point');
});
