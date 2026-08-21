/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Hidden perk discovery
   ───────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef } = React;

const PERK_FOUND_KEY = "ladidier_perk_found";
const PERK_CODE = "HOUSE10"; // D-06, static, display-only

function usePerkFound() {
  const [found, setFound] = useState(() => localStorage.getItem(PERK_FOUND_KEY) === "true");
  const markFound = () => {
    localStorage.setItem(PERK_FOUND_KEY, "true");
    setFound(true);
  };
  return { found, markFound };
}

function HiddenPerk({ setRoute }) {
  const { found, markFound } = usePerkFound();
  const [open, setOpen] = useState(false);
  const [firstFind, setFirstFind] = useState(false);
  const panelRef = useRef(null);
  const markRef = useRef(null);

  const activate = () => {
    if (open) { setOpen(false); return; }
    setFirstFind(!found);
    markFound();
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    markRef.current && markRef.current.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        markRef.current && !markRef.current.contains(e.target)
      ) {
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

  return (
    <>
      <button
        type="button"
        className="perk-mark"
        ref={markRef}
        aria-label="A house secret"
        aria-expanded={open}
        aria-controls="perk-reveal"
        onClick={activate}
      >
        ✦
      </button>
      {open && (
        <div
          ref={panelRef}
          id="perk-reveal"
          className={`paywall-gate perk-reveal${firstFind ? " perk-reveal--first" : ""}`}
        >
          <div className="eyebrow">A House Secret</div>
          <h3>Your code, for this issue:</h3>
          <span className="perk-code gold-text mono">{PERK_CODE}</span>
          <p>Present this at any Ladidiér house — online or in person.</p>
          <div className="perk-actions">
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
      )}
    </>
  );
}

Object.assign(window, { HiddenPerk });
