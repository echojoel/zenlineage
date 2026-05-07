import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Zen Lineage",
  description:
    "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan and Zen history.",
  alternates: { canonical: "https://zenlineage.org" },
  openGraph: {
    title: "Zen Lineage",
    description:
      "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan and Zen history.",
    url: "https://zenlineage.org",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zen Lineage",
    description:
      "An interactive encyclopedia of Zen Buddhism across 2,500 years of Chan and Zen history.",
  },
};
import { sql, eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  masters,
  masterNames,
  masterTransmissions,
  schools,
  teachings,
  teachingContent,
  teachingMasterRoles,
  temples,
  citations,
} from "@/db/schema";
import { buildCitationKeySet, isPublishedTeaching } from "@/lib/publishable-content";

export default async function Home() {
  // Counts
  const [masterRow, schoolRow, transmissionRow, templeRow] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(masters),
    db.select({ count: sql<number>`count(*)` }).from(schools),
    db.select({ count: sql<number>`count(*)` }).from(masterTransmissions),
    db.select({ count: sql<number>`count(*)` }).from(temples),
  ]);

  // Random proverb
  const proverbRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      authorId: teachings.authorId,
      content: teachingContent.content,
    })
    .from(teachings)
    .innerJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(eq(teachings.type, "proverb"));

  const citationRows = await db
    .select({
      entityType: citations.entityType,
      entityId: citations.entityId,
    })
    .from(citations)
    .where(eq(citations.entityType, "teaching"));
  const citationKeys = buildCitationKeySet(citationRows);

  const publishedProverbs = proverbRows.filter((p) =>
    isPublishedTeaching({ id: p.id }, citationKeys)
  );

  const randomPick =
    publishedProverbs.length > 0
      ? publishedProverbs[
          Math.abs(
            Math.floor(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate()
              ) / 86_400_000
            )
          ) % publishedProverbs.length
        ]
      : null;

  // Resolve author name for the random proverb
  let randomProverb: { slug: string; content: string; authorName: string | null } | null = null;
  if (randomPick) {
    const placeholderSlugs = new Set(["shakyamuni-buddha"]);
    let authorName: string | null = null;

    // Check master_roles first
    const roles = await db
      .select({ masterId: teachingMasterRoles.masterId })
      .from(teachingMasterRoles)
      .where(eq(teachingMasterRoles.teachingId, randomPick.id))
      .limit(1);

    const masterId = roles.length > 0 ? roles[0].masterId : randomPick.authorId;

    if (masterId) {
      const masterRow = await db
        .select({ slug: masters.slug })
        .from(masters)
        .where(eq(masters.id, masterId))
        .limit(1);

      if (masterRow.length > 0 && !placeholderSlugs.has(masterRow[0].slug)) {
        const nameRow = await db
          .select({ value: masterNames.value })
          .from(masterNames)
          .where(
            and(
              eq(masterNames.masterId, masterId),
              eq(masterNames.locale, "en"),
              eq(masterNames.nameType, "dharma")
            )
          )
          .limit(1);

        authorName =
          nameRow.length > 0
            ? nameRow[0].value
            : ((
                await db
                  .select({ value: masterNames.value })
                  .from(masterNames)
                  .where(and(eq(masterNames.masterId, masterId), eq(masterNames.locale, "en")))
                  .limit(1)
              )[0]?.value ?? null);
      }
    }

    randomProverb = {
      slug: randomPick.slug,
      content: randomPick.content,
      authorName,
    };
  }

  const counts = {
    masters: masterRow[0]?.count ?? 0,
    schools: schoolRow[0]?.count ?? 0,
    transmissions: transmissionRow[0]?.count ?? 0,
    temples: templeRow[0]?.count ?? 0,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zen Lineage",
    url: "https://zenlineage.org",
    description: `An interactive encyclopedia of Zen Buddhism covering ${counts.masters} masters, ${counts.schools} schools, ${counts.transmissions} lineage transmissions, and ${counts.temples} active places of practice across 2,500 years of Chan and Zen history.`,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://zenlineage.org/masters?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main
      className="home-main flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--paper)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Logograph */}
      <div
        className="mb-8 select-none"
        style={{
          fontFamily: "'Noto Serif SC', 'Noto Serif JP', serif",
          fontSize: "5rem",
          lineHeight: 1,
          color: "var(--ink)",
          opacity: 0.85,
        }}
      >
        禅
      </div>

      {/* Wordmark */}
      <h1
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 300,
          letterSpacing: "0.25em",
          color: "var(--ink)",
          marginBottom: "0.5rem",
        }}
      >
        ZEN LINEAGE
      </h1>

      {/* Divider */}
      <div
        style={{
          width: "3rem",
          height: "1px",
          background: "var(--ink-light)",
          opacity: 0.4,
          marginBottom: "2.5rem",
        }}
      />

      {/* Nav links */}
      <nav
        className="home-nav"
        style={{
          display: "flex",
          gap: "2.5rem",
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-light)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "Proverbs", href: "/proverbs" },
          { label: "Masters", href: "/masters" },
          { label: "Lineage", href: "/lineage" },
          { label: "Schools", href: "/schools" },
          { label: "Sūtras", href: "/sutras" },
          { label: "Glossary", href: "/glossary" },
          { label: "Practice", href: "/practice" },
          { label: "Timeline", href: "/timeline" },
          { label: "About", href: "/about" },
        ].map(({ label, href }) => (
          <Link key={href} href={href} className="nav-link">
            {label}
          </Link>
        ))}
      </nav>

      {/* Random proverb — between nav and footer */}
      {randomProverb && (
        <Link
          href={`/proverbs?highlight=${randomProverb.slug}`}
          className="home-proverb-link"
          style={{
            display: "block",
            maxWidth: "380px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "0.78rem",
              lineHeight: 1.7,
              color: "var(--ink-light)",
              whiteSpace: "pre-line",
              marginBottom: "0.35rem",
            }}
          >
            {randomProverb.content}
          </p>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.06em",
              fontVariant: "small-caps",
              color: "var(--ink-light)",
              opacity: 0.55,
            }}
          >
            {randomProverb.authorName ?? "Traditional Zen Proverb"}
          </span>
        </Link>
      )}

      {/* Stats — each metric links to its index page */}
      <p
        className="home-stats"
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-light)",
          opacity: 0.7,
        }}
      >
        <Link href="/masters" className="home-stats-link">
          {counts.masters} masters
        </Link>
        {" · "}
        <Link href="/schools" className="home-stats-link">
          {counts.schools} schools
        </Link>
        {" · "}
        <Link href="/lineage" className="home-stats-link">
          {counts.transmissions} transmissions
        </Link>
        {" · "}
        <Link href="/practice" className="home-stats-link">
          {counts.temples} places of practice
        </Link>
      </p>

      <footer className="home-footer">
        <ThemeToggle />
        <p className="home-footer-tag">
          Zen Lineage — open encyclopedia of Chan, Zen, Sŏn, and Thiền
        </p>
      </footer>
    </main>
  );
}
