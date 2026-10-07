"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

export default function ReportForm({ siteKey }: { siteKey: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/safeguarding-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: values.get("organization"),
          replyEmail: values.get("replyEmail"),
          message: values.get("message"),
          website: values.get("website"),
          turnstileToken: values.get("cf-turnstile-response"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "The report could not be sent.");
      form.reset();
      setState("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The report could not be sent.");
      setState("error");
    } finally {
      window.turnstile?.reset();
    }
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <form className="safeguarding-form" onSubmit={submit}>
        <label htmlFor="report-organization">Organization or group</label>
        <input id="report-organization" name="organization" maxLength={200} autoComplete="off" />

        <label htmlFor="report-reply">Your email, if you want a reply</label>
        <input id="report-reply" name="replyEmail" type="email" maxLength={254} autoComplete="email" />

        <label htmlFor="report-message">What should we review?</label>
        <textarea id="report-message" name="message" required minLength={20} maxLength={8000} rows={9} />

        <div className="safeguarding-honeypot" aria-hidden="true">
          <label htmlFor="report-website">Website</label>
          <input id="report-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="cf-turnstile" data-sitekey={siteKey} data-action="safeguarding-report" />
        <button className="detail-button" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send private report"}
        </button>
        {state === "sent" && <p role="status">Your report was sent. Thank you.</p>}
        {state === "error" && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
