import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { schoolNames, schools, temples } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import PracticeMapLoader from "@/components/PracticeMapLoader";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Places of practice around the world — temples, zendōs, seonbangs, and Thiền centers in the Chan, Seon, Thiền, and Zen traditions. Filter by school.",
  alternates: { canonical: "https://zenlineage.org/practice" },
  openGraph: {
    title: "Places of Practice — Zen Lineage",
    description:
      "An interactive map of Chan, Seon, Thiền, and Zen temples and practice centers worldwide.",
    url: "https://zenlineage.org/practice",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Places of Practice — Zen Lineage",
    description:
      "Where the tradition is practiced — temples, zendōs, seonbangs, and Plum Village centers.",
  },
};

export default async function PracticePage() {
  // Server-side counts used for the zero-JS <noscript> fallback so the page
  // is crawlable and readable without the client map.
  const geocodedTemples = await db
    .select({ schoolId: temples.schoolId })
    .from(temples)
    .where(and(isNotNull(temples.lat), isNotNull(temples.lng)));

  const schoolRows = await db
    .select({ id: schools.id, slug: schools.slug, tradition: schools.tradition })
    .from(schools);
  const schoolEnNames = await db
    .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
    .from(schoolNames)
    .where(eq(schoolNames.locale, "en"));
  const nameById = new Map(schoolEnNames.map((n) => [n.schoolId, n.value]));

  const countsBySchool = new Map<string, number>();
  for (const t of geocodedTemples) {
    if (!t.schoolId) continue;
    countsBySchool.set(t.schoolId, (countsBySchool.get(t.schoolId) ?? 0) + 1);
  }

  const schoolsWithTemples = schoolRows
    .filter((s) => (countsBySchool.get(s.id) ?? 0) > 0)
    .map((s) => ({
      slug: s.slug,
      name: nameById.get(s.id) ?? s.slug,
      tradition: s.tradition ?? "",
      count: countsBySchool.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const totalTemples = geocodedTemples.length;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
      { "@type": "ListItem", position: 2, name: "Practice", item: "https://zenlineage.org/practice" },
    ],
  };

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Practice</h1>
      </header>

      <div className="detail-layout detail-layout--practice">
        <section className="detail-hero">
          <p className="detail-eyebrow">Places of practice</p>
          <h2 className="detail-title">Where to sit</h2>
          <p
            className="detail-subtitle"
            style={{ maxWidth: "42rem", margin: "0.9rem auto 0" }}
          >
            Temples, zendōs, seonbangs, and Thiền centers around the world — filtered
            by school. To learn <em>how</em> a given school practices, visit its{" "}
            <Link className="detail-inline-link" href="/schools">
              school page
            </Link>
            .
          </p>
        </section>

        <section className="detail-card detail-card--wide">
          {totalTemples > 0 ? (
            <>
              <PracticeMapLoader />
              <p
                className="detail-muted"
                style={{ marginTop: "0.75rem", fontSize: "0.72rem" }}
              >
                Map tiles from{" "}
                <a
                  className="detail-inline-link"
                  href="https://openfreemap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenFreeMap
                </a>
                . Map data ©{" "}
                <a
                  className="detail-inline-link"
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap contributors
                </a>
                .
              </p>
            </>
          ) : (
            <div className="practice-map-empty">
              <p>
                <strong>Interactive map coming soon.</strong>
              </p>
              <p>
                The practice-location dataset is being assembled. If you know of
                a place that should appear here, please{" "}
                <a
                  className="detail-inline-link"
                  href="https://github.com/echojoel/zenlineage/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  open a GitHub issue
                </a>
                .
              </p>
            </div>
          )}

          {/* Zero-JS / crawler-friendly fallback — renders alongside the
              client map; the map component's CSS hides it once hydrated
              so double-rendering isn't a visual issue. */}
          <noscript>
            <div style={{ marginTop: "1.5rem" }}>
              <h3 className="detail-section-title">
                {totalTemples} places of practice
              </h3>
              <ul className="detail-link-list">
                {schoolsWithTemples.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/schools/${s.slug}`}>{s.name}</Link>
                    <span className="detail-list-meta">
                      {s.tradition} · {s.count}{" "}
                      {s.count === 1 ? "temple" : "temples"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </noscript>
        </section>
      </div>
    </main>
  );
}
