export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
          style={{ background: "var(--paper)" }}>

      {/* Logograph */}
      <div className="mb-8 select-none" style={{
        fontFamily: "'Noto Serif SC', 'Noto Serif JP', serif",
        fontSize: "5rem",
        lineHeight: 1,
        color: "var(--ink)",
        opacity: 0.85,
      }}>
        禅
      </div>

      {/* Wordmark */}
      <h1 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "2rem",
        fontWeight: 300,
        letterSpacing: "0.25em",
        color: "var(--ink)",
        marginBottom: "0.5rem",
      }}>
        ZEN
      </h1>

      <p style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
        marginBottom: "3rem",
      }}>
        Lineage &amp; Encyclopedia
      </p>

      {/* Divider */}
      <div style={{
        width: "3rem",
        height: "1px",
        background: "var(--ink-light)",
        opacity: 0.4,
        marginBottom: "3rem",
      }} />

      {/* Nav links */}
      <nav style={{
        display: "flex",
        gap: "2.5rem",
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.8rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
      }}>
        {[
          { label: "Lineage", href: "/lineage" },
          { label: "Masters", href: "/masters" },
          { label: "Schools", href: "/schools" },
          { label: "Timeline", href: "/timeline" },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            style={{
              textDecoration: "none",
              color: "inherit",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-light)")}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Phase label */}
      <p style={{
        position: "absolute",
        bottom: "2rem",
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.65rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
        opacity: 0.5,
      }}>
        Phase 2 — coming soon
      </p>
    </main>
  );
}
