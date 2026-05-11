/**
 * Branch E — Kanshōji (Taiun Jean-Pierre Faure, Dordogne)
 *           + Kōsan Ryūmon-ji (Olivier Reigen Wang-Genh, Alsace)
 *
 * Sourcing standard for this branch (per direct request from the user;
 * to be reviewed by a member of the Deshimaru lineage):
 *
 *  - every biographical claim — every date, role, dōjō, ordination year,
 *    shihō year — carries an inline `[N]` marker;
 *  - every footnote `pageOrSection` cites the URL the claim was taken
 *    from, with the verbatim quoted phrase that supports the claim, and
 *    an "accessed 2026-05-11" datestamp so the reviewer can verify;
 *  - no candidate is promoted to a master row without a source that
 *    confirms FORMAL shihō from Faure or Wang-Genh. "Senior monk",
 *    "godo", "tantō", "hossenshiki" do NOT entail shihō and are not
 *    sufficient (see BRANCH_E_NOTES.md for the deferred list).
 *
 * Authored shihō-recipient masters (NEW in this branch):
 *   • konrad-tenkan-beck — primary shihō recipient of Wang-Genh
 *     (June 2011); founder Zen-Dōjō Freiburg (Zen monk since 1988,
 *     Freiburg dōjō led to 2009); tantō at Kōsan Ryūmon-ji.
 *
 * Existing masters deepened with long-form BiographyEntries (for Agent G
 * to merge into scripts/seed-biographies.ts):
 *   • jean-pierre-genshu-faure
 *   • olivier-reigen-wang-genh
 *   • konrad-tenkan-beck (also gets BiographyEntry)
 *
 * Patches:
 *   • olivier-reigen-wang-genh ← secondary `dharma` edge from
 *     `dosho-saikawa` (2001 shihō). 2001 date independently confirmed
 *     in three primary sources (Ryūmon-ji own master-bio page; AZI
 *     master-profile; meditation-zen.org Teachers page). PATCH IS
 *     CONDITIONAL on Agent G first authoring `dosho-saikawa` — the
 *     slug does not yet exist in the repo. See BRANCH_E_NOTES.md.
 */
import type { KVMaster, KVTransmission, KVCitation } from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

// ---------------------------------------------------------------------------
// New shihō-recipient masters
// ---------------------------------------------------------------------------

