import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  schoolNames,
  schools,
  templeNames,
  temples,
} from "@/db/schema";
import { SCHOOL_PRACTICE_TEACHINGS } from "@/lib/practice-instructions";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
  type JsonLdNode,
} from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  // Match the gate used by sitemap.ts: schools that have at least one
  // geocoded temple OR at least one curated practice instruction.
  const allSchools = await db
    .select({ id: schools.id, slug: schools.slug })
    .from(schools);
  const geocoded = await db
    .select({ schoolId: temples.schoolId })
    .from(temples)
    .where(and(isNotNull(temples.lat), isNotNull(temples.lng)));
  const withTemples = new Set(
    geocoded.map((t) => t.schoolId).filter((id): id is string => Boolean(id))
  );
  return allSchools
    .filter(
      (s) =>
        withTemples.has(s.id) ||
        (SCHOOL_PRACTICE_TEACHINGS[s.slug] ?? []).length > 0
    )
    .map((s) => ({ schoolSlug: s.slug }));
}

async function loadData(slug: string) {
  const schoolRows = await db
    .select({ id: schools.id, slug: schools.slug, tradition: schools.tradition })
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);
  const school = schoolRows[0];
  if (!school) return null;

  const nameRows = await db
    .select({ value: schoolNames.value, locale: schoolNames.locale })
    .from(schoolNames)
    .where(eq(schoolNames.schoolId, school.id));
  const primaryName = nameRows.find((n) => n.locale === "en")?.value ?? slug;

  const templeRows = await db
    .select({
      id: temples.id,
      slug: temples.slug,
      lat: temples.lat,
      lng: temples.lng,
      region: temples.region,
      country: temples.country,
      foundedYear: temples.foundedYear,
      url: temples.url,
    })
    .from(temples)
    .where(and(eq(temples.schoolId, school.id)));

  const templeIds = templeRows.map((t) => t.id);
  const templeNameRows =
    templeIds.length > 0
      ? await db
          .select({
            templeId: templeNames.templeId,
            locale: templeNames.locale,
            value: templeNames.value,
          })
          .from(templeNames)
          .where(inArray(templeNames.templeId, templeIds))
      : [];
  const enName = new Map<string, string>();
  const nativeName = new Map<string, string>();
  for (const row of templeNameRows) {
    if (row.locale === "en" && !enName.has(row.templeId)) {
      enName.set(row.templeId, row.value);
    } else if (row.locale !== "en" && !nativeName.has(row.templeId)) {
      nativeName.set(row.templeId, row.value);
    }
  }

  return { school, primaryName, templeRows, enName, nativeName };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}): Promise<Metadata> {
  const { schoolSlug } = await params;
  const data = await loadData(schoolSlug);
  if (!data) return {};
  const { primaryName, templeRows } = data;

  const geocoded = templeRows.filter((t) => t.lat != null && t.lng != null);
  const countryCounts = new Map<string, number>();
  for (const t of geocoded) {
    if (t.country) countryCounts.set(t.country, (countryCounts.get(t.country) ?? 0) + 1);
  }
  const topCountries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([c]) => c);

  const description =
    geocoded.length > 0
      ? `Directory of ${geocoded.length} ${primaryName} practice centres${
          topCountries.length > 0 ? ` across ${topCountries.join(", ")}` : ""
        }. Temples, zendōs, and dojos worldwide with locations and links.`
      : `Practice instructions and resources for the ${primaryName} school.`;

  const canonicalUrl = abs(`/practice/${schoolSlug}`);
  return {
    title: `${primaryName} practice centres`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${primaryName} practice centres — Zen Lineage`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${primaryName} practice centres`,
      description,
    },
  };
}

