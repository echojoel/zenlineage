/**
 * Targeted Image Seeding — Only processes masters with IMAGE_SEARCH_OVERRIDES
 * that don't already have images. Uses proper Wikipedia API User-Agent.
 *
 * Usage: npx tsx scripts/seed-images-targeted.ts
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fetch } from "undici";
import { db } from "@/db";
import { masters, masterNames, mediaAssets, citations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");

const UA =
  "ZenEncyclopediaBot/1.0 (https://github.com/zen-encyclopedia; educational project)";

/**
 * Slugs to search — only masters with known Wikipedia presence.
 * Map of slug → search terms to try in order.
 */
const TARGETS: Record<string, string[]> = {
  // Korean Seon
  "wonhyo": ["Wonhyo", "원효"],
  "toui": ["Toui (monk)", "道義"],
  "bojo-jinul": ["Jinul", "Chinul", "보조지눌"],
  "chinul-hyesim": ["Hyesim", "Chin'gak Hyesim", "혜심"],
  "taego-bou": ["Taego Bou", "태고보우"],
  "naong-hyegeun": ["Naong Hyegeun", "나옹혜근"],
  "gihwa": ["Gihwa", "Hamheo Deuktong", "기화"],
  "seosan-hyujeong": ["Hyujeong", "Seosan Daesa", "서산대사"],
  "samyeongdang-yujeong": ["Samyeongdang", "Yujeong", "사명당"],
  "gyeongheo": ["Gyeongheo", "경허"],
  "mangong": ["Mangong", "만공"],
  "hanam-jungwon": ["Hanam Jungwon", "한암"],
  "hyobong": ["Hyobong", "효봉"],
  "gobong": ["Ko Bong", "Gobong", "고봉"],
  "kusan-sunim": ["Kusan Sunim", "구산"],
  "seongcheol": ["Seongcheol", "Song Chol", "성철"],
  "seung-sahn": ["Seung Sahn", "숭산"],
  "daehaeng": ["Daehaeng Kun Sunim", "대행"],
  "beopjeong": ["Beopjeong", "법정"],

  // Japanese
  "myoan-eisai": ["Eisai", "Myōan Eisai", "栄西"],
  "enni-benen": ["Enni Ben'en", "Shōichi Kokushi", "円爾"],
  "muso-soseki": ["Musō Soseki", "夢窓疎石"],
  "takuan-soho": ["Takuan Sōhō", "沢庵宗彭"],
  "torei-enji": ["Torei Enji", "東嶺圓慈"],
  "ingen-ryuki": ["Ingen", "Yinyuan Longqi", "隠元隆琦"],
  "tetsugen-doko": ["Tetsugen Dōkō", "鉄眼道光"],
  "menzan-zuiho": ["Menzan Zuihō", "面山瑞方"],

  // Chinese modern
  "xuyun": ["Xuyun", "Hsu Yun", "Empty Cloud", "虛雲"],
  "sheng-yen": ["Sheng Yen", "聖嚴法師"],
  "hsuan-hua": ["Hsuan Hua", "宣化上人"],

  // Western Zen
  "philip-kapleau": ["Philip Kapleau"],
  "charlotte-joko-beck": ["Charlotte Joko Beck", "Joko Beck"],
  "bernie-glassman": ["Bernie Glassman", "Tetsugen Bernard Glassman"],
  "john-daido-loori": ["John Daido Loori"],
  "joan-halifax": ["Joan Halifax", "Roshi Joan Halifax"],

  // Vietnamese
  "thich-thanh-tu": ["Thích Thanh Từ"],

  // Pre-existing notable missing (Chinese historical)
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
  "koho-kakumyo": ["Kōhō Kakumyō", "高峰覚明"],
  "sekko-soshin": ["Sekkō Sōshin", "雪江宗深"],
};

