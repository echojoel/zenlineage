export type TierReason =
  | "patriarch"
  | "founder"
  | "major_lineage_bridge"
  | "historically_central_teacher"
  | "modern_transmitter";

export interface EditorialTierEntry {
  slug: string;
  tier: "tier1";
  reason: TierReason;
}

export const TIER_1_ENTRIES: EditorialTierEntry[] = [
  { slug: "shakyamuni-buddha", tier: "tier1", reason: "founder" },
  { slug: "mahakashyapa", tier: "tier1", reason: "patriarch" },
  { slug: "ananda", tier: "tier1", reason: "patriarch" },
  { slug: "shanakavasa", tier: "tier1", reason: "patriarch" },
  { slug: "upagupta", tier: "tier1", reason: "patriarch" },
  { slug: "dhritaka", tier: "tier1", reason: "patriarch" },
  { slug: "michaka", tier: "tier1", reason: "patriarch" },
  { slug: "vasumitra", tier: "tier1", reason: "patriarch" },
  { slug: "buddhanandi", tier: "tier1", reason: "patriarch" },
  { slug: "buddhamitra", tier: "tier1", reason: "patriarch" },
  { slug: "parshva", tier: "tier1", reason: "patriarch" },
  { slug: "punyayashas", tier: "tier1", reason: "patriarch" },
  { slug: "ashvaghosha", tier: "tier1", reason: "patriarch" },
  { slug: "kapimala", tier: "tier1", reason: "patriarch" },
  { slug: "nagarjuna", tier: "tier1", reason: "patriarch" },
  { slug: "aryadeva", tier: "tier1", reason: "patriarch" },
  { slug: "rahulata", tier: "tier1", reason: "patriarch" },
  { slug: "sanghanandi", tier: "tier1", reason: "patriarch" },
  { slug: "gayashata", tier: "tier1", reason: "patriarch" },
  { slug: "kumarata", tier: "tier1", reason: "patriarch" },
  { slug: "jayata", tier: "tier1", reason: "patriarch" },
  { slug: "vasubandhu", tier: "tier1", reason: "patriarch" },
  { slug: "manorhita", tier: "tier1", reason: "patriarch" },
  { slug: "haklena", tier: "tier1", reason: "patriarch" },
  { slug: "simha", tier: "tier1", reason: "patriarch" },
  { slug: "vasasita", tier: "tier1", reason: "patriarch" },
  { slug: "punyamitra", tier: "tier1", reason: "patriarch" },
  { slug: "prajnatara", tier: "tier1", reason: "patriarch" },
  { slug: "puti-damo", tier: "tier1", reason: "patriarch" },
  { slug: "dazu-huike", tier: "tier1", reason: "patriarch" },
  { slug: "jianzhi-sengcan", tier: "tier1", reason: "patriarch" },
  { slug: "dayi-daoxin", tier: "tier1", reason: "patriarch" },
  { slug: "daman-hongren", tier: "tier1", reason: "patriarch" },
  { slug: "dajian-huineng", tier: "tier1", reason: "patriarch" },
  { slug: "shitou-xiqian", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "mazu-daoyi", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "baizhang-huaihai", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "nanquan-puyuan", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "huangbo-xiyun", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "linji-yixuan", tier: "tier1", reason: "founder" },
  { slug: "dongshan-liangjie", tier: "tier1", reason: "founder" },
  { slug: "yunmen-wenyan", tier: "tier1", reason: "founder" },
  { slug: "zhaozhou-congshen", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "deshan-xuanjian", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "xuefeng-yicun", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "yunyan-tansheng", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "dogen", tier: "tier1", reason: "founder" },
  { slug: "keizan-jokin", tier: "tier1", reason: "founder" },
  { slug: "hakuin-ekaku", tier: "tier1", reason: "modern_transmitter" },
  { slug: "yamada-koun", tier: "tier1", reason: "modern_transmitter" },
];

const TIER_1_ENTRY_BY_SLUG = new Map(TIER_1_ENTRIES.map((entry) => [entry.slug, entry]));

export function getTier1Entry(slug: string): EditorialTierEntry | null {
  return TIER_1_ENTRY_BY_SLUG.get(slug) ?? null;
}

export function isTier1Master(slug: string): boolean {
  return TIER_1_ENTRY_BY_SLUG.has(slug);
}

export function getTier1Slugs(): string[] {
  return TIER_1_ENTRIES.map((entry) => entry.slug);
}
