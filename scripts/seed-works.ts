/**
 * Seed canonical "works" into the teachings corpus.
 *
 * A *work* is a whole text (Shōbōgenzō, Fukanzazengi, the Linji Lu, the
 * Platform Sutra…) rather than an individual koan or saying inside it.
 * We model these as `teachings` rows with `type='work'` so they share the
 * same /teachings/[slug] route, citation graph, and search infrastructure
 * as the finer-grained teaching units.
 *
 * Idempotent — re-running upserts every row by deterministic id and only
 * reattaches citations / master roles that don't already exist.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db tsx scripts/seed-works.ts
 */

import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  citations,
  masters,
  teachingContent,
  teachingMasterRoles,
  teachingThemes,
  teachings,
} from "@/db/schema";
import { deterministicId } from "./reconcile";
import { startIngestionRun, finishIngestionRun } from "./ingestion-provenance";
import { WORKS, type WorkSeed } from "./data/works";
import { themesForTeaching } from "./data/auto-themes";

async function seedWorks(): Promise<void> {
  const runContext = await startIngestionRun({
    sourceId: "src_editorial_teachings",
    scriptName: "seed-works.ts",
  });

  const masterRows = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToMasterId = new Map<string, string>(masterRows.map((m) => [m.slug, m.id]));

  let seeded = 0;
  let skipped = 0;

  for (const work of WORKS) {
    const authorId = slugToMasterId.get(work.authorSlug);
    if (!authorId) {
      console.warn(
        `[seed-works] Skipping ${work.slug}: no master found for slug "${work.authorSlug}".`
      );
      skipped++;
      continue;
    }

    const teachingId = deterministicId(`teaching:${work.slug}`);
    const contentId = deterministicId(`teaching_content:${work.slug}:en`);

    await upsertWork(work, teachingId, authorId);
    await upsertContent(work, teachingId, contentId);
    await upsertOriginalContent(work, teachingId);
    await upsertAuthorRole(teachingId, authorId);
    await upsertCitation(work, teachingId);
    await upsertThemes(teachingId, work);

    console.log(`  ✓ ${work.slug}`);
    seeded++;
  }

  await finishIngestionRun(runContext, {
    status: skipped > 0 ? "partial" : "success",
    recordCount: seeded,
    notes:
      skipped > 0
        ? `Skipped ${skipped} works due to unresolved author slugs.`
        : null,
  });

  console.log(`\nSeeded ${seeded} works (${skipped} skipped).`);
}

async function upsertWork(work: WorkSeed, teachingId: string, authorId: string) {
  const values = {
    id: teachingId,
    slug: work.slug,
    type: "work",
    authorId,
    collection: work.collection,
    era: work.era,
    caseNumber: null,
    compiler: null,
    attributionStatus: work.attributionStatus,
  };
  await db
    .insert(teachings)
    .values(values)
    .onConflictDoUpdate({ target: teachings.id, set: values });
}

async function upsertContent(work: WorkSeed, teachingId: string, contentId: string) {
  const values = {
    id: contentId,
    teachingId,
    locale: "en",
    title: work.title,
    content: work.description,
    translator: work.translator ?? null,
    edition: work.edition ?? null,
    licenseStatus: work.licenseStatus,
  };
  await db
    .insert(teachingContent)
    .values(values)
    .onConflictDoUpdate({ target: teachingContent.id, set: values });
}

async function upsertOriginalContent(work: WorkSeed, teachingId: string) {
  if (!work.originalTitle) return;
  // Native-language locale is best-guess from the era / collection. We use
  // a generic "orig" locale tag rather than picking ja/zh/ko on every entry
  // — the teaching detail page already groups any non-en row under the
  // "Original language" header.
  const locale = guessOriginalLocale(work);
  const id = deterministicId(`teaching_content:${work.slug}:${locale}`);
  const values = {
    id,
    teachingId,
    locale,
    title: work.originalTitle,
    content: work.originalTitle,
    translator: null,
    edition: null,
    licenseStatus: "public_domain",
  };
  await db
    .insert(teachingContent)
    .values(values)
    .onConflictDoUpdate({ target: teachingContent.id, set: values });
}

function guessOriginalLocale(work: WorkSeed): string {
  // Coarse mapping by era. Good enough for the original-title field; the
  // long-form translations all live under "en". If a work lacks an era we
  // fall back to "zh" (the lingua franca of Chan/Seon scripture).
  const eraMap: Record<string, string> = {
    Tang: "zh",
    Song: "zh",
    Sui: "zh",
    Goryeo: "ko",
    Joseon: "ko",
    Kamakura: "ja",
    Edo: "ja",
    Modern: "vi",
  };
  return work.era ? (eraMap[work.era] ?? "zh") : "zh";
}

async function upsertAuthorRole(teachingId: string, authorId: string) {
  await db
    .insert(teachingMasterRoles)
    .values({ teachingId, masterId: authorId, role: "attributed_to" })
    .onConflictDoNothing();
}

async function upsertThemes(teachingId: string, work: WorkSeed) {
  const slugs = themesForTeaching({ title: work.title, content: work.description });
  await db.delete(teachingThemes).where(eq(teachingThemes.teachingId, teachingId));
  for (const themeSlug of slugs) {
    await db
      .insert(teachingThemes)
      .values({ teachingId, themeId: themeSlug })
      .onConflictDoNothing();
  }
}

async function upsertCitation(work: WorkSeed, teachingId: string) {
  const id = deterministicId(`cite:${teachingId}:${work.sourceId}:work`);
  const values = {
    id,
    sourceId: work.sourceId,
    entityType: "teaching",
    entityId: teachingId,
    fieldName: "content",
    excerpt: work.excerpt,
    pageOrSection: work.locator,
  };
  await db
    .insert(citations)
    .values(values)
    .onConflictDoUpdate({ target: citations.id, set: values });
}

export default seedWorks;

if (process.argv[1] && process.argv[1].endsWith("seed-works.ts")) {
  seedWorks().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
