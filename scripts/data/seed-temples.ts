/**
 * Canonical first-batch of temples / zendōs / seonbangs / Thiền centers
 * for the /practice map. Every entry carries lat/lng from its Wikipedia
 * infobox (or the sect's canonical HQ list where Wikipedia is sparse) plus
 * a citation excerpt so the seed is auditable.
 *
 * Consumed by scripts/seed-temples.ts. Idempotent — re-running with the
 * same slug upserts the row.
 */

import { EUROPE_TEMPLE_SEEDS } from "./seed-temples-europe";

export interface TempleSeed {
  /** Stable kebab-case slug; used as DB primary key. */
  slug: string;
  /** Names in multiple locales — at least one `en` entry. */
  names: { locale: string; value: string }[];
  /** Decimal degrees, WGS84. */
  lat: number;
  lng: number;
  /** Region (prefecture, province, state). */
  region: string;
  /** Country name. */
  country: string;
  /** Founded year; null if unknown. */
  foundedYear: number | null;
  foundedPrecision: "exact" | "circa" | "century" | null;
  /** School slug — must match an existing row in `schools`. */
  schoolSlug: string;
  /** Master slug for the temple's founder; null if unknown. */
  founderSlug?: string;
  /** Operational state. */
  status: "active" | "historical" | "ruin";
  /** Source id anchoring the lat/lng and founding attribution. */
  sourceId: string;
  /** Short citation excerpt from the source. */
  sourceExcerpt: string;
  /** Official website — practitioners looking for practice details, schedules,
   * or retreat signups follow this link. Must resolve to a page the place
   * itself maintains (sangha / temple / dōjō), not a third-party directory.
   * Omit when no canonical site is known. */
  url?: string;
}

/** Shared source id used when the citation target is Wikipedia's
 * temple-article infobox (lat/lng + founding metadata). */
export const SRC_WIKIPEDIA = "src_wikipedia";

/** Source id used for the White Plum Asanga temple listing. */
export const SRC_WHITEPLUM = "src_whiteplum";

/** Source id used for the Plum Village / Order of Interbeing practice
 * center listing (plumvillage.org). */
export const SRC_PLUMVILLAGE_ORG = "src_plumvillage_org";

/** Sōtōshū Europe Office — official Japanese Sōtō sect directory of temples,
 * monasteries and practice centres outside Japan. */
export const SRC_SOTOZEN_EUROPE = "src_sotozen_europe";

/** Association Zen Internationale — Deshimaru-lineage Sōtō dōjō directory. */
export const SRC_AZI = "src_azi";

/** Sanbō Zen International — authorized teachers and centers list. */
export const SRC_SANBOZEN = "src_sanbozen";

/** One Drop Zen — Shōdō Harada Rōshi's global sangha directory. */
export const SRC_ONEDROP = "src_onedropzen";

/** Kwan Um School of Zen — international zen-centres directory. */
export const SRC_KWANUM = "src_kwanum";

/** Order of Buddhist Contemplatives (OBC) — Shasta Abbey / Jiyu-Kennett
 * Sōtō-derived monastic order. */
export const SRC_OBC = "src_obc";

/** Plum Village — monastic practice centres directory on plumvillage.org. */
export const SRC_PLUMVILLAGE_MONASTIC = "src_plumvillage_monastic";

/** San Francisco Zen Center — sfzc.org (Suzuki Roshi lineage; the largest
 * Sōtō Zen institution in the United States). */
export const SRC_SFZC = "src_sfzc";

/** Diamond Sangha — Aitken Roshi's network of lay zen sanghas
 * (Harada-Yasutani-Yamada lineage). */
export const SRC_DIAMOND_SANGHA = "src_diamond_sangha";

/** Mountains and Rivers Order (Daido Loori, Zen Mountain Monastery). */
export const SRC_MRO = "src_mountains_rivers";

/** Rinzai-ji — Joshu Sasaki Roshi's network of Rinzai centres in
 * North America and Europe. */
export const SRC_RINZAIJI = "src_rinzaiji";

/** Kosen Sangha — Stéphane Kosen Thibaut's Sōtō / Deshimaru-derived
 * network. zen-deshimaru.com is the canonical dōjō directory. */
export const SRC_KOSEN_SANGHA = "src_kosen_sangha";

/** Kanshoji — Taiun Jean-Pierre Faure's Sōtō monastery + affiliated
 * places-of-practice directory. */
export const SRC_KANSHOJI = "src_kanshoji";

/** Zen Road — Roland Yuno Rech's AZI-affiliated dōjō network
 * (zen-road.org). */
export const SRC_ZEN_ROAD = "src_zen_road";

/** ABZE — Association Bouddhiste Zen d'Europe; pan-European Sōtō
 * teachers' association affiliated with the Sōtōshū. */
export const SRC_ABZE = "src_abze";

// ─── National Buddhist umbrella directories ─────────────────────────────
/** Deutsche Buddhistische Union — DE national umbrella, lists Zen members. */
export const SRC_DBU = "src_dbu";
/** Boeddhistische Unie Nederland — NL national umbrella. */
export const SRC_BUN = "src_bun";
/** Schweizerische Buddhistische Union — CH national umbrella. */
export const SRC_SBU = "src_sbu";
/** Österreichische Buddhistische Religionsgesellschaft — AT statutory body. */
export const SRC_OBR = "src_obr";
/** Unione Buddhista Italiana — IT national umbrella. */
export const SRC_UBI = "src_ubi";
/** União Budista Portuguesa — PT national umbrella. */
export const SRC_UBP = "src_ubp";
/** Bouddhisme-France — FR umbrella with annuaire of practice centres. */
export const SRC_BOUDDHISME_FRANCE = "src_bouddhisme_france";

// ─── Country-specific Zen guides ────────────────────────────────────────
/** zen-guide.de — public-facing DE Zen-place catalogue. */
export const SRC_ZEN_GUIDE_DE = "src_zen_guide_de";

// ─── UK-specific networks ───────────────────────────────────────────────
/** Western Chan Fellowship — Chan/Zen UK network (Hsu Yun lineage). */
export const SRC_WESTERN_CHAN_FELLOWSHIP = "src_western_chan_fellowship";
/** StoneWater Zen Sangha — UK White Plum lineage (Tenshin Reb Anderson). */
export const SRC_STONEWATER_ZEN = "src_stonewater_zen";
/** International Zen Association UK — AZI's UK affiliate. */
export const SRC_IZAUK = "src_izauk";
/** The Buddhist Society — Hampstead, oldest UK Buddhist body. */
export const SRC_BUDDHIST_SOCIETY_UK = "src_buddhist_society_uk";

// ─── Country-specific monastery / network sites ─────────────────────────
/** Felsentor / Houshinji — CH Sōtō monastery on Mount Rigi. */
export const SRC_FELSENTOR = "src_felsentor";
/** Puregg Zen-Kloster — AT Sanbō Zen / Kobun Chino lineage. */
export const SRC_PUREGG = "src_puregg";
/** Luz Serena — ES Sōtō monastery (Dokushô Villalba). */
export const SRC_LUZ_SERENA = "src_luz_serena";
/** Comunidad Budista Sōtō Zen España (CBSZ) — ES Sōtō umbrella. */
export const SRC_SOTOZEN_ES = "src_sotozen_es";
/** Kwan Um Polska (zen.pl) — large PL Korean-Zen network. */
export const SRC_KWAN_UM_POLAND = "src_kwan_um_poland";

/** Sōtō Zen Buddhist Association (SZBA) — North-American Sōtō teachers'
 * association. szba.org is the main directory of US/Canada Sōtō centres. */
export const SRC_SZBA = "src_szba";

// ─── Asian directory sources ────────────────────────────────────────────
/** Sōtōshū Japan head office — sodo (training monastery) directory at
 * sotozen-net.or.jp. Distinct from SRC_SOTOZEN_EUROPE which covers only
 * the /eng/temples/europe/ pages on the same domain. */
export const SRC_SOTOZEN_JP = "src_sotozen_jp";
/** Sotozen-Navi — Sōtōshū's foreign-zazen-friendly temple portal at
 * sotozen-navi.com. */
export const SRC_SOTOZEN_NAVI = "src_sotozen_navi";
/** Rinzai-Ōbaku Federation — head temples directory at zen.rinnou.net. */
export const SRC_RINNOU = "src_rinnou";
/** BuddhaNet World Buddhist Directory — country-by-country listings. */
export const SRC_BUDDHANET = "src_buddhanet";
/** Giác Ngộ — official newspaper of the Vietnamese Buddhist Sangha. */
export const SRC_GIACNGO_VN = "src_giacngo_vn";
/** Phật giáo Việt Nam — phatgiao.org.vn, official news portal of the
 * Vietnam Buddhist Sangha (GHPGVN). */
export const SRC_PHATGIAO_VN = "src_phatgiao_vn";
/** International Research Institute for Zen Buddhism (IRIZ), Hanazono
 * University — global Zen Centers database (last refreshed 2003). */
export const SRC_IRIZ_HANAZONO = "src_iriz_hanazono";
/** Sando Kaisen Russian sangha — Deshimaru-line Sōtō dōjō directory at
 * zen-kaisen.ru. */
export const SRC_SANDO_KAISEN = "src_sando_kaisen";
/** Dharma Drum Mountain — Chan Master Sheng Yen's global network: Chan
 * Meditation Center, DDRC Pine Bush, and DDMBA regional affiliates. */
export const SRC_DHARMADRUM = "src_dharmadrum";
/** Mokusho Zen House Budapest (mokushozen.hu) — Hungarian Sōtō Zen sangha
 * founded 1992 by Yvon Myōken Bec, dharma-heir of Étienne Mokushō Zeisler;
 * primary source for Zeisler's biography, the Eastern European mission, and
 * Vincent Keisen Vuillemin's lineage. */
export const SRC_MOKUSHO_HOUSE = "src_mokusho_house";

// ─── Global lineage networks (added 2026-05) ────────────────────────────
/** Fo Guang Shan — Hsing Yun's Taiwan-rooted Chinese-Chan / Humanistic
 * Buddhism network; flagship temples and IBPS regional chapters worldwide
 * (fgs.org.tw, hsilai.org, nantien.org.au, nanhua.co.za). */
export const SRC_FOGUANG = "src_foguang";
/** Boundless Way Zen — North-American hybrid Sōtō/Linji sangha founded by
 * James Ishmael Ford & Melissa Blacker (boundlessway.org, northamptonzen.org). */
export const SRC_BOUNDLESS_WAY = "src_boundless_way";
/** Zen Peacemaker Order — Bernie Glassman's socially-engaged-Zen network
 * (zenpeacemakers.org affiliate roster). */
export const SRC_ZEN_PEACEMAKERS = "src_zen_peacemakers";
/** Ordinary Mind Zen School — Joko Beck-lineage non-clerical Zen sanghas
 * (ordinarymind.com / ordinarymind.org.au / ordinarymind.eu rosters). */
export const SRC_ORDINARY_MIND = "src_ordinary_mind";
/** Zen Studies Society — Rinzai school founded by Eido Shimano / led by
 * Roko Sherry Chayat & Jaeckel Roshi (Dai Bosatsu Zendo, NY Zendo). */
export const SRC_ZEN_STUDIES_SOCIETY = "src_zen_studies_society";
/** Chozen-ji — Hawaii Rinzai monastery founded by Omori Sogen / Tanouye
 * Tenshin (chozen-ji.org), plus Daiyuzenji affiliate (Chicago). */
export const SRC_CHOZEN_JI = "src_chozen_ji";

// ─── Catch-all for the long tail of small directory citations ──────────
/** EU Zen places research bundle — generic citation source for entries
 * surfaced by directories not individually registered above. The
 * `sourceExcerpt` of each citation preserves the original source URL so
 * per-entry provenance is auditable. */
export const SRC_EU_ZEN_RESEARCH = "src_eu_zen_research";

/** Global Zen practice-centre research bundle — fallback citation for the
 * Gemini Deep Research 2026-05 ingest where the row's primary directory
 * already has a registered source above (Diamond Sangha, Kwan Um, etc.) but
 * a few outliers don't fit cleanly. The `sourceExcerpt` preserves the
 * underlying directory URL so per-entry provenance is auditable. */
export const SRC_GLOBAL_ZEN_RESEARCH = "src_global_zen_research";

