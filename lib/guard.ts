// What every form post (app/api/contact, app/api/quote) must pass before its fields are read: sent from this site, as
// JSON, small, and not too often from one address. Plain Request and Headers, so it runs the same under node --test.

/** Bytes a form post may carry. The longest form (a 3,000 character message) is well under it. */
export const BODY_LIMIT = 20_000;

/** Posts one address may make to one form in a window. */
export const RATE = { max: 5, windowMs: 10 * 60_000 } as const;

/**
 * Whether a post comes from a page on this site. Browsers say where a request comes from (Sec-Fetch-Site, Origin) and
 * pages cannot change it, so another site cannot use these forms to send the store email in a visitor's name. A client
 * that sends neither is not a browser; it could claim anything, so the size and rate checks are what hold it back.
 */
export function fromThisSite(headers: Headers): boolean {
  const site = headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return false;
  const origin = headers.get('origin');
  if (!origin) return true;
  let from: string;
  try {
    from = new URL(origin).host;
  } catch {
    return false;
  }
  return Boolean(from) && (from === headers.get('host') || from === headers.get('x-forwarded-host'));
}

/** JSON only. A page on another site cannot send JSON here without asking first (a CORS preflight), which is never granted. */
export function isJson(headers: Headers): boolean {
  return (headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase() === 'application/json';
}

/**
 * Reads a body as JSON, stopping at `limit` bytes whatever Content-Length says: a chunked body sends none. Broken JSON
 * reads as null, which the form's own check then refuses.
 */
export async function readJson(request: Request, limit = BODY_LIMIT): Promise<{ ok: true; value: unknown } | { ok: false; status: 413 }> {
  if (Number(request.headers.get('content-length') ?? 0) > limit) return { ok: false, status: 413 };
  if (!request.body) return { ok: true, value: null };
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return { ok: false, status: 413 };
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: true, value: null };
  }
}

/**
 * A small per-address limit kept in the server's memory. Each server instance counts on its own, so it slows a single
 * sender down rather than stopping a crowd; a Vercel Firewall rate limit rule is the stronger layer (docs/security).
 * `size` caps how many addresses it remembers, so it never grows without end.
 */
export function rateLimiter({ max, windowMs, size = 5000 }: { max: number; windowMs: number; size?: number }, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return function allow(key: string): boolean {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
    hits.delete(key);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(t);
    hits.set(key, recent);
    // Oldest first (a Map keeps insertion order, and every visit re-inserts its key at the end).
    while (hits.size > size) hits.delete(hits.keys().next().value as string);
    return true;
  };
}

/** The visitor's address. Vercel sets x-real-ip and rewrites x-forwarded-for itself, so a client cannot pick its own. */
export function clientAddress(headers: Headers): string {
  return headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

export type Guarded = { ok: true; body: unknown } | { ok: false; status: 403 | 413 | 415 | 429 };

/** The checks in order, cheapest first: where it comes from, what it is, how often, then how big. */
export async function guardPost(request: Request, allow: (key: string) => boolean): Promise<Guarded> {
  if (!fromThisSite(request.headers)) return { ok: false, status: 403 };
  if (!isJson(request.headers)) return { ok: false, status: 415 };
  if (!allow(clientAddress(request.headers))) return { ok: false, status: 429 };
  const read = await readJson(request);
  return read.ok ? { ok: true, body: read.value } : read;
}
