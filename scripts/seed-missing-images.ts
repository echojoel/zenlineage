/**
 * Targeted image fetcher for remaining patriarchs and school images.
 * Searches Wikimedia Commons with specific terms for each master/school.
 *
 * Usage: npx tsx scripts/seed-missing-images.ts
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fetch } from "undici";
import { db } from "@/db";
import { masters, schools, schoolNames, mediaAssets, citations } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import crypto from "crypto";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");
const PUBLIC_SCHOOLS_DIR = path.join(process.cwd(), "public", "schools");
const UA = "zen-encyclopedia/1.0 (contact: zen-project@example.com)";

// Targeted search terms for the 16 remaining patriarchs.
// Tay Phuong Pagoda (Vietnam) has lacquered wood statues of all 28 patriarchs.
const PATRIARCH_SEARCH_MAP: Record<string, string[]> = {
  dhritaka: ["Dhritaka Tay Phuong", "Dhritaka Buddhist patriarch", "提多迦"],
  gayashata: ["Gayashata Tay Phuong", "Gayashata Buddhist patriarch", "伽耶舍多"],
  haklena: ["Haklena Tay Phuong", "Haklenayasas Buddhist", "鶴勒那"],
  jayata: ["Jayata Buddhist patriarch", "闍夜多"],
  kapimala: ["Kapimala Tay Phuong", "Kapimala Buddhist patriarch", "迦毘摩羅"],
  kumarata: ["Kumarata Tay Phuong", "Kumarata Buddhist patriarch", "鳩摩羅多"],
  manorhita: ["Manorhita Tay Phuong", "Manura Buddhist patriarch", "摩拏羅"],
  michaka: ["Michaka Tay Phuong", "Michaka Buddhist patriarch", "彌遮迦"],
  parshva: ["Parshva Tay Phuong", "Parshva Buddhist patriarch arhat", "脇尊者"],
  prajnatara: ["Prajnatara Tay Phuong", "Prajnatara Buddhist", "般若多羅"],
  punyamitra: ["Punyamitra Tay Phuong", "Punyamitra Buddhist patriarch", "不如蜜多"],
  punyayashas: ["Punyayashas Tay Phuong", "Punyayasas Buddhist", "富那夜奢"],
  rahulata: ["Rahulata Tay Phuong", "Rahulata Buddhist patriarch", "羅睺羅多"],
  sanghanandi: ["Sanghanandi Tay Phuong", "Sanghanandi Buddhist patriarch", "僧伽難提"],
  shanakavasa: ["Shanakavasa Tay Phuong", "Sanakavasa Buddhist patriarch", "商那和修"],
  simha: ["Aryasimha Tay Phuong", "Simha Buddhist patriarch martyr", "師子尊者"],
  vasasita: ["Vasasita Tay Phuong", "Basiasita Buddhist", "婆舍斯多"],
};

// Search terms for school images (temples, landscapes, calligraphy)
const SCHOOL_SEARCH_MAP: Record<string, string[]> = {
  "indian-patriarchs": ["Bodh Gaya Mahabodhi Temple", "Bodhi tree Bodh Gaya", "Vulture Peak Rajgir Buddhist"],
  chan: ["Chan Buddhism temple", "Shaolin Temple chan", "Chinese Zen temple"],
  "early-chan": ["Shaolin Temple Songshan", "East Mountain temple Zen"],
  linji: ["Linji temple Zhengding", "Rinzai Zen temple China", "Linji Chan monastery"],
  rinzai: ["Myoshinji temple Kyoto", "Rinzai Zen temple Japan", "Daitokuji temple"],
  caodong: ["Caodong Zen temple", "Dongshan temple Jiangxi", "Caodong Chan"],
  soto: ["Eiheiji temple Fukui", "Sojiji temple Yokohama", "Soto Zen temple Japan"],
  yunmen: ["Yunmen temple Guangdong", "Yunmen Zen monastery", "Cloud Gate monastery"],
  guiyang: ["Guishan temple Hunan", "Guiyang Chan", "Mount Gui Zen"],
  "sanbo-zen": ["Sanbo Zen Kamakura", "Sanbo Kyodan temple", "Sanbō Zen"],
  "nanyue-line": ["Nanyue Hengshan temple", "Mount Heng Hunan Buddhist temple"],
  "qingyuan-line": ["Qingyuan temple Jiangxi", "Mount Qingyuan Buddhist"],
  "yangqi-line": ["Yangqi temple Jiangxi", "Yangqi Zen monastery"],
  other: ["Zen garden meditation", "Zen Buddhist meditation hall"],
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchCommonsForImage(
  searchTerms: string[]
): Promise<{ thumbUrl: string; fileName: string; usedTerm: string } | null> {
  for (const term of searchTerms) {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=6&srlimit=5&format=json`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchData = (await fetchJson(searchUrl)) as any;
      const results = searchData.query?.search;
      if (!results || results.length === 0) {
        await sleep(400);
        continue;
      }

      for (const result of results) {
        const fileTitle = result.title as string;
        // Only accept standard image formats
        if (!fileTitle.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const infoData = (await fetchJson(infoUrl)) as any;
        const pages = infoData.query?.pages;
        if (!pages) continue;

        const pageId = Object.keys(pages)[0];
        const imageInfo = pages[pageId]?.imageinfo?.[0];
        const thumbUrl = imageInfo?.thumburl || imageInfo?.url;
        if (!thumbUrl) continue;

        const fileName = fileTitle.replace(/^File:/, "");
        return { thumbUrl, fileName, usedTerm: term };
      }
      await sleep(400);
    } catch {
      await sleep(400);
      continue;
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadAndSave(
  imageUrl: string,
  outputPath: string
): Promise<{ width: number; height: number }> {
  const res = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const info = await sharp(buf)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  return { width: info.width, height: info.height };
}

async function seedPatriarchImages(): Promise<number> {
  console.log("\n=== Fetching remaining patriarch images ===\n");
  let count = 0;

  for (const [slug, terms] of Object.entries(PATRIARCH_SEARCH_MAP)) {
    // Check if already has image
    const master = (
      await db.select().from(masters).where(eq(masters.slug, slug))
    )[0];
    if (!master) {
      console.log(`  skip: ${slug} — not in DB`);
      continue;
    }

    const existing = await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.entityId, master.id),
          eq(mediaAssets.entityType, "master"),
          isNotNull(mediaAssets.storagePath)
        )
      );
    if (existing.length > 0) {
      console.log(`  skip: ${slug} — already has image`);
      continue;
    }

    console.log(`  searching: ${slug}...`);
    const result = await searchCommonsForImage(terms);
    if (!result) {
      console.log(`    ✗ no image found`);
      continue;
    }

    try {
      const outputPath = path.join(PUBLIC_MASTERS_DIR, `${slug}.webp`);
      const info = await downloadAndSave(result.thumbUrl, outputPath);
      const mediaId = crypto.randomUUID();

      await db.insert(mediaAssets).values({
        id: mediaId,
        entityType: "master",
        entityId: master.id,
        type: "image",
        storagePath: `/masters/${slug}.webp`,
        sourceUrl: result.thumbUrl,
        license: "Public Domain / CC (Wikimedia)",
        attribution: `Wikimedia Commons: ${result.fileName}`,
        altText: `Portrait or depiction of ${slug.replace(/-/g, " ")}`,
        width: info.width,
        height: info.height,
        createdAt: new Date().toISOString(),
      });

      await db.insert(citations).values({
        id: crypto.randomUUID(),
        entityType: "media_asset",
        entityId: mediaId,
        sourceId: "src_wikipedia",
        fieldName: "storage_path",
        excerpt: `Seeded from Wikimedia Commons: ${result.fileName}`,
        pageOrSection: `Wikimedia Commons: ${result.usedTerm}`,
      });

      console.log(`    ✓ ${slug} — ${result.fileName} (${info.width}x${info.height})`);
      count++;
      await sleep(1500);
    } catch (err) {
      console.log(`    ✗ ${slug} — download failed: ${err}`);
    }
  }

  return count;
}

async function seedSchoolImages(): Promise<number> {
  console.log("\n=== Fetching school images ===\n");

  if (!fs.existsSync(PUBLIC_SCHOOLS_DIR)) {
    fs.mkdirSync(PUBLIC_SCHOOLS_DIR, { recursive: true });
  }

  let count = 0;

  const allSchools = await db
    .select({ id: schools.id, slug: schools.slug })
    .from(schools);

  for (const school of allSchools) {
    // Check if already has image
    const existing = await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.entityId, school.id),
          eq(mediaAssets.entityType, "school"),
          isNotNull(mediaAssets.storagePath)
        )
      );
    if (existing.length > 0) {
      console.log(`  skip: ${school.slug} — already has image`);
      continue;
    }

    const terms = SCHOOL_SEARCH_MAP[school.slug];
    if (!terms) {
      console.log(`  skip: ${school.slug} — no search terms defined`);
      continue;
    }

    console.log(`  searching: ${school.slug}...`);
    const result = await searchCommonsForImage(terms);
    if (!result) {
      console.log(`    ✗ no image found`);
      continue;
    }

    try {
      const outputPath = path.join(PUBLIC_SCHOOLS_DIR, `${school.slug}.webp`);
      const info = await downloadAndSave(result.thumbUrl, outputPath);
      const mediaId = crypto.randomUUID();

      await db.insert(mediaAssets).values({
        id: mediaId,
        entityType: "school",
        entityId: school.id,
        type: "image",
        storagePath: `/schools/${school.slug}.webp`,
        sourceUrl: result.thumbUrl,
        license: "Public Domain / CC (Wikimedia)",
        attribution: `Wikimedia Commons: ${result.fileName}`,
        altText: `${school.slug.replace(/-/g, " ")} school`,
        width: info.width,
        height: info.height,
        createdAt: new Date().toISOString(),
      });

      await db.insert(citations).values({
        id: crypto.randomUUID(),
        entityType: "media_asset",
        entityId: mediaId,
        sourceId: "src_wikipedia",
        fieldName: "storage_path",
        excerpt: `Seeded from Wikimedia Commons: ${result.fileName}`,
        pageOrSection: `Wikimedia Commons: ${result.usedTerm}`,
      });

      console.log(`    ✓ ${school.slug} — ${result.fileName} (${info.width}x${info.height})`);
      count++;
      await sleep(1500);
    } catch (err) {
      console.log(`    ✗ ${school.slug} — download failed: ${err}`);
    }
  }

  return count;
}

async function main() {
  const patriarchCount = await seedPatriarchImages();
  const schoolCount = await seedSchoolImages();
  console.log(`\n=== Done ===`);
  console.log(`New patriarch images: ${patriarchCount}`);
  console.log(`New school images: ${schoolCount}`);
}

main().catch(console.error);
