/**
 * Taisen Deshimaru's senior European disciples — the AZI / Association
 * Zen Internationale neighbourhood that descended almost entirely from
 * him after his arrival in Paris in 1967.
 *
 * The runtime DB previously listed only four disciples under Deshimaru
 * (Roland Yuno Rech, Étienne Mokushō Zeisler, Stéphane Kōsen Thibaut,
 * Raphaël Dōkō Triet), under-representing the European Sōtō line. This
 * file adds seven additional figures who were ordained directly by
 * Deshimaru and went on to lead practice centres across France,
 * Switzerland, and beyond.
 *
 * Each entry carries `edge_type: "primary"` for the Deshimaru-ordination
 * edge. Where shihō (dharma transmission) was later received from a
 * different teacher (Niwa Zenji, Donin Minamizawa, etc.), this is
 * recorded in the edge `notes` rather than as a separate `dharma` edge,
 * matching the convention already used for Mokushō Zeisler and Kōsen
 * Thibaut in `scripts/data/raw/modern-lineages-curated.json`.
 *
 * Sources: the AZI dōjō directory (zen-azi.org) and the Sōtōshū Europe
 * Office (global.sotozen-net.or.jp/eng/temples/europe/) — both already
 * registered as `src_azi` and `src_sotozen_europe` and used elsewhere
 * (Triet's biography footnotes, the practice-map seed).
 *
 * Consumed by `scripts/seed-deshimaru-lineage.ts`. Mirrors the data
 * shape of `scripts/data/maezumi-lineage.ts`.
 */

import type {
  KVCitation,
  KVMaster,
  KVSource,
  KVTransmission,
} from "./korean-vietnamese-masters";
import { BRANCH_A_MASTERS } from "./deshimaru/branch-A";
import { BRANCH_B_MASTERS } from "./deshimaru/branch-B";
import { BRANCH_C_MASTERS } from "./deshimaru/branch-C";
import {
  BRANCH_D_MASTERS,
  BRANCH_D_MASTER_PATCHES,
} from "./deshimaru/branch-D";
import {
  BRANCH_E_MASTERS,
  BRANCH_E_MASTER_PATCHES,
} from "./deshimaru/branch-E";
import { BRANCH_F_MASTERS } from "./deshimaru/branch-F";

/**
 * Sources used by this dataset. All three are also referenced from
 * `scripts/data/seed-temples.ts` and `scripts/seed-biographies.ts`, so
 * they may already be present in the DB by the time this seeder runs —
 * the seeder upserts them defensively so it can be run standalone.
 */
