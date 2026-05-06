/**
 * Server-only counterpart to linkify-mentions. Hits the masters table
 * to build the master-name → /masters/{slug} portion of the link
 * registry. Kept in its own module so client components (SutraReader)
 * can import the pure helpers from `linkify-mentions.ts` without
 * pulling in the database client.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masterNames, masters } from "@/db/schema";
import type { LinkTerm } from "./linkify-mentions";

/** Generic English words that overlap with master names and would
 *  produce noisy false positives ("Mind", "Way"). We rather miss a
 *  link than ruin prose with one. */
const STOPWORD_NAMES = new Set([
  "Mind",
  "Way",
  "Path",
  "Bell",
  "Sun",
  "Moon",
  "Light",
  "Lin",
  "Chan",
  "Zen",
  "Sŏn",
  "Seon",
  "Thiền",
  "Hui",
  "Kwan",
  "Won",
]);

export async function loadMasterLinkTerms(opts?: {
  excludeMasterId?: string;
}): Promise<LinkTerm[]> {
  const exclude = opts?.excludeMasterId ?? null;

  const rows = await db
    .select({
      masterId: masterNames.masterId,
      slug: masters.slug,
      nameType: masterNames.nameType,
      value: masterNames.value,
    })
    .from(masterNames)
    .innerJoin(masters, eq(masters.id, masterNames.masterId))
    .where(eq(masterNames.locale, "en"));

  const bestBySlug = new Map<string, { value: string; rank: number }>();
  for (const row of rows) {
    if (exclude && row.masterId === exclude) continue;
    if (row.value.length <= 4) continue;
    if (STOPWORD_NAMES.has(row.value)) continue;
    const rank =
      row.nameType === "dharma"
        ? 0
        : row.nameType === "alias"
          ? 1
          : row.nameType === "honorific"
            ? 2
            : 3;
    const existing = bestBySlug.get(row.slug);
    if (!existing || rank < existing.rank) {
      bestBySlug.set(row.slug, { value: row.value, rank });
    }
  }

  return Array.from(bestBySlug.entries()).map(([slug, { value }]) => ({
    match: value,
    href: `/masters/${slug}`,
  }));
}
