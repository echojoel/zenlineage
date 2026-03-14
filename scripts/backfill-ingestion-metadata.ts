import fs from "fs";
import path from "path";
import { getRawDatasetConfig } from "./raw-dataset-config";
import type { RawMaster } from "./scraper-types";
import {
  finishIngestionRun,
  fingerprintContent,
  startIngestionRun,
  toArchiveRef,
} from "./ingestion-provenance";

const RAW_DIR = path.join(process.cwd(), "scripts/data/raw");

const SCRIPT_NAME_BY_DATASET: Record<string, string> = {
  "chan-ancestors.json": "extract-pdf.ts",
  "mountain-moon.json": "extract-mountain-moon.ts",
  "terebess.json": "extract-terebess.ts",
  "tibetan-encyclopedia.json": "extract-tibetan-encyclopedia.ts",
  "wikipedia.json": "extract-wikipedia.ts",
  "originals-curated.json": "backfill-ingestion-metadata.ts",
  "soto-curated.json": "backfill-ingestion-metadata.ts",
};

function loadRawRows(filepath: string): RawMaster[] {
  return JSON.parse(fs.readFileSync(filepath, "utf-8")) as RawMaster[];
}

async function main(): Promise<void> {
  if (!fs.existsSync(RAW_DIR)) {
    console.log("No raw dataset directory found.");
    return;
  }

  const filenames = fs
    .readdirSync(RAW_DIR)
    .filter((filename) => filename.endsWith(".json"))
    .sort();

  for (const filename of filenames) {
    const filepath = path.join(RAW_DIR, filename);
    const fileContent = fs.readFileSync(filepath, "utf-8");
    const rows = loadRawRows(filepath);
    const config = getRawDatasetConfig(filename);
    const recordCountByRunId = new Map<string, number>();

    for (const row of rows) {
      if (!row.ingestion_run_id) continue;
      recordCountByRunId.set(
        row.ingestion_run_id,
        (recordCountByRunId.get(row.ingestion_run_id) ?? 0) + 1
      );
    }

    const runIds = Array.from(recordCountByRunId.keys()).sort();
    if (runIds.length === 0) {
      console.log(`Skipping ${filename}: no ingestion_run_id values found.`);
      continue;
    }

    for (const runId of runIds) {
      const matchingRows = rows.filter((row) => row.ingestion_run_id === runId);
      const sourceId = matchingRows[0]?.source_id ?? config.expectedSourceId ?? "src_unknown";
      const scriptName = SCRIPT_NAME_BY_DATASET[filename] ?? "backfill-ingestion-metadata.ts";
      const fileStats = fs.statSync(filepath);
      const run = await startIngestionRun({
        sourceId,
        scriptName,
        runId,
        runDate: fileStats.mtime.toISOString(),
      });

      await finishIngestionRun(run, {
        recordCount: recordCountByRunId.get(runId) ?? 0,
        notes: `Backfilled provenance from ${filename}`,
        snapshotHash: fingerprintContent(fileContent),
        snapshotArchiveRef: toArchiveRef(filepath),
        snapshotDate: fileStats.mtime.toISOString(),
      });
    }

    console.log(`Backfilled ${filename}: ${runIds.length} run(s), ${rows.length} row(s).`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("backfill-ingestion-metadata.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
