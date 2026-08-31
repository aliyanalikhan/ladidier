/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Shared components
   ───────────────────────────────────────────────────────────── */
import React, { useState, useEffect, useRef } from 'react';
import { Laurel, DecoCorner } from './ornaments.jsx';
import { HiddenPerk } from './perks.jsx';
import { TreasureProgress } from './treasure.jsx';

/* ── Brand / catalog data ─────────────────────────────────── */
const U = "https://images.unsplash.com/";
const IMG = {
  // Magazine. Local paths are absolute so they keep resolving from any route,
  // and live in public/assets/ where the bundler copies them verbatim.
  cover:        "/assets/mag-cover.png",
  articleHero:  U + "photo-1469334031218-e382a71b716b?w=1800&q=85&auto=format",
  // Stories
  letter:       U + "photo-1559563458-527698bf5295?w=900&q=85&auto=format",
  atelier:      U + "photo-1541643600914-78b084683601?w=900&q=85&auto=format",
  signet:       U + "photo-1605100804763-247f67b3557e?w=900&q=85&auto=format",
  tea:          U + "photo-1556228720-195a672e8a03?w=900&q=85&auto=format",
  travel:       U + "photo-1488646953014-85cb44e25828?w=900&q=85&auto=format",
  skin:         U + "photo-1556228578-0a85b3bc8b62?w=900&q=85&auto=format",
  suit:         U + "photo-1507003211169-0a1dd7228f2d?w=900&q=85&auto=format",
  coffee:       U + "photo-1495474472287-4d71bcdd2085?w=900&q=85&auto=format",
  // Stores
  s_jewelry:    "/assets/ladidier-jewelry.jpeg",
  s_cosmetics:  "/assets/ladidier-cosmetics.jpeg",
  s_scent:      "/assets/the-scnt-shop.jpeg",
  s_adeva:      "/assets/adeva-store.jpeg",
  s_homme:      "/assets/ladidier-homme.jpeg",
  s_coffee:     "/assets/piata-noir-roast.jpeg",
  s_pets:       "/assets/posh-paw-pet-supplies.jpeg",
  s_maison:     "/assets/ladidier-maison.jpeg",
  s_travel:     "/assets/justrippin.jpeg",
  s_skincare:   "/assets/ladidier-beauty-essence.jpeg",
  s_wigs:       "/assets/merry-wigs.jpeg",
  s_transport:  "/assets/luxury-transportation-plus.jpeg",
  s_puriena:    "/assets/puriena.jpeg",
  s_elixoria:   "/assets/elixoria.png",
};

