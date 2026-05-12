import type { Metadata } from "next";
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
import { renderProseWithFootnotes, type FootnoteRef } from "@/lib/footnotes";
import { buildSutraLinkTerms } from "@/lib/linkify-mentions";
import { loadMasterLinkTerms } from "@/lib/linkify-mentions-server";
import CiteThis from "@/components/CiteThis";
import { like } from "drizzle-orm";
import { AccuracyFooter, type AccuracyField } from "@/components/AccuracyFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
  personSchema,
} from "@/lib/seo/jsonld";

type Confidence = "high" | "medium" | "low" | null;

function asConfidence(value: string | null | undefined): Confidence {
  if (value === "high" || value === "medium" || value === "low") return value;
  return null;
}

/**
 * Tradition-specific term for "formal Dharma transmission", based on
 * the master's school slug. Used as the parenthetical in the master
 * detail page's "Formal Dharma transmission (X):" heading. Returns
 * null when the school doesn't have a settled term and we should
 * fall back to the bare English label.
 *
 *   Japanese Sōtō and its Western branches → shihō
 *   Japanese Rinzai (Ōtōkan / Daitoku-ji / Myōshin-ji)
 *      and the Hottō and Ōbaku lines → inka
 *   Korean Sŏn (Jogye / Taego / Kwan Um) → inga
 *   Vietnamese Thiền (Lâm Tế / Trúc Lâm / Plum Village) → ấn khả
 *   Chinese Chan (the historical houses) → chuanfa
 */
function transmissionTermFor(schoolSlug: string | null): string | null {
  if (!schoolSlug) return null;
  const s = schoolSlug.toLowerCase();
  if (
    s === "soto" ||
    s === "white-plum-asanga" ||
    s === "ordinary-mind" ||
    s === "mountains-rivers"
  ) {
    return "shihō";
  }
  if (
    s === "rinzai" ||
    s === "obaku" ||
    s === "sanbo-zen" ||
    s === "sanbo-kyodan" ||
    s === "diamond-sangha"
  ) {
    return "inka";
  }
  if (
    s === "seon" ||
    s === "jogye" ||
    s === "taego-order" ||
    s === "kwan-um"
  ) {
    return "inga";
  }
  if (
    s === "thien" ||
    s === "lam-te" ||
    s === "truc-lam" ||
    s === "plum-village"
  ) {
    return "ấn khả";
  }
  if (
    s === "chan" ||
    s === "caodong" ||
    s === "linji" ||
    s === "hongzhou" ||
    s === "yangqi" ||
    s === "huanglong" ||
    s === "fayan" ||
    s === "yunmen" ||
    s === "guiyang"
  ) {
    return "chuanfa";
  }
  return null;
}

