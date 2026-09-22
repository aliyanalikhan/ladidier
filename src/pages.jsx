/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Page components
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
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
        <div className="ph photo cover framed tilt" style={{ aspectRatio: "1600/2263", "--bg-image": `url(/assets/eclat-vol2-cover.jpg)` }} data-tag="Vol. 2 · Sep 2026" data-label="THE COVER"></div>
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
  const featured = ISSUE_HIGHLIGHTS.slice(0, 3);
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
          <article className="art-card lift">
            <div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image": `url(${featured[0].img})` }} data-tag={featured[0].kicker} data-label="ÉCLAT VOL. 2"></div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{featured[0].kicker}</div>
              <h3 className="art-title" style={{ fontSize: "clamp(28px, 2.4vw, 40px)" }}>{featured[0].title}</h3>
              <div className="art-meta" style={{ marginTop: 16 }}>{featured[0].dek}</div>
            </div>
          </article>
        </Reveal>

        <div className="col gap-32">
          {featured.slice(1, 3).map((s, i) => (
            <Reveal key={s.title} delay={(i+1)*80}>
              <article className="art-card lift" style={{ gridTemplateColumns: "1fr", display: "grid", gap: 14 }}>
                <div className="ph photo" style={{ aspectRatio: "16/10", "--bg-image": `url(${s.img})` }} data-tag={s.kicker} data-label="ÉCLAT VOL. 2"></div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{s.kicker}</div>
                  <h3 className="art-title">{s.title}</h3>
                  <div className="art-meta" style={{ marginTop: 10 }}>{s.dek}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="col gap-24">
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mute)", paddingBottom: 12, borderBottom: "1px solid var(--line-strong)" }}>
            Also in the issue
          </div>
          {ISSUE_HIGHLIGHTS.slice(3, 6).map((s, i) => (
            <div key={s.title} style={{ paddingBlock: 14, borderBottom: "1px solid var(--line)" }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{s.kicker}</div>
              <div className="art-title" style={{ fontSize: 18 }}>{s.title}</div>
              <div className="art-meta" style={{ marginTop: 6 }}>{s.dek}</div>
            </div>
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

function HomePage({ setRoute, heroVariant, printMode = false }) {
  return (
    <div className="page-fade">
      {heroVariant === "manifest" && <HeroManifest setRoute={setRoute} />}
      {heroVariant === "split"    && <HeroSplit    setRoute={setRoute} />}
      {heroVariant === "index"    && <HeroIndex    setRoute={setRoute} />}

      <StoreMarquee />
      <TreasureIcon page="home" />
      <Manifesto printMode={printMode} />
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
  {
    img: "/assets/eclat/highlight-conversation.jpg",
    kicker: "Behind the Issue · In Conversation",
    title: "Building Vol. 2: A Conversation",
    dek: "An unhurried conversation on what it took to bring this issue's vision, voice, and values to the page.",
  },
  {
    img: "/assets/eclat/manifesto-one-love.png",
    kicker: "Vision · Voice · Values",
    title: "One Planet. One Human Race. One Love.",
    dek: "The manifesto behind ÉCLAT — a reminder, from as far away as the moon, of what actually connects us.",
  },
  {
    img: "/assets/eclat/bridal-collection.png",
    kicker: "Style · Bridal",
    title: "The Bridal Collection: Timeless Beauty",
    dek: "Crystal tiaras, filigree necklaces, and the quiet brilliance of jewelry made for a forever moment.",
  },
  {
    img: "/assets/eclat/sleep-wellness.png",
    kicker: "Wellness · Living Well",
    title: "Why Good Sleep Matters As We Age",
    dek: "Quality rest supports memory, mood, and heart health — the case for prioritizing sleep at every stage of life.",
  },
];

/* Total pages behind /api/issue/page — must match content/eclat-vol2-pages/ */
const ISSUE_PAGE_COUNT = 62;

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

/* Full-issue reader, member-gated. Fetches the 1-2 page images for the
   current spread from /api/issue/page (cookie-authenticated) rather than
   shipping all 62 pages up front. */
function IssueReader({ onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [imgUrls, setImgUrls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const pages = pagesForSpread(spreadIndex);

  useEffect(() => {
    let cancelled = false;
    let objectUrls = [];
    setLoading(true);
    setError(null);
    setImgUrls([]);
    Promise.all(
      pages.map((n) =>
        fetch(`/api/issue/page?n=${n}`, { credentials: "same-origin" }).then(async (res) => {
          if (!res.ok) throw new Error(res.status === 403 ? "Your session has expired — please sign back in." : "Could not load this page.");
          return res.blob();
        })
      )
    )
      .then((blobs) => {
        if (cancelled) return;
        objectUrls = blobs.map((b) => URL.createObjectURL(b));
        setImgUrls(objectUrls);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // pagesForSpread(spreadIndex) is re-derived above on every render from
    // spreadIndex alone, so depending on spreadIndex here is equivalent to
    // depending on `pages` without recreating the array on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setSpreadIndex((i) => Math.min(LAST_SPREAD, i + 1));
      if (e.key === "ArrowLeft") setSpreadIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pageLabel = pages.length === 2 ? `Pages ${pages[0]}–${pages[1]}` : `Page ${pages[0]}`;

  // Portaled straight to document.body: MagazinePage's root carries the
  // site-wide .page-fade entry animation, which animates `transform` and so
  // establishes a containing block for any `position: fixed` descendant —
  // without the portal this backdrop renders pinned to that ancestor's box
  // instead of the viewport (it visually lands mid-document instead of
  // centered on screen). Mounting outside that subtree sidesteps it, the same
  // reason `.mobile-overlay` is mounted at the app root rather than inside a page.
  return createPortal(
    <div
      className="reader-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="ÉCLAT Vol. 2 reader"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`reader-modal${pages.length === 2 ? " reader-modal-spread" : ""}`}>
        <div className="reader-modal-header">
          <span className="mono" style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mute)" }}>
            ÉCLAT Vol. 2 · {pageLabel} / {ISSUE_PAGE_COUNT}
          </span>
          <button className="reader-close" onClick={onClose} aria-label="Close reader">×</button>
        </div>
        <div className="reader-page">
          {loading && <div className="mono muted">Loading…</div>}
          {!loading && error && <div className="mono muted">{error}</div>}
          {!loading && !error && imgUrls.map((url, idx) => (
            <img key={pages[idx]} src={url} alt={`ÉCLAT Vol. 2, page ${pages[idx]}`} />
          ))}
        </div>
        <div className="reader-nav">
          <button className="btn ghost" onClick={() => setSpreadIndex((i) => Math.max(0, i - 1))} disabled={spreadIndex === 0}>← Prev</button>
          <button className="btn ghost" onClick={() => setSpreadIndex((i) => Math.min(LAST_SPREAD, i + 1))} disabled={spreadIndex === LAST_SPREAD}>Next →</button>
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
            data-tag="Vol. 2 · Sep 2026"
            data-label="THE COVER"
          ></div>
        </div>
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
          {isMember ? (
            <>
              <p className="mono muted" style={{ marginTop: 20, fontSize: 12, letterSpacing: ".02em" }}>
                You're a member — the full issue is yours to read here, or take home as a PDF.
              </p>
              <div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
                <button className="btn solid" onClick={handleOpen}>Read the full issue →</button>
                <a className="btn ghost" href="/api/issue/pdf" download="ECLAT-Vol2.pdf">Download PDF</a>
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
                  Members sign in with Google.
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
