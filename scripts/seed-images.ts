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

// Reviewed exclusions for known false-positive auto matches.
// These masters should have no auto-seeded portrait until a correct image is sourced.
const IMAGE_AUTOFETCH_BLOCKLIST = new Set(["harada-sodo-kakusho"]);

/**
 * Override search terms for masters whose Wikipedia pages use different names.
 * Each entry is an array of search terms to try in order.
 */
const IMAGE_SEARCH_OVERRIDES: Record<string, string[]> = {
  // Indian patriarchs
  "shakyamuni-buddha": ["Gautama Buddha", "Buddha", "Siddhartha Gautama"],
  mahakashyapa: ["Mahākāśyapa", "Mahakasyapa", "Mahakashyapa"],
  ananda: ["Ānanda", "Ananda (Buddhist)"],
  shanakavasa: ["Śāṇakavāsa", "Shanakavasa"],
  upagupta: ["Upagupta"],
  dhritaka: ["Dhṛtaka"],
  vasumitra: ["Vasumitra"],
  buddhanandi: ["Buddhanandi"],
  parshva: ["Pārśva", "Parshva (Buddhist)"],
  punyayashas: ["Puṇyayaśas"],
  ashvaghosha: ["Aśvaghoṣa", "Ashvaghosha"],
  kapimala: ["Kapimala"],
  nagarjuna: ["Nāgārjuna", "Nagarjuna"],
  aryadeva: ["Āryadeva", "Aryadeva"],
  vasubandhu: ["Vasubandhu"],
  simha: ["Aryasimha", "Āryasiṃha", "Simha Bhikshu"],
  prajnatara: ["Prajñātāra", "Prajnatara"],

  // Chinese — early
  "puti-damo": ["Bodhidharma"],
  "dazu-huike": ["Dazu Huike", "Huike"],
  "jianzhi-sengcan": ["Sengcan", "Jianzhi Sengcan"],
  "dajian-huineng": ["Huineng"],
  "xuefeng-yicun": ["Xuefeng Yicun", "Hsueh-feng I-ts'un"],

  // Chinese — pre-existing notable missing
  "wumen-huikai": ["Wumen Huikai", "Mumon Ekai", "無門慧開"],
  "fengxue-yanzhao": ["Fengxue Yanzhao", "風穴延沼"],
  "shishuang-qingzhu": ["Shishuang Qingzhu", "石霜慶諸"],
  "xiangyan-zhixian": ["Xiangyan Zhixian", "香巖智閑"],
  "damei-fachang": ["Damei Fachang", "大梅法常"],
  "changsha-jingcen": ["Changsha Jingcen", "長沙景岑"],
  "longya-judun": ["Longya Judun", "龍牙居遁"],
  "panshan-baoji": ["Panshan Baoji", "盤山寶積"],
  "yanguan-qian": ["Yanguan Qi'an", "鹽官齊安"],
  "xitang-zhizang": ["Xitang Zhizang", "西堂智藏"],
  "fushan-fayuan": ["Fushan Fayuan", "浮山法遠"],
  "changlu-qingliao": ["Changlu Qingliao", "真歇清了"],
  "juefan-huihong": ["Juefan Huihong", "覺範惠洪"],
  "doushuai-congyue": ["Doushuai Congyue", "兜率從悅"],
  "zhenjing-kewen": ["Zhenjing Kewen", "真淨克文"],
  "huitang-zuxin": ["Huitang Zuxin", "晦堂祖心"],
  "baiyun-shouduan": ["Baiyun Shouduan", "白雲守端"],
  "lingyun-zhiqin": ["Lingyun Zhiqin", "靈雲志勤"],

  // Chinese — modern
  xuyun: ["Xuyun", "Hsu Yun", "Empty Cloud", "虛雲"],
  "sheng-yen": ["Sheng Yen", "聖嚴法師"],
  "hsuan-hua": ["Hsuan Hua", "宣化上人"],

  // Japanese
  dogen: ["Dōgen", "Dogen Zenji"],
  "keizan-jokin": ["Keizan", "Keizan Jōkin"],
  "hakuin-ekaku": ["Hakuin Ekaku", "Hakuin"],
  "myoan-eisai": ["Eisai", "Myōan Eisai", "栄西"],
  "enni-benen": ["Enni Ben'en", "Shōichi Kokushi", "円爾"],
  "muso-soseki": ["Musō Soseki", "夢窓疎石"],
  "takuan-soho": ["Takuan Sōhō", "沢庵宗彭"],
  "torei-enji": ["Torei Enji", "東嶺圓慈"],
  "ingen-ryuki": ["Ingen", "Yinyuan Longqi", "隠元隆琦"],
  "tetsugen-doko": ["Tetsugen Dōkō", "鉄眼道光"],
  "menzan-zuiho": ["Menzan Zuihō", "面山瑞方"],
  "koho-kakumyo": ["Kōhō Kakumyō", "高峰覚明"],
  "sekko-soshin": ["Sekkō Sōshin", "雪江宗深"],
  "gyokujun-so-on": ["Gyokujun So-on"],
  "tokuo-ryoko": ["Tōkuō Ryōkō"],
  "butsumon-sogaku": ["Butsumon Sogaku"],
  "karyo-zuika": ["Karyō Zuika"],
  "bokuo-soun": ["Bokuo Soun"],

  // Japanese — Western teachers
  "gudo-wafu-nishijima": ["Gudō Wafu Nishijima", "Gudo Nishijima"],
  "taizan-maezumi": ["Taizan Maezumi", "Hakuyu Taizan Maezumi"],
  "jiyu-kennett": ["Jiyu-Kennett", "Houn Jiyu-Kennett"],
  "dainin-katagiri": ["Dainin Katagiri"],
  "kobun-chino-otogawa": ["Kobun Chino Otogawa", "Kobun Chino"],
  "roland-rech": ["Roland Rech Zen"],

  // Korean Seon
  wonhyo: ["Wonhyo", "원효"],
  toui: ["Toui (monk)", "道義"],
  "bojo-jinul": ["Jinul", "Chinul", "보조지눌"],
  "chinul-hyesim": ["Hyesim", "Chin'gak Hyesim", "혜심"],
  "taego-bou": ["Taego Bou", "태고보우"],
  "naong-hyegeun": ["Naong Hyegeun", "나옹혜근"],
  gihwa: ["Gihwa", "Hamheo Deuktong", "기화"],
  "seosan-hyujeong": ["Hyujeong", "Seosan Daesa", "서산대사"],
  "samyeongdang-yujeong": ["Samyeongdang", "Yujeong", "사명당"],
  gyeongheo: ["Gyeongheo", "경허"],
  mangong: ["Mangong", "만공"],
  "hanam-jungwon": ["Hanam Jungwon", "한암"],
  hyobong: ["Hyobong", "효봉"],
  gobong: ["Ko Bong", "Gobong", "고봉"],
  "kusan-sunim": ["Kusan Sunim", "구산"],
  seongcheol: ["Seongcheol", "Song Chol", "성철"],
  "seung-sahn": ["Seung Sahn", "숭산"],
  daehaeng: ["Daehaeng Kun Sunim", "대행"],
  beopjeong: ["Beopjeong", "법정"],

  // Vietnamese
  "thich-thanh-tu": ["Thích Thanh Từ"],

  // Western Zen
  "philip-kapleau": ["Philip Kapleau"],
  "charlotte-joko-beck": ["Charlotte Joko Beck", "Joko Beck"],
  "bernie-glassman": ["Bernie Glassman", "Tetsugen Bernard Glassman"],
  "john-daido-loori": ["John Daido Loori"],
  "joan-halifax": ["Joan Halifax", "Roshi Joan Halifax"],
};

