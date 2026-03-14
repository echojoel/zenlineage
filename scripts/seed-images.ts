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

/**
 * Override search terms for masters whose Wikipedia pages use different names.
 * Each entry is an array of search terms to try in order.
 */
const IMAGE_SEARCH_OVERRIDES: Record<string, string[]> = {
  "shakyamuni-buddha": ["Gautama Buddha", "Buddha", "Siddhartha Gautama"],
  "mahakashyapa": ["Mahākāśyapa", "Mahakasyapa"],
  "ananda": ["Ānanda", "Ananda (Buddhist)"],
  "ashvaghosha": ["Aśvaghoṣa", "Ashvaghosha"],
  "nagarjuna": ["Nāgārjuna", "Nagarjuna"],
  "aryadeva": ["Āryadeva", "Aryadeva"],
  "vasubandhu": ["Vasubandhu"],
  "upagupta": ["Upagupta"],
  "parshva": ["Pārśva", "Parshva (Buddhist)"],
  "kapimala": ["Kapimala"],
  "simha": ["Aryasimha", "Simha (Buddhist patriarch)"],
  "prajnatara": ["Prajñātāra", "Prajnatara"],
  "puti-damo": ["Bodhidharma"],
  "dajian-huineng": ["Huineng"],
  "dogen": ["Dōgen", "Dogen Zenji"],
  "hakuin-ekaku": ["Hakuin Ekaku", "Hakuin"],
};

// Smart fetch with exponential backoff and rate limit handling
async function smartFetch(url: string, retries = 5, delay = 2000): Promise<Record<string, unknown> | Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (res.ok) {
      return res;
    }

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = res.headers.get("retry-after");
      let waitTime = delay * Math.pow(2, i); // Exponential backoff

      if (retryAfter) {
        const parsedRetry = parseInt(retryAfter, 10);
        if (!isNaN(parsedRetry)) {
          waitTime = parsedRetry * 1000;
        }
      }

      console.warn(`    [Rate Limited] HTTP ${res.status}. Retrying in ${waitTime / 1000}s... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    // Other errors (e.g., 404, 403) we don't retry
    return res;
  }
  throw new Error(`Max retries reached for ${url}`);
}

async function init() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    fs.mkdirSync(PUBLIC_MASTERS_DIR, { recursive: true });
  }

  console.log("Fetching masters from database...");
  const allMasters = await db.select().from(masters);

  let successCount = 0;
  let skipCount = 0;
  let alreadyExistsCount = 0;

  for (const master of allMasters) {
    // 0. Check if existing record
    const existingMedia = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.entityId, master.id), eq(mediaAssets.entityType, "master")));

    // Ensure citation exists if media exists, then skip.
    if (existingMedia.length > 0 && existingMedia[0].storagePath) {
      const existingCitation = await db
        .select()
        .from(citations)
        .where(
          and(
            eq(citations.entityId, existingMedia[0].id),
            eq(citations.entityType, "media_asset"),
            eq(citations.sourceId, "src_wikipedia")
          )
        );

      if (existingCitation.length === 0) {
        console.log(`\nFixing missing citation for already downloaded image: ${master.slug}`);
        await db.insert(citations).values({
          id: crypto.randomUUID(),
          entityType: "media_asset",
          entityId: existingMedia[0].id,
          sourceId: "src_wikipedia",
          fieldName: "storage_path",
          excerpt: `Seeded from Wikimedia Commons: ${existingMedia[0].sourceUrl?.split('/').pop() || 'unknown'}`,
          pageOrSection: `Wikipedia: ${master.slug.replace(/-/g, " ")}`,
        });
        successCount++;
      } else {
        alreadyExistsCount++;
      }
      continue;
    }

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

    // Get search names — try overrides first, then fall back to dharma name
    const overrideTerms = IMAGE_SEARCH_OVERRIDES[master.slug];
    const dharmaName = names.length > 0 ? names[0].value : master.slug.replace(/-/g, " ");
    const searchTerms = overrideTerms ? [...overrideTerms, dharmaName] : [dharmaName];

    console.log(`\nSearching image for: ${master.slug} (terms: ${searchTerms.join(", ")})`);

    let imageUrl: string | null = null;
    let originalImageName = "unknown";
    let usedSearchName = dharmaName;

    for (const searchName of searchTerms) {
      try {
        const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|imageinfo&pithumbsize=800&titles=${encodeURIComponent(searchName)}&format=json`;
        const res = await smartFetch(wpUrl);

        if (!res.ok) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (await res.json()) as any;
        const pages = data.query?.pages;
        if (!pages || pages["-1"]) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        if (page.thumbnail?.source) {
          imageUrl = page.thumbnail.source;
          originalImageName = page.pageimage || "unknown";
          usedSearchName = searchName;
          console.log(`  -> Found via "${searchName}": ${imageUrl}`);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }

    if (!imageUrl) {
      console.log(`  -> No image found for ${master.slug} (tried: ${searchTerms.join(", ")})`);
      skipCount++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    try {

      // 2. Download the image
      const imgRes = await smartFetch(imageUrl);
      
      if (!imgRes.ok) {
        console.error(`  -> Failed to download image: HTTP ${imgRes.status}`);
        skipCount++;
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
        await db.insert(mediaAssets).values({
          id: mediaAssetId,
          entityType: "master",
          entityId: master.id,
          type: "image",
          storagePath: dbPath,
          sourceUrl: imageUrl,
          license: "Public Domain / CC (Wikimedia)",
          attribution: `Wikimedia Commons: ${originalImageName}`,
          altText: `Portrait of ${usedSearchName}`,
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
          pageOrSection: `Wikipedia: ${usedSearchName}`,
        });
      }

      console.log(`  -> DB record and citation updated.`);
      successCount++;

      // Polite delay between successful masters
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (err) {
      console.error(`  -> Error processing ${master.slug}:`, err);
      skipCount++;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n=== Seeding Complete ===`);
  console.log(`Already existed (skipped): ${alreadyExistsCount}`);
  console.log(`Successfully fetched or fixed: ${successCount}`);
  console.log(`Skipped (no image found or error): ${skipCount}`);
}

init().catch(console.error);
