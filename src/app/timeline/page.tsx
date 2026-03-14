import Link from "next/link";

export default function TimelinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
          style={{ background: "var(--paper)" }}>
      <h1 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "1.5rem",
        fontWeight: 300,
        letterSpacing: "0.25em",
        color: "var(--ink)",
        marginBottom: "1rem",
        textTransform: "uppercase",
      }}>
        timeline
      </h1>
      <p style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
        opacity: 0.6,
        marginBottom: "2.5rem",
      }}>
        Phase 2 — coming soon
      </p>
      <Link href="/" className="nav-link" style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}>
        Return
      </Link>
    </main>
  );
}
