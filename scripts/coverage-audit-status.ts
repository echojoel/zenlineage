export interface CoverageAuditSignals {
  uncitedMasters: number;
  mastersWithoutSearchTokens: number;
  missingBiographies: number;
  uncitedBiographies: number;
  missingTeachings: number;
  uncitedTeachings: number;
  missingImages: number;
  uncitedImages: number;
  orphanMasters: number;
  suspiciousSlugs: number;
  inactiveSources: number;
  provenanceWarnings: number;
  provenanceErrors: number;
  hardcodedImageFallbacks: number;
  mediaBackedImages: number;
}

export interface CoverageAuditAssessment {
  status: "OK" | "WARN" | "ERROR";
  reasons: string[];
}

export function assessCoverageAudit(signals: CoverageAuditSignals): CoverageAuditAssessment {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (signals.uncitedMasters > 0) {
    errors.push(`${signals.uncitedMasters} masters are missing citations`);
  }

  if (signals.mastersWithoutSearchTokens > 0) {
    errors.push(`${signals.mastersWithoutSearchTokens} masters are missing search tokens`);
  }

  if (signals.provenanceErrors > 0) {
    errors.push(`${signals.provenanceErrors} raw datasets failed provenance checks`);
  }

  if (signals.missingBiographies > 0) {
    warnings.push(`${signals.missingBiographies} masters are missing biographies`);
  }

  if (signals.uncitedBiographies > 0) {
    warnings.push(`${signals.uncitedBiographies} biographies are missing item-level citations`);
  }

  if (signals.missingTeachings > 0) {
    warnings.push(`${signals.missingTeachings} masters are missing teachings`);
  }

  if (signals.uncitedTeachings > 0) {
    warnings.push(`${signals.uncitedTeachings} teachings are missing item-level citations`);
  }

  if (signals.missingImages > 0) {
    warnings.push(`${signals.missingImages} masters are missing images`);
  }

  if (signals.uncitedImages > 0) {
    warnings.push(`${signals.uncitedImages} media assets are missing item-level citations`);
  }

  if (signals.orphanMasters > 0) {
    warnings.push(`${signals.orphanMasters} masters are not linked into the lineage graph`);
  }

  if (signals.suspiciousSlugs > 0) {
    warnings.push(`${signals.suspiciousSlugs} suspicious slugs need review`);
  }

  if (signals.inactiveSources > 0) {
    warnings.push(`${signals.inactiveSources} registered sources have no citations yet`);
  }

  if (signals.provenanceWarnings > 0) {
    warnings.push(`${signals.provenanceWarnings} raw datasets have provenance warnings`);
  }

  if (
    signals.hardcodedImageFallbacks > 0 &&
    signals.mediaBackedImages < signals.hardcodedImageFallbacks
  ) {
    warnings.push("image coverage still depends on hardcoded fallbacks");
  }

  if (errors.length > 0) {
    return {
      status: "ERROR",
      reasons: [...errors, ...warnings],
    };
  }

  if (warnings.length > 0) {
    return {
      status: "WARN",
      reasons: warnings,
    };
  }

  return {
    status: "OK",
    reasons: [],
  };
}
