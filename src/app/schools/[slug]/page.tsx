
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  mediaAssets,
  schoolNames,
  schools,
  sources,
} from "@/db/schema";
import { formatDateWithPrecision } from "@/lib/date-format";
import { getSchoolDefinition } from "@/lib/school-taxonomy";

export async function generateStaticParams() {
  const allSchools = await db.select({ slug: schools.slug }).from(schools);
  return allSchools.map((s) => ({ slug: s.slug }));
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const schoolRows = await db
    .select({
      id: schools.id,
      slug: schools.slug,
      tradition: schools.tradition,
      parentId: schools.parentId,
    })
    .from(schools)
    .where(eq(schools.slug, slug));

  const school = schoolRows[0];
  if (!school) notFound();

  const names = await db
    .select({
      value: schoolNames.value,
      locale: schoolNames.locale,
    })
    .from(schoolNames)
    .where(eq(schoolNames.schoolId, school.id));

  const primaryName =
    names.find((name) => name.locale === "en")?.value ?? names[0]?.value ?? school.slug;

  const parentRow = school.parentId
    ? (
        await db
          .select({
            slug: schools.slug,
            name: schoolNames.value,
          })
          .from(schools)
          .leftJoin(
            schoolNames,
            and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
          )
          .where(eq(schools.id, school.parentId))
      )[0]
    : null;

  const schoolMasters = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
    })
    .from(masters)
    .where(eq(masters.schoolId, school.id));

  const masterIds = schoolMasters.map((master) => master.id);
  const masterNamesRows =
    masterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            nameType: masterNames.nameType,
            value: masterNames.value,
          })
          .from(masterNames)
          .where(and(inArray(masterNames.masterId, masterIds), eq(masterNames.locale, "en")))
      : [];

  const masterNameMap = new Map<string, string>();
  for (const row of masterNamesRows) {
    if (row.nameType === "dharma" && !masterNameMap.has(row.masterId)) {
      masterNameMap.set(row.masterId, row.value);
    }
  }
  for (const row of masterNamesRows) {
    if (!masterNameMap.has(row.masterId)) {
      masterNameMap.set(row.masterId, row.value);
    }
  }

  const citationRows =
    masterIds.length > 0
      ? await db
          .select({
            id: citations.id,
            sourceId: citations.sourceId,
          })
          .from(citations)
          .where(and(eq(citations.entityType, "master"), inArray(citations.entityId, masterIds)))
      : [];
  const sourceIds = Array.from(new Set(citationRows.map((citation) => citation.sourceId)));
  const sourceRows =
    sourceIds.length > 0
      ? await db
          .select({
            id: sources.id,
            title: sources.title,
            url: sources.url,
          })
          .from(sources)
          .where(inArray(sources.id, sourceIds))
      : [];

  const featuredMaster =
    schoolMasters.find((master) => {
      const name = (masterNameMap.get(master.id) ?? master.slug).toLowerCase();
      return name.includes("dogen") || name.includes("dōgen");
    }) ??
    schoolMasters[0] ??
    null;

  const definition = getSchoolDefinition(slug);

  // School image
  const schoolImageRows = await db
    .select({
      id: mediaAssets.id,
      storagePath: mediaAssets.storagePath,
      attribution: mediaAssets.attribution,
      license: mediaAssets.license,
      altText: mediaAssets.altText,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.entityType, "school"), eq(mediaAssets.entityId, school.id)));

  const schoolImageCited = schoolImageRows.length > 0
    ? (await db
        .select({ id: citations.id })
        .from(citations)
        .where(
          and(eq(citations.entityType, "media_asset"), eq(citations.entityId, schoolImageRows[0].id))
        )).length > 0
    : false;

  const schoolImage =
    schoolImageRows.length > 0 && schoolImageRows[0].storagePath && schoolImageCited
      ? schoolImageRows[0]
      : null;

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/schools" className="nav-link">
          Schools
        </Link>
        <h1 className="page-title">{primaryName}</h1>
      </header>

      <div className="detail-layout">
        <section className="detail-hero">
          {schoolImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={schoolImage.storagePath!}
              alt={schoolImage.altText ?? primaryName}
              className="detail-hero-image"
            />
          )}
          <p className="detail-eyebrow">{school.tradition ?? "Zen tradition"}</p>
          <h2 className="detail-title">{primaryName}</h2>
          <p className="detail-subtitle">
            {parentRow ? (
              <>
                Branch of{" "}
                <Link className="detail-inline-link" href={`/schools/${parentRow.slug}`}>
                  {parentRow.name}
                </Link>
              </>
            ) : (
              "Top-level school branch"
            )}
          </p>
          <div className="detail-actions">
            <Link
              className="detail-button"
              href={`/lineage?school=${school.slug}${featuredMaster ? `&focus=${featuredMaster.slug}` : ""}`}
            >
              Explore lineage
            </Link>
            {featuredMaster && (
              <Link
                className="detail-button detail-button-muted"
                href={`/masters/${featuredMaster.slug}`}
              >
                Featured: {masterNameMap.get(featuredMaster.id) ?? featuredMaster.slug}
              </Link>
            )}
          </div>
          <p className="detail-summary">
            {definition?.summary ??
              "This school page summarizes the current lineage coverage in the encyclopedia dataset."}
          </p>
        </section>

        {definition?.practice && (
          <section className="detail-card">
            <h3 className="detail-section-title">Meditation practice</h3>
            <p className="detail-summary">{definition.practice}</p>
          </section>
        )}

        <section className="detail-card">
          <h3 className="detail-section-title">Masters in this branch</h3>
          {schoolMasters.length === 0 ? (
            <p className="detail-muted">No masters linked to this school yet.</p>
          ) : (
            <ul className="detail-link-list">
              {schoolMasters
                .map((master) => ({
                  ...master,
                  name: masterNameMap.get(master.id) ?? master.slug,
                }))
                .sort((a, b) => {
                  const aYear = a.birthYear ?? a.deathYear ?? Infinity;
                  const bYear = b.birthYear ?? b.deathYear ?? Infinity;
                  return aYear - bYear;
                })
                .map((master) => (
                  <li key={master.id}>
                    <Link href={`/masters/${master.slug}`}>{master.name}</Link>
                    <span className="detail-list-meta">
                      {formatDateWithPrecision(master.birthYear, master.birthPrecision, {
                        unknown: null,
                      }) ?? "?"}
                      {" – "}
                      {formatDateWithPrecision(master.deathYear, master.deathPrecision, {
                        unknown: null,
                      }) ?? "?"}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Sources in use</h3>
          {sourceRows.length === 0 ? (
            <p className="detail-muted">
              No supporting sources are attached to the linked masters yet.
            </p>
          ) : (
            <ul className="detail-source-list">
              {sourceRows.map((source) => (
                <li key={source.id}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-source-link"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span>{source.title}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {schoolImage?.attribution && (
            <p className="detail-list-meta" style={{ fontSize: "0.7rem", marginTop: "1rem" }}>
              Image: {schoolImage.attribution}
              {schoolImage.license ? ` · ${schoolImage.license}` : ""}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
