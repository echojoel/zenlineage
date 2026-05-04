
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  mediaAssets,
  schoolNames,
  schools,
  sources,
  teachings,
  teachingContent,
  teachingMasterRoles,
} from "@/db/schema";
import { formatDateWithPrecision } from "@/lib/date-format";
import { getSchoolDefinition, type SchoolFootnote } from "@/lib/school-taxonomy";
import { isTier1Master } from "@/lib/editorial-tiers";
import {
  createCallSiteMap,
  renderProseWithFootnotes,
  renderSharedFootnoteList,
  type FootnoteRef,
} from "@/lib/footnotes";
import { AccuracyFooter } from "@/components/AccuracyFooter";

function schoolFootnotesToRefs(footnotes: SchoolFootnote[] | undefined): FootnoteRef[] {
  return (footnotes ?? []).map((fn) => ({
    index: fn.index,
    sourceTitle: fn.sourceTitle,
    sourceUrl: fn.sourceUrl ?? null,
    author: fn.author ?? null,
    pageOrSection: fn.pageOrSection ?? null,
    excerpt: fn.excerpt ?? null,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const schoolRows = await db
    .select({ id: schools.id, tradition: schools.tradition })
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);

  const school = schoolRows[0];
  if (!school) return {};

  const nameRow = await db
    .select({ value: schoolNames.value })
    .from(schoolNames)
    .where(and(eq(schoolNames.schoolId, school.id), eq(schoolNames.locale, "en")))
    .limit(1);

  const primaryName = nameRow[0]?.value ?? slug;

  const masterCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(masters)
    .where(eq(masters.schoolId, school.id));
  const masterCount = masterCountRow[0]?.count ?? 0;

  const definition = getSchoolDefinition(slug);

  const description = definition?.summary
    ? definition.summary.slice(0, 160)
    : `${primaryName}: ${masterCount} Zen Buddhist masters in the ${school.tradition ?? "Zen"} tradition.`;

  const canonicalUrl = `https://zenlineage.org/schools/${slug}`;

  return {
    title: primaryName,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${primaryName} — Zen School`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${primaryName} — Zen Lineage`,
      description,
    },
  };
}

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

  // Native-script names (non-English) surfaced under the title so readers see
  // the school in the orthography it was written in historically.
  const nativeScriptNames = names
    .filter((name) => name.locale !== "en")
    .sort((a, b) => a.locale.localeCompare(b.locale));

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

  // Tier-1 masters of this school — highlighted above the full roster so the
  // school's most historically central voices are surfaced immediately.
  const tier1Masters = schoolMasters
    .filter((m) => isTier1Master(m.slug))
    .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999));

  // Proverbs / short sayings attributed to any master of this school, filtered
  // by the same citation publish gate used elsewhere on the site. Cap at 6 so
  // the school page stays contemplative rather than exhaustive.
  const proverbRows =
    masterIds.length > 0
      ? await db
          .select({
            teachingId: teachings.id,
            slug: teachings.slug,
            collection: teachings.collection,
            title: teachingContent.title,
            content: teachingContent.content,
            attributedMasterId: teachingMasterRoles.masterId,
          })
          .from(teachings)
          .innerJoin(
            teachingMasterRoles,
            and(
              eq(teachingMasterRoles.teachingId, teachings.id),
              eq(teachingMasterRoles.role, "attributed_to"),
              inArray(teachingMasterRoles.masterId, masterIds)
            )
          )
          .innerJoin(
            teachingContent,
            and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
          )
          .where(eq(teachings.type, "proverb"))
      : [];

  const proverbTeachingIds = proverbRows.map((r) => r.teachingId);
  const citedProverbIds =
    proverbTeachingIds.length > 0
      ? new Set(
          (
            await db
              .select({ entityId: citations.entityId })
              .from(citations)
              .where(
                and(
                  eq(citations.entityType, "teaching"),
                  inArray(citations.entityId, proverbTeachingIds)
                )
              )
          ).map((r) => r.entityId)
        )
      : new Set<string>();

  const publishedProverbs = proverbRows
    .filter((p) => citedProverbIds.has(p.teachingId))
    // Dedupe by slug (multiple master_roles rows for the same teaching)
    .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
    .slice(0, 6);

  const definition = getSchoolDefinition(slug);

  // All inline citations on this page funnel into one shared call-site
  // map and one consolidated Notes section at the bottom — Wikipedia
  // style. The summary, the practice prose, and the prominent-master
  // blurbs all draw from the same `definition.footnotes` array.
  const sharedFootnoteRefs = schoolFootnotesToRefs(definition?.footnotes);
  const sharedScope = `school-${slug}`;
  const sharedCallSites = createCallSiteMap();
  const renderShared = (text: string) =>
    renderProseWithFootnotes(text, sharedFootnoteRefs, {
      idScope: sharedScope,
      callSites: sharedCallSites,
    });

  // Prominent-master entries from the curated taxonomy come with cited
  // blurbs; if the school has none we fall back to the auto-derived
  // tier-1 list (bare names + dates, no blurbs).
  const prominentMasters = (definition?.prominentMasters ?? [])
    .map((entry) => {
      const master = schoolMasters.find((m) => m.slug === entry.slug);
      if (!master) return null;
      return {
        master,
        name: entry.name ?? masterNameMap.get(master.id) ?? master.slug,
        blurb: entry.blurb,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

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

  const canonicalUrl = `https://zenlineage.org/schools/${school.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
      { "@type": "ListItem", position: 2, name: "Schools", item: "https://zenlineage.org/schools" },
      { "@type": "ListItem", position: 3, name: primaryName, item: canonicalUrl },
    ],
  };

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
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
          {nativeScriptNames.length > 0 && (
            <p className="detail-native-names" aria-label="Names in native scripts">
              {nativeScriptNames.map((name, i) => (
                <span key={`${name.locale}-${i}`} lang={name.locale}>
                  {i > 0 ? " · " : ""}
                  {name.value}
                </span>
              ))}
            </p>
          )}
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
          <div className="detail-summary">
            {definition?.summary ? (
              sharedFootnoteRefs.length > 0 ? (
                renderShared(definition.summary)
              ) : (
                <p>{definition.summary}</p>
              )
            ) : (
              <p>
                This school page summarizes the current lineage coverage in the encyclopedia
                dataset.
              </p>
            )}
          </div>
        </section>

        {definition?.practice && (
          <section className="detail-card">
            <h3 className="detail-section-title">Meditation practice</h3>
            <div className="detail-summary">
              {sharedFootnoteRefs.length > 0 ? (
                renderShared(definition.practice)
              ) : (
                <p>{definition.practice}</p>
              )}
            </div>
            {prominentMasters.length > 0 ? (
              <>
                <h4 className="detail-subsection-title" style={{ marginTop: "1.25rem" }}>
                  Prominent masters
                </h4>
                <ul className="detail-link-list">
                  {prominentMasters.map(({ master, name, blurb }) => (
                    <li key={master.id}>
                      <Link href={`/masters/${master.slug}`}>{name}</Link>
                      {(master.birthYear || master.deathYear) && (
                        <span className="detail-list-meta">
                          {master.birthYear ?? "?"} – {master.deathYear ?? "?"}
                        </span>
                      )}
                      <div className="detail-summary" style={{ marginTop: "0.4rem" }}>
                        {renderShared(blurb)}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              tier1Masters.length > 0 && (
                <>
                  <h4 className="detail-subsection-title" style={{ marginTop: "1.25rem" }}>
                    Prominent masters
                  </h4>
                  <ul className="detail-link-list">
                    {tier1Masters.map((m) => (
                      <li key={m.id}>
                        <Link href={`/masters/${m.slug}`}>
                          {masterNameMap.get(m.id) ?? m.slug}
                        </Link>
                        {(m.birthYear || m.deathYear) && (
                          <span className="detail-list-meta">
                            {m.birthYear ?? "?"} – {m.deathYear ?? "?"}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )
            )}
          </section>
        )}

        {definition?.keyTexts && definition.keyTexts.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Key texts</h3>
            <ul className="detail-link-list">
              {definition.keyTexts.map((text) => {
                const heading = (
                  <>
                    {text.title}
                    {text.nativeTitle && (
                      <span className="detail-list-meta" lang="ja zh ko vi">
                        {" "}
                        {text.nativeTitle}
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={`${text.title}-${text.nativeTitle ?? ""}`}>
                    {text.url ? (
                      <a
                        href={text.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-inline-link"
                      >
                        {heading}
                      </a>
                    ) : (
                      <span>{heading}</span>
                    )}
                    <span className="detail-list-meta">
                      {[text.attributedTo, text.period].filter(Boolean).join(" · ")}
                    </span>
                    <p className="detail-source-excerpt" style={{ marginTop: "0.4rem" }}>
                      {text.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {definition?.keyConcepts && definition.keyConcepts.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Key concepts</h3>
            <ul className="detail-link-list">
              {definition.keyConcepts.map((concept) => {
                const heading = (
                  <>
                    {concept.term}
                    {concept.nativeTerm && (
                      <span className="detail-list-meta" lang="ja zh ko vi">
                        {" "}
                        {concept.nativeTerm}
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={`${concept.term}-${concept.nativeTerm ?? ""}`}>
                    {concept.url ? (
                      <a
                        href={concept.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-inline-link"
                      >
                        {heading}
                      </a>
                    ) : (
                      <span>{heading}</span>
                    )}
                    <p className="detail-source-excerpt" style={{ marginTop: "0.4rem" }}>
                      {concept.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {publishedProverbs.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">In the words of the masters</h3>
            <ul className="detail-link-list">
              {publishedProverbs.map((p) => (
                <li key={p.slug}>
                  <Link href={`/teachings/${p.slug}`}>{p.title ?? p.slug}</Link>
                  <span className="detail-list-meta">
                    {masterNameMap.get(p.attributedMasterId) ?? "attributed"}
                    {p.collection ? ` · ${p.collection}` : ""}
                  </span>
                  {p.content && (
                    <p
                      className="detail-source-excerpt"
                      style={{ marginTop: "0.4rem", fontStyle: "italic" }}
                    >
                      {p.content.length > 280 ? p.content.slice(0, 280) + "…" : p.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
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

        {sharedFootnoteRefs.length > 0 && (
          <section className="detail-card">
            {renderSharedFootnoteList(sharedFootnoteRefs, sharedCallSites, sharedScope, {
              title: "Notes",
              headingLevel: "h3",
            })}
          </section>
        )}

        <AccuracyFooter
          entityType="school"
          entitySlug={school.slug}
          entityName={primaryName}
          totalCitations={citationRows.length}
        />
      </div>
    </main>
  );
}
