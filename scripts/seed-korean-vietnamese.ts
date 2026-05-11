/**
 * Seed Korean Seon and Vietnamese Thiền masters into the database.
 *
 * Reads structured data from scripts/data/korean-vietnamese-masters.ts and
 * upserts masters, master_names, master_biographies, master_transmissions,
 * sources, and citations. Idempotent — safe to re-run.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/seed-korean-vietnamese.ts
 *   # or
 *   npm run seed:kv
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
import { KV_MASTERS, KV_SOURCES, type KVMaster } from "./data/korean-vietnamese-masters";

async function upsertSources(): Promise<void> {
  for (const s of KV_SOURCES) {
    const existing = await db.select({ id: sources.id }).from(sources).where(eq(sources.id, s.id));
    if (existing.length === 0) {
      await db.insert(sources).values({
        id: s.id,
        type: s.type,
        title: s.title,
        author: s.author,
        url: s.url ?? null,
        publicationDate: s.publicationDate,
        reliability: s.reliability,
      });
    } else {
      await db
        .update(sources)
        .set({
          type: s.type,
          title: s.title,
          author: s.author,
          url: s.url ?? null,
          publicationDate: s.publicationDate,
          reliability: s.reliability,
        })
        .where(eq(sources.id, s.id));
    }
  }
  console.log(`✓ ${KV_SOURCES.length} scholarly sources upserted`);
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
  if (!schoolId) {
    throw new Error(
      `school "${master.schoolSlug}" not found — run seed-schools.ts first`
    );
  }

  const existing = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, master.slug));

  const id = existing[0]?.id ?? master.slug; // deterministic slug-id for the new cohort

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

  if (existing.length === 0) {
    await db.insert(masters).values({ id, ...values });
  } else {
    await db.update(masters).set(values).where(eq(masters.id, id));
  }
  return id;
}

async function replaceMasterNames(masterId: string, master: KVMaster): Promise<void> {
  // Clear the locales we're about to rewrite so the data is a clean snapshot.
  // We only touch locales we know about to avoid wiping future contributions.
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

async function upsertBiography(masterId: string, biography: string): Promise<void> {
  const existing = await db
    .select({ id: masterBiographies.id })
    .from(masterBiographies)
    .where(
      and(eq(masterBiographies.masterId, masterId), eq(masterBiographies.locale, "en"))
    );
  if (existing.length === 0) {
    await db.insert(masterBiographies).values({
      id: `${masterId}__bio_en`,
      masterId,
      locale: "en",
      content: biography,
    });
  } else {
    await db
      .update(masterBiographies)
      .set({ content: biography })
      .where(eq(masterBiographies.id, existing[0].id));
  }
}

async function upsertCitations(masterId: string, master: KVMaster): Promise<void> {
  // Replace the existing citation rows for this master so the citation graph
  // reflects the current data file snapshot (idempotent, auditable). Include
  // an index in the ID so multiple citations sharing the same source
  // (e.g. three field claims all citing Buswell) don't collide on the PK.
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

  // Also cite the biography record. Dedupe by source so we don't create
  // duplicate rows just because the master-level citations mention a source
  // multiple times for different fields.
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

    // Inline-footnote citations. When the data file provides an
    // explicit `footnotes` array, use it verbatim. Otherwise, derive
    // footnote rows from `citations[]` in array order so the `[N]`
    // markers embedded in the biography text resolve to clickable
    // links — one row per citation entry, with index = arrayIndex+1.
    const derivedFootnotes =
      master.footnotes && master.footnotes.length > 0
        ? master.footnotes
        : master.citations.map((c, i) => ({
            index: i + 1,
            sourceId: c.sourceId,
            pageOrSection: c.pageOrSection,
            excerpt: c.excerpt,
          }));
    for (const note of derivedFootnotes) {
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

async function upsertTransmissions(
  studentId: string,
  master: KVMaster
): Promise<void> {
  if (master.transmissions.length === 0) return;

  for (const t of master.transmissions) {
    const teacherRows = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, t.teacherSlug));
    const teacherId = teacherRows[0]?.id;
    if (!teacherId) {
      console.warn(
        `  ⚠ transmission skipped for ${master.slug}: teacher "${t.teacherSlug}" not in DB yet`
      );
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

    if (existing.length === 0) {
      await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    } else {
      await db.update(masterTransmissions).set(values).where(eq(masterTransmissions.id, edgeId));
    }

    // Attach per-edge citations so the accuracy audit registers the
    // transmission as sourced (not just the biographical fields).
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

function hashShort(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

async function main() {
  console.log("Seeding Korean Seon + Vietnamese Thiền masters...\n");

  await upsertSources();

  let inserted = 0;
  for (const m of KV_MASTERS) {
    const id = await upsertMaster(m);
    await replaceMasterNames(id, m);
    await upsertBiography(id, m.biography);
    await upsertCitations(id, m);
    inserted++;
  }

  // Transmissions pass after all masters exist so slug lookups succeed.
  for (const m of KV_MASTERS) {
    const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, m.slug));
    if (rows[0]) await upsertTransmissions(rows[0].id, m);
  }

  // Search tokens pass — required for /search to surface KV masters
  // (the core canonical pipeline only generates tokens for masters in
  // canonical.json; directly-seeded entries here bypass that and need
  // their tokens written explicitly).
  for (const m of KV_MASTERS) {
    const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, m.slug));
    const masterId = rows[0]?.id;
    if (!masterId) continue;
    await db
      .delete(searchTokens)
      .where(
        and(eq(searchTokens.entityType, "master"), eq(searchTokens.entityId, masterId))
      );
    const seenTokens = new Set<string>();
    for (const name of m.names) {
      const raw = generateSearchTokens({
        value: name.value,
        locale: name.locale,
        nameType: name.nameType,
      });
      for (const tok of raw) {
        const key = `${tok.token}|${tok.tokenType}`;
        if (seenTokens.has(key)) continue;
        seenTokens.add(key);
        await db.insert(searchTokens).values({
          id: `tok_${masterId}__${hashShort(key)}`,
          entityType: "master",
          entityId: masterId,
          token: tok.token,
          original: tok.original,
          locale: tok.locale,
          tokenType: tok.tokenType,
        });
      }
    }
  }

  console.log(`✓ ${inserted} masters upserted`);
  console.log("\n=== Korean/Vietnamese master seeding complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
