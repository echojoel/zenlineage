import type { RawMaster } from "./scraper-types";

export type RawDatasetKind = "external_extract" | "curated_extract" | "editorial_overlay";

export type RawDatasetEntityKind = "master" | "teaching";

export interface RawDatasetConfig {
  kind: RawDatasetKind;
  entityKind?: RawDatasetEntityKind;
  expectedSourceId?: string;
  normalizedSourceId?: string;
  notes?: string;
}

const RAW_DATASET_CONFIG: Record<string, RawDatasetConfig> = {
  "originals-curated.json": {
    kind: "editorial_overlay",
    expectedSourceId: "src_originals_curated",
    normalizedSourceId: "src_originals_curated",
    notes:
      "Internal editorial overlay for lineage coverage that is not attributable to one upstream source.",
  },
  "soto-curated.json": {
    kind: "curated_extract",
    expectedSourceId: "src_sotozen_founders",
    normalizedSourceId: "src_sotozen_founders",
    notes: "Local curated extract derived from the Soto Zen founders lineage source.",
  },
};

const DEFAULT_DATASET_CONFIG: RawDatasetConfig = {
  kind: "external_extract",
};

export function getRawDatasetConfig(filename: string): RawDatasetConfig {
  return RAW_DATASET_CONFIG[filename] ?? DEFAULT_DATASET_CONFIG;
}

const RAW_TEACHINGS_DATASET_CONFIG: Record<string, RawDatasetConfig> = {
  "teachings-mumonkan.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_mumonkan_senzaki_1934",
    notes: "48 Mumonkan cases from Senzaki/Reps 1934 translation via Wikisource",
  },
  "teachings-standalone.json": {
    kind: "editorial_overlay",
    entityKind: "teaching",
    notes: "Standalone verses and dialogues — each row carries its own source_id",
  },
};

const DEFAULT_TEACHINGS_DATASET_CONFIG: RawDatasetConfig = {
  kind: "external_extract",
  entityKind: "teaching",
};

export function getRawTeachingDatasetConfig(filename: string): RawDatasetConfig {
  return RAW_TEACHINGS_DATASET_CONFIG[filename] ?? DEFAULT_TEACHINGS_DATASET_CONFIG;
}

export function normalizeRawDatasetRows(filename: string, rows: RawMaster[]): RawMaster[] {
  const config = getRawDatasetConfig(filename);
  const normalizedSourceId = config.normalizedSourceId;

  if (!normalizedSourceId) {
    return rows;
  }

  return rows.map((row) =>
    row.source_id === normalizedSourceId
      ? row
      : {
          ...row,
          source_id: normalizedSourceId,
        }
  );
}
