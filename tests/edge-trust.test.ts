import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseEvidenceFile, computeTier, validateEvidence } from "@/lib/edge-trust";

const FIX = path.join(process.cwd(), "tests/fixtures/transmission-evidence");

function load(name: string): string {
  return fs.readFileSync(path.join(FIX, name), "utf-8");
}

describe("parseEvidenceFile", () => {
  it("parses frontmatter of a tier-A file", () => {
    const r = parseEvidenceFile(load("tier-a.md"));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.parsed.student).toBe("tetsugen-bernard-glassman");
    expect(r.parsed.teacher).toBe("hakuyu-taizan-maezumi");
    expect(r.parsed.sources).toHaveLength(2);
  });

  it("fails when a quote is under 40 chars", () => {
    const r = parseEvidenceFile(load("quote-too-short.md"));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.some((e) => e.includes("quote"))).toBe(true);
  });
});

describe("computeTier", () => {
  it("returns A when 1 institutional + 1 independent corroboration", () => {
    const r = parseEvidenceFile(load("tier-a.md"));
    if (!r.ok) throw new Error("fixture broken");
    expect(computeTier(r.parsed.sources)).toBe("A");
  });

  it("returns C with a single sangha source", () => {
    const r = parseEvidenceFile(load("tier-c.md"));
    if (!r.ok) throw new Error("fixture broken");
    expect(computeTier(r.parsed.sources)).toBe("C");
  });

  it("returns D when no sources", () => {
    expect(computeTier([])).toBe("D");
  });

  it("returns D when any source is promotional", () => {
    expect(
      computeTier([
        { publisher: "X", url: "x", domain_class: "institutional", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
        { publisher: "Y", url: "y", domain_class: "promotional", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
      ])
    ).toBe("D");
  });

  it("returns B when 2 sources where one is academic", () => {
    expect(
      computeTier([
        { publisher: "X", url: "x", domain_class: "academic", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
        { publisher: "Y", url: "y", domain_class: "reference", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
      ])
    ).toBe("B");
  });
});

describe("validateEvidence", () => {
  it("flags tier-mismatch when declared A but sources only justify C", () => {
    const r = parseEvidenceFile(load("tier-c.md"));
    if (!r.ok) throw new Error("fixture broken");
    const issues = validateEvidence({ ...r.parsed, tier: "A" });
    expect(issues.some((i) => i.kind === "tier-mismatch")).toBe(true);
  });

  it("flags any promotional source", () => {
    const r = parseEvidenceFile(load("promotional.md"));
    if (!r.ok) throw new Error("fixture broken");
    const issues = validateEvidence(r.parsed);
    expect(issues.some((i) => i.kind === "promotional-source")).toBe(true);
  });
});
