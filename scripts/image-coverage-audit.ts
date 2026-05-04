/**
 * Generate scripts/image-coverage-audit.csv — a per-master report on image
 * coverage. One row per master. The CSV captures whether each master is
 * served by a real portrait, by an enso/name-card placeholder, or has no
 * media_asset at all, and links the row back to the citation source so
 * gaps are auditable.
 *
 * Columns:
 *   slug            — master slug (primary key for cross-referencing)
 *   name            — English dharma name (best-effort)
 *   school          — school slug (or empty)
 *   birth_year, death_year — life range, when known
 *   era             — ancient / classical / medieval / early-modern / modern
 *   coverage        — portrait | placeholder | none
 *   storage_path    — file referenced by media_assets.storage_path
 *   source          — wikipedia | commons | external | generated | (none)
 *   license         — license string from media_assets
 *   citation_source — citations.source_id used to publish the asset
 *   notes           — short free-text describing why a placeholder was used
 *                     or any other relevant provenance hint
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/image-coverage-audit.ts
 */

import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  mediaAssets,
  schools,
} from "@/db/schema";

const OUT_PATH = path.join(process.cwd(), "scripts", "image-coverage-audit.csv");

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function eraFor(birth: number | null, death: number | null): string {
  const year = death ?? birth;
  if (year == null) return "unknown";
  if (year < 500) return "ancient";
  if (year < 1000) return "classical";
  if (year < 1600) return "medieval";
  if (year < 1900) return "early-modern";
  return "modern";
}

function classifySource(asset: {
  type: string;
  attribution: string | null;
  license: string | null;
  sourceUrl: string | null;
}): { source: string; notes: string } {
  if (asset.type === "placeholder") {
    return {
      source: "generated",
      notes: "name-card placeholder (no public-domain portrait available)",
    };
  }
  const attribution = asset.attribution ?? "";
  if (/wikipedia/i.test(attribution)) {
    return { source: "wikipedia", notes: "" };
  }
  if (asset.sourceUrl && /commons\.wikimedia\.org/i.test(asset.sourceUrl)) {
    return { source: "commons", notes: "manually-verified Commons file" };
  }
  if (asset.sourceUrl && /^https?:/i.test(asset.sourceUrl)) {
    return { source: "external", notes: attribution || "external portrait" };
  }
  if (asset.license === "cc-by-sa-or-fair-use") {
    return { source: "wikipedia", notes: "" };
  }
  return { source: "curated", notes: attribution };
}

async function main() {
  const allMasters = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters);

  const allNames = await db
    .select({
      masterId: masterNames.masterId,
      locale: masterNames.locale,
      nameType: masterNames.nameType,
      value: masterNames.value,
    })
    .from(masterNames);

  const namesByMaster = new Map<string, typeof allNames>();
  for (const row of allNames) {
    const list = namesByMaster.get(row.masterId) ?? [];
    list.push(row);
    namesByMaster.set(row.masterId, list);
  }

  const schoolRows = await db.select({ id: schools.id, slug: schools.slug }).from(schools);
  const schoolSlugById = new Map(schoolRows.map((s) => [s.id, s.slug]));

  const allAssets = await db
    .select({
      id: mediaAssets.id,
      entityId: mediaAssets.entityId,
      entityType: mediaAssets.entityType,
      type: mediaAssets.type,
      storagePath: mediaAssets.storagePath,
      sourceUrl: mediaAssets.sourceUrl,
      attribution: mediaAssets.attribution,
      license: mediaAssets.license,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.entityType, "master"));

  const assetByMaster = new Map<string, (typeof allAssets)[number]>();
  for (const asset of allAssets) {
    assetByMaster.set(asset.entityId, asset);
  }

  const allCitations = await db
    .select({
      entityType: citations.entityType,
      entityId: citations.entityId,
      sourceId: citations.sourceId,
    })
    .from(citations);

  const citationSourceByAsset = new Map<string, string>();
  for (const cite of allCitations) {
    if (cite.entityType !== "media_asset") continue;
    if (!citationSourceByAsset.has(cite.entityId)) {
      citationSourceByAsset.set(cite.entityId, cite.sourceId);
    }
  }

  const sortedMasters = [...allMasters].sort((a, b) => a.slug.localeCompare(b.slug));

  const header = [
    "slug",
    "name",
    "school",
    "birth_year",
    "death_year",
    "era",
    "coverage",
    "storage_path",
    "source",
    "license",
    "citation_source",
    "notes",
  ];

  const lines = [header.join(",")];

  let portraits = 0;
  let placeholders = 0;
  let none = 0;

  for (const master of sortedMasters) {
    const names = namesByMaster.get(master.id) ?? [];
    const englishName =
      names.find((n) => n.locale === "en" && n.nameType === "dharma")?.value ??
      names.find((n) => n.locale === "en")?.value ??
      master.slug;
    const schoolSlug = master.schoolId ? schoolSlugById.get(master.schoolId) ?? "" : "";

    const asset = assetByMaster.get(master.id);
    let coverage: string;
    let storagePath = "";
    let sourceLabel = "";
    let license = "";
    let citationSource = "";
    let notes = "";

    if (!asset) {
      coverage = "none";
      none++;
      notes = "no media_asset row — needs placeholder or curated portrait";
    } else {
      storagePath = asset.storagePath ?? "";
      license = asset.license ?? "";
      citationSource = citationSourceByAsset.get(asset.id) ?? "";
      if (asset.type === "placeholder") {
        coverage = "placeholder";
        placeholders++;
      } else {
        coverage = "portrait";
        portraits++;
      }
      const classified = classifySource({
        type: asset.type ?? "image",
        attribution: asset.attribution,
        license: asset.license,
        sourceUrl: asset.sourceUrl,
      });
      sourceLabel = classified.source;
      notes = classified.notes;
    }

    lines.push(
      [
        master.slug,
        englishName,
        schoolSlug,
        master.birthYear ?? "",
        master.deathYear ?? "",
        eraFor(master.birthYear, master.deathYear),
        coverage,
        storagePath,
        sourceLabel,
        license,
        citationSource,
        notes,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  fs.writeFileSync(OUT_PATH, lines.join("\n") + "\n");

  const total = sortedMasters.length;
  const cited = portraits + placeholders;
  const pct = total === 0 ? 0 : (cited / total) * 100;
  const portraitPct = total === 0 ? 0 : (portraits / total) * 100;
  console.log(`✓ wrote ${OUT_PATH}`);
  console.log(`  ${total} masters total`);
  console.log(`  ${portraits} portraits (${portraitPct.toFixed(1)}%)`);
  console.log(`  ${placeholders} name-card placeholders`);
  console.log(`  ${none} masters with no media_asset`);
  console.log(`  cited media coverage: ${cited}/${total} (${pct.toFixed(1)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