/**
 * Search Wikimedia Commons directly for an image. Fallback when Wikipedia
 * pageimages API returns nothing.
 */
async function searchWikimediaCommons(
  searchTerms: string[],
  slug: string
): Promise<{ imageUrl: string; fileName: string; searchName: string } | null> {
  for (const term of searchTerms) {
    try {
      // Search Commons for files matching the term
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + " Buddhist")}&srnamespace=6&srlimit=5&format=json`;
      const searchRes = await smartFetch(searchUrl);
      if (!searchRes.ok) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchData = (await searchRes.json()) as any;
      const results = searchData.query?.search;
      if (!results || results.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      // Try each result to find a usable image
      for (const result of results) {
        const fileTitle = result.title; // e.g. "File:Gautama_Buddha.jpg"
        if (!fileTitle.match(/\.(jpg|jpeg|png|svg|webp)$/i)) continue;

        // Get the actual image URL
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
        const infoRes = await smartFetch(infoUrl);
        if (!infoRes.ok) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const infoData = (await infoRes.json()) as any;
        const pages = infoData.query?.pages;
        if (!pages) continue;

        const pageId = Object.keys(pages)[0];
        const imageInfo = pages[pageId]?.imageinfo?.[0];
        if (!imageInfo) continue;

        const thumbUrl = imageInfo.thumburl || imageInfo.url;
        if (!thumbUrl) continue;

        const fileName = fileTitle.replace(/^File:/, "");
        console.log(`  -> Found on Commons via "${term}": ${fileName}`);
        return { imageUrl: thumbUrl, fileName, searchName: term };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      continue;
    }
  }
  return null;
}

// Smart fetch with exponential backoff and rate limit handling
async function smartFetch(
  url: string,
  retries = 5,
  delay = 2000
): Promise<Record<string, unknown> | Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "ZenEncyclopediaBot/1.0 (https://github.com/zen-encyclopedia; educational project)",
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

      console.warn(
        `    [Rate Limited] HTTP ${res.status}. Retrying in ${waitTime / 1000}s... (${i + 1}/${retries})`
      );
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

  // Sort so masters with overrides are processed first (they're most likely to have images)
  const sortedMasters = [...allMasters].sort((a, b) => {
    const aHasOverride = IMAGE_SEARCH_OVERRIDES[a.slug] ? 0 : 1;
    const bHasOverride = IMAGE_SEARCH_OVERRIDES[b.slug] ? 0 : 1;
    return aHasOverride - bHasOverride;
  });

  let successCount = 0;
  let skipCount = 0;
  let alreadyExistsCount = 0;

  for (const master of sortedMasters) {
    if (IMAGE_AUTOFETCH_BLOCKLIST.has(master.slug)) {
      console.log(
        `\nSkipping auto image search for: ${master.slug} (reviewed false-positive risk)`
      );
      skipCount++;
      continue;
    }

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
          excerpt: `Seeded from Wikimedia Commons: ${existingMedia[0].sourceUrl?.split("/").pop() || "unknown"}`,
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

    // NOTE: Commons search fallback is disabled. It returns false positives
    // (wrong person, unrelated photos like cafes/statues) that would be
    // disrespectful to display for masters. Only Wikipedia pageimages (which
    // are editorially curated) are trustworthy enough for automatic use.
    // To add Commons images, use seed-images-targeted.ts with manual review.

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
