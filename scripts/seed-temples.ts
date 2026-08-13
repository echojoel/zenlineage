/**
 * Seed the temples dataset from scripts/data/seed-temples.ts.
 *
 * Upserts:
 *   - sources (Wikipedia + Plum Village + White Plum canonical listings)
 *   - temples (slug as stable primary key)
 *   - temple_names (per-locale)
 *   - citations (entityType="temple", fieldName="coordinates")
 *   - master_temples role="founded" where founder slug resolves to a master
 *
 * Idempotent — re-running upserts existing rows.
 *
 * Usage:
 *   npm run seed:temples
 */

import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  masterTemples,
  schools,
  sources,
  templeNames,
  temples,
} from "@/db/schema";
import {
  SEED_TEMPLES,
  TEMPLE_SOURCES,
  SRC_ABZE,
  SRC_AZI,
  SRC_BOUDDHISME_FRANCE,
  SRC_BOUNDLESS_WAY,
  SRC_BUDDHANET,
  SRC_BUDDHIST_SOCIETY_UK,
  SRC_BUN,
  SRC_CHOZEN_JI,
  SRC_DBU,
  SRC_DHARMADRUM,
  SRC_DIAMOND_SANGHA,
  SRC_EU_ZEN_RESEARCH,
  SRC_FELSENTOR,
  SRC_FOGUANG,
  SRC_GIACNGO_VN,
  SRC_GLOBAL_ZEN_RESEARCH,
  SRC_BUDISMO_COM,
  SRC_IRIZ_HANAZONO,
  SRC_IZAUK,
  SRC_KANSHOJI,
  SRC_KOSEN_SANGHA,
  SRC_KWAN_UM_POLAND,
  SRC_KWANUM,
  SRC_LUZ_SERENA,
  SRC_MOKUSHO_HOUSE,
  SRC_MRO,
  SRC_OBC,
  SRC_OBR,
  SRC_ONEDROP,
  SRC_ORDINARY_MIND,
  SRC_PHATGIAO_VN,
  SRC_PLUMVILLAGE_MONASTIC,
  SRC_PLUMVILLAGE_ORG,
  SRC_PUREGG,
  SRC_RINNOU,
  SRC_RINZAIJI,
  SRC_SANBOZEN,
  SRC_SANDO_KAISEN,
  SRC_SBU,
  SRC_SFZC,
  SRC_SOTOZEN_ES,
  SRC_SOTOZEN_EUROPE,
  SRC_SOTOZEN_JP,
  SRC_SOTOZEN_NAVI,
  SRC_STONEWATER_ZEN,
  SRC_SZBA,
  SRC_UBI,
  SRC_UBP,
  SRC_WESTERN_CHAN_FELLOWSHIP,
  SRC_WHITEPLUM,
  SRC_WIKIPEDIA,
  SRC_ZEN_GUIDE_DE,
  SRC_ZEN_PEACEMAKERS,
  SRC_ZEN_ROAD,
  SRC_ZEN_STUDIES_SOCIETY,
  type TempleSeed,
} from "./data/seed-temples";

function hashShort(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

// Canonicalise country names so the same nation can't appear under two
// spellings (which would split the /practice/by-country pages, sitemap, and
// per-school country groupings). Add aliases here rather than fixing one-off
// rows in the seed lists.
const COUNTRY_ALIASES: Record<string, string> = {
  UK: "United Kingdom",
  "U.K.": "United Kingdom",
  USA: "United States",
  "U.S.A.": "United States",
  "U.S.": "United States",
  US: "United States",
};

function normalizeCountry(country: string): string {
  return COUNTRY_ALIASES[country.trim()] ?? country;
}

async function ensureTempleSchema(): Promise<void> {
  // Idempotent schema evolution — in-place add of the `url` column so a
  // dev machine that already has zen.db doesn't need a separate
  // `npm run db:migrate` step. The canonical migration lives at
  // drizzle/0004_temple_official_url.sql.
  try {
    await db.run(sql`ALTER TABLE temples ADD COLUMN url text`);
  } catch {
    // Column already exists — fine.
  }
  // Canonical migration: drizzle/0007_bitter_zodiak.sql.
  try {
    await db.run(sql`ALTER TABLE temples ADD COLUMN geo_precision text`);
  } catch {
    // Column already exists — fine.
  }
}


async function upsertTempleSources(): Promise<void> {
  for (const s of TEMPLE_SOURCES) {
    const existing = await db.select({ id: sources.id }).from(sources).where(eq(sources.id, s.id));
    if (existing.length === 0) {
      await db.insert(sources).values(s);
    } else {
      await db.update(sources).set(s).where(eq(sources.id, s.id));
    }
  }
}

async function resolveSchoolId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: schools.id }).from(schools).where(eq(schools.slug, slug));
  return rows[0]?.id ?? null;
}

async function resolveMasterId(slug: string | undefined): Promise<string | null> {
  if (!slug) return null;
  const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, slug));
  return rows[0]?.id ?? null;
}

