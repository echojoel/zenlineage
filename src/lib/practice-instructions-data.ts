/**
 * Server-side loader for per-school practice instructions.
 *
 * Used both at build time by `scripts/generate-static-data.ts` to bake
 * `public/data/practice-instructions.json` for client-side consumption,
 * and (historically) by the per-school practice page. After the
 * /practice rework the runtime path is gone — the JSON is the source of
 * truth for the in-page filter UI.
 */

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  sources,
  teachingContent,
  teachings,
} from "@/db/schema";
import { isTier1Master } from "@/lib/editorial-tiers";
import { getPracticeTeachingSlugs } from "@/lib/practice-instructions";

export interface PracticeInstructionView {
  slug: string;
  title: string;
  content: string;
  collection: string | null;
  type: string | null;
  attributionStatus: string | null;
  authorSlug: string | null;
  authorName: string | null;
  translator: string | null;
  edition: string | null;
  licenseStatus: string | null;
  sources: { id: string; title: string | null; url: string | null }[];
}

export async function loadPracticeInstructions(
  schoolSlug: string
): Promise<PracticeInstructionView[]> {
  const slugs = getPracticeTeachingSlugs(schoolSlug);
  if (slugs.length === 0) return [];

  const rows = await db
    .select({
      teachingId: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      collection: teachings.collection,
      authorId: teachings.authorId,
      attributionStatus: teachings.attributionStatus,
      title: teachingContent.title,
      content: teachingContent.content,
      translator: teachingContent.translator,
      edition: teachingContent.edition,
      licenseStatus: teachingContent.licenseStatus,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(inArray(teachings.slug, slugs));

  const teachingIds = rows.map((r) => r.teachingId);

  const citedRows =
    teachingIds.length > 0
      ? await db
          .select({ entityId: citations.entityId, sourceId: citations.sourceId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "teaching"),
              inArray(citations.entityId, teachingIds)
            )
          )
      : [];

  const citationsByTeaching = new Map<string, Set<string>>();
  for (const c of citedRows) {
    const existing = citationsByTeaching.get(c.entityId) ?? new Set<string>();
    existing.add(c.sourceId);
    citationsByTeaching.set(c.entityId, existing);
  }

  const sourceIds = Array.from(new Set(citedRows.map((c) => c.sourceId)));
  const sourceRows =
    sourceIds.length > 0
      ? await db
          .select({ id: sources.id, title: sources.title, url: sources.url })
          .from(sources)
          .where(inArray(sources.id, sourceIds))
      : [];
  const sourceById = new Map(sourceRows.map((s) => [s.id, s]));

  const authorIds = Array.from(
    new Set(rows.map((r) => r.authorId).filter((id): id is string => Boolean(id)))
  );
  const authorRows =
    authorIds.length > 0
      ? await db
          .select({ id: masters.id, slug: masters.slug })
          .from(masters)
          .where(inArray(masters.id, authorIds))
      : [];
  const authorSlugById = new Map(authorRows.map((m) => [m.id, m.slug]));

  const authorNameRows =
    authorIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            nameType: masterNames.nameType,
            value: masterNames.value,
          })
          .from(masterNames)
          .where(
            and(inArray(masterNames.masterId, authorIds), eq(masterNames.locale, "en"))
          )
      : [];
  const authorNameById = new Map<string, string>();
  for (const n of authorNameRows) {
    if (n.nameType === "dharma" && !authorNameById.has(n.masterId)) {
      authorNameById.set(n.masterId, n.value);
    }
  }
  for (const n of authorNameRows) {
    if (!authorNameById.has(n.masterId)) {
      authorNameById.set(n.masterId, n.value);
    }
  }

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const ordered: PracticeInstructionView[] = [];

  for (const slug of slugs) {
    const r = bySlug.get(slug);
    if (!r || !r.title) continue;
    if (!citationsByTeaching.has(r.teachingId)) continue;

    const authorSlug = r.authorId ? authorSlugById.get(r.authorId) ?? null : null;
    if (authorSlug && !isTier1Master(authorSlug)) continue;

    const teachingSourceIds = Array.from(citationsByTeaching.get(r.teachingId) ?? []);
    const teachingSources = teachingSourceIds
      .map((id) => sourceById.get(id))
      .filter((s): s is { id: string; title: string | null; url: string | null } =>
        Boolean(s)
      );

    ordered.push({
      slug: r.slug,
      title: r.title,
      content: r.content ?? "",
      collection: r.collection,
      type: r.type,
      attributionStatus: r.attributionStatus,
      authorSlug,
      authorName: r.authorId ? authorNameById.get(r.authorId) ?? null : null,
      translator: r.translator,
      edition: r.edition,
      licenseStatus: r.licenseStatus,
      sources: teachingSources,
    });
  }

  return ordered;
}
