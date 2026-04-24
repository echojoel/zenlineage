import type { MetadataRoute } from "next";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { citations, masters, schools, teachings } from "@/db/schema";

export const dynamic = "force-static";

const BASE_URL = "https://zenlineage.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allMasters, allSchools, allTeachings] = await Promise.all([
    db.select({ slug: masters.slug }).from(masters),
    db.select({ slug: schools.slug }).from(schools),
    db.select({ id: teachings.id, slug: teachings.slug }).from(teachings),
  ]);

  // Only teachings with entity-level citations are published, so only those
  // belong in the sitemap. This matches the /teachings/[slug] gate.
  const teachingIds = allTeachings.map((t) => t.id);
  const citedTeachingIds =
    teachingIds.length > 0
      ? new Set(
          (
            await db
              .select({ entityId: citations.entityId })
              .from(citations)
              .where(
                and(
                  eq(citations.entityType, "teaching"),
                  inArray(citations.entityId, teachingIds)
                )
              )
          ).map((r) => r.entityId)
        )
      : new Set<string>();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/masters`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/schools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/lineage`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/proverbs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/practice`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/timeline`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const masterPages: MetadataRoute.Sitemap = allMasters.map((m) => ({
    url: `${BASE_URL}/masters/${m.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const schoolPages: MetadataRoute.Sitemap = allSchools.map((s) => ({
    url: `${BASE_URL}/schools/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const teachingPages: MetadataRoute.Sitemap = allTeachings
    .filter((t) => citedTeachingIds.has(t.id))
    .map((t) => ({
      url: `${BASE_URL}/teachings/${t.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticPages, ...masterPages, ...schoolPages, ...teachingPages];
}
