import { describe, expect, it } from "vitest";
import { looksWadeGiles } from "@/lib/romanization";

describe("looksWadeGiles", () => {
  it("recognizes apostrophes and hyphenated Wade-Giles forms", () => {
    expect(looksWadeGiles("P'u-ti Ta-mo")).toBe(true);
    expect(looksWadeGiles("Lin-chi I-hsüan")).toBe(true);
  });

  it("does not flag plain pinyin as Wade-Giles", () => {
    expect(looksWadeGiles("Bodhidharma")).toBe(false);
    expect(looksWadeGiles("Linji Yixuan")).toBe(false);
  });
});
