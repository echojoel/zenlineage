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
          .select({ entityType: citations.entityType, entityId: citations.entityId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "master_biography"),
              inArray(
                citations.entityId,
                bioRows.map((r) => r.id)
              )
            )
          )
      : [],
    mediaAssetRows.length > 0
      ? db
          .select({ entityType: citations.entityType, entityId: citations.entityId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "media_asset"),
              inArray(
                citations.entityId,
                mediaAssetRows.map((r) => r.id)
              )
            )
          )
      : [],
  ]);

  const labelMap = new Map<string, string>();
  for (const n of namesData) {
    if (n.nameType === "dharma" && !labelMap.has(n.masterId)) labelMap.set(n.masterId, n.value);
  }
  for (const n of namesData) {
    if (!labelMap.has(n.masterId)) labelMap.set(n.masterId, n.value);
  }

  const schoolNameMap = new Map(schoolNamesData.map((s) => [s.schoolId, s.value]));
  const schoolMetaMap = new Map(
    schoolsData.map((s) => [s.id, { slug: s.slug, name: schoolNameMap.get(s.id) ?? s.slug }])
  );
  const searchMap = new Map<string, string[]>();
  for (const r of searchTokenRows) {
    const t = searchMap.get(r.entityId) ?? [];
    t.push(r.token);
    searchMap.set(r.entityId, t);
  }

  const allCitationKeys = buildCitationKeySet([...biographyCitationRows, ...mediaCitationRows]);
  const bioMap = new Map(
    bioRows
      .filter((r) => isPublishedBiography(r.id, allCitationKeys))
      .map((r) => [r.masterId, r.content])
  );

  const mediaByMasterId = new Map<string, typeof mediaAssetRows>();
  for (const a of mediaAssetRows) {
    const e = mediaByMasterId.get(a.entityId) ?? [];
    e.push(a);
    mediaByMasterId.set(a.entityId, e);
  }

  const nodes = mastersData.map((m) => {
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

  const edges = transmissionsData.map((t) => ({
    id: t.id,
    source: t.teacherId,
    target: t.studentId,
    type: t.type,
    isPrimary: t.isPrimary ?? false,
  }));

  // Public graph invariant:
  // only the lineage component descending from Shakyamuni Buddha is shown.
  // Masters with no sourced path back to that root remain available on detail
  // pages, but are excluded from the public lineage graph until connected.
  const connectedIds = new Set<string>();
  for (const e of edges) {
    connectedIds.add(e.source);
    connectedIds.add(e.target);
  }

  const nodesBySlug = new Map(nodes.map((node) => [node.slug, node]));
  const shakyamuni = nodesBySlug.get("shakyamuni-buddha");
  if (!shakyamuni) {
    throw new Error("Public graph generation requires Shakyamuni Buddha to be present.");
  }

  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) ?? [];
    list.push(edge.target);
    children.set(edge.source, list);
  }

  const reachableFromShakyamuni = new Set<string>([shakyamuni.id]);
  const queue = [shakyamuni.id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const child of children.get(current) ?? []) {
      if (reachableFromShakyamuni.has(child)) continue;
      reachableFromShakyamuni.add(child);
      queue.push(child);
    }
  }

  const publicNodes = nodes.filter((node) => reachableFromShakyamuni.has(node.id));
  const publicEdges = edges.filter(
    (edge) => reachableFromShakyamuni.has(edge.source) && reachableFromShakyamuni.has(edge.target)
  );

  const orphanCount = nodes.length - nodes.filter((n) => connectedIds.has(n.id)).length;
  const disconnectedCount = nodes.length - publicNodes.length - orphanCount;
  if (orphanCount > 0) {
    console.log(`  -> Excluded ${orphanCount} orphan masters (no lineage edges) from graph`);
  }
  if (disconnectedCount > 0) {
    console.log(
      `  -> Excluded ${disconnectedCount} masters not yet connected to the Shakyamuni lineage backbone`
    );
  }

  const publicInDegree = new Map(publicNodes.map((node) => [node.id, 0]));
  for (const edge of publicEdges) {
    publicInDegree.set(edge.target, (publicInDegree.get(edge.target) ?? 0) + 1);
  }
  const publicRoots = publicNodes.filter((node) => (publicInDegree.get(node.id) ?? 0) === 0);
  if (publicRoots.length !== 1 || publicRoots[0]?.id !== shakyamuni.id) {
    throw new Error(
      `Public graph must have exactly one root (Shakyamuni Buddha). Found: ${publicRoots
        .map((node) => node.slug)
        .join(", ")}`
    );
  }

  const schoolList = schoolsData.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: schoolNameMap.get(s.id) ?? s.slug,
  }));

  return { nodes: publicNodes, edges: publicEdges, schools: schoolList };
}

