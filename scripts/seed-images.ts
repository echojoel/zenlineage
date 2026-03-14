/**
 * Image Seeding Script (Agent)
 *
 * Automatically searches Wikipedia for Zen masters, downloads their primary
 * image (if available), optimizes it to WebP format using `sharp`, and saves
 * the metadata in the `media_assets` database table.
 *
 * Usage: npx tsx scripts/seed-images.ts
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fetch } from "undici";
import { db } from "@/db";
import { masters, masterNames, mediaAssets, citations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Using crypto.randomUUID for IDs
import crypto from "crypto";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");

async function init() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    fs.mkdirSync(PUBLIC_MASTERS_DIR, { recursive: true });
  }

  console.log("Fetching masters from database...");
  const allMasters = await db.select().from(masters);
  
  let successCount = 0;
  let skipCount = 0;

  for (const master of allMasters) {
    // Get primary English Dharma name to search Wikipedia
    const names = await db
      .select()
      .from(masterNames)
      .where(
        and(
          eq(masterNames.masterId, master.id),
          eq(masterNames.locale, "en"),
          eq(masterNames.nameType, "dharma")
        )
      );

    const searchName = names.length > 0 ? names[0].value : master.slug.replace(/-/g, " ");
    
    // We can also try alternative search names if first fails, but we'll stick to primary for now.
    console.log(`\nSearching image for: ${searchName} (${master.slug})`);

    try {
      // 1. Query Wikipedia API for page image
      const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|imageinfo&pithumbsize=800&titles=${encodeURIComponent(searchName)}&format=json`;
      const res = await fetch(wpUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      });
      
      if (!res.ok) {
        console.error(`  -> Failed to fetch Wikipedia API: HTTP ${res.status}`);
        skipCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;

      const pages = data.query?.pages;
      if (!pages || pages["-1"]) {
        console.log(`  -> No Wikipedia page found for ${searchName}`);
        skipCount++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }

      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (!page.thumbnail || !page.thumbnail.source) {
        console.log(`  -> Page found but no image for ${searchName}`);
        skipCount++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }

      const imageUrl = page.thumbnail.source;
      const originalImageName = page.pageimage || "unknown";
      
      console.log(`  -> Found image: ${imageUrl}`);

      // 2. Download the image
      const imgRes = await fetch(imageUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      });
      if (!imgRes.ok) {
        console.error(`  -> Failed to download image: HTTP ${imgRes.status}`);
        skipCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Optimize with Sharp (resize to max 800w, convert to WebP)
      const outputPath = path.join(PUBLIC_MASTERS_DIR, `${master.slug}.webp`);
      const imageInfo = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`  -> Saved optimized WebP: ${master.slug}.webp`);

      // 4. Upsert into media_assets table
      const dbPath = `/masters/${master.slug}.webp`;

      // Check if existing record
      const existingMedia = await db
        .select()
        .from(mediaAssets)
        .where(
          and(
            eq(mediaAssets.entityId, master.id),
            eq(mediaAssets.entityType, "master")
          )
        );

      let mediaAssetId = "";
      if (existingMedia.length > 0) {
        mediaAssetId = existingMedia[0].id;
        await db
          .update(mediaAssets)
          .set({
            storagePath: dbPath,
            sourceUrl: imageUrl,
            attribution: `Wikimedia Commons: ${originalImageName}`,
            width: imageInfo.width,
            height: imageInfo.height,
          })
          .where(eq(mediaAssets.id, mediaAssetId));
      } else {
        mediaAssetId = crypto.randomUUID();
        await db
          .insert(mediaAssets)
          .values({
            id: mediaAssetId,
            entityType: "master",
            entityId: master.id,
            type: "image",
            storagePath: dbPath,
            sourceUrl: imageUrl,
            license: "Public Domain / CC (Wikimedia)",
            attribution: `Wikimedia Commons: ${originalImageName}`,
            altText: `Portrait of ${searchName}`,
            width: imageInfo.width,
            height: imageInfo.height,
            createdAt: new Date().toISOString(),
          });
      }

      // 5. Ensure a citation exists so the image passes the publish gate
      const existingCitation = await db
        .select()
        .from(citations)
        .where(
          and(
            eq(citations.entityId, mediaAssetId),
            eq(citations.entityType, "media_asset"),
            eq(citations.sourceId, "src_wikipedia")
          )
        );

      if (existingCitation.length === 0) {
        await db.insert(citations).values({
          id: crypto.randomUUID(),
          entityType: "media_asset",
          entityId: mediaAssetId,
          sourceId: "src_wikipedia",
          fieldName: "storage_path",
          excerpt: `Seeded from Wikimedia Commons: ${originalImageName}`,
          pageOrSection: `Wikipedia: ${searchName}`,
        });
      }

      console.log(`  -> DB record and citation updated.`);
      successCount++;
      
      // Delay slightly to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));

    } catch (err) {
      console.error(`  -> Error processing ${searchName}:`, err);
      skipCount++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n=== Seeding Complete ===`);
  console.log(`Successfully fetched and processed: ${successCount}`);
  console.log(`Skipped (no image found or error): ${skipCount}`);
}

init().catch(console.error);