function citationCountForField(
  rows: { fieldName: string | null }[],
  fieldName: string
): number {
  return rows.filter((r) => r.fieldName === fieldName).length;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const rows = await db
    .select({
      id: masters.id,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters)
    .where(eq(masters.slug, slug))
    .limit(1);

  const master = rows[0];
  if (!master) return {};

  const names = await db
    .select({ value: masterNames.value, nameType: masterNames.nameType })
    .from(masterNames)
    .where(and(eq(masterNames.masterId, master.id), eq(masterNames.locale, "en")));

  const primaryName = names.find((n) => n.nameType === "dharma")?.value ?? slug;

  const allNames = names.map((n) => n.value);

  // Native-script variant (Japanese kanji, Chinese hanzi, Korean
  // hangul, or Vietnamese with diacritics) — appended to the page
  // <title> so non-English queries hit the same page. Drives queries
  // like "道元", "盤珪永琢", "Pháp Loa".
  const nativeNameRows = await db
    .select({ value: masterNames.value, locale: masterNames.locale })
    .from(masterNames)
    .where(and(eq(masterNames.masterId, master.id)));
  const nativeName =
    nativeNameRows.find(
      (n) =>
        (n.locale === "ja" || n.locale === "zh" || n.locale === "ko") &&
        /[　-鿿가-힯]/.test(n.value)
    )?.value ?? null;

  const titleWithNative = nativeName ? `${primaryName} (${nativeName})` : primaryName;

  const schoolRow = master.schoolId
    ? (
        await db
          .select({ name: schoolNames.value, slug: schools.slug })
          .from(schools)
          .leftJoin(
            schoolNames,
            and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
          )
          .where(eq(schools.id, master.schoolId))
          .limit(1)
      )[0]
    : null;

  const bioRows = await db
    .select({ id: masterBiographies.id, content: masterBiographies.content })
    .from(masterBiographies)
    .where(and(eq(masterBiographies.masterId, master.id), eq(masterBiographies.locale, "en")))
    .limit(1);

  const bioRow = bioRows[0];
  let bioPublished = false;
  if (bioRow) {
    const bioCites = await db
      .select({ entityId: citations.entityId })
      .from(citations)
      .where(and(eq(citations.entityType, "master_biography"), eq(citations.entityId, bioRow.id)))
      .limit(1);
    bioPublished = bioCites.length > 0;
  }

  const imageRows = await db
    .select({
      id: mediaAssets.id,
      storagePath: mediaAssets.storagePath,
      sourceUrl: mediaAssets.sourceUrl,
      type: mediaAssets.type,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.entityType, "master"), eq(mediaAssets.entityId, master.id)));

  let ogImage: string | undefined;
  if (imageRows.length > 0) {
    const citedImages = await db
      .select({ entityId: citations.entityId })
      .from(citations)
      .where(
        and(
          eq(citations.entityType, "media_asset"),
          inArray(
            citations.entityId,
            imageRows.map((r) => r.id)
          )
        )
      );
    const citedSet = new Set(citedImages.map((c) => c.entityId));
    const pubImage = imageRows.find(
      (r) => r.type === "image" && citedSet.has(r.id) && (r.storagePath || r.sourceUrl)
    );
    if (pubImage) {
      const src = pubImage.storagePath?.trim() || pubImage.sourceUrl?.trim() || undefined;
      if (src) ogImage = src;
    }
  }

  const datesStr =
    master.birthYear && master.deathYear
      ? ` (${master.birthYear}–${master.deathYear})`
      : master.deathYear
        ? ` (d. ${master.deathYear})`
        : "";

  const schoolStr = schoolRow?.name ? `, ${schoolRow.name} school` : "";

  // Disciple count for the description — drives "[master] disciples"
  // type queries. Only counted, not enumerated, to keep description
  // short.
  const studentCountRows = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(eq(masterTransmissions.teacherId, master.id));
  const studentCount = studentCountRows.length;
  const teacherCountRows = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(eq(masterTransmissions.studentId, master.id));
  const teacherCount = teacherCountRows.length;

  const lineageHints: string[] = [];
  if (studentCount > 0) {
    lineageHints.push(
      `${studentCount} named ${studentCount === 1 ? "disciple" : "disciples"}`
    );
  }
  if (teacherCount > 0) {
    lineageHints.push(
      `${teacherCount} ${teacherCount === 1 ? "teacher" : "teachers"}`
    );
  }
  const lineageStr =
    lineageHints.length > 0 ? ` (${lineageHints.join("; ")})` : "";

  const defaultDesc = `${primaryName}${datesStr} — Zen Buddhist master${schoolStr}${lineageStr}.`;

  let description = defaultDesc;
  if (bioPublished && bioRow?.content) {
    const firstParagraph = bioRow.content.split("\n\n")[0] ?? bioRow.content;
    // If the bio doesn't already mention disciples and we have any,
    // append the lineage hint so the description carries the
    // relational signal even when the first paragraph is purely
    // biographical.
    const bioLooksRelational = /disciple|student|successor|dharma heir/i.test(
      firstParagraph
    );
    const baseDesc =
      firstParagraph.length > 160
        ? firstParagraph.slice(0, 157) + "..."
        : firstParagraph;
    description =
      !bioLooksRelational && lineageStr && baseDesc.length + lineageStr.length < 220
        ? baseDesc.replace(/\.?$/, "") + lineageStr + "."
        : baseDesc;
  }

  const canonicalUrl = `https://zenlineage.org/masters/${slug}`;
  const ogImages = ogImage ? [{ url: ogImage }] : [];

  return {
    title: titleWithNative,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${titleWithNative} — Zen Buddhist Master`,
      description,
      url: canonicalUrl,
      type: "profile",
      images: ogImages,
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title: `${titleWithNative} — Zen Lineage`,
      description,
      images: ogImages.map((img) => img.url),
    },
    other: {
      // Store alternate names for JSON-LD use (not a real meta tag, just a hint)
      ...(allNames.length > 1 ? {} : {}),
    },
  };
}

export async function generateStaticParams() {
  const allMasters = await db.select({ slug: masters.slug }).from(masters);
  return allMasters.map((m) => ({ slug: m.slug }));
}

export default async function MasterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      birthConfidence: masters.birthConfidence,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
      deathConfidence: masters.deathConfidence,
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

  // Dedupe canonical name forms — historical imports left lowercase
  // duplicates of names already present in proper case ("dogen" vs
  // "Dogen", "yongping daoyuan" vs "Yongping Daoyuan"). Prefer the form
  // with leading uppercase + diacritics; treat case-only differences as
  // the same name.
  const sortedRaw = names.sort((a, b) => {
    const rank = (nameType: string) =>
      ({ dharma: 0, honorific: 1, alias: 2, birth: 3 })[nameType] ?? 9;
    return rank(a.nameType) - rank(b.nameType) || a.value.localeCompare(b.value);
  });
  const seenNameKeys = new Set<string>();
  const orderedNames = sortedRaw
    .map((n) => {
      // Prefer the variant that already has any uppercase letter — drop
      // its lowercase twin. Compare on a normalised key (lowercased,
      // diacritics stripped) so "Dōgen" and "dogen" collapse together.
      const key = `${n.locale}:${n.nameType}:${n.value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()}`;
      return { ...n, _key: key };
    })
    .sort((a, b) => {
      // Prefer mixed-case (has uppercase) over all-lowercase as the
      // surviving entry for each duplicate key.
      const aHasUpper = a.value !== a.value.toLowerCase();
      const bHasUpper = b.value !== b.value.toLowerCase();
      if (aHasUpper !== bHasUpper) return aHasUpper ? -1 : 1;
      return 0;
    })
    .filter((n) => {
      if (seenNameKeys.has(n._key)) return false;
      seenNameKeys.add(n._key);
      return true;
    })
    // Re-sort back to the original display order (rank, alpha)
    .sort((a, b) => {
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
      isPrimary: masterTransmissions.isPrimary,
      notes: masterTransmissions.notes,
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
      slug: teachings.slug,
      type: teachings.type,
      title: teachingContent.title,
      content: teachingContent.content,
      caseNumber: teachings.caseNumber,
      collection: teachings.collection,
      era: teachings.era,
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

  // Footnote citations: rows whose `field_name` is `footnote:N`. The
  // master detail page renders the biography prose with `[N]` markers
  // resolved against this list. If a biography has no footnotes the
  // renderer falls back to plain `<p>` paragraphs.
  const biographyFootnoteRows = biographyRow
    ? await db
        .select({
          fieldName: citations.fieldName,
          excerpt: citations.excerpt,
          pageOrSection: citations.pageOrSection,
          sourceId: citations.sourceId,
          sourceTitle: sources.title,
          sourceUrl: sources.url,
          sourceAuthor: sources.author,
        })
        .from(citations)
        .innerJoin(sources, eq(sources.id, citations.sourceId))
        .where(
          and(
            eq(citations.entityType, "master_biography"),
            eq(citations.entityId, biographyRow.id),
            like(citations.fieldName, "footnote:%")
          )
        )
    : [];
  const biographyFootnoteRefs: FootnoteRef[] = [];
  for (const row of biographyFootnoteRows) {
    const match = /^footnote:(\d+)$/.exec(row.fieldName ?? "");
    if (!match) continue;
    biographyFootnoteRefs.push({
      index: parseInt(match[1], 10),
      sourceTitle: row.sourceTitle ?? row.sourceId,
      sourceUrl: row.sourceUrl ?? null,
      author: row.sourceAuthor ?? null,
      pageOrSection: row.pageOrSection ?? null,
      excerpt: row.excerpt && row.excerpt.length > 0 ? row.excerpt : null,
    });
  }
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

  // Auto-link mentions of *other* masters and any sūtras inside the
  // biography prose. Self-link is suppressed by passing the current
  // master id to the term builder.
  const bioLinkTerms = publishedBiography
    ? [
        ...(await loadMasterLinkTerms({ excludeMasterId: master.id })),
        ...buildSutraLinkTerms(),
      ]
    : [];
  // Whole-text "works" (Shōbōgenzō, Fukanzazengi, Linji Lu…) are modelled
  // as teachings with type='work'. They get a dedicated section above the
  // finer-grained sayings/koans/verses so a reader landing on a master's
  // page can find what the master actually wrote without scrolling past
  // every individual proverb attributed to them.
  const publishedTeachingsAll = teachingRows.filter((teaching) =>
    isPublishedTeaching(teaching, itemCitationKeys)
  );
  const publishedWorks = publishedTeachingsAll.filter((t) => t.type === "work");
  const publishedTeachings = publishedTeachingsAll.filter((t) => t.type !== "work");
  const withheldTeachingCount =
    teachingRows.length - publishedTeachingsAll.length;
  const publishedImage = getPublishedImageAsset(mediaRows, itemCitationKeys);

  // Sibling masters — others in the same school, excluding the current
  // master, deterministic chronological order. Used for both the
  // "Other masters in this school" related section and the JSON-LD's
  // implied lineage neighborhood. Capped at 6.
  const siblingMasters = master.schoolId
    ? (
        await db
          .select({
            id: masters.id,
            slug: masters.slug,
            birthYear: masters.birthYear,
            deathYear: masters.deathYear,
          })
          .from(masters)
          .where(eq(masters.schoolId, master.schoolId))
      )
        .filter((m) => m.id !== master.id)
        .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999))
    : [];
  const siblingIds = siblingMasters.map((m) => m.id);
  const siblingNameRows =
    siblingIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            value: masterNames.value,
            nameType: masterNames.nameType,
          })
          .from(masterNames)
          .where(and(inArray(masterNames.masterId, siblingIds), eq(masterNames.locale, "en")))
      : [];
  const siblingNameMap = new Map<string, string>();
  for (const row of siblingNameRows) {
    if (row.nameType === "dharma" && !siblingNameMap.has(row.masterId)) {
      siblingNameMap.set(row.masterId, row.value);
    }
  }
  for (const row of siblingNameRows) {
    if (!siblingNameMap.has(row.masterId)) {
      siblingNameMap.set(row.masterId, row.value);
    }
  }
  const relatedSchoolMasters = siblingMasters.slice(0, 6).map((m) => ({
    ...m,
    name: siblingNameMap.get(m.id) ?? m.slug,
  }));

  const canonicalUrl = abs(`/masters/${master.slug}`);

  const bioFirstParagraph = publishedBiography
    ? (publishedBiography.split("\n\n")[0] ?? publishedBiography)
    : null;

  const personLd = personSchema({
    name: primaryName,
    slug: master.slug,
    alternateNames: orderedNames
      .filter((n) => n.value !== primaryName)
      .map((n) => n.value),
    birthYear: master.birthYear,
    deathYear: master.deathYear,
    description: bioFirstParagraph,
    image: publishedImage?.src,
    school: schoolRow ? { slug: schoolRow.slug, name: schoolRow.name ?? schoolRow.slug } : null,
    teachers: teachers.map((t) => ({
      slug: t.counterpartSlug,
      name: nameMap.get(t.counterpartId) ?? t.counterpartSlug,
    })),
    students: students.map((s) => ({
      slug: s.counterpartSlug,
      name: nameMap.get(s.counterpartId) ?? s.counterpartSlug,
    })),
  });

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Masters", url: abs("/masters") },
    { name: primaryName, url: canonicalUrl },
  ]);

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString([personLd, breadcrumbLd]) }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/masters" className="nav-link">
          Masters
        </Link>
        <h1 className="page-title">{primaryName}</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Masters", href: "/masters" },
          { name: primaryName },
        ]}
      />


      <div className="detail-layout">
        <section className="detail-hero">
          {publishedImage && (
            <figure className="detail-hero-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publishedImage.src}
                alt={publishedImage.altText ?? primaryName}
                className={
                  publishedImage.type === "placeholder"
                    ? "detail-hero-image detail-hero-placeholder"
                    : "detail-hero-image"
                }
              />
              {publishedImage.type !== "placeholder" && (
                <figcaption className="figure-credit">
                  {publishedImage.attribution ?? "Portrait via Wikipedia / Commons"}
                  {publishedImage.license ? ` · ${publishedImage.license}` : ""}
                </figcaption>
              )}
            </figure>
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
              href={`/lineage/${master.slug}`}
            >
              Lineage of {primaryName}
            </Link>
            {schoolRow && (
              <Link
                className="detail-button detail-button-muted"
                href={`/schools/${schoolRow.slug}`}
              >
                {schoolRow.name} school
              </Link>
            )}
          </div>
          {publishedBiography && (
            <div className="detail-summary">
              {renderProseWithFootnotes(publishedBiography, biographyFootnoteRefs, {
                idScope: master.slug,
                linkify: bioLinkTerms,
              })}
            </div>
          )}
        </section>

        <section className="detail-card">
          <h4 className="detail-subsection-title">Names</h4>
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

        {students.length > 0 && (
          <section className="detail-card" id="disciples">
            <h3 className="detail-section-title">
              Disciples of {primaryName}{" "}
              <span className="detail-list-meta">
                {students.length} named
              </span>
            </h3>
            <ul className="detail-link-list">
              {students.map((s) => (
                <li key={s.transmissionId}>
                  <Link href={`/masters/${s.counterpartSlug}`}>
                    {nameMap.get(s.counterpartId) ?? s.counterpartSlug}
                  </Link>
                  <span className="detail-list-meta">
                    {s.type} · {formatLifeRange(s)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {teachers.length > 0 && (() => {
          // Split incoming edges into three display buckets. The model
          // we settled on (after discussing the Deshimaru-line cases
          // with the user) prefers the practitioner / lived-lineage
          // view: `primary` means root teacher / master (the relation
          // of long discipleship), and a SEPARATE labelled "Formal
          // Dharma transmission (shihō)" section calls out the special
          // case where formal sh̄ho was conferred by a different
          // master (often posthumously, in Japan).
          //
          //   1. "Teacher / root master:" — primary edges (and any
          //      `disputed` edges; plus `dharma` editorial-bridge
          //      fallbacks shown only when no primary edge exists).
          //   2. "Formal Dharma transmission (shihō):" — secondary
          //      edges whose `notes` field flags them as shihō (the
          //      seed-shiho-corrections.ts script prefixes those
          //      notes with "Formal Dharma transmission (shihō)").
          //   3. "Additional teachers:" — any remaining secondary
          //      edges (brief / additional teachers, not flagged as
          //      shihō).
          const primaryEdges = teachers.filter((t) => t.type === "primary");
          const disputedEdges = teachers.filter((t) => t.type === "disputed");
          const dharmaEdges = teachers.filter((t) => t.type === "dharma");
          const secondaryEdges = teachers.filter((t) => t.type === "secondary");

          const isShihoNote = (notes: string | null) =>
            typeof notes === "string" && /formal dharma transmission|shih[oō]/i.test(notes);

          const shihoEdges = secondaryEdges.filter((t) => isShihoNote(t.notes));
          const otherSecondaryEdges = secondaryEdges.filter((t) => !isShihoNote(t.notes));

          const rootTeacherEdges = [
            ...primaryEdges,
            ...disputedEdges,
            // `dharma` editorial bridges are a fallback — show only
            // when no real primary edge exists.
            ...(primaryEdges.length === 0 ? dharmaEdges : []),
          ];

          const renderTeacherItem = (t: (typeof teachers)[number]) => {
            const relationshipLabel =
              t.type === "primary"
                ? "Root teacher / master"
                : t.type === "secondary"
                  ? isShihoNote(t.notes)
                    ? "Formal Dharma transmission (shihō)"
                    : "additional teacher"
                  : t.type === "dharma"
                    ? "Dharma transmission (editorial bridge)"
                    : t.type === "disputed"
                      ? "transmission disputed"
                      : t.type;
            const subLine = t.notes && t.notes.trim().length > 0 ? t.notes : relationshipLabel;
            return (
              <li key={t.transmissionId}>
                <Link
                  href={`/masters/${t.counterpartSlug}`}
                  title={relationshipLabel}
                >
                  {nameMap.get(t.counterpartId) ?? t.counterpartSlug}
                </Link>
                <span className="detail-list-meta">
                  {subLine} · {formatLifeRange(t)}
                </span>
              </li>
            );
          };

          return (
            <section className="detail-card" id="lineage">
              <h3 className="detail-section-title">
                Teachers and lineage of {primaryName}
              </h3>
              {rootTeacherEdges.length > 0 && (
                <>
                  <h4 className="detail-subsection-title">
                    {rootTeacherEdges.length === 1 ? "Teacher / root master:" : "Teachers / root masters:"}
                  </h4>
                  <ul className="detail-link-list">
                    {rootTeacherEdges.map(renderTeacherItem)}
                  </ul>
                </>
              )}
              {shihoEdges.length > 0 && (
                <>
                  <h4
                    className="detail-subsection-title"
                    style={rootTeacherEdges.length > 0 ? { marginTop: "1.2rem" } : undefined}
                  >
                    {(() => {
                      // Tradition-specific term for "formal Dharma
                      // transmission" based on the disciple's school.
                      // Falls back to the generic English label when
                      // the school doesn't have a settled term.
                      const term = transmissionTermFor(schoolRow?.slug ?? null);
                      return term
                        ? `Formal Dharma transmission (${term}):`
                        : "Formal Dharma transmission:";
                    })()}
                  </h4>
                  <ul className="detail-link-list">
                    {shihoEdges.map(renderTeacherItem)}
                  </ul>
                </>
              )}
              {otherSecondaryEdges.length > 0 && (
                <>
                  <h4
                    className="detail-subsection-title"
                    style={
                      rootTeacherEdges.length > 0 || shihoEdges.length > 0
                        ? { marginTop: "1.2rem" }
                        : undefined
                    }
                  >
                    Additional teachers:
                  </h4>
                  <ul className="detail-link-list">
                    {otherSecondaryEdges.map(renderTeacherItem)}
                  </ul>
                </>
              )}
              <p className="detail-list-meta" style={{ marginTop: "0.8rem" }}>
                <Link
                  className="detail-inline-link"
                  href={`/lineage/${master.slug}`}
                >
                  Full lineage of {primaryName} &rarr;
                </Link>
              </p>
            </section>
          );
        })()}

        {publishedWorks.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Works</h3>
            <ul className="detail-source-list">
              {publishedWorks.map((work) => (
                <li key={work.id}>
                  <div className="detail-source-heading">
                    <span>{work.collection ?? "work"}</span>
                    <Link
                      href={`/teachings/${work.slug}`}
                      className="detail-inline-link"
                    >
                      {work.title ?? "Untitled work"}
                    </Link>
                  </div>
                  {work.era && <p className="detail-list-meta">{work.era}</p>}
                  {work.content && (
                    <p className="detail-source-excerpt">{work.content}</p>
                  )}
                  {work.translator && (
                    <p className="detail-list-meta">
                      tr. {work.translator}
                      {work.edition ? `, ${work.edition}` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(publishedTeachings.length > 0 || withheldTeachingCount > 0) && (
          <section className="detail-card">
            <h3 className="detail-section-title">Teachings</h3>
            {publishedTeachings.length === 0 ? (
              <p className="detail-muted">
                Teaching records exist for this master, but they are withheld until item-level
                citations are attached.
              </p>
            ) : (
              <ul className="detail-source-list">
                {publishedTeachings.map((teaching) => {
                  const roles = rolesByTeachingId.get(teaching.id) ?? [];
                  const collectionBadge =
                    teaching.type === "koan" && teaching.collection && teaching.caseNumber
                      ? `${teaching.collection} Case ${teaching.caseNumber}`
                      : null;
                  const translatorLine = teaching.translator
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
                        <Link
                          href={`/teachings/${teaching.slug}`}
                          className="detail-inline-link"
                        >
                          {teaching.title ?? "Untitled teaching"}
                        </Link>
                      </div>
                      {collectionBadge && <p className="detail-list-meta">{collectionBadge}</p>}
                      {attributionTag && <p className="detail-list-meta">{attributionTag}</p>}
                      {teaching.content ? (
                        <p className="detail-source-excerpt">{teaching.content}</p>
                      ) : (
                        <p className="detail-muted">
                          Teaching metadata exists, but no English text has been imported yet.
                        </p>
                      )}
                      {translatorLine && <p className="detail-list-meta">{translatorLine}</p>}
                      {roles.length > 0 && (
                        <p className="detail-list-meta">
                          {roles
                            .map((r) => {
                              const name = roleNameMap.get(r.masterId) ?? r.masterId;
                              if (r.role === "attributed_to" || r.role === "speaker") {
                                return name;
                              }
                              const label = r.role
                                .split("_")
                                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                                .join(" ");
                              return `${label}: ${name}`;
                            })
                            .join(", ")}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {relatedSchoolMasters.length > 0 && schoolRow && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Other masters in {schoolRow.name}
            </h3>
            <ul className="detail-link-list">
              {relatedSchoolMasters.map((m) => (
                <li key={m.id}>
                  <Link href={`/masters/${m.slug}`}>{m.name}</Link>
                  <span className="detail-list-meta">
                    {m.birthYear ?? "?"} – {m.deathYear ?? "?"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

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
        </section>

        <CiteThis
          entry={{
            title: primaryName,
            author: "Zen Lineage editorial",
            year: new Date().getUTCFullYear(),
            url: abs(`/masters/${master.slug}`),
            slug: master.slug,
            accessedDate: new Date().toISOString().slice(0, 10),
            note: "Encyclopedia biography",
          }}
        />

        <AccuracyFooter
          entityType="master"
          entitySlug={master.slug}
          entityName={primaryName}
          totalCitations={citationRows.length}
          fields={(
            [
              {
                label: "birth date",
                confidence: asConfidence(master.birthConfidence),
                citationCount:
                  citationCountForField(citationRows, "birth_year") +
                  citationCountForField(citationRows, "birth"),
              },
              {
                label: "death date",
                confidence: asConfidence(master.deathConfidence),
                citationCount:
                  citationCountForField(citationRows, "death_year") +
                  citationCountForField(citationRows, "death"),
              },
              {
                label: "school",
                confidence: master.schoolId ? "medium" : null,
                citationCount: citationCountForField(citationRows, "school_id"),
              },
            ] satisfies AccuracyField[]
          )}
        />
      </div>
    </main>
  );
}
