import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_LIMIT, clientAddress, fromThisSite, guardPost, isJson, rateLimiter, readJson } from './guard.ts';

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request('https://jontai.example/api/quote', {
    method: 'POST',
    headers: { host: 'jontai.example', 'content-type': 'application/json', ...headers },
    body,
    // Node needs this for a streamed body.
    ...(body instanceof ReadableStream ? { duplex: 'half' } : {}),
  } as RequestInit);

/** A body sent in pieces, with no Content-Length, the way a chunked upload arrives. */
const streamed = (size: number) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (let sent = 0; sent < size; sent += 1000) c.enqueue(new Uint8Array(Math.min(1000, size - sent)).fill(32));
      c.close();
    },
  });

test('a post from the site itself passes, one from another site does not', () => {
  assert.ok(fromThisSite(new Headers({ host: 'jontai.example', origin: 'https://jontai.example', 'sec-fetch-site': 'same-origin' })));
  assert.ok(!fromThisSite(new Headers({ host: 'jontai.example', origin: 'https://evil.example' })));
  assert.ok(!fromThisSite(new Headers({ host: 'jontai.example', 'sec-fetch-site': 'cross-site' })));
  assert.ok(!fromThisSite(new Headers({ host: 'jontai.example', 'sec-fetch-site': 'same-site' })));
  assert.ok(!fromThisSite(new Headers({ host: 'jontai.example', origin: 'null' })));
});

test('a client that sends no Origin (not a browser) is left to the other checks', () => {
  assert.ok(fromThisSite(new Headers({ host: 'jontai.example' })));
});

test('Vercel\'s forwarded host counts as the site', () => {
  assert.ok(fromThisSite(new Headers({ host: 'internal', 'x-forwarded-host': 'jontai.example', origin: 'https://jontai.example' })));
});

test('only JSON is read', () => {
  assert.ok(isJson(new Headers({ 'content-type': 'application/json' })));
  assert.ok(isJson(new Headers({ 'content-type': 'Application/JSON; charset=utf-8' })));
  assert.ok(!isJson(new Headers({ 'content-type': 'text/plain' })));
  assert.ok(!isJson(new Headers({ 'content-type': 'application/x-www-form-urlencoded' })));
  assert.ok(!isJson(new Headers()));
});

test('a body is read as JSON; broken JSON reads as nothing', async () => {
  assert.deepEqual(await readJson(post('{"name":"Ana"}')), { ok: true, value: { name: 'Ana' } });
  assert.deepEqual(await readJson(post('{not json')), { ok: true, value: null });
});

test('a body over the limit is refused, whatever Content-Length says', async () => {
  assert.deepEqual(await readJson(post('x', { 'content-length': String(BODY_LIMIT + 1) })), { ok: false, status: 413 });
  assert.deepEqual(await readJson(post(streamed(BODY_LIMIT + 1))), { ok: false, status: 413 });
  assert.deepEqual(await readJson(post(streamed(BODY_LIMIT))), { ok: true, value: null });
});

test('each address gets a few posts per window, then waits', () => {
  let now = 0;
  const allow = rateLimiter({ max: 2, windowMs: 1000 }, () => now);
  assert.ok(allow('a'));
  assert.ok(allow('a'));
  assert.ok(!allow('a'));
  assert.ok(allow('b'), 'another address has its own count');
  now = 1001;
  assert.ok(allow('a'), 'the window has passed');
});

test('the limiter forgets old addresses instead of growing for ever', () => {
  let now = 0;
  const allow = rateLimiter({ max: 1, windowMs: 1000, size: 3 }, () => now);
  for (const k of ['a', 'b', 'c', 'd', 'e']) allow(k);
  now = 10;
  assert.ok(!allow('e'), 'the newest address is still counted');
});

test('the address comes from the headers Vercel sets', () => {
  assert.equal(clientAddress(new Headers({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' })), '1.2.3.4');
  assert.equal(clientAddress(new Headers({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' })), '5.6.7.8');
  assert.equal(clientAddress(new Headers()), 'unknown');
});

test('guardPost runs the checks in order and hands back the body', async () => {
  const always = () => true;
  assert.deepEqual(await guardPost(post('{"a":1}'), always), { ok: true, body: { a: 1 } });
  assert.equal((await guardPost(post('{}', { origin: 'https://evil.example' }), always)).ok, false);
  const plain = await guardPost(post('{}', { 'content-type': 'text/plain' }), always);
  assert.ok(!plain.ok && plain.status === 415);
  const busy = await guardPost(post('{}'), () => false);
  assert.ok(!busy.ok && busy.status === 429);
  const big = await guardPost(post(streamed(BODY_LIMIT + 1)), always);
  assert.ok(!big.ok && big.status === 413);
});
