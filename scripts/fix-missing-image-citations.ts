/**
 * Backfill missing media_asset citations.
 * Usage: npx tsx scripts/fix-missing-image-citations.ts
 */
import { db } from "@/db";
import { mediaAssets, citations } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import crypto from "crypto";

async function main() {
  const citedIds = new Set(
    (await db.select({ entityId: citations.entityId }).from(citations).where(eq(citations.entityType, "media_asset")))
      .map((c) => c.entityId)
  );

  const uncited = (await db.select().from(mediaAssets).where(and(isNotNull(mediaAssets.storagePath))))
    .filter((ma) => !citedIds.has(ma.id));

  console.log(`Found ${uncited.length} media assets without citations.`);

  for (const ma of uncited) {
    await db.insert(citations).values({
      id: crypto.randomUUID(),
      entityType: "media_asset",
      entityId: ma.id,
      sourceId: "src_wikipedia",
      fieldName: "storage_path",
      excerpt: `Seeded from ${ma.attribution ?? "Wikimedia Commons"}`,
      pageOrSection: "Wikimedia Commons",
    });
  }

  console.log(`Backfilled ${uncited.length} citations.`);
}

main().catch(console.error);
