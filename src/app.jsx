/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — App shell and routing
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { Nav, Footer } from './components.jsx';
import {
  HomePage,
  MagazinePage,
  ArticlePage,
  StoresPage,
  SubscribePage,
  AboutPage,
} from './pages.jsx';
import { TreasureHuntComplete } from './treasure.jsx';
import { applyTheme, THEME } from './theme.js';

export default function App() {
  const [route, setRoute] = useState("home");
  // Two distinct things, previously conflated into one flag:
  //   isSubscribed — gave us an address; only decides whether we stop prompting
  //   isMember     — has a live paid subscription; gates the digital edition
  const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem("ladidier_subscribed") === "true");
  const [isMember, setIsMember] = useState(() => localStorage.getItem("ladidier_member") === "true");

  // THEME is a frozen constant now that the Tweaks panel is gone, so this runs
  // once rather than tracking individual palette/typeset changes.
  useEffect(() => { applyTheme(THEME); }, []);

  // Whether a membership is still paid for is Stripe's answer, not the browser's.
  // Re-ask periodically so a cancellation or a failed renewal actually closes the
  // edition again — localStorage on its own would grant access forever.
  useEffect(() => {
    const CHECKED_AT = "ladidier_member_checked";
    const RECHECK_AFTER = 6 * 60 * 60 * 1000;
    const checkedAt = Number(localStorage.getItem(CHECKED_AT) || 0);

    // Members are re-checked on a schedule; everyone else is checked every load,
    // which costs nothing (with no cookie the endpoint answers without calling
    // Stripe) and lets a member who cleared local storage recover access.
    if (isMember && Date.now() - checkedAt < RECHECK_AFTER) return;

    let cancelled = false;
    fetch("/api/entitlement", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        localStorage.setItem(CHECKED_AT, String(Date.now()));
        if (d.active) {
          setIsMember(true);
          localStorage.setItem("ladidier_member", "true");
        } else {
          setIsMember(false);
          localStorage.removeItem("ladidier_member");
        }
      })
      // On a network failure leave the current state alone rather than locking
      // out a paying member because their connection dropped.
      .catch((err) => console.error("Could not verify membership:", err));

    return () => { cancelled = true; };
  }, []);

  // simple hash routing
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, "").split('?')[0] || "home";
      setRoute(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Returning from Stripe Checkout. The session id in the URL is not proof of
  // payment on its own, so confirm it server-side before unlocking anything.
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;

    let cancelled = false;
    const backToSubscribe = () =>
      history.replaceState(null, "", `${window.location.pathname}#subscribe`);

    (async () => {
      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.paid) {
          // verify-session also set the httpOnly cookie, so later visits can be
          // re-checked against Stripe without another trip through Checkout.
          setIsMember(true);
          localStorage.setItem("ladidier_member", "true");
          localStorage.setItem("ladidier_member_checked", String(Date.now()));
          // A paying member shouldn't keep seeing subscribe prompts either.
          setIsSubscribed(true);
          localStorage.setItem("ladidier_subscribed", "true");
          setRoute("magazine");
          // Drop session_id from the address bar so it is not shared or reused.
          history.replaceState(null, "", `${window.location.pathname}#magazine`);
        } else {
          backToSubscribe();
        }
      } catch (err) {
        console.error("Could not verify checkout session:", err);
        if (!cancelled) backToSubscribe();
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const go = (r) => {
    setRoute(r);
    history.replaceState(null, "", `#${r}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Expose for programmatic capture (PPTX, video).
  useEffect(() => { window.__goRoute = go; }, []);

  let page;
  switch (route) {
    case "magazine":  page = <MagazinePage  setRoute={go} isMember={isMember} />; break;
    case "article":   page = <ArticlePage   setRoute={go} />; break;
    case "stores":    page = <StoresPage    setRoute={go} />; break;
    case "subscribe": page = <SubscribePage setRoute={go} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} />; break;
    case "about":     page = <AboutPage     setRoute={go} />; break;
    default:          page = <HomePage      setRoute={go} heroVariant={THEME.hero} />;
  }

  return (
    <>
      <Nav route={route} setRoute={go} />
      {/* The key remount is what drives the .page-fade entry animation. */}
      <main key={route}>{page}</main>
      <Footer setRoute={go} />
      <TreasureHuntComplete setRoute={go} />
    </>
  );
}
