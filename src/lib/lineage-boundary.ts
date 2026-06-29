/**
 * Lineage publication boundary.
 *
 * The public lineage charts the ancestral transmission up to the founding
 * generation — the émigré pioneers who established each tradition in the West.
 * Living teachers are never published; everyone strictly below a founder is
 * archived (kept in the DB, not shown). This module is the single authored
 * source of that policy. See docs/superpowers/specs/2026-06-29-lineage-boundary-design.md.
 */

export const ROOT_SLUG = "shakyamuni-buddha";

/** Deceased émigré pioneers who established their tradition in the West.
 *  The chart ends here; their successors carry a living tradition. */
export const FOUNDER_SLUGS: string[] = [
  "taisen-deshimaru", // Sōtō → Europe (AZI)
  "shunryu-suzuki", // Sōtō → America (San Francisco Zen Center)
  "taizan-maezumi", // White Plum Asaṅga → America
  "dainin-katagiri", // Sōtō → America (Minnesota Zen Meditation Center)
  "kobun-chino-otogawa", // Sōtō → America (Jikoji / Hokoji)
  "yamada-koun", // Sanbō Kyōdan koan Zen → West
  "seung-sahn", // Korean Sŏn (Kwan Um) → West
  "thich-nhat-hanh", // Vietnamese Thiền (Plum Village) → Europe/West
  "thich-thien-hoa", // Vietnamese (teacher of living Thich Thanh Tu)
];

/** Masters who are living. Never published, independent of graph position. */
export const LIVING_SLUGS: string[] = [
  "thich-thanh-tu",
  "jakusho-kwong",
  "richard-zentatsu-baker",
  "philippe-reiryu-coupey",
  "moriyama-daigyo",
  "hoitsu-suzuki",
  "yamada-ryoun",
  "kishigami-kojun",
  "gerry-shishin-wick",
  "reb-anderson",
  "dennis-genpo-merzel",
  "jan-chozen-bays",
  "yves-shoshin-crettaz",
  "tony-bland",
  "ruben-habito",
  "shohaku-okumura",
  "migaku-sato",
  "jean-pierre-genshu-faure",
  "yvon-myoken-bec",
  "raphael-doko-triet",
  "barbara-kosen-richaudeau",
  "richard-reishin-collins",
  "olivier-reigen-wang-genh",
  "claude-emon-cannizzo",
  "jean-pierre-reiseki-romain",
  "sengyo-van-leuven",
  "konrad-kosan-maquestieau",
  "ivan-densho-quintero",
  "henry-shukman",
  "toshiro-taigen-yamauchi",
  "brad-warner",
  "lluis-nansen-salas",
  "ariadna-dosei-labbate",
];

const FOUNDER_SET = new Set(FOUNDER_SLUGS);
const LIVING_SET = new Set(LIVING_SLUGS);

export function isFounder(slug: string): boolean {
  return FOUNDER_SET.has(slug);
}

export function isLivingMaster(slug: string): boolean {
  return LIVING_SET.has(slug);
}

export interface BoundaryMaster {
  id: string;
  slug: string;
}

export interface BoundaryEdge {
  teacherId: string;
  studentId: string;
}

export interface BoundaryResult {
  livingIds: Set<string>;
  archivedIds: Set<string>;
  publishedIds: Set<string>;
  /** Published nodes NOT reachable from the root via published-only edges. Must be empty. */
  disconnectedPublishedIds: string[];
}

export function computeLineageBoundary(
  masters: BoundaryMaster[],
  edges: BoundaryEdge[],
  options: { founderSlugs?: string[]; livingSlugs?: string[]; rootSlug?: string } = {},
): BoundaryResult {
  const founderSlugs = options.founderSlugs ?? FOUNDER_SLUGS;
  const livingSlugs = options.livingSlugs ?? LIVING_SLUGS;
  const rootSlug = options.rootSlug ?? ROOT_SLUG;

  const idBySlug = new Map(masters.map((m) => [m.slug, m.id]));
  const resolve = (slugs: string[]) =>
    new Set(slugs.map((s) => idBySlug.get(s)).filter((x): x is string => Boolean(x)));

  const founderIds = resolve(founderSlugs);
  const livingIds = resolve(livingSlugs);

  const childrenByTeacher = new Map<string, string[]>();
  for (const e of edges) {
    const list = childrenByTeacher.get(e.teacherId);
    if (list) list.push(e.studentId);
    else childrenByTeacher.set(e.teacherId, [e.studentId]);
  }

  // Strict descendants of the founders.
  const descendants = new Set<string>();
  const queue: string[] = [];
  for (const f of founderIds) queue.push(...(childrenByTeacher.get(f) ?? []));
  while (queue.length) {
    const cur = queue.shift() as string;
    if (descendants.has(cur)) continue;
    descendants.add(cur);
    queue.push(...(childrenByTeacher.get(cur) ?? []));
  }

  // Archived = living ∪ descendants, minus founders (founders always published).
  const archivedIds = new Set<string>([...livingIds, ...descendants]);
  for (const f of founderIds) archivedIds.delete(f);

  const publishedIds = new Set(
    masters.map((m) => m.id).filter((id) => !archivedIds.has(id)),
  );

  // Connectivity. Two BFS walks from the root: one over ALL edges (the graph
  // universe — masters that appear in the public lineage graph today), one over
  // published-only edges. Masters that were never reachable from the root are
  // excluded from the graph elsewhere (and keep their detail pages), so they are
  // NOT flagged here. We only flag a published master that IS part of the graph
  // (reachable via all edges) but whose path to the root was severed by archiving
  // (no longer reachable via published-only edges) — those would otherwise become
  // isolated roots and break the single-root invariant.
  const rootId = idBySlug.get(rootSlug);
  const reachableAll = new Set<string>();
  const reachablePublished = new Set<string>();
  if (rootId) {
    const qAll = [rootId];
    while (qAll.length) {
      const cur = qAll.shift() as string;
      if (reachableAll.has(cur)) continue;
      reachableAll.add(cur);
      for (const c of childrenByTeacher.get(cur) ?? []) qAll.push(c);
    }
    if (publishedIds.has(rootId)) {
      const qPub = [rootId];
      while (qPub.length) {
        const cur = qPub.shift() as string;
        if (reachablePublished.has(cur)) continue;
        reachablePublished.add(cur);
        for (const c of childrenByTeacher.get(cur) ?? []) {
          if (publishedIds.has(c)) qPub.push(c);
        }
      }
    }
  }
  const disconnectedPublishedIds = [...publishedIds].filter(
    (id) => reachableAll.has(id) && !reachablePublished.has(id),
  );

  return { livingIds, archivedIds, publishedIds, disconnectedPublishedIds };
}
