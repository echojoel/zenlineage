import type { MetadataRoute } from "next";
import { db } from "@/db";
import { masters, schools } from "@/db/schema";

export const dynamic = "force-static";

const BASE_URL = "https://zenlineage.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allMasters, allSchools] = await Promise.all([
    db.select({ slug: masters.slug }).from(masters),
    db.select({ slug: schools.slug }).from(schools),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/masters`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/schools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/lineage`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/proverbs`, changeFrequency: "weekly", priority: 0.8 },
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

  return [...staticPages, ...masterPages, ...schoolPages];
}
