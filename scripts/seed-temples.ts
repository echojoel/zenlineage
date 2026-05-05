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
  SRC_ABZE,
  SRC_AZI,
  SRC_BOUDDHISME_FRANCE,
  SRC_BUDDHIST_SOCIETY_UK,
  SRC_BUN,
  SRC_DBU,
  SRC_DIAMOND_SANGHA,
  SRC_EU_ZEN_RESEARCH,
  SRC_FELSENTOR,
  SRC_IZAUK,
  SRC_KANSHOJI,
  SRC_KOSEN_SANGHA,
  SRC_KWAN_UM_POLAND,
  SRC_KWANUM,
  SRC_LUZ_SERENA,
  SRC_MRO,
  SRC_OBC,
  SRC_OBR,
  SRC_ONEDROP,
  SRC_PLUMVILLAGE_MONASTIC,
  SRC_PLUMVILLAGE_ORG,
  SRC_PUREGG,
  SRC_RINZAIJI,
  SRC_SANBOZEN,
  SRC_SBU,
  SRC_SFZC,
  SRC_SOTOZEN_ES,
  SRC_SOTOZEN_EUROPE,
  SRC_STONEWATER_ZEN,
  SRC_UBI,
  SRC_UBP,
  SRC_WESTERN_CHAN_FELLOWSHIP,
  SRC_WHITEPLUM,
  SRC_WIKIPEDIA,
  SRC_ZEN_GUIDE_DE,
  SRC_ZEN_ROAD,
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
    {
      id: SRC_SFZC,
      type: "website",
      title: "San Francisco Zen Center (sfzc.org)",
      author: "San Francisco Zen Center",
      url: "https://www.sfzc.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_DIAMOND_SANGHA,
      type: "website",
      title: "Diamond Sangha — Aitken Roshi lineage",
      author: "Honolulu Diamond Sangha",
      url: "https://diamondsangha.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_MRO,
      type: "website",
      title: "Mountains and Rivers Order — Zen Mountain Monastery network",
      author: "Mountains and Rivers Order / John Daido Loori",
      url: "https://zmm.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_RINZAIJI,
      type: "website",
      title: "Rinzai-ji — Joshu Sasaki Roshi network",
      author: "Rinzai-ji Zen Center",
      url: "https://www.rinzaiji.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KOSEN_SANGHA,
      type: "website",
      title: "Kosen Sangha — Dōjō directory (zen-deshimaru.com)",
      author: "Kosen Sangha / Stéphane Kosen Thibaut",
      url: "https://www.zen-deshimaru.com/fr/dojos-zen-de-la-kosen-sangha",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KANSHOJI,
      type: "website",
      title: "Monastère Bouddhiste Zen Kanshoji — Places of practice",
      author: "Kanshoji / Taiun Jean-Pierre Faure",
      url: "https://www.kanshoji.org/places-of-practice/?lang=en",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_ROAD,
      type: "website",
      title: "Zen Road — Roland Yuno Rech dōjō directory",
      author: "Zen Road / Roland Yuno Rech",
      url: "https://zen-road.org/en/dojos/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ABZE,
      type: "website",
      title: "ABZE — Association Bouddhiste Zen d'Europe",
      author: "ABZE",
      url: "https://abzen.eu/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_DBU,
      type: "website",
      title: "Deutsche Buddhistische Union — Zen-Mitgliedsorganisationen",
      author: "Deutsche Buddhistische Union",
      url: "https://buddhismus-deutschland.de/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BUN,
      type: "website",
      title: "Boeddhistische Unie Nederland — Zen-aangesloten centra",
      author: "Boeddhistische Unie Nederland",
      url: "https://boeddhisme.nl/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SBU,
      type: "website",
      title: "Schweizerische Buddhistische Union — Zen-Mitgliedszentren",
      author: "Schweizerische Buddhistische Union",
      url: "https://www.sbu.net/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_OBR,
      type: "website",
      title: "Österreichische Buddhistische Religionsgesellschaft — Zen-Mitglieder",
      author: "Österreichische Buddhistische Religionsgesellschaft",
      url: "https://www.buddhismus-austria.at/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_UBI,
      type: "website",
      title: "Unione Buddhista Italiana — Centri Zen affiliati",
      author: "Unione Buddhista Italiana",
      url: "https://www.unionebuddhistaitaliana.it/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_UBP,
      type: "website",
      title: "União Budista Portuguesa — Centros Zen afiliados",
      author: "União Budista Portuguesa",
      url: "https://uniaobudista.pt/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BOUDDHISME_FRANCE,
      type: "website",
      title: "Bouddhisme-France — Annuaire des centres de pratique",
      author: "Union Bouddhiste de France",
      url: "https://www.bouddhisme-france.org/centres-de-pratique/annuaire-des-membres/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_GUIDE_DE,
      type: "website",
      title: "zen-guide.de — German-language Zen practice-place catalogue",
      author: "zen-guide.de editors",
      url: "https://www.zen-guide.de/",
      publicationDate: "2026",
      reliability: "popular",
    },
    {
      id: SRC_WESTERN_CHAN_FELLOWSHIP,
      type: "website",
      title: "Western Chan Fellowship — UK Chan/Zen practice groups",
      author: "Western Chan Fellowship (Hsu Yun lineage)",
      url: "https://westernchanfellowship.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_STONEWATER_ZEN,
      type: "website",
      title: "StoneWater Zen Sangha — UK White Plum centres",
      author: "StoneWater Zen Sangha",
      url: "https://www.stonewaterzen.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_IZAUK,
      type: "website",
      title: "International Zen Association UK — Dōjō directory",
      author: "International Zen Association UK",
      url: "https://izauk.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BUDDHIST_SOCIETY_UK,
      type: "website",
      title: "The Buddhist Society — Zen Group",
      author: "The Buddhist Society (Hampstead)",
      url: "https://thebuddhistsociety.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_FELSENTOR,
      type: "website",
      title: "Felsentor / Houshinji — Sōtō monastery, Stoos",
      author: "Felsentor / Houshinji",
      url: "https://www.felsentor.ch/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_PUREGG,
      type: "website",
      title: "Puregg Zen-Kloster — Austria",
      author: "Puregg Zen-Kloster",
      url: "https://puregg.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_LUZ_SERENA,
      type: "website",
      title: "Luz Serena — Spanish Sōtō monastery (Dokushô Villalba)",
      author: "Comunidad Budista Soto Zen / Dokushô Villalba",
      url: "https://luzserena.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_ES,
      type: "website",
      title: "Comunidad Budista Sōtō Zen España (CBSZ)",
      author: "Comunidad Budista Sōtō Zen España",
      url: "https://sotozen.es/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KWAN_UM_POLAND,
      type: "website",
      title: "Związek Buddystów Czan Kwan Um w Polsce — zen.pl",
      author: "Kwan Um School of Zen Polska",
      url: "https://zen.pl/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_EU_ZEN_RESEARCH,
      type: "website",
      title: "European Zen places research bundle (2026-05-05)",
      author: "zenlineage.org research",
      url: "https://zenlineage.org/practice",
      publicationDate: "2026",
      reliability: "popular",
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
