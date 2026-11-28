/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Page components
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  IMG,
  STORES,
  ISSUE,
  STORIES,
  Crest,
  Reveal,
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
import { AIAvatarFAQ } from './avatarFaq.jsx';
import { WelcomeGift } from './welcomeGift.jsx';

const PENDING_PLAN = "ladidier_pending_plan";

// On a shared computer, signing out must not leave paid access behind for the
// next person. This clears every membership hint App's useState initializers
// and the account-path status effect can write to localStorage. It does NOT
// touch the httpOnly Stripe member cookie — that cookie is the legacy
// device-bound entitlement earned by a purchase made in this browser, which
// the ROADMAP regression invariant protects, and the shared-computer risk
// here is the account-path member, who never holds that cookie.
function clearMemberLocalState() {
  localStorage.removeItem("ladidier_member");
  localStorage.removeItem("ladidier_member_checked");
  localStorage.removeItem("ladidier_subscribed");
}

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
          A magazine for the soft-spoken maximalist. Subscribe to receive each new chapter
          at the door.
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
        <div className="ph photo cover framed tilt" style={{ aspectRatio: "1600/2263", "--bg-image": `url(/assets/eclat-vol2-cover.jpg)` }} data-tag="Issue 4" data-label="THE COVER"></div>
        <div className="mono" style={{ position: "absolute", right: 0, top: -28, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mute)" }}>
          ↘ New release · Issue 4
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

const SEASON_STORIES = [
  {
    title: "Chris Ubosi: The Man Behind the Frequency",
    kicker: "Cover Story",
    dek: "Chris Ubosi built stations, including Beat 99.9 FM, but when ÉCLAT sat down with him, he kept coming back to family, knowing when to walk away, and what tennis taught him about recovering from a mistake.",
    photos: [{ file: "chris-ubosi", page: 82, alt: "Chris Ubosi in a dark suit and bow tie" }],
  },
  {
    title: "Cape Town: The Beautiful Complication",
    kicker: "Travel · Cape Town",
    dek: "The last light falls across the Twelve Apostles. From the V&A Waterfront to the penguins on False Bay, our Cape Town feature follows the city along the edge of the mountain and the sea.",
    photos: [{ file: "cape-town", page: 16, alt: "The Twelve Apostles mountain range at sunset" }],
  },
  {
    title: "48 Hours in Lagos",
    kicker: "Dining · Lagos",
    dek: "Fifteen floors up at Sora Lagos, the weekend begins with bao, dumplings, and cocktails. It’s one stop on a two-day itinerary best planned around the table.",
    photos: [{ file: "sora-lagos", credit: "Courtesy of Sora Restaurant", page: 31, alt: "A table of dishes and cocktails at Sora Lagos" }],
  },
  {
    title: "The House That Gives",
    kicker: "Profile · Enugu",
    dek: "From Chicago, Dr. Conrad and Susan Mgbodille built a place for celebrations in Enugu. Events at Wicker Park help fund local scholarships, support for widows, and care for children.",
    photos: [{ file: "house-that-gives", credit: "Courtesy of Wicker Park Enugu Event Center", page: 65, alt: "The grounds of Wicker Park Enugu Event Center from the street" }],
  },
  {
    title: "A City Learns the Age of Its Trees",
    kicker: "Travel · Bruges",
    dek: "On the Bruges ramparts, Tanja Vandermoere follows a history written in old trees. The walk offers a quieter view of a city so often seen through its buildings.",
    photos: [{ file: "bruges", credit: "Tanja Vandermoere", page: 54, alt: "Mature trees and historic ramparts beside the water in Bruges" }],
  },
  {
    title: "Time Together",
    kicker: "Community",
    dek: "At a Human Race Foundation gathering, old friends find their way back to one another over tennis and conversation. The photos catch the easy company that keeps them coming back.",
    photos: [{ file: "time-together", page: 77, alt: "Friends gathered around a table with tennis racquets" }],
  },
  {
    title: "Seventeen in Style",
    kicker: "On Air · Beat 99.9 FM",
    dek: "Beat 99.9 FM marked its seventeenth anniversary with a gathering dressed in white. The photographs follow Chris Ubosi and the guests who came to celebrate the station’s milestone.",
    photos: [{ file: "beat-at-17", page: 95, alt: "Guests dressed in white at the Beat 99.9 FM anniversary" }],
  },
];

function SeasonStoryCard({ story, lead = false }) {
  return (
    <article className={`season-story${lead ? " season-story-lead" : ""}`} id={story.photos[0].file}>
      <div className="season-story-photos">
        {story.photos.map(({ file, alt, page, credit }) => (
          <figure className="season-story-photo" key={file}>
            <img src={`/assets/eclat4/${file}.webp`} alt={alt} loading={lead ? "eager" : "lazy"} />
            <figcaption>
              {credit && <span>{credit}</span>}
              <span>ÉCLAT Issue {ISSUE.no} · p. {page}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div>
        <div className="eyebrow">{story.kicker}</div>
        <h3 className="art-title">{story.title}</h3>
        <p className="art-meta">{story.dek}</p>
      </div>
    </article>
  );
}

/* Featured stories strip on home */
function FeaturedStories({ setRoute }) {
  const [lead, ...stories] = SEASON_STORIES;
  const featured = [stories[2], stories[0]];
  const additional = [stories[1], stories[3], stories[4], stories[5]];
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

      <div className="magazine-featured-grid" style={{ alignItems: "center", gap: "clamp(24px, 6vw, 96px)" }}>
        <SeasonStoryCard story={lead} lead />
        <div className="col gap-32">
          {featured.map((story) => <SeasonStoryCard key={story.title} story={story} />)}
        </div>
      </div>

      <div className="season-story-grid">
        {additional.map((story) => <SeasonStoryCard key={story.title} story={story} />)}
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
function Manifesto({ printMode = false }) {
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
          {/* Mounted here — inside Manifesto's left column, .col.gap-24 —
              rather than at the HomePage level, so it is an in-flow block
              in the editorial column instead of an overlay. It is still a
              descendant of HomePage's route-keyed tree, so app.jsx's
              route-keyed <main> still unmounts it on navigate and stops
              playback for free (Pitfall D). printMode still excludes it
              from the print build, which also renders HomePage. */}
          {!printMode && <AIAvatarFAQ />}
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

/* Seasonal Thanksgiving theme — auto-expires Dec 1 2026. */
const THANKSGIVING_ON = new Date() < new Date("2026-12-01");

/* Bespoke SVG leaf silhouettes with authentic warm autumn colors to avoid vendor emoji color quirks (e.g. pink maple leaves on Windows) */
function AutumnLeaf({ type, color, size = 22 }) {
  if (type === "oak") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ display: "block" }}>
        <path d="M12 2c1.2 1 2 2.2 1.8 3.5 1.2.2 2.2 1.2 2 2.5 1.1.4 1.8 1.5 1.5 2.7 1 .6 1.5 1.8 1.1 3-.8 0-1.4.6-1.5 1.5 1 .8 1.1 2.2.3 3.1-.6.7-1.6.8-2.3.3-.4.8-1.3 1.3-2.2 1.1l-.7 2.3h-1.6l-.7-2.3c-.9.2-1.8-.3-2.2-1.1-.7.5-1.7.4-2.3-.3-.8-.9-.7-2.3.3-3.1-.1-.9-.7-1.5-1.5-1.5-.4-1.2.1-2.4 1.1-3-.3-1.2.4-2.3 1.5-2.7-.2-1.3.8-2.3 2-2.5-.2-1.3.6-2.5 1.8-3.5z" />
      </svg>
    );
  }
  if (type === "birch") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ display: "block" }}>
        <path d="M12 2C7 6 5 10 5 14.5 5 18.5 8 21.5 11 22v2h2v-2c3-.5 6-3.5 6-7.5C19 10 17 6 12 2zm0 3.2c3 3.5 4.8 6.8 4.8 9.3 0 2.2-1.8 4.5-4.8 5.1V5.2z" />
      </svg>
    );
  }
  // Default: maple leaf
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ display: "block" }}>
      <path d="M12 2c.4 1.8.8 2.8 1.8 3.4 1-.8 2-1 2.8-.5-.3 1.2-.2 2.2.5 2.8 1.1-.3 2.1 0 2.7.9-.8.8-1 1.8-.4 2.8 1.1.2 1.8 1 1.8 2.1-.9.4-1.3 1.3-1 2.3-.9.1-1.6.7-1.9 1.6-1-.2-1.9.2-2.3 1.1-.6-.2-1.2 0-1.6.6l-.4 3.9h-1.6l-.4-3.9c-.4-.6-1-.8-1.6-.6-.4-.9-1.3-1.3-2.3-1.1-.3-.9-1-1.5-1.9-1.6.3-1-.1-1.9-1-2.3 0-1.1.7-1.9 1.8-2.1.6-1 .4-2-.4-2.8.6-.9 1.6-1.2 2.7-.9.7-.6.8-1.6.5-2.8.8-.5 1.8-.3 2.8.5 1-.6 1.4-1.6 1.8-3.4z" />
    </svg>
  );
}

