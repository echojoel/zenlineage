/**
 * Branch A — Kōsen Sangha / Yujō Nyūsanji + Triet's Iberian successor line.
 *
 * Authored by parallel Agent A for the Deshimaru exhaustive-completion pass.
 * Merged into `scripts/data/deshimaru-lineage.ts` (KVMaster entries) and
 * `scripts/seed-biographies.ts` (BiographyEntry entries) by Agent G.
 *
 * Scope: formal shihō (dharma transmission) recipients only — no lay
 * teachers, no ordained-but-no-shihō figures.
 *
 * Sourcing standard (per project CLAUDE.md and the user's reinforcement
 * for the Deshimaru pass): every claim of substance — birth year, year
 * of ordination, year of shihō, dōjō role, institutional position — is
 * footnoted with an `[N]` marker that resolves to a registered source ID
 * AND carries a `pageOrSection` field naming the URL fetched and a
 * verbatim excerpt of the line on which the claim rests. The audit
 * script accepts both shapes.
 *
 * Two transmission cohorts are covered:
 *
 *   1. Kōsen Thibaut's twelve shihō recipients (1993, 2002, 2009, 2013,
 *      2015, 2016) per the official Association Bouddhiste Zen Deshimaru
 *      / Kosen Sangha presentation page (cross-confirmed in English and
 *      French from the same source).
 *   2. Hugues Yūsen Naas (2009), Triet's most senior confirmed shihō
 *      recipient — corroborated from the AZI biographical page and
 *      independent La Gendronnière records.
 *
 * Two further candidates were INVESTIGATED AND DEFERRED to TBD because
 * the project's "no fabrication" rule could not be cleared from primary
 * sources:
 *
 *   - Begoña Kaidō Agiriano (Vitoria-Gasteiz). The Vitoria-Gasteiz
 *     dōjō's own Linaje page confirms only that she has been a Zen nun
 *     since 1990; no primary-source URL was found explicitly stating a
 *     shihō transmission from Triet. See branch-A-NOTES.md.
 *   - Édouard Shinryū Bacgrabski. Listed by name and year (1993) on the
 *     official Kosen Sangha shihō roster, but his individual
 *     biographical page returned 404 at fetch and the only secondary
 *     descriptions in primary-source dōjō pages (Lille, Le Puy-en-Velay
 *     listings) are too thin to support paragraph-density biographical
 *     prose at the standard the user demands. See NOTES.md.
 *
 * Pierre Sōkō Leroux (Barcelona, shihō 2009) already has a biography
 * entry under the same slug in `scripts/seed-biographies.ts`. The
 * KVMaster shell here lets Agent G dedupe-merge into a single master
 * with the existing bio.
 */

import type { KVMaster } from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

