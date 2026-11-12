import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUOTE_TOPICS, checkQuote, quoteEmail, quoteHref, quoteMailto, quoteWhatsapp, topicsFrom } from './quote.ts';

const valid = { topics: ['inverter', 'generator'], details: 'Two units for a shop.', area: '', name: 'Maria Croes', email: 'maria@example.com', phone: '' };

test('a ?for= value becomes known topics, unknown ones dropped', () => {
  assert.deepEqual(topicsFrom('inverter'), ['inverter']);
  assert.deepEqual(topicsFrom('inverter,generator,boat'), ['inverter', 'generator']);
  assert.deepEqual(topicsFrom(['furniture', 'furniture']), ['furniture']);
  assert.deepEqual(topicsFrom(undefined), []);
});

test('quote links carry their topic', () => {
  assert.equal(quoteHref(), '/quote');
  assert.equal(quoteHref('power-station'), '/quote?for=power-station');
});

test('a complete request passes, trimmed', () => {
  const r = checkQuote({ ...valid, name: '  Maria Croes ', email: ' maria@example.com' });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.name, 'Maria Croes');
    assert.equal(r.value.email, 'maria@example.com');
    assert.deepEqual(r.value.topics, ['inverter', 'generator']);
  }
});

test('name, email and something to quote are required', () => {
  const r = checkQuote({ topics: [], details: ' ', name: '', email: 'not-an-email' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'topics']);
});

test('a message alone is enough to quote from', () => {
  assert.equal(checkQuote({ ...valid, topics: [] }).ok, true);
});

test('over-long fields and unknown topics are refused', () => {
  const r = checkQuote({ ...valid, details: 'x'.repeat(2001), topics: ['boat'] });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.details);
    assert.ok(r.errors.topics);
  }
});

test('anything that is not an object is refused', () => {
  assert.equal(checkQuote(null).ok, false);
  assert.equal(checkQuote('hello').ok, false);
});

test('the store email names the products and the person, on one subject line', () => {
  const r = checkQuote({ ...valid, name: 'Maria\nCroes', area: 'Noord' });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const { subject, text } = quoteEmail(r.value);
  assert.equal(subject, 'Quote request: Hybrid inverter, Generator (Maria Croes)');
  assert.match(text, /For: Hybrid inverter, Generator/);
  assert.match(text, /Delivery area: Noord/);
  assert.match(text, /Two units for a shop\./);
  assert.doesNotMatch(text, /Phone:/);
});

test('"Something else" is a topic, and a request says whether it is for home or business', () => {
  assert.equal(QUOTE_TOPICS.at(-1)?.id, 'other');
  const r = checkQuote({ ...valid, topics: ['other'], use: 'business' });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.use, 'business');
    assert.match(quoteEmail(r.value).text, /Use: Business/);
  }
  const p = checkQuote(valid);
  assert.ok(p.ok && p.value.use === 'personal' && p.value.reply === 'email');
});

test('a reply on WhatsApp needs a number and not an email', () => {
  const missing = checkQuote({ ...valid, email: '', reply: 'whatsapp' });
  assert.ok(!missing.ok && missing.errors.phone && !missing.errors.email);
  const r = checkQuote({ ...valid, email: '', phone: '+297 586 5323', reply: 'whatsapp' });
  assert.ok(r.ok);
  if (r.ok) assert.match(quoteEmail(r.value).text, /reply on WhatsApp, at \+297 586 5323/);
  assert.ok(!checkQuote({ ...valid, phone: '12', reply: 'whatsapp' }).ok);
});

test('the request can go on WhatsApp instead, typed in', () => {
  const link = quoteWhatsapp({ topics: ['led'], use: 'business', details: 'Ten bulbs.', name: 'Maria' });
  assert.match(link, /^https:\/\/wa\.me\/\d+\?text=/);
  assert.match(decodeURIComponent(link), /For: LED lighting/);
  assert.match(decodeURIComponent(link), /Use: Business/);
});

test('the email-app fallback is addressed to the store, encoded', () => {
  const r = checkQuote(valid);
  if (!r.ok) throw new Error('expected a valid request');
  const link = quoteMailto(r.value);
  assert.match(link, /^mailto:jontai@qq\.com\?subject=Quote%20request%3A%20Hybrid%20inverter/);
  assert.match(link, /&body=/);
  assert.doesNotMatch(link, /\+/);
});
