/**
 * Tests for the Chan Ancestors PDF text-parsing functions.
 *
 * These tests exercise the pure parsing logic from extract-pdf.ts
 * using a sample text fixture rather than loading an actual PDF.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

import {
  isDateLine,
  inferSchool,
  parseIndex,
  parseChartBlocks,
  buildRawMasters,
  splitSections,
  type RawMaster,
  type IndexEntry,
  type ChartBlock,
} from "../scripts/extract-pdf";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXTURE_PATH = path.resolve(
  __dirname,
  "fixtures/chan-ancestors-sample.txt",
);
const GOLDEN_PATH = path.resolve(
  __dirname,
  "golden/chan-ancestors-expected.json",
);

const sampleText = fs.readFileSync(FIXTURE_PATH, "utf-8");
const expectedMasters: RawMaster[] = JSON.parse(
  fs.readFileSync(GOLDEN_PATH, "utf-8"),
);

// ---------------------------------------------------------------------------
// isDateLine
// ---------------------------------------------------------------------------

describe("isDateLine", () => {
  it("recognises full birth-death years", () => {
    expect(isDateLine("487-593")).toBe(true);
    expect(isDateLine("638-713")).toBe(true);
  });

  it("recognises abbreviated death years", () => {
    expect(isDateLine("807-83")).toBe(true);
    expect(isDateLine("1025-72")).toBe(true);
    expect(isDateLine("709-88")).toBe(true);
  });

  it("recognises death-only with uncertainty", () => {
    expect(isDateLine("d. 536? C.E.")).toBe(true);
  });

  it("recognises death-only", () => {
    expect(isDateLine("d. 606")).toBe(true);
    expect(isDateLine("d. 850")).toBe(true);
  });

  it("recognises century-only death dates", () => {
    expect(isDateLine("d. 9th c.")).toBe(true);
  });

  it("recognises n.d.", () => {
    expect(isDateLine("n.d.")).toBe(true);
  });

  it("rejects non-date lines", () => {
    expect(isDateLine("Bodhidharma")).toBe(false);
    expect(isDateLine("P'u-ti Ta-mo")).toBe(false);
    expect(isDateLine("Rinzai Gigen")).toBe(false);
    expect(isDateLine("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inferSchool
// ---------------------------------------------------------------------------

describe("inferSchool", () => {
  it("returns Early Chan for early patriarchs", () => {
    expect(inferSchool("I1")).toBe("Early Chan");
    expect(inferSchool("I6")).toBe("Early Chan");
  });

  it("returns Linji for A-column entries", () => {
    expect(inferSchool("A8")).toBe("Linji");
    expect(inferSchool("A11")).toBe("Linji");
  });

  it("returns Caodong for E/F columns", () => {
    expect(inferSchool("E10")).toBe("Caodong");
    expect(inferSchool("F12")).toBe("Caodong");
  });

  it("returns Qingyuan line for L column", () => {
    expect(inferSchool("L7")).toBe("Qingyuan line");
    expect(inferSchool("L11")).toBe("Qingyuan line");
  });

  it("returns empty string for empty input", () => {
    expect(inferSchool("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// parseIndex
// ---------------------------------------------------------------------------

describe("parseIndex", () => {
  const { chartLines, indexLines } = splitSections(sampleText);
  const { entries, notShown, seeRefs } = parseIndex(indexLines);

  it("parses tab-separated index entries", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("extracts Pinyin, Wade-Giles, Romaji from index entries", () => {
    const dongshan = entries.find((e) => e.pinyin === "Dongshan Liangjie");
    expect(dongshan).toBeDefined();
    expect(dongshan!.wadeGiles).toBe("Tung-shan Liang-chieh");
    expect(dongshan!.romaji).toBe("Tôzan Ryôkai");
    expect(dongshan!.gridCode).toBe("L11");
  });

  it("extracts Bodhidharma (as Puti Damo)", () => {
    const damo = entries.find((e) => e.pinyin === "Puti Damo");
    expect(damo).toBeDefined();
    expect(damo!.gridCode).toBe("I1");
  });

  it("parses 'Not shown' teacher references", () => {
    expect(notShown.length).toBeGreaterThan(0);

    const guifeng = notShown.find((n) => n.name === "Guifeng Zongmi");
    expect(guifeng).toBeDefined();
    expect(guifeng!.teacherName).toBe("Suizhou Daoyuan");
    expect(guifeng!.teacherGrid).toBe("Q11");
  });

  it("parses multiple not-shown refs", () => {
    const licun = notShown.find((n) => n.name === "Licun");
    expect(licun).toBeDefined();
    expect(licun!.teacherName).toBe("Linji Yixuan");
  });
});

// ---------------------------------------------------------------------------
// parseChartBlocks
// ---------------------------------------------------------------------------

describe("parseChartBlocks", () => {
  const { chartLines } = splitSections(sampleText);
  const blocks = parseChartBlocks(chartLines);

  it("parses chart blocks from sample text", () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("extracts Bodhidharma / Puti Damo", () => {
    const damo = blocks.find((b) => b.pinyin === "Puti Damo");
    expect(damo).toBeDefined();
    expect(damo!.dates).toBe("d. 536? C.E.");
    expect(damo!.wadeGiles).toBe("P'u-ti Ta-mo");
    expect(damo!.romaji).toBe("Bodai Daruma");
  });

  it("extracts nicknames", () => {
    const hongren = blocks.find((b) => b.pinyin === "Daman Hongren");
    expect(hongren).toBeDefined();
    expect(hongren!.nicknames).toContain("Huangmei");

    const huineng = blocks.find((b) => b.pinyin === "Dajian Huineng");
    expect(huineng).toBeDefined();
    expect(huineng!.nicknames).toContain("Caoxi");
  });

  it("extracts dates correctly", () => {
    const huike = blocks.find((b) => b.pinyin === "Dazu Huike");
    expect(huike).toBeDefined();
    expect(huike!.dates).toBe("487-593");

    const sengcan = blocks.find((b) => b.pinyin === "Jianzhi Sengcan");
    expect(sengcan).toBeDefined();
    expect(sengcan!.dates).toBe("d. 606");
  });

  it("extracts n.d. dates", () => {
    const danyuan = blocks.find((b) => b.pinyin === "Danyuan Yingzhen");
    expect(danyuan).toBeDefined();
    expect(danyuan!.dates).toBe("n.d.");
  });
});

// ---------------------------------------------------------------------------
// buildRawMasters
// ---------------------------------------------------------------------------

describe("buildRawMasters", () => {
  const { chartLines, indexLines } = splitSections(sampleText);
  const { entries, notShown } = parseIndex(indexLines);
  const chartBlocks = parseChartBlocks(chartLines);
  const masters = buildRawMasters(entries, chartBlocks, notShown, "TEST_RUN");

  it("produces the expected number of masters", () => {
    expect(masters.length).toBe(expectedMasters.length);
  });

  it("all masters have source_id set", () => {
    for (const m of masters) {
      expect(m.source_id).toBe("src_chan_ancestors_pdf");
    }
  });

  it("all masters have ingestion_run_id set", () => {
    for (const m of masters) {
      expect(m.ingestion_run_id).toBe("TEST_RUN");
    }
  });

  it("matches expected output for early patriarchs", () => {
    for (const expected of expectedMasters) {
      const actual = masters.find((m) => m.name === expected.name);
      expect(actual, `Missing master: ${expected.name}`).toBeDefined();

      expect(actual!.names_cjk).toBe(expected.names_cjk);
      expect(actual!.source_id).toBe(expected.source_id);

      if (expected.grid_code) {
        expect(actual!.grid_code).toBe(expected.grid_code);
      }

      if (expected.school) {
        expect(actual!.school).toBe(expected.school);
      }

      if (expected.dates) {
        expect(actual!.dates).toBe(expected.dates);
      }

      if (expected.names_alt) {
        expect(actual!.names_alt).toEqual(expected.names_alt);
      }

      if (expected.nicknames) {
        expect(actual!.nicknames).toEqual(expected.nicknames);
      }

      if (expected.teachers.length > 0) {
        expect(actual!.teachers.length).toBe(expected.teachers.length);
        for (let i = 0; i < expected.teachers.length; i++) {
          expect(actual!.teachers[i].name).toBe(expected.teachers[i].name);
          expect(actual!.teachers[i].edge_type).toBe(
            expected.teachers[i].edge_type,
          );
          expect(actual!.teachers[i].locator).toBe(
            expected.teachers[i].locator,
          );
        }
      }
    }
  });

  it("attaches teacher refs to not-shown masters", () => {
    const guifeng = masters.find((m) => m.name === "Guifeng Zongmi");
    expect(guifeng).toBeDefined();
    expect(guifeng!.teachers).toHaveLength(1);
    expect(guifeng!.teachers[0].name).toBe("Suizhou Daoyuan");
    expect(guifeng!.teachers[0].edge_type).toBe("primary");
    expect(guifeng!.teachers[0].locator).toBe("Q11");
  });
});

// ---------------------------------------------------------------------------
// splitSections
// ---------------------------------------------------------------------------

describe("splitSections", () => {
  const { chartLines, indexLines } = splitSections(sampleText);

  it("separates chart and index sections", () => {
    expect(chartLines.length).toBeGreaterThan(0);
    expect(indexLines.length).toBeGreaterThan(0);
  });

  it("chart section contains visual entries", () => {
    const chartText = chartLines.join("\n");
    expect(chartText).toContain("Bodhidharma");
    expect(chartText).toContain("d. 536? C.E.");
  });

  it("index section contains tab-separated entries", () => {
    const hasTabEntries = indexLines.some(
      (l) => l.includes("\t") && l.split("\t").length >= 3,
    );
    expect(hasTabEntries).toBe(true);
  });
});
