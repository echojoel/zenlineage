import { NextResponse } from "next/server";
import { db } from "@/db";
import { masters, masterNames, searchTokens } from "@/db/schema";
import type { MasterListItem } from "@/lib/master-list";
import { eq, and } from "drizzle-orm";

export async function GET(): Promise<NextResponse<MasterListItem[]>> {
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

  // Fetch primary English dharma names
  const namesData = await db
    .select({
      masterId: masterNames.masterId,
      value: masterNames.value,
      nameType: masterNames.nameType,
    })
    .from(masterNames)
    .where(and(eq(masterNames.locale, "en")));

  // Build label map: dharma > fallback
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

  const items: MasterListItem[] = mastersData.map((m) => ({
    id: m.id,
    slug: m.slug,
    primaryName: labelMap.get(m.id) ?? m.slug,
    schoolId: m.schoolId,
    birthYear: m.birthYear,
    birthPrecision: m.birthPrecision,
    deathYear: m.deathYear,
    deathPrecision: m.deathPrecision,
    searchText: (tokenMap.get(m.id) ?? []).join(" "),
    imagePath: null,
  }));

  return NextResponse.json(items);
}
