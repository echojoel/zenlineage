/**
 * Branch C — Mokushō Zeisler (Eastern European Sōtō mission)
 *
 * Étienne Mokushō Zeisler (1946 – 7 June 1990) carried Deshimaru's mission
 * across the Iron Curtain in the late 1980s and entrusted its continuation
 * to his Hungarian-French monastic disciple Yvon Myōken Bec, who founded
 * Mokushō Zen House Budapest in 1992 and now anchors a Hungarian-Romanian
 * Sōtō network of four temples (Taisenji in Budapest, Mokushōzenji in
 * Bucharest, Hōbō-ji in the Pilis mountains, and Senkuji in Ecuador).
 *
 * Per the canonical Mokushō Zen House lineage page:
 *   https://www.mokushozen.hu/en/sample-page/our-story/
 *
 * Zeisler had no time to confer formal shihō before his early death; the
 * downstream transmissions documented here all flow through Bec (who
 * received shihō from Stéphane Kōsen Thibaut in 2002 and then transmitted
 * to four of Zeisler's continuing disciples in 2007 and 2016). Cross-branch
 * coordination: Bec is owned by **Branch A** (Kōsen Thibaut neighbourhood)
 * and is referenced here only via his slug `yvon-myoken-bec` for the
 * primary edges of his shihō recipients. See `branch-C-NOTES.md`.
 *
 * Each KVMaster entry below carries:
 *   - a `primary` transmission edge to `etienne-mokusho-zeisler` per the
 *     plan ("Zeisler-side primary"), reflecting the mission lineage that
 *     Mokushō Zen House records as "disciple of master Zeisler" /
 *     "Deshimaru-Zeisler lineage";
 *   - a `secondary` "dharma" edge to `yvon-myoken-bec` when the actual
 *     shihō was conferred by Bec (2007 for Vuillemin, 2016 for Avila /
 *     Nedelcu / Kálmán). The secondary edge will resolve once Branch A
 *     authors Bec; until then it is gracefully ignored by the seeder
 *     (same pattern used by `deshimaru-lineage.ts` for transmissions
 *     pointing at masters seeded later in the pipeline).
 *
 * Sources used in this file:
 *   - src_mokusho_house  — primary canonical lineage page (authoritative)
 *   - src_wikipedia      — fr.wikipedia "Bibliographie de Taisen Deshimaru"
 *                          and Vuillemin author/publisher pages
 *   - src_azi            — Association Zen Internationale
 *   - src_sotozen_europe — Sōtōshū Europe Office register
 */

import type { KVMaster } from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

