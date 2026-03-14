import { describe, expect, it } from "vitest";
import {
  sanitizeRawMaster,
  sanitizeRawMasters,
  type RawMasterLike,
} from "../scripts/raw-master-cleaning";

function rawMaster(overrides: Partial<RawMasterLike> = {}): RawMasterLike {
  return {
    name: "Test Master",
    names_cjk: "",
    dates: "",
    teachers: [],
    school: "",
    source_id: "src_chan_ancestors_pdf",
    ingestion_run_id: "run_test",
    ...overrides,
  };
}

describe("sanitizeRawMaster", () => {
  it("drops transliteration legend rows from the PDF extract", () => {
    expect(sanitizeRawMaster(rawMaster({ name: "Ch", names_alt: ["J", "K"] }))).toBeNull();
    expect(sanitizeRawMaster(rawMaster({ name: "WG = Pinyin" }))).toBeNull();
  });

  it("normalizes Pangyun into a usable canonical name and aliases", () => {
    const sanitized = sanitizeRawMaster(
      rawMaster({
        name: "Pangyun (Layman Pang) P'ang Yün",
        names_alt: ["Hôun", "G9 42"],
      }),
    );

    expect(sanitized?.name).toBe("Pang Yun");
    expect(sanitized?.names_alt).toEqual(["Hôun", "Layman Pang", "P'ang Yün"]);
  });

  it("strips chart noise from special-case aliases", () => {
    const sanitized = sanitizeRawMaster(
      rawMaster({
        name: "Taigu Puyu",
        names_alt: ["T’ai-ku P’u-yü", "(Korean) Taigo Pou B23"],
      }),
    );

    expect(sanitized?.names_alt).toEqual(["T’ai-ku P’u-yü", "Taigo Pou"]);
  });

  it("cleans not-shown suffixes from master names", () => {
    const sanitized = sanitizeRawMaster(
      rawMaster({
        name: "Mahasattva Fu (Not shown)",
        names_alt: ["67", "40"],
      }),
    );

    expect(sanitized?.name).toBe("Mahasattva Fu");
    expect(sanitized?.names_alt).toBeUndefined();
  });
});

describe("sanitizeRawMasters", () => {
  it("removes only discardable rows and preserves legitimate entries", () => {
    const sanitized = sanitizeRawMasters([
      rawMaster({ name: "Ch", names_alt: ["J"] }),
      rawMaster({ name: "Kapimala" }),
    ]);

    expect(sanitized).toHaveLength(1);
    expect(sanitized[0]?.name).toBe("Kapimala");
  });
});
