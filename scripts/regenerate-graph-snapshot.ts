/**
 * Regenerate the locked-in transmission graph baseline at
 * tests/golden/transmission-edges.json.
 *
 * Run this AFTER intentionally changing the graph (applying a correction,
 * adding a transmission, etc.) so the snapshot test reflects the new
 * intended state. Review the resulting git diff carefully — it is the
 * authoritative record of which edges were added, removed, or modified.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/regenerate-graph-snapshot.ts
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";

async function main() {
  const ms = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugOf = new Map(ms.map((m) => [m.id, m.slug]));

  const edges = await db.select().from(masterTransmissions);
  const rows = edges
    .map((e) => ({
      teacher: slugOf.get(e.teacherId) ?? "<unknown>",
      student: slugOf.get(e.studentId) ?? "<unknown>",
      type: e.type,
      isPrimary: e.isPrimary ?? false,
    }))
    .sort(
      (a, b) =>
        a.teacher.localeCompare(b.teacher) ||
        a.student.localeCompare(b.student) ||
        a.type.localeCompare(b.type),
    );

  const payload = {
    edge_count: rows.length,
    captured_at: new Date().toISOString().slice(0, 10),
    note: "Locked-in transmission graph baseline. tests/transmission-graph-snapshot.test.ts fails if any of these rows disappears from master_transmissions. To intentionally change the graph, regenerate via this script and review the diff in your PR.",
    edges: rows,
  };

  const outPath = path.join(process.cwd(), "tests/golden/transmission-edges.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`wrote ${rows.length} edges to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