export const SEED_TEMPLES: TempleSeed[] = [
  // ─── Japanese Sōtō ────────────────────────────────────────────────────
  {
    slug: "eihei-ji",
    names: [
      { locale: "en", value: "Eihei-ji" },
      { locale: "ja", value: "永平寺" },
    ],
    lat: 36.0561,
    lng: 136.3553,
    region: "Fukui Prefecture",
    country: "Japan",
    foundedYear: 1244,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "dogen",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Eihei-ji (永平寺) is one of two main temples of the Sōtō school of Zen Buddhism. Its founder was Eihei Dōgen, who established it in 1244.",
    url: "https://daihonzan-eiheiji.com/",
  },
  {
    slug: "soji-ji",
    names: [
      { locale: "en", value: "Sōji-ji" },
      { locale: "ja", value: "總持寺" },
    ],
    lat: 35.5046,
    lng: 139.6760,
    region: "Yokohama",
    country: "Japan",
    foundedYear: 1321,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "keizan-jokin",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Sōji-ji (總持寺) is one of two main Sōtō Zen temples, together with Eihei-ji. Founded 1321 by Keizan Jōkin; moved to Tsurumi, Yokohama in 1911 after fire.",
    url: "https://www.sojiji.jp/",
  },

  // ─── Japanese Rinzai — the main Kyoto head-temples ────────────────────
  {
    slug: "daitoku-ji",
    names: [
      { locale: "en", value: "Daitoku-ji" },
      { locale: "ja", value: "大徳寺" },
    ],
    lat: 35.0427,
    lng: 135.7459,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1315,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Daitoku-ji (大徳寺) is a head temple of the Daitoku-ji branch of the Rinzai school, founded in 1315 by Shūhō Myōchō (Daitō Kokushi).",
    url: "https://zen.rinnou.net/head_temples/07daitoku.html",
  },
  {
    slug: "myoshin-ji",
    names: [
      { locale: "en", value: "Myōshin-ji" },
      { locale: "ja", value: "妙心寺" },
    ],
    lat: 35.0192,
    lng: 135.7247,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1342,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Myōshin-ji (妙心寺) is the head temple of the largest Rinzai branch, founded 1342 by Kanzan Egen.",
    url: "https://zen.rinnou.net/head_temples/01myoshin.html",
  },
  {
    slug: "tofuku-ji",
    names: [
      { locale: "en", value: "Tōfuku-ji" },
      { locale: "ja", value: "東福寺" },
    ],
    lat: 34.9761,
    lng: 135.7740,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1236,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Tōfuku-ji (東福寺) is head temple of the Tōfuku-ji branch of Rinzai Zen, founded 1236 by Enni Ben'en.",
    url: "https://tofukuji.jp/",
  },
  {
    slug: "nanzen-ji",
    names: [
      { locale: "en", value: "Nanzen-ji" },
      { locale: "ja", value: "南禅寺" },
    ],
    lat: 35.0117,
    lng: 135.7937,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1291,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Nanzen-ji (南禅寺) is the head temple of the Nanzen-ji branch of Rinzai Zen, founded 1291 by Emperor Kameyama's abdication residence.",
    url: "http://www.nanzen.net/english/",
  },
  {
    slug: "kennin-ji",
    names: [
      { locale: "en", value: "Kennin-ji" },
      { locale: "ja", value: "建仁寺" },
    ],
    lat: 35.0023,
    lng: 135.7730,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1202,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Kennin-ji (建仁寺) is the oldest Zen temple in Kyoto, founded 1202 by Eisai — the monk who brought Rinzai Zen from Song China.",
    url: "https://www.kenninji.jp/",
  },
  {
    slug: "tenryu-ji",
    names: [
      { locale: "en", value: "Tenryū-ji" },
      { locale: "ja", value: "天龍寺" },
    ],
    lat: 35.0157,
    lng: 135.6735,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1339,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Tenryū-ji (天龍寺) is the head temple of the Tenryū-ji branch of Rinzai Zen, founded 1339 by Ashikaga Takauji; first of the Kyoto Gozan.",
    url: "https://www.tenryuji.com/",
  },
  {
    slug: "shokoku-ji",
    names: [
      { locale: "en", value: "Shōkoku-ji" },
      { locale: "ja", value: "相国寺" },
    ],
    lat: 35.0362,
    lng: 135.7618,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1382,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Shōkoku-ji (相国寺) is head temple of the Shōkoku-ji branch of Rinzai Zen, founded 1382 by Ashikaga Yoshimitsu with Musō Soseki.",
    url: "https://www.shokoku-ji.jp/",
  },
  {
    slug: "daishu-in",
    names: [
      { locale: "en", value: "Daishū-in" },
      { locale: "ja", value: "大珠院" },
    ],
    lat: 35.0349,
    lng: 135.7194,
    region: "Kyoto",
    country: "Japan",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "rinzai",
    status: "active",
    sourceId: "src_morinaga_wiki",
    sourceExcerpt:
      "Daishū-in (大珠院) — a sub-temple of Ryōan-ji in the Myōshin-ji complex, Kyoto. Sōkō Morinaga was ordained here by Gotō Zuigan in 1949 and served as its chief priest from 1963 until his death in 1995.",
  },

  // ─── Japanese Ōbaku ──────────────────────────────────────────────────
  {
    slug: "manpuku-ji",
    names: [
      { locale: "en", value: "Manpuku-ji" },
      { locale: "ja", value: "萬福寺" },
    ],
    lat: 34.9131,
    lng: 135.8064,
    region: "Kyoto Prefecture",
    country: "Japan",
    foundedYear: 1661,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Manpuku-ji (萬福寺) is the head temple of the Ōbaku school, founded 1661 by the Chinese Chan master Ingen Ryūki (Yinyuan Longqi).",
    url: "https://www.obakusan.or.jp/",
  },

  // ─── Sanbo-Zen ───────────────────────────────────────────────────────
  {
    slug: "sanun-zendo",
    names: [
      { locale: "en", value: "San'un Zendō" },
      { locale: "ja", value: "三雲禅堂" },
    ],
    lat: 35.3140,
    lng: 139.5480,
    region: "Kamakura",
    country: "Japan",
    foundedYear: 1971,
    foundedPrecision: "circa",
    schoolSlug: "sanbo-zen",
    founderSlug: "yamada-koun",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "San'un Zendō (三雲禅堂) in Kamakura is the central dōjō of Sanbō-Zen, built in 1970 by Yamada Kōun Roshi in his family compound. 'San'un' ('three clouds') refers to Harada Daiun, Yasutani Hakuun, and Yamada Kōun.",
    url: "https://sanbo-zen-international.org/en/sanun-zendo/",
  },

  // ─── Plum Village (Thích Nhất Hạnh's community) ──────────────────────
  {
    slug: "plum-village-upper-hamlet",
    names: [
      { locale: "en", value: "Plum Village — Upper Hamlet" },
      { locale: "vi", value: "Làng Mai — Xóm Thượng" },
    ],
    lat: 44.8695,
    lng: 0.7179,
    region: "Dordogne",
    country: "France",
    foundedYear: 1982,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "Plum Village Practice Center, founded 1982 in the Dordogne by Thích Nhất Hạnh; the Upper Hamlet (Pháp Vân Temple, 法雲寺) is the men's residence.",
    url: "https://plumvillage.org/practice-centre/plum-village-monastery/upper-hamlet",
  },
  {
    slug: "plum-village-lower-hamlet",
    names: [
      { locale: "en", value: "Plum Village — Lower Hamlet" },
      { locale: "vi", value: "Làng Mai — Xóm Hạ" },
    ],
    lat: 44.8803,
    lng: 0.7400,
    region: "Dordogne",
    country: "France",
    foundedYear: 1982,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "Plum Village Lower Hamlet, the women's residence of the Plum Village practice community in the Dordogne region.",
    url: "https://plumvillage.org/practice-centre/plum-village-monastery",
  },
  {
    slug: "deer-park-monastery",
    names: [{ locale: "en", value: "Deer Park Monastery" }],
    lat: 33.1289,
    lng: -117.1033,
    region: "California",
    country: "United States",
    foundedYear: 2000,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "Deer Park Monastery, founded 2000 in Escondido, California; the Plum Village community's West Coast monastery.",
    url: "https://deerparkmonastery.org/",
  },
  {
    slug: "blue-cliff-monastery",
    names: [{ locale: "en", value: "Blue Cliff Monastery" }],
    lat: 41.6347,
    lng: -74.3344,
    region: "New York",
    country: "United States",
    foundedYear: 2007,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "Blue Cliff Monastery, founded 2007 in Pine Bush, NY; the Plum Village community's East Coast residential monastery.",
    url: "https://www.bluecliffmonastery.org/",
  },
  {
    slug: "magnolia-grove-monastery",
    names: [{ locale: "en", value: "Magnolia Grove Monastery" }],
    lat: 34.3258,
    lng: -89.9464,
    region: "Mississippi",
    country: "United States",
    foundedYear: 2005,
    foundedPrecision: "circa",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "Magnolia Grove Monastery in Batesville, Mississippi — the Plum Village community's southern U.S. monastery.",
    url: "https://magnoliagrovemonastery.org/",
  },
  {
    slug: "eiab-germany",
    names: [
      { locale: "en", value: "European Institute of Applied Buddhism" },
      { locale: "de", value: "Europäisches Institut für Angewandten Buddhismus" },
    ],
    lat: 50.8738,
    lng: 7.5990,
    region: "North Rhine-Westphalia",
    country: "Germany",
    foundedYear: 2008,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_ORG,
    sourceExcerpt:
      "European Institute of Applied Buddhism, opened 2008 in Waldbröl, Germany; Plum Village's European retreat center.",
    url: "https://www.eiab.eu/",
  },

  // ─── Vietnamese Thiền / Trúc Lâm ─────────────────────────────────────
  {
    slug: "tu-hieu-temple",
    names: [
      { locale: "en", value: "Từ Hiếu Temple" },
      { locale: "vi", value: "Chùa Từ Hiếu" },
    ],
    lat: 16.4350,
    lng: 107.5547,
    region: "Huế",
    country: "Vietnam",
    foundedYear: 1843,
    foundedPrecision: "exact",
    schoolSlug: "lam-te",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Từ Hiếu (Chùa Từ Hiếu) in Huế, founded 1843; the root temple of Thích Nhất Hạnh, where he was ordained and where he returned in 2018.",
    url: "https://plumvillage.org/about/thich-nhat-hanh/thich-nhat-hanhs-health/thich-nhat-hanh-returns-to-vietnam",
  },
  {
    slug: "tu-dam-pagoda",
    names: [
      { locale: "en", value: "Từ Đàm Pagoda" },
      { locale: "vi", value: "Chùa Từ Đàm" },
    ],
    lat: 16.4536,
    lng: 107.5782,
    region: "Huế",
    country: "Vietnam",
    foundedYear: 1695,
    foundedPrecision: "circa",
    schoolSlug: "lam-te",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Từ Đàm (Chùa Từ Đàm) in Huế, a central temple of Vietnamese Lâm Tế; founded in the late 17th century.",
    url: "https://en.wikipedia.org/wiki/T%E1%BB%AB_%C4%90%C3%A0m_Pagoda",
  },
  {
    slug: "truc-lam-dalat",
    names: [
      { locale: "en", value: "Trúc Lâm Đà Lạt Monastery" },
      { locale: "vi", value: "Thiền viện Trúc Lâm Đà Lạt" },
    ],
    lat: 11.8918,
    lng: 108.4318,
    region: "Lâm Đồng Province",
    country: "Vietnam",
    foundedYear: 1994,
    foundedPrecision: "exact",
    schoolSlug: "truc-lam",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Thiền viện Trúc Lâm Đà Lạt, founded 1994 by Thích Thanh Từ as a modern revival of the indigenous Trúc Lâm Thiền school.",
    url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m_Monastery_of_Da_Lat",
  },
  {
    slug: "vinh-nghiem-pagoda",
    names: [
      { locale: "en", value: "Vĩnh Nghiêm Pagoda" },
      { locale: "vi", value: "Chùa Vĩnh Nghiêm" },
    ],
    lat: 10.7902,
    lng: 106.6838,
    region: "Ho Chi Minh City",
    country: "Vietnam",
    foundedYear: 1971,
    foundedPrecision: "exact",
    schoolSlug: "lam-te",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Chùa Vĩnh Nghiêm in Ho Chi Minh City, inaugurated 1971; a major northern-style Vietnamese Buddhist temple.",
    url: "https://en.wikipedia.org/wiki/V%C4%A9nh_Nghi%C3%AAm_Pagoda,_Ho_Chi_Minh_City",
  },

  // ─── Korean Seon ─────────────────────────────────────────────────────
  {
    slug: "songgwang-sa",
    names: [
      { locale: "en", value: "Songgwang-sa" },
      { locale: "ko", value: "송광사" },
      { locale: "zh", value: "松廣寺" },
    ],
    lat: 35.0029,
    lng: 127.2864,
    region: "South Jeolla Province",
    country: "South Korea",
    foundedYear: 867,
    foundedPrecision: "circa",
    schoolSlug: "jogye",
    founderSlug: "jinul",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Songgwang-sa (송광사) on Mount Jogye in Jeollanam-do; the seat of Bojo Jinul's Samādhi-Prajñā Society (1200) and the Sangha Jewel temple of Korean Buddhism.",
    url: "https://www.songgwangsa.org/",
  },
  {
    slug: "haein-sa",
    names: [
      { locale: "en", value: "Haein-sa" },
      { locale: "ko", value: "해인사" },
      { locale: "zh", value: "海印寺" },
    ],
    lat: 35.8015,
    lng: 128.0981,
    region: "South Gyeongsang Province",
    country: "South Korea",
    foundedYear: 802,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Haein-sa (해인사), founded 802; the Dharma Jewel temple of Korean Buddhism and home to the Tripiṭaka Koreana woodblocks; the seat of Seongcheol's Haein-sa sermons.",
    url: "https://www.haeinsa.or.kr/",
  },
  {
    slug: "tongdo-sa",
    names: [
      { locale: "en", value: "Tongdo-sa" },
      { locale: "ko", value: "통도사" },
      { locale: "zh", value: "通度寺" },
    ],
    lat: 35.4875,
    lng: 129.0664,
    region: "South Gyeongsang",
    country: "South Korea",
    foundedYear: 646,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Tongdo-sa (통도사), founded 646 by Jajang; the Buddha Jewel temple of Korean Buddhism, completing the Three Jewel Temples with Haein-sa and Songgwang-sa.",
    url: "https://www.tongdosa.or.kr/",
  },
  {
    slug: "bulguk-sa",
    names: [
      { locale: "en", value: "Bulguk-sa" },
      { locale: "ko", value: "불국사" },
      { locale: "zh", value: "佛國寺" },
    ],
    lat: 35.7902,
    lng: 129.3320,
    region: "Gyeongju",
    country: "South Korea",
    foundedYear: 528,
    foundedPrecision: "circa",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Bulguk-sa (불국사) in Gyeongju, rebuilt to its present scale in 751; a UNESCO World Heritage Site and one of Korea's most important Buddhist monuments.",
    url: "https://www.bulguksa.or.kr/",
  },
  {
    slug: "beomeo-sa",
    names: [
      { locale: "en", value: "Beomeo-sa" },
      { locale: "ko", value: "범어사" },
    ],
    lat: 35.2800,
    lng: 129.0703,
    region: "Busan",
    country: "South Korea",
    foundedYear: 678,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Beomeo-sa (범어사) on Mount Geumjeong in Busan, founded 678 by Uisang; one of Korea's most important Seon training centers.",
    url: "https://www.beomeo.kr/",
  },
  {
    slug: "jogye-sa-seoul",
    names: [
      { locale: "en", value: "Jogye-sa" },
      { locale: "ko", value: "조계사" },
    ],
    lat: 37.5730,
    lng: 126.9830,
    region: "Seoul",
    country: "South Korea",
    foundedYear: 1910,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Jogye-sa (조계사) in central Seoul — headquarters of the Jogye Order of Korean Buddhism since the 20th-century reorganization.",
    url: "https://www.jogyesa.kr/",
  },
  {
    slug: "hwagye-sa",
    names: [
      { locale: "en", value: "Hwagye-sa" },
      { locale: "ko", value: "화계사" },
    ],
    lat: 37.6339,
    lng: 127.0156,
    region: "Seoul",
    country: "South Korea",
    foundedYear: 1522,
    foundedPrecision: "exact",
    schoolSlug: "kwan-um",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Hwagye-sa (화계사) in Seoul — the mother temple of the Kwan Um School of Zen; Seung Sahn's home monastery.",
    url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=90168",
  },
  {
    slug: "seonam-sa",
    names: [
      { locale: "en", value: "Seonam-sa" },
      { locale: "ko", value: "선암사" },
    ],
    lat: 34.9967,
    lng: 127.3350,
    region: "South Jeolla Province",
    country: "South Korea",
    foundedYear: 875,
    foundedPrecision: "circa",
    schoolSlug: "taego-order",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Seonam-sa (선암사) on Mount Jogye, founded 875; head temple of the Taego Order of Korean Buddhism.",
    url: "https://en.wikipedia.org/wiki/Seonamsa",
  },

  // ─── Kwan Um School in the West ──────────────────────────────────────
  {
    slug: "providence-zen-center",
    names: [{ locale: "en", value: "Providence Zen Center" }],
    lat: 41.9709,
    lng: -71.4370,
    region: "Rhode Island",
    country: "United States",
    foundedYear: 1972,
    foundedPrecision: "exact",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Providence Zen Center, founded 1972 by Seung Sahn; head temple of the Kwan Um School of Zen.",
    url: "https://providencezen.org/",
  },

  // ─── Chinese Chan (historical roots) ─────────────────────────────────
  {
    slug: "shaolin-temple",
    names: [
      { locale: "en", value: "Shaolin Temple" },
      { locale: "zh", value: "少林寺" },
    ],
    lat: 34.5094,
    lng: 112.9360,
    region: "Henan Province",
    country: "China",
    foundedYear: 495,
    foundedPrecision: "exact",
    schoolSlug: "early-chan",
    founderSlug: "puti-damo",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Shaolin Monastery (少林寺) on Mount Song, Henan; founded 495 CE, traditionally the monastery where Bodhidharma is said to have practiced nine years of wall-gazing.",
    // The historical official domain shaolin.org.cn no longer resolves
    // reliably and there is no stable English-language site for the
    // Henan monastery itself; point at the Wikipedia article so the
    // popup still surfaces a working, authoritative link.
    url: "https://en.wikipedia.org/wiki/Shaolin_Monastery",
  },
  {
    slug: "nanhua-temple",
    names: [
      { locale: "en", value: "Nanhua Temple" },
      { locale: "zh", value: "南華寺" },
    ],
    lat: 24.8517,
    lng: 113.6828,
    region: "Guangdong Province",
    country: "China",
    foundedYear: 502,
    foundedPrecision: "circa",
    schoolSlug: "early-chan",
    founderSlug: "dajian-huineng",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Nanhua Temple (南華寺) on Mount Caoxi, Guangdong — the base of the Sixth Patriarch Dajian Huineng; his mummified remains are preserved there.",
    url: "https://en.wikipedia.org/wiki/Nanhua_Temple",
  },
  {
    slug: "yunmen-temple",
    names: [
      { locale: "en", value: "Yunmen Temple" },
      { locale: "zh", value: "雲門寺" },
    ],
    lat: 24.8108,
    lng: 113.5842,
    region: "Guangdong",
    country: "China",
    foundedYear: 923,
    foundedPrecision: "exact",
    schoolSlug: "yunmen",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Yunmen Temple (雲門寺), founded 923 CE; the ancestral temple of the Yunmen school of Chan, associated with the Tang master Yunmen Wenyan.",
    url: "https://en.wikipedia.org/wiki/Yunmen_Temple",
  },

  // ─── European Sōtō Zen — AZI / Deshimaru lineage ─────────────────────
  {
    slug: "la-gendronniere",
    names: [
      { locale: "en", value: "Temple Zen de la Gendronnière" },
      { locale: "fr", value: "Temple Zen de la Gendronnière" },
      { locale: "ja", value: "禅道尼苑" },
    ],
    lat: 47.4672,
    lng: 1.3403,
    region: "Centre-Val de Loire",
    country: "France",
    foundedYear: 1980,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "taisen-deshimaru",
    status: "active",
    sourceId: SRC_AZI,
    sourceExcerpt:
      "Temple Zen de la Gendronnière, near Blois in the Loire Valley — founded 1980 by Taisen Deshimaru and his disciples; the first Zen temple founded in Europe and the head temple of Association Zen Internationale.",
    url: "https://www.zen-azi.org/en/temple-gendronniere-presentation",
  },
  {
    slug: "ryumonji-alsace",
    names: [
      { locale: "en", value: "Ryumonji Zen Monastery" },
      { locale: "fr", value: "Monastère Zen Ryumonji" },
      { locale: "ja", value: "龍門寺" },
    ],
    lat: 48.8969,
    lng: 7.4281,
    region: "Bas-Rhin",
    country: "France",
    foundedYear: 1999,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_AZI,
    sourceExcerpt:
      "Ryumonji Zen Monastery in Weiterswiller, Alsace — a Sōtō Zen monastery in the Deshimaru lineage founded in 1999 by Master Olivier Reigen Wang-Genh, affiliated with Association Zen Internationale.",
    url: "https://meditation-zen.org/",
  },
  {
    slug: "kanshoji",
    names: [
      { locale: "en", value: "Kanshoji Zen Monastery" },
      { locale: "fr", value: "Monastère zen Kanshoji" },
      { locale: "ja", value: "観松寺" },
    ],
    lat: 45.5514,
    lng: 0.9842,
    region: "Dordogne",
    country: "France",
    foundedYear: 1999,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Kanshoji Zen Monastery in La Coquille, Dordogne — listed in the Sōtōshū Europe directory as an official Sōtō Zen training temple in France.",
    url: "https://www.kanshoji.org/",
  },
  {
    slug: "falaise-verte",
    names: [
      { locale: "en", value: "Falaise Verte Zen Centre" },
      { locale: "fr", value: "Centre Zen de la Falaise Verte" },
    ],
    lat: 45.0200,
    lng: 4.4158,
    region: "Ardèche",
    country: "France",
    foundedYear: 1974,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Centre Zen de la Falaise Verte (Ardèche), founded 1974 by Taikan Jyoji — described by its own history as the first Rinzai Zen temple in Europe.",
    url: "https://www.falaiseverte.org/",
  },

  // ─── European Sōtō Zen — Portugal ────────────────────────────────────
  {
    slug: "centre-zen-lisboa",
    names: [
      { locale: "en", value: "Centre Zen de Lisboa — Ryumonji" },
      { locale: "pt", value: "Centro Zen de Lisboa — Ryumonji" },
    ],
    lat: 38.7344,
    lng: -9.1465,
    region: "Lisbon",
    country: "Portugal",
    foundedYear: 1997,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_AZI,
    sourceExcerpt:
      "Centre Zen de Lisboa (Rua Luciano Cordeiro), founded 1997 by Raphael Dōkō Triet; a Sōtō Zen dōjō in the Deshimaru lineage affiliated with Association Zen Internationale and listed by Sōtōshū as an official Sōtō center in Portugal.",
    url: "https://dojozenlisboa.com/",
  },

  // ─── European Zen — Germany ──────────────────────────────────────────
  {
    slug: "hokuozan-sogenji",
    names: [
      { locale: "en", value: "Hokuozan Sōgenji" },
      { locale: "de", value: "Hokuozan Sōgenji" },
      { locale: "ja", value: "北欧山曹源寺" },
    ],
    lat: 52.9433,
    lng: 9.0203,
    region: "Lower Saxony",
    country: "Germany",
    foundedYear: 2006,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Hokuozan Sōgenji in Asendorf — a Rinzai Zen monastery opened under Shōdō Harada Rōshi; described as the first European Zen monastery in the Japanese Rinzai lineage. It is the central place for One Drop Zen (Harada Rōshi's global sangha) throughout Europe.",
    url: "https://onedropzen.net/",
  },
  {
    slug: "domicilium-weyarn",
    names: [
      { locale: "en", value: "Sanbō Zendō — Domicilium Weyarn" },
      { locale: "de", value: "Sanbō Zendō — Domicilium Weyarn" },
    ],
    lat: 47.8653,
    lng: 11.7836,
    region: "Bavaria",
    country: "Germany",
    foundedYear: 2000,
    foundedPrecision: "circa",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Sanbō Zendō at Domicilium Weyarn (Bavaria) — a Sanbō Zen practice centre representing the Sanbō Zen school in Germany.",
    url: "https://www.domicilium.de/",
  },

  // ─── European Sōtō Zen — Italy ───────────────────────────────────────
  {
    slug: "fudenji",
    names: [
      { locale: "en", value: "Fudenji Zen Monastery" },
      { locale: "it", value: "Monastero Zen Fudenji" },
      { locale: "ja", value: "普伝寺" },
    ],
    lat: 44.8169,
    lng: 9.9878,
    region: "Emilia-Romagna",
    country: "Italy",
    foundedYear: 1983,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Fudenji Sōtō Zen monastery in Salsomaggiore, Emilia-Romagna — listed by Sōtōshū as an official European Sōtō Zen temple.",
    url: "https://www.fudenji.it/",
  },
  {
    slug: "ensoji-il-cerchio",
    names: [
      { locale: "en", value: "Ensō-ji Il Cerchio" },
      { locale: "it", value: "Monastero Zen Ensō-ji Il Cerchio" },
      { locale: "ja", value: "円相寺" },
    ],
    lat: 45.4781,
    lng: 9.2247,
    region: "Milan",
    country: "Italy",
    foundedYear: 1988,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Ensō-ji Il Cerchio in Milan — a Sōtō Zen community founded by the Italian Zen master Tetsugen Serra; its retreat monastery Sanbō-ji is in Berceto.",
    url: "https://www.monasterozen.it/",
  },

  // ─── European Sōtō Zen — Netherlands ─────────────────────────────────
  {
    slug: "zen-river-temple",
    names: [
      { locale: "en", value: "Zen River Temple" },
      { locale: "nl", value: "Zen River Tempel" },
    ],
    lat: 53.4020,
    lng: 6.6806,
    region: "Groningen",
    country: "Netherlands",
    foundedYear: 2002,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Zen River Temple in Uithuizen — listed in the Sōtōshū Europe directory as a Sōtō Zen temple in the Netherlands, led by Tenkei Coppens.",
    url: "https://www.zenrivertemple.org/",
  },

  // ─── European Sōtō Zen — Spain ───────────────────────────────────────
  {
    slug: "centro-zen-abhirati",
    names: [
      { locale: "en", value: "Centro Zen Abhirati" },
      { locale: "es", value: "Centro Zen Abhirati" },
    ],
    lat: 39.4753,
    lng: -0.3878,
    region: "Valencia",
    country: "Spain",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Centro Zen Abhirati in Valencia — listed on the Sōtōshū global directory as an official Sōtō Zen centre in Spain (Tradición Budadharma Zen Sōtō, under Rev. Aigo Castro).",
    url: "https://budadharmazen.org/",
  },
  {
    slug: "seikyuji-sevilla",
    names: [
      { locale: "en", value: "Seikyūji" },
      { locale: "es", value: "Templo Zen Seikyūji" },
      { locale: "ja", value: "聖丘寺" },
    ],
    lat: 37.3886,
    lng: -5.9823,
    region: "Andalusia",
    country: "Spain",
    foundedYear: 2009,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Templo Zen Seikyūji near Seville — a Sōtō Zen monastery listed in the Sōtōshū Europe directory, under the direction of Raphaël Dōkō Triet Rōshi (who also founded the Centre Zen de Lisboa). Ascribed to the Association Zen Internationale in the Deshimaru lineage.",
    url: "https://www.seikyuji.org/",
  },
  {
    slug: "keiryuji-camprodon",
    names: [
      { locale: "en", value: "Keiryūji — Mountain Stream Temple" },
      { locale: "es", value: "Templo Keiryūji" },
      { locale: "ja", value: "渓流寺" },
    ],
    lat: 42.3194,
    lng: 2.3657,
    region: "Catalonia",
    country: "Spain",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Keiryūji (Mountain Stream Temple) in Camprodon, Catalonia — listed on the Sōtōshū global directory and in the White Plum Asanga membership list.",
    url: "https://www.keiryuji.org/",
  },

  // ─── Plum Village monastic practice centres (global) ─────────────────
  {
    slug: "healing-spring-monastery",
    names: [
      { locale: "en", value: "Healing Spring Monastery" },
      { locale: "fr", value: "Monastère de la Source Guérissante" },
    ],
    lat: 48.8729,
    lng: 3.2803,
    region: "Seine-et-Marne",
    country: "France",
    foundedYear: 2008,
    foundedPrecision: "circa",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "Healing Spring Monastery — a Plum Village monastic practice centre in Verdelot, France, serving the greater Paris region.",
    url: "https://plumvillage.org/practice-centre/healing-spring-monastery",
  },
  {
    slug: "maison-de-linspir",
    names: [
      { locale: "en", value: "Maison de l'Inspir" },
      { locale: "fr", value: "Maison de l'Inspir" },
    ],
    lat: 48.8239,
    lng: 3.2741,
    region: "Seine-et-Marne",
    country: "France",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "Maison de l'Inspir — a Plum Village practice residence in Villeneuve-sur-Bellot, France.",
    url: "https://plumvillage.org/practice-centre/maison-de-linspir",
  },
  {
    slug: "aiab-hong-kong",
    names: [
      { locale: "en", value: "Asian Institute of Applied Buddhism (AIAB)" },
      { locale: "en", value: "Lotus Pond Temple" },
      { locale: "zh", value: "亞洲應用佛學院 / 蓮池寺" },
    ],
    lat: 22.2580,
    lng: 113.9060,
    region: "Lantau Island",
    country: "Hong Kong",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "AIAB / Lotus Pond Temple on Lantau Island, Hong Kong — the Plum Village community's Asian institute, home to over a dozen monastics ordained in the Plum Village tradition.",
    url: "https://plumvillage.org/practice-centre/aiab-3",
  },
  {
    slug: "thai-plum-village",
    names: [
      { locale: "en", value: "Thai Plum Village" },
      { locale: "th", value: "หมู่บ้านพลัมประเทศไทย" },
      { locale: "vi", value: "Làng Mai Thái Lan" },
    ],
    lat: 14.7050,
    lng: 101.4500,
    region: "Nakhon Ratchasima",
    country: "Thailand",
    foundedYear: 2008,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "Thai Plum Village, founded 2008 near Khao Yai National Park — the Plum Village community's largest hub in Asia, leading retreats throughout Southeast Asia.",
    url: "https://plumvillage.org/practice-centre/plum-village-thailand",
  },
  {
    slug: "stream-entering-monastery",
    names: [{ locale: "en", value: "Stream Entering Monastery" }],
    lat: -37.3667,
    lng: 143.4500,
    region: "Victoria",
    country: "Australia",
    foundedYear: 2010,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "Stream Entering Monastery — a Plum Village nunnery founded 2010 at Porcupine Ridge, Victoria, Australia.",
    url: "https://plumvillage.org/practice-centre/stream-entering-monastery",
  },
  {
    slug: "mountain-spring-monastery",
    names: [{ locale: "en", value: "Mountain Spring Monastery" }],
    lat: -33.5060,
    lng: 150.5120,
    region: "New South Wales",
    country: "Australia",
    foundedYear: 2020,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_PLUMVILLAGE_MONASTIC,
    sourceExcerpt:
      "Mountain Spring Monastery — the newest Plum Village monastic practice centre, founded March 2020 in the Blue Mountains outside Sydney, Australia.",
    url: "https://plumvillage.org/practice-centre/mountain-spring-monastery",
  },

  // ─── Order of Buddhist Contemplatives (Kennett lineage, Sōtō-derived)
  {
    slug: "shasta-abbey",
    names: [{ locale: "en", value: "Shasta Abbey Buddhist Monastery" }],
    lat: 41.3099,
    lng: -122.3106,
    region: "California",
    country: "United States",
    foundedYear: 1970,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Shasta Abbey in Mount Shasta, California — the North American headquarters of the Order of Buddhist Contemplatives, founded 1970 by Rev. Master Jiyu-Kennett in the Japanese Sōtō Zen tradition.",
    url: "https://shastaabbey.org/",
  },
  {
    slug: "throssel-hole-abbey",
    names: [{ locale: "en", value: "Throssel Hole Buddhist Abbey" }],
    lat: 54.8583,
    lng: -2.3822,
    region: "Northumberland",
    country: "United Kingdom",
    foundedYear: 1972,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Throssel Hole Buddhist Abbey in Northumberland — the European headquarters of the Order of Buddhist Contemplatives, founded 1972 by Rev. Master Jiyu-Kennett.",
    url: "https://throssel.org.uk/",
  },
  {
    slug: "shobo-an-london",
    names: [
      { locale: "en", value: "Shōbō-an / The Zen Centre" },
      { locale: "ja", value: "正法庵" },
    ],
    lat: 51.5343,
    lng: -0.1737,
    region: "London",
    country: "United Kingdom",
    foundedYear: 1984,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    founderSlug: "morinaga-soko",
    status: "active",
    sourceId: "src_rinzai_zen_centre_uk",
    sourceExcerpt:
      "Shōbō-an ('Hermitage of the True Dharma') at 58 Marlborough Place, St John's Wood, London — Rinzai training hermitage consecrated by Sōkō Morinaga Rōshi in 1984 in the St John's Wood house bequeathed to The Zen Centre by Christmas Humphreys. Run by Myōkyō-ni (Irmgard Schloegl) from 1984 and her successors after 2007.",
    url: "https://rinzaizencentre.org.uk/",
  },
  {
    slug: "shobo-an-luton",
    names: [{ locale: "en", value: "Shōbō-an Luton Training House (Fairlight)" }],
    lat: 51.8787,
    lng: -0.4200,
    region: "Bedfordshire",
    country: "United Kingdom",
    foundedYear: 1996,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    founderSlug: "morinaga-soko",
    status: "active",
    sourceId: "src_rinzai_zen_centre_uk",
    sourceExcerpt:
      "Shōbō-an Luton (Fairlight) — second residential Rinzai training house in the Sōkō Morinaga line, opened April 1996 as a sister training house to the London Shōbō-an under The Zen Centre.",
    url: "https://rinzaizencentre.org.uk/",
  },
  {
    slug: "berkeley-buddhist-priory",
    names: [{ locale: "en", value: "Berkeley Buddhist Priory" }],
    lat: 37.8707,
    lng: -122.2700,
    region: "California",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Berkeley Buddhist Priory in Berkeley, California — an affiliated priory of the Order of Buddhist Contemplatives.",
    url: "https://www.berkeleybuddhistpriory.org/",
  },
  {
    slug: "eugene-buddhist-priory",
    names: [{ locale: "en", value: "Eugene Buddhist Priory" }],
    lat: 44.0521,
    lng: -123.0868,
    region: "Oregon",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Eugene Buddhist Priory in Oregon — an affiliated priory of the Order of Buddhist Contemplatives.",
    url: "https://www.eugenebuddhistpriory.org/",
  },
  {
    slug: "portland-buddhist-priory",
    names: [{ locale: "en", value: "Portland Buddhist Priory" }],
    lat: 45.5152,
    lng: -122.6784,
    region: "Oregon",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Portland Buddhist Priory in Oregon — an affiliated priory of the Order of Buddhist Contemplatives.",
    url: "https://www.portlandbuddhistpriory.org/",
  },
  {
    slug: "lions-gate-priory",
    names: [{ locale: "en", value: "Lions Gate Buddhist Priory" }],
    lat: 48.9500,
    lng: -123.7000,
    region: "British Columbia",
    country: "Canada",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Lions Gate Buddhist Priory — the Canadian priory of the Order of Buddhist Contemplatives in British Columbia.",
    url: "https://lionsgatebuddhistpriory.ca/",
  },
  {
    slug: "reading-buddhist-priory",
    names: [{ locale: "en", value: "Reading Buddhist Priory" }],
    lat: 51.4543,
    lng: -0.9781,
    region: "Berkshire",
    country: "United Kingdom",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_OBC,
    sourceExcerpt:
      "Reading Buddhist Priory in Berkshire — an affiliated priory of the Order of Buddhist Contemplatives in the United Kingdom.",
    url: "https://readingbuddhistpriory.org.uk/",
  },

  // ─── Kwan Um School of Zen (major North American centres) ────────────
  {
    slug: "cambridge-zen-center",
    names: [{ locale: "en", value: "Cambridge Zen Center" }],
    lat: 42.3811,
    lng: -71.1139,
    region: "Massachusetts",
    country: "United States",
    foundedYear: 1973,
    foundedPrecision: "exact",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Cambridge Zen Center — a residential Kwan Um School centre founded 1973 by Seung Sahn Soen Sa Nim near Harvard University.",
    url: "https://cambridgezen.org/",
  },
  {
    slug: "chogye-international-nyc",
    names: [{ locale: "en", value: "Chogye International Zen Center of New York" }],
    lat: 40.7299,
    lng: -73.9892,
    region: "New York",
    country: "United States",
    foundedYear: 1975,
    foundedPrecision: "circa",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Chogye International Zen Center of New York — an affiliated Kwan Um School centre in Manhattan, founded under Seung Sahn.",
    url: "https://www.chogyezencenter.org/",
  },
  {
    slug: "dharma-zen-center-la",
    names: [{ locale: "en", value: "Dharma Zen Center" }],
    lat: 34.0624,
    lng: -118.3425,
    region: "California",
    country: "United States",
    foundedYear: 1975,
    foundedPrecision: "circa",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Dharma Zen Center in Los Angeles — a Kwan Um School residential centre, founded under Seung Sahn.",
    url: "https://dharmazen.com/",
  },
  {
    slug: "new-haven-zen-center",
    names: [{ locale: "en", value: "New Haven Zen Center" }],
    lat: 41.3083,
    lng: -72.9279,
    region: "Connecticut",
    country: "United States",
    foundedYear: 1977,
    foundedPrecision: "exact",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "New Haven Zen Center — a Kwan Um School of Zen residential centre, founded 1977 under Seung Sahn's direction.",
    url: "https://newhavenzen.org/",
  },
  {
    slug: "empty-gate-berkeley",
    names: [{ locale: "en", value: "Empty Gate Zen Center" }],
    lat: 37.8616,
    lng: -122.2915,
    region: "California",
    country: "United States",
    foundedYear: 1977,
    foundedPrecision: "exact",
    schoolSlug: "kwan-um",
    founderSlug: "seung-sahn",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Empty Gate Zen Center in Berkeley — a Kwan Um School residential centre founded 1977; currently led by Zen Master Bon Soeng.",
    url: "https://emptygatezen.com/",
  },
  {
    slug: "indianapolis-zen-center",
    names: [{ locale: "en", value: "Indianapolis Zen Center" }],
    lat: 39.7684,
    lng: -86.1581,
    region: "Indiana",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "kwan-um",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Indianapolis Zen Center — a Kwan Um School affiliated Zen centre in Indiana.",
    url: "https://indyzen.org/",
  },
  {
    slug: "zen-center-las-vegas",
    names: [{ locale: "en", value: "Zen Center of Las Vegas" }],
    lat: 36.1699,
    lng: -115.1398,
    region: "Nevada",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "kwan-um",
    status: "active",
    sourceId: SRC_KWANUM,
    sourceExcerpt:
      "Zen Center of Las Vegas — a Kwan Um School affiliated centre.",
    url: "https://zenlasvegas.com/",
  },

  // ─── White Plum Asanga (major affiliated sanghas) ────────────────────
  {
    slug: "zen-mountain-monastery",
    names: [{ locale: "en", value: "Zen Mountain Monastery" }],
    lat: 42.0453,
    lng: -74.2391,
    region: "New York",
    country: "United States",
    foundedYear: 1980,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    founderSlug: "john-daido-loori",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Mountain Monastery in the Catskills — founded 1980 by John Daido Loori, a dharma heir of Taizan Maezumi. One of the largest residential Zen training monasteries in the United States.",
    url: "https://zmm.org/",
  },
  {
    slug: "upaya-zen-center",
    names: [{ locale: "en", value: "Upaya Zen Center" }],
    lat: 35.6892,
    lng: -105.9378,
    region: "New Mexico",
    country: "United States",
    foundedYear: 1990,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Upaya Zen Center in Santa Fe — founded 1990 by Joan Halifax Rōshi, a White Plum Asanga affiliated residential practice centre known for its chaplaincy program.",
    url: "https://www.upaya.org/",
  },
  {
    slug: "zen-community-of-oregon",
    names: [{ locale: "en", value: "Zen Community of Oregon" }],
    lat: 45.8225,
    lng: -123.1306,
    region: "Oregon",
    country: "United States",
    foundedYear: 2000,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    founderSlug: "jan-chozen-bays",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Community of Oregon (Great Vow Zen Monastery) — a White Plum Asanga residential centre led by Chozen Bays Rōshi and Hōgen Bays Rōshi.",
    url: "https://zendust.org/",
  },
  {
    slug: "great-plains-zen-center",
    names: [{ locale: "en", value: "Great Plains Zen Center" }],
    lat: 42.7850,
    lng: -88.4510,
    region: "Wisconsin",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Great Plains Zen Center — a White Plum Asanga affiliated practice centre in the Maezumi lineage.",
    url: "https://greatplainszen.org/",
  },
  {
    slug: "still-mind-zendo",
    names: [{ locale: "en", value: "Still Mind Zendo" }],
    lat: 40.7265,
    lng: -73.9942,
    region: "New York",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Still Mind Zendo in Manhattan — a White Plum Asanga affiliated Zen centre.",
    url: "https://stillmindzendo.org/",
  },
  {
    slug: "zen-sangha-belgium",
    names: [{ locale: "en", value: "Zen Sangha" }],
    lat: 50.8503,
    lng: 4.3517,
    region: "Brussels region",
    country: "Belgium",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Sangha — a Belgian White Plum Asanga affiliated sangha.",
    url: "https://zensangha.be/",
  },
  {
    slug: "ny-zen-center-contemplative-care",
    names: [{ locale: "en", value: "New York Zen Center for Contemplative Care" }],
    lat: 40.7549,
    lng: -73.9840,
    region: "New York",
    country: "United States",
    foundedYear: 2007,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "New York Zen Center for Contemplative Care — a White Plum Asanga affiliated centre specialising in contemplative end-of-life and caregiving training.",
    url: "https://zencare.org/",
  },

  // ─── One Drop Zen (Shōdō Harada Rōshi's global sangha) ───────────────
  {
    slug: "tahomasan-sogenji",
    names: [
      { locale: "en", value: "Tahomasan Sogenji Monastery" },
      { locale: "ja", value: "太邦山曹源寺" },
    ],
    lat: 48.2530,
    lng: -122.5833,
    region: "Washington",
    country: "United States",
    foundedYear: 1999,
    foundedPrecision: "circa",
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "Tahomasan Sogenji on Whidbey Island — a Rinzai Zen monastery under Shōdō Harada Rōshi's One Drop Zen global sangha.",
    url: "https://www.tahomazenmonastery.com/",
  },
  {
    slug: "yukokuji-hidden-valley",
    names: [
      { locale: "en", value: "Yūkoku-ji / Hidden Valley Zen Center" },
      { locale: "ja", value: "勇谷寺" },
    ],
    lat: 33.1434,
    lng: -117.1661,
    region: "California",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "Yūkoku-ji / Hidden Valley Zen Center in San Marcos, California — a Rinzai Zen centre in the One Drop Zen sangha.",
    url: "https://hvzc.org/",
  },
  {
    slug: "onedropzen-dublin",
    names: [{ locale: "en", value: "One Drop Zen Dublin" }],
    lat: 53.3498,
    lng: -6.2603,
    region: "Dublin",
    country: "Ireland",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "One Drop Zen Dublin — the Irish Rinzai zazen group in Shōdō Harada Rōshi's One Drop Zen sangha.",
    url: "https://onedropzendublin.com/",
  },
  {
    slug: "onedropzen-copenhagen",
    names: [{ locale: "en", value: "One Drop Zendo Copenhagen" }],
    lat: 55.6761,
    lng: 12.5683,
    region: "Copenhagen",
    country: "Denmark",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "One Drop Zendo in Copenhagen — a Danish Rinzai Zen zendo in Shōdō Harada Rōshi's One Drop Zen sangha.",
    url: "https://onedropzendo.dk/",
  },
  {
    slug: "gokokuzan-sogenji",
    names: [
      { locale: "en", value: "Gokokuzan Sōgenji" },
      { locale: "ja", value: "護国山曹源寺" },
    ],
    lat: 34.6617,
    lng: 133.9344,
    region: "Okayama",
    country: "Japan",
    foundedYear: 1698,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    founderSlug: "harada-sodo-kakusho",
    status: "active",
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "Gokokuzan Sōgenji in Okayama — a ~300-year-old Rinzai monastery where Shōdō Harada Rōshi serves as abbot; the source temple of his worldwide One Drop Zen sangha.",
    url: "https://sogenji.com/",
  },

  // ─── San Francisco Zen Center network (Suzuki Roshi / Sōtō) ──────────
  {
    slug: "sfzc-city-center",
    names: [
      { locale: "en", value: "San Francisco Zen Center — City Center" },
      { locale: "en", value: "Beginner's Mind Temple" },
      { locale: "ja", value: "発心寺" },
    ],
    lat: 37.7757,
    lng: -122.4239,
    region: "California",
    country: "United States",
    foundedYear: 1969,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "shunryu-suzuki",
    status: "active",
    sourceId: SRC_SFZC,
    sourceExcerpt:
      "City Center / Beginner's Mind Temple (Hosshin-ji) at 300 Page Street, San Francisco — established 1969 by Shunryu Suzuki Roshi as the urban temple of the SFZC network.",
    url: "https://www.sfzc.org/locations/city-center",
  },
  {
    slug: "tassajara-zen-mountain-center",
    names: [
      { locale: "en", value: "Tassajara Zen Mountain Center" },
      { locale: "en", value: "Zenshin-ji" },
      { locale: "ja", value: "禅心寺" },
    ],
    lat: 36.2333,
    lng: -121.5500,
    region: "California",
    country: "United States",
    foundedYear: 1967,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "shunryu-suzuki",
    status: "active",
    sourceId: SRC_SFZC,
    sourceExcerpt:
      "Tassajara Zen Mountain Center (Zenshin-ji) — the oldest Sōtō Zen training monastery in the West, founded 1967 by Shunryu Suzuki Roshi in the Ventana Wilderness.",
    url: "https://www.sfzc.org/locations/tassajara",
  },
  {
    slug: "green-gulch-farm",
    names: [
      { locale: "en", value: "Green Gulch Farm Zen Center" },
      { locale: "en", value: "Green Dragon Temple" },
      { locale: "ja", value: "蒼龍寺" },
    ],
    lat: 37.8625,
    lng: -122.5808,
    region: "California",
    country: "United States",
    foundedYear: 1972,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "shunryu-suzuki",
    status: "active",
    sourceId: SRC_SFZC,
    sourceExcerpt:
      "Green Gulch Farm / Green Dragon Temple (Sōryū-ji) in Muir Beach, Marin County — the SFZC's farm and retreat practice centre.",
    url: "https://www.sfzc.org/locations/green-gulch-farm",
  },

  // ─── Maezumi Roshi's home temple in the U.S. ─────────────────────────
  {
    slug: "zen-center-of-los-angeles",
    names: [
      { locale: "en", value: "Zen Center of Los Angeles" },
      { locale: "en", value: "Buddha Essence Temple" },
    ],
    lat: 34.0480,
    lng: -118.2965,
    region: "California",
    country: "United States",
    foundedYear: 1967,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    founderSlug: "taizan-maezumi",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Center of Los Angeles (Buddha Essence Temple) at 923 S Normandie Ave — founded 1967 by Taizan Maezumi Roshi; Wendy Egyoku Nakao Roshi currently serves as abbot.",
    url: "https://zcla.org/",
  },
  {
    slug: "yokoji-zen-mountain-center",
    names: [
      { locale: "en", value: "Yokoji Zen Mountain Center" },
      { locale: "ja", value: "陽光寺" },
    ],
    lat: 33.6892,
    lng: -116.7281,
    region: "California",
    country: "United States",
    foundedYear: 1981,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    founderSlug: "taizan-maezumi",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Yokoji Zen Mountain Center, founded 1981 by Taizan Maezumi Roshi in the San Jacinto Mountains; Tenshin Fletcher Roshi serves as abbot.",
    url: "https://zmc.org/",
  },

  // ─── Sanbō Zen / Diamond Sangha (Aitken / Yamada Kōun lineage) ───────
  {
    slug: "honolulu-diamond-sangha",
    names: [{ locale: "en", value: "Honolulu Diamond Sangha — Palolo Zen Center" }],
    lat: 21.3000,
    lng: -157.7917,
    region: "Hawaii",
    country: "United States",
    foundedYear: 1959,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Honolulu Diamond Sangha (Palolo Zen Center) — co-founded 1959 by Robert Aitken Roshi and Anne Aitken; the founding sangha of the worldwide Diamond Sangha network in the Harada–Yasutani–Yamada lineage.",
    url: "https://diamondsangha.org/",
  },
  {
    slug: "maui-zendo",
    names: [{ locale: "en", value: "Maui Zendo" }],
    lat: 20.9028,
    lng: -156.3680,
    region: "Hawaii",
    country: "United States",
    foundedYear: 1969,
    foundedPrecision: "circa",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Maui Zendo in Pā‘ia, Hawaii — a lay Diamond Sangha zendo in the Aitken Roshi tradition.",
    url: "https://www.maui-zendo.org/",
  },
  {
    slug: "pacific-zen-institute",
    names: [{ locale: "en", value: "Pacific Zen Institute (PZI)" }],
    lat: 38.4404,
    lng: -122.7141,
    region: "California",
    country: "United States",
    foundedYear: 1987,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Pacific Zen Institute, founded 1987 in Santa Rosa, California by John Tarrant Roshi (the first Dharma heir of Robert Aitken). The school of choice for koan-based contemporary Zen practice on the West Coast.",
    url: "https://www.pacificzen.org/",
  },
  {
    slug: "mountain-cloud-zen-center",
    names: [{ locale: "en", value: "Mountain Cloud Zen Center" }],
    lat: 35.6075,
    lng: -105.9214,
    region: "New Mexico",
    country: "United States",
    foundedYear: 1981,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Mountain Cloud Zen Center in Santa Fe — founded 1981 by students of Philip Kapleau Rōshi (Rochester / Three Pillars lineage); transitioned to the Sanbō Zen lineage under Henry Shukman Rōshi (2011–2015) and is currently led by Valerie Forstman Rōshi as Guiding Teacher, with Shukman as Spiritual Director Emeritus.",
    url: "https://www.mountaincloud.org/",
  },
  {
    slug: "maria-kannon-zen-center",
    names: [{ locale: "en", value: "Maria Kannon Zen Center" }],
    lat: 32.8131,
    lng: -96.7886,
    region: "Texas",
    country: "United States",
    foundedYear: 1991,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    founderSlug: "ruben-habito",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Maria Kannon Zen Center in Dallas — founded 1991 by Rubén Habito Rōshi (junshike, dharma name Keiun-ken) as a lay Sanbō Zen sangha. Named for the 'Maria Kannon' figures venerated by Japan's hidden Christians, embodying the Christian-Zen dialogue opened within the lineage by Yamada Kōun and Hugo Enomiya-Lassalle.",
    url: "https://mkzc.org/",
  },
  {
    slug: "benediktushof",
    names: [
      { locale: "en", value: "Benediktushof" },
      { locale: "de", value: "Benediktushof Holzkirchen" },
    ],
    lat: 49.7950,
    lng: 9.7522,
    region: "Bavaria",
    country: "Germany",
    foundedYear: 2003,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    founderSlug: "willigis-jager",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Benediktushof at Holzkirchen near Würzburg — founded 2003 by Willigis Jäger OSB, the largest German-language interfaith contemplation centre. Operated within Sanbō Zen until Jäger's 2009 withdrawal from the lineage; thereafter under the West-Östliche Weisheit foundation.",
    url: "https://www.benediktushof.de/",
  },

  // ─── Rochester / Kapleau lineage ─────────────────────────────────────
  {
    slug: "rochester-zen-center",
    names: [{ locale: "en", value: "Rochester Zen Center" }],
    lat: 43.1473,
    lng: -77.5907,
    region: "New York",
    country: "United States",
    foundedYear: 1966,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Rochester Zen Center at 7 Arnold Park, founded 1966 by Philip Kapleau Roshi after his Yasutani training; the centre that brought Three Pillars of Zen practice to American soil.",
    url: "https://www.rzc.org/",
  },

  // ─── Mountains and Rivers Order (Daido Loori) ────────────────────────
  {
    slug: "zen-center-of-new-york-city",
    names: [
      { locale: "en", value: "Zen Center of New York City — Fire Lotus Temple" },
    ],
    lat: 40.6865,
    lng: -73.9826,
    region: "New York",
    country: "United States",
    foundedYear: 1996,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    founderSlug: "john-daido-loori",
    status: "active",
    sourceId: SRC_MRO,
    sourceExcerpt:
      "Zen Center of New York City (Fire Lotus Temple) in Brooklyn — the urban centre of the Mountains and Rivers Order, the umbrella organisation founded by John Daido Loori at Zen Mountain Monastery.",
    url: "https://zmm.org/zcnyc/",
  },

  // ─── Rinzai-ji (Joshu Sasaki Roshi network) ──────────────────────────
  {
    slug: "mt-baldy-zen-center",
    names: [{ locale: "en", value: "Mount Baldy Zen Center" }],
    lat: 34.2367,
    lng: -117.6481,
    region: "California",
    country: "United States",
    foundedYear: 1971,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_RINZAIJI,
    sourceExcerpt:
      "Mount Baldy Zen Center, founded 1971 by Kyozan Joshu Sasaki Roshi — the principal Rinzai-ji training monastery in North America, set on a 99-year U.S. Forest Service lease in the San Gabriel Mountains.",
    url: "https://www.mbzc.org/",
  },
  {
    slug: "daishu-in-west",
    names: [{ locale: "en", value: "Daishu-in West" }],
    lat: 40.0856,
    lng: -123.9018,
    region: "California",
    country: "United States",
    foundedYear: 1994,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    founderSlug: "morinaga-soko",
    status: "active",
    sourceId: "src_daishuin_west",
    sourceExcerpt:
      "Daishu-in West — a residential Rinzai monastery in Garberville, Humboldt County, California, co-founded in 1994 by Sōkō Morinaga Rōshi with Shaku Daijō and Ursula Jarand as a Western extension of Daishū-in (Kyoto). First abbot Shaku Daijō; current abbot Shaku Kōjyū (since 2018).",
    url: "https://daishuinwest.org/",
  },

  // ─── Other major White Plum / lay Zen American centres ───────────────
  {
    slug: "boundless-way-zen-temple",
    names: [{ locale: "en", value: "Boundless Way Zen Temple" }],
    lat: 42.2625,
    lng: -71.8023,
    region: "Massachusetts",
    country: "United States",
    foundedYear: 2011,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Boundless Way Zen Temple in Worcester, Massachusetts — co-founded by James Ishmael Ford and David Rynick Roshi; a Western Zen sangha with roots in Sōtō and Korean Linji.",
    url: "https://boundlesswayzen.org/",
  },
  {
    slug: "springwater-center",
    names: [{ locale: "en", value: "Springwater Center" }],
    lat: 42.6364,
    lng: -77.5664,
    region: "New York",
    country: "United States",
    foundedYear: 1981,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Springwater Center, founded 1981 by Toni Packer (a Kapleau-trained teacher who departed institutional Zen) and 200 friends — a meditation retreat centre on 212 acres in the Finger Lakes region.",
    url: "https://www.springwatercenter.org/",
  },

  // ─── European Zen ────────────────────────────────────────────────────
  {
    slug: "stonewater-zen",
    names: [{ locale: "en", value: "StoneWater Zen Sangha" }],
    lat: 53.4084,
    lng: -2.9916,
    region: "Liverpool",
    country: "United Kingdom",
    foundedYear: 2002,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "StoneWater Zen Sangha in Liverpool — a UK White Plum Asanga sangha in the Maezumi lineage led by Dr David Keizan Scott Roshi.",
    url: "https://www.stonewaterzen.org/",
  },
  {
    slug: "western-chan-fellowship",
    names: [{ locale: "en", value: "Western Chan Fellowship — Maenllwyd Retreat" }],
    lat: 52.5444,
    lng: -3.8400,
    region: "Mid Wales",
    country: "United Kingdom",
    foundedYear: 1997,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Western Chan Fellowship — UK Chan charity in the Sheng Yen lineage, founded 1997 by Dr John Crook (first Western Dharma heir of Sheng Yen). The Maenllwyd retreat centre in mid-Wales is its principal site.",
    url: "https://westernchanfellowship.org/",
  },

  // ─── Australia ───────────────────────────────────────────────────────
  {
    slug: "jikishoan-melbourne",
    names: [{ locale: "en", value: "Jikishoan Zen Buddhist Community" }],
    lat: -37.8136,
    lng: 144.9631,
    region: "Victoria",
    country: "Australia",
    foundedYear: 1999,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Jikishoan Zen Buddhist Community, founded 1999 in Melbourne under Zen Master Ekai Korematsu Osho — a Sōtōshū-affiliated practice community.",
    url: "https://www.jikishoan.org.au/",
  },
  {
    slug: "zen-open-circle-sydney",
    names: [{ locale: "en", value: "Zen Open Circle" }],
    lat: -33.7969,
    lng: 151.2820,
    region: "New South Wales",
    country: "Australia",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Zen Open Circle near Sydney — an Australian Diamond Sangha lineage practice community offering meditation and retreats.",
    url: "https://www.zenopencircle.org.au/",
  },

  // ─── Latin America ───────────────────────────────────────────────────
  {
    slug: "templo-busshinji-sao-paulo",
    names: [
      { locale: "en", value: "Templo Busshinji" },
      { locale: "pt", value: "Templo Busshinji — Comunidade Sōtō Zen" },
      { locale: "ja", value: "佛心寺" },
    ],
    lat: -23.5610,
    lng: -46.6358,
    region: "São Paulo",
    country: "Brazil",
    foundedYear: 1956,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Templo Busshinji (佛心寺) in the Liberdade neighbourhood of São Paulo — the central Sōtō Zen temple for South America, listed by Sōtōshū as the regional administrative seat.",
    url: "https://sotozen.org.br/",
  },
  {
    slug: "mosteiro-zen-morro-da-vargem",
    names: [
      { locale: "en", value: "Mosteiro Zen Morro da Vargem" },
      { locale: "pt", value: "Mosteiro Zen Budista Morro da Vargem" },
    ],
    lat: -19.8408,
    lng: -40.4044,
    region: "Espírito Santo",
    country: "Brazil",
    foundedYear: 1974,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Mosteiro Zen Morro da Vargem in Ibiraçu, Espírito Santo — the first Zen monastery in Latin America, founded 1974 by Ryōtan Tokuda Roshi.",
    url: "https://mosteirozen.com.br/",
  },
  {
    slug: "templo-shobogenji-cordoba",
    names: [
      { locale: "en", value: "Templo Zen Shōbōgenji" },
      { locale: "es", value: "Templo Zen Shōbōgenji" },
      { locale: "ja", value: "正法源寺" },
    ],
    lat: -30.8625,
    lng: -64.5189,
    region: "Córdoba",
    country: "Argentina",
    foundedYear: 1998,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "stephane-kosen-thibaut",
    status: "active",
    sourceId: SRC_AZI,
    sourceExcerpt:
      "Templo Zen Shōbōgenji on Cerro Uritorco in Capilla del Monte, Córdoba — the first Sōtō Zen temple in Latin America in the Deshimaru lineage, founded 1998 by Stéphane Kōsen Thibaut.",
    url: "https://shobogenji.org/",
  },

  // ─── Japan — Antaiji (Sawaki / Uchiyama lineage) ─────────────────────
  {
    slug: "antaiji",
    names: [
      { locale: "en", value: "Antaiji" },
      { locale: "ja", value: "安泰寺" },
    ],
    lat: 35.6256,
    lng: 134.4983,
    region: "Hyōgo Prefecture",
    country: "Japan",
    foundedYear: 1921,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "sawaki-kodo",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Antaiji (安泰寺) in Shin'onsen, northern Hyōgo Prefecture — a Sōtō Zen training monastery founded 1921 (re-located 1976), the practice home of Kōdō Sawaki Roshi and Kōshō Uchiyama Roshi.",
    url: "https://antaiji.org/",
  },

  // ─── White Plum Asanga — additional sanghas (2026-05 ingest) ─────────
  {
    slug: "village-zendo",
    names: [{ locale: "en", value: "Village Zendo" }],
    lat: 40.7196,
    lng: -74.0061,
    region: "New York",
    country: "USA",
    foundedYear: 1986,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Village Zendo — Tribeca-based White Plum Asanga and Zen Peacemakers sangha founded 1986 by Pat Enkyo O'Hara Roshi (Maezumi → Glassman lineage). Currently at 260 W Broadway #1G, Manhattan.",
    url: "https://villagezendo.org/",
  },
  {
    slug: "zen-tree-schiedam",
    names: [{ locale: "en", value: "Zen Tree" }],
    lat: 51.9159,
    lng: 4.4012,
    region: "Zuid-Holland",
    country: "Netherlands",
    foundedYear: 2022,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Tree — White Plum Asanga zendō at Lange Haven 98, Schiedam, established 2022 by Jeroen Bosch Sensei (shihō 2025 from Michel Plein Ciel Roshi; Genno Pagès → Maezumi lineage). Sister sangha to Zen Heart Sangha (Den Haag).",
    url: "https://zentree.nl/",
  },
  {
    slug: "zen-alkmaar",
    names: [{ locale: "en", value: "Zen Alkmaar" }],
    lat: 52.6234,
    lng: 4.7570,
    region: "Noord-Holland",
    country: "Netherlands",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Alkmaar — Sōtō Zen sangha at Curaçaostraat 8, Alkmaar, led by B.G. Faber. Listed on the White Plum Asanga roster though specific Maezumi-line shihō affiliation is not publicly declared on the sangha site.",
    url: "https://zenalkmaar.nl/",
  },
  {
    slug: "de-berkeley-zen-bergen",
    names: [{ locale: "en", value: "Zen in Bergen (Myoshin Zen)" }],
    lat: 52.6720,
    lng: 4.7027,
    region: "Noord-Holland",
    country: "Netherlands",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen in Bergen NH — White Plum Asanga sangha 'Myoshin Zen' meeting at Nesdijk 20H, Bergen NH, led by Gretha Jikai Myoshin Aerts Roshi. Listed on whiteplum.org/membership.",
    url: "https://www.myoshin-zen.nl/zen/bergen/",
  },
  {
    slug: "zendo-offener-kreis-freiburg",
    names: [{ locale: "en", value: "Zendo Offener Kreis Freiburg / Via Integralis" }],
    lat: 48.0118,
    lng: 7.8060,
    region: "Baden-Württemberg",
    country: "Germany",
    foundedYear: 2006,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zendo Offener Kreis Freiburg — White Plum Asanga zendō at Schlippehof 8, 79110 Freiburg im Breisgau, led by Dr. Gabriele Geiger-Stappel (White Plum) and Bernhard Stappel; affiliated with Zen Zentrum Offener Kreis Luzern (Anna Gamma Roshi) within the Two Wings / Via Integralis project (Zen and Christian mysticism).",
    url: "https://www.viaintegralis-freiburg.de/",
  },
  {
    slug: "buddhaweg-sangha-solingen",
    names: [
      { locale: "en", value: "BuddhaWeg-Sangha Zen-Zentrum Solingen e.V." },
    ],
    lat: 51.1745,
    lng: 7.0853,
    region: "Nordrhein-Westfalen",
    country: "Germany",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "BuddhaWeg-Sangha Zen-Zentrum Solingen e.V. at Grünewalder Str. 68, 42657 Solingen — White Plum Asanga sangha led by Zen-Meister Heinz-Jürgen Metzger. (Distinct from the AZI/Deshimaru-line Zen-Zentrum Solingen at zen-solingen.de.)",
    url: "https://www.buddhaweg.de/",
  },
  {
    slug: "zen-zentrum-offener-kreis-luzern",
    names: [{ locale: "en", value: "Zen Zentrum Offener Kreis Luzern" }],
    lat: 47.0413,
    lng: 8.3193,
    region: "Lucerne",
    country: "Switzerland",
    foundedYear: 2006,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zen Zentrum Offener Kreis Luzern — White Plum Asanga interreligious meditation center founded 2006 at Bürgenstrasse 36, 6005 Luzern, led by Anna Myōan Gamma Roshi (Katharina-Werk). Sister centre to Zendo Offener Kreis Freiburg (DE).",
    url: "https://www.zenzentrum-offenerkreis.ch/",
  },
  {
    slug: "york-zen-group-wgzs",
    names: [{ locale: "en", value: "York Zen Group (Wild Goose Zen Sangha satellite)" }],
    lat: 53.9613,
    lng: -1.0807,
    region: "England",
    country: "UK",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "York Zen Group (WGZS — Wild Goose Zen Sangha satellite) — White Plum Asanga group in York, led by Rev. Christopher Ryushin Collingwood Roshi (Canon Chancellor of York Minster; transmission via Patrick Kundo Eastman → Robert Jinsen Kennedy → Glassman/Maezumi). Distinct from Anzan Hoshin's White Wind Zen Sangha (Ottawa).",
    url: "https://www.yorkzengroupwgzs.org/",
  },
  {
    slug: "zendo-maos-vazias",
    names: [
      { locale: "en", value: "Zendo Mãos Vazias" },
      { locale: "pt", value: "Zendo Mãos Vazias" },
    ],
    lat: -22.8186,
    lng: -47.0686,
    region: "São Paulo",
    country: "Brazil",
    foundedYear: 2016,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_WHITEPLUM,
    sourceExcerpt:
      "Zendo Mãos Vazias — Sōtō Zen sangha in Barão Geraldo, Campinas (São Paulo state), Brazil, organized 2016 under Monja Tchoren (ordained at Zen Center of Los Angeles, Maezumi lineage). One of two Brazilian White Plum members on whiteplum.org/membership.",
    url: "https://zenbudismocampinas.wordpress.com/",
  },

  // ─── Diamond Sangha (Aitken / Sanbo Zen lineage) — international ────
  {
    slug: "koko-an-zendo",
    names: [{ locale: "en", value: "Koko An Zendo" }],
    lat: 21.3099,
    lng: -157.8174,
    region: "Hawaii",
    country: "USA",
    foundedYear: 1959,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Koko An Zendo — the original Diamond Sangha zendō in Mānoa Valley, Honolulu, established 1959 by Robert Aitken Roshi and Anne Aitken; remains an active sitting space alongside Palolo Zen Center.",
    url: "https://diamondsangha.org/",
  },
  {
    slug: "rocks-and-clouds-zendo",
    names: [{ locale: "en", value: "Rocks and Clouds Zendō" }],
    lat: 38.3919,
    lng: -122.8244,
    region: "California",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Rocks and Clouds Zendō at 618 South Main Street, Sebastopol, California — Diamond Sangha / Pacific Zen lineage zendō led by Roshi Daniel Terragno (Aitken Dharma heir).",
    url: "https://rocksandcloudszendo.org/",
  },
  {
    slug: "turtle-mountain-zendo",
    names: [{ locale: "en", value: "Turtle Mountain Zendo" }],
    lat: 35.3036,
    lng: -106.4275,
    region: "New Mexico",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Turtle Mountain Zendo in Placitas, New Mexico — Diamond Sangha sitting group at the foot of the Sandia Mountains, listed in the network's centers directory.",
    url: "https://diamondsangha.org/",
  },
  {
    slug: "zen-viento-del-sur",
    names: [{ locale: "en", value: "Zen Viento del Sur" }],
    lat: -34.5760,
    lng: -58.4810,
    region: "Buenos Aires",
    country: "Argentina",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Zen Viento del Sur in Villa Urquiza, Buenos Aires — Diamond Sangha (Sangha Diamante) community led with Roshi Daniel Terragno; daily Zoom zazen, weekly Sunday in-person sittings, and Spanish translations of Aitken Roshi's writings.",
    url: "http://www.zen-vientodelsur.com.ar/",
  },
  {
    slug: "zen-montanas-y-mar",
    names: [{ locale: "en", value: "Zen Montañas y Mar" }],
    lat: -33.4489,
    lng: -70.6693,
    region: "Santiago Metropolitan Region",
    country: "Chile",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_DIAMOND_SANGHA,
    sourceExcerpt:
      "Zen Montañas y Mar in Santiago, Chile — Diamond Sangha lineage sangha guided by Roshi Daniel Terragno; offers regular zazen and seasonal sesshins.",
    url: "http://www.zenmontanasymar.org/",
  },

  // ─── Chozen-ji (Omori Sogen Rinzai) ──────────────────────────────────
  {
    slug: "daihonzan-chozen-ji",
    names: [
      { locale: "en", value: "Daihonzan Chozen-ji" },
      { locale: "ja", value: "大本山樹禪寺" },
    ],
    lat: 21.3638,
    lng: -157.8433,
    region: "Hawaii",
    country: "USA",
    foundedYear: 1972,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_CHOZEN_JI,
    sourceExcerpt:
      "Daihonzan Chozen-ji at 3565 Kalihi Street, Honolulu — Rinzai monastery founded 1972 by Omori Sogen Roshi and Tanouye Tenshin Roshi; relocated to its Kalihi Valley site in 1976 and formally designated a Daihonzan in 1979. Integrates zazen, martial arts, and the fine arts.",
    url: "https://chozen-ji.org/",
  },
  {
    slug: "daiyuzenji",
    names: [
      { locale: "en", value: "Sokeizan Daiyuzenji" },
      { locale: "ja", value: "曹溪山大雄禪寺" },
    ],
    lat: 41.9501,
    lng: -87.6748,
    region: "Illinois",
    country: "USA",
    foundedYear: 1982,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_CHOZEN_JI,
    sourceExcerpt:
      "Sokeizan Daiyuzenji at 3717 N. Ravenswood Avenue, Chicago — Rinzai temple established 1982 as the Illinois betsuin of Chozen-ji under Fumio Toyoda Roshi; designated an autonomous temple by Hosokawa Roshi in 2005.",
    url: "https://daiyuzenji.org/",
  },

  // ─── Zen Studies Society (Eido Shimano / Soen Nakagawa Rinzai) ───────
  {
    slug: "dai-bosatsu-zendo-kongo-ji",
    names: [
      { locale: "en", value: "Dai Bosatsu Zendo Kongo-ji" },
      { locale: "ja", value: "大菩薩禪堂金剛寺" },
    ],
    lat: 42.0280,
    lng: -74.6440,
    region: "New York",
    country: "USA",
    foundedYear: 1976,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_ZEN_STUDIES_SOCIETY,
    sourceExcerpt:
      "Dai Bosatsu Zendo Kongo-ji at 223 Beecher Lake Road, Livingston Manor, NY — Rinzai monastery opened 4 July 1976 by Eido Shimano Roshi and the Zen Studies Society; ~1,400 acres in the Catskills, the principal residential training centre for the Hakuin / Soen Nakagawa line in the United States.",
    url: "https://zenstudies.org/",
  },
  {
    slug: "new-york-zendo-shobo-ji",
    names: [
      { locale: "en", value: "New York Zendo Shōbō-ji" },
      { locale: "ja", value: "正法寺" },
    ],
    lat: 40.7672,
    lng: -73.9614,
    region: "New York",
    country: "USA",
    foundedYear: 1968,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_ZEN_STUDIES_SOCIETY,
    sourceExcerpt:
      "New York Zendo Shōbō-ji at 223 East 67th Street, Manhattan — opened 15 September 1968 by Eido Shimano Roshi as the Zen Studies Society's New York City practice center; the urban counterpart to Dai Bosatsu Zendo.",
    url: "https://zenstudies.org/",
  },

  // ─── Fo Guang Shan global network (Hsing Yun / Humanistic Buddhism) ───
  // Flagship branch temples and IBPS regional chapters. Coordinates from
  // Wikipedia infoboxes for the flagships; from each chapter's own
  // contact page for the IBPS centres. The HQ Fo Guang Shan Monastery
  // (Kaohsiung) is in EUROPE_TEMPLE_SEEDS already.
  {
    slug: "hsi-lai-temple",
    names: [
      { locale: "en", value: "Hsi Lai Temple" },
      { locale: "zh", value: "佛光山西來寺" },
    ],
    lat: 33.9757,
    lng: -117.9679,
    region: "California",
    country: "USA",
    foundedYear: 1988,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Hsi Lai Temple — Fo Guang Shan's North American headquarters at 3456 South Glenmark Drive, Hacienda Heights; construction completed 1988. One of the largest Buddhist temples in the Western Hemisphere.",
    url: "https://www.hsilai.org/",
  },
  {
    slug: "nan-hua-temple",
    names: [
      { locale: "en", value: "Nan Hua Temple" },
      { locale: "zh", value: "佛光山南華寺" },
    ],
    lat: -25.8247,
    lng: 28.7331,
    region: "Gauteng",
    country: "South Africa",
    foundedYear: 1992,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Nan Hua Temple — Fo Guang Shan's African headquarters and seminary in Bronkhorstspruit; land donated March 1992, construction began October 1992. Largest Buddhist temple and seminary in Africa.",
    url: "https://www.nanhua.co.za/",
  },
  {
    slug: "nan-tien-temple",
    names: [
      { locale: "en", value: "Nan Tien Temple" },
      { locale: "zh", value: "佛光山南天寺" },
    ],
    lat: -34.4667,
    lng: 150.8486,
    region: "New South Wales",
    country: "Australia",
    foundedYear: 1995,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Nan Tien Temple — Fo Guang Shan's Southern Hemisphere flagship in Berkeley, NSW (~90 km south of Sydney); ground broken 1992 and completed 1995. Name means 'Southern Heaven Temple'.",
    url: "https://www.nantien.org.au/en/",
  },
  {
    slug: "chung-tian-temple",
    names: [
      { locale: "en", value: "Chung Tian Temple" },
      { locale: "zh", value: "中天寺" },
    ],
    lat: -27.6033,
    lng: 153.1512,
    region: "Queensland",
    country: "Australia",
    foundedYear: 1993,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Chung Tian Temple — Fo Guang Shan branch at 1034 Underwood Road, Priestdale (Brisbane), Queensland; construction began January 1991 and the temple opened June 1993.",
    url: "http://www.chungtian.org.au/",
  },
  {
    slug: "he-hua-temple",
    names: [
      { locale: "en", value: "He Hua Temple" },
      { locale: "nl", value: "He Hua Tempel" },
      { locale: "zh", value: "佛光山荷華寺" },
    ],
    lat: 52.3738,
    lng: 4.9001,
    region: "North Holland",
    country: "Netherlands",
    foundedYear: 2000,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "He Hua Temple — Fo Guang Shan's Amsterdam temple at Zeedijk 106–118 in Chinatown; officially completed September 2000. Largest Buddhist temple in Europe in traditional Chinese palace style.",
    url: "https://www.ibps.nl/",
  },
  {
    slug: "chung-mei-temple",
    names: [
      { locale: "en", value: "Chung Mei Temple" },
      { locale: "zh", value: "佛光山中美寺" },
    ],
    lat: 29.6300,
    lng: -95.6087,
    region: "Texas",
    country: "USA",
    foundedYear: 2001,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Chung Mei Temple Houston (中美寺) at 12550 Jebbia Lane, Stafford, TX 77477; established 2001 as the Houston-area Fo Guang Shan branch with main shrine, Water Drop Teahouse, and memorial garden.",
    url: "https://www.houstonbuddhism.org/",
  },
  {
    slug: "san-bao-temple",
    names: [
      { locale: "en", value: "San Bao Temple" },
      { locale: "zh", value: "佛光山三寶寺" },
    ],
    lat: 37.7902,
    lng: -122.4226,
    region: "California",
    country: "USA",
    foundedYear: 1989,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan San Bao Temple, run by the American Buddhist Cultural Society at 1750 Van Ness Avenue, San Francisco; on this site since 1989. Currently rebuilding from interim premises at 38 Bryant Street.",
    url: "https://sanbaotemple.org/",
  },
  {
    slug: "ibps-fremont",
    names: [
      { locale: "en", value: "IBPS Fremont (American Buddhist Cultural Society)" },
      { locale: "zh", value: "佛立門文教中心" },
    ],
    lat: 37.5851,
    lng: -122.0497,
    region: "California",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "American Buddhist Cultural Society (IBPS Fremont) at 3850 Decoto Road, Fremont, CA 94555; East Bay branch of Fo Guang Shan offering Dharma services, classes, and BLIA chapter activities.",
    url: "http://www.ibpsfremont.org/",
  },
  {
    slug: "ibps-new-york",
    names: [
      { locale: "en", value: "Fo Guang Shan IBPS New York" },
      { locale: "zh", value: "佛光山紐約道場" },
    ],
    lat: 40.7570,
    lng: -73.8266,
    region: "New York",
    country: "USA",
    foundedYear: 1991,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Buddhist Temple of New York at 154-37 Barclay Avenue, Flushing, NY 11355; established 1991, five-story building inaugurated October 1993.",
    url: "http://fgsny.org/",
  },
  {
    slug: "ibps-chicago",
    names: [
      { locale: "en", value: "Fo Guang Shan Chicago Buddhist Temple (IBPS Chicago)" },
      { locale: "zh", value: "芝加哥佛光山" },
    ],
    lat: 41.7298,
    lng: -88.1024,
    region: "Illinois",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Chicago Buddhist Temple (IBPS) at 9S043 Route 53, Naperville, IL 60565; Midwest US branch of Fo Guang Shan and host of the BLIA Chicago Chapter.",
    url: "http://www.ibpschicago.org/",
  },
  {
    slug: "ibps-dallas",
    names: [{ locale: "en", value: "IBPS Dallas" }],
    lat: 32.9596,
    lng: -96.7140,
    region: "Texas",
    country: "USA",
    foundedYear: 1994,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "IBPS Dallas at 1111 International Parkway, Richardson, TX 75081; BLIA Dallas chapter established 1992, building purchased 1993, inauguration ceremony 11 September 1994.",
    url: "https://www.dallasibps.org/",
  },
  {
    slug: "ibps-austin",
    names: [
      { locale: "en", value: "IBPS Austin (Xiang Yun Temple)" },
      { locale: "zh", value: "佛光山香雲寺" },
    ],
    lat: 30.3651,
    lng: -97.7913,
    region: "Texas",
    country: "USA",
    foundedYear: 2000,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Xiang Yun Temple (IBPS Austin) at 6720 N Capital of Texas Highway, Austin, TX 78731; opened January 2000.",
    url: "https://www.ibps-austin.org/",
  },
  {
    slug: "ibps-vancouver",
    names: [
      { locale: "en", value: "Fo Guang Shan Vancouver (IBPS Vancouver)" },
      { locale: "zh", value: "溫哥華佛光山" },
    ],
    lat: 49.1864,
    lng: -123.1265,
    region: "British Columbia",
    country: "Canada",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Vancouver Foguangshan (溫哥華佛光山) at #6680 - 8181 Cambie Road, Richmond, BC V6X 3X9; the Fo Guang Shan branch temple serving the Vancouver area.",
    url: "https://www.vanibps.org/",
  },
  {
    slug: "fgs-toronto",
    names: [
      { locale: "en", value: "Fo Guang Shan Temple of Toronto" },
      { locale: "zh", value: "多倫多佛光山" },
    ],
    lat: 43.5687,
    lng: -79.7359,
    region: "Ontario",
    country: "Canada",
    foundedYear: 1997,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Fo Guang Shan Temple of Toronto at 6525 Millcreek Drive, Mississauga, ON L5N 7K6; planning began 1991, land purchased 1992, 50,000 sq ft temple completed 1997.",
    url: "https://www.fgs.ca/",
  },
  {
    slug: "ibps-montreal",
    names: [
      { locale: "en", value: "IBPS Montreal (Hua Yan Temple)" },
      { locale: "zh", value: "佛光山滿地可華嚴寺" },
    ],
    lat: 45.5712,
    lng: -73.5849,
    region: "Quebec",
    country: "Canada",
    foundedYear: 1997,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "International Buddhist Progress Society of Montreal (滿地可華嚴寺) at 3831 Rue Jean-Talon E., Montreal, QC; founded 1997, relocated 2002.",
    url: "https://www.ibpsmtl.org/",
  },
  {
    slug: "ibps-london",
    names: [
      { locale: "en", value: "London Fo Guang Shan Temple" },
      { locale: "zh", value: "倫敦佛光山" },
    ],
    lat: 51.5180,
    lng: -0.1396,
    region: "England",
    country: "UK",
    foundedYear: 1992,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "London Fo Guang Shan Temple at 84 Margaret Street, London W1W 8TD; established 1992 in a former Butterfield-designed Church House (1868–70). One of two UK branches of Fo Guang Shan.",
    url: "https://www.londonfgs.org.uk/",
  },
  {
    slug: "ibps-manchester",
    names: [
      { locale: "en", value: "Manchester Fo Guang Shan Buddhist Temple" },
      { locale: "zh", value: "曼城佛光山" },
    ],
    lat: 53.4631,
    lng: -2.2710,
    region: "England",
    country: "UK",
    foundedYear: 1993,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Manchester Fo Guang Shan Buddhist Temple at 540 Stretford Road, Manchester M16 9AF; established 1993 as the second UK branch of Fo Guang Shan, relocated to Trafford Park in 1996.",
    url: "https://manchesterfgs.org.uk/",
  },
  {
    slug: "fgs-guam",
    names: [{ locale: "en", value: "Fo Guang Shan Guam" }],
    lat: 13.4730,
    lng: 144.7920,
    region: "Guam",
    country: "USA",
    foundedYear: 1999,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Buddhist Temple at 158 Boman Street, Barrigada, Guam; Guam Buddhism Society established 1986, temple constructed 1996–1998, grand opening 3 April 1999. The only traditional Mahayana Buddhist temple on Guam.",
    url: "https://guamdharma.com/",
  },
  {
    slug: "ibcv-melbourne",
    names: [
      { locale: "en", value: "Fo Guang Shan Melbourne (International Buddhist College of Victoria)" },
      { locale: "zh", value: "墨爾本佛光山" },
    ],
    lat: -37.8136,
    lng: 144.8716,
    region: "Victoria",
    country: "Australia",
    foundedYear: 1992,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan Melbourne / International Buddhist College of Victoria at 89 Somerville Road, Yarraville VIC 3013; established 1992 as the Melbourne branch of Fo Guang Shan.",
    url: "https://www.fgsmelbourne.org.au/",
  },
  {
    slug: "fgs-new-zealand",
    names: [
      { locale: "en", value: "Fo Guang Shan New Zealand" },
      { locale: "zh", value: "紐西蘭佛光山" },
    ],
    lat: -36.9676,
    lng: 174.9094,
    region: "Auckland",
    country: "New Zealand",
    foundedYear: 2007,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_WIKIPEDIA,
    sourceExcerpt:
      "Fo Guang Shan Buddhist Temple, Auckland at 16 Stancombe Road, Flat Bush, Manukau 2016; opened late 2007 after seven years of construction at NZ$20 million. Largest Buddhist temple in New Zealand.",
    url: "https://fgs.org.nz/",
  },

  // ─── Boundless Way Zen — additional affiliates (2026-05 ingest) ──────
  // The Worcester temple (Mugendō-ji), Northampton sangha and Copenhagen
  // satellite are already in EUROPE_TEMPLE_SEEDS / SEED_TEMPLES.
  {
    slug: "boundless-way-pittsburgh",
    names: [{ locale: "en", value: "Boundless Way Zen Pittsburgh" }],
    lat: 40.4406,
    lng: -79.9959,
    region: "Pennsylvania",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_BOUNDLESS_WAY,
    sourceExcerpt:
      "Boundless Way Zen Pittsburgh — affiliate group of the Boundless Way Zen Temple (Worcester, MA), James Ford and Melissa Blacker's hybrid Sōtō / Linji lineage; meets in Pittsburgh, PA.",
    url: "https://boundlessway.org/",
  },
  {
    slug: "snow-mountain-zen",
    names: [{ locale: "en", value: "Snow Mountain Zen" }],
    lat: 42.8651,
    lng: -72.8717,
    region: "Vermont",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_BOUNDLESS_WAY,
    sourceExcerpt:
      "Snow Mountain Zen — Boundless Way affiliate sangha in Wilmington, Vermont, in the southern Green Mountains.",
    url: "https://snowmountainzen.org/",
  },

  // ─── Ordinary Mind Zen School — additional affiliates ────────────────
  // Bay Zen, Prairie Zen, Santa Rosa, OM Brisbane and OM Melbourne are
  // already seeded in EUROPE_TEMPLE_SEEDS.
  {
    slug: "zen-center-of-san-diego",
    names: [{ locale: "en", value: "Zen Center of San Diego" }],
    lat: 32.7503,
    lng: -117.1373,
    region: "California",
    country: "USA",
    foundedYear: 1983,
    foundedPrecision: "exact",
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ORDINARY_MIND,
    sourceExcerpt:
      "Zen Center of San Diego — founded 1983 by Charlotte Joko Beck (whose teaching defined the Ordinary Mind Zen School); now led by Ezra Bayda and Elizabeth Hamilton in the Mission Hills area.",
    url: "https://zencentersandiego.org/",
  },
  {
    slug: "ordinary-mind-zendo-nyc",
    names: [{ locale: "en", value: "Ordinary Mind Zendo" }],
    lat: 40.7484,
    lng: -73.9857,
    region: "New York",
    country: "USA",
    foundedYear: 1996,
    foundedPrecision: "circa",
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ORDINARY_MIND,
    sourceExcerpt:
      "Ordinary Mind Zendo — Manhattan sangha led by Barry Magid (a Joko Beck dharma heir); psychoanalytically informed Ordinary Mind practice in midtown.",
    url: "https://ordinarymind.com/",
  },
  {
    slug: "ordinary-mind-zen-sydney",
    names: [{ locale: "en", value: "Ordinary Mind Zen Sydney" }],
    lat: -33.8688,
    lng: 151.2093,
    region: "New South Wales",
    country: "Australia",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ORDINARY_MIND,
    sourceExcerpt:
      "Ordinary Mind Zen Sydney — Sydney sangha led by Geoff Dawson (Joko Beck heir).",
    url: "https://zensydney.com/",
  },
  {
    slug: "tavallinen-mieli-zendo",
    names: [{ locale: "en", value: "Tavallinen Mieli Zendo" }],
    lat: 60.1699,
    lng: 24.9384,
    region: "Helsinki",
    country: "Finland",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ORDINARY_MIND,
    sourceExcerpt:
      "Tavallinen Mieli Zendo (Ordinary Mind Zendo Helsinki) — Finnish Ordinary Mind sangha led by Karen Terzano; listed on the Ordinary Mind Zen School EU roster at ordinarymind.eu.",
    url: "https://ordinarymind.eu/",
  },

  // ─── Zen Peacemakers — affiliated sanghas (2026-05 ingest) ───────────
  {
    slug: "greyston-foundation",
    names: [{ locale: "en", value: "Greyston Foundation" }],
    lat: 40.9312,
    lng: -73.8987,
    region: "New York",
    country: "USA",
    foundedYear: 1982,
    foundedPrecision: "exact",
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ZEN_PEACEMAKERS,
    sourceExcerpt:
      "Greyston Foundation — Yonkers-based social enterprise founded 1982 by Bernie Glassman as the practical embodiment of Zen Peacemaker engaged Buddhism (Greyston Bakery, affordable housing, family services).",
    url: "https://www.greyston.org/",
  },
  {
    slug: "sangha-zen-zeist",
    names: [{ locale: "en", value: "Sangha Zen Zeist" }],
    lat: 52.0907,
    lng: 5.2330,
    region: "Utrecht",
    country: "Netherlands",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ZEN_PEACEMAKERS,
    sourceExcerpt:
      "Sangha Zen Zeist — Dutch Zen Peacemakers affiliate in Zeist, Utrecht province.",
    url: "https://zenzeist.nl/",
  },
  {
    slug: "caminho-de-luz",
    names: [
      { locale: "en", value: "Caminho de Luz" },
      { locale: "pt", value: "Caminho de Luz" },
    ],
    lat: -23.5505,
    lng: -46.6333,
    region: "São Paulo",
    country: "Brazil",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ZEN_PEACEMAKERS,
    sourceExcerpt:
      "Caminho de Luz — Brazilian Zen Peacemakers affiliate in São Paulo; listed on zenpeacemakers.org affiliate roster.",
    url: "https://zenpeacemakers.org/",
  },
  {
    slug: "la-rete-di-indra",
    names: [
      { locale: "en", value: "La Rete di Indra" },
      { locale: "it", value: "La Rete di Indra" },
    ],
    lat: 41.9028,
    lng: 12.4964,
    region: "Lazio",
    country: "Italy",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_ZEN_PEACEMAKERS,
    sourceExcerpt:
      "La Rete di Indra — Italian Zen Peacemakers affiliate in Rome; listed on zenpeacemakers.org affiliate roster.",
    url: "https://zenpeacemakers.org/",
  },

  // ─── Mountains and Rivers Order (Daido Loori) ─ Brooklyn satellite ───
  {
    slug: "zen-center-of-nyc-fire-lotus-temple",
    names: [
      { locale: "en", value: "Zen Center of New York City — Fire Lotus Temple" },
    ],
    lat: 40.6884,
    lng: -73.9810,
    region: "New York",
    country: "USA",
    foundedYear: 2000,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_MRO,
    sourceExcerpt:
      "Zen Center of New York City / Fire Lotus Temple — Brooklyn satellite of the Mountains and Rivers Order (Zen Mountain Monastery), at 500 State Street; led by Geoffrey Shugen Arnold Roshi.",
    url: "https://zcnyc.mro.org/",
  },

  // ─── Dharma Drum Mountain — additional affiliates (2026-05 ingest) ───
  {
    slug: "ddmba-ontario",
    names: [{ locale: "en", value: "Dharma Drum Mountain Ontario" }],
    lat: 43.7995,
    lng: -79.3251,
    region: "Ontario",
    country: "Canada",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_DHARMADRUM,
    sourceExcerpt:
      "Dharma Drum Mountain Buddhist Association Ontario — Toronto-area DDM chapter (Sheng-yen Chan lineage).",
    url: "https://ddmbaontario.org/",
  },
  {
    slug: "dharma-loka-zagreb",
    names: [{ locale: "en", value: "Dharma Loka" }],
    lat: 45.8150,
    lng: 15.9819,
    region: "Zagreb",
    country: "Croatia",
    foundedYear: 1985,
    foundedPrecision: "circa",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_DHARMADRUM,
    sourceExcerpt:
      "Dharma Loka — Croatian Buddhist Society Chan group in Zagreb led by Žarko Andričević, longtime Sheng Yen disciple; the principal Dharma Drum affiliate in the Balkans.",
    url: "https://dharmaloka.org/",
  },
  {
    slug: "budwod",
    names: [{ locale: "en", value: "Budwod (Buddhist Way)" }],
    lat: 52.0833,
    lng: 21.0833,
    region: "Mazowieckie",
    country: "Poland",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_DHARMADRUM,
    sourceExcerpt:
      "Budwod — Polish Chan group at Zalesie Górne (south of Warsaw) led by Paweł Rościszewski, a Sheng Yen lay disciple; Dharma Drum Poland affiliate.",
    url: "https://budwod.com.pl/",
  },
  {
    slug: "chan-bern",
    names: [{ locale: "en", value: "Chan-Bern" }],
    lat: 46.9479,
    lng: 7.4474,
    region: "Bern",
    country: "Switzerland",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_DHARMADRUM,
    sourceExcerpt:
      "Chan-Bern — Swiss Dharma Drum affiliate in Bern led by Hildi Thalmann (Sheng Yen lineage).",
    url: "https://chan-bern.ch/",
  },

  // ─── Sanbō Zen — additional centres (2026-05 ingest) ─────────────────
  {
    slug: "pathway-zen",
    names: [{ locale: "en", value: "Pathway Zen" }],
    lat: -27.4698,
    lng: 153.0251,
    region: "Queensland",
    country: "Australia",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Pathway Zen — Sanbō Zen group in Brisbane led by Arno Hess Sensei; sister sangha to Mountain Moon Zen Society.",
    url: "https://pathwayzen.org.au/",
  },
  {
    slug: "meditationshaus-dietfurt",
    names: [{ locale: "en", value: "Meditationshaus Dietfurt" }],
    lat: 49.0353,
    lng: 11.5950,
    region: "Bayern",
    country: "Germany",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Meditationshaus St. Franziskus Dietfurt — Franciscan retreat house in Bavaria offering Sanbō Zen sesshins; long-term Christian-Buddhist contemplative meeting point.",
    url: "https://www.meditationshaus-dietfurt.de/",
  },
  {
    slug: "zendo-bielefeld",
    names: [{ locale: "en", value: "Zendo Bielefeld" }],
    lat: 52.0302,
    lng: 8.5325,
    region: "Nordrhein-Westfalen",
    country: "Germany",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Zendo Bielefeld — Sanbō Zen sangha in Bielefeld led by Gilbert Bender.",
    url: "https://zen-bielefeld.de/",
  },
  {
    slug: "zendo-bogenhausen-munich",
    names: [{ locale: "en", value: "Zendo Bogenhausen" }],
    lat: 48.1505,
    lng: 11.6090,
    region: "Bayern",
    country: "Germany",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Zendo Bogenhausen — Munich Sanbō Zen sangha led by Gudrun Alt; listed on sanbo-zen.org.",
    url: "https://sanbo-zen.org/",
  },
  {
    slug: "haus-am-weg-bergisch-gladbach",
    names: [{ locale: "en", value: "Haus am Weg" }],
    lat: 50.9989,
    lng: 7.1242,
    region: "Nordrhein-Westfalen",
    country: "Germany",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Haus am Weg — Sanbō Zen retreat house in Bergisch Gladbach (greater Cologne area) led by Reinhard Busmann.",
    url: "https://haus-am-weg.de/",
  },
  {
    slug: "centre-zen-dana-paramita",
    names: [
      { locale: "en", value: "Centre Zen Dana Paramita" },
      { locale: "ca", value: "Centre Zen Dana Paramita" },
    ],
    lat: 41.3851,
    lng: 2.1734,
    region: "Catalonia",
    country: "Spain",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Centre Zen Dana Paramita — Barcelona Sanbō Zen sangha led by Berta Meneses; listed on zen.cat / sanbo-zen.org.",
    url: "https://zen.cat/",
  },
  {
    slug: "dancing-crane-zen-center",
    names: [{ locale: "en", value: "Dancing Crane Zen Center" }],
    lat: 29.6516,
    lng: -82.3248,
    region: "Florida",
    country: "USA",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Dancing Crane Zen Center — Sanbō Zen sangha in Gainesville, Florida; affiliate of Mountain Cloud Zen Center (Valerie Forstman lineage).",
    url: "https://sanbo-zen.org/",
  },

  // ─── Europe (generated from research artifacts) ───────────────────────
  ...EUROPE_TEMPLE_SEEDS,
];
