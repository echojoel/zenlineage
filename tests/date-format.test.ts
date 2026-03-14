import { describe, expect, it } from "vitest";
import { formatDateWithPrecision, formatLifeRange } from "@/lib/date-format";

describe("date formatting helpers", () => {
  it("formats circa and century dates consistently", () => {
    expect(formatDateWithPrecision(1200, "circa")).toBe("c. 1200");
    expect(formatDateWithPrecision(801, "century")).toBe("9th c.");
  });

  it("supports caller-defined unknown fallbacks", () => {
    expect(formatDateWithPrecision(null, null)).toBe("Unknown");
    expect(formatDateWithPrecision(null, null, { unknown: "?" })).toBe("?");
    expect(formatDateWithPrecision(null, null, { unknown: null })).toBeNull();
  });

  it("formats life ranges and collapses fully unknown dates", () => {
    expect(
      formatLifeRange({
        birthYear: null,
        birthPrecision: null,
        deathYear: null,
        deathPrecision: null,
      }),
    ).toBe("Dates uncertain");

    expect(
      formatLifeRange({
        birthYear: 1200,
        birthPrecision: null,
        deathYear: 1253,
        deathPrecision: null,
      }),
    ).toBe("1200 – 1253");
  });
});
