/**
 * Teaching Seeding Script
 *
 * Reads all scripts/data/raw-teachings/teachings-*.json files and upserts
 * teachings, teaching_content, teaching_master_roles, and citations.
 * Idempotent — safe to re-run.
 *
 * Usage: npx tsx scripts/seed-teachings.ts
 */

import fs from "fs";
import path from "path";
import { db } from "@/db";
import { citations, teachings, teachingContent, teachingMasterRoles, teachingThemes } from "@/db/schema";
import { deterministicId } from "./reconcile";
import { buildTeachingItemCitations } from "./teaching-citations";
import { masters } from "@/db/schema";
import seedSources from "./seed-sources";
import type { RawTeaching } from "./scraper-types";
import { startIngestionRun, finishIngestionRun } from "./ingestion-provenance";

const RAW_TEACHINGS_DIR = path.join(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "data",
  "raw-teachings"
);

function loadAllTeachings(): RawTeaching[] {
  let dirEntries: string[];
  try {
    dirEntries = fs.readdirSync(RAW_TEACHINGS_DIR);
  } catch {
    return [];
  }
  const files = dirEntries
    .filter(f => f.startsWith("teachings-") && f.endsWith(".json"))
    .sort();

  const all: RawTeaching[] = [];
  for (const file of files) {
    const data: RawTeaching[] = JSON.parse(
      fs.readFileSync(path.join(RAW_TEACHINGS_DIR, file), "utf-8")
    );
    console.log(`  Loading ${file}: ${data.length} rows`);
    all.push(...data);
  }
  return all;
}

async function seedTeachings(): Promise<void> {
  // 1. Ensure sources are seeded first
  await seedSources();

  // 2. Load all teaching files; skip if none found
  const rawData = loadAllTeachings();
  if (rawData.length === 0) {
    console.warn("[seed-teachings] No teaching files found. Skipping.");
    return;
  }

  // 3. Start ingestion run
  const runContext = await startIngestionRun({
    sourceId: "src_editorial_teachings",
    scriptName: "seed-teachings.ts",
  });

  // 4. Build slug→masterId map
  const masterRows = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToMasterId = new Map<string, string>(masterRows.map((m) => [m.slug, m.id]));

  let seededCount = 0;
  let skippedCount = 0;

  // 5. Process each teaching
  for (const row of rawData) {
    // a. Resolve author_slug → masterId (null for "unknown" authors)
    if (row.author_slug !== "unknown" && !slugToMasterId.has(row.author_slug)) {
      console.warn(
        `[seed-teachings] Warning: no master found for author_slug "${row.author_slug}" (teaching: ${row.slug}). Skipping.`
      );
      skippedCount++;
      continue;
    }
    const authorId = row.author_slug === "unknown" ? null : slugToMasterId.get(row.author_slug)!;

    // b. Generate deterministic IDs
    const teachingId = deterministicId(`teaching:${row.slug}`);
    const contentId = deterministicId(`teaching_content:${row.slug}:en`);

    // d. Upsert teachings row
    await db
      .insert(teachings)
      .values({
        id: teachingId,
        slug: row.slug,
        type: row.type,
        authorId,
        collection: row.collection,
        era: row.era ?? null,
        caseNumber: row.case_number ?? null,
        compiler: row.compiler ?? null,
        attributionStatus: row.attribution_status,
      })
      .onConflictDoUpdate({
        target: teachings.id,
        set: {
          slug: row.slug,
          type: row.type,
          authorId,
          collection: row.collection,
          era: row.era ?? null,
          caseNumber: row.case_number ?? null,
          compiler: row.compiler ?? null,
          attributionStatus: row.attribution_status,
        },
      });

    // e. Upsert teachingContent row
    await db
      .insert(teachingContent)
      .values({
        id: contentId,
        teachingId,
        locale: row.locale,
        title: row.title,
        content: row.content,
        translator: row.translator ?? null,
        edition: row.edition ?? null,
        licenseStatus: row.license_status ?? "public_domain",
      })
      .onConflictDoUpdate({
        target: teachingContent.id,
        set: {
          teachingId,
          locale: row.locale,
          title: row.title,
          content: row.content,
          translator: row.translator ?? null,
          edition: row.edition ?? null,
          licenseStatus: row.license_status ?? "public_domain",
        },
      });

    // f. Upsert citations
    const itemCitations = buildTeachingItemCitations({
      teachingId,
      authorSlug: row.author_slug,
      collection: row.collection,
      caseNumber: row.case_number,
      sourceId: row.source_id,
      locator: row.locator,
      title: row.title,
    });

    for (const cite of itemCitations) {
      await db
        .insert(citations)
        .values({
          id: cite.id,
          sourceId: cite.sourceId,
          entityType: cite.entityType,
          entityId: cite.entityId,
          fieldName: cite.fieldName,
          excerpt: cite.excerpt,
          pageOrSection: cite.pageOrSection,
        })
        .onConflictDoUpdate({
          target: citations.id,
          set: {
            sourceId: cite.sourceId,
            entityType: cite.entityType,
            entityId: cite.entityId,
            fieldName: cite.fieldName,
            excerpt: cite.excerpt,
            pageOrSection: cite.pageOrSection,
          },
        });
    }

    // g. Upsert teachingMasterRoles if present
    if (row.master_roles && row.master_roles.length > 0) {
      for (const roleEntry of row.master_roles) {
        const roleMasterId = slugToMasterId.get(roleEntry.slug);
        if (!roleMasterId) {
          console.warn(
            `[seed-teachings] Warning: no master found for role slug "${roleEntry.slug}" (teaching: ${row.slug}). Skipping role.`
          );
          continue;
        }

        await db
          .insert(teachingMasterRoles)
          .values({
            teachingId,
            masterId: roleMasterId,
            role: roleEntry.role,
          })
          .onConflictDoUpdate({
            target: [
              teachingMasterRoles.teachingId,
              teachingMasterRoles.masterId,
              teachingMasterRoles.role,
            ],
            set: {
              role: roleEntry.role,
            },
          });
      }
    }

    // h. Upsert teachingThemes if present
    if (row.themes && row.themes.length > 0) {
      for (const themeSlug of row.themes) {
        await db
          .insert(teachingThemes)
          .values({
            teachingId,
            themeId: themeSlug,
          })
          .onConflictDoNothing();
      }
    }

    console.log(`  ✓ ${row.slug}`);
    seededCount++;
  }

  // 6. Finish ingestion run
  await finishIngestionRun(runContext, {
    status: skippedCount > 0 ? "partial" : "success",
    recordCount: seededCount,
    notes:
      skippedCount > 0
        ? `Skipped ${skippedCount} teachings due to unresolved author slugs.`
        : null,
  });

  // 7. Log summary
  console.log(`\nSeeded ${seededCount} teachings (${skippedCount} skipped).`);
}

export default seedTeachings;

if (process.argv[1] && process.argv[1].endsWith("seed-teachings.ts")) {
  seedTeachings().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
