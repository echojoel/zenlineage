/**
 * Database Seeding Script
 *
 * Reads the reconciled canonical data from scripts/data/reconciled/ and
 * upserts it into all database tables. Idempotent — safe to re-run.
 *
 * Usage:  npx tsx scripts/seed-db.ts
 */

import fs from "fs";
import path from "path";
import { db } from "@/db";
import {
  schoolNames,
  schools,
  masters,
  masterNames,
  masterTransmissions,
  searchTokens,
  citations,
  teachingContent,
  teachingRelations,
  teachings,
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
  await db.delete(citations);
  // Content tables with master FKs must be cleared before rebuilding masters.
  await db.delete(teachingRelations);
  await db.delete(teachingContent);
  await db.delete(teachings);
  // NOTE: masterBiographies is intentionally NOT cleared here.
  // seed-biographies.ts is a durable additive script; biographies survive re-seeds.
  await db.delete(masterTransmissions);
  await db.delete(masterNames);
  await db.delete(masters);
  await db.delete(schoolNames);
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
