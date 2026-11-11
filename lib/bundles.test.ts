import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUNDLES, BUNDLE_NOTE, bundleQuestion, shouldAutoOpen } from './bundles.ts';

test('three sample bundles, each saving a whole percentage, none with a price', () => {
  assert.equal(BUNDLES.length, 3);
  for (const b of BUNDLES) {
    assert.ok(Number.isInteger(b.save) && b.save > 0 && b.save < 50, b.id);
    assert.doesNotMatch(`${b.name} ${b.items}`, /Afl|\$|price/i);
  }
  assert.equal(new Set(BUNDLES.map((b) => b.id)).size, 3);
});

test('the popup says the offers are samples and never promises installation', () => {
  assert.match(BUNDLE_NOTE, /sample/i);
  assert.doesNotMatch(JSON.stringify(BUNDLES) + BUNDLE_NOTE, /install/i);
});

test('the question about bundles opens the contact page with its topic chosen', () => {
  assert.equal(bundleQuestion(), '/contact?about=bundles');
});

test('the popup opens by itself once, and only near the top', () => {
  assert.equal(shouldAutoOpen(false, 0, 900), true);
  assert.equal(shouldAutoOpen(false, 400, 900), false);
  assert.equal(shouldAutoOpen(true, 0, 900), false);
});
