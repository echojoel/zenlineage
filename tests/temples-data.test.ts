import { describe, expect, it } from "vitest";
import { SEED_TEMPLES } from "../scripts/data/seed-temples";

/**
 * Static-data invariants for the /practice map. These run directly against
 * the seed source (SEED_TEMPLES) so they catch problems at the point where
 * data is authored, before seeding the DB or regenerating temples.json.
 *
 * Tests that require DB state are deliberately skipped here — the seeder
 * itself throws on unknown school slugs, so that path is covered at runtime.
 */

const SCHOOL_SLUG_ALLOWLIST = new Set([
  "early-chan",
  "indian-patriarchs",
  "qingyuan",
  "nanyue",
  "yangqi",
  "rinzai",
  "linji",
  "caodong",
  "soto",
  "obaku",
  "yunmen",
  "fayan",
  "huayan",
  "guiyang",
  "chan",
  "lam-te",
  "truc-lam",
  "plum-village",
  "thien",
  "jogye",
  "kwan-um",
  "taego-order",
  "seon",
  "sanbo-zen",
  "white-plum-asanga",
]);

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("SEED_TEMPLES invariants", () => {
  it("has at least 40 entries (sanity floor)", () => {
    expect(SEED_TEMPLES.length).toBeGreaterThanOrEqual(40);
  });

  it("every slug is unique", () => {
    const slugs = SEED_TEMPLES.map((t) => t.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    expect(dupes, `duplicate slugs: ${dupes.join(", ")}`).toEqual([]);
  });

  it("every slug is kebab-case and non-empty", () => {
    for (const t of SEED_TEMPLES) {
      expect(t.slug, `bad slug: "${t.slug}"`).toMatch(SLUG_RE);
    }
  });

  it("every temple has at least one English name", () => {
    for (const t of SEED_TEMPLES) {
      const en = t.names.find((n) => n.locale === "en");
      expect(en, `${t.slug} is missing an English name`).toBeDefined();
      expect(en?.value.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("every lat/lng is a finite number in valid WGS84 range", () => {
    for (const t of SEED_TEMPLES) {
      expect(Number.isFinite(t.lat), `${t.slug} lat not finite`).toBe(true);
      expect(Number.isFinite(t.lng), `${t.slug} lng not finite`).toBe(true);
      expect(t.lat, `${t.slug} lat out of range`).toBeGreaterThanOrEqual(-90);
      expect(t.lat, `${t.slug} lat out of range`).toBeLessThanOrEqual(90);
      expect(t.lng, `${t.slug} lng out of range`).toBeGreaterThanOrEqual(-180);
      expect(t.lng, `${t.slug} lng out of range`).toBeLessThanOrEqual(180);
    }
  });

  it("every school slug is on the allowlist", () => {
    const unknown: string[] = [];
    for (const t of SEED_TEMPLES) {
      if (!SCHOOL_SLUG_ALLOWLIST.has(t.schoolSlug)) {
        unknown.push(`${t.slug} → ${t.schoolSlug}`);
      }
    }
    expect(unknown, `unknown schoolSlug refs: ${unknown.join("; ")}`).toEqual([]);
  });

  it("every foundedPrecision is exact | circa | century | null", () => {
    const allowed = new Set(["exact", "circa", "century", null]);
    for (const t of SEED_TEMPLES) {
      expect(allowed.has(t.foundedPrecision), `${t.slug} bad precision ${t.foundedPrecision}`).toBe(true);
    }
  });

  it("every foundedYear is either null or a plausible CE year", () => {
    for (const t of SEED_TEMPLES) {
      if (t.foundedYear === null) continue;
      expect(Number.isInteger(t.foundedYear), `${t.slug} foundedYear not int`).toBe(true);
      // Shaolin (495 CE) is the earliest in the set; clamp well below that.
      expect(t.foundedYear).toBeGreaterThan(0);
      expect(t.foundedYear).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });

  it("every temple has a non-empty URL", () => {
    // The /practice popup is meant to always give practitioners a next
    // step; a missing URL would leave a marker as a dead-end.
    const missing = SEED_TEMPLES.filter((t) => !t.url || t.url.trim().length === 0).map((t) => t.slug);
    expect(missing, `temples missing url: ${missing.join(", ")}`).toEqual([]);
  });

  it("every URL parses as http(s)", () => {
    const bad: string[] = [];
    for (const t of SEED_TEMPLES) {
      if (!t.url) continue;
      try {
        const parsed = new URL(t.url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          bad.push(`${t.slug} → ${t.url} (bad protocol ${parsed.protocol})`);
        }
      } catch {
        bad.push(`${t.slug} → ${t.url} (unparseable)`);
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("every temple has a source id and excerpt", () => {
    for (const t of SEED_TEMPLES) {
      expect(t.sourceId, `${t.slug} missing sourceId`).toBeTruthy();
      expect(t.sourceExcerpt?.trim().length ?? 0, `${t.slug} empty excerpt`).toBeGreaterThan(20);
    }
  });

  it("no near-duplicate coordinates across different slugs (> 50m apart)", () => {
    // Catches copy-paste mistakes where a new entry accidentally reuses
    // another temple's lat/lng. 50m ≈ 0.00045° at the equator.
    const seen = new Map<string, string>();
    const collisions: string[] = [];
    for (const t of SEED_TEMPLES) {
      const key = `${t.lat.toFixed(3)},${t.lng.toFixed(3)}`;
      const prev = seen.get(key);
      if (prev && prev !== t.slug) collisions.push(`${prev} ≈ ${t.slug} at ${key}`);
      seen.set(key, t.slug);
    }
    expect(collisions, collisions.join("; ")).toEqual([]);
  });
});
