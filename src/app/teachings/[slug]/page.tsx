import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  schoolNames,
  schools,
  sources,
  teachingContent,
  teachingMasterRoles,
  teachingRelations,
  teachings,
} from "@/db/schema";
import {
  buildCitationKeySet,
  hasItemCitation,
  isPublishedTeaching,
} from "@/lib/publishable-content";
import { AccuracyFooter } from "@/components/AccuracyFooter";

export async function generateStaticParams() {
  const allTeachings = await db.select({ slug: teachings.slug }).from(teachings);
  return allTeachings.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const row = await db
    .select({
      id: teachings.id,
      type: teachings.type,
      collection: teachings.collection,
      title: teachingContent.title,
      content: teachingContent.content,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(eq(teachings.slug, slug))
    .limit(1);

  const t = row[0];
  if (!t) return {};

  const title = t.title ?? slug;
  const description = t.content
    ? t.content.slice(0, 160).replace(/\s+/g, " ").trim()
    : `${t.type ?? "Teaching"}${t.collection ? ` from ${t.collection}` : ""}.`;
  const canonicalUrl = `https://zenlineage.org/teachings/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} — Zen Lineage`,
      description,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} — Zen Lineage`,
      description,
    },
  };
}

export default async function TeachingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const teachingRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      authorId: teachings.authorId,
      collection: teachings.collection,
      era: teachings.era,
      caseNumber: teachings.caseNumber,
      compiler: teachings.compiler,
      attributionStatus: teachings.attributionStatus,
    })
    .from(teachings)
    .where(eq(teachings.slug, slug))
    .limit(1);

  const teaching = teachingRows[0];
  if (!teaching) notFound();

  // Load the full citation graph for this teaching so we can check the
  // publish gate AND render the source list.
  const citationRows = await db
    .select({
      id: citations.id,
      sourceId: citations.sourceId,
      fieldName: citations.fieldName,
      excerpt: citations.excerpt,
      pageOrSection: citations.pageOrSection,
    })
    .from(citations)
    .where(and(eq(citations.entityType, "teaching"), eq(citations.entityId, teaching.id)));

  const citationKeys = buildCitationKeySet([
    { entityType: "teaching", entityId: teaching.id },
    ...citationRows.map(() => ({ entityType: "teaching", entityId: teaching.id })),
  ]);

  // Entity-level publication gate — every other detail page uses this rule.
  if (!isPublishedTeaching({ id: teaching.id }, citationKeys)) {
    notFound();
  }

  // Content (English locale first — this is the current site's locale)
  const contentRows = await db
    .select({
      id: teachingContent.id,
      locale: teachingContent.locale,
      title: teachingContent.title,
      content: teachingContent.content,
      translator: teachingContent.translator,
      edition: teachingContent.edition,
      licenseStatus: teachingContent.licenseStatus,
    })
    .from(teachingContent)
    .where(eq(teachingContent.teachingId, teaching.id));

  const enContent = contentRows.find((c) => c.locale === "en") ?? contentRows[0] ?? null;

  // Sources for display — resolve titles / urls
  const sourceIds = Array.from(new Set(citationRows.map((c) => c.sourceId)));
  const sourceRows =
    sourceIds.length > 0
      ? await db
          .select({
            id: sources.id,
            title: sources.title,
            author: sources.author,
            url: sources.url,
            publicationDate: sources.publicationDate,
            reliability: sources.reliability,
          })
          .from(sources)
          .where(inArray(sources.id, sourceIds))
      : [];
  const sourceById = new Map(sourceRows.map((s) => [s.id, s]));

  // Master roles — who spoke, who is attributed, who compiled, etc.
  const roleRows = await db
    .select({
      masterId: teachingMasterRoles.masterId,
      role: teachingMasterRoles.role,
    })
    .from(teachingMasterRoles)
    .where(eq(teachingMasterRoles.teachingId, teaching.id));

  const roleMasterIds = Array.from(new Set(roleRows.map((r) => r.masterId)));
  // Also bring in the author if present but not in roles.
  if (teaching.authorId && !roleMasterIds.includes(teaching.authorId)) {
    roleMasterIds.push(teaching.authorId);
  }

  const roleMasterRows =
    roleMasterIds.length > 0
      ? await db
          .select({ id: masters.id, slug: masters.slug, schoolId: masters.schoolId })
          .from(masters)
          .where(inArray(masters.id, roleMasterIds))
      : [];
  const roleMasterBySlug = new Map(roleMasterRows.map((m) => [m.id, m]));

  const roleNameRows =
    roleMasterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            nameType: masterNames.nameType,
            value: masterNames.value,
          })
          .from(masterNames)
          .where(
            and(inArray(masterNames.masterId, roleMasterIds), eq(masterNames.locale, "en"))
          )
      : [];
  const masterDharmaName = new Map<string, string>();
  for (const row of roleNameRows) {
    if (row.nameType === "dharma" && !masterDharmaName.has(row.masterId)) {
      masterDharmaName.set(row.masterId, row.value);
    }
  }
  for (const row of roleNameRows) {
    if (!masterDharmaName.has(row.masterId)) {
      masterDharmaName.set(row.masterId, row.value);
    }
  }

  // Author's school (shown as the teaching's lineage context)
  const authorMaster = teaching.authorId ? roleMasterBySlug.get(teaching.authorId) : null;
  const authorSchoolRow =
    authorMaster?.schoolId
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
            .where(eq(schools.id, authorMaster.schoolId))
            .limit(1)
        )[0] ?? null
      : null;

  // Related teachings (via teaching_relations)
  const relationRows = await db
    .select({
      relatedId: teachingRelations.relatedId,
      relationType: teachingRelations.relationType,
    })
    .from(teachingRelations)
    .where(eq(teachingRelations.teachingId, teaching.id));

  const relatedIds = relationRows.map((r) => r.relatedId);
  const relatedRows =
    relatedIds.length > 0
      ? await db
          .select({
            id: teachings.id,
            slug: teachings.slug,
            type: teachings.type,
            title: teachingContent.title,
          })
          .from(teachings)
          .leftJoin(
            teachingContent,
            and(
              eq(teachingContent.teachingId, teachings.id),
              eq(teachingContent.locale, "en")
            )
          )
          .where(inArray(teachings.id, relatedIds))
      : [];
  const relatedById = new Map(relatedRows.map((r) => [r.id, r]));

  // ------------------------------------------------------------ view helpers
  const title = enContent?.title ?? teaching.slug;
  const otherLocaleContent = contentRows.filter((c) => c.locale !== "en");

  const roleLabel = (role: string) =>
    role
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const collectionLine =
    teaching.collection && teaching.caseNumber
      ? `${teaching.collection}, Case ${teaching.caseNumber}`
      : (teaching.collection ?? null);

  const attributionLine =
    teaching.attributionStatus === "traditional"
      ? "Traditionally attributed"
      : teaching.attributionStatus === "unresolved"
        ? "Unresolved attribution"
        : teaching.attributionStatus === "verified"
          ? "Historically verified"
          : null;

  const canonicalUrl = `https://zenlineage.org/teachings/${teaching.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Teachings",
        item: "https://zenlineage.org/teachings",
      },
      { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
    ],
  };

  const fieldCitations = citationRows.filter((c) => c.fieldName);

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Keep the breadcrumb intentionally minimal on teaching pages — the
          hero below carries the large display title, so duplicating it in
          the header at letter-spaced small-caps just fights the layout at
          narrow widths. */}
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        {authorMaster && (
          <Link href={`/masters/${authorMaster.slug}`} className="nav-link">
            {masterDharmaName.get(authorMaster.id) ?? authorMaster.slug}
          </Link>
        )}
        {teaching.type && (
          <span className="page-title" aria-hidden="true">
            {teaching.type}
          </span>
        )}
      </header>

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">{teaching.type ?? "teaching"}</p>
          <h1 className="detail-title">{title}</h1>
          {collectionLine && <p className="detail-subtitle">{collectionLine}</p>}
          {teaching.era && <p className="detail-list-meta">{teaching.era}</p>}
          {attributionLine && <p className="detail-list-meta">{attributionLine}</p>}
        </section>

        {enContent?.content && (
          <section className="detail-card">
            <h3 className="detail-section-title">Text</h3>
            <p className="detail-summary">{enContent.content}</p>
            {(enContent.translator || enContent.edition) && (
              <p className="detail-list-meta">
                {enContent.translator && `tr. ${enContent.translator}`}
                {enContent.translator && enContent.edition ? ", " : ""}
                {enContent.edition}
              </p>
            )}
            {enContent.licenseStatus && (
              <p className="detail-list-meta">license: {enContent.licenseStatus}</p>
            )}
          </section>
        )}

        {otherLocaleContent.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Original language</h3>
            {otherLocaleContent.map((c) => (
              <div key={c.id} style={{ marginBottom: "1rem" }}>
                <p className="detail-list-meta">
                  {c.locale}
                  {c.translator ? ` · tr. ${c.translator}` : ""}
                </p>
                <p className="detail-summary" lang={c.locale}>
                  {c.content}
                </p>
              </div>
            ))}
          </section>
        )}

        {roleRows.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Attribution</h3>
            <ul className="detail-link-list">
              {roleRows.map((r, i) => {
                const master = roleMasterBySlug.get(r.masterId);
                const name = masterDharmaName.get(r.masterId) ?? master?.slug ?? r.masterId;
                return (
                  <li key={`${r.role}-${r.masterId}-${i}`}>
                    <span className="detail-list-meta">{roleLabel(r.role)}</span>
                    <br />
                    {master ? (
                      <Link className="detail-inline-link" href={`/masters/${master.slug}`}>
                        {name}
                      </Link>
                    ) : (
                      <span>{name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {authorSchoolRow && authorMaster && (
              <p className="detail-list-meta" style={{ marginTop: "0.8rem" }}>
                Lineage:{" "}
                <Link
                  className="detail-inline-link"
                  href={`/schools/${authorSchoolRow.slug}`}
                >
                  {authorSchoolRow.name ?? authorSchoolRow.slug}
                </Link>
              </p>
            )}
          </section>
        )}

        {relatedRows.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Related teachings</h3>
            <ul className="detail-link-list">
              {relationRows.map((rel, i) => {
                const related = relatedById.get(rel.relatedId);
                if (!related) return null;
                return (
                  <li key={`${rel.relatedId}-${i}`}>
                    <Link
                      className="detail-inline-link"
                      href={`/teachings/${related.slug}`}
                    >
                      {related.title ?? related.slug}
                    </Link>
                    <span className="detail-list-meta"> · {rel.relationType}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="detail-card">
          <h3 className="detail-section-title">Sources</h3>
          {citationRows.length === 0 ? (
            <p className="detail-muted">No citations attached.</p>
          ) : (
            <ul className="detail-source-list">
              {citationRows.map((c) => {
                const src = sourceById.get(c.sourceId);
                return (
                  <li key={c.id}>
                    <div className="detail-source-heading">
                      <span>{c.fieldName ?? "record"}</span>
                      {src?.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-source-link"
                        >
                          {src.title ?? src.id}
                        </a>
                      ) : (
                        <span>{src?.title ?? c.sourceId}</span>
                      )}
                    </div>
                    {src?.author && <p className="detail-list-meta">{src.author}</p>}
                    {c.pageOrSection && (
                      <p className="detail-list-meta">{c.pageOrSection}</p>
                    )}
                    {c.excerpt && <p className="detail-source-excerpt">{c.excerpt}</p>}
                  </li>
                );
              })}
            </ul>
          )}
          {fieldCitations.length === 0 && citationRows.length > 0 && (
            <p className="detail-muted" style={{ marginTop: "0.8rem" }}>
              Field-level citations (for specific claims) are not yet recorded
              for this teaching.
            </p>
          )}
        </section>

        <AccuracyFooter
          entityType="teaching"
          entitySlug={teaching.slug}
          entityName={title}
          totalCitations={citationRows.length}
          attributionStatus={teaching.attributionStatus ?? null}
        />
      </div>
    </main>
  );
}
