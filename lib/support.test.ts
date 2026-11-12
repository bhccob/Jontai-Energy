import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, RETURNS, SERVICE, WARRANTY } from './support.ts';

const all = JSON.stringify({ QUESTIONS, WARRANTY, RETURNS, SERVICE });

test('support never promises installation or work on site', () => {
  // Installing comes up only to say who does it, and that the store does not.
  assert.doesNotMatch(all, /we install|installation (service|labour|warranty)|our (technician|installer)s?|on-site|certified/i);
});

test('the policies never mention labour or technicians', () => {
  // Both read as installation or work on site; Questions may still say who installs (an electrician, a technician).
  assert.doesNotMatch(JSON.stringify({ WARRANTY, RETURNS, SERVICE }), /labour|technician/i);
});

test('support shows no prices, financing or efficiency figures', () => {
  assert.doesNotMatch(all, /\$|AWG|Afl\.?\s?\d|financ|efficien/i);
});

test('only solar batteries carry a warranty, one year from the date of purchase', () => {
  assert.deepEqual(
    WARRANTY.periods.map((p) => [p.what, p.period]),
    [['Solar batteries', '1 year']],
  );
  assert.match(WARRANTY.from, /date of purchase/);
  assert.match(WARRANTY.from, /do not carry a store warranty/);
});

test('the wrong item is exchanged after a check, with no cash refunds and the difference as store credit', () => {
  assert.match(RETURNS.lead, /receipt/);
  assert.match(RETURNS.lead, /check/);
  assert.match(RETURNS.lead, /does not give cash refunds/);
  assert.match(RETURNS.lead, /store credit/);
  assert.doesNotMatch(JSON.stringify(RETURNS), /refund to the original|money back/i);
  assert.ok(SERVICE.steps.some((s) => /90-day/.test(s.line)));
});

test('Rewards need only the card at the counter; logging in only shows the points', () => {
  const join = QUESTIONS.find((x) => x.q === 'How do I join Rewards?');
  assert.match(join?.a ?? '', /apply at the counter/);
  assert.match(join?.a ?? '', /only to see your points/);
});

test('the questions Visit shows come first, and every answer is a full sentence', () => {
  assert.equal(QUESTIONS[0].q, 'Who installs what I buy?');
  for (const { q, a } of QUESTIONS) {
    assert.match(q, /\?$/);
    assert.match(a, /\.$/);
  }
});
