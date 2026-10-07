// A small editorial doorway into existing, cited dialogue records. Keep the
// order intentional; the same records appear on the relevant master pages.
export const FEATURED_ENCOUNTER_SLUGS = [
  "bodhidharma-emperor-wu",
  "huike-mind-not-at-peace",
  "mazu-this-mind-is-buddha",
  "nanquan-ordinary-mind",
  "zhaozhou-wash-your-bowl",
  "zhaozhou-oak-tree",
  "zhaozhou-go-drink-tea",
  "yunmen-dried-shit-stick",
] as const;

export const featuredEncounterOrder = new Map<string, number>(
  FEATURED_ENCOUNTER_SLUGS.map((slug, index) => [slug, index])
);