export const DESHIMARU_SOURCES: KVSource[] = [
  {
    id: "src_azi",
    type: "website",
    title: "Association Zen Internationale — Find your practice location",
    author: "Association Zen Internationale",
    url: "https://www.zen-azi.org/en/dojos",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  {
    id: "src_sotozen_europe",
    type: "website",
    title:
      "Sōtōshū Europe Office — Temples, monasteries and practice centres in Europe",
    author: "Sōtōshū Shūmuchō",
    url: "https://www.sotozen.com/eng/temples/regional_office/europe.html",
    publicationDate: "2025",
    reliability: "authoritative",
  },
];

/**
 * Stub author entries for Japanese Sōtō masters referenced as the
 * actual shihō-giving teachers of Deshimaru's senior European disciples.
 *
 * Background: Taisen Deshimaru himself did not give formal dharma
 * transmission (shihō) to any of his Western disciples — his Sōtō
 * status was authenticated posthumously through Yamada Reidō and
 * confirmed at Eihei-ji, and his closest disciples (Zeisler, Rech,
 * Thibaut, Triet, Coupey, Wang-Genh, Bovay, …) received their shihō
 * from a small handful of Japanese masters in the years after
 * Deshimaru's 1982 death. The Deshimaru → X edges in this file record
 * the ordination / discipleship relationship as `secondary`, while the
 * actual shihō edges are recorded against the four masters below
 * (Niwa Zenji, Yūkō Okamoto, Kishigami Kōjun, Dōshō Saikawa) as
 * `primary` with isPrimary=true. This separation lets the lineage
 * graph honestly distinguish "ordained by" from "received shihō from".
 *
 * Niwa  Rempō Zenji → Zeisler, Rech, Thibaut (1984 at Eihei-ji)
 * Yūkō  Okamoto     → Triet (1997), Bovay (1998 at Teishōji)
 * Kishigami Kōjun   → Coupey (31 August 2008, Dōjō Zen de Paris)
 * Dōshō Saikawa     → Wang-Genh (2001)
 */
const SOTO_PARENT_STUBS: KVMaster[] = [
  {
    slug: "niwa-rempo-zenji",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Niwa Rempō Zenji" },
      { locale: "en", nameType: "alias", value: "Renpō Niwa" },
      { locale: "en", nameType: "alias", value: "Niwa Zenji" },
      { locale: "ja", nameType: "dharma", value: "丹羽廉芳" },
    ],
    birthYear: 1905,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1993,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Niwa Rempō Zenji (丹羽廉芳, 1905–1993) was a senior Japanese Sōtō master who served as the 77th abbot (kanchō) of Daihonzan Eihei-ji from 1985 until his death in 1993, after some five decades of monastic life at Eihei-ji proper[1]. Within twentieth-century Sōtōshū historiography he is remembered for two distinct things: his stewardship of Eihei-ji during the institutional consolidation of the modern Sōtō school, and his decisive role in formally authenticating Taisen Deshimaru's European mission after Deshimaru's 1982 death[1].\n\nIn 1984, two years after Deshimaru died, Niwa Zenji conferred dharma transmission (shihō) on three of Deshimaru's closest French disciples — Étienne Mokushō Zeisler, Roland Yuno Rech, and Stéphane Kōsen Thibaut — at Eihei-ji[1][2]. That single act of triple shihō is the formal Japanese-Sōtō recognition by which the entire Association Zen Internationale (AZI) line in Europe is institutionally anchored: where Deshimaru had operated until 1982 as an ordained Sōtō monk but without himself being authorised to transmit, the 1984 shihō from Eihei-ji's incoming abbot brought his three senior heirs inside the regular Sōtōshū succession and made it possible for them, in turn, to transmit forward[1].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "en.wikipedia.org — Taisen Deshimaru § Students: \"After Master Deshimaru's death, three of his closest disciples — Etienne Zeisler, Roland Rech, and Kosen Thibaut — traveled to Japan to receive shiho from Master Rempo Niwa Zenji\"",
      },
      {
        sourceId: "src_sotozen_jp",
        fieldName: "biography",
        pageOrSection: "Sōtōshū Shūmuchō register — Niwa Rempō, 77th abbot of Eihei-ji 1985–1993",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Taisen Deshimaru § Students (1984 shihō to Zeisler / Rech / Thibaut)" },
      { index: 2, sourceId: "src_sotozen_jp", pageOrSection: "Sōtōshū Shūmuchō — Eihei-ji abbacy register" },
    ],
    transmissions: [
      {
        teacherSlug: "niwa-butsuan",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_terebess", "src_wikipedia"],
        notes:
          "Dharma transmission (shihō) 1926 from his uncle Niwa Butsuan at Tōkei-in (Shizuoka). Per the Niwa Rempō biography on terebess.hu: \"ordained at age 12 (1916) under Niwa Butsuan at Tōkei-in ... received dharma transmission from him in 1926.\" Niwa subsequently trained at Antai-ji during Sawaki Kōdō's era.",
      },
    ],
  },
  {
    slug: "yuko-okamoto",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Yūkō Okamoto" },
      { locale: "en", nameType: "alias", value: "Yuko Okamoto" },
      { locale: "en", nameType: "alias", value: "Okamoto Roshi" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Yūkō Okamoto Roshi is a Japanese Sōtō master based at Teishōji and an intimate of Taisen Deshimaru's later generation of senior European disciples — described in the AZI biographical record of Raphaël Dōkō Triet as \"a friend of Master Deshimaru\"[1]. The publicly attested portion of his career runs principally through his role as a shihō-giving teacher for two of Deshimaru's senior heirs: he conferred dharma transmission on Raphaël Dōkō Triet in 1997[1], and on Michel Meihō Reikū Bovay at Teishōji in 1998[2]. Both transmissions anchor important branches of the AZI European Sōtō line — the Iberian / Andalusian Seikyūji and Lisbon networks (Triet) and the Swiss-German Zen Dōjō Zürich network (Bovay) — formally to the Japanese Sōtōshū through the Teishōji line.",
    citations: [
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection: "zen-azi.org — Raphaël Dōkō Triet biography: \"In 1997, he received the Dharma transmission from Master Yuko Okamoto, a friend of Master Deshimaru\"",
      },
      {
        sourceId: "src_dojo_lausanne",
        fieldName: "biography",
        pageOrSection: "Muijoji / zen.ch — Michel Reikū Bovay biography: \"shihō 1998 from Yūkō Okamoto Roshi at Teishōji\"",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "zen-azi.org — Raphaël Dōkō Triet biography (1997 transmission from Okamoto)" },
      { index: 2, sourceId: "src_dojo_lausanne", pageOrSection: "Muijoji / zen.ch — Michel Reikū Bovay biography (1998 transmission at Teishōji)" },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_azi", "src_dojo_lausanne"],
        notes:
          "Editorial bridge: Yūkō Okamoto Rōshi inherited Teishōji (Saku, Nagano) via the temple-family succession; his father (the prior Teishōji abbot, not yet seeded) was a personal friend of Sawaki Kōdō, who used Teishōji as a sesshin venue. The edge to Sawaki anchors Okamoto in the 20th-century Sōtō reform milieu through the documented Teishōji–Sawaki connection rather than the 13th-century Dōgen root.",
      },
    ],
  },
  {
    slug: "kishigami-kojun",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Kōjun Kishigami" },
      { locale: "en", nameType: "alias", value: "Kojun Kishigami" },
      { locale: "ja", nameType: "dharma", value: "岸上耕巖" },
    ],
    birthYear: 1941,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Kōjun Kishigami (岸上耕巖, born 1941 in Kagawa Prefecture) is a Japanese Sōtō Zen monk, a direct disciple of Kōdō Sawaki Roshi, and the founder of the Jinkoan hermitage in Mie Prefecture[1]. He received dharma transmission (shihō) from Sawaki approximately one month before his master's death in December 1965, making him one of the youngest of Sawaki's recognised heirs[1].\n\nFollowing Sawaki's death he undertook a long period of training in Japan and Europe, and from the 1990s onward he was associated with the Sangha Sans Demeure / Zen Road network founded by Philippe Reiryū Coupey in Paris. On 31 August 2008, at the Dojo Zen de Paris, he conferred shihō on Coupey — the only publicly documented dharma transmission Kishigami has performed outside Japan, and the formal completion of a Sawaki → Kishigami → Coupey line that runs in parallel to the older Sawaki → Deshimaru → Coupey ordination line[2][3].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "fr.wikipedia.org — Kishigami Kojun (born 1941, Kagawa; shihō from Sawaki c. 1965)",
      },
      {
        sourceId: "src_sangha_sans_demeure",
        fieldName: "biography",
        pageOrSection: "Sangha Sans Demeure — Kōjun Kishigami; 31 August 2008 transmission to Philippe Coupey at Dojo Zen de Paris",
      },
      {
        sourceId: "src_zen_road",
        fieldName: "biography",
        pageOrSection: "Zen Road — Kōjun Kishigami biographical sketch",
      },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_sangha_sans_demeure"],
        notes:
          "Dharma transmission (shihō) received from Kōdō Sawaki c. 1965, approximately one month before Sawaki's death.",
      },
    ],
  },
  {
    slug: "dosho-saikawa",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Dōshō Saikawa" },
      { locale: "en", nameType: "alias", value: "Dosho Saikawa" },
      { locale: "en", nameType: "alias", value: "Dōshō Saikawa Roshi" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Dōshō Saikawa Roshi is a Japanese Sōtō Zen master, abbot of Hossen-ji in Yamagata Prefecture and currently abbot of Kasuisai in Shizuoka Prefecture — one of the largest monastic training temples of the modern Sōtō school[1]. For several years he was in charge of welcoming foreign visitors at Sōji-ji, one of the two head temples of Sōtō Zen, and spent nearly a decade in the United States serving in various Sōtō temples; this American period gave him an unusual fluency with non-Japanese practitioners by the standards of Sōtōshū prelates of his generation[1][2].\n\nIn 2001 he conferred dharma transmission (shihō) on the French monk Olivier Reigen Wang-Genh, founder of Kōsan Ryūmon-ji in Alsace — anchoring one of the principal European AZI temples in the modern Sōtōshū register[1][2][3]. The Brazilian Daissen-ji (São Paulo) is also listed by the Sōtōshū under his and Genshō Roshi's authority, suggesting at least one further non-Japanese transmission, though the details have not been independently verified outside the Sōtōshū directory.",
    citations: [
      {
        sourceId: "src_ryumonji_alsace",
        fieldName: "biography",
        pageOrSection:
          "meditation-zen.org/en/the-teachers — accessed 2026-05-11; verbatim: \"Master Dōshō Saikawa is the abbot of Hossen-ji Temple in Yamagata Prefecture, in the northwest of Japan. For several years, he was in charge of welcoming foreign visitors at Sōji-ji Temple. He spent nearly ten years in the United States, serving in various temples. He is now the abbot of Kasuisai, one of the largest monastic training temples in Japan.\"",
      },
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection:
          "zen-azi.org/en/olivier-reigen-wang-genh — accessed 2026-05-11; \"In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
      },
      {
        sourceId: "src_sotozen_europe",
        fieldName: "biography",
        pageOrSection: "Sōtōshū directory — Hossen-ji (Yamagata), Kasuisai (Shizuoka), and the Brazilian Daissen-ji listed under Saikawa Roshi / Genshō Roshi.",
      },
    ],
    transmissions: [],
  },
  // ── Three thin master stubs for the un-seeded mid-20th-c. shihō teachers ──
  // Niwa Butsuan, Daichō Hayashi, and Hōzan Kōei Chino are the actual
  // Dharma-transmission teachers of three figures whose previous "parent"
  // edges were 700-year editorial bridges to Dōgen. By authoring each as
  // a thin master row with citations, we turn the bridges into real
  // transmission edges. Each of these teachers' own predecessors is not
  // yet seeded (Japanese-language sources required) — they appear as new
  // editorial bridges to the nearest seeded Sōtō ancestor.
  {
    slug: "niwa-butsuan",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Niwa Butsuan" },
      { locale: "en", nameType: "alias", value: "Butsuan Niwa" },
      { locale: "ja", nameType: "dharma", value: "丹羽佛庵" },
    ],
    birthYear: 1864,
    birthPrecision: "approximate",
    birthConfidence: "low",
    deathYear: 1937,
    deathPrecision: "approximate",
    deathConfidence: "low",
    biography:
      "Niwa Butsuan (丹羽佛庵, c. 1864–1937) was a Japanese Sōtō priest and head of Tōkei-in in Shizuoka Prefecture in the late Meiji and early Shōwa periods. His chief historical importance is as the ordaining and Dharma-transmitting teacher of his nephew Niwa Rempō (the future 77th abbot of Eihei-ji): Rempō was ordained at age 12 (1916) under Butsuan at Tōkei-in and received Dharma transmission (shihō) from him in 1926[1]. Outside this transmission line, biographical information on Butsuan is sparse in English-language sources, and a fuller portrait would require Japanese-language primary materials from Tōkei-in's own succession registers[1][2].",
    citations: [
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection:
          "terebess.hu/zen/mesterek/NiwaRempo.html — biography of Niwa Rempō: \"ordained at age 12 (1916) under Niwa Butsuan at Tōkei-in ... received dharma transmission from him in 1926.\"",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Rempo_Niwa — confirms Rempō's Tōkei-in training and later Eihei-ji abbacy.",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_terebess",
        pageOrSection:
          "terebess.hu — Niwa Rempō biography (1916 ordination, 1926 shihō at Tōkei-in)",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Rempo Niwa",
      },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_terebess"],
        notes:
          "Editorial bridge: Niwa Butsuan's own teacher in the Eihei-ji-line succession is not yet seeded in the DB. The edge to Sawaki Kōdō anchors him in the same late-Meiji / early-Shōwa Sōtō reform milieu rather than the 13th-century Dōgen root. Pending Japanese-source research into Tōkei-in's succession register.",
      },
    ],
  },
  {
    slug: "daicho-hayashi",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Daichō Hayashi" },
      { locale: "en", nameType: "alias", value: "Daicho Hayashi" },
      { locale: "en", nameType: "alias", value: "Hayashi Daichō" },
      { locale: "ja", nameType: "dharma", value: "林大潮" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Daichō Hayashi (林大潮) was a Japanese Sōtō priest and head of Taizō-in in Fukui Prefecture in the mid-twentieth century. He is recorded in the Minnesota Zen Meditation Center's biographical materials on Dainin Katagiri as the master who ordained Katagiri as a monk at Taizō-in and named him Dharma heir on 24 December 1949 (denpō ceremony, Katagiri age 21)[1][2]. Outside this Katagiri-transmission act, English-language biographical information on Hayashi is sparse; the immediate teachers and predecessors in his own line at Taizō-in are not yet documented in publicly accessible sources, and would require Japanese-language temple records to seed accurately[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Dainin_Katagiri — \"ordained a monk by and named a Dharma heir of Daicho Hayashi at Taizo-in in Fukui.\"",
      },
      {
        sourceId: "src_mnzencenter_katagiri_biography",
        fieldName: "biography",
        pageOrSection:
          "Andrea Martin, \"Ceaseless Effort: The Life of Dainin Katagiri Roshi\" (MNZC) — \"On December 24, 1949, Daichō Hayashi performed the denpō ceremony — formal transmission of Dharma — for Katagiri at Taizō-in.\"",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection:
          "en.wikipedia.org — Dainin Katagiri (Taizō-in ordination and Dharma transmission)",
      },
      {
        index: 2,
        sourceId: "src_mnzencenter_katagiri_biography",
        pageOrSection:
          "MNZC — Andrea Martin, \"Ceaseless Effort\" biography of Katagiri (1949 denpō)",
      },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_mnzencenter_katagiri_biography"],
        notes:
          "Editorial bridge: Daichō Hayashi's own teacher and predecessor at Taizō-in are not yet seeded in the DB. The edge to Sawaki Kōdō anchors him in the contemporary mid-Shōwa Sōtō world rather than the 13th-century Dōgen root. Pending Japanese-source research into the Taizō-in succession register.",
      },
    ],
  },
  {
    slug: "hozan-koei-chino",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Hōzan Kōei Chino" },
      { locale: "en", nameType: "alias", value: "Hozan Koei Chino" },
      { locale: "en", nameType: "alias", value: "Kōei Chino" },
      { locale: "en", nameType: "alias", value: "Koei Chino" },
      { locale: "ja", nameType: "dharma", value: "知野弘恵" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Hōzan Kōei Chino (知野弘恵) was a Japanese Sōtō priest and head of Jōkō-ji in Kamo (Niigata Prefecture). He is the adoptive father and Dharma-transmission teacher of Kōbun Chino Otogawa, who was raised at Jōkō-ji after his birth father's death and received Dharma transmission (shihō) from Hōzan Kōei in 1962[1][2]. Kōbun went on to become one of the most influential Japanese Sōtō teachers in the postwar American transmission, founding Hōkō-ji (Taos, NM) and Jikoji (Santa Cruz Mountains), and an early teacher to Steve Jobs. The Eihei-ji training Kōbun undertook in his twenties under Kōdō Sawaki was a practice / onshi training, distinct from the shihō relationship with his adoptive father Hōzan Kōei[1].",
    citations: [
      {
        sourceId: "src_kobun_sama_biography",
        fieldName: "biography",
        pageOrSection:
          "jikojizencenter.org/biography — \"He received dharma transmission from Koei Chino Roshi in Kamo in 1962.\"",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/K%C5%8Dbun_Chino_Otogawa — \"Following the death of his birth father, Kōbun was adopted by his uncle, Hōzan Kōei Chino, who became his Sōtō teacher.\"",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_kobun_sama_biography",
        pageOrSection:
          "Jikoji Zen Center — biography of Kōbun Chino Otogawa (1962 transmission from Hōzan Kōei Chino at Kamo)",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection:
          "en.wikipedia.org — Kōbun Chino Otogawa",
      },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_kobun_sama_biography"],
        notes:
          "Editorial bridge: Hōzan Kōei Chino's own teacher and predecessor at Jōkō-ji are not yet seeded. The edge to Sawaki Kōdō anchors him in the contemporary mid-Shōwa Sōtō world rather than the 13th-century Dōgen root. Pending Japanese-source research into the Jōkō-ji succession register.",
      },
    ],
  },
];

