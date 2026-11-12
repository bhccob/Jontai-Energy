import { NextResponse } from 'next/server';
import { checkQuote, quoteEmail } from '@/lib/quote';
import { CONCEPT, STORE } from '@/lib/store';

/**
 * Sends a quote request to the store's inbox through Resend (resend.com), with Reply-To set to the visitor.
 * Needs RESEND_API_KEY and QUOTE_FROM (an address on a domain verified in Resend); QUOTE_TO defaults to the store's
 * email. Without them the route answers 503 and the page offers to send the same message from the visitor's email app.
 */
export async function POST(request: Request) {
  // A concept build never sends anything to the store, whatever keys it is given.
  if (CONCEPT) return NextResponse.json({ ok: false, reason: 'concept' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 20_000) return NextResponse.json({ ok: false }, { status: 413 });
  const body: unknown = await request.json().catch(() => null);

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
