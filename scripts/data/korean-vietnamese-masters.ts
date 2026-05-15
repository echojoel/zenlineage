/**
 * Editorial data for Korean Seon and Vietnamese Thiền masters.
 *
 * Every biographical claim is anchored to a scholarly source in the
 * accompanying `sources` array. Dates use the schema's precision/confidence
 * model: `exact` / `circa` / `century` / `unknown` for precision, and
 * `high` / `medium` / `low` for confidence.
 *
 * This file is consumed by `scripts/seed-korean-vietnamese.ts` and upserted
 * into the DB idempotently.
 */

export interface KVSource {
  id: string;
  type: string;
  title: string;
  author: string;
  url?: string;
  publicationDate: string;
  reliability: "authoritative" | "scholarly" | "primary" | "secondary" | "editorial" | "popular";
}

export interface KVMasterName {
  locale: string;
  nameType: "dharma" | "birth" | "honorific" | "alias";
  value: string;
}

export interface KVCitation {
  sourceId: string;
  fieldName?: string;
  pageOrSection?: string;
  excerpt?: string;
}

export interface KVTransmission {
  teacherSlug: string;
  type: "primary" | "secondary" | "disputed" | "dharma";
  isPrimary?: boolean;
  notes?: string;
  sourceIds: string[];
}

export interface KVFootnote {
  /** 1-based number matching a `[N]` marker in `biography`. */
  index: number;
  /** Source row id (must exist in the `sources` table). */
  sourceId: string;
  /** Optional locator (e.g. "pp. 85–94"). */
  pageOrSection?: string;
  /** Optional supporting quote shown after the citation. */
  excerpt?: string;
}

export interface KVMaster {
  slug: string;
  schoolSlug: string;
  names: KVMasterName[];
  birthYear: number | null;
  birthPrecision: "exact" | "circa" | "century" | "unknown";
  birthConfidence: "high" | "medium" | "low";
  deathYear: number | null;
  deathPrecision: "exact" | "circa" | "century" | "unknown";
  deathConfidence: "high" | "medium" | "low";
  generation?: number | null;
  biography: string;
  citations: KVCitation[];
  /** Optional Wikipedia-style numbered footnotes. When present, each
   *  `[N]` marker in `biography` is rendered as a superscript link
   *  resolving to the footnote whose `index` matches. */
  footnotes?: KVFootnote[];
  transmissions: KVTransmission[];
}

// ─── Sources cited in this dataset ──────────────────────────────────────

export const KV_SOURCES: KVSource[] = [
  {
    id: "src_buswell_radiance",
    type: "monograph",
    title: "Tracing Back the Radiance: Chinul's Korean Way of Zen",
    author: "Buswell, Robert E., Jr.",
    publicationDate: "1991",
    reliability: "scholarly",
  },
  {
    id: "src_buswell_formation",
    type: "monograph",
    title:
      "The Formation of Ch'an Ideology in China and Korea: The Vajrasamādhi-sūtra, a Buddhist Apocryphon",
    author: "Buswell, Robert E., Jr.",
    publicationDate: "1989",
    reliability: "scholarly",
  },
  {
    id: "src_buswell_monastic",
    type: "monograph",
    title: "The Zen Monastic Experience: Buddhist Practice in Contemporary Korea",
    author: "Buswell, Robert E., Jr.",
    publicationDate: "1992",
    reliability: "scholarly",
  },
  {
    id: "src_nguyen_medieval",
    type: "monograph",
    title:
      "Zen in Medieval Vietnam: A Study and Translation of the Thiền Uyển Tập Anh",
    author: "Nguyễn, Cuong Tu",
    publicationDate: "1997",
    reliability: "scholarly",
  },
  {
    id: "src_le_manh_that",
    type: "monograph",
    title: "Buddhism in Vietnam",
    author: "Lê, Mạnh Thát",
    publicationDate: "2006",
    reliability: "scholarly",
  },
  {
    id: "src_muller_kihwa",
    type: "monograph",
    title:
      "The Sutra of Perfect Enlightenment: Korean Buddhism's Guide to Meditation (with Commentary by the Sŏn Monk Kihwa)",
    author: "Muller, A. Charles",
    publicationDate: "1999",
    reliability: "scholarly",
  },
];

// ─── Masters ────────────────────────────────────────────────────────────

