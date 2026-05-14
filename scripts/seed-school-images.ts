/**
 * Seed school hero images by reusing existing master portraits.
 *
 * For each school we pick a representative master (founder, head patriarch,
 * or contemporary lineage holder) whose portrait already lives at
 * public/masters/<slug>.webp, then register a school-scoped media_assets row
 * pointing at the same file plus a citation row.
 *
 * Idempotent — re-running upserts existing rows.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db tsx scripts/seed-school-images.ts
 */

import { existsSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  mediaAssets,
  schools,
} from "@/db/schema";
import { SRC_WIKIPEDIA } from "./data/seed-temples";

interface PortraitMapping {
  schoolSlug: string;
  masterSlug: string;
  /** Why this master was chosen (founder, head patriarch, modern figurehead). */
  rationale: string;
  /**
   * Optional fallback when the master is missing from the masters DB.
   * The portrait file may exist on disk under public/masters/ even if no
   * canonical master record was registered (orphan portrait). This lets us
   * still surface a school hero image.
   */
  fallback?: {
    storagePath: string; // e.g. "/masters/myoan-eisai.webp"
    altText: string;
    attribution: string;
  };
}

const SCHOOL_PORTRAITS: PortraitMapping[] = [
  // Japanese Zen
  { schoolSlug: "soto", masterSlug: "dogen", rationale: "Founder of Japanese Sōtō" },
  {
    schoolSlug: "rinzai",
    masterSlug: "myoan-eisai",
    rationale: "Founder of Japanese Rinzai",
    fallback: {
      storagePath: "/masters/myoan-eisai.webp",
      altText: "Myōan Eisai",
      attribution: "Wikipedia: Eisai",
    },
  },
  {
    schoolSlug: "obaku",
    masterSlug: "ingen-ryuki",
    rationale: "Founder of Japanese Ōbaku",
    fallback: {
      storagePath: "/masters/ingen-ryuki.webp",
      altText: "Ingen Ryūki",
      attribution: "Wikipedia: Yinyuan Longqi",
    },
  },
  { schoolSlug: "sanbo-zen", masterSlug: "yasutani-hakuun", rationale: "Co-founder of Sanbō Zen" },
  { schoolSlug: "white-plum-asanga", masterSlug: "taizan-maezumi", rationale: "Founder of White Plum Asanga" },
  // Chinese Chan — Five Houses + lineage lines
  { schoolSlug: "linji", masterSlug: "linji-yixuan", rationale: "Founder of the Linji house" },
  { schoolSlug: "caodong", masterSlug: "dongshan-liangjie", rationale: "Co-founder of Caodong" },
  { schoolSlug: "yunmen", masterSlug: "yunmen-wenyan", rationale: "Founder of the Yunmen house" },
  { schoolSlug: "fayan", masterSlug: "fayan-wenyi", rationale: "Founder of the Fayan house" },
  { schoolSlug: "guiyang", masterSlug: "guishan-lingyou", rationale: "Co-founder of Guiyang (Guishan)" },
  { schoolSlug: "yangqi-line", masterSlug: "yangqi-fanghui", rationale: "Founder of the Yangqi line" },
  { schoolSlug: "nanyue-line", masterSlug: "nanyue-huairang", rationale: "Head of the Nanyue line" },
  { schoolSlug: "qingyuan-line", masterSlug: "qingyuan-xingsi", rationale: "Head of the Qingyuan line" },
  { schoolSlug: "chan", masterSlug: "dajian-huineng", rationale: "Sixth Patriarch — face of mature Chan" },
  { schoolSlug: "early-chan", masterSlug: "puti-damo", rationale: "Bodhidharma — first Chinese patriarch" },
  { schoolSlug: "indian-patriarchs", masterSlug: "mahakashyapa", rationale: "Mahākāśyapa — first Indian patriarch, flower-sermon successor to Śākyamuni" },
  // Korean Seon
  { schoolSlug: "jogye", masterSlug: "jinul", rationale: "Pojo Jinul — restorer of Korean Seon" },
  { schoolSlug: "seon", masterSlug: "jinul", rationale: "Pojo Jinul — paradigmatic Seon master" },
  { schoolSlug: "kwan-um", masterSlug: "seung-sahn", rationale: "Founder of Kwan Um School" },
  { schoolSlug: "taego-order", masterSlug: "taego-bou", rationale: "Founder of the Taego lineage" },
  // Vietnamese Thiền
  { schoolSlug: "truc-lam", masterSlug: "tran-nhan-tong", rationale: "Founding king-monk of Trúc Lâm" },
  {
    schoolSlug: "lam-te",
    masterSlug: "nguyen-thieu",
    rationale: "Founder of Vietnamese Lâm Tế",
    fallback: {
      storagePath: "/masters/nguyen-thieu.webp",
      altText: "Nguyên Thiều",
      attribution: "Wikipedia: Nguyên Thiều",
    },
  },
  { schoolSlug: "plum-village", masterSlug: "thich-nhat-hanh", rationale: "Founder of Plum Village" },
  { schoolSlug: "thien", masterSlug: "tran-nhan-tong", rationale: "Trần Nhân Tông as paradigmatic Vietnamese Thiền figure" },
  // 'other' is a catch-all bucket (Tiantai, Pure Land hybrids, etc.) — no portrait.
];