async function upsertTemple(seed: TempleSeed): Promise<{ id: string; inserted: boolean }> {
  const schoolId = await resolveSchoolId(seed.schoolSlug);
  if (!schoolId) {
    throw new Error(
      `Temple "${seed.slug}" references unknown school "${seed.schoolSlug}" — run seed-schools.ts first`
    );
  }
  const founderId = await resolveMasterId(seed.founderSlug);
  if (seed.founderSlug && !founderId) {
    console.warn(
      `  ⚠ temple ${seed.slug}: founder "${seed.founderSlug}" not in DB — stored without founder_id`
    );
  }

  const existing = await db.select({ id: temples.id }).from(temples).where(eq(temples.slug, seed.slug));
  const id = existing[0]?.id ?? seed.slug;

  const values = {
    slug: seed.slug,
    lat: seed.lat,
    lng: seed.lng,
    // Hand-curated rows below carry coordinates checked against a named
    // source, so an absent value means "exact" rather than "unknown".
    geoPrecision: seed.geoPrecision ?? "exact",
    region: seed.region,
    country: normalizeCountry(seed.country),
    foundedYear: seed.foundedYear,
    foundedPrecision: seed.foundedPrecision,
    foundedConfidence: "high" as const,
    founderId,
    schoolId,
    status: seed.status,
    url: seed.url ?? null,
  };

  if (existing.length === 0) {
    await db.insert(temples).values({ id, ...values });
    return { id, inserted: true };
  } else {
    await db.update(temples).set(values).where(eq(temples.id, id));
    return { id, inserted: false };
  }
}

async function replaceTempleNames(templeId: string, seed: TempleSeed): Promise<void> {
  const locales = Array.from(new Set(seed.names.map((n) => n.locale)));
  for (const locale of locales) {
    await db
      .delete(templeNames)
      .where(and(eq(templeNames.templeId, templeId), eq(templeNames.locale, locale)));
  }
  for (const n of seed.names) {
    await db.insert(templeNames).values({
      id: `${templeId}__${n.locale}__${hashShort(n.value)}`,
      templeId,
      locale: n.locale,
      value: n.value,
    });
  }
}

async function upsertTempleCitation(templeId: string, seed: TempleSeed): Promise<void> {
  await db
    .delete(citations)
    .where(and(eq(citations.entityType, "temple"), eq(citations.entityId, templeId)));
  await db.insert(citations).values({
    id: `cite_temple_${templeId}__${seed.sourceId}`,
    sourceId: seed.sourceId,
    entityType: "temple",
    entityId: templeId,
    fieldName: "coordinates",
    excerpt: seed.sourceExcerpt,
    pageOrSection: null,
  });
}

async function upsertFounderLink(templeId: string, seed: TempleSeed): Promise<void> {
  if (!seed.founderSlug) return;
  const masterId = await resolveMasterId(seed.founderSlug);
  if (!masterId) return;
  // master_temples has composite PK (master_id, temple_id); check for
  // existing row before inserting to stay idempotent.
  const existing = await db
    .select({ masterId: masterTemples.masterId })
    .from(masterTemples)
    .where(and(eq(masterTemples.masterId, masterId), eq(masterTemples.templeId, templeId)));
  if (existing.length === 0) {
    await db.insert(masterTemples).values({
      masterId,
      templeId,
      role: "founded",
    });
  } else {
    await db
      .update(masterTemples)
      .set({ role: "founded" })
      .where(and(eq(masterTemples.masterId, masterId), eq(masterTemples.templeId, templeId)));
  }
}

async function main(): Promise<void> {
  console.log("Seeding temples...\n");
  await ensureTempleSchema();
  await upsertTempleSources();

  let inserted = 0;
  let updated = 0;

  for (const seed of SEED_TEMPLES) {
    const { id, inserted: wasInserted } = await upsertTemple(seed);
    await replaceTempleNames(id, seed);
    await upsertTempleCitation(id, seed);
    await upsertFounderLink(id, seed);
    if (wasInserted) inserted++;
    else updated++;
  }

  // Delete any temples that no longer appear in SEED_TEMPLES. This keeps
  // the seed file the source of truth: renaming a temple (e.g. replacing
  // an entry whose existence we could not verify) is reflected in prod
  // rather than leaving a stale row behind.
  const seedSlugs = SEED_TEMPLES.map((s) => s.slug);
  const stale = await db
    .select({ id: temples.id, slug: temples.slug })
    .from(temples)
    .where(notInArray(temples.slug, seedSlugs));
  let removed = 0;
  if (stale.length > 0) {
    const staleIds = stale.map((t) => t.id);
    await db.delete(templeNames).where(inArray(templeNames.templeId, staleIds));
    await db
      .delete(citations)
      .where(and(eq(citations.entityType, "temple"), inArray(citations.entityId, staleIds)));
    await db.delete(masterTemples).where(inArray(masterTemples.templeId, staleIds));
    await db.delete(temples).where(inArray(temples.id, staleIds));
    removed = stale.length;
    console.log(`  removed: ${removed} (${stale.map((t) => t.slug).join(", ")})`);
  }

  console.log(`✓ ${SEED_TEMPLES.length} temples processed`);
  console.log(`  inserted: ${inserted}`);
  console.log(`  updated:  ${updated}`);
  if (removed > 0) console.log(`  removed:  ${removed}`);
  console.log("\n=== Temple seeding complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