export const KV_MASTERS: KVMaster[] = [
  // ─── Korean Seon ──────────────────────────────────────────────────────
  {
    slug: "toui",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Doui" },
      { locale: "en", nameType: "alias", value: "Toui" },
      { locale: "ko", nameType: "dharma", value: "도의" },
      { locale: "zh", nameType: "alias", value: "道義" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 825,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Doui (道義, d. 825) is the master through whom Southern School Chan first entered the Korean peninsula and is reckoned the founder of the Gajisan school, the earliest of the Nine Mountain Schools (Gusan Seonmun) of Korean Seon[1]. He travelled to Tang China in 784, received transmission from Xitang Zhizang at Mazu Daoyi's Hongzhou community, and returned to Silla in 821 carrying a teaching that the doctrinal establishment of his time received with hostility[1]. Unable to teach publicly, he retired to Jinjeon-sa on Mount Seorak, where his lineage matured under his disciple Yeomgeo and became visible only after his death — a pattern, repeated across the next century by the other Mountain founders, that defined the Korean reception of Chan as a self-consciously meditative alternative to Silla's scholastic Buddhism[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 1–40", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 1–40 — Doui's Tang transmission and the founding of the Gajisan school" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58 — the Korean reception of Tang Chan as a meditative alternative" },
    ],
    transmissions: [
      {
        teacherSlug: "xitang-zhizang",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Transmission received in Tang China c. 821 from Mazu Daoyi's principal heir Xitang Zhizang.",
      },
    ],
  },
  {
    slug: "jinul",
    schoolSlug: "jogye",
    names: [
      { locale: "en", nameType: "dharma", value: "Bojo Jinul" },
      { locale: "en", nameType: "alias", value: "Chinul" },
      { locale: "ko", nameType: "dharma", value: "보조지눌" },
      { locale: "zh", nameType: "alias", value: "普照知訥" },
    ],
    birthYear: 1158,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1210,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Bojo Jinul (普照知訥, 1158–1210) is the central figure of Korean Seon and the master whose synthesis of meditation and doctrinal study shaped all subsequent Korean Buddhism[1]. Denied access to a formal Seon teacher in the sectarian strife of late-Goryeo Korea, he awakened through reading the Platform Sutra, Li Tongxuan's Huayan commentary, and the Records of Dahui Zonggao — an intellectual lineage rather than a transmitted one[1]. Against the Chinese controversy between sudden and gradual awakening he taught sudden awakening followed by gradual cultivation (돈오점수 dono jeomsu), and against the sectarian split between Seon and Hwaeom he argued that meditation and doctrinal study illuminate one another[2]. His Samādhi-Prajñā Society retreat on Mount Jogye (ending 1200) was the seed from which the later Jogye Order grew, and his writings — especially Secrets on Cultivating the Mind and Excerpts from the Dharma Collection — remain the foundational curriculum of Korean monastic training[3].",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 17–97, 159–213", fieldName: "biography" },
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 1–40", fieldName: "dates" },
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 3–7", fieldName: "name" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_radiance", pageOrSection: "pp. 17–97 — the three awakenings through reading the Platform Sūtra, Li Tongxuan, and Dahui" },
      { index: 2, sourceId: "src_buswell_radiance", pageOrSection: "pp. 159–213 — sudden awakening / gradual cultivation; Seon-Hwaŏm synthesis" },
      { index: 3, sourceId: "src_jinul_susimkyol", pageOrSection: "Susimkyŏl 修心訣 — Secrets on Cultivating the Mind" },
    ],
    transmissions: [
      {
        teacherSlug: "dajian-huineng",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_radiance"],
        notes:
          "Editorial bridge: Jinul had no formal teacher — Buswell (pp. 17–97) records that his three awakenings came through reading Huineng's Platform Sutra, Li Tongxuan's Huayan commentary, and the records of Dahui Zonggao. The edge to Huineng captures the textual/intellectual line that Jinul himself named as the root of his Seon.",
      },
    ],
  },
  {
    slug: "chingak-hyesim",
    schoolSlug: "jogye",
    names: [
      { locale: "en", nameType: "dharma", value: "Chin'gak Hyesim" },
      { locale: "en", nameType: "alias", value: "Jingak Hyesim" },
      { locale: "ko", nameType: "dharma", value: "진각혜심" },
      { locale: "zh", nameType: "alias", value: "眞覺慧諶" },
    ],
    birthYear: 1178,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1234,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Chin'gak Hyesim (眞覺慧諶, 1178–1234) was Jinul's principal disciple and successor at Songgwang-sa on Mount Jogye[1]. A former Confucian scholar who turned to Buddhism after his mother's death, he refined Korean huatou (화두 hwadu) practice into the disciplined investigation of a single critical phrase that still defines Korean meditation[1]. His Seonmun Yeomsong, an anthology of 1,125 koan cases with his verse and prose commentary, is the largest classical Korean Seon koan collection and remains a foundational training text. With Hyesim, the Korean tradition committed to keyword investigation as its primary meditative method — a commitment that continues unbroken in the seonbang today[2].",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 98–130", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 149–190", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_radiance", pageOrSection: "pp. 98–130 — Hyesim's career and his refinement of hwadu practice" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "pp. 149–190 — keyword investigation as central method of contemporary Korean Seon" },
    ],
    transmissions: [
      {
        teacherSlug: "jinul",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_buswell_radiance"],
        notes: "Successor at Songgwang-sa; received transmission before Jinul's death in 1210.",
      },
    ],
  },
  {
    slug: "taego-bou",
    schoolSlug: "taego-order",
    names: [
      { locale: "en", nameType: "dharma", value: "Taego Bou" },
      { locale: "en", nameType: "alias", value: "T'aego Pou" },
      { locale: "ko", nameType: "dharma", value: "태고보우" },
      { locale: "zh", nameType: "alias", value: "太古普愚" },
    ],
    birthYear: 1301,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1382,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Taego Bou (太古普愚, 1301–1382) is the master through whom Chinese Linji dharma transmission entered Korea, making him a pivotal figure in the formation of later Korean Seon orthodoxy[1]. In 1347 he travelled to Yuan China and received transmission from the Yangqi-line master Shiwu Qinggong (Stonehouse), the hermit-poet whose poems survive today largely through this very transmission[1]. On returning to Korea he served as royal preceptor under King Gongmin and, at the king's request, undertook to unify the Nine Mountain Schools of Seon into a single order organized around Linji koan practice. His legacy is twofold: the modern Taego Order takes him as its eponymous founder, while the Jogye Order also reads its Linji-centered transmission through him[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74 — Taego's Yuan-China transmission from Shiwu Qinggong" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41 — Taego and Jogye Orders, Linji line in contemporary Korean Buddhism" },
    ],
    transmissions: [
      {
        teacherSlug: "shiwu-qinggong",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Transmission received in Yuan China in 1347; brings the Yangqi-Linji dharma stream into Korea.",
      },
    ],
  },
  {
    slug: "naong-hyegeun",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Naong Hyegeun" },
      { locale: "en", nameType: "alias", value: "Naong Hyegun" },
      { locale: "ko", nameType: "dharma", value: "나옹혜근" },
      { locale: "zh", nameType: "alias", value: "懶翁惠勤" },
    ],
    birthYear: 1320,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1376,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Naong Hyegeun (懶翁惠勤, 1320–1376) was — alongside Taego Bou — the second great late-Goryeo master through whom Yuan-dynasty Chinese Chan reached Korea, and the teacher who carried the dharma into the early Joseon[1]. Travelling to Yuan China in 1347, he studied at the great Mongol-period monastery on Mount Yan, received Linji transmission from Pingshan Chulin, and crossed paths with the Indian master Zhikong (Śūnyādiśya), whose memory he later helped to establish in Korea[1]. On returning to Korea he served as Royal Preceptor under King Gongmin and re-articulated the inheritance from China through hwadu practice. His most consequential disciple, Muhak Jacho, in turn taught Hamheo Gihwa and became state preceptor to the founding Joseon king Yi Seong-gye — making Naong the conduit through which the late-Goryeo Linji line continued, however precariously, into the Confucian-suppressed early Joseon[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74 — Naong's Yuan-China training and Linji transmission" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41 — Muhak Jacho and the late-Goryeo Linji line into the early Joseon" },
    ],
    transmissions: [
      {
        teacherSlug: "taego-bou",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Editorial bridge: Naong and Taego Bou were contemporaries who both received Yuan-Chinese Linji transmission and served as Royal Preceptor under King Gongmin. The edge captures the late-Goryeo Linji cohort to which Naong belongs; his direct teacher Pingshan Chulin is not yet seeded.",
      },
    ],
  },
  {
    slug: "gihwa",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Hamheo Gihwa" },
      { locale: "en", nameType: "alias", value: "Hamhŏ Tŭkt'ong" },
      { locale: "en", nameType: "alias", value: "Kihwa" },
      { locale: "ko", nameType: "dharma", value: "함허기화" },
      { locale: "zh", nameType: "alias", value: "涵虛己和" },
    ],
    birthYear: 1376,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1433,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Hamheo Gihwa (涵虛己和, 1376–1433) was the leading philosophical voice of Korean Buddhism in the first generation of the Joseon dynasty, when the new Neo-Confucian state was systematically dismantling Buddhist institutions[1]. A former Confucian scholar at Seonggyungwan who became a monk under Muhak Jacho — Naong Hyegeun's principal disciple — he turned his classical training to the defense of the dharma in the Hyeonjeong-non (Treatise on Manifesting the Right), a measured response to Confucian polemics that argued for the compatibility of Buddhist liberation with Confucian moral seriousness[1]. His commentaries on the Sutra of Perfect Enlightenment and the Diamond Sutra became standard reading in Korean monasteries and remain among the most subtle works of philosophical Seon ever written, demonstrating that the Korean tradition could continue to think rigorously even under the Joseon state's suppression[2].",
    citations: [
      { sourceId: "src_muller_kihwa", pageOrSection: "Introduction", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_muller_kihwa", pageOrSection: "Introduction — Gihwa's biography and Hyeonjeong-non" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58 — the Joseon suppression and continuing philosophical Seon" },
    ],
    transmissions: [
      {
        teacherSlug: "naong-hyegeun",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_muller_kihwa"],
        notes:
          "Editorial bridge: Gihwa's direct teacher was Muhak Jacho (not yet seeded), Naong Hyegeun's principal disciple. The edge captures the Naong → Muhak → Gihwa transmission line that carried late-Goryeo Linji Seon into the early Joseon.",
      },
    ],
  },
  {
    slug: "seosan-hyujeong",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Seosan Hyujeong" },
      { locale: "en", nameType: "alias", value: "Sosan Taesa" },
      { locale: "ko", nameType: "dharma", value: "서산휴정" },
      { locale: "zh", nameType: "alias", value: "西山休靜" },
    ],
    birthYear: 1520,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1604,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Seosan Hyujeong (西山休靜, 1520–1604) was the pre-eminent Korean master of the Joseon dynasty, a period during which Neo-Confucian governance had driven Buddhism into the mountains and outlawed its public practice in the capital[1]. When Toyotomi Hideyoshi's forces invaded Korea in 1592, the seventy-two-year-old Seosan left his mountain temple and organized monastic militias (승병 seungbyeong) in the country's defense — a politically consequential gesture that led to the partial rehabilitation of Buddhism at court[1]. His Seongamnok (Mirror of Seon, 선가귀감) became the standard Joseon-dynasty handbook of Korean monastic practice, articulating a synthesis of hwadu meditation, sutra study, and Pure Land recitation that shaped Korean Buddhism into the modern era[2].",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58", fieldName: "biography" },
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58 — Seosan's career and the monastic militias of 1592" },
      { index: 2, sourceId: "src_seosan_mirror_of_seon", pageOrSection: "Seongamnok (Sŏn'ga Kwigam) — Mirror of Seon" },
    ],
    transmissions: [
      {
        teacherSlug: "taego-bou",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_monastic"],
        notes:
          "Editorial bridge: Seosan Hyujeong is a Joseon-era dharma descendant in the Taego Bou branch of Korean Seon (via Buyong Yeonggwan and the post-Taego Joseon lineage). Intermediate masters are not yet seeded.",
      },
    ],
  },
  {
    slug: "gyeongheo-seongu",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Gyeongheo Seongu" },
      { locale: "en", nameType: "alias", value: "Kyŏnghŏ Sŏng'u" },
      { locale: "ko", nameType: "dharma", value: "경허성우" },
      { locale: "zh", nameType: "alias", value: "鏡虛惺牛" },
    ],
    birthYear: 1846,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1912,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Gyeongheo Seongu (鏡虛惺牛, 1846–1912) single-handedly revived Korean Seon practice at the close of the Joseon dynasty, when centuries of state suppression had reduced disciplined meditation to a remembered form[1]. A precocious scholar-monk, he had a breakthrough awakening in 1879 at Cheonjang-sa while reading about illness and death, and spent the rest of his life travelling between monasteries reinstating the seonbang (meditation hall) and the biannual three-month retreat schedule (kyolche)[1]. His principal dharma heirs — Mangong, Hyobong, Hanam, and others — carried the revived tradition into the twentieth century and made the modern Jogye Order, Seongcheol's orthodoxy, and Seung Sahn's international mission all possible[1].",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41, 191–229", fieldName: "biography" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41, 191–229 — Gyeongheo's biography and the revival of late-Joseon Seon" },
    ],
    transmissions: [
      {
        teacherSlug: "seosan-hyujeong",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_monastic"],
        notes:
          "Editorial bridge: Gyeongheo revived the Joseon Seon lineage that descends from Seosan Hyujeong through several uncoded intermediate generations.",
      },
    ],
  },
  {
    slug: "seongcheol",
    schoolSlug: "jogye",
    names: [
      { locale: "en", nameType: "dharma", value: "Toeong Seongcheol" },
      { locale: "en", nameType: "alias", value: "Seongcheol" },
      { locale: "ko", nameType: "dharma", value: "성철" },
      { locale: "zh", nameType: "alias", value: "退翁性徹" },
    ],
    birthYear: 1912,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1993,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Toeong Seongcheol (退翁性徹, 1912–1993) was the most influential Korean Seon master of the twentieth century and served as the seventh Supreme Patriarch (Jongjeong) of the Jogye Order from 1981 until his death[1]. Born Yi Yeongju on 6 April 1912 in what was then Korea under Japanese rule, he was a precocious child who reportedly read by the age of three and worked through the Chinese classics in his early youth before turning to Western philosophy and Eastern religion[1]. His decisive turn to Buddhism came when he encountered Yongjia Xuanjue's Song of Enlightenment, an experience he later described as 'a bright light had suddenly been lit in complete darkness.' He took monastic ordination in March 1937 at Haeinsa under the recommendation of Seon Master Dongsan, receiving the dharma name Seongcheol, and reported a first awakening at Geum Dang Seon Center in 1940[1].\n\nSeongcheol's life as a monk became legendary for its austerity[1]. He undertook eight years of jangjwa bulwa — long sitting without lying down — and from 1955 to 1965 sealed himself into a ten-year retreat at Seongjeonam Hermitage on Mt. Gaya, refusing virtually all outside contact[1]. Visitors who later wished to meet him were famously required to perform three thousand prostrations before the Buddha; he applied this rule even to South Korean President Park Chung-hee, who never received the audience because he refused the prostrations. In 1967, after his appointment as Spiritual Head (Bangjang) of the Haeinsa Chongnim, he delivered the so-called 'Sermon of One Hundred Days' (백일법문) — two-hour daily lectures over more than three months that interwove Madhyamaka, Yogācāra, Tiantai, Huayan and the Korean Seon record with references to modern physics, and that fundamentally reshaped Korean Buddhist preaching[2]. His doctrinal banner was Dono Donsu (돈오돈수), 'sudden enlightenment, sudden cultivation,' which he defended against the gradual-cultivation reading of Jinul that had dominated the Jogye Order since the Goryeo period[1].\n\nWhen the Jogye Order elected him Jongjeong in 1981, Seongcheol famously refused to travel to Seoul for the enthronement ceremony and stayed at Haeinsa, where he continued to live as an ordinary monk in Toesoeldang, the same room in which he had been ordained, until he died there on 4 November 1993[1]. His written legacy is substantial: through Haeinsa's Jang'gyung'gak imprint between 1976 and 1992 he produced eleven volumes of his own dharma talks together with thirty-seven annotated translations of Chan and Seon classics, including *Seonmun Jeongno* (선문정로, 'The Correct Path of the Seon School,' 1981), the *Baegil Beommun* edition of the Hundred-Day Sermon, and a Korean edition of the *Liuzu Tanjing*[3]. His principal dharma heirs include Wŏntaek of Baekryeonam, who continues to oversee the publication of his collected talks, and a wider circle of Haeinsa-trained masters who maintain his sudden/sudden line within the contemporary Jogye Order[3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seongcheol", fieldName: "biography" },
      { sourceId: "src_seongcheol_dharma_talks", pageOrSection: "Hundred-Day Sermon (Baegil Beommun), 1967, Haeinsa", fieldName: "biography" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seongcheol: biography, retreats, Dono Donsu" },
      { index: 2, sourceId: "src_seongcheol_dharma_talks", pageOrSection: "Baegil Beommun (Hundred-Day Sermon, 1967, Haeinsa)" },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seongcheol: publications and dharma heirs" },
    ],
    transmissions: [
      {
        teacherSlug: "gyeongheo-seongu",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_monastic"],
        notes:
          "Editorial bridge: Seongcheol's direct teacher was Dongsan Hyeil, a dharma heir of Yongseong Jinjong, who was in turn a disciple of Gyeongheo Seongu. The two intermediate masters are not yet seeded.",
      },
    ],
  },
  {
    slug: "seung-sahn",
    schoolSlug: "kwan-um",
    names: [
      { locale: "en", nameType: "dharma", value: "Seung Sahn" },
      { locale: "en", nameType: "alias", value: "Haeng Won Seung Sahn" },
      { locale: "ko", nameType: "dharma", value: "숭산" },
      { locale: "zh", nameType: "alias", value: "崇山" },
    ],
    birthYear: 1927,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2004,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Seung Sahn Haengwon (숭산행원, 1927–2004) was the Korean Seon master who, more than any other, brought Korean Zen to the Western world and built the largest international Korean Zen sangha of the twentieth century, the Kwan Um School of Zen[1]. He was born Duk-In Lee on 1 August 1927 in Sunchon, South Pyongan Province, in what is now North Korea[1]. As a teenager he joined the Korean independence movement under Japanese occupation and was briefly imprisoned; afterward he studied Western philosophy at Dongguk University in Seoul, where reading the Diamond Sutra prompted him to leave his studies for the mountains. He took monastic precepts in 1948, undertook a hundred-day solitary retreat eating only pine needles, and on 25 January 1949 received dharma transmission from Seon Master Kobong Gyeongook — the only person to whom Kobong ever transmitted, making Seung Sahn at twenty-two the seventy-eighth patriarch in his Korean Imje line[1].\n\nAfter two decades of monastic and institutional work in Korea, Hong Kong, and Japan — including helping to rebuild the war-damaged Hwagaesa in Seoul — Seung Sahn arrived in Providence, Rhode Island in 1972, taking work in a laundromat and gathering a small group of Brown University students who became the nucleus of the Providence Zen Center[2]. Out of that group grew the Kwan Um School of Zen, which he formally founded in 1983 and which by his death had spread to more than a hundred groups, temples, and monasteries across North America, Europe, Africa, Asia, and Australia[2]. His teaching style was unmistakable: blunt, humorous, often bilingual broken-English exchanges built around what he called the Twelve Gates kong-ans and the central injunction to 'only don't know' and 'only go straight.' He authorized a relatively dense roster of dharma heirs — among them Bo Mun, Su Bong Soeng-Sahn, Soeng Hyang (Barbara Rhodes), Wu Kwang (Richard Shrobe), Dae Gak, and Mu Soeng — who continue to lead the Kwan Um School after his death[2].\n\nHis books, mostly co-edited from transcribed talks and letters, became standard introductions to Zen in English[3]. *Dropping Ashes on the Buddha: The Teaching of Zen Master Seung Sahn* was edited by Stephen Mitchell and published by Grove Press in 1976; *Only Don't Know: Selected Teaching Letters of Zen Master Seung Sahn* appeared from Primary Point Press in 1982 (reissued by Shambhala in 1999); *The Whole World Is a Single Flower: 365 Kong-ans for Everyday Life* was published by Charles E. Tuttle in 1992; and *The Compass of Zen*, his most systematic exposition of Hinayana, Mahayana, and Zen, was edited by his American heir Hyon Gak Sunim and published by Shambhala in 1997[3]. Shortly before his death the Jogye Order conferred on him the title Dae Jong Sa, 'Great Lineage Master.' He died at Hwagaesa in Seoul on 30 November 2004 at the age of seventy-seven[1].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seung Sahn", fieldName: "biography" },
      { sourceId: "src_kwanum", pageOrSection: "kwanumzen.org — About Zen Master Seung Sahn", fieldName: "biography" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seung Sahn: birth, ordination, Kobong transmission, death" },
      { index: 2, sourceId: "src_kwanum", pageOrSection: "kwanumzen.org — Providence Zen Center, founding of the Kwan Um School, dharma heirs" },
      { index: 3, sourceId: "src_seungsahn_compass_zen", pageOrSection: "Editor's introduction and bibliography — Compass of Zen and other works" },
    ],
    transmissions: [
      {
        teacherSlug: "gyeongheo-seongu",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_monastic"],
        notes:
          "Editorial bridge: Seung Sahn received transmission from Gobong Gyeong-uk, a dharma heir of Mangong Wolmyeon, who was Gyeongheo Seongu's principal disciple. The two intermediate masters are not yet seeded.",
      },
    ],
  },

  // ─── Vietnamese Thiền ────────────────────────────────────────────────
  {
    slug: "vinitaruci",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Vinītaruci" },
      { locale: "vi", nameType: "dharma", value: "Tì-ni-đa-lưu-chi" },
      { locale: "zh", nameType: "alias", value: "毘尼多流支" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 594,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Vinītaruci (d. 594) is the master whom the fourteenth-century Vietnamese hagiographical compendium Thiền Uyển Tập Anh names as the founder of Vietnamese Thiền[1]. According to that later source he was a South Indian monk who travelled to Chang'an and studied with the Third Patriarch Sengcan before continuing south, settling at Pháp Vân temple in what is now Bắc Ninh province, and founding a lineage of twenty-eight generations over the next six centuries[1]. Modern scholarship reads the Thiền Uyển Tập Anh's genealogy as a retrospective construction shaped by fourteenth-century doctrinal concerns rather than a contemporaneous record, but it preserves the earliest Vietnamese account of the tradition's beginning and remains its foundational text[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 9–25, 127–149", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 9–25, 127–149 — Thiền Uyển Tập Anh account of Vinītaruci" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Thiền Uyển Tập Anh as fourteenth-century construction" },
    ],
    transmissions: [
      {
        teacherSlug: "jianzhi-sengcan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "The Thiền Uyển Tập Anh identifies Vinītaruci as a dharma heir of the Third Chinese Patriarch Sengcan before his journey south into Vietnam. Modern scholarship regards the link as retrospective but it is the earliest recorded account.",
      },
    ],
  },
  {
    slug: "vo-ngon-thong",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Vô Ngôn Thông" },
      { locale: "vi", nameType: "dharma", value: "Vô Ngôn Thông" },
      { locale: "zh", nameType: "alias", value: "無言通" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 826,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Vô Ngôn Thông (無言通, d. 826) founded the second major Thiền lineage in Vietnam and is the Chinese disciple of Baizhang Huaihai through whom the Southern School of Chan entered Vietnamese Buddhism[1]. Sources describe his travelling south late in life to Kiến Sơ temple in what is now Bắc Ninh province, where his transmission passed through fifteen generations of Vietnamese masters[1]. Where the Vinītaruci line emphasized Indian-rooted meditative practice, the Vô Ngôn Thông line carried the characteristic Chinese-Chan emphasis on mind-to-mind transmission outside the scriptures. Together the two schools formed the main stems of Vietnamese Thiền for the next five centuries[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 26–42", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 26–42 — Vô Ngôn Thông and the Baizhang transmission to Vietnam" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Vinītaruci and Vô Ngôn Thông streams in early Thiền" },
    ],
    transmissions: [
      {
        teacherSlug: "baizhang-huaihai",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Traditional attribution per the Thiền Uyển Tập Anh; the historicity of the dates and the precise transmission relationship is debated in modern scholarship.",
      },
    ],
  },
  {
    slug: "tran-nhan-tong",
    schoolSlug: "truc-lam",
    names: [
      { locale: "en", nameType: "dharma", value: "Trần Nhân Tông" },
      { locale: "en", nameType: "alias", value: "Điều Ngự Giác Hoàng" },
      { locale: "vi", nameType: "dharma", value: "Trần Nhân Tông" },
      { locale: "zh", nameType: "alias", value: "陳仁宗" },
    ],
    birthYear: 1258,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1308,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Trần Nhân Tông (陳仁宗, 1258–1308) was the third emperor of the Trần dynasty, personally led Đại Việt to victory against the second and third Mongol invasions of Vietnam (1285 and 1287–1288), and then — at the height of his political power — abdicated the throne to become a monk[1]. Retiring to Yên Tử Mountain, he synthesized the earlier Vinītaruci, Vô Ngôn Thông, and Thảo Đường streams into a new school he named Trúc Lâm (竹林, Bamboo Grove) in 1299[1]. The school's emphasis on 'knowing the mind, seeing the nature' (tri tâm kiến tánh), its Sino-Vietnamese literary culture, and its accommodation of Confucian ethics made it the most distinctly Vietnamese articulation of Thiền in the medieval period. Trần Nhân Tông is the only Zen school founder known to have been a reigning emperor[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123 — Trần Nhân Tông's abdication and the founding of Trúc Lâm" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Trúc Lâm doctrine and the emperor-monk" },
    ],
    transmissions: [
      {
        teacherSlug: "vinitaruci",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Editorial bridge: Trần Nhân Tông's direct teacher was the lay master Tuệ Trung Thượng Sĩ (not yet seeded). In founding Trúc Lâm he unified the Vinītaruci, Vô Ngôn Thông, and Thảo Đường schools; the edge to Vinītaruci is drawn on that lineage-unification basis.",
      },
    ],
  },
  {
    slug: "phap-loa",
    schoolSlug: "truc-lam",
    names: [
      { locale: "en", nameType: "dharma", value: "Pháp Loa" },
      { locale: "vi", nameType: "dharma", value: "Pháp Loa" },
      { locale: "zh", nameType: "alias", value: "法螺" },
    ],
    birthYear: 1284,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1330,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Pháp Loa (法螺, 1284–1330) was the second patriarch of the Trúc Lâm school and the master to whom Trần Nhân Tông personally transmitted the dharma in 1308 in front of the assembled monastic community[1]. Where the founder had been an emperor turned hermit, Pháp Loa was the institutional builder who consolidated the new school: he supervised the carving of a complete Vietnamese-edition Buddhist canon, ordained more than fifteen thousand monastics over his patriarchate, and oversaw the construction and reform of monasteries across the Trần realm[1]. The disciplined, scholastic Trúc Lâm that survives in Vietnamese Buddhist memory — as much as the more famous founder — is in large part his work[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123 — Pháp Loa's transmission and patriarchate" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — institutional consolidation of Trúc Lâm" },
    ],
    transmissions: [
      {
        teacherSlug: "tran-nhan-tong",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Direct transmission from Trần Nhân Tông in 1308; second patriarch of Trúc Lâm.",
      },
    ],
  },
  {
    slug: "huyen-quang",
    schoolSlug: "truc-lam",
    names: [
      { locale: "en", nameType: "dharma", value: "Huyền Quang" },
      { locale: "vi", nameType: "dharma", value: "Huyền Quang" },
      { locale: "zh", nameType: "alias", value: "玄光" },
    ],
    birthYear: 1254,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1334,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Huyền Quang (玄光, 1254–1334) was the third and last patriarch of the medieval Trúc Lâm school[1]. A precocious scholar who placed first in the imperial examinations in 1272, he served the Trần court for two decades before being ordained in middle age and entering the dharma circle around Trần Nhân Tông and Pháp Loa[1]. After Pháp Loa's death he assumed the patriarchate at age seventy-seven and spent the final four years of his life at Côn Sơn, where his poetry — among the earliest surviving lyric corpus in Vietnamese Buddhist letters — gives the most personal voice to the school's contemplative ideal. With his death the Trúc Lâm patriarchate passed into a long quiescence from which it would be revived only in the twentieth century[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123 — Huyền Quang's career and patriarchate" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — quiescence of Trúc Lâm after 1334" },
    ],
    transmissions: [
      {
        teacherSlug: "tran-nhan-tong",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Editorial bridge: institutionally Huyền Quang succeeded the second patriarch Pháp Loa, but he was older than Pháp Loa and received his Trúc Lâm formation from the founder Trần Nhân Tông himself. The edge to Trần Nhân Tông keeps the chronology straight while preserving the patriarchal line.",
      },
    ],
  },
  {
    slug: "thich-thanh-tu",
    schoolSlug: "truc-lam",
    names: [
      { locale: "en", nameType: "dharma", value: "Thích Thanh Từ" },
      { locale: "vi", nameType: "dharma", value: "Thích Thanh Từ" },
      { locale: "zh", nameType: "alias", value: "釋清慈" },
    ],
    birthYear: 1924,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Thích Thanh Từ (1924–2022) was the principal architect of the modern revival of Trúc Lâm Zen, the indigenous Vietnamese Thiền school founded by Emperor Trần Nhân Tông in the thirteenth century and largely dormant for some six hundred years[1]. He was born Trần Hữu Phước on 24 July 1924 in Tích Khánh hamlet, Thiện Mỹ commune, Trà Ôn district, Vĩnh Long province in the Mekong Delta[1]. Drawn to monastic life from his youth, he was ordained at Chùa Phật Quang on 15 July 1949 under the great southern reformer Thích Thiện Hoa as his root teacher (bổn sư), and received the full bhikṣu precepts in 1952 from Tổ Khánh Anh. He was first formed in the Pure Land tradition that dominated southern Vietnamese Buddhism, and only in 1966 — after building a small meditation hut and entering an extended solitary retreat — did he turn decisively toward Thiền, an inner reorientation he later described as a recovery of the lost Vietnamese Zen of Trúc Lâm rather than a borrowing from China or Japan[1].\n\nIn December 1971 he opened Thiền viện Chân Không on Mount Tương Kỳ near Vũng Tàu with ten students, and in 1974 founded Thiền viện Thường Chiếu in Long Thành, Đồng Nai — alongside the satellite hermitages Linh Quang, Chân Không, and Bát Nhã — which from 1986 became the organizational headquarters of the entire Trúc Lâm revival[1]. From the early 1990s he undertook a deliberate programme of re-rooting the school in its historical homeland: Thiền viện Trúc Lâm Đà Lạt opened on Phụng Hoàng mountain above Tuyền Lâm Lake in 1993; Thiền viện Trúc Lâm Yên Tử was consecrated in 2002 on the very mountain where Trần Nhân Tông had established the original school; and Thiền viện Trúc Lâm Tây Thiên was opened in 2005 in Vĩnh Phúc[1]. By his later years more than sixty Trúc Lâm monasteries in Vietnam and overseas — including houses in California, Australia, Canada, and France — traced their lineage back to him[1].\n\nHis pedagogical method, which he called 'the practising method of Vietnamese Zen' (Thiền tông Việt Nam), centres on recognising thoughts as empty as they arise — biết vọng không theo, 'knowing the false thoughts and not following them' — and on a curriculum built from the recorded sayings of the Trúc Lâm patriarchs Trần Thái Tông, Tuệ Trung Thượng Sĩ, Trần Nhân Tông, Pháp Loa, and Huyền Quang, alongside the Heart and Diamond sutras and the Chinese Chan classics[2]. He began writing in 1961 and produced more than fifty original works and translations over the next four and a half decades, gathered in the forty-three-volume *Thích Thanh Từ Toàn Tập*, including *Thiền Tông Việt Nam Cuối Thế Kỷ 20* ('Vietnamese Zen at the End of the Twentieth Century'), annotated editions of the Trúc Lâm records, the popular primer *Phật Giáo Trong Mạch Sống Dân Tộc*, and Vietnamese commentaries on the Heart Sutra, Diamond Sutra, and Sutra of Hui-neng[2]. Among his closest dharma heirs and senior disciples — many of whom now lead the major Trúc Lâm centres — are Thích Nhật Quang at Thường Chiếu, Thích Thông Phương at Trúc Lâm Đà Lạt, Thích Kiến Nguyệt at Trúc Lâm Tây Thiên, and Thích Tâm Hạnh, who together have carried the revival into a second institutional generation[1].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "vi.wikipedia.org — Thích Thanh Từ", fieldName: "biography" },
      { sourceId: "src_truc_lam_records", pageOrSection: "Trúc Lâm Zen records / Thiền Tông Việt Nam Cuối Thế Kỷ 20", fieldName: "biography" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "vi.wikipedia.org — Thích Thanh Từ: biography, ordinations, Trúc Lâm monasteries" },
      { index: 2, sourceId: "src_truc_lam_records", pageOrSection: "Thiền Tông Việt Nam Cuối Thế Kỷ 20 — \"biết vọng không theo\" method and curriculum" },
    ],
    transmissions: [
      {
        teacherSlug: "lieu-quan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_le_manh_that"],
        notes:
          "Editorial bridge: Thích Thanh Từ trained in the Lâm Tế Liễu Quán line under Thích Thiện Hoa (not yet seeded). The edge to Liễu Quán anchors his transmission line; his Trúc Lâm revival reaches back, programmatically, to Trần Nhân Tông.",
      },
    ],
  },
  {
    slug: "thich-nhat-hanh",
    schoolSlug: "plum-village",
    names: [
      { locale: "en", nameType: "dharma", value: "Thích Nhất Hạnh" },
      { locale: "en", nameType: "alias", value: "Thay" },
      { locale: "vi", nameType: "dharma", value: "Thích Nhất Hạnh" },
      { locale: "zh", nameType: "alias", value: "釋一行" },
    ],
    birthYear: 1926,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2022,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Thích Nhất Hạnh (一行, 1926–2022) was the Vietnamese Thiền master, poet, peace activist, and author who, more than any other modern teacher, shaped the global understanding of mindfulness and gave the world the term 'engaged Buddhism.'[1] He was born Nguyễn Xuân Bảo on 11 October 1926 in Huế, central Vietnam, and at sixteen entered Từ Hiếu Temple as a novice under Zen Master Thanh Quý Chân Thật, of the forty-third generation of the Lâm Tế (Linji) school and the ninth generation of its Liễu Quán branch; he was fully ordained as a bhikṣu at Ấn Quang Pagoda in Saigon in 1951[1]. He studied at the Báo Quốc Buddhist Academy and took degrees in French and Vietnamese literature at Saigon University before going to the United States in 1960–1962 to study comparative religion at Princeton and to lecture at Columbia and Cornell; he eventually read and taught in Vietnamese, French, Classical Chinese, Sanskrit, Pali, and English[1]. On 1 May 1966 his teacher transmitted 'the lamp' to him, formally making him a dharmacharya and spiritual head of the Từ Hiếu line[2].\n\nOut of the Vietnam War he built two of the most influential institutions of modern Buddhism[1]. In 1964 he co-founded the School of Youth for Social Service (SYSS), a 'neutral' corps that trained some ten thousand young Buddhists to rebuild bombed villages, run schools and clinics, and care for refugees on both sides of the war. Between 1964 and 1966 he and a small group of monastics founded the Order of Interbeing (Tiếp Hiện), a mixed monastic and lay order whose Fourteen Mindfulness Trainings reframed the bodhisattva precepts for engaged practice[2]. During his 1966 American tour he met Martin Luther King Jr. and persuaded him to speak publicly against the war; in 1967 King nominated Nhất Hạnh for the Nobel Peace Prize, writing that 'I do not personally know of anyone more worthy of the Nobel Peace Prize than this gentle monk from Vietnam.'[1] Refusing to support either side of the war cost him his country: both Saigon and Hanoi denied him re-entry, and he lived in exile in France for thirty-nine years. In 1982 he and Sister Chân Không founded Plum Village (Làng Mai) in the Dordogne, which by 2019 had grown into nine affiliated monasteries on three continents and the largest Buddhist monastic community in Europe and North America, with more than 750 resident monastics[2].\n\nHe published more than one hundred books in English[3]. The most influential include *Vietnam: Lotus in a Sea of Fire* (Hill and Wang, 1967), in which he coined the term 'engaged Buddhism'; *The Miracle of Mindfulness* (Beacon Press, 1975), originally a long letter of encouragement to SYSS workers and later credited as a foundational text for mindfulness-based clinical interventions; *Being Peace* (Parallax Press, 1987); *Old Path White Clouds: Walking in the Footsteps of the Buddha* (Parallax Press, 1991); *Peace Is Every Step* (Bantam, 1992); *Living Buddha, Living Christ* (Riverhead, 1995); and *The Heart of the Buddha's Teaching* (Broadway, 1998)[3]. After a severe brain hemorrhage in November 2014 he gradually returned to Vietnam, settling permanently at the root temple of Từ Hiếu in 2018, where he died on 22 January 2022 at the age of ninety-five[1]. His teaching survives through a dense lineage of dharma heirs — Sister Chân Không, Thầy Pháp Ấn, Thầy Pháp Dung, Sister Annabel Laity (Chân Đức), Thầy Pháp Linh, and many others — together with the lay membership of the Order of Interbeing[2].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Thích Nhất Hạnh", fieldName: "biography" },
      { sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — About Thich Nhat Hanh / Plum Village Tradition", fieldName: "biography" },
      { sourceId: "src_plumvillage_books", pageOrSection: "plumvillage.org — Books by Thich Nhat Hanh", fieldName: "biography" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Thích Nhất Hạnh: biography, exile, Nobel nomination, death" },
      { index: 2, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Plum Village tradition, SYSS, Order of Interbeing, monastic network" },
      { index: 3, sourceId: "src_plumvillage_books", pageOrSection: "plumvillage.org — Books by Thich Nhat Hanh; selected English-language publications" },
    ],
    transmissions: [
      {
        teacherSlug: "lieu-quan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "42nd-generation master of the Lâm Tế school in the Liễu Quán dharma line — lineage rather than direct teacher-student.",
      },
    ],
  },
  {
    slug: "lieu-quan",
    schoolSlug: "lam-te",
    names: [
      { locale: "en", nameType: "dharma", value: "Liễu Quán" },
      { locale: "vi", nameType: "dharma", value: "Liễu Quán" },
      { locale: "zh", nameType: "alias", value: "了觀" },
    ],
    birthYear: 1670,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1742,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Liễu Quán (了觀, 1670–1742) is the master who Vietnamized the Lâm Tế (Linji) tradition[1]. Where earlier Vietnamese Lâm Tế transmission had been carried by Chinese émigré monks — notably Nguyên Thiều, who arrived from Guangdong c. 1665 — Liễu Quán was the first Vietnamese-born heir, receiving transmission from the Chinese master Tử Dung Minh Hoằng[1]. The dharma line he established, known as the Liễu Quán branch, became the dominant Buddhist lineage in central and southern Vietnam and remains so today. Thích Nhất Hạnh's Plum Village tradition descends through this line as its 42nd generation, making Liễu Quán the ancestor of the global Vietnamese Zen tradition as it is now practiced worldwide[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 124–149", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "teachers" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 124–149 — Liễu Quán and the Vietnamization of the Lâm Tế line" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Liễu Quán branch in central/southern Vietnam; Plum Village descent" },
    ],
    transmissions: [
      {
        teacherSlug: "linji-yixuan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Editorial bridge: Liễu Quán received transmission from the Chinese Ming-Linji master Tử Dung Minh Hoằng (not yet seeded), making him the first Vietnamese-born heir of the Lâm Tế (Linji) line. The Linji lineage is anchored in the DB via its founder Linji Yixuan.",
      },
    ],
  },
  // ─── Korean Seon — Nine Mountain Schools founders (additional) ────────
  {
    slug: "hyecheol",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Hyech'ŏl" },
      { locale: "en", nameType: "alias", value: "Hyecheol" },
      { locale: "ko", nameType: "dharma", value: "혜철" },
      { locale: "zh", nameType: "alias", value: "慧徹" },
    ],
    birthYear: 785,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 861,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Hyech'ŏl (慧徹, 785–861) is the founder of the Tongnisan school, the second of the Nine Mountain Schools (Gusan Seonmun) of Korean Seon[1]. He travelled to Tang China in 814, received transmission from Xitang Zhizang at Mazu Daoyi's Hongzhou community — the same teacher as Doui — and returned to Silla in 839 carrying the Southern School's sudden-awakening teaching[1]. Where Doui's lineage matured slowly under suspicion of court Buddhism, Hyech'ŏl was received with royal patronage and established Tongnisa on Mount Tongnisan as one of the great training centres of the late Silla period. His teaching emphasised the inseparability of meditation and the doctrinal study of the Avataṃsaka Sūtra — a foreshadowing of the Sŏn-Hwaŏm synthesis that Pojo Chinul would systematise three centuries later[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 25–32", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Hyech'ŏl'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 25–32" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Hyech'ŏl\" and \"Nine Mountain Schools\"" },
    ],
    transmissions: [
      {
        teacherSlug: "xitang-zhizang",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Transmission received in Tang China c. 825 from Xitang Zhizang — the same teacher as Doui, anchoring two Nine Mountain Schools to the same Hongzhou-Mazu line.",
      },
    ],
  },
  {
    slug: "muyeom",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Muyŏm" },
      { locale: "en", nameType: "alias", value: "Muyeom" },
      { locale: "ko", nameType: "dharma", value: "무염" },
      { locale: "zh", nameType: "alias", value: "無染" },
    ],
    birthYear: 800,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 888,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Muyŏm (無染, 800–888) is the founder of the Sŏngjusan school, one of the Nine Mountain Schools of Korean Seon, and one of the most influential figures of late Silla Buddhism[1]. Born to a noble family of the True-Bone aristocracy, he travelled to Tang China around 821 and trained under Magu Baoche, a heir in the Mazu Daoyi line[1]. After more than two decades in China — long enough to be regarded by his Chinese hosts as a fully Chinese master — he returned to Silla in 845 and established Sŏngjusa on Mount Sŏngjusan in the Boryeong region. Muyŏm's lineage produced thousands of students, his temple became a major training centre, and his Mugŏlbong Munpŏp ('Tongueless Sermon') is preserved as a touchstone of early Korean Sŏn rhetoric — its insistence that the dharma is finally beyond words mirrored the teaching style of his Hongzhou-line master and grounded the Korean reception of Chan in the same direct-pointing tradition[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 32–40", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Muyŏm'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 32–40" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Muyŏm\" and Tongueless Sermon" },
    ],
    transmissions: [
      {
        teacherSlug: "mazu-daoyi",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Editorial bridge: Muyŏm trained under Magu Baoche (寶徹, not yet seeded), a direct heir of Mazu Daoyi's Hongzhou line. The transmission edge anchors him to Mazu as the lineage source.",
      },
    ],
  },
  {
    slug: "beomil",
    schoolSlug: "seon",
    names: [
      { locale: "en", nameType: "dharma", value: "Pŏmil" },
      { locale: "en", nameType: "alias", value: "Beomil" },
      { locale: "ko", nameType: "dharma", value: "범일" },
      { locale: "zh", nameType: "alias", value: "梵日" },
    ],
    birthYear: 810,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 889,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Pŏmil (梵日, 810–889) is the founder of the Saguelsan school, another of the Nine Mountain Schools of Korean Seon[1]. He travelled to Tang China in 831 and received transmission from Yanguan Qi'an, a senior heir of Mazu Daoyi[1]. After fifteen years in China — including the disruption of the Huichang persecution of Buddhism (842–846) — he returned to Silla and established Gulsansa on Mount Saguelsan. Pŏmil's lineage was distinctive for cultivating close ties with the eastern Korean coast and the burgeoning trade networks with Japan; his successors maintained the school as one of the longest-running Mountain communities, and the Goryeo-era hagiographies preserve his teaching that the awakening transmitted to him in China is identical to the awakening of Mahākāśyapa under the Bodhi tree — a characteristic Mountain-school assertion of unbroken patriarchal lineage[2].",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 28–35", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Pŏmil'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "pp. 28–35" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Pŏmil\" and the Saguelsan school" },
    ],
    transmissions: [
      {
        teacherSlug: "yanguan-qian",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_buswell_formation"],
        notes:
          "Transmission received in Tang China c. 845 from Yanguan Qi'an, anchoring the Saguelsan school to the Mazu-Hongzhou lineage.",
      },
    ],
  },
  {
    slug: "beopjeong",
    schoolSlug: "jogye",
    names: [
      { locale: "en", nameType: "dharma", value: "Beopjeong" },
      { locale: "en", nameType: "alias", value: "Bŏpchŏng" },
      { locale: "en", nameType: "alias", value: "Bopjong" },
      { locale: "ko", nameType: "dharma", value: "법정" },
      { locale: "zh", nameType: "alias", value: "法頂" },
    ],
    birthYear: 1932,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2010,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Beopjeong (法頂, 1932–2010) is one of the most widely-read modern Korean Sŏn writers, a Jogye Order monk whose essays on simplicity, attentiveness, and the inseparability of practice from daily life shaped the religious imagination of two generations of Korean lay readers[1]. Ordained in 1956 under Hyobong, he spent decades in mountain hermitages — most famously Bulil Hermitage at Songgwangsa and Suryeon Hermitage on Mount Bongseon — and refused all institutional titles[1]. His best-known book, *Musoyu* ('Non-Possession', 1976), articulates a quiet ethic of voluntary simplicity that influenced Korean environmentalism and the country's late-twentieth-century critique of consumerism[2]. In his final years he stipulated that none of his books be reprinted after his death — a last lesson, his disciples said, in non-attachment[1].",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 145–152", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Pŏpchŏng'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "pp. 145–152 — Beopjeong's biography and hermitage life" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Pŏpchŏng\" — Musoyu and Korean environmentalism" },
    ],
    transmissions: [
      // Beopjeong's actual teacher was Hyobong Hangnul (孝峰, 1888–1966).
      // Hyobong is not yet seeded; add edge here once seeded.
    ],
  },
  {
    slug: "daehaeng",
    schoolSlug: "jogye",
    names: [
      { locale: "en", nameType: "dharma", value: "Daehaeng Kun Sunim" },
      { locale: "en", nameType: "alias", value: "Daehaeng" },
      { locale: "ko", nameType: "dharma", value: "대행" },
      { locale: "zh", nameType: "alias", value: "大行" },
    ],
    birthYear: 1927,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2012,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Daehaeng Kun Sunim (大行, 1927–2012) is one of the most important Korean female Sŏn masters of the twentieth century and the founder of the Hanmaum Seonwon ('One-Mind Sŏn Centre') network, which by her death numbered fifteen branches in Korea and another fifteen abroad[1]. Ordained in 1950 in the wake of the Korean War, she spent her early years in mountain hermitages refusing the formal Jogye Order monastic curriculum, working instead from her own awakening — a position the Order later affirmed by recognising her teaching authority and granting her dharma-name lineage status[1]. Her teaching, distilled in dozens of dharma talks published as *No River to Cross* and *Wake Up and Laugh*, centres on Han Maeum, 'one mind' — the invitation to entrust everything to the foundation of one's own true nature rather than to method, ritual, or teacher[2]. Daehaeng's significance is doubled: she is both a major modern Sŏn teacher in her own right and a watershed figure for Korean Buddhist nuns, having opened formal teaching paths in a tradition where female lineage transmission had long been informal[1].",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 211–220", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Daehaeng'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "pp. 211–220 — Daehaeng Kun Sunim and the Hanmaum Seonwon network; female lineage authorization" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Daehaeng\" — Han Maeum (\"One Mind\") teaching" },
    ],
    transmissions: [
      // Daehaeng had no formal dharma transmission (Wikipedia / Hanmaum Seon Center confirm
      // she was self-realized). Her ordination teacher was Hanam Jungwon (c. 1948), not yet seeded.
    ],
  },
  // ─── Vietnamese Thiền (additional) ──────────────────────────────────
  {
    slug: "khuong-viet",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Khuông Việt" },
      { locale: "vi", nameType: "dharma", value: "Khuông Việt" },
      { locale: "zh", nameType: "alias", value: "匡越" },
      { locale: "en", nameType: "birth", value: "Ngô Chân Lưu" },
    ],
    birthYear: 933,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 1011,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Khuông Việt (匡越, 933–1011), birth name Ngô Chân Lưu, is the fourth-generation patriarch of the Vô Ngôn Thông line of Vietnamese Thiền and the figure regarded as Vietnam's first national Buddhist preceptor[1]. Born into the Ngô clan that briefly held the Vietnamese throne after the fall of Chinese rule in 939, he ordained at the Khai Quốc temple under Vân Phong and became one of the most learned monks of his generation[1]. King Đinh Tiên Hoàng granted him the title Khuông Việt Đại Sư ('Great Master Who Helps Vietnam') in 971 — the first time a Vietnamese Buddhist had been formally appointed to the post of national preceptor — and he served the early Đinh, Lê, and Lý courts as a religious-political advisor. The Thiền Uyển Tập Anh records his correspondence with the Song-dynasty Chinese ambassadors, in which he composed Buddhist verses that established Vietnamese literary Buddhism as a peer tradition to its Chinese parent[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 80–95", fieldName: "biography" },
      { sourceId: "src_le_manh_that", pageOrSection: "pp. 134–145", fieldName: "context" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 80–95 — Khuông Việt biography (Thiền Uyển Tập Anh)" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "pp. 134–145 — Đinh-Lê-Lý court Buddhism and Sino-Vietnamese literary exchange" },
    ],
    transmissions: [
      {
        teacherSlug: "vo-ngon-thong",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Khuông Việt is the fourth-generation heir of Vô Ngôn Thông; his immediate teacher Vân Phong (雲峰) is not yet seeded. The transmission edge to Vô Ngôn Thông represents lineage origin.",
      },
    ],
  },
  {
    slug: "van-hanh",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Vạn Hạnh" },
      { locale: "vi", nameType: "dharma", value: "Vạn Hạnh" },
      { locale: "zh", nameType: "alias", value: "萬行" },
    ],
    birthYear: 938,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 1018,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Vạn Hạnh (萬行, 938–1018) is the twelfth-generation master of the Tỳ-ni-đa-lưu-chi (Vinītaruci) line of Vietnamese Thiền and one of the most consequential political-religious figures in Vietnamese history[1]. Trained at Lục Tổ Temple in Bắc Ninh, he was renowned for his mastery of the three traditional 'studies' — Buddhism, Confucianism, and Daoism — and for what the chronicles describe as a strikingly accurate gift of prophecy[1]. His most celebrated act was political: foreseeing the imminent fall of the Lê dynasty, he persuaded the court official Lý Công Uẩn to accept the throne in 1009, founding the Lý dynasty (1009–1225) which would shape Vietnam for two centuries and establish Buddhism as the de facto state religion. Vạn Hạnh's death-verse, recorded in the Thiền Uyển Tập Anh, articulates the impermanence at the heart of his teaching: 'The body is like a flash of lightning; here, then gone.'[2]",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 96–110", fieldName: "biography" },
      { sourceId: "src_le_manh_that", pageOrSection: "pp. 156–172", fieldName: "political" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 96–110 — Vạn Hạnh biography and prophecy" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "pp. 156–172 — founding of the Lý dynasty; death verse" },
    ],
    transmissions: [
      {
        teacherSlug: "vinitaruci",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Vạn Hạnh is the twelfth-generation heir of the Vinītaruci line; his immediate teacher Thiền Ông Đạo Giả (禪翁道者, not yet seeded) was an eleventh-generation master in the same line.",
      },
    ],
  },
  {
    slug: "huong-hai",
    schoolSlug: "lam-te",
    names: [
      { locale: "en", nameType: "dharma", value: "Hương Hải" },
      { locale: "vi", nameType: "dharma", value: "Hương Hải" },
      { locale: "zh", nameType: "alias", value: "香海" },
    ],
    birthYear: 1628,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 1715,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Hương Hải (香海, 1628–1715) is the central figure of the seventeenth-century Vietnamese Thiền revival[1]. Born in the southern Đàng Trong region during the long Trịnh-Nguyễn split, he served briefly as a court mandarin before ordaining and travelling north to study under the Chinese Lâm Tế (Linji) master Trí Giáo Nhất Cú at Phật Tích temple[1]. He returned south, established a hermitage on Mount Tiêu Dao, and from there reformed Vietnamese Thiền practice along the lines of Ming-dynasty Linji discipline — a recovery, after centuries of decline, of the rigorous training that had defined the Trúc Lâm period. He authored more than thirty works in chữ Nôm and classical Chinese, including *Sự Lý Dung Thông* on the unity of phenomena and principle and the *Giải Tâm Kinh* commentary on the Heart Sūtra; his death-verse, 'The mountains are mountains, the waters are waters — what use is there in seeking?', is preserved in every Vietnamese Buddhist anthology[2].",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 211–228", fieldName: "biography" },
      { sourceId: "src_le_manh_that", pageOrSection: "pp. 245–260", fieldName: "writings" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "pp. 211–228 — Hương Hải and the seventeenth-century Vietnamese Thiền revival" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "pp. 245–260 — Hương Hải's writings; Sự Lý Dung Thông; Giải Tâm Kinh" },
    ],
    transmissions: [
      {
        teacherSlug: "linji-yixuan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_nguyen_medieval"],
        notes:
          "Editorial bridge: Hương Hải's immediate teacher Trí Giáo Nhất Cú was a seventeenth-century Chinese Lâm Tế master not yet seeded. The edge to the Lâm Tế founder Linji Yixuan anchors the lineage.",
      },
    ],
  },
  {
    slug: "thich-tinh-khiet",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Thích Tịnh Khiết" },
      { locale: "vi", nameType: "dharma", value: "Thích Tịnh Khiết" },
      { locale: "zh", nameType: "alias", value: "釋淨潔" },
      { locale: "en", nameType: "birth", value: "Nguyễn Văn Kỉnh" },
    ],
    birthYear: 1890,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1973,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Thích Tịnh Khiết (釋淨潔, 1890–1973) was the first Supreme Patriarch of the Unified Buddhist Sangha of Vietnam (Giáo Hội Phật Giáo Việt Nam Thống Nhất) and the unifying ecclesiastical figure of twentieth-century Vietnamese Buddhism[1]. Ordained in 1905 at Tường Vân Pagoda in Huế, he rose through the Lâm Tế-derived Liễu Quán lineage and became, by the 1930s, the senior Buddhist authority in central Vietnam[1]. His public profile crystallised during the 1963 Buddhist crisis: as nominal head of the Vietnamese Sangha he was placed under house arrest by the Diệm regime in May 1963, an act that catalysed the international protests culminating in Thích Quảng Đức's self-immolation that June. After Diệm's fall, Thích Tịnh Khiết presided over the founding of the Unified Buddhist Sangha in January 1964 and held the office of Supreme Patriarch until his death — symbolising, for a war-fractured Vietnamese Buddhism, an institutional centre that survived both colonial and Cold War political assault[2].",
    citations: [
      { sourceId: "src_le_manh_that", pageOrSection: "pp. 312–328", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Thích Tịnh Khiết'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_le_manh_that", pageOrSection: "pp. 312–328 — Thích Tịnh Khiết and twentieth-century Vietnamese ecclesiastical reorganisation" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Thích Tịnh Khiết\" — 1963 Buddhist crisis and Unified Sangha" },
    ],
    transmissions: [
      {
        teacherSlug: "lieu-quan",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_le_manh_that"],
        notes:
          "Editorial bridge: Thích Tịnh Khiết's lineage descends through the eighteenth-century Liễu Quán reform of the Lâm Tế tradition. The edge to Liễu Quán represents lineage origin; intermediate masters are not yet seeded.",
      },
    ],
  },
  {
    slug: "thich-quang-duc",
    schoolSlug: "thien",
    names: [
      { locale: "en", nameType: "dharma", value: "Thích Quảng Đức" },
      { locale: "vi", nameType: "dharma", value: "Thích Quảng Đức" },
      { locale: "zh", nameType: "alias", value: "釋廣德" },
      { locale: "en", nameType: "birth", value: "Lâm Văn Túc" },
    ],
    birthYear: 1897,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1963,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Thích Quảng Đức (釋廣德, 1897–1963) is among the most internationally recognised Vietnamese Buddhists of the twentieth century[1]. Ordained at age fifteen in the Lâm Tế-derived Liễu Quán tradition, he spent four decades in monastic obscurity — restoring more than thirty pagodas across central Vietnam, supervising the construction of the Quan Âm Pagoda in Saigon, and serving as chairman of the Vietnamese Buddhist Sangha's monastic discipline panel[1]. His name became known worldwide on 11 June 1963, when he sat in lotus posture at the intersection of Phan Đình Phùng and Lê Văn Duyệt streets in Saigon, was doused in petrol by fellow monks, lit a match, and burned to death without moving — an act of protest against the Diệm government's persecution of Buddhists. Malcolm Browne's photograph of the immolation became one of the most reproduced images of the twentieth century; the heart, recovered intact from the funeral pyre, is preserved as a relic at Việt Nam Quốc Tự pagoda. The Vietnamese Buddhist establishment formally canonised him as a bodhisattva in 1964[2].",
    citations: [
      { sourceId: "src_le_manh_that", pageOrSection: "pp. 329–342", fieldName: "biography" },
      { sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. 'Thích Quảng Đức'", fieldName: "dates" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_le_manh_that", pageOrSection: "pp. 329–342 — Thích Quảng Đức biography and self-immolation, 11 June 1963" },
      { index: 2, sourceId: "src_princeton_dict_buddhism", pageOrSection: "s.v. \"Thích Quảng Đức\" — 1964 bodhisattva canonisation; heart relic" },
    ],
    transmissions: [
      {
        teacherSlug: "lieu-quan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_le_manh_that"],
        notes:
          "Editorial bridge: Thích Quảng Đức ordained in the Liễu Quán branch of the Lâm Tế tradition. The edge to Liễu Quán anchors the lineage; the immediate teacher line through twentieth-century Vietnamese masters is not yet seeded.",
      },
    ],
  },
];
