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
  SRC_AZI,
  SRC_KWANUM,
  SRC_OBC,
  SRC_ONEDROP,
  SRC_PLUMVILLAGE_MONASTIC,
  SRC_PLUMVILLAGE_ORG,
  SRC_SANBOZEN,
  SRC_SOTOZEN_EUROPE,
  SRC_WHITEPLUM,
  SRC_WIKIPEDIA,
  type TempleSeed,
} from "./data/seed-temples";

function hashShort(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
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
}

async function upsertTempleSources(): Promise<void> {
  const entries = [
    {
      id: SRC_PLUMVILLAGE_ORG,
      type: "website",
      title: "Plum Village — Practice Centers",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centers",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    // SRC_WIKIPEDIA and SRC_WHITEPLUM already exist in the DB — but we still
    // upsert to make this script independently runnable.
    {
      id: SRC_WIKIPEDIA,
      type: "website",
      title: "Wikipedia — temple articles with infobox coordinates",
      author: "Wikipedia contributors",
      url: "https://en.wikipedia.org",
      publicationDate: "2025",
      reliability: "popular",
    },
    {
      id: SRC_WHITEPLUM,
      type: "website",
      title: "White Plum Asanga — Founder and Dharma Heirs",
      author: "White Plum Asanga",
      url: "https://whiteplum.org/founder/",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_EUROPE,
      type: "website",
      title: "Sōtōshū Europe Office — Temples, monasteries and practice centres in Europe",
      author: "Sōtōshū Shūmuchō",
      url: "https://global.sotozen-net.or.jp/eng/temples/europe/",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_AZI,
      type: "website",
      title: "Association Zen Internationale — Find your practice location",
      author: "Association Zen Internationale",
      url: "https://www.zen-azi.org/en/dojos",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_SANBOZEN,
      type: "website",
      title: "Sanbō Zen International — Zen leaders and Zen centers",
      author: "Sanbō Zen International",
      url: "https://sanbo-zen-international.org/en/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ONEDROP,
      type: "website",
      title: "One Drop Zen — Shōdō Harada Rōshi's global Rinzai sangha",
      author: "One Drop Zen / Hokuozan Sōgenji",
      url: "https://onedropzen.net/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM,
      type: "website",
      title: "Kwan Um School of Zen — International zen-centre directory",
      author: "Kwan Um School of Zen",
      url: "https://kwanumzen.org/zen-centers",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_OBC,
      type: "website",
      title: "Order of Buddhist Contemplatives — temples and priories directory",
      author: "Order of Buddhist Contemplatives",
      url: "https://obcon.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_PLUMVILLAGE_MONASTIC,
      type: "website",
      title: "Plum Village — Monastic practice centres directory",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/community/monastic-practice-centres",
      publicationDate: "2026",
      reliability: "authoritative",
    },
  ];
  for (const s of entries) {
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
    region: seed.region,
    country: seed.country,
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
