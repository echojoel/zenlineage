import { db } from "@/db";
import {
  masters,
  masterNames,
  schools,
  schoolNames,
  mediaAssets,
  citations,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import TimelineClient from "@/components/TimelineClient";
import type { ResolvedMaster, ResolvedSchool } from "@/components/TimelineClient";
import { TIMELINE_ERAS, BIBLIOGRAPHY } from "@/lib/timeline-editorial";

export const metadata: Metadata = {
  title: "Timeline — 禅 Zen Encyclopedia",
  description:
    "A chronological journey through 2,500 years of Chan and Zen Buddhist history.",
};

export default async function TimelinePage() {
  // ── Collect all unique slugs from editorial mentions ───────────────
  const masterSlugs = new Set<string>();
  const schoolSlugs = new Set<string>();

  for (const era of TIMELINE_ERAS) {
    for (const event of era.events) {
      for (const m of event.masters) {
        if (m.slug) masterSlugs.add(m.slug);
      }
      for (const s of event.schools) {
        if (s.slug) schoolSlugs.add(s.slug);
      }
    }
  }

  // ── Resolve masters: slug → id → name + image ─────────────────────
  const masterMap: Record<string, ResolvedMaster> = {};

  if (masterSlugs.size > 0) {
    const slugArr = Array.from(masterSlugs);

    const mastersData = await db
      .select({ id: masters.id, slug: masters.slug })
      .from(masters)
      .where(inArray(masters.slug, slugArr));

    const masterIds = mastersData.map((m) => m.id);
    const slugById = new Map(mastersData.map((m) => [m.id, m.slug]));

    if (masterIds.length > 0) {
      // Names: dharma preferred, then any English name
      const namesData = await db
        .select({
          masterId: masterNames.masterId,
          value: masterNames.value,
          nameType: masterNames.nameType,
        })
        .from(masterNames)
        .where(
          and(
            eq(masterNames.locale, "en"),
            inArray(masterNames.masterId, masterIds)
          )
        );

      const labelMap = new Map<string, string>();
      for (const n of namesData) {
        if (n.nameType === "dharma" && !labelMap.has(n.masterId)) {
          labelMap.set(n.masterId, n.value);
        }
      }
      for (const n of namesData) {
        if (!labelMap.has(n.masterId)) {
          labelMap.set(n.masterId, n.value);
        }
      }

      // Images: only published (cited) media assets
      const imageRows = await db
        .select({
          entityId: mediaAssets.entityId,
          storagePath: mediaAssets.storagePath,
          id: mediaAssets.id,
        })
        .from(mediaAssets)
        .where(
          and(
            eq(mediaAssets.entityType, "master"),
            inArray(mediaAssets.entityId, masterIds)
          )
        );

      const citedImageIds =
        imageRows.length > 0
          ? new Set(
              (
                await db
                  .select({ entityId: citations.entityId })
                  .from(citations)
                  .where(
                    and(
                      eq(citations.entityType, "media_asset"),
                      inArray(
                        citations.entityId,
                        imageRows.map((r) => r.id)
                      )
                    )
                  )
              ).map((r) => r.entityId)
            )
          : new Set<string>();

      const imageByMaster = new Map<string, string>();
      for (const row of imageRows) {
        if (row.storagePath && citedImageIds.has(row.id)) {
          imageByMaster.set(row.entityId, row.storagePath);
        }
      }

      // Build masterMap
      for (const m of mastersData) {
        masterMap[m.slug] = {
          slug: m.slug,
          name: labelMap.get(m.id) ?? m.slug,
          imagePath: imageByMaster.get(m.id) ?? null,
        };
      }
    }
  }

  // ── Resolve schools: slug → id → name ─────────────────────────────
  const schoolMap: Record<string, ResolvedSchool> = {};

  if (schoolSlugs.size > 0) {
    const slugArr = Array.from(schoolSlugs);

    const schoolsData = await db
      .select({ id: schools.id, slug: schools.slug })
      .from(schools)
      .where(inArray(schools.slug, slugArr));

    const schoolIds = schoolsData.map((s) => s.id);

    if (schoolIds.length > 0) {
      const namesData = await db
        .select({
          schoolId: schoolNames.schoolId,
          value: schoolNames.value,
        })
        .from(schoolNames)
        .where(
          and(
            eq(schoolNames.locale, "en"),
            inArray(schoolNames.schoolId, schoolIds)
          )
        );

      const nameMap = new Map(namesData.map((n) => [n.schoolId, n.value]));

      for (const s of schoolsData) {
        schoolMap[s.slug] = {
          slug: s.slug,
          name: nameMap.get(s.id) ?? s.slug,
        };
      }
    }
  }

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Timeline</h1>
      </header>
      <TimelineClient
        eras={TIMELINE_ERAS}
        masterMap={masterMap}
        schoolMap={schoolMap}
        bibliography={BIBLIOGRAPHY}
      />
    </main>
  );
}
