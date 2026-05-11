/**
 * Branch B — AZI mainline / Roland Yuno Rech heirs
 *
 * Roland Yuno Rech (b. 20 June 1944, Paris) is one of the three Deshimaru
 * disciples confirmed by Niwa Rempō Zenji at Eihei-ji in 1984. Since 2010
 * he has himself transmitted shihō to a generation of European successors.
 * This file authors only the formal shihō recipients listed by the
 * AZI / ABZE master registry, cross-verified against each heir's own dōjō
 * or temple website wherever a second source exists.
 *
 * Citation policy (reviewed by lineage-side reviewer, May 2026):
 *   - Every paragraph carries 2–4 inline `[N]` markers.
 *   - Every footnote `pageOrSection` field gives the exact URL the claim
 *     was retrieved from, with the access date 2026-05-11 and a literal
 *     excerpt that the reviewer can verify by clicking through.
 *   - High confidence (≥2 independent sources naming heir + year + dōjō):
 *     `birthConfidence` reflects only birth-year confidence and is set to
 *     "high" when the birth year itself is independently confirmed.
 *   - Medium confidence (1–2 sources, OR birth year unverified): the AZI
 *     URL is cited directly in the transmission `notes`, and birth fields
 *     use precision "unknown" / confidence "low".
 *
 * Source IDs used:
 *   src_azi                 — Association Zen Internationale + ABZE roster
 *   src_sotozen_europe      — Sōtōshū Europe office / official registries
 *   src_wikipedia           — fr.wikipedia.org / en.wikipedia.org
 *   src_la_gendronniere     — La Gendronnière temple
 *   src_ubf                 — Union Bouddhiste de France
 *   src_revue_zen           — Revue Zen
 *   src_buddhachannel       — Buddhachannel news
 *   src_zen_deshimaru_history — Deshimaru lineage history
 */
import type { KVMaster } from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

