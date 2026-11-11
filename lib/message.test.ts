import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MESSAGE_LIMITS, checkMessage, contactHref, messageEmail, messageMailto, topicFrom } from './message.ts';

const good = { topic: 'rewards', message: 'Can I join for my shop?', name: ' Ana  Croes ', email: 'ana@example.com', phone: '' };

test('a complete message passes, trimmed', () => {
  const r = checkMessage(good);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.name, 'Ana Croes');
    assert.equal(r.value.topic, 'rewards');
  }
});

test('a message needs words, a name and an email that looks right', () => {
  const r = checkMessage({ ...good, message: ' ', name: '', email: 'ana@' });
  assert.ok(!r.ok);
  if (!r.ok) {
    assert.ok(r.errors.message);
    assert.ok(r.errors.name);
    assert.match(r.errors.email ?? '', /name@example.com/);
  }
});

test('an unknown topic is refused, a missing one is a question', () => {
  assert.ok(!checkMessage({ ...good, topic: 'spam' }).ok);
  const r = checkMessage({ ...good, topic: undefined });
  assert.ok(r.ok && r.value.topic === 'question');
});

test('long messages are refused', () => {
  assert.ok(!checkMessage({ ...good, message: 'x'.repeat(MESSAGE_LIMITS.message + 1) }).ok);
});

test('the page picks its topic from ?about=', () => {
  assert.equal(topicFrom('work'), 'work');
  assert.equal(topicFrom(['bundles', 'work']), 'bundles');
  assert.equal(topicFrom('nope'), 'question');
  assert.equal(topicFrom(undefined), 'question');
  assert.equal(contactHref('work'), '/contact?about=work');
  assert.equal(contactHref(), '/contact');
});

test('the store gets the topic in the subject and can reply to the visitor', () => {
  const r = checkMessage(good);
  assert.ok(r.ok);
  if (!r.ok) return;
  const { subject, text } = messageEmail(r.value);
  assert.equal(subject, 'Message: Jontai Rewards (Ana Croes)');
  assert.match(text, /Can I join for my shop\?/);
  assert.match(messageMailto(r.value, 'shop@example.com'), /^mailto:shop@example\.com\?subject=Message/);
});