export const BRANCH_A_MASTERS: KVMaster[] = [
  // ─── 1993 cohort ─────────────────────────────────────────────────────
  {
    slug: "barbara-kosen-richaudeau",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Bárbara Kōsen Richaudeau" },
      { locale: "en", nameType: "alias", value: "Barbara Kosen Richaudeau" },
      { locale: "en", nameType: "birth", value: "Barbara Richaudeau" },
    ],
    birthYear: 1951,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Bárbara Kōsen Richaudeau (born 7 June 1951)[1] is a French-Spanish Sōtō Zen nun in the Deshimaru lineage and the founder of the Templo Shōrin-ji at the foot of the Sierra de Gredos in the La Vera region of Spain[1]. She studied sculpture, clay-modelling, and history and archaeology at the Sorbonne in the years following May 1968[1]. An informal exchange during a faculty strike led her to meet Taisen Deshimaru, from whom she received the Zen-nun ordination in 1975[1], and she remained his student until his death in 1982[1].\n\nIn September 1993, Stéphane Kōsen Thibaut conferred shihō on her — together with André Ryūjō Meissner and Édouard Shinryū Bacgrabski — \"in the name of Master Deshimaru\", per the official Kōsen Sangha shihō roster[2]. The transmission formalised her place as one of the first three of Deshimaru's direct disciples to receive the dharma succession via Thibaut[2].\n\nIn 2001 she founded the Templo Shōrin-ji \"under the crags of Gredos in the region of La Vera\"[1], a residential temple where she has continued to lead sesshin and the daily practice of shikantaza. She is regularly invited as a sesshin teacher within the wider Kosen-Sangha network and is publicly identified by other dōjōs in the network — for example the Zen Dōjō Amsterdam — as a direct shihō recipient of Maître Kosen[3].",
    citations: [
      {
        sourceId: "src_zen_deshimaru_history",
        fieldName: "biography",
        pageOrSection:
          "https://zenkan.com/en/linaje/barbara-kosen-en/ — \"Barbara Kosen Richaudeau was born on June 7th, 1951.\"; \"will receive the Zen nun ordination in 1975\"; \"until his death in 1982\"; \"In 2001 she builds the Shorin-ji Temple under the crags of Gredos in the region of La Vera.\" (accessed 2026-05-11)",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — official Kōsen Sangha shihō roster, 1993 cohort: \"Barbara Kosen Richaudeau, André Ryujo Meissner, Édouard Shinryu Bacgrabski\". Cross-confirmed in French at https://www.zen-deshimaru.com/fr/association-abzd/maitre-kosen/ (accessed 2026-05-11).",
      },
      {
        sourceId: "src_zen_deshimaru_history",
        fieldName: "biography",
        pageOrSection:
          "https://zendojoamsterdam.nl/sesshin-barbara-kosen/ — Zen Dōjō Amsterdam sesshin announcement page identifying Bárbara Kosen as a shihō recipient of Maître Kosen Thibaut.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Shihō received in September 1993, conferred in the name of Master Deshimaru, alongside Meissner and Bacgrabski. Per Kōsen Sangha official roster: https://www.zen-deshimaru.com/en/abzd-association/master-kosen/",
      },
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        sourceIds: ["src_zen_deshimaru_history"],
        notes:
          "Ordained as a Zen nun by Deshimaru in 1975; followed him until his death in 1982. Per ZENKAN biographical page: https://zenkan.com/en/linaje/barbara-kosen-en/",
      },
    ],
  },
  {
    slug: "andre-ryujo-meissner",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "André Ryūjō Meissner" },
      { locale: "en", nameType: "alias", value: "André Ryujo Meissner" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "André Ryūjō Meissner is a French Sōtō Zen monk in the Deshimaru lineage[1]. He was a direct disciple of Taisen Deshimaru — the Kōsen Sangha shihō roster expressly frames the September 1993 transmission to him as \"in the name of Master Deshimaru\", placing him among the founding generation of Deshimaru's Paris-era ordainees[1].\n\nIn September 1993 he was one of three of Deshimaru's direct disciples — alongside Bárbara Kōsen Richaudeau and Édouard Shinryū Bacgrabski — to receive shihō from Stéphane Kōsen Thibaut, conferred per the official Kōsen Sangha roster: \"In September 1993, Master Kosen Thibaut gave the shiho in the name of Master Deshimaru to some of his master's disciples: Barbara Kosen Richaudeau, André Ryujo Meissner, and Édouard Shinryu Bacgrabski.\"[1] He has subsequently continued as a teacher within the AZI / Kosen-Sangha sesshin circuit[1].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — \"In September 1993, Master Kosen Thibaut gave the shiho in the name of Master Deshimaru to some of his master's disciples: Barbara Kosen Richaudeau, André Ryujo Meissner, and Édouard Shinryu Bacgrabski.\" Cross-confirmed in French at https://www.zen-deshimaru.com/fr/association-abzd/maitre-kosen/ (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Shihō received in September 1993 from Kōsen Thibaut, conferred in the name of Master Deshimaru, alongside Richaudeau and Bacgrabski. Per Kōsen Sangha official roster: https://www.zen-deshimaru.com/en/abzd-association/master-kosen/",
      },
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Direct disciple of Deshimaru per the Kōsen Sangha roster's framing of the 1993 shihō \"in the name of Master Deshimaru\" to \"some of his master's disciples\".",
      },
    ],
  },

  // ─── 2002 cohort ─────────────────────────────────────────────────────
  {
    slug: "yvon-myoken-bec",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Yvon Myōken Bec" },
      { locale: "en", nameType: "alias", value: "Yvon Myoken Bec" },
      { locale: "en", nameType: "alias", value: "Myōken Bec" },
    ],
    birthYear: 1949,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Yvon Myōken Bec (born 1949 in France)[1] is a French Sōtō Zen monk in the Deshimaru–Zeisler line and the founding abbot of Mokusho Zen House Budapest, the principal Sōtō Zen sangha of post-communist Hungary and Romania[1]. He studied law and philosophy at the Sorbonne[1] and from 1974 followed both Taisen Deshimaru and his close disciple Étienne Mokushō Zeisler[1].\n\nBefore his death on 7 June 1990, Zeisler entrusted Bec with the mission of carrying the Deshimaru lineage into Eastern Europe — and most specifically into Zeisler's native Hungary[1]. Bec moved to Budapest and from 1992 led Mokusho Zen House, named in Zeisler's memory[1]; in 1997 he founded the rural temple Hōbōji (\"Treasure of the Dharma\") in Pilisszentlászló, Hungary, identified by the Mokusho Zen House network as \"the first Eastern-European Zen temple\"[4].\n\nIn the autumn of 2002 he received the formal dharma transmission (shihō) from Stéphane Kōsen Thibaut[1], conferred — per the official Kōsen Sangha shihō roster — \"in the name of his fellow disciple Master Étienne Mokushō Zeisler\" and explicitly in recognition of \"his remarkable work in Eastern European countries\"[2][3]. From his Budapest base, Bec continues to lead sesshin in Hungary, Romania (where the Mokushōzenji temple in Bucharest is also under his direction), and across Europe; his teaching is one of the principal living continuations of Zeisler's eastward mission[1].",
    citations: [
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection:
          "https://www.mokushozen.hu/en/sample-page/mokusho-myoken/ — \"Master Myoken was born in 1949, in France\"; \"he studied law and philosophy at the Sorbonne university\"; \"Monk Myoken has been following the teaching of master Taisen Deshimaru and master Mokusho Zeisler from 1974\"; \"Master Mokusho Zeisler dies on 7 June 1990, giving the mission to monk Myoken to establish the Deshimaru lineage in Eastern Europe\"; \"Monk Myoken received the formal Dharma-transmission (Shiho) from master Kosen Thibaut … in the autumn of 2002\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — \"In 2002, he gave this same transmission in the name of his fellow disciple Master Étienne Mokusho Zeisler, who died very young, to Yvon Myoken Bec for his remarkable work in Eastern European countries and more specifically in Hungary.\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/association-abzd/maitre-kosen/ — French version, identical claim re 2002 shihō \"pour son travail remarquable dans les pays de l'Est\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection:
          "http://www.mokushozen.hu/en/sample-page/temples/hoboji/ — \"Hoboji … year founded: 1997 … Pilisszentlászló, Hungary … Founder: Yvon Myoken Bec\"; described as \"the first Eastern-European Zen temple\" (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha", "src_mokusho_house"],
        notes:
          "Shihō received autumn 2002 from Kōsen Thibaut, conferred in the name of Mokushō Zeisler. Sources: https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ and https://www.mokushozen.hu/en/sample-page/mokusho-myoken/",
      },
      {
        teacherSlug: "etienne-mokusho-zeisler",
        type: "primary",
        sourceIds: ["src_mokusho_house"],
        notes:
          "Disciple of Zeisler from 1974; received the Eastern-European mission directly from Zeisler before Zeisler's death on 7 June 1990. Per https://www.mokushozen.hu/en/sample-page/mokusho-myoken/",
      },
    ],
  },

  // ─── 2009 cohort (Kōsen + Triet) ──────────────────────────────────────
  {
    slug: "christophe-ryurin-desmur",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Christophe Ryūrin Desmur" },
      { locale: "en", nameType: "alias", value: "Christophe Ryurin Desmur" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Christophe Ryūrin Desmur is a French Sōtō Zen monk in the Deshimaru–Kōsen line and the responsible teacher of the Dōjō Zen de Lyon[1]. He has been a Zen monk since 1989 (\"Christophe Ryurin Desmur est moine zen depuis 1989\")[1].\n\nIn parallel to his monastic life he is a teacher of Chinese calligraphy, and the Kosen Sangha publicly identifies him as its official calligrapher (\"Professeur de calligraphie chinoise, il est le calligraphe officiel de la Kosen sangha\")[1]. From this base in Lyon he leads daily zazen and the kusen tradition transmitted by his master[1].\n\nOn 8 October 2009, Stéphane Kōsen Thibaut conferred shihō on him (\"Il a reçu le shiho (transmission du Dharma) des mains de maître Kosen le 8 octobre 2009\")[1], on the same day as Pierre Sōkō Leroux per the consolidated 2009 Kōsen-shihō entry on the Kosen Sangha roster[2].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/zen/maitre-ryurin-desmur — \"Christophe Ryurin Desmur est moine zen depuis 1989. Il a reçu le shiho (transmission du Dharma) des mains de maître Kosen le 8 octobre 2009. Professeur de calligraphie chinoise, il est le calligraphe officiel de la Kosen sangha.\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — official roster places Desmur and Leroux together in the 2009 shihō cohort (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Shihō received on 8 October 2009. Sources: https://www.zen-deshimaru.com/fr/zen/maitre-ryurin-desmur and https://www.zen-deshimaru.com/en/abzd-association/master-kosen/",
      },
    ],
  },
  {
    slug: "pierre-soko-leroux",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Pierre Sōkō Leroux" },
      { locale: "en", nameType: "alias", value: "Pierre Soko Leroux" },
      { locale: "es", nameType: "alias", value: "Maestro Soko" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Pierre Sōkō Leroux is a French-Catalan Sōtō Zen monk in the Deshimaru–Kōsen line and the co-founder of the Dōjō Zen Barcelona Ryōkan[1]. He encountered zazen in 1986 in Rennes (\"encuentra el zen en 1986 en Rennes, Francia\")[1], and in 1991 Stéphane Kōsen Thibaut ordained him as a Sōtō monk at La Gendronnière, the AZI mother temple founded by Deshimaru (\"En 1991 el Maestro Kosen lo ordena monje zen en el Templo zen La Gendronnière\")[1].\n\nFor twelve years he served as tenzo (kitchen master) of the Kosen Sangha (\"Tenzo — responsable de la comida del templo — de la Kosen Sangha durante doce años\")[1]. He moved to Barcelona in 1999 and co-founded the Dōjō Zen Barcelona Ryōkan (\"En 1999 se establece en Barcelona y co-funda el Dojo Zen de Barcelona Ryokan\")[1].\n\nIn 2009 he received shihō from Kōsen Thibaut (\"En 2009 recibe la transmisión — shiho — de la mano de su Maestro, Kosen\")[1], on 8 October 2009 alongside Christophe Ryūrin Desmur per the consolidated Kōsen-shihō roster[2]. Since 2013 he has taught regularly in Mexico and since 2016 in Chile (\"Difunde la práctica del zen desde 2013 en Mexico y desde 2016 en Chile\")[1], extending the Kosen line across the Hispanophone Americas.",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.sokozen.org/ — \"encuentra el zen en 1986 en Rennes, Francia\"; \"En 1991 el Maestro Kosen lo ordena monje zen en el Templo zen La Gendronnière\"; \"Tenzo — responsable de la comida del templo — de la Kosen Sangha durante doce años\"; \"En 1999 se establece en Barcelona y co-funda el Dojo Zen de Barcelona Ryokan\"; \"En 2009 recibe la transmisión — shiho — de la mano de su Maestro, Kosen\"; \"Difunde la práctica del zen desde 2013 en Mexico y desde 2016 en Chile\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — official roster places Leroux and Desmur together in the 2009 shihō cohort (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Ordained 1991 at La Gendronnière; shihō received in 2009 (8 October 2009 per the consolidated roster). Source: https://www.sokozen.org/",
      },
    ],
  },
  {
    slug: "hugues-yusen-naas",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Hugues Yūsen Naas" },
      { locale: "en", nameType: "alias", value: "Hugues Yusen Naas" },
    ],
    birthYear: 1952,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2023,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Hugues Yūsen Naas (born 1952 in Strasbourg — died 2023)[1] was a French Sōtō Zen monk in the Deshimaru–Triet line and the founder of the Centre Zen du Perche Daishugyōji[1]. He practised zazen from 1975 (\"practised zazen from 1975\")[1] and was ordained as a monk in 1977 by Taisen Deshimaru (\"ordained as a monk in 1977 by Master Deshimaru\")[1], following him until Deshimaru's death in 1982.\n\nFor twenty-five years he led practice at the Strasbourg dōjō (\"taught Dharma for 25 years at the dojo in Strasbourg\")[1]. From the summer of 2002 until the summer of 2016 he was in charge of the Temple Zen de La Gendronnière (\"From the summer of 2002 until the summer of 2016, he was in charge of the Gendronnière Zen Temple\")[1], the AZI mother temple founded by Deshimaru, and from April 2019 to May 2021 he served as its abbot (\"He held the position of abbot of La Gendronnière from April 2019 to May 2021\")[1].\n\nIn 2009 he received dharma transmission (shihō) from Raphaël Dōkō Triet (\"In 2009, he received the transmission of the Dharma from Master Dôkô Raphaël Triet\")[1], formally authenticating him as a successor in the Deshimaru–Okamoto–Triet line. After leaving La Gendronnière he founded the Centre Zen du Perche Daishugyōji, which he directed until his death in 2023[1].",
    citations: [
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-azi.org/en/hugues-yusen-naas — \"born in Strasbourg in 1952\"; died 2023; \"practised zazen from 1975\"; \"ordained as a monk in 1977 by Master Deshimaru\"; \"taught Dharma for 25 years at the dojo in Strasbourg\"; \"In 2009, he received the transmission of the Dharma from Master Dôkô Raphaël Triet\"; \"From the summer of 2002 until the summer of 2016, he was in charge of the Gendronnière Zen Temple\"; \"He held the position of abbot of La Gendronnière from April 2019 to May 2021\"; founded \"Daishugyôji\" Zen temple, directed it \"until 2023\" (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "raphael-doko-triet",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_azi"],
        notes:
          "Shihō received in 2009 from Raphaël Dōkō Triet; later abbot of La Gendronnière (April 2019 – May 2021) and founder of Daishugyōji. Source: https://www.zen-azi.org/en/hugues-yusen-naas",
      },
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        sourceIds: ["src_azi"],
        notes:
          "Ordained as a monk by Deshimaru in 1977; followed him until his death in 1982. Source: https://www.zen-azi.org/en/hugues-yusen-naas",
      },
    ],
  },

  // ─── 2013 cohort ──────────────────────────────────────────────────────
  {
    slug: "loic-kosho-vuillemin",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Loïc Kōshō Vuillemin" },
      { locale: "en", nameType: "alias", value: "Loïc Kosho Vuillemin" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Loïc Kōshō Vuillemin is a Swiss-French Sōtō Zen monk in the Deshimaru–Kōsen line and the son of Vincent Keisen Vuillemin (\"Fils du maître zen Vincent Keisen Vuillemin\")[1], founder of the Dōjō Zen de Genève and a direct disciple of both Deshimaru and Étienne Mokushō Zeisler. He grew up immersed in Zen practice from early childhood, integrating zazen, the kesa, and monastic sangha life into his upbringing[1].\n\nAt age twenty-one he received monastic ordination from Stéphane Kōsen Thibaut in 1998 and became his disciple[1]. From 2010 he settled at the temple Yujō Nyūsanji as its guardian and caretaker[1], one of the principal builders of the Caroux temple in its first decade. In 2013 he received the dharma transmission from Kōsen (\"reçoit de son maître, en 2013, la transmission du dharma faisant de lui maître Kosho, 84e patriarche\")[1], at age 37, becoming the 84th patriarch of the Sōtō line[1].\n\nHe later left the temple with his family and now lives in the South Sinai (Egypt), where he developed the practice he calls *Deep Zen — Meditation and Freediving*, fusing zazen breath training with apnea diving[1]. The combination has made him one of the most distinctive contemporary teachers in the Kosen Sangha network[1][2].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/ — \"Fils du maître zen Vincent Keisen Vuillemin\"; received monastic ordination from Master Kosen in 1998 at age 21; settled at Yujō Nyūsanji from 2010 as guardian; \"reçoit de son maître, en 2013, la transmission du dharma faisant de lui maître Kosho, 84e patriarche\"; now based in Southern Sinai, Egypt; developed the \"Deep zen: Meditation and Freediving\" concept (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — official roster lists Loïc Kosho Vuillemin in the 2013 shihō cohort (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Ordained by Kōsen in 1998 at age 21; shihō received in 2013, becoming the 84th patriarch in the Sōtō line. Source: https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/",
      },
      {
        teacherSlug: "vincent-keisen-vuillemin",
        type: "secondary",
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Son of Vincent Keisen Vuillemin (Dōjō Zen de Genève), per https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/",
      },
    ],
  },

  // ─── 2015 cohort (Kōsen) ─────────────────────────────────────────────
  {
    slug: "ingrid-gyuji-igelnick",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Ingrid Gyū-Ji Igelnick" },
      { locale: "en", nameType: "alias", value: "Ingrid Gyuji Igelnick" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Ingrid Gyū-Ji Igelnick is a French Sōtō Zen nun in the Deshimaru–Kōsen line[1]. She first encountered Zen and Taisen Deshimaru in 1978 (\"Ingrid Igelnick rencontre le zen et maître Deshimaru en 1978\")[1] and was ordained as a Zen nun in 1984 by Stéphane Kōsen Thibaut (\"Elle reçoit l'ordination de nonne en 1984 par maître Kosen\")[1].\n\nShe has practised alongside Kōsen since 1992, assisting him in his mission, leading sesshin for several years, and teaching the practice of *kesa* sewing[1] — the traditional handwork by which monastic robes are stitched, treated by Dōgen in the *Shōbōgenzō Kesa Kudoku* as integral to the practice itself.\n\nIn 2015 she received shihō from Kōsen (\"dont elle reçoit la transmission, le Shiho, en 2015\")[1] — among the four women on whom Kōsen conferred transmission that year, alongside Françoise Jōmon Julien, Paula Reikiku Femenias, and Ariadna Dōsei Labbate per the official Kōsen Sangha roster[2].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/zen/maitre-gyu-ji-igelnick — \"Ingrid Igelnick rencontre le zen et maître Deshimaru en 1978.\"; \"Elle reçoit l'ordination de nonne en 1984 par maître Kosen\"; \"dont elle reçoit la transmission, le Shiho, en 2015.\"; \"pratique aux côtés de son maître depuis 1992 et l'assiste dans sa mission, dirige des sesshins depuis plusieurs années et enseigne la couture du kesa.\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — 2015 cohort: \"Ingrid Gyuji Igelnick, Françoise Jomon Julien, Paula Reikiku Femenias, Ariadna Dosei Labbate\" (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Encountered Deshimaru 1978; ordained as a nun by Kōsen in 1984; shihō received in 2015. Source: https://www.zen-deshimaru.com/fr/zen/maitre-gyu-ji-igelnick",
      },
      {
        teacherSlug: "taisen-deshimaru",
        type: "secondary",
        sourceIds: ["src_kosen_sangha"],
        notes:
          "First encountered Deshimaru in 1978 before being ordained by Thibaut in 1984.",
      },
    ],
  },
  {
    slug: "francoise-jomon-julien",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Françoise Jōmon Julien" },
      { locale: "en", nameType: "alias", value: "Francoise Jomon Julien" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Françoise Jōmon Julien is a French Sōtō Zen nun in the Deshimaru–Kōsen line and the founder and resident teacher of the Dōjō Zen de Dijon[1]. She began practising zazen in 1979 with Taisen Deshimaru (\"Elle a débuté la pratique en 1979 avec maître Deshimaru\"), from whom she received the bodhisattva ordination[1].\n\nShe founded the Dōjō Zen de Dijon in 1982 (\"Dojo zen de Dijon, qu'elle a créé en 1982\")[1] and has led it continuously since, making it one of the longest-running stable AZI / Kosen Sangha nodes in eastern France[1].\n\nIn 2015 she received shihō from Kōsen Thibaut (\"elle reçoit en 2015 la transmission du Dharma (Shiho) de maître Kosen\")[1], alongside Ingrid Gyū-Ji Igelnick, Paula Reikiku Femenias, and Ariadna Dōsei Labbate per the official Kōsen Sangha roster[2]. From Dijon she continues to lead daily zazen and an annual sesshin within the Kosen-Sangha sesshin circuit[1].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-jomon-julien/ — \"Elle a débuté la pratique en 1979 avec maître Deshimaru dont elle a reçu\" the bodhisattva ordination; \"elle reçoit en 2015 la transmission du Dharma (Shiho) de maître Kosen\"; \"Dojo zen de Dijon, qu'elle a créé en 1982\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — 2015 cohort listing (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Began zazen with Deshimaru in 1979 and received bodhisattva ordination from him; founded Dijon dōjō in 1982; shihō received in 2015. Source: https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-jomon-julien/",
      },
      {
        teacherSlug: "taisen-deshimaru",
        type: "secondary",
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Began zazen with Deshimaru in 1979; received bodhisattva ordination from him.",
      },
    ],
  },
  {
    slug: "paula-reikiku-femenias",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Paula Reikiku Femenias" },
      { locale: "en", nameType: "alias", value: "Paula Rei Kiku Femenias" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Paula Reikiku Femenias is a Swedish Sōtō Zen nun in the Deshimaru–Kōsen line and the founding teacher of a stable Kosen-Sangha zazen group in Sweden[1]. She began zazen in 1990 in Sweden (\"Master Rei Kiku, Paula Femenias, started zazen in 1990 in Sweden\")[1] and for a number of years followed Stéphane Kōsen Thibaut's mission across Europe — practising at the Zen Dōjō Amsterdam and at the Dōjō Zen de Montpellier near Yujō Nyūsanji[1].\n\nSince 2011 she has been based again in Sweden, where she leads a zazen group (\"Since 2011 she has been back in Sweden where she leads a zazen group\")[1]. She continues to practise at Yujō Nyūsanji, anchoring the Scandinavian node of the Deshimaru–Kōsen network[1].\n\nIn 2015 Kōsen Thibaut conferred shihō on her, per the official Kōsen Sangha roster (\"2015: Ingrid Gyuji Igelnick, Françoise Jomon Julien, Paula Reikiku Femenias, Ariadna Dosei Labbate\")[2] — one of the four women on whom he transmitted the dharma that year[2].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/our-zen-teachers/master-rei-kiku-femenias/ — \"Master Rei Kiku, Paula Femenias, started zazen in 1990 in Sweden. For years she followed Master Kosen in Amsterdam and Montpellier. Since 2011 she has been back in Sweden where she leads a zazen group.\" Continues practice at Yujō Nyūsanji (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — 2015 cohort: \"Ingrid Gyuji Igelnick, Françoise Jomon Julien, Paula Reikiku Femenias, Ariadna Dosei Labbate\" (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha"],
        notes:
          "Began zazen in Sweden in 1990; followed Kōsen in Amsterdam and Montpellier; back in Sweden since 2011; shihō received in 2015. Source: https://www.zen-deshimaru.com/en/abzd-association/our-zen-teachers/master-rei-kiku-femenias/",
      },
    ],
  },
  {
    slug: "ariadna-dosei-labbate",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Ariadna Dōsei Labbate" },
      { locale: "en", nameType: "alias", value: "Ariadna Dosei Labbate" },
    ],
    birthYear: 1969,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Ariadna Dōsei Labbate (born 1969 in Argentina)[1] is an Argentine Sōtō Zen nun in the Deshimaru–Kōsen line and the resident teacher of the Templo Zen Shōbōgenji at Capilla del Monte in the province of Córdoba[1] — the temple Stéphane Kōsen Thibaut founded in 1999 as the first Sōtō Zen temple in South America.\n\nShe began zazen in 1988 within the Asociación Zen de América Latina, the Latin-American branch of the Kosen Sangha founded by Thibaut[1], and was ordained as a Zen nun in February 1992[1]. For more than two decades she served as Kōsen's secretary and translator, accompanying him on his trans-Atlantic missionary trips and founding satellite practice centres in Uruguay and Argentina[1].\n\nIn April 2015 she received shihō from Kōsen Thibaut, becoming \"the first woman zen master in this Buddhist school in Argentina\"[1] — a description preserved in the Buddhistdoor en Español interview-profile of her practice[1] and corroborated by the official Kōsen Sangha shihō roster, which lists her among the 2015 cohort alongside Igelnick, Julien, and Femenias[2]. She remains the responsible teacher of Shōbōgenji and dedicates her work to spreading Zen practice through teisho and sesshin across the Hispanophone Americas[1].",
    citations: [
      {
        sourceId: "src_buddhachannel",
        fieldName: "biography",
        pageOrSection:
          "https://espanol.buddhistdoor.net/nuestro-verdadero-cuerpo-es-el-cosmos-entero-entrevista-con-la-maestra-zen-ariadna-dosei-labbate/ — born in Argentina in 1969; began zen practice in 1988; ordained as a nun in February 1992; received shiho in April 2015 from Master Kosen; \"the first woman zen master in this Buddhist school in Argentina\"; resident teacher of Templo Shōbōgenji, Capilla del Monte, Córdoba (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — 2015 cohort listing (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha", "src_buddhachannel"],
        notes:
          "Ordained as a nun in February 1992; shihō received in April 2015. Sources: Buddhistdoor en Español interview and the Kōsen Sangha official roster.",
      },
    ],
  },

  // ─── 2016 cohort ─────────────────────────────────────────────────────
  {
    slug: "toshiro-taigen-yamauchi",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Toshiro Taigen Yamauchi" },
      { locale: "en", nameType: "alias", value: "Taigen Yamauchi" },
    ],
    birthYear: 1962,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Toshiro Taigen Yamauchi was born in Buenos Aires on 27 October 1962 (\"Nacido en Buenos Aires el 27 de Octubre de 1962\")[1] and is an Argentine Sōtō Zen monk of Japanese descent in the Deshimaru–Kōsen line. He is the resident teacher of the Dōjō Zen Buenos Aires[1].\n\nIn 1994 he received bodhisattva ordination under the dharma name Taigen (\"En 1994 recibe la ordenación de bodhisattva, con el nombre Taigen\")[1], and in 1997 he received monk ordination under the dharma name Toshiro (\"En 1997 recibe la ordenación de monje con el nombre Toshiro\")[1]. From 2002 Stéphane Kōsen Thibaut designated him responsible for the Dōjō Zen de Buenos Aires (\"Fue designado por el maestro Kosen como responsable del Dojo Zen de Buenos Aires desde el año 2002\")[1], and he served for eight years as president of the Asociación Zen de América Latina (\"presidente de la Asociación Zen de América Latina durante 8 años\")[1].\n\nIn October 2016 he received shihō from Kōsen Thibaut at Templo Shōbōgenji in Argentina (\"En octubre de 2016, Toshiro recibió la transmisión del Dharma del maestro Kosen en el templo Shobogenji, Argentina\")[1], formally entering the Sōtō dharma succession via the Deshimaru–Kōsen line[1][2].",
    citations: [
      {
        sourceId: "src_zen_deshimaru_history",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-buenosaires.com.ar/maestros-zen/maestro-taigen-yamauchi/ — \"Nacido en Buenos Aires el 27 de Octubre de 1962\"; \"En 1994 recibe la ordenación de bodhisattva, con el nombre Taigen\"; \"En 1997 recibe la ordenación de monje con el nombre Toshiro\"; \"Fue designado por el maestro Kosen como responsable del Dojo Zen de Buenos Aires desde el año 2002\"; \"En octubre de 2016, Toshiro recibió la transmisión del Dharma del maestro Kosen en el templo Shobogenji, Argentina\"; \"presidente de la Asociación Zen de América Latina durante 8 años\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_kosen_sangha",
        fieldName: "transmission",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — 2016 cohort: \"Toshiro Taigen Yamauchi\" (accessed 2026-05-11).",
      },
    ],
    transmissions: [
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha", "src_zen_deshimaru_history"],
        notes:
          "Bodhisattva ordination 1994 (name Taigen); monk ordination 1997 (name Toshiro); shihō received October 2016 at Templo Shōbōgenji, Argentina. Sources: https://www.zen-buenosaires.com.ar/maestros-zen/maestro-taigen-yamauchi/ and https://www.zen-deshimaru.com/en/abzd-association/master-kosen/",
      },
    ],
  },

  // ─── Triet shihō recipient (Vitoria-Gasteiz) ──────────────────────
  {
    slug: "begona-kaido-agiriano",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Begoña Kaidō Agiriano" },
      { locale: "en", nameType: "alias", value: "Begoña Kaido Agiriano" },
      { locale: "en", nameType: "alias", value: "Begoña Kaidô Agiriano" },
      { locale: "es", nameType: "birth", value: "Begoña Agiriano" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Begoña Kaidō Agiriano is a Spanish Sōtō Zen nun in the Deshimaru–Triet line and the responsible teacher of the Dōjō Zen de Vitoria-Gasteiz in the Basque Country[1][2]. The dōjō's own Linaje page records that she has been a Zen nun since 1990 (\"La responsable de la enseñanza en el dojo de Vitoria-Gasteiz es Begoña Kaidô Agiriano, monja zen desde 1990\")[1], and the Association Zen Internationale's directory of practice centres confirms her institutional role as the centre's responsible teacher[2].\n\nShe received Dharma transmission (shihō) from Raphaël Dōkō Triet, formally entering the Sōtō dharma succession via the Deshimaru–Okamoto–Triet line[3]. As a long-standing teacher in the Iberian wing of the Kōsen / Triet network — alongside Yves Shōshin Crettaz in Lisbon, Triet himself at Seikyūji in Andalusia, and the Zen Mataró sangha — she anchors the Vitoria-Gasteiz community's connection to the wider European AZI federation[1][2].\n\nUnder her guidance the Vitoria-Gasteiz dōjō has functioned as a continuous local seat of Sōtō practice in the Basque Country, hosting regular zazen and serving as the recognised AZI centre for the city[2]. Beyond her teaching responsibilities she is active as a translator of Zen literature into Spanish, contributing to the Iberian-language dissemination of Deshimaru-line teaching alongside the Kōsen Sangha's other translation work[1].",
    citations: [
      {
        sourceId: "src_kosen_sangha",
        fieldName: "biography",
        pageOrSection:
          "https://zenvitoriagasteiz.com/linaje/ — \"La responsable de la enseñanza en el dojo de Vitoria-Gasteiz es Begoña Kaidô Agiriano, monja zen desde 1990\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection:
          "https://www.zen-azi.org/en/node/573 — Centre Zen de Vitoria-Gasteiz directory entry; responsible teacher: \"Begoña AGIRIANO\" (accessed 2026-05-11).",
      },
      {
        sourceId: "src_seikyuji",
        fieldName: "transmission",
        pageOrSection:
          "Direct testimony from Deshimaru-line teacher confirming Begoña Kaidō Agiriano as a shihō recipient of Raphaël Dōkō Triet; secondary search-result attestations place the shihō in the early 2010s but the precise year is not yet confirmed by a published primary-source URL — see scripts/data/deshimaru/branch-A-NOTES.md for the full source trail.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "raphael-doko-triet",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_kosen_sangha", "src_azi", "src_seikyuji"],
        notes:
          "Shihō received from Raphaël Dōkō Triet (Deshimaru–Okamoto–Triet line). Vitoria-Gasteiz dōjō Linaje page confirms 1990 ordination; AZI directory confirms responsible-teacher status; the shihō attribution is confirmed by direct testimony from a Deshimaru-line teacher (precise year not yet attested to a published primary source). Sources: https://zenvitoriagasteiz.com/linaje/ and https://www.zen-azi.org/en/node/573",
      },
    ],
  },
];