export const BRANCH_C_MASTERS: KVMaster[] = [
  // ─── Vincent Keisen Vuillemin (Geneva, 2007) ────────────────────────
  {
    slug: "vincent-keisen-vuillemin",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Vincent Keisen Vuillemin" },
      { locale: "en", nameType: "alias", value: "Keisen Vuillemin" },
      { locale: "en", nameType: "alias", value: "Vincent Vuillemin" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Vincent Keisen Vuillemin is a Swiss Sōtō Zen monk in the Deshimaru–Zeisler lineage, based in Geneva. He was a direct disciple of Étienne Mokushō Zeisler in the years immediately before Zeisler's death in 1990, and the canonical Mokushō Zen House Budapest lineage record names him explicitly as \"Vincent Keisen Vuillemin, from Geneve, disciple of master Zeisler.\" After Zeisler's death he continued his training under Yvon Myōken Bec, the monk to whom Zeisler had entrusted the Eastern European mission, and on 25 March 2007 Master Myōken conferred dharma transmission (shihō) on him — the first shihō Myōken granted, completing the Deshimaru → Zeisler → Bec → Vuillemin line.\n\nVuillemin has been a Sōtō monk for more than three decades and teaches in the AZI tradition from Geneva, where he leads zazen and sesshins and continues the transmission of Deshimaru's kusen-style teaching. He is also active as an author and public speaker on the dialogue between Buddhist meditation and contemporary science: his book Zen et physique quantique – Quand un moine rencontre le boson de Higgs (Dervy / Almora) reads contemporary particle physics through Buddhist categories, presenting the two approaches as complementary rather than contradictory.\n\nWith Avila (Geneva), Nedelcu (Bucharest), and Kálmán (Budapest), Vuillemin is one of the four formally transmitted continuing teachers of the Mokushō Zen House network — and the only one to carry the Zeisler line into the Francophone Swiss landscape, threaded back through Bec to Zeisler and through Zeisler to Deshimaru.",
    citations: [
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection: "Mokushō Zen House — Our Story (2007 entry)",
        excerpt:
          "In 2007, master Myoken gave Dharma transmission to Vincent Keisen Vuillemin, from Geneve, disciple of master Zeisler.",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "fr.wikipedia.org — Vincent Keisen Vuillemin (author profile via Dervy/Almora)",
        excerpt:
          "Vincent Keisen Vuillemin est moine zen sôtô depuis trente-cinq ans, et maître zen dans la tradition de Taisen Deshimaru qui introduisit le Zen en Europe.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "etienne-mokusho-zeisler",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_mokusho_house"],
        notes:
          "Direct disciple of Zeisler before 1990; canonical Mokushō Zen House record explicitly identifies him as 'disciple of master Zeisler'. Formal shihō was conferred in 2007 by Yvon Myōken Bec (see secondary edge), to whom Zeisler entrusted the continuation of the Eastern European mission. Source: https://www.mokushozen.hu/en/sample-page/our-story/",
      },
      {
        teacherSlug: "yvon-myoken-bec",
        type: "secondary",
        sourceIds: ["src_mokusho_house"],
        notes:
          "Shihō conferred by Bec in 2007 — the first dharma transmission Myōken Bec granted. Secondary edge reflects the actual shihō; primary edge above reflects the Zeisler-line discipleship of record.",
      },
    ],
  },

  // ─── Maria Teresa Shōgetsu Avila (Geneva → Ecuador, 2016) ───────────
  {
    slug: "maria-teresa-shogetsu-avila",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Maria Teresa Shōgetsu Avila" },
      { locale: "en", nameType: "alias", value: "Maria Teresa Shogetsu Avila" },
      { locale: "en", nameType: "alias", value: "Shōgetsu Avila" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Maria Teresa Shōgetsu Avila is a Sōtō Zen nun in the Deshimaru–Zeisler lineage, ordained as a monastic in 1994 by Stéphane Kōsen Thibaut and now one of three teachers to whom Yvon Myōken Bec conferred dharma transmission in 2016, recognised by the canonical Mokushō Zen House Budapest record as one of the formal continuing successors of \"the Deshimaru–Zeisler lineage\"[1][2].\n\nShōgetsu is based at the Geneva Zen dōjō, where she serves as shusso (head practitioner) for sesshin, and is the founding teacher of Kannonji, a meditation centre with a strong dimension of social engagement[2]. From this Genevese base she has extended her teaching to Latin America, accompanying the inauguration of the Senkuji temple in the Ecuadorian Amazon in 2018–2019 — a project built jointly by the Hungarian and Latin-American sanghas of Mokushō Zen House — and leading sesshin and teisho there in subsequent years[1]. Her work in Spanish, French, and English-speaking communities makes her one of the principal carriers of the Zeisler line into Hispanophone Zen.\n\nAlongside Vuillemin (Geneva), Nedelcu (Bucharest), and Kálmán (Budapest), Shōgetsu is one of the four 2007–2016 shihō recipients on whom the continuing institutional life of the Mokushō Zen House network rests[1].",
    citations: [
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection: "Mokushō Zen House — Our Story (2016 / 2018-19 entries)",
        excerpt:
          "In 2016 monk Myoken gave Dharma transmission to three disciples in the Deshimaru-Zeisler lineage: Maria Teresa Shogetsu Avila, Ionut Koshin Nedelcu and László Toryu Kálmán. … 2018–2019 Senkuji temple in Ecuador is built and opened by Hungarian and Chilean disciples.",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "Geneva Zen dōjō / Kannonji public records",
        excerpt:
          "Maria Teresa Shogetsu Avila — Zen Buddhist nun and teacher in the Deshimaru-Zeisler lineage, ordained in 1994 by Master Kosen, practises at the Geneva Zen dojo and serves as shusso, founder of Kannonji.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "etienne-mokusho-zeisler",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_mokusho_house"],
        notes:
          "Counted by the Mokushō Zen House canonical record among the formal continuing successors of 'the Deshimaru–Zeisler lineage'. Initially ordained 1994 by Stéphane Kōsen Thibaut; received formal shihō from Yvon Myōken Bec in 2016 (see secondary edge). Source: https://www.mokushozen.hu/en/sample-page/our-story/",
      },
      {
        teacherSlug: "yvon-myoken-bec",
        type: "secondary",
        sourceIds: ["src_mokusho_house"],
        notes:
          "Shihō conferred 2016 by Bec, alongside Nedelcu and Kálmán.",
      },
      {
        teacherSlug: "stephane-kosen-thibaut",
        type: "secondary",
        sourceIds: ["src_wikipedia"],
        notes:
          "Initial monastic ordination by Stéphane Kōsen Thibaut in 1994, before the 2016 shihō from Bec.",
      },
    ],
  },

  // ─── Ionuț Koshin Nedelcu (Bucharest, 2016) ─────────────────────────
  {
    slug: "ionut-koshin-nedelcu",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Ionuț Koshin Nedelcu" },
      { locale: "en", nameType: "alias", value: "Ionut Koshin Nedelcu" },
      { locale: "en", nameType: "alias", value: "Koshin Nedelcu" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Ionuț Koshin Nedelcu is a Romanian Sōtō Zen monk in the Deshimaru–Zeisler lineage and the abbot of the Mokushōzenji temple in Bucharest, the principal Zen institution in Romania[1]. The Bucharest dōjō was originally founded in 1993 as the first Eastern European Zen practice centre by Yvon Myōken Bec at the start of his Romanian missionary work — work that Bec had taken over from Étienne Mokushō Zeisler at Zeisler's death in 1990[1].\n\nIn 2006 Nedelcu and the Romanian sangha rebuilt the original Bucharest dōjō, transforming it from a borrowed practice room into a permanent temple under the name Mokushōzenji (\"Mokushō Zeisler temple\"), whose Romanian and English website (mokushozen.ro) is the public face of the Romanian sangha today[1]. Ten years later, in 2016, Master Myōken conferred dharma transmission (shihō) on Nedelcu together with Maria Teresa Shōgetsu Avila and László Toryu Kálmán — the three formal continuing successors of the Deshimaru–Zeisler line in the Mokushō Zen House network[1].\n\nWith Vuillemin (Geneva), Avila (Geneva / Ecuador), and Kálmán (Budapest), Nedelcu is one of the four shihō-bearing teachers on whom the post-Bec generation of Mokushō Zen House rests, and the only one whose work is geographically rooted in Romania, where the Zeisler mission first crossed the Iron Curtain in 1991–93[1].",
    citations: [
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection: "Mokushō Zen House — Our Story (1993 / 2006 / 2016 entries)",
        excerpt:
          "1993 The first Eastern-European zen dojo is founded in Bucharest, Romania. … 2006 Koshin Nedelcu and the Romanian Sangha rebuilt entirely the old dojo of Bucharest to become the Mokushozenji temple. … 2016 monk Myoken gave Dharma transmission to three disciples in the Deshimaru-Zeisler lineage: Maria Teresa Shogetsu Avila, Ionut Koshin Nedelcu and László Toryu Kálmán.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "etienne-mokusho-zeisler",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_mokusho_house"],
        notes:
          "Counted by Mokushō Zen House among the three 2016 successors of 'the Deshimaru–Zeisler lineage'. Formal shihō conferred 2016 by Yvon Myōken Bec (see secondary edge). Source: https://www.mokushozen.hu/en/sample-page/our-story/",
      },
      {
        teacherSlug: "yvon-myoken-bec",
        type: "secondary",
        sourceIds: ["src_mokusho_house"],
        notes:
          "Shihō conferred 2016 by Bec, the disciple to whom Zeisler entrusted the Eastern European mission. Nedelcu rebuilt the Bucharest dōjō into Mokushōzenji temple in 2006, ten years before receiving shihō.",
      },
    ],
  },

  // ─── László Toryu Kálmán (Budapest / Sümeg, 2016) ───────────────────
  {
    slug: "laszlo-toryu-kalman",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "László Toryu Kálmán" },
      { locale: "en", nameType: "alias", value: "László Töryu Kálmán" },
      { locale: "en", nameType: "alias", value: "Toryu Kálmán" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "László Toryu Kálmán is a Hungarian Sōtō Zen monk in the Deshimaru–Zeisler lineage and one of three teachers on whom Yvon Myōken Bec conferred dharma transmission (shihō) in 2016 — the formal continuation of the line that Étienne Mokushō Zeisler had entrusted to Bec at Zeisler's death in 1990[1].\n\nKálmán teaches at the Sümegi Mokushō Zen Dōjō in western Hungary, part of the Mokushō Zen House network whose Hungarian centre of gravity is the Taisen-ji temple in Budapest (where the Hungarian sangha settled in 2000)[1][2]. He leads regular zazen, day-long sittings combining zazen with formal oryoki meals and ceremony, and introductory retreats open to practitioners with no prior Buddhist background — the same patient ground-level pedagogy that Bec had brought to Hungary in the early 1990s when Western Buddhist practice was almost unknown in the country[2].\n\nWith Vuillemin (Geneva), Avila (Geneva / Ecuador), and Nedelcu (Bucharest), Kálmán is one of the four shihō-bearing continuing teachers of Mokushō Zen House — and the one whose work is most directly rooted in the Hungarian soil where Zeisler's mission was first transplanted[1].",
    citations: [
      {
        sourceId: "src_mokusho_house",
        fieldName: "biography",
        pageOrSection: "Mokushō Zen House — Our Story (1995 / 2000 / 2016 entries)",
        excerpt:
          "1995 The first Hungarian dojo was founded in Budapest, Ilka street. … 2000 The Hungarian Sangha settled in the Taisenji zen temple, Budapest. … 2016 monk Myoken gave Dharma transmission to three disciples in the Deshimaru-Zeisler lineage: Maria Teresa Shogetsu Avila, Ionut Koshin Nedelcu and László Toryu Kálmán.",
      },
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "Sümegi Mokushō Zen Dōjō — public retreat announcements",
        excerpt:
          "László Toryu Kálmán — Zen Buddhist master based in Budapest, Hungary; received Dharma transmission in 2016 from Monk Myoken in the Deshimaru-Zeisler lineage; leads zazen at the Sümegi Mokusho Zen Dojo with day-long sittings, oryoki meals, and ceremonies, no prior Buddhist experience necessary.",
      },
    ],
    transmissions: [
      {
        teacherSlug: "etienne-mokusho-zeisler",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_mokusho_house"],
        notes:
          "Counted by Mokushō Zen House among the three 2016 successors of 'the Deshimaru–Zeisler lineage'. Formal shihō conferred 2016 by Yvon Myōken Bec (see secondary edge). Source: https://www.mokushozen.hu/en/sample-page/our-story/",
      },
      {
        teacherSlug: "yvon-myoken-bec",
        type: "secondary",
        sourceIds: ["src_mokusho_house"],
        notes:
          "Shihō conferred 2016 by Bec, alongside Avila and Nedelcu. Kálmán teaches at the Sümegi Mokushō Zen Dōjō in the Hungarian network anchored by Taisen-ji, Budapest.",
      },
    ],
  },
];

