// The site's languages (Bob, round 33: "i want the website to have spanish&chinese translator"). English is what the
// pages are written in; Spanish and Simplified Chinese are written by hand in lib/i18n/es.json and zh.json, keyed by
// the English text, and swapped in on the page (components/i18n/Translator).

export type Lang = 'en' | 'es' | 'zh';

export interface LangInfo {
  id: Lang;
  /** The language named in itself, as the switcher lists it. */
  name: string;
  /** What the header's button shows. */
  short: string;
  /** The html lang attribute. */
  html: string;
  /** "Language", said in this language (the switcher's label never goes through the dictionaries). */
  label: string;
}

export const LANGS: readonly LangInfo[] = [
  { id: 'en', name: 'English', short: 'EN', html: 'en', label: 'Language' },
  { id: 'es', name: 'Español', short: 'ES', html: 'es', label: 'Idioma' },
  { id: 'zh', name: '中文', short: '中文', html: 'zh-Hans', label: '语言' },
];

/** Where the visitor's choice is kept between visits (localStorage). The head script in app/layout reads it too. */
export const LANG_KEY = 'jontai-lang';

export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'es' || v === 'zh';
}

export function langInfo(id: Lang): LangInfo {
  return LANGS.find((l) => l.id === id) ?? LANGS[0];
}
