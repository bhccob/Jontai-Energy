import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { GOOGLE_RATING, REVIEWS } from './reviews.ts';
import { TEAM } from './team.ts';

test('reviews keep reviewers to a first name and an initial', () => {
  for (const r of REVIEWS) assert.match(r.name, /^[A-Z][a-z']+ [A-Z]\.$/, r.name);
});

test('reviews are whole stars with words', () => {
  for (const r of REVIEWS) {
    assert.ok(r.stars >= 1 && r.stars <= 5);
    assert.ok(r.text.length > 10);
  }
});

test('the Google rating is the listing’s own, not rounded up', () => {
  assert.equal(GOOGLE_RATING.score, 4.5);
  assert.equal(GOOGLE_RATING.count, 73);
});

test('the team has its two people, each with a photo on disk', () => {
  assert.deepEqual(
    TEAM.map((p) => p.name),
    ['Chakho Chung', 'Bob Chung'],
  );
  for (const p of TEAM) assert.ok(existsSync(join(import.meta.dirname, '..', 'public', p.photo)), p.photo);
});
