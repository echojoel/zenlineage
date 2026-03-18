/**
 * Pre-generate static JSON data files for the static export.
 * Run before `next build` to bake API data into public/data/.
 *
 * Usage: npx tsx scripts/generate-static-data.ts
 */
import fs from "fs";
import path from "path";
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
import { and, eq, inArray } from "drizzle-orm";
import {
  buildCitationKeySet,
  getPublishedImageAsset,
  isPublishedBiography,
} from "@/lib/publishable-content";

const OUT_DIR = path.join(process.cwd(), "public", "data");

async function generateGraphData() {
  console.log("Generating graph.json...");

  const [
    mastersData, namesData, transmissionsData,
    schoolsData, schoolNamesData, searchTokenRows,
    bioRows, mediaAssetRows,
  ] = await Promise.all([
    db.select({ id: masters.id, slug: masters.slug, schoolId: masters.schoolId, birthYear: masters.birthYear, birthPrecision: masters.birthPrecision, deathYear: masters.deathYear, deathPrecision: masters.deathPrecision }).from(masters),
    db.select({ masterId: masterNames.masterId, value: masterNames.value, nameType: masterNames.nameType }).from(masterNames).where(eq(masterNames.locale, "en")),
    db.select({ id: masterTransmissions.id, studentId: masterTransmissions.studentId, teacherId: masterTransmissions.teacherId, type: masterTransmissions.type, isPrimary: masterTransmissions.isPrimary }).from(masterTransmissions),
    db.select({ id: schools.id, slug: schools.slug }).from(schools),
    db.select({ schoolId: schoolNames.schoolId, value: schoolNames.value }).from(schoolNames).where(eq(schoolNames.locale, "en")),
    db.select({ entityId: searchTokens.entityId, token: searchTokens.token }).from(searchTokens).where(eq(searchTokens.entityType, "master")),
    db.select({ id: masterBiographies.id, masterId: masterBiographies.masterId, content: masterBiographies.content }).from(masterBiographies).where(eq(masterBiographies.locale, "en")),
    db.select({ id: mediaAssets.id, entityId: mediaAssets.entityId, type: mediaAssets.type, storagePath: mediaAssets.storagePath, sourceUrl: mediaAssets.sourceUrl, altText: mediaAssets.altText, attribution: mediaAssets.attribution, license: mediaAssets.license }).from(mediaAssets).where(eq(mediaAssets.entityType, "master")),
  ]);

  const [biographyCitationRows, mediaCitationRows] = await Promise.all([
    bioRows.length > 0
      ? db.select({ entityType: citations.entityType, entityId: citations.entityId }).from(citations).where(and(eq(citations.entityType, "master_biography"), inArray(citations.entityId, bioRows.map((r) => r.id))))
      : [],
    mediaAssetRows.length > 0
      ? db.select({ entityType: citations.entityType, entityId: citations.entityId }).from(citations).where(and(eq(citations.entityType, "media_asset"), inArray(citations.entityId, mediaAssetRows.map((r) => r.id))))
      : [],
  ]);

  const labelMap = new Map<string, string>();
  for (const n of namesData) { if (n.nameType === "dharma" && !labelMap.has(n.masterId)) labelMap.set(n.masterId, n.value); }
  for (const n of namesData) { if (!labelMap.has(n.masterId)) labelMap.set(n.masterId, n.value); }

  const schoolNameMap = new Map(schoolNamesData.map((s) => [s.schoolId, s.value]));
  const schoolMetaMap = new Map(schoolsData.map((s) => [s.id, { slug: s.slug, name: schoolNameMap.get(s.id) ?? s.slug }]));
  const searchMap = new Map<string, string[]>();
  for (const r of searchTokenRows) { const t = searchMap.get(r.entityId) ?? []; t.push(r.token); searchMap.set(r.entityId, t); }

  const allCitationKeys = buildCitationKeySet([...biographyCitationRows, ...mediaCitationRows]);
  const bioMap = new Map(bioRows.filter((r) => isPublishedBiography(r.id, allCitationKeys)).map((r) => [r.masterId, r.content]));

  const mediaByMasterId = new Map<string, typeof mediaAssetRows>();
  for (const a of mediaAssetRows) { const e = mediaByMasterId.get(a.entityId) ?? []; e.push(a); mediaByMasterId.set(a.entityId, e); }

  const nodes = mastersData.map((m) => {
    const schoolMeta = m.schoolId ? schoolMetaMap.get(m.schoolId) : null;
    const masterAssets = mediaByMasterId.get(m.id) ?? [];
    const publishedImage = getPublishedImageAsset(masterAssets, allCitationKeys);
    return {
      id: m.id, slug: m.slug, label: labelMap.get(m.id) ?? m.slug,
      schoolId: m.schoolId, schoolSlug: schoolMeta?.slug ?? null, schoolName: schoolMeta?.name ?? null,
      birthYear: m.birthYear, birthPrecision: m.birthPrecision, deathYear: m.deathYear, deathPrecision: m.deathPrecision,
      searchText: (searchMap.get(m.id) ?? []).join(" "),
      bio: bioMap.get(m.id) ?? null,
      imageSrc: publishedImage?.src ?? null, imageAlt: publishedImage?.altText ?? null, imageAttribution: publishedImage?.attribution ?? null,
    };
  });

  const edges = transmissionsData.map((t) => ({ id: t.id, source: t.teacherId, target: t.studentId, type: t.type, isPrimary: t.isPrimary ?? false }));
  const schoolList = schoolsData.map((s) => ({ id: s.id, slug: s.slug, name: schoolNameMap.get(s.id) ?? s.slug }));

  return { nodes, edges, schools: schoolList };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const graphData = await generateGraphData();
  fs.writeFileSync(path.join(OUT_DIR, "graph.json"), JSON.stringify(graphData));
  console.log(`  -> ${graphData.nodes.length} nodes, ${graphData.edges.length} edges, ${graphData.schools.length} schools`);

  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
