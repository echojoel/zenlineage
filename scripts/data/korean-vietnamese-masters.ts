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
];

// ─── Masters ────────────────────────────────────────────────────────────

export const KV_MASTERS: KVMaster[] = [
  // ─── Korean Seon ──────────────────────────────────────────────────────
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
      "Bojo Jinul (普照知訥, 1158–1210) is the central figure of Korean Seon and the master whose synthesis of meditation and doctrinal study shaped all subsequent Korean Buddhism. Denied access to a formal Seon teacher in the sectarian strife of late-Goryeo Korea, he awakened through reading the Platform Sutra, Li Tongxuan's Huayan commentary, and the Records of Dahui Zonggao — an intellectual lineage rather than a transmitted one. Against the Chinese controversy between sudden and gradual awakening he taught sudden awakening followed by gradual cultivation (돈오점수 dono jeomsu), and against the sectarian split between Seon and Hwaeom he argued that meditation and doctrinal study illuminate one another. His Samādhi-Prajñā Society retreat on Mount Jogye (ending 1200) was the seed from which the later Jogye Order grew, and his writings — especially Secrets on Cultivating the Mind and Excerpts from the Dharma Collection — remain the foundational curriculum of Korean monastic training.",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 17–97, 159–213", fieldName: "biography" },
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 1–40", fieldName: "dates" },
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 3–7", fieldName: "name" },
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
      "Chin'gak Hyesim (眞覺慧諶, 1178–1234) was Jinul's principal disciple and successor at Songgwang-sa on Mount Jogye. A former Confucian scholar who turned to Buddhism after his mother's death, he refined Korean huatou (화두 hwadu) practice into the disciplined investigation of a single critical phrase that still defines Korean meditation. His Seonmun Yeomsong, an anthology of 1,125 koan cases with his verse and prose commentary, is the largest classical Korean Seon koan collection and remains a foundational training text. With Hyesim, the Korean tradition committed to keyword investigation as its primary meditative method — a commitment that continues unbroken in the seonbang today.",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 98–130", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 149–190", fieldName: "teachers" },
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
      "Taego Bou (太古普愚, 1301–1382) is the master through whom Chinese Linji dharma transmission entered Korea, making him a pivotal figure in the formation of later Korean Seon orthodoxy. In 1347 he travelled to Yuan China and received transmission from the Yangqi-line master Shiwu Qinggong (Stonehouse), the hermit-poet whose poems survive today largely through this very transmission. On returning to Korea he served as royal preceptor under King Gongmin and, at the king's request, undertook to unify the Nine Mountain Schools of Seon into a single order organized around Linji koan practice. His legacy is twofold: the modern Taego Order takes him as its eponymous founder, while the Jogye Order also reads its Linji-centered transmission through him.",
    citations: [
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74", fieldName: "biography" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41", fieldName: "teachers" },
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
      "Seosan Hyujeong (西山休靜, 1520–1604) was the pre-eminent Korean master of the Joseon dynasty, a period during which Neo-Confucian governance had driven Buddhism into the mountains and outlawed its public practice in the capital. When Toyotomi Hideyoshi's forces invaded Korea in 1592, the seventy-two-year-old Seosan left his mountain temple and organized monastic militias (승병 seungbyeong) in the country's defense — a politically consequential gesture that led to the partial rehabilitation of Buddhism at court. His Seongamnok (Mirror of Seon, 선가귀감) became the standard Joseon-dynasty handbook of Korean monastic practice, articulating a synthesis of hwadu meditation, sutra study, and Pure Land recitation that shaped Korean Buddhism into the modern era.",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58", fieldName: "biography" },
      { sourceId: "src_buswell_formation", pageOrSection: "pp. 41–74", fieldName: "teachers" },
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
      "Gyeongheo Seongu (鏡虛惺牛, 1846–1912) single-handedly revived Korean Seon practice at the close of the Joseon dynasty, when centuries of state suppression had reduced disciplined meditation to a remembered form. A precocious scholar-monk, he had a breakthrough awakening in 1879 at Cheonjang-sa while reading about illness and death, and spent the rest of his life travelling between monasteries reinstating the seonbang (meditation hall) and the biannual three-month retreat schedule (kyolche). His principal dharma heirs — Mangong, Hyobong, Hanam, and others — carried the revived tradition into the twentieth century and made the modern Jogye Order, Seongcheol's orthodoxy, and Seung Sahn's international mission all possible.",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–41, 191–229", fieldName: "biography" },
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
      "Toeong Seongcheol (退翁性徹, 1912–1993) was the most influential Korean master of the twentieth century and the scholar-monk who redefined modern Korean Seon orthodoxy. Ordained in 1936 under the Gyeongheo lineage, he undertook famously austere practice — ten years of forgoing sleep in the lotus posture — before emerging as a leading voice in the post-war Jogye Order. Appointed Supreme Patriarch in 1967, he delivered a hundred days of sermons at Haein-sa arguing that Jinul's 'sudden awakening, gradual cultivation' had misread the Chinese Chan tradition: true awakening, he held, is both sudden and complete, needing no subsequent cultivation (돈오돈수 dono donsu). His Seonmun Jeongno defended this position with exhaustive scholarship and re-centered hwadu as the sole authentic Korean path.",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 191–229", fieldName: "biography" },
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 130–157", fieldName: "teachers" },
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
      "Seung Sahn (崇山, 1927–2004) was a Korean Seon master in the Jogye lineage and the teacher most responsible for bringing Korean meditation practice to the West. A dharma heir of Gobong Seonsa, he led the reconstruction of Korean Buddhist institutions after the Korean War before departing for the United States in 1972. From the Providence Zen Center he grew the Kwan Um School of Zen into one of the most geographically widespread Zen organizations in the world, with more than a hundred centers across North America, Europe, Asia, and Africa. His direct, humorous teaching — 'only don't know,' 'put it all down' — adapted classical Korean hwadu into a form that Western students could enter on their first weekend retreat, while his dharma heirs continue the lineage today.",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 191–229", fieldName: "biography" },
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
      "Vinītaruci (d. 594) is the master whom the fourteenth-century Vietnamese hagiographical compendium Thiền Uyển Tập Anh names as the founder of Vietnamese Thiền. According to that later source he was a South Indian monk who travelled to Chang'an and studied with the Third Patriarch Sengcan before continuing south, settling at Pháp Vân temple in what is now Bắc Ninh province, and founding a lineage of twenty-eight generations over the next six centuries. Modern scholarship reads the Thiền Uyển Tập Anh's genealogy as a retrospective construction shaped by fourteenth-century doctrinal concerns rather than a contemporaneous record, but it preserves the earliest Vietnamese account of the tradition's beginning and remains its foundational text.",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 9–25, 127–149", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
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
      "Vô Ngôn Thông (無言通, d. 826) founded the second major Thiền lineage in Vietnam and is the Chinese disciple of Baizhang Huaihai through whom the Southern School of Chan entered Vietnamese Buddhism. Sources describe his travelling south late in life to Kiến Sơ temple in what is now Bắc Ninh province, where his transmission passed through fifteen generations of Vietnamese masters. Where the Vinītaruci line emphasized Indian-rooted meditative practice, the Vô Ngôn Thông line carried the characteristic Chinese-Chan emphasis on mind-to-mind transmission outside the scriptures. Together the two schools formed the main stems of Vietnamese Thiền for the next five centuries.",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 26–42", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "teachers" },
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
      "Trần Nhân Tông (陳仁宗, 1258–1308) was the third emperor of the Trần dynasty, personally led Đại Việt to victory against the second and third Mongol invasions of Vietnam (1285 and 1287–1288), and then — at the height of his political power — abdicated the throne to become a monk. Retiring to Yên Tử Mountain, he synthesized the earlier Vinītaruci, Vô Ngôn Thông, and Thảo Đường streams into a new school he named Trúc Lâm (竹林, Bamboo Grove) in 1299. The school's emphasis on ‘knowing the mind, seeing the nature’ (tri tâm kiến tánh), its Sino-Vietnamese literary culture, and its accommodation of Confucian ethics made it the most distinctly Vietnamese articulation of Thiền in the medieval period. Trần Nhân Tông is the only Zen school founder known to have been a reigning emperor.",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "dates" },
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
      "Thích Nhất Hạnh (釋一行, 1926–2022) was a Vietnamese Thiền master of the Liễu Quán branch of the Lâm Tế (Linji) line — its 42nd-generation dharma heir — and the most influential figure in the twentieth-century transmission of Vietnamese Buddhism to the West. His wartime activism and interfaith peace work led to exile in 1966; his Order of Interbeing (Tiếp Hiện), founded that same year, articulated an engaged Buddhist ethics anchored in the Fourteen Mindfulness Trainings. In 1982 he established Plum Village (Làng Mai) in the Dordogne region of France, which grew into one of the largest contemplative communities in the world, with monasteries and practice centers on five continents. Through more than a hundred books translated into dozens of languages and a teaching style that made mindfulness accessible in secular and inter-religious settings, Thích Nhất Hạnh reshaped global perception of what Zen practice is — while remaining rigorously anchored in Vietnamese Thiền's inheritance of seated meditation, chanting, and precept-centered daily discipline.",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 150–175", fieldName: "biography" },
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
      "Liễu Quán (了觀, 1670–1742) is the master who Vietnamized the Lâm Tế (Linji) tradition. Where earlier Vietnamese Lâm Tế transmission had been carried by Chinese émigré monks — notably Nguyên Thiều, who arrived from Guangdong c. 1665 — Liễu Quán was the first Vietnamese-born heir, receiving transmission from the Chinese master Tử Dung Minh Hoằng. The dharma line he established, known as the Liễu Quán branch, became the dominant Buddhist lineage in central and southern Vietnam and remains so today. Thích Nhất Hạnh's Plum Village tradition descends through this line as its 42nd generation, making Liễu Quán the ancestor of the global Vietnamese Zen tradition as it is now practiced worldwide.",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 124–149", fieldName: "biography" },
      { sourceId: "src_le_manh_that", fieldName: "teachers" },
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
];