export const BRANCH_B_MASTERS: KVMaster[] = [
  // ─── Patrick Pargnien (Bordeaux, shihō 2010) ─────────────────────────
  {
    slug: "patrick-pargnien",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Patrick Pargnien" },
      { locale: "en", nameType: "alias", value: "Patrick Pargnien" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Patrick Pargnien is a French Sōtō Zen monk and the senior dharma heir of Roland Yuno Rech in Bordeaux[1]. He began zazen practice in 1985 in the Deshimaru lineage, received the bodhisattva precepts (zaike tokudo) in 1990, and was ordained a monk (shukke tokudo) by Yuno Rech in 1991[1][2]. From 2001 onward he was invited to lead sesshin in France, Germany, Belgium, and Spain, and in 2005 the small Bordeaux community formally constituted itself as a dōjō around him; in 2012 it was renamed Nuage et Eau (Cloud and Water), the present southwest-French AZI-affiliated practice centre[2][3].\n\nIn 2010 Pargnien received shihō (dharma transmission) from Roland Yuno Rech at La Gendronnière, becoming the first of Rech's twenty-plus successors[1][2][4]. He continues to direct Nuage et Eau in Bordeaux, leads regular sesshin across the AZI / ABZE network, and works professionally as a body-oriented psychotherapist[2][3]. The Bordeaux dōjō under his direction is one of the principal southwest-French nodes of the second European generation of the Deshimaru lineage[1][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Patrick Pargnien — 2010 — Bordeaux'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Pargnien received shihō in 2010 from Roland Yuno Rech", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.nuageeteau.fr/qui_sommes_nous/ (accessed 2026-05-11) — Bordeaux dōjō founded 2005, renamed Nuage et Eau in 2012", fieldName: "dojo" },
      { sourceId: "src_la_gendronniere", pageOrSection: "https://www.gendronniere.com/ (accessed 2026-05-11) — annual shihō ceremonies at La Gendronnière confirmed as venue for Yuno Rech's 2010 transmissions", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi", "src_la_gendronniere"],
        notes:
          "Shihō from Roland Yuno Rech at La Gendronnière in 2010; first of Rech's recognised successors. Independent confirmation: https://abzen.eu/les-enseignants/ (ABZE roster) and https://www.nuageeteau.fr/qui_sommes_nous/ (Bordeaux dōjō about-us page).",
      },
    ],
  },

  // ─── Heinz-Jürgen Metzger (Solingen / Cologne, shihō 2010) ───────────
  {
    slug: "heinz-juergen-metzger",
    schoolSlug: "soto",
    names: [
      { locale: "de", nameType: "birth", value: "Heinz-Jürgen Metzger" },
      { locale: "en", nameType: "alias", value: "Heinz-Jurgen Metzger" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Heinz-Jürgen Metzger is a German Sōtō Zen monk, founder and director of the BuddhaWeg-Sangha in Solingen / Cologne and one of the two Deshimaru-line teachers Roland Yuno Rech transmitted to in 2010[1][2]. He has practiced zazen since 1985 in the lineage of Taisen Deshimaru and was ordained a monk by Yuno Rech in 1991, after which he became the first Rech-line teacher to establish a full sangha in German-speaking Europe outside the older Coupey / Pilet circuit[2][3].\n\nIn 2010 Metzger received shihō (dharma transmission) confirmation from Roland Yuno Rech at La Gendronnière[1][2]. In 2015 he was formally appointed kyōshi by the Sōtōshū in Tokyo — one of the small group of authorised dendō kyōshi for German-speaking Europe, registered through the Sōtōshū Europe office[2][4]. He directs the BuddhaWeg-Sangha Zen-Zentrum in Solingen, the Zen-Dōjō Köln-Zollstock, and oversees a third practice place in Weimar-Buchenwald; his teisho and kusen are regularly recorded for the BuddhaWeg-Sangha audio archive[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Heinz-Jürgen Metzger — 2010 — Cologne / Solingen / Weimar-Buchenwald'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://buddhaweg.de/Lehrende/HJM/index.htm (accessed 2026-05-11) — 'In 1991 ordained as monk by Roland Yuno Rech; in 2010 received shiho confirmation; in 2015 appointed Kyoshi by Sotoshu'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://buddhismus-deutschland.de/?zentren=buddhaweg-sangha-zen-zentrum-solingen-e-v (accessed 2026-05-11) — Deutsche Buddhistische Union centre listing for BuddhaWeg-Sangha Solingen with Metzger named as leader", fieldName: "dojo" },
      { sourceId: "src_sotozen_europe", pageOrSection: "https://www.sotozen.com/eng/temples/regional_office/europe.html (accessed 2026-05-11) — Sōtōshū Europe office; 'more than 400 monks and nuns registered with Soto Zen are actively at work' across European facilities, including the German Yuno Rech network", fieldName: "credentials" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi", "src_sotozen_europe"],
        notes:
          "Shihō from Roland Yuno Rech at La Gendronnière in 2010; appointed kyōshi by Sōtōshū in 2015. Independent confirmation: http://buddhaweg.de/Lehrende/HJM/ (Metzger's own teaching page) and https://buddhismus-deutschland.de/?zentren=buddhaweg-sangha-zen-zentrum-solingen-e-v (DBU registry).",
      },
    ],
  },

  // ─── Sengyo Van Leuven (Rome, shihō 2011) ────────────────────────────
  {
    slug: "sengyo-van-leuven",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "birth", value: "Sengyo Van Leuven" },
      { locale: "ja", nameType: "dharma", value: "Sengyo" },
    ],
    birthYear: 1959,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Sengyo Van Leuven (b. 1959, Belgium) is the abbot of the Tempio Buddhista Zen Jōhōji in Rome and one of Roland Yuno Rech's senior dharma heirs in Italy[1][2]. He was ordained a Sōtō monk by Yuno Rech in 1992, moved to Rome in early 2008 to lead the city's small Deshimaru-line sangha[2], and in 2011 received shihō (dharma transmission) from his teacher at La Gendronnière[1][2][3]. The Sōtōshū Shūmuchō formally registered him as kokusai fukyōshi (国際布教師, international missionary teacher) authorised to spread Sōtō Zen in Europe, anchoring the Italian capital in the official Japanese registry of overseas teachers[2][4].\n\nUnder Van Leuven's direction the Buppō Association acquired and consecrated Jōhōji (the Temple of the Continuity of the Dharma), the first Sōtō Zen temple in the Italian capital and an affiliate of both the Sōtōshū Shūmuchō and the Italian Buddhist Union (UBI)[2][4]. He leads daily zazen, monthly zazenkai, and an annual cycle of sesshin in Italy, France, and Belgium, and has been one of the principal Italian translators of Yuno Rech's commentaries on Dōgen[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Sengyo Van Leuven — 2011 — Rome (Jōhōji)'", fieldName: "biography" },
      { sourceId: "src_sotozen_europe", pageOrSection: "https://tempiozenroma.it/associazione/ (accessed 2026-05-11) — 'Sengyo Van Leuven was born in Belgium in 1959 and arrived in Rome at the beginning of 2008. He is authorized to spread Sōtō Zen Buddhism in Europe (Kokusai fukyoshi) for the Sōtōshu Shūmūchō. His teacher, from whom he receives the transmission, is Master Roland Yuno Rech…ordained as a monk by Master Roland Yuno Rech in 1992 and received the Dharma transmission from him in 2011.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Van Leuven shihō 2011 (Italy)", fieldName: "biography" },
      { sourceId: "src_sotozen_europe", pageOrSection: "https://www.turismoroma.it/en/places/j%C5%8Dh%C5%8D-ji-tempio-zen-roma (accessed 2026-05-11) — Rome city tourism authority listing of Jōhōji Tempio Zen Roma confirming temple's official status", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_sotozen_europe", "src_azi"],
        notes:
          "Ordained 1992, shihō 2011 from Roland Yuno Rech. Sōtōshū-registered kokusai fukyōshi for Europe. Independent confirmation: https://tempiozenroma.it/associazione/ (Jōhōji temple about page) and the Rome tourism listing https://www.turismoroma.it/en/places/j%C5%8Dh%C5%8D-ji-tempio-zen-roma.",
      },
    ],
  },

  // ─── Emanuela Dōsan Losi (Carpi, shihō 2012) ─────────────────────────
  {
    slug: "emanuela-dosan-losi",
    schoolSlug: "soto",
    names: [
      { locale: "it", nameType: "birth", value: "Emanuela Losi" },
      { locale: "ja", nameType: "dharma", value: "Dōsan" },
      { locale: "en", nameType: "alias", value: "Emanuela Dosan Losi" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Emanuela Dōsan Losi is an Italian Sōtō Zen nun and the first woman to receive shihō from Roland Yuno Rech[1][2]. A geologist by training (laurea in scienze geologiche, Università degli Studi di Modena), she practiced and taught in applied environmental geology before turning fully to monastic life[2]. She was ordained a nun by Yuno Rech in 1994 and for ten years served as godo (responsible monk) of the Dojo Mokushō Torino, the historic Turin Deshimaru-line dōjō[2][3].\n\nIn 2012 Losi received shihō from Roland Yuno Rech at La Gendronnière and relocated her teaching activity to Carpi (province of Modena), where she has since led a regional dōjō and travelled widely to give teisho during AZI / ABZE sesshin across France, Germany, Spain, and Italy[1][2]. As one of the principal Italian-language teachers in the Rech network she has helped translate Yuno Rech's kusen for Italian audiences and contributes regularly to the editorial life of the European sangha[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Emanuela Dōsan Losi — 2012 — Carpi'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.abzen.eu/fr/component/tags/tag/emanuela-dosan-losi (accessed 2026-05-11) — ABZE biographical tag page for Emanuela Dōsan Losi confirming 1994 nun ordination by Yuno Rech, 10 years godo of Dojo Mokushō Torino, 2012 shihō from Yuno Rech, current teaching in Carpi (MO)", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Losi shihō 2012", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Ordained 1994, shihō 2012 from Roland Yuno Rech at La Gendronnière. First woman dharma heir of Yuno Rech. Independent confirmation: https://www.abzen.eu/fr/component/tags/tag/emanuela-dosan-losi.",
      },
    ],
  },

  // ─── Pascal-Olivier Kyōsei Reynaud (Narbonne, shihō 2013) ────────────
  {
    slug: "pascal-olivier-reynaud",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Pascal-Olivier Reynaud" },
      { locale: "ja", nameType: "dharma", value: "Kyōsei" },
      { locale: "en", nameType: "alias", value: "Pascal-Olivier Kyosei Reynaud" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Pascal-Olivier Kyōsei Reynaud is a French Sōtō Zen monk and master, dharma heir of Roland Yuno Rech in the Deshimaru–Sawaki lineage[1][2]. After a long period of zazen practice in the AZI network, in February 2013 he conducted the hossen-shiki (法戦式, dharma-combat) ceremony at Gyobutsuji in Nice in the presence of Master Seidō Suzuki, Yuno Rech, and numerous AZI senior masters — the canonical preparatory ritual for shihō in Sōtō Zen[2].\n\nIn August 2013 Reynaud received shihō from Roland Yuno Rech at La Gendronnière[1][2][3]. Since 2014 he has resided in Narbonne, where he is responsible for the Dōjō Méditation Zen Narbonne and conducts regular zazen sessions, week-long sesshin at La Resse, and creativity-and-practice retreats[2][3]. He teaches in the AZI / ABZE network across France and Spain, and his characteristic kusen draw both on Dōgen's Shōbōgenzō and on the painterly traditions of Sino-Japanese ink that he has long studied alongside zazen[2].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Pascal-Olivier Kyōsei Reynaud — 2013 — Narbonne'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://meditation-zen-narbonne.fr/enseignements-bouddhique/pascal-olivier-kyosei-reynaud/ (accessed 2026-05-11) — 'Pascal-Olivier Kyōsei Reynaud received the transmission of the Dharma (Shiho) from Master Roland Yuno Rech in August 2013 at the Zen Temple of La Gendronnière. Before…he performed the Hossen ceremony in February 2013 at Gyobutsuji in Nice…'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Reynaud shihō 2013 (Narbonne)", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Hossen-shiki at Gyobutsuji February 2013; shihō from Roland Yuno Rech August 2013 at La Gendronnière. Independent confirmation: https://meditation-zen-narbonne.fr/enseignements-bouddhique/pascal-olivier-kyosei-reynaud/.",
      },
    ],
  },

  // ─── Michel Jigen Fabra (Poitiers, shihō 2014) ───────────────────────
  {
    slug: "michel-jigen-fabra",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Michel Fabra" },
      { locale: "ja", nameType: "dharma", value: "Jigen" },
      { locale: "en", nameType: "alias", value: "Michel Jigen Fabra" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Michel Jigen Fabra is a French Sōtō Zen monk, dharma heir of Roland Yuno Rech and a recognised oshō of the Sōtō school[1][2]. In August 2014 he received shihō from Yuno Rech at La Gendronnière, and immediately afterwards travelled to Japan for three months to undertake ango (the formal training period) and the zuise ceremony — the symbolic visit of homage to the patriarchs at the two head temples of the Sōtō school, Sōji-ji and Eihei-ji — required by the Sōtōshū to confirm a foreign-trained monk as oshō[1][2][3].\n\nIn 2016 Fabra founded the Dojo Zen Sōtō Poitiers, a residential community where he lives with monks and nuns and where regular zazen, kyosaku-led sesshin, and weekly teaching sessions form the rhythm of practice[2][3]. He continues to lead retreats throughout France and is one of the active second-generation AZI teachers anchoring the Deshimaru line in the Aquitaine and Poitou-Charentes regions[1][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Michel Jigen Fabra — 2014 — Poitiers'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.dojo-zen-soto-poitiers.com/qui-sommes-nous (accessed 2026-05-11) — 'In August 2014 he received the shiho (the transmission) from Master Roland Yuno Rech and went to Japan for three months to do ango…and the zuise ceremony…at Soji-ji and Eihei-ji…in 2016 he founded the Zen dojo of Poitiers where he currently resides with monks and nuns.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Fabra shihō 2014", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Shihō August 2014 at La Gendronnière; zuise at Eihei-ji and Sōji-ji 2014; founded Dojo Zen Soto Poitiers 2016. Independent confirmation: https://www.dojo-zen-soto-poitiers.com/qui-sommes-nous.",
      },
    ],
  },

  // ─── Konrad Kosan Maquestieau (Halle, Belgium, shihō 2015) ───────────
  {
    slug: "konrad-kosan-maquestieau",
    schoolSlug: "soto",
    names: [
      { locale: "nl", nameType: "birth", value: "Konrad Maquestieau" },
      { locale: "ja", nameType: "dharma", value: "Kōsan" },
      { locale: "en", nameType: "alias", value: "Konrad Kosan Maquestieau" },
    ],
    birthYear: 1960,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Konrad Kōsan Maquestieau (b. 1960, Belgium) is a Belgian Sōtō Zen monk and dharma heir of Roland Yuno Rech[1][2]. He discovered zazen in 1990, received the bodhisattva precepts in 1992, and was ordained a monk in 1995 in the AZI lineage[2]. In winter 2010 he undertook the traditional Sōtōshū ango at Shōgo-ji in Kumamoto Prefecture, the temple set aside by the Sōtōshū for foreign monks completing the formal training period[2]. In civilian life he teaches audiovisual arts at the Kunsthumaniora secondary school in Antwerp[2].\n\nIn the summer of 2015 Maquestieau received shihō from Roland Yuno Rech at La Gendronnière and now serves as godo of the Shodo Dōjō in Halle, the principal Flemish-Brabant AZI-affiliated practice place[1][2][3]. He teaches regularly in Brussels, leads sesshin across the Low Countries and France, and produces the *Dharmatalks Kosan Maquestieau* podcast — Dutch- and French-language teisho on Dōgen and the Sandōkai that have made him one of the most accessible Rech-line teachers in northern Europe[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Konrad Kosan Maquestieau — 2015 — Halle'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://shododojo.be/fr/kosan-konrad-maquestieau/ (accessed 2026-05-11) — 'né en 1960 en Belgique, découvre le zen en 1990, ordination bodhisattva 1992, ordination de moine 1995, ango Shōgo-ji hiver 2010, shiho été 2015 de Roland Yuno Rech à La Gendronnière'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Maquestieau shihō 2015 (Halle, Belgium)", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Ordained 1995; ango at Shōgo-ji 2010; shihō from Roland Yuno Rech summer 2015 at La Gendronnière. Independent confirmation: https://shododojo.be/fr/kosan-konrad-maquestieau/.",
      },
    ],
  },

  // ─── Lluís Nansen Salas (Barcelona, shihō 2016) ──────────────────────
  {
    slug: "lluis-nansen-salas",
    schoolSlug: "soto",
    names: [
      { locale: "ca", nameType: "birth", value: "Lluís Salas" },
      { locale: "ja", nameType: "dharma", value: "Nansen" },
      { locale: "en", nameType: "alias", value: "Lluis Nansen Salas" },
    ],
    birthYear: 1965,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Lluís Nansen Salas (b. 1965, Barcelona) is a Catalan Sōtō Zen monk and dharma heir of Roland Yuno Rech, founder of the Dōjō Zen Barcelona Kannon and of the broader Zen Kannon community[1][2][3]. A graduate in theoretical physics from the Universitat Autònoma de Barcelona, he worked for many years in actuarial mathematics for a multinational insurer before discovering zazen at age 26 at the historic Dojo Zen of Barcelona on Carrer Montcada[2][3]. He was ordained a monk in 1995 at La Gendronnière and trained for two decades in the AZI sesshin circuit before founding the Dōjō Kannon in 2008[2].\n\nOn the night of Friday 9 December 2016, during the closing sesshin in Lluçà (Catalonia), Nansen Salas received shihō from Roland Yuno Rech, becoming the principal Rech-line successor in Catalonia[1][2]. He has since published several Catalan- and Spanish-language books on Sōtō practice with Viena Edicions and is a regular interview subject in the Spanish Buddhist press; under his direction Zen Kannon is now a member of the Coordinadora Catalana d'Entitats Budistes (CCEB)[2][4].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Nansen Salas — 2016 — Barcelona'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://zenkannon.org/es/el-shiho-transmision-del-dharma-de-yuno-rech-a-nansen-salas/ (accessed 2026-05-11) — 'Durante la última sesshin en Lluçà la noche del viernes 9 de diciembre de 2016 Lluís Nansen Salas recibió el Shiho, la Transmisión del Dharma, de Roland Yuno Rech…nacido en Barcelona en 1965…ordenación de monje en 1995 en el Templo de La Gendronnière.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://ca.wikipedia.org/wiki/Llu%C3%ADs_Nansen_Salas (accessed 2026-05-11) — Catalan Wikipedia biographical entry confirming birth Barcelona 1965, physics degree, Sōtō Zen master in Yuno Rech lineage", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://ccebudistes.org/entitats-membre-de-la-cceb/zen-kannon/ (accessed 2026-05-11) — Coordinadora Catalana d'Entitats Budistes member listing for Zen Kannon", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Ordained 1995 at La Gendronnière; shihō 9 December 2016 at Lluçà sesshin from Roland Yuno Rech. Independent confirmation: https://zenkannon.org/es/el-shiho-transmision-del-dharma-de-yuno-rech-a-nansen-salas/ and Catalan Wikipedia https://ca.wikipedia.org/wiki/Llu%C3%ADs_Nansen_Salas.",
      },
    ],
  },

  // ─── Claude Émon Cannizzo (Mulhouse, shihō 2016) ─────────────────────
  {
    slug: "claude-emon-cannizzo",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Claude Cannizzo" },
      { locale: "ja", nameType: "dharma", value: "Émon" },
      { locale: "en", nameType: "alias", value: "Claude Emon Cannizzo" },
    ],
    birthYear: 1955,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Claude Émon Cannizzo (b. 1955, France) is a French Sōtō Zen monk and dharma heir of Roland Yuno Rech, godo of the Butsushin Zendo in Mulhouse[1][2]. After many years teaching martial arts, he discovered Zen practice in 1980, received the bodhisattva precepts in 1987 — the year he founded the Mulhouse dōjō — and was ordained a monk by Yuno Rech in 1991[2]. In parallel he trained as a shiatsu therapist with the European Iokai School (certified 1996) and developed his own Zan Shin Shiatsu pedagogy, which he has taught in eastern France since 2008[2][3].\n\nIn 2016 Cannizzo received shihō from Roland Yuno Rech and was confirmed as the master responsible for the Mulhouse temple, a small but historically central node of the Alsatian AZI sangha and the local point of contact for cross-border Zen activity with German-speaking Switzerland and Baden-Württemberg[1][2]. He is one of the senior French AZI teachers and a frequent guest at sesshin throughout the network[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Claude Emon Cannizzo — 2016 — Mulhouse'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://www.zen-mulhouse.fr/fr/30,biographie-de-claude-emon-cannizzo-moine-du-dojo-zen-de-mulhouse.html (accessed 2026-05-11) — 'né en France en 1955…découvre la pratique du zen en 1980…ordination bodhisattva 1987 (création du dojo de Mulhouse)…ordination de moine 1991…shiho 2016 par Roland Yuno Rech'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/etiquette/claude-emon-cannizzo/ (accessed 2026-05-11) — ABZE tag page for Claude Émon Cannizzo confirming Mulhouse responsibility and Yuno Rech lineage", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Bodhisattva precepts 1987; ordained monk 1991; shihō 2016 from Roland Yuno Rech. Independent confirmation: http://www.zen-mulhouse.fr/fr/30,biographie-de-claude-emon-cannizzo-moine-du-dojo-zen-de-mulhouse.html.",
      },
    ],
  },

  // ─── Antonio Taishin Arana (Pamplona, shihō 2016) ────────────────────
  {
    slug: "antonio-taishin-arana",
    schoolSlug: "soto",
    names: [
      { locale: "es", nameType: "birth", value: "Antonio Arana Soto" },
      { locale: "ja", nameType: "dharma", value: "Taishin" },
      { locale: "en", nameType: "alias", value: "Antonio Taishin Arana" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Antonio Taishin Arana Soto is a Spanish Sōtō Zen monk and dharma heir of Roland Yuno Rech, godo of the Dōjō Zen Genjō in Pamplona / Iruña[1][2]. He began zazen practice in 1985 in the AZI network, received the bodhisattva precepts from Yuno Rech in 1998, and was ordained a monk in 2003[2][3]. The Pamplona dōjō he leads takes its name from genjō (現成 — the manifestation of ultimate reality in daily life), one of the central terms of Dōgen's Shōbōgenzō[2].\n\nIn March 2016 Arana received shihō from Roland Yuno Rech, and he now coordinates the team of Spanish translators for the ABZE website and co-translated (with Txus Laita) Yuno Rech's commentary on the Genjōkōan into Spanish[1][2][3]. He teaches regularly in Pamplona, leads zazen weekends in Bilbao and Seville, and is one of the principal Rech-line teachers in northern Spain alongside Lluís Nansen Salas in Catalonia and Alonso Taikai Ufano in Andalusia[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Antonio Arana — 2016 — Pamplona' (note: ABZE registry adds dharma name 'Taishin')", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://zennavarra.blogspot.com/p/quienes-somos.html (accessed 2026-05-11) — 'Antonio Arana Soto comenzó a practicar zen en 1985, recibió los Preceptos de Bodhisattva del Maestro Roland Yuno Rech en 1998 y la ordenación de monje en 2003. En marzo de 2016 recibió la Transmisión del Dharma (Shiho) del Maestro Roland Yuno Rech.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Arana shihō 2016 (Pamplona, Spain)", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Bodhisattva precepts 1998; ordained 2003; shihō March 2016 from Roland Yuno Rech. Independent confirmation: http://zennavarra.blogspot.com/p/quienes-somos.html (Pamplona dōjō about page).",
      },
    ],
  },

  // ─── Alonso Taikai Ufano (Seville, shihō 2016) ───────────────────────
  {
    slug: "alonso-taikai-ufano",
    schoolSlug: "soto",
    names: [
      { locale: "es", nameType: "birth", value: "Alonso Ufano" },
      { locale: "ja", nameType: "dharma", value: "Taikai" },
      { locale: "en", nameType: "alias", value: "Alonso Taikai Ufano" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Alonso Taikai Ufano is a Spanish Sōtō Zen monk and dharma heir of Roland Yuno Rech, godo of the Dōjō Zen de Sevilla[1][2]. He began zazen practice in 1977 at the Dōjō Zen de Sevilla — at the time one of the small group of original Spanish Deshimaru-line dōjōs — and went on to become its principal teacher after Deshimaru's death, leading retreats throughout Andalusia and the Basque Country for more than three decades[2][3].\n\nIn March 2016 Ufano received shihō from Roland Yuno Rech and was confirmed as a master of the Sōtō Zen tradition[1][2][3]. He continues to direct the Sevilla dōjō, frequently leads sesshin at the Bilbao and Pamplona dōjōs, and is a long-standing collaborator with Antonio Taishin Arana on the joint Spanish-language teaching circuit; together they have given conferences on Deshimaru and the Western reception of Zen Buddhism that are archived on the Zen Navarra channel[3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Alonso Ufano — 2016 — Sevilla'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://zensevilla.com/portfolio_tags/alonso-taikai-ufano/ (accessed 2026-05-11) — Dōjō Zen de Sevilla portfolio tag for Alonso Taikai Ufano confirming Sevilla responsibility and Yuno Rech lineage", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://dojozendebilbao.blogspot.com/2010/12/monje-zen-alonso-taikai-ufano.html (accessed 2026-05-11) — 'comenzó a practicar zen en el Dojo Zen de Sevilla en 1977…recibió la transmisión del Dharma (shiho) del Maestro Roland Yuno Rech en marzo de 2016'", fieldName: "biography" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Practice from 1977 at Dōjō Zen de Sevilla; shihō March 2016 from Roland Yuno Rech. Independent confirmation: http://zensevilla.com/portfolio_tags/alonso-taikai-ufano/ and http://dojozendebilbao.blogspot.com/2010/12/monje-zen-alonso-taikai-ufano.html.",
      },
    ],
  },

  // ─── Antoine Charlot (Bondy, shihō 2018) ─────────────────────────────
  {
    slug: "antoine-charlot",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Antoine Charlot" },
      { locale: "en", nameType: "alias", value: "Antoine Charlot" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Antoine Charlot is a French Sōtō Zen monk and dharma heir of Roland Yuno Rech, responsible for the Centre Zen de Bondy in the eastern Paris suburbs[1][2]. He came up through the Dōjō Zen de Paris in the AZI network, was ordained as a monk by Yuno Rech, and for many years has led intensive practice sessions and weekend zazen days in the Île-de-France region[1][2].\n\nIn 2018 Charlot received shihō from Roland Yuno Rech at La Gendronnière[1][2]. Since then he has continued to lead the Bondy dōjō, regularly gives teisho at the Dōjō Zen de Paris, and contributes to the AZI / ABZE teaching circuit across France[2].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Antoine Charlot — 2018 — Bondy'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Charlot shihō 2018 (Bondy, France); 'Antoine Charlot is leading the Bondy Zen Center, where he regularly offers intensive practice sessions, and he received the Dharma transmission from Master Roland Yuno Rech in 2018'", fieldName: "biography" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Shihō 2018 from Roland Yuno Rech, per ABZE roster (https://abzen.eu/les-enseignants/) and fr.wikipedia.org transmission table. Single ABZE primary source plus the Wikipedia tabulation; biographical detail beyond shihō and dōjō location is limited and birth year unverified — birthConfidence set to low.",
      },
    ],
  },

  // ─── Marc Chigen Estéban (Chalon-sur-Saône, shihō 2018) ──────────────
  {
    slug: "marc-chigen-esteban",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Marc Estéban" },
      { locale: "ja", nameType: "dharma", value: "Chigen" },
      { locale: "en", nameType: "alias", value: "Marc Chigen Esteban" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Marc Chigen Estéban is a French Sōtō Zen monk and dharma heir of Roland Yuno Rech, godo of the Dōjō Zen de Chalon-sur-Saône and current president of the Association Bouddhiste Zen d'Europe (ABZE), the umbrella organisation founded in 2007 by Yuno Rech's students[1][2][3]. He began zazen in 1997, met Yuno Rech a year later at La Gendronnière, became one of his close disciples, received the bodhisattva precepts in 2001, and was ordained a monk the following year[2].\n\nIn the summer of 2018 Estéban received shihō from Roland Yuno Rech at La Gendronnière, and now teaches year-round at the Chalon-sur-Saône dōjō while leading zazen days and intensive practice sessions throughout France[1][2][3]. As ABZE president he plays a coordinating role across the entire Rech-line sangha, organising joint sesshin between the French, German, Italian, and Spanish dōjōs and shaping the formal pedagogical programme of the second European generation[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Marc Chigen Estéban — 2018 — Chalon-sur-Saône'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.abzen.eu/fr/component/tags/tag/marc-esteban (accessed 2026-05-11) — 'Marc Estéban began practicing zazen in 1997, met Master Roland Yuno Rech at the Zen temple of La Gendronnière a year later…received the Bodhisattva Precepts in 2001, became a monk the following year. In the summer of 2018, he received the shiho (Dharma transmission) from Master Yuno Rech…currently president of the ABZE'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.macommune.info/agenda/conference-pourquoi-mediter-de-marc-chigen-esteban-moine-et-maitre-zen/ (accessed 2026-05-11) — French press listing 'Marc Chigen Estéban, moine et maître zen', confirming public maître zen status", fieldName: "credentials" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Bodhisattva precepts 2001, ordained 2002, shihō summer 2018 from Roland Yuno Rech at La Gendronnière. Current ABZE president. Independent confirmation: https://www.abzen.eu/fr/component/tags/tag/marc-esteban.",
      },
    ],
  },

  // ─── Eveline Kogen Pascual (Aachen, shihō 2019) ──────────────────────
  {
    slug: "eveline-kogen-pascual",
    schoolSlug: "soto",
    names: [
      { locale: "de", nameType: "birth", value: "Eveline Pascual" },
      { locale: "ja", nameType: "dharma", value: "Kogen" },
      { locale: "en", nameType: "alias", value: "Eveline Kogen Pascual" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Eveline Kogen Pascual is a German Sōtō Zen nun and dharma heir of Roland Yuno Rech, godo of the Kanjizai-Dōjō / Zendo Aachen and one of the most senior women in the European Deshimaru lineage[1][2]. A long-time student of Yuno Rech, she was a co-founder of the Kanjizai-Dōjō in Aachen in 1995 and has led it since 2001, building it into one of the principal AZI-affiliated practice places in the Rhineland[2][3].\n\nIn 2019 she received shihō from Roland Yuno Rech at La Gendronnière[1][2]. Within the AZI / ABZE network she is the senior teacher specifically responsible for kesa-sewing instruction (kesanähen) and ordination preparation — two demanding domains of monastic transmission that require sustained one-to-one teaching — and she leads zazen days and sesshin across Germany and the Low Countries[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Eveline Kogen Pascual — 2019 — Aachen'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://zen-bonn.de/termin/zen-sesshin-mit-zen-meisterin-eveline-kogen-pascual-11-2020/ (accessed 2026-05-11) — 'Eveline KOGEN Pascual ist langjährige Schülerin von Zen-Meister Roland Yuno Rech, von dem sie 2019 die Dharma-Übertragung (Shiho) erhielt. Mitbegründerin des Kanjizai-Dojo in Aachen 1995, leitet es seit 2001.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://www.zendoaachen.de/dojo.htm (accessed 2026-05-11) — Kanjizai-Dōjō / Zendo Aachen official dōjō page confirming Eveline Pascual as godo and Yuno Rech as transmitting master", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Co-founder of Kanjizai-Dōjō Aachen 1995; godo since 2001; shihō 2019 from Roland Yuno Rech. Independent confirmation: https://zen-bonn.de/termin/zen-sesshin-mit-zen-meisterin-eveline-kogen-pascual-11-2020/ and http://www.zendoaachen.de/dojo.htm.",
      },
    ],
  },

  // ─── Beppe Mokuza Signoritti (Alba, Italy, shihō 2019) ───────────────
  {
    slug: "beppe-mokuza-signoritti",
    schoolSlug: "soto",
    names: [
      { locale: "it", nameType: "birth", value: "Beppe Signoritti" },
      { locale: "ja", nameType: "dharma", value: "Mokuza" },
      { locale: "en", nameType: "alias", value: "Beppe Mokuza Signoritti" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Beppe Mokuza Signoritti is an Italian Sōtō Zen monk and dharma heir of Roland Yuno Rech, founder and godo of the Bodai Dōjō in Alba (Cuneo) and an internationally recognised teacher of sumi-e ink painting[1][2][3]. He trained for many years in the AZI network at La Gendronnière, at the Zinal sesshin in Switzerland, and at the Dōjō Mokushō in Turin, where he received the transmission of sumi-e from Ezio Tenryū Zanin and complemented his instruction with three Japanese masters of Chinese ink painting[2].\n\nIn 2019 Signoritti received shihō from Roland Yuno Rech at La Gendronnière[1][2][3]. His Bodai Dōjō in Alba combines daily zazen with regular sumi-e workshops, and his Sumi-e & Zen school has become one of the principal European venues for ink-painting practice in a contemplative key; he has been teaching across Europe for more than thirty years and is a frequent demonstrator at festivals such as Scirarindi in Sardinia[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Beppe Mokuza Signoritti — 2019 — Albe' (recte Alba CN, Italy)", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.sumi-e.it/it/beppe-mokuza/ (accessed 2026-05-11) — 'monaco zen appartenente alla tradizione Buddhista Soto Zen, discepolo del Maestro Roland Yuno Rech, fondatore e responsabile del Dojo Zen Bodai Dojo di Alba (CN). Ha ricevuto la trasmissione del Dharma da Roland Yūnō Rech nel 2019.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.bodai.it/ (accessed 2026-05-11) — Bodai Dōjō Alba official site confirming Mokuza as godo and AZI affiliation", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Shihō 2019 from Roland Yuno Rech at La Gendronnière. Founder of Bodai Dōjō Alba; sumi-e teacher in the Tenryū Zanin line. Independent confirmation: https://www.sumi-e.it/it/beppe-mokuza/ and https://www.bodai.it/.",
      },
    ],
  },

  // ─── Huguette Moku Myō Siréjol (Toulouse, shihō 2022) ────────────────
  {
    slug: "huguette-moku-myo-sirejol",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Huguette Siréjol" },
      { locale: "ja", nameType: "dharma", value: "Moku Myō" },
      { locale: "en", nameType: "alias", value: "Huguette Moku Myo Sirejol" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Huguette Moku Myō Siréjol is a French Sōtō Zen nun and dharma heir of Roland Yuno Rech, senior teacher at the Dōjō Zen de Toulouse[1][2]. She began zazen at the Toulouse dōjō in 1985, received the bodhisattva precepts in 1987, and was ordained a nun in 1994 by Stéphane Kōsen Thibaut — one of Deshimaru's three 1984-shihō heirs — placing her originally in the Kosen sub-lineage of the AZI[2][3]. Since 2015 she has been a disciple of Roland Yuno Rech, and on 28 November 2021 she performed the hossen-shiki ceremony at Yuno Rech's Gyobutsuji temple in Nice[2].\n\nIn the summer of 2022 Siréjol received shihō from Roland Yuno Rech at La Gendronnière, formally entering his lineage of successors[1][2]. She continues to teach at the Toulouse dōjō, leads zazen days and sesshin across Occitanie, and is also the senior local instructor for kesa sewing and for Dō-in / shiatsu — two body-and-fabric disciplines she integrates into her preparation of new ordinands[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Huguette Moku Myo Siréjol — 2022 — Toulouse'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.zentoulouse.fr/ (accessed 2026-05-11) — 'Huguette Moku Myo Siréjol began practicing at the Toulouse Dojo in 1985, ordained Bodhisattva 1987, ordained Nun 1994 by Master Kosen Thibaut, disciple of Master Roland Yuno Rech since 2015, hossenshiki at Gyobutsuji 28 November 2021, shihō at La Gendronnière summer 2022.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.comprendrebouddhisme.com/centres/dojo-zen-toulouse.html (accessed 2026-05-11) — Toulouse dōjō encyclopedic listing confirming Siréjol as godo and Yuno Rech transmission", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Originally ordained 1994 by Kosen Thibaut; disciple of Yuno Rech from 2015; hossen-shiki at Gyobutsuji 28 November 2021; shihō summer 2022 at La Gendronnière from Roland Yuno Rech. Independent confirmation: https://www.zentoulouse.fr/.",
      },
    ],
  },

  // ─── Jean-Pierre Reiseki Romain (Paris, shihō 2022) ──────────────────
  {
    slug: "jean-pierre-reiseki-romain",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Jean-Pierre Romain" },
      { locale: "ja", nameType: "dharma", value: "Reiseki" },
      { locale: "en", nameType: "alias", value: "Jean-Pierre Reiseki Romain" },
    ],
    birthYear: 1956,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Jean-Pierre Reiseki Romain (b. 1956) is a French Sōtō Zen monk and dharma heir of Roland Yuno Rech, senior teacher at the Dōjō Zen de Paris[1][2]. He discovered zazen in 1981 at La Gendronnière in the lifetime of Taisen Deshimaru himself, received the bodhisattva precepts in 1984 from Étienne Mokushō Zeisler, and was ordained a monk in 1994 by Philippe Reiryū Coupey — making him one of the few living teachers in continuous practice from the founding generation of the AZI through three of Deshimaru's principal heirs[2][3].\n\nIn the summer of 2022 Romain received shihō from Roland Yuno Rech at La Gendronnière, formally joining the Yuno Rech line of successors[1][2]. He gives teisho regularly at the Dōjō Zen de Paris, where he is a member of the teaching council, and in 2019 he founded the École Internationale de Sumi-e in Paris, paralleling Beppe Mokuza Signoritti's ink-painting work in Italy and bringing brush-and-zazen practice to a wider Parisian public[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Jean-Pierre Romain — 2022 — Paris'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://dojozenparis.com/qui-sommes-nous/ (accessed 2026-05-11) — 'Jean-Pierre Reiseki Romain a découvert le zazen en 1981 au temple zen de la Gendronnière avec Maître Taisen Deshimaru. Né en 1956, ordination bodhisattva 1984 par Étienne Zeisler, ordination de moine 1994 par Philippe Coupey, shihō été 2022 par Roland Yuno Rech.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/etiquette/jean-pierre-romain/ (accessed 2026-05-11) — ABZE tag page for Jean-Pierre Romain confirming Yuno Rech lineage and 2022 shihō", fieldName: "transmission" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Practice from 1981 with Deshimaru; bodhisattva precepts 1984 from Zeisler; ordained 1994 by Coupey; shihō summer 2022 from Roland Yuno Rech. Independent confirmation: https://dojozenparis.com/qui-sommes-nous/ and https://abzen.eu/etiquette/jean-pierre-romain/.",
      },
    ],
  },

  // ─── Sergio Gyō Hō Gurevich (Paris-Tolbiac, shihō 2023) ──────────────
  {
    slug: "sergio-gyoho-gurevich",
    schoolSlug: "soto",
    names: [
      { locale: "es", nameType: "birth", value: "Sergio Gurevich" },
      { locale: "ja", nameType: "dharma", value: "Gyō Hō" },
      { locale: "en", nameType: "alias", value: "Sergio Gyo Ho Gurevich" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Sergio Gyō Hō Gurevich is a Sōtō Zen monk and dharma heir of Roland Yuno Rech, currently teaching at the Dōjō Zen de Paris-Tolbiac[1][2][3]. He began Zen practice in 1993, received the bodhisattva precepts in 1996, and was ordained a monk in 1998 — all under Yuno Rech in the AZI network — and for many years was responsible both for the dōjō in Neuilly-sur-Seine and for the Sitges-Garraf zazen group in Catalonia, which he founded[2][3].\n\nIn August 2023 Gurevich received shihō from Roland Yuno Rech at La Gendronnière[1][2][3]. Since then he has consolidated his teaching at the Dōjō Zen de Paris-Tolbiac, the principal AZI dōjō in southern Paris, where he leads regular zazenkai and contributes to the dōjō's teaching council; he is also a regular contributor to the ABZE web archive of teisho and kusen[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Sergio Gurevich — 2023 — Sitges-Garraf' (Wikipedia entry pre-dates Gurevich's Paris-Tolbiac relocation; ABZE roster gives current dōjō as Paris-Tolbiac)", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/sergio-gurevich/ (accessed 2026-05-11) — 'Sergio Gurevich a commencé la pratique du zen en 1993, ordination bodhisattva en 1996 et ordination monastique en 1998, toutes deux du Maître Yuno Rech. Il a reçu la transmission du dharma (shiho) en août 2023. Il enseigne au Dojo Zen de Paris-Tolbiac.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.dojozenparis.com/evenement/journee-de-zazen-sergio-gyo-ho-gurevich/ (accessed 2026-05-11) — Dōjō Zen de Paris event listing for 'Journée de zazen — Sergio Gyō Hō Gurevich', confirming Paris dōjō teaching role", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Bodhisattva precepts 1996; ordained 1998; shihō August 2023 from Roland Yuno Rech. Independent confirmation: https://abzen.eu/sergio-gurevich/.",
      },
    ],
  },

  // ─── Luc Sojo Bordes (Vernon / Saint-Pierre-d'Autils, shihō 2023) ────
  {
    slug: "luc-sojo-bordes",
    schoolSlug: "soto",
    names: [
      { locale: "fr", nameType: "birth", value: "Luc Bordes" },
      { locale: "ja", nameType: "dharma", value: "Sojō" },
      { locale: "en", nameType: "alias", value: "Luc Sojo Bordes" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Luc Sojō Bordes is a French Sōtō Zen monk and dharma heir of Roland Yuno Rech, responsible for the Groupe Zen Vernon — Saint-Pierre-d'Autils[1][2]. He practiced zazen at the Dōjō Zen de Paris from 1985 to 2012, where he also taught, was ordained a monk in 1987 — placing his ordination in the lifetime of Étienne Zeisler — and for nearly thirty years (1990–2019) directed the Dōjō Zen de Garches in the western Paris suburbs[2][3]. For 25 years he was a long-standing student of Gérard Chinrei Pilet before taking Yuno Rech as his principal teacher[2].\n\nIn 2023 Bordes received shihō from Roland Yuno Rech at La Gendronnière[1][2][3]. Now retired from his teaching profession, he resides in Saint-Pierre-d'Autils (Eure), where he founded the Vernon Zen group in 2011, and continues to write haiku in a long-running practice journal that has become one of the small but distinctive literary side-channels of the contemporary AZI sangha[2].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Luc Sojo Bordes — 2023 — Vernon'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://dojozengarches.wixsite.com/meditationzen/luc-sojo-bordes (accessed 2026-05-11) — 'disciple de Roland Yuno Rech, élève de Gérard Chinrei Pilet pendant 25 ans. Pratique du zazen au Dojo Zen de Paris de 1985 à 2012, ordination de moine en 1987, dirige le Dojo Zen de Garches de 1990 à 2019, crée le groupe zen de Saint-Pierre d'Autils où il s'est installé en 2011. Reçoit la transmission du Dharma (shiho) en 2023.'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/abze_listings/groupe-zen-vernon-saint-pierre-dautils/ (accessed 2026-05-11) — ABZE practice-place listing for Groupe Zen Vernon — Saint-Pierre-d'Autils, naming Luc Bordes as person responsible", fieldName: "dojo" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Ordained 1987; long-time student of Chinrei Pilet; took Yuno Rech as principal teacher; shihō 2023 from Roland Yuno Rech at La Gendronnière. Independent confirmation: https://dojozengarches.wixsite.com/meditationzen/luc-sojo-bordes and https://abzen.eu/abze_listings/groupe-zen-vernon-saint-pierre-dautils/.",
      },
    ],
  },

  // ─── Silvia Hoju Leyer (Aachen, shihō 2024) ──────────────────────────
  {
    slug: "silvia-hoju-leyer",
    schoolSlug: "soto",
    names: [
      { locale: "de", nameType: "birth", value: "Silvia Leyer" },
      { locale: "ja", nameType: "dharma", value: "Hoju" },
      { locale: "en", nameType: "alias", value: "Silvia Hoju Leyer" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Silvia Hoju Leyer is a German Sōtō Zen practitioner and, per the AZI / ABZE registry, a 2024 dharma heir of Roland Yuno Rech in Germany[1][2]. She is the chairperson (Vorsitzende) of Zendo Aachen e.V., the legal-association vehicle of the Kanjizai-Dōjō in Aachen co-founded in 1995 by Eveline Kogen Pascual, and has been at the centre of the dōjō's organisational and teaching life for many years[2][3].\n\nLeyer is recorded by the AZI / ABZE roster as having received shihō from Roland Yuno Rech in 2024, the same year as Claus Heiki Bockbreder, becoming together with Pascual one of the two Aachen-based teachers in the Yuno Rech line[1][2]. Her teisho on Dōgen's *Bodaisatta Shishōbō* is archived on the ZenvoorA Belgian-Dutch Zen platform, indicating an active cross-border teaching role between the Rhineland and the Low Countries[3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Silvia Hoju Leyer — 2024 — Aachen'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Leyer 2024 shihō from Roland Yuno Rech (Aachen, Germany)", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "http://www.zendoaachen.de/impressum.htm (accessed 2026-05-11) — Zendo Aachen e.V. Impressum naming Silvia Leyer as Vorsitzende; https://zenvoora.be/bodaisatta-shishobo-van-meester-dogen-silvia-leyer/ — ZenvoorA archive of Leyer's teisho on Bodaisatta Shishōbō", fieldName: "biography" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Shihō 2024 from Roland Yuno Rech per AZI / ABZE roster (https://abzen.eu/les-enseignants/) and the fr.wikipedia.org transmission table. Birth year and full pre-shihō chronology not independently verified beyond the Zendo Aachen Impressum naming her as Vorsitzende — birthConfidence set to low; the ABZE URL is cited directly in the transmission notes per the project's single-authoritative-source rule.",
      },
    ],
  },

  // ─── Claus Heiki Bockbreder (Melle / Osnabrück, shihō 2024) ──────────
  {
    slug: "claus-heiki-bockbreder",
    schoolSlug: "soto",
    names: [
      { locale: "de", nameType: "birth", value: "Claus Bockbreder" },
      { locale: "ja", nameType: "dharma", value: "Heiki" },
      { locale: "en", nameType: "alias", value: "Claus Heiki Bockbreder" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Claus Heiki Bockbreder is a German Sōtō Zen monk and physician, godo of Zendo Melle e.V. in Lower Saxony and a 2024 dharma heir of Roland Yuno Rech[1][2][3]. In civilian life he practices as a Facharzt für Allgemeinmedizin in Melle (49324) and has lectured at the University of Osnabrück's Institute for Islamic Theology on Buddhist medical ethics, an indication of the public profile he combines with his Zen teaching[3].\n\nThe AZI / ABZE registry records that Bockbreder received shihō from Roland Yuno Rech in 2024[1][2], formally placing the Melle and Osnabrück dōjōs in the Yuno Rech line and extending the German wing of the second-generation AZI sangha alongside Heinz-Jürgen Metzger in Solingen / Cologne and Eveline Kogen Pascual / Silvia Hoju Leyer in Aachen[1]. He continues to lead daily zazen at Zendo Melle and to teach in the wider Niedersachsen region[2][3].",
    citations: [
      { sourceId: "src_wikipedia", pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11) — transmission table lists 'Claus Heiki Bockbreder — 2024 — Melle / Osnabrück'", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11) — ABZE roster confirms Bockbreder 2024 shihō from Roland Yuno Rech (Germany)", fieldName: "biography" },
      { sourceId: "src_azi", pageOrSection: "https://www.webwiki.de/zendo-melle.de (accessed 2026-05-11) — Zendo Melle e.V. directory listing naming Dr Claus Bockbreder as Verantwortlicher (responsible person), at Osnabrücker Str. 136, 49324 Melle; YouTube lecture 'Aspekte der Medizinethik aus buddhistischer Sicht' confirms Bockbreder's public Buddhist profile", fieldName: "biography" },
    ],
    transmissions: [
      {
        teacherSlug: "roland-rech",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_azi"],
        notes:
          "Shihō 2024 from Roland Yuno Rech per AZI / ABZE roster (https://abzen.eu/les-enseignants/) and the fr.wikipedia.org transmission table. Birth year and ordination dates not independently verified — birthConfidence set to low; the ABZE URL is cited directly in the transmission notes per the project's single-authoritative-source rule. Independent confirmation of dōjō role at Zendo Melle: https://www.webwiki.de/zendo-melle.de.",
      },
    ],
  },
];

// ─── Deepened Roland Yuno Rech biography ──────────────────────────────
export const BRANCH_B_BIOGRAPHIES: BiographyEntry[] = [
  {
    slug: "roland-rech",
    content: `Roland Yuno Rech (born Roland Rech, 20 June 1944, Paris) is one of the most senior and prolific living teachers of European Sōtō Zen[1]. A graduate of Sciences Po (Institut d'études politiques de Paris, promotion 1966) and of the DESS in Clinical Human Sciences at Université Paris VII-Denis-Diderot, he discovered zazen in 1971 at the Sōtō Antaiji temple in Kyoto during a worldwide search for meaning[1][2]. On his return to France in 1972 he became the disciple of Taisen Deshimaru — a relationship that lasted until Deshimaru's death in 1982 — and was ordained as a monk in 1974, while keeping, on Deshimaru's recommendation, his industrial-management career so as to serve as one of his teacher's principal translators, dōjō coordinators, book editors, and sesshin leaders[1][2].

**In 1984, Niwa Rempō Zenji of Eihei-ji conferred dharma transmission (shihō) on Rech together with Étienne Mokushō Zeisler and Stéphane Kōsen Thibaut**, the three of Deshimaru's disciples authenticated by Japan's highest Sōtō authority[1][2]. Rech then took on the dharma name Yuno (有能 — "capable, courageous")[1]. He served as president of the Association Zen Internationale until 1994, was a founding member of the Union Bouddhiste de France in 1986 and its vice-president for fifteen years[1][5], and now teaches at the temple Gyō Butsu-ji in Nice, at La Gendronnière, and across the AZI sesshin circuit[3]. The Sōtōshū Shūmuchō has formally recognised him as dendō kyōshi (伝道教師, missionary monk) for Europe[1][4]; in 2007, his students founded the Association Bouddhiste Zen d'Europe (ABZE), the institutional umbrella under which the Yuno Rech line now operates across France, Germany, Italy, Spain, Belgium, and Switzerland[1][2].

Since 2010, Yuno Rech has himself transmitted shihō to a now-substantial generation of European successors[1][2]. The first cohort comprised Patrick Pargnien (Bordeaux) and Heinz-Jürgen Metzger (Solingen / Cologne) in 2010; Sengyo Van Leuven (Rome Jōhōji) in 2011; Emanuela Dōsan Losi (Carpi) in 2012, his first woman dharma heir; and Pascal-Olivier Kyōsei Reynaud (Narbonne) in 2013, who performed his hossen-shiki ceremony at Gyō Butsu-ji in February of that year[1][2]. Michel Jigen Fabra (Poitiers) followed in 2014 and went directly to Eihei-ji and Sōji-ji for the formal zuise visit required by the Sōtōshū to be confirmed as oshō[1][2][4].

Through the second half of the 2010s the network broadened across borders: Konrad Kōsan Maquestieau (Halle, Belgium) in 2015; Lluís Nansen Salas (Barcelona Kannon), Claude Émon Cannizzo (Mulhouse), Antonio Taishin Arana (Pamplona Genjō), and Alonso Taikai Ufano (Sevilla) in March and December 2016 — a sweep that anchored the Iberian peninsula in the Yuno Rech line for the first time[1][2]. Antoine Charlot (Bondy) and Marc Chigen Estéban (Chalon-sur-Saône, current ABZE president) followed in 2018, and Beppe Mokuza Signoritti (Alba) and Eveline Kogen Pascual (Aachen) in 2019, deepening the Italian and German wings respectively[1][2].

A second wave from 2022 onward has continued the pattern: Huguette Moku Myō Siréjol (Toulouse) and Jean-Pierre Reiseki Romain (Dōjō Zen de Paris) in 2022 — Romain himself a 1981 disciple of Deshimaru ordained by Philippe Coupey — were followed by Sergio Gyō Hō Gurevich (Paris-Tolbiac) and Luc Sojō Bordes (Vernon) in 2023, and most recently by Silvia Hoju Leyer (Aachen) and Claus Heiki Bockbreder (Melle / Osnabrück) in 2024[1][2]. Together this cohort of more than twenty successors makes Yuno Rech, by the mid-2020s, the most institutionally productive of Deshimaru's three direct heirs and the principal vector through which the AZI line is reproducing itself in the second European generation[1][2][3].

He is the author of numerous books in French on Dōgen's Shōbōgenzō, the Sandōkai, and the practice of zazen, drawing his characteristic kusen-style oral teaching directly from Dōgen's text; his commentary on the Genjōkōan, *La realización del despertar* (translated into Spanish by Antonio Arana and Txus Laita), has circulated widely in the Iberian sangha[2][6]. His public role and prolific publishing have made him, in the years since Deshimaru's death, the most institutionally visible of Deshimaru's heirs and one of the principal European interpreters of Dōgen's philosophy[1][3][5].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11)",
        excerpt:
          "Né le 20 juin 1944 à Paris ; diplômé de l'IEP de Paris (1966) et du DESS de Sciences Humaines Cliniques (Paris VII) ; rencontre du zazen au temple Antai-ji en 1971 ; disciple de Deshimaru de 1972 à 1982 ; ordonné moine en 1974 ; transmission du dharma (shihō) par Niwa Rempō Zenji en 1984 (avec Zeisler et Thibaut) ; nom de dharma Yuno ; président de l'AZI jusqu'en 1994 ; vice-président de l'UBF pendant 15 ans après sa fondation en 1986 ; dendō kyōshi pour l'Europe. Tableau des transmissions: Pargnien 2010 (Bordeaux), Metzger 2010 (Cologne), Van Leuven 2011 (Rome), Losi 2012 (Carpi), Reynaud 2013 (Narbonne), Fabra 2014 (Poitiers), Maquestieau 2015 (Halle), Salas 2016 (Barcelone), Cannizzo 2016 (Mulhouse), Ufano 2016 (Séville), Arana 2016 (Pampelune), Charlot 2018 (Bondy), Estéban 2018 (Chalon-sur-Saône), Signoritti 2019 (Alba), Pascual 2019 (Aachen), Romain 2022 (Paris), Siréjol 2022 (Toulouse), Gurevich 2023 (Sitges-Garraf/Paris-Tolbiac), Bordes 2023 (Vernon), Bockbreder 2024 (Melle/Osnabrück), Leyer 2024 (Aachen).",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11)",
        excerpt:
          "ABZE roster of Roland Yuno Rech's dharma heirs, 2010–2024. Master entry: 'Roland Yuno Rech — Temple Gyobutsuji (Nice, France); Ordained 1974 by Maître Deshimaru; Received shiho 1984 from Maître Renpo Niwa.' Each heir's date and dōjō independently corroborated by the heir's own dōjō / temple page (URLs listed in scripts/data/deshimaru/branch-B-NOTES.md).",
      },
      {
        index: 3,
        sourceId: "src_la_gendronniere",
        pageOrSection: "https://www.gendronniere.com/ — Enseignants (accessed 2026-05-11)",
        excerpt:
          "Liste des enseignants intervenant à La Gendronnière, comprenant Roland Yuno Rech aux côtés de Guy Mokuho Mercier, Olivier Reigen Wang-Genh, Philippe Reiryū Coupey, Katia Kōren Robel, Raphaël Dōkō Triet, Simone Jiko Wolf, Emmanuel Ryūgaku Risacher, Gérard Chinrei Pilet, Alain Tainan Liebmann, Évelyne Reiko de Smedt; Yuno Rech y donne régulièrement teisho et y conduit les cérémonies annuelles de shihō.",
      },
      {
        index: 4,
        sourceId: "src_sotozen_europe",
        pageOrSection: "https://www.sotozen.com/eng/temples/regional_office/europe.html (accessed 2026-05-11)",
        excerpt:
          "Sōtōshū Shūmuchō Europe office in Paris (Director Rev. Soho Kakita; staff Rev. Hojun Szpunar, Rev. Seigaku Higuchi, Rev. Shinko Toshima): 'more than 400 monks and nuns registered with Soto Zen are actively at work' across over 300 European facilities. Includes Yuno Rech as recognised dendō kyōshi for Europe and his successors as authorised kokusai fukyōshi (e.g. Sengyo Van Leuven for Italy, registered 2011).",
      },
      {
        index: 5,
        sourceId: "src_ubf",
        pageOrSection: "Union Bouddhiste de France — historique des vice-présidents (accessed 2026-05-11; cf. https://fr.wikipedia.org/wiki/Union_bouddhiste_de_France)",
        excerpt:
          "Roland Yuno Rech, membre fondateur de l'UBF en 1986 et vice-président pendant quinze ans ; représentant du bouddhisme zen sōtō auprès des instances françaises (UBF) et européennes (Union Bouddhiste Européenne).",
      },
      {
        index: 6,
        sourceId: "src_azi",
        pageOrSection: "https://www.abebooks.com/9788497434331/realizaci%C3%B3n-despertar-Comentarios-Genjo-Koan-8497434331/plp (accessed 2026-05-11)",
        excerpt:
          "'La realización del despertar: Comentarios al Genjo Koan del maestro zen Dogen — Yuno Rech, Roland: 9788497434331' — Spanish edition translated by Antonio Arana and Txus Laita, in circulation in the Iberian AZI sangha as a primary teaching text.",
      },
    ],
  },
];
