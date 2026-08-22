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
  const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem("ladidier_subscribed") === "true");

  useEffect(() => { applyTheme(t); }, [t.palette, t.dark, t.typeset, t.density]);

  // simple hash routing
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, "") || "home";
      setRoute(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
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
    case "magazine":  page = <MagazinePage  setRoute={go} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} />; break;
    case "article":   page = <ArticlePage   setRoute={go} />; break;
    case "stores":    page = <StoresPage    setRoute={go} />; break;
    case "subscribe": page = <SubscribePage setRoute={go} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} />; break;
    case "about":     page = <AboutPage     setRoute={go} />; break;
    default:          page = <HomePage      setRoute={go} heroVariant={t.hero} isSubscribed={isSubscribed} />;
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