const STORES = [
  { id: "01", name: "Ladidiér Jewelry",           cat: "Jewelry",          tint: "blush", est: "MMXXI",   tagline: "Heirlooms in waiting.",                         img: IMG.s_jewelry,   url: "https://www.ladidierjewelry.com/" },
  { id: "02", name: "Ladidiér Cosmetics",         cat: "Cosmetics",        tint: "lilac", est: "MMXXII",  tagline: "Pigment, ceremony, restraint.",                 img: IMG.s_cosmetics, url: "https://ladidiercosmetics.com/" },
  { id: "03", name: "The Scnt Shop",              cat: "Perfumery",        tint: "cream", est: "MMXXII",  tagline: "Olfactive cabinet, hand-poured.",               img: IMG.s_scent,     url: "https://thescntshop.com/" },
  { id: "04", name: "Adeva Store",                cat: "Womenswear",       tint: "sky",   est: "MMXXII",  tagline: "A wardrobe authored slowly.",                   img: IMG.s_adeva,     url: "https://adevastore.com/" },
  { id: "05", name: "Ladidiér Homme",             cat: "Menswear",         tint: "sage",  est: "MMXXIII", tagline: "Tailoring for the modern flâneur.",             img: IMG.s_homme,     url: "https://ladidierhomme.com/" },
  { id: "06", name: "Piata Noir Roast",           cat: "Coffee",           tint: "noir",  est: "MMXXIII", tagline: "Single-origin daily ritual.",                   img: IMG.s_coffee,    url: "https://piatanoirroast.com/" },
  { id: "07", name: "Posh Paw Pet Supplies",      cat: "Pets",             tint: "blush", est: "MMXXIII", tagline: "Couture for the four-legged.",                  img: IMG.s_pets,      url: "https://poshpawpetsupplies.com/" },
  { id: "08", name: "Ladidiér Maison",            cat: "Home & Garden",    tint: "sage",  est: "MMXXIV",  tagline: "Objects to live with, not around.",             img: IMG.s_maison,    url: "https://ladidiermaison.com/" },
  { id: "09", name: "Justrippin",                 cat: "Travel",           tint: "sky",   est: "MMXXIV",  tagline: "Routes for the restless.",                      img: IMG.s_travel,    url: "https://justrippin.net" },
  { id: "10", name: "Ladidiér Beauté Essence",    cat: "Skincare",         tint: "lilac", est: "MMXXIV",  tagline: "Quiet science, soft results.",                  img: IMG.s_skincare,  url: "https://ladidierbeautyessence.store/" },
  { id: "11", name: "Merry Wigs",                 cat: "Hair Couture",     tint: "cream", est: "MMXXV",   tagline: "Crowns, on command.",                            img: IMG.s_wigs,      url: "https://www.merrywigs.com/" },
  { id: "12", name: "Luxury Transportation Plus", cat: "Luxury Transit",   tint: "noir",  est: "MMXXVI",  tagline: "Luxury medical & private transportation.",      img: IMG.s_transport, url: "http://www.swiftcarenemt.com" },
  { id: "13", name: "Puriena",                     cat: "General Goods",    tint: "cream", est: "MMXXVI",  tagline: "Everyday essentials, curated.",                 img: IMG.s_puriena,   url: "https://puriena.com/" },
  { id: "14", name: "Elixoria",                   cat: "General Goods",    tint: "sky",   est: "MMXXVI",  tagline: "Curated luxury & lifestyle goods.",             img: IMG.s_elixoria,  url: "https://www.elixoria.com/" },
];

const ISSUE = {
  vol: "I",
  no: "03",
  season: "Spring · Summer 2026",
  title: "On Luxe & Larger Living",
  cover: "blush",
  img: IMG.cover,
};

const STORIES = [
  { id: 1, kicker: "Editor's Letter",  title: "On the Quiet Audacity of Wanting More",                author: "Adeva D.",        read: "6 min", tint: "blush", img: IMG.letter },
  { id: 2, kicker: "Atelier",           title: "Inside the Petit Atelier Where Each Vial Is Numbered",  author: "Jules Mercier",   read: "9 min", tint: "lilac", img: IMG.atelier },
  { id: 3, kicker: "Object Study",      title: "The Signet Ring: A Brief History of Marking One's Hand", author: "S. Okafor",       read: "5 min", tint: "cream", img: IMG.signet },
  { id: 4, kicker: "House Guest",       title: "Tea, Three Ways, with the Maison Editor at Home",        author: "Lina Park",       read: "7 min", tint: "sage",  img: IMG.tea },
  { id: 5, kicker: "Travel Diary",      title: "Forty-Eight Hours in a City That Refuses to Hurry",      author: "Justrippin",     read: "8 min", tint: "sky",   img: IMG.travel },
  { id: 6, kicker: "Beauty",            title: "The Slow Skincare Manifesto: Less, but Better",          author: "Dr. M. Lévy",     read: "4 min", tint: "blush", img: IMG.skin },
  { id: 7, kicker: "Menswear",          title: "Why the Soft Suit Won and Refuses to Leave",             author: "K. Adebayo",      read: "6 min", tint: "sage",  img: IMG.suit },
  { id: 8, kicker: "Coffee",            title: "From Cherry to Cup: A Single Origin's Slow Year",        author: "Piata Noir",      read: "10 min", tint: "noir", img: IMG.coffee },
];

/* Photo placeholder helper — switches to .photo variant when img is provided. */
function Photo({ src, tag, label, tint = "cream", ratio = "4/5", className = "", style = {} }) {
  const classes = `ph ${src ? "photo" : tint} ${className}`.trim();
  const merged = src
    ? { aspectRatio: ratio, "--bg-image": `url(${src})`, ...style }
    : { aspectRatio: ratio, ...style };
  return <div className={classes} data-tag={tag} data-label={label} style={merged}></div>;
}

