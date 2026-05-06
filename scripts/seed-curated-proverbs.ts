/**
 * Seed curated proverbs / short sayings into the `teachings` corpus.
 *
 * Reads structured data from scripts/data/curated-proverbs.ts and upserts:
 *   - sources (scholarly references)
 *   - teachings (type="proverb", with collection and era)
 *   - teaching_content (English locale, with license_status)
 *   - teaching_master_roles (attributed_to the named master)
 *   - citations at both the teaching and teaching_content level
 *
 * Idempotent — safe to re-run. A teaching's slug is the primary identity
 * key; re-running with the same slug replaces title/content/citations.
 *
 * Usage:
 *   npm run seed:proverbs
 *   # or
 *   DATABASE_URL=file:zen.db tsx scripts/seed-curated-proverbs.ts
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  sources,
  teachingContent,
  teachingMasterRoles,
  teachingThemes,
  teachings,
} from "@/db/schema";
import {
  CURATED_PROVERB_SOURCES,
  CURATED_PROVERBS,
  type CuratedProverb,
  type CuratedProverbSource,
} from "./data/curated-proverbs";
import {
  EXPANSION_PROVERB_SOURCES,
  EXPANSION_PROVERBS,
} from "./data/proverbs";
import { themesForTeaching } from "./data/auto-themes";

const ALL_SOURCES: CuratedProverbSource[] = [
  ...CURATED_PROVERB_SOURCES,
  ...EXPANSION_PROVERB_SOURCES,
];
const ALL_PROVERBS: CuratedProverb[] = [
  ...CURATED_PROVERBS,
  ...EXPANSION_PROVERBS,
];

async function upsertSources(): Promise<void> {
  for (const s of ALL_SOURCES) {
    const existing = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.id, s.id));
    const values = {
      type: s.type,
      title: s.title,
      author: s.author,
      url: s.url ?? null,
      publicationDate: s.publicationDate,
      reliability: s.reliability,
    };
    if (existing.length === 0) {
      await db.insert(sources).values({ id: s.id, ...values });
    } else {
      await db.update(sources).set(values).where(eq(sources.id, s.id));
    }
  }
  console.log(`✓ ${ALL_SOURCES.length} scholarly sources upserted`);
}

async function resolveMasterId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, slug));
  return rows[0]?.id ?? null;
}

async function upsertProverb(p: CuratedProverb): Promise<void> {
  const attributedMasterId = await resolveMasterId(p.attributedMasterSlug);
  if (!attributedMasterId) {
    console.warn(`  ⚠ skipping ${p.slug}: attributed master "${p.attributedMasterSlug}" not in DB`);
    return;
  }

  // Teaching row (identity by slug)
  const existing = await db
    .select({ id: teachings.id })
    .from(teachings)
    .where(eq(teachings.slug, p.slug));
  const teachingId = existing[0]?.id ?? p.slug;

  const teachingValues = {
    slug: p.slug,
    type: "proverb",
    authorId: attributedMasterId,
    collection: p.collection ?? null,
    era: p.era,
    caseNumber: null,
    compiler: null,
    attributionStatus: "traditional" as const,
  };

  if (existing.length === 0) {
    await db.insert(teachings).values({ id: teachingId, ...teachingValues });
  } else {
    await db.update(teachings).set(teachingValues).where(eq(teachings.id, teachingId));
  }

  // Replace teaching_content for the English locale
  await db
    .delete(teachingContent)
    .where(and(eq(teachingContent.teachingId, teachingId), eq(teachingContent.locale, "en")));
  await db.insert(teachingContent).values({
    id: `${teachingId}__en`,
    teachingId,
    locale: "en",
    title: p.title,
    content: p.content,
    translator: "Zen Lineage editorial",
    edition: null,
    licenseStatus: p.licenseStatus,
  });

  // Replace teaching_master_roles
  await db
    .delete(teachingMasterRoles)
    .where(eq(teachingMasterRoles.teachingId, teachingId));
  await db.insert(teachingMasterRoles).values({
    teachingId,
    masterId: attributedMasterId,
    role: p.role ?? "attributed_to",
  });

  // Replace teaching_themes for this proverb. Use explicit themes if the
  // source data provides them, otherwise fall back to keyword-derived
  // tagging so every proverb is at least minimally faceted.
  const themeSlugs =
    p.themes && p.themes.length > 0
      ? p.themes
      : themesForTeaching({ title: p.title, content: p.content });
  await db.delete(teachingThemes).where(eq(teachingThemes.teachingId, teachingId));
  for (const themeSlug of themeSlugs) {
    await db
      .insert(teachingThemes)
      .values({ teachingId, themeId: themeSlug })
      .onConflictDoNothing();
  }

  // Replace teaching-level citations
  await db
    .delete(citations)
    .where(and(eq(citations.entityType, "teaching"), eq(citations.entityId, teachingId)));
  for (let i = 0; i < p.citations.length; i++) {
    const c = p.citations[i];
    await db.insert(citations).values({
      id: `cite_${teachingId}__${i}__${c.sourceId}`,
      sourceId: c.sourceId,
      entityType: "teaching",
      entityId: teachingId,
      fieldName: "content",
      excerpt: c.excerpt ?? null,
      pageOrSection: c.pageOrSection ?? null,
    });
  }
}

async function main() {
  console.log("Seeding curated proverbs...\n");

  await upsertSources();

  let seeded = 0;
  for (const p of ALL_PROVERBS) {
    await upsertProverb(p);
    seeded++;
  }

  // Summary — count proverbs per school tradition to verify distribution.
  const summary = await db
    .select({
      slug: teachings.slug,
      schoolSlug: masters.schoolId,
    })
    .from(teachings)
    .leftJoin(masters, eq(masters.id, teachings.authorId))
    .where(eq(teachings.type, "proverb"));

  console.log(`✓ ${seeded} curated proverbs upserted`);
  console.log(`✓ ${summary.length} total proverbs in the corpus\n`);
  console.log("=== Proverb seeding complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
