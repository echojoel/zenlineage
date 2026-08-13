import { describe, expect, it } from "vitest";
import { SEED_TEMPLES, TEMPLE_SOURCES } from "../scripts/data/seed-temples";

/**
 * Static-data invariants for the /practice map. These run directly against
 * the seed source (SEED_TEMPLES) so they catch problems at the point where
 * data is authored, before seeding the DB or regenerating temples.json.
 *
 * Tests that require DB state are deliberately skipped here — the seeder
 * itself throws on unknown school slugs, so that path is covered at runtime.
 */

// Must match the `slug` column of the `schools` table — the seeder throws
// on anything it cannot resolve. The three ancestral-line schools are
// suffixed `-line` there; this list previously carried them unsuffixed, so
// it was allowing slugs that do not exist and rejecting the ones that do.
const SCHOOL_SLUG_ALLOWLIST = new Set([
  "early-chan",
  "indian-patriarchs",
  "qingyuan-line",
  "nanyue-line",
  "yangqi-line",
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
  // Independent / unaffiliated centres (e.g. Ordinary Mind School) — a
  // real `other` school row exists in the schools table.
  "other",
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

  it("every temple gives the popup a link to offer", () => {
    // The invariant practitioners actually depend on is that no marker is a
    // dead end — CLAUDE.md states it as "the /practice popup always offers a
    // link, either to the temple's own site or to the directory that lists
    // it". `url` carries the first, `sourceId` the second, and
    // renderPopupHTML falls back from one to the other.
    //
    // So `url` may be absent: TempleSeed documents it as "omit when no
    // canonical site is known", and a good number of sanghas — village
    // temples in Jiangxi, AZI groups in Maracaibo — are listed only through
    // a directory or a contact email. Requiring a URL for those would push
    // whoever adds them into inventing one, which is how a temple ends up
    // linked to somebody else's website.
    // Checking the source's `url`, not merely that a sourceId is present:
    // renderPopupHTML links to sources.url, so a temple citing a source
    // registered without one would still render a marker with no link.
    const sourceUrls = new Map(TEMPLE_SOURCES.map((s) => [s.id, s.url]));
    const deadEnds = SEED_TEMPLES.filter((t) => {
      if (t.url && t.url.trim().length > 0) return false;
      const fallback = sourceUrls.get(t.sourceId);
      return !fallback || fallback.trim().length === 0;
    }).map((t) => `${t.slug} (source: ${t.sourceId})`);
    expect(deadEnds, `temples with no link at all: ${deadEnds.join(", ")}`).toEqual([]);
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

  it("no coordinate collisions across different regions", () => {
    // Catches copy-paste mistakes where a new entry accidentally reuses
    // another temple's lat/lng. Directory-imported city groups are
    // deliberately geocoded to the city centroid, so collisions within the
    // same region+country are expected precision, not errors — only
    // cross-region collisions (same coords, supposedly different place)
    // are flagged.
    //
    // Deliberately NOT exempting everything marked `geoPrecision: "city"`.
    // That would make this test vacuous: reconcileSharedPins() in the
    // builder relabels any colliding entry as "city", so the mechanism that
    // produces a collision would also excuse it, and two distinct sanghas
    // could ship as one pin with the suite still green.
    //
    // Only the handful of national networks that have no single site are
    // exempt — they are deliberately pinned to a capital that also holds a
    // local sangha filed under a different administrative region.
    const NATIONAL_NETWORK_PINS = new Set([
      "plum-village-swiss-inter-sangha", // pinned to Bern; NL/CH-wide network
      "community-of-mindfulness-in-israel", // pinned to Tel Aviv; nationwide
      "zen-peacemakers-lage-landen", // pinned to the NL centroid
    ]);
    // A typo here would silently exempt nothing and quietly re-open the
    // hole this list exists to keep narrow.
    const known = new Set(SEED_TEMPLES.map((t) => t.slug));
    for (const slug of NATIONAL_NETWORK_PINS) {
      expect(known.has(slug), `stale exemption slug: ${slug}`).toBe(true);
    }
    const seen = new Map<string, { slug: string; place: string }>();
    const collisions: string[] = [];
    for (const t of SEED_TEMPLES) {
      if (NATIONAL_NETWORK_PINS.has(t.slug)) continue;
      const key = `${t.lat.toFixed(3)},${t.lng.toFixed(3)}`;
      const place = `${t.region ?? ""}|${t.country}`;
      const prev = seen.get(key);
      if (prev && prev.slug !== t.slug && prev.place !== place) {
        collisions.push(`${prev.slug} ≈ ${t.slug} at ${key}`);
      }
      seen.set(key, { slug: t.slug, place });
    }
    expect(collisions, collisions.join("; ")).toEqual([]);
  });
});