const ORIGINAL_DESHIMARU_MASTERS: KVMaster[] = [
  {
    slug: "philippe-reiryu-coupey",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Philippe Reiryū Coupey" },
      { locale: "en", nameType: "alias", value: "Philippe Reiryu Coupey" },
      { locale: "en", nameType: "alias", value: "Reiryū Coupey" },
      { locale: "en", nameType: "alias", value: "Reiryu Coupey" },
    ],
    birthYear: 1937,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Philippe Reiryū Coupey (born 8 December 1937 in New York City) is an American-born Sōtō Zen monk in the lineage of Taisen Deshimaru and Kōdō Sawaki, and one of the longest-serving teachers at the Dojo Zen de Paris. After studies in literature he settled in Paris in 1968 and met Deshimaru four years later, in 1972, becoming Reiryū Coupey — a close disciple who served as Deshimaru's principal English-language transcriber of the master's kusen until Deshimaru's death in 1982 (per fr.wikipedia, Association Zen Internationale, Buddhachannel)[1].\n\nAfter 1982 he continued teaching at AZI; since 1994 he has directed an annual summer session at La Gendronnière, the AZI mother temple. He is the spiritual reference for some thirty dōjōs across France, Germany, England, and Switzerland, teaches at the Dojo Zen de Paris and the Seine Zen group, and leads sesshins through his international community Sangha Sans demeure (\"the Homeless Sangha\", organised through Zen Road). On 31 August 2008, at the Dojo Zen de Paris, he received dharma transmission (shihō) from Master Kishigami Kōjun, completing a transmission lineage that traces back through Sawaki to Dōgen[2].\n\nHis French books include Zen, simple assise — Le Fukanzazengi de Maître Dōgen (Désiris, 2009), Mon corps de lune (Désiris, 2007), Le chant du vent dans l'arbre sec (L'Originel, 2011), Dans le ventre du Dragon — Le Shinjinmei de Maître Sosan (Deux versants, 2002), Zen d'aujourd'hui (Le Relié, 2014), Les 10 taureaux du zen (2020), Fragments Zen (L'Originel, 2021), and the recent Minuit est la vraie lumière (Éditions de l'Éveil, 2023). His English-language Hohm Press editions Zen, Simply Sitting (2007), The Song of the Wind in the Dry Tree (2014), and In the Belly of the Dragon (2020) made the AZI lineage accessible to English-speaking readers, and as Deshimaru's transcriber he assembled the canonical posthumous Deshimaru titles La voix de la vallée (1994), Le rugissement du Lion (1994), Zen et karma (2016), and Les Deux Versants du Zen (2018). He also writes fiction under the pseudonym M.C. Dalley[3].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Philippe Coupey" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Philippe Reiryū Coupey" },
      { sourceId: "src_zen_road", fieldName: "biography", pageOrSection: "Sangha Sans demeure — Philippe Coupey" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_zen_road", pageOrSection: "Zen Road — Sangha Sans demeure" },
      { index: 2, sourceId: "src_zen_road", pageOrSection: "Zen Road — Sangha Sans demeure" },
      { index: 3, sourceId: "src_zen_road", pageOrSection: "Zen Road — Sangha Sans demeure" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_wikipedia"],
        notes: "Ordained as a monk by Deshimaru in 1972; longtime resident teacher at the Dojo Zen de Paris.",
      },
    ],
  },
  {
    slug: "olivier-reigen-wang-genh",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Olivier Reigen Wang-Genh" },
      { locale: "en", nameType: "alias", value: "Olivier Wang-Genh" },
      { locale: "en", nameType: "alias", value: "Reigen Wang-Genh" },
    ],
    birthYear: 1955,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Olivier Reigen Wang-Genh (born 17 April 1955 in Molsheim, Alsace) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of the temple Kōsan Ryūmon-ji at Weiterswiller in northern Alsace (per fr.wikipedia, Association Zen Internationale, l'Alsace). He encountered Sōtō Zen in March 1973 and was ordained as a monk in 1977 by Taisen Deshimaru, whose teaching he followed until Deshimaru's death in 1982[1].\n\nFrom 1973 onward he developed the Strasbourg dōjō and took over its direction in 1986. Beginning in 1987, with the support of the German and French sanghas, he founded dōjōs across Baden-Württemberg, Alsace, and Basel — establishing the trans-Rhenan AZI network that today links French and German-speaking practitioners. In 1999 he founded Kōsan Ryūmon-ji (古山龍門寺, \"Temple of the Dragon Gate of the Old Mountain\") in Weiterswiller; he became its official abbot in 2010. In 2001 he received dharma transmission (shihō) from the Japanese master Dōshō Saikawa, and in 2004 was appointed kyōshi (教師, missionary monk) of the Sōtō school[2].\n\nHis institutional record is unusually broad: he served as president of the Union Bouddhiste de France (2007–2012, 2015–2017) and délégué president since 2021, vice-president (2012–2015, 2017–2019), and co-president (2019–2020); he has been president of the Association Zen Internationale since 2015 and of the Communauté bouddhiste d'Alsace since 2010. As UBF president he represents Buddhism in the Conférence des Responsables de Culte en France. He was named Knight of the Order of National Merit in 2016[3].\n\nHis books include Shushōgi: commentaires et enseignements (Éd. Ryumon Ji, 2006), C'est encore loin l'Éveil (Le Relié, 2020), and Six Paramita (Ryumon Ji)[4].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Olivier Wang-Genh" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Olivier Reigen Wang-Genh" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Kōsan Ryūmon-ji" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 4, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_sotozen_europe"],
        notes: "Ordained by Deshimaru; founder of Kōsan Ryūmon-ji (Weiterswiller, Alsace) and former AZI / UBF president.",
      },
    ],
  },
  {
    slug: "michel-reiku-bovay",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Michel Reikū Bovay" },
      { locale: "en", nameType: "alias", value: "Michel Reiku Bovay" },
      { locale: "en", nameType: "alias", value: "Reikū Bovay" },
    ],
    birthYear: 1944,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2009,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Michel Meihō Missen Reikū Bovay (1944–2009) was a Swiss Sōtō Zen monk in the Deshimaru lineage, born in Monthey in the Valais. He began zazen with Taisen Deshimaru in Paris in 1972, was ordained as a monk by him, and became one of Deshimaru's closest Swiss-French disciples — part of the small group who took on the responsibility of holding the European Sōtō community together after the founder's death in 1982[1].\n\nBovay's most enduring contribution is on the page. With co-authors Lucien Marchand and Laurent Strim he wrote the 1987 introductory volume Zen (published in the \"Bref\" series of Éditions du Cerf), one of the very first comprehensive French-language presentations of the tradition's history, doctrine, and practice — a book that introduced an entire generation of French-speaking readers to AZI-style Sōtō. He continued for decades as one of the principal interpreters of Deshimaru's teaching for a Francophone lay audience. From 1995 to 2003 he served as president of the Association Zen Internationale[2].\n\nReturning to Switzerland in 1985, Bovay re-established his teaching at the Zen Dōjō Zürich — the dōjō originally founded by Deshimaru in 1975 — and from there extended the AZI network across German- and French-speaking Switzerland, training a generation of Swiss practitioners. In 1998 he received dharma transmission (shihō) from Yūkō Okamoto Roshi at Teishōji in Japan. Following a serious illness, in 2007 he handed responsibility for the Zen Dōjō Zürich to his eldest disciple, the Zen nun Eishuku Monika Leibundgut, whom he supported until his death in 2009. In 2022, thirteen years after his death, Éditions Le Relié published Deshimaru: Histoires vécues avec un maître zen — a posthumous collection of his memoirs of life and training under Deshimaru. Through these two books Bovay remains, alongside Pierre Crépon and Évelyne de Smedt, one of the principal first-generation French-language witnesses to Deshimaru's mission[3].",
    citations: [
      { sourceId: "src_dojo_lausanne", fieldName: "biography", pageOrSection: "Muijoji / zen.ch — Meiho Missen Michel Bovay (born 1944, Monthey; primary seat Zen Dōjō Zürich; shihō 1998 from Yūkō Okamoto Roshi at Teishōji; AZI presidency 1995–2003; 2007 handover to Eishuku Monika Leibundgut)" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Zen Dōjō Zürich — Maître Michel Reikū Bovay" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "Bibliographie de Taisen Deshimaru" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_wikipedia"],
        notes: "Ordained by Deshimaru in the early 1970s; primary teaching seat from 1985 was the Zen Dōjō Zürich (originally founded by Deshimaru in 1975). Senior Swiss AZI teacher; AZI president 1995–2003.",
      },
    ],
  },
  {
    slug: "evelyne-eko-de-smedt",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Évelyne Ekō de Smedt" },
      { locale: "en", nameType: "alias", value: "Evelyne Eko de Smedt" },
      { locale: "en", nameType: "alias", value: "Ekō de Smedt" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Évelyne Ekō / Reiko de Smedt is a French Sōtō Zen nun in the Deshimaru lineage and one of Taisen Deshimaru's earliest female disciples. Listed on the Association Zen Internationale teacher roster as Maître Évelyne Reiko de Smedt — Ekō (慧光, \"luminous wisdom\") and Reiko being two forms of her dharma name — she was ordained by Deshimaru in the 1970s and became part of the small editorial circle around the master[1].\n\nHer most consequential contribution to Deshimaru's western mission was as a co-author. With Lucien Marchand she wrote Zen, religion de la vie quotidienne (Albin Michel, 1976) — among the very first French-language presentations of Zen as Deshimaru taught it, written contemporaneously with Deshimaru's own Paris mission and frequently reissued as a standard introductory text. She also collaborated with Deshimaru himself on L'Anneau de la Voie (\"The Ring of the Way\"), an early formal presentation of the kusen (oral teaching given during zazen) genre in French. Several of Deshimaru's most-cited posthumous books carry her preface — including the 1985 edition of Zen et vie quotidienne (Albin Michel), introduced by her[2].\n\nWithin AZI she has led zazen and sesshin at Parisian dōjōs and at the temple La Gendronnière for several decades, and she co-authored with Pierre Dōkan Crépon the wider survey L'Esprit du Zen (Hachette, 2005). Her steady editorial presence across the AZI press is largely responsible for the way Deshimaru's spoken kusen became readable French text — and for the shape in which that teaching reached subsequent generations of European practitioners[3].",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Évelyne Reiko de Smedt" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "Bibliographie de Taisen Deshimaru — préface d'Evelyn de Smedt" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_wikipedia"],
        notes: "Ordained by Deshimaru; co-author with Deshimaru of L'Anneau de la Voie and longtime AZI teacher.",
      },
    ],
  },
  {
    slug: "pierre-reigen-crepon",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Pierre Reigen Crépon" },
      { locale: "en", nameType: "alias", value: "Pierre Reigen Crepon" },
      { locale: "en", nameType: "alias", value: "Reigen Crépon" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Pierre Reigen / Dōkan Crépon is a French Sōtō Zen monk in the Deshimaru lineage and the principal historian-biographer of Taisen Deshimaru in French. He is listed on the Association Zen Internationale teacher directory as Maître Pierre Dōkan Crépon (Dōkan being his Sōtō dharma name; Reigen the form preserved in older AZI records). Ordained by Deshimaru, he has taught within AZI for several decades[1].\n\nCrépon's enduring contribution is on the page. His long-form essay Maître Taisen Deshimaru et l'arrivée du zen en Europe — published on zen-azi.org and cited by the French Wikipedia article on Deshimaru as the canonical French-language source on the master's life — is the standard AZI account of Deshimaru's 1967 arrival in Paris and the founding decade of European Zen. Together with Évelyne Ekō de Smedt he co-authored L'Esprit du Zen (Hachette, 2005), one of the most widely-read French introductions to the tradition. He has also worked extensively as a translator of Buddhist literature[2].\n\nHis combined institutional and editorial role — practising teacher and primary chronicler — has made him largely responsible for the standard biographical understanding of the AZI tradition's founder. Where another disciple might pass on the master's silence by sitting, Crépon has done it by writing the silence's history[3].",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Pierre Dōkan Crépon — book \"Maître Taisen Deshimaru et l'arrivée du zen en Europe\"" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Taisen Deshimaru, citing Crépon" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_wikipedia"],
        notes: "Ordained by Deshimaru; principal French-language biographer of the master and AZI teacher.",
      },
    ],
  },
  {
    slug: "jean-pierre-genshu-faure",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Jean-Pierre Genshū Faure" },
      { locale: "en", nameType: "alias", value: "Jean-Pierre Genshu Faure" },
      { locale: "en", nameType: "alias", value: "Genshū Faure" },
      { locale: "en", nameType: "alias", value: "Genshu Faure" },
    ],
    birthYear: 1948,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Jean-Pierre Genshū / Taiun Faure (born 1948) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of the Temple Zen Kanshōji in the Dordogne. He is listed on the Association Zen Internationale teacher directory as Maître Jean-Pierre Taiun Faure (Taiun being his official Sōtō dharma name; Genshū is the alternate form preserved in older AZI records). Faure began practice with Taisen Deshimaru in the 1970s, was ordained as a monk by him, and followed Deshimaru until his death in 1982[1].\n\nAfter Deshimaru's death Faure continued his training in Japan, deepening his ritual education within mainstream Sōtō. He served for years as godo at La Gendronnière — the AZI mother temple — where his teaching of Sōtō ceremonial and discipline shaped a wide network of European practitioners. Kanshōji, founded by Faure as a residential Sōtō practice temple in the rural Dordogne, is registered with the Sōtōshū Europe Office and recognised as one of the principal European Sōtō monasteries outside La Gendronnière and Ryūmon-ji[2].\n\nThe surviving images on the Kanshōji website show him alongside Minamizawa Rōshi, the senior Eihei-ji master who has officiated at the temple's ojukai (lay ordination) ceremonies — a public marker of Faure's integration into both the Deshimaru-AZI lineage and the formal Japanese Sōtō institution. The temple's lay community spans France and the wider Francophone Buddhist world, and Faure has trained a number of younger AZI-lineage teachers[3].",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Jean-Pierre Taiun Faure" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Kanshōji" },
      { sourceId: "src_kanshoji", fieldName: "biography", pageOrSection: "Le monastère Kanshōji — fondateur et lignée" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_sotozen_europe"],
        notes: "Ordained by Deshimaru; founder and abbot of Temple Zen Kanshōji (Dordogne).",
      },
    ],
  },
  {
    slug: "vincent-keisen-vuillemin",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Vincent Keisen Vuillemin" },
      { locale: "en", nameType: "alias", value: "Keisen Vuillemin" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Vincent Keisen Vuillemin is a Swiss Sōtō Zen monk in the Deshimaru–Zeisler line and the founder of the Dōjō Zen de Genève. He was ordained by Taisen Deshimaru in the late 1970s; after Deshimaru's death in 1982 he pursued his deeper formation as a disciple of Étienne Mokushō Zeisler, with whom he was closely associated until Zeisler's death in 1990. Mokusho Zen House Budapest — the Hungarian sangha founded by Yvon Myōken Bec, Zeisler's dharma-heir — explicitly identifies Vuillemin as \"Vincent Keisen Vuillemin, from Geneva, disciple of master Zeisler\"[1].\n\nThrough the Geneva dōjō and the Romandie network around it, Vuillemin has taught zazen in French-speaking Switzerland for several decades, becoming one of the principal AZI-affiliated teachers in the region. The Dōjō Zen de Genève is listed on the AZI directory and on the Sōtōshū Europe Office's directory of practice centres, and has served as one of the stable Romandie nodes through which the European Sōtō network has continued to organise itself across the second and third generations after Deshimaru[2].\n\nHis distinctive position — a direct disciple of Deshimaru in his ordination but a successor of Zeisler in his deeper training — places him on the bridge between the founding AZI generation and the eastward-leaning Mokusho line that Zeisler launched into Romania, Hungary, and the broader post-communist East before his early death in Vienna[3].",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Dōjō Zen de Genève" },
      { sourceId: "src_mokusho_house", fieldName: "biography", pageOrSection: "Mokusho Zen House — Our Story (identifies Vuillemin as a Zeisler disciple)" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 2, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi", "src_mokusho_house"],
        notes: "Ordained by Deshimaru; founder of the Dōjō Zen de Genève.",
      },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────
// Branch merge: combine ORIGINAL_DESHIMARU_MASTERS with the six branch
// rosters (A–F) and the Sōtō / Sawaki parent stubs needed by Branch D
// and Branch E patches. Duplicate slugs are reconciled by keeping the
// later entry (which is typically the more thoroughly-cited branch
// version) but merging in the original transmissions that the branch
// version may not yet record.
// ───────────────────────────────────────────────────────────────────────

function dedupeMasters(masters: KVMaster[]): KVMaster[] {
  const bySlug = new Map<string, KVMaster>();
  for (const m of masters) {
    const existing = bySlug.get(m.slug);
    if (!existing) {
      bySlug.set(m.slug, { ...m, transmissions: [...m.transmissions], citations: [...m.citations], names: [...m.names] });
      continue;
    }
    // Prefer the later entry's biography/citations (branch versions are
    // generally more thoroughly cited), but merge transmission edges so
    // that secondary edges from one source survive alongside primary
    // edges from another.
    const merged: KVMaster = {
      ...m,
      names: dedupeNames([...existing.names, ...m.names]),
      citations: [...existing.citations, ...m.citations],
      transmissions: dedupeTransmissions([...existing.transmissions, ...m.transmissions]),
    };
    bySlug.set(m.slug, merged);
  }
  return Array.from(bySlug.values());
}

function dedupeNames(names: KVMaster["names"]): KVMaster["names"] {
  const seen = new Set<string>();
  const out: KVMaster["names"] = [];
  for (const n of names) {
    const key = `${n.locale}|${n.nameType}|${n.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

function dedupeTransmissions(txs: KVTransmission[]): KVTransmission[] {
  const seen = new Map<string, KVTransmission>();
  for (const t of txs) {
    const key = `${t.teacherSlug}|${t.type}`;
    if (!seen.has(key)) {
      seen.set(key, t);
    }
  }
  return Array.from(seen.values());
}

function applyMasterPatches(
  masters: KVMaster[],
  patches: {
    slug: string;
    addTransmissions?: KVTransmission[];
    addCitations?: KVCitation[];
  }[],
  knownSlugs: Set<string>,
): KVMaster[] {
  const bySlug = new Map(masters.map((m) => [m.slug, m]));
  for (const patch of patches) {
    const target = bySlug.get(patch.slug);
    if (!target) continue;
    if (patch.addTransmissions) {
      // Drop edges whose teacherSlug is unknown — graceful tolerance.
      const filtered = patch.addTransmissions.filter((t) =>
        knownSlugs.has(t.teacherSlug),
      );
      target.transmissions = dedupeTransmissions([
        ...target.transmissions,
        ...filtered,
      ]);
    }
    if (patch.addCitations) {
      target.citations = [...target.citations, ...patch.addCitations];
    }
  }
  return masters;
}

const _allMasters: KVMaster[] = dedupeMasters([
  ...ORIGINAL_DESHIMARU_MASTERS,
  ...SOTO_PARENT_STUBS,
  ...BRANCH_A_MASTERS,
  ...BRANCH_B_MASTERS,
  ...BRANCH_C_MASTERS,
  ...BRANCH_D_MASTERS,
  ...BRANCH_E_MASTERS,
  ...BRANCH_F_MASTERS,
]);

const _knownSlugs = new Set(_allMasters.map((m) => m.slug));

export const DESHIMARU_MASTERS: KVMaster[] = applyMasterPatches(
  _allMasters,
  [...BRANCH_D_MASTER_PATCHES, ...BRANCH_E_MASTER_PATCHES],
  _knownSlugs,
);