/* ── Crest (inline SVG) ───────────────────────────────────── */
function Crest({ size = 22, color = "currentColor" }) {
  return null;
}

/* ── Logo (image-based wordmark) ──────────────────────────── */
function Logo({ height = 30 }) {
  // Theme-aware logo swap done in CSS via filter, but we just pick file
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return (
    <img src={dark ? "/assets/logo-dark.jpg" : "/assets/logo-light.jpg"}
         alt="LaDidiér" style={{ height, mixBlendMode: dark ? "screen" : "multiply" }} />
  );
}

/* ── Nav ──────────────────────────────────────────────────── */
function Nav({ route, setRoute }) {
  const item = (slug, label) => (
    <a href={`#${slug}`}
       className={route === slug ? "active" : ""}
       onClick={(e) => { e.preventDefault(); setRoute(slug); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      {label}
    </a>
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const hamburgerRef = useRef(null);

  const openMenu = () => { setMenuOpen(true); setIsClosing(false); };
  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => { setMenuOpen(false); setIsClosing(false); }, 300);
  };

  useEffect(() => { if (menuOpen) closeMenu(); }, [route]);

  return (
    <>
      <nav className="nav">
        <div className="nav-left">
          {item("magazine", "Magazine")}
          {item("stores", "Stores")}
          {item("about", "Universe")}
        </div>
        <div className="nav-center" onClick={() => setRoute("home")} style={{ cursor: "pointer" }}>
          <Logo height={34} />
        </div>
        <div className="nav-right">
          <a href="#search" onClick={(e) => e.preventDefault()}>Search</a>
          {item("subscribe", "Subscribe")}
          <a href="#account" onClick={(e) => e.preventDefault()} className="mono" style={{ fontSize: 11, letterSpacing: ".1em" }}>EN · USD</a>
          <TreasureProgress />
          <button
            className="nav-hamburger"
            ref={hamburgerRef}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-overlay"
            onClick={openMenu}
          >
            <svg viewBox="0 0 20 14" width={20} height={14} fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="0" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="12" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <MobileNav
          route={route}
          setRoute={setRoute}
          onClose={closeMenu}
          isClosing={isClosing}
          hamburgerRef={hamburgerRef}
        />
      )}
    </>
  );
}

/* ── MobileNav ────────────────────────────────────────────── */
function MobileNav({ route, setRoute, onClose, isClosing, hamburgerRef }) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); };
  }, [onClose]);

  // Focus trap + initial focus + return focus on close
  useEffect(() => {
    closeButtonRef.current && closeButtonRef.current.focus();
    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = Array.from(
        overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      hamburgerRef && hamburgerRef.current && hamburgerRef.current.focus();
    };
  }, []);

  // Closing animation — CSS handles the visual; we just add the class
  // Parent Nav drives the 300ms timeout to unmount; no extra setTimeout here

  const linkClass = (slug) =>
    `mobile-overlay-link${route === slug ? " active" : ""}`;

  const handleLink = (slug) => (e) => {
    e.preventDefault();
    setRoute(slug);
    onClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      id="mobile-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      className={`mobile-overlay${isClosing ? " closing" : " open"}`}
    >
      <div className="mobile-overlay-header">
        <button
          ref={closeButtonRef}
          className="mobile-overlay-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
      </div>

      <nav aria-label="Navigation">
        <ul className="mobile-overlay-nav">
          <li><span className="mobile-overlay-label">Navigate</span></li>
          <li>
            <a
              href="#magazine"
              className={linkClass("magazine")}
              aria-current={route === "magazine" ? "page" : undefined}
              onClick={handleLink("magazine")}
            >Magazine</a>
          </li>
          <li>
            <a
              href="#stores"
              className={linkClass("stores")}
              aria-current={route === "stores" ? "page" : undefined}
              onClick={handleLink("stores")}
            >Stores</a>
          </li>
          <li>
            <a
              href="#about"
              className={linkClass("about")}
              aria-current={route === "about" ? "page" : undefined}
              onClick={handleLink("about")}
            >Universe</a>
          </li>
          <li><div className="mobile-overlay-divider"></div></li>
          <li><span className="mobile-overlay-label">Discover</span></li>
          <li>
            <a
              href="#search"
              className="mobile-overlay-link"
              onClick={handleSearch}
            >Search</a>
          </li>
          <li>
            <a
              href="#subscribe"
              className={linkClass("subscribe")}
              aria-current={route === "subscribe" ? "page" : undefined}
              onClick={handleLink("subscribe")}
            >Subscribe</a>
          </li>
        </ul>
      </nav>

      <div className="mobile-overlay-footer">EN · USD</div>
    </div>
  );
}

