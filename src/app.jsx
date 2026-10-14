/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — App shell and routing
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Nav, Footer } from './components.jsx';
import {
  HomePage,
  MagazinePage,
  ArticlePage,
  StoresPage,
  SubscribePage,
  AccountPage,
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
  // Which plan a member actually holds ({product, interval, cancelAtPeriodEnd})
  // — only resolvable for the account-linked path, so this is null both for a
  // signed-out visitor and for a legacy-cookie-only member. The Subscribe page
  // falls back to a generic "active membership" display when it is null.
  const [activePlan, setActivePlan] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // THEME is a frozen constant now that the Tweaks panel is gone, so this runs
  // once rather than tracking individual palette/typeset changes.
  useEffect(() => { applyTheme(THEME); }, []);

  // Identify the signed-in visitor from the httpOnly session cookie. We do not
  // mirror this identity into localStorage or sessionStorage — the httpOnly cookie
  // is the single source of truth, and a local copy would risk becoming stale.
  // authReady is set to true on both success and failure because it signals that
  // we have finished asking, allowing UI components to distinguish between
  // "not signed in" and "still waiting for server response".
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setUser(d.user || null);
        setAuthReady(true);
      })
      .catch((err) => {
        console.error("Could not verify auth session:", err);
        if (!cancelled) {
          setUser(null);
          setAuthReady(true);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Single membership resolver. Two independent answers can grant access —
  // the legacy browser-cookie-bound Checkout Session, and the account-linked
  // Stripe customer — so both are asked together and isMember is the OR of
  // whichever is true. Two separate effects previously wrote isMember from
  // two independent async sources, so whichever settled last silently won,
  // and a real member could be locked out by the slower request finishing
  // with a stale "false". One effect, one resolution, avoids that.
  useEffect(() => {
    const CHECKED_AT = "ladidier_member_checked";
    const RECHECK_AFTER = 6 * 60 * 60 * 1000;
    const checkedAt = Number(localStorage.getItem(CHECKED_AT) || 0);

    // Members are re-checked on a schedule; everyone else is checked every load,
    // which costs nothing (with no cookie the endpoint answers without calling
    // Stripe) and lets a member who cleared local storage recover access.
    // isMember is read directly here (not via the dependency array below) —
    // this is the recheck-skip guard, not a reason to re-run the effect.
    if (isMember && Date.now() - checkedAt < RECHECK_AFTER) return;

    // Wait until we know whether there is a signed-in user before asking either
    // question, so the account request (if any) is only sent once, not fired
    // speculatively before authReady and then again once user resolves.
    if (!authReady) return;

    let cancelled = false;

    const askLegacy = fetch("/api/entitlement", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => (typeof d.active === "boolean" ? d.active : null))
      .catch((err) => {
        console.error("Could not verify membership:", err);
        return null;
      });

    // With no signed-in user the account path has a definitive answer — false —
    // without a request; it does not need to be asked to know nobody is linked.
    const askAccount = user
      ? fetch("/api/account/status", { credentials: "same-origin" })
          .then((r) => r.json())
          .then((d) => ({
            active: typeof d.active === "boolean" ? d.active : null,
            plan: d.plan ?? null,
          }))
          .catch((err) => {
            console.error("Could not verify account membership status:", err);
            return { active: null, plan: null };
          })
      : Promise.resolve({ active: false, plan: null });

    Promise.all([askLegacy, askAccount]).then(([legacy, accountResult]) => {
      if (cancelled) return;
      const { active: account, plan } = accountResult;

      if (legacy === true || account === true) {
        setIsMember(true);
        // The account path is the only one that resolves a specific plan — a
        // legacy-only grant leaves this null, which the Subscribe page reads
        // as "member, but plan unknown" rather than a specific product/interval.
        setActivePlan(account === true ? plan : null);
        localStorage.setItem("ladidier_member", "true");
        localStorage.setItem(CHECKED_AT, String(Date.now()));
      } else if (legacy !== null && account !== null) {
        // Both sources answered definitively and neither granted access.
        setIsMember(false);
        setActivePlan(null);
        localStorage.removeItem("ladidier_member");
        localStorage.setItem(CHECKED_AT, String(Date.now()));
      }
      // Otherwise at least one source is unknown (network/parse failure) —
      // leave state and storage untouched rather than risk locking out a
      // paying member because one request failed.
    });

    return () => { cancelled = true; };
  }, [authReady, user]);


  const [readerOpen, setReaderOpen] = useState(false);

  // simple hash routing + direct reader entry point
  useEffect(() => {
    const fromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      const [baseRoute, query] = rawHash.split('?');
      const searchParams = new URLSearchParams(query || window.location.search);
      const isDirectRead =
        baseRoute === "read" ||
        baseRoute === "reader" ||
        baseRoute === "magazine-reader" ||
        searchParams.get("read") === "true" ||
        searchParams.get("read") === "1" ||
        searchParams.get("reader") === "true" ||
        searchParams.get("reader") === "1" ||
        window.location.pathname === "/read" ||
        window.location.pathname === "/reader";

      if (isDirectRead) {
        setRoute("magazine");
        setReaderOpen(true);
      } else {
        const h = baseRoute || "home";
        setRoute(h);
        if (h !== "magazine") {
          setReaderOpen(false);
        }
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const handleCloseReader = () => {
    setReaderOpen(false);
    const rawHash = window.location.hash.replace(/^#/, "").split('?')[0];
    if (rawHash === "read" || rawHash === "reader" || rawHash === "magazine-reader") {
      history.replaceState(null, "", "#magazine");
    }
  };

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

          // The CHECKED_AT write above makes the membership resolver effect skip
          // its own re-check for a while, so it won't fill in activePlan on its
          // own — ask directly, once, right after the checkout that just linked it.
          fetch("/api/account/status", { credentials: "same-origin" })
            .then((r) => r.json())
            .then((d) => { if (!cancelled) setActivePlan(d.plan ?? null); })
            .catch((err) => console.error("Could not fetch plan after checkout:", err));
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
    if (r === "read" || r === "reader" || r === "magazine-reader") {
      setRoute("magazine");
      setReaderOpen(true);
      history.replaceState(null, "", `#${r}`);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    setRoute(r);
    if (r !== "magazine") {
      setReaderOpen(false);
    }
    history.replaceState(null, "", `#${r}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Expose for programmatic capture (PPTX, video).
  useEffect(() => { window.__goRoute = go; }, []);

  let page;
  switch (route) {
    case "magazine":  page = <MagazinePage  setRoute={go} isMember={isMember} readerOpen={readerOpen} onCloseReader={handleCloseReader} />; break;
    case "article":   page = <ArticlePage   setRoute={go} />; break;
    case "stores":    page = <StoresPage    setRoute={go} />; break;
    case "subscribe": page = <SubscribePage setRoute={go} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} user={user} setUser={setUser} authReady={authReady} isMember={isMember} activePlan={activePlan} />; break;
    case "account":   page = <AccountPage   setRoute={go} user={user} isMember={isMember} activePlan={activePlan} />; break;
    case "about":     page = <AboutPage     setRoute={go} />; break;
    default:          page = <HomePage      setRoute={go} heroVariant={THEME.hero} />;
  }

  return (
    <>
      <Nav route={route} setRoute={go} user={user} authReady={authReady} />
      {/* The key remount is what drives the .page-fade entry animation. */}
      <main key={route}>{page}</main>
      <Footer setRoute={go} />
      <TreasureHuntComplete setRoute={go} />
      <Analytics />
    </>
  );
}
