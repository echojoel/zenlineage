/**
 * Report proverb-collection coverage and quotas.
 *
 * Implements the verification step of issue #15:
 *   – total ≥ 400
 *   – Indian / early Buddhist ≥ 40
 *   – Tang/Song Chan ≥ 120
 *   – Japanese Zen ≥ 80
 *   – Korean Seon ≥ 40
 *   – Vietnamese Thiền ≥ 30
 *   – every published proverb has a citation row with explicit license_status
 *   – no single master contributes more than 10% of the collection
 *
 * Usage:
 *   DATABASE_URL=file:zen.db tsx scripts/report-proverb-coverage.ts
 *
 * Exits with non-zero if any quota fails — safe to wire into CI.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  teachingContent,
  teachings,
} from "@/db/schema";

interface Quota {
  region: string;
  min: number;
  match: (slug: string) => boolean;
}

// ─── Region buckets by master slug ───────────────────────────────────────

const INDIAN_SLUGS = new Set([
  "shakyamuni-buddha",
  "mahakashyapa",
  "ananda",
  "shanavasa",
  "upagupta",
  "dhritaka",
  "punyamitra",
  "buddhamitra",
  "buddhanandi",
  "nagarjuna",
  "vasubandhu",
  "ashvaghosha",
  "aryadeva",
  "prajnatara",
  "puti-damo",
]);

const KOREAN_SLUGS = new Set([
  "jinul",
  "chingak-hyesim",
  "taego-bou",
  "seosan-hyujeong",
  "gyeongheo-seongu",
  "seongcheol",
  "seung-sahn",
]);

const VIETNAMESE_SLUGS = new Set([
  "vinitaruci",
  "vo-ngon-thong",
  "tran-nhan-tong",
  "lieu-quan",
  "thich-nhat-hanh",
  "thich-thanh-tu",
]);

const JAPANESE_PREMODERN_SLUGS = new Set([
  "dogen",
  "keizan-jokin",
  "hakuin-ekaku",
  "bankei-yotaku",
  "ikkyu-sojun",
  "bassui-tokusho",
  "gasan-jito",
  "gasan-joseki",
  "sengai-gibon",
  "tetto-giko",
  "toyo-eicho",
  "yamamoto-gempo",
  "shinchi-kakushin",
  "nampo-gentaku",
  "enni-benen",
  "menzan-zuiho",
  "takuan-soho",
  "tetsugen-doko",
  "yongjia-xuanjue", // ambiguous — Tang Chinese; will be classed as Chan, not Japanese
]);

// Modern Japanese masters who are usually counted as "modern Western transmitters"
// (their work is in English, Western practice contexts).
const MODERN_WESTERN_SLUGS = new Set([
  "shunryu-suzuki",
  "d-t-suzuki",
  "soyen-shaku",
  "nyogen-senzaki",
  "joshu-sasaki",
  "shibayama-zenkei",
  "nakagawa-soen",
  "harada-daiun-sogaku",
  "harada-sodo-kakusho",
  "yasutani-hakuun",
  "yamada-koun",
  "robert-aitken",
  "taisen-deshimaru",
  "taizan-maezumi",
  "dainin-katagiri",
  "kobun-chino-otogawa",
  "jiyu-kennett",
  "ruben-habito",
  "omori-sogen",
  "kodo-sawaki",
  "roland-rech",
  "raphael-doko-triet",
  "philippe-reiryu-coupey",
  "olivier-reigen-wang-genh",
  "vincent-keisen-vuillemin",
  "michel-reiku-bovay",
  "evelyne-eko-de-smedt",
  "jean-pierre-genshu-faure",
  "pierre-reigen-crepon",
  "bernie-tetsugen-glassman",
  "charlotte-joko-beck",
  "dennis-genpo-merzel",
  "john-daido-loori",
  "jan-chozen-bays",
  "gerry-shishin-wick",
  "nicolee-jikyo-mccann",
  "william-nyogen-yeo",
  "susan-myoyu-andersen",
  "john-tesshin-sanderson",
  "alfred-jitsudo-ancheta",
  "anne-seisen-saunders",
  "baian-hakujun-kuroda",
  "osaka-koryu",
]);

// Anything else with school in Chan/Tang-Song or unmatched will go here.
const QUOTAS: Quota[] = [
  { region: "Indian / early Buddhist", min: 40, match: (s) => INDIAN_SLUGS.has(s) },
  { region: "Korean Seon", min: 40, match: (s) => KOREAN_SLUGS.has(s) },
  { region: "Vietnamese Thiền", min: 30, match: (s) => VIETNAMESE_SLUGS.has(s) },
  {
    region: "Japanese Zen (premodern)",
    min: 80,
    match: (s) => JAPANESE_PREMODERN_SLUGS.has(s),
  },
];

const MAX_PER_MASTER_PCT = 10;

interface ProverbRow {
  teachingId: string;
  authorSlug: string | null;
  licenseStatus: string | null;
  citationCount: number;
}

async function loadProverbs(): Promise<ProverbRow[]> {
  const rows = await db
    .select({
      teachingId: teachings.id,
      authorSlug: masters.slug,
      licenseStatus: teachingContent.licenseStatus,
      citationCount: sql<number>`(
        SELECT COUNT(*) FROM ${citations}
        WHERE ${citations.entityType} = 'teaching' AND ${citations.entityId} = ${teachings.id}
      )`,
    })
    .from(teachings)
    .leftJoin(masters, eq(masters.id, teachings.authorId))
    .leftJoin(
      teachingContent,
      sql`${teachingContent.teachingId} = ${teachings.id} AND ${teachingContent.locale} = 'en'`
    )
    .where(eq(teachings.type, "proverb"));
  return rows as ProverbRow[];
}

function classifyTangSong(slug: string | null): boolean {
  if (!slug) return false;
  if (INDIAN_SLUGS.has(slug)) return false;
  if (KOREAN_SLUGS.has(slug)) return false;
  if (VIETNAMESE_SLUGS.has(slug)) return false;
  if (JAPANESE_PREMODERN_SLUGS.has(slug)) return false;
  if (MODERN_WESTERN_SLUGS.has(slug)) return false;
  // Heuristic: the rest of the canonical Chan masters live in Chan/Tang-Song.
  return true;
}

async function main() {
  const rows = await loadProverbs();
  const total = rows.length;
  const masterCounts = new Map<string, number>();
  let unattributed = 0;
  for (const r of rows) {
    if (!r.authorSlug) {
      unattributed++;
      continue;
    }
    masterCounts.set(r.authorSlug, (masterCounts.get(r.authorSlug) ?? 0) + 1);
  }

  const tangSongCount = rows.filter((r) => classifyTangSong(r.authorSlug)).length;
  const modernCount = rows.filter(
    (r) => r.authorSlug && MODERN_WESTERN_SLUGS.has(r.authorSlug)
  ).length;

  const VALID_LICENSES = new Set(["public_domain", "cc_by", "cc_by_sa", "fair_use"]);

  let failures = 0;

  console.log(`\n── Proverb collection coverage ──\n`);
  console.log(`Total proverbs: ${total}`);
  if (total < 400) {
    console.log(`  ✗ FAIL: total < 400`);
    failures++;
  } else {
    console.log(`  ✓ ≥ 400`);
  }

  console.log(`\nUnattributed (anonymous / traditional): ${unattributed}`);
  console.log(`Tang/Song Chan (heuristic): ${tangSongCount}`);
  if (tangSongCount < 120) {
    console.log(`  ✗ FAIL: Tang/Song < 120`);
    failures++;
  } else {
    console.log(`  ✓ ≥ 120`);
  }
  console.log(`Modern Western transmitters: ${modernCount}`);

  for (const q of QUOTAS) {
    let count = 0;
    for (const [slug, c] of masterCounts) {
      if (q.match(slug)) count += c;
    }
    const status = count >= q.min ? "✓" : "✗ FAIL";
    console.log(`${q.region}: ${count} (≥ ${q.min}) ${status}`);
    if (count < q.min) failures++;
  }

  console.log(`\n── 10% per-master cap (${MAX_PER_MASTER_PCT}% of ${total} = ${Math.floor(
    (total * MAX_PER_MASTER_PCT) / 100
  )}) ──`);
  const sorted = [...masterCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [slug, c] of sorted.slice(0, 10)) {
    const pct = (c / total) * 100;
    const flag = pct > MAX_PER_MASTER_PCT ? "✗ FAIL" : "  ";
    console.log(`  ${flag}  ${slug}: ${c} (${pct.toFixed(2)}%)`);
    if (pct > MAX_PER_MASTER_PCT) failures++;
  }

  console.log(`\n── Citations & license ──`);
  const noCitation = rows.filter((r) => r.citationCount === 0).length;
  if (noCitation > 0) {
    console.log(`  ✗ FAIL: ${noCitation} proverb(s) without a citation row`);
    failures++;
  } else {
    console.log(`  ✓ Every proverb has at least one citation row`);
  }
  const badLicense = rows.filter(
    (r) => !r.licenseStatus || !VALID_LICENSES.has(r.licenseStatus)
  ).length;
  if (badLicense > 0) {
    console.log(
      `  ✗ FAIL: ${badLicense} proverb(s) missing or invalid license_status`
    );
    failures++;
  } else {
    console.log(`  ✓ Every proverb has a valid license_status`);
  }

  if (failures > 0) {
    console.log(`\n${failures} check(s) failed.\n`);
    process.exit(1);
  } else {
    console.log(`\nAll checks passed.\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
