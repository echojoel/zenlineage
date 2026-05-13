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

  // Korean Seon founders and transmitters
  { slug: "jinul", tier: "tier1", reason: "founder" },
  { slug: "chingak-hyesim", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "taego-bou", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "seosan-hyujeong", tier: "tier1", reason: "historically_central_teacher" },
  { slug: "gyeongheo-seongu", tier: "tier1", reason: "modern_transmitter" },
  { slug: "seongcheol", tier: "tier1", reason: "modern_transmitter" },
  { slug: "seung-sahn", tier: "tier1", reason: "modern_transmitter" },

  // Vietnamese Thiền founders and transmitters
  { slug: "vinitaruci", tier: "tier1", reason: "founder" },
  { slug: "vo-ngon-thong", tier: "tier1", reason: "founder" },
  { slug: "tran-nhan-tong", tier: "tier1", reason: "founder" },
  { slug: "lieu-quan", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "thich-nhat-hanh", tier: "tier1", reason: "modern_transmitter" },

  // Maezumi lineage — teachers and the most historically consequential
  // White Plum dharma heirs.
  { slug: "baian-hakujun-kuroda", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "osaka-koryu", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "bernie-tetsugen-glassman", tier: "tier1", reason: "modern_transmitter" },
  { slug: "charlotte-joko-beck", tier: "tier1", reason: "modern_transmitter" },
  { slug: "john-daido-loori", tier: "tier1", reason: "modern_transmitter" },
  { slug: "dennis-genpo-merzel", tier: "tier1", reason: "modern_transmitter" },
  { slug: "jan-chozen-bays", tier: "tier1", reason: "modern_transmitter" },
  { slug: "gerry-shishin-wick", tier: "tier1", reason: "modern_transmitter" },

  // Deshimaru lineage — founder + Sōtō / Sawaki parents + first generation
  // (three Eihei-ji-confirmed shihō recipients in 1984) + second generation
  // (every formally-transmitted European, American, and Latin-American
  // successor in the AZI / Kosen Sangha / Mokushō Zen House / Kanshōji /
  // Ryūmon-ji / Coupey / Livingston / Bovay neighbourhoods).
  { slug: "kodo-sawaki", tier: "tier1", reason: "major_lineage_bridge" },
  { slug: "taisen-deshimaru", tier: "tier1", reason: "founder" },
  { slug: "kishigami-kojun", tier: "tier1", reason: "modern_transmitter" },
  { slug: "dosho-saikawa", tier: "tier1", reason: "modern_transmitter" },
  // — Three 1984 Eihei-ji shihō recipients
  { slug: "stephane-kosen-thibaut", tier: "tier1", reason: "modern_transmitter" },
  { slug: "etienne-mokusho-zeisler", tier: "tier1", reason: "modern_transmitter" },
  { slug: "roland-rech", tier: "tier1", reason: "modern_transmitter" },
  // — Other senior Deshimaru disciples (original 7 in deshimaru-lineage.ts)
  { slug: "philippe-reiryu-coupey", tier: "tier1", reason: "modern_transmitter" },
  { slug: "olivier-reigen-wang-genh", tier: "tier1", reason: "modern_transmitter" },
  { slug: "michel-reiku-bovay", tier: "tier1", reason: "modern_transmitter" },
  { slug: "evelyne-eko-de-smedt", tier: "tier1", reason: "modern_transmitter" },
  { slug: "pierre-reigen-crepon", tier: "tier1", reason: "modern_transmitter" },
  { slug: "jean-pierre-genshu-faure", tier: "tier1", reason: "modern_transmitter" },
  { slug: "vincent-keisen-vuillemin", tier: "tier1", reason: "modern_transmitter" },
  // — Triet's heirs and other senior disciples already in seed-biographies
  { slug: "raphael-doko-triet", tier: "tier1", reason: "modern_transmitter" },
  { slug: "yves-shoshin-crettaz", tier: "tier1", reason: "modern_transmitter" },
  // — Branch A: Kōsen Sangha + Triet successors
  { slug: "barbara-kosen-richaudeau", tier: "tier1", reason: "modern_transmitter" },
  { slug: "andre-ryujo-meissner", tier: "tier1", reason: "modern_transmitter" },
  { slug: "yvon-myoken-bec", tier: "tier1", reason: "modern_transmitter" },
  { slug: "christophe-ryurin-desmur", tier: "tier1", reason: "modern_transmitter" },
  { slug: "pierre-soko-leroux", tier: "tier1", reason: "modern_transmitter" },
  { slug: "hugues-yusen-naas", tier: "tier1", reason: "modern_transmitter" },
  { slug: "loic-kosho-vuillemin", tier: "tier1", reason: "modern_transmitter" },
  { slug: "ingrid-gyuji-igelnick", tier: "tier1", reason: "modern_transmitter" },
  { slug: "francoise-jomon-julien", tier: "tier1", reason: "modern_transmitter" },
  { slug: "paula-reikiku-femenias", tier: "tier1", reason: "modern_transmitter" },
  { slug: "ariadna-dosei-labbate", tier: "tier1", reason: "modern_transmitter" },
  { slug: "toshiro-taigen-yamauchi", tier: "tier1", reason: "modern_transmitter" },
  { slug: "begona-kaido-agiriano", tier: "tier1", reason: "modern_transmitter" },
  { slug: "alfonso-sengen-fernandez", tier: "tier1", reason: "modern_transmitter" },
  // — Branch B: Yuno Rech mainline (2010–2024)
  { slug: "patrick-pargnien", tier: "tier1", reason: "modern_transmitter" },
  { slug: "heinz-juergen-metzger", tier: "tier1", reason: "modern_transmitter" },
  { slug: "sengyo-van-leuven", tier: "tier1", reason: "modern_transmitter" },
  { slug: "emanuela-dosan-losi", tier: "tier1", reason: "modern_transmitter" },
  { slug: "pascal-olivier-reynaud", tier: "tier1", reason: "modern_transmitter" },
  { slug: "michel-jigen-fabra", tier: "tier1", reason: "modern_transmitter" },
  { slug: "konrad-kosan-maquestieau", tier: "tier1", reason: "modern_transmitter" },
  { slug: "lluis-nansen-salas", tier: "tier1", reason: "modern_transmitter" },
  { slug: "claude-emon-cannizzo", tier: "tier1", reason: "modern_transmitter" },
  { slug: "antonio-taishin-arana", tier: "tier1", reason: "modern_transmitter" },
  { slug: "alonso-taikai-ufano", tier: "tier1", reason: "modern_transmitter" },
  { slug: "antoine-charlot", tier: "tier1", reason: "modern_transmitter" },
  { slug: "marc-chigen-esteban", tier: "tier1", reason: "modern_transmitter" },
  { slug: "eveline-kogen-pascual", tier: "tier1", reason: "modern_transmitter" },
  { slug: "beppe-mokuza-signoritti", tier: "tier1", reason: "modern_transmitter" },
  { slug: "huguette-moku-myo-sirejol", tier: "tier1", reason: "modern_transmitter" },
  { slug: "jean-pierre-reiseki-romain", tier: "tier1", reason: "modern_transmitter" },
  { slug: "sergio-gyoho-gurevich", tier: "tier1", reason: "modern_transmitter" },
  { slug: "luc-sojo-bordes", tier: "tier1", reason: "modern_transmitter" },
  { slug: "silvia-hoju-leyer", tier: "tier1", reason: "modern_transmitter" },
  { slug: "claus-heiki-bockbreder", tier: "tier1", reason: "modern_transmitter" },
  // — Branch C: Mokushō Zen House (Zeisler-line successors via Bec)
  { slug: "maria-teresa-shogetsu-avila", tier: "tier1", reason: "modern_transmitter" },
  { slug: "ionut-koshin-nedelcu", tier: "tier1", reason: "modern_transmitter" },
  { slug: "laszlo-toryu-kalman", tier: "tier1", reason: "modern_transmitter" },
  // — Branch D: Sangha Sans Demeure / Coupey
  { slug: "patrick-ferrieux", tier: "tier1", reason: "modern_transmitter" },
  // — Branch E: Kōsan Ryūmon-ji (Wang-Genh)
  { slug: "konrad-tenkan-beck", tier: "tier1", reason: "modern_transmitter" },
  // — Branch F: American line (NOZT) + Bovay-line successor
  { slug: "robert-livingston", tier: "tier1", reason: "modern_transmitter" },
  { slug: "richard-reishin-collins", tier: "tier1", reason: "modern_transmitter" },
  { slug: "tony-bland", tier: "tier1", reason: "modern_transmitter" },
  { slug: "monika-leibundgut", tier: "tier1", reason: "modern_transmitter" },
  // — Daitoku-ji / Myōshin-ji Rinzai bridge to the West (Morinaga line)
  { slug: "morinaga-soko", tier: "tier1", reason: "modern_transmitter" },
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
