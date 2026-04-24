/**
 * Register every .webp already on disk under `public/masters/` as a
 * media_asset + citation. Run after `seed-db.ts` wipes media_assets,
 * before `fetch-kv-images.ts` (which only knows about specific slugs)
 * and before `generate-name-placeholders.ts` (which fills the rest).
 *
 * Idempotent — upserts the asset row for each file found.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/register-disk-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { citations, masters, mediaAssets } from "@/db/schema";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");

async function main() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    console.log("No public/masters directory — skipping.");
    return;
  }

  const files = fs
    .readdirSync(PUBLIC_MASTERS_DIR)
    .filter((f) => f.endsWith(".webp"));

  const slugToFile = new Map(files.map((f) => [f.replace(/\.webp$/, ""), f]));

  const allMasters = await db.select({ id: masters.id, slug: masters.slug }).from(masters);

  let registered = 0;
  let skipped = 0;
  for (const m of allMasters) {
    const file = slugToFile.get(m.slug);
    if (!file) continue;

    const assetId = `img_${m.id}`;
    const existing = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.entityType, "master"), eq(mediaAssets.entityId, m.id)));
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(mediaAssets).values({
      id: assetId,
      entityType: "master",
      entityId: m.id,
      type: "image",
      storagePath: `/masters/${file}`,
      sourceUrl: null,
      license: "cc-by-sa-or-fair-use",
      attribution: "Wikipedia",
      altText: m.slug,
      createdAt: new Date().toISOString(),
    });

    const citationId = `cite_img_${assetId}`;
    const existingCite = await db
      .select({ id: citations.id })
      .from(citations)
      .where(and(eq(citations.entityType, "media_asset"), eq(citations.entityId, assetId)));
    if (existingCite.length === 0) {
      await db.insert(citations).values({
        id: citationId,
        sourceId: "src_wikipedia",
        entityType: "media_asset",
        entityId: assetId,
        fieldName: "source",
        excerpt: null,
        pageOrSection: m.slug,
      });
    }

    registered++;
  }

  console.log(`✓ registered ${registered} disk portraits; ${skipped} already had DB entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
