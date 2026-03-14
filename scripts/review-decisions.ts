function normalizeReviewName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decisionKey(a: string, b: string): string {
  return [normalizeReviewName(a), normalizeReviewName(b)].sort().join("::");
}

const REVIEWED_NON_MERGE_KEYS = new Set<string>([decisionKey("Daowu Yuanzhi", "Tianhuang Daowu")]);

export function isReviewedNonMerge(a: string, b: string): boolean {
  return REVIEWED_NON_MERGE_KEYS.has(decisionKey(a, b));
}