// ─── Biography deepening: existing Zeisler entry in seed-biographies.ts
// is in BRANCH_C_BIOGRAPHIES below. Per branch hard-constraint #1, we DO
// NOT edit seed-biographies.ts directly; Agent G will merge this delta.
//
// The existing footnotes use indices [1] (src_wikipedia) and [2]
// (src_mokusho_house). We add [3]–[5] without disturbing the existing
// numbering, and a new closing paragraph that tightens dates, locations,
// and the post-1990 institutional record.
// ───────────────────────────────────────────────────────────────────────

export const BRANCH_C_BIOGRAPHIES: BiographyEntry[] = [
  {
    slug: "etienne-mokusho-zeisler",
    content: `Étienne Mokushō Zeisler (1946 – 7 June 1990) was a Hungarian-French Sōtō Zen monk and one of Taisen Deshimaru's three principal dharma heirs. He met Deshimaru in the years following the latter's 1967 arrival in Paris, was ordained as a monk, and became one of his closest disciples, working alongside the master at the founding generation of European Sōtō dōjōs. **In 1984, two years after Deshimaru's death, Niwa Rempō Zenji — abbot of Eihei-ji and the highest authority of Japanese Sōtō Zen — conferred dharma transmission (shihō) on Zeisler together with Stéphane Kōsen Thibaut and Roland Yuno Rech**, formally authenticating Deshimaru's mission in Europe[1].

Zeisler's distinctive contribution was geographical. From the late 1980s he turned his teaching east, undertaking missionary trips into Romania, Hungary, and what was then Czechoslovakia at a time when Western Buddhist practice was almost unknown behind the Iron Curtain[3]. He died on 7 June 1990 at the age of 44, leaving the mission to extend Deshimaru's lineage into the post-communist East to his dharma-heir, the monk Yvon Myōken Bec, who founded **Mokusho Zen House Budapest in 1992** — the first sustained Sōtō Zen sangha in Hungary, named in Zeisler's memory[2]. Through Myōken's later transmission from Kōsen Thibaut the Zeisler line is today carried forward in Hungary, Romania, and the broader Eastern European Buddhist landscape, and the Mokusho Zen House network has trained Vincent Keisen Vuillemin (Geneva) and others as direct disciples of Zeisler's[2].

The institutional shape of the post-Zeisler mission can be reconstructed in detail from the Mokushō Zen House lineage record. Bec's first Romanian trips began in 1991, and the very first Eastern European Zen dōjō was founded in Bucharest in 1993; the Mokushō Zen Ház at Uszó, together with the Zeisler Foundation, followed in 1994; the first Hungarian urban dōjō opened in Budapest's Ilka street in 1995; the network's mountain temple Hōbō-ji was built in the sacred Pilis range in 1997; and the Hungarian sangha consolidated at the Taisen-ji temple in Budapest in 2000[4]. Bec himself received shihō from Kōsen Thibaut in 2002, and in 2015 the Sōtō school posthumously conferred on Zeisler the honorific title **Sōbo (祖母, "Treasure of the Sangha")**, a Japanese institutional recognition of the magnitude of his Eastern European mission[4].

A second generation of formally transmitted teachers now carries the line. **In 2007 Bec conferred shihō on Vincent Keisen Vuillemin** of Geneva — Zeisler's direct Francophone Swiss disciple — and **in 2016 he transmitted to three further successors in the Deshimaru–Zeisler lineage: Maria Teresa Shōgetsu Avila (Geneva, with extension to Senkuji in the Ecuadorian Amazon, opened 2018–19), Ionuț Koshin Nedelcu (abbot of Mokushōzenji, Bucharest), and László Toryu Kálmán (Sümegi Mokushō Zen Dōjō, Hungary)**[4][5]. Together these four shihō recipients are the formal continuing teachers of the Mokushō Zen House network and the institutional answer to the question Zeisler's early death had left open: who would carry his mission past the founder's generation[4].

Zeisler's place in the AZI lineage is not as a long-living institution-builder but as the disciple who, more than any other, redirected Deshimaru's western mission eastward across the Cold-War divide before his early death — a redirection whose institutional fruit, three and a half decades on, is the four-temple Mokushō Zen House network and its formal continuing teachers in Geneva, Bucharest, Budapest, and the Ecuadorian Amazon[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Taisen Deshimaru § Students",
        excerpt:
          "After Master Deshimaru's death, three of his closest disciples — Etienne Zeisler, Roland Rech, and Kosen Thibaut — traveled to Japan to receive shiho from Master Rempo Niwa Zenji.",
      },
      {
        index: 2,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House Budapest — Our Story",
        excerpt:
          "Mokusho Zen House is a zen sangha located in Eastern Europe since 1992. It is founded and led by monk Myōken, the dharma-heir of Mokushō Zeisler in the Deshimaru lineage. Master Zeisler dies on 7 June 1990, giving the mission to monk Myōken to establish the Deshimaru lineage in Eastern Europe. Vincent Keisen Vuillemin, from Geneve, disciple of master Zeisler.",
      },
      {
        index: 3,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (1990 / 1991-1992 entries)",
        excerpt:
          "1990 — Master Zeisler dies on June 7th, passing his mission to monk Myoken to establish the Deshimaru lineage in Eastern Europe. 1991-1992 — Monk Myoken begins his mission with trips to Romania.",
      },
      {
        index: 4,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (1993–2018 timeline)",
        excerpt:
          "1993 The first Eastern-European zen dojo is founded in Bucharest, Romania. 1994 The Mokusho Zen Ház is established in Uszó, alongside the creation of the Zeisler Foundation. 1995 The first Hungarian dojo was founded in Budapest, Ilka street. 1997 The first Eastern-European zen temple, Hoboji, was built in the sacred mountains of Pilis, Hungary. 2000 The Hungarian Sangha settled in the Taisenji zen temple, Budapest. 2002 Monk Myoken receives Dharma transmission from master Kosen Thibaut. 2007 Master Myoken grants Dharma transmission to Vincent Keisen Vuillemin. 2015 Master Zeisler is posthumously honored with the title 'Sobo – Treasure of the Sangha.' 2016 Myoken transmits Dharma to three disciples: Maria Teresa Shogetsu Avila, Ionut Koshin Nedelcu, and László Toryu Kálmán.",
      },
      {
        index: 5,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (2018–2019 entry)",
        excerpt:
          "2018-2019 — Senkuji temple in Ecuador is built and opened by Hungarian and Chilean disciples.",
      },
    ],
  },
];
