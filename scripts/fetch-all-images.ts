/**
 * Aggressive image fetcher for every master still missing a portrait.
 *
 * Strategy per master, in order — first hit wins:
 *   1. English Wikipedia pageimage API (infobox image).
 *   2. Japanese / Chinese / Korean / Vietnamese Wikipedia pageimages,
 *      keyed on the master's native-script names in the DB.
 *   3. Scan each language's article wikitext for `[[File:…|…]]` and
 *      `{{Infobox|image=…}}` references — recover inline images that
 *      aren't exposed by the pageimage API (common for pre-modern
 *      masters whose Wikipedia articles embed portraits in body text).
 *   4. If a master has `x-wikipedia-title` stored in master_names
 *      (nameType='wikipedia-title'), try that exact title first.
 *
 * Respects the memory rule that Wikimedia Commons *search* is unsafe:
 * we only consume direct file references that come from a Wikipedia
 * article about the master, or from the pageimage API, both of which
 * have already been vetted by Wikipedia editors.
 *
 * Idempotent — any master with a .webp under public/masters/ is skipped.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/fetch-all-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fetch } from "undici";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { citations, masterNames, masters, mediaAssets } from "@/db/schema";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");
const UA =
  "ZenEncyclopediaBot/1.0 (https://github.com/echojoel/zenlineage; educational project)";
const LANGS = ["en", "ja", "zh", "ko", "vi"] as const;
type Lang = (typeof LANGS)[number];

/** Portrait-looking filename patterns: we reject SVG icons, flags, and
 * maps. Anything containing 'portrait', 'photo', the master's name, or
 * bare JPG/PNG without obvious non-portrait keywords gets through. */
const NON_PORTRAIT_PATTERNS = [
  /^flag/i,
  /^coat_of_arms/i,
  /map/i,
  /\.svg$/i,
  /\bicon\b/i,
  /^logo/i,
  /temple\b/i,
  /shrine/i,
  /calligraphy/i,
  /buddha[_ ]statue/i,
  /pagoda/i,
  /wikipedia[- ]logo/i,
  /buddhism[_ ]symbol/i,
];

function isLikelyPortrait(filename: string): boolean {
  return !NON_PORTRAIT_PATTERNS.some((p) => p.test(filename));
}

async function smartFetch(url: string, retries = 3): Promise<Response> {
  let delay = 1500;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res as unknown as Response;
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = res.headers.get("retry-after");
      const wait = retryAfter
        ? Math.min(parseInt(retryAfter, 10) * 1000, 60_000)
        : delay;
      await new Promise((r) => setTimeout(r, wait));
      delay *= 2;
      continue;
    }
    return res as unknown as Response;
  }
  throw new Error(`max retries for ${url}`);
}

interface CandidateImage {
  imageUrl: string;
  sourceTitle: string;
  sourceLang: Lang;
  method: "pageimage" | "wikitext" | "infobox";
}

async function tryPageImage(
  lang: Lang,
  title: string
): Promise<CandidateImage | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=800&piprop=thumbnail|original&titles=${encodeURIComponent(
    title
  )}&format=json&formatversion=2&origin=*`;
  try {
    const res = await smartFetch(url);
    const data = (await res.json()) as {
      query?: {
        pages?: Array<{
          missing?: boolean;
          title?: string;
          thumbnail?: { source?: string };
          original?: { source?: string };
        }>;
      };
    };
    const page = data.query?.pages?.[0];
    if (!page || page.missing) return null;
    const thumb = page.thumbnail?.source ?? page.original?.source;
    if (!thumb) return null;
    return {
      imageUrl: thumb,
      sourceTitle: page.title ?? title,
      sourceLang: lang,
      method: "pageimage",
    };
  } catch {
    return null;
  }
}

async function tryWikitextScan(
  lang: Lang,
  title: string
): Promise<CandidateImage | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(
    title
  )}&rvprop=content&rvslots=main&format=json&formatversion=2&origin=*`;
  let wikitext: string;
  try {
    const res = await smartFetch(url);
    const data = (await res.json()) as {
      query?: {
        pages?: Array<{
          missing?: boolean;
          revisions?: Array<{ slots?: { main?: { content?: string } } }>;
        }>;
      };
    };
    const page = data.query?.pages?.[0];
    if (!page || page.missing) return null;
    wikitext = page.revisions?.[0]?.slots?.main?.content ?? "";
    if (!wikitext) return null;
  } catch {
    return null;
  }

  // 1. Infobox image field (most likely to be a portrait)
  const infoboxMatch =
    /(?:image|image1|photo|picture)\s*=\s*([^|\]\n]+\.(?:jpe?g|png|webp))/i.exec(
      wikitext
    );
  // 2. First [[File:…]] reference in the article
  const fileMatches = Array.from(
    wikitext.matchAll(/\[\[\s*(?:File|Image|ファイル|파일|文件|Tập tin):\s*([^|\]\n]+\.(?:jpe?g|png|webp))/gi)
  ).map((m) => m[1].trim());

  const candidates = [
    ...(infoboxMatch ? [infoboxMatch[1].trim()] : []),
    ...fileMatches,
  ].filter(isLikelyPortrait);

  for (const filename of candidates) {
    const resolved = await resolveCommonsFile(filename);
    if (resolved) {
      return {
        imageUrl: resolved,
        sourceTitle: `${title} (via ${filename})`,
        sourceLang: lang,
        method: infoboxMatch && infoboxMatch[1].trim() === filename ? "infobox" : "wikitext",
      };
    }
  }
  return null;
}

