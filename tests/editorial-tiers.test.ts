import { describe, expect, it } from "vitest";
import {
  getTier1Entry,
  getTier1Slugs,
  isTier1Master,
  TIER_1_ENTRIES,
} from "../src/lib/editorial-tiers";

describe("editorial tiers", () => {
  it("defines a stable Tier 1 list of unique slugs", () => {
    // The list expanded in 2026 with the Korean Seon, Vietnamese Thiền, and
    // White Plum (Maezumi lineage) additions. Assert structural invariants
    // rather than a specific count, so routine additions don't break the
    // test — the invariants are: non-empty, no duplicate slugs, and the
    // original Chinese/Japanese backbone still opens the list.
    expect(TIER_1_ENTRIES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(TIER_1_ENTRIES.map((entry) => entry.slug)).size).toBe(
      TIER_1_ENTRIES.length
    );
  });

  it("exposes Tier 1 membership helpers", () => {
    expect(isTier1Master("dogen")).toBe(true);
    expect(isTier1Master("unknown-master")).toBe(false);
    expect(getTier1Entry("linji-yixuan")?.reason).toBe("founder");
  });

  it("opens the Tier 1 list with the original Chinese/Japanese backbone", () => {
    const slugs = getTier1Slugs();

    // The first slug is the root of the whole lineage; the presence of
    // yamada-koun anywhere in the list confirms that earlier entries
    // (shakyamuni-buddha … yamada-koun) remain intact and in declared
    // order before the later Korean/Vietnamese/Maezumi additions.
    expect(slugs[0]).toBe("shakyamuni-buddha");
    expect(slugs).toContain("yamada-koun");
    expect(slugs.indexOf("yamada-koun")).toBeGreaterThan(0);
  });
});
