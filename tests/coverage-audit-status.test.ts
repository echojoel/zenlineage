import { describe, expect, it } from "vitest";
import { assessCoverageAudit } from "../scripts/coverage-audit-status";

describe("coverage audit status", () => {
  it("returns OK when no blockers or warnings remain", () => {
    expect(
      assessCoverageAudit({
        uncitedMasters: 0,
        mastersWithoutSearchTokens: 0,
        missingBiographies: 0,
        uncitedBiographies: 0,
        missingTeachings: 0,
        uncitedTeachings: 0,
        missingImages: 0,
        uncitedImages: 0,
        orphanMasters: 0,
        suspiciousSlugs: 0,
        inactiveSources: 0,
        provenanceWarnings: 0,
        provenanceErrors: 0,
        hardcodedImageFallbacks: 0,
        mediaBackedImages: 0,
      })
    ).toEqual({
      status: "OK",
      reasons: [],
    });
  });

  it("returns WARN when major coverage gaps still exist", () => {
    const result = assessCoverageAudit({
      uncitedMasters: 0,
      mastersWithoutSearchTokens: 0,
      missingBiographies: 181,
      uncitedBiographies: 50,
      missingTeachings: 230,
      uncitedTeachings: 0,
      missingImages: 225,
      uncitedImages: 0,
      orphanMasters: 167,
      suspiciousSlugs: 0,
      inactiveSources: 1,
      provenanceWarnings: 0,
      provenanceErrors: 0,
      hardcodedImageFallbacks: 5,
      mediaBackedImages: 0,
    });

    expect(result.status).toBe("WARN");
    expect(result.reasons).toContain("181 masters are missing biographies");
    expect(result.reasons).toContain("50 biographies are missing item-level citations");
    expect(result.reasons).toContain("230 masters are missing teachings");
    expect(result.reasons).toContain("225 masters are missing images");
    expect(result.reasons).toContain("167 masters are not linked into the lineage graph");
    expect(result.reasons).toContain("1 registered sources have no citations yet");
    expect(result.reasons).toContain("image coverage still depends on hardcoded fallbacks");
  });

  it("returns ERROR when required core integrity checks fail", () => {
    const result = assessCoverageAudit({
      uncitedMasters: 2,
      mastersWithoutSearchTokens: 1,
      missingBiographies: 0,
      uncitedBiographies: 0,
      missingTeachings: 0,
      uncitedTeachings: 0,
      missingImages: 0,
      uncitedImages: 0,
      orphanMasters: 0,
      suspiciousSlugs: 0,
      inactiveSources: 0,
      provenanceWarnings: 0,
      provenanceErrors: 1,
      hardcodedImageFallbacks: 0,
      mediaBackedImages: 0,
    });

    expect(result.status).toBe("ERROR");
    expect(result.reasons).toContain("2 masters are missing citations");
    expect(result.reasons).toContain("1 masters are missing search tokens");
    expect(result.reasons).toContain("1 raw datasets failed provenance checks");
  });
});
