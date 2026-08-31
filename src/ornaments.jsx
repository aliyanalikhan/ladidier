/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Ornaments (heraldic illustration vocabulary)
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from 'react';

/* A pair of mirrored laurel sprigs — matches the crest's laurels.
   Drawn as a continuous gold line illustration. */
function Laurel({ width = 260, color = "var(--gold)", animate = true, opacity = 1 }) {
  return (
    <svg viewBox="0 0 260 80" width={width} fill="none" aria-hidden="true"
         style={{ display: "block", opacity }}>
      <g stroke={color} strokeWidth="1" strokeLinecap="round" fill="none"
         className={animate ? "lr-draw" : ""}>
        {/* center stem */}
        <path d="M130 40 Q90 30 60 32 Q40 33 28 44" />
        <path d="M130 40 Q170 30 200 32 Q220 33 232 44" />
        {/* left leaves */}
        <path d="M60 32 q-6 -10 -16 -10 q4 8 16 10" />
        <path d="M80 31 q-6 -10 -16 -10 q4 8 16 10" />
        <path d="M100 33 q-6 -10 -16 -10 q4 8 16 10" />
        <path d="M50 38 q-4 8 -16 10 q6 -10 16 -10" />
        <path d="M70 40 q-4 8 -16 10 q6 -10 16 -10" />
        <path d="M90 41 q-4 8 -16 10 q6 -10 16 -10" />
        {/* right leaves (mirror) */}
        <path d="M200 32 q6 -10 16 -10 q-4 8 -16 10" />
        <path d="M180 31 q6 -10 16 -10 q-4 8 -16 10" />
        <path d="M160 33 q6 -10 16 -10 q-4 8 -16 10" />
        <path d="M210 38 q4 8 16 10 q-6 -10 -16 -10" />
        <path d="M190 40 q4 8 16 10 q-6 -10 -16 -10" />
        <path d="M170 41 q4 8 16 10 q-6 -10 -16 -10" />
        {/* center berry */}
        <circle cx="130" cy="40" r="2" fill={color} stroke="none" />
        <circle cx="120" cy="42" r="1.2" fill={color} stroke="none" />
        <circle cx="140" cy="42" r="1.2" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

/* A horizontal flourish — section divider with central diamond + tapered lines. */
function Flourish({ width = 240, color = "currentColor", opacity = .55 }) {
  return (
    <svg viewBox="0 0 240 20" width={width} fill="none" aria-hidden="true"
         style={{ display: "block", opacity }}>
      <g stroke={color} strokeWidth=".8" fill="none" strokeLinecap="round">
        <line x1="2" y1="10" x2="100" y2="10" />
        <line x1="140" y1="10" x2="238" y2="10" />
        <path d="M105 10 q5 -6 10 0 q5 6 10 0 q-5 -6 -10 0 q-5 6 -10 0 z" fill={color} stroke="none" opacity=".5" />
        <circle cx="100" cy="10" r="1.2" fill={color} stroke="none" />
        <circle cx="140" cy="10" r="1.2" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

/* Art-deco corner — used inside magazine cover frames. */
function DecoCorner({ size = 64, color = "var(--gold)", rotate = 0 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true"
         style={{ display: "block", transform: `rotate(${rotate}deg)` }}>
      <g stroke={color} strokeWidth=".9" fill="none" strokeLinecap="round">
        <path d="M4 4 L28 4" />
        <path d="M4 4 L4 28" />
        <path d="M8 8 L20 8 L20 20 L8 20 Z" opacity=".6" />
        <circle cx="14" cy="14" r="1.6" fill={color} stroke="none" />
        <path d="M4 32 q4 -8 12 -8" opacity=".5" />
        <path d="M32 4 q-8 4 -8 12" opacity=".5" />
      </g>
    </svg>
  );
}

/* LD monogram — usable at large size as a "watermark" behind hero content. */
function Monogram({ size = 480, color = "var(--gold)", opacity = .07 }) {
  return (
    <svg viewBox="0 0 200 240" width={size} fill="none" aria-hidden="true"
         style={{ display: "block", opacity }}>
      <g stroke={color} strokeWidth="1" fill="none">
        {/* shield */}
        <path d="M20 16 H180 V128 C180 180 140 218 100 230 C60 218 20 180 20 128 Z" />
        {/* L D monogram */}
        <text x="100" y="120" textAnchor="middle"
              fontFamily="'Instrument Serif', Georgia, serif"
              fontSize="92" fontStyle="italic" letterSpacing="-4"
              fill={color}>LD</text>
        {/* mini laurels */}
        <path d="M40 168 q12 -8 28 -4 q-4 -10 -16 -12 q-2 8 -12 16 z" opacity=".7" />
        <path d="M160 168 q-12 -8 -28 -4 q4 -10 16 -12 q2 8 12 16 z" opacity=".7" />
      </g>
    </svg>
  );
}

/* A single vertical accent — used as a margin ornament on hero. */
function VerticalRule({ height = 220, color = "var(--gold)" }) {
  return (
    <svg viewBox="0 0 12 220" width="12" height={height} fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth=".9" fill="none">
        <line x1="6" y1="0" x2="6" y2="86" />
        <line x1="6" y1="134" x2="6" y2="220" />
        <path d="M6 96 l4 4 l-4 4 l-4 -4 z" fill={color} stroke="none" opacity=".8" />
        <path d="M6 120 l4 4 l-4 4 l-4 -4 z" fill={color} stroke="none" opacity=".8" />
        <circle cx="6" cy="110" r="2" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

/* Stagger-revealed display text — splits children into spans. */
function extractText(children) {
  if (children == null) return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (typeof children === "object" && children.props) return extractText(children.props.children);
  return "";
}

function Stagger({ children, as: Tag = "span", base = 0, step = 60, className = "", style }) {
  const text = extractText(children);
  const words = text.split(/(\s+)/);
  return (
    <Tag className={className} style={style}>
      {words.map((w, i) =>
        /\s+/.test(w) ? <span key={i}>{w}</span> :
          <span key={i} className="stg-w">
            <span className="stg-i" style={{ animationDelay: `${base + i * step}ms` }}>{w}</span>
          </span>
      )}
    </Tag>
  );
}

/* Cursor-following gold glow inside a container. */
function Spotlight({ size = 540, intensity = .35 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    const onMove = (e) => {
      const r = parent.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    parent.addEventListener("mousemove", onMove);
    return () => parent.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div ref={ref} className="spotlight" aria-hidden="true"
         style={{ "--sp-size": `${size}px`, "--sp-alpha": intensity }} />
  );
}

/* Animated count-up numeral. */
function CountUp({ to = 11, suffix = "", duration = 1400, format = (v) => v }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (t) => {
            const k = Math.min(1, (t - start) / duration);
            const ease = 1 - Math.pow(1 - k, 3);
            setN(Math.round(ease * to));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: .4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{format(n)}{suffix}</span>;
}

/* Roman numeral counter that ticks through values on view */
function RomanReveal({ value = "MMXXI" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState("");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(es => {
      es.forEach(en => {
        if (en.isIntersecting) {
          let i = 0;
          const id = setInterval(() => {
            i++;
            setShown(value.slice(0, i));
            if (i >= value.length) clearInterval(id);
          }, 90);
          io.disconnect();
        }
      });
    }, { threshold: .5 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{shown || "\u00A0"}</span>;
}

export { Laurel, Flourish, DecoCorner, Monogram, Stagger, Spotlight, CountUp, RomanReveal };