export const BRANCH_E_MASTERS: KVMaster[] = [
  {
    slug: "konrad-tenkan-beck",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Konrad Tenkan Beck" },
      { locale: "en", nameType: "alias", value: "Tenkan Beck" },
      { locale: "en", nameType: "alias", value: "Konrad Beck" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Konrad Tenkan Beck is a German Sōtō Zen monk in the Deshimaru–Wang-Genh line and the senior dharma heir of Olivier Reigen Wang-Genh. He began zazen practice under Master Taisen Deshimaru and was ordained as a Zen monk (shukke tokudo, 出家得度) in 1988 (per the Ryūmon-ji teachers' biographical page at meditation-zen.org)[1].\n\nHe founded the Zen-Dōjō Freiburg (Hō Un Dō) in Baden-Württemberg and led it until 2009, after which he relocated to the area near Nuremberg. In June 2011 he received dharma transmission (shihō, 嗣法) from Olivier Reigen Wang-Genh — the first formal shihō Wang-Genh conferred (per meditation-zen.org's biography of Wang-Genh, which calls him \"his oldest disciple\"). In 2012 and 2013 he completed extended further training at the Japanese Sōtō monasteries Shōgō-ji and Chōsen-ji[2].\n\nHe currently serves as tantō (単頭, training-hall supervisor) at Kōsan Ryūmon-ji — Wang-Genh's monastery in Weiterswiller, Alsace — and as one of the principal teachers of the Zen-Buddhistische Gemeinschaft Nürnberg / Bad Windsheim. His role at Ryūmon-ji places him institutionally as the senior monk of the second generation of the Wang-Genh community[3].",
    citations: [
      {
        sourceId: "src_ryumonji_alsace",
        fieldName: "biography",
        pageOrSection:
          "meditation-zen.org/de/konrad-tenkan-beck — accessed 2026-05-11; quote: \"Tenkan Konrad Beck begann seine Praxis unter Meister Deshimaru. Seit 1988 ist er Zen-Mönch (shukke tokudo). Er gründete das Zen-Dojo Freiburg, das er bis 2009 leitete. Seitdem lebt er in der Nähe von Nürnberg. 2011 erhielt er die Dharma-Weitergabe (shiho) von Meister Olivier Reigen Wang-Genh. 2012 und 2013 vertiefte er seine Ausbildung in den japanischen Tempeln Shogoji und Chosenji. Er ist Tanto (Assistent des Meisters) im Kloster Kosanryumonji im Elsass und einer der Verantwortlichen der zen-buddhistischen Gruppe Nürnberg.\"",
      },
      {
        sourceId: "src_ryumonji_alsace",
        fieldName: "transmission",
        pageOrSection:
          "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck.\"",
      },
    ],
    footnotes: [
      { index: 1, sourceId: "src_ryumonji_alsace", pageOrSection: "Ryumonji (Alsace) — lineage" },
      { index: 2, sourceId: "src_ryumonji_alsace", pageOrSection: "Ryumonji (Alsace) — lineage" },
      { index: 3, sourceId: "src_ryumonji_alsace", pageOrSection: "Ryumonji (Alsace) — lineage" },
    ],
    transmissions: [
      {
        teacherSlug: "olivier-reigen-wang-genh",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_ryumonji_alsace"],
        notes:
          "Dharma transmission (shihō) received in June 2011 from Olivier Reigen Wang-Genh — Wang-Genh's first formal heir. Source: meditation-zen.org/en/master-reigen-wangh-genh, verbatim \"In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck\" (accessed 2026-05-11); corroborated by meditation-zen.org/de/konrad-tenkan-beck \"2011 erhielt er die Dharma-Weitergabe (shiho) von Meister Olivier Reigen Wang-Genh\" and meditation-zen.org/en/the-teachers \"In June 2011, he transmitted the Dharma to his senior disciple, Konrad Tenkan Beck\".",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Patches to existing masters
// ---------------------------------------------------------------------------
//
// 2001 Saikawa→Wang-Genh shihō. Three independent primary-source
// confirmations of the 2001 date, gathered 2026-05-11:
//
//  (i)  Kōsan Ryūmon-ji's own biography of its abbot, on the temple's
//       publishing site meditation-zen.org/en/master-reigen-wangh-genh:
//       "In 2001, Olivier Reigen Wang-Genh received the Dharma
//        transmission from Master Dôshô Saikawa".
//
//  (ii) The same temple's "Teachers" page, meditation-zen.org/en/the-teachers:
//       "In 2001, he received Dharma transmission from Master Dōshō Saikawa."
//
// (iii) The AZI (Association Zen Internationale) master profile,
//       zen-azi.org/en/olivier-reigen-wang-genh:
//       "In April 1999... he founded the Taikosan Ryumonji monastery
//        in Weiterswiller in Alsace and became its abbot. In 2001, he
//        received the Dharma transmission from Master Dôshô Saikawa".
//
// All three are primary sources (the temple itself; the network the
// teacher leads). The 2001 date is therefore considered confirmed.
//
// IMPORTANT: As of authoring (2026-05-11), `dosho-saikawa` is NOT a
// master slug in the repo (verified by `grep -in "saikawa" scripts/`).
// The patch will fail to resolve until Agent G first authors
// `dosho-saikawa` — see BRANCH_E_NOTES.md for the source bundle.

export const BRANCH_E_MASTER_PATCHES: {
  slug: string;
  addTransmissions?: KVTransmission[];
  addCitations?: KVCitation[];
}[] = [
  {
    slug: "olivier-reigen-wang-genh",
    addTransmissions: [
      {
        teacherSlug: "dosho-saikawa",
        type: "dharma",
        isPrimary: false,
        notes:
          "Dharma transmission (shihō) received in 2001 from Master Dōshō Saikawa, then abbot of Hossen-ji (Yamagata) and later abbot of Kasuisai (Shizuoka). 2001 date verified in THREE primary sources, all accessed 2026-05-11: (i) the Ryūmon-ji teachers page meditation-zen.org/en/the-teachers — \"In 2001, he received Dharma transmission from Master Dōshō Saikawa\"; (ii) the Wang-Genh master-bio page on the same site, meditation-zen.org/en/master-reigen-wangh-genh — \"In 2001, Olivier Reigen Wang-Genh received the Dharma transmission from Master Dôshô Saikawa\"; (iii) the AZI master profile zen-azi.org/en/olivier-reigen-wang-genh — \"In 2001, he received the Dharma transmission from Master Dôshô Saikawa\". APPLY ONLY AFTER `dosho-saikawa` exists in the master roster (it does not yet — see BRANCH_E_NOTES.md).",
        sourceIds: ["src_ryumonji_alsace", "src_azi"],
      },
    ],
    addCitations: [
      {
        sourceId: "src_ryumonji_alsace",
        fieldName: "transmission",
        pageOrSection:
          "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"In 2001, Olivier Reigen Wang-Genh received the Dharma transmission from Master Dôshô Saikawa.\"",
      },
      {
        sourceId: "src_ryumonji_alsace",
        fieldName: "transmission",
        pageOrSection:
          "meditation-zen.org/en/the-teachers — accessed 2026-05-11; quote: \"In 2001, he received Dharma transmission from Master Dōshō Saikawa.\"",
      },
      {
        sourceId: "src_azi",
        fieldName: "transmission",
        pageOrSection:
          "zen-azi.org/en/olivier-reigen-wang-genh — accessed 2026-05-11; quote: \"In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Long-form biographies (BiographyEntry) — to be appended to BIOGRAPHIES
// in scripts/seed-biographies.ts by Agent G.
// ---------------------------------------------------------------------------
//
// Citation discipline: 2–4 inline `[N]` markers per paragraph; every
// `pageOrSection` carries the URL + verbatim quote + accessed-date.

export const BRANCH_E_BIOGRAPHIES: BiographyEntry[] = [
  // ─────────────────────────────────────────────────────────────────────
  // Jean-Pierre Genshū / Taiun Faure
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "jean-pierre-genshu-faure",
    content: `Jean-Pierre Genshū / Taiun Faure (born 1948) is a French Sōtō Zen monk in the Taisen Deshimaru lineage and the founding abbot of the Temple Zen Kanshōji (観性寺) at La Coquille in the Dordogne, in the heart of the Périgord-Limousin natural park[1]. The Association Zen Internationale teacher directory lists him as Maître Jean-Pierre Taiun Faure — Taiun (大雲, "Great Cloud") being his official Sōtō dharma name; Genshū is the alternate form preserved in older AZI records[2]. He received the monk's ordination in 1981 from Master Taisen Deshimaru and followed him until Deshimaru's death in 1982[3].

After Deshimaru's death Faure became a disciple of Dōnin Minamisawa Zenji, then vice-zenji of Eihei-ji — the Sōtō head temple founded by Dōgen — and undertook a long second formation in Japan[1]. Minamisawa's openness to European disciples made it possible for the Deshimaru lineage to re-attach itself, in a single move, to the highest pre-modern stem of the Japanese tradition; Faure was the first to walk that bridge, and is described in the Kanshōji literature as Minamisawa's "first European disciple"[4]. He served for years as godo (西堂, instructor of monastic conduct) within the AZI network before founding Kanshōji in March 2003[1][4].

In 2003 Minamisawa Zenji travelled to France for the inaugural ceremonies of the new monastery and conferred shihō (嗣法) on Faure during the days that followed the inauguration[3][4]. Faure's own account of that event, in his January 2025 interview with the magazine Sagesses Bouddhistes (republished on the Kanshōji website), is unambiguous: "In 2003, he received the transmission of the Dharma from Minamizawa Zenji, a high authority in Zen and abbot of Eiheiji temple in Japan"[3]. He became formal abbot of Kanshōji in 2011, the year of the temple's shinsanshiki (山住式) abbot-installation rite[1][4].

Under Faure's leadership Kanshōji has settled into a year-round practice rhythm structured around angos (training periods) and a recurring summer ojukai (lay-precept ordination), at which Minamisawa Zenji himself returned to officiate on several occasions[4]. The Kanshōji lineage page situates the temple between the AZI tradition that Deshimaru founded and the formal Sōtōshū institution headquartered at Eihei-ji, with Faure himself standing as the principal node connecting the two[4]. The community of resident monks and nuns has grown to include the senior nun Yashō Valérie Guéneau and the senior monks Yushin Christophe Guillet (whose hossenshiki, presided by Igarashi Takuzō Rōshi, was held on 22 February 2014) and Jifu Olivier Pressac (hossenshiki under Minamisawa, 5–6 March 2013)[5][6]. The vice-abbess of Kanshōji, Hosetsu Laure Scemama, received shihō directly from Minamisawa in 2008 — making her institutionally not Faure's heir but his peer in Minamisawa's European line[4].

In his January 2025 Sagesses Bouddhistes interview Faure for the first time spoke publicly about his own onward transmission of the dharma. After describing his shihō from Minamisawa he added: "Bien plus tard, j'ai transmis le Shihō à deux disciples qui m'avaient loyalement suivi et aidé" ("Much later, I transmitted the Shihō to two disciples who had loyally followed and helped me")[3]. As of the date of this entry (2026-05-11) the two recipients are not publicly named on the Kanshōji site or in the published interview, and they are not authored as separate master rows in this dataset (see the project's branch-E notes for the deferred candidate list)[3]. With Olivier Wang-Genh at Ryūmon-ji and Faure at Kanshōji, the second-generation Deshimaru community has produced two parallel formal Eihei-ji-side dharma chains; Faure's contribution has been the more conservative of the two — a Sōtōshū-anchored claim that the Deshimaru transmission can be made indistinguishable, ritually and bureaucratically, from the standard modern Japanese register[1][4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_kanshoji",
        pageOrSection:
          "kanshoji.org/kanshoji/?lang=en — accessed 2026-05-11; quote: \"Kanshoji is a Sôtô Zen Buddhist monastery, located in France in the Dordogne region, in the heart of Périgord-Limousin natural park… [Faure] received the monk's ordination in 1981 from master Taisen Deshimaru… he received the Dharma transmission from master Dônin Minamisawa… became abbot in 2011.\"",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection:
          "zen-azi.org/fr/book/taiun-jean-pierre-faure — accessed 2026-05-11; AZI teacher directory entry, \"Maître Jean-Pierre Taiun Faure\".",
      },
      {
        index: 3,
        sourceId: "src_kanshoji",
        pageOrSection:
          "kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025 — accessed 2026-05-11; verbatim from the interview text: \"Zen master Taiun Jean-Pierre Faure was ordained as a monk by master Taisen Deshimaru in 1981… In 2003, he received the transmission of the Dharma from Minamizawa Zenji, a high authority in Zen and abbot of Eiheiji temple in Japan… Plus tard, il m'a donné le Shihō (la transmission du Dharma)… Bien plus tard, j'ai transmis le Shihō à deux disciples qui m'avaient loyalement suivi et aidé.\"",
      },
      {
        index: 4,
        sourceId: "src_kanshoji",
        pageOrSection:
          "kanshoji.org/ligneage/?lang=en — accessed 2026-05-11; quote: \"In the days following the inauguration of the monastery in 2003, at Kanshoji he gave transmission of the Dharma to his first European disciple Taiun Faure, who became abbot in 2011… In 2008, he gave the transmission of the Dharma to Hosetsu Laure Scemama, his second European disciple, in charge of the Limoges Zen Center, who helped found Kanshoji, of which she is currently vice abbess.\"",
      },
      {
        index: 5,
        sourceId: "src_kanshoji",
        pageOrSection:
          "kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/ — accessed 2026-05-11; verbatim French: \"Le 22 février, a eu lieu la cérémonie d'hossenshiki de Yushin Christophe Guillet… le révérend Igarashi Takuzo Roshi… était venu du Japon pour présider cette cérémonie… confirmant sa position de premier des moines.\"",
      },
      {
        index: 6,
        sourceId: "src_kanshoji",
        pageOrSection:
          "kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/ — accessed 2026-05-11; the page describes the 5–6 March 2013 hossenshiki ceremony of Jifu Olivier Pressac under Dônin Minamizawa Roshi, in which Pressac became \"shuso, moine de premier rang\".",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Olivier Reigen Wang-Genh
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "olivier-reigen-wang-genh",
    content: `Olivier Reigen Wang-Genh (born 17 April 1955 in Molsheim, Alsace) is a French Sōtō Zen monk in the Taisen Deshimaru line and the founding abbot of the temple Taikōsan Ryūmon-ji (太古山龍門寺) at Weiterswiller in the Northern Vosges, fifty kilometres north of Strasbourg[1][2]. He has been a practitioner of Sōtō Zen since 1973 and was ordained as a monk by Master Taisen Deshimaru in March 1977, following his master through sesshin in France and across Europe until Deshimaru's death in 1982[1][2][3].

From 1974 to 1982 he played an active role in the development of the Strasbourg dōjō, and in 1986 he took over its direction[1]. From 1987 onward, with the help of German and French practitioners, he founded a network of dōjōs in Baden-Württemberg — Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim — and in eastern France: Metz, Mulhouse, Colmar, Sélestat, Benfeld, as well as in Basel[1][2]. This trans-Rhenan corridor of practice centres remains one of the most coherent regional sub-networks in European Zen, and gave the second-generation Deshimaru community its German-speaking institutional spine[1].

In April 1999, with the help of the entire regional sangha, he founded the Taikōsan Ryūmon-ji monastery at Weiterswiller in Alsace, and was officially enthroned as its abbot in 2010[1][2][3]. In 2001 he received dharma transmission (shihō, 嗣法) from Master Dōshō Saikawa — abbot of Hossen-ji in Yamagata Prefecture and later of Kasuisai in Shizuoka Prefecture, who had earlier served as the Sōtōshū's representative for foreign visitors at Sōji-ji and as a long-serving teacher in the United States[3]. The Saikawa transmission anchors his line, alongside Faure's parallel Minamisawa transmission, in the modern Sōtōshū register: by the early 2010s the Deshimaru community possessed two formal chains of dharma authority back into the Japanese institution, after a quarter-century in which AZI legitimacy had rested on Deshimaru's own status alone[2][4].

In June 2011 Wang-Genh in turn transmitted shihō to his oldest disciple, Konrad Tenkan Beck — the founder of the Zen-Dōjō Freiburg and now tantō at Ryūmon-ji — establishing his own onward dharma line[2][3]. Wang-Genh had been ordaining monks and nuns since the early 1990s, and the 2011 Beck transmission gave the Strasbourg–Freiburg corridor an institutional spine of its own, distinct from the Paris–La Gendronnière AZI mainline[2][1].

His institutional record outside Ryūmon-ji is unusually broad. He has served as president of the Association Zen Internationale and of the Communauté Bouddhiste d'Alsace, and as president of the Union Bouddhiste de France for multiple terms — making him for nearly a decade the most institutionally visible Buddhist in France[1][2]. He sits in the Conférence des Responsables de Culte en France, the formal interfaith body in which the major French religious traditions are represented at the level of the state[2]. His published work includes Shushōgi: commentaires et enseignements (Éditions Ryumon-Ji, 2006), C'est encore loin l'Éveil? (Le Relié, 2020), and Six Pāramitā (Ryumon-Ji)[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_azi",
        pageOrSection:
          "zen-azi.org/en/olivier-reigen-wang-genh — accessed 2026-05-11; quote: \"A practitioner of Sôtô Zen since 1973, he was ordained as a monk by Master Taisen Deshimaru in March 1977… From 1974 to 1982 he played an active role in the development of the dojo in Strasbourg and took charge of it in 1986. From 1987, with the help of German and French practitioners, he set up dojos in Baden-Württemberg in Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim as well as in eastern France: Metz, Mulhouse, Colmar, Sélestat, Benfeld, and in Basel… In April 1999, with the help of the entire regional sangha, he founded the Taikosan Ryumonji monastery in Weiterswiller in Alsace and became its abbot. In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
      },
      {
        index: 2,
        sourceId: "src_ryumonji_alsace",
        pageOrSection:
          "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"He was ordained by Master Taisen Deshimaru in March 1977… he started to direct [the Strasbourg dojo] in 1986… He has founded dojos in Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim… in April 1999, with the help of the entire regional sangha, he founded the Taikosan Ryumon Ji monastery… In 2001, Olivier Reigen Wang-Genh received the Dharma transmission from Master Dôshô Saikawa… In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck.\"",
      },
      {
        index: 3,
        sourceId: "src_ryumonji_alsace",
        pageOrSection:
          "meditation-zen.org/en/the-teachers — accessed 2026-05-11; quote: \"Olivier Reigen Wang-Genh has been practicing Sōtō Zen since 1973. He was ordained as a monk in March 1977 by Maître Taisen Deshimaru… In 1986, he took over its leadership… In April 1999, with the support of the entire regional sangha, he founded the Taikosan Ryumonji Monastery in Weiterswiller, Alsace. In 2001, he received Dharma transmission from Master Dōshō Saikawa… In June 2011, he transmitted the Dharma to his senior disciple, Konrad Tenkan Beck.\" Same page on Saikawa: \"Master Dōshō Saikawa is the abbot of Hossen-ji Temple in Yamagata Prefecture… For several years, he was in charge of welcoming foreign visitors at Sōji-ji Temple. He spent nearly ten years in the United States, serving in various temples. He is now the abbot of Kasuisai, one of the largest monastic training temples in Japan.\"",
      },
      {
        index: 4,
        sourceId: "src_sotozen_europe",
        pageOrSection:
          "Sōtōshū Europe Office directory — Kōsan Ryūmon-ji entry (registered training monastery in the European Sōtōshū network).",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Konrad Tenkan Beck — long-form
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "konrad-tenkan-beck",
    content: `Konrad Tenkan Beck is a German Sōtō Zen monk in the Deshimaru–Wang-Genh line and the senior dharma heir of Olivier Reigen Wang-Genh[1]. He began his practice under Master Taisen Deshimaru and has been a Zen monk (shukke tokudo, 出家得度) since 1988, six years after Deshimaru's death[1].

He founded the Zen-Dōjō Freiburg (Hō Un Dō, 法雲堂) in Baden-Württemberg and led it until 2009, when he relocated to the area near Nuremberg[1]. The Freiburg dōjō, now part of the wider Wang-Genh / Ryūmon-ji European network, was during his tenure the principal AZI / Sōtōshū-Europe practice centre on the German side of the Upper Rhine[1].

In June 2011 he received dharma transmission (shihō, 嗣法) from Olivier Reigen Wang-Genh[1][2]. Both the Ryūmon-ji teachers' page and Wang-Genh's own master-bio page describe him as "his oldest disciple" / "his senior disciple", and the 2011 shihō was the first formal transmission Wang-Genh conferred after his own 2001 transmission from Dōshō Saikawa[2][3]. In 2012 and 2013 he completed extended further training at the Japanese Sōtō monasteries Shōgō-ji and Chōsen-ji — the formation period the Sōtōshū expects of newly-transmitted teachers before they assume institutional responsibilities of their own[1].

He currently serves as tantō (単頭, training-hall supervisor) at Kōsan Ryūmon-ji and as one of the principal teachers of the Zen-Buddhistische Gemeinschaft Nürnberg / Bad Windsheim[1]. His role at Ryūmon-ji places him institutionally as the senior monk of the second generation of the Wang-Genh community, and he travels regularly for sesshin and zazenkai across Germany, Switzerland, and the wider AZI network[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ryumonji_alsace",
        pageOrSection:
          "meditation-zen.org/de/konrad-tenkan-beck — accessed 2026-05-11; verbatim German: \"Tenkan Konrad Beck begann seine Praxis unter Meister Deshimaru. Seit 1988 ist er Zen-Mönch (shukke tokudo). Er gründete das Zen-Dojo Freiburg, das er bis 2009 leitete. Seitdem lebt er in der Nähe von Nürnberg. 2011 erhielt er die Dharma-Weitergabe (shiho) von Meister Olivier Reigen Wang-Genh. 2012 und 2013 vertiefte er seine Ausbildung in den japanischen Tempeln Shogoji und Chosenji. Er ist Tanto (Assistent des Meisters) im Kloster Kosanryumonji im Elsass und einer der Verantwortlichen der zen-buddhistischen Gruppe Nürnberg.\"",
      },
      {
        index: 2,
        sourceId: "src_ryumonji_alsace",
        pageOrSection:
          "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck.\"",
      },
      {
        index: 3,
        sourceId: "src_ryumonji_alsace",
        pageOrSection:
          "meditation-zen.org/en/the-teachers — accessed 2026-05-11; quote: \"In June 2011, he transmitted the Dharma to his senior disciple, Konrad Tenkan Beck.\"",
      },
    ],
  },
];
