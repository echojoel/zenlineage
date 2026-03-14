import { describe, expect, it } from "vitest";
import { getRawDatasetConfig, normalizeRawDatasetRows } from "../scripts/raw-dataset-config";
import type { RawMaster } from "../scripts/scraper-types";

function rawMaster(overrides: Partial<RawMaster> = {}): RawMaster {
  return {
    name: "Test Master",
    names_cjk: "",
    dates: "",
    teachers: [],
    school: "Chan",
    source_id: "src_wikipedia",
    ingestion_run_id: "run_test",
    ...overrides,
  };
}

describe("raw dataset config", () => {
  it("marks originals-curated.json as an editorial overlay", () => {
    const config = getRawDatasetConfig("originals-curated.json");

    expect(config.kind).toBe("editorial_overlay");
    expect(config.expectedSourceId).toBe("src_originals_curated");
  });

  it("preserves curated extracts that map directly to one upstream source", () => {
    const config = getRawDatasetConfig("soto-curated.json");

    expect(config.kind).toBe("curated_extract");
    expect(config.expectedSourceId).toBe("src_sotozen_founders");
  });

  it("normalizes editorial overlay rows to their configured source id", () => {
    const rows = [
      rawMaster({ source_id: "src_wikipedia" }),
      rawMaster({ name: "Second Master", source_id: "src_wikipedia" }),
    ];

    const normalized = normalizeRawDatasetRows("originals-curated.json", rows);

    expect(normalized.map((row) => row.source_id)).toEqual([
      "src_originals_curated",
      "src_originals_curated",
    ]);
  });

  it("leaves external extracts unchanged when there is no override", () => {
    const rows = [rawMaster({ source_id: "src_wikipedia" })];

    const normalized = normalizeRawDatasetRows("wikipedia.json", rows);

    expect(normalized).toEqual(rows);
  });
});
