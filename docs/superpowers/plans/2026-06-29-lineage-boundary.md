# Lineage Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scope the public Zen lineage to the founding generation — never publish living masters, end each branch at its émigré founder — while keeping every excluded master fully archived (still seeded, never deleted).

**Architecture:** A new authored module `src/lib/lineage-boundary.ts` holds the `FOUNDER_SLUGS` (9) and `LIVING_SLUGS` (33) lists plus a pure `computeLineageBoundary()` function. A build step `scripts/compute-lineage-boundary.ts` runs near the end of `prebuild` (after all seeders, before `generate-static-data`), materialising two new `masters` columns — `living` (from the authored list) and `published` (derived: `not living AND not a strict descendant of a founder`). Every public read surface filters to `published = true`; audits and the temple founder-link builder are scoped the same way. Archived masters keep their DB rows, so nothing is deleted.

**Tech Stack:** Next.js (App Router, static export), Drizzle ORM + libSQL/SQLite (`zen.db`), TypeScript, tsx (seed scripts), Vitest 4 (tests), Cloudflare Pages (deploy).

## Global Constraints

- **Data is seed-truth.** `zen.db` is ephemeral; every data change lands in seed files/scripts, never ad-hoc SQL. (CLAUDE.md)
- **Schema changes** require both a `drizzle/NNNN_*.sql` migration AND an idempotent `ADD COLUMN` fallback in the seeder (the `seed-temples.ts#ensureTempleSchema` try/catch pattern), because the build path does not run `drizzle-kit migrate`.
- **Framing:** all copy and commit messages describe this only as *scoping the lineage to the founding generation* — editorial scope, tradition, consistency. No liability/risk/legal language anywhere in the repo or site.
- **Living masters are never published**, regardless of graph position (the `living` column is the absolute gate).
- **Single-root invariant:** the published graph must have exactly one topological root, `shakyamuni-buddha` (enforced at `scripts/generate-static-data.ts:391-398`).
- **Boolean columns** are SQLite integers via Drizzle `integer(col, { mode: "boolean" })`; migration literals use `DEFAULT false` / `DEFAULT true` (see `drizzle/0005_transmission_evidence.sql` for the `DEFAULT false` precedent).
- **Tests:** Vitest, files in `tests/*.test.ts`, import units by relative path (`../src/...`, `../scripts/...`). Run one file with `npx vitest run tests/<f>.test.ts`. DB-touching tests read the real `zen.db` (default `file:zen.db`).
- Spec: `docs/superpowers/specs/2026-06-29-lineage-boundary-design.md`.

---

## File Structure

**Create:**
- `src/lib/lineage-boundary.ts` — authored `FOUNDER_SLUGS`, `LIVING_SLUGS`, `ROOT_SLUG`, helper trio, and the pure `computeLineageBoundary()`.
- `scripts/ensure-master-schema.ts` — shared idempotent `ALTER TABLE masters ADD COLUMN` helper.
- `scripts/compute-lineage-boundary.ts` — build step: materialise `living`/`published`, assert connectivity, log summary.
- `drizzle/0006_lineage_boundary.sql` — migration adding the two columns.
- `tests/lineage-boundary.test.ts` — unit tests for the lists + pure function.
- `tests/lineage-boundary-db.test.ts` — DB integration invariants (runs against seeded `zen.db`).

**Modify:**
- `src/db/schema.ts` — add `living` + `published` columns (after line 57).
- `scripts/seed-db.ts` — call `ensureMasterSchema()` at the top of `main()`.
- `package.json` — insert the compute step into `prebuild`; add `boundary:compute` alias.
- `scripts/generate-static-data.ts` — filter `graph.json` nodes/edges, `api/masters.json`, `search-index.json`; null out unpublished temple founders.
- `src/app/masters/page.tsx`, `src/app/masters/[slug]/page.tsx`, `src/app/masters/[slug]/opengraph-image.tsx`, `src/app/lineage/[slug]/page.tsx`, `src/app/sitemap.ts` — add `published` filters.
- `scripts/generate-llms-full.ts` — filter master enumeration.
- Secondary surfaces (Task 6) — homepage, about, schools, timeline, proverbs, teachings, `TraditionLanding.tsx`, `practice-instructions-data.ts`.
- `scripts/check-exit-criteria.ts`, `scripts/validate-graph.ts` — scope to published.
- `src/app/lineage/page.tsx`, `src/app/about/page.tsx` — editorial note.

---

## Task 1: Schema columns + migration + idempotent seeder fallback

