import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";

/**
 * Locked-in baseline of the transmission graph. This test fails the moment any
 * (teacher, student, type, isPrimary) tuple in `tests/golden/transmission-edges.json`
 * disappears from the seeded DB. It does not police additions — only deletions
 * and silent modifications — so adding a new transmission with proper evidence
 * does not break the test, but losing an existing one does.
 *
 * To intentionally change the graph (e.g., applying a correction recorded in
 * scripts/data/transmission-evidence/_suggested-corrections.md):
 *
 *   1. Make the edit in the canonical seed-data file.
 *   2. Reseed the DB.
 *   3. Run `npx tsx scripts/regenerate-graph-snapshot.ts` to refresh the golden file.
 *   4. Review the diff in your PR — it shows exactly which edges are added,
 *      removed, or modified, so reviewers can sanity-check the change.
 */

interface GoldenEdge {
  teacher: string;
  student: string;
  type: string;
  isPrimary: boolean;
}
interface GoldenFile {
  edge_count: number;
  captured_at: string;
  note: string;
  edges: GoldenEdge[];
}

function keyOf(e: { teacher: string; student: string; type: string; isPrimary: boolean }): string {
  return `${e.teacher}|${e.student}|${e.type}|${e.isPrimary}`;
}

describe("transmission graph snapshot", () => {
  it("retains every edge captured in tests/golden/transmission-edges.json", async () => {
    const goldenPath = path.join(process.cwd(), "tests/golden/transmission-edges.json");
    const golden: GoldenFile = JSON.parse(fs.readFileSync(goldenPath, "utf-8"));

    const mastersRows = await db
      .select({ id: masters.id, slug: masters.slug })
      .from(masters);
    const slugOf = new Map(mastersRows.map((m) => [m.id, m.slug]));

    const edgeRows = await db.select().from(masterTransmissions);
    const liveEdges = edgeRows.map((e) => ({
      teacher: slugOf.get(e.teacherId) ?? "<unknown>",
      student: slugOf.get(e.studentId) ?? "<unknown>",
      type: e.type,
      isPrimary: e.isPrimary ?? false,
    }));

    const liveKeys = new Set(liveEdges.map(keyOf));
    const missing = golden.edges.filter((e) => !liveKeys.has(keyOf(e)));

    if (missing.length > 0) {
      const detail = missing
        .slice(0, 25)
        .map((e) => `  - ${e.teacher} -> ${e.student} (type=${e.type}, isPrimary=${e.isPrimary})`)
        .join("\n");
      const more = missing.length > 25 ? `\n  ...and ${missing.length - 25} more` : "";
      throw new Error(
        `${missing.length} transmission(s) from the locked-in baseline are missing from the DB:\n${detail}${more}\n\n` +
          `If you intentionally changed the graph, regenerate the snapshot:\n` +
          `  npx tsx scripts/regenerate-graph-snapshot.ts\n` +
          `Then review the diff before committing.`,
      );
    }
    expect(missing).toEqual([]);
  });

  it("counts at least as many edges as the baseline (additions OK, deletions not)", async () => {
    const goldenPath = path.join(process.cwd(), "tests/golden/transmission-edges.json");
    const golden: GoldenFile = JSON.parse(fs.readFileSync(goldenPath, "utf-8"));
    const liveCount = (await db.select().from(masterTransmissions)).length;
    expect(liveCount).toBeGreaterThanOrEqual(golden.edge_count);
  });
});
