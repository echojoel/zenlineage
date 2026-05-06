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
      "Philippe Reiryū Coupey (born 8 December 1937 in New York City) is an American-born Sōtō Zen monk in the lineage of Taisen Deshimaru and Kōdō Sawaki, and one of the longest-serving teachers at the Dojo Zen de Paris. After studies in literature he settled in Paris in 1968 and met Deshimaru four years later, in 1972, becoming Reiryū Coupey — a close disciple who served as Deshimaru's principal English-language transcriber of the master's kusen until Deshimaru's death in 1982 (per fr.wikipedia, Association Zen Internationale, Buddhachannel).\n\nAfter 1982 he continued teaching at AZI; since 1994 he has directed an annual summer session at La Gendronnière, the AZI mother temple. He is the spiritual reference for some thirty dōjōs across France, Germany, England, and Switzerland, teaches at the Dojo Zen de Paris and the Seine Zen group, and leads sesshins through his international community Sangha Sans demeure (\"the Homeless Sangha\", organised through Zen Road). On 31 August 2008, at the Dojo Zen de Paris, he received dharma transmission (shihō) from Master Kishigami Kōjun, completing a transmission lineage that traces back through Sawaki to Dōgen.\n\nHis French books include Zen, simple assise — Le Fukanzazengi de Maître Dōgen (Désiris, 2009), Mon corps de lune (Désiris, 2007), Le chant du vent dans l'arbre sec (L'Originel, 2011), Dans le ventre du Dragon — Le Shinjinmei de Maître Sosan (Deux versants, 2002), Zen d'aujourd'hui (Le Relié, 2014), Les 10 taureaux du zen (2020), Fragments Zen (L'Originel, 2021), and the recent Minuit est la vraie lumière (Éditions de l'Éveil, 2023). His English-language Hohm Press editions Zen, Simply Sitting (2007), The Song of the Wind in the Dry Tree (2014), and In the Belly of the Dragon (2020) made the AZI lineage accessible to English-speaking readers, and as Deshimaru's transcriber he assembled the canonical posthumous Deshimaru titles La voix de la vallée (1994), Le rugissement du Lion (1994), Zen et karma (2016), and Les Deux Versants du Zen (2018). He also writes fiction under the pseudonym M.C. Dalley.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Philippe Coupey" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Philippe Reiryū Coupey" },
      { sourceId: "src_zen_road", fieldName: "biography", pageOrSection: "Sangha Sans demeure — Philippe Coupey" },
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
      "Olivier Reigen Wang-Genh (born 17 April 1955 in Molsheim, Alsace) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of the temple Kōsan Ryūmon-ji at Weiterswiller in northern Alsace (per fr.wikipedia, Association Zen Internationale, l'Alsace). He encountered Sōtō Zen in March 1973 and was ordained as a monk in 1977 by Taisen Deshimaru, whose teaching he followed until Deshimaru's death in 1982.\n\nFrom 1973 onward he developed the Strasbourg dōjō and took over its direction in 1986. Beginning in 1987, with the support of the German and French sanghas, he founded dōjōs across Baden-Württemberg, Alsace, and Basel — establishing the trans-Rhenan AZI network that today links French and German-speaking practitioners. In 1999 he founded Kōsan Ryūmon-ji (古山龍門寺, \"Temple of the Dragon Gate of the Old Mountain\") in Weiterswiller; he became its official abbot in 2010. In 2001 he received dharma transmission (shihō) from the Japanese master Dōshō Saikawa, and in 2004 was appointed kyōshi (教師, missionary monk) of the Sōtō school.\n\nHis institutional record is unusually broad: he served as president of the Union Bouddhiste de France (2007–2012, 2015–2017) and délégué president since 2021, vice-president (2012–2015, 2017–2019), and co-president (2019–2020); he has been president of the Association Zen Internationale since 2015 and of the Communauté bouddhiste d'Alsace since 2010. As UBF president he represents Buddhism in the Conférence des Responsables de Culte en France. He was named Knight of the Order of National Merit in 2016.\n\nHis books include Shushōgi: commentaires et enseignements (Éd. Ryumon Ji, 2006), C'est encore loin l'Éveil (Le Relié, 2020), and Six Paramita (Ryumon Ji).",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Olivier Wang-Genh" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Olivier Reigen Wang-Genh" },
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
      "Michel Reikū Bovay (1949–2009) was a Swiss Sōtō Zen monk in the Deshimaru lineage and the founder of the Zen Dōjō de Lausanne. He began zazen with Taisen Deshimaru in the early 1970s, was ordained as a monk by him, and became one of Deshimaru's closest Swiss-French disciples — part of the small group who took on the responsibility of holding the European Sōtō community together after the founder's death in 1982.\n\nBovay's most enduring contribution is on the page. With co-authors Lucien Marchand and Laurent Strim he wrote the 1987 introductory volume Zen (published in the \"Bref\" series of Éditions du Cerf), one of the very first comprehensive French-language presentations of the tradition's history, doctrine, and practice — a book that introduced an entire generation of French-speaking readers to AZI-style Sōtō. He continued for decades as one of the principal interpreters of Deshimaru's teaching for a Francophone lay audience.\n\nThrough his work in Lausanne and across French-speaking Switzerland he extended the AZI network into the Romandie (Geneva, Lausanne, Fribourg dōjōs) and trained a generation of Swiss practitioners. In 2022, thirteen years after his death, Éditions Le Relié published Deshimaru: Histoires vécues avec un maître zen — a posthumous collection of his memoirs of life and training under Deshimaru, the lifework of a chronicler completed by his sangha. Through these two books Bovay remains, alongside Pierre Crépon and Évelyne de Smedt, one of the principal first-generation French-language witnesses to Deshimaru's mission.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Zen Dōjō de Lausanne — Maître Michel Reikū Bovay" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "Bibliographie de Taisen Deshimaru" },
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
      "Évelyne Ekō / Reiko de Smedt is a French Sōtō Zen nun in the Deshimaru lineage and one of Taisen Deshimaru's earliest female disciples. Listed on the Association Zen Internationale teacher roster as Maître Évelyne Reiko de Smedt — Ekō (慧光, \"luminous wisdom\") and Reiko being two forms of her dharma name — she was ordained by Deshimaru in the 1970s and became part of the small editorial circle around the master.\n\nHer most consequential contribution to Deshimaru's western mission was as a co-author. With Lucien Marchand she wrote Zen, religion de la vie quotidienne (Albin Michel, 1976) — among the very first French-language presentations of Zen as Deshimaru taught it, written contemporaneously with Deshimaru's own Paris mission and frequently reissued as a standard introductory text. She also collaborated with Deshimaru himself on L'Anneau de la Voie (\"The Ring of the Way\"), an early formal presentation of the kusen (oral teaching given during zazen) genre in French. Several of Deshimaru's most-cited posthumous books carry her preface — including the 1985 edition of Zen et vie quotidienne (Albin Michel), introduced by her.\n\nWithin AZI she has led zazen and sesshin at Parisian dōjōs and at the temple La Gendronnière for several decades, and she co-authored with Pierre Dōkan Crépon the wider survey L'Esprit du Zen (Hachette, 2005). Her steady editorial presence across the AZI press is largely responsible for the way Deshimaru's spoken kusen became readable French text — and for the shape in which that teaching reached subsequent generations of European practitioners.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Évelyne Reiko de Smedt" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "Bibliographie de Taisen Deshimaru — préface d'Evelyn de Smedt" },
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
      "Pierre Reigen / Dōkan Crépon is a French Sōtō Zen monk in the Deshimaru lineage and the principal historian-biographer of Taisen Deshimaru in French. He is listed on the Association Zen Internationale teacher directory as Maître Pierre Dōkan Crépon (Dōkan being his Sōtō dharma name; Reigen the form preserved in older AZI records). Ordained by Deshimaru, he has taught within AZI for several decades.\n\nCrépon's enduring contribution is on the page. His long-form essay Maître Taisen Deshimaru et l'arrivée du zen en Europe — published on zen-azi.org and cited by the French Wikipedia article on Deshimaru as the canonical French-language source on the master's life — is the standard AZI account of Deshimaru's 1967 arrival in Paris and the founding decade of European Zen. Together with Évelyne Ekō de Smedt he co-authored L'Esprit du Zen (Hachette, 2005), one of the most widely-read French introductions to the tradition. He has also worked extensively as a translator of Buddhist literature.\n\nHis combined institutional and editorial role — practising teacher and primary chronicler — has made him largely responsible for the standard biographical understanding of the AZI tradition's founder. Where another disciple might pass on the master's silence by sitting, Crépon has done it by writing the silence's history.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Pierre Dōkan Crépon — book \"Maître Taisen Deshimaru et l'arrivée du zen en Europe\"" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "fr.wikipedia.org — Taisen Deshimaru, citing Crépon" },
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
      "Jean-Pierre Genshū / Taiun Faure (born 1948) is a French Sōtō Zen monk in the Deshimaru lineage and the founding abbot of the Temple Zen Kanshōji in the Dordogne. He is listed on the Association Zen Internationale teacher directory as Maître Jean-Pierre Taiun Faure (Taiun being his official Sōtō dharma name; Genshū is the alternate form preserved in older AZI records). Faure began practice with Taisen Deshimaru in the 1970s, was ordained as a monk by him, and followed Deshimaru until his death in 1982.\n\nAfter Deshimaru's death Faure continued his training in Japan, deepening his ritual education within mainstream Sōtō. He served for years as godo at La Gendronnière — the AZI mother temple — where his teaching of Sōtō ceremonial and discipline shaped a wide network of European practitioners. Kanshōji, founded by Faure as a residential Sōtō practice temple in the rural Dordogne, is registered with the Sōtōshū Europe Office and recognised as one of the principal European Sōtō monasteries outside La Gendronnière and Ryūmon-ji.\n\nThe surviving images on the Kanshōji website show him alongside Minamizawa Rōshi, the senior Eihei-ji master who has officiated at the temple's ojukai (lay ordination) ceremonies — a public marker of Faure's integration into both the Deshimaru-AZI lineage and the formal Japanese Sōtō institution. The temple's lay community spans France and the wider Francophone Buddhist world, and Faure has trained a number of younger AZI-lineage teachers.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Maître Jean-Pierre Taiun Faure" },
      { sourceId: "src_sotozen_europe", fieldName: "biography", pageOrSection: "France — Kanshōji" },
      { sourceId: "src_kanshoji", fieldName: "biography", pageOrSection: "Le monastère Kanshōji — fondateur et lignée" },
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
      "Vincent Keisen Vuillemin is a Swiss Sōtō Zen monk in the Deshimaru–Zeisler line and the founder of the Dōjō Zen de Genève. He was ordained by Taisen Deshimaru in the late 1970s; after Deshimaru's death in 1982 he pursued his deeper formation as a disciple of Étienne Mokushō Zeisler, with whom he was closely associated until Zeisler's death in 1990. Mokusho Zen House Budapest — the Hungarian sangha founded by Yvon Myōken Bec, Zeisler's dharma-heir — explicitly identifies Vuillemin as \"Vincent Keisen Vuillemin, from Geneva, disciple of master Zeisler\".\n\nThrough the Geneva dōjō and the Romandie network around it, Vuillemin has taught zazen in French-speaking Switzerland for several decades, becoming one of the principal AZI-affiliated teachers in the region. The Dōjō Zen de Genève is listed on the AZI directory and on the Sōtōshū Europe Office's directory of practice centres, and has served as one of the stable Romandie nodes through which the European Sōtō network has continued to organise itself across the second and third generations after Deshimaru.\n\nHis distinctive position — a direct disciple of Deshimaru in his ordination but a successor of Zeisler in his deeper training — places him on the bridge between the founding AZI generation and the eastward-leaning Mokusho line that Zeisler launched into Romania, Hungary, and the broader post-communist East before his early death in Vienna.",
    citations: [
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Dōjō Zen de Genève" },
      { sourceId: "src_mokusho_house", fieldName: "biography", pageOrSection: "Mokusho Zen House — Our Story (identifies Vuillemin as a Zeisler disciple)" },
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
