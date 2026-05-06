import type { MetadataRoute } from "next";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masters,
  schools,
  teachings,
  temples,
  themes,
} from "@/db/schema";
import { SCHOOL_PRACTICE_TEACHINGS } from "@/lib/practice-instructions";
import { countryToSlug } from "@/lib/seo/country-slug";

export const dynamic = "force-static";

const BASE_URL = "https://zenlineage.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Single timestamp for the whole sitemap — the seed-data-is-truth
  // pipeline rebuilds the DB on every deploy, so per-row mtimes don't
  // correspond to real content edits. Build time is the most honest
  // signal we can give crawlers.
  const lastModified = new Date();

  const [allMasters, allSchools, allTeachings] = await Promise.all([
    db.select({ slug: masters.slug }).from(masters),
    db.select({ id: schools.id, slug: schools.slug }).from(schools),
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
    { url: BASE_URL, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/masters`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/schools`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/lineage`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/proverbs`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/practice`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/glossary`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/timeline`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];

  const masterPages: MetadataRoute.Sitemap = allMasters.map((m) => ({
    url: `${BASE_URL}/masters/${m.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const schoolPages: MetadataRoute.Sitemap = allSchools.map((s: { id: string; slug: string }) => ({
    url: `${BASE_URL}/schools/${s.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Per-school practice pages exist only when a school has either at
  // least one geocoded temple or at least one curated practice
  // instruction. The same gate is applied by generateStaticParams in
  // /practice/[schoolSlug]/page.tsx.
  const geocodedTempleSchools = await db
    .select({ schoolId: temples.schoolId })
    .from(temples)
    .where(and(isNotNull(temples.lat), isNotNull(temples.lng)));
  const schoolIdsWithTemples = new Set(
    geocodedTempleSchools
      .map((t) => t.schoolId)
      .filter((id): id is string => Boolean(id))
  );
  const practiceSchoolPages: MetadataRoute.Sitemap = allSchools
    .filter(
      (s) =>
        schoolIdsWithTemples.has(s.id) ||
        (SCHOOL_PRACTICE_TEACHINGS[s.slug] ?? []).length > 0
    )
    .map((s) => ({
      url: `${BASE_URL}/practice/${s.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const teachingPages: MetadataRoute.Sitemap = allTeachings
    .filter((t) => citedTeachingIds.has(t.id))
    .map((t) => ({
      url: `${BASE_URL}/teachings/${t.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  // Per-master lineage SSR landings (/lineage/[slug]). One per master.
  const lineagePages: MetadataRoute.Sitemap = allMasters.map((m) => ({
    url: `${BASE_URL}/lineage/${m.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  // Per-country temple landings.
  const countryRows = await db
    .selectDistinct({ country: temples.country })
    .from(temples)
    .where(and(isNotNull(temples.country), isNotNull(temples.lat)));
  const countryPages: MetadataRoute.Sitemap = countryRows
    .map((r) => r.country)
    .filter((c): c is string => Boolean(c) && (c as string).trim().length > 0)
    .map((c) => ({
      url: `${BASE_URL}/practice/by-country/${countryToSlug(c)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    }));

  // Per-theme proverb landings.
  const allThemes = await db
    .select({ slug: themes.slug })
    .from(themes);
  const themePages: MetadataRoute.Sitemap = allThemes.map((t) => ({
    url: `${BASE_URL}/proverbs/themes/${t.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...masterPages,
    ...schoolPages,
    ...practiceSchoolPages,
    ...countryPages,
    ...lineagePages,
    ...teachingPages,
    ...themePages,
  ];
}