**Files:**
- Modify: `src/db/schema.ts:45-58`
- Create: `drizzle/0006_lineage_boundary.sql`
- Create: `scripts/ensure-master-schema.ts`
- Modify: `scripts/seed-db.ts` (top of `main()`, ~line 319)
- Test: `tests/lineage-boundary.test.ts` (schema-shape portion)

**Interfaces:**
- Produces: `masters.living` (boolean, default false) and `masters.published` (boolean, default true) Drizzle columns; `ensureMasterSchema(): Promise<void>` exported from `scripts/ensure-master-schema.ts`.

- [ ] **Step 1: Write the failing test** (`tests/lineage-boundary.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { masters } from "../src/db/schema";

describe("masters schema: lineage-boundary columns", () => {
  it("declares living and published columns", () => {
    expect(masters.living).toBeDefined();
    expect(masters.published).toBeDefined();
    expect(masters.living.name).toBe("living");
    expect(masters.published.name).toBe("published");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lineage-boundary.test.ts`
Expected: FAIL — `masters.living` is `undefined` / property does not exist.

- [ ] **Step 3: Add the columns to the schema**

In `src/db/schema.ts`, change the `masters` table (currently ending at line 57 `generation: integer("generation"),`) to:

```ts
export const masters = sqliteTable("masters", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  birthYear: integer("birth_year"),
  birthPrecision: text("birth_precision"),
  birthConfidence: text("birth_confidence"),
  deathYear: integer("death_year"),
  deathPrecision: text("death_precision"),
  deathConfidence: text("death_confidence"),
  ordinationYear: integer("ordination_year"),
  ordinationPrecision: text("ordination_precision"),
  schoolId: text("school_id").references(() => schools.id),
  generation: integer("generation"),
  living: integer("living", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lineage-boundary.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the migration** (`drizzle/0006_lineage_boundary.sql`)

```sql
ALTER TABLE `masters` ADD COLUMN `living` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `masters` ADD COLUMN `published` integer DEFAULT true NOT NULL;
```

- [ ] **Step 6: Write the shared idempotent fallback** (`scripts/ensure-master-schema.ts`)

```ts
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Idempotent in-place evolution of the `masters` table so a machine with an
 * existing zen.db does not need a separate `drizzle-kit migrate` step. SQLite
 * has no `ADD COLUMN IF NOT EXISTS`, so we attempt each ALTER and swallow the
 * "duplicate column" error — mirrors scripts/seed-temples.ts#ensureTempleSchema.
 * Canonical migration: drizzle/0006_lineage_boundary.sql.
 */
export async function ensureMasterSchema(): Promise<void> {
  const statements = [
    sql`ALTER TABLE masters ADD COLUMN living integer DEFAULT false NOT NULL`,
    sql`ALTER TABLE masters ADD COLUMN published integer DEFAULT true NOT NULL`,
  ];
  for (const statement of statements) {
    try {
      await db.run(statement);
    } catch {
      // Column already exists — fine.
    }
  }
}
```

- [ ] **Step 7: Call it at the start of seeding**

In `scripts/seed-db.ts`, inside `main()` (begins ~line 319), add the import at the top of the file and call it as the first awaited statement in `main()` (before `resetDerivedTables()` / `seedMasters`):

```ts
import { ensureMasterSchema } from "./ensure-master-schema";
// ... inside main(), first line:
await ensureMasterSchema();
```

- [ ] **Step 8: Verify the columns are added — on a throwaway DB copy, NOT the live one**

DO NOT run `scripts/seed-db.ts` against the live `zen.db`: in isolation it wipes `masters` and reseeds only the canonical spine (~398 rows), losing every lineage-seeded master until the full `prebuild` chain reruns. Verify on a copy instead:

```bash
cp zen.db /tmp/schema-check.db
DATABASE_URL=file:/tmp/schema-check.db npx tsx scripts/seed-db.ts   # safe: copy only
sqlite3 /tmp/schema-check.db "PRAGMA table_info(masters);" | grep -E "living|published"
DATABASE_URL=file:/tmp/schema-check.db npx tsx scripts/seed-db.ts   # second run must not error (idempotent fallback)
rm /tmp/schema-check.db
```

Expected: two rows — `living|integer|...|0` and `published|integer|...|1`; the second run completes without a duplicate-column error. The live `zen.db` is untouched.

- [ ] **Step 9: Commit**

```bash
git add src/db/schema.ts drizzle/0006_lineage_boundary.sql scripts/ensure-master-schema.ts scripts/seed-db.ts tests/lineage-boundary.test.ts
git commit -m "feat(schema): add living + published columns to masters"
```

---

## Task 2: `lineage-boundary.ts` — authored lists + pure boundary function

**Files:**
- Create: `src/lib/lineage-boundary.ts`
- Test: `tests/lineage-boundary.test.ts` (append; created in Task 1)

**Interfaces:**
- Consumes: nothing (pure module).
- Produces:
  - `FOUNDER_SLUGS: string[]` (9), `LIVING_SLUGS: string[]` (33), `ROOT_SLUG = "shakyamuni-buddha"`.
  - `isFounder(slug: string): boolean`, `isLivingMaster(slug: string): boolean`.
  - `interface BoundaryMaster { id: string; slug: string }`, `interface BoundaryEdge { teacherId: string; studentId: string }`.
  - `interface BoundaryResult { livingIds: Set<string>; archivedIds: Set<string>; publishedIds: Set<string>; disconnectedPublishedIds: string[] }`.
  - `computeLineageBoundary(masters: BoundaryMaster[], edges: BoundaryEdge[], options?: { founderSlugs?: string[]; livingSlugs?: string[]; rootSlug?: string }): BoundaryResult`.

- [ ] **Step 1: Write the failing tests** (append to `tests/lineage-boundary.test.ts`)

```ts
import {
  FOUNDER_SLUGS,
  LIVING_SLUGS,
  computeLineageBoundary,
} from "../src/lib/lineage-boundary";

describe("lineage-boundary authored lists", () => {
  it("has 9 unique founders", () => {
    expect(FOUNDER_SLUGS.length).toBe(9);
    expect(new Set(FOUNDER_SLUGS).size).toBe(9);
  });
  it("has 33 unique living masters", () => {
    expect(LIVING_SLUGS.length).toBe(33);
    expect(new Set(LIVING_SLUGS).size).toBe(33);
  });
  it("never lists a founder as living", () => {
    const living = new Set(LIVING_SLUGS);
    expect(FOUNDER_SLUGS.some((s) => living.has(s))).toBe(false);
  });
});

describe("computeLineageBoundary", () => {
  // root -> f (founder) -> succ -> grand ; root -> side (deceased side-branch) ; root -> alive (living leaf)
  const masters = [
    { id: "root", slug: "root" },
    { id: "f", slug: "f" },
    { id: "succ", slug: "succ" },
    { id: "grand", slug: "grand" },
    { id: "side", slug: "side" },
    { id: "alive", slug: "alive" },
  ];
  const edges = [
    { teacherId: "root", studentId: "f" },
    { teacherId: "f", studentId: "succ" },
    { teacherId: "succ", studentId: "grand" },
    { teacherId: "root", studentId: "side" },
    { teacherId: "root", studentId: "alive" },
  ];
  const opts = { founderSlugs: ["f"], livingSlugs: ["alive"], rootSlug: "root" };

  it("publishes the founder and its ancestors", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.publishedIds.has("root")).toBe(true);
    expect(r.publishedIds.has("f")).toBe(true);
  });
  it("archives strict descendants of the founder", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.archivedIds.has("succ")).toBe(true);
    expect(r.archivedIds.has("grand")).toBe(true);
  });
  it("keeps deceased side-branches that are not below a founder", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.publishedIds.has("side")).toBe(true);
  });
  it("archives living leaves via the living floor", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.archivedIds.has("alive")).toBe(true);
    expect(r.livingIds.has("alive")).toBe(true);
  });
  it("keeps a founder published even when it descends from another founder", () => {
    // f2 is a student of founder f, but is itself a founder -> stays published
    const m2 = [...masters, { id: "f2", slug: "f2" }];
    const e2 = [...edges, { teacherId: "f", studentId: "f2" }];
    const r = computeLineageBoundary(m2, e2, { ...opts, founderSlugs: ["f", "f2"] });
    expect(r.publishedIds.has("f2")).toBe(true);
  });
  it("flags a published node that is disconnected through archived-only edges", () => {
    // orphan is reachable only via living 'alive' -> so after pruning it is disconnected
    const m3 = [...masters, { id: "orphan", slug: "orphan" }];
    const e3 = [...edges, { teacherId: "alive", studentId: "orphan" }];
    const r = computeLineageBoundary(m3, e3, opts);
    // orphan is not living and not below founder f, so it is "published" but unreachable
    expect(r.publishedIds.has("orphan")).toBe(true);
    expect(r.disconnectedPublishedIds).toContain("orphan");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lineage-boundary.test.ts`
Expected: FAIL — module `../src/lib/lineage-boundary` not found / exports undefined.

- [ ] **Step 3: Write the module** (`src/lib/lineage-boundary.ts`)

```ts
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
  // universe — masters that appear in the public lineage graph), one over
  // published-only edges. Masters never reachable from the root are excluded
  // from the graph elsewhere (they keep their detail pages), so they are NOT
  // flagged. Flag only a published master that IS in the graph (reachable via
  // all edges) but whose path was severed by archiving (no longer reachable via
  // published-only edges) — those would become isolated roots.
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lineage-boundary.test.ts`
Expected: PASS (all schema + list + function cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/lineage-boundary.ts tests/lineage-boundary.test.ts
git commit -m "feat(lineage): authored founder/living lists + boundary computation"
```

---

## Task 3: `compute-lineage-boundary.ts` build step + pipeline wiring

**Files:**
- Create: `scripts/compute-lineage-boundary.ts`
- Modify: `package.json:7` (prebuild), and the scripts block (add alias)
- Test: `tests/lineage-boundary-db.test.ts`

**Interfaces:**
- Consumes: `computeLineageBoundary`, `LIVING_SLUGS`, `ROOT_SLUG` (Task 2); `ensureMasterSchema` (Task 1); `masters` schema cols `living`/`published` (Task 1).
- Produces: a seeded `zen.db` where `masters.living` and `masters.published` are set; throws if any published master is disconnected.

- [ ] **Step 1: Write the build step** (`scripts/compute-lineage-boundary.ts`)

```ts
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";
import { computeLineageBoundary, LIVING_SLUGS } from "@/lib/lineage-boundary";
import { ensureMasterSchema } from "./ensure-master-schema";

async function main() {
  await ensureMasterSchema();

  const masterRows = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const edgeRows = await db
    .select({ teacherId: masterTransmissions.teacherId, studentId: masterTransmissions.studentId })
    .from(masterTransmissions);

  const result = computeLineageBoundary(masterRows, edgeRows);

  if (result.disconnectedPublishedIds.length > 0) {
    const slugById = new Map(masterRows.map((m) => [m.id, m.slug]));
    const offenders = result.disconnectedPublishedIds.map((id) => slugById.get(id) ?? id);
    throw new Error(
      `Lineage boundary would orphan ${offenders.length} published master(s) from ${"shakyamuni-buddha"}: ${offenders.join(", ")}. ` +
        `Add a founder/living entry in src/lib/lineage-boundary.ts to resolve.`,
    );
  }

  // Reset, then set the two flags from the authored lists + derived published set.
  await db.update(masters).set({ living: false, published: false });
  if (LIVING_SLUGS.length > 0) {
    await db.update(masters).set({ living: true }).where(inArray(masters.slug, LIVING_SLUGS));
  }
  const publishedIds = [...result.publishedIds];
  // Chunk to stay well under SQLite's variable limit.
  for (let i = 0; i < publishedIds.length; i += 500) {
    const chunk = publishedIds.slice(i, i + 500);
    await db.update(masters).set({ published: true }).where(inArray(masters.id, chunk));
  }

  console.log(
    `[lineage-boundary] published=${result.publishedIds.size} archived=${result.archivedIds.size} living=${result.livingIds.size}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Wire the step into `prebuild`**

In `package.json:7`, find the substring:

```
&& DATABASE_URL=file:zen.db tsx scripts/fetch-temple-images.ts && DATABASE_URL=file:zen.db tsx scripts/generate-static-data.ts
```

and replace it with:

```
&& DATABASE_URL=file:zen.db tsx scripts/fetch-temple-images.ts && DATABASE_URL=file:zen.db tsx scripts/compute-lineage-boundary.ts && DATABASE_URL=file:zen.db tsx scripts/generate-static-data.ts
```

- [ ] **Step 3: Add the standalone alias**

In the scripts block (near the other `seed:*`/`audit:*` aliases), add:

```json
"boundary:compute": "DATABASE_URL=file:zen.db tsx scripts/compute-lineage-boundary.ts",
```

- [ ] **Step 4: Run the step against the seeded DB**

Run: `npm run boundary:compute`
Expected: prints `[lineage-boundary] published=465 archived=91 living=33` (`published` counts ALL non-archived masters, not just graph-reachable ones — ~349 of the 465 are graph nodes. Counts may shift by ±a few if `living` spot-checks in Task-3 Step 6 change any dates; it must NOT throw).

- [ ] **Step 5: Write the DB integration test** (`tests/lineage-boundary-db.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masters } from "@/db/schema";

// Reads the seeded zen.db. Run `npm run boundary:compute` first if stale.
describe("lineage boundary (seeded DB)", () => {
  it("never publishes a living master", async () => {
    const rows = await db
      .select({ slug: masters.slug })
      .from(masters)
      .where(eq(masters.living, true));
    const published = await db
      .select({ slug: masters.slug, published: masters.published })
      .from(masters)
      .where(eq(masters.living, true));
    expect(rows.length).toBeGreaterThanOrEqual(30);
    expect(published.every((m) => m.published === false)).toBe(true);
  });

  it("publishes shakyamuni-buddha as a published root", async () => {
    const root = await db
      .select({ published: masters.published })
      .from(masters)
      .where(eq(masters.slug, "shakyamuni-buddha"));
    expect(root[0]?.published).toBe(true);
  });

  it("archives a known living European teacher and a post-founder successor", async () => {
    const samples = ["olivier-reigen-wang-genh", "bernie-tetsugen-glassman"];
    for (const slug of samples) {
      const row = await db
        .select({ published: masters.published })
        .from(masters)
        .where(eq(masters.slug, slug));
      expect(row[0]?.published).toBe(false);
    }
  });

  it("keeps published as the large majority and archives a bounded minority", async () => {
    // `published` spans ALL masters (not only graph-reachable ones): published =
    // total − archived. With ~91 archived of ~556, published sits above 400.
    const pub = await db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, true));
    const archived = await db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, false));
    expect(pub.length).toBeGreaterThan(430);
    expect(pub.length).toBeLessThan(510);
    expect(archived.length).toBeGreaterThan(60);
    expect(archived.length).toBeLessThan(130);
  });
});
```

- [ ] **Step 6: Spot-check the living list, then run the test**

Before trusting the test, verify none of the 33 `LIVING_SLUGS` have actually died (the `death_year IS NULL` heuristic is imperfect). Run:

```bash
DATABASE_URL=file:zen.db sqlite3 zen.db "SELECT slug, birth_year FROM masters WHERE slug IN ('thich-thanh-tu','jakusho-kwong','richard-zentatsu-baker','reb-anderson','dennis-genpo-merzel','shohaku-okumura','brad-warner') ORDER BY birth_year;"
```

For any that have in fact died, add the death year in the owning seed-data file (e.g. `scripts/data/deshimaru-lineage.ts`) and remove the slug from `LIVING_SLUGS`; if the corrected master is not below a founder they will simply publish. (Document any change in the commit.)

Then run: `npx vitest run tests/lineage-boundary-db.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/compute-lineage-boundary.ts package.json tests/lineage-boundary-db.test.ts
git commit -m "feat(lineage): compute step materialises living/published in prebuild"
```

---

## Task 4: Filter the generated artifacts (graph.json, masters.json, search-index.json) + temple founders

**Files:**
- Modify: `scripts/generate-static-data.ts` — node query (~89-99), public node/edge filter (~371-374), masters.json query (~414-424), search-index query (~792-798), temple feature builder (~692-715)
- Test: `tests/lineage-boundary-db.test.ts` (append a graph.json assertion)

**Interfaces:**
- Consumes: `masters.published` column (Task 1/3).
- Produces: `public/data/graph.json` containing only published nodes/edges; `temples.json` with no founder links to unpublished masters.

- [ ] **Step 1: Add `published` to the node query**

In `scripts/generate-static-data.ts`, the master query that builds `mastersData` (lines ~89-99) selects `id, slug, schoolId, ...`. Add the column to the select object:

```ts
published: masters.published,
```

(No `.where` — we need archived rows out of the *public* graph but the query may feed other computations; we filter explicitly below.)

- [ ] **Step 2: Gate the public node/edge sets by published**

Replace the existing public filter (lines ~371-374):

```ts
const publicNodes = nodes.filter((node) => reachableFromShakyamuni.has(node.id));
const publicEdges = edges.filter(
  (edge) => reachableFromShakyamuni.has(edge.source) && reachableFromShakyamuni.has(edge.target),
);
```

with:

```ts
const publishedNodeIds = new Set(mastersData.filter((m) => m.published).map((m) => m.id));
const publicNodes = nodes.filter(
  (node) => reachableFromShakyamuni.has(node.id) && publishedNodeIds.has(node.id),
);
const publicEdges = edges.filter(
  (edge) =>
    reachableFromShakyamuni.has(edge.source) &&
    reachableFromShakyamuni.has(edge.target) &&
    publishedNodeIds.has(edge.source) &&
    publishedNodeIds.has(edge.target),
);
```

The single-root invariant check (lines ~391-398) now runs on the published set; because the compute step (Task 3) already guarantees connectivity, it must still find exactly one root (`shakyamuni-buddha`).

- [ ] **Step 3: Filter the masters.json and search-index.json queries**

For the `generateMastersJson` master query (~414-424) and the `generateSearchIndexJson` master query (~792-798), add to each query:

```ts
.where(eq(masters.published, true))
```

(`eq` and `masters` are already imported in this file.)

- [ ] **Step 4: Suppress unpublished temple founders**

The temple feature builder lives in the temples function (the one with the temple query at ~554-565 and feature object at ~692-715), a different scope from `generateGraphData()` — so it does **not** have `mastersData` in scope. Load a published-id set directly in that function, near where the other founder lookup maps (`founderSlugById`, ~606-617) are built:

```ts
const publishedMasterRows = await db
  .select({ id: masters.id, published: masters.published })
  .from(masters);
const publishedFounderIds = new Set(
  publishedMasterRows.filter((m) => m.published).map((m) => m.id),
);
```

Then, in the feature builder (~692-715), change the founder resolution so a non-published founder is dropped — locate:

```ts
const effectiveFounderId = t.founderId ?? foundedBy.get(t.id) ?? null;
const founderSlug = effectiveFounderId ? founderSlugById.get(effectiveFounderId) ?? null : null;
```

and replace with:

```ts
const rawFounderId = t.founderId ?? foundedBy.get(t.id) ?? null;
const effectiveFounderId = rawFounderId && publishedFounderIds.has(rawFounderId) ? rawFounderId : null;
const founderSlug = effectiveFounderId ? founderSlugById.get(effectiveFounderId) ?? null : null;
```

`founderName` is already derived from `effectiveFounderId`, so both the link and the name disappear for unpublished founders, and the popup omits the "Founder:" line (per `PracticeMap.tsx:523-524`, which renders nothing when `founderSlug`/`founderName` are falsy).

- [ ] **Step 5: Regenerate and assert no archived master leaks into graph.json**

Append to `tests/lineage-boundary-db.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";

describe("graph.json reflects the boundary", () => {
  it("excludes archived masters and includes a founder", () => {
    const file = path.join(process.cwd(), "public/data/graph.json");
    const graph = JSON.parse(fs.readFileSync(file, "utf8")) as { nodes: { slug: string }[] };
    const slugs = new Set(graph.nodes.map((n) => n.slug));
    expect(slugs.has("olivier-reigen-wang-genh")).toBe(false); // living
    expect(slugs.has("bernie-tetsugen-glassman")).toBe(false); // post-founder successor
    expect(slugs.has("taisen-deshimaru")).toBe(true); // founder
    expect(slugs.has("shakyamuni-buddha")).toBe(true); // root
  });
});
```

Run: `npm run boundary:compute && DATABASE_URL=file:zen.db npx tsx scripts/generate-static-data.ts`
Then: `npx vitest run tests/lineage-boundary-db.test.ts`
Expected: PASS, and `generate-static-data.ts` does not throw the single-root error.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-static-data.ts tests/lineage-boundary-db.test.ts public/data/graph.json public/data/temples.json
git commit -m "feat(lineage): scope generated graph/search/temple artifacts to published masters"
```

(Commit the regenerated `public/data/*.json` if they are tracked; if `.gitignore`d, skip those paths.)

---

## Task 5: Filter the live read surfaces + llms-full

**Files:**
- Modify: `src/app/masters/page.tsx:48`
- Modify: `src/app/masters/[slug]/page.tsx:320, 340, 128-140, 425, 442, 768`
- Modify: `src/app/masters/[slug]/opengraph-image.tsx:13, 32`
- Modify: `src/app/lineage/[slug]/page.tsx:25, 45, 52-60`
- Modify: `src/app/sitemap.ts:27`
- Modify: `scripts/generate-llms-full.ts:82`

**Interfaces:**
- Consumes: `masters.published` (Task 1/3). `eq` and `masters` already imported in every file below.

- [ ] **Step 1: `/masters` list page**

In `src/app/masters/page.tsx`, the `mastersData` query ending at line 48 — add before the statement terminator:

```ts
.where(eq(masters.published, true))
```

- [ ] **Step 2: Master detail page — params, lookup, metadata, related**

In `src/app/masters/[slug]/page.tsx`:
- `generateStaticParams` (line ~320): `db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, true))`
- Page-body slug lookup (the `where` at line ~340): add `published` to the condition, e.g. `.where(and(eq(masters.slug, slug), eq(masters.published, true)))` (import `and` from `drizzle-orm` if not present) so an archived slug hits `notFound()` at line ~343.
- `generateMetadata` lookup (lines ~128-140): apply the same `and(...)` condition so metadata returns `{}` for archived slugs.
- Related sections — teachers (line ~425), students (line ~442), siblings (line ~768): filter each result list to published, e.g. after the query add `.filter((m) => m.published)` if the select includes `published`, or add `eq(masters.published, true)` to the join/where. Add `published: masters.published` to those selects if needed.

- [ ] **Step 3: OpenGraph image**

In `src/app/masters/[slug]/opengraph-image.tsx`:
- `generateStaticParams` (line ~13): add `.where(eq(masters.published, true))`.
- Slug lookup (line ~32): add the `published` condition the same way as Step 2.

- [ ] **Step 4: Lineage detail page**

In `src/app/lineage/[slug]/page.tsx`:
- `generateStaticParams` (line ~25): add `.where(eq(masters.published, true))`.
- `getMasterBySlug` `where` (line ~45): add the `published` condition (so archived → `notFound()` at line ~226).
- `getMastersByIds` (line ~60): add `eq(masters.published, true)` so ancestor/descendant layers never render an archived master.

- [ ] **Step 5: Sitemap**

In `src/app/sitemap.ts`, the master query at line 27: add `.where(eq(masters.published, true))` — this scopes both `/masters/{slug}` and `/lineage/{slug}` URL sets.

- [ ] **Step 6: llms-full export**

In `scripts/generate-llms-full.ts`, the `mastersData` query at line 82: add `.where(eq(masters.published, true))`.

- [ ] **Step 7: Verify static generation excludes archived slugs**

Run: `npx tsc --noEmit` (type-check the new `and`/filter usage).
Then a focused smoke build of the master routes:
Run: `DATABASE_URL=file:zen.db npx tsx scripts/generate-llms-full.ts && grep -c "olivier-reigen-wang-genh" public/llms-full.txt || true`
Expected: `0` occurrences of the archived slug in `llms-full`. (Confirm the actual output path of `generate-llms-full.ts` and grep that file.)

- [ ] **Step 8: Commit**

```bash
git add src/app/masters src/app/lineage src/app/sitemap.ts scripts/generate-llms-full.ts
git commit -m "feat(lineage): scope live master/lineage routes, sitemap, llms-full to published"
```

---

## Task 6: Audit and filter secondary surfaces

**Files:**
- Modify (only where a query surfaces master names/links): `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/schools/page.tsx`, `src/app/schools/[slug]/page.tsx`, `src/app/timeline/page.tsx`, `src/app/proverbs/page.tsx`, `src/app/proverbs/themes/[slug]/page.tsx`, `src/app/teachings/[slug]/page.tsx`, `src/components/TraditionLanding.tsx`, `src/lib/practice-instructions-data.ts`

**Interfaces:**
- Consumes: `masters.published`.

- [ ] **Step 1: Inventory the master queries**

Run: `grep -rn "from(masters)" src/app src/components src/lib`
For each hit, open the file and determine whether the query result is rendered to users as a master name, link, count, or graph. If yes → it must be scoped to published. If it is an internal lookup that never surfaces an archived master (e.g. resolving a single known-published slug), leave it.

- [ ] **Step 2: Apply the filter to each surfacing query**

For every query identified in Step 1 that surfaces masters, add `.where(eq(masters.published, true))` (combine with existing conditions via `and(...)`). For `schools/[slug]` master rosters and `TraditionLanding` master grids specifically, confirm archived masters disappear from the listed roster. Import `and`/`eq` from `drizzle-orm` where missing.

- [ ] **Step 3: Verify no archived master surfaces**

Run: `npx tsc --noEmit`
Run: `grep -rn "from(masters)" src/app src/components src/lib` and confirm every user-facing hit now carries a `published` condition (or is a justified single-slug lookup — note each exception in the commit body).

- [ ] **Step 4: Commit**

```bash
git add src/app src/components src/lib
git commit -m "feat(lineage): scope secondary surfaces (schools, timeline, landing) to published masters"
```

---

## Task 7: Scope audits and graph validation to published

**Files:**
- Modify: `scripts/check-exit-criteria.ts:356-363` (+ derived sets)
- Modify: `scripts/validate-graph.ts:14-41`

**Interfaces:**
- Consumes: `masters.published`. `dag-validation.ts` is unchanged — it operates on caller-supplied arrays.

- [ ] **Step 1: Scope `validate-graph.ts` inputs to published**

In `scripts/validate-graph.ts`, change the master load (line 14) and edge load (line 15) so only published masters and edges between published masters reach `validateDAG`:

```ts
import { and, eq, inArray } from "drizzle-orm";
// ...
const allMasters = await db.select().from(masters).where(eq(masters.published, true));
const publishedIds = new Set(allMasters.map((m) => m.id));
const allTransmissions = (await db.select().from(masterTransmissions)).filter(
  (t) => publishedIds.has(t.teacherId) && publishedIds.has(t.studentId),
);
```

The downstream `edges`/`masterDates`/`masterIds` derivations (lines 18-36) then only contain published entities, so `detectOrphans` no longer flags archived masters.

- [ ] **Step 2: Scope `check-exit-criteria.ts` to published**

In `scripts/check-exit-criteria.ts`, add `published: masters.published` to the master select (lines 356-363), then immediately after `allMasters` is loaded, restrict it:

```ts
const allMasters = allMastersRaw.filter((m) => m.published);
```

(Rename the raw query result to `allMastersRaw` and derive `allMasters` from it; every existing iteration over `allMasters` — orphans `:460-463`, coverage `:495-515`, tier-1 `:525-530`, image gate `:1000-1003`, `totalMasters :416/:992` — then counts published-only.) Also restrict the transmission orphan inputs: build `const publishedIds = new Set(allMasters.map((m) => m.id))` and, where `studentIds`/`teacherIds` are built from `allTransmissions` (`:458-459`), filter edges to those with both endpoints in `publishedIds`. Cross-reference the biography-citation audit (which iterates the `BIOGRAPHIES` TS artifact, `:318-340`) against `publishedIds`/published slugs so archived biographies are not reported as offenders.

- [ ] **Step 3: Run both audits**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/validate-graph.ts`
Expected: no new orphan errors introduced by archived masters; exits cleanly.
Run: `DATABASE_URL=file:zen.db npx tsx scripts/check-exit-criteria.ts`
Expected: image/biography/teaching coverage percentages computed over published masters; archived masters do not appear as orphans / missing-image / uncited failures.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-exit-criteria.ts scripts/validate-graph.ts
git commit -m "test(lineage): scope exit-criteria audit and graph validation to published masters"
```

---

## Task 8: Editorial note + full verification

**Files:**
- Modify: `src/app/lineage/page.tsx` (intro/header block)
- Modify: `src/app/about/page.tsx` (scope section)

**Interfaces:**
- Consumes: nothing.

- [ ] **Step 1: Add the editorial note to `/lineage`**

In `src/app/lineage/page.tsx`, within the existing intro/header JSX (near the SEO intro that loads `rootSchools`), add a short muted paragraph:

```tsx
<p className="lineage-intro-note">
  This atlas charts the ancestral lineage up to the teachers who carried these
  traditions out of Asia. Their living successors continue a living tradition we
  do not attempt to chart here.
</p>
```

Match the surrounding className/typography conventions of that file (read it first; use the existing muted-paragraph style rather than inventing one).

- [ ] **Step 2: Add the same note to `/about`**

In `src/app/about/page.tsx`, in the section describing the lineage/scope, add the same sentence as a paragraph, matching that page's existing prose styling.

- [ ] **Step 3: Full pipeline + suite verification**

Run: `npm run prebuild`
Expected: completes without error; the `[lineage-boundary] published=… archived=… living=…` line appears before static-data generation; `generate-static-data.ts` does not throw the single-root error.
Run: `npm test`
Expected: all tests pass, including `tests/lineage-boundary.test.ts`, `tests/lineage-boundary-db.test.ts`, and the existing `tests/transmission-graph-snapshot.test.ts` (unchanged — archived masters remain as DB rows, so the raw-graph golden is unaffected).
Run: `grep -rn "from(masters)" src/app src/components | grep -v "published"` — review any remaining unfiltered user-facing hits.

- [ ] **Step 4: Manual smoke (optional but recommended)**

Run: `npm run dev`, then load `/lineage` (graph ends at the founders; no living teachers), `/masters` (no living teachers listed), `/masters/olivier-reigen-wang-genh` (404), `/practice` (temple popups for living-teacher-founded temples show no founder link), and `/about` (note present).

- [ ] **Step 5: Commit**

```bash
git add src/app/lineage/page.tsx src/app/about/page.tsx
git commit -m "feat(lineage): note that the atlas charts the founding generation"
```

---

## Notes for the implementer

- **Counts are a guide, not a contract.** Actual: `published=465 archived=91 living=33` of 556 masters; ~349 of the published are graph-reachable (the spec's "349 published" figure was published-AND-in-graph). If a `living` spot-check (Task 3, Step 6) corrects a death date, the counts shift slightly — that is expected. The hard invariants are: no living master published, single root = `shakyamuni-buddha`, zero disconnected published masters (graph-reachable ones severed by archiving).
- **Nothing is deleted.** Archived masters keep their `masters` rows and all related records; they are excluded only from published surfaces. Recovery = remove a slug from `LIVING_SLUGS` or adjust `FOUNDER_SLUGS`, then rerun `npm run boundary:compute`.
- **If `compute-lineage-boundary.ts` throws** about disconnected published masters, it means a published master's only path to the root runs through an archived (living) teacher. Resolve by adding the appropriate founder (or marking the intermediate living) in `src/lib/lineage-boundary.ts` — do not weaken the connectivity check.
