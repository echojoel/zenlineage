/**
 * School Seeding Script
 *
 * Reads canonical.json, extracts unique school names, upserts schools +
 * school_names rows, then sets masters.school_id to match.
 * Idempotent — safe to re-run.
 *
 * Usage:  npx tsx scripts/seed-schools.ts
 */

import fs from 'fs';
import path from 'path';
import { db } from '@/db';
import { schools, schoolNames, masters } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { CanonicalMaster } from './reconcile';
import {
  determineSchoolDefinition,
  getSchoolAncestors,
  getSchoolDefinition,
} from '@/lib/school-taxonomy';

const RECONCILED_DIR = path.join(process.cwd(), 'scripts/data/reconciled');

export default async function seedSchools(): Promise<void> {
  const filepath = path.join(RECONCILED_DIR, 'canonical.json');
  if (!fs.existsSync(filepath)) {
    console.warn('⚠️  canonical.json not found — skipping school seeding');
    return;
  }

  const canonicalMasters: CanonicalMaster[] = JSON.parse(
    fs.readFileSync(filepath, 'utf-8'),
  );

  const requiredSlugs = new Set<string>();
  for (const m of canonicalMasters) {
    const definition = determineSchoolDefinition({
      rawLabel: m.school,
      names: m.names.map((name) => name.value),
    });
    if (!definition) continue;

    for (const ancestor of getSchoolAncestors(definition.slug)) {
      requiredSlugs.add(ancestor.slug);
    }
  }

  const orderedSchools = Array.from(requiredSlugs)
    .map((slug) => getSchoolDefinition(slug))
    .filter((definition): definition is NonNullable<typeof definition> => definition != null)
    .sort((a, b) => getSchoolAncestors(a.slug).length - getSchoolAncestors(b.slug).length);

  const schoolIds = new Map<string, string>(); // slug -> school id

  console.log(`Seeding ${orderedSchools.length} canonical schools...`);

  for (const definition of orderedSchools) {
    const existing = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, definition.slug));

    const schoolId = existing[0]?.id ?? definition.slug;
    const parentId = definition.parentSlug ? schoolIds.get(definition.parentSlug) ?? null : null;

    if (existing.length === 0) {
      await db
        .insert(schools)
        .values({
          id: schoolId,
          slug: definition.slug,
          tradition: definition.tradition,
          parentId,
          active: true,
        })
        .onConflictDoNothing();
    } else {
      await db
        .update(schools)
        .set({
          tradition: definition.tradition,
          parentId,
          active: true,
        })
        .where(eq(schools.id, schoolId));
    }

    await db
      .insert(schoolNames)
      .values({
        id: `${schoolId}_en`,
        schoolId,
        locale: 'en',
        value: definition.name,
      })
      .onConflictDoUpdate({
        target: schoolNames.id,
        set: { value: definition.name },
      });

    schoolIds.set(definition.slug, schoolId);
  }

  console.log('✓ Canonical schools upserted');

  console.log('Linking masters to schools...');
  let linked = 0;

  for (const m of canonicalMasters) {
    const definition = determineSchoolDefinition({
      rawLabel: m.school,
      names: m.names.map((name) => name.value),
    });
    if (!definition) {
      continue;
    }
    const schoolId = schoolIds.get(definition.slug);
    if (!schoolId) continue;

    await db
      .update(masters)
      .set({ schoolId })
      .where(eq(masters.id, m.id));

    linked++;
  }

  console.log(`✓ Linked ${linked} masters to schools`);
}

// Run directly if invoked as a script
if (process.argv[1] && process.argv[1].endsWith('seed-schools.ts')) {
  seedSchools()
    .then(() => {
      console.log('\n=== School seeding complete ===');
      process.exit(0);
    })
    .catch((err) => {
      console.error('School seeding failed:', err);
      process.exit(1);
    });
}
