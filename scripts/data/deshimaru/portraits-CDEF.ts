/**
 * Institutional portraits for Branches C/D/E/F (Zeisler, Coupey, Wang-Genh,
 * American, Lausanne) plus Sōtō-Japan parent stubs.
 * To be merged into scripts/fetch-kv-images.ts EXTERNAL_PORTRAITS.
 *
 * NO Wikimedia / Wikipedia / Commons sources.
 *
 * Each entry was verified by:
 *  1. Fetching the source page and confirming the master is named there.
 *  2. Fetching the imageUrl directly and confirming it returns image bytes
 *     (jpg / png).
 */

interface ExternalPortrait {
  imageUrl: string;
  sourcePageUrl: string;
  attribution: string;
  license: string;
}

export const PORTRAITS_CDEF: Record<string, ExternalPortrait> = {
  // ── Branch C: Zeisler / Mokushō Zen House Budapest ──────────────────────

  // Maria Teresa Shōgetsu Avila — Swiss-Colombian Deshimaru-Zeisler-line
  // nun, dharma transmission from Yvon Myōken Bec (Mokushō ZH) in 2016;
  // founder/director of Fundación Kannonji (Quito, Ecuador). Portrait from
  // the Fundación Kannonji official lineage page, where she is captioned
  // "Maestra Shogetsu Avila" alongside the rest of her Sōtō lineage
  // (Sawaki → Deshimaru → Zeisler → Bec → Vuillemin → Avila).
  "maria-teresa-shogetsu-avila": {
    imageUrl:
      "https://static.wixstatic.com/media/be4486_5a7760995e7f44daab4a7ea33f58195c~mv2.jpg",
    sourcePageUrl: "https://www.fundacionkannonji.org/about-1",
    attribution:
      "Fundación Kannonji (fundacionkannonji.org) — Maestra Shōgetsu Avila",
    license:
      "courtesy of Fundación Kannonji / fair use for educational identification",
  },

  // Ionut Kōshin Nedelcu — Sēidō (resident teacher) of Mokushōzen-ji
  // Bucharest. Mokushō ZH "Our story" page captions an image of the three
  // 2016 dharma-transmission recipients ("Dharma Transmissions"); since
  // there is no individually-captioned portrait of Nedelcu on a vetted
  // institutional page, we use the official Mokushō ZH transmission group
  // photo (where Nedelcu is one of three named recipients in the
  // surrounding text).
  "ionut-koshin-nedelcu": {
    imageUrl: "http://www.mokushozen.hu/wptest/images/14_Transmission_rs.jpg",
    sourcePageUrl: "https://www.mokushozen.hu/en/sample-page/our-story/",
    attribution:
      "Mokushō Zen House Budapest (mokushozen.hu) — Dharma Transmissions (Ionut Kōshin Nedelcu, one of the three 2016 recipients)",
    license:
      "courtesy of Mokushō Zen House / fair use for educational identification",
  },

  // László Tōryū Kálmán — leads sesshins at Sümegi / Szombathely Mokushō
  // dojo, Hungary. Same caveat as Nedelcu: only the group "Dharma
  // Transmissions" image on the Mokushō ZH "Our story" page identifies
  // him by name (as one of three 2016 transmission recipients).
  "laszlo-toryu-kalman": {
    imageUrl: "http://www.mokushozen.hu/wptest/images/14_Transmission_rs.jpg",
    sourcePageUrl: "https://www.mokushozen.hu/en/sample-page/our-story/",
    attribution:
      "Mokushō Zen House Budapest (mokushozen.hu) — Dharma Transmissions (László Tōryū Kálmán, one of the three 2016 recipients)",
    license:
      "courtesy of Mokushō Zen House / fair use for educational identification",
  },

  // ── Branch D: Coupey / Sangha Sans Demeure ─────────────────────────────

  // Patrick Ferrieux — French Sōtō monk, ordained 2000 by Philippe Coupey,
  // shihō 2021, teaches at Dojo Zen de Paris. Portrait from the dojo's
  // official "Qui sommes-nous ?" team page, where he is captioned
  // "Patrick Ferrieux".
  "patrick-ferrieux": {
    imageUrl:
      "https://dojozenparis.com/wp-content/uploads/2020/05/patrick-ferrieux_rond.png",
    sourcePageUrl: "https://dojozenparis.com/qui-sommes-nous/",
    attribution: "Dojo Zen de Paris (dojozenparis.com) — Patrick Ferrieux",
    license:
      "courtesy of Dojo Zen de Paris / fair use for educational identification",
  },

  // ── Branch E: Wang-Genh / Ryūmon-ji Alsace ──────────────────────────────
  // Konrad Tenkan Beck — searched meditation-zen.org (his own teacher
  // page, plus Bad Windsheim, Nürnberg, Förderkreis Ryumonji, AZI Freiburg
  // dojo, and the Stuttgart event page). None of those institutional
  // pages serve a captioned portrait. SKIPPED — see notes file.

  // ── Branch F: American line / NOZT ──────────────────────────────────────

  // Robert Reibin Livingston (1933–2021) — Deshimaru disciple, founder of
  // the New Orleans Zen Temple (1991) and the American Zen Association
  // (1983). Portrait from the NOZT's own homepage gallery (their
  // squarespace-cdn host), captioned as the founding abbot.
  "robert-livingston": {
    imageUrl:
      "https://images.squarespace-cdn.com/content/v1/5da673d575e1de4fd39e3627/1571422780312-X2JK10UZFR9JHCDR9B5X/robert1.jpg",
    sourcePageUrl: "https://www.neworleanszentemple.org/home",
    attribution:
      "New Orleans Zen Temple / American Zen Association (neworleanszentemple.org) — Robert Reibin Livingston Roshi",
    license:
      "courtesy of New Orleans Zen Temple / fair use for educational identification",
  },

  // Richard Reishin Collins — second abbot of NOZT (shihō from Livingston,
  // 2016); now directs Stone Nest Zen Dōjō, Sewanee. NOZT homepage
  // serves the shihō ceremony photo (captioned "Richard Reishin Collins
  // and Robert Reibin Livingston, January 1, 2016" and "Passing the
  // kotsu and hossu. Shiho. 2016") which identifies him by name.
  "richard-reishin-collins": {
    imageUrl:
      "https://images.squarespace-cdn.com/content/v1/5da673d575e1de4fd39e3627/1606929043477-X23ASFFTMI611Z8ENLEE/Richard+and+Robert.jpg",
    sourcePageUrl: "https://www.neworleanszentemple.org/home",
    attribution:
      "New Orleans Zen Temple (neworleanszentemple.org) — Shihō, January 1, 2016: Richard Reishin Collins receiving transmission from Robert Reibin Livingston",
    license:
      "courtesy of New Orleans Zen Temple / fair use for educational identification",
  },

  // Tony Bland — Mississippi Sōtō teacher, founded Starkville Zen Dōjō
  // (1994); shihō from Livingston Roshi (2004). Portrait from the
  // sangha's official teacher page on zeninmississippi.org, captioned
  // "Tony Bland".
  "tony-bland": {
    imageUrl: "https://zeninmississippi.org/images/tonyteaching.jpg",
    sourcePageUrl: "https://zeninmississippi.org/aboutus/teacher.php",
    attribution: "Zen in Mississippi (zeninmississippi.org) — Tony Bland",
    license:
      "courtesy of Zen in Mississippi / fair use for educational identification",
  },

  // ── Branch F: Lausanne / Zürich (Bovay → Leibundgut) ────────────────────

  // Eishuku Monika Leibundgut — designated successor of Meihō Michel Bovay
  // at Muijōji / Zen Dōjō Zürich; shihō 2012/2013 from Yūkō Okamoto Roshi.
  // Portrait from Muijōji's own "Leadership & Instruction" page on zen.ch.
  "monika-leibundgut": {
    imageUrl:
      "https://zen.ch/wp-content/uploads/2023/10/IMG_0182-Verbessert-RR-768x1046.jpg",
    sourcePageUrl: "https://zen.ch/leadership-instruction/",
    attribution:
      "Muijōji / Zen Dōjō Zürich (zen.ch) — Eishuku Monika Leibundgut",
    license:
      "courtesy of Muijōji / fair use for educational identification",
  },

  // ── Sōtō-Japan parent stubs ─────────────────────────────────────────────
  // Kōjun Kishigami — searched the institutional pages mentioned in
  // tier-1 hints (Sangha Sans Demeure ECONNREFUSED; Zen Road; Tenborin
  // session-kesa-2015 was a 404; izauk.org gallery has only logos; Lille
  // dojo blog is on blogspot, not institutional). SKIPPED.

  // Dōshō Saikawa — abbot of Hossen-ji, former Sōkan of Sōtōshū South
  // America (2005–2020), now abbot of Kasuisai Monastery. Portrait from
  // Centre Zen Barcelona's official biography page where he is captioned
  // "Dosho Saikawa Roshi" (Centre Zen Barcelona is a Sōtōshū-affiliated
  // sangha that he supervises directly).
  "dosho-saikawa": {
    imageUrl: "https://zenbarcelona.org/wp-content/uploads/2019/05/SaikawaRoshiOK-2.jpg",
    sourcePageUrl:
      "https://zenbarcelona.org/about-us/a-brief-history-of-the-center/dosho-saikawa-roshi/",
    attribution: "Centre Zen Barcelona (zenbarcelona.org) — Dōshō Saikawa Roshi",
    license:
      "courtesy of Centre Zen Barcelona / fair use for educational identification",
  },
};