const AUTUMN_LEAVES = [
  { type: "maple", color: "#C85A17", size: 24, left: 6,  delay: 0,   duration: 9 },   // burnt orange
  { type: "oak",   color: "#D48B28", size: 22, left: 18, delay: 1.3, duration: 11 },  // amber gold
  { type: "birch", color: "#9E381C", size: 20, left: 30, delay: 2.6, duration: 10 },  // deep rust
  { type: "maple", color: "#B5501B", size: 26, left: 42, delay: 3.9, duration: 12 },  // terracotta
  { type: "birch", color: "#E09C32", size: 19, left: 54, delay: 5.2, duration: 9 },   // harvest gold
  { type: "oak",   color: "#A2481A", size: 23, left: 66, delay: 6.5, duration: 11 },  // cinnamon
  { type: "maple", color: "#8B2E1E", size: 25, left: 78, delay: 7.8, duration: 10 },  // burgundy
  { type: "birch", color: "#C46822", size: 21, left: 90, delay: 9.1, duration: 12 },  // spiced amber
];

function ThanksgivingBanner({ setRoute }) {
  return (
    <>
      <div className="thanks-banner">
        <span className="thanks-banner-text">
          🦃 Happy Thanksgiving from LaDidiér — gather, give thanks &amp; read the new issue.
        </span>
        <button className="thanks-banner-link" onClick={() => setRoute("magazine")}>Read Issue 4 →</button>
      </div>
      <div className="thanks-leaves" aria-hidden="true">
        {AUTUMN_LEAVES.map((leaf, i) => (
          <span
            key={i}
            style={{
              left: `${leaf.left}%`,
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.duration}s`,
            }}
          >
            <AutumnLeaf type={leaf.type} color={leaf.color} size={leaf.size} />
          </span>
        ))}
      </div>
    </>
  );
}

function HomePage({ setRoute, heroVariant, printMode = false }) {
  const thanks = THANKSGIVING_ON && !printMode;
  return (
    <div className={`page-fade${thanks ? " thanksgiving" : ""}`}>
      {thanks && <ThanksgivingBanner setRoute={setRoute} />}
      {heroVariant === "manifest" && <HeroManifest setRoute={setRoute} />}
      {heroVariant === "split"    && <HeroSplit    setRoute={setRoute} />}
      {heroVariant === "index"    && <HeroIndex    setRoute={setRoute} />}

      <StoreMarquee />
      <TreasureIcon page="home" />
      <Manifesto printMode={printMode} />
      <FeaturedStories setRoute={setRoute} />
      <StoresPreview setRoute={setRoute} />
      {!printMode && <WelcomeGift />}
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
          <div className="eyebrow">The World, Curated. Your Place Within It.</div>
          <h2 className="display h2" style={{ margin: "20px 0 0", maxWidth: "16ch" }}>
            The magazine, at your <em style={{ fontStyle: "italic" }} className="gold-text">door</em> each season.
          </h2>
        </div>
        <div>
          <p className="lede" style={{ margin: 0 }}>
            Discover stories, places, objects, and ideas chosen with a discerning eye. Subscribe to
            receive each print edition, early access to store drops, and the editor's quiet letter
            on Sundays.
          </p>
          <div className="eyebrow" style={{ marginTop: 28 }}>Enter the World of LaDidiér</div>
          <div className="flex gap-16" style={{ marginTop: 16, flexWrap: "wrap" }}>
            <button className="btn solid" onClick={() => setRoute("subscribe")}>Discover your membership →</button>
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
    img: "/assets/eclat3/ola-brown.jpg",
    kicker: "Cover Story · The Conversation",
    title: "Building Africa's Healthcare Investment Ecosystem",
    dek: "Dr. Ola Brown of HealthCap Africa on what must be built for healthcare businesses to attract, absorb and recycle institutional capital.",
  },
  {
    img: "/assets/eclat3/kigali.jpg",
    kicker: "Travel & Culture",
    title: "Kigali: After Dark, Before Dawn",
    dek: "Five days eating, drinking and wandering through the African capital that has mastered the art of understatement.",
  },
  {
    img: "/assets/eclat3/emmys.jpg",
    kicker: "Arts & Entertainment",
    title: "A Cursed Island Conquered Hollywood",
    dek: "Inside the strange, glamorous and unexpectedly tender night when Widow's Bay turned the Emmys into its own victory party.",
  },
  {
    img: "/assets/eclat3/dangote-ipo.jpg",
    kicker: "Business · Capital Markets",
    title: "Dangote Opens Refinery to the Public",
    dek: "Africa's biggest IPO puts 4.1 billion shares at ₦525 each within reach of retail investors.",
  },
  {
    img: "/assets/eclat3/european-ride.jpg",
    kicker: "Travel, Culture & Mobility",
    title: "The New European Ride",
    dek: "From London's folding bicycles to Copenhagen's city bikes, two wheels have become part of how Europe dresses and lives.",
  },
  {
    img: "/assets/eclat3/made-in-africa.jpg",
    kicker: "Trade & Enterprise",
    title: "Made in Africa, Desired Everywhere",
    dek: "From Lagos to Bamako, African designers are creating furniture, fashion and objects for the global luxury conversation.",
  },
  {
    img: "/assets/eclat3/nyfw.jpg",
    kicker: "Fashion & Culture",
    title: "New York, Forever Becoming",
    dek: "At Fashion Week, the most compelling luxury was the courage to evolve.",
  },
  {
    img: "/assets/eclat3/wedding-story.jpg",
    kicker: "The Wedding Story",
    title: "The Things the Photographs Cannot Tell You",
    dek: "A Karachi wedding of mehndi, rose petals and family — and the quieter story beneath the spectacle.",
  },
  {
    img: "/assets/eclat3/health-partnership.jpg",
    kicker: "Health & Wellness",
    title: "Your Health Is a Partnership",
    dek: "Dr. Chima Alexander Oti on why the most important health decisions are made long before we enter a hospital.",
  },
];

/* Total pages behind /api/issue/page — must match content/eclat-vol2-pages/ */
const ISSUE_PAGE_COUNT = 100;

/* Spread pagination: page 1 (front cover) and the final page (back cover)
   show solo; everything between pairs up as a facing two-page spread
   (2+3, 4+5, ...), matching how the issue is actually laid out — several
   photos and headlines cut across the gutter between two facing pages, so
   showing them one at a time split the image in half. LAST_SPREAD is the
   index of the solo back-cover spread; spreads 1..LAST_SPREAD-1 are pairs. */
const LAST_SPREAD = ISSUE_PAGE_COUNT / 2;
function pagesForSpread(i) {
  if (i <= 0) return [1];
  if (i >= LAST_SPREAD) return [ISSUE_PAGE_COUNT];
  return [2 * i, 2 * i + 1];
}

function spreadForPage(p) {
  if (p <= 1) return 0;
  if (p >= ISSUE_PAGE_COUNT) return LAST_SPREAD;
  return Math.floor(p / 2);
}

/* Full-issue reader with Full Page toggle, Single-Page Zoom Tool, and
   floating/persistent navigation buttons so readers can comfortably zoom in
   on any page while all navigation and action buttons stay visible. */
function IssueReader({ onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [zoomedPage, setZoomedPage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullPage, setIsFullPage] = useState(false);
  const [imgUrls, setImgUrls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const cacheRef = useRef(new Map());

  const pages = pagesForSpread(spreadIndex);

  // Fetch page images with caching
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const neededPages = pages.filter((n) => !cacheRef.current.has(n));

    if (neededPages.length === 0) {
      setImgUrls(pages.map((n) => cacheRef.current.get(n)));
      setLoading(false);
    } else {
      Promise.all(
        neededPages.map((n) =>
          fetch(`/api/issue/page?n=${n}`, { credentials: "same-origin" }).then(async (res) => {
            if (!res.ok) {
              throw new Error(
                res.status === 403
                  ? "Your session has expired — please sign back in."
                  : "Could not load this page."
              );
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            cacheRef.current.set(n, url);
            return { n, url };
          })
        )
      )
        .then(() => {
          if (cancelled) return;
          setImgUrls(pages.map((n) => cacheRef.current.get(n)));
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [spreadIndex]);

  // Clean up object URLs on reader unmount
  useEffect(() => {
    return () => {
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
    };
  }, []);

  // Listen to browser fullscreen changes to keep full page toggle state in sync
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullPage(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Reset scroll position when page changes
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
      viewportRef.current.scrollLeft = 0;
    }
  }, [zoomedPage, spreadIndex]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (zoomedPage !== null) {
      if (zoomedPage > 1) {
        const prevPage = zoomedPage - 1;
        const targetSpread = spreadForPage(prevPage);
        if (targetSpread !== spreadIndex) {
          setSpreadIndex(targetSpread);
        }
        setZoomedPage(prevPage);
      }
    } else {
      setSpreadIndex((i) => Math.max(0, i - 1));
    }
  }, [zoomedPage, spreadIndex]);

  const handleNext = useCallback(() => {
    if (zoomedPage !== null) {
      if (zoomedPage < ISSUE_PAGE_COUNT) {
        const nextPage = zoomedPage + 1;
        const targetSpread = spreadForPage(nextPage);
        if (targetSpread !== spreadIndex) {
          setSpreadIndex(targetSpread);
        }
        setZoomedPage(nextPage);
      }
    } else {
      setSpreadIndex((i) => Math.min(LAST_SPREAD, i + 1));
    }
  }, [zoomedPage, spreadIndex]);

  const toggleFullPage = useCallback(() => {
    setIsFullPage((prev) => {
      const next = !prev;
      if (next) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    if (zoomedPage === null) {
      setZoomedPage(pages[0]);
      setZoomLevel(1.5);
    } else {
      setZoomLevel((z) => Math.min(2.5, +(z + 0.3).toFixed(1)));
    }
  }, [zoomedPage, pages]);

  const handleZoomOut = useCallback(() => {
    if (zoomedPage !== null) {
      if (zoomLevel > 1.2) {
        setZoomLevel((z) => Math.max(1, +(z - 0.3).toFixed(1)));
      } else {
        setZoomedPage(null);
        setZoomLevel(1);
      }
    }
  }, [zoomedPage, zoomLevel]);

  const handleToggleZoomMode = useCallback(() => {
    if (zoomedPage !== null) {
      setZoomedPage(null);
      setZoomLevel(1);
    } else {
      setZoomedPage(pages[0]);
      setZoomLevel(1.5);
    }
  }, [zoomedPage, pages]);

  const handlePageClick = useCallback((pageNum) => {
    if (zoomedPage === pageNum) {
      setZoomedPage(null);
      setZoomLevel(1);
    } else {
      setZoomedPage(pageNum);
      setZoomLevel(1.5);
    }
  }, [zoomedPage]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (isFullPage) {
          toggleFullPage();
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullPage();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleNext, handlePrev, handleZoomIn, handleZoomOut, toggleFullPage, isFullPage]);

  // Drag to pan handlers when zoomed
  const handleMouseDown = (e) => {
    if (zoomedPage === null && zoomLevel <= 1) return;
    if (e.target.closest("button") || e.target.closest("a")) return;
    setIsDragging(true);
    if (viewportRef.current) {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: viewportRef.current.scrollLeft,
        scrollTop: viewportRef.current.scrollTop,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !viewportRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    viewportRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
    viewportRef.current.scrollTop = dragRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isFirst = zoomedPage !== null ? zoomedPage <= 1 : spreadIndex <= 0;
  const isLast = zoomedPage !== null ? zoomedPage >= ISSUE_PAGE_COUNT : spreadIndex >= LAST_SPREAD;
  const pageLabel = pages.length === 2 ? `Pages ${pages[0]}–${pages[1]}` : `Page ${pages[0]}`;
  const isSpreadView = zoomedPage === null && pages.length === 2;
  const activeZoomIdx = zoomedPage !== null ? pages.indexOf(zoomedPage) : -1;

  return createPortal(
    <div
      className={`reader-backdrop ${isFullPage ? "reader-backdrop-fullscreen" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="ÉCLAT Issue 4 reader"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`reader-modal ${isFullPage ? "reader-modal-fullscreen" : ""} ${
          isSpreadView ? "reader-modal-spread" : ""
        }`}
      >
        {/* Top Header - Always visible */}
        <div className="reader-modal-header">
          <div className="reader-header-info">
            <span className="mono reader-header-title">ÉCLAT Issue 4</span>
            <span className="reader-badge">
              {zoomedPage !== null ? (
                <>
                  Page {zoomedPage} of {ISSUE_PAGE_COUNT}{" "}
                  <span className="reader-badge-accent">
                    (Zoomed {Math.round(zoomLevel * 100)}%)
                  </span>
                </>
              ) : (
                <>{pageLabel} of {ISSUE_PAGE_COUNT}</>
              )}
            </span>
          </div>

          <div className="reader-header-actions">
            {/* Zoom Tool Group */}
            <div className="reader-zoom-group" role="toolbar" aria-label="Zoom controls">
              <button
                type="button"
                className="reader-btn-icon"
                onClick={handleZoomOut}
                disabled={zoomedPage === null && zoomLevel <= 1}
                title="Zoom out (-)"
                aria-label="Zoom out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>

              <button
                type="button"
                className={`reader-btn-zoom-level ${zoomedPage !== null ? "active" : ""}`}
                onClick={handleToggleZoomMode}
                title={zoomedPage !== null ? "Click to reset zoom" : "Click to zoom into page"}
              >
                {zoomedPage !== null ? `${Math.round(zoomLevel * 100)}%` : "Fit"}
              </button>

              <button
                type="button"
                className="reader-btn-icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                title="Zoom in (+)"
                aria-label="Zoom in"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>

              <button
                type="button"
                className={`reader-btn-mode ${zoomedPage !== null ? "active" : ""}`}
                onClick={handleToggleZoomMode}
                title={zoomedPage !== null ? "Switch to 2-page spread" : "Zoom on one page"}
              >
                {zoomedPage !== null ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <span className="reader-btn-text">Spread</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>
                    </svg>
                    <span className="reader-btn-text">Zoom Page</span>
                  </>
                )}
              </button>
            </div>

            <div className="reader-header-divider" />

            {/* Full page toggle button */}
            <button
              type="button"
              className={`reader-btn-icon ${isFullPage ? "active" : ""}`}
              onClick={toggleFullPage}
              title={isFullPage ? "Exit full page (F)" : "Full page toggle (F)"}
              aria-label={isFullPage ? "Exit full page" : "Full page toggle"}
            >
              {isFullPage ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h6V4M4 4l6 6M20 10h-6V4M20 4l-6 6M4 14h6v6M4 20l6-6M20 14h-6v6M20 20l-6-6"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
            </button>

            {/* Close button */}
            <button type="button" className="reader-close" onClick={onClose} aria-label="Close reader" title="Close (Esc)">×</button>
          </div>
        </div>

        {/* Viewport container holding page image & floating navigating buttons */}
        <div className="reader-viewport-container">
          {/* Floating Navigating Button (Left / Prev) */}
          <button
            type="button"
            className="reader-nav-float reader-nav-prev"
            onClick={handlePrev}
            disabled={isFirst}
            aria-label={zoomedPage !== null ? `Previous page (Page ${zoomedPage - 1})` : "Previous spread"}
            title={zoomedPage !== null ? `Previous page (Page ${zoomedPage - 1})` : "Previous spread"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Floating Navigating Button (Right / Next) */}
          <button
            type="button"
            className="reader-nav-float reader-nav-next"
            onClick={handleNext}
            disabled={isLast}
            aria-label={zoomedPage !== null ? `Next page (Page ${zoomedPage + 1})` : "Next spread"}
            title={zoomedPage !== null ? `Next page (Page ${zoomedPage + 1})` : "Next spread"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Scrollable / pannable Page area */}
          <div
            ref={viewportRef}
            className={`reader-page ${zoomedPage !== null ? "reader-page-zoomed" : ""} ${isDragging ? "is-dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {loading && <div className="mono muted reader-status-msg">Loading…</div>}
            {!loading && error && <div className="mono muted reader-status-msg">{error}</div>}

            {!loading && !error && (
              zoomedPage !== null ? (
                // Single Page Zoom Mode
                activeZoomIdx !== -1 && imgUrls[activeZoomIdx] ? (
                  <div
                    className="reader-single-page-wrap"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "center top",
                      transition: isDragging ? "none" : "transform 0.2s ease-out",
                    }}
                  >
                    <img
                      src={imgUrls[activeZoomIdx]}
                      alt={`ÉCLAT Issue 4, page ${zoomedPage}`}
                      className="reader-img-zoomed"
                      draggable={false}
                      onDoubleClick={() => {
                        if (zoomLevel > 1.2) {
                          setZoomLevel(1);
                        } else {
                          setZoomLevel(1.8);
                        }
                      }}
                      title="Double-click to toggle zoom · Drag to pan"
                    />
                  </div>
                ) : (
                  <div className="mono muted reader-status-msg">Loading page…</div>
                )
              ) : (
                // Spread Mode (1 or 2 facing pages)
                imgUrls.map((url, idx) => (
                  <div
                    key={pages[idx]}
                    className="reader-spread-page-wrap"
                    onClick={() => handlePageClick(pages[idx])}
                    title={`Click to zoom on Page ${pages[idx]}`}
                  >
                    <img
                      src={url}
                      alt={`ÉCLAT Issue 4, page ${pages[idx]}`}
                      className="reader-img-spread"
                      draggable={false}
                    />
                    <div className="reader-zoom-overlay-hint">
                      <span>Click to zoom</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Bottom Nav Bar - Always visible */}
        <div className="reader-nav">
          <button
            type="button"
            className="btn ghost reader-nav-btn"
            onClick={handlePrev}
            disabled={isFirst}
          >
            ← Prev {zoomedPage !== null ? "Page" : "Spread"}
          </button>

          <div className="reader-nav-center mono">
            {zoomedPage !== null ? (
              <span>
                Page <strong>{zoomedPage}</strong> of {ISSUE_PAGE_COUNT}
                <button
                  type="button"
                  className="reader-text-link"
                  onClick={() => {
                    setZoomedPage(null);
                    setZoomLevel(1);
                  }}
                >
                  · View spread
                </button>
              </span>
            ) : (
              <span>
                {pageLabel} of {ISSUE_PAGE_COUNT}
                <span className="reader-hint"> · Click page to zoom</span>
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn ghost reader-nav-btn"
            onClick={handleNext}
            disabled={isLast}
          >
            Next {zoomedPage !== null ? "Page" : "Spread"} →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MagazinePage({ setRoute, isMember, readerOpen: externalReaderOpen = false, onCloseReader }) {
  const [internalReaderOpen, setInternalReaderOpen] = useState(false);
  const isReaderActive = externalReaderOpen || internalReaderOpen;

  const handleClose = () => {
    setInternalReaderOpen(false);
    if (onCloseReader) {
      onCloseReader();
    }
  };

  const handleOpen = () => {
    setInternalReaderOpen(true);
  };

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
        <div style={{ position: "relative" }} className="float-slow">
          <div
            className="ph photo cover framed tilt"
            style={{ aspectRatio: "1600/2263", "--bg-image": `url(/assets/eclat-vol2-cover.jpg)` }}
            data-tag="Issue 4"
            data-label="THE COVER"
          ></div>
        </div>
        <div>
          <div className="eyebrow">New Release · Issue 4</div>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 48px)", margin: "16px 0 24px", letterSpacing: "-.02em", fontWeight: 300 }}>
            The Frequency of Success: Chris Ubosi — The man behind Beat 99.9 FM on vision,
            values, family and the future.
          </h2>
          <p className="lede">
            Just released — Issue 4, December 2026. Inside: why African money doesn't become
            capital, Nollywood's new wave, and escapes to Cape Town, Lagos &amp; Bruges.
          </p>
          {isMember ? (
            <>
              <p className="mono muted" style={{ marginTop: 20, fontSize: 12, letterSpacing: ".02em" }}>
                You're a member — the full issue is yours to read here, or take home as a PDF.
              </p>
              <div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
                <button className="btn solid" onClick={handleOpen}>Read the full issue →</button>
                <a className="btn ghost" href="/api/issue/pdf" download="ECLAT-Issue-4.pdf">Download PDF</a>
              </div>
            </>
          ) : (
            <>
              <p className="mono muted" style={{ marginTop: 20, fontSize: 12, letterSpacing: ".02em" }}>
                Want to turn every page? Our interactive reading platform is launching soon.
              </p>
              <div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
                <button className="btn solid" onClick={() => setRoute("subscribe")}>Order this issue →</button>
              </div>
            </>
          )}
        </div>
      </section>

      {isReaderActive && <IssueReader onClose={handleClose} />}

      {/* Highlights grid */}
      <section className="section container">
        <div className="eyebrow" style={{ marginBottom: 14 }}>Inside Volume 2</div>
        <h2 className="display h2" style={{ margin: "0 0 40px", maxWidth: "20ch" }}>
          Highlights from this issue.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
          {ISSUE_HIGHLIGHTS.map((h) => (
            <article key={h.title} className="art-card">
              <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${h.img})` }} data-tag={h.kicker} data-label="ÉCLAT ISSUE 3"></div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{h.kicker}</div>
                <h3 className="art-title">{h.title}</h3>
                <div className="art-meta" style={{ marginTop: 10 }}>{h.dek}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

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
          This issue is our small case for the practice. Linger. The door is open.
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

// The 4 sellable plans, in the fixed order the page presents them.
const SUBSCRIBE_PLANS = [
  { key: "online_monthly", product: "online", interval: "monthly", tag: "Plan 1", name: "ÉcLAT Online", note: "One month, in full digital." },
  { key: "hardcopy_monthly", product: "hardcopy", interval: "monthly", tag: "Plan 2", name: "ÉcLAT Hard Copy", note: "One month, print at your door.", badge: "Limited · 250" },
  { key: "online_yearly", product: "online", interval: "yearly", tag: "Plan 3", name: "ÉcLAT Online", note: "A full year, in full digital.", badge: "Most chosen", featured: true },
  { key: "hardcopy_yearly", product: "hardcopy", interval: "yearly", tag: "Plan 4", name: "ÉcLAT Hard Copy", note: "A full year, print at your door.", badge: "Limited · 250" },
];

const SUBSCRIBE_PERKS = {
  online: ["Every issue, the full archive", "Early store access (48h)", "Sunday letter from the editor", "Members-only store events", "10% house credit on first order"],
  hardcopy: ["Everything in Online", "Hand-numbered print edition", "Annual atelier visit (one house)", "Direct line to the concierge", "Name in the back of the magazine"],
};

function SubscribePage({ setRoute, isSubscribed, setIsSubscribed, user, setUser, authReady, isMember, activePlan }) {
  // Tracks which specific plan's checkout is in flight (its SUBSCRIBE_PLANS
  // key), so only that one card's button reads "Redirecting..." — not a
  // shared "which product" selection, since each of the 4 cards below now
  // acts on its own rather than through a shared billing-interval toggle.
  const [loadingKey, setLoadingKey] = useState(null);
  const [prices, setPrices] = useState(null);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {
      console.error("Could not sign out:", err);
    } finally {
      // A full page load — not setUser(null) — is deliberate: it remounts App
      // against the storage cleared below, which is what actually drops
      // isMember, not just the user object. It keeps the visitor on the page
      // they were on.
      clearMemberLocalState();
      window.location.href = "/#subscribe";
    }
  };

  // Existing members change plans, update payment methods, or cancel through
  // Stripe's own billing portal rather than a second trip through Checkout —
  // that's what keeps an "upgrade" from silently creating a duplicate
  // subscription. Same call AccountPage's "Manage billing" button makes.
  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/account/portal", { credentials: "same-origin" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not open billing portal.");
      }
    } catch (err) {
      alert("Error opening billing portal.");
    }
  };

  // Only resolvable for the account-linked membership path (see app.jsx) — null
  // for a signed-out visitor and for a legacy-cookie-only member, in which case
  // both paid cards fall back to a plain "Manage plan" CTA below.
  const currentProduct = activePlan?.product ?? null;

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

  const priceLabel = (product, interval) => {
    const p = prices?.[product]?.[interval];
    return p ? money(p.amount, p.currency) : "—";
  };

  const perLabel = (interval) => (interval === "yearly" ? "/year" : "/month");

  // Store the user's intent in sessionStorage so an abandoned checkout attempt
  // dies with the tab rather than persisting to future visits.
  const startLogin = (product, interval) => {
    sessionStorage.setItem(PENDING_PLAN, JSON.stringify({ product, billing: interval }));
    window.location.href = "/api/auth/google?returnTo=subscribe";
  };

  const startCheckout = async (product, interval, key) => {
    setLoadingKey(key);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The server maps this key to a price id — the browser never names a price.
        // interval is taken as an argument rather than read from state so that
        // the post-login resume effect can set billing and launch checkout in
        // the same render tick without stale state issues.
        body: JSON.stringify({ planType: `${product}_${interval}` }),
      });

      if (response.status === 401) {
        startLogin(product, interval);
        return;
      }

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
      setLoadingKey(null);
    }
  };

  const handleSelectPlan = async (product, interval, key) => {
    if (!user) {
      startLogin(product, interval);
      return;
    }

    await startCheckout(product, interval, key);
  };

  // Resume checkout if returning from Google sign-in with a pending plan intent.
  useEffect(() => {
    if (!authReady || !user) return;

    const raw = sessionStorage.getItem(PENDING_PLAN);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_PLAN);

    try {
      const { product, billing: savedBilling } = JSON.parse(raw);
      if (product && (product === "online" || product === "hardcopy")) {
        const targetInterval = savedBilling === "monthly" ? "monthly" : "yearly";
        startCheckout(product, targetInterval, `${product}_${targetInterval}`);
      }
    } catch (err) {
      console.error("Could not resume pending plan checkout:", err);
    }
  }, [authReady, user]);

  return (
    <div className="page-fade">
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Membership</div>
          <h1 className="display h2" style={{ margin: 0 }}>
            Belonging<br/>
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>is by design</em>.
          </h1>
        </div>
        <div>
          <p className="lede" style={{ margin: 0 }}>
            Four plans, however you want the magazine: online or in hand, one month or the full
            year. Every membership brings early access to store drops and the editor's quiet
            letter on Sundays.
          </p>
        </div>
      </header>

      <section className="section container">
        {/* Sign-in / sign-out row. Renders only when auth state is resolved. */}
        {authReady && (
          <div
            className="flex"
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {user ? (
              <>
                <span
                  className="muted"
                  title={user.email}
                  style={{
                    fontSize: 13,
                    maxWidth: 320,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Signed in as {user.email}
                </span>
                <button className="btn ghost" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <span className="muted" style={{ fontSize: 13 }}>
                  Members sign in with Google. Signing in adds you to our email list.
                </span>
                <button
                  className="btn ghost"
                  onClick={() => {
                    window.location.href = "/api/auth/google?returnTo=subscribe";
                  }}
                >
                  Sign in with Google
                </button>
              </>
            )}
          </div>
        )}

        {/* Already a member — show what's active instead of a sign-up pitch.
            The cards below stay visible so an existing member can still see
            what a different plan costs, but their CTAs are relabeled further
            down (see currentProduct) so nothing here reads as "become a
            member" again.
            Gated on activePlan, not isMember: isMember is also true for a
            legacy-cookie-only member (pre-account-link Checkout Session) who
            has no linked Stripe customer, and the Manage billing button below
            calls /api/account/portal, which 400s "No billing history" for
            exactly that case. activePlan is null unless the account path
            (which requires a stripe_customer_id) is what actually granted
            membership, so it's the correct gate for anything billing-portal-bound. */}
        {activePlan && user && (
          <div
            className="plan-card"
            style={{ maxWidth: 640, margin: "0 auto 40px", textAlign: "center" }}
          >
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your Membership</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 300, marginBottom: 4 }}>
              {currentProduct
                ? `${currentProduct === "hardcopy" ? "ÉcLAT Hard Copy" : "ÉcLAT Online"} — ${activePlan.interval === "monthly" ? "Monthly" : "Yearly"}`
                : "Active membership"}
            </div>
            {activePlan?.cancelAtPeriodEnd && (
              <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                Set to end at the close of the current billing period.
              </p>
            )}
            <button
              className="btn solid"
              onClick={handleManageBilling}
              style={{ marginTop: 12, background: "var(--gold)", borderColor: "var(--gold)", color: "var(--noir)" }}
            >
              Manage billing →
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {SUBSCRIBE_PLANS.map((p) => {
            const isCurrent = !!(activePlan && user && currentProduct === p.product && activePlan.interval === p.interval);
            return (
              <div key={p.key} className={`plan-card${p.featured ? " featured" : ""}`}>
                <div className="flex between">
                  <div className="eyebrow" style={p.featured ? { color: "color-mix(in srgb, var(--bg) 65%, transparent)" } : {}}>{p.tag}</div>
                  {p.badge && <div className="eyebrow" style={p.featured ? { color: "var(--gold)" } : {}}>{p.badge}</div>}
                </div>
                <div>
                  <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>{p.name}</div>
                  <div className={p.featured ? undefined : "muted"} style={{ fontSize: 13, marginTop: 4, opacity: p.featured ? .7 : 1 }}>{p.note}</div>
                </div>
                <div className="price">
                  {priceLabel(p.product, p.interval)}
                  <span style={{ fontSize: 16, color: p.featured ? undefined : "var(--mute)", opacity: p.featured ? .55 : 1, marginLeft: 6 }}>
                    {perLabel(p.interval)}
                  </span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 14 }}>
                  {SUBSCRIBE_PERKS[p.product].map((perk) => <li key={perk}>· {perk}</li>)}
                </ul>
                {activePlan && user ? (
                  isCurrent ? (
                    <button
                      className={p.featured ? "btn solid" : "btn"}
                      disabled
                      style={{ marginTop: "auto", opacity: p.featured ? .75 : .6, ...(p.featured ? { background: "var(--gold)", borderColor: "var(--gold)", color: "var(--noir)" } : {}) }}
                    >
                      Current plan ✓
                    </button>
                  ) : (
                    <button
                      className={p.featured ? "btn solid" : "btn"}
                      onClick={handleManageBilling}
                      style={{ marginTop: "auto", ...(p.featured ? { background: "var(--gold)", borderColor: "var(--gold)", color: "var(--noir)" } : {}) }}
                    >
                      Switch to this plan →
                    </button>
                  )
                ) : (
                  <button
                    className={p.featured ? "btn solid" : "btn"}
                    disabled={loadingKey === p.key}
                    onClick={() => handleSelectPlan(p.product, p.interval, p.key)}
                    style={{ marginTop: "auto", ...(p.featured ? { background: "var(--gold)", borderColor: "var(--gold)", color: "var(--noir)" } : {}) }}
                  >
                    {loadingKey === p.key ? "Redirecting..." : "Become a member"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 120 }}>
          <div className="eyebrow" style={{ marginBottom: 32 }}>The Fine Print, in Plain Words</div>
          <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            {[
              ["Is the full issue behind the paywall now?", "Yes — the in-site reader and PDF download are for members. The cover story and Editor's Letter stay visible to everyone; the rest of Volume 2 opens with a plan."],
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

/* ═══════════════════════════════════════════════════════════
   ACCOUNT — dashboard
   ═══════════════════════════════════════════════════════════ */

function AccountPage({ setRoute, user, isMember, activePlan }) {
  const [address, setAddress] = useState({ line1: "", city: "", state: "", postal_code: "", country: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/address", { credentials: "same-origin" })
      .then(r => r.json())
      .then(d => { if (!cancelled && d.address) setAddress(d.address); })
      .catch(e => console.error("Could not fetch address", e));
    return () => { cancelled = true; };
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(address)
      });
      if (res.ok) setMsg("Address saved.");
      else setMsg("Error saving address.");
    } catch {
      setMsg("Error saving address.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/account/portal", { credentials: "same-origin" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not open billing portal.");
      }
    } catch (e) {
      alert("Error opening billing portal.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch (e) {
      console.error(e);
    }
    clearMemberLocalState();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="page-fade container" style={{ paddingTop: 120, minHeight: "60vh" }}>
        <div className="eyebrow">Account</div>
        <p style={{ marginTop: 20 }}>Please sign in to view your account.</p>
        <button className="btn" style={{ marginTop: 20 }} onClick={() => setRoute("subscribe")}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="page-fade account-dash" style={{ padding: "120px var(--gutter) 80px", maxWidth: 980, margin: "0 auto", minHeight: "75vh" }}>
      <header className="page-head" style={{ padding: 0, marginBottom: 64, border: "none" }}>
        <h1 className="display h2" style={{ margin: 0 }}>Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Account</em>.</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64 }}>
        <div className="col gap-40">
          <section className="account-section">
            <div className="eyebrow" style={{ marginBottom: 24 }}>Profile</div>
            <div className="flex" style={{ gap: 20, alignItems: "center" }}>
              {user.picture && <img src={user.picture} alt="Avatar" className="account-avatar" style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid var(--line)" }} />}
              <div>
                <div className="display" style={{ fontSize: 24 }}>{user.name || "Member"}</div>
                <div className="mono muted" style={{ fontSize: 13, marginTop: 4 }}>{user.email}</div>
              </div>
            </div>
            <button className="btn ghost" onClick={handleSignOut} style={{ marginTop: 24 }}>Sign out</button>
          </section>

          <section className="account-section">
            <div className="eyebrow" style={{ marginBottom: 24 }}>Membership & Billing</div>
            <div style={{ fontSize: 18, marginBottom: 8, color: "var(--ink)" }}>
              {isMember ? "Status: Active (Digital & Print)" : "Status: No Active Membership"}
            </div>
            <p className="muted" style={{ fontSize: 14, marginBottom: 24, maxWidth: "34ch", lineHeight: 1.5 }}>
              Manage your subscription, update your payment methods, or view your invoice history through our secure billing portal.
            </p>
            {/* activePlan is only set by the account-linked path (has a Stripe
                customer id). isMember alone can also come from a legacy
                checkout-session cookie with no linked customer, for which
                /api/account/portal has nothing to open — hence the fallback
                below instead of a button that always fails for that case. */}
            {activePlan ? (
              <button className="btn" onClick={handleManageBilling}>Manage billing →</button>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                {isMember
                  ? "Billing management isn't available for this membership yet."
                  : "Subscribe to a plan to manage billing here."}
              </p>
            )}
          </section>
        </div>

        <section className="account-section">
          <div className="eyebrow" style={{ marginBottom: 24 }}>Delivery Address</div>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            Where should we send your seasonal copies of ÉcLAT? Updating this address does not affect past orders.
          </p>
          <form onSubmit={handleSaveAddress} className="col gap-16">
            <input className="account-input" placeholder="Address Line 1" value={address.line1 || ""} onChange={e => setAddress({...address, line1: e.target.value})} required />
            <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
              <input className="account-input" placeholder="City" style={{ flex: "2 1 120px" }} value={address.city || ""} onChange={e => setAddress({...address, city: e.target.value})} required />
              <input className="account-input" placeholder="State/Province" style={{ flex: "1 1 80px" }} value={address.state || ""} onChange={e => setAddress({...address, state: e.target.value})} />
            </div>
            <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
              <input className="account-input" placeholder="Postal Code" style={{ flex: "1 1 80px" }} value={address.postal_code || ""} onChange={e => setAddress({...address, postal_code: e.target.value})} required />
              <input className="account-input" placeholder="Country" style={{ flex: "2 1 120px" }} value={address.country || ""} onChange={e => setAddress({...address, country: e.target.value})} required />
            </div>
            <div className="flex gap-16 center" style={{ marginTop: 8 }}>
              <button type="submit" className="btn solid" disabled={loading}>{loading ? "Saving..." : "Save address"}</button>
              {msg && <span className="mono" style={{ fontSize: 12, color: "var(--gold)" }}>{msg}</span>}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export {
  HomePage, MagazinePage, ArticlePage, StoresPage, SubscribePage, AboutPage, SubscribeBanner, AccountPage,
};
