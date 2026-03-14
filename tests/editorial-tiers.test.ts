import { describe, expect, it } from "vitest";
import {
  getTier1Entry,
  getTier1Slugs,
  isTier1Master,
  TIER_1_ENTRIES,
} from "../src/lib/editorial-tiers";

describe("editorial tiers", () => {
  it("defines a stable Tier 1 list of 50 masters", () => {
    expect(TIER_1_ENTRIES).toHaveLength(50);
    expect(new Set(TIER_1_ENTRIES.map((entry) => entry.slug)).size).toBe(50);
  });

  it("exposes Tier 1 membership helpers", () => {
    expect(isTier1Master("dogen")).toBe(true);
    expect(isTier1Master("unknown-master")).toBe(false);
    expect(getTier1Entry("linji-yixuan")?.reason).toBe("founder");
  });

  it("returns the Tier 1 slugs in declared order", () => {
    const slugs = getTier1Slugs();

    expect(slugs[0]).toBe("shakyamuni-buddha");
    expect(slugs.at(-1)).toBe("yamada-koun");
  });
});