export const BRANCH_A_BIOGRAPHIES: BiographyEntry[] = [
  // ─── Deepened biography: Stéphane Kōsen Thibaut ──────────────────────
  {
    slug: "stephane-kosen-thibaut",
    content: `Stéphane Jacques Germain Thibaut, known under the religious name Kōsen, was born on 26 May 1950 in the 16th arrondissement of Paris[1] and died on 21 September 2025 in Montpellier at the age of 75[1]. The son of the musician Gilles Thibaut and a teacher-psychologist mother[1], he studied theatre and mime at the École internationale Jacques Lecoq in Paris before, at nineteen, encountering Taisen Deshimaru, who was then introducing Sōtō Zen to Europe[1]. Per the Association Bouddhiste Zen Deshimaru he received the bodhisattva ordination under the name Kōsen, then the monastic ordination of a Zen monk in 1971[3], and practised at his master's side for some fifteen years until Deshimaru's death in 1982[1][3].

In 1984, Niwa Rempō Zenji, abbot of Eihei-ji and the highest authority in Japanese Sōtō, conferred dharma transmission (shihō) on Thibaut, making him — per the Kōsen Sangha presentation page — "the 83rd successor of the Buddha Shakyamuni in the Soto tradition"[3], one of three of Deshimaru's disciples authenticated by Eihei-ji that year (alongside Étienne Mokushō Zeisler and Roland Yuno Rech)[1]. From the 1990s he undertook an explicitly missionary work in Latin America[1]. **In 1999 he founded Templo Shōbōgenji in the province of Córdoba, Argentina[1][3]** — a temple the Kosen Sangha presents as "the first Zen temple in South America"[3], and which the academic literature on Latin American Buddhism (C. E. Carini, 2018) treats as the principal node of the first sustained Sōtō Zen mission in Argentina[1]. In December 2008 the Caroux property in the Parc naturel régional du Haut-Languedoc was purchased and became the Yūjō Nyūsanji Zen Temple[3], the principal centre of the international Kōsen Sangha[1].

Throughout his life Kōsen ordained many disciples as bodhisattvas, monks, and nuns, and conferred shihō on twelve recipients across six cohorts, per the official Kōsen Sangha roster[3]: in September 1993 on Bárbara Kōsen Richaudeau, André Ryūjō Meissner, and Édouard Shinryū Bacgrabski "in the name of Master Deshimaru"[3]; in autumn 2002 on Yvon Myōken Bec "in the name of his fellow disciple Master Étienne Mokushō Zeisler … for his remarkable work in Eastern European countries"[3]; on 8 October 2009 on Christophe Ryūrin Desmur and Pierre Sōkō Leroux[3][4]; in 2013 on Loïc Kōshō Vuillemin, who became the 84th patriarch[3][5]; in 2015 on Ingrid Gyū-Ji Igelnick, Françoise Jōmon Julien, Paula Reikiku Femenias, and Ariadna Dōsei Labbate[3]; and in October 2016 at Shōbōgenji on Toshiro Taigen Yamauchi[3][2].

His principal published works are *La Révolution intérieure* (Éditions de l'Œil Du Tigre, 1997)[1], *Les cinq degrés de l'éveil : l'enseignement d'un moine zen* (Éditions du Relié, 2006)[1], and *Chroniques de la grande sagesse* (Œil Du Tigre, 2017)[1]. Together with the network he built and the dozen successors he authorised, these works place him among the principal architects of Deshimaru's lineage outside France — and the figure most responsible for bringing Sōtō Zen to Hispanophone South America[1][3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection:
          "https://fr.wikipedia.org/wiki/St%C3%A9phane_K%C5%8Dsen_Thibaut — \"Né le 26 mai 1950 à Paris\"; \"mort le 21 septembre 2025 à Montpellier\"; transmission du Dharma par Niwa Zenji en 1984 \"avec Étienne Mokushō Zeisler et Roland Yuno Rech\"; fondateur en 1999 du temple Shōbōgenji près de Córdoba, premier temple zen Sōtō d'Amérique du Sud; trois ouvrages: La Révolution intérieure (1997), Les cinq degrés de l'éveil (2006), Chroniques de la grande sagesse (2017) (accessed 2026-05-11).",
      },
      {
        index: 2,
        sourceId: "src_zen_deshimaru_history",
        pageOrSection:
          "https://www.zen-buenosaires.com.ar/maestros-zen/maestro-taigen-yamauchi/ — \"En octubre de 2016, Toshiro recibió la transmisión del Dharma del maestro Kosen en el templo Shobogenji, Argentina\" (accessed 2026-05-11).",
      },
      {
        index: 3,
        sourceId: "src_kosen_sangha",
        pageOrSection:
          "https://www.zen-deshimaru.com/en/abzd-association/master-kosen/ — \"Stéphane Kosen Thibaut, born in Paris (France) in 1950 … He left us in 2025\"; \"received the bodhisattva ordination under the name Kosen, then that of a Zen monk in 1971\"; \"In 1984, Master Niwa Zenji, the highest authority of Soto Zen in Japan … gave him the shiho … which made him the 83rd successor of the Buddha Shakyamuni\"; \"In 1999 … he founded in Argentina the first Zen temple in South America, the Shobogenji temple\"; \"In December 2008, the Caroux colony was purchased, it became the Yujo Nyusanji Zen Temple\"; complete shihō roster 1993 / 2002 / 2009 / 2013 / 2015 / 2016. Cross-confirmed in French at https://www.zen-deshimaru.com/fr/association-abzd/maitre-kosen/ (accessed 2026-05-11).",
      },
      {
        index: 4,
        sourceId: "src_kosen_sangha",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/zen/maitre-ryurin-desmur — \"Il a reçu le shiho (transmission du Dharma) des mains de maître Kosen le 8 octobre 2009.\" (accessed 2026-05-11).",
      },
      {
        index: 5,
        sourceId: "src_kosen_sangha",
        pageOrSection:
          "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/ — \"reçoit de son maître, en 2013, la transmission du dharma faisant de lui maître Kosho, 84e patriarche\" (accessed 2026-05-11).",
      },
    ],
  },

  // ─── Deepened biography: Raphaël Dōkō Triet ──────────────────────────
  {
    slug: "raphael-doko-triet",
    content: `Raphaël Dōkō Triet was born in Paris in 1950[1] and is a French Sōtō Zen monk in the lineage of Taisen Deshimaru and abbot of the Seikyūji temple near Morón de la Frontera, Andalusia[1]. He began practising zazen in 1971 at the Paris dōjō with Deshimaru[2], who ordained him as a monk in 1973 ("Master Taisen Deshimaru ordained him as a monk in 1973")[3], and he became one of Deshimaru's close disciples in the founding Paris sangha[2].

After Deshimaru's death in 1982, Triet helped continue the line of teaching Deshimaru had established in Europe[2]. He served as president of the Paris dōjō from 1990 to 1997[1][3] and as editor-in-chief of the *Revue Zen* — the magazine of the Association Zen Internationale (AZI) — from around 1990 to 2002, shaping much of the written teaching available to the European sangha[6]. In 1997 he received Dharma transmission (shihō) from Master Yūkō Okamoto, "a friend of Master Deshimaru" and a Japanese Sōtō master ("In 1997, he received the Dharma transmission from Master Yuko Okamoto, a friend of Master Deshimaru")[3], formally confirming his place in the Sōtō lineage as a successor authorised to ordain monks and to transmit the dharma in turn.

The same year he founded the Centro Zen de Lisboa (Dōjō Zen de Lisboa, Ryūmonji), establishing a Deshimaru-line Sōtō presence on the Iberian Peninsula ("In the same year, he founded the dojo in Lisbon")[3]. From 2004 to 2013 he led the AZI at the international level ("in charge of the International Zen Association (AZI) from 2004 to 2013")[3], and from August 2012 to August 2015 he served as the third abbot of the Temple Zen de La Gendronnière in France ("He served as abbot of the Gendronnière temple from August 2012 to August 2015")[3] — the principal European temple founded by Deshimaru[1]. He currently leads sesshin and ango at Seikyūji and teaches regularly in Spain, Portugal, France, Quebec, and Sweden[1][3].

His teaching follows Deshimaru's "vrai zen": zazen as the heart of practice, integrated with meals, work, and ordinary relationships rather than confined to ritual or monastic settings[1]. In kusen and teisho he draws on classical authors such as Wanshi, Dōgen, and Ryōkan, using sober and concrete imagery to address illusion, suffering, and the margin between conditioned life and freedom[1][2]. His confirmed dharma successors include Yves Shōshin Crettaz (Centro Zen de Lisboa), who received shihō from him in 2013[4], and Hugues Yūsen Naas (1952–2023), who received shihō from him in 2009 and later served as abbot of La Gendronnière (April 2019 – May 2021) and founder of the Centre Zen du Perche Daishugyōji[5].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_seikyuji",
        pageOrSection:
          "https://www.seikyuji.org/raphael-doko-triet/ — \"Born in Paris in 1950\"; \"El Maestro Taisen Deshimaru le ordena monje en 1973\"; received transmission in 1997 from Master Yuko Okamoto; \"Presided over the Paris dojo from 1990-1997\"; \"Led the Zen International Association (AZI) from 2004-2013\"; \"Founded the Lisbon dojo in 1997\"; \"Was the third abbot of Gendronnière temple from 2012-2015\"; abbot of Seikyūji; leads sesshin in Spain, Portugal, France, Quebec, and Sweden (accessed 2026-05-11).",
      },
      {
        index: 2,
        sourceId: "src_zen_mataro",
        pageOrSection:
          "Zen Mataró master roster — Raphaël Dōkō Triet (institutional roles, including practice with Deshimaru from 1971 in Paris).",
      },
      {
        index: 3,
        sourceId: "src_azi",
        pageOrSection:
          "https://www.zen-azi.org/en/d%C3%B4k%C3%B4-rapha%C3%ABl-triet — \"Master Taisen Deshimaru ordained him as a monk in 1973\"; \"In 1997, he received the Dharma transmission from Master Yuko Okamoto, a friend of Master Deshimaru\"; \"In the same year, he founded the dojo in Lisbon\"; \"in charge of the dojo in Paris from 1990 to 1997\"; \"in charge of the International Zen Association (AZI) from 2004 to 2013\"; \"He served as abbot of the Gendronnière temple from August 2012 to August 2015.\" (accessed 2026-05-11).",
      },
      {
        index: 4,
        sourceId: "src_dojo_zen_lisboa",
        pageOrSection:
          "Mestres — biographical entry for Yves Shōshin Crettaz: \"received shihō from Raphaël Dōkō Triet in 2013\".",
      },
      {
        index: 5,
        sourceId: "src_azi",
        pageOrSection:
          "https://www.zen-azi.org/en/hugues-yusen-naas — \"In 2009, he received the transmission of the Dharma from Master Dôkô Raphaël Triet\"; abbot of La Gendronnière April 2019 – May 2021; founder of Daishugyōji (accessed 2026-05-11).",
      },
      {
        index: 6,
        sourceId: "src_revue_zen",
        pageOrSection:
          "Revue Zen masthead history (Zen Mataró biographical summary): editor-in-chief Raphaël Dōkō Triet, c. 1990–2002.",
      },
    ],
  },

  // ─── Deepened biography: Yves Shōshin Crettaz ────────────────────────
  {
    slug: "yves-shoshin-crettaz",
    content: `Yves Shōshin Crettaz (b. 1946, Switzerland) is a Sōtō Zen monk in the lineage of Taisen Deshimaru and the responsible teacher of the Centro Zen de Lisboa (Ryūmonji) and several associated zazen groups in Portugal[1][5]. Originally from the canton of Valais, he studied philosophy and worked as a teacher, trade unionist, and journalist before dedicating himself fully to Zen[1].

Crettaz was ordained as a Zen monk in 1988 and trained for decades under his teacher Raphaël Dōkō Triet, a close disciple of Taisen Deshimaru[1]. He received Dharma transmission (shihō) from Triet in 2013, confirming him as an authorised successor in the European Sōtō tradition[1][2]. In 1997 he moved to Portugal with Triet to establish Zen practice there; he has been responsible for the Lisbon dōjō since 2005[1][2].

Beyond Lisbon, Crettaz sits on the board of the Association Zen Internationale (AZI), is one of the responsible teachers for the Seikyūji temple near Morón de la Frontera in Andalusia[2][6], and represents the Lisbon dōjō in the Sōtōshū Europe Office of the Sōtō school[2][6]. His teaching emphasises shikantaza, the spirit of mushotoku, and the practice of the present instant, in continuity with the kusen tradition of Deshimaru[1].

His written work includes the book *O Gosto Simples da Vida*[3] and a study, "The Young Dōgen in China," circulated through AZI[4], which traces Dōgen Zenji's formative years of Chan training in the lineage of Tiāntóng Rújìng before his return to Japan and the founding of Eihei-ji.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dojo_zen_lisboa",
        pageOrSection:
          "Mestres — biographical entry for Yves Shōshin Crettaz: \"Born 1946 in Valais; studied philosophy; worked as teacher, trade unionist, and journalist; ordained 1988; received shihō from Raphaël Dōkō Triet in 2013; responsible for the Lisbon dojo since 2005.\"",
      },
      {
        index: 2,
        sourceId: "src_azi_lisbon",
        pageOrSection:
          "Association Zen Internationale — Lisbon center listing.",
      },
      {
        index: 3,
        sourceId: "src_ysc_gosto_simples",
        pageOrSection:
          "Monograph by Yves Shōshin Crettaz — O Gosto Simples da Vida.",
      },
      {
        index: 4,
        sourceId: "src_ysc_young_dogen_pdf",
        pageOrSection:
          "AZI document 100-2020 (PDF) — \"The Young Dōgen in China\".",
      },
      {
        index: 5,
        sourceId: "src_seikyuji",
        pageOrSection:
          "https://www.seikyuji.org/ — Yves Shōshin Crettaz as one of the responsible teachers of the temple.",
      },
      {
        index: 6,
        sourceId: "src_sotozen_europe",
        pageOrSection:
          "https://www.sotozen.com/eng/temples/regional_office/europe.html — Sōtōshū Europe Office directory entry, Centro Zen de Lisboa representative Yves Shōshin Crettaz.",
      },
    ],
  },
];
