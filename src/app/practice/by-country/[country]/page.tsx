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
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
  type JsonLdNode,
} from "@/lib/seo/jsonld";
import { buildCountryLookup, countryToSlug } from "@/lib/seo/country-slug";

async function getCountries(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ country: temples.country })
    .from(temples)
    .where(and(isNotNull(temples.country), isNotNull(temples.lat)));
  return rows
    .map((r) => r.country)
    .filter((c): c is string => Boolean(c) && c.trim().length > 0);
}

export async function generateStaticParams() {
  const countries = await getCountries();
  return countries.map((c) => ({ country: countryToSlug(c) }));
}

async function loadCountryData(slug: string) {
  const countries = await getCountries();
  const lookup = buildCountryLookup(countries);
  const country = lookup.get(slug);
  if (!country) return null;

  const templeRows = await db
    .select({
      id: temples.id,
      slug: temples.slug,
      lat: temples.lat,
      lng: temples.lng,
      region: temples.region,
      country: temples.country,
      url: temples.url,
      schoolId: temples.schoolId,
    })
    .from(temples)
    .where(and(eq(temples.country, country), isNotNull(temples.lat)));

  const schoolIds = Array.from(
    new Set(templeRows.map((t) => t.schoolId).filter((id): id is string => Boolean(id)))
  );
  const schoolRows =
    schoolIds.length > 0
      ? await db
          .select({
            id: schools.id,
            slug: schools.slug,
            tradition: schools.tradition,
            name: schoolNames.value,
          })
          .from(schools)
          .leftJoin(
            schoolNames,
            and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
          )
          .where(inArray(schools.id, schoolIds))
      : [];
  const schoolById = new Map(schoolRows.map((s) => [s.id, s]));

  const templeIds = templeRows.map((t) => t.id);
  const nameRows =
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
  for (const row of nameRows) {
    if (row.locale === "en" && !enName.has(row.templeId)) {
      enName.set(row.templeId, row.value);
    } else if (row.locale !== "en" && !nativeName.has(row.templeId)) {
      nativeName.set(row.templeId, row.value);
    }
  }

  return { country, templeRows, schoolById, enName, nativeName };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const data = await loadCountryData(slug);
  if (!data) return {};
  const { country, templeRows, schoolById } = data;

  const schoolCount = new Set(
    templeRows.map((t) => t.schoolId).filter((id): id is string => Boolean(id))
  ).size;

  const schoolNamesList = Array.from(schoolById.values())
    .map((s) => s.name ?? s.slug)
    .slice(0, 4);

  const description = `Directory of ${templeRows.length} Zen, Chan, Sŏn, and Thiền practice centres in ${country} across ${schoolCount} ${
    schoolCount === 1 ? "school" : "schools"
  }${schoolNamesList.length > 0 ? `: ${schoolNamesList.join(", ")}` : ""}. Locations, traditions, and links.`;

  const canonicalUrl = abs(`/practice/by-country/${slug}`);
  return {
    title: `Zen temples in ${country}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Zen temples in ${country} — Zen Lineage`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Zen temples in ${country}`,
      description,
    },
  };
}

export default async function CountryPracticePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = await params;
  const data = await loadCountryData(slug);
  if (!data) notFound();
  const { country, templeRows, schoolById, enName, nativeName } = data;

  // Group by school within the country.
  const bySchool = new Map<
    string,
    typeof templeRows
  >();
  for (const t of templeRows) {
    const key = t.schoolId ?? "_unassigned";
    const arr = bySchool.get(key) ?? [];
    arr.push(t);
    bySchool.set(key, arr);
  }
  const schoolsSorted = Array.from(bySchool.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  const canonicalUrl = abs(`/practice/by-country/${slug}`);

  const placeNodes: JsonLdNode[] = templeRows.map((t) => ({
    "@type": "Place",
    "@id": `${canonicalUrl}#${t.slug}`,
    name: enName.get(t.id) ?? t.slug.replace(/-/g, " "),
    ...(t.url ? { url: t.url } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: country,
      ...(t.region ? { addressRegion: t.region } : {}),
    },
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
    "@id": `${canonicalUrl}#temples`,
    name: `Zen temples in ${country}`,
    numberOfItems: templeRows.length,
    itemListElement: placeNodes.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: p,
    })),
  };

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Practice", url: abs("/practice") },
    { name: country, url: canonicalUrl },
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
        <h1 className="page-title">Zen temples in {country}</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Practice", href: "/practice" },
          { name: country },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Practice directory</p>
          <h2 className="detail-title">Zen temples in {country}</h2>
          <p className="detail-subtitle">
            {templeRows.length}{" "}
            {templeRows.length === 1 ? "centre" : "centres"} across{" "}
            {schoolsSorted.length}{" "}
            {schoolsSorted.length === 1 ? "school" : "schools"}.
          </p>
        </section>

        {schoolsSorted.map(([schoolId, centres]) => {
          const school = schoolId === "_unassigned" ? null : schoolById.get(schoolId);
          const schoolHeading = school?.name ?? school?.slug ?? "Unaffiliated";
          return (
            <section className="detail-card" key={schoolId}>
              <h3 className="detail-section-title">
                {school ? (
                  <Link
                    href={`/schools/${school.slug}`}
                    className="detail-inline-link"
                  >
                    {schoolHeading}
                  </Link>
                ) : (
                  schoolHeading
                )}{" "}
                <span className="detail-list-meta">
                  {centres.length}{" "}
                  {centres.length === 1 ? "centre" : "centres"}
                </span>
              </h3>
              <ul className="detail-link-list">
                {centres
                  .slice()
                  .sort((a, b) =>
                    (a.region ?? "").localeCompare(b.region ?? "") ||
                    (enName.get(a.id) ?? a.slug).localeCompare(
                      enName.get(b.id) ?? b.slug
                    )
                  )
                  .map((t) => {
                    const name = enName.get(t.id) ?? t.slug.replace(/-/g, " ");
                    const native = nativeName.get(t.id) ?? null;
                    return (
                      <li key={t.id} id={t.slug}>
                        {t.url ? (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="detail-inline-link"
                          >
                            {name}
                          </a>
                        ) : (
                          <span>{name}</span>
                        )}
                        {native && (
                          <span className="detail-list-meta" lang="ja zh ko vi">
                            {" "}
                            {native}
                          </span>
                        )}
                        {t.region && (
                          <span className="detail-list-meta">{t.region}</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
              {school && (
                <p className="detail-list-meta" style={{ marginTop: "0.6rem" }}>
                  <Link
                    className="detail-inline-link"
                    href={`/practice/${school.slug}`}
                  >
                    All {schoolHeading} centres worldwide &rarr;
                  </Link>
                </p>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
