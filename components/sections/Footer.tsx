import { Words } from '@/components/ui/Split';
import { LangChoices } from '@/components/i18n/LangSwitch';
import { FOOTER_COPY, MENU_COPY } from '@/lib/homeCopy';
import { QUOTE_ACTION } from '@/lib/quote';
import { CONCEPT, OFFICIAL_URL, STORE } from '@/lib/store';

const tel = `tel:${STORE.phone.replace(/\s+/g, '')}`;

/**
 * The page's last word, simple (round 54, Bob: "the footer should be more simple like squared-media.nl"): on the light
 * ground, one question with two ways to answer it (a message, a call), then four short columns of plain links (pages,
 * help, follow, contact) and one thin line with the copyright, what the store does, the concept note and the
 * languages. The big JONTAI ENERGY and the lift are gone. `base` is '/' on pages other than home, so the section links
 * lead back to it.
 */
export function Footer({ base = '' }: { base?: string }) {
  const [pages, help] = [FOOTER_COPY.pages, FOOTER_COPY.help];
  return (
    <footer className="ft" data-concept={CONCEPT || undefined}>
      <div className="ft__ask">
        <h2 className="ft__title" data-words>
          <span>
            <Words text={FOOTER_COPY.ask[0]} />
          </span>{' '}
          <b>
            <Words text={FOOTER_COPY.ask[1]} />
          </b>
        </h2>
        <p className="ft__line">{FOOTER_COPY.line}</p>
        <div className="ft__acts">
          <a href="/contact" className="btn ft__btn">
            {FOOTER_COPY.message}
          </a>
          <a href={tel} className="btn ft__btn ft__btn--line">
            {STORE.phone}
          </a>
        </div>
      </div>

      <nav className="ft__cols" aria-label="Footer">
        <div>
          <h2 className="ft__head">{FOOTER_COPY.heads[0]}</h2>
          <a href={`${base}#products`}>{pages[0]}</a>
          <a href="/products">{MENU_COPY.products}</a>
          <a href={`${base}#rewards`}>{pages[2]}</a>
          <a href="/quote">{QUOTE_ACTION}</a>
          <a href={`${base}#visit`}>{pages[4]}</a>
        </div>
        <div>
          <h2 className="ft__head">{FOOTER_COPY.heads[1]}</h2>
          <a href="/support">{help[0]}</a>
          <a href="/support#questions">{help[1]}</a>
          <a href={`${base}#delivery`}>{help[2]}</a>
        </div>
        <div>
          <h2 className="ft__head">{FOOTER_COPY.heads[2]}</h2>
          <a href={STORE.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
        <div>
          <h2 className="ft__head">{FOOTER_COPY.heads[3]}</h2>
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
          <a href={tel}>{STORE.phone}</a>
          <a href={STORE.maps} target="_blank" rel="noopener noreferrer">
            {STORE.street}, {STORE.city}, {STORE.country}
          </a>
        </div>
      </nav>

      <div className="ft__base">
        <p>
          © {new Date().getFullYear()} {STORE.name} · <span>{FOOTER_COPY.service}</span>
        </p>
        {CONCEPT && (
          <p>
            A concept redesign, not the official Jontai Energy website. The store&rsquo;s own site is{' '}
            <a href={OFFICIAL_URL} rel="noopener noreferrer">
              jontaienergy.com
            </a>
            .
          </p>
        )}
        <LangChoices />
      </div>
    </footer>
  );
}
