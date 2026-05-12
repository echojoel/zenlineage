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
  masterTemples,
  masterTransmissions,
  mediaAssets,
  schools,
  schoolNames,
  searchTokens,
  sources,
  teachings,
  teachingContent,
  templeNames,
  temples,
} from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import {
  buildCitationKeySet,
  getPublishedImageAsset,
  isPublishedBiography,
  isPublishedTeaching,
} from "@/lib/publishable-content";
import { schoolHexColor } from "@/lib/temple-colors";
import { SCHOOL_PRACTICE_TEACHINGS } from "@/lib/practice-instructions";
import { loadPracticeInstructions } from "@/lib/practice-instructions-data";
import { getSchoolDefinitions } from "@/lib/school-taxonomy";
import { buildGlossary, termAnchorId } from "@/lib/glossary-data";
import { countryToSlug } from "@/lib/seo/country-slug";
import type { SearchEntry } from "@/lib/search-types";

const OUT_DIR = path.join(process.cwd(), "public", "data");

const SIDEBAR_BIO_MAX_CHARS = 560;

/**
 * Compact a full biography into the teaser shown in the lineage-graph
 * sidebar. Strips Wikipedia-style `[N]` footnote markers, takes the
 * first paragraph, and trims to a sentence boundary at or under the
 * character cap so the sidebar never has to render the full prose.
 * Full bios remain on /masters/[slug].
 */
function biographyExcerpt(full: string | null | undefined): string | null {
  if (!full) return null;
  const firstParagraph = full.split(/\n\n+/)[0] ?? full;
  const stripped = firstParagraph.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
  if (stripped.length <= SIDEBAR_BIO_MAX_CHARS) return stripped;
  // Prefer cutting at a sentence boundary within the cap.
  const window = stripped.slice(0, SIDEBAR_BIO_MAX_CHARS);
  const lastSentence = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
    window.lastIndexOf("; ")
  );
  if (lastSentence >= SIDEBAR_BIO_MAX_CHARS - 240) {
    return window.slice(0, lastSentence + 1).trim() + " …";
  }
  // Fall back to a word boundary.
  const lastSpace = window.lastIndexOf(" ");
  return (lastSpace > 0 ? window.slice(0, lastSpace) : window).trim() + "…";
}

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
        notes: masterTransmissions.notes,
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
  // The lineage-graph sidebar only has room for a short teaser; the
  // full biography lives on /masters/[slug]. Truncate to the first
  // sentence (or ~280 chars) and strip footnote markers so we don't
  // ship 6 KB of prose into every graph node.
  const bioMap = new Map(
    bioRows
      .filter((r) => isPublishedBiography(r.id, allCitationKeys))
      .map((r) => [r.masterId, biographyExcerpt(r.content)])
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
    // Thumbnails only exist for real photographed portraits (WebP). SVG
    // name-card placeholders are infinitely scalable so we serve the
    // source SVG at every size — browsers rasterize in-place. Any other
    // path (external URL, etc.) gets no thumbnail: the UI falls back to
    // the full-size image.
    const isWebp = publishedImage?.src?.endsWith(".webp") ?? false;
    const isSvgPlaceholder = publishedImage?.src?.endsWith(".svg") ?? false;
    const thumbBase =
      isWebp && publishedImage!.src.startsWith("/masters/")
        ? publishedImage!.src.replace(/\/masters\/([^/]+)\.webp$/, "/masters/thumb/$1")
        : null;
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
      imageThumb48: thumbBase ? `${thumbBase}-48.webp` : isSvgPlaceholder ? publishedImage!.src : null,
      imageThumb96: thumbBase ? `${thumbBase}-96.webp` : isSvgPlaceholder ? publishedImage!.src : null,
      imageThumb200: thumbBase ? `${thumbBase}-200.webp` : isSvgPlaceholder ? publishedImage!.src : null,
      imageAlt: publishedImage?.altText ?? null,
      imageAttribution: publishedImage?.attribution ?? null,
    };
  });

  // shihoConferred: derive from edge type + notes.
  //
  //   The DEFAULT case for a `primary` (isPrimary=true) edge is that
  //   the teacher is BOTH the root teacher and the shihō giver — this
  //   is how most master-disciple lineages work historically. The
  //   marker is drawn on such edges by default.
  //
  //   The KNOWN EXCLUSION is the Deshimaru pattern: a primary edge
  //   that records long discipleship but no shihō from this teacher.
  //   The seed-shiho-corrections.ts script tags those edges with the
  //   leading phrase "Root teacher / master" — we exclude on that.
  //
  //   For SECONDARY edges, the marker is drawn only when the notes
  //   contain an explicit shihō marker ("Formal Dharma transmission"
  //   or the per-tradition equivalent — inka, inga, ấn khả, chuanfa).
  const SHIHO_NOTES_RE = /\b(shih[oō]|inka|inga|ấn\s+khả|chuanfa|传法|傳法|formal\s+dharma\s+transmission)\b/i;
  const ROOT_TEACHER_ONLY_RE = /^\s*root\s+teacher\s*\/\s*master\b/i;
  const edges = transmissionsData.map((t) => {
    const notes = typeof t.notes === "string" ? t.notes : null;
    const isPrimary = t.isPrimary ?? false;
    let shihoConferred = false;
    if (isPrimary && t.type === "primary") {
      // Default: primary edge → shihō was given. Exclude the
      // explicit "root teacher only" pattern.
      shihoConferred = !(notes && ROOT_TEACHER_ONLY_RE.test(notes));
    } else if (notes && SHIHO_NOTES_RE.test(notes)) {
      shihoConferred = true;
    }
    return {
      id: t.id,
      source: t.teacherId,
      target: t.studentId,
      type: t.type,
      isPrimary,
      shihoConferred,
    };
  });

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

