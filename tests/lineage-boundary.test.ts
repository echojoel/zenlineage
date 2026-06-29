import { describe, expect, it } from "vitest";
import { masters } from "../src/db/schema";

describe("masters schema: lineage-boundary columns", () => {
  it("declares living and published columns", () => {
    expect(masters.living).toBeDefined();
    expect(masters.published).toBeDefined();
    expect(masters.living.name).toBe("living");
    expect(masters.published.name).toBe("published");
  });
});
