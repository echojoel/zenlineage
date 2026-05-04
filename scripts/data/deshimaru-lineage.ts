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

import type { KVMaster, KVSource } from "./korean-vietnamese-masters";

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
    url: "https://global.sotozen-net.or.jp/eng/temples/europe/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
];

export const DESHIMARU_MASTERS: KVMaster[] = [
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
      "Philippe Reiryū Coupey (b. 1937) is an American-born Sōtō Zen monk in the Deshimaru lineage and one of the longest-serving teachers at the Dojo Zen de Paris. He met Taisen Deshimaru shortly after Deshimaru's arrival in Paris in 1967 and was ordained as a monk in 1972. After Deshimaru's death in 1982, Coupey remained at the Paris dōjō, where he leads zazen, gives kusen in English, and has guided successive generations of practitioners. He has edited and translated several volumes of Deshimaru's teachings — including \"Sit\" and \"The Voice of the Valley\" — making the AZI tradition accessible to English-language readers and helping to preserve the oral character of Deshimaru's instruction.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Dojo Zen de Paris" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi"],
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
      "Olivier Reigen Wang-Genh (b. 1955) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of Kōsan Ryūmon-ji, the Sōtō temple at Weiterswiller in Alsace. He began practice with Taisen Deshimaru in the early 1970s and was ordained as a monk by him; after Deshimaru's death he continued his training in Japan and went on to establish Ryūmon-ji as the principal European Sōtō residential training centre outside La Gendronnière. He served as president of the Association Zen Internationale and of the Union Bouddhiste de France (UBF), in which capacity he has represented French Buddhism in dialogue with the public sphere. His teaching combines daily zazen practice in the AZI mould with extensive engagement with the wider Buddhist landscape of contemporary France.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Kōsan Ryūmon-ji — Weiterswiller" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Kōsan Ryūmon-ji" },
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
    birthYear: 1949,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2009,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Michel Reikū Bovay (1949–2009) was a Swiss Sōtō Zen monk in the Deshimaru lineage and the founder of the Zen Dōjō de Lausanne. He began zazen with Taisen Deshimaru in the early 1970s, was ordained as a monk by him, and was one of the closest of Deshimaru's Swiss-French disciples. With Lucien Marchal and Laurent Strim he co-authored the 1987 introductory volume \"Zen,\" one of the standard French-language presentations of the tradition's history and practice. Through his work in Lausanne and across French-speaking Switzerland, he extended the AZI network into the Romandie and trained a generation of Swiss practitioners until his death in 2009.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Zen Dōjō de Lausanne" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi"],
        notes: "Ordained by Deshimaru; founder of the Zen Dōjō de Lausanne and a senior Swiss-French AZI teacher.",
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
      "Évelyne Ekō de Smedt is a French Sōtō Zen nun in the Deshimaru lineage and a longtime teacher in the Association Zen Internationale. Ordained by Taisen Deshimaru, she was among the small group of disciples who collaborated directly on the editing and publication of his teachings, and is the co-author with Deshimaru of \"L'Anneau de la Voie\" (\"The Ring of the Way\"), an early presentation of the kusen genre in French. Within AZI she has led zazen and taught at Parisian dōjōs and at the temple La Gendronnière, contributing to the consolidation of the European Sōtō tradition through several decades of sustained practice.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "AZI teachers — Évelyne de Smedt" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi"],
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
      "Pierre Reigen Crépon is a French Sōtō Zen monk in the Deshimaru lineage and the principal biographer of Taisen Deshimaru in French. Ordained by Deshimaru, he has taught for decades within the Association Zen Internationale and was responsible — through his book on Deshimaru's life and his editorial work on the master's kusen — for shaping the standard biographical understanding of the AZI tradition's founder. His teaching combines a strong emphasis on continuous zazen practice in the lineage's idiom with an unusually careful historical sensibility about how Deshimaru's instruction has been transmitted, edited, and remembered.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "AZI teachers — Pierre Crépon" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi"],
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
      "Jean-Pierre Genshū Faure (b. 1948) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of Temple Zen Kanshōji in the Dordogne. He began practice with Taisen Deshimaru in the 1970s and was ordained as a monk by him; in the years following Deshimaru's death he continued his training in Japan and went on to establish Kanshōji as one of the principal European Sōtō residential temples, registered with the Sōtōshū Europe Office. His teaching is grounded in long sesshin practice and in the careful transmission of Sōtō ritual forms, and the temple has trained a number of younger AZI-lineage teachers.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Temple Zen Kanshōji" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Kanshōji" },
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
      "Vincent Keisen Vuillemin is a Swiss Sōtō Zen monk in the Deshimaru lineage and the founder of the Dōjō Zen de Genève. Ordained by Taisen Deshimaru, he has taught zazen in Geneva for several decades and is one of the principal AZI-affiliated teachers in French-speaking Switzerland. The Geneva dōjō, listed on the AZI directory and on the Sōtōshū Europe Office's directory of practice centres, has served as one of the stable points around which the European Sōtō network has continued to organise itself in the second and third generations after Deshimaru.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Dōjō Zen de Genève" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_azi"],
        notes: "Ordained by Deshimaru; founder of the Dōjō Zen de Genève.",
      },
    ],
  },
];
