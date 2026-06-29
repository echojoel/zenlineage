import { describe, expect, it } from "vitest";
import { masters } from "../src/db/schema";
import {
  FOUNDER_SLUGS,
  LIVING_SLUGS,
  computeLineageBoundary,
} from "../src/lib/lineage-boundary";

describe("masters schema: lineage-boundary columns", () => {
  it("declares living and published columns", () => {
    expect(masters.living).toBeDefined();
    expect(masters.published).toBeDefined();
    expect(masters.living.name).toBe("living");
    expect(masters.published.name).toBe("published");
  });
});

describe("lineage-boundary authored lists", () => {
  it("has 9 unique founders", () => {
    expect(FOUNDER_SLUGS.length).toBe(9);
    expect(new Set(FOUNDER_SLUGS).size).toBe(9);
  });
  it("has 33 unique living masters", () => {
    expect(LIVING_SLUGS.length).toBe(33);
    expect(new Set(LIVING_SLUGS).size).toBe(33);
  });
  it("never lists a founder as living", () => {
    const living = new Set(LIVING_SLUGS);
    expect(FOUNDER_SLUGS.some((s) => living.has(s))).toBe(false);
  });
});

describe("computeLineageBoundary", () => {
  // root -> f (founder) -> succ -> grand ; root -> side (deceased side-branch) ; root -> alive (living leaf)
  const masters = [
    { id: "root", slug: "root" },
    { id: "f", slug: "f" },
    { id: "succ", slug: "succ" },
    { id: "grand", slug: "grand" },
    { id: "side", slug: "side" },
    { id: "alive", slug: "alive" },
  ];
  const edges = [
    { teacherId: "root", studentId: "f" },
    { teacherId: "f", studentId: "succ" },
    { teacherId: "succ", studentId: "grand" },
    { teacherId: "root", studentId: "side" },
    { teacherId: "root", studentId: "alive" },
  ];
  const opts = { founderSlugs: ["f"], livingSlugs: ["alive"], rootSlug: "root" };

  it("publishes the founder and its ancestors", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.publishedIds.has("root")).toBe(true);
    expect(r.publishedIds.has("f")).toBe(true);
  });
  it("archives strict descendants of the founder", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.archivedIds.has("succ")).toBe(true);
    expect(r.archivedIds.has("grand")).toBe(true);
  });
  it("keeps deceased side-branches that are not below a founder", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.publishedIds.has("side")).toBe(true);
  });
  it("archives living leaves via the living floor", () => {
    const r = computeLineageBoundary(masters, edges, opts);
    expect(r.archivedIds.has("alive")).toBe(true);
    expect(r.livingIds.has("alive")).toBe(true);
  });
  it("keeps a founder published even when it descends from another founder", () => {
    // f2 is a student of founder f, but is itself a founder -> stays published
    const m2 = [...masters, { id: "f2", slug: "f2" }];
    const e2 = [...edges, { teacherId: "f", studentId: "f2" }];
    const r = computeLineageBoundary(m2, e2, { ...opts, founderSlugs: ["f", "f2"] });
    expect(r.publishedIds.has("f2")).toBe(true);
  });
  it("flags a published node that is disconnected through archived-only edges", () => {
    // orphan is reachable only via living 'alive' -> so after pruning it is disconnected
    const m3 = [...masters, { id: "orphan", slug: "orphan" }];
    const e3 = [...edges, { teacherId: "alive", studentId: "orphan" }];
    const r = computeLineageBoundary(m3, e3, opts);
    // orphan is not living and not below founder f, so it is "published" but unreachable
    expect(r.publishedIds.has("orphan")).toBe(true);
    expect(r.disconnectedPublishedIds).toContain("orphan");
  });
});