async function generateMastersJson() {
  console.log("Generating api/masters.json...");

  const [mastersData, namesData, transmissionsData, schoolsData, schoolNamesData, bioRows] =
    await Promise.all([
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
          studentId: masterTransmissions.studentId,
          teacherId: masterTransmissions.teacherId,
        })
        .from(masterTransmissions),
      db.select({ id: schools.id, slug: schools.slug }).from(schools),
      db
        .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
        .from(schoolNames)
        .where(eq(schoolNames.locale, "en")),
      db
        .select({
          id: masterBiographies.id,
          masterId: masterBiographies.masterId,
          content: masterBiographies.content,
        })
        .from(masterBiographies)
        .where(eq(masterBiographies.locale, "en")),
    ]);

  const bioCitationRows =
    bioRows.length > 0
      ? await db
          .select({ entityType: citations.entityType, entityId: citations.entityId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "master_biography"),
              inArray(
                citations.entityId,
                bioRows.map((r) => r.id)
              )
            )
          )
      : [];

  const allCitationKeys = buildCitationKeySet(bioCitationRows);

  // Primary name: dharma name first, then any
  const primaryNameMap = new Map<string, string>();
  const allNamesMap = new Map<string, string[]>();
  for (const n of namesData) {
    const existing = allNamesMap.get(n.masterId) ?? [];
    existing.push(n.value);
    allNamesMap.set(n.masterId, existing);
    if (n.nameType === "dharma" && !primaryNameMap.has(n.masterId))
      primaryNameMap.set(n.masterId, n.value);
  }
  for (const n of namesData) {
    if (!primaryNameMap.has(n.masterId)) primaryNameMap.set(n.masterId, n.value);
  }

  const slugMap = new Map(mastersData.map((m) => [m.id, m.slug]));
  const schoolNameMap = new Map(schoolNamesData.map((s) => [s.schoolId, s.value]));
  const schoolSlugMap = new Map(schoolsData.map((s) => [s.id, s.slug]));
  const bioMap = new Map(
    bioRows
      .filter((r) => isPublishedBiography(r.id, allCitationKeys))
      .map((r) => [r.masterId, r.content])
  );

  // Teacher / student relationship maps
  const teacherMap = new Map<string, Array<{ slug: string; name: string }>>();
  const studentMap = new Map<string, Array<{ slug: string; name: string }>>();
  for (const t of transmissionsData) {
    const teacherSlug = slugMap.get(t.teacherId);
    const studentSlug = slugMap.get(t.studentId);
    if (!teacherSlug || !studentSlug) continue;
    const st = teacherMap.get(t.studentId) ?? [];
    if (!st.some((x) => x.slug === teacherSlug)) {
      st.push({ slug: teacherSlug, name: primaryNameMap.get(t.teacherId) ?? teacherSlug });
      teacherMap.set(t.studentId, st);
    }
    const ts = studentMap.get(t.teacherId) ?? [];
    if (!ts.some((x) => x.slug === studentSlug)) {
      ts.push({ slug: studentSlug, name: primaryNameMap.get(t.studentId) ?? studentSlug });
      studentMap.set(t.teacherId, ts);
    }
  }

  /** First paragraph of the biography. */
  function firstParagraph(content: string): string {
    const para = content.split(/\n\n+/)[0];
    return para ? para.trim() : content.slice(0, 400).trim();
  }

  const masterList = mastersData.map((m) => {
    const bio = bioMap.get(m.id);
    return {
      slug: m.slug,
      primaryName: primaryNameMap.get(m.id) ?? m.slug,
      names: allNamesMap.get(m.id) ?? [],
      birthYear: m.birthYear,
      birthPrecision: m.birthPrecision,
      deathYear: m.deathYear,
      deathPrecision: m.deathPrecision,
      schoolSlug: m.schoolId ? (schoolSlugMap.get(m.schoolId) ?? null) : null,
      schoolName: m.schoolId ? (schoolNameMap.get(m.schoolId) ?? null) : null,
      teachers: teacherMap.get(m.id) ?? [],
      students: studentMap.get(m.id) ?? [],
      bio: bio ? firstParagraph(bio) : null,
    };
  });

  const API_DIR = path.join(process.cwd(), "public", "api");
  fs.mkdirSync(API_DIR, { recursive: true });
  fs.writeFileSync(path.join(API_DIR, "masters.json"), JSON.stringify(masterList));
  console.log(`  -> ${masterList.length} masters`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const graphData = await generateGraphData();
  fs.writeFileSync(path.join(OUT_DIR, "graph.json"), JSON.stringify(graphData));
  console.log(
    `  -> ${graphData.nodes.length} nodes, ${graphData.edges.length} edges, ${graphData.schools.length} schools`
  );

  await generateMastersJson();

  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