async function resolveSchoolId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: schools.id }).from(schools).where(eq(schools.slug, slug));
  return rows[0]?.id ?? null;
}

async function resolveMasterId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, slug));
  return rows[0]?.id ?? null;
}

async function loadMasterImage(masterId: string): Promise<{
  storagePath: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  altText: string;
} | null> {
  const rows = await db
    .select({
      storagePath: mediaAssets.storagePath,
      sourceUrl: mediaAssets.sourceUrl,
      license: mediaAssets.license,
      attribution: mediaAssets.attribution,
      altText: mediaAssets.altText,
    })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.entityType, "master"),
        eq(mediaAssets.entityId, masterId),
        eq(mediaAssets.type, "image")
      )
    );
  if (rows.length === 0) return null;
  const r = rows[0];
  if (!r.storagePath) return null;
  return {
    storagePath: r.storagePath,
    sourceUrl: r.sourceUrl ?? "prior-run",
    license: r.license ?? "cc-by-sa-or-fair-use",
    attribution: r.attribution ?? "Wikipedia",
    altText: r.altText ?? "",
  };
}

async function upsertSchoolImage(
  schoolId: string,
  schoolSlug: string,
  masterSlug: string,
  rationale: string,
  img: {
    storagePath: string;
    sourceUrl: string;
    license: string;
    attribution: string;
    altText: string;
  }
): Promise<void> {
  const assetId = `img_school_${schoolSlug}`;
  const altText = img.altText || schoolSlug;

  // Upsert media_assets row
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, assetId));

  const values = {
    id: assetId,
    entityType: "school" as const,
    entityId: schoolId,
    type: "image" as const,
    storagePath: img.storagePath,
    sourceUrl: img.sourceUrl,
    license: img.license,
    attribution: img.attribution,
    altText,
    createdAt: new Date().toISOString(),
  };

  if (existing.length === 0) {
    await db.insert(mediaAssets).values(values);
  } else {
    await db
      .update(mediaAssets)
      .set({
        storagePath: values.storagePath,
        sourceUrl: values.sourceUrl,
        license: values.license,
        attribution: values.attribution,
        altText: values.altText,
      })
      .where(eq(mediaAssets.id, assetId));
  }

  // Upsert citation row
  const citationId = `cite_${assetId}`;
  const existingCite = await db
    .select({ id: citations.id })
    .from(citations)
    .where(eq(citations.id, citationId));

  const citationValues = {
    id: citationId,
    sourceId: SRC_WIKIPEDIA,
    entityType: "media_asset" as const,
    entityId: assetId,
    fieldName: "source",
    excerpt: `${altText} (school portrait — ${rationale}; image source: ${masterSlug})`,
    pageOrSection: null,
  };

  if (existingCite.length === 0) {
    await db.insert(citations).values(citationValues);
  } else {
    await db
      .update(citations)
      .set({
        sourceId: citationValues.sourceId,
        excerpt: citationValues.excerpt,
      })
      .where(eq(citations.id, citationId));
  }
}

export default async function main(): Promise<void> {
  console.log("Seeding school hero images...\n");

  const skipped: string[] = [];
  let inserted = 0;
  let skippedMissingMaster = 0;
  let skippedMissingFile = 0;

  for (const m of SCHOOL_PORTRAITS) {
    const schoolId = await resolveSchoolId(m.schoolSlug);
    if (!schoolId) {
      skipped.push(`  ⚠ school ${m.schoolSlug} not found in DB`);
      continue;
    }
    const masterId = await resolveMasterId(m.masterSlug);
    let img: Awaited<ReturnType<typeof loadMasterImage>> = null;
    if (masterId) img = await loadMasterImage(masterId);

    // Fall back to a direct file reference if the master DB record (or its
    // image asset) is missing — the portrait may be an orphan on disk.
    if (!img && m.fallback) {
      img = {
        storagePath: m.fallback.storagePath,
        sourceUrl: "prior-run",
        license: "cc-by-sa-or-fair-use",
        attribution: m.fallback.attribution,
        altText: m.fallback.altText,
      };
    }

    if (!img) {
      skipped.push(`  ⚠ ${m.schoolSlug}: master ${m.masterSlug} has no image record (and no fallback)`);
      skippedMissingMaster++;
      continue;
    }
    if (img.storagePath.startsWith("/") && !existsSync(`public${img.storagePath}`)) {
      skipped.push(`  ⚠ ${m.schoolSlug}: file public${img.storagePath} missing on disk`);
      skippedMissingFile++;
      continue;
    }

    await upsertSchoolImage(schoolId, m.schoolSlug, m.masterSlug, m.rationale, img);
    console.log(`  ✓ ${m.schoolSlug} ← ${m.masterSlug} (${img.storagePath})`);
    inserted++;
  }

  if (skipped.length) {
    console.log("\nSkipped:");
    for (const s of skipped) console.log(s);
  }

  console.log(`\n=== School images seeded ===`);
  console.log(`  registered: ${inserted}`);
  console.log(`  skipped (missing master/image): ${skippedMissingMaster}`);
  console.log(`  skipped (missing file): ${skippedMissingFile}`);
}

if (process.argv[1] && process.argv[1].endsWith("seed-school-images.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
