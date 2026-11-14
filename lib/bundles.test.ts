import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUNDLE_TEASER, bundleQuestion, shouldAutoOpen } from './bundles.ts';

test('round 41: the popup says bundles and discounts are coming soon, with no month, offers, savings or prices', () => {
  const all = Object.values(BUNDLE_TEASER).join(' ');
  assert.match(all, /coming soon/i);
  assert.match(all, /bundles/i);
  assert.match(all, /discounts/i);
  assert.doesNotMatch(all, /January|February|March|April|May|June|July|August|September|October|November|December/);
  assert.doesNotMatch(all, /Afl|\$|price|\d+\s*%/i);
});

test('the popup never promises installation', () => {
  assert.doesNotMatch(Object.values(BUNDLE_TEASER).join(' '), /install/i);
});

test('the question about bundles opens the contact page with its topic chosen', () => {
  assert.equal(bundleQuestion(), '/contact?about=bundles');
});

test('the popup opens by itself once, and only near the top', () => {
  assert.equal(shouldAutoOpen(false, 0, 900), true);
  assert.equal(shouldAutoOpen(false, 400, 900), false);
  assert.equal(shouldAutoOpen(true, 0, 900), false);
});
