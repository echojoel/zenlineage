/**
 * Populate schools.practices from src/lib/school-taxonomy.ts.
 *
 * The taxonomy file is the canonical source of practice prose. This script
 * copies the .practice field from every SCHOOL_DEFINITION into the
 * schools.practices column and registers a citation pointing to the
 * editorial schools dataset, so the assertion is auditable like every
 * other field on /practice/<school>.
 *
 * Idempotent — re-running upserts the prose and the citation row.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/seed-school-practices.ts
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { citations, schools, sources } from "@/db/schema";
import { getSchoolDefinitions } from "@/lib/school-taxonomy";
import { deterministicId } from "./reconcile";

const SCHOOL_PRACTICE_SOURCE = {
  id: "src_editorial_school_practices",
  type: "editorial_dataset",
  title: "Zen School Practice Prose (taxonomy-derived)",
  author: "Zen project editorial",
  url: "https://zenlineage.org/practice",
  publicationDate: null as string | null,
  reliability: "editorial",
} as const;

export default async function seedSchoolPractices(): Promise<void> {
  await db
    .insert(sources)
    .values({
      id: SCHOOL_PRACTICE_SOURCE.id,
      type: SCHOOL_PRACTICE_SOURCE.type,
      title: SCHOOL_PRACTICE_SOURCE.title,
      author: SCHOOL_PRACTICE_SOURCE.author,
      url: SCHOOL_PRACTICE_SOURCE.url,
      publicationDate: SCHOOL_PRACTICE_SOURCE.publicationDate,
      reliability: SCHOOL_PRACTICE_SOURCE.reliability,
    })
    .onConflictDoUpdate({
      target: sources.id,
      set: {
        type: SCHOOL_PRACTICE_SOURCE.type,
        title: SCHOOL_PRACTICE_SOURCE.title,
        author: SCHOOL_PRACTICE_SOURCE.author,
        url: SCHOOL_PRACTICE_SOURCE.url,
        reliability: SCHOOL_PRACTICE_SOURCE.reliability,
      },
    });

  let updated = 0;
  let skipped = 0;

  for (const definition of getSchoolDefinitions()) {
    if (!definition.practice) {
      skipped++;
      continue;
    }

    const schoolRows = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, definition.slug));
    const schoolId = schoolRows[0]?.id;
    if (!schoolId) {
      console.warn(
        `[seed-school-practices] school "${definition.slug}" not in DB — skipping`
      );
      skipped++;
      continue;
    }

    await db
      .update(schools)
      .set({ practices: definition.practice })
      .where(eq(schools.id, schoolId));

    const citationId = deterministicId(
      `cite:school-practice:${schoolId}:${SCHOOL_PRACTICE_SOURCE.id}`
    );
    const excerpt = definition.practice.slice(0, 240);

    await db
      .insert(citations)
      .values({
        id: citationId,
        sourceId: SCHOOL_PRACTICE_SOURCE.id,
        entityType: "school",
        entityId: schoolId,
        fieldName: "practices",
        excerpt,
        pageOrSection: `school: ${definition.slug}`,
      })
      .onConflictDoUpdate({
        target: citations.id,
        set: {
          sourceId: SCHOOL_PRACTICE_SOURCE.id,
          entityType: "school",
          entityId: schoolId,
          fieldName: "practices",
          excerpt,
          pageOrSection: `school: ${definition.slug}`,
        },
      });

    updated++;
  }

  console.log(
    `[seed-school-practices] populated practices for ${updated} schools (${skipped} skipped)`
  );
}

if (process.argv[1] && process.argv[1].endsWith("seed-school-practices.ts")) {
  seedSchoolPractices()
    .then(() => {
      console.log("\n=== School practice seeding complete ===");
      process.exit(0);
    })
    .catch((err) => {
      console.error("School practice seeding failed:", err);
      process.exit(1);
    });
}
