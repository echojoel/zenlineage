import { describe, expect, it } from "vitest";
import { buildResolvedMasterSlugMap } from "../scripts/master-slugs";

describe("buildResolvedMasterSlugMap", () => {
  it("preserves unique slugs as-is", () => {
    const resolved = buildResolvedMasterSlugMap([
      { id: "one", slug: "bodhidharma" },
      { id: "two", slug: "huineng" },
    ]);

    expect(resolved.get("one")).toBe("bodhidharma");
    expect(resolved.get("two")).toBe("huineng");
  });

  it("disambiguates duplicate slugs deterministically", () => {
    const resolved = buildResolvedMasterSlugMap([
      { id: "one", slug: "ch" },
      { id: "two", slug: "ch" },
      { id: "three", slug: "ch" },
    ]);

    expect(resolved.get("one")).toBe("ch");
    expect(resolved.get("two")).toBe("ch-2");
    expect(resolved.get("three")).toBe("ch-3");
  });
});