export default async function SchoolPracticePage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = await params;
  const data = await loadData(schoolSlug);
  if (!data) notFound();
  const { school, primaryName, templeRows, enName, nativeName } = data;

  // Group geocoded temples by country, then by region within country.
  const geocoded = templeRows
    .filter((t) => t.lat != null && t.lng != null)
    .map((t) => ({
      ...t,
      displayName: enName.get(t.id) ?? t.slug.replace(/-/g, " "),
      native: nativeName.get(t.id) ?? null,
    }));

  const byCountry = new Map<string, typeof geocoded>();
  for (const t of geocoded) {
    const c = t.country ?? "Other";
    const arr = byCountry.get(c) ?? [];
    arr.push(t);
    byCountry.set(c, arr);
  }
  const countriesSorted = Array.from(byCountry.entries()).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  );

  const canonicalUrl = abs(`/practice/${schoolSlug}`);

  // ItemList of practice centres for crawlers — gives Google a clean
  // index of every centre as an enumerated list. Place nodes carry geo
  // and addressCountry where present.
  const placeNodes: JsonLdNode[] = geocoded.map((t, i) => ({
    "@type": "Place",
    "@id": `${canonicalUrl}#${t.slug}`,
    name: t.displayName,
    ...(t.url ? { url: t.url } : {}),
    ...(t.country
      ? {
          address: {
            "@type": "PostalAddress",
            addressCountry: t.country,
            ...(t.region ? { addressRegion: t.region } : {}),
          },
        }
      : {}),
    ...(t.lat != null && t.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: t.lat,
            longitude: t.lng,
          },
        }
      : {}),
  }));

  const itemListLd: JsonLdNode = {
    "@type": "ItemList",
    "@id": `${canonicalUrl}#centres`,
    name: `${primaryName} practice centres`,
    numberOfItems: geocoded.length,
    itemListElement: placeNodes.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: p,
    })),
  };

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Practice", url: abs("/practice") },
    { name: primaryName, url: canonicalUrl },
  ]);

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString([itemListLd, breadcrumbLd]) }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/practice" className="nav-link">
          Practice
        </Link>
        <h1 className="page-title">{primaryName} practice centres</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Practice", href: "/practice" },
          { name: `${primaryName} practice centres` },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">{school.tradition ?? "Zen tradition"}</p>
          <h2 className="detail-title">{primaryName} practice centres</h2>
          <p className="detail-subtitle">
            {geocoded.length > 0
              ? `${geocoded.length} ${
                  geocoded.length === 1 ? "centre" : "centres"
                } across ${countriesSorted.length} ${
                  countriesSorted.length === 1 ? "country" : "countries"
                }.`
              : "No geocoded centres recorded yet."}
          </p>
          <div className="detail-actions">
            <Link className="detail-button" href={`/practice?school=${school.slug}`}>
              Show on map
            </Link>
            <Link className="detail-button detail-button-muted" href={`/schools/${school.slug}`}>
              About the {primaryName} school
            </Link>
          </div>
        </section>

        {countriesSorted.length === 0 ? (
          <section className="detail-card">
            <p className="detail-muted">
              No geocoded practice centres are recorded for this school yet. The school&rsquo;s
              practice instructions are surfaced on{" "}
              <Link href={`/practice?school=${school.slug}`} className="detail-inline-link">
                the practice page
              </Link>
              .
            </p>
          </section>
        ) : (
          countriesSorted.map(([country, centres]) => (
            <section className="detail-card" key={country}>
              <h3 className="detail-section-title">
                {country}{" "}
                <span className="detail-list-meta">
                  {centres.length} {centres.length === 1 ? "centre" : "centres"}
                </span>
              </h3>
              <ul className="detail-link-list">
                {centres
                  .slice()
                  .sort((a, b) =>
                    (a.region ?? "").localeCompare(b.region ?? "") ||
                    a.displayName.localeCompare(b.displayName)
                  )
                  .map((t) => (
                    <li key={t.id} id={t.slug}>
                      {t.url ? (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-inline-link"
                        >
                          {t.displayName}
                        </a>
                      ) : (
                        <span>{t.displayName}</span>
                      )}
                      {t.native && (
                        <span className="detail-list-meta" lang="ja zh ko vi">
                          {" "}
                          {t.native}
                        </span>
                      )}
                      <span className="detail-list-meta">
                        {[t.region, t.foundedYear ? `est. ${t.foundedYear}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
