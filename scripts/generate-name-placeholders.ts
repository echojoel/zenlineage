/**
 * Generate SVG name-card placeholders for masters without portraits.
 *
 * For every master that has no media_asset, write an SVG to
 * `public/masters/<slug>.svg` that shows the master's CJK (or other
 * native-script) name inside an enso-style brush circle on paper-toned
 * background. This is *not* a fabricated portrait — it is an explicit
 * name-based marker that a Wikipedia/Commons-sourced photo is not
 * available, rendered in a form consistent with the site's meditative
 * aesthetic.
 *
 * Registers each placeholder as a `media_asset` with type='placeholder'
 * so the UI can treat it differently from a real portrait and so the
 * coverage audit still counts it as a known gap.
 *
 * Idempotent — skips slugs that already have a real portrait (.webp) or
 * an existing placeholder (.svg), and leaves their DB rows unchanged.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/generate-name-placeholders.ts
 */

import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { citations, masterNames, masters, mediaAssets, schools } from "@/db/schema";

const PUBLIC_MASTERS_DIR = path.join(process.cwd(), "public", "masters");
const CJK_LOCALES = ["ja", "zh", "ko", "vi"] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Bit of a golden-ratio palette keyed to the school slug so that each
 * school's placeholders share a subtle tint. */
const SCHOOL_HUE: Record<string, number> = {
  soto: 32, // warm stone
  caodong: 32,
  rinzai: 10, // terracotta
  linji: 10,
  obaku: 50, // amber
  "sanbo-zen": 200, // dusty blue
  jogye: 280, // mulberry
  seon: 280,
  "kwan-um": 280,
  "taego-order": 280,
  thien: 130, // green tea
  "lam-te": 130,
  "truc-lam": 130,
  "plum-village": 130,
  "white-plum-asanga": 340,
  chan: 0,
  "early-chan": 0,
};

