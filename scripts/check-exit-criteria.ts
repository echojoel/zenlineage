/**
 * Audit data coverage, source diversity, and raw-dataset provenance.
 *
 * Usage:
 *   npx tsx scripts/check-exit-criteria.ts
 */

import fs from "fs";
import path from "path";
import { db } from "@/db";
import {
  citations,
  ingestionRuns,
  masterBiographies,
  masters,
  masterTransmissions,
  mediaAssets,
  searchTokens,
  sourceSnapshots,
  sources,
  teachings,
} from "@/db/schema";
import { getTier1Entry, getTier1Slugs } from "@/lib/editorial-tiers";
import { getRawDatasetConfig, getRawTeachingDatasetConfig } from "./raw-dataset-config";
import { assessCoverageAudit } from "./coverage-audit-status";

const RAW_DIR = path.join(process.cwd(), "scripts/data/raw");
const PREVIEW_LIMIT = 10;

interface RawDatasetAudit {
  filename: string;
  kind: string;
  rowCount: number;
  actualSourceIds: string[];
  expectedSourceId: string | null;
  runIds: string[];
  missingRunIds: string[];
  runsWithoutSnapshots: string[];
  runSourceMismatches: string[];
  status: "ok" | "warn" | "error";
  notes: string[];
}

function formatPercent(count: number, total: number): string {
  if (total === 0) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

function preview(items: string[]): string {
  if (items.length === 0) return "none";
  const visible = items.slice(0, PREVIEW_LIMIT);
  const suffix = items.length > PREVIEW_LIMIT ? ` ... +${items.length - PREVIEW_LIMIT} more` : "";
  return `${visible.join(", ")}${suffix}`;
}

function printMetric(label: string, value: string | number): void {
  console.log(`${label.padEnd(34)} ${value}`);
}

const RAW_TEACHINGS_DIR = path.join(process.cwd(), "scripts/data/raw-teachings");

function auditDir(
  dir: string,
  getConfig: (filename: string) => ReturnType<typeof getRawDatasetConfig>,
  input: {
    ingestionRunSourceIds: Map<string, string>;
    snapshotRunIds: Set<string>;
  }
): RawDatasetAudit[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const filenames = fs
    .readdirSync(dir)
    .filter((filename) => filename.endsWith(".json"))
    .sort();

  return filenames.map((filename) => {
    const filepath = path.join(dir, filename);
    const config = getConfig(filename);

    try {
      const rows = JSON.parse(fs.readFileSync(filepath, "utf-8")) as {
        source_id: string;
        ingestion_run_id: string;
      }[];
      const actualSourceIds = Array.from(
        new Set(rows.map((row) => row.source_id).filter(Boolean))
      ).sort();
      const runIds = Array.from(
        new Set(rows.map((row) => row.ingestion_run_id).filter(Boolean))
      ).sort();
      const expectedSourceId = config.expectedSourceId ?? null;
      const expectedRunSourceId =
        expectedSourceId ?? (actualSourceIds.length === 1 ? actualSourceIds[0] : null);
      const missingRunIds = runIds.filter((runId) => !input.ingestionRunSourceIds.has(runId));
      const runsWithoutSnapshots = runIds.filter(
        (runId) => input.ingestionRunSourceIds.has(runId) && !input.snapshotRunIds.has(runId)
      );
      const runSourceMismatches =
        expectedRunSourceId == null
          ? []
          : runIds.filter((runId) => {
              const runSourceId = input.ingestionRunSourceIds.get(runId);
              return Boolean(runSourceId && runSourceId !== expectedRunSourceId);
            });
      const notes = config.notes ? [config.notes] : [];

      let status: RawDatasetAudit["status"] = "ok";
      if (
        expectedSourceId &&
        (actualSourceIds.length !== 1 || actualSourceIds[0] !== expectedSourceId)
      ) {
        status = "warn";
      } else if (!expectedSourceId && actualSourceIds.length > 1) {
        status = "warn";
      }
      if (
        missingRunIds.length > 0 ||
        runsWithoutSnapshots.length > 0 ||
        runSourceMismatches.length > 0
      ) {
        status = "warn";
      }

      if (missingRunIds.length > 0) {
        notes.push(`missing ingestion_runs: ${missingRunIds.join(", ")}`);
      }
      if (runsWithoutSnapshots.length > 0) {
        notes.push(`missing source_snapshots: ${runsWithoutSnapshots.join(", ")}`);
      }
      if (runSourceMismatches.length > 0) {
        notes.push(`ingestion_runs source mismatch: ${runSourceMismatches.join(", ")}`);
      }

      return {
        filename,
        kind: config.kind,
        rowCount: rows.length,
        actualSourceIds,
        expectedSourceId,
        runIds,
        missingRunIds,
        runsWithoutSnapshots,
        runSourceMismatches,
        status,
        notes,
      };
    } catch (error) {
      return {
        filename,
        kind: config.kind,
        rowCount: 0,
        actualSourceIds: [],
        expectedSourceId: config.expectedSourceId ?? null,
        runIds: [],
        missingRunIds: [],
        runsWithoutSnapshots: [],
        runSourceMismatches: [],
        status: "error",
        notes: [error instanceof Error ? error.message : "Unable to parse raw dataset JSON"],
      };
    }
  });
}

function auditRawDatasets(input: {
  ingestionRunSourceIds: Map<string, string>;
  snapshotRunIds: Set<string>;
}): RawDatasetAudit[] {
  const masterAudits = auditDir(RAW_DIR, getRawDatasetConfig, input);
  const teachingAudits = auditDir(RAW_TEACHINGS_DIR, getRawTeachingDatasetConfig, input);
  return [...masterAudits, ...teachingAudits];
}

async function main() {
  const [
    allMasters,
    allCitations,
    allTokens,
    allSources,
    allBiographies,
    allTeachings,
    allMedia,
    allTransmissions,
    allIngestionRuns,
    allSnapshots,
  ] = await Promise.all([
    db.select({ id: masters.id, slug: masters.slug }).from(masters),
    db
      .select({
        entityType: citations.entityType,
        entityId: citations.entityId,
        sourceId: citations.sourceId,
      })
      .from(citations),
    db.select({ entityId: searchTokens.entityId }).from(searchTokens),
    db.select({ id: sources.id, title: sources.title }).from(sources),
    db
      .select({
        id: masterBiographies.id,
        masterId: masterBiographies.masterId,
      })
      .from(masterBiographies),
    db
      .select({
        id: teachings.id,
        authorId: teachings.authorId,
      })
      .from(teachings),
    db
      .select({
        id: mediaAssets.id,
        entityType: mediaAssets.entityType,
        entityId: mediaAssets.entityId,
      })
      .from(mediaAssets),
    db
      .select({
        studentId: masterTransmissions.studentId,
        teacherId: masterTransmissions.teacherId,
      })
      .from(masterTransmissions),
    db
      .select({
        id: ingestionRuns.id,
        sourceId: ingestionRuns.sourceId,
      })
      .from(ingestionRuns),
    db
      .select({
        ingestionRunId: sourceSnapshots.ingestionRunId,
      })
      .from(sourceSnapshots),
  ]);

  const totalMasters = allMasters.length;
  const tier1Slugs = new Set(getTier1Slugs());
  const tier1Masters = allMasters.filter((master) => tier1Slugs.has(master.slug));
  const citedIds = new Set(
    allCitations
      .filter((citation) => citation.entityType === "master")
      .map((citation) => citation.entityId)
  );
  const citationKeys = new Set(
    allCitations.map((citation) => `${citation.entityType}:${citation.entityId}`)
  );
  const tokenIds = new Set(allTokens.map((token) => token.entityId));
  const biographyIds = new Set(allBiographies.map((bio) => bio.masterId));
  const teachingAuthorIds = new Set(
    allTeachings
      .map((teaching) => teaching.authorId)
      .filter((authorId): authorId is string => Boolean(authorId))
  );
  const mediaMasterIds = new Set(
    allMedia.filter((asset) => asset.entityType === "master").map((asset) => asset.entityId)
  );

  const imageIds = new Set([...mediaMasterIds]);

  const studentIds = new Set(allTransmissions.map((edge) => edge.studentId));
  const teacherIds = new Set(allTransmissions.map((edge) => edge.teacherId));
  const orphanMasters = allMasters
    .filter((master) => !studentIds.has(master.id) && !teacherIds.has(master.id))
    .map((master) => master.slug)
    .sort();

  const citationsByMaster = new Map<string, Set<string>>();
  const citationCountsBySource = new Map<string, number>();

  for (const citation of allCitations) {
    citationCountsBySource.set(
      citation.sourceId,
      (citationCountsBySource.get(citation.sourceId) ?? 0) + 1
    );

    if (citation.entityType !== "master") continue;

    const sourceIds = citationsByMaster.get(citation.entityId) ?? new Set<string>();
    sourceIds.add(citation.sourceId);
    citationsByMaster.set(citation.entityId, sourceIds);
  }

  let oneSource = 0;
  let twoSources = 0;
  let threePlusSources = 0;
  for (const master of allMasters) {
    const sourceCount = citationsByMaster.get(master.id)?.size ?? 0;
    if (sourceCount === 1) oneSource++;
    if (sourceCount === 2) twoSources++;
    if (sourceCount >= 3) threePlusSources++;
  }

  const suspiciousSlugs = allMasters
    .map((master) => master.slug)
    .filter((slug) => slug.length <= 3)
    .sort();
  const missingBiographies = allMasters
    .filter((master) => !biographyIds.has(master.id))
    .map((master) => master.slug)
    .sort();
  const missingTeachings = allMasters
    .filter((master) => !teachingAuthorIds.has(master.id))
    .map((master) => master.slug)
    .sort();
  const missingImages = allMasters
    .filter((master) => !imageIds.has(master.id))
    .map((master) => master.slug)
    .sort();
  const uncitedBiographyRows = allBiographies.filter(
    (bio) => !citationKeys.has(`master_biography:${bio.id}`)
  );
  const uncitedTeachings = allTeachings.filter(
    (teaching) => !citationKeys.has(`teaching:${teaching.id}`)
  );
  const uncitedMediaAssets = allMedia.filter(
    (asset) => !citationKeys.has(`media_asset:${asset.id}`)
  );
  const tier1BiographyCoverage = tier1Masters.filter((master) => biographyIds.has(master.id));
  const tier1TeachingCoverage = tier1Masters.filter((master) => teachingAuthorIds.has(master.id));
  const tier1ImageCoverage = tier1Masters.filter((master) => imageIds.has(master.id));
  const tier1Orphans = tier1Masters.filter(
    (master) => !studentIds.has(master.id) && !teacherIds.has(master.id)
  );

  const activeSourceIds = Array.from(
    new Set(allCitations.map((citation) => citation.sourceId))
  ).sort();
  const sourceTitleById = new Map(
    allSources.map((source) => [source.id, source.title ?? source.id])
  );
  const sourceBreakdown = Array.from(citationCountsBySource.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([sourceId, count]) => ({
      sourceId,
      title: sourceTitleById.get(sourceId) ?? sourceId,
      count,
    }));

  const ingestionRunSourceIds = new Map(allIngestionRuns.map((run) => [run.id, run.sourceId]));
  const snapshotRunIds = new Set(allSnapshots.map((snapshot) => snapshot.ingestionRunId));
  const rawDatasetAudits = auditRawDatasets({
    ingestionRunSourceIds,
    snapshotRunIds,
  });
  const provenanceWarnings = rawDatasetAudits.filter((audit) => audit.status === "warn");
  const provenanceErrors = rawDatasetAudits.filter((audit) => audit.status === "error");
  const auditAssessment = assessCoverageAudit({
    uncitedMasters: totalMasters - citedIds.size,
    mastersWithoutSearchTokens: totalMasters - tokenIds.size,
    missingBiographies: missingBiographies.length,
    uncitedBiographies: uncitedBiographyRows.length,
    missingTeachings: missingTeachings.length,
    uncitedTeachings: uncitedTeachings.length,
    missingImages: missingImages.length,
    uncitedImages: uncitedMediaAssets.length,
    orphanMasters: orphanMasters.length,
    suspiciousSlugs: suspiciousSlugs.length,
    inactiveSources: allSources.length - activeSourceIds.length,
    provenanceWarnings: provenanceWarnings.length,
    provenanceErrors: provenanceErrors.length,
    hardcodedImageFallbacks: 0,
    mediaBackedImages: mediaMasterIds.size,
  });

  console.log("=== Data Coverage Audit ===\n");

  console.log("Core coverage");
  printMetric("Total masters", totalMasters);
  printMetric(
    "Masters with >=1 citation",
    `${citedIds.size} / ${totalMasters} (${formatPercent(citedIds.size, totalMasters)})`
  );
  printMetric(
    "Masters with search tokens",
    `${tokenIds.size} / ${totalMasters} (${formatPercent(tokenIds.size, totalMasters)})`
  );
  printMetric(
    "Masters with biographies",
    `${biographyIds.size} / ${totalMasters} (${formatPercent(biographyIds.size, totalMasters)})`
  );
  printMetric(
    "Masters with teachings",
    `${teachingAuthorIds.size} / ${totalMasters} (${formatPercent(
      teachingAuthorIds.size,
      totalMasters
    )})`
  );
  printMetric(
    "Masters with images",
    `${imageIds.size} / ${totalMasters} (${formatPercent(imageIds.size, totalMasters)})`
  );
  printMetric(
    "Images in media_assets",
    `${mediaMasterIds.size} masters (${allMedia.length} asset rows)`
  );
  printMetric("Hardcoded image fallbacks", 0);
  printMetric("Orphan masters", `${orphanMasters.length} / ${totalMasters}`);
  printMetric("Suspicious short slugs", suspiciousSlugs.length);
  printMetric(
    "Biographies lacking citations",
    `${uncitedBiographyRows.length} / ${allBiographies.length}`
  );
  printMetric("Teachings lacking citations", `${uncitedTeachings.length} / ${allTeachings.length}`);
  printMetric(
    "Media assets lacking citations",
    `${uncitedMediaAssets.length} / ${allMedia.length}`
  );

  console.log("\nTier 1 coverage");
  printMetric("Tier 1 masters", tier1Masters.length);
  printMetric(
    "Tier 1 biographies",
    `${tier1BiographyCoverage.length} / ${tier1Masters.length} (${formatPercent(
      tier1BiographyCoverage.length,
      tier1Masters.length
    )})`
  );
  printMetric(
    "Tier 1 teachings",
    `${tier1TeachingCoverage.length} / ${tier1Masters.length} (${formatPercent(
      tier1TeachingCoverage.length,
      tier1Masters.length
    )})`
  );
  printMetric(
    "Tier 1 images",
    `${tier1ImageCoverage.length} / ${tier1Masters.length} (${formatPercent(
      tier1ImageCoverage.length,
      tier1Masters.length
    )})`
  );
  printMetric(
    "Tier 1 orphans",
    `${tier1Orphans.length} / ${tier1Masters.length} (${formatPercent(
      tier1Orphans.length,
      tier1Masters.length
    )})`
  );

  console.log("\nSource diversity");
  printMetric("Registered sources", allSources.length);
  printMetric("Active cited sources", `${activeSourceIds.length} / ${allSources.length}`);
  printMetric("Masters backed by 1 source", oneSource);
  printMetric("Masters backed by 2 sources", twoSources);
  printMetric("Masters backed by >=3 sources", threePlusSources);
  for (const source of sourceBreakdown) {
    printMetric(`  ${source.sourceId}`, `${source.count} citations (${source.title})`);
  }

  console.log("\nRaw dataset provenance");
  if (rawDatasetAudits.length === 0) {
    console.log("No raw datasets found.");
  } else {
    for (const audit of rawDatasetAudits) {
      const expected = audit.expectedSourceId ?? "inferred from rows";
      const actual = audit.actualSourceIds.length > 0 ? audit.actualSourceIds.join(", ") : "none";
      const runs = audit.runIds.length > 0 ? audit.runIds.join(", ") : "none";
      console.log(
        `[${audit.status.toUpperCase()}] ${audit.filename} | kind=${audit.kind} | rows=${audit.rowCount} | actual=${actual} | expected=${expected} | runs=${runs}`
      );
      for (const note of audit.notes) {
        console.log(`  note: ${note}`);
      }
    }
  }

  console.log("\nCoverage gaps");
  printMetric("Missing biographies", preview(missingBiographies));
  printMetric("Missing teachings", preview(missingTeachings));
  printMetric("Missing images", preview(missingImages));
  printMetric("Suspicious slugs", preview(suspiciousSlugs));
  const uncitedBiographyPreview = uncitedBiographyRows
    .map((bio) => allMasters.find((master) => master.id === bio.masterId)?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .sort();
  printMetric("Uncited biographies", preview(uncitedBiographyPreview));
  const tier1OrphanPreview = tier1Orphans.map((master) => {
    const entry = getTier1Entry(master.slug);
    return entry ? `${master.slug} (${entry.reason})` : master.slug;
  });
  printMetric("Tier 1 orphan preview", preview(tier1OrphanPreview));

  console.log("\nStatus");
  printMetric("Coverage audit", auditAssessment.status);
  if (auditAssessment.reasons.length > 0) {
    printMetric("Audit notes", auditAssessment.reasons.join("; "));
  }
  if (provenanceWarnings.length + provenanceErrors.length > 0) {
    printMetric(
      "Provenance issues",
      `${provenanceWarnings.length + provenanceErrors.length} raw datasets need attention`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
