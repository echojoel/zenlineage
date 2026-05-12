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
      "Niwa Rempō Zenji (丹羽廉芳, 1905–1993) was a senior Japanese Sōtō master who served as the 77th abbot (kanchō) of Daihonzan Eihei-ji from 1985 until his death in 1993, succeeding the 76th abbot Hata Egyoku Zenji[1]. He had been ordained at age 12 (1916) by his uncle Niwa Butsuan Emyō (丹羽佛庵慧明) at Tōkei-in in Shizuoka Prefecture and received Dharma transmission from him there in 1926[1]. Within twentieth-century Sōtōshū historiography he is remembered for two distinct things: his stewardship of Eihei-ji during the institutional consolidation of the modern Sōtō school, and his decisive role in formally authenticating Taisen Deshimaru's European mission after Deshimaru's 1982 death[1].\n\nIn 1984, two years after Deshimaru died, Niwa Zenji — then assistant abbot of Eihei-ji — travelled to France and conferred dharma transmission (shihō) on three of Deshimaru's closest disciples (Étienne Mokushō Zeisler, Roland Yuno Rech, and Stéphane Kōsen Thibaut) at Temple de la Gendronnière, the AZI mother monastery near Blois. Multiple independent AZI-line institutional sources — ABZE, Méditation Zen Narbonne, Zen Kannon Barcelona, and Dojo Zen Mokushō (Zeisler's successor temple) — locate the ceremony at La Gendronnière, with Niwa wearing a black kesa in mourning for Deshimaru[1][2]. The English-Wikipedia claim that the three disciples \"traveled to Japan\" for the ceremony is a downstream misreading; AZI's own references to \"Eiheiji\" refer to Niwa's institutional rank, not the venue. That single act of triple shihō is the formal Japanese-Sōtō recognition by which the entire Association Zen Internationale (AZI) line in Europe is institutionally anchored: where Deshimaru had operated until 1982 as an ordained Sōtō monk but without himself being authorised to transmit, the 1984 shihō from Eihei-ji's incoming abbot brought his three senior heirs inside the regular Sōtōshū succession and made it possible for them, in turn, to transmit forward[1].",
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
      "Dōshō Saikawa Roshi is a Japanese Sōtō Zen master, abbot of Hossen-ji in Yamagata Prefecture and currently abbot of Kasuisai in Shizuoka Prefecture — one of the largest monastic training temples of the modern Sōtō school[1]. For several years he was in charge of welcoming foreign visitors at Sōji-ji, one of the two head temples of Sōtō Zen, and spent nearly a decade in the United States serving in various Sōtō temples; this American period gave him an unusual fluency with non-Japanese practitioners by the standards of Sōtōshū prelates of his generation[1][2].\n\nIn 2001 he conferred dharma transmission (shihō) on the French monk Olivier Reigen Wang-Genh, founder of Taikōsan Ryūmon-ji in Alsace — anchoring one of the principal European AZI temples in the modern Sōtōshū register[1][2][3]. The Brazilian Daissen-ji (São Paulo) is also listed by the Sōtōshū under his and Genshō Roshi's authority, suggesting at least one further non-Japanese transmission, though the details have not been independently verified outside the Sōtōshū directory.",
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
      { locale: "en", nameType: "dharma", value: "Niwa Butsuan Emyō" },
      { locale: "en", nameType: "alias", value: "Niwa Butsuan" },
      { locale: "en", nameType: "alias", value: "Butsuan Niwa" },
      { locale: "en", nameType: "alias", value: "Butsuan Emyō" },
      { locale: "ja", nameType: "dharma", value: "佛庵慧明" },
      { locale: "ja", nameType: "alias", value: "丹羽佛庵" },
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
  // ── Wave 2 (medieval Japanese Sōtō + Tokugawa-Meiji bridge) ──────────────
  // Authored from the 10-agent verifier pilot on Gasan-go-tetsu and the
  // Tokugawa / Meiji backbone. Filling the Dōgen→modern gap in the spine.
  {
    slug: "jakuen",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Jakuen" },
      { locale: "en", nameType: "alias", value: "Jiyuan" },
      { locale: "ja", nameType: "dharma", value: "寂円" },
    ],
    birthYear: 1207,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1299,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Jakuen (寂円, 1207–1299), also rendered Jiyuan in Chinese sources, was a Chinese-born Sōtō master and a fellow disciple of Dōgen under Tiantong Rujing at the Tiantong-shan monastery in Southern Song China[1]. He travelled to Japan after Rujing's 1228 death and served as caretaker of Rujing's jōyōden memorial hall at Eihei-ji under Dōgen and then Koun Ejō; the formal Dharma transmission he received in Japan came from Ejō rather than directly from Dōgen. He left Eihei-ji in 1261 during the *sandai sōron* dispute and was given the temple Hōkyō-ji in Echizen by Hatano Tomanari in 1278, modelled on Tiantong-shan[1][2].\n\nJakuen's lineage is a distinct parallel stream in early Japanese Sōtō: his Dharma heir Giun (1253–1333) became the 5th abbot of Eihei-ji from 1314, and Jakuen's line — not Keizan's — actually controlled Eihei-ji from 1314 until 1468, when the Keizan branch took ownership[2]. Hōkyō-ji remains a parallel Sōtō sub-line, officially in communion with the modern Sōtōshū but historically regarding Jakuen rather than Keizan as its founding patriarch.",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Jakuen — \"a Chinese Zen Buddhist monk and a disciple of Rujing\"; biographical detail confirmed across en.wikipedia, ja.wikipedia, Japanese Wiki Corpus.",
      },
      {
        sourceId: "src_bodiford_soto_medieval",
        fieldName: "biography",
        pageOrSection:
          "ch. on the Eihei-ji abbacy and the Jakuen line; en.wikipedia.org/wiki/Eihei-ji — \"After 1468, when the Keizan line took ownership of Eihei-ji…Jakuen's line…became less prominent.\"",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Jakuen + Hōkyō-ji" },
      { index: 2, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. 7 — the Eihei-ji succession and the Jakuen line control 1314–1468" },
    ],
    transmissions: [
      {
        teacherSlug: "tiantong-rujing",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia"],
        notes:
          "Disciple of Tiantong Rujing in parallel with Dōgen — Jakuen and Dōgen are fellow disciples, not in a teacher-student relationship. Formal Japanese Dharma transmission was received later from Koun Ejō (recorded as a secondary edge below); the canonical lineage line in early Sōtō runs Rujing → Jakuen rather than through Dōgen.",
      },
      {
        teacherSlug: "koun-ejo",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Formal Dharma transmission in Japan from Koun Ejō at Eihei-ji after Dōgen's death. The Rujing edge is the lineage-source; this is the institutional Japanese-Sōtō shihō.",
      },
    ],
  },
  {
    slug: "tsugen-jakurei",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Tsūgen Jakurei" },
      { locale: "en", nameType: "alias", value: "Tsugen Jakurei" },
      { locale: "ja", nameType: "dharma", value: "通幻寂霊" },
    ],
    birthYear: 1322,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1391,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Tsūgen Jakurei (通幻寂霊, 1322–1391) was one of Gasan Jōseki's five great heirs (the *Gasan-go-tetsu*) and the founder of the Tsūgen-ha sub-line of medieval Sōtō, which became the largest of Gasan's five branches with approximately 8,900 affiliated temples at its eventual peak[1]. He received Dharma transmission from Gasan in 1352 at Sōji-ji, having earlier been ordained by Jōzan Sozen at Daikō-ji (age 17) and trained for some ten years from 1340 under Meihō Sotetsu at Daijō-ji before formally entering Gasan's community[1][2].\n\nTsūgen served as the 5th abbot of Sōji-ji from 1368 (with later returns in 1382 and 1388) and founded the temples Yōtaku-ji (永澤寺, 1370, under Hosokawa Yoriyuki / Emperor Go-En'yū's edict) and Ryūsen-ji (1386). His own line of ten major heirs (*Tsūgen-jittetsu*, 通幻十哲) — Ryōan Emyō, Sekioku Shinryō, Ikkei Eijū, Fusai Zenkyū, Fuken Myōken, Tentoku Donjō, and others — populated Sōji-ji's rotating abbacy and the regional Sōtō network for the following centuries[1].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "ja.wikipedia.org/wiki/通幻寂霊 — Tsūgen Jakurei biographical entry; verbatim 1352 transmission from Gasan",
      },
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/TsugenJakurei.html — biographical entry",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "ja.wikipedia — Tsūgen Jakurei + Yōtaku-ji" },
      { index: 2, sourceId: "src_terebess", pageOrSection: "terebess.hu — Gasan Jōseki and the Gotetsu" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_terebess"],
        notes:
          "Dharma transmission (shihō) from Gasan Jōseki at Sōji-ji in 1352. One of the Gasan-go-tetsu (五哲) — founder of the Tsūgen-ha, the largest of the five Gasan sub-lines.",
      },
      {
        teacherSlug: "meiho-sotetsu",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Earlier training (c. 1340–1350) at Daijō-ji under Meihō Sotetsu before formally joining Gasan's community; not a transmission relationship.",
      },
    ],
  },
  {
    slug: "mutan-sokan",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Mutan Sokan" },
      { locale: "ja", nameType: "dharma", value: "無端祖環" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 1387,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Mutan Sokan (無端祖環, d. 1387) was one of Gasan Jōseki's five great heirs (*Gasan-go-tetsu*) and the founder of Tōsen-an (洞泉庵), one of the five sub-temples (Goin / 五院) of the Sōji-ji precinct whose abbots rotated as chief priest of the head temple[1]. He founded the Mutan-ha (無端派) sub-lineage; English-language biographical detail beyond his institutional role at Sōji-ji is sparse, and fuller treatment requires Japanese-language Sōtōshū records.",
    citations: [
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/gasan.html — Gasan Jōseki and the Gotetsu",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "ja.wikipedia.org — Gasan Jōseki; Mutan Sokan listed among the five heirs (Tōsen-an)",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_terebess", pageOrSection: "terebess.hu — Gasan-go-tetsu and the Sōji-ji Goin" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_terebess", "src_wikipedia"],
        notes:
          "Dharma transmission (shihō) from Gasan Jōseki. One of the Gasan-go-tetsu; founder of Tōsen-an (one of the five Sōji-ji sub-temples).",
      },
    ],
  },
  {
    slug: "daisetsu-sorei",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Daitetsu Sōrei" },
      { locale: "en", nameType: "alias", value: "Daisetsu Sōrei" },
      { locale: "en", nameType: "alias", value: "Daitetsu Sōryō" },
      { locale: "ja", nameType: "dharma", value: "大徹宗令" },
    ],
    birthYear: 1333,
    birthPrecision: "approximate",
    birthConfidence: "medium",
    deathYear: 1408,
    deathPrecision: "approximate",
    deathConfidence: "medium",
    biography:
      "Daitetsu Sōrei (大徹宗令, 1333–1408, also rendered Daisetsu Sōrei or Daitetsu Sōryō) was one of Gasan Jōseki's five great heirs (*Gasan-go-tetsu*) and the founder of Denpōan (伝法庵), one of the five sub-temples (Goin) of Sōji-ji that rotated as the head-temple abbacy[1]. The earlier date attribution \"d. 1386\" found in some derivative sources appears to be a confusion with his fellow Gotetsu Mutan Sokan (d. 1387); the consistent date in Japanese Sōtōshū sources is 1333–1408.",
    citations: [
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/gasan.html — Gasan Jōseki and the Gotetsu",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "Wikipedia + ja.wikipedia — Gasan Jōseki entry listing Daitetsu Sōrei among the Five Abbots",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_terebess", pageOrSection: "terebess.hu — Gasan-go-tetsu / Denpōan" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_terebess", "src_wikipedia"],
        notes:
          "Dharma transmission (shihō) from Gasan Jōseki. Founder of Denpōan, one of the five Sōji-ji sub-temples.",
      },
    ],
  },
  {
    slug: "jippo-ryoshu",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Jippō Ryōshū" },
      { locale: "ja", nameType: "dharma", value: "実峰良秀" },
    ],
    birthYear: 1318,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 1405,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Jippō Ryōshū (実峰良秀, 1318–1405) was one of Gasan Jōseki's five great heirs (*Gasan-go-tetsu*) and the founder of Nyoi-an (如意庵), one of the five sub-temples (Goin) of Sōji-ji whose abbots rotated as the head-temple priest, and a member of the *Gasan ni-jū-go-tetsu* (twenty-five major Gasan heirs)[1]. English-language biographical detail beyond his institutional position is sparse; the Jippō-ha sub-lineage label is plausible but unverified in accessible sources.",
    citations: [
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/gasan.html — Gasan-go-tetsu",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "ja.wikipedia.org/wiki/總持寺祖院 — Sōji-ji Soin entry confirms 1318–1405 dates; ja.wikipedia.org Gasan Jōseki — Nyoi-an pairing",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_terebess", pageOrSection: "terebess.hu — Gasan and the Gotetsu" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_terebess", "src_wikipedia"],
        notes:
          "Dharma transmission (shihō) from Gasan Jōseki. Founder of Nyoi-an, one of the five Sōji-ji sub-temples (Goin).",
      },
    ],
  },
  {
    slug: "daichi-sokei",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Daichi Sokei" },
      { locale: "ja", nameType: "dharma", value: "大智祖継" },
    ],
    birthYear: 1290,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1366,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Daichi Sokei (大智祖継, 1290–1366) was a fourteenth-century Japanese Sōtō priest in the Meihō-ha sub-lineage. He was ordained at age seven by Kangan Giin at Daiji-ji (Higo), practiced for seven years under Keizan Jōkin, then travelled to Yuan-dynasty China (1314–1324) where he studied with Gulin Qingmao among others, before returning to receive formal Dharma transmission from Meihō Sotetsu — the second of Keizan's six \"abbot heirs\" — making the canonical robe lineage Dōgen → Ejō → Gikai → Keizan → Meihō → Daichi[1].\n\nHe founded Kida-ji (Kaga), Hōgizan Shōgo-ji (Higo / Ryūmon Village, under Kikuchi-clan patronage), Kōfuku-ji (Higo), and Entsū-ji (Hizen, 1353). His Higo-province Meihō-ha line proved short-lived after also losing its lay-patron support — a common pattern with the Meihō branch that did not survive into the modern Sōtō network the way Gasan's branch did[1].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Daichi_Sokei — \"he received dharma transmission under Keizan's disciple Meihō Sotetsu\"; teacher correction (Meihō NOT Keizan); en.wikipedia.org/wiki/Meihō_Sotetsu — \"Daichi Sokei … proved short lived after also losing the support of his patrons.\"",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Daichi Sokei + Meihō Sotetsu" },
    ],
    transmissions: [
      {
        teacherSlug: "meiho-sotetsu",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia"],
        notes:
          "Dharma transmission (shihō) from Meihō Sotetsu, NOT Keizan Jōkin (common misattribution). Daichi practiced under Keizan for seven years and trained with Gulin Qingmao in Yuan-dynasty China before receiving formal transmission from Meihō.",
      },
      {
        teacherSlug: "keizan-jokin",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Seven-year training under Keizan Jōkin (his ordination grandfather), distinct from the shihō relationship with Meihō Sotetsu.",
      },
    ],
  },
  {
    slug: "manzan-dohaku",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Manzan Dōhaku" },
      { locale: "en", nameType: "alias", value: "Manzan Dohaku" },
      { locale: "ja", nameType: "dharma", value: "卍山道白" },
    ],
    birthYear: 1636,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1715,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Manzan Dōhaku (卍山道白, 1636–1715) was the central Tokugawa-era Sōtō reformer, the figure who codified the *isshi-injō* (single-master / face-to-face certification) standard for Dharma transmission that has defined modern Sōtō institutional practice since[1]. He was tonsured at age 10 under Dōhan Issen at Ryūkō-ji, trained under Bunshun Kōshū and Tokuō Ryōkō, and received *menju shihō* (face-to-face transmission) from Gesshū Sōko at Daijō-ji in 1680, becoming Daijō-ji's 27th abbot the same year. In 1694 he converted Genkō-an in Kyoto from Rinzai to Sōtō.\n\nManzan's reform — pursued jointly with Baihō Jikushin and ratified by the Bakufu Jisha-bugyō in 1703 — overturned the medieval *garanbō* (temple-line) succession system whereby Dharma certification was attached to the temple a monk happened to be appointed to rather than to the master who actually trained him; under *isshi-injō*, transmission must come from one's actual face-to-face teacher and cannot be changed by later temple appointment[1][2]. The institutional dispute is the central subject of William Bodiford's *Monumenta Nipponica* article \"Dharma Transmission in Sōtō Zen: Manzan Dōhaku's Reform Movement\"; the 1703 ruling actually recognised both temple-centered and person-centered systems, so the framing of a clean Manzan victory is somewhat misleading. He also produced the *Manzan-bon Shōbōgenzō*, the 89-fascicle edition of Dōgen's *Shōbōgenzō* that remained standard until twentieth-century recensions[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Manzan_D%C5%8Dhaku + Japanese Wiki Corpus — Manzan Dōhaku biographical entry",
      },
      {
        sourceId: "src_bodiford_soto_medieval",
        fieldName: "biography",
        pageOrSection:
          "Bodiford, \"Dharma Transmission in Sōtō Zen: Manzan Dōhaku's Reform Movement,\" Monumenta Nipponica 46:4 (1991) — primary academic source on the isshi-injō reform",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia + Japanese Wiki — Manzan Dōhaku" },
      { index: 2, sourceId: "src_bodiford_soto_medieval", pageOrSection: "Bodiford 1991 — isshi-injō reform" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_bodiford_soto_medieval"],
        notes:
          "Editorial bridge: Manzan received face-to-face Dharma succession from Gesshū Sōko (1618–1696) at Daijō-ji in 1680. Gesshū is in the Gasan-ha (Gasan Jōseki → Tsūgen Jakurei → … → Gesshū) but the intermediate Tokugawa-era abbots between Tsūgen and Gesshū are not yet seeded; the edge to Gasan anchors Manzan in the Gasan-ha rather than spanning 300 years to Keizan or Dōgen.",
      },
    ],
  },
  {
    slug: "menzan-zuiho",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Menzan Zuihō" },
      { locale: "en", nameType: "alias", value: "Menzan Zuiho" },
      { locale: "ja", nameType: "dharma", value: "面山瑞方" },
    ],
    birthYear: 1683,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1769,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Menzan Zuihō (面山瑞方, 1683–1769) was the most prolific Sōtō Zen scholar of the Tokugawa period — author of more than one hundred works — and is the figure most responsible for placing Dōgen-studies at the centre of modern Sōtō scholastic identity[1]. He received Dharma transmission from Sonnō Shūeki (尊應守益, 1649–1705) in 1705 at age 23, undertook a thousand-day zazen retreat at Rōbaian in Sagami, and went on to serve as abbot of Zenjō-ji and Kūin-ji. He trained as a young monk under Manzan Dōhaku, who is sometimes mis-recorded as his transmission teacher, but the formal shihō was from Sonnō Shūeki[1][2].\n\nMenzan's scholarship recovered and edited many of Dōgen's writings (including the *Eihei Shingi*) and his exhaustive commentaries laid the foundation for the modern Sōtō understanding of Dōgen as the school's philosophical centre. Without Menzan, the modern Sōtō self-image as a fundamentally Dōgen-centric, text-engaged tradition would not exist in its present form[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Menzan_Zuih%C5%8D — \"Menzan was the most prolific Sōtō zen scholar, having written over a hundred titles ... Due to Menzan's efforts, Dōgen studies now occupies a central position in Sōtō Zen thought.\"",
      },
      {
        sourceId: "src_bodiford_soto_medieval",
        fieldName: "biography",
        pageOrSection:
          "Riggs / terebess scholarly summary — \"Menzan received Dharma transmission from Sonnō Shūeki in 1705 and undertook a 1000-day zazen retreat at Rōbaian.\"",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Menzan Zuihō" },
      { index: 2, sourceId: "src_bodiford_soto_medieval", pageOrSection: "Riggs biographical tradition (terebess + Oxford chapter)" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Editorial bridge: Menzan's Dharma-succession teacher Sonnō Shūeki (1649–1705) is not yet seeded; Menzan also trained under Manzan Dōhaku as a young monk. Sonnō and Manzan are both within the Gasan-ha; the edge to Gasan Jōseki anchors Menzan in the Gasan-ha rather than 400 years upstream.",
      },
      {
        teacherSlug: "manzan-dohaku",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Earlier training under Manzan Dōhaku as a young monk; not the Dharma-succession relationship (Menzan was junior to Manzan; the 1705 transmission was from Sonnō Shūeki). Wikipedia tertiary sources sometimes incorrectly list Dōgen as Menzan's teacher — chronologically impossible.",
      },
    ],
  },
  {
    slug: "nishiari-bokusan",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Nishiari Bokusan" },
      { locale: "en", nameType: "alias", value: "Bokusan Nishiari" },
      { locale: "en", nameType: "alias", value: "Sasamoto Kazuyoshi" },
      { locale: "ja", nameType: "dharma", value: "西有穆山" },
    ],
    birthYear: 1821,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1910,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Nishiari Bokusan (西有穆山, 17 November 1821 – 4 December 1910), born Sasamoto Kazuyoshi in Hachinohe, Aomori, was the dominant Sōtō scholastic figure of the late Edo / early Meiji transition and the institutional bridge between the Tokugawa-era Dōgen scholarship of Manzan and Menzan and the modern Sōtō academic tradition[1]. He received Dharma transmission from Ansō Taizen (also rendered Ansu Taigen) of Hon-nen-ji in Edo in 1842, served as abbot of Sōji-ji from 1901, was elected *Kanchō* (head priest) of the entire Sōtō school in 1902 and again in 1904, taught at proto-Komazawa University, and authored the *Shōbōgenzō Keiteki* — the most influential Meiji-era commentary on Dōgen's masterwork. Bodiford explicitly identifies him as the only pre-Meiji Sōtō teacher known to have lectured systematically on the *Shōbōgenzō*[1][2].\n\nHis two principal Dharma heirs — Oka Sōtan (1860–1921), the founding abbot of Antai-ji, and Kishizawa Ian (1865–1955), the *Shōbōgenzō* lecturer at Eihei-ji and personal teacher of the young Shunryū Suzuki — are the figures through whom the modern Sōtō scholastic tradition reaches into the lineages of Sawaki Kōdō, Uchiyama Kōshō, Shunryū Suzuki, and the global twentieth-century Sōtō diaspora[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Bokusan_Nishiari — \"In earlier generations only one Zen teacher, Nishiari Bokusan (1821–1910), is known to have ever lectured on how the Shōbōgenzō should be read and understood.\"",
      },
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/NishiariBokusan.html + Kishizawa.html",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Bokusan Nishiari + Sōtō" },
      { index: 2, sourceId: "src_terebess", pageOrSection: "terebess.hu — Nishiari + Kishizawa biographical entries" },
    ],
    transmissions: [
      {
        teacherSlug: "gasan-joseki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Editorial bridge: Nishiari's Dharma-succession teacher Ansō Taizen (Ansu Taigen) of Hon-nen-ji in Edo, who conferred transmission on him in 1842, is not yet seeded in the DB. Ansō is in the Gasan-ha Sōji-ji line. The edge to Gasan Jōseki anchors Nishiari in the Gasan-ha rather than spanning ~500 years to Keizan or Dōgen.",
      },
    ],
  },
  {
    slug: "oka-sotan",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Oka Sōtan" },
      { locale: "en", nameType: "alias", value: "Oka Sotan" },
      { locale: "ja", nameType: "dharma", value: "丘宗潭" },
    ],
    birthYear: 1860,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1921,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Oka Sōtan (丘宗潭, 1860–1921) was a late-Meiji / Taishō Sōtō master, the founding (first) abbot of Antai-ji in northern Kyoto when it was constituted in 1921 as a *Shōbōgenzō*-study monastery, abbot of Daiji-ji, and president of the Sōtōshū / Komazawa University in 1918. He received Dharma transmission from Tōken Mitetsu, while undertaking *Shōbōgenzō* study under the great Meiji-era scholastic Nishiari Bokusan — Nishiari being a senior teacher and scholarly mentor rather than his shihō master, despite frequent loose conflation of the two roles in secondary sources[1][2].\n\nAlthough only the year of Antai-ji's founding remained for his abbacy before his death, Oka's influence on the twentieth-century Sōtō scholastic tradition is enormous: among the senior monks who passed through Daiji-ji and Antai-ji under his guidance were Sawaki Kōdō (whose own shihō came from Zenkō Sawada in 1906 — Oka was his principal training mentor, not his transmission teacher), Hashimoto Ekō, and Daiun Sogaku Harada. The institutional culture of Antai-ji as a Shōbōgenzō-research community was established under his initiative[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "antaiji.org/en/history/ — \"Oka Sotan (1860-1921) ... 1st abbot of Antaiji.\"",
      },
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection:
          "terebess.hu / cuke.com — Oka Sōtan biographical entries; cuke.com (Shunryū Suzuki archive) distinguishes shihō teacher (Tōken Mitetsu) from Shōbōgenzō scholarly mentor (Nishiari Bokusan).",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_terebess", pageOrSection: "cuke.com / terebess.hu — Oka Sōtan biographical sources" },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "antaiji.org/en/history — Antai-ji founding" },
    ],
    transmissions: [
      {
        teacherSlug: "nishiari-bokusan",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_terebess"],
        notes:
          "Senior teacher and Shōbōgenzō scholarly mentor; not the shihō relationship. Frequently mis-recorded as Oka's transmission teacher in secondary sources, but cuke.com's primary-source-based biography distinguishes the two roles: shihō was from Tōken Mitetsu, scholarly mentorship from Nishiari.",
      },
      {
        teacherSlug: "gasan-joseki",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_terebess"],
        notes:
          "Editorial bridge: Oka Sōtan's actual transmission teacher Tōken Mitetsu is not yet seeded in the DB. Tōken and his predecessors are in the Gasan-ha Sōji-ji line. The edge to Gasan Jōseki anchors Oka in the Gasan-ha rather than 500+ years upstream.",
      },
    ],
  },
  // ── Wave 5: Sawaki direct heirs + second-generation Suzuki/Baker line ──
  {
    slug: "shuyu-narita",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Shūyū Narita" },
      { locale: "en", nameType: "alias", value: "Shuyu Narita" },
      { locale: "ja", nameType: "dharma", value: "成田祖伝秀夫" },
    ],
    birthYear: 1914,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2004,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Shūyū Narita (成田祖伝秀夫, 1914–2004) was Kōdō Sawaki's first Dharma heir and the 28th abbot of Tōdenji (東傳寺) in Akita Prefecture, succeeding his father at the family temple[1]. His own first-person testimony recorded by the Sōtō Zen Buddhist Community Spain confirms the primacy: \"I was the first disciple to whom [Sawaki] transmitted the Dharma.\" In 1977 he travelled to Europe at Taisen Deshimaru's invitation and went on to become the principal Japanese-Sōtō shihō teacher of the independent European Antai-ji-line network, conferring transmission on Fausto Taiten Guareschi (1983, Fudenji, Italy), Ludger Tenryū Tenbreul (1986, Jakkō-ji, Germany), Francisco Dokushō Villalba (1987, Luz Serena, Spain), Denis Kengan Robert, Evelyne Fukusen Holzapfel, and Philippe Taihō Breal[1][2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Kodo_Sawaki — Shūyū Narita listed among Sawaki's five named monk Dharma heirs.",
      },
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/narita.html — Shūyū Narita biographical entry with kanji",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_terebess", pageOrSection: "terebess.hu — Narita; sotozen.es first-person testimony" },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Kōdō Sawaki Dharma heirs" },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_terebess"],
        notes:
          "Dharma transmission from Kōdō Sawaki — per Narita's own first-person testimony, Sawaki's first Dharma heir. Specific shihō year unrecorded in publicly available sources; the relationship dates to the Komazawa University period c. 1935–1936.",
      },
    ],
  },
  {
    slug: "sodo-yokoyama",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Sodō Yokoyama" },
      { locale: "en", nameType: "alias", value: "Sodo Yokoyama" },
      { locale: "en", nameType: "alias", value: "Grass-Flute Zen Master" },
      { locale: "ja", nameType: "dharma", value: "横山祖道" },
      { locale: "ja", nameType: "alias", value: "草笛禅師" },
    ],
    birthYear: 1907,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1980,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Sodō Yokoyama (横山祖道, 1907–1980), widely remembered as the *Kusabue Zenji* (草笛禅師, \"Grass-Flute Zen Master\"), was a Dharma heir of Kōdō Sawaki and one of the most idiosyncratic figures in the modern Sōtō tradition[1]. He resided at Antai-ji from approximately 1949 to 1958, as the senior monk under Sawaki alongside Kōshō Uchiyama, and received Dharma transmission from Sawaki in 1958 — Sōtō Zen Buddhist Community Spain's biography calls him Sawaki's \"third successor in Dharma\"[1][2].\n\nAfter Antai-ji, Yokoyama renounced temple residence entirely and settled at Kaikō-en Park in Komoro, Nagano, where for some twenty-two years until his death he taught daily by sitting on a bench beside a stream and playing a leaf or blade of grass between his lips as a flute. He had no actual temple — the \"Taiyō-zan Seikū-ji\" name attached to him in some sources is an imaginary heart-temple. His sole confirmed disciple was Jōkō Shibata; Arthur Braverman's 2017 *Grass-Flute Zen Master: Sodō Yokoyama* is the principal English-language biography[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Sod%C5%8D_Yokoyama — Sodō Yokoyama (1907–1980), Sōtō Zen monk and grass-flute teacher.",
      },
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection: "terebess.hu/zen/mesterek/yokoyama.html — biographical entry; Braverman 2017 biography reference",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Sodō Yokoyama" },
      { index: 2, sourceId: "src_terebess", pageOrSection: "terebess.hu + Spanish-language Sōtō sources" },
    ],
    transmissions: [
      {
        teacherSlug: "kodo-sawaki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_terebess"],
        notes:
          "Dharma transmission from Kōdō Sawaki in 1958 — Sawaki's third Dharma successor per Spanish-language Sōtō biographical sources (sotozen.es, Villalba). English Wikipedia is conservative on the formal shihō but lists Jōkō Shibata as Yokoyama's own Dharma successor.",
      },
    ],
  },
  {
    slug: "jakusho-kwong",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Jakushō Kwong" },
      { locale: "en", nameType: "alias", value: "Jakusho Kwong" },
      { locale: "en", nameType: "alias", value: "Bill Kwong" },
      { locale: "en", nameType: "alias", value: "Kwong Roshi" },
    ],
    birthYear: 1935,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Jakushō (Bill) Kwong (b. 14 November 1935, Santa Rosa, California) is a senior American Sōtō teacher and the founder (1973) of Sonoma Mountain Zen Center (Genjōji)[1]. He was a close personal student of Shunryū Suzuki at SFZC from 1959 until Suzuki's death in 1971, and Suzuki recognized him as a Dharma successor — but the formal transmission (shihō) was unfinished at Suzuki's death and was completed in 1978 at Rinso-In, Yaizu, Japan, by Suzuki's son and primary heir Hoitsu Suzuki, with the rite officiated by Hakusan Kojin Noiri[1][2]. Kwong subsequently spent approximately five years of interim transmission study with Kōbun Chino Otogawa. He is a Sōtōshū-certified Dendō-kyōshi (1995) and is recorded as a 91st-generation teacher in the Sōji-ji-line succession. His son Nyoze Demian Kwong received Dharma transmission from him in November 2014 and has served as abbot of Sonoma Mountain Zen Center since 2023[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "en.wikipedia.org/wiki/Jakusho_Kwong — Jakushō Kwong biographical entry",
      },
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection:
          "smzc.org/teacher (Sonoma Mountain Zen Center) — \"Roshi Kwong received Dharma transmission from Hoitsu Suzuki Roshi in 1978\"; cuke.com Suzuki archive — Bill Kwong",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Jakushō Kwong" },
      { index: 2, sourceId: "src_originals_curated", pageOrSection: "smzc.org + cuke.com" },
    ],
    transmissions: [
      {
        teacherSlug: "hoitsu-suzuki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_originals_curated"],
        notes:
          "Dharma transmission (shihō) 1978 at Rinso-In, Yaizu, Japan, from Hoitsu Suzuki (Shunryū Suzuki's son and primary heir). Hakusan Kojin Noiri officiated. The Shunryū Suzuki relationship (1959–1971) was the formative root-teacher discipleship; Suzuki recognized Kwong as a successor but died before completing transmission. The 1978 Hoitsu shihō is the institutional Sōtōshū-registered edge.",
      },
      {
        teacherSlug: "shunryu-suzuki",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Root-teacher discipleship 1959–1971 at SFZC. Suzuki recognized Kwong as a Dharma successor but died before formal transmission; the institutional shihō was completed by his son Hoitsu in 1978.",
      },
    ],
  },
  {
    slug: "sojun-mel-weitsman",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Sojun Mel Weitsman" },
      { locale: "en", nameType: "alias", value: "Mel Weitsman" },
      { locale: "en", nameType: "alias", value: "Hakuryū Sōjun" },
      { locale: "ja", nameType: "dharma", value: "白龍祖珣" },
    ],
    birthYear: 1929,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2021,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Sojun Mel Weitsman (20 July 1929 – 7 January 2021), dharma name Hakuryū Sōjun (白龍祖珣), was a senior American Sōtō Zen teacher and the founding abbot of Berkeley Zen Center, which he co-founded in 1967 and led as abbot from 1985 onward[1]. He met Shunryū Suzuki in 1964, was ordained as a priest by Suzuki in 1969 at the Berkeley zendō, and was Suzuki's close student until Suzuki's death in 1971 — but Suzuki died before he could give Weitsman formal Dharma transmission, and the shihō was completed in 1984 at Rinso-In in Japan by Suzuki's son Hoitsu Suzuki[1][2]. From 1988 to 1997 Weitsman also served as co-abbot of SFZC alongside Tenshin Reb Anderson. He transmitted Dharma to twenty-two named successors, including Blanche Hartman (1988), Zoketsu Norman Fischer (1988), Hozan Alan Senauke, Edward Espe Brown, Gil Fronsdal, Sojun Michael Wenger, and Myogen Steve Stücky[2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "en.wikipedia.org/wiki/Mel_Weitsman — Sojun Mel Weitsman biographical entry",
      },
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection: "sfzc.org/teachers/sojun-mel-weitsman; tricycle.org/article/sojun-mel-weitsman/",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Mel Weitsman" },
      { index: 2, sourceId: "src_originals_curated", pageOrSection: "SFZC official + Tricycle memorial" },
    ],
    transmissions: [
      {
        teacherSlug: "hoitsu-suzuki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_originals_curated"],
        notes:
          "Dharma transmission (shihō) 1984 at Rinso-In, Yaizu, from Hoitsu Suzuki. The Shunryū Suzuki relationship (1964–1971) was the formative root-teacher discipleship and priest ordination (1969); Suzuki died before completing transmission and the institutional shihō was completed by his son Hoitsu.",
      },
      {
        teacherSlug: "shunryu-suzuki",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Root-teacher discipleship 1964–1971 at SFZC; priest ordination in 1969. Shihō was completed posthumously via Hoitsu Suzuki in 1984.",
      },
    ],
  },
  {
    slug: "reb-anderson",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Tenshin Reb Anderson" },
      { locale: "en", nameType: "alias", value: "Reb Anderson" },
      { locale: "en", nameType: "alias", value: "Tenshin Zenki" },
      { locale: "ja", nameType: "dharma", value: "天眞全機" },
    ],
    birthYear: 1943,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Tenshin Reb Anderson (天眞全機, born 1943) is a senior American Sōtō Zen teacher and a longtime central figure at San Francisco Zen Center, where he served as abbot from 1986 to 1995 (co-abbot with Sojun Mel Weitsman) and as a senior Dharma teacher at Green Gulch Farm Zen Center until his 2025 retirement[1]. He was ordained as a priest by Shunryū Suzuki in 1970 — a year before Suzuki's death — and received Dharma transmission (shihō) from Suzuki's direct American heir Zentatsu Richard Baker in 1983, making him Baker's first Dharma successor[1][2]. He has transmitted Dharma to eighteen named successors, the most recent being Shingan Sokei Thiemo Blank (2025).",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "en.wikipedia.org/wiki/Reb_Anderson — Tenshin Reb Anderson biographical entry",
      },
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection: "rebanderson.org — official biography page",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia — Reb Anderson" },
      { index: 2, sourceId: "src_originals_curated", pageOrSection: "rebanderson.org" },
    ],
    transmissions: [
      {
        teacherSlug: "richard-zentatsu-baker",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_originals_curated"],
        notes:
          "Dharma transmission (shihō) 1983 from Zentatsu Richard Baker — Anderson was Baker's first Dharma successor. Note: Baker initially disputed the ceremony's completeness during his 1983 SFZC-resignation crisis; the SFZC board affirmed the transmission and Baker later concurred.",
      },
      {
        teacherSlug: "shunryu-suzuki",
        type: "secondary",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Ordained as priest by Shunryū Suzuki in 1970 — a year before Suzuki's death. The institutional shihō was from Baker in 1983.",
      },
    ],
  },
  {
    slug: "hoitsu-suzuki",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Hoitsu Suzuki" },
      { locale: "en", nameType: "alias", value: "Shuntoku Hoitsu Suzuki" },
      { locale: "ja", nameType: "dharma", value: "鈴木 法逸" },
    ],
    birthYear: 1939,
    birthPrecision: "approximate",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Hoitsu Suzuki (鈴木 法逸) is the eldest son and Dharma heir of Shunryū Suzuki, and the 28th abbot of Rinso-in, the family temple in Yaizu, Shizuoka, that Shunryū Suzuki had inherited from his own adoptive father Gyokujun So-on Suzuki[1]. Hoitsu received Dharma transmission from his father in 1963 — Shunryū's first transmission and the act that made it possible for him to depart for San Francisco in 1959 with the institutional question of Rinso-in's succession already resolved[1][2]. Hoitsu has subsequently played a quiet but significant role in the modern SFZC line by transmitting onward to several Western Sōtō teachers (Mel Weitsman, William Kwong, Les Kaye, Reb Anderson among others), each of whom is conventionally described as a 'second-generation' Suzuki line heir through this branch.",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Shunry%C5%AB_Suzuki — Shunryū Suzuki Dharma heirs: Hoitsu Suzuki (1963).",
      },
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection:
          "cuke.com Suzuki archive — \"On August 21, 1926, So-on gave Dharma transmission to Suzuki\" + Rinso-in succession context.",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Shunryū Suzuki § Dharma heirs",
      },
      {
        index: 2,
        sourceId: "src_originals_curated",
        pageOrSection: "cuke.com Suzuki archive — Rinso-in succession",
      },
    ],
    transmissions: [
      {
        teacherSlug: "shunryu-suzuki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia"],
        notes:
          "Dharma transmission (shihō), 1963 from his father Shunryū Suzuki. The transmission settled the Rinso-in temple-family succession before Shunryū departed for San Francisco; Hoitsu later became the 28th abbot of Rinso-in.",
      },
    ],
  },
  {
    slug: "shoko-okamoto",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Shōko Okamoto" },
      { locale: "en", nameType: "alias", value: "Shoko Okamoto" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Shōko Okamoto is the second of Shunryū Suzuki's three documented Dharma heirs (sources differ on year: 1963 per cuke.com; 1966 per other lineage materials). The first was Suzuki's son Hoitsu, the third Zentatsu Richard Baker. Beyond the bare fact of the transmission, English-language biographical information on Okamoto's later career and own heirs is sparse, and this stub records only the lineage fact pending Japanese-language follow-up research[1].",
    citations: [
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection:
          "cuke.com — Suzuki Dharma heirs: Hoitsu Suzuki, Shoko Okamoto, Zentatsu Richard Baker (the second received transmission in 1963 or 1966).",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_originals_curated",
        pageOrSection: "cuke.com archive — Shunryū Suzuki Dharma heirs roster",
      },
    ],
    transmissions: [
      {
        teacherSlug: "shunryu-suzuki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_originals_curated"],
        notes:
          "Dharma transmission (shihō), 1963 (cuke.com) or 1966 (other lineage sources) from Shunryū Suzuki. Year not yet reconciled across sources.",
      },
    ],
  },
  {
    slug: "richard-zentatsu-baker",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Zentatsu Richard Baker" },
      { locale: "en", nameType: "alias", value: "Richard Baker" },
      { locale: "en", nameType: "alias", value: "Baker Roshi" },
    ],
    birthYear: 1936,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Zentatsu Richard Baker (born 1936) is an American Sōtō teacher and the only American Dharma heir of Shunryū Suzuki, having received transmission on 8 December 1970 and the Mountain Seat ceremony at San Francisco Zen Center on 21 November 1971 just before Suzuki's death[1]. He succeeded Suzuki as abbot of SFZC and led the institution's rapid 1970s expansion (the founding of Greens restaurant, the Tassajara Zen Mountain Center programme, the City Center on Page Street). His tenure ended in a 1983 institutional crisis documented in Michael Downing's *Shoes Outside the Door*; following the resignation he founded Dharma Sangha and the Crestone Mountain Zen Center (Colorado) and Johanneshof in the Black Forest of Germany, where he continues to teach[1][2].",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Richard_Baker_(Zen_teacher) — Zentatsu Richard Baker, sole American Dharma heir of Shunryū Suzuki, transmission 1970, Mountain Seat Nov 21 1971.",
      },
      {
        sourceId: "src_originals_curated",
        fieldName: "biography",
        pageOrSection:
          "cuke.com Suzuki archive — Baker received transmission on December 8, 1970.",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Richard Baker (Zen teacher)",
      },
      {
        index: 2,
        sourceId: "src_originals_curated",
        pageOrSection: "cuke.com archive — Baker installation, 1971",
      },
    ],
    transmissions: [
      {
        teacherSlug: "shunryu-suzuki",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_originals_curated"],
        notes:
          "Dharma transmission (shihō), 8 December 1970 from Shunryū Suzuki. Mountain Seat ceremony installing Baker as Suzuki's SFZC successor: 21 November 1971, three weeks before Suzuki's death. Baker is Suzuki's only American (Western) shihō recipient — Hoitsu Suzuki and Shōko Okamoto are the two Japanese heirs.",
      },
    ],
  },
  {
    slug: "moriyama-daigyo",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Daigyō Moriyama" },
      { locale: "en", nameType: "alias", value: "Moriyama Daigyō" },
      { locale: "en", nameType: "alias", value: "Moriyama Roshi" },
      { locale: "ja", nameType: "dharma", value: "森山 大行" },
    ],
    birthYear: 1938,
    birthPrecision: "approximate",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Daigyō Moriyama Rōshi (森山 大行) is a Japanese Sōtō priest and Dharma heir of Niwa Rempō Zenji, 77th abbot of Eihei-ji[1]. The 24-agent pilot verification surfaced Moriyama as one of Niwa Rempō's documented heirs alongside Gudō Wafu Nishijima and Tetsuzan Gendō Niwa (Rempō's successor at Tōkei-in), all three of whom had previously been absent from this lineage roster. Moriyama subsequently taught extensively outside Japan, with particularly strong connections to the Brazilian Sōtōshū network; he served as abbot of Zuigakuin in Yamanashi and contributed to the international expansion of the Eihei-ji-line in South America.",
    citations: [
      {
        sourceId: "src_terebess",
        fieldName: "biography",
        pageOrSection:
          "terebess.hu/zen/mesterek/NiwaRempo.html — Niwa Rempō's documented Dharma heirs include Moriyama Daigyō.",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Rempo_Niwa — Niwa Rempō Dharma heirs.",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_terebess",
        pageOrSection: "terebess.hu — Niwa Rempō biography",
      },
    ],
    transmissions: [
      {
        teacherSlug: "niwa-rempo-zenji",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_terebess", "src_wikipedia"],
        notes:
          "Dharma transmission (shihō) from Niwa Rempō Zenji. Year not yet pinned down in publicly available English-language sources; pending Japanese-language temple-register research.",
      },
    ],
  },
  {
    slug: "yamada-reirin",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Yamada Reirin" },
      { locale: "en", nameType: "alias", value: "Reirin Yamada" },
      { locale: "en", nameType: "alias", value: "Yamada Reirin Roshi" },
      { locale: "ja", nameType: "dharma", value: "山田霊林" },
    ],
    birthYear: 1889,
    birthPrecision: "exact",
    birthConfidence: "medium",
    deathYear: 1979,
    deathPrecision: "exact",
    deathConfidence: "medium",
    biography:
      "Yamada Reirin (山田霊林, 1889–1979) was a senior twentieth-century Sōtō priest and Sōtōshū prelate, best known internationally as the master who in 1970 formally regularised Taisen Deshimaru's Sōtō status by conferring on him dharma transmission (shihō) — the Sōtōshū-registered transmission that the much-discussed 1965 deathbed entrustment from Kōdō Sawaki had not produced[1][2]. The Yamada Reirin transmission came after the then-abbot of Antai-ji had declined to regularise Deshimaru's status (citing Deshimaru's unwillingness to undertake the requisite Antai-ji formation time); Yamada provided the institutional bridge that brought the Paris mission inside Sōtōshū's recognised succession[2]. Beyond the Deshimaru case, Yamada's own line and his predecessors within the Sōtōshū head-temple system are not yet seeded in this database, and a fuller portrait would require Japanese-language temple-register research.",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection:
          "en.wikipedia.org/wiki/Reirin_Yamada — Yamada Reirin (1889–1979), senior Sōtō priest who gave Taisen Deshimaru shihō in 1970.",
      },
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection:
          "zen-azi.org/en/taisen-deshimaru — \"In 1970, [Deshimaru] received Dharma transmission from Yamada Reirin Roshi.\"",
      },
    ],
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection:
          "en.wikipedia.org — Reirin Yamada (Sōtō prelate, 1889–1979); en.wikipedia.org — Taisen Deshimaru.",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection:
          "zen-azi.org/en/taisen-deshimaru — Yamada Reirin Roshi conferred shihō on Deshimaru in 1970 (also corroborated by Italian Sōtōshū scholarly source La Stella del Mattino, which dates the act 1974 and frames it as a normalization of Sōtōshū status post-Antaiji rejection).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "keido-chisan",
        type: "dharma",
        isPrimary: false,
        sourceIds: ["src_wikipedia"],
        notes:
          "Editorial bridge: Yamada Reirin was a senior twentieth-century Sōtō prelate active in the Sōji-ji-line institutional world. His specific Dharma-transmission teacher and predecessors in the Sōtōshū head-temple system are not yet seeded; the edge to Kōhō Keidō Chisan (70th abbot of Sōji-ji) anchors him in the Sōji-ji-line milieu rather than the 13th-century Dōgen root.",
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
      "Olivier Reigen Wang-Genh (born 17 April 1955 in Molsheim, Alsace) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of the temple Taikōsan Ryūmon-ji at Weiterswiller in northern Alsace (per fr.wikipedia, Association Zen Internationale, l'Alsace). He encountered Sōtō Zen in March 1973 and was ordained as a monk in 1977 by Taisen Deshimaru, whose teaching he followed until Deshimaru's death in 1982[1].\n\nFrom 1973 onward he developed the Strasbourg dōjō and took over its direction in 1986. Beginning in 1987, with the support of the German and French sanghas, he founded dōjōs across Baden-Württemberg, Alsace, and Basel — establishing the trans-Rhenan AZI network that today links French and German-speaking practitioners. In 1999 he founded Taikōsan Ryūmon-ji (太古山龍門寺, \"Temple of the Dragon Gate of the Primordial Mountain\") in Weiterswiller; he became its official abbot in 2010. In 2001 he received dharma transmission (shihō) from the Japanese master Dōshō Saikawa, and in 2004 was appointed kyōshi (教師, missionary monk) of the Sōtō school[2].\n\nHis institutional record is unusually broad: he served as president of the Union Bouddhiste de France (2007–2012, 2015–2017) and délégué president since 2021, vice-president (2012–2015, 2017–2019), and co-president (2019–2020); he has been president of the Association Zen Internationale since 2015 and of the Communauté bouddhiste d'Alsace since 2010. As UBF president he represents Buddhism in the Conférence des Responsables de Culte en France. He was named Knight of the Order of National Merit in 2016[3].\n\nHis books include Shushōgi: commentaires et enseignements (Éd. Ryumon Ji, 2006), C'est encore loin l'Éveil (Le Relié, 2020), and Six Paramita (Ryumon Ji)[4].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Olivier Wang-Genh" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Olivier Reigen Wang-Genh" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Taikōsan Ryūmon-ji" },
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
        notes: "Ordained by Deshimaru; founder of Taikōsan Ryūmon-ji (Weiterswiller, Alsace) and former AZI / UBF president.",
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
      "Vincent Keisen Vuillemin is a Swiss Sōtō Zen monk in the Deshimaru–Zeisler line and the founder of the Dōjō Zen de Genève. He was ordained by Taisen Deshimaru in the late 1970s; after Deshimaru's death in 1982 he pursued his deeper formation as a disciple of Étienne Mokushō Zeisler, with whom he was closely associated until Zeisler's death in 1990. Mokusho Zen House Budapest — the Hungarian sangha founded by Yvon Myōken Bec, Zeisler's dharma-heir — explicitly identifies Vuillemin as \"Vincent Keisen Vuillemin, from Geneva, disciple of master Zeisler\"[1].\n\nThrough the Geneva dōjō and the Romandie network around it, Vuillemin has taught zazen in French-speaking Switzerland for several decades, becoming one of the principal AZI-affiliated teachers in the region. The Dōjō Zen de Genève is listed on the AZI directory and on the Sōtōshū Europe Office's directory of practice centres, and has served as one of the stable Romandie nodes through which the European Sōtō network has continued to organise itself across the second and third generations after Deshimaru[2].\n\nHis distinctive position — a direct disciple of Deshimaru in his ordination but a successor of Zeisler in his deeper training — places him on the bridge between the founding AZI generation and the eastward-leaning Mokusho line that Zeisler launched into Romania, Hungary, and the broader post-communist East before his early death in Paris on 8 June 1990, thirteen days after driving back from a teaching trip to Budapest[3].",
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
