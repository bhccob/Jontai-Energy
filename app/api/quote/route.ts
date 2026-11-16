import { NextResponse } from 'next/server';
import { checkQuote, quoteEmail } from '@/lib/quote';
import { RATE, guardPost, rateLimiter } from '@/lib/guard';
import { CONCEPT, STORE } from '@/lib/store';

/** Posts per address (lib/guard): a few per ten minutes is plenty for a person and slows a script down. */
const allow = rateLimiter(RATE);

/**
 * Sends a quote request to the store's inbox through Resend (resend.com), with Reply-To set to the visitor.
 * Needs RESEND_API_KEY and QUOTE_FROM (an address on a domain verified in Resend); QUOTE_TO defaults to the store's
 * email. Without them the route answers 503 and the page offers to send the same message from the visitor's email app.
 */
export async function POST(request: Request) {
  // A concept build never sends anything to the store, whatever keys it is given.
  if (CONCEPT) return NextResponse.json({ ok: false, reason: 'concept' }, { status: 403 });
  // Same site, JSON, not too often, not too big (lib/guard). The page answers any refusal with the email-app fallback.
  const guarded = await guardPost(request, allow);
  if (!guarded.ok) {
    const headers = guarded.status === 429 ? { 'Retry-After': String(RATE.windowMs / 1000) } : undefined;
    return NextResponse.json({ ok: false }, { status: guarded.status, headers });
  }
  const body = guarded.body;

  // The hidden "website" field is only ever filled in by bots: answer as if sent, send nothing.
  if (body && typeof body === 'object' && (body as { website?: unknown }).website) return NextResponse.json({ ok: true });

  const checked = checkQuote(body);
  if (!checked.ok) return NextResponse.json({ ok: false, errors: checked.errors }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM;
  if (!key || !from) return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const { subject, text } = quoteEmail(checked.value);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      // Reply-To only when the visitor gave an email (one who asked for WhatsApp may not have).
      body: JSON.stringify({ from, to: [process.env.QUOTE_TO || STORE.email], ...(checked.value.email ? { reply_to: checked.value.email } : {}), subject, text }),
    });
    if (!res.ok) {
      console.error('[quote] Resend answered', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 502 });
    }
  } catch (error) {
    console.error('[quote] could not reach Resend', error);
    return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
