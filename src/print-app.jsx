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
        {/* user and authReady must be passed explicitly: Nav now expects both,
            and undefined only happens to satisfy the falsy checks by accident.
            A null user with authReady=false is exactly today's printed
            output — no sign-in affordance. */}
        <Nav route="home" setRoute={noop} user={null} authReady={false} />
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
        {/* user, setUser, and authReady must be passed explicitly, for the
            same reason as Nav above: false authReady suppresses the sign-in
            row, which is exactly today's rendered output. isSubscribed and
            setIsSubscribed are no longer read by SubscribePage but stay in
            its prop signature, so they're still passed here too. */}
        <SubscribePage setRoute={noop} isSubscribed={false} setIsSubscribed={noop} user={null} setUser={noop} authReady={false} />
      </section>

      <section className="print-page page-break">
        <AboutPage setRoute={noop} />
      </section>

      <Footer setRoute={noop} />
    </>
  );
}
