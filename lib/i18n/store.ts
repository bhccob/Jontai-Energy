// The chosen language, shared by the switcher (components/i18n/LangSwitch) and the page's translator
// (components/i18n/Translator). A dictionary loads only when its language is picked, so English visitors never
// download one.

import { LANG_KEY, isLang, langInfo, type Lang } from './langs';
import { makeTranslator, type Dict, type Translator } from './translate';

export interface I18nState {
  lang: Lang;
  /** Null for English, and while a dictionary is still loading. */
  t: Translator | null;
}

const loaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: Dict }>> = {
  es: () => import('./es.json') as Promise<{ default: Dict }>,
  zh: () => import('./zh.json') as Promise<{ default: Dict }>,
};

let state: I18nState = { lang: 'en', t: null };
const listeners = new Set<() => void>();
const cache = new Map<Lang, Translator>();
let asked: Lang = 'en';

function emit(next: I18nState) {
  state = next;
  listeners.forEach((l) => l());
}

export const i18n = {
  get: (): I18nState => state,
  /** English on the server and in the first render, so the page hydrates as it was written. */
  server: (): I18nState => ({ lang: 'en', t: null }),
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** The language saved from an earlier visit, if any. */
  saved(): Lang {
    try {
      const v = localStorage.getItem(LANG_KEY);
      return isLang(v) ? v : 'en';
    } catch {
      return 'en';
    }
  },
  async set(lang: Lang, remember = true) {
    asked = lang;
    if (remember) {
      try {
        if (lang === 'en') localStorage.removeItem(LANG_KEY);
        else localStorage.setItem(LANG_KEY, lang);
      } catch {
        // Private mode or blocked storage: the choice lasts for this page only.
      }
    }
    document.documentElement.lang = langInfo(lang).html;
    if (lang === 'en') return emit({ lang, t: null });
    let t = cache.get(lang);
    if (!t) {
      const dict = (await loaders[lang]()).default;
      t = makeTranslator(lang, dict);
      cache.set(lang, t);
    }
    // A later pick wins if the visitor changed their mind while this one loaded.
    if (asked === lang) emit({ lang, t });
  },
};
