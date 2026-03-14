import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  masterTransmissions,
  mediaAssets,
  schoolNames,
  schools,
  sources,
  masterBiographies,
  teachingContent,
  teachings,
  teachingMasterRoles,
} from "@/db/schema";
import {
  buildCitationKeySet,
  getPublishedImageAsset,
  isPublishedBiography,
  isPublishedTeaching,
} from "@/lib/publishable-content";
import { formatLifeRange } from "@/lib/date-format";

export default async function MasterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
    })
    .from(masters)
    .where(eq(masters.slug, slug));

  const master = rows[0];
  if (!master) notFound();

  const biographyRows = await db
    .select({
      id: masterBiographies.id,
      content: masterBiographies.content,
    })
    .from(masterBiographies)
    .where(and(eq(masterBiographies.masterId, master.id), eq(masterBiographies.locale, "en")))
    .limit(1);

  const biographyRow = biographyRows[0];
  const names = await db
    .select({
      locale: masterNames.locale,
      nameType: masterNames.nameType,
      value: masterNames.value,
    })
    .from(masterNames)
    .where(eq(masterNames.masterId, master.id));

  const orderedNames = names.sort((a, b) => {
    const rank = (nameType: string) =>
      ({ dharma: 0, honorific: 1, alias: 2, birth: 3 })[nameType] ?? 9;
    return rank(a.nameType) - rank(b.nameType) || a.value.localeCompare(b.value);
  });

  const primaryName = orderedNames.find((name) => name.nameType === "dharma")?.value ?? master.slug;

  const schoolRow = master.schoolId
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
          .where(eq(schools.id, master.schoolId))
      )[0]
    : null;

  const teachers = await db
    .select({
      transmissionId: masterTransmissions.id,
      counterpartId: masters.id,
      counterpartSlug: masters.slug,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
      type: masterTransmissions.type,
    })
    .from(masterTransmissions)
    .innerJoin(masters, eq(masters.id, masterTransmissions.teacherId))
    .where(eq(masterTransmissions.studentId, master.id));

  const students = await db
    .select({
      transmissionId: masterTransmissions.id,
      counterpartId: masters.id,
      counterpartSlug: masters.slug,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
      type: masterTransmissions.type,
    })
    .from(masterTransmissions)
    .innerJoin(masters, eq(masters.id, masterTransmissions.studentId))
    .where(eq(masterTransmissions.teacherId, master.id));

  const relatedMasterIds = Array.from(
    new Set([
      ...teachers.map((teacher) => teacher.counterpartId),
      ...students.map((student) => student.counterpartId),
    ])
  );

  const relatedNames =
    relatedMasterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            value: masterNames.value,
            nameType: masterNames.nameType,
          })
          .from(masterNames)
          .where(and(inArray(masterNames.masterId, relatedMasterIds), eq(masterNames.locale, "en")))
      : [];

  const nameMap = new Map<string, string>();
  for (const row of relatedNames) {
    if (row.nameType === "dharma" && !nameMap.has(row.masterId)) {
      nameMap.set(row.masterId, row.value);
    }
  }
  for (const row of relatedNames) {
    if (!nameMap.has(row.masterId)) {
      nameMap.set(row.masterId, row.value);
    }
  }

  const citationRows = await db
    .select({
      id: citations.id,
      sourceId: citations.sourceId,
      fieldName: citations.fieldName,
      excerpt: citations.excerpt,
      pageOrSection: citations.pageOrSection,
    })
    .from(citations)
    .where(and(eq(citations.entityType, "master"), eq(citations.entityId, master.id)));
  const teachingRows = await db
    .select({
      id: teachings.id,
      type: teachings.type,
      title: teachingContent.title,
      content: teachingContent.content,
      caseNumber: teachings.caseNumber,
      collection: teachings.collection,
      attributionStatus: teachings.attributionStatus,
      licenseStatus: teachingContent.licenseStatus,
      translator: teachingContent.translator,
      edition: teachingContent.edition,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(eq(teachings.authorId, master.id));

  const teachingIds = teachingRows.map((t) => t.id);
  const masterRoleRows =
    teachingIds.length > 0
      ? await db
          .select({
            teachingId: teachingMasterRoles.teachingId,
            masterId: teachingMasterRoles.masterId,
            role: teachingMasterRoles.role,
          })
          .from(teachingMasterRoles)
          .where(inArray(teachingMasterRoles.teachingId, teachingIds))
      : [];

  const roleMasterIds = Array.from(
    new Set(masterRoleRows.map((r) => r.masterId).filter((id) => id !== master.id))
  );
  const roleNameRows =
    roleMasterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            value: masterNames.value,
            nameType: masterNames.nameType,
          })
          .from(masterNames)
          .where(and(inArray(masterNames.masterId, roleMasterIds), eq(masterNames.locale, "en")))
      : [];

  const roleNameMap = new Map<string, string>();
  for (const row of roleNameRows) {
    if (row.nameType === "dharma" && !roleNameMap.has(row.masterId)) {
      roleNameMap.set(row.masterId, row.value);
    }
  }
  for (const row of roleNameRows) {
    if (!roleNameMap.has(row.masterId)) {
      roleNameMap.set(row.masterId, row.value);
    }
  }
  // Include the current master's name in the role name map
  roleNameMap.set(master.id, primaryName);

  const rolesByTeachingId = new Map<string, { masterId: string; role: string }[]>();
  for (const row of masterRoleRows) {
    const roles = rolesByTeachingId.get(row.teachingId) ?? [];
    roles.push({ masterId: row.masterId, role: row.role });
    rolesByTeachingId.set(row.teachingId, roles);
  }
  const mediaRows = await db
    .select({
      id: mediaAssets.id,
      type: mediaAssets.type,
      storagePath: mediaAssets.storagePath,
      sourceUrl: mediaAssets.sourceUrl,
      attribution: mediaAssets.attribution,
      license: mediaAssets.license,
      altText: mediaAssets.altText,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.entityType, "master"), eq(mediaAssets.entityId, master.id)));
  const biographyCitationRows = biographyRow
    ? await db
        .select({
          entityType: citations.entityType,
          entityId: citations.entityId,
        })
        .from(citations)
        .where(
          and(eq(citations.entityType, "master_biography"), eq(citations.entityId, biographyRow.id))
        )
    : [];
  const teachingCitationRows =
    teachingRows.length > 0
      ? await db
          .select({
            entityType: citations.entityType,
            entityId: citations.entityId,
          })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "teaching"),
              inArray(
                citations.entityId,
                teachingRows.map((teaching) => teaching.id)
              )
            )
          )
      : [];
  const mediaCitationRows =
    mediaRows.length > 0
      ? await db
          .select({
            entityType: citations.entityType,
            entityId: citations.entityId,
          })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "media_asset"),
              inArray(
                citations.entityId,
                mediaRows.map((asset) => asset.id)
              )
            )
          )
      : [];

  const sourceIds = Array.from(new Set(citationRows.map((citation) => citation.sourceId)));
  const sourceRows =
    sourceIds.length > 0
      ? await db
          .select({
            id: sources.id,
            title: sources.title,
            reliability: sources.reliability,
            url: sources.url,
          })
          .from(sources)
          .where(inArray(sources.id, sourceIds))
      : [];
  const sourceMap = new Map(sourceRows.map((source) => [source.id, source]));
  const itemCitationKeys = buildCitationKeySet([
    ...biographyCitationRows,
    ...teachingCitationRows,
    ...mediaCitationRows,
  ]);
  const publishedBiography =
    biographyRow && isPublishedBiography(biographyRow.id, itemCitationKeys)
      ? biographyRow.content
      : null;
  const publishedTeachings = teachingRows.filter((teaching) =>
    isPublishedTeaching(teaching, itemCitationKeys)
  );
  const withheldTeachingCount = teachingRows.length - publishedTeachings.length;
  const publishedImage = getPublishedImageAsset(mediaRows, itemCitationKeys);

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/masters" className="nav-link">
          Masters
        </Link>
        <h1 className="page-title">{primaryName}</h1>
      </header>

      <div className="detail-layout">
        <section className="detail-hero">
          {publishedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publishedImage.src}
              alt={publishedImage.altText ?? primaryName}
              className="detail-hero-image"
            />
          )}
          <p className="detail-eyebrow">
            {schoolRow ? (
              <Link className="detail-inline-link" href={`/schools/${schoolRow.slug}`}>
                {schoolRow.name}
              </Link>
            ) : (
              "Unassigned school"
            )}
          </p>
          <h2 className="detail-title">{primaryName}</h2>
          <p className="detail-subtitle">{formatLifeRange(master)}</p>
          <div className="detail-actions">
            <Link
              className="detail-button"
              href={`/lineage?focus=${master.slug}${schoolRow ? `&school=${schoolRow.slug}` : ""}`}
            >
              Show in lineage
            </Link>
            {schoolRow && (
              <Link
                className="detail-button detail-button-muted"
                href={`/schools/${schoolRow.slug}`}
              >
                View school
              </Link>
            )}
          </div>
          {publishedBiography && (
            <div className="detail-summary">
              {publishedBiography.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Names</h3>
          <div className="detail-name-list">
            {orderedNames.map((name) => (
              <div
                key={`${name.locale}:${name.nameType}:${name.value}`}
                className="detail-name-row"
              >
                <span className="detail-name-meta">
                  {name.nameType} · {name.locale}
                </span>
                <span className="detail-name-value">{name.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Lineage</h3>
          <div className="detail-columns">
            <div>
              <h4 className="detail-subsection-title">Teachers</h4>
              {teachers.length === 0 ? (
                <p className="detail-muted">No linked teacher records yet.</p>
              ) : (
                <ul className="detail-link-list">
                  {teachers.map((teacher) => (
                    <li key={teacher.transmissionId}>
                      <Link href={`/masters/${teacher.counterpartSlug}`}>
                        {nameMap.get(teacher.counterpartId) ?? teacher.counterpartSlug}
                      </Link>
                      <span className="detail-list-meta">
                        {teacher.type} · {formatLifeRange(teacher)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="detail-subsection-title">Students</h4>
              {students.length === 0 ? (
                <p className="detail-muted">No linked student records yet.</p>
              ) : (
                <ul className="detail-link-list">
                  {students.map((student) => (
                    <li key={student.transmissionId}>
                      <Link href={`/masters/${student.counterpartSlug}`}>
                        {nameMap.get(student.counterpartId) ?? student.counterpartSlug}
                      </Link>
                      <span className="detail-list-meta">
                        {student.type} · {formatLifeRange(student)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Teachings</h3>
          {publishedTeachings.length === 0 ? (
            <p className="detail-muted">
              {withheldTeachingCount > 0
                ? "Teaching records exist for this master, but they are withheld until item-level citations are attached."
                : "No quotes, koans, or teaching excerpts have been imported for this master yet."}
            </p>
          ) : (
            <ul className="detail-source-list">
              {publishedTeachings.map((teaching) => {
                const roles = rolesByTeachingId.get(teaching.id) ?? [];
                const collectionBadge =
                  teaching.type === "koan" && teaching.collection && teaching.caseNumber
                    ? `${teaching.collection} Case ${teaching.caseNumber}`
                    : null;
                const translatorLine =
                  teaching.translator
                    ? `tr. ${teaching.translator}${teaching.edition ? `, ${teaching.edition}` : ""}`
                    : null;
                const attributionTag =
                  teaching.attributionStatus === "traditional"
                    ? "(traditional attribution)"
                    : teaching.attributionStatus === "unresolved"
                      ? "(unresolved attribution)"
                      : null;

                return (
                  <li key={teaching.id}>
                    <div className="detail-source-heading">
                      <span>{teaching.type ?? "teaching"}</span>
                      <span>{teaching.title ?? "Untitled teaching"}</span>
                    </div>
                    {collectionBadge && (
                      <p className="detail-list-meta">{collectionBadge}</p>
                    )}
                    {attributionTag && (
                      <p className="detail-list-meta">{attributionTag}</p>
                    )}
                    {teaching.content ? (
                      <p className="detail-source-excerpt">{teaching.content}</p>
                    ) : (
                      <p className="detail-muted">
                        Teaching metadata exists, but no English text has been imported yet.
                      </p>
                    )}
                    {translatorLine && (
                      <p className="detail-list-meta">{translatorLine}</p>
                    )}
                    {roles.length > 0 && (
                      <p className="detail-list-meta">
                        {roles
                          .map(
                            (r) =>
                              `${r.role.charAt(0).toUpperCase()}${r.role.slice(1)}: ${roleNameMap.get(r.masterId) ?? r.masterId}`
                          )
                          .join(", ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Master Record Sources</h3>
          {citationRows.length === 0 ? (
            <p className="detail-muted">No citations attached yet.</p>
          ) : (
            <ul className="detail-source-list">
              {citationRows.map((citation) => {
                const source = sourceMap.get(citation.sourceId);
                return (
                  <li key={citation.id}>
                    <div className="detail-source-heading">
                      <span>{citation.fieldName ?? "record"}</span>
                      {source?.title &&
                        (source.url ? (
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
                        ))}
                    </div>
                    {citation.excerpt && (
                      <p className="detail-source-excerpt">{citation.excerpt}</p>
                    )}
                    {source?.reliability && (
                      <p className="detail-list-meta">Reliability: {source.reliability}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {publishedImage?.attribution && (
            <p className="detail-list-meta" style={{ fontSize: "0.7rem", marginTop: "1rem" }}>
              Image: {publishedImage.attribution}
              {publishedImage.license ? ` · ${publishedImage.license}` : ""}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
