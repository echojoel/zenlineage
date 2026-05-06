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

// ─── Catch-all for the long tail of small directory citations ──────────
/** EU Zen places research bundle — generic citation source for entries
 * surfaced by directories not individually registered above. The
 * `sourceExcerpt` of each citation preserves the original source URL so
 * per-entry provenance is auditable. */
export const SRC_EU_ZEN_RESEARCH = "src_eu_zen_research";

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
    url: "https://www.shaolin.org.cn/",
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
    foundedYear: 1985,
    foundedPrecision: "exact",
    schoolSlug: "sanbo-zen",
    status: "active",
    sourceId: SRC_SANBOZEN,
    sourceExcerpt:
      "Mountain Cloud Zen Center in Santa Fe — built 1985 by Philip Kapleau Roshi and his students; Henry Shukman Roshi (Sanbō Zen lineage) is teacher emeritus.",
    url: "https://www.mountaincloud.org/",
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
  // ─── Europe (generated from research artifacts) ───────────────────────
  ...EUROPE_TEMPLE_SEEDS,
];
