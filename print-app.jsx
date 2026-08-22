/* Print build — renders all routes stacked, then auto-prints. */
const PRINT_DEFAULTS = {
  palette: "noir",
  typeset: "modern",
  hero: "split",
  dark: false,
  density: "regular",
};

const PRINT_PALETTES = {
  noir:     { bg: "#FFFFFF", bg2: "#F6F4EF", fg: "#0A0807", gold: "#B89358" },
  emerald:  { bg: "#FFFFFF", bg2: "#F1F4F1", fg: "#0D1A14", gold: "#B89358" },
  bordeaux: { bg: "#FFFFFF", bg2: "#F6F1F0", fg: "#1A0D10", gold: "#C19A6B" },
  marine:   { bg: "#FFFFFF", bg2: "#EFF2F6", fg: "#0D1424", gold: "#B89358" },
  cognac:   { bg: "#FFFFFF", bg2: "#F5EFE8", fg: "#1A1208", gold: "#C7A66F" },
};
const PRINT_ACCENT = {
  noir: "#0A0807", emerald: "#0E4A33", bordeaux: "#6B121F", marine: "#15294F", cognac: "#7A4A1F",
};

function applyPrintTheme(t) {
  const p = PRINT_PALETTES[t.palette];
  const r = document.documentElement;
  r.setAttribute("data-theme", "light");
  r.setAttribute("data-typeset", "modern");
  r.setAttribute("data-density", "regular");
  r.style.setProperty("--ivory", p.bg);
  r.style.setProperty("--cream", p.bg2);
  r.style.setProperty("--noir", p.fg);
  r.style.setProperty("--gold", p.gold);
  r.style.setProperty("--accent", PRINT_ACCENT[t.palette]);
}

function noop() {}

function PrintApp() {
  React.useEffect(() => { applyPrintTheme(PRINT_DEFAULTS); }, []);
  const setRoute = noop;
  return (
    <>
      <section className="print-page">
        <Nav route="home" setRoute={noop} />
        <HomePage setRoute={setRoute} heroVariant="split" />
      </section>

      <section className="print-page page-break">
        <MagazinePage setRoute={setRoute} />
      </section>

      <section className="print-page page-break">
        <ArticlePage setRoute={setRoute} />
      </section>

      <section className="print-page page-break">
        <StoresPage setRoute={setRoute} />
      </section>

      <section className="print-page page-break">
        <SubscribePage setRoute={setRoute} />
      </section>

      <section className="print-page page-break">
        <AboutPage setRoute={setRoute} />
      </section>

      <Footer setRoute={noop} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrintApp />);

/* Auto-print once fonts, images, and Babel transforms are settled. */
window.addEventListener("load", async () => {
  try { await document.fonts.ready; } catch (e) {}
  // Wait for at least the in-view images to load
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(img => img.complete ? null : new Promise(res => {
    img.addEventListener("load", res, { once: true });
    img.addEventListener("error", res, { once: true });
    setTimeout(res, 4000);
  })));
  // Settle for animations / layout
  setTimeout(() => { window.print(); }, 800);
});
