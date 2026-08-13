/**
 * Shared, process-cached lineage graph for the /lineage/[slug] pages.
 *
 * There are ~466 of these pages and every one of them wants the same three
 * things: the succession chain back to the root, the master's school, and
 * the teachings attributed to them. Querying per page meant one round trip
 * per generation per master — tens of thousands of queries across a build.
 * The whole published graph is small (a few hundred masters, a few hundred
 * transmission edges), so it is cheaper to load it once and walk it in
 * memory.
 *
 * The cache is a module-level promise: Next.js static generation runs in a
 * single process, so every page render after the first reuses it.
 */

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  masterTransmissions,
  teachingContent,
  teachings,
} from "@/db/schema";

export interface LineageMaster {
  id: string;
  slug: string;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

export interface LineageTeaching {
  slug: string;
  title: string;
  type: string | null;
}

interface LineageGraph {
  byId: Map<string, LineageMaster>;
  /** student id → teacher ids, primary edge first. */
  teachersOf: Map<string, string[]>;
  /** teacher id → student ids. */
  studentsOf: Map<string, string[]>;
  /** master id → cited teachings they authored. */
  teachingsByAuthor: Map<string, LineageTeaching[]>;
  /**
   * Masters who transmitted to students that all fall outside the published
   * set. Their page shows no descendants for an editorial reason — the atlas
   * stops at the founding generation — not because the data is missing, and
   * the page should say which.
   */
  successorsBeyondScope: Set<string>;
}

let cached: Promise<LineageGraph> | null = null;

export function getLineageGraph(): Promise<LineageGraph> {
  if (!cached) cached = loadLineageGraph();
  return cached;
}

async function loadLineageGraph(): Promise<LineageGraph> {
  const [masterRows, nameRows, edgeRows] = await Promise.all([
    db
      .select({
        id: masters.id,
        slug: masters.slug,
        birthYear: masters.birthYear,
        deathYear: masters.deathYear,
      })
      .from(masters)
      .where(eq(masters.published, true)),
    db
      .select({
        masterId: masterNames.masterId,
        nameType: masterNames.nameType,
        value: masterNames.value,
      })
      .from(masterNames)
      .where(eq(masterNames.locale, "en")),
    db
      .select({
        studentId: masterTransmissions.studentId,
        teacherId: masterTransmissions.teacherId,
        isPrimary: masterTransmissions.isPrimary,
      })
      .from(masterTransmissions),
  ]);

  // Prefer the dharma name, matching how the rest of the site labels a
  // master; fall back to any English name, then the slug.
  const nameById = new Map<string, string>();
  for (const r of nameRows) {
    if (r.nameType === "dharma" && !nameById.has(r.masterId)) {
      nameById.set(r.masterId, r.value);
    }
  }
  for (const r of nameRows) {
    if (!nameById.has(r.masterId)) nameById.set(r.masterId, r.value);
  }

  const byId = new Map<string, LineageMaster>();
  for (const m of masterRows) {
    byId.set(m.id, {
      id: m.id,
      slug: m.slug,
      name: nameById.get(m.id) ?? m.slug,
      birthYear: m.birthYear,
      deathYear: m.deathYear,
    });
  }

  // Edges to unpublished masters are dropped here rather than filtered at
  // every call site — an edge into the unpublished set must never surface a
  // name, and dropping it once keeps that guarantee in one place.
  const teachersOf = new Map<string, string[]>();
  const studentsOf = new Map<string, string[]>();

  // Computed before the published filter below, because the question is
  // precisely "did this master transmit to anyone we chose not to publish?"
  const taughtAnyone = new Set<string>();
  const taughtSomeonePublished = new Set<string>();
  for (const e of edgeRows) {
    if (!byId.has(e.teacherId)) continue;
    taughtAnyone.add(e.teacherId);
    if (byId.has(e.studentId)) taughtSomeonePublished.add(e.teacherId);
  }
  const successorsBeyondScope = new Set(
    [...taughtAnyone].filter((id) => !taughtSomeonePublished.has(id))
  );

  for (const e of edgeRows) {
    if (!byId.has(e.studentId) || !byId.has(e.teacherId)) continue;
    const teachers = teachersOf.get(e.studentId) ?? [];
    // Primary edge first, so chain-walking follows the canonical line.
    if (e.isPrimary) teachers.unshift(e.teacherId);
    else teachers.push(e.teacherId);
    teachersOf.set(e.studentId, teachers);

    const students = studentsOf.get(e.teacherId) ?? [];
    students.push(e.studentId);
    studentsOf.set(e.teacherId, students);
  }

  return {
    byId,
    teachersOf,
    studentsOf,
    successorsBeyondScope,
    teachingsByAuthor: await loadTeachingsByAuthor(),
  };
}

/**
 * Teachings are only public once they carry an entity-level citation — the
 * same gate /teachings/[slug] and the sitemap apply. Linking an uncited
 * teaching from a lineage page would route readers to a page that refuses
 * to render.
 */
async function loadTeachingsByAuthor(): Promise<Map<string, LineageTeaching[]>> {
  const rows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      authorId: teachings.authorId,
    })
    .from(teachings);

  const withAuthor = rows.filter((r) => r.authorId);
  if (withAuthor.length === 0) return new Map();

  const ids = withAuthor.map((r) => r.id);
  const [citedRows, titleRows] = await Promise.all([
    db
      .select({ entityId: citations.entityId })
      .from(citations)
      .where(
        and(eq(citations.entityType, "teaching"), inArray(citations.entityId, ids))
      ),
    db
      .select({
        teachingId: teachingContent.teachingId,
        title: teachingContent.title,
      })
      .from(teachingContent)
      .where(
        and(eq(teachingContent.locale, "en"), inArray(teachingContent.teachingId, ids))
      ),
  ]);

  const cited = new Set(citedRows.map((r) => r.entityId));
  const titleById = new Map(titleRows.map((r) => [r.teachingId, r.title]));

  const out = new Map<string, LineageTeaching[]>();
  for (const r of withAuthor) {
    if (!cited.has(r.id)) continue;
    const title = titleById.get(r.id);
    if (!title) continue;
    const list = out.get(r.authorId!) ?? [];
    list.push({ slug: r.slug, title, type: r.type });
    out.set(r.authorId!, list);
  }
  for (const list of out.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }
  return out;
}

/**
 * The line of succession above a master, ordered root-first.
 *
 * Follows the primary transmission edge at each step, which is what makes
 * this a *line* rather than the full ancestor set — a master may have several
 * teachers, but only one carries the formal succession. Falls back to the
 * first recorded teacher when no edge is marked primary, so a master whose
 * data predates the primary flag still gets a chain.
 *
 * `seen` guards against cycles. The graph is asserted to be a DAG elsewhere
 * (scripts/audit-transmissions.ts), but a bad edge must degrade to a short
 * chain here, never to a hung build.
 */
export function successionChain(
  graph: LineageGraph,
  masterId: string
): LineageMaster[] {
  const chain: LineageMaster[] = [];
  const seen = new Set<string>([masterId]);
  let current = masterId;

  for (;;) {
    const teachers = graph.teachersOf.get(current);
    if (!teachers || teachers.length === 0) break;
    const next = teachers.find((id) => !seen.has(id));
    if (!next) break;
    const master = graph.byId.get(next);
    if (!master) break;
    chain.push(master);
    seen.add(next);
    current = next;
  }

  return chain.reverse();
}
