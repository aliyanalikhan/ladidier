/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Page components
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import {
  IMG,
  STORES,
  ISSUE,
  STORIES,
  Crest,
  Reveal,
  MagazineCover,
  StoreMarquee,
} from './components.jsx';
import {
  Laurel,
  Flourish,
  Monogram,
  Stagger,
  Spotlight,
  CountUp,
  RomanReveal,
} from './ornaments.jsx';
import { TreasureIcon } from './treasure.jsx';

/* ═══════════════════════════════════════════════════════════
   HOME — three hero variants + shared body
   ═══════════════════════════════════════════════════════════ */

function HeroManifest({ setRoute }) {
  return (
    <header className="hero-manifest">
      <div className="warmth" />
      <Spotlight size={620} intensity={.32} />
      <div className="watermark"><Monogram size={620} opacity={.06} /></div>

      <div className="flex between center" style={{ width: "100%" }}>
        <div className="eyebrow">Vol. {ISSUE.vol} · N° {ISSUE.no} · {ISSUE.season}</div>
        <div className="flex center gap-12">
          <Crest size={20} color="var(--gold)" />
          <div className="eyebrow">LaDidiér, the World Curated · Est. <RomanReveal value="MMXXI" /></div>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 36 }}>
          <Laurel width={300} color="var(--gold)" opacity={.85} />
        </div>
        <h1 className="display h1" style={{ margin: 0 }}>
          <Stagger className="block" base={150} step={70}>Live a little</Stagger><br/>
          <span style={{ fontStyle: "italic" }} className="gold-text">
            <Stagger base={460} step={70}>larger—on purpose.</Stagger>
          </span>
        </h1>
        <p className="lede reveal in" style={{ marginTop: 36, animationDelay: "900ms", opacity: 0, animation: "pageFade .9s .9s ease forwards" }}>
          Fourteen stores. One magazine. A quiet conviction that beauty is a daily practice,
          and that the smallest objects—a vial, a roast, a ring—can change the temperature of a room.
        </p>
      </div>

      <Reveal delay={1100}>
        <div className="flex gap-16" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn solid" onClick={() => setRoute("stores")}>Shop the Houses</button>
          <button className="btn" onClick={() => setRoute("magazine")}>Read the issue</button>
          <div className="flex center gap-12" style={{ marginLeft: 24, color: "var(--mute)", fontSize: 13 }}>
            <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>Now reading ·</span>
            <span className="vmarquee">
              <ul>
                {STORES.slice(0, 8).map(s => <li key={s.id} style={{ height: "1.4em" }}>{s.name}</li>)}
                <li style={{ height: "1.4em" }}>{STORES[0].name}</li>
              </ul>
            </span>
          </div>
        </div>
      </Reveal>
    </header>
  );
}

