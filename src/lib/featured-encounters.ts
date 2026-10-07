// A small editorial doorway into existing, cited dialogue records. Keep the
// order intentional; the same records appear on the relevant master pages.
export const FEATURED_ENCOUNTER_SLUGS = [
  "bodhidharma-emperor-wu",
  "huike-mind-not-at-peace",
  "huineng-think-neither-good-nor-evil",
  "nanyue-polishing-tile",
  "mazu-this-mind-is-buddha",
  "mazu-sun-face-buddha",
  "mazu-not-mind-not-buddha",
  "mazu-yangtze-river",
  "baizhang-water-bottle",
  "nanquan-ordinary-mind",
  "zhaozhou-wash-your-bowl",
  "zhaozhou-oak-tree",
  "zhaozhou-go-drink-tea",
  "zhaozhou-stone-bridge",
  "zhaozhou-dog-buddha-nature",
  "yaoshan-thinking-of-not-thinking",
  "dongshan-three-pounds-of-flax",
  "luohan-not-knowing-most-intimate",
  "layman-pang-difficult-easy",
  "moshan-neither-male-nor-female",
  "deshan-nothing-within-nothing-without",
  "yunmen-dried-shit-stick",
  "yunmen-body-exposed-golden-wind",
  "ruiyan-are-you-awake",
  "tianlong-one-finger",
  "liu-tiemo-dharma-combat",
  "heshan-beating-the-drum",
  "xianglin-bodhidharma-coming-west",
] as const;

export const featuredEncounterOrder = new Map<string, number>(
  FEATURED_ENCOUNTER_SLUGS.map((slug, index) => [slug, index])
);
