/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — App shell, routing, Tweaks
   ───────────────────────────────────────────────────────────── */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "noir",
  "typeset": "modern",
  "hero": "split",
  "dark": false,
  "density": "regular"
}/*EDITMODE-END*/;

/* Luxury palettes — white base, gold constant, deep accent varies. */
const PALETTES = {
  noir:     { bg: "#FFFFFF", bg2: "#F6F4EF", fg: "#0A0807", gold: "#B89358" },
  emerald:  { bg: "#FFFFFF", bg2: "#F1F4F1", fg: "#0D1A14", gold: "#B89358" },
  bordeaux: { bg: "#FFFFFF", bg2: "#F6F1F0", fg: "#1A0D10", gold: "#C19A6B" },
  marine:   { bg: "#FFFFFF", bg2: "#EFF2F6", fg: "#0D1424", gold: "#B89358" },
  cognac:   { bg: "#FFFFFF", bg2: "#F5EFE8", fg: "#1A1208", gold: "#C7A66F" },
};
const PALETTE_ACCENT = {
  noir:     "#0A0807",
  emerald:  "#0E4A33",
  bordeaux: "#6B121F",
  marine:   "#15294F",
  cognac:   "#7A4A1F",
};
const PALETTE_ORDER = ["noir", "emerald", "bordeaux", "marine", "cognac"];
const swatchFor = (key) => {
  const p = PALETTES[key];
  return [p.gold, PALETTE_ACCENT[key], p.bg2];
};

function applyTheme(t) {
  const p = PALETTES[t.palette] || PALETTES.noir;
  const r = document.documentElement;
  r.setAttribute("data-theme", t.dark ? "dark" : "light");
  r.setAttribute("data-typeset", t.typeset === "editorial" ? "editorial" : "modern");
  r.setAttribute("data-density", t.density);
  r.style.setProperty("--ivory", p.bg);
  r.style.setProperty("--cream", p.bg2);
  r.style.setProperty("--noir", p.fg);
  r.style.setProperty("--gold", p.gold);
  r.style.setProperty("--accent", PALETTE_ACCENT[t.palette]);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState("home");
  // Two distinct things, previously conflated into one flag:
  //   isSubscribed — gave us an address; only decides whether we stop prompting
  //   isMember     — has a live paid subscription; gates the digital edition
  const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem("ladidier_subscribed") === "true");
  const [isMember, setIsMember] = useState(() => localStorage.getItem("ladidier_member") === "true");

  useEffect(() => { applyTheme(t); }, [t.palette, t.dark, t.typeset, t.density]);

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
    default:          page = <HomePage      setRoute={go} heroVariant={t.hero} />;
  }

  return (
    <>
      <Nav route={route} setRoute={go} />
      <main key={route + t.hero}>{page}</main>
      <Footer setRoute={go} />
      <TreasureHuntComplete setRoute={go} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero Variant (Home)" />
        <TweakRadio
          label="Layout"
          value={t.hero}
          options={[
            { value: "manifest", label: "Manifesto" },
            { value: "split",    label: "Split"     },
            { value: "index",    label: "Index"     },
          ]}
          onChange={(v) => { setTweak('hero', v); go('home'); }}
        />

        <TweakSection label="Palette (Maison Couleurs)" />
        <TweakColor
          label="House colour"
          value={swatchFor(t.palette)}
          options={PALETTE_ORDER.map(swatchFor)}
          onChange={(arr) => {
            const k = PALETTE_ORDER.find(k => JSON.stringify(swatchFor(k)) === JSON.stringify(arr));
            if (k) setTweak('palette', k);
          }}
        />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />

        <TweakSection label="Typography" />
        <TweakRadio
          label="Display type"
          value={t.typeset}
          options={[
            { value: "modern",    label: "Modern Sans" },
            { value: "editorial", label: "Editorial Serif" },
          ]}
          onChange={(v) => setTweak('typeset', v)}
        />

        <TweakSection label="Density" />
        <TweakRadio
          label="Spacing"
          value={t.density}
          options={[
            { value: "dense",   label: "Dense"   },
            { value: "regular", label: "Regular" },
            { value: "comfy",   label: "Comfy"   },
          ]}
          onChange={(v) => setTweak('density', v)}
        />

        <TweakSection label="Routes" />
        <div className="twk-row">
          <div className="twk-lbl"><span>Jump to</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              ["home", "Home"], ["magazine", "Magazine"], ["article", "Article"],
              ["stores", "Stores"], ["subscribe", "Subscribe"], ["about", "Universe"],
            ].map(([k, l]) => (
              <button key={k} onClick={() => go(k)}
                style={{
                  fontFamily: "ui-sans-serif, system-ui", fontSize: 11,
                  padding: "8px 10px", borderRadius: 6,
                  border: route === k ? "1px solid rgba(41,38,27,.7)" : "1px solid rgba(41,38,27,.18)",
                  background: route === k ? "rgba(41,38,27,.85)" : "transparent",
                  color: route === k ? "#FAF7F1" : "inherit",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
