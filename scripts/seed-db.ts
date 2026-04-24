/**
 * Database Seeding Script
 *
 * Single entry point for seeding the entire database. Seeds everything in order:
 *   sources → masters → schools → transmissions → citations → search tokens
 *   → biographies → teachings
 *
 * Idempotent — safe to re-run. Each run resets derived tables and rebuilds.
 *
 * Usage:  npx tsx scripts/seed-db.ts
 *         npm run seed
 */

import fs from "fs";
import path from "path";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  schoolNames,
  schools,
  masters,
  masterNames,
  masterTemples,
  masterTransmissions,
  mediaAssets,
  searchTokens,
  citations,
  teachingContent,
  teachingMasterRoles,
  teachingRelations,
  teachingThemes,
  teachings,
  themes,
  themeNames,
} from "@/db/schema";
import { buildResolvedMasterSlugMap } from "./master-slugs";
import type {
  CanonicalMaster,
  CanonicalTransmission,
  CanonicalCitation,
  CanonicalSearchToken,
} from "./reconcile";

const RECONCILED_DIR = path.join(process.cwd(), "scripts/data/reconciled");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson<T>(filename: string): T | null {
  const filepath = path.join(RECONCILED_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  ${filename} not found — skipping`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, "utf-8")) as T;
}

// ---------------------------------------------------------------------------
// Reset derived tables so reseeding reflects the current canonical dataset.
// ---------------------------------------------------------------------------

async function resetDerivedTables(): Promise<void> {
  console.log("Resetting derived tables...");

  await db.delete(searchTokens);
  // Preserve only media_asset citations — images are seeded by separate scripts.
  await db.delete(citations).where(ne(citations.entityType, "media_asset"));
  // Content tables with master FKs must be cleared before rebuilding masters.
  await db.delete(teachingThemes);
  await db.delete(teachingRelations);
  await db.delete(teachingMasterRoles);
  await db.delete(teachingContent);
  await db.delete(teachings);
  await db.delete(themeNames);
  await db.delete(themes);
  await db.delete(masterTransmissions);
  await db.delete(masterNames);
  // Detach temple → master references before wiping masters. The
  // temples table itself is owned by the seed-temples pipeline (keyed
  // on slug, re-runs idempotently), but its founder_id / master_temples
  // rows become dangling the moment we delete masters.
  await db.delete(masterTemples);
  await db.run(sql`UPDATE temples SET founder_id = NULL`);
  // Clear MASTER media_assets + their citations *before* deleting
  // masters so we don't leave orphan rows pointing at ids that will be
  // gone. Image files under public/masters/ stay on disk; they'll be
  // re-registered by register-disk-images / fetch-kv-images /
  // generate-name-placeholders. School images are left alone because
  // their rows survive the master wipe (they're seeded by
  // import-curated-images).
  const masterImageIds = (
    await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.entityType, "master"))
  ).map((r) => r.id);
  if (masterImageIds.length > 0) {
    await db
      .delete(citations)
      .where(
        and(
          eq(citations.entityType, "media_asset"),
          inArray(citations.entityId, masterImageIds)
        )
      );
  }
  await db.delete(mediaAssets).where(eq(mediaAssets.entityType, "master"));
  await db.delete(masters);
  await db.delete(schoolNames);
  // temples.school_id references schools.id — detach before wiping.
  await db.run(sql`UPDATE temples SET school_id = NULL`);
  await db.delete(schools);

  console.log("✓ Derived tables cleared");
}

// ---------------------------------------------------------------------------
// Upsert masters
// ---------------------------------------------------------------------------

async function seedMasters(canonicalMasters: CanonicalMaster[]): Promise<void> {
  console.log(`Seeding ${canonicalMasters.length} masters...`);

  const resolvedSlugs = buildResolvedMasterSlugMap(
    canonicalMasters.map((master) => ({ id: master.id, slug: master.slug }))
  );

  for (const m of canonicalMasters) {
    const slug = resolvedSlugs.get(m.id) ?? m.slug;
    // Upsert master row
    await db
      .insert(masters)
      .values({
        id: m.id,
        slug,
        birthYear: m.birth_year,
        birthPrecision: m.birth_precision,
        birthConfidence: m.birth_confidence,
        deathYear: m.death_year,
        deathPrecision: m.death_precision,
        deathConfidence: m.death_confidence,
        schoolId: null, // populated by school seeding if available
        generation: null,
      })
      .onConflictDoUpdate({
        target: masters.id,
        set: {
          slug,
          birthYear: m.birth_year,
          birthPrecision: m.birth_precision,
          birthConfidence: m.birth_confidence,
          deathYear: m.death_year,
          deathPrecision: m.death_precision,
          deathConfidence: m.death_confidence,
        },
      });

    // Upsert name rows
    for (const name of m.names) {
      const nameId = `${m.id}_${name.locale}_${name.name_type}_${name.value.slice(0, 20)}`.replace(
        /\s+/g,
        "_"
      );
      await db
        .insert(masterNames)
        .values({
          id: nameId,
          masterId: m.id,
          locale: name.locale,
          nameType: name.name_type,
          value: name.value,
        })
        .onConflictDoUpdate({
          target: masterNames.id,
          set: { value: name.value },
        });
    }
  }

  console.log(`✓ Masters seeded`);
}

// ---------------------------------------------------------------------------
// Upsert transmissions
// ---------------------------------------------------------------------------

async function seedTransmissions(transmissions: CanonicalTransmission[]): Promise<void> {
  console.log(`Seeding ${transmissions.length} transmissions...`);

  for (const t of transmissions) {
    await db
      .insert(masterTransmissions)
      .values({
        id: t.id,
        studentId: t.student_id,
        teacherId: t.teacher_id,
        type: t.type,
        isPrimary: t.is_primary,
        notes: null,
      })
      .onConflictDoUpdate({
        target: masterTransmissions.id,
        set: {
          type: t.type,
          isPrimary: t.is_primary,
        },
      });
  }

  console.log(`✓ Transmissions seeded`);
}

// ---------------------------------------------------------------------------
// Upsert citations
// ---------------------------------------------------------------------------

async function seedCitations(citationList: CanonicalCitation[]): Promise<void> {
  console.log(`Seeding ${citationList.length} citations...`);

  for (const c of citationList) {
    await db
      .insert(citations)
      .values({
        id: c.id,
        sourceId: c.source_id,
        entityType: c.entity_type,
        entityId: c.entity_id,
        fieldName: c.field_name,
        excerpt: c.excerpt,
        pageOrSection: null,
      })
      .onConflictDoUpdate({
        target: citations.id,
        set: {
          excerpt: c.excerpt,
        },
      });
  }

  console.log(`✓ Citations seeded`);
}

// ---------------------------------------------------------------------------
// Upsert search tokens
// ---------------------------------------------------------------------------

async function seedSearchTokens(tokens: CanonicalSearchToken[]): Promise<void> {
  console.log(`Seeding ${tokens.length} search tokens...`);

  // Batch in chunks of 500 to avoid SQLite limits
  const CHUNK = 500;
  for (let i = 0; i < tokens.length; i += CHUNK) {
    const chunk = tokens.slice(i, i + CHUNK);
    for (const t of chunk) {
      await db
        .insert(searchTokens)
        .values({
          id: t.id,
          entityType: t.entity_type,
          entityId: t.entity_id,
          token: t.token,
          original: t.original,
          locale: t.locale,
          tokenType: t.token_type,
        })
        .onConflictDoUpdate({
          target: searchTokens.id,
          set: {
            token: t.token,
            original: t.original,
          },
        });
    }
  }

  console.log(`✓ Search tokens seeded`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Zen Encyclopedia DB Seeding ===\n");

  // Initialize DB schema (create tables if not exist)
  try {
    // Run seed-sources first to ensure source rows exist
    const { default: seedSources } = await import("./seed-sources");
    if (typeof seedSources === "function") await seedSources();
  } catch {
    // seed-sources might not export a default function — that's OK
  }

  // Load reconciled data
  const canonicalMasters = readJson<CanonicalMaster[]>("canonical.json");
  const transmissions = readJson<CanonicalTransmission[]>("transmissions.json");
  const citationList = readJson<CanonicalCitation[]>("citations.json");
  const tokens = readJson<CanonicalSearchToken[]>("search-tokens.json");

  if (!canonicalMasters) {
    console.error("No canonical.json found. Run scripts/reconcile.ts first.");
    process.exit(1);
  }

  await resetDerivedTables();
  await seedMasters(canonicalMasters);
  const { default: seedSchools } = await import("./seed-schools");
  await seedSchools();
  if (transmissions) await seedTransmissions(transmissions);
  if (citationList) await seedCitations(citationList);
  if (tokens) await seedSearchTokens(tokens);

  // Seed themes (must come before teachings so teachingThemes FKs resolve)
  const { default: seedThemes } = await import("./seed-themes");
  await seedThemes();

  // Seed biographies and teachings (these were wiped during reset)
  const { default: seedBiographies } = await import("./seed-biographies");
  await seedBiographies();
  const { default: seedTeachings } = await import("./seed-teachings");
  await seedTeachings();

  console.log("\n=== Seeding complete ===");
  const masterCount = canonicalMasters.length;
  const txCount = transmissions?.length ?? 0;
  const citCount = citationList?.length ?? 0;
  const tokCount = tokens?.length ?? 0;
  console.log(
    `Masters: ${masterCount}, Transmissions: ${txCount}, Citations: ${citCount}, Search tokens: ${tokCount}`
  );
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
