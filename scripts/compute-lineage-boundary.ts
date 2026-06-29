import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";
import { computeLineageBoundary, LIVING_SLUGS, ROOT_SLUG } from "@/lib/lineage-boundary";
import { ensureMasterSchema } from "./ensure-master-schema";

async function main() {
  await ensureMasterSchema();

  const masterRows = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const edgeRows = await db
    .select({ teacherId: masterTransmissions.teacherId, studentId: masterTransmissions.studentId })
    .from(masterTransmissions);

  // The connectivity guard is meaningless if the root is absent (a failed seed):
  // both BFS sets would be empty and the check would silently pass. Fail loudly.
  if (!masterRows.some((m) => m.slug === ROOT_SLUG)) {
    throw new Error(`Root master "${ROOT_SLUG}" not found — cannot compute lineage boundary.`);
  }

  const result = computeLineageBoundary(masterRows, edgeRows);

  if (result.disconnectedPublishedIds.length > 0) {
    const slugById = new Map(masterRows.map((m) => [m.id, m.slug]));
    const offenders = result.disconnectedPublishedIds.map((id) => slugById.get(id) ?? id);
    throw new Error(
      `Lineage boundary would orphan ${offenders.length} published master(s) from ${ROOT_SLUG}: ${offenders.join(", ")}. ` +
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
