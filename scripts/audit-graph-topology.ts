/**
 * Diagnostic: surface masters that the public lineage graph silently drops.
 *
 * generate-static-data.ts builds graph.json by walking transmissions out
 * from `shakyamuni-buddha`. Anything not reachable from that root is
 * excluded with only a count printed. This script names them so we can
 * either connect them in seed data or file follow-up issues.
 *
 * Run: DATABASE_URL=file:zen.db npx tsx scripts/audit-graph-topology.ts
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:zen.db";
  const client = createClient({ url });
  const db = drizzle(client, { schema });

  const masters = await db
    .select({ id: schema.masters.id, slug: schema.masters.slug })
    .from(schema.masters);
  const edges = await db.select().from(schema.masterTransmissions);

  const idToSlug = new Map(masters.map((m) => [m.id, m.slug]));
  const shakyamuni = masters.find((m) => m.slug === "shakyamuni-buddha");
  if (!shakyamuni) {
    console.error("FAIL: master/shakyamuni-buddha not found in DB");
    process.exit(1);
  }

  const children = new Map<string, string[]>();
  for (const e of edges) {
    const list = children.get(e.teacherId) ?? [];
    list.push(e.studentId);
    children.set(e.teacherId, list);
  }

  const reachable = new Set<string>([shakyamuni.id]);
  const queue = [shakyamuni.id];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const c of children.get(cur) ?? []) {
      if (reachable.has(c)) continue;
      reachable.add(c);
      queue.push(c);
    }
  }

  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.teacherId);
    connected.add(e.studentId);
  }

  const orphans = masters.filter((m) => !connected.has(m.id));
  const disconnected = masters.filter(
    (m) => connected.has(m.id) && !reachable.has(m.id),
  );

  console.log("=== Lineage graph topology ===");
  console.log(`Total masters:        ${masters.length}`);
  console.log(`Reachable from root:  ${reachable.size}`);
  console.log(`Orphans (no edges):   ${orphans.length}`);
  console.log(`Disconnected (edges, but no path from root): ${disconnected.length}`);

  if (orphans.length) {
    console.log("\nOrphans:");
    orphans.forEach((m) => console.log(`  ${m.slug}`));
  }

  if (disconnected.length) {
    console.log("\nDisconnected components:");
    for (const m of disconnected) {
      const inEdges = edges
        .filter((e) => e.studentId === m.id)
        .map((e) => `${idToSlug.get(e.teacherId)} (${e.type})`);
      const outEdges = edges
        .filter((e) => e.teacherId === m.id)
        .map((e) => `${idToSlug.get(e.studentId)} (${e.type})`);
      console.log(`  ${m.slug}`);
      if (inEdges.length) console.log(`    teachers: ${inEdges.join(", ")}`);
      if (outEdges.length) console.log(`    students: ${outEdges.join(", ")}`);
    }
  }

  client.close();
  // Exit non-zero if we have unintended orphans/disconnects, so this can
  // be wired into CI when seed data is in target shape.
  if (orphans.length || disconnected.length) {
    process.exitCode = 0; // diagnostic-only for now
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
