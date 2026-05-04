import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  schoolNames,
  schools,
  sources,
  teachingContent,
  teachings,
  temples,
} from "@/db/schema";
import { getSchoolDefinition } from "@/lib/school-taxonomy";
import { isTier1Master } from "@/lib/editorial-tiers";
import { getPracticeTeachingSlugs } from "@/lib/practice-instructions";
import PracticeMapLoader from "@/components/PracticeMapLoader";

export async function generateStaticParams() {
  // Only schools that have at least one geocoded temple OR at least one
  // curated practice instruction get a per-school practice page. Others
  // would render an empty page that adds no value over the landing.
  const allSchools = await db.select({ slug: schools.slug }).from(schools);
  const templeRows = await db
    .select({ schoolId: temples.schoolId })
    .from(temples)
    .where(and(isNotNull(temples.lat), isNotNull(temples.lng)));
  const schoolIdToSlug = new Map<string, string>();
  for (const s of await db.select({ id: schools.id, slug: schools.slug }).from(schools)) {
    schoolIdToSlug.set(s.id, s.slug);
  }
  const slugsWithTemples = new Set(
    templeRows
      .map((r) => (r.schoolId ? schoolIdToSlug.get(r.schoolId) : null))
      .filter((s): s is string => Boolean(s))
  );

  return allSchools
    .filter(
      (s) =>
        slugsWithTemples.has(s.slug) || getPracticeTeachingSlugs(s.slug).length > 0
    )
    .map((s) => ({ schoolSlug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}): Promise<Metadata> {
  const { schoolSlug } = await params;

  const schoolRows = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, schoolSlug))
    .limit(1);
  if (!schoolRows[0]) return {};

  const nameRow = await db
    .select({ value: schoolNames.value })
    .from(schoolNames)
    .where(and(eq(schoolNames.schoolId, schoolRows[0].id), eq(schoolNames.locale, "en")))
    .limit(1);
  const primaryName = nameRow[0]?.value ?? schoolSlug;

  const definition = getSchoolDefinition(schoolSlug);
  const description = definition?.practice
    ? definition.practice.replace(/\[\d+\]/g, "").slice(0, 160)
    : `How ${primaryName} practices, and where: temples, zendōs, and practice centers worldwide.`;

  const canonicalUrl = `https://zenlineage.org/practice/${schoolSlug}`;

  return {
    title: `Practice — ${primaryName}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${primaryName} Practice — Zen Lineage`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Practice — ${primaryName}`,
      description,
    },
  };
}

interface PracticeInstructionView {
  slug: string;
  title: string;
  content: string;
  collection: string | null;
  type: string | null;
  attributionStatus: string | null;
  authorSlug: string | null;
  authorName: string | null;
  translator: string | null;
  edition: string | null;
  licenseStatus: string | null;
  sources: { id: string; title: string | null; url: string | null }[];
}

async function loadPracticeInstructions(
  schoolSlug: string
): Promise<PracticeInstructionView[]> {
  const slugs = getPracticeTeachingSlugs(schoolSlug);
  if (slugs.length === 0) return [];

  const rows = await db
    .select({
      teachingId: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      collection: teachings.collection,
      authorId: teachings.authorId,
      attributionStatus: teachings.attributionStatus,
      title: teachingContent.title,
      content: teachingContent.content,
      translator: teachingContent.translator,
      edition: teachingContent.edition,
      licenseStatus: teachingContent.licenseStatus,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(inArray(teachings.slug, slugs));

  const teachingIds = rows.map((r) => r.teachingId);

  // Citation gate — every published teaching must have at least one
  // entity-level citation, the same gate /teachings/[slug] enforces.
  const citedRows =
    teachingIds.length > 0
      ? await db
          .select({ entityId: citations.entityId, sourceId: citations.sourceId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "teaching"),
              inArray(citations.entityId, teachingIds)
            )
          )
      : [];

  const citationsByTeaching = new Map<string, Set<string>>();
  for (const c of citedRows) {
    const existing = citationsByTeaching.get(c.entityId) ?? new Set<string>();
    existing.add(c.sourceId);
    citationsByTeaching.set(c.entityId, existing);
  }

  const sourceIds = Array.from(new Set(citedRows.map((c) => c.sourceId)));
  const sourceRows =
    sourceIds.length > 0
      ? await db
          .select({ id: sources.id, title: sources.title, url: sources.url })
          .from(sources)
          .where(inArray(sources.id, sourceIds))
      : [];
  const sourceById = new Map(sourceRows.map((s) => [s.id, s]));

  const authorIds = Array.from(
    new Set(rows.map((r) => r.authorId).filter((id): id is string => Boolean(id)))
  );
  const authorRows =
    authorIds.length > 0
      ? await db
          .select({ id: masters.id, slug: masters.slug })
          .from(masters)
          .where(inArray(masters.id, authorIds))
      : [];
  const authorSlugById = new Map(authorRows.map((m) => [m.id, m.slug]));

  const authorNameRows =
    authorIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            nameType: masterNames.nameType,
            value: masterNames.value,
          })
          .from(masterNames)
          .where(
            and(inArray(masterNames.masterId, authorIds), eq(masterNames.locale, "en"))
          )
      : [];
  const authorNameById = new Map<string, string>();
  for (const n of authorNameRows) {
    if (n.nameType === "dharma" && !authorNameById.has(n.masterId)) {
      authorNameById.set(n.masterId, n.value);
    }
  }
  for (const n of authorNameRows) {
    if (!authorNameById.has(n.masterId)) {
      authorNameById.set(n.masterId, n.value);
    }
  }

  // Preserve curator order (the order in SCHOOL_PRACTICE_TEACHINGS), and
  // drop any teaching that fails the citation gate or whose author is not
  // a Tier-1 master.
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const ordered: PracticeInstructionView[] = [];

  for (const slug of slugs) {
    const r = bySlug.get(slug);
    if (!r || !r.title) continue;
    if (!citationsByTeaching.has(r.teachingId)) continue;

    const authorSlug = r.authorId ? authorSlugById.get(r.authorId) ?? null : null;
    if (authorSlug && !isTier1Master(authorSlug)) continue;

    const teachingSourceIds = Array.from(citationsByTeaching.get(r.teachingId) ?? []);
    const teachingSources = teachingSourceIds
      .map((id) => sourceById.get(id))
      .filter((s): s is { id: string; title: string | null; url: string | null } =>
        Boolean(s)
      );

    ordered.push({
      slug: r.slug,
      title: r.title,
      content: r.content ?? "",
      collection: r.collection,
      type: r.type,
      attributionStatus: r.attributionStatus,
      authorSlug,
      authorName: r.authorId ? authorNameById.get(r.authorId) ?? null : null,
      translator: r.translator,
      edition: r.edition,
      licenseStatus: r.licenseStatus,
      sources: teachingSources,
    });
  }

  return ordered;
}

export default async function SchoolPracticePage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = await params;

  const schoolRows = await db
    .select({ id: schools.id, slug: schools.slug, tradition: schools.tradition })
    .from(schools)
    .where(eq(schools.slug, schoolSlug));
  const school = schoolRows[0];
  if (!school) notFound();

  const nameRow = await db
    .select({ value: schoolNames.value })
    .from(schoolNames)
    .where(and(eq(schoolNames.schoolId, school.id), eq(schoolNames.locale, "en")))
    .limit(1);
  const primaryName = nameRow[0]?.value ?? school.slug;

  const definition = getSchoolDefinition(schoolSlug);

  const templeCountRow = await db
    .select({ id: temples.id })
    .from(temples)
    .where(
      and(
        eq(temples.schoolId, school.id),
        isNotNull(temples.lat),
        isNotNull(temples.lng)
      )
    );
  const templeCount = templeCountRow.length;

  const practiceInstructions = await loadPracticeInstructions(schoolSlug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
      { "@type": "ListItem", position: 2, name: "Practice", item: "https://zenlineage.org/practice" },
      {
        "@type": "ListItem",
        position: 3,
        name: primaryName,
        item: `https://zenlineage.org/practice/${schoolSlug}`,
      },
    ],
  };

  const practiceProse = (definition?.practice ?? "").replace(/\[\d+\]/g, "");

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
        <Link href="/practice" className="nav-link">
          Practice
        </Link>
        <h1 className="page-title">{primaryName}</h1>
      </header>

      <div className="detail-layout detail-layout--practice">
        <section className="detail-hero">
          <p className="detail-eyebrow">{school.tradition ?? "Practice"}</p>
          <h2 className="detail-title">How {primaryName} practices</h2>
          {practiceProse && (
            <div
              className="detail-summary"
              style={{ maxWidth: "42rem", margin: "0.9rem auto 0" }}
            >
              <p>{practiceProse}</p>
            </div>
          )}
          <div className="detail-actions">
            <Link className="detail-button-muted detail-button" href={`/schools/${schoolSlug}`}>
              About this school
            </Link>
            <Link className="detail-button-muted detail-button" href="/practice">
              All schools
            </Link>
          </div>
        </section>

        {practiceInstructions.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Practice instructions from the masters</h3>
            <ul className="detail-link-list" style={{ listStyle: "none", padding: 0 }}>
              {practiceInstructions.map((p) => (
                <li
                  key={p.slug}
                  style={{
                    padding: "1.25rem 0",
                    borderBottom: "1px solid rgba(122, 106, 85, 0.15)",
                  }}
                >
                  <h4
                    className="detail-subsection-title"
                    style={{ marginBottom: "0.4rem" }}
                  >
                    <Link className="detail-inline-link" href={`/teachings/${p.slug}`}>
                      {p.title}
                    </Link>
                  </h4>
                  <p
                    className="proverb-content"
                    style={{ textAlign: "left", marginBottom: "0.6rem" }}
                  >
                    {p.content}
                  </p>
                  <p className="detail-list-meta" style={{ marginBottom: "0.25rem" }}>
                    {p.authorName && p.authorSlug ? (
                      <>
                        <Link
                          className="detail-inline-link"
                          href={`/masters/${p.authorSlug}`}
                        >
                          {p.authorName}
                        </Link>
                        {p.collection ? ` · ${p.collection}` : ""}
                      </>
                    ) : (
                      p.collection
                    )}
                  </p>
                  <p className="detail-source-excerpt" style={{ fontSize: "0.7rem" }}>
                    {p.translator ? `Trans. ${p.translator}` : null}
                    {p.translator && p.edition ? " · " : null}
                    {p.edition}
                    {p.licenseStatus ? (
                      <>
                        {(p.translator || p.edition) ? " · " : null}
                        License: {p.licenseStatus.replace(/_/g, " ")}
                      </>
                    ) : null}
                  </p>
                  {p.sources.length > 0 && (
                    <p className="detail-source-excerpt" style={{ fontSize: "0.7rem" }}>
                      Source:{" "}
                      {p.sources.map((s, i) => (
                        <span key={s.id}>
                          {i > 0 ? "; " : ""}
                          {s.url ? (
                            <a
                              className="detail-source-link"
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {s.title ?? s.id}
                            </a>
                          ) : (
                            s.title ?? s.id
                          )}
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="detail-card detail-card--wide">
          <h3 className="detail-section-title">
            Where to practice {primaryName}
            {templeCount > 0 ? ` (${templeCount})` : ""}
          </h3>
          {templeCount > 0 ? (
            <>
              <PracticeMapLoader initialSchool={schoolSlug} />
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
                <strong>No geocoded practice centers yet for this school.</strong>
              </p>
              <p>
                If you know of a temple, zendō, seonbang, or center that should
                appear here, please{" "}
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
        </section>
      </div>
    </main>
  );
}