async function smartFetch(url: string, retries = 3, delay = 3000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
    });

    if (res.ok) return res as unknown as Response;

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = res.headers.get("retry-after");
      let waitTime = delay * Math.pow(2, i);
      if (retryAfter) {
        const parsed = parseInt(retryAfter, 10);
        if (!isNaN(parsed)) waitTime = Math.min(parsed * 1000, 60000); // cap at 60s
      }
      console.warn(`    [Rate Limited] HTTP ${res.status}. Retrying in ${waitTime / 1000}s... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, waitTime));
      continue;
    }
    return res as unknown as Response;
  }
  throw new Error(`Max retries reached for ${url}`);
}

async function searchWikipedia(
  searchTerms: string[]
): Promise<{ imageUrl: string; fileName: string; searchName: string } | null> {
  for (const term of searchTerms) {
    try {
      const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=800&titles=${encodeURIComponent(term)}&format=json`;
      const res = await smartFetch(wpUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      const pages = data.query?.pages;
      if (!pages || pages["-1"]) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      if (page.thumbnail?.source) {
        return {
          imageUrl: page.thumbnail.source,
          fileName: page.pageimage || "unknown",
          searchName: term,
        };
      }
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

async function searchCommons(
  searchTerms: string[]
): Promise<{ imageUrl: string; fileName: string; searchName: string } | null> {
  for (const term of searchTerms) {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + " Buddhist")}&srnamespace=6&srlimit=5&format=json`;
      const searchRes = await smartFetch(searchUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchData = (await searchRes.json()) as any;
      const results = searchData.query?.search;
      if (!results || results.length === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      for (const result of results) {
        const fileTitle = result.title;
        if (!fileTitle.match(/\.(jpg|jpeg|png|svg|webp)$/i)) continue;
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
        const infoRes = await smartFetch(infoUrl);
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
        return { imageUrl: thumbUrl, fileName, searchName: term };
      }
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      continue;
    }
  }
  return null;
}

async function main() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    fs.mkdirSync(PUBLIC_MASTERS_DIR, { recursive: true });
  }

  const allMasters = await db.select().from(masters);
  const slugToMaster = new Map(allMasters.map((m) => [m.slug, m]));

  let success = 0;
  let skip = 0;
  let notFound = 0;

  const slugs = Object.keys(TARGETS);
  console.log(`Processing ${slugs.length} targeted masters...\n`);

  for (const slug of slugs) {
    const master = slugToMaster.get(slug);
    if (!master) {
      console.log(`  [SKIP] ${slug} — not in database`);
      skip++;
      continue;
    }

    // Check if image already exists
    const existing = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.entityId, master.id), eq(mediaAssets.entityType, "master")));

    if (existing.length > 0 && existing[0].storagePath) {
      console.log(`  [EXISTS] ${slug}`);
      skip++;
      continue;
    }

    // Check if file already on disk (from a previous partial run)
    const filePath = path.join(PUBLIC_MASTERS_DIR, `${slug}.webp`);
    if (fs.existsSync(filePath)) {
      console.log(`  [ON DISK] ${slug} — file exists but no DB record, will create`);
    }

    const searchTerms = TARGETS[slug];
    console.log(`\n  Searching: ${slug} (${searchTerms.join(", ")})`);

    // Only use Wikipedia pageimages (editorially curated article images).
    // Commons search is disabled — it returns false positives (wrong person,
    // unrelated photos) that would be disrespectful to display for masters.
    const result = await searchWikipedia(searchTerms);

    if (!result) {
      console.log(`    -> No image found`);
      notFound++;
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    console.log(`    -> Found via "${result.searchName}": ${result.fileName}`);

    try {
      // Download
      const imgRes = await smartFetch(result.imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      // Optimize
      const outputPath = path.join(PUBLIC_MASTERS_DIR, `${slug}.webp`);
      const imageInfo = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`    -> Saved: ${slug}.webp (${imageInfo.width}x${imageInfo.height})`);

      // DB record
      const dbPath = `/masters/${slug}.webp`;
      let mediaAssetId: string;

      if (existing.length > 0) {
        mediaAssetId = existing[0].id;
        await db
          .update(mediaAssets)
          .set({
            storagePath: dbPath,
            sourceUrl: result.imageUrl,
            attribution: `Wikimedia Commons: ${result.fileName}`,
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
          sourceUrl: result.imageUrl,
          license: "Public Domain / CC (Wikimedia)",
          attribution: `Wikimedia Commons: ${result.fileName}`,
          altText: `Portrait of ${result.searchName}`,
          width: imageInfo.width,
          height: imageInfo.height,
          createdAt: new Date().toISOString(),
        });
      }

      // Citation
      const existingCit = await db
        .select()
        .from(citations)
        .where(
          and(
            eq(citations.entityId, mediaAssetId),
            eq(citations.entityType, "media_asset"),
            eq(citations.sourceId, "src_wikipedia")
          )
        );

      if (existingCit.length === 0) {
        await db.insert(citations).values({
          id: crypto.randomUUID(),
          entityType: "media_asset",
          entityId: mediaAssetId,
          sourceId: "src_wikipedia",
          fieldName: "storage_path",
          excerpt: `Seeded from Wikimedia Commons: ${result.fileName}`,
          pageOrSection: `Wikipedia: ${result.searchName}`,
        });
      }

      success++;
      // Polite delay between successful downloads
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.error(`    -> Error: ${err}`);
      notFound++;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n=== Targeted Seeding Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Skipped (exists): ${skip}`);
  console.log(`Not found: ${notFound}`);
}

main().catch(console.error);