/* ── Footer ───────────────────────────────────────────────── */
function Footer({ setRoute }) {
  return (
    <footer className="foot">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <Crest size={26} />
          <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
          <HiddenPerk setRoute={setRoute} />
        </div>
        <p className="muted" style={{ maxWidth: 36, fontSize: 13, lineHeight: 1.55, maxInlineSize: "32ch", margin: 0 }}>
          A house of houses. Fourteen stores, one magazine, and a quiet promise: live a little larger.
        </p>
        <div className="subs-inline" style={{ marginTop: 28 }}>
          <input placeholder="Your e-mail address" />
          <button>Join</button>
        </div>
      </div>

      <div>
        <h6>The House</h6>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("about"); }}>Universe</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("stores"); }}>Stores</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("magazine"); }}>Magazine</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
        </ul>
      </div>
      <div>
        <h6>Customer</h6>
        <ul>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Concierge</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Shipping</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Returns</a></li>
        </ul>
      </div>
      <div>
        <h6>Follow</h6>
        <ul>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Instagram</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Substack</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Pinterest</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>TikTok</a></li>
        </ul>
      </div>

      <div className="foot-base">
        <span>© MMXXVI · LaDidiér · Vol. I N°03</span>
        <span>Cookies · Privacy · Imprint</span>
      </div>
    </footer>
  );
}

/* ── Marquee of store names ───────────────────────────────── */
function StoreMarquee() {
  const items = STORES.map(s => s.name);
  const seq = (
    <span>
      {items.map((n, i) => (
        <React.Fragment key={i}>
          <span>{n}</span>
          <span className="dot"></span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        {seq}
        {seq}
      </div>
    </div>
  );
}

/* ── IntersectionObserver reveal wrapper ──────────────────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ── Magazine cover (composite placeholder) ───────────────── */
function MagazineCover({ tint = "blush", vol = "I", no = "03", season = "S/S 2026", title = "On Luxe & Larger Living", coverline = "The Quiet Audacity Issue", tilt = false, img = null }) {
  const photo = img || ISSUE.img;
  return (
    <div className={`cover ph photo framed ${tilt ? "tilt" : ""}`}
         data-tag={`Vol. ${vol}  ·  N°${no}`} data-label="COVER · PHOTOGRAPHY"
         style={{ "--bg-image": `url("${photo}")`, color: "#fff" }}>
      <span className="cover-corner tl"><DecoCorner size={42} /></span>
      <span className="cover-corner tr"><DecoCorner size={42} /></span>
      <span className="cover-corner bl"><DecoCorner size={42} /></span>
      <span className="cover-corner br"><DecoCorner size={42} /></span>

      <div className="cover-meta" style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        <span>LaDidiér</span>
        <span>{season}</span>
      </div>

      <div className="cover-title" style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        <span className="gold-text" style={{ fontStyle: "italic" }}>{title.split("&")[0]}</span>
        {title.includes("&") && <>& {title.split("&")[1]}</>}
        <div className="cover-laurel"><Laurel width={180} color="var(--gold)" /></div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 22, opacity: .85, color: "#fff" }}>
          {coverline}
        </div>
      </div>
    </div>
  );
}

export { STORES, ISSUE, STORIES, IMG, Crest, Logo, Nav, MobileNav, Footer, StoreMarquee, Reveal, MagazineCover };
