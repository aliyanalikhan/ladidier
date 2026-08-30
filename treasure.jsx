/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Mall treasure hunt
   ───────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef } = React;

const TREASURE_PROGRESS_KEY = "ladidier_treasure_progress";
const TREASURE_COMPLETED_KEY = "ladidier_treasure_completed";
const TREASURE_CODE = "HOUSE20"; // D-06, static, display-only
const TREASURE_EVENT = "ladidier:treasure-found";

function readProgress() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(TREASURE_PROGRESS_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function isHuntComplete() {
  return localStorage.getItem(TREASURE_COMPLETED_KEY) === "true";
}

function markIconFound(iconId) {
  const current = readProgress();
  const found = current.includes(iconId) ? current : [...current, iconId];
  sessionStorage.setItem(TREASURE_PROGRESS_KEY, JSON.stringify(found));
  const complete = found.length === TREASURE_ICONS.length;
  if (complete) {
    localStorage.setItem(TREASURE_COMPLETED_KEY, "true");
  }
  window.dispatchEvent(new CustomEvent(TREASURE_EVENT, { detail: { found, complete } }));
  return found;
}

function useTreasureProgress() {
  const [found, setFound] = useState(readProgress);
  useEffect(() => {
    const handler = (e) => setFound(e.detail.found);
    window.addEventListener(TREASURE_EVENT, handler);
    return () => window.removeEventListener(TREASURE_EVENT, handler);
  }, []);
  return found;
}

/* Shopping bag — home page icon. Blush fill, gold strap. */
function BagIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M5 8h14l-1.2 12.4a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" fill="var(--blush)" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Gift box — stores page icon. Sage fill, gold ribbon and bow. */
function GiftBoxIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 9h16v11H4Z" fill="var(--sage)" />
      <path d="M4 9h16v3H4Z" fill="var(--sage)" />
      <path d="M12 9v11M4 9h16" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
      <path d="M12 9c-1-3-4.5-4.5-6-2.5S8 9 12 9Zm0 0c1-3 4.5-4.5 6-2.5S16 9 12 9Z" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Price tag — magazine page icon. Sky fill, gold hole and string. */
function TagIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M11 4 20 13a1.5 1.5 0 0 1 0 2.1l-4.9 4.9a1.5 1.5 0 0 1-2.1 0L4 11V4h7Z" fill="var(--sky)" />
      <circle cx="8" cy="8" r="1.4" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
      <path d="M5.5 4.5 4 6" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Ribbon / bow — article page icon. Lilac fill, gold knot and tails. */
function BowIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 12c-2-4-8-4-8 0s6 4 8 0Zm0 0c2-4 8-4 8 0s-6 4-8 0Z" fill="var(--lilac)" />
      <circle cx="12" cy="12" r="1.6" fill="var(--lilac)" stroke="var(--gold)" strokeWidth="1.5" />
      <path d="M9 14c-1 2-1 4 0 6M15 14c1 2 1 4 0 6" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const TREASURE_ZONES = [
  { id: "left",   style: { top: 4,  left: "6%" } },
  { id: "center", style: { top: 12, left: "calc(50% - 32px)" } },
  { id: "right",  style: { top: 4,  right: "6%" } },
];

const TREASURE_ICONS = [
  { id: "bag", page: "home",     label: "the shopping bag", Glyph: BagIcon,     zones: TREASURE_ZONES },
  { id: "box", page: "stores",   label: "the gift box",     Glyph: GiftBoxIcon, zones: TREASURE_ZONES },
  { id: "tag", page: "magazine", label: "the price tag",    Glyph: TagIcon,     zones: TREASURE_ZONES },
  { id: "bow", page: "article",  label: "the ribbon",       Glyph: BowIcon,     zones: TREASURE_ZONES },
];

function TreasureIcon({ page }) {
  const entry = TREASURE_ICONS.find((i) => i.page === page);
  if (!entry) return null;

  const found = useTreasureProgress();
  const completed = isHuntComplete();
  const [zone] = useState(() => entry.zones[Math.floor(Math.random() * entry.zones.length)]);

  if (completed || found.includes(entry.id)) return null;

  const Glyph = entry.Glyph;

  return (
    <div className="treasure-layer">
      <button
        type="button"
        className="treasure-icon"
        style={zone.style}
        aria-label={`A house treasure — ${entry.label}`}
        onClick={() => markIconFound(entry.id)}
      >
        <Glyph size={40} />
      </button>
    </div>
  );
}

function TreasureProgress() {
  const found = useTreasureProgress();
  if (found.length === 0) return null;

  return (
    <div
      className="treasure-progress"
      role="status"
      aria-label={`Treasure hunt progress: ${found.length} of 4 found`}
    >
      {TREASURE_ICONS.map((i) => (
        <span
          key={i.id}
          className={`treasure-dot${found.includes(i.id) ? " is-found" : ""}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TreasureHuntComplete({ setRoute }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.detail && e.detail.complete) setOpen(true); };
    window.addEventListener(TREASURE_EVENT, handler);
    return () => window.removeEventListener(TREASURE_EVENT, handler);
  }, []);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const isSubscribed = localStorage.getItem("ladidier_subscribed") === "true";

  if (!open) return null;

  return (
    <div ref={panelRef} id="treasure-reveal" className="paywall-gate treasure-reveal">
      <div className="eyebrow">The House Treasure</div>
      <h3>You found the treasure!</h3>
      <p className="treasure-lead">Your reward, for finding it all:</p>
      <span className="treasure-code gold-text mono">{TREASURE_CODE}</span>
      <p>Present this at any Ladidiér house — online or in person.</p>
      <div className="treasure-actions">
        {!isSubscribed && (
          <button
            type="button"
            className="btn solid"
            onClick={() => { close(); setRoute("subscribe"); }}
          >
            Also unlock the Sunday letter →
          </button>
        )}
        <button type="button" className="btn ghost" onClick={close}>Close</button>
      </div>
    </div>
  );
}

Object.assign(window, { TreasureIcon, TreasureProgress, TreasureHuntComplete });
