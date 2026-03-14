import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseHtml } from "../scripts/extract-tibetan-encyclopedia";
import type { RawMaster } from "../scripts/scraper-types";

const FIXTURE_PATH = path.resolve(__dirname, "fixtures/tibetan-encyclopedia-sample.html");
const GOLDEN_PATH = path.resolve(__dirname, "golden/tibetan-encyclopedia-expected.json");

describe("Tibetan Buddhist Encyclopedia scraper", () => {
  const html = fs.readFileSync(FIXTURE_PATH, "utf-8");
  const expected: RawMaster[] = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf-8"));
  const actual = parseHtml(html, "src_tibetan_encyclopedia", "test-run-id");

  it("should extract the correct number of masters", () => {
    expect(actual).toHaveLength(expected.length);
  });

  it("should match the golden output exactly", () => {
    expect(actual).toEqual(expected);
  });

  it("should set source_id to src_tibetan_encyclopedia on every record", () => {
    for (const m of actual) {
      expect(m.source_id).toBe("src_tibetan_encyclopedia");
    }
  });

  it("should parse root-level masters with no teacher", () => {
    const bodhidharma = actual.find((m) => m.name === "Bodhidharma");
    expect(bodhidharma).toBeDefined();
    expect(bodhidharma!.teachers).toHaveLength(0);
  });

  it("should derive teacher from nesting", () => {
    const huike = actual.find((m) => m.name === "Dazu Huike");
    expect(huike).toBeDefined();
    expect(huike!.teachers).toHaveLength(1);
    expect(huike!.teachers[0]!.name).toBe("Bodhidharma");
  });

  it("should extract CJK characters from parenthetical", () => {
    const sengcan = actual.find((m) => m.name === "Jianzhi Sengcan");
    expect(sengcan).toBeDefined();
    expect(sengcan!.names_cjk).toBe("鑑智僧璨");
  });

  it("should handle deeply nested lineages (3+ levels)", () => {
    const daoxin = actual.find((m) => m.name === "Dayi Daoxin");
    expect(daoxin).toBeDefined();
    expect(daoxin!.teachers[0]!.name).toBe("Jianzhi Sengcan");
  });

  it("should handle siblings at the same nesting level", () => {
    const caoshan = actual.find((m) => m.name === "Caoshan Benji");
    const yunju = actual.find((m) => m.name === "Yunju Daoying");
    expect(caoshan).toBeDefined();
    expect(yunju).toBeDefined();
    // Both should have Dongshan as teacher
    expect(caoshan!.teachers[0]!.name).toBe("Dongshan Liangjie");
    expect(yunju!.teachers[0]!.name).toBe("Dongshan Liangjie");
  });

  it("should use data-school attribute for school field", () => {
    const bodhidharma = actual.find((m) => m.name === "Bodhidharma");
    expect(bodhidharma!.school).toBe("Chan");

    const dongshan = actual.find((m) => m.name === "Dongshan Liangjie");
    expect(dongshan!.school).toBe("Caodong");
  });

  it("should return empty array for empty HTML", () => {
    const result = parseHtml("<html><body></body></html>", "src_tibetan_encyclopedia", "run1");
    expect(result).toEqual([]);
  });
});