function HeroSplit({ setRoute }) {
  return (
    <header className="hero-split">
      <div className="warmth" />
      <Spotlight size={520} intensity={.22} />

      <div>
        <div className="flex center gap-12" style={{ marginBottom: 32 }}>
          <Crest size={18} color="var(--gold)" />
          <div className="eyebrow">The Spring · Summer Issue — Vol. {ISSUE.vol} N° {ISSUE.no}</div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <Laurel width={240} color="var(--gold)" opacity={.85} />
        </div>
        <h1 className="display h1" style={{ margin: 0 }}>
          <Stagger base={150} step={80}>On luxe</Stagger><br/>
          <Stagger base={380} step={80}>&amp; larger</Stagger><br/>
          <span style={{ fontStyle: "italic" }} className="gold-text">
            <Stagger base={620} step={80}>living.</Stagger>
          </span>
        </h1>
        <p className="lede" style={{ marginTop: 36, maxWidth: "44ch", animation: "pageFade .9s .9s ease both" }}>
          A magazine for the soft-spoken maximalist. Read freely; subscribe when you're ready
          to receive each new chapter at the door.
        </p>
        <div className="flex gap-16" style={{ marginTop: 40, flexWrap: "wrap", animation: "pageFade .9s 1.05s ease both" }}>
          <button className="btn solid" onClick={() => setRoute("stores")}>Shop the Houses</button>
          <button className="btn" onClick={() => setRoute("magazine")}>Open the issue</button>
          <button className="btn ghost" onClick={() => setRoute("subscribe")}>How to subscribe →</button>
        </div>

        <div style={{ marginTop: 64, display: "grid", gap: 0, animation: "pageFade .9s 1.2s ease both" }}>
          <div className="detail-row"><span className="k">Houses</span><span><CountUp to={14} /> stores under one roof</span></div>
          <div className="detail-row"><span className="k">Frequency</span><span>Quarterly · Spring · Summer · Autumn · Winter</span></div>
          <div className="detail-row"><span className="k">In this issue</span><span><CountUp to={32} /> stories · <CountUp to={4} /> features · <CountUp to={1} /> letter</span></div>
        </div>
      </div>

      <div style={{ position: "relative" }} className="float-slow">
        <MagazineCover tint={ISSUE.cover} vol={ISSUE.vol} no={ISSUE.no} season={ISSUE.season} title={ISSUE.title} tilt />
        <div className="mono" style={{ position: "absolute", right: 0, top: -28, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mute)" }}>
          ↘ Current issue
        </div>
      </div>
    </header>
  );
}

function HeroIndex({ setRoute }) {
  return (
    <header className="hero-index">
      <div className="warmth" />
      <Spotlight size={500} intensity={.22} />

      <div className="col gap-32" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="flex center gap-12" style={{ marginBottom: 24 }}>
            <Crest size={36} color="var(--gold)" />
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mute)" }}>
              The House of LaDidiér — Volume One
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <Laurel width={260} color="var(--gold)" opacity={.85} />
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 6.5vw, 92px)", margin: 0 }}>
            <Stagger base={150} step={70}>A door to</Stagger><br/>
            <Stagger base={380} step={70}>fourteen small</Stagger><br/>
            <span style={{ fontStyle: "italic" }} className="gold-text">
              <Stagger base={620} step={70}>obsessions.</Stagger>
            </span>
          </h1>
          <p className="lede" style={{ marginTop: 32, maxWidth: "44ch", animation: "pageFade .9s 1s ease both" }}>
            Begin anywhere. Wander into a roast, leave with a fragrance, finish at the magazine.
            This is the table of contents.
          </p>
        </div>
        <div className="flex gap-16" style={{ alignSelf: "flex-start", flexWrap: "wrap", animation: "pageFade .9s 1.15s ease both" }}>
          <button className="btn solid" onClick={() => setRoute("stores")}>
            Shop the Houses →
          </button>
          <button className="btn ghost" onClick={() => setRoute("magazine")}>Read the issue</button>
        </div>
      </div>

      <div>
        <div className="flex between" style={{ paddingBottom: 18, borderBottom: "1px solid var(--line-strong)" }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>Index — The Houses</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mute)" }}>Updated MMXXVI · 05</span>
        </div>
        <div>
          {STORES.slice(0, 6).map((s, i) => (
            <Reveal key={s.id} delay={i * 80}>
              <div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
                <span className="num mono">{s.id}</span>
                <span className="name">{s.name}</span>
                <span className="cat">{s.cat}</span>
                <span className="pill">Est. {s.est}</span>
                <span className="arrow">→</span>
              </div>
            </Reveal>
          ))}
          <div style={{ paddingTop: 22, display: "flex", justifyContent: "space-between" }}>
            <span className="mono muted" style={{ fontSize: 12 }}>+ {STORES.length - 6} more houses inside</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setRoute("stores"); }}
               className="mono" style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: 6 }}>
              See all →
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* Featured stories strip on home */
function FeaturedStories({ setRoute }) {
  const featured = STORIES.slice(0, 4);
  return (
    <section className="section container">
      <div className="flex between" style={{ marginBottom: 56, alignItems: "flex-end", gap: 32, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>The Magazine — Vol. {ISSUE.vol} N°{ISSUE.no}</div>
          <h2 className="display h2" style={{ margin: 0, maxWidth: "16ch" }}>
            Stories from this season's issue.
          </h2>
        </div>
        <button className="btn ghost" onClick={() => setRoute("magazine")}>All stories →</button>
      </div>

      <div className="magazine-featured-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 40 }}>
        {/* Lead story */}
        <Reveal>
          <article className="art-card lift" onClick={() => setRoute("article")} style={{ cursor: "pointer" }}>
            <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${featured[0].img})` }} data-tag={featured[0].kicker} data-label="EDITORIAL · LEAD"></div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{featured[0].kicker}</div>
              <h3 className="art-title" style={{ fontSize: "clamp(28px, 2.4vw, 40px)" }}>{featured[0].title}</h3>
              <div className="art-meta" style={{ marginTop: 16 }}>{featured[0].author} · {featured[0].read} read</div>
            </div>
          </article>
        </Reveal>

        <div className="col gap-32">
          {featured.slice(1, 3).map((s, i) => (
            <Reveal key={s.id} delay={(i+1)*80}>
              <article className="art-card lift" onClick={() => setRoute("article")} style={{ cursor: "pointer", gridTemplateColumns: "1fr", display: "grid", gap: 14 }}>
                <div className="ph photo" style={{ aspectRatio: "16/10", "--bg-image": `url(${s.img})` }} data-tag={s.kicker} data-label="STORY"></div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{s.kicker}</div>
                  <h3 className="art-title">{s.title}</h3>
                  <div className="art-meta" style={{ marginTop: 10 }}>{s.author} · {s.read}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="col gap-24">
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mute)", paddingBottom: 12, borderBottom: "1px solid var(--line-strong)" }}>
            Also in the issue
          </div>
          {STORIES.slice(4, 8).map((s, i) => (
            <a key={s.id} href="#" onClick={(e) => { e.preventDefault(); setRoute("article"); }}
               className="lift" style={{ paddingBlock: 14, borderBottom: "1px solid var(--line)", display: "block" }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{s.kicker}</div>
              <div className="art-title" style={{ fontSize: 18 }}>{s.title}</div>
              <div className="art-meta" style={{ marginTop: 6 }}>{s.author} · {s.read}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Stores preview grid on home */
function StoresPreview({ setRoute }) {
  return (
    <section className="section" style={{ background: "var(--bg-2)" }}>
      <div className="container">
        <div className="flex between" style={{ marginBottom: 56, alignItems: "flex-end", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>The Directory · {STORES.length} Houses</div>
            <h2 className="display h2" style={{ margin: 0, maxWidth: "18ch" }}>
              Every door leads somewhere worth lingering.
            </h2>
          </div>
          <button className="btn ghost" onClick={() => setRoute("stores")}>Discover the Directory →</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {STORES.map((s, i) => (
            <Reveal key={s.id} delay={i * 50}>
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                 className="lift" style={{ display: "block", border: "1px solid var(--line)", background: "var(--bg)", padding: 18 }}>
                <div className="ph photo" style={{ aspectRatio: "9/16", "--bg-image": `url(${s.img})` }} data-tag={`N° ${s.id}`} data-label={s.cat.toUpperCase()}></div>
                <div style={{ paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div className="display" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-.01em" }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{s.id}</div>
                </div>
                <div className="flex between" style={{ marginTop: 4, alignItems: "baseline" }}>
                  <div className="eyebrow">{s.cat}</div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Est. {s.est}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Brand manifesto block */
function Manifesto() {
  return (
    <section className="section container" style={{ position: "relative" }}>
      <div className="ornament-divider" style={{ paddingTop: 0, marginBottom: 32 }}>
        <Flourish width={240} color="var(--gold)" opacity={.7} />
      </div>

      <div className="manifesto-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }}>
        <div className="col gap-24">
          <div className="eyebrow">Welcome · I</div>
          <Crest size={64} color="var(--gold)" />
          <Laurel width={200} color="var(--gold)" opacity={.7} />
        </div>
        <div>
          <p className="display" style={{ fontSize: "clamp(28px, 3.4vw, 56px)", fontWeight: 300, lineHeight: 1.12, margin: 0, letterSpacing: "-.02em" }}>
            Welcome to LaDidiér—a refined destination for considered finds, everyday essentials,
            elevated lifestyle pieces, and unforgettable journeys. From the beautifully practical to the
            wonderfully unexpected, LaDidiér brings <em style={{ fontStyle: "italic" }} className="gold-text">shopping and travel</em> together
            in one inspiring world, designed to help you discover more, experience more, and live with intention.
            Your taste. Your travels. <em style={{ fontStyle: "italic" }} className="gold-text">Your world.</em>
          </p>
        </div>
      </div>

      <div className="flex gap-32" style={{ marginTop: 56, flexWrap: "wrap", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 40 }}>
        <div>
          <div className="num num-glow" style={{ fontSize: 64 }}><CountUp to={14} /></div>
          <div className="eyebrow" style={{ marginTop: 10 }}>Houses</div>
        </div>
        <div>
          <div className="num num-glow" style={{ fontSize: 64 }}><CountUp to={4} format={(v) => String(v).padStart(2, "0")} /></div>
          <div className="eyebrow" style={{ marginTop: 10 }}>Issues / year</div>
        </div>
        <div>
          <div className="num num-glow" style={{ fontSize: 56 }}><RomanReveal value="MMXXI" /></div>
          <div className="eyebrow" style={{ marginTop: 10 }}>Established</div>
        </div>
        <div>
          <div className="num num-glow" style={{ fontSize: 64 }}><CountUp to={1} format={(v) => String(v).padStart(2, "0")} /></div>
          <div className="eyebrow" style={{ marginTop: 10 }}>Universe</div>
        </div>
      </div>

      {/* Editorial montage strip */}
      <Reveal>
        <div className="montage-grid" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr", gap: 18 }}>
          <div className="ph photo float-slow" style={{ aspectRatio: "3/4", "--bg-image": `url(${IMG.atelier})` }} data-tag="Atelier" data-label="THE PERFUMER'S HAND"></div>
          <div className="ph photo float" style={{ aspectRatio: "4/5", marginTop: 40, "--bg-image": `url(${IMG.signet})` }} data-tag="Object" data-label="THE SIGNET RING"></div>
          <div className="ph photo float-slow" style={{ aspectRatio: "4/5", marginTop: 12, "--bg-image": `url(${IMG.tea})` }} data-tag="Maison" data-label="HOUSE GUEST"></div>
          <div className="ph photo float" style={{ aspectRatio: "3/4", marginTop: 60, "--bg-image": `url(${IMG.travel})` }} data-tag="Diary" data-label="FORTY-EIGHT HOURS"></div>
        </div>
      </Reveal>
    </section>
  );
}

function HomePage({ setRoute, heroVariant }) {
  return (
    <div className="page-fade">
      {heroVariant === "manifest" && <HeroManifest setRoute={setRoute} />}
      {heroVariant === "split"    && <HeroSplit    setRoute={setRoute} />}
      {heroVariant === "index"    && <HeroIndex    setRoute={setRoute} />}

      <StoreMarquee />
      <TreasureIcon page="home" />
      <Manifesto />
      <FeaturedStories setRoute={setRoute} />
      <StoresPreview setRoute={setRoute} />
      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}

/* Subscribe banner used at the bottom of pages */
function SubscribeBanner({ setRoute }) {
  return (
    <section className="section container" style={{ position: "relative" }}>
      <div className="ornament-divider" style={{ paddingTop: 0, marginBottom: 28 }}>
        <Flourish width={280} color="var(--gold)" opacity={.7} />
      </div>
      <div className="subscribe-banner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div className="eyebrow">Reading is free. Belonging is optional.</div>
          <h2 className="display h2" style={{ margin: "20px 0 0", maxWidth: "16ch" }}>
            The magazine, at your <em style={{ fontStyle: "italic" }} className="gold-text">door</em> each season.
          </h2>
        </div>
        <div>
          <p className="lede" style={{ margin: 0 }}>
            For now, every story is open. When you're ready, subscribe to receive the print edition,
            early store drops, and the editor's quiet letter on Sundays.
          </p>
          <div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
            <button className="btn solid" onClick={() => setRoute("subscribe")}>Choose your subscription</button>
            <button className="btn ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Continue reading freely →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAGAZINE — issue landing
   ═══════════════════════════════════════════════════════════ */

const ISSUE_HIGHLIGHTS = [
  {
    img: "/assets/eclat/spotlight-onuwanibe.jpg",
    kicker: "Cover Story · Spotlight",
    title: "The Power of Vision: Paul Onwuanibe",
    dek: "On leadership, legacy, and rebuilding Africa's business landscape — three decades of building across a continent.",
  },
  {
    img: "/assets/eclat/amvca-looks.jpg",
    kicker: "Couture, Culture & Icons",
    title: "The Looks That Owned the Night",
    dek: "Inside the AMVCA red carpet, where sculptural gowns and reimagined tailoring turned Lagos into a living couture runway.",
  },
  {
    img: "/assets/eclat/lagos-city.jpg",
    kicker: "Urban Pulse",
    title: "Lagos: The City That Never Sleeps",
    dek: "A city of seekers, where a Rolls-Royce passes a danfo and the night never quite ends.",
  },
  {
    img: "/assets/eclat/chef-efi.jpg",
    kicker: "At the Chef's Table",
    title: "Cracked Open: Inside Chef Efi's Culinary Revolution",
    dek: "A Cantonese-style ginger-scallion lobster, and the philosophy of a chef who believes good cooking depends on timing.",
  },
  {
    img: "/assets/eclat/world-cup.jpg",
    kicker: "Global Sport",
    title: "The World Cup That Had It All",
    dek: "Dramatic comebacks, breakout stars, and Spain lifting the trophy — a retrospective on the tournament that stopped the world.",
  },
  {
    img: "/assets/eclat/afrobeats.jpg",
    kicker: "Culture · Music · Connection",
    title: "One Beat, Many Nations, One World",
    dek: "When the beat drops, borders disappear — how Afrobeats became the rhythm bringing the world together.",
  },
];

function MagazinePage({ setRoute }) {
  return (
    <div className="page-fade">
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>The Magazine</div>
          <h1 className="display h2" style={{ margin: 0 }}>
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>On Luxe</em> &amp; Larger Living.
          </h1>
          <p className="lede" style={{ marginTop: 28 }}>
            The Spring · Summer issue. Thirty-two stories on the small obsessions that make a life —
            and the fourteen houses that made them. Preview the cover and this issue's highlights below,
            then read the full issue in print or take it home as ÉcLAT Online.
          </p>
        </div>
        <div className="col gap-12">
          <div className="detail-row"><span className="k">Volume</span><span>I</span></div>
          <div className="detail-row"><span className="k">Issue</span><span>N° {ISSUE.no}</span></div>
          <div className="detail-row"><span className="k">Season</span><span>{ISSUE.season}</span></div>
          <div className="detail-row"><span className="k">Stories</span><span>32</span></div>
          <div className="detail-row" style={{ borderBottom: "none" }}><span className="k">Next issue</span><span>Autumn · MMXXVI</span></div>
        </div>
      </header>

      <TreasureIcon page="magazine" />

      {/* Issue feature panel — real cover + preview copy */}
      <section className="section container magazine-cover-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64, alignItems: "center", position: "relative" }}>
        <div
          className="ph photo float-slow"
          style={{ aspectRatio: "1600/2263", "--bg-image": `url(/assets/eclat-vol2-cover.jpg)` }}
          data-tag="Vol. 2 · Sep 2026"
          data-label="THE COVER"
        ></div>
        <div>
          <div className="eyebrow">This Issue's Cover</div>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 48px)", margin: "16px 0 24px", letterSpacing: "-.02em", fontWeight: 300 }}>
            The Power of Vision: Paul Onwuanibe — On Leadership, Legacy, and Rebuilding Africa's
            Business Landscape.
          </h2>
          <p className="lede">
            A look inside Volume 2 — six of the stories, people, and moments that shaped this
            issue, from the cover feature to the culture pages below.
          </p>
          <p className="mono muted" style={{ marginTop: 20, fontSize: 12, letterSpacing: ".02em" }}>
            Want to turn every page? Our interactive reading platform is launching soon.
          </p>
          <div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
            <button className="btn solid" onClick={() => setRoute("subscribe")}>Order this issue →</button>
          </div>
        </div>
      </section>

      {/* Highlights grid */}
      <section className="section container">
        <div className="eyebrow" style={{ marginBottom: 14 }}>Inside Volume 2</div>
        <h2 className="display h2" style={{ margin: "0 0 40px", maxWidth: "20ch" }}>
          Highlights from this issue.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
          {ISSUE_HIGHLIGHTS.map((h) => (
            <article key={h.title} className="art-card">
              <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${h.img})` }} data-tag={h.kicker} data-label="ÉCLAT VOL. 2"></div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{h.kicker}</div>
                <h3 className="art-title">{h.title}</h3>
                <div className="art-meta" style={{ marginTop: 10 }}>{h.dek}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE — sample story page
   ═══════════════════════════════════════════════════════════ */

function ArticlePage({ setRoute }) {
  return (
    <div className="page-fade">
      <header className="container" style={{ padding: "clamp(80px, 12vh, 140px) var(--gutter) 56px", maxWidth: 980, margin: "0 auto" }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>Editor's Letter · Vol. I N° 03</div>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 88px)", margin: 0, fontWeight: 300, letterSpacing: "-.025em", lineHeight: 1 }}>
          On the Quiet<br/>
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Audacity</em> of<br/>
          Wanting More.
        </h1>
        <div className="flex gap-32" style={{ marginTop: 36, flexWrap: "wrap" }}>
          <div><div className="eyebrow">Author</div><div style={{ marginTop: 4 }}>Adeva D., Editor</div></div>
          <div><div className="eyebrow">Reading</div><div style={{ marginTop: 4 }}>6 minutes</div></div>
          <div><div className="eyebrow">Published</div><div style={{ marginTop: 4 }}>03 May, MMXXVI</div></div>
        </div>
      </header>

      <TreasureIcon page="article" />
      <div className="container" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="ph photo" style={{ aspectRatio: "16/9", "--bg-image": `url(${IMG.articleHero})` }} data-tag="HERO · EDITORIAL" data-label="LARGE-FORMAT PHOTOGRAPH"></div>
      </div>

      <article className="container art-body" style={{ maxWidth: 720, margin: "0 auto", padding: "64px var(--gutter)", fontSize: 18, lineHeight: 1.7 }}>
        <p style={{ fontFamily: "var(--display)", fontSize: 26, lineHeight: 1.4, fontWeight: 300, letterSpacing: "-.01em", marginTop: 0 }}>
          There is a quiet kind of rebellion in admitting that you want more. More beauty. More slowness.
          More unreasonably clean linen. More than the productivity-shaped life will ever, in good conscience, hand you.
        </p>
        <p>
          When we began the magazine, we promised ourselves it would not be about <em>things</em>.
          And yet — here we are, three issues in, writing about a single signet ring, a single pour-over,
          a single coat with a single, immaculate seam. We have come to suspect this is not a contradiction.
        </p>
        <h3 className="display" style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-.01em", marginTop: 56 }}>I. The soft maximalist's vow.</h3>
        <p>
          To want more is not greed; it is attention. To choose softness is not surrender;
          it is editorial discipline. In a season where the loudest voices have not yet earned
          our trust, we are placing ours with the quiet ones: the perfumer who numbers each vial,
          the roaster who knows the farmer's children's names, the tailor who insists on a third fitting.
        </p>
        <p>
          This issue is our small case for the practice. Read freely. Linger. The door is open.
        </p>
        <div style={{ marginTop: 48, textAlign: "center", fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".2em", color: "var(--mute)" }}>
          · · ·
        </div>
        <p style={{ marginTop: 48 }}>
          — Adeva D.
        </p>
      </article>

      {/* Continue reading */}
      <section className="section container">
        <div className="flex between" style={{ marginBottom: 40, alignItems: "flex-end" }}>
          <div className="eyebrow">Continue reading</div>
          <button className="btn ghost" onClick={() => setRoute("magazine")}>Back to issue →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40 }}>
          {STORIES.slice(1, 4).map(s => (
            <article key={s.id} className="art-card lift" onClick={() => setRoute("article")} style={{ cursor: "pointer" }}>
              <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${s.img})` }} data-tag={s.kicker} data-label="STORY"></div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>{s.kicker}</div>
                <h3 className="art-title">{s.title}</h3>
                <div className="art-meta" style={{ marginTop: 8 }}>{s.author} · {s.read}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STORES — directory
   ═══════════════════════════════════════════════════════════ */

function StoresPage({ setRoute }) {
  const [view, setView] = useState("list"); // 'list' | 'grid'
  return (
    <div className="page-fade">
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>The Directory</div>
          <h1 className="display h2" style={{ margin: 0 }}>
            Fourteen houses,<br/>
            one <em style={{ fontStyle: "italic", color: "var(--gold)" }}>address.</em>
          </h1>
        </div>
        <div className="col gap-12">
          <p style={{ margin: 0, color: "var(--ink)", fontSize: 15 }}>
            Each house keeps its own hours and its own obsessions. Together they form the LaDidiér universe —
            united by craft, by patience, and by a refusal to rush a good thing. Step through any door below and shop it at your leisure.
          </p>
          <div className="flex gap-16" style={{ marginTop: 12 }}>
            <button onClick={() => setView("list")}
              className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
                padding: "10px 18px", border: "1px solid var(--line-strong)",
                background: view === "list" ? "var(--fg)" : "transparent", color: view === "list" ? "var(--bg)" : "var(--fg)" }}>
              Index
            </button>
            <button onClick={() => setView("grid")}
              className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
                padding: "10px 18px", border: "1px solid var(--line-strong)",
                background: view === "grid" ? "var(--fg)" : "transparent", color: view === "grid" ? "var(--bg)" : "var(--fg)" }}>
              Gallery
            </button>
          </div>
        </div>
      </header>

      <TreasureIcon page="stores" />
      {view === "list" && (
        <section className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--line-strong)" }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>N°</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", marginRight: "auto", marginLeft: 56 }}>House</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mute)" }}>Category &nbsp; · &nbsp; Established &nbsp; · &nbsp; Enter</span>
          </div>
          {STORES.map((s, i) => (
            <Reveal key={s.id} delay={i * 40}>
              <div className="store-row" aria-label={`Visit the Boutique — ${s.name}`} onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
                <span className="num mono">{s.id}</span>
                <div>
                  <div className="name">{s.name}</div>
                  <div style={{ color: "var(--mute)", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>
                    {s.tagline}
                  </div>
                </div>
                <span className="cat">{s.cat}</span>
                <span className="pill">Est. {s.est}</span>
                <span className="arrow">→</span>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      {view === "grid" && (
        <section className="section container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {STORES.map((s, i) => (
              <Reveal key={s.id} delay={i * 50}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="lift"
                   style={{ display: "block", border: "1px solid var(--line)", padding: 20, background: "var(--bg)" }}>
                  <div className="ph photo" style={{ aspectRatio: "9/16", "--bg-image": `url(${s.img})` }} data-tag={`N° ${s.id}`} data-label={s.cat.toUpperCase()}></div>
                  <div style={{ paddingTop: 18 }}>
                    <div className="flex between center">
                      <div className="display" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-.01em" }}>{s.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{s.id}</div>
                    </div>
                    <div className="eyebrow" style={{ marginTop: 4 }}>{s.cat}</div>
                    <div style={{ marginTop: 14, fontSize: 13, fontStyle: "italic", color: "var(--ink)" }}>{s.tagline}</div>
                    <div className="flex between" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Est. {s.est}</span>
                      <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em" }}>Visit the Boutique →</span>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUBSCRIBE
   ═══════════════════════════════════════════════════════════ */

function SubscribePage({ setRoute, isSubscribed, setIsSubscribed }) {
  const [plan, setPlan] = useState("online");
  const [billing, setBilling] = useState("yearly");
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState(null);

  // Stripe is the source of truth for what a plan costs, so the cards render
  // whatever it reports. Nothing here records an amount, which is what keeps the
  // displayed price from drifting away from what the customer is charged.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/prices')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setPrices(d); })
      .catch((err) => console.error('Could not load prices:', err));
    return () => { cancelled = true; };
  }, []);

  // en-US renders USD as "$60" rather than "US$60", and still gives "€96" for
  // euro, so this reads correctly whichever currency the Stripe prices use.
  const money = (amount, currency) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      // Whole amounts read better without trailing zeros on a page like this.
      minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    }).format(amount / 100);

  const priceLabel = (product) => {
    const p = prices?.[product]?.[billing];
    return p ? money(p.amount, p.currency) : "—";
  };

  // Show the free tier's zero in whatever currency the paid plans are in, rather
  // than a hardcoded symbol that could contradict them.
  const freeCurrency =
    prices?.online?.[billing]?.currency ?? prices?.hardcopy?.[billing]?.currency;
  const freeLabel = freeCurrency ? money(0, freeCurrency) : "Free";

  const perLabel = billing === "yearly" ? "/year" : "/month";

  const handleSelectPlan = async (product) => {
    if (product === "reader") {
      setIsSubscribed(true);
      localStorage.setItem("ladidier_subscribed", "true");
      setRoute("magazine");
      return;
    }

    setPlan(product);
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The server maps this key to a price id — the browser never names a price.
        body: JSON.stringify({ planType: `${product}_${billing}` }),
      });

      if (!response.ok) throw new Error('Checkout response not ok');
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade">
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Membership</div>
          <h1 className="display h2" style={{ margin: 0 }}>
            Reading is free.<br/>
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Belonging</em> is by design.
          </h1>
        </div>
        <div>
          <p className="lede" style={{ margin: 0 }}>
            Every story on Ladidier.com is open, today and tomorrow. A membership adds early
            access to store drops and a Sunday letter from the editor — and, if you want the
            object as well as the words, the print edition at your door.
          </p>
        </div>
      </header>

      <section className="section container">
        {/* Billing interval. Switching it re-labels the cards and changes which
            price key handleSelectPlan sends, so no separate plan list is needed. */}
        <div className="flex" style={{ justifyContent: "center", gap: 0, marginBottom: 56 }}>
          {[["monthly", "Monthly"], ["yearly", "Yearly"]].map(([key, label]) => {
            const on = billing === key;
            return (
              <button
                key={key}
                className="btn"
                onClick={() => setBilling(key)}
                aria-pressed={on}
                style={{
                  background: on ? "var(--gold)" : "transparent",
                  borderColor: on ? "var(--gold)" : "var(--line)",
                  color: on ? "var(--noir)" : "var(--ink)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>

          <div className="plan-card" onClick={() => setPlan("reader")}
               style={plan === "reader" ? { borderColor: "var(--gold)" } : {}}>
            <div className="flex between">
              <div className="eyebrow">Plan I</div>
              <div className="eyebrow">Free, forever</div>
            </div>
            <div>
              <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>Reader</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>For the casual visitor.</div>
            </div>
            <div className="price">{freeLabel}<span style={{ fontSize: 16, color: "var(--mute)", marginLeft: 6 }}>{perLabel}</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 14 }}>
              <li>· Unlimited story reading</li>
              <li>· Access to all 14 stores</li>
              <li>· Quarterly newsletter</li>
            </ul>
            <button className="btn" onClick={() => handleSelectPlan("reader")} style={{ marginTop: "auto" }}>Continue, no charge</button>
          </div>

          <div className="plan-card featured" onClick={() => setPlan("online")}
               style={{ transform: plan === "online" ? "translateY(-6px)" : "none" }}>
            <div className="flex between">
              <div className="eyebrow" style={{ color: "color-mix(in srgb, var(--bg) 65%, transparent)" }}>Plan II</div>
              <div className="eyebrow" style={{ color: "var(--gold)" }}>Most chosen</div>
            </div>
            <div>
              <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>ÉcLAT Online</div>
              <div style={{ fontSize: 13, marginTop: 4, opacity: .7 }}>The magazine, in full.</div>
            </div>
            <div className="price">
              {priceLabel("online")}
              <span style={{ fontSize: 16, opacity: .55, marginLeft: 6 }}>
                {perLabel}
              </span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 14 }}>
              <li>· Every issue, the full archive</li>
              <li>· Early store access (48h)</li>
              <li>· Sunday letter from the editor</li>
              <li>· Members-only store events</li>
              <li>· 10% house credit on first order</li>
            </ul>
            <button className="btn solid" disabled={loading} onClick={() => handleSelectPlan("online")} style={{ marginTop: "auto", background: "var(--gold)", borderColor: "var(--gold)", color: "var(--noir)" }}>
              {loading && plan === "online" ? "Redirecting..." : "Become a member"}
            </button>
          </div>

          <div className="plan-card" onClick={() => setPlan("hardcopy")}
               style={plan === "hardcopy" ? { borderColor: "var(--gold)" } : {}}>
            <div className="flex between">
              <div className="eyebrow">Plan III</div>
              <div className="eyebrow">Limited · 250</div>
            </div>
            <div>
              <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>ÉcLAT Hard Copy</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>For the devoted.</div>
            </div>
            <div className="price">
              {priceLabel("hardcopy")}
              <span style={{ fontSize: 16, color: "var(--mute)", marginLeft: 6 }}>
                {perLabel}
              </span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 14 }}>
              <li>· Everything in Online</li>
              <li>· Hand-numbered print edition</li>
              <li>· Annual atelier visit (one house)</li>
              <li>· Direct line to the concierge</li>
              <li>· Name in the back of the magazine</li>
            </ul>
            <button className="btn" disabled={loading} onClick={() => handleSelectPlan("hardcopy")}>
              {loading && plan === "hardcopy" ? "Redirecting..." : "Take the print edition"}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 120 }}>
          <div className="eyebrow" style={{ marginBottom: 32 }}>The Fine Print, in Plain Words</div>
          <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            {[
              ["When does the paywall arrive?", "Eventually, but never for the Editor's Letter or the cover story. The rest will move to members-only over the coming year. We will tell you, twice, before it happens."],
              ["Will I still receive the stores' product news?", "Yes. The store mailing lists are separate; you control each one from your account."],
              ["Can I gift a membership?", "Yes — gift Online or Hard Copy from any membership card, including a hand-tied print certificate."],
              ["Refunds?", "Within 30 days, no questions. We trust you to be honest; we'll do the same."],
            ].map(([q, a], i) => (
              <details key={i} style={{ borderBottom: "1px solid var(--line)", padding: "20px 0" }}>
                <summary style={{ cursor: "pointer", fontFamily: "var(--display)", fontSize: 22, fontWeight: 300, letterSpacing: "-.01em" }}>{q}</summary>
                <p style={{ marginTop: 14, color: "var(--ink)" }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ABOUT / Universe
   ═══════════════════════════════════════════════════════════ */

function AboutPage({ setRoute }) {
  return (
    <div className="page-fade">
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>The Universe</div>
          <h1 className="display h2" style={{ margin: 0 }}>
            One house. Fourteen<br/>
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>obsessions.</em>
          </h1>
        </div>
        <p className="lede" style={{ margin: 0 }}>
          LaDidiér is a family of small, deliberate stores and a quarterly magazine that ties them
          together. We make things slowly, on purpose, and we publish about it in the same temperament.
        </p>
      </header>

      <section className="section container">
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }}>
          <div className="col gap-32" style={{ position: "sticky", top: 120 }}>
            <Crest size={72} color="var(--gold)" />
            <div>
              <div className="eyebrow">Founded</div>
              <div className="display" style={{ fontSize: 40, fontWeight: 300 }}>MMXXI</div>
            </div>
            <div>
              <div className="eyebrow">Headquarters</div>
              <div style={{ fontSize: 16, marginTop: 6 }}>Paris · Lagos · Brooklyn</div>
            </div>
            <div>
              <div className="eyebrow">Headcount</div>
              <div className="display" style={{ fontSize: 40, fontWeight: 300 }}>34</div>
            </div>
            <Laurel width={200} color="var(--gold)" opacity={.7} />
          </div>
          <div>
            <p className="display" style={{ fontSize: "clamp(28px, 3.2vw, 48px)", fontWeight: 300, lineHeight: 1.18, letterSpacing: "-.02em", margin: 0 }}>
              We started with one store and a question: what if luxury were also generous?
              Five years later we have fourteen storefronts and a magazine that asks the question for us, every season.
            </p>

            <div className="history-images-1" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${IMG.atelier})` }} data-tag="The Petit Atelier" data-label="PARIS · IX"></div>
              <div className="ph photo float-slow" style={{ aspectRatio: "9/16", marginTop: 48, "--bg-image": `url(${IMG.s_maison})` }} data-tag="Maison" data-label="BROOKLYN · NY"></div>
            </div>

            <p style={{ marginTop: 48, fontSize: 17, lineHeight: 1.65, maxWidth: "64ch" }}>
              The houses are connected, but not interchangeable. Piata Noir Roast does not look like Adeva Store
              and Adeva Store does not look like Ladidiér Maison. What they share is the standard, the patience,
              and a quiet preference for things that age well.
            </p>
            <p style={{ marginTop: 24, fontSize: 17, lineHeight: 1.65, maxWidth: "64ch" }}>
              The magazine is our connective tissue. It is free today; it may not always be. Either way,
              you can begin reading at any door.
            </p>

            <div className="history-images-2" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
              <div className="ph photo" style={{ aspectRatio: "5/4", "--bg-image": `url(${IMG.travel})` }} data-tag="Editorial" data-label="THE TRAVEL DIARY"></div>
              <div className="ph photo float" style={{ aspectRatio: "5/4", "--bg-image": `url(${IMG.coffee})` }} data-tag="Piata Noir" data-label="ROAST · OAXACA"></div>
            </div>
          </div>
        </div>
      </section>

      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}

export {
  HomePage, MagazinePage, ArticlePage, StoresPage, SubscribePage, AboutPage, SubscribeBanner,
};
