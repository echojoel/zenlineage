import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
          style={{ background: "var(--paper)" }}>

      <div style={{
        fontFamily: "'Noto Serif SC', 'Noto Serif JP', serif",
        fontSize: "4rem",
        lineHeight: 1,
        color: "var(--ink)",
        opacity: 0.4,
        marginBottom: "2rem",
        letterSpacing: "0.1em",
      }}>
        空
      </div>

      <p style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.7rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
        marginBottom: "2.5rem",
      }}>
        This path has not yet appeared
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
