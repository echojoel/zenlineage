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
      "The twenty-eight Indian patriarchs form the traditional lineage from Shakyamuni Buddha to Bodhidharma, tracing the mind-to-mind transmission of awakening across roughly a thousand years of Indian Buddhism. The lineage begins with the Flower Sermon: the Buddha held up a flower before the assembly on Vulture Peak, and only Mahakashyapa smiled in understanding. This wordless exchange is regarded as the origin of the entire Chan/Zen transmission. The chain passes through major figures in Indian Buddhist history—including Nagarjuna, Ashvaghosha, and Vasubandhu—before reaching Prajnatara, who recognized Bodhidharma and sent him east to China. While modern historians question the historical accuracy of this lineage as a literal chain of teacher-student relationships, the tradition treats it as a sacred genealogy affirming that the awakening transmitted in Zen is identical to the Buddha's own realization.",
  },
  {
    slug: "chan",
    name: "Chan",
    tradition: "Chan",
    aliases: ["chan", "zen"],
    summary:
      "Chan (禪) is the Chinese Buddhist meditation tradition that emerged from the encounter between Indian Buddhism and Chinese culture, becoming the most influential school of East Asian Buddhism. The word 'Chan' derives from the Sanskrit dhyana (meditation). Chan emphasizes direct experience of awakened mind over scriptural study, formalized by the motto attributed to Bodhidharma: 'A special transmission outside the scriptures; no dependence on words and letters; directly pointing to the human mind; seeing one's nature and becoming Buddha.' During the Tang and Song dynasties, Chan developed its characteristic methods—encounter dialogues, koan practice, intensive sitting, and the teacher-student relationship as the vehicle of transmission. The tradition crystallized into the Five Houses (Caodong, Linji, Yunmen, Guiyang, and Fayan), each with distinctive teaching styles. Chan was transmitted to Korea (as Seon), Japan (as Zen), and Vietnam (as Thien), profoundly shaping the religious, artistic, and philosophical culture of East Asia.",
  },
  {
    slug: "early-chan",
    name: "Early Chan",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["early chan"],
    summary:
      "Early Chan encompasses the formative period from Bodhidharma's arrival in China (traditionally c. 520 CE) through the Sixth Patriarch Huineng and his immediate successors, before the tradition divided into distinct house lineages. This era includes the six patriarchs—Bodhidharma, Huike, Sengcan, Daoxin, Hongren, and Huineng—as well as precursor figures like Mahasattva Fu and independent lineages such as the Oxhead (Niutou) school and the Jingzhong school of Sichuan. The period's defining crisis was the Northern-Southern School controversy: Shenxiu's gradualist approach versus Huineng's sudden awakening, with Heze Shenhui's polemical advocacy eventually establishing the Southern School as orthodox. Huineng's Platform Sutra became the foundational text, and his two principal students—Qingyuan Xingsi and Nanyue Huairang—gave rise to the two great branches from which all subsequent Chan schools descend.",
  },
  {
    slug: "qingyuan-line",
    name: "Qingyuan line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["qingyuan line"],
    summary:
      "The Qingyuan line descends from Qingyuan Xingsi, a student of the Sixth Patriarch Huineng, and constitutes one of the two great branches of Chan. Through Qingyuan's student Shitou Xiqian—author of the Sandokai (Harmony of Difference and Equality)—this line gave rise to three of the Five Houses: the Caodong school (through Dongshan Liangjie), the Yunmen school (through Yunmen Wenyan), and the Fayan school (through Fayan Wenyi). The Qingyuan branch is broadly characterized by a more contemplative and subtle approach compared to the Nanyue line's dramatic directness, though individual masters varied widely. Key figures in the early Qingyuan line include Yaoshan Weiyan, who bridged the Shitou and Mazu traditions; Tianhuang Daowu and Longtan Chongxin, through whom the Deshan-Xuefeng lineage developed; and Chuanzi Decheng, the beloved Boat Monk. The line's emphasis on the interpenetration of the absolute and relative, expressed through Shitou's Sandokai and Dongshan's Five Ranks, became a defining contribution to Chan philosophy.",
  },
  {
    slug: "nanyue-line",
    name: "Nanyue line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["nanyue line"],
    summary:
      "The Nanyue line descends from Nanyue Huairang, a student of the Sixth Patriarch Huineng, and constitutes the second of the two great branches of Chan. Through Nanyue's student Mazu Daoyi—one of the most influential Chan masters in history—this line gave rise to the Linji and Guiyang schools and profoundly shaped the character of Chinese Chan. Mazu's Hongzhou school developed the use of shouts, blows, and spontaneous gestures as teaching methods, famously declaring 'This very mind is Buddha' and 'No mind, no Buddha.' The Nanyue branch is broadly associated with dynamic, forceful, and unpredictable teaching styles. Nanyue is best remembered for his encounter with the young Mazu: seeing Mazu practicing intensive sitting meditation, Nanyue began polishing a tile nearby. When Mazu asked why, Nanyue said he was making a mirror. Mazu protested that polishing a tile cannot make a mirror, and Nanyue replied, 'How can sitting in meditation make a Buddha?' This exchange shattered Mazu's attachment to the form of practice and became one of the foundational teaching stories of Chan.",
  },
  {
    slug: "caodong",
    name: "Caodong",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["caodong", "tsaodong", "曹洞"],
    summary:
      "The Caodong school (曹洞宗) is one of the Five Houses of Chan, founded in the ninth century by Dongshan Liangjie and his student Caoshan Benji—the school's name combines the first characters of their mountain names. Its central philosophical contribution is the Five Ranks (wuwei), a dialectical framework describing five modes of relationship between the absolute (emptiness) and the relative (form). Where the Linji school emphasized dramatic breakthrough through shouts and blows, the Caodong tradition developed a subtler approach centered on 'silent illumination' (mozhao chan)—objectless sitting in which awareness naturally illuminates itself without the pursuit of any particular experience. Hongzhi Zhengjue, the Song dynasty master at Tiantong Monastery, was the school's greatest literary voice, composing the verses for the Book of Serenity and articulating silent illumination as a formal practice. The Caodong school nearly went extinct during the Song dynasty before being revived through the extraordinary cross-lineage transmission from Dayang Jingxuan through the Linji master Fushan Fayuan to Touzi Yiqing. Through Furong Daokai and subsequent masters, the revived Caodong tradition reached Tiantong Rujing, who transmitted it to Dogen and thus to all of Japanese Soto Zen.",
  },
  {
    slug: "soto",
    name: "Soto",
    tradition: "Zen",
    parentSlug: "caodong",
    aliases: ["soto", "sōtō", "soto zen", "caodong/soto", "曹洞宗"],
    summary:
      "The Soto school (曹洞宗) is the Japanese continuation of the Chinese Caodong tradition, founded by Eihei Dogen (1200–1253) after his training with Tiantong Rujing in China. It is the largest Zen denomination in Japan. Soto's central practice is shikantaza ('just sitting')—zazen practiced without koans, without seeking enlightenment, and without any object or technique, understood not as a means to awakening but as awakening's direct expression. Dogen articulated this in his masterwork the Shobogenzo, one of the most profound philosophical texts in world religious literature, and in his practical manual the Fukanzazengi. The school's second great figure, Keizan Jokin (1264–1325), founded Sojiji Temple and made Soto practice accessible to a broad Japanese population through the integration of esoteric ritual and ancestor veneration. Together, Eiheiji (Dogen's temple) and Sojiji serve as the school's two head monasteries. In the modern era, the Soto tradition has been carried to the West by teachers including Shunryu Suzuki (San Francisco Zen Center), Taisen Deshimaru (Association Zen Internationale, Europe), Taizan Maezumi (Zen Center of Los Angeles), and Dainin Katagiri (Minnesota Zen Center), establishing vibrant practice communities across North America and Europe.",
  },
  {
    slug: "linji",
    name: "Linji",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["linji", "臨済"],
    summary:
      "The Linji school (臨済宗) is the most dynamic and influential of the Five Houses of Chan, founded by Linji Yixuan (d. 866) in the lineage of Mazu Daoyi through Baizhang Huaihai and Huangbo Xiyun. Linji's teaching is characterized by fierce directness—he used shouts (katsu), blows, and paradoxical exchanges to shatter students' conceptual thinking and precipitate immediate awakening. His 'True Person of No Rank' teaching and his four-fold classification of shouts became foundational for the school. During the Song dynasty, the Linji school divided into the Yangqi and Huanglong branches, with the Yangqi line eventually becoming dominant. The school produced the two greatest koan collections: the Blue Cliff Record (Yuanwu Keqin's commentary on Xuedou Chongxian's verses) and the Gateless Barrier (Wumen Huikai's forty-eight cases). Dahui Zonggao championed the huatou (keyword) method of koan practice—concentrating on a single critical phrase until all conceptual thinking is exhausted—which became the standard Linji approach. Through transmission to Japan, Korea, and Vietnam, the Linji school became the most geographically widespread form of Chan/Zen Buddhism.",
  },
  {
    slug: "rinzai",
    name: "Rinzai",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["rinzai", "linji/rinzai", "臨済宗"],
    summary:
      "The Rinzai school (臨済宗) is the Japanese form of the Chinese Linji tradition, transmitted to Japan through multiple lineages during the Kamakura period (1185–1333). The school's defining figure is Hakuin Ekaku (1686–1769), who single-handedly revived and systematized Rinzai practice after a period of decline. Hakuin developed the structured koan curriculum that remains standard today—beginning with the Mu koan or the sound of one hand clapping, then progressing through increasingly subtle layers of inquiry. His emphasis on 'great doubt, great faith, great determination' as the three pillars of practice became definitive. The modern Rinzai school is organized primarily through the O-To-Kan lineage: Nanpo Jomyo (Daio Kokushi) received transmission from the Chinese master Xutang Zhiyu, transmitted to Shuho Myocho (Daito Kokushi, founder of Daitokuji), who transmitted to Kanzan Egen (founder of Myoshinji). These two temple complexes—Daitokuji and Myoshinji—and their extensive branch networks form the institutional backbone of modern Rinzai Zen. The school profoundly influenced Japanese culture, including the tea ceremony, calligraphy, ink painting, garden design, and the martial arts.",
  },
  {
    slug: "yangqi-line",
    name: "Yangqi line",
    tradition: "Chan",
    parentSlug: "linji",
    aliases: ["linji/yangqi", "yangqi", "yangqi line"],
    summary:
      "The Yangqi line is the dominant sub-branch of the Linji school, founded by Yangqi Fanghui (992–1049), a student of Shishuang Chuyuan. It emerged alongside the Huanglong branch when the Linji school divided in the Song dynasty, and eventually absorbed and superseded the Huanglong line to become the sole surviving Linji lineage. The Yangqi branch is characterized by an unpredictable, spontaneous teaching style—Yangqi himself was known for playful and surprising responses that kept students off balance. The line produced many of the most important figures in later Chan history: Wuzu Fayan, Yuanwu Keqin (compiler of the Blue Cliff Record), Dahui Zonggao (champion of huatou practice, who famously burned the Blue Cliff Record's printing blocks), and Wumen Huikai (compiler of the Gateless Barrier). Through Xutang Zhiyu's transmission to Nanpo Jomyo, the Yangqi line became the foundation of virtually all Japanese Rinzai Zen. The Song dynasty hermit-poet Shiwu Qinggong (Stonehouse) and the intense practitioner Gaofeng Yuanmiao also belong to this lineage.",
  },
  {
    slug: "yunmen",
    name: "Yunmen",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["yunmen", "雲門"],
    summary:
      "The Yunmen school (雲門宗) is one of the Five Houses of Chan, founded by Yunmen Wenyan (864–949), a student of Xuefeng Yicun. It is renowned for the extraordinary economy and precision of its teaching language—Yunmen's responses were often a single word or phrase that functioned as a complete teaching, known as 'one-word barriers.' His famous utterances include 'Every day is a good day,' 'A dried shit stick' (in response to 'What is Buddha?'), and 'The whole world is medicine—what is your self?' The Yunmen school valued linguistic virtuosity not as literary display but as a form of direct pointing: each word chosen to cut through the student's conceptual mind with surgical precision. Xuedou Chongxian, the school's greatest literary figure, selected and composed verses on the hundred cases that became the basis for the Blue Cliff Record, arguably the supreme literary achievement of the Chan tradition. Though the Yunmen school did not survive as an independent institution beyond the Song dynasty, its spirit permeated all subsequent Chan through the koan collections, and its emphasis on concise, powerful expression continues to shape Zen teaching style to this day.",
  },
  {
    slug: "guiyang",
    name: "Guiyang",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["guiyang", "潙仰"],
    summary:
      "The Guiyang school (潙仰宗) was the earliest of the Five Houses of Chan to be formally recognized, founded by Guishan Lingyou (771–853) and his student Yangshan Huiji (807–883) in the lineage of Baizhang Huaihai. The school's name combines the first characters of their respective mountains. The Guiyang school was distinguished by its refined and indirect teaching methods, particularly the use of ninety-seven circular figures (yuan-xiang) to express the relationship between the absolute and relative—a sophisticated non-verbal language that complemented the verbal exchanges used by other schools. Where the Linji school employed shouts and blows, the Guiyang tradition favored subtle gestures, drawn symbols, and the interplay of 'host' and 'guest' as pedagogical tools. Key figures include Xiangyan Zhixian, who awakened at the sound of a pebble striking bamboo after burning all his scholarly notes, and Hangzhou Tianlong, whose one-finger teaching was passed to Juzhi (Gutei) and became one of the most famous koans in the Mumonkan. The Guiyang school did not survive as an independent institution beyond the Song dynasty, but its insights into symbolic communication and the non-verbal dimensions of transmission influenced the broader Chan tradition.",
  },
  {
    slug: "sanbo-zen",
    name: "Sanbo-Zen",
    tradition: "Zen",
    aliases: ["sanbo", "sanbo-zen", "sanbō-zen", "sanbo kyodan"],
    summary:
      "Sanbo-Zen (三宝禅, formerly Sanbo Kyodan, 'Three Treasures Association') is a modern Zen school founded by Yasutani Hakuun (1885–1973) that integrates Soto Zen's emphasis on shikantaza with the Rinzai tradition's systematic koan curriculum. Yasutani's teacher, Harada Daiun Sogaku, had pioneered this synthesis by combining his Soto training with extensive Rinzai koan study under several masters. The Sanbo-Zen approach offers practitioners both objectless sitting and a structured koan path, beginning with the Mu koan and progressing through the traditional Rinzai curriculum. Under the leadership of Yamada Koun (1907–1989), the school became one of the most important vehicles for transmitting Zen to the West. Yamada's radical openness—he trained Catholic priests and nuns, Protestant ministers, and practitioners of other faiths alongside traditional Buddhist students—transformed Zen from a Japanese cultural phenomenon into a genuinely international contemplative practice. Robert Aitken (Diamond Sangha, Hawaii) and Ruben Habito (Maria Kannon Zen Center, Dallas) are among the school's notable Western-based teachers. The school is headquartered in Kamakura, Japan.",
  },
  {
    slug: "other",
    name: "Other",
    tradition: "Zen",
    aliases: ["other"],
    summary:
      "This category includes significant figures in Chan and Zen history who do not fit neatly into the major school classifications. Among them are Layman Pang Yun, one of the greatest lay practitioners in Chan history, whose dialogues with Mazu Daoyi and Shitou Xiqian demonstrate that awakening is not confined to the monastic institution. Other figures include precursors and contemporaries of the Five Houses whose lineages developed independently or whose school affiliation is ambiguous in the historical sources.",
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
    names: ["pang yun", "layman pang", "taigu puyu", "taigo pou"],
  },
  {
    schoolSlug: "early-chan",
    names: [
      "mahasattva fu",
      "niutou farong",
      "guifeng zongmi",
      "zizhou zhishen",
      "zizhou chuji",
      "jingzhong wuxiang",
      "baotang wuzhu",
    ],
  },
  {
    schoolSlug: "qingyuan-line",
    names: [
      "jingzhong shenhui",
      "suizhou daoyuan",
      "longji shaoxiu",
      "ruiyan shiyan",
      "yantou quanhuo",
      "nanyue daoxuan",
      "heze shenhui",
    ],
  },
  {
    schoolSlug: "linji",
    names: [
      "huanglong huiji",
      "shengshou nanyin",
      "zhenjing kewen",
    ],
  },
  {
    schoolSlug: "yangqi-line",
    names: [
      "xutang zhiyu",
      "poan zuxian",
      "wuzhun shifan",
    ],
  },
  {
    schoolSlug: "caodong",
    names: [
      "kumu daocheng",
      "changlu qingliao",
    ],
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
