import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { FitText } from '@/components/ui/FitText';
import { FooterFocus } from '@/components/ui/FooterFocus';
import { CATEGORIES } from '@/lib/products';
import { QUOTE_ACTION } from '@/lib/quote';
import { CONCEPT, OFFICIAL_URL, STORE } from '@/lib/store';

/**
 * The page's last word, in the page's own voice (Bob, round 12: the old footer's narrow bold capitals did not belong):
 * the owner's line in thin wide capitals, then the ranges, the store and the socials in three quiet columns, then
 * JONTAI ENERGY across the width, rising with the last stretch of scroll. `base` is '/' on pages other than home, so
 * the section links lead back to it.
 */
export function Footer({ base = '' }: { base?: string }) {
  return (
    <footer className="footer" data-concept={CONCEPT || undefined}>
      <div className="footer__top">
        <p className="footer__say">
          Aruba sunlight,
          <br />
          made useful.
        </p>
        <nav className="footer__nav" aria-label="Footer">
          <div>
            <h2 className="footer__head">Ranges</h2>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <OpenCategoryButton id={c.id}>{c.name}</OpenCategoryButton>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="footer__head">Store</h2>
            <ul>
              <li>
                <a href="/quote">{QUOTE_ACTION}</a>
              </li>
              <li>
                <a href={`${base}#rewards`}>Rewards</a>
              </li>
              <li>
                <a href={`${base}#delivery`}>Large-item delivery</a>
              </li>
              <li>
                <a href={`${base}#visit`}>Visit</a>
              </li>
              <li>
                <a href="/support#questions">Questions</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer__head">Follow</h2>
            <ul>
              <li>
                <a href={STORE.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <FitText text="JONTAI ENERGY" chars="end" className="footer__mark" />
      <FooterFocus />
      <div className="footer__fine">
        <p>
          © {new Date().getFullYear()} {STORE.name} · {STORE.street}, {STORE.city}, {STORE.country}
        </p>
        <p>Jontai Energy is a retail store and does not provide installation services.</p>
        {CONCEPT && (
          <p>
            A concept redesign, not the official Jontai Energy website. The store&rsquo;s own site is{' '}
            <a href={OFFICIAL_URL} rel="noopener noreferrer">
              jontaienergy.com
            </a>
            .
          </p>
        )}
      </div>
    </footer>
  );
}
