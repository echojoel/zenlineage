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
      })
    ).toBe("Dates uncertain");

    expect(
      formatLifeRange({
        birthYear: 1200,
        birthPrecision: null,
        deathYear: 1253,
        deathPrecision: null,
      })
    ).toBe("1200 – 1253");
  });
});

describe("formatDateWithPrecision – BCE support", () => {
  it("formats negative year as BCE", () => {
    expect(formatDateWithPrecision(-563, "exact")).toBe("563 BCE");
  });

  it("formats negative circa year as BCE", () => {
    expect(formatDateWithPrecision(-563, "circa")).toBe("c. 563 BCE");
  });

  it("formats negative century year as BCE century", () => {
    expect(formatDateWithPrecision(-250, "century")).toBe("3rd c. BCE");
  });

  it("formats positive circa year without suffix", () => {
    expect(formatDateWithPrecision(150, "circa")).toBe("c. 150");
  });

  it("formats positive exact year without suffix", () => {
    expect(formatDateWithPrecision(536, "exact")).toBe("536");
  });

  it("formats positive century year", () => {
    expect(formatDateWithPrecision(350, "century")).toBe("4th c.");
  });

  it("returns unknown for null year", () => {
    expect(formatDateWithPrecision(null, "exact")).toBe("Unknown");
  });

  it("returns custom unknown string", () => {
    expect(formatDateWithPrecision(null, "exact", { unknown: "N/A" })).toBe("N/A");
  });
});

describe("formatLifeRange – BCE support", () => {
  it("formats BCE life range", () => {
    expect(formatLifeRange({
      birthYear: -563,
      birthPrecision: "circa",
      deathYear: -483,
      deathPrecision: "circa",
    })).toBe("c. 563 BCE – c. 483 BCE");
  });

  it("formats CE life range", () => {
    expect(formatLifeRange({
      birthYear: 150,
      birthPrecision: "circa",
      deathYear: 250,
      deathPrecision: "circa",
    })).toBe("c. 150 – c. 250");
  });

  it("formats mixed BCE/CE range", () => {
    expect(formatLifeRange({
      birthYear: -50,
      birthPrecision: "circa",
      deathYear: 30,
      deathPrecision: "circa",
    })).toBe("c. 50 BCE – c. 30");
  });

  it("returns Dates uncertain for all null", () => {
    expect(formatLifeRange({
      birthYear: null,
      birthPrecision: null,
      deathYear: null,
      deathPrecision: null,
    })).toBe("Dates uncertain");
  });

  it("formats partial dates", () => {
    expect(formatLifeRange({
      birthYear: null,
      birthPrecision: null,
      deathYear: 536,
      deathPrecision: "exact",
    })).toBe("Unknown – 536");
  });
});
