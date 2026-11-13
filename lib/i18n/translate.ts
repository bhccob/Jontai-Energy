// Turning the page's English into Spanish or Chinese, one piece of text at a time. Pure, so it is tested on its own
// (translate.test.ts); the page side lives in components/i18n/Translator.
//
// A dictionary holds every English string the site shows, exactly as it reads on the page, and patterns for the text
// built at run time ("Open now, until {0}"). What fills a pattern's hole is translated too when it can be: a time
// ("7:00 PM") in the language's own form, or a string the dictionary knows. Anything the dictionary does not know (a
// name, a figure, a model number) stays as it is.

import type { Lang } from './langs.ts';

export interface Dict {
  strings: Record<string, string>;
  patterns: Record<string, string>;
}

export interface Translator {
  lang: Lang;
  /**
   * The translation of `text` with its own leading and trailing spaces kept, or null when there is none. `ctx` picks
   * a translation for one place when the same English needs different words there ("site|Visit").
   */
  text(text: string, ctx?: string): string | null;
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const TIME = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/;
/** A Chinese character or full-width punctuation mark. */
const CJK = /[　-〿㐀-鿿＀-￯]/;

/** "7:00 PM" in the language's own form: "7:00 p. m.", "晚上 7:00". Null when `v` is not such a time. */
export function localTime(lang: Lang, v: string): string | null {
  const m = TIME.exec(v.trim());
  if (!m || lang === 'en') return null;
  const [, h, mm, half] = m;
  if (lang === 'es') return `${h}:${mm} ${half === 'AM' ? 'a. m.' : 'p. m.'}`;
  const hour = Number(h) % 12 + (half === 'PM' ? 12 : 0);
  const part = hour < 12 ? '上午' : hour < 13 ? '中午' : hour < 18 ? '下午' : '晚上';
  return `${part} ${h}:${mm}`;
}

export function makeTranslator(lang: Lang, dict: Dict): Translator {
  const strings = new Map(Object.entries(dict.strings));
  const patterns = Object.entries(dict.patterns).map(([en, out]) => {
    const order: number[] = [];
    const source = en
      .split(/(\{\d\})/)
      .map((part) => {
        const hole = /^\{(\d)\}$/.exec(part);
        if (!hole) return escape(part);
        order.push(Number(hole[1]));
        return '(.+?)';
      })
      .join('');
    return { re: new RegExp(`^${source}$`), order, out };
  });
  /** A whole string: the dictionary, a time, or a pattern whose holes are translated the same way ("5,000 points"). */
  const whole = (key: string, depth: number): string | undefined => {
    const known = strings.get(key) ?? localTime(lang, key);
    if (known != null) return known;
    if (depth > 2) return undefined;
    for (const p of patterns) {
      const m = p.re.exec(key);
      if (!m) continue;
      const values: string[] = [];
      p.order.forEach((n, i) => (values[n] = whole(m[i + 1], depth + 1) ?? m[i + 1]));
      return p.out.replace(/\{(\d)\}/g, (_, n: string) => values[Number(n)] ?? '');
    }
    return undefined;
  };

  return {
    lang,
    text(text, ctx) {
      const key = norm(text);
      if (!key) return null;
      const out = (ctx ? strings.get(`${ctx}|${key}`) : undefined) ?? whole(key, 0);
      if (out === undefined) return null;
      let lead = /^\s*/.exec(text)?.[0] ?? '';
      let trail = /\s*$/.exec(text)?.[0] ?? '';
      // Chinese sets no space against its own characters: an English space beside one goes (a hidden brand name
      // would otherwise leave a gap: "并非 官方网站").
      if (lang === 'zh') {
        if (CJK.test(out.slice(0, 1))) lead = '';
        if (CJK.test(out.slice(-1))) trail = '';
      }
      return lead + out + trail;
    },
  };
}

/**
 * A translated heading shared out over the English heading's word slots (components/ui/Split Words), so each slot
 * still rises in turn. Spanish goes word by word, the last slot taking whatever is left over; Chinese, written
 * without spaces, is cut into even runs of characters, never starting a run with punctuation.
 */
export function spread(lang: Lang, text: string, slots: number): string[] {
  const n = Math.max(1, slots);
  const out: string[] = new Array(n).fill('');
  if (lang === 'zh') {
    const chars = [...text.replace(/\s+/g, ' ').trim()];
    // Punctuation stays with the character before it.
    const units: string[] = [];
    for (const ch of chars) {
      if (units.length && /[，。、：；！？）」』”’,.:;!?)\s]/.test(ch)) units[units.length - 1] += ch;
      else units.push(ch);
    }
    const per = Math.ceil(units.length / n);
    for (let i = 0; i < n; i++) out[i] = units.slice(i * per, (i + 1) * per).join('');
    return out;
  }
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((w, i) => {
    const slot = Math.min(i, n - 1);
    out[slot] = out[slot] ? `${out[slot]} ${w}` : w;
  });
  return out;
}
