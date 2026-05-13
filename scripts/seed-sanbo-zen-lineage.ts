/**
 * Seed the Sanbō Zen continuation — patriarchate beyond Yamada Kōun
 * (Kubota Ji'un, Yamada Ryōun, Migaku Sato), European Christian-Zen
 * heirs (Hugo Enomiya-Lassalle, Willigis Jäger), and the contemporary
 * American teaching faculty around Mountain Cloud Zen Center (Joan
 * Rieck, Valerie Forstman, Henry Shukman).
 *
 * Reuses the KVMaster schema and the same upsert logic as
 * scripts/seed-maezumi-lineage.ts. Idempotent.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/seed-sanbo-zen-lineage.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  citations,
  masterBiographies,
  masterNames,
  masterTransmissions,
  masters,
  schools,
  searchTokens,
  sources,
} from "@/db/schema";
import { generateSearchTokens } from "@/lib/search-tokens";
import type { KVMaster } from "./data/korean-vietnamese-masters";
import {
  SANBO_ZEN_MASTERS,
  SANBO_ZEN_SOURCES,
} from "./data/sanbo-zen-lineage";

function hashShort(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

async function upsertSources() {
  for (const s of SANBO_ZEN_SOURCES) {
    const existing = await db.select({ id: sources.id }).from(sources).where(eq(sources.id, s.id));
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
}

async function resolveSchoolId(schoolSlug: string): Promise<string | null> {
  const rows = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, schoolSlug));
  return rows[0]?.id ?? null;
}

async function upsertMaster(master: KVMaster): Promise<string> {
  const schoolId = await resolveSchoolId(master.schoolSlug);
  if (!schoolId) throw new Error(`school "${master.schoolSlug}" not found`);
  const existing = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, master.slug));
  const id = existing[0]?.id ?? master.slug;
  const values = {
    slug: master.slug,
    birthYear: master.birthYear,
    birthPrecision: master.birthPrecision,
    birthConfidence: master.birthConfidence,
    deathYear: master.deathYear,
    deathPrecision: master.deathPrecision,
    deathConfidence: master.deathConfidence,
    schoolId,
    generation: master.generation ?? null,
  };
  if (existing.length === 0) await db.insert(masters).values({ id, ...values });
  else await db.update(masters).set(values).where(eq(masters.id, id));
  return id;
}

async function replaceMasterNames(masterId: string, master: KVMaster) {
  const locales = Array.from(new Set(master.names.map((n) => n.locale)));
  for (const locale of locales) {
    await db
      .delete(masterNames)
      .where(and(eq(masterNames.masterId, masterId), eq(masterNames.locale, locale)));
  }
  for (const n of master.names) {
    await db.insert(masterNames).values({
      id: `${masterId}__${n.locale}__${n.nameType}__${hashShort(n.value)}`,
      masterId,
      locale: n.locale,
      nameType: n.nameType,
      value: n.value,
    });
  }
}

async function upsertBiography(masterId: string, content: string) {
  const existing = await db
    .select({ id: masterBiographies.id })
    .from(masterBiographies)
    .where(and(eq(masterBiographies.masterId, masterId), eq(masterBiographies.locale, "en")));
  if (existing.length === 0) {
    await db.insert(masterBiographies).values({
      id: `${masterId}__bio_en`,
      masterId,
      locale: "en",
      content,
    });
  } else {
    await db
      .update(masterBiographies)
      .set({ content })
      .where(eq(masterBiographies.id, existing[0].id));
  }
}

async function upsertCitations(masterId: string, master: KVMaster) {
  await db
    .delete(citations)
    .where(and(eq(citations.entityType, "master"), eq(citations.entityId, masterId)));
  for (let i = 0; i < master.citations.length; i++) {
    const c = master.citations[i];
    await db.insert(citations).values({
      id: `cite_${masterId}__${i}__${c.sourceId}__${c.fieldName ?? "record"}`,
      sourceId: c.sourceId,
      entityType: "master",
      entityId: masterId,
      fieldName: c.fieldName ?? null,
      excerpt: c.excerpt ?? null,
      pageOrSection: c.pageOrSection ?? null,
    });
  }
  const bioRows = await db
    .select({ id: masterBiographies.id })
    .from(masterBiographies)
    .where(and(eq(masterBiographies.masterId, masterId), eq(masterBiographies.locale, "en")));
  const bioId = bioRows[0]?.id;
  if (bioId) {
    await db
      .delete(citations)
      .where(and(eq(citations.entityType, "master_biography"), eq(citations.entityId, bioId)));
    const uniqueSourceIds = Array.from(new Set(master.citations.map((c) => c.sourceId)));
    for (const sourceId of uniqueSourceIds) {
      const primary = master.citations.find((c) => c.sourceId === sourceId)!;
      await db.insert(citations).values({
        id: `cite_${bioId}__${sourceId}`,
        sourceId,
        entityType: "master_biography",
        entityId: bioId,
        fieldName: "content",
        pageOrSection: primary.pageOrSection ?? null,
      });
    }
    if (master.footnotes && master.footnotes.length > 0) {
      for (const note of master.footnotes) {
        await db.insert(citations).values({
          id: `cite_${bioId}__footnote_${note.index}`,
          sourceId: note.sourceId,
          entityType: "master_biography",
          entityId: bioId,
          fieldName: `footnote:${note.index}`,
          excerpt: note.excerpt ?? null,
          pageOrSection: note.pageOrSection ?? null,
        });
      }
    }
  }
}

async function upsertTransmissionsForMaster(studentId: string, master: KVMaster) {
  if (master.transmissions.length === 0) return;
  for (const t of master.transmissions) {
    const teacherRows = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, t.teacherSlug));
    const teacherId = teacherRows[0]?.id;
    if (!teacherId) {
      console.warn(`  ⚠ transmission skipped: teacher "${t.teacherSlug}" not in DB`);
      continue;
    }
    const existing = await db
      .select({ id: masterTransmissions.id })
      .from(masterTransmissions)
      .where(
        and(
          eq(masterTransmissions.studentId, studentId),
          eq(masterTransmissions.teacherId, teacherId)
        )
      );
    const edgeId = existing[0]?.id ?? nanoid();
    const values = {
      studentId,
      teacherId,
      type: t.type,
      isPrimary: t.isPrimary ?? false,
      notes: t.notes ?? null,
    };
    if (existing.length === 0)
      await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    else
      await db.update(masterTransmissions).set(values).where(eq(masterTransmissions.id, edgeId));

    await db
      .delete(citations)
      .where(
        and(
          eq(citations.entityType, "master_transmission"),
          eq(citations.entityId, edgeId)
        )
      );
    for (let i = 0; i < t.sourceIds.length; i++) {
      await db.insert(citations).values({
        id: `cite_mt_${edgeId}__${i}__${t.sourceIds[i]}`,
        sourceId: t.sourceIds[i],
        entityType: "master_transmission",
        entityId: edgeId,
        fieldName: "transmission",
        pageOrSection: null,
        excerpt: t.notes ?? null,
      });
    }
  }
}

async function main() {
  console.log("Seeding Sanbō Zen continuation (8 masters + lineage edges)...\n");

  await upsertSources();

  // Pass 1 — masters, names, biographies, citations.
  for (const m of SANBO_ZEN_MASTERS) {
    const id = await upsertMaster(m);
    await replaceMasterNames(id, m);
    await upsertBiography(id, m.biography);
    await upsertCitations(id, m);
  }

  // Pass 2 — transmissions. Done in a second pass so that intra-Sanbō
  // edges (e.g. yamada-ryoun → henry-shukman) can resolve teacher slugs
  // that were themselves only inserted in pass 1.
  for (const m of SANBO_ZEN_MASTERS) {
    const [row] = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, m.slug));
    if (row) await upsertTransmissionsForMaster(row.id, m);
  }

  // Search tokens — same shape as the Maezumi/KV seeders.
  for (const m of SANBO_ZEN_MASTERS) {
    const [row] = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, m.slug));
    if (!row) continue;
    await db
      .delete(searchTokens)
      .where(and(eq(searchTokens.entityType, "master"), eq(searchTokens.entityId, row.id)));
    const seen = new Set<string>();
    for (const name of m.names) {
      const raw = generateSearchTokens({
        value: name.value,
        locale: name.locale,
        nameType: name.nameType,
      });
      for (const tok of raw) {
        const key = `${tok.token}|${tok.tokenType}`;
        if (seen.has(key)) continue;
        seen.add(key);
        await db.insert(searchTokens).values({
          id: `tok_${row.id}__${hashShort(key)}`,
          entityType: "master",
          entityId: row.id,
          token: tok.token,
          original: tok.original,
          locale: tok.locale,
          tokenType: tok.tokenType,
        });
      }
    }
  }

  console.log(`✓ ${SANBO_ZEN_MASTERS.length} Sanbō Zen masters upserted`);
  console.log("\n=== Sanbō Zen lineage seeding complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
