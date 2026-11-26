import { useState } from 'react';

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
          Enter your email to join our list. International readers receive a free ebook.
        </p>
        {status !== "done" && (
          <form onSubmit={submit} className="col gap-16">
            <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email address" aria-label="Email address" style={field} />
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
              <input name="consent" type="checkbox" required />
              <span>I agree to receive emails from LaDidiér, and to my country being detected from my connection. I can unsubscribe at any time.</span>
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
