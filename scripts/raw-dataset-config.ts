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
  "teachings-sutra-heart-mueller.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_sbe_xlix_mueller_1894",
    notes: "Heart Sūtra — F. Max Müller, SBE XLIX (1894). Public domain.",
  },
  "teachings-sutra-heart-beal.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_beal_catena_1871",
    notes: "Heart Sūtra — Samuel Beal, Catena of Buddhist Scriptures (1871). Public domain.",
  },
  "teachings-sutra-diamond-mueller.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_sbe_xlix_mueller_1894",
    notes: "Diamond Sūtra — F. Max Müller, SBE XLIX (1894). Public domain.",
  },
  "teachings-sutra-diamond-gemmell.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_gemmell_diamond_1912",
    notes: "Diamond Sūtra — William Gemmell (1912). Public domain.",
  },
  "teachings-sutra-platform-wong.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_wong_platform_1930",
    notes: "Platform Sūtra — Wong Mou-Lam (1930). Public domain.",
  },
  "teachings-sutra-platform-goddard.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_goddard_buddhist_bible_1932",
    notes: "Platform Sūtra — Dwight Goddard, A Buddhist Bible (1932 ed.). Public domain.",
  },
  "teachings-sutra-heart-xuanzang.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_taisho_canon",
    notes: "Heart Sūtra — Xuanzang's Chinese (T251). Public domain.",
  },
  "teachings-sutra-heart-japanese.json": {
    kind: "editorial_overlay",
    entityKind: "teaching",
    expectedSourceId: "src_sutras_curated_pd",
    notes: "Heart Sūtra — Sino-Japanese chant (Hannya Shingyō). Public domain.",
  },
  "teachings-sutra-heart-sanskrit.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_mueller_nanjio_anecdota_1884",
    notes: "Heart Sūtra — Sanskrit short recension (Müller & Nanjio 1884). Public domain.",
  },
  "teachings-sutra-diamond-kumarajiva.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_taisho_canon",
    notes: "Diamond Sūtra — Kumārajīva's Chinese (T235). Public domain.",
  },
  "teachings-sutra-diamond-sanskrit.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_mueller_anecdota_1881",
    notes: "Diamond Sūtra — Sanskrit (Müller 1881 ed.). Public domain.",
  },
  "teachings-sutra-platform-zongbao.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_taisho_canon",
    notes: "Platform Sūtra — Zongbao Chinese recension (T2008). Public domain.",
  },
  "teachings-sutra-lotus-kern.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_kern_lotus_1884",
    notes: "Lotus Sūtra — Kern English (Universal Gate ch. XXIV). Public domain.",
  },
  "teachings-sutra-lotus-kumarajiva.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_taisho_canon",
    notes: "Lotus Sūtra — Kumārajīva's Chinese (T262, ch. 25). Public domain.",
  },
  "teachings-sutra-lotus-japanese.json": {
    kind: "editorial_overlay",
    entityKind: "teaching",
    expectedSourceId: "src_sutras_curated_pd",
    notes: "Lotus Sūtra — Sino-Japanese chant (Kannon-gyō). Public domain.",
  },
  "teachings-sutra-lotus-sanskrit.json": {
    kind: "external_extract",
    entityKind: "teaching",
    expectedSourceId: "src_kern_nanjio_lotus_1908",
    notes: "Lotus Sūtra — Sanskrit (Kern–Nanjio Bibliotheca Buddhica X). Public domain.",
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
