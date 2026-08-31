/* Print build — renders all routes stacked, then auto-prints.
   The mount and the auto-print listener live in print-main.jsx. */

import { useEffect } from 'react';
import { Nav, Footer } from './components.jsx';
import {
  HomePage,
  MagazinePage,
  ArticlePage,
  StoresPage,
  SubscribePage,
  AboutPage,
} from './pages.jsx';
import { applyTheme, THEME } from './theme.js';

function noop() {}

export default function PrintApp() {
  // THEME is already light / modern / regular, which is exactly what the old
  // applyPrintTheme forced, so the shared applier covers both entries.
  useEffect(() => { applyTheme(THEME); }, []);

  return (
    <>
      <section className="print-page">
        <Nav route="home" setRoute={noop} />
        <HomePage setRoute={noop} heroVariant={THEME.hero} />
      </section>

      <section className="print-page page-break">
        {/* isMember must be passed: left undefined, MagazinePage's paywall timer
            arms and the overlay can land in the middle of a printed page. */}
        <MagazinePage setRoute={noop} isMember={true} />
      </section>

      <section className="print-page page-break">
        <ArticlePage setRoute={noop} />
      </section>

      <section className="print-page page-break">
        <StoresPage setRoute={noop} />
      </section>

      <section className="print-page page-break">
        {/* setIsSubscribed is required — without it the free-plan button throws. */}
        <SubscribePage setRoute={noop} isSubscribed={false} setIsSubscribed={noop} />
      </section>

      <section className="print-page page-break">
        <AboutPage setRoute={noop} />
      </section>

      <Footer setRoute={noop} />
    </>
  );
}
