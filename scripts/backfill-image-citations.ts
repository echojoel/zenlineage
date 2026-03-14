/**
 * Backfill citations for media_assets that were downloaded before the
 * citation step was added to seed-images.ts.
 *
 * Usage: npx tsx scripts/backfill-image-citations.ts
 */

import crypto from "crypto";
import { db } from "@/db";
import { mediaAssets, citations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function run() {
  // Find all master image assets
  const assets = await db.select().from(mediaAssets).where(eq(mediaAssets.entityType, "master"));

  console.log(`Found ${assets.length} master media assets total.`);

  let added = 0;
  let skipped = 0;

  for (const asset of assets) {
    // Check for existing citation
    const existing = await db
      .select()
      .from(citations)
      .where(and(eq(citations.entityId, asset.id), eq(citations.entityType, "media_asset")));

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Derive excerpt/section from stored attribution field
    const originalImageName = asset.attribution ?? "unknown";
    const pageOrSection = asset.altText
      ? `Wikipedia: ${asset.altText.replace(/^Portrait of /, "")}`
      : "Wikipedia";

    await db.insert(citations).values({
      id: crypto.randomUUID(),
      entityType: "media_asset",
      entityId: asset.id,
      sourceId: "src_wikipedia",
      fieldName: "storage_path",
      excerpt: `Seeded from ${originalImageName}`,
      pageOrSection,
    });

    console.log(`  + Citation added for asset ${asset.id} (${asset.altText ?? asset.storagePath})`);
    added++;
  }

  console.log(`\nDone. Added: ${added}, Already had citation: ${skipped}`);
}

run().catch(console.error);
