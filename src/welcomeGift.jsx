import { useState } from 'react';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const COUNTRIES = ("AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ " +
  "UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW")
  .split(" ")
  .map((code) => ({ code, name: regionNames.of(code) }))
  .sort((a, b) => (b.code === "US") - (a.code === "US") || a.name.localeCompare(b.name));

const field = { padding: "12px 14px", border: "1px solid var(--line-strong)", background: "var(--bg)", color: "var(--ink)", font: "inherit", width: "100%" };

export function WelcomeGift() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          country: form.get("country"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setMessage(data.sent ? "You're on the list. Check your inbox." : "You're on the list. We'll be in touch.");
    } catch (err) {
      console.error("Signup failed:", err);
      setStatus("idle");
      setMessage("We couldn't sign you up. Check your details and try again.");
    }
  };

  return (
    <section className="section container">
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="eyebrow">Stay in Touch</div>
        <h2 className="display h2" style={{ margin: "16px 0" }}>Join LaDidiér.</h2>
        <p className="lede">
          Enter your email and country to join our list. International readers receive a free ebook.
        </p>
        {status !== "done" && (
          <form onSubmit={submit} className="col gap-16">
            <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email address" aria-label="Email address" style={field} />
            <select name="country" required defaultValue="" autoComplete="country" aria-label="Country" style={field}>
              <option value="" disabled>Select your country</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
              <input name="consent" type="checkbox" required />
              <span>I agree to receive emails from LaDidiér. I can unsubscribe at any time.</span>
            </label>
            <button className="btn solid" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Join the list"}
            </button>
          </form>
        )}
        <p role="status" style={{ marginTop: 16 }}>{message}</p>
      </div>
    </section>
  );
}