async function generateTemplesJson() {
  console.log("Generating temples.json...");

  // Only rows with non-null lat/lng make the map. Drizzle's inArray is used
  // later for the join lookups; initial pull filters geocoded rows only.
  const templeRows = await db
    .select({
      id: temples.id,
      slug: temples.slug,
      lat: temples.lat,
      lng: temples.lng,
      region: temples.region,
      country: temples.country,
      foundedYear: temples.foundedYear,
      foundedPrecision: temples.foundedPrecision,
      status: temples.status,
      schoolId: temples.schoolId,
      founderId: temples.founderId,
      url: temples.url,
    })
    .from(temples)
    .where(and(isNotNull(temples.lat), isNotNull(temples.lng)));

  if (templeRows.length === 0) {
    const empty = { temples: [], schools: [] };
    fs.writeFileSync(path.join(OUT_DIR, "temples.json"), JSON.stringify(empty));
    console.log("  -> 0 temples (table empty; map will render empty state)");
    return empty;
  }

  const templeIds = templeRows.map((t) => t.id);
  const schoolIds = Array.from(
    new Set(templeRows.map((t) => t.schoolId).filter((id): id is string => Boolean(id)))
  );
  const founderIds = Array.from(
    new Set(templeRows.map((t) => t.founderId).filter((id): id is string => Boolean(id)))
  );

  const [
    nameRows,
    schoolMeta,
    schoolNameRows,
    founderRows,
    founderNameRows,
    masterTempleRows,
  ] = await Promise.all([
    db
      .select({ templeId: templeNames.templeId, locale: templeNames.locale, value: templeNames.value })
      .from(templeNames)
      .where(inArray(templeNames.templeId, templeIds)),
    schoolIds.length > 0
      ? db
          .select({ id: schools.id, slug: schools.slug, tradition: schools.tradition })
          .from(schools)
          .where(inArray(schools.id, schoolIds))
      : Promise.resolve([]),
    schoolIds.length > 0
      ? db
          .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
          .from(schoolNames)
          .where(and(inArray(schoolNames.schoolId, schoolIds), eq(schoolNames.locale, "en")))
      : Promise.resolve([]),
    founderIds.length > 0
      ? db
          .select({ id: masters.id, slug: masters.slug })
          .from(masters)
          .where(inArray(masters.id, founderIds))
      : Promise.resolve([]),
    founderIds.length > 0
      ? db
          .select({ masterId: masterNames.masterId, nameType: masterNames.nameType, value: masterNames.value })
          .from(masterNames)
          .where(and(inArray(masterNames.masterId, founderIds), eq(masterNames.locale, "en")))
      : Promise.resolve([]),
    // If a founder isn't set directly on the temple but a master_temples
    // role="founded" row exists, we'll pick that up too.
    db
      .select({ masterId: masterTemples.masterId, templeId: masterTemples.templeId, role: masterTemples.role })
      .from(masterTemples)
      .where(and(inArray(masterTemples.templeId, templeIds), eq(masterTemples.role, "founded"))),
  ]);

  // Source URL fallback: when the temple has no `url`, the popup links to
  // the citation source (SOTOZEN Europe / AZI / Wikipedia etc.). Every
  // temple gets a citation row when seeded, so this map is usually full.
  const sourceRows = await db
    .select({
      entityId: citations.entityId,
      sourceId: citations.sourceId,
      sourceUrl: sources.url,
      sourceTitle: sources.title,
    })
    .from(citations)
    .innerJoin(sources, eq(sources.id, citations.sourceId))
    .where(and(eq(citations.entityType, "temple"), inArray(citations.entityId, templeIds)));
  const sourceByTemple = new Map<string, { url: string | null; title: string | null }>();
  for (const r of sourceRows) {
    if (!sourceByTemple.has(r.entityId)) {
      sourceByTemple.set(r.entityId, { url: r.sourceUrl, title: r.sourceTitle });
    }
  }

  // Build lookup maps
  const englishName = new Map<string, string>();
  const nativeName = new Map<string, string>(); // any non-en locale, first wins
  for (const n of nameRows) {
    if (n.locale === "en" && !englishName.has(n.templeId)) englishName.set(n.templeId, n.value);
    else if (n.locale !== "en" && !nativeName.has(n.templeId)) nativeName.set(n.templeId, n.value);
  }

  const schoolSlugById = new Map(schoolMeta.map((s) => [s.id, s.slug]));
  const schoolTraditionById = new Map(schoolMeta.map((s) => [s.id, s.tradition]));
  const schoolNameById = new Map(schoolNameRows.map((n) => [n.schoolId, n.value]));

  const founderSlugById = new Map(founderRows.map((m) => [m.id, m.slug]));
  const founderDharmaName = new Map<string, string>();
  const founderAnyName = new Map<string, string>();
  for (const n of founderNameRows) {
    if (n.nameType === "dharma" && !founderDharmaName.has(n.masterId))
      founderDharmaName.set(n.masterId, n.value);
    if (!founderAnyName.has(n.masterId)) founderAnyName.set(n.masterId, n.value);
  }

  // If temple.founderId is null but master_temples has a "founded" row, use it.
  const foundedBy = new Map<string, string>();
  for (const row of masterTempleRows) {
    if (!foundedBy.has(row.templeId)) foundedBy.set(row.templeId, row.masterId);
  }

  const features = templeRows.map((t) => {
    const effectiveFounderId = t.founderId ?? foundedBy.get(t.id) ?? null;
    const founderSlug = effectiveFounderId ? founderSlugById.get(effectiveFounderId) ?? null : null;
    const founderName = effectiveFounderId
      ? founderDharmaName.get(effectiveFounderId) ?? founderAnyName.get(effectiveFounderId) ?? null
      : null;
    const schoolSlug = t.schoolId ? schoolSlugById.get(t.schoolId) ?? null : null;
    const schoolName = t.schoolId ? schoolNameById.get(t.schoolId) ?? null : null;
    const src = sourceByTemple.get(t.id) ?? null;
    return {
      slug: t.slug,
      name: englishName.get(t.id) ?? t.slug,
      nativeName: nativeName.get(t.id) ?? null,
      lat: t.lat,
      lng: t.lng,
      region: t.region,
      country: t.country,
      foundedYear: t.foundedYear,
      foundedPrecision: t.foundedPrecision,
      status: t.status,
      schoolSlug,
      schoolName,
      schoolColor: schoolHexColor(schoolSlug),
      founderSlug,
      founderName,
      url: t.url ?? null,
      sourceUrl: src?.url ?? null,
      sourceTitle: src?.title ?? null,
    };
  });

  // Per-school counts for the filter dropdown
  const schoolCounts = new Map<string, number>();
  for (const f of features) {
    if (!f.schoolSlug) continue;
    schoolCounts.set(f.schoolSlug, (schoolCounts.get(f.schoolSlug) ?? 0) + 1);
  }
  const schoolList = schoolMeta
    .filter((s) => (schoolCounts.get(s.slug) ?? 0) > 0)
    .map((s) => ({
      slug: s.slug,
      name: schoolNameById.get(s.id) ?? s.slug,
      tradition: schoolTraditionById.get(s.id) ?? null,
      count: schoolCounts.get(s.slug) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const payload = { temples: features, schools: schoolList };
  fs.writeFileSync(path.join(OUT_DIR, "temples.json"), JSON.stringify(payload));
  console.log(
    `  -> ${features.length} temples across ${schoolList.length} schools`
  );
  return payload;
}

async function generatePracticeInstructionsJson() {
  console.log("Generating practice-instructions.json...");
  const out: Record<string, Awaited<ReturnType<typeof loadPracticeInstructions>>> = {};
  let total = 0;
  for (const schoolSlug of Object.keys(SCHOOL_PRACTICE_TEACHINGS)) {
    const items = await loadPracticeInstructions(schoolSlug);
    if (items.length > 0) {
      out[schoolSlug] = items;
      total += items.length;
    }
  }
  fs.writeFileSync(
    path.join(OUT_DIR, "practice-instructions.json"),
    JSON.stringify(out)
  );
  console.log(
    `  -> ${total} instructions across ${Object.keys(out).length} schools`
  );
}

function clipBlurb(text: string | null | undefined, maxChars = 140): string | undefined {
  if (!text) return undefined;
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxChars) return collapsed;
  return collapsed.slice(0, maxChars - 1).trimEnd() + "…";
}

async function generateSearchIndexJson(
  templesPayload: Awaited<ReturnType<typeof generateTemplesJson>>
) {
  console.log("Generating search-index.json...");

  // 1. Citation gate set — covers both biographies and teachings.
  const citationRows = await db
    .select({
      entityType: citations.entityType,
      entityId: citations.entityId,
    })
    .from(citations);
  const citationKeys = buildCitationKeySet(citationRows);

  const entries: SearchEntry[] = [];

  // 2. Masters — name + native + school + biography first line.
  const masterRows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
    })
    .from(masters);

  const masterNameRows = await db
    .select({
      masterId: masterNames.masterId,
      nameType: masterNames.nameType,
      locale: masterNames.locale,
      value: masterNames.value,
    })
    .from(masterNames);

  const enNameByMaster = new Map<string, string>();
  const nativeNameByMaster = new Map<string, string>();
  for (const n of masterNameRows) {
    if (n.locale === "en" && n.nameType === "dharma" && !enNameByMaster.has(n.masterId)) {
      enNameByMaster.set(n.masterId, n.value);
    }
  }
  for (const n of masterNameRows) {
    if (n.locale === "en" && !enNameByMaster.has(n.masterId)) {
      enNameByMaster.set(n.masterId, n.value);
    }
    if (n.locale !== "en" && !nativeNameByMaster.has(n.masterId)) {
      nativeNameByMaster.set(n.masterId, n.value);
    }
  }

  const schoolNameById = new Map<string, string>();
  for (const r of await db
    .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
    .from(schoolNames)
    .where(eq(schoolNames.locale, "en"))) {
    if (!schoolNameById.has(r.schoolId)) schoolNameById.set(r.schoolId, r.value);
  }

  const bioRows = await db
    .select({
      id: masterBiographies.id,
      masterId: masterBiographies.masterId,
      content: masterBiographies.content,
    })
    .from(masterBiographies)
    .where(eq(masterBiographies.locale, "en"));
  const bioByMaster = new Map<string, { id: string; content: string }>();
  for (const b of bioRows) {
    if (!bioByMaster.has(b.masterId)) {
      bioByMaster.set(b.masterId, { id: b.id, content: b.content ?? "" });
    }
  }

  for (const m of masterRows) {
    const title = enNameByMaster.get(m.id) ?? m.slug;
    const bio = bioByMaster.get(m.id);
    if (!isPublishedBiography(bio?.id ?? null, citationKeys)) continue;
    entries.push({
      type: "master",
      slug: m.slug,
      title,
      nativeTitle: nativeNameByMaster.get(m.id),
      secondary: m.schoolId ? schoolNameById.get(m.schoolId) : undefined,
      blurb: clipBlurb(bio?.content),
      url: `/masters/${m.slug}`,
    });
  }

  // 3. Schools — name + tradition + summary first line.
  for (const s of getSchoolDefinitions()) {
    const blurbSource = s.summary ?? s.practice;
    entries.push({
      type: "school",
      slug: s.slug,
      title: s.name,
      nativeTitle: s.nativeNames
        ? s.nativeNames.zh ?? s.nativeNames.ja ?? s.nativeNames.ko ?? s.nativeNames.vi
        : undefined,
      secondary: s.tradition,
      blurb: clipBlurb(blurbSource?.replace(/\[\d+\]/g, "")),
      url: `/schools/${s.slug}`,
    });
  }

  // 4. Teachings — title + author + content snippet, citation-gated.
  const teachingRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      collection: teachings.collection,
      authorId: teachings.authorId,
      title: teachingContent.title,
      content: teachingContent.content,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(
        eq(teachingContent.teachingId, teachings.id),
        eq(teachingContent.locale, "en")
      )
    );

  for (const t of teachingRows) {
    if (!t.title) continue;
    if (!isPublishedTeaching({ id: t.id }, citationKeys)) continue;
    const authorName = t.authorId ? enNameByMaster.get(t.authorId) : undefined;
    const secondaryParts: string[] = [];
    if (t.collection) secondaryParts.push(t.collection);
    if (authorName) secondaryParts.push(authorName);
    entries.push({
      type: "teaching",
      slug: t.slug,
      title: t.title,
      secondary: secondaryParts.join(" · ") || (t.type ?? undefined),
      blurb: clipBlurb(t.content),
      url: `/teachings/${t.slug}`,
    });
  }

  // 5. Temples — one entry per geocoded temple. The search dialog deep-links
  // to the school's practice page (no per-temple route exists yet); the
  // user lands one click away from the temple card. Entries are slim
  // (no blurb) because the temple list is ~1.6k strong — keep the lazy-
  // loaded index file lean.
  for (const t of templesPayload.temples) {
    const url = t.schoolSlug
      ? `/practice/${t.schoolSlug}`
      : t.country
        ? `/practice/by-country/${countryToSlug(t.country)}`
        : "/practice";
    const secondaryParts: string[] = [];
    if (t.schoolName) secondaryParts.push(t.schoolName);
    if (t.country) secondaryParts.push(t.country);
    entries.push({
      type: "temple",
      slug: t.slug,
      title: t.name,
      nativeTitle: t.nativeName ?? undefined,
      secondary: secondaryParts.join(" · ") || undefined,
      url,
    });
  }

  // 6. Glossary — flatten unique key concepts from school taxonomy.
  const glossary = buildGlossary();
  for (const g of glossary) {
    entries.push({
      type: "glossary",
      slug: g.termKey,
      title: g.displayTerm,
      nativeTitle: g.nativeTerm,
      secondary: g.schools.map((s) => s.name).slice(0, 3).join(" · "),
      blurb: clipBlurb(g.description),
      url: `/glossary#${termAnchorId(g.termKey)}`,
    });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "search-index.json"),
    JSON.stringify(entries)
  );
  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    `  -> ${entries.length} entries (${Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")})`
  );
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const graphData = await generateGraphData();
  fs.writeFileSync(path.join(OUT_DIR, "graph.json"), JSON.stringify(graphData));
  console.log(
    `  -> ${graphData.nodes.length} nodes, ${graphData.edges.length} edges, ${graphData.schools.length} schools`
  );

  await generateMastersJson();
  const templesPayload = await generateTemplesJson();
  await generatePracticeInstructionsJson();
  await generateSearchIndexJson(templesPayload);

  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