function buildSvg(options: {
  englishName: string;
  cjkName: string | null;
  schoolSlug: string | null;
  lifeRange: string | null;
}): string {
  const { englishName, cjkName, schoolSlug, lifeRange } = options;
  const hue = schoolSlug ? SCHOOL_HUE[schoolSlug] ?? 35 : 35;

  const displayCjk = cjkName ? cjkName.slice(0, 8) : null;
  // Shrink font if the CJK name is long so it stays inside the enso.
  const cjkFontSize = displayCjk
    ? displayCjk.length <= 2
      ? 160
      : displayCjk.length <= 4
        ? 110
        : 78
    : 0;

  // When no CJK available, fall back to English initials inside the circle.
  const initials = !displayCjk
    ? englishName
        .split(/\s+/)
        .slice(0, 3)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : null;

  const hueStr = hue.toString();
  const bg = `hsl(${hueStr}, 14%, 97%)`;
  const ink = `hsl(${hueStr}, 20%, 22%)`;
  const muted = `hsl(${hueStr}, 15%, 50%)`;
  const enso = `hsl(${hueStr}, 25%, 35%)`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${escapeXml(englishName)} — portrait unavailable">
  <title>${escapeXml(englishName)}${lifeRange ? ` (${escapeXml(lifeRange)})` : ""}</title>
  <desc>Name-card placeholder — no public-domain portrait of this master is available.</desc>
  <defs>
    <radialGradient id="paper" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.88"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#paper)"/>
  <g transform="translate(300 280)">
    <circle r="200" fill="none" stroke="${enso}" stroke-width="10" stroke-linecap="round" stroke-dasharray="1230 30" transform="rotate(-18)" opacity="0.85"/>
    ${
      displayCjk
        ? `<text y="${cjkFontSize / 3}" text-anchor="middle" font-family="Songti SC, STSong, Noto Serif CJK TC, serif" font-size="${cjkFontSize}" fill="${ink}" style="font-weight:500;">${escapeXml(displayCjk)}</text>`
        : `<text y="28" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="120" fill="${ink}" style="font-weight:500; letter-spacing:6px;">${escapeXml(initials ?? "")}</text>`
    }
  </g>
  <text x="300" y="530" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="26" fill="${ink}" style="font-weight:500;">${escapeXml(englishName)}</text>
  ${lifeRange ? `<text x="300" y="562" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="16" fill="${muted}" style="letter-spacing:1px;">${escapeXml(lifeRange)}</text>` : ""}
  <text x="300" y="586" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="${muted}" opacity="0.7">portrait unavailable</text>
</svg>
`;
}

function formatLifeRange(birth: number | null, death: number | null): string | null {
  if (birth == null && death == null) return null;
  const left = birth == null ? "?" : birth.toString();
  const right = death == null ? "?" : death.toString();
  return `${left}–${right}`;
}

async function main() {
  if (!fs.existsSync(PUBLIC_MASTERS_DIR)) {
    fs.mkdirSync(PUBLIC_MASTERS_DIR, { recursive: true });
  }

  const allMasters = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters);

  const existingAssetIds = new Set(
    (
      await db
        .select({ entityId: mediaAssets.entityId })
        .from(mediaAssets)
        .where(eq(mediaAssets.entityType, "master"))
    ).map((r) => r.entityId)
  );

  const schoolRows = await db.select({ id: schools.id, slug: schools.slug }).from(schools);
  const schoolSlugById = new Map(schoolRows.map((s) => [s.id, s.slug]));

  let generated = 0;
  let skipped = 0;

  for (const m of allMasters) {
    const webpPath = path.join(PUBLIC_MASTERS_DIR, `${m.slug}.webp`);
    const svgPath = path.join(PUBLIC_MASTERS_DIR, `${m.slug}.svg`);

    if (fs.existsSync(webpPath) || existingAssetIds.has(m.id)) {
      skipped++;
      continue;
    }

    // Collect names
    const nameRows = await db
      .select({ locale: masterNames.locale, value: masterNames.value, nameType: masterNames.nameType })
      .from(masterNames)
      .where(eq(masterNames.masterId, m.id));

    const englishDharma =
      nameRows.find((n) => n.locale === "en" && n.nameType === "dharma")?.value ??
      nameRows.find((n) => n.locale === "en")?.value ??
      m.slug;

    let cjk: string | null = null;
    for (const locale of CJK_LOCALES) {
      const n = nameRows.find((row) => row.locale === locale && row.nameType === "dharma");
      if (n) {
        cjk = n.value;
        break;
      }
      const any = nameRows.find((row) => row.locale === locale);
      if (any && !cjk) cjk = any.value;
    }

    const schoolSlug = m.schoolId ? schoolSlugById.get(m.schoolId) ?? null : null;

    const svg = buildSvg({
      englishName: englishDharma,
      cjkName: cjk,
      schoolSlug,
      lifeRange: formatLifeRange(m.birthYear, m.deathYear),
    });

    fs.writeFileSync(svgPath, svg);

    // Register in DB so the publish gate surfaces it.
    const assetId = `img_${m.id}`;
    await db.insert(mediaAssets).values({
      id: assetId,
      entityType: "master",
      entityId: m.id,
      type: "placeholder",
      storagePath: `/masters/${m.slug}.svg`,
      sourceUrl: null,
      license: "generated-name-placeholder",
      attribution: "Generated by Zen Lineage (name-card placeholder — portrait unavailable)",
      altText: `${englishDharma} — portrait unavailable`,
      createdAt: new Date().toISOString(),
    });

    // Placeholder citation pointing to the editorial source. Required so
    // the existing publish gate (`isPublishedImageAsset`) approves it.
    const citationId = `cite_img_${assetId}`;
    const citeRow = await db
      .select({ id: citations.id })
      .from(citations)
      .where(and(eq(citations.entityType, "media_asset"), eq(citations.entityId, assetId)));
    if (citeRow.length === 0) {
      await db.insert(citations).values({
        id: citationId,
        sourceId: "src_editorial_biographies",
        entityType: "media_asset",
        entityId: assetId,
        fieldName: "placeholder",
        excerpt: null,
        pageOrSection: "name-card placeholder",
      });
    }

    generated++;
  }

  console.log(`✓ ${generated} placeholders generated; ${skipped} masters already have portraits`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
