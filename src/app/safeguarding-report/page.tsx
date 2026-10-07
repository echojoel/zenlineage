import type { Metadata } from "next";
import Link from "@/components/Link";
import ReportForm from "./ReportForm";

export const metadata: Metadata = {
  title: "Private safeguarding report",
  robots: { index: false, follow: false },
};

export default function SafeguardingReportPage() {
  const enabled = process.env.NEXT_PUBLIC_SAFEGUARDING_FORM_ENABLED === "1";
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/practice" className="nav-link">← Practice</Link>
        <h1 className="page-title">Private safeguarding report</h1>
      </header>
      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Practice directory</p>
          <h2 className="detail-title">Share a concern privately</h2>
          <p className="detail-subtitle">
            Reports go to a private inbox for editorial review. They are not
            published on the site or posted to GitHub. Please share only the
            details needed to identify and assess the concern.
          </p>
        </section>
        <section className="detail-card detail-card--wide">
          {enabled && siteKey ? (
            <ReportForm siteKey={siteKey} />
          ) : (
            <p>Private reporting is being configured and is not available yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
