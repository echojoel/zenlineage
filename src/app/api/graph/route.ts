import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  masterBiographies,
  masterNames,
  masterTransmissions,
  mediaAssets,
  schools,
  schoolNames,
  searchTokens,
} from "@/db/schema";
import {
  buildCitationKeySet,
  getPublishedImageAsset,
  isPublishedBiography,
} from "@/lib/publishable-content";

export interface GraphNode {
  id: string;
  slug: string;
  label: string;
  schoolId: string | null;
  schoolSlug: string | null;
  schoolName: string | null;
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
  searchText: string;
  bio: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  imageAttribution?: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  isPrimary: boolean;
}

export interface GraphSchool {
  id: string;
  slug: string;
  name: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  schools: GraphSchool[];
}

export async function GET(): Promise<NextResponse<GraphData>> {
  const [
    mastersData,
    namesData,
    transmissionsData,
    schoolsData,
    schoolNamesData,
    searchTokenRows,
    bioRows,
    mediaAssetRows,
  ] = await Promise.all([
    db
      .select({
        id: masters.id,
        slug: masters.slug,
        schoolId: masters.schoolId,
        birthYear: masters.birthYear,
        birthPrecision: masters.birthPrecision,
        deathYear: masters.deathYear,
        deathPrecision: masters.deathPrecision,
      })
      .from(masters),

    db
      .select({
        masterId: masterNames.masterId,
        value: masterNames.value,
        nameType: masterNames.nameType,
      })
      .from(masterNames)
      .where(eq(masterNames.locale, "en")),

    db
      .select({
        id: masterTransmissions.id,
        studentId: masterTransmissions.studentId,
        teacherId: masterTransmissions.teacherId,
        type: masterTransmissions.type,
        isPrimary: masterTransmissions.isPrimary,
      })
      .from(masterTransmissions),

    db.select({ id: schools.id, slug: schools.slug }).from(schools),

    db
      .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
      .from(schoolNames)
      .where(eq(schoolNames.locale, "en")),

    db
      .select({ entityId: searchTokens.entityId, token: searchTokens.token })
      .from(searchTokens)
      .where(eq(searchTokens.entityType, "master")),

    db
      .select({
        id: masterBiographies.id,
        masterId: masterBiographies.masterId,
        content: masterBiographies.content,
      })
      .from(masterBiographies)
      .where(eq(masterBiographies.locale, "en")),

    db
      .select({
        id: mediaAssets.id,
        entityId: mediaAssets.entityId,
        type: mediaAssets.type,
        storagePath: mediaAssets.storagePath,
        sourceUrl: mediaAssets.sourceUrl,
        altText: mediaAssets.altText,
        attribution: mediaAssets.attribution,
        license: mediaAssets.license,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.entityType, "master")),
  ]);

  const [biographyCitationRows, mediaCitationRows] = await Promise.all([
    bioRows.length > 0
      ? db
          .select({
            entityType: citations.entityType,
            entityId: citations.entityId,
          })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "master_biography"),
              inArray(
                citations.entityId,
                bioRows.map((row) => row.id)
              )
            )
          )
      : Promise.resolve([]),

    mediaAssetRows.length > 0
      ? db
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
                mediaAssetRows.map((row) => row.id)
              )
            )
          )
      : Promise.resolve([]),
  ]);

  const labelMap = new Map<string, string>();
  for (const n of namesData) {
    if (n.nameType === "dharma" && !labelMap.has(n.masterId)) {
      labelMap.set(n.masterId, n.value);
    }
  }
  for (const n of namesData) {
    if (!labelMap.has(n.masterId)) {
      labelMap.set(n.masterId, n.value);
    }
  }

  const edges: GraphEdge[] = transmissionsData.map((t) => ({
    id: t.id,
    source: t.teacherId,
    target: t.studentId,
    type: t.type,
    isPrimary: t.isPrimary ?? false,
  }));

  const schoolNameMap = new Map(schoolNamesData.map((s) => [s.schoolId, s.value]));
  const schoolMetaMap = new Map(
    schoolsData.map((school) => [
      school.id,
      {
        slug: school.slug,
        name: schoolNameMap.get(school.id) ?? school.slug,
      },
    ])
  );

  const searchMap = new Map<string, string[]>();
  for (const row of searchTokenRows) {
    const tokens = searchMap.get(row.entityId) ?? [];
    tokens.push(row.token);
    searchMap.set(row.entityId, tokens);
  }

  const allCitationKeys = buildCitationKeySet([...biographyCitationRows, ...mediaCitationRows]);

  const bioMap = new Map(
    bioRows
      .filter((row) => isPublishedBiography(row.id, allCitationKeys))
      .map((row) => [row.masterId, row.content])
  );

  const mediaByMasterId = new Map<string, typeof mediaAssetRows>();
  for (const asset of mediaAssetRows) {
    const existing = mediaByMasterId.get(asset.entityId) ?? [];
    existing.push(asset);
    mediaByMasterId.set(asset.entityId, existing);
  }

  const nodes: GraphNode[] = mastersData.map((m) => {
    const schoolMeta = m.schoolId ? schoolMetaMap.get(m.schoolId) : null;
    const masterAssets = mediaByMasterId.get(m.id) ?? [];
    const publishedImage = getPublishedImageAsset(masterAssets, allCitationKeys);

    return {
      id: m.id,
      slug: m.slug,
      label: labelMap.get(m.id) ?? m.slug,
      schoolId: m.schoolId,
      schoolSlug: schoolMeta?.slug ?? null,
      schoolName: schoolMeta?.name ?? null,
      birthYear: m.birthYear,
      birthPrecision: m.birthPrecision,
      deathYear: m.deathYear,
      deathPrecision: m.deathPrecision,
      searchText: (searchMap.get(m.id) ?? []).join(" "),
      bio: bioMap.get(m.id) ?? null,
      imageSrc: publishedImage?.src ?? null,
      imageAlt: publishedImage?.altText ?? null,
      imageAttribution: publishedImage?.attribution ?? null,
    };
  });

  const schoolList: GraphSchool[] = schoolsData.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: schoolNameMap.get(s.id) ?? s.slug,
  }));

  return NextResponse.json({ nodes, edges, schools: schoolList });
}
