/* Palettes and the theme applier, shared by the site and the print entry.
   print-app.jsx previously duplicated all of this verbatim, and its
   applyPrintTheme hardcoded exactly the values THEME already holds — so one
   applyTheme now serves both. */

/* Luxury palettes — white base, gold constant, deep accent varies. */
export const PALETTES = {
  noir:     { bg: "#FFFFFF", bg2: "#F6F4EF", fg: "#0A0807", gold: "#B89358" },
  emerald:  { bg: "#FFFFFF", bg2: "#F1F4F1", fg: "#0D1A14", gold: "#B89358" },
  bordeaux: { bg: "#FFFFFF", bg2: "#F6F1F0", fg: "#1A0D10", gold: "#C19A6B" },
  marine:   { bg: "#FFFFFF", bg2: "#EFF2F6", fg: "#0D1424", gold: "#B89358" },
  cognac:   { bg: "#FFFFFF", bg2: "#F5EFE8", fg: "#1A1208", gold: "#C7A66F" },
};

export const PALETTE_ACCENT = {
  noir:     "#0A0807",
  emerald:  "#0E4A33",
  bordeaux: "#6B121F",
  marine:   "#15294F",
  cognac:   "#7A4A1F",
};

// These were adjustable at runtime through the Tweaks panel, which only ever
// opened in response to a message from an external design host and rendered
// nothing for visitors. The panel is gone; these are the exact defaults it
// started from, so the site looks identical to before.
export const THEME = Object.freeze({
  palette: "noir",
  typeset: "modern",
  hero: "split",
  dark: false,
  density: "regular",
});

export function applyTheme(t) {
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
