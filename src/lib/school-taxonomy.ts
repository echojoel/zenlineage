import { stripDiacritics } from "./search-tokens";

export interface SchoolDefinition {
  slug: string;
  name: string;
  tradition: string;
  parentSlug?: string;
  aliases: string[];
  summary: string;
}

const SCHOOL_DEFINITIONS: SchoolDefinition[] = [
  {
    slug: "indian-patriarchs",
    name: "Indian Patriarchs",
    tradition: "Zen",
    aliases: [
      "indian patriarchs",
      "indian patriarch lineage",
      "indian lineage",
      "indian patriarchs lineage",
    ],
    summary:
      "The Indian patriarchal lineage leading from Shakyamuni through Prajnatara before the transmission to China.",
  },
  {
    slug: "chan",
    name: "Chan",
    tradition: "Chan",
    aliases: ["chan", "zen"],
    summary: "The broader Chinese Chan tradition from which later Zen schools developed.",
  },
  {
    slug: "early-chan",
    name: "Early Chan",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["early chan"],
    summary: "The formative generations of Chan before the major house lineages became distinct.",
  },
  {
    slug: "qingyuan-line",
    name: "Qingyuan line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["qingyuan line"],
    summary:
      "The branch descending from Qingyuan Xingsi, associated with Caodong and Yunmen developments.",
  },
  {
    slug: "nanyue-line",
    name: "Nanyue line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["nanyue line"],
    summary:
      "The branch descending from Nanyue Huairang, associated with Linji and Guiyang developments.",
  },
  {
    slug: "caodong",
    name: "Caodong",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["caodong", "tsaodong", "曹洞"],
    summary: "The Chinese Caodong house founded through Dongshan Liangjie and Caoshan Benji.",
  },
  {
    slug: "soto",
    name: "Soto",
    tradition: "Zen",
    parentSlug: "caodong",
    aliases: ["soto", "sōtō", "soto zen", "caodong/soto", "曹洞宗"],
    summary:
      "The Japanese Soto branch established by Dogen from the Caodong lineage and later expanded through Keizan.",
  },
  {
    slug: "linji",
    name: "Linji",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["linji", "臨済"],
    summary:
      "The Chinese Linji house founded through Linji Yixuan and later transmitted into Japanese Rinzai.",
  },
  {
    slug: "rinzai",
    name: "Rinzai",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["rinzai", "linji/rinzai", "臨済宗"],
    summary:
      "The Japanese Rinzai branch derived from the Linji house, emphasizing koan training and monastic discipline.",
  },
  {
    slug: "yangqi-line",
    name: "Yangqi line",
    tradition: "Chan",
    parentSlug: "linji",
    aliases: ["linji/yangqi", "yangqi", "yangqi line"],
    summary:
      "A major Linji sub-branch that became especially influential in later Chan and Zen transmission lines.",
  },
  {
    slug: "yunmen",
    name: "Yunmen",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["yunmen", "雲門"],
    summary:
      "The Yunmen house, a distinct Chan branch known for concise and striking teaching encounters.",
  },
  {
    slug: "guiyang",
    name: "Guiyang",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["guiyang", "潙仰"],
    summary:
      "The Guiyang house descending from Guishan and Yangshan, one of the classical Chan houses.",
  },
  {
    slug: "sanbo-zen",
    name: "Sanbo-Zen",
    tradition: "Zen",
    aliases: ["sanbo", "sanbo-zen", "sanbō-zen", "sanbo kyodan"],
    summary:
      "A modern Zen movement combining Soto priestly forms with strong Rinzai koan training influences.",
  },
  {
    slug: "other",
    name: "Other",
    tradition: "Zen",
    aliases: ["other"],
    summary:
      "A temporary bucket for figures whose school assignment is still too broad or inconsistent in the source set.",
  },
];

const SCHOOL_BY_SLUG = new Map(
  SCHOOL_DEFINITIONS.map((definition) => [definition.slug, definition])
);

const SCHOOL_ALIAS_INDEX = new Map<string, SchoolDefinition>();

function normalizeKey(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const definition of SCHOOL_DEFINITIONS) {
  SCHOOL_ALIAS_INDEX.set(normalizeKey(definition.name), definition);
  SCHOOL_ALIAS_INDEX.set(normalizeKey(definition.slug), definition);
  for (const alias of definition.aliases) {
    SCHOOL_ALIAS_INDEX.set(normalizeKey(alias), definition);
  }
}

const MASTER_SCHOOL_OVERRIDES: Array<{
  schoolSlug: string;
  names: string[];
}> = [
  {
    schoolSlug: "soto",
    names: ["dogen", "dōgen", "eihei dogen", "eihei dōgen", "yongping daoyuan"],
  },
  {
    schoolSlug: "indian-patriarchs",
    names: [
      "shakyamuni buddha",
      "mahakashyapa",
      "ananda",
      "shanakavasa",
      "upagupta",
      "dhritaka",
      "michaka",
      "vasumitra",
      "buddhanandi",
      "buddhamitra",
      "parshva",
      "punyayashas",
      "ashvaghosha",
      "kapimala",
      "nagarjuna",
      "aryadeva",
      "rahulata",
      "sanghanandi",
      "gayashata",
      "kumarata",
      "jayata",
      "vasubandhu",
      "manorhita",
      "haklena",
      "vasasita",
      "punyamitra",
      "prajnatara",
      "simha",
    ],
  },
  {
    schoolSlug: "other",
    names: ["pang yun", "layman pang", "mahasattva fu", "taigu puyu", "taigo pou"],
  },
];

export function getSchoolDefinition(slug: string): SchoolDefinition | null {
  return SCHOOL_BY_SLUG.get(slug) ?? null;
}

export function getSchoolDefinitions(): SchoolDefinition[] {
  return SCHOOL_DEFINITIONS;
}

export function normalizeSchoolLabel(raw: string | null | undefined): SchoolDefinition | null {
  if (!raw || !raw.trim()) return null;
  return SCHOOL_ALIAS_INDEX.get(normalizeKey(raw)) ?? null;
}

export function determineSchoolDefinition(input: {
  rawLabel?: string | null;
  names?: string[];
}): SchoolDefinition | null {
  const normalizedNames = (input.names ?? []).map(normalizeKey);

  for (const override of MASTER_SCHOOL_OVERRIDES) {
    if (override.names.some((name) => normalizedNames.includes(normalizeKey(name)))) {
      return getSchoolDefinition(override.schoolSlug);
    }
  }

  return normalizeSchoolLabel(input.rawLabel ?? null);
}

export function getSchoolAncestors(slug: string): SchoolDefinition[] {
  const chain: SchoolDefinition[] = [];
  let current = getSchoolDefinition(slug);

  while (current) {
    chain.unshift(current);
    current = current.parentSlug ? getSchoolDefinition(current.parentSlug) : null;
  }

  return chain;
}
