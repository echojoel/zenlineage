import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import type { RawTeaching } from "../scripts/scraper-types";

const RAW_TEACHINGS_DIR = path.join(process.cwd(), "scripts/data/raw-teachings");

function loadTeachingFile(filename: string): RawTeaching[] {
  const filepath = path.join(RAW_TEACHINGS_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

describe("teachings-mumonkan.json", () => {
  const teachings = loadTeachingFile("teachings-mumonkan.json");

  it("contains 48 cases", () => {
    expect(teachings).toHaveLength(48);
  });

  it("all rows have source_id src_mumonkan_senzaki_1934", () => {
    for (const t of teachings) {
      expect(t.source_id).toBe("src_mumonkan_senzaki_1934");
    }
  });

  it("all rows have translator and edition set", () => {
    for (const t of teachings) {
      expect(t.translator).toBe("Nyogen Senzaki, Paul Reps");
      expect(t.edition).toBe("1934");
      expect(t.license_status).toBe("public_domain");
    }
  });

  it("unknown-author rows exist for cases 10,17,20,26,32,35", () => {
    const unknowns = teachings.filter((t) => t.author_slug === "unknown");
    const caseNums = unknowns.map((t) => t.case_number).sort();
    expect(caseNums).toEqual(["10", "17", "20", "26", "32", "35"]);
  });

  it("case 1 has correct structure", () => {
    const case1 = teachings.find((t) => t.case_number === "1");
    expect(case1).toBeDefined();
    expect(case1!.slug).toBe("mumonkan-case-01");
    expect(case1!.author_slug).toBe("zhaozhou-congshen");
    expect(case1!.title).toBe("Joshu's Dog");
    expect(case1!.content.length).toBeGreaterThan(100);
  });
});

describe("teachings-standalone.json", () => {
  const teachings = loadTeachingFile("teachings-standalone.json");

  it("contains standalone teachings", () => {
    expect(teachings.length).toBeGreaterThanOrEqual(5);
  });

  it("each row carries its own source_id", () => {
    for (const t of teachings) {
      expect(t.source_id).toBeTruthy();
    }
  });

  it("includes expected teaching types", () => {
    const types = new Set(teachings.map((t) => t.type));
    expect(types.has("verse")).toBe(true);
    expect(types.has("dialogue")).toBe(true);
  });
});

describe("seed-teachings contract", () => {
  it("unknown author_slug rows should seed with authorId null (not be skipped)", () => {
    const mumonkan = loadTeachingFile("teachings-mumonkan.json");
    const unknowns = mumonkan.filter((t) => t.author_slug === "unknown");
    // These should NOT be skipped — the seed script allows unknown authors
    expect(unknowns.length).toBe(6);
    // Each still has all required fields
    for (const t of unknowns) {
      expect(t.slug).toBeTruthy();
      expect(t.content).toBeTruthy();
      expect(t.source_id).toBeTruthy();
    }
  });

  it("translator/edition/licenseStatus pass through from RawTeaching", () => {
    const mumonkan = loadTeachingFile("teachings-mumonkan.json");
    const case1 = mumonkan[0];
    // These fields exist in RawTeaching and should be used by seed-teachings
    expect(case1.translator).toBe("Nyogen Senzaki, Paul Reps");
    expect(case1.edition).toBe("1934");
    expect(case1.license_status).toBe("public_domain");
  });
});