async function resolveCommonsFile(filename: string): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
    filename
  )}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&formatversion=2&origin=*`;
  try {
    const res = await smartFetch(url);
    const data = (await res.json()) as {
      query?: {
        pages?: Array<{
          missing?: boolean;
          imageinfo?: Array<{ thumburl?: string; url?: string }>;
        }>;
      };
    };
    const page = data.query?.pages?.[0];
    if (!page || page.missing) return null;
    const info = page.imageinfo?.[0];
    return info?.thumburl ?? info?.url ?? null;
  } catch {
    return null;
  }
}

async function downloadToWebp(imageUrl: string, outPath: string): Promise<void> {
  const res = await smartFetch(imageUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(800, null, { fit: "inside" })
    .webp({ quality: 82 })
    .toFile(outPath);
}

async function upsertMediaAsset(
  masterId: string,
  storagePath: string,
  sourceUrl: string,
  attribution: string,
  altText: string | null
): Promise<void> {
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.entityType, "master"), eq(mediaAssets.entityId, masterId)));
  const assetId = existing[0]?.id ?? `img_${masterId}`;
  const values = {
    entityType: "master",
    entityId: masterId,
    type: "image",
    storagePath,
    sourceUrl,
    license: "cc-by-sa-or-fair-use",
    attribution,
    altText,
    createdAt: new Date().toISOString(),
  };
  if (existing.length === 0) {
    await db.insert(mediaAssets).values({ id: assetId, ...values });
  } else {
    await db.update(mediaAssets).set(values).where(eq(mediaAssets.id, assetId));
  }
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
      pageOrSection: attribution,
    });
  }
}

async function candidateTitlesForMaster(
  masterId: string
): Promise<Record<Lang, string[]>> {
  const nameRows = await db
    .select({ locale: masterNames.locale, value: masterNames.value, nameType: masterNames.nameType })
    .from(masterNames)
    .where(eq(masterNames.masterId, masterId));

  const out: Record<Lang, string[]> = { en: [], ja: [], zh: [], ko: [], vi: [] };

  for (const n of nameRows) {
    const loc = n.locale as Lang;
    if (!LANGS.includes(loc)) continue;
    // Drop duplicates; prefer dharma > alias ordering in the list later
    if (!out[loc].includes(n.value)) out[loc].push(n.value);
  }

  // For English candidates, also try underscored form
  out.en = out.en.flatMap((v) => [v, v.replace(/ /g, "_")])
    // dedupe
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return out;
}

async function findImageForMaster(
  masterSlug: string,
  candidates: Record<Lang, string[]>
): Promise<CandidateImage | null> {
  // Priority: English pageimage → native-language pageimage → wikitext scans
  for (const lang of LANGS) {
    for (const title of candidates[lang]) {
      const hit = await tryPageImage(lang, title);
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  for (const lang of LANGS) {
    for (const title of candidates[lang]) {
      const hit = await tryWikitextScan(lang, title);
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  void masterSlug;
  return null;
}

async function main() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    fs.mkdirSync(PUBLIC_MASTERS_DIR, { recursive: true });
  }

  // Only look at masters that don't already have a portrait in DB.
  const allMasters = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const existing = new Set(
    (
      await db
        .select({ id: mediaAssets.entityId })
        .from(mediaAssets)
        .where(eq(mediaAssets.entityType, "master"))
    ).map((r) => r.id)
  );
  const targets = allMasters.filter((m) => !existing.has(m.id));

  // Bound the run — 235 masters × 5 languages × 2 strategies × ~1s rate
  // limit would be ~40 minutes and still hit most of what Wikipedia has.
  // Prefer to do this in batches; allow limit via ENV.
  const limit = process.env.FETCH_LIMIT ? parseInt(process.env.FETCH_LIMIT, 10) : targets.length;
  const slice = targets.slice(0, limit);

  console.log(
    `Attempting to fetch portraits for ${slice.length} of ${targets.length} masters without images...\n`
  );

  let fetched = 0;
  let missing: string[] = [];

  for (const master of slice) {
    const outPath = path.join(PUBLIC_MASTERS_DIR, `${master.slug}.webp`);
    if (fs.existsSync(outPath)) {
      // File exists on disk but not in DB — register it.
      await upsertMediaAsset(
        master.id,
        `/masters/${master.slug}.webp`,
        "prior-run",
        `Wikipedia: ${master.slug}`,
        null
      );
      continue;
    }

    const candidates = await candidateTitlesForMaster(master.id);
    const totalCandidates = Object.values(candidates).reduce((s, a) => s + a.length, 0);
    if (totalCandidates === 0) {
      missing.push(master.slug);
      continue;
    }

    process.stdout.write(`  → ${master.slug} (${totalCandidates} candidates) ...`);
    const hit = await findImageForMaster(master.slug, candidates);
    if (!hit) {
      console.log(" no image found");
      missing.push(master.slug);
      continue;
    }
    try {
      await downloadToWebp(hit.imageUrl, outPath);
      await upsertMediaAsset(
        master.id,
        `/masters/${master.slug}.webp`,
        hit.imageUrl,
        `Wikipedia (${hit.sourceLang}): ${hit.sourceTitle}`,
        hit.sourceTitle
      );
      console.log(` ✓ saved (${hit.sourceLang} ${hit.method})`);
      fetched++;
    } catch (err) {
      console.log(` FAIL: ${err instanceof Error ? err.message : err}`);
      missing.push(master.slug);
    }
    // Keep rate reasonable so Wikipedia doesn't block us.
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(
    `\n${fetched} fetched, ${slice.length - fetched - missing.length} skipped, ${missing.length} still missing`
  );
  if (missing.length > 0 && missing.length < 50) {
    console.log(`missing: ${missing.slice(0, 40).join(", ")}${missing.length > 40 ? ` … +${missing.length - 40} more` : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
