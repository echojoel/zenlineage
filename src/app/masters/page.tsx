
import { db } from "@/db";
import { masters, masterNames, schoolNames, searchTokens, mediaAssets, citations } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import MastersClient from "@/components/MastersClient";
import Link from "next/link";
import type { MasterListItem } from "@/lib/master-list";

export default async function MastersPage() {
  // Fetch all masters
  const mastersData = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      birthPrecision: masters.birthPrecision,
      deathYear: masters.deathYear,
      deathPrecision: masters.deathPrecision,
    })
    .from(masters);

  // Fetch primary English names
  const namesData = await db
    .select({
      masterId: masterNames.masterId,
      value: masterNames.value,
      nameType: masterNames.nameType,
    })
    .from(masterNames)
    .where(and(eq(masterNames.locale, "en")));

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

  // Fetch published images (media_assets with citations)
  const masterIds = mastersData.map((m) => m.id);
  const imageRows = await db
    .select({
      entityId: mediaAssets.entityId,
      storagePath: mediaAssets.storagePath,
      id: mediaAssets.id,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.entityType, "master"), inArray(mediaAssets.entityId, masterIds.length > 0 ? masterIds : ["__none__"])));

  const citedImageIds = imageRows.length > 0
    ? new Set(
        (await db
          .select({ entityId: citations.entityId })
          .from(citations)
          .where(
            and(
              eq(citations.entityType, "media_asset"),
              inArray(citations.entityId, imageRows.map((r) => r.id))
            )
          )
        ).map((r) => r.entityId)
      )
    : new Set<string>();

  const imageMap = new Map<string, string>();
  for (const row of imageRows) {
    if (row.storagePath && citedImageIds.has(row.id)) {
      imageMap.set(row.entityId, row.storagePath);
    }
  }

  const items: MasterListItem[] = mastersData.map((m) => ({
    id: m.id,
    slug: m.slug,
    primaryName: labelMap.get(m.id) ?? m.slug,
    schoolId: m.schoolId,
    birthYear: m.birthYear,
    birthPrecision: m.birthPrecision,
    deathYear: m.deathYear,
    deathPrecision: m.deathPrecision,
    searchText: "",
    imagePath: imageMap.get(m.id) ?? null,
  }));

  const tokenRows = await db
    .select({
      entityId: searchTokens.entityId,
      token: searchTokens.token,
    })
    .from(searchTokens)
    .where(eq(searchTokens.entityType, "master"));

  const tokenMap = new Map<string, string[]>();
  for (const row of tokenRows) {
    const tokens = tokenMap.get(row.entityId) ?? [];
    tokens.push(row.token);
    tokenMap.set(row.entityId, tokens);
  }

  for (const item of items) {
    item.searchText = (tokenMap.get(item.id) ?? []).join(" ");
  }

  // Sort by date (birth year, falling back to death year; unknown dates last)
  items.sort((a, b) => {
    const aYear = a.birthYear ?? a.deathYear ?? Infinity;
    const bYear = b.birthYear ?? b.deathYear ?? Infinity;
    return aYear - bYear;
  });

  // Fetch school names
  const schoolNamesData = await db
    .select({
      schoolId: schoolNames.schoolId,
      value: schoolNames.value,
    })
    .from(schoolNames)
    .where(eq(schoolNames.locale, "en"));

  const schoolNameRecord: Record<string, string> = Object.fromEntries(
    schoolNamesData.map((s) => [s.schoolId, s.value])
  );

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Masters</h1>
      </header>
      <MastersClient masters={items} schoolNames={schoolNameRecord} />
    </div>
  );
}
