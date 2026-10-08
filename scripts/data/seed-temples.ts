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
import type { PracticeDetails } from "../../src/lib/practice-details";

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
  /** Website or listing that helps visitors find current details. Some
   * existing records point to third-party directories or encyclopedias;
   * never label this field as the place's official website without review. */
  url?: string;
  /**
   * What the pin actually means.
   *
   * `"exact"` — this coordinate is the place itself, taken from its own
   * published address, an OSM node for the temple, or a Wikipedia infobox.
   * `"city"` — a town-level centroid standing in for an address we do not
   * have. Several sanghas in one city then share a point, and the pin is
   * only as precise as the town name.
   *
   * The distinction is not cosmetic: a sitting group that meets in a rented
   * hall is not located at the town hall, and a map that says otherwise
   * sends someone to the wrong door. Surfaced in the UI as an "approximate"
   * marker so a centroid is never presented as a temple's location.
   *
   * Defaults to `"exact"` when omitted — hand-curated rows below carry
   * coordinates checked against a named source.
   */
  geoPrecision?: "exact" | "city";
  /** Optional current visitor information. Each field needs a source URL
   * and the date it was checked. Omit unknown details; do not infer them
   * from a school's customs or a place's name. Exported directly from
   * this canonical seed to the practice map, without a DB migration. */
  practiceDetails?: PracticeDetails;
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
/** First-party pages for reviewed European practice places. */
export const SRC_ZEN_MAINZ = "src_zen_mainz";
export const SRC_ZEN_DARMSTADT = "src_zen_darmstadt";
export const SRC_ZEN_RYUMONJI_DOJO = "src_zen_ryumonji_dojo";
export const SRC_ZEN_EINDHOVEN = "src_zen_eindhoven";
export const SRC_ZEN_ROTTERDAM = "src_zen_rotterdam";
export const SRC_MAHA_KARUNA_CHAN = "src_maha_karuna_chan";
export const SRC_ZEN_HEILBRONN = "src_zen_heilbronn";

// ─── UK-specific networks ───────────────────────────────────────────────
/** Western Chan Fellowship — Chan/Zen UK network (Hsu Yun lineage). */
export const SRC_WESTERN_CHAN_FELLOWSHIP = "src_western_chan_fellowship";
/** StoneWater Zen Sangha — UK White Plum lineage (Tenshin Reb Anderson). */
export const SRC_STONEWATER_ZEN = "src_stonewater_zen";
/** International Zen Association UK — AZI's UK affiliate. */
export const SRC_IZAUK = "src_izauk";
/** The Buddhist Society — Hampstead, oldest UK Buddhist body. */
export const SRC_BUDDHIST_SOCIETY_UK = "src_buddhist_society_uk";
/** Providence Zen Center's current practice schedule and contact details. */
export const SRC_PROVIDENCE_ZEN_CENTER = "src_providence_zen_center";
/** Centre Zen de la Falaise Verte's current Rinzai practice and lineage. */
export const SRC_FALAISE_VERTE = "src_falaise_verte";
/** Current visitor and programme pages for three curated Asian institutions. */
export const SRC_SANZU_TIANZHU = "src_sanzu_tianzhu";
export const SRC_TSZ_SHAN = "src_tsz_shan";
export const SRC_FGS_NEW_ZEALAND = "src_fgs_new_zealand";

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

// Direct Europe and East Asia sources added for the 2026 temple refresh.
export const SRC_ZEN_KLOSTER = "src_zen_kloster";
export const SRC_EISENBUCH_FUMONJI = "src_eisenbuch_fumonji";
export const SRC_DAISHIN_ZEN = "src_daishin_zen";
export const SRC_DAISHIN_ZEN_ULM = "src_daishin_zen_ulm";
export const SRC_ZENDO_SAAR = "src_zendo_saar";
export const SRC_ZEN_GEMEINSCHAFT_BERLIN = "src_zen_gemeinschaft_berlin";
export const SRC_ZENVEREINIGUNG_BERLIN = "src_zenvereinigung_berlin";
export const SRC_GENJOAN_HAMBURG = "src_genjoan_hamburg";
export const SRC_ZENDO_KOELN = "src_zendo_koeln";
export const SRC_ZENDO_WUPPERTAL = "src_zendo_wuppertal";
export const SRC_ZENKREIS_KASSEL = "src_zenkreis_kassel";
export const SRC_NEUMUEHLE_SAAR = "src_neumuehle_saar";
export const SRC_ZENDOJO_FREIBURG = "src_zendojo_freiburg";
export const SRC_HANNYA_KAI = "src_hannya_kai";
export const SRC_ZEN_DOJO_OFFENBURG = "src_zen_dojo_offenburg";
export const SRC_SOJIJI_SITE = "src_sojiji_site";
export const SRC_SHOKOKUJI_SITE = "src_shokokuji_site";
export const SRC_TENRYUJI_SITE = "src_tenryuji_site";
export const SRC_TOFUKUJI_SITE = "src_tofukuji_site";
export const SRC_TOKEIJI_SITE = "src_tokeiji_site";
export const SRC_ZUIGANJI_SITE = "src_zuiganji_site";
export const SRC_BAEKDAMSA_TEMPLESTAY = "src_baekdamsa_templestay";
export const SRC_BAEKYANGSA_VISITKOREA = "src_baekyangsa_visitkorea";
export const SRC_BEOMEOSA_SITE = "src_beomeosa_site";
export const SRC_BEOPJUSA_JOGYE = "src_beopjusa_jogye";
export const SRC_JOGYE_ORDER = "src_jogye_order";
export const SRC_NAGASAKI_CITY_ZEN = "src_nagasaki_city_zen";

// Batch 27 primary/institutional evidence for Japan and South Korea review.
export const SRC_DAISHUIN_MYOSHINJI_MAP = "src_daishuin_myoshinji_map";
export const SRC_KINKAKUJI_SHOKOKU = "src_kinkakuji_shokoku";
export const SRC_KODAIJI_OFFICIAL = "src_kodaiji_official";
export const SRC_KOFUKUJI_NAGASAKI_CITY = "src_kofukuji_nagasaki_city";
export const SRC_MANPUKUJI_OFFICIAL = "src_manpukuji_official";
export const SRC_MEIGETSUIN_JNTO = "src_meigetsuin_jnto";
export const SRC_MYOSHINJI_PUBLIC_ZAZEN = "src_myoshinji_public_zazen";
export const SRC_NANZENJI_OFFICIAL = "src_nanzenji_official";
export const SRC_RYOANJI_OFFICIAL = "src_ryoanji_official";
export const SRC_RYUTAKUJI_MISHIMA_CITY = "src_ryutakuji_mishima_city";
export const SRC_SANUN_ZENDO_SANBO = "src_sanun_zendo_sanbo";
export const SRC_SHOFUKUJI_KOBE_OFFICIAL = "src_shofukuji_kobe_official";
export const SRC_SHOFUKUJI_NAGASAKI_CITY = "src_shofukuji_nagasaki_city";
export const SRC_BORIMSA_OFFICIAL = "src_borimsa_official";
export const SRC_KTO_BULYEONGSA = "src_kto_bulyeongsa";
export const SRC_KTO_DAESEUNGSA = "src_kto_daeseungsa";
export const SRC_KTO_GIRIMSA = "src_kto_girimsa";
export const SRC_KTO_GWANCHOKSA = "src_kto_gwanchoksa";
export const SRC_KTO_HEUNGGUKSA = "src_kto_heungguksa";
export const SRC_KTO_HWAGYESA = "src_kto_hwagyesa";
export const SRC_KTO_NAESOSA = "src_kto_naesosa";
export const SRC_DAEGU_PAGYESA = "src_daegu_pagyesa";
export const SRC_SUDOSA_OFFICIAL = "src_sudosa_official";
export const SRC_TAPSA_OFFICIAL = "src_tapsa_official";
export const SRC_KTO_YEONGGUKSA = "src_kto_yeongguksa";
// Korea Tourism Organization destination records used in South Korea batch 23.
export const SRC_KTO_SONGGWANGSA = "src_kto_songgwangsa";
export const SRC_KTO_HAEINSA = "src_kto_haeinsa";
export const SRC_KTO_TONGDOSA = "src_kto_tongdosa";
export const SRC_KTO_WOLJEONGSA = "src_kto_woljeongsa";
export const SRC_KTO_MAGOKSA = "src_kto_magoksa";
export const SRC_KTO_BUSEOKSA = "src_kto_buseoksa";
export const SRC_KTO_DAEHEUNGSA = "src_kto_daeheungsa";
export const SRC_KTO_GOLGULSA = "src_kto_golgulsa";
export const SRC_KTO_BULGUKSA = "src_kto_bulguksa";
export const SRC_KTO_SEONUNSA = "src_kto_seonunsa";
export const SRC_KTO_BONGEUNSA = "src_kto_bongeunsa";
export const SRC_KTO_SILSANGSA = "src_kto_silsangsa";
export const SRC_KTO_SANGWONSA = "src_kto_sangwonsa";
export const SRC_KTO_SEONAMSA = "src_kto_seonamsa";
export const SRC_KTO_JOGYESA = "src_kto_jogyesa";
export const SRC_KTO_SUDEOKSA = "src_kto_sudeoksa";
export const SRC_KTO_DONGHWASA = "src_kto_donghwasa";
export const SRC_KTO_SSANGGYE_SA = "src_kto_ssanggyesa";
export const SRC_KTO_YONGJUSA = "src_kto_yongjusa";
export const SRC_KTO_SINHEUNGSA = "src_kto_sinheungsa";
export const SRC_KTO_JIKJISA = "src_kto_jikjisa";
export const SRC_KTO_EUNHAESA = "src_kto_eunhaesa";
export const SRC_KTO_BULGUKSA_OFFICIAL = "src_kto_bulguksa_official";
export const SRC_KTO_GOUNSA = "src_kto_gounsa";
export const SRC_KTO_GEUMSANSA = "src_kto_geumsansa";
export const SRC_KTO_HWAEOMSA = "src_kto_hwaeomsa";
export const SRC_NYJ_BONGSEONSA = "src_nyj_bongseonsa";
export const SRC_JOGYE_BONGAMSA = "src_jogye_bongamsa";
export const SRC_KTO_BONGWONSA = "src_kto_bongwonsa";
export const SRC_KTO_JEONDEUNGSA = "src_kto_jeondeungsa";

// ─── Catch-all for the long tail of small directory citations ──────────
/** EU Zen places research bundle — generic citation source for entries
 * surfaced by directories not individually registered above. The
 * `sourceExcerpt` of each citation preserves the original source URL so
 * per-entry provenance is auditable. */
export const SRC_EU_ZEN_RESEARCH = "src_eu_zen_research";
export const SRC_ITALY_MONASTEROZEN_DIRECT = "src_italy_monasterozen_direct";
export const SRC_ITALY_PRACTICAZEN = "src_italy_praticazen";
export const SRC_ITALY_ZENDOCCIDENTE = "src_italy_zendoccidente";
export const SRC_SPAIN_NAKAMA = "src_spain_nakama";
export const SRC_SPAIN_SAKURA = "src_spain_sakura";
export const SRC_SPAIN_UNSUI = "src_spain_unsui";
export const SRC_SPAIN_IIZE_CANTABRIA = "src_spain_iize_cantabria";
export const SRC_SPAIN_IIZE_LARIOJA = "src_spain_iize_larioja";
export const SRC_SPAIN_SOTOZEN_CATALUNYA = "src_spain_sotozen_catalunya";
export const SRC_DOJO_ZEN_LLEIDA = "src_dojo_zen_lleida";
export const SRC_AZI_CAEN = "src_azi_caen";
export const SRC_KWANUM_TORUN = "src_kwanum_torun";
export const SRC_KWANUM_GLOGOW = "src_kwanum_glogow";
export const SRC_LEVEN_IN_AANDACHT_SANGHAS = "src_leven_in_aandacht_sanghas";
export const SRC_KOSHOJI_UJI_SITE = "src_koshoji_uji_site";
export const SRC_YOKOJI_SOTO_OFFICE = "src_yokoji_soto_office";
export const SRC_HOKYOJI_ONO_CITY = "src_hokyoji_ono_city";
export const SRC_ZUISHOJI_CULTURAL_AGENCY = "src_zuishoji_cultural_agency";
export const SRC_CHILBULSA_SITE = "src_chilbulsa_site";
export const SRC_SIZU_TEMPLE_SITE = "src_sizu_temple_site";
export const SRC_BAIZHANG_JIANGXI_GOV = "src_baizhang_jiangxi_gov";
export const SRC_CAOSHAN_JIANGXI_BUDDHIST = "src_caoshan_jiangxi_buddhist";
export const SRC_SHODEN_CHILE_SITE = "src_shoden_chile_site";
export const SRC_KANNON_KACIKI_SITE = "src_kannon_kaciki_site";
export const SRC_GREAT_WAVE_SITE = "src_great_wave_site";
export const SRC_EMPTY_BOWL_WHITEPLUM = "src_empty_bowl_whiteplum";
export const SRC_KWANUM_HUNGARY_COMMUNITY = "src_kwanum_hungary_community";
export const SRC_AICHI_NISODO_SOTO = "src_aichi_nisodo_soto";
export const SRC_PV_UK_GROUPS = "src_plum_village_uk_groups";
export const SRC_STILL_WATERS_PV = "src_still_waters_plum_village";
export const SRC_MINDFULNESS_IRELAND = "src_mindfulness_ireland_sanghas";
export const SRC_SOLLAND_ET = "src_sollandet_sangha";
export const SRC_TRIKAYA_ZEN = "src_trikaya_zen";
export const SRC_TWO_STREAMS_ZEN = "src_two_streams_zen";
export const SRC_UPAYA_AFFILIATES = "src_upaya_affiliates";
export const SRC_ZCLA_AFFILIATES = "src_zcla_affiliates";
export const SRC_ZLMC = "src_zen_life_meditation_chicago";
export const SRC_BAILIN_TEMPLE = "src_bailin_temple";
export const SRC_DAMING_TEMPLE = "src_daming_temple";
export const SRC_HANSHAN_JSBA = "src_hanshan_jiangsu_buddhist";
export const SRC_LINGYIN_TEMPLE = "src_lingyin_temple";
export const SRC_LINJI_ZHENGDING = "src_linji_zhengding_government";
export const SRC_LONGTHANH_RELIGIOUS = "src_longthanh_religious_sites";
export const SRC_SWEDISH_PV_GROUPS = "src_swedish_plum_village_groups";
export const SRC_WAKE_UP_LONDON = "src_wake_up_london";
export const SRC_WAKE_UP_LUND = "src_wake_up_lund";
export const SRC_WAKE_UP_NEW_YORK = "src_wake_up_new_york";
export const SRC_OSCAILT_WAKE_UP = "src_oscailt_wake_up_dublin";
export const SRC_WILD_GEESE = "src_wild_geese_sangha";
export const SRC_TULLIO_GIRALDI_CHUDO = "src_tullio_giraldi_chudo";
export const SRC_BUDDHISTDOOR_VENEZUELA = "src_buddhistdoor_venezuela";
export const SRC_SOTOZEN_COLOMBIA_DOKAN = "src_sotozen_colombia_dokan";
export const SRC_ALMOND_BLOSSOM = "src_almond_blossom_sangha";
export const SRC_MINDFULNESS_ISRAEL = "src_mindfulness_israel";
export const SRC_DHARMA_GAIA = "src_dharma_gaia";
export const SRC_LANGMAI_VIETNAM = "src_langmai_vietnam";
export const SRC_TNH_SPAIN = "src_tnh_spain";
export const SRC_JOYFUL_GARDEN_SG = "src_joyful_garden_sg";
export const SRC_PV_HONG_KONG = "src_plum_village_hong_kong";
export const SRC_UPAYA_CENTER = "src_upaya_zen_center";
export const SRC_ZEN_DUST = "src_zen_community_oregon";
export const SRC_YOKOJI_CENTER = "src_yokoji_zen_center";
export const SRC_VILLAGE_ZENDO = "src_village_zendo";
export const SRC_ZEN_ALKMAAR = "src_zen_alkmaar";
export const SRC_YORK_ZEN = "src_york_zen_group";
export const SRC_DOJO_ZEN_BUENOS_AIRES = "src_dojo_zen_buenos_aires";
export const SRC_MAITREYA_CHILE = "src_maitreya_zen_chile";
export const SRC_ZENDO_TUNQUEN = "src_zendo_tunquen";
export const SRC_MONTANA_SILENCIO = "src_montana_silencio";
export const SRC_CASA_ZEN_COSTA_RICA = "src_casa_zen_costa_rica";
export const SRC_CASA_ZEN_MEXICO = "src_casa_zen_mexico";
export const SRC_DHAMMAPADA_MEXICO = "src_dhammapada_mexico";
export const SRC_MAR_DE_JADE = "src_mar_de_jade";
export const SRC_SOTO_ZEN_PERU = "src_soto_zen_peru";
export const SRC_SOTOZEN_PERU_OFFICIAL = "src_sotozen_peru_official";
export const SRC_URUGUAY_CIVIL_MAP = "src_uruguay_civil_society_map";
export const SRC_DHARMALOKA_CROATIA = "src_dharmaloka_croatia";
export const SRC_HAVREDAL_ZENDO = "src_havredal_zendo";
export const SRC_SANNEJI_FINLAND = "src_sanneji_zen_finland";
export const SRC_KAJO_ZENDO = "src_kajo_zendo";
export const SRC_SYDANMIELI_ZEN = "src_sydanmieli_zen";
export const SRC_TAMPERE_ZEN = "src_tampere_zen";
export const SRC_TAN_KAPUJA_ZEN = "src_tan_kapuja_zen";
export const SRC_FUKU_GEN_BERLIN = "src_fuku_gen_berlin";
export const SRC_AUCKLAND_ZEN_CENTER = "src_auckland_zen_center";
export const SRC_DUNEDIN_ZEN = "src_dunedin_zen";
export const SRC_BODHIMOUNT_TEACHER = "src_bodhimount_teacher";
export const SRC_MELBOURNE_ZEN_GROUPS = "src_melbourne_zen_groups";
export const SRC_MILDURA_ZEN = "src_mildura_zen";
export const SRC_ASOKA_ZHEJIANG = "src_asoka_zhejiang_social_sciences";
export const SRC_GAOMIN_JSBA = "src_gaomin_jiangsu_buddhist";
export const SRC_JINGCI_HZBA = "src_jingci_hangzhou_buddhist";
export const SRC_JINSHAN_JSBA = "src_jinshan_jiangsu_buddhist";
export const SRC_PO_LIN_MONASTERY = "src_po_lin_monastery";
export const SRC_PO_LAM_HK_PLANNING = "src_po_lam_hk_planning";
export const SRC_GUANGXIAO_GUANGZHOU = "src_guangxiao_guangzhou_government";
export const SRC_GUOEN_XINXING = "src_guoen_xinxing_government";
export const SRC_JINGJU_JIANGXI = "src_jingju_jiangxi_buddhist";
export const SRC_PUTONG_RUC = "src_putong_ruc_buddhist_studies";
export const SRC_FGS_VANCOUVER = "src_fgs_vancouver";
export const SRC_IBPS_MONTREAL = "src_ibps_montreal";
export const SRC_DDM_ONTARIO = "src_ddm_ontario";
export const SRC_HSI_LAI = "src_hsi_lai_temple";
export const SRC_DOJO_V_PROUDU = "src_dojo_v_proudu";
export const SRC_BOUNDLESS_COPENHAGEN = "src_boundless_way_copenhagen";
export const SRC_ZEN_BUDDHISTISK = "src_zen_buddhistisk_forening";
export const SRC_AKAZIENZENDO = "src_akazienzendo";
export const SRC_BODHIDHARMA_MUNICH = "src_bodhidharma_munich";
export const SRC_BODHIDHARMA_NUREMBERG = "src_bodhidharma_nuremberg";
export const SRC_DHARMA_SANGHA_SCHWARZWALD = "src_dharma_sangha_schwarzwald";
export const SRC_CHOKA_SANGHA = "src_choka_sangha";
export const SRC_ZEN_DUSSELDORF = "src_zen_duesseldorf";
export const SRC_CITRUS_ZEN = "src_citrus_zen";
export const SRC_COLUMBIA_PRIORY = "src_columbia_priory";
export const SRC_LINH_SON_AUSTIN = "src_linh_son_austin";
export const SRC_CHOBOJI = "src_choboji";
export const SRC_HOLLOW_BONES = "src_hollow_bones";
export const SRC_KORINJI = "src_korinji";
export const SRC_LINH_SON_DETROIT = "src_linh_son_detroit";
export const SRC_LINH_SON_DICKINSON = "src_linh_son_dickinson";
export const SRC_ANTAIJI_SITE = "src_antaiji_site";
export const SRC_DAISEN_IN_SITE = "src_daisen_in_site";
export const SRC_EIHEIJI_SITE = "src_eiheiji_site";
export const SRC_ERINJI_SITE = "src_erinji_site";
export const SRC_FUKUSAI_NAGASAKI = "src_fukusai_nagasaki_tourism";
export const SRC_GINKAKUJI_SITE = "src_ginkakuji_site";
export const SRC_JOCHIJI_SITE = "src_jochiji_site";
export const SRC_KENNINJI_SITE = "src_kenninji_site";
export const SRC_HOFUKUJI_OKAYAMA = "src_hofukuji_okayama";
export const SRC_RIEB_VENEZUELA = "src_rieb_venezuela_directory";
export const SRC_DE_BERKELEY = "src_de_berkeley_zen";
export const SRC_VIA_ZEN_COMMUNITIES = "src_via_zen_communities";
export const SRC_ZCLA_CENTER = "src_zcla_center";
export const SRC_BAY_ZEN = "src_bay_zen_center";
export const SRC_BREAD_LOAF_ZEN = "src_bread_loaf_zen";
export const SRC_GREAT_PLAINS_ZEN = "src_great_plains_zen";
export const SRC_GREEN_RING_ZEN = "src_green_ring_zen";
export const SRC_BUPPO_VALENCIA = "src_buppo_valencia";
export const SRC_MIYIN_HUNAN = "src_miyin_hunan_government";
export const SRC_NANTAI_HENGYANG = "src_nantai_hengyang_government";
export const SRC_PUTONG_FODIZI = "src_putong_fodizi";
export const SRC_SANZU_FOJIAOWANG = "src_sanzu_fojiaowang";
export const SRC_SHAOLIN_ZHENGZHOU = "src_shaolin_zhengzhou_government";
export const SRC_WUZU_HUBEI = "src_wuzu_hubei_buddhist";
export const SRC_YONGQUAN_FUZHOU = "src_yongquan_fuzhou_government";
export const SRC_YUNMEN_SHAOGUAN = "src_yunmen_shaoguan_government";
export const SRC_NANHUA_SHAOGUAN = "src_nanhua_shaoguan_government";
export const SRC_TIANTONG_FJDH = "src_tiantong_fjdh";
export const SRC_XUEDOU_ZHEJIANG = "src_xuedou_zhejiang_buddhist";
export const SRC_ZHENRU_OFFICIAL = "src_zhenru_chan_training";
export const SRC_DONGSHAN_JIANGXI_BUDDHIST = "src_dongshan_jiangxi_buddhist";
export const SRC_GREEN_MOUNTAIN_ZEN_SITE = "src_green_mountain_zen_site";
export const SRC_GREEN_RIVER_ZEN_SITE = "src_green_river_zen_site";
export const SRC_GREY_HERON_ZEN_SITE = "src_grey_heron_zen_site";
export const SRC_HEART_CIRCLE_ZEN_SITE = "src_heart_circle_zen_site";
export const SRC_HOKORI_ZEN_SITE = "src_hokori_zen_site";
export const SRC_JOYFUL_MIND_ZENDO_SITE = "src_joyful_mind_zendo_site";
export const SRC_AZI_CHARLEROI = "src_azi_charleroi";
export const SRC_ADELAIDE_ZEN_SITE = "src_adelaide_zen_site";
export const SRC_BLACK_MOUNTAIN_ZEN_SITE = "src_black_mountain_zen_site";
export const SRC_SYDNEY_ZEN_GROUPS = "src_sydney_zen_groups";
export const SRC_CASTLEMAINE_ZEN_SITE = "src_castlemaine_zen_site";
export const SRC_MELBOURNE_ZEN_SITE = "src_melbourne_zen_site";
export const SRC_NAN_TIEN_SITE = "src_nan_tien_site";
export const SRC_CHUNG_TIAN_SITE = "src_chung_tian_site";
export const SRC_STREAM_ENTERING_PV = "src_stream_entering_plum_village";
export const SRC_WAKEUP_SAO_PAULO = "src_wakeup_sao_paulo";
export const SRC_WAVES_AND_WATER = "src_waves_and_water";
export const SRC_MINDFULNESS_VANCOUVER = "src_mindfulness_vancouver";
export const SRC_TRUCLAM_CANADA = "src_truclam_canada";
export const SRC_MINDFULNESS_TORONTO = "src_mindfulness_toronto";
export const SRC_WAKEUP_TORONTO = "src_wakeup_toronto";
export const SRC_WAKEUP_MONTREAL = "src_wakeup_montreal";
export const SRC_MAPLE_VILLAGE = "src_maple_village";
export const SRC_OBC_EDMONTON = "src_obc_edmonton";
export const SRC_KWANUM_GERMANY_GROUPS = "src_kwanum_germany_groups";
export const SRC_SU_BONG_SITE = "src_su_bong_site";
export const SRC_GAK_SU_SITE = "src_gak_su_site";
export const SRC_PUGUANG_CHUNG_TAI = "src_puguang_chung_tai";
export const SRC_DDM_HONG_KONG = "src_ddm_hong_kong";
export const SRC_PALMETTO_ZENDO = "src_palmetto_zendo";
export const SRC_ONE_RIVER_ZEN = "src_one_river_zen";
export const SRC_ONE_HEART_SANGHA = "src_one_heart_sangha";
export const SRC_DAY_STAR_ZENDO = "src_day_star_zendo";
export const SRC_FULL_MOON_ZEN = "src_full_moon_zen";
export const SRC_MOUNTAIN_SPRING_PV = "src_mountain_spring_plum_village";
export const SRC_HEALING_SPRING_PV = "src_healing_spring_plum_village";
export const SRC_MAISON_INSPIR_PV = "src_maison_inspir_plum_village";
export const SRC_AIAB_PV = "src_aiab_plum_village";
export const SRC_THAI_PLUM_VILLAGE = "src_thai_plum_village";
export const SRC_CANBERRA_SOTO_SITE = "src_canberra_soto_site";
export const SRC_DARWIN_ZEN_SITE = "src_darwin_zen_site";
export const SRC_FOREST_WAY_ZEN_SITE = "src_forest_way_zen_site";
export const SRC_KUAN_YIN_AU_SITE = "src_kuan_yin_au_site";
export const SRC_MOUNTAINS_RIVERS_HOBART = "src_mountains_rivers_hobart";
export const SRC_OPEN_WAY_AU = "src_open_way_au";
export const SRC_MORNING_STAR_ZEN = "src_morning_star_zen";
export const SRC_NO_GATE_ZEN = "src_no_gate_zen";
export const SRC_ORDER_CLEAR_MIND = "src_order_clear_mind";
export const SRC_STATEN_ISLAND_ZEN = "src_staten_island_zen";
export const SRC_EMPTY_HAND_ZEN = "src_empty_hand_zen";
export const SRC_PAMSULA_WHITEPLUM = "src_pamsula_whiteplum";
export const SRC_DRAGONS_EYE_ZEN = "src_dragons_eye_zen";
export const SRC_PLUMLINE = "src_plumline_directory";
export const SRC_INTERBEING_DENMARK = "src_interbeing_denmark";
export const SRC_BONZAZEN_SITE = "src_bonzazen_site";
export const SRC_FRENCH_PV_SANGHAS_2025 = "src_french_pv_sanghas_2025";
/** February 2025 French-speaking Plum Village sangha directory. */
export const SRC_FRENCH_PV_SANGHAS_FEB_2025 = "src_french_pv_sanghas_feb_2025";
/** Direct local practice pages for edited France and Germany listings. */
export const SRC_SONARA_TOURS = "src_sonara_tours";
export const SRC_ZEN_SETE = "src_zen_sete";
export const SRC_ZEN_BERNAY = "src_zen_bernay";
export const SRC_KAKUNENJI = "src_kakunenji";
export const SRC_IZID = "src_izid";
export const SRC_ZENDO_AACHEN = "src_zendo_aachen";
export const SRC_ZALTHO = "src_zaltho";
export const SRC_PHAT_HUE = "src_phat_hue";
export const SRC_RYU_UN_ZENDO = "src_ryu_un_zendo";
export const SRC_SONNENHOF = "src_sonnenhof";
export const SRC_DHARMA_SANGHA_GOTTINGEN = "src_dharma_sangha_gottingen";
export const SRC_ZENKREIS_BREMEN = "src_zenkreis_bremen";
export const SRC_WOLKENTOR = "src_wolkentor";
export const SRC_COEUR_SANGHAS_MILLE_PETALES = "src_coeur_sanghas_mille_petales";
export const SRC_MOMENT_PRESENT_ROANNE = "src_moment_present_roanne";
export const SRC_ZEN_SANGHA_BELGIUM = "src_zen_sangha_belgium";
export const SRC_BIG_HEART_COPENHAGEN = "src_big_heart_copenhagen";
export const SRC_DBU_BUDDHAWEG = "src_dbu_buddhaweg_solingen";
export const SRC_OFFENER_KREIS_FREIBURG = "src_offener_kreis_freiburg";
export const SRC_EARTH_SKY_ZEN = "src_earth_sky_zen";
export const SRC_TURNHOUT_BBU = "src_turnhout_bbu";
export const SRC_MONTEVIDEO_KOSEN = "src_montevideo_kosen";
export const SRC_WAKE_UP_DIRECTORY = "src_wake_up_directory";
export const SRC_INTERSEIN_GERMANY = "src_intersein_germany";
export const SRC_RIVIERE_COEUR = "src_riviere_coeur";
export const SRC_HAUTS_FRANCE_PV = "src_hauts_france_pv";
export const SRC_ERMITA_PAJA = "src_ermita_paja";
export const SRC_ORDINARY_MIND_AU = "src_ordinary_mind_au";
export const SRC_ZEN_MELBOURNE = "src_zen_melbourne";
export const SRC_OZZEN = "src_ozzen";
export const SRC_SYDNEY_ZEN = "src_sydney_zen";
export const SRC_TWINING_VINES_AU = "src_twining_vines_au";
export const SRC_ZGWA = "src_zgwa";
export const SRC_BERGZENDO = "src_bergzendo";
export const SRC_STILLE_WIEN = "src_stille_wien";
export const SRC_IZEN = "src_izen";
export const SRC_ZEN_TREE = "src_zen_tree";
export const SRC_ZENPUNT = "src_zenpunt";
export const SRC_KANZEON_POLAND = "src_kanzeon_poland";
export const SRC_BORN_EARTH = "src_born_earth";
export const SRC_SVALORNAS = "src_svalornas";
export const SRC_OFFENER_KREIS_LUZERN = "src_offener_kreis_luzern";
export const SRC_WHOLEHEARTED_ZEN = "src_wholehearted_zen";
export const SRC_WILD_FLOWER_PT = "src_wild_flower_pt";
export const SRC_CONSTELLATION_LAC = "src_constellation_lac";
export const SRC_CEDRES_BLEUS = "src_cedres_bleus";
export const SRC_FLEUR_TAMARIS = "src_fleur_tamaris";
export const SRC_FLEUR_INSTANT = "src_fleur_instant";
export const SRC_FLEURS_PRUNIER = "src_fleurs_prunier";
export const SRC_FLEURS_VACUITE = "src_fleurs_vacuite";
export const SRC_FLEURS_ZEN = "src_fleurs_zen";
export const SRC_ZEN_GRUPPE_LINZ = "src_zen_gruppe_linz";
export const SRC_ZENDO_WIEN_SITE = "src_zendo_wien_site";
export const SRC_ZENGRUPPE_WIEN = "src_zengruppe_wien";
export const SRC_PAGODES_ZEN = "src_pagodes_zen";
export const SRC_SHIKANTAZA_MONS = "src_shikantaza_mons";
export const SRC_DAISEN = "src_daisen";
export const SRC_ZEN_DOGEN_BELGIUM = "src_zen_dogen_belgium";
export const SRC_GYOJI = "src_gyoji";
export const SRC_EISHOJI = "src_eishoji";
export const SRC_GYOSHO_IT = "src_gyosho_it";
export const SRC_TENSHIN_IT = "src_tenshin_it";
export const SRC_ZENSHINJI_IT = "src_zenshinji_it";
export const SRC_ZENTRUM_NL = "src_zentrum_nl";
export const SRC_ZEN_NIJMEGEN = "src_zen_nijmegen";
export const SRC_ZEN_BONN = "src_zen_bonn";
export const SRC_SHOBOGENDO_DE = "src_shobogendo_de";
export const SRC_ZEN_KREIS_HAMBURG = "src_zen_kreis_hamburg";
export const SRC_VIA_ZEN_BR = "src_via_zen_br";
export const SRC_ZENDO_CURITIBA = "src_zendo_curitiba";
export const SRC_ATLANTIC_SOTO = "src_atlantic_soto";
export const SRC_CISTES_SANGHA = "src_cistes_sangha";
export const SRC_JARDIN_INSTANT = "src_jardin_instant";
export const SRC_JOIE_CONSCIENCE = "src_joie_conscience";
export const SRC_EON_ZEN = "src_eon_zen";
export const SRC_FLOWING_RIVER = "src_flowing_river";
export const SRC_GREAT_MOUNTAIN = "src_great_mountain";
export const SRC_GREAT_PLAINS = "src_great_plains";
export const SRC_MORGAN_BAY = "src_morgan_bay";
export const SRC_LOST_COIN = "src_lost_coin";
export const SRC_NEW_RIVER = "src_new_river";
export const SRC_ANGERS_SANGHA = "src_angers_sangha";
export const SRC_CHEMIN_EVEIL = "src_chemin_eveil";
export const SRC_AVATAMSAKA_CA = "src_avatamsaka_ca";
export const SRC_CALGARY_SOTO = "src_calgary_soto";
export const SRC_CLEAR_WAY_CA = "src_clear_way_ca";
export const SRC_FGS_TORONTO = "src_fgs_toronto";
export const SRC_LONDON_ZEN_CA = "src_london_zen_ca";
export const SRC_MONTREAL_ZEN = "src_montreal_zen";
export const SRC_ROCKY_MOUNTAIN_CA = "src_rocky_mountain_ca";
export const SRC_BUSSHINJI_BRAZIL = "src_busshinji_brazil";
export const SRC_CENTRO_ZEN_MEXICO_SZBA = "src_centro_zen_mexico_szba";
export const SRC_ZEN_MONTANAS_Y_MAR = "src_zen_montanas_y_mar";
export const SRC_ZEN_VIENTO_DEL_SUR = "src_zen_viento_del_sur";
export const SRC_TORONTO_ZEN = "src_toronto_zen";
export const SRC_WHITE_WIND = "src_white_wind";
export const SRC_ZEN_BUDDHIST_TORONTO = "src_zen_buddhist_toronto";
export const SRC_ZENWEST = "src_zenwest";
export const SRC_PLUIE_DHARMA = "src_pluie_dharma";
export const SRC_PLUIE_FLEURIT = "src_pluie_fleurit";
export const SRC_ALSACE_RIVIERE = "src_alsace_riviere";
export const SRC_UN_LOTUS_PERPIGNAN = "src_un_lotus_perpignan";
export const SRC_ZENCARE = "src_zencare";
export const SRC_STILL_MIND = "src_still_mind";
export const SRC_OPEN_MIND_ZEN = "src_open_mind_zen";
export const SRC_VILLAGE_ZENDO_AFFILIATES = "src_village_zendo_affiliates";
export const SRC_PRAIRIE_ZEN = "src_prairie_zen";
export const SRC_RMERC = "src_rmerc";
export const SRC_SAGE_TAOS = "src_sage_taos";
export const SRC_SLO_ZEN = "src_slo_zen";
export const SRC_SANTA_ROSA_ZEN = "src_santa_rosa_zen";
export const SRC_SOUTHERN_WV_ZEN = "src_southern_wv_zen";
export const SRC_SWEETWATER_ZEN = "src_sweetwater_zen";

/** Global Zen practice-centre research bundle — fallback citation for the
 * Gemini Deep Research 2026-05 ingest where the row's primary directory
 * already has a registered source above (Diamond Sangha, Kwan Um, etc.) but
 * a few outliers don't fit cleanly. The `sourceExcerpt` preserves the
 * underlying directory URL so per-entry provenance is auditable. */
export const SRC_GLOBAL_ZEN_RESEARCH = "src_global_zen_research";

/** budismo.com — long-running Spanish-language directory of Buddhist
 * centres, organised by country and tradition. The primary listing for
 * much of Latin America, where the sect umbrellas that cover Europe and
 * North America have no equivalent. */
export const SRC_BUDISMO_COM = "src_budismo_com";

/**
 * Every source a temple row may cite.
 *
 * Exported because the popup's fallback link is this list's `url`, not the
 * source id — a temple with no site of its own is only "not a dead end" if
 * the source it cites actually carries a URL. tests/temples-data.test.ts
 * asserts exactly that, which it cannot do without seeing these values.
 */
export const TEMPLE_SOURCES: {
  id: string;
  type: string;
  title: string;
  author: string;
  url: string | null;
  publicationDate: string;
  reliability: string;
}[] = [
    {
      id: SRC_PLUMVILLAGE_ORG,
      type: "website",
      title: "Plum Village — Practice Centers",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centers",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    // SRC_WIKIPEDIA and SRC_WHITEPLUM already exist in the DB — but we still
    // upsert to make this script independently runnable.
    {
      id: SRC_WIKIPEDIA,
      type: "website",
      title: "Wikipedia — temple articles with infobox coordinates",
      author: "Wikipedia contributors",
      url: "https://en.wikipedia.org",
      publicationDate: "2025",
      reliability: "popular",
    },
    {
      id: SRC_WHITEPLUM,
      type: "website",
      title: "White Plum Asanga — Founder and Dharma Heirs",
      author: "White Plum Asanga",
      url: "https://whiteplum.org/founder/",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_EUROPE,
      type: "website",
      title: "Sōtōshū Europe Office — Temples, monasteries and practice centres in Europe",
      author: "Sōtōshū Shūmuchō",
      url: "https://www.sotozen.com/eng/temples/regional_office/europe.html",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_AZI,
      type: "website",
      title: "Association Zen Internationale — Find your practice location",
      author: "Association Zen Internationale",
      url: "https://www.zen-azi.org/en/recherche-lieux-meditation",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_SANBOZEN,
      type: "website",
      title: "Sanbō Zen International — Zen leaders and Zen centers",
      author: "Sanbō Zen International",
      url: "https://sanbo-zen-international.org/en/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ONEDROP,
      type: "website",
      title: "One Drop Zen — Shōdō Harada Rōshi's global Rinzai sangha",
      author: "One Drop Zen / Hokuozan Sōgenji",
      url: "https://onedropzen.net/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM,
      type: "website",
      title: "Kwan Um School of Zen — International zen-centre directory",
      author: "Kwan Um School of Zen",
      url: "https://kwanumzen.org/zen-centers",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_OBC,
      type: "website",
      title: "Order of Buddhist Contemplatives — temples and priories directory",
      author: "Order of Buddhist Contemplatives",
      url: "https://obcon.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_PLUMVILLAGE_MONASTIC,
      type: "website",
      title: "Plum Village — Monastic practice centres directory",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/community/monastic-practice-centres",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SFZC,
      type: "website",
      title: "San Francisco Zen Center (sfzc.org)",
      author: "San Francisco Zen Center",
      url: "https://www.sfzc.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_DIAMOND_SANGHA,
      type: "website",
      title: "Diamond Sangha — Aitken Roshi lineage",
      author: "Honolulu Diamond Sangha",
      url: "https://diamondsangha.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_MRO,
      type: "website",
      title: "Mountains and Rivers Order — Zen Mountain Monastery network",
      author: "Mountains and Rivers Order / John Daido Loori",
      url: "https://zmm.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_RINZAIJI,
      type: "website",
      title: "Rinzai-ji — Joshu Sasaki Roshi network",
      author: "Rinzai-ji Zen Center",
      url: "https://www.rinzaiji.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KOSEN_SANGHA,
      type: "website",
      title: "Kosen Sangha — Dōjō directory (zen-deshimaru.com)",
      author: "Kosen Sangha / Stéphane Kosen Thibaut",
      url: "https://www.zen-deshimaru.com/fr/dojos-zen-de-la-kosen-sangha",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KANSHOJI,
      type: "website",
      title: "Monastère Bouddhiste Zen Kanshoji — Places of practice",
      author: "Kanshoji / Taiun Jean-Pierre Faure",
      url: "https://www.kanshoji.org/places-of-practice/?lang=en",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_ROAD,
      type: "website",
      title: "Zen Road — Roland Yuno Rech dōjō directory",
      author: "Zen Road / Roland Yuno Rech",
      url: "https://zen-road.org/en/dojos/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ABZE,
      type: "website",
      title: "ABZE — Association Bouddhiste Zen d'Europe",
      author: "ABZE",
      url: "https://abzen.eu/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_DBU,
      type: "website",
      title: "Deutsche Buddhistische Union — Zen-Mitgliedsorganisationen",
      author: "Deutsche Buddhistische Union",
      url: "https://buddhismus-deutschland.de/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BUN,
      type: "website",
      title: "Boeddhistische Unie Nederland — Zen-aangesloten centra",
      author: "Boeddhistische Unie Nederland",
      url: "https://boeddhisme.nl/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SBU,
      type: "website",
      title: "Schweizerische Buddhistische Union — Zen-Mitgliedszentren",
      author: "Schweizerische Buddhistische Union",
      url: "https://www.sbu.net/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_OBR,
      type: "website",
      title: "Österreichische Buddhistische Religionsgesellschaft — Zen-Mitglieder",
      author: "Österreichische Buddhistische Religionsgesellschaft",
      url: "https://www.buddhismus-austria.at/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_UBI,
      type: "website",
      title: "Unione Buddhista Italiana — Centri Zen affiliati",
      author: "Unione Buddhista Italiana",
      url: "https://www.unionebuddhistaitaliana.it/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_UBP,
      type: "website",
      title: "União Budista Portuguesa — Centros Zen afiliados",
      author: "União Budista Portuguesa",
      url: "https://uniaobudista.pt/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BOUDDHISME_FRANCE,
      type: "website",
      title: "Bouddhisme-France — Annuaire des centres de pratique",
      author: "Union Bouddhiste de France",
      url: "https://www.bouddhisme-france.org/centres-de-pratique/annuaire-des-membres/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_GUIDE_DE,
      type: "website",
      title: "zen-guide.de — German-language Zen practice-place catalogue",
      author: "zen-guide.de editors",
      url: "https://www.zen-guide.de/",
      publicationDate: "2026",
      reliability: "popular",
    },
    { id: SRC_ZEN_MAINZ, type: "website", title: "Zen-Zentrum Mainz — current practice and contact information", author: "Zen-Zentrum Mainz", url: "https://www.zen-mainz.de/", publicationDate: "2026", reliability: "primary" },
    { id: SRC_ZEN_DARMSTADT, type: "website", title: "Zen in Darmstadt — group identity and AZI affiliation", author: "Zen in Darmstadt", url: "https://zen-darmstadt.de/", publicationDate: "2026", reliability: "primary" },
    { id: SRC_ZEN_RYUMONJI_DOJO, type: "website", title: "Taikosan Ryūmonji — European dojo practice network", author: "Taikosan Ryūmonji", url: "https://meditation-zen.org/de/dojo-essen", publicationDate: "2026", reliability: "authoritative" },
    { id: SRC_ZEN_EINDHOVEN, type: "website", title: "Zen Centrum Eindhoven — contact and venue", author: "Zen Centrum Eindhoven", url: "https://www.zeneindhoven.nl/contact/", publicationDate: "2026", reliability: "primary" },
    { id: SRC_ZEN_ROTTERDAM, type: "website", title: "Zen Centrum Rotterdam — contact and current program", author: "Zen Centrum Rotterdam", url: "https://www.zenrotterdam.nl/contact", publicationDate: "2026", reliability: "primary" },
    { id: SRC_MAHA_KARUNA_CHAN, type: "website", title: "Maha Karuna Ch’an — local Zen group directory", author: "Maha Karuna Ch’an", url: "https://mahakarunachan.nl/mediteren/lokale-zengroepen/", publicationDate: "2026", reliability: "authoritative" },
    { id: SRC_ZEN_HEILBRONN, type: "website", title: "Zen-Meditationszentrum Heilbronn — current official site", author: "Zen-Meditationszentrum Heilbronn", url: "https://zen-heilbronn.app/", publicationDate: "2026", reliability: "primary" },
    {
      id: SRC_WESTERN_CHAN_FELLOWSHIP,
      type: "website",
      title: "Western Chan Fellowship — UK Chan/Zen practice groups",
      author: "Western Chan Fellowship (Hsu Yun lineage)",
      url: "https://westernchanfellowship.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_STONEWATER_ZEN,
      type: "website",
      title: "StoneWater Zen Sangha — UK White Plum centres",
      author: "StoneWater Zen Sangha",
      url: "https://www.stonewaterzen.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_IZAUK,
      type: "website",
      title: "International Zen Association UK — Dōjō directory",
      author: "International Zen Association UK",
      url: "https://izauk.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BUDDHIST_SOCIETY_UK,
      type: "website",
      title: "The Buddhist Society — Zen Group",
      author: "The Buddhist Society (Hampstead)",
      url: "https://thebuddhistsociety.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_FELSENTOR,
      type: "website",
      title: "Felsentor / Houshinji — Sōtō monastery, Stoos",
      author: "Felsentor / Houshinji",
      url: "https://www.felsentor.ch/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_PUREGG,
      type: "website",
      title: "Puregg Zen-Kloster — Austria",
      author: "Puregg Zen-Kloster",
      url: "https://puregg.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_LUZ_SERENA,
      type: "website",
      title: "Luz Serena — Spanish Sōtō monastery (Dokushô Villalba)",
      author: "Comunidad Budista Soto Zen / Dokushô Villalba",
      url: "https://luzserena.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_ES,
      type: "website",
      title: "Comunidad Budista Sōtō Zen España (CBSZ)",
      author: "Comunidad Budista Sōtō Zen España",
      url: "https://sotozen.es/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_KWAN_UM_POLAND,
      type: "website",
      title: "Związek Buddystów Czan Kwan Um w Polsce — zen.pl",
      author: "Kwan Um School of Zen Polska",
      url: "https://zen.pl/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SZBA,
      type: "website",
      title: "Sōtō Zen Buddhist Association — North American teachers and centres",
      author: "Soto Zen Buddhist Association",
      url: "https://szba.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_JP,
      type: "website",
      title: "Sōtōshū Shūmuchō — Senmon-sōdō (specialized training monasteries) directory",
      author: "Sōtōshū Shūmuchō",
      url: "https://www.sotozen-net.or.jp/organization/sodo-list",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_NAVI,
      type: "website",
      title: "Sotozen-Navi — Foreign-zazen-friendly temples directory",
      author: "Sōtōshū Shūmuchō",
      url: "https://sotozen-navi.com/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_RINNOU,
      type: "website",
      title: "Rinzai-Ōbaku Zen — Head temples and training monasteries",
      author: "Joint Council for Japanese Rinzai-Ōbaku Zen",
      url: "https://zen.rinnou.net/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BUDDHANET,
      type: "website",
      title: "BuddhaNet World Buddhist Directory",
      author: "Buddha Dharma Education Association",
      url: "https://www.buddhanet.info/wbd/",
      publicationDate: "2026",
      reliability: "popular",
    },
    {
      id: SRC_GIACNGO_VN,
      type: "website",
      title: "Giác Ngộ — Báo điện tử Phật giáo (Vietnamese Buddhist newspaper)",
      author: "Giáo hội Phật giáo Việt Nam",
      url: "https://giacngo.vn/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_PHATGIAO_VN,
      type: "website",
      title: "Phật giáo Việt Nam — Cổng thông tin của Giáo hội Phật giáo Việt Nam",
      author: "Giáo hội Phật giáo Việt Nam",
      url: "https://phatgiao.org.vn/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_IRIZ_HANAZONO,
      type: "website",
      title:
        "International Research Institute for Zen Buddhism (IRIZ), Hanazono University — Zen Centers database",
      author: "Hanazono University, IRIZ",
      url: "http://iriz.hanazono.ac.jp/zen_centers/",
      publicationDate: "2003",
      reliability: "authoritative",
    },
    {
      id: SRC_SANDO_KAISEN,
      type: "website",
      title:
        "Sando Kaisen Russian sangha — zen-kaisen.ru (Deshimaru-lineage Sōtō dōjō directory)",
      author: "Sando Kaisen / Russian Zen sangha",
      url: "https://zen-kaisen.ru/",
      publicationDate: "2026",
      reliability: "secondary",
    },
    {
      id: SRC_DHARMADRUM,
      type: "website",
      title:
        "Dharma Drum Mountain — DDRC + DDMBA affiliate network (Sheng-yen Chan lineage)",
      author: "Dharma Drum Mountain Buddhist Foundation",
      url: "https://dharmadrumretreat.org/about-us/affiliates/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_MOKUSHO_HOUSE,
      type: "website",
      title:
        "Mokusho Zen House Budapest — Our Story (Étienne Mokushō Zeisler & Eastern European mission)",
      author: "Mokusho Zen House / Yvon Myōken Bec",
      url: "https://www.mokushozen.hu/en/sample-page/our-story/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_EU_ZEN_RESEARCH,
      type: "editorial",
      title: "European Zen places research notes (2026-05-05)",
      author: "zenlineage.org research",
      url: null,
      publicationDate: "2026",
      reliability: "popular",
    },
    {
      id: SRC_ITALY_MONASTEROZEN_DIRECT,
      type: "website",
      title: "Il Cerchio — official centers directory and center pages",
      author: "Il Cerchio / Monastero Zen Ensoji",
      url: "https://monasterozen.it/centri/",
      publicationDate: "",
      reliability: "primary",
    },
    {
      id: SRC_ITALY_PRACTICAZEN,
      type: "website",
      title: "Shōbōgendō Dōjō Zen Sōtō di Novara — official site",
      author: "Shōbōgendō Dōjō Zen Sōtō di Novara ETS / APS",
      url: "https://praticazen.org/it/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_ITALY_ZENDOCCIDENTE,
      type: "website",
      title: "Centro Zen Vicenza — official site",
      author: "Associazione Areté / Centro Zen Vicenza",
      url: "https://www.zendoccidente.org/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_NAKAMA,
      type: "website",
      title: "Dojo Zen Nakama — location and practice information",
      author: "Dojo Zen Nakama Madrid",
      url: "https://dojozenmadrid.wordpress.com/donde-estamos/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_SAKURA,
      type: "website",
      title: "Dojo Zen Sakura — official practice information",
      author: "Dojo Zen Sakura",
      url: "https://dojozensakura.blogspot.com/p/dojo-zen-sakura.html",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_UNSUI,
      type: "website",
      title: "Unsui Zen — official zendo and practice information",
      author: "Unsui Zen",
      url: "https://www.unsuizen.es/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_IIZE_CANTABRIA,
      type: "website",
      title: "Meditación Zen Cantabria — official local practice information",
      author: "Instituto Internacional Zen de España, Cantabria group",
      url: "https://meditacionzencantabria.es/cuando-y-donde-practicar/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_IIZE_LARIOJA,
      type: "website",
      title: "Meditación Zen La Rioja — official local practice information",
      author: "Instituto Internacional Zen de España, La Rioja group",
      url: "https://meditacionzenlarioja.com/cuando-y-donde-practicar/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_SPAIN_SOTOZEN_CATALUNYA,
      type: "website",
      title: "Temple Zen Catalunya — Tenryū-ji official information",
      author: "Associació Soto Zen de Catalunya",
      url: "https://sotozencatalunya.wordpress.com/tenryu-ji-ermita-zen-drac-del-cel/",
      publicationDate: "2026",
      reliability: "primary",
    },
    {
      id: SRC_DOJO_ZEN_LLEIDA,
      type: "website",
      title: "Dojo Zen Lleida — Dojo",
      author: "Associació Cultural Zen de Lleida",
      url: "https://zenlleida.org/dojo/",
      publicationDate: "",
      reliability: "primary",
    },
    {
      id: SRC_AZI_CAEN,
      type: "website",
      title: "Association Zen Internationale — Groupe de Caen",
      author: "Association Zen Internationale",
      url: "https://www.zen-azi.org/fr/node/456",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM_TORUN,
      type: "website",
      title: "Kwan Um School of Zen Europe — Toruń Zen Group",
      author: "Kwan Um School of Zen Europe",
      url: "https://www.kwanumeurope.org/locations/torun-zen-group/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM_GLOGOW,
      type: "website",
      title: "Kwan Um School of Zen Europe — Głogów Zen Group",
      author: "Kwan Um School of Zen Europe",
      url: "https://www.kwanumeurope.org/locations/glogow-zen-group/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_LEVEN_IN_AANDACHT_SANGHAS,
      type: "website",
      title: "Leven in Aandacht — Sangha directory",
      author: "Stichting Leven in Aandacht",
      url: "https://aandacht.net/meditatiegroepen/sangha-vinden2",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KOSHOJI_UJI_SITE,
      type: "website",
      title: "Kōshō-ji, Uji — temple site",
      author: "Kōshō-ji",
      url: "https://www.uji-koushouji.jp/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_YOKOJI_SOTO_OFFICE,
      type: "website",
      title: "Sōtō Zen Ishikawa Office — Yōkō-ji",
      author: "Sōtō Zen Ishikawa Office",
      url: "https://www.sotozen-net.jp/temple/68",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_HOKYOJI_ONO_CITY,
      type: "website",
      title: "Ōno City — Hōkyō-ji",
      author: "Ōno City",
      url: "https://www.city.ono.fukui.jp/kanko/kanko-joho/guide/houkyoji.html",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_ZUISHOJI_CULTURAL_AGENCY,
      type: "website",
      title: "Agency for Cultural Affairs — Zuishō-ji",
      author: "Agency for Cultural Affairs (Japan)",
      url: "https://kunishitei.bunka.go.jp/heritage/detail/102/512",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_CHILBULSA_SITE,
      type: "website",
      title: "Chilbulsa — temple introduction",
      author: "Chilbulsa",
      url: "https://chilbul.or.kr/doc/0102.php",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_SIZU_TEMPLE_SITE,
      type: "website",
      title: "Sizu Temple — history",
      author: "Sizu Temple",
      url: "https://www.hmszs.org/110/2013/03/20130327288.html",
      publicationDate: "2013",
      reliability: "authoritative",
    },
    {
      id: SRC_BAIZHANG_JIANGXI_GOV,
      type: "website",
      title: "Jiangxi People's Congress — Fengxin tourism and Baizhang Temple",
      author: "Fengxin County People's Congress",
      url: "https://www.jxrd.gov.cn/system/2012/11/23/012188560.shtml",
      publicationDate: "2012",
      reliability: "authoritative",
    },
    {
      id: SRC_CAOSHAN_JIANGXI_BUDDHIST,
      type: "website",
      title: "Jiangxi Buddhist Association — Caoshan Baoji Temple",
      author: "Jiangxi Buddhist Association",
      url: "https://www.jxsfjxh.cn/a/1602486239564070914",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_SHODEN_CHILE_SITE,
      type: "website",
      title: "Sho Den Dojo Zen de Santiago — practice locations",
      author: "Sho Den Dojo Zen de Santiago",
      url: "https://www.zenchile.cl/projects-6",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KANNON_KACIKI_SITE,
      type: "website",
      title: "Kannon Polska — Centrum Zen Kąciki",
      author: "Kannon Polska",
      url: "https://www.kannon.pl/centrum-zen-kaciki/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_GREAT_WAVE_SITE,
      type: "website",
      title: "Great Wave Zen Sangha — locations",
      author: "Great Wave Zen Sangha",
      url: "https://greatwave.org/locations/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_EMPTY_BOWL_WHITEPLUM,
      type: "website",
      title: "White Plum Asanga — Empty Bowl Zendo member profile",
      author: "White Plum Asanga",
      url: "https://whiteplum.org/membership-list-mobile/user/460/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM_HUNGARY_COMMUNITY,
      type: "website",
      title: "Kwan Um Hungary — Community",
      author: "Kwan Um Zen Hungary",
      url: "https://www.kvanumzen.hu/en/community-sangha",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_AICHI_NISODO_SOTO,
      type: "website",
      title: "Sōtōshū — Aichi Senmon Nisōdō",
      author: "Sōtōshū",
      url: "https://www.sotozen.com/ita/temples/jp/shoboji.html",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_PV_UK_GROUPS, type: "website", title: "Plum Village UK — local practice groups", author: "Community of Interbeing UK", url: "https://plumvillage.uk/practice-groups/find-a-group/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_STILL_WATERS_PV, type: "website", title: "Still Waters Sangha — Ambleside practice", author: "Still Waters Sangha", url: "https://www.stillwaterspvsangha.co.uk/home", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_MINDFULNESS_IRELAND, type: "website", title: "Mindfulness Ireland — local sanghas", author: "Mindfulness Ireland", url: "https://www.mindfulnessireland.ie/sanghas-local-sanghas-across-ireland/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_SOLLAND_ET, type: "website", title: "Sollandet Sangha — practice group", author: "Sollandet Sangha", url: "https://plumvillage-traditionen.se/sollandet/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_TRIKAYA_ZEN, type: "website", title: "Trikaya Zen Center — practice and lineage", author: "Trikaya Zen Center", url: "https://trikayazencenter.org/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_TWO_STREAMS_ZEN, type: "website", title: "Two Streams Zen — Body-Mind Temple", author: "Two Streams Zen", url: "https://twostreamszen.org/body-mind-temple/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_UPAYA_AFFILIATES, type: "website", title: "Upaya Zen Center — affiliates", author: "Upaya Zen Center", url: "https://www.upaya.org/about/affiliates/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_ZCLA_AFFILIATES, type: "website", title: "Zen Center of Los Angeles — affiliated Zen groups", author: "Zen Center of Los Angeles", url: "https://zcla.org/about/affiliated-zen-groups/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_ZLMC, type: "website", title: "Zen Life & Meditation Center — Sunday practice", author: "Zen Life & Meditation Center", url: "https://www.zlmc.org/sunday-morning-zen-1", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_BAILIN_TEMPLE, type: "website", title: "Bailin Chan Temple — monastery and Life Chan program", author: "Bailin Chan Temple", url: "https://www.bailinsi.net/index.php/home/lxwm/aboutus.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_DAMING_TEMPLE, type: "website", title: "Daming Temple — temple history", author: "Daming Temple", url: "https://www.damingsi.com/about.asp?lbid=54", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_HANSHAN_JSBA, type: "website", title: "Jiangsu Buddhist Association — Hanshan Temple", author: "Jiangsu Buddhist Association", url: "https://jsfj.net/syzs_szhss", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_LINGYIN_TEMPLE, type: "website", title: "Lingyin Temple — history and current activity", author: "Lingyin Temple", url: "https://lingyinsi.org/detail_1073_19641.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_LINJI_ZHENGDING, type: "website", title: "Zhengding County — Linji Temple", author: "Zhengding County Government", url: "https://www.zd.gov.cn/columns/761f6ac4-e450-48fb-a470-10c5ea7c2b3d/202005/07/37b86be9-6734-4bb0-b458-880b3e2289e5.html", publicationDate: "2020", reliability: "authoritative",
    },
    {
      id: SRC_LONGTHANH_RELIGIOUS, type: "document", title: "Long Thành District — religious land and institutions", author: "Long Thành District Government", url: "https://longthanh.dongnai.gov.vn/SiteAssets/Lists/CacTrangGioiThieu/EditForm/Bieu2030_LongThanh.pdf", publicationDate: "2020", reliability: "authoritative",
    },
    {
      id: SRC_SWEDISH_PV_GROUPS, type: "website", title: "Plum Village tradition in Sweden — practice groups", author: "Plum Village Tradition Sweden", url: "https://plumvillage-traditionen.se/groups/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_WAKE_UP_LONDON, type: "website", title: "Wake Up London — young adult mindfulness community", author: "Wake Up London", url: "https://wakeuplondon.org/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_WAKE_UP_LUND, type: "website", title: "Wake Up Lund — events", author: "Wake Up Lund", url: "https://www.wakeup-lund.se/events/sv/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_WAKE_UP_NEW_YORK, type: "website", title: "Wake Up New York — Friday gathering", author: "Wake Up New York", url: "https://wakeupnewyork.org/friday-night-gathering/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_OSCAILT_WAKE_UP, type: "website", title: "Oscailt — Wake Up Dublin", author: "Oscailt Integrative Health Centre", url: "https://oscailt.com/mindfulness-and-self-compassion/wake-up-dublin/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_WILD_GEESE, type: "website", title: "Wild Geese Sangha — regular meetings", author: "Wild Geese Sangha", url: "https://wildgeesezen.org/regular-meetings/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_TULLIO_GIRALDI_CHUDO, type: "website", title: "Tullio Giraldi — Chudo Zen practice in Trieste", author: "Tullio Giraldi", url: "https://www.tulliogiraldi.it/corso-di-mindfulness-basato-sugli-antichi-testi-buddhisti-preparatorio-per-lo-zen/", publicationDate: "2020", reliability: "primary",
    },
    {
      id: SRC_BUDDHISTDOOR_VENEZUELA, type: "website", title: "Buddhistdoor en Español — Buddhist communities in Venezuela", author: "Buddhistdoor Global", url: "https://espanol.buddhistdoor.net/directorio-de-comunidades-budistas-en-venezuela/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_SOTOZEN_COLOMBIA_DOKAN, type: "website", title: "Soto Zen Colombia — Sangha Dōkan Venezuela", author: "Soto Zen Colombia", url: "https://sotozencolombia.org/sangha-dokan-venezuela/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_RIEB_VENEZUELA, type: "website", title: "Red Iberoamericana de Estudio del Budismo — directory", author: "Red Iberoamericana de Estudio del Budismo", url: "https://redestudiobudismo.com/directorio/", publicationDate: "2025", reliability: "authoritative",
    },
    {
      id: SRC_DE_BERKELEY, type: "website", title: "De Berkeley — Zen in Bergen schedule and location", author: "De Berkeley", url: "https://deberkeley.nl/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_VIA_ZEN_COMMUNITIES, type: "website", title: "Via Zen — other Zen Buddhist communities", author: "Via Zen", url: "https://www.viazen.org.br/outras-comunidades-zen-budistas", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_ZCLA_CENTER, type: "website", title: "Zen Center of Los Angeles — mission and temple", author: "Zen Center of Los Angeles", url: "https://zcla.org/about/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_BAY_ZEN, type: "website", title: "Bay Zen Center — current practice", author: "Bay Zen Center", url: "https://www.bayzen.org/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_BREAD_LOAF_ZEN, type: "website", title: "Bread Loaf Mountain Zen Community — community and teacher", author: "Bread Loaf Mountain Zen Community", url: "https://breadloafmountainzen.org/about-blmzc/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_GREAT_PLAINS_ZEN, type: "website", title: "Great Plains Zen Center — sittings and retreats", author: "Great Plains Zen Center", url: "https://greatplainszen.org/half-day-sittings/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_GREEN_RING_ZEN, type: "website", title: "Zen-Zentrum im Grünen Ring — teacher and lineage", author: "Zen-Zentrum im Grünen Ring", url: "https://zen-imgruenenring.ch/ueber-uns", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_BUPPO_VALENCIA, type: "website", title: "Centro Zen Buppo Valencia — practice and lineage", author: "Centro Zen Buppo Valencia", url: "https://www.bupponansen.org/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_MIYIN_HUNAN, type: "website", title: "Hunan culture and tourism authority — Miyin Temple", author: "Hunan Provincial Department of Culture and Tourism", url: "https://whhlyt.hunan.gov.cn/whhlyt/news/sxxw/201909/t20190910_5466705.html", publicationDate: "2019", reliability: "authoritative",
    },
    {
      id: SRC_NANTAI_HENGYANG, type: "website", title: "Hengyang government — Nantai Temple", author: "Hengyang Municipal Government", url: "https://www.hengyang.gov.cn/hyly/hyly/xx/20200111/i56156.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_PUTONG_FODIZI, type: "website", title: "Fodizi Buddhist dictionary — Yangqi Putong Temple", author: "Fodizi", url: "https://m.fodizi.tw/f05/77644.html", publicationDate: "", reliability: "popular",
    },
    {
      id: SRC_SANZU_FOJIAOWANG, type: "website", title: "Fojiaowang — Sanzu Temple history", author: "Fojiaowang", url: "https://fojiaowang.com.cn/plus/view.php?aid=4127", publicationDate: "", reliability: "popular",
    },
    {
      id: SRC_SHAOLIN_ZHENGZHOU, type: "website", title: "Zhengzhou government — Shaolin Temple", author: "Zhengzhou Municipal Government", url: "https://www.zhengzhou.gov.cn/view42204/6498142.jhtml", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_WUZU_HUBEI, type: "website", title: "Hubei Buddhist Association — Wuzu Temple", author: "Hubei Buddhist Association", url: "https://www.hbsfjxh.cn/article.html?id=6964749192627490816", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_YONGQUAN_FUZHOU, type: "website", title: "Fuzhou Guling tourism authority — Yongquan Temple", author: "Fuzhou Guling Tourism Authority", url: "https://gl.fuzhou.gov.cn/zjgl/lyjd/jdjs/gspqgcmyggq/201405/t20140509_892653.htm", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_YUNMEN_SHAOGUAN, type: "website", title: "Shaoguan government — Yunmen Temple", author: "Shaoguan Municipal Government", url: "https://www.sg.gov.cn/sgly/yzsg/msgj/content/post_1962120.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_NANHUA_SHAOGUAN, type: "website", title: "Shaoguan government — Nanhua Chan Temple", author: "Shaoguan Municipal Government", url: "https://www.sg.gov.cn/sgly/yzsg/msgj/content/post_1960276.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_TIANTONG_FJDH, type: "website", title: "Buddhist news archive — Tiantong Temple Chan activity", author: "Fojiao Daohang", url: "https://www.fjdh.cn/bnznews/2016/03/151505346042.html", publicationDate: "2016", reliability: "secondary",
    },
    {
      id: SRC_XUEDOU_ZHEJIANG, type: "website", title: "Zhejiang Buddhist Association — Xuedou Temple", author: "Zhejiang Buddhist Association", url: "https://www.zjfjxh.com/Public/NewsInfo.aspx?id=0171fa3c-40d7-48e1-917d-15ba54d67e43&type=1", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_ZHENRU_OFFICIAL, type: "website", title: "Zhenru Chan Temple — International Chan Training Institute", author: "Zhenru Chan Temple", url: "https://yjsfj.pusa123.com/pusa/cxb/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_DONGSHAN_JIANGXI_BUDDHIST,
      type: "website",
      title: "Jiangxi Buddhist Association — Dongshan Puli Temple",
      author: "Jiangxi Buddhist Association",
      url: "https://www.jxsfjxh.cn/a/1625134274018217986",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_GREEN_MOUNTAIN_ZEN_SITE,
      type: "website",
      title: "Green Mountain Zen — teacher, lineage and schedule",
      author: "Green Mountain Zen",
      url: "https://greenmountainzen.org.nz/the-teacher/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_GREEN_RIVER_ZEN_SITE,
      type: "website",
      title: "Green River Zen Center — practice and lineage",
      author: "Green River Zen Center",
      url: "https://www.greenriverzen.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_GREY_HERON_ZEN_SITE,
      type: "website",
      title: "Grey Heron Zen — Dublin sittings",
      author: "Grey Heron Zen",
      url: "https://greyheronzen.ie/zen-meditation-sittings-dublin/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_HEART_CIRCLE_ZEN_SITE,
      type: "website",
      title: "Heart Circle Zen — practice schedule",
      author: "Heart Circle Zen",
      url: "https://heartcirclezen.org/events-2",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_HOKORI_ZEN_SITE,
      type: "website",
      title: "Hokori Zen Center — practice schedule",
      author: "Hokori Zen Center",
      url: "https://www.hokorizencenter.org/schedule",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_JOYFUL_MIND_ZENDO_SITE,
      type: "website",
      title: "Joyful Mind Zen Community",
      author: "Joyful Mind Zen Community",
      url: "https://www.joyfulmindzendo.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_AZI_CHARLEROI,
      type: "website",
      title: "Association Zen Internationale — Dojo de Charleroi",
      author: "Association Zen Internationale",
      url: "https://www.zen-azi.org/index.php/fr/node/3053",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_ADELAIDE_ZEN_SITE,
      type: "website",
      title: "Adelaide Zen Group — practice, lineage and venues",
      author: "Adelaide Zen Group",
      url: "https://www.azg.org.au/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_BLACK_MOUNTAIN_ZEN_SITE,
      type: "website",
      title: "Black Mountain Zen — practice and lineage",
      author: "Black Mountain Zen Group",
      url: "https://blackmountainzen.com/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_SYDNEY_ZEN_GROUPS,
      type: "website",
      title: "Sydney Zen Centre — Australian Diamond Sangha groups",
      author: "Sydney Zen Centre",
      url: "https://szc.org.au/other-groups/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_CASTLEMAINE_ZEN_SITE,
      type: "website",
      title: "Castlemaine Zen — current practice and events",
      author: "Castlemaine Zen",
      url: "https://castlemainezen.com.au/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_MELBOURNE_ZEN_SITE,
      type: "website",
      title: "Melbourne Zen Group — current practice",
      author: "Melbourne Zen Group",
      url: "https://mzg.org.au/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_NAN_TIEN_SITE,
      type: "website",
      title: "Nan Tien Temple — visitor information",
      author: "Nan Tien Temple",
      url: "https://www.nantien.org.au/en/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_CHUNG_TIAN_SITE,
      type: "website",
      title: "Fo Guang Shan Chung Tian Temple — current temple information",
      author: "Fo Guang Shan Chung Tian Temple",
      url: "https://www.fgschungtian.org.au/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_STREAM_ENTERING_PV,
      type: "website",
      title: "Plum Village — Stream Entering Monastery",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/stream-entering-monastery",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_WAKEUP_SAO_PAULO,
      type: "website",
      title: "Wake Up São Paulo — group information",
      author: "Wake Up São Paulo",
      url: "https://wakeupsaopaulo.webnode.page/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_WAVES_AND_WATER,
      type: "website",
      title: "Waves and Water Sangha — practice calendar",
      author: "Waves and Water Sangha",
      url: "https://wavesandwater.org/site/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_MINDFULNESS_VANCOUVER,
      type: "website",
      title: "Mindfulness Practice Community of Vancouver — practice information",
      author: "Mindfulness Practice Community of Vancouver",
      url: "https://mindfulnessvancouver.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_TRUCLAM_CANADA,
      type: "website",
      title: "Trúc Lâm Monastery — Edmonton and Tây Thiên centres",
      author: "Trúc Lâm Monastery",
      url: "https://www.truclam.ca/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_MINDFULNESS_TORONTO,
      type: "website",
      title: "Mindfulness Practice Community of Toronto — current schedule",
      author: "Mindfulness Practice Community of Toronto",
      url: "https://mindfulnesspracticecommunity.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_WAKEUP_TORONTO,
      type: "website",
      title: "Wake Up Toronto — current practice information",
      author: "Wake Up Toronto",
      url: "https://www.wakeuptoronto.ca/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_WAKEUP_MONTREAL,
      type: "website",
      title: "Wake Up International — Montréal group",
      author: "Wake Up International",
      url: "https://wkup.org/locations/montreal/",
      publicationDate: "2025",
      reliability: "authoritative",
    },
    {
      id: SRC_MAPLE_VILLAGE,
      type: "website",
      title: "Maple Village Meditation Center — practice and location",
      author: "Maple Village Meditation Center",
      url: "https://maplevillagesangha.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_OBC_EDMONTON,
      type: "website",
      title: "Order of Buddhist Contemplatives — Edmonton Meditation Group",
      author: "Order of Buddhist Contemplatives",
      url: "https://obcon.org/edmonton-meditation-group/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_KWANUM_GERMANY_GROUPS,
      type: "website",
      title: "Kwan Um Zen Deutschland — centres and groups",
      author: "Kwan Um Zen Deutschland",
      url: "https://kwanumzen.de/zentren-gruppen/kontakt-zu-den-gruppen-und-zentren/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_SU_BONG_SITE,
      type: "website",
      title: "Su Bong Zen Monastery — introduction",
      author: "Su Bong Zen Monastery",
      url: "https://www.subong.org.hk/en/content/introduction",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_GAK_SU_SITE,
      type: "website",
      title: "Su Bong Zen Monastery — Gak Su Temple",
      author: "Su Bong Zen Monastery",
      url: "https://www.subong.org.hk/en/content/gak-su-temple",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_PUGUANG_CHUNG_TAI,
      type: "website",
      title: "Chung Tai — Puguang Meditation Center",
      author: "Chung Tai Chan Monastery",
      url: "https://www.ctworld.org/108/puguang3/index.htm",
      publicationDate: "",
      reliability: "authoritative",
    },
    // Batch 21 Asia sources: keep branch and pilgrimage evidence separate so
    // generated records cite the page that actually supports each claim.
    { id: "src_chung_tai_puli", type: "website", title: "Chung Tai Chan Monastery — official site", author: "Chung Tai Chan Monastery", url: "https://ctworld.org/english-96/html/", publicationDate: "", reliability: "authoritative" },
    { id: "src_chung_tai_puli_schedule", type: "website", title: "Chung Tai Chan Monastery — schedule", author: "Chung Tai Chan Monastery", url: "https://ctworld.org/english-96/html/07_Schedule.html", publicationDate: "", reliability: "authoritative" },
    { id: "src_ddm_jinshan", type: "website", title: "Dharma Drum Mountain World Center — official site", author: "Dharma Drum Mountain", url: "https://fagushan.ddm.org.tw/", publicationDate: "", reliability: "authoritative" },
    { id: "src_ddm_jinshan_event_2026", type: "website", title: "Dharma Drum Mountain — 2026 retreat event", author: "Dharma Drum Mountain", url: "https://www.ddm.org.tw/xcevent/cont?en=A202600855&xsmsid=0K293423255300198901", publicationDate: "2026", reliability: "authoritative" },
    { id: "src_nung_chan", type: "website", title: "Nung Chan Monastery — official site", author: "Dharma Drum Mountain", url: "https://ncm.ddm.org.tw/default-ncm/", publicationDate: "", reliability: "authoritative" },
    { id: "src_nung_chan_listing", type: "website", title: "Dharma Drum Mountain — Nung Chan listing", author: "Dharma Drum Mountain", url: "https://icd.ddm.org.tw/page01_02.htm", publicationDate: "", reliability: "authoritative" },
    { id: "src_fgs_monastery_tour", type: "website", title: "Fo Guang Shan Monastery — temple tour", author: "Fo Guang Shan Monastery", url: "https://www.fgs.org.tw/en/templetour/Index/8", publicationDate: "", reliability: "authoritative" },
    { id: "src_fgs_transport", type: "website", title: "Fo Guang Shan Monastery — transportation", author: "Fo Guang Shan Monastery", url: "https://www.fgs.org.tw/en/Organizations/Transportation/", publicationDate: "", reliability: "authoritative" },
    { id: "src_taipei_linji_huguo", type: "website", title: "Taipei Travel — Linji Huguo Chan Temple", author: "Taipei City Government", url: "https://travel.taipei/en/attraction/details/2354", publicationDate: "", reliability: "authoritative" },
    { id: "src_taipei_linji_huguo_record", type: "website", title: "Taipei City — Linji Huguo heritage record", author: "Taipei City Government", url: "https://www.travel.taipei/file/2791/", publicationDate: "", reliability: "authoritative" },
    { id: "src_ctc_bangkok", type: "website", title: "Great Buddha Monastery — official site", author: "Chung Tai Chan Monastery Thailand", url: "https://www.ctcmbkk.org/en", publicationDate: "", reliability: "authoritative" },
    { id: "src_ctc_bangkok_classes", type: "website", title: "Great Buddha Monastery — classes", author: "Chung Tai Chan Monastery Thailand", url: "https://www.ctcmbkk.org/en/classes", publicationDate: "", reliability: "authoritative" },
    { id: "src_bao_quoc_hue", type: "website", title: "Huế Buddhist Temple Heritage — Bảo Quốc", author: "Huế Buddhist Temple Heritage", url: "https://huepagoda.com/vi/chua/bao-quoc", publicationDate: "2026", reliability: "secondary" },
    { id: "src_quoc_an_hue", type: "website", title: "Phú Lộc District — Quốc Ân Temple", author: "Phú Lộc District Government", url: "https://phuloc.hue.gov.vn/Du-khach/Thong-tin-du-khach/Thong-tin-can-biet/tb/Chua-Quoc-An-296620", publicationDate: "2025", reliability: "authoritative" },
    { id: "src_giac_lam_hcmc_city", type: "website", title: "Ho Chi Minh City — Giác Lâm heritage listing", author: "Ho Chi Minh City Department of Culture and Sports", url: "https://svhtt.hochiminhcity.gov.vn/tin-chi-tiet/-/chi-tiet/danh-sach-cac-cong-trinh-%C4%91ia-%C4%91iem-%C4%91a-%C4%91uoc-quyet-%C4%91inh-xep-hang-di-tich-tren-%C4%91ia-ban-thanh-pho-ho-chi-minh-%C4%91en-ngay-20-4-2016--20935-1.html", publicationDate: "2016", reliability: "authoritative" },
    { id: "src_giac_lam_hcmc_update", type: "website", title: "Ho Chi Minh City — Giác Lâm cultural report", author: "Ho Chi Minh City Vietnam Fatherland Front Committee", url: "https://ubmttq.hochiminhcity.gov.vn/tin-tuc/chitiet/7349/quan-tan-binh-to-chuc-hanh-trinh-van-hoa-lan-toa-gia-tri-truyen-thong-va-tinh-than-dai-doan-ket", publicationDate: "", reliability: "authoritative" },
    { id: "src_giac_lam_vietnam_tourism", type: "website", title: "Vietnam National Tourism Administration — Giác Lâm Pagoda", author: "Vietnam National Authority of Tourism", url: "https://csdl.vietnamtourism.gov.vn/dest/?item=25", publicationDate: "", reliability: "authoritative" },
    { id: "src_linh_chieu_vbs", type: "website", title: "Vietnam Buddhist Sangha — visit to Linh Chiếu", author: "Vietnam Buddhist Sangha", url: "https://chutichghpgvn.vn/truong-lao-hoa-thuong-chu-tich-vieng-tang-ni-truong-thich-nu-nhu-tinh-tai-thien-vien-linh-chieu/", publicationDate: "2026", reliability: "authoritative" },
    { id: "src_bach_ma_visithue", type: "website", title: "Visit Huế — Trúc Lâm Bạch Mã", author: "Huế Tourism Department", url: "https://visithue.vn/Thien-vien-Truc-Lam-Bach-Ma.html/?pid=MjAzODF8Y3NkbGRs0", publicationDate: "", reliability: "authoritative" },
    { id: "src_truc_lam_hau_giang_tourism", type: "website", title: "Hậu Giang Tourism — Trúc Lâm Monastery", author: "Hậu Giang Tourism Department", url: "https://dulich.haugiang.gov.vn/vi/tvtl", publicationDate: "", reliability: "authoritative" },
    { id: "src_phuong_nam_cantho_city", type: "website", title: "Cần Thơ Tourism — Trúc Lâm Phương Nam", author: "Cần Thơ City Government", url: "https://old.cantho.gov.vn/wps/portal/home/du-khach/chi-tiet/diem-tham-quan/di-tich/thien%2Bvien%2Btruc%2Blam%2Bphuong%2Bnam?WCM_Page.Menu_TinTucKhac=5", publicationDate: "", reliability: "authoritative" },
    {
      id: SRC_DDM_HONG_KONG,
      type: "website",
      title: "Dharma Drum Mountain Hong Kong — locations and hours",
      author: "Dharma Drum Mountain Hong Kong",
      url: "https://www.ddmhk.org.hk/landing/support",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_PALMETTO_ZENDO,
      type: "website",
      title: "Palmetto Zendo — current practice",
      author: "Palmetto Zendo",
      url: "https://palmettozendo.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_ONE_RIVER_ZEN,
      type: "website",
      title: "One River Zen — practice, location and lineage",
      author: "One River Zen",
      url: "https://oneriverzen.org/home",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_ONE_HEART_SANGHA,
      type: "website",
      title: "One Heart Sangha — location and practice schedule",
      author: "One Heart Sangha",
      url: "https://oneheartsangha.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_DAY_STAR_ZENDO,
      type: "website",
      title: "Day Star Zendo — current practice and teachers",
      author: "Day Star Zendo",
      url: "https://www.daystarzendo.org/about-us",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_FULL_MOON_ZEN,
      type: "website",
      title: "Full Moon Zen — current practice and venue",
      author: "Full Moon Zen",
      url: "https://www.fullmoonzen.org/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_MOUNTAIN_SPRING_PV,
      type: "website",
      title: "Plum Village — Mountain Spring Monastery",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/mountain-spring-monastery",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_HEALING_SPRING_PV,
      type: "website",
      title: "Plum Village — Healing Spring Monastery",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/healing-spring-monastery",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_MAISON_INSPIR_PV,
      type: "website",
      title: "Plum Village — Maison de l’Inspir",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/maison-de-linspir",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_AIAB_PV,
      type: "website",
      title: "Plum Village — Asian Institute of Applied Buddhism",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/aiab-3",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_THAI_PLUM_VILLAGE,
      type: "website",
      title: "Plum Village — Thai Plum Village",
      author: "Plum Village Community of Engaged Buddhism",
      url: "https://plumvillage.org/practice-centre/plum-village-thailand",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_CANBERRA_SOTO_SITE, type: "website", title: "Canberra Soto Zen Group — practice and lineage", author: "Canberra Soto Zen Group", url: "https://canberrasotozengroup.wixsite.com/canberrasotozengroup", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_DARWIN_ZEN_SITE, type: "website", title: "Darwin Zen Group — practice and lineage", author: "Darwin Zen Group", url: "https://dzg.org.au/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_FOREST_WAY_ZEN_SITE, type: "website", title: "Way of the Forest — practice and lineage", author: "Way of the Forest", url: "https://forestwayzen.com.au/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_KUAN_YIN_AU_SITE, type: "website", title: "Kuan Yin Meditation Centre — Zen practice", author: "Kuan Yin Meditation Centre", url: "https://www.kuanyinmeditationcentre.org/zen-events/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_MOUNTAINS_RIVERS_HOBART, type: "website", title: "Mountains & Rivers Zen — schedule and lineage", author: "Mountains & Rivers Zen", url: "https://zenhobart.com/schedule", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_OPEN_WAY_AU, type: "website", title: "Open Way Zen — Australian practice groups", author: "Open Way Zen", url: "https://www.openway.org.au/practice.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_MORNING_STAR_ZEN, type: "website", title: "Morning Star Zendo — practice, teachers and location", author: "Morning Star Zendo", url: "https://sites.google.com/view/morningstarzen/home", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_NO_GATE_ZEN, type: "website", title: "No Gate Zen Center — practice, lineage and location", author: "No Gate Zen Center", url: "https://nogatezencenter.org/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_ORDER_CLEAR_MIND, type: "website", title: "Order of Clear Mind Zen — centers and teachers", author: "Order of Clear Mind Zen", url: "https://www.ocmz.org/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_STATEN_ISLAND_ZEN, type: "website", title: "Zen Community of Staten Island — practice and lineage", author: "Zen Community of Staten Island", url: "https://zencommunitysi.org/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_EMPTY_HAND_ZEN, type: "website", title: "Empty Hand Zen Center — current practice", author: "Empty Hand Zen Center", url: "https://emptyhandzen.org/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_PAMSULA_WHITEPLUM, type: "website", title: "White Plum Asanga — Pamsula Zen Center", author: "White Plum Asanga", url: "https://whiteplum.org/membership-list-mobile/user/190/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_DRAGONS_EYE_ZEN, type: "website", title: "Dragon’s Eye Zendo — current online practice and lineage", author: "Michael Koryu Holleran", url: "https://michaelkholleran.org/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_PLUMLINE, type: "website", title: "Plumline — Plum Village lay sangha directory", author: "Plum Village lay community", url: "https://www.plumline.org/home", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_INTERBEING_DENMARK, type: "website", title: "Interbeing Denmark — communities and calendar", author: "Interbeing Denmark", url: "https://interbeing.dk/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_BONZAZEN_SITE, type: "website", title: "Bonzazen — Association Zen du Boulay practice groups", author: "Association Zen du Boulay", url: "https://bonzazen.wordpress.com/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_FRENCH_PV_SANGHAS_2025, type: "document", title: "French-speaking Plum Village sanghas — directory, 8 June 2025", author: "Réseau des Sanghas Francophones du Village des Pruniers", url: "https://sanghasfrancophonespruniers.wordpress.com/wp-content/uploads/2025/06/liste_sangha_franco-08-06-2025.pdf", publicationDate: "2025-06-08", reliability: "authoritative",
    },
    { id: SRC_FRENCH_PV_SANGHAS_FEB_2025, type: "document", title: "French-speaking Plum Village sanghas — directory, 9 February 2025", author: "Réseau des Sanghas Francophones du Village des Pruniers", url: "https://sanghasfrancophonespruniers.wordpress.com/wp-content/uploads/2025/02/liste_sangha_franco-09-02-2025.pdf", publicationDate: "2025-02-09", reliability: "authoritative" },
    { id: SRC_SONARA_TOURS, type: "website", title: "SONARA Tours — events and practice", author: "SONARA", url: "https://www.sonara.fr/evenements/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZEN_SETE, type: "website", title: "Méditation Zen Sète — contact", author: "Méditation Zen Sète", url: "http://zensete.free.fr/contact.html", publicationDate: "", reliability: "primary" },
    { id: SRC_ZEN_BERNAY, type: "website", title: "Dojo Zen de Bernay — official site", author: "Dojo Zen de Bernay", url: "https://www.zenbernay.org/", publicationDate: "", reliability: "primary" },
    { id: SRC_KAKUNENJI, type: "website", title: "Kakunen-ji — public practice", author: "Kakunen-ji", url: "https://www.kakunen-zen.de/newsite/?page_id=331", publicationDate: "", reliability: "primary" },
    { id: SRC_IZID, type: "document", title: "Internationales Zen-Institut Deutschland — regional groups", author: "Internationales Zen-Institut Deutschland", url: "https://zen-institut.de/wp-content/uploads/2022/12/IZID-28112022-6stg.pdf", publicationDate: "2022-11-28", reliability: "primary" },
    { id: SRC_ZENDO_AACHEN, type: "website", title: "Zendo Aachen — dojo practice", author: "Kanjizai-Dojo / Zendo Aachen", url: "https://www.zendoaachen.de/dojo.htm", publicationDate: "", reliability: "primary" },
    { id: SRC_ZALTHO, type: "website", title: "Zaltho Sangha — calendar", author: "Zaltho Sangha", url: "https://zaltho.de/", publicationDate: "", reliability: "primary" },
    { id: SRC_PHAT_HUE, type: "website", title: "Pagode Phat Hue — weekly program", author: "Pagode Phat Hue", url: "https://www.phathue.de/veranstaltungen/woechentliches-programm/", publicationDate: "", reliability: "primary" },
    { id: SRC_RYU_UN_ZENDO, type: "website", title: "Ryû-Un-Zendô — practice dates", author: "Ryû-Un-Zendô", url: "https://ryu-un-zendo.org/termine/", publicationDate: "", reliability: "primary" },
    { id: SRC_SONNENHOF, type: "website", title: "Sonnenhof — Zen and contemplation", author: "Sonnenhof", url: "https://www.sonnenhof-holzinshaus.de/", publicationDate: "", reliability: "primary" },
    { id: SRC_DHARMA_SANGHA_GOTTINGEN, type: "website", title: "Dharma-Sangha — community and lineage", author: "Dharma-Sangha", url: "https://www.dharma-sangha.de/uber-uns/dharma-sangha", publicationDate: "", reliability: "primary" },
    { id: SRC_ZENKREIS_BREMEN, type: "website", title: "Zen-Kreis Bremen — practice times", author: "Zen-Kreis Bremen", url: "https://zenkreis-bremen.de/angebot/ubungszeiten/", publicationDate: "", reliability: "primary" },
    { id: SRC_WOLKENTOR, type: "website", title: "Wolkentor Zen-Tempel — calendar", author: "Wolkentor Zen-Tempel", url: "https://wolkentor-tempel.de/kalender-3/", publicationDate: "", reliability: "primary" },
    { id: SRC_COEUR_SANGHAS_MILLE_PETALES, type: "website", title: "Cœur des Sanghas Alsace — Jardin aux Mille Pétales", author: "Cœur des Sanghas Alsace", url: "https://sites.google.com/view/coeur-des-sanghas-alsace/les-sanghas/mille-p%C3%A9tales", publicationDate: "", reliability: "primary" },
    { id: "src_stockholms_zengrupp", type: "website", title: "Stockholms Zengrupp — affiliation, location and practice", author: "Stockholms Zengrupp", url: "https://zenstockholm.nu/", publicationDate: "", reliability: "primary" },
    { id: "src_nathagi_zen", type: "website", title: "Zen á Íslandi — Nátthagi practice and current notices", author: "Zen á Íslandi — Nátthagi", url: "https://www.zen.is/", publicationDate: "2026", reliability: "primary" },
    { id: "src_teesside_group", type: "website", title: "Teesside Serene Reflection Meditation Group — venue and practice", author: "Teesside Serene Reflection Meditation Group", url: "https://www.northeastserenereflection.org.uk/teesside", publicationDate: "", reliability: "primary" },
    { id: "src_sangha_valence", type: "website", title: "Sangha de Valence — group activity and practice", author: "Sangha de Valence", url: "https://sanghadevalence.jimdofree.com/activit%C3%A9s/vie-de-la-sangha/", publicationDate: "2026", reliability: "primary" },
    { id: "src_kannon_warsaw", type: "website", title: "Kannon Poland — Warsaw practice location", author: "Buddyjska Wspólnota Zen Kannon", url: "https://www.kannon.pl/warszawa/", publicationDate: "2025-09-08", reliability: "primary" },
    { id: "src_dublin_zen_centre", type: "website", title: "Dublin Zen Centre — location and schedule", author: "Zen Buddhism Ireland", url: "https://www.zenbuddhism.ie/dublin-zen-centre/", publicationDate: "", reliability: "primary" },
    { id: "src_kannon_zielona_gora", type: "website", title: "Kannon Poland — Jasień/Żary group near Zielona Góra", author: "Buddyjska Wspólnota Zen Kannon", url: "https://www.kannon.pl/zielona-gora/", publicationDate: "2025-08-30", reliability: "primary" },
    { id: "src_drugi_brzeg_wroclaw", type: "website", title: "Sangha Drugi Brzeg — practice in Wrocław", author: "Sangha Drugi Brzeg", url: "https://sangha.wroclaw.pl/", publicationDate: "", reliability: "primary" },
    { id: SRC_MOMENT_PRESENT_ROANNE, type: "document", title: "Roanne-area cultural events leaflet — Moment Présent sangha", author: "Roanne event organizers", url: "https://cms-assets.webediamovies.pro/production/1446/4e28367058f2fa16e6f18d406ee113fd.pdf", publicationDate: "2025", reliability: "secondary" },
    {
      id: SRC_ZEN_SANGHA_BELGIUM, type: "website", title: "Zen Sangha Belgium — local groups and lineage", author: "Zen Sangha Belgium", url: "https://www.zensangha.be/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_BIG_HEART_COPENHAGEN, type: "website", title: "Big Heart Zen Copenhagen — practice group", author: "Big Heart Zen Copenhagen", url: "https://www.meetup.com/zazen-copenhagen/", publicationDate: "", reliability: "primary",
    },
    {
      id: SRC_DBU_BUDDHAWEG, type: "website", title: "German Buddhist Union — BuddhaWeg-Sangha Zen-Zentrum Solingen", author: "Deutsche Buddhistische Union", url: "https://buddhismus-deutschland.de/?zentren=buddhaweg-sangha-zen-zentrum-solingen-e-v", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_OFFENER_KREIS_FREIBURG, type: "website", title: "Zendo Offener Kreis Freiburg — evening meditation", author: "Via Integralis Freiburg", url: "https://www.viaintegralis-freiburg.de/zugaenge/abend-meditation/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_EARTH_SKY_ZEN, type: "website", title: "Earth+Sky Zen — practice, history and lineage", author: "Earth+Sky Zen", url: "https://zenireland.com/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_TURNHOUT_BBU, type: "website", title: "Belgian Buddhist Union — Zen Dojo Turnhout", author: "Belgian Buddhist Union", url: "https://www.buddhism.be/nl/centresflandres-fr/zen-dojo-turnhout", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_MONTEVIDEO_KOSEN, type: "website", title: "Kōsen Sangha — Dōjō Zen de Montevideo", author: "Kōsen Sangha", url: "https://zen-deshimaru.com.ar/dojo-zen-de-montevideo/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_WAKE_UP_DIRECTORY, type: "website", title: "Wake Up — local sangha directory", author: "Wake Up International", url: "https://wkup.org/sanghas/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_INTERSEIN_GERMANY, type: "website", title: "Intersein — communities in the tradition of Thich Nhat Hanh", author: "Intersein – Netzwerk für ein achtsames Leben", url: "https://intersein.de/gemeinschaften.html", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_RIVIERE_COEUR, type: "website", title: "Rivière du Cœur — local Plum Village sanghas", author: "Sangha Rivière du Cœur", url: "https://riviereducoeur.webnode.fr/notre-sangha/", publicationDate: "", reliability: "authoritative",
    },
    {
      id: SRC_HAUTS_FRANCE_PV, type: "website", title: "Hauts-de-France sanghas in the Plum Village tradition", author: "Sangha de Lille", url: "https://contact79094.wixsite.com/sanghadelille/sanghas-hauts-de-france", publicationDate: "", reliability: "authoritative",
    },
    { id: SRC_ERMITA_PAJA, type: "website", title: "Ermita de Paja — practice and lineage", author: "Ermita de Paja", url: "https://www.zazen.com.ar/index-mobile.php", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ORDINARY_MIND_AU, type: "website", title: "Ordinary Mind Zen Brisbane — practice and lineage", author: "Ordinary Mind Zen Brisbane", url: "https://www.ordinarymind.org.au/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_MELBOURNE, type: "website", title: "Ordinary Mind Zen Melbourne — practice and lineage", author: "Ordinary Mind Zen Melbourne", url: "https://www.zenmelbourne.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_OZZEN, type: "website", title: "OzZen — schedule and lineage", author: "OzZen", url: "https://ordinarymind.com.au/schedule/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SYDNEY_ZEN, type: "website", title: "Sydney Zen Centre — practice, groups and lineage", author: "Sydney Zen Centre", url: "https://szc.org.au/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TWINING_VINES_AU, type: "website", title: "Twining Vines Zen Centre — practice and lineage", author: "Twining Vines Zen Centre", url: "https://netiparekh.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZGWA, type: "website", title: "Zen Group of Western Australia — practice and history", author: "Zen Group of Western Australia", url: "https://www.zgwa.org.au/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BERGZENDO, type: "website", title: "BergZendo — retreat centre", author: "Hyakujōgan Zendo", url: "https://bergzendo.at/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_STILLE_WIEN, type: "website", title: "Stille in Wien — Zen program", author: "Kardinal König Haus", url: "https://www.stille-in-wien.at/gebet/zen/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_IZEN, type: "website", title: "Izen — Zen practice and lineage", author: "Stichting Izen", url: "https://www.izen.nl/zen-meditatie/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_TREE, type: "website", title: "Zen Tree — practice and lineage", author: "Zen Tree", url: "https://zentree.nl/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENPUNT, type: "website", title: "ZenPunt Haarlem — program and teachers", author: "ZenPunt", url: "https://zenpunt.nl/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KANZEON_POLAND, type: "website", title: "Kanzeon Poland — centers, teachers and practice", author: "Polska Sangha Kanzeon", url: "https://kanzeon.pl/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BORN_EARTH, type: "website", title: "Born As The Earth — practice and lineage", author: "Born As The Earth Zen Academy", url: "https://bornastheearth.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SVALORNAS, type: "website", title: "Svalornas Sangha — schedule and lineage", author: "Svalornas Sangha", url: "https://www.svalornassangha.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_OFFENER_KREIS_LUZERN, type: "website", title: "Zen Zentrum Offener Kreis Luzern — practice", author: "Zen Zentrum Offener Kreis", url: "https://www.zenzentrum-offenerkreis.ch/luzern.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_WHOLEHEARTED_ZEN, type: "website", title: "Wholehearted Zen Sangha — practice and lineage", author: "Wholehearted Zen Sangha", url: "https://wholeheartedzensangha.uk/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_WILD_FLOWER_PT, type: "website", title: "Associação Zen Flor Silvestre — 2026–27 program", author: "Associação Zen Flor Silvestre", url: "https://sanghazenpt.org/2026/10/03/programa-de-atividades-2026-2027/", publicationDate: "2026-10-03", reliability: "authoritative" },
    { id: SRC_CONSTELLATION_LAC, type: "website", title: "Constellation du Lac — current practice", author: "Sangha Constellation du Lac", url: "https://constellationdulac.wixsite.com/sangha-annecy", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CEDRES_BLEUS, type: "website", title: "Maison aux Cèdres Bleus — practice and retreats", author: "Maison aux Cèdres Bleus", url: "https://maisonauxcedresbleus.com/session-hebdomadaire/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLEUR_TAMARIS, type: "website", title: "Provence Plum Village sanghas — Fleur de Tamaris", author: "Sanghas du Village des Pruniers en Provence", url: "https://sanghasduvillagedespruniersenprovence.over-blog.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLEUR_INSTANT, type: "website", title: "Fleur de l’Instant — association and practice", author: "Sangha Fleur de l’Instant", url: "https://www.fleurdelinstant.fr/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLEURS_PRUNIER, type: "website", title: "Fleurs de Prunier Rennes — current practice", author: "Sangha Fleurs de Prunier", url: "https://fleursdeprunier-rennes.blogspot.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLEURS_VACUITE, type: "website", title: "Fleurs de Vacuité — current practice", author: "Sangha Fleurs de Vacuité", url: "https://www.fleursdevacuite.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLEURS_ZEN, type: "website", title: "Fleurs de Zen Mulhouse — current practice", author: "Cœur des Sanghas Alsace", url: "https://sites.google.com/view/coeur-des-sanghas-alsace/les-sanghas/fleurs-de-zen", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_GRUPPE_LINZ, type: "website", title: "Zen Gruppe Linz — practice and lineage", author: "Zen Gruppe Linz", url: "https://zengruppe-linz.at/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENDO_WIEN_SITE, type: "website", title: "Zendo Wien — practice and teachers", author: "Zendo Wien", url: "https://zendowien.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENGRUPPE_WIEN, type: "website", title: "Zengruppe Wien — practice times", author: "Zengruppe Wien", url: "https://www.zengruppe-wien.at/zen-meditation-yoga", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PAGODES_ZEN, type: "website", title: "Centre Bouddhiste Zen des Pagodes — practice", author: "Centre Bouddhiste Zen des Pagodes", url: "https://www.centre-bouddhiste-zen-des-pagodes.be/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SHIKANTAZA_MONS, type: "website", title: "Centre Shikantaza Mons — practice and lineage", author: "Centre Shikantaza", url: "https://www.shikantaza.be/centre", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DAISEN, type: "website", title: "Daisen Centre Zen — Belgian practice groups", author: "Daisen Centre Zen", url: "https://www.daisen.eu/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_DOGEN_BELGIUM, type: "website", title: "Zen Dogen Sangha Belgium — practice locations", author: "Zen Dogen Sangha Belgium", url: "https://www.zendogensangha.be/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GYOJI, type: "website", title: "Zendo Gyoji — practice and teachers", author: "Zendo Gyoji", url: "https://zenmeditatiehasselt.be/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_EISHOJI, type: "website", title: "Eishoji Monastery — practice and access", author: "Mosteiro Zen Budista Eishoji", url: "https://www.mosteiroeishoji.org/mosteiro", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GYOSHO_IT, type: "website", title: "Centro Zen Gyosho — Zen practice", author: "Centro Zen Gyosho", url: "https://www.centrogyosho.it/la-pratica-dello-zen/", publicationDate: "", reliability: "primary" },
    { id: SRC_TENSHIN_IT, type: "website", title: "Tempio Zen Ten Shin — community and teachers", author: "Tempio Zen Ten Shin", url: "https://www.tenshin.it/il-tempio-zen-ten-shin/chi-siamo/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZENSHINJI_IT, type: "website", title: "Bukkosan Zenshinji — monastery and affiliated practice", author: "Bukkosan Zenshinji", url: "https://zenshinji.org/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZENTRUM_NL, type: "website", title: "Zentrum Utrecht — teachers and transmission", author: "Zentrum Utrecht", url: "https://zentrum.nl/leraren/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZEN_NIJMEGEN, type: "website", title: "Zen Centrum Nijmegen — contact and venues", author: "Zen Centrum Nijmegen", url: "https://zennijmegen.nl/contact/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZEN_BONN, type: "website", title: "Zen Dojo Bonn — venue and practice", author: "Zen Dojo Bonn", url: "https://www.zen-bonn.de/kontakt/", publicationDate: "", reliability: "primary" },
    { id: SRC_SHOBOGENDO_DE, type: "website", title: "Zen Dojo Shobogendo — practice and teacher", author: "Zen Dojo Shobogendo", url: "https://www.shobogendo.de/", publicationDate: "", reliability: "primary" },
    { id: SRC_ZEN_KREIS_HAMBURG, type: "website", title: "Zen-Kreis Hamburg — practice and lineage", author: "Zen-Kreis Hamburg", url: "https://zen-kreis-hamburg.de/", publicationDate: "", reliability: "primary" },
    { id: "src_french_pv_sanghas_2024", type: "document", title: "French-speaking Plum Village sangha directory — 15 April 2024", author: "Plum Village", url: "https://plumvillage.org/wp-content/uploads/2024/05/Liste_sangha_franco-15-04-2024.pdf", publicationDate: "2024-04-15", reliability: "authoritative" },
    { id: "src_wolken_wasser_de", type: "website", title: "Wolken und Wasser — zazen and venue", author: "Wolken und Wasser Rinzai Zen Dojo", url: "https://wolkenundwasser.de/zazen/", publicationDate: "", reliability: "primary" },
    { id: "src_zen_muenster", type: "website", title: "Zen Institut Münster — official site", author: "Zen Institut Münster", url: "https://zen-muenster.de/", publicationDate: "", reliability: "primary" },
    { id: "src_zen_augsburg", type: "website", title: "Zen in Augsburg — official site", author: "Zen in Augsburg", url: "https://www.zen-augsburg.de/zenhomepage11/index.htm", publicationDate: "", reliability: "primary" },
    { id: "src_zenkreis_kiel", type: "website", title: "Zen Sangha Kiel — official site", author: "Zen Sangha Kiel", url: "https://zenkreis-kiel.de/", publicationDate: "", reliability: "primary" },
    { id: "src_zenvereinigung_de", type: "website", title: "Zen-Vereinigung Deutschland — centres", author: "Zen-Vereinigung Deutschland", url: "https://www.zen-vereinigung.de/", publicationDate: "", reliability: "authoritative" },
    { id: "src_qigong_tao_bamberg", type: "website", title: "Deutsche Qigong Gesellschaft — TAO Bamberg event", author: "Deutsche Qigong Gesellschaft", url: "https://qigong-gesellschaft.de/weiterbildungdetail/4576", publicationDate: "", reliability: "secondary" },
    { id: "src_keb_ravensburg", type: "website", title: "Katholische Erwachsenenbildung Ravensburg — Zen event", author: "KEB Ravensburg", url: "https://keb-rv.de/", publicationDate: "", reliability: "secondary" },
    { id: "src_sotozen_de", type: "website", title: "Sōtō Zen Buddhism Europe — Germany", author: "Sōtō Zen Buddhism Europe", url: "https://sotozen.de/", publicationDate: "", reliability: "authoritative" },
    { id: "src_sanko_reims", type: "website", title: "Sanko Reims — official practice site", author: "Sanko Reims", url: "https://sites.google.com/view/sanko-meditation-reims/accueil", publicationDate: "", reliability: "primary" },
    { id: "src_dogen_sangha_fr", type: "website", title: "Dogen Sangha France — Lyon practice", author: "Dogen Sangha France", url: "https://dogensangha.fr/", publicationDate: "", reliability: "primary" },
    { id: "src_myoshinji_official", type: "website", title: "Myōshin-ji — official Zen information", author: "Myōshin-ji", url: "https://www.myoshinji.or.jp/english/zen/info.html", publicationDate: "", reliability: "primary" },
    { id: "src_nanzenji_official", type: "website", title: "Nanzen-ji — official English site", author: "Nanzen-ji", url: "http://www.nanzen.net/english/", publicationDate: "", reliability: "primary" },
    { id: "src_manpukuji_official", type: "website", title: "Ōbakusan Manpuku-ji — official site", author: "Manpuku-ji", url: "https://www.obakusan.or.jp/en/", publicationDate: "", reliability: "primary" },
    { id: "src_eihoji_official", type: "website", title: "Kokeizan Eihō-ji — official site", author: "Kokeizan Eihō-ji", url: "https://kokeizan.or.jp/en/pages/4/", publicationDate: "", reliability: "primary" },
    { id: "src_noorder_poort", type: "website", title: "International Zen Center Noorder Poort", author: "Noorder Poort", url: "https://zeninstitute.org/zen-center/", publicationDate: "", reliability: "primary" },
    { id: "src_zen_amsterdam", type: "website", title: "Zen Centrum Amsterdam — official site", author: "Zen Centrum Amsterdam", url: "https://zenamsterdam.nl/", publicationDate: "", reliability: "primary" },
    { id: "src_zen_nl", type: "website", title: "Zen.nl — national contact", author: "Zen.nl Nederland", url: "https://www.zen.nl/algemeen/contact/", publicationDate: "", reliability: "primary" },
    { id: "src_ki_zen", type: "website", title: "Ki-Zen Meerlo — official site", author: "Ki-Zen", url: "https://www.ki-zen.nl/", publicationDate: "", reliability: "primary" },
    { id: "src_kenkon", type: "website", title: "Kenkon Wageningen — Zen practice", author: "Kenkon", url: "https://www.kenkon.org/zen/", publicationDate: "", reliability: "primary" },
    { id: "src_truc_lam_yen_tu_official", type: "website", title: "Thiền viện Trúc Lâm Yên Tử — official site", author: "Thiền viện Trúc Lâm Yên Tử", url: "https://truclamyentu.com.vn/", publicationDate: "", reliability: "primary" },
    { id: "src_lamdong_truc_lam", type: "website", title: "Lâm Đồng tourism — Trúc Lâm Đà Lạt", author: "Lâm Đồng Province", url: "https://lamdong.gov.vn/sites/dulich/danh-lam-thang-canh/SitePages/Thien-Vien-Truc-Lam.aspx", publicationDate: "", reliability: "authoritative" },
    { id: "src_phutho_tay_thien", type: "website", title: "Phú Thọ tourism — Trúc Lâm Tây Thiên", author: "Phú Thọ tourism authority", url: "https://dulichphutho.gov.vn/diemden/thien-vien-truc-lam-tay-thien", publicationDate: "", reliability: "authoritative" },
    { id: "src_dongthap_chanh_giac", type: "website", title: "Đồng Tháp tourism — Trúc Lâm Chánh Giác", author: "Đồng Tháp tourism authority", url: "https://dulich.dongthap.gov.vn/vi/thienvientruclam", publicationDate: "", reliability: "authoritative" },
    { id: "src_sung_phuc_official", type: "website", title: "Trúc Lâm Sùng Phúc — official site", author: "Thiền viện Trúc Lâm Sùng Phúc", url: "https://thienviensungphuc.net/", publicationDate: "", reliability: "primary" },
    { id: "src_ham_rong_official", type: "website", title: "Trúc Lâm Hàm Rồng — official site", author: "Thiền viện Trúc Lâm Hàm Rồng", url: "https://truclamhamrong.com/", publicationDate: "", reliability: "primary" },
    { id: "src_tue_duc_official", type: "website", title: "Trúc Lâm Tuệ Đức — official site", author: "Thiền viện Trúc Lâm Tuệ Đức", url: "https://thienvientueduc.org/", publicationDate: "", reliability: "primary" },
    { id: SRC_VIA_ZEN_BR, type: "website", title: "Via Zen Porto Alegre — practice and lineage", author: "Via Zen", url: "https://www.viazen.org.br/centro-de-pratica-porto-alegre", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENDO_CURITIBA, type: "website", title: "Zendo Curitiba — practice and lineage", author: "Zendo Curitiba", url: "https://zendocuritiba.com.br/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ATLANTIC_SOTO, type: "website", title: "Silent Thunder Order — Atlantic Soto Zen", author: "Silent Thunder Order", url: "https://storder.org/centers/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CISTES_SANGHA, type: "website", title: "Inter-Sangha des Cistes — current practice", author: "Inter-Sangha des Cistes", url: "https://sanghadescistes.blogspot.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JARDIN_INSTANT, type: "website", title: "Jardin de l’Instant — current Paris practice", author: "Jardin de l’Instant", url: "https://lejardindelinstant.alwaysdata.net/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JOIE_CONSCIENCE, type: "website", title: "Sangha de Lablachère — current practice", author: "Sangha de Lablachère", url: "https://sangha-thich-nhat-hanh-de-lardeche.jimdosite.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_EON_ZEN, type: "website", title: "Eon Zen — current practice and teachers", author: "Eon Zen", url: "https://eonzen.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FLOWING_RIVER, type: "website", title: "Flowing River Sangha — current practice", author: "Flowing River Sangha", url: "https://flowingriversangha.com/join-us/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GREAT_MOUNTAIN, type: "website", title: "Great Mountain Zen Center — contact and practice", author: "Great Mountain Zen Center", url: "https://gmzc.org/contact/contact-us/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GREAT_PLAINS, type: "website", title: "Great Plains Zen Center — current practice", author: "Great Plains Zen Center", url: "https://greatplainszen.org/half-day-sittings/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MORGAN_BAY, type: "website", title: "Morgan Bay Zendo — retreats and workshops", author: "Morgan Bay Zendo", url: "https://www.morganbayzendo.org/schedule/retreats-workshops", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LOST_COIN, type: "website", title: "Lost Coin Zen — current practice", author: "Lost Coin Zen", url: "https://www.lostcoinzen.com/recent-and-future-event/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_NEW_RIVER, type: "website", title: "New River Zen Community — current schedule", author: "New River Zen Community", url: "https://newriverzen.org/schedule/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ANGERS_SANGHA, type: "website", title: "Les Trois Rivières — group updates", author: "Sangha Les Trois Rivières", url: "https://bouddhisme-thich-nhat-hanh-angers.blogspot.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CHEMIN_EVEIL, type: "website", title: "Chemin d’Éveil — Amplepuis practice", author: "Chemin d’Éveil", url: "https://chemindeveil.over-blog.com/page/8", publicationDate: "2025-08", reliability: "authoritative" },
    { id: SRC_AVATAMSAKA_CA, type: "website", title: "Avatamsaka Monastery — daily schedule", author: "Avatamsaka Monastery", url: "https://www.avatamsaka.ca/daily-schedule.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CALGARY_SOTO, type: "website", title: "Calgary Sōtō Zen — current schedule", author: "Calgary Sōtō Zen", url: "https://calgarysotozen.org/schedule", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CLEAR_WAY_CA, type: "website", title: "Clear Way Zen — history and practice", author: "Clear Way Zen", url: "https://www.clearwayzen.ca/our-history/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FGS_TORONTO, type: "website", title: "Fo Guang Shan Temple of Toronto — temple and programs", author: "Fo Guang Shan Temple of Toronto", url: "https://www.fgs.ca/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LONDON_ZEN_CA, type: "website", title: "London Zen Centre — current events", author: "London Zen Centre", url: "https://londonzencentre.org/events", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MONTREAL_ZEN, type: "website", title: "Montreal Zen Center — current calendar", author: "Montreal Zen Center", url: "https://zenmontreal.org/calendar.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ROCKY_MOUNTAIN_CA, type: "website", title: "Rocky Mountain Zen — current practice", author: "Rocky Mountain Zen", url: "https://rockymountainzen.weebly.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BUSSHINJI_BRAZIL, type: "website", title: "Templo Busshinji — ceremonies and sesshin information", author: "Templo Busshinji", url: "https://sotozen.org.br/cerimonias-do-templo-busshinji/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CENTRO_ZEN_MEXICO_SZBA, type: "website", title: "Soto Zen Buddhist Association — El Centro Zen de México profile", author: "Soto Zen Buddhist Association", url: "https://www.szba.org/el-centro-zen-de-mexico-ar", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_MONTANAS_Y_MAR, type: "website", title: "Zen Montañas y Mar — retreats and activities", author: "Zen Montañas y Mar", url: "https://www.zenmontanasymar.org/retiros-y-actividades/", publicationDate: "2026", reliability: "authoritative" },
    { id: SRC_ZEN_VIENTO_DEL_SUR, type: "website", title: "Zen Viento del Sur — about the sangha", author: "Zen Viento del Sur", url: "https://zen-vientodelsur.com.ar/?page_id=8", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TORONTO_ZEN, type: "website", title: "Toronto Zen Centre — current schedule", author: "Toronto Zen Centre", url: "https://torontozen.org/schedule.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_WHITE_WIND, type: "website", title: "White Wind Zen Community — centres and schedules", author: "White Wind Zen Community", url: "https://wwzc.org/daily-schedules/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_BUDDHIST_TORONTO, type: "website", title: "Zen Buddhist Temple Toronto — practice", author: "Zen Buddhist Temple", url: "https://www.zenbuddhisttemple.org/toronto", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENWEST, type: "website", title: "Zenwest Buddhist Society — practice and history", author: "Zenwest Buddhist Society", url: "https://www.zenwest.ca/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PLUIE_DHARMA, type: "website", title: "Pluie du Dharma — locations and practice", author: "Sangha Pluie du Dharma", url: "https://www.lapluiedudharma.fr/page-list/coordonnees", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PLUIE_FLEURIT, type: "website", title: "Pluie qui Fleurit — Rouen sangha", author: "Sangha Pluie qui Fleurit", url: "https://www.pluiequifleurit.net/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ALSACE_RIVIERE, type: "website", title: "Rivière du Dharma — current practice", author: "Cœur des Sanghas Alsace", url: "https://sites.google.com/view/coeur-des-sanghas-alsace/les-sanghas/rivi%C3%A8re-du-dharma", publicationDate: "", reliability: "authoritative" },
    { id: "src_camino_medio", type: "website", title: "Comunidad Soto Zen Camino Medio — practice locations, lineage and schedules", author: "Comunidad Soto Zen Camino Medio", url: "https://caminomedio.org/comunidad/", publicationDate: "2026", reliability: "primary" },
    { id: "src_nalanda_centre", type: "website", title: "Centre Zen Nalanda — location, practice and Soto Zen lineage", author: "Associació Nalanda", url: "https://nalanda.cat/", publicationDate: "2026", reliability: "primary" },
    { id: "src_cambridge_srm_group", type: "website", title: "Cambridge Serene Reflection Meditation Group — practice and OBC affiliation", author: "Cambridge Serene Reflection Meditation Group", url: "https://sites.google.com/site/cambsrmgroup/", publicationDate: "2026", reliability: "primary" },
    { id: "src_lancaster_srm_group", type: "website", title: "Lancaster Serene Reflection Meditation Group — group identity and affiliation", author: "Lancaster Serene Reflection Meditation Group", url: "https://www.lancasterserenereflection.org.uk/", publicationDate: "", reliability: "primary" },
    { id: "src_london_fgs", type: "website", title: "London Fo Guang Shan Temple — visitor location and hours", author: "International Buddhist Progress Society UK", url: "https://www.londonfgs.org.uk/where-to-find-us", publicationDate: "2025", reliability: "primary" },
    { id: SRC_UN_LOTUS_PERPIGNAN, type: "website", title: "Un Lotus s’épanouit — Perpignan sangha", author: "Un Lotus s’épanouit", url: "https://unlotussepanouitaperpignan.blogspot.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENCARE, type: "website", title: "New York Zen Center for Contemplative Care — lineage and practice", author: "New York Zen Center for Contemplative Care", url: "https://zencare.org/meditation-practice", publicationDate: "", reliability: "authoritative" },
    { id: SRC_STILL_MIND, type: "website", title: "Still Mind Zendo — lineage and schedule", author: "Still Mind Zendo", url: "https://www.stillmindzendo.org/meditation-schedule", publicationDate: "", reliability: "authoritative" },
    { id: SRC_OPEN_MIND_ZEN, type: "website", title: "Open Mind Zen — current events", author: "Open Mind Zen", url: "https://openmindzen.com/upcoming-events/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_VILLAGE_ZENDO_AFFILIATES, type: "website", title: "Village Zendo lineage centers", author: "Village Zendo", url: "https://villagezendo.org/zen-centers-in-the-village-zendo-lineage/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ALMOND_BLOSSOM, type: "website", title: "Almond Blossom Sangha — Algarve practice", author: "Almond Blossom Sangha", url: "https://algarvesangha.wordpress.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MINDFULNESS_ISRAEL, type: "website", title: "Community of Mindfulness in Israel", author: "Community of Mindfulness in Israel", url: "https://mindfulness-israel.org/en/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DHARMA_GAIA, type: "website", title: "Dharma Gaia — practice and retreats", author: "Dharma Gaia", url: "https://www.dharmagaia.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LANGMAI_VIETNAM, type: "website", title: "Làng Mai Vietnam — monastic communities", author: "Làng Mai", url: "https://langmai.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TNH_SPAIN, type: "website", title: "Thich Nhat Hanh Spain — sangha directory", author: "Comunidad del Interser", url: "https://tnhspain.com/sangha/buscar-sanghas-para-practicar/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JOYFUL_GARDEN_SG, type: "website", title: "Joyful Garden Sangha — current practice", author: "Joyful Garden Sangha", url: "https://www.joyfulgarden.sg/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PV_HONG_KONG, type: "website", title: "Plum Village Hong Kong — Lotus Pond Temple", author: "Plum Village Hong Kong", url: "https://www.pvfhk.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_UPAYA_CENTER, type: "website", title: "Upaya Zen Center — daily practice", author: "Upaya Zen Center", url: "https://www.upaya.org/temple/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_DUST, type: "website", title: "Zen Community of Oregon — community and lineage", author: "Zen Community of Oregon", url: "https://zendust.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_YOKOJI_CENTER, type: "website", title: "Yokoji Zen Mountain Center — programs", author: "Yokoji Zen Mountain Center", url: "https://zmc.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_VILLAGE_ZENDO, type: "website", title: "Village Zendo — practice and lineage", author: "Village Zendo", url: "https://villagezendo.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_ALKMAAR, type: "website", title: "Zen Alkmaar — practice and teachers", author: "Zen Alkmaar", url: "https://zenalkmaar.nl/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_YORK_ZEN, type: "website", title: "York Zen Group — practice and lineage", author: "York Zen Group", url: "https://www.yorkzengroupwgzs.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DOJO_ZEN_BUENOS_AIRES, type: "website", title: "Dojo Zen Buenos Aires — schedule and lineage", author: "Dojo Zen Buenos Aires", url: "https://dojozenbuenosaires.com.ar/horarios/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MAITREYA_CHILE, type: "website", title: "Maitreya Comunidad — practice and teachers", author: "Maitreya Comunidad", url: "https://www.maitreyazen.cl/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENDO_TUNQUEN, type: "website", title: "Zendo Tunquén — residential practice", author: "El Zendo", url: "https://elzendo.com/wiken-zen/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MONTANA_SILENCIO, type: "website", title: "Montaña de Silencio — current program", author: "Montaña de Silencio", url: "https://www.montanadesilencio.org/programacion/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CASA_ZEN_COSTA_RICA, type: "website", title: "Casa Zen de Costa Rica — community and practice", author: "Casa Zen de Costa Rica", url: "https://www.casazen.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CASA_ZEN_MEXICO, type: "website", title: "Casa Zen México — community and lineage", author: "Casa Zen México", url: "https://casazenmexico.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DHAMMAPADA_MEXICO, type: "website", title: "Dhammapada Budismo Zen — weekly practice", author: "Sangha Dhammapada", url: "https://budismozen.org/mx/practica-semanal/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MAR_DE_JADE, type: "website", title: "Mar de Jade — retreat calendar", author: "Mar de Jade", url: "https://mardejade.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SOTO_ZEN_PERU, type: "website", title: "Comunidad Budista Sōtō Zenshū del Perú", author: "Sōtō Zen Perú", url: "https://www.sotozenperu.com/la-comunidad-zen", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SOTOZEN_PERU_OFFICIAL, type: "website", title: "Sōtōshū temples outside Japan — Peru", author: "Sōtōshū Shūmuchō", url: "https://www.sotozen.com/eng/temples/outside_jp/Peru/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_URUGUAY_CIVIL_MAP, type: "website", title: "Uruguay civil-society map — Asociación Zen del Uruguay", author: "Mapeo de la Sociedad Civil", url: "https://www.mapeosociedadcivil.uy/organizaciones/asociacion-zen-del-uruguay-zendo-de-los-tres-tesoros/", publicationDate: "2024", reliability: "secondary" },
    { id: SRC_DHARMALOKA_CROATIA, type: "website", title: "Dharmaloka Chan Retreat Center — programs", author: "Dharmaloka", url: "https://chan.hr/en/programs/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_HAVREDAL_ZENDO, type: "website", title: "Havredal Zendo — current program", author: "Havredal Zendo", url: "https://havredalzendo.dk/program", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SANNEJI_FINLAND, type: "website", title: "Sanneji Zen — centers and practice", author: "Sanneji Zen", url: "https://zazen.fi/en/zen-centers/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KAJO_ZENDO, type: "website", title: "Kajo Zendo Turku — current practice", author: "Kajo Zendo", url: "https://kajozendo.wordpress.com/turku/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SYDANMIELI_ZEN, type: "website", title: "Sydänmieli Zen — practice and teacher", author: "Sydänmieli Zen", url: "https://sydanmieli.tzc.fi/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TAMPERE_ZEN, type: "website", title: "Tampere Zen Center — current schedule", author: "Tampere Zen Center", url: "https://tzc.fi/category/aikataulu/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TAN_KAPUJA_ZEN, type: "website", title: "A Tan Kapuja Zen Közösség — current practice", author: "A Tan Kapuja Zen Közösség", url: "https://zen.hu/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FUKU_GEN_BERLIN, type: "website", title: "Fuku Gen Zen Dojo — current information", author: "Fuku Gen Zen Dojo", url: "https://fukugen.de/infos/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_AUCKLAND_ZEN_CENTER, type: "website", title: "Auckland Zen Centre — current sitting schedule", author: "Auckland Zen Centre", url: "https://www.aucklandzen.org.nz/sitting-schedule", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DUNEDIN_ZEN, type: "website", title: "Dunedin Zen — local practice", author: "Dunedin Zen", url: "https://dunedinzen.wordpress.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BODHIMOUNT_TEACHER, type: "website", title: "Bodhi Zendo — Carl Hooper profile", author: "Bodhi Zendo", url: "https://www.bodhizendo.org/index.php/en/zen-teachers/carl-hooper-engl", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MELBOURNE_ZEN_GROUPS, type: "website", title: "Melbourne Zen Group — other Victorian groups", author: "Melbourne Zen Group", url: "https://mzg.org.au/links/other-zen-groups/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MILDURA_ZEN, type: "website", title: "Mildura Zen Group — community and lineage", author: "Mildura Zen Group", url: "https://mildurazengroup.org/about-us/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ASOKA_ZHEJIANG, type: "website", title: "Zhejiang social-sciences profile — Ayuwang Temple", author: "Zhejiang Provincial Federation of Social Sciences", url: "https://www.zjskw.gov.cn/art/2021/9/14/art_1229556995_40807.html", publicationDate: "2021", reliability: "authoritative" },
    { id: SRC_GAOMIN_JSBA, type: "website", title: "Jiangsu Buddhist Association — Gaomin Temple", author: "Jiangsu Buddhist Association", url: "https://www.jsfj.net/syzs_yzhjqg%E6%97%BBs", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JINGCI_HZBA, type: "website", title: "Hangzhou Buddhist Association — Jingci Temple activity", author: "Hangzhou Buddhist Association", url: "https://www.hzfjxh.com/art/241228/25691662", publicationDate: "2024", reliability: "authoritative" },
    { id: SRC_JINSHAN_JSBA, type: "website", title: "Jiangsu Buddhist Association — Jiangtian Chan Temple", author: "Jiangsu Buddhist Association", url: "https://www.jsfj.net/syzs_zjjsjtcs", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PO_LIN_MONASTERY, type: "website", title: "Po Lin Monastery — official site", author: "Po Lin Monastery", url: "https://plm.org.hk/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PO_LAM_HK_PLANNING, type: "website", title: "Hong Kong Town Planning Board — Po Lam Zen Monastery", author: "Hong Kong Town Planning Board", url: "https://www.tpb.gov.hk/en/meetings/TPB/Minutes/m1145tpb_e.pdf", publicationDate: "2026", reliability: "authoritative" },
    { id: SRC_GUANGXIAO_GUANGZHOU, type: "website", title: "Guangzhou government — Guangxiao Temple", author: "Guangzhou Municipal Government", url: "https://www.gz.gov.cn/zlgz/gzly/wzgz/zjcs/fj/content/post_7760653.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GUOEN_XINXING, type: "website", title: "Xinxing County archive — Guoen Temple", author: "Xinxing County Government", url: "https://oa.xinxing.gov.cn/info/19564", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JINGJU_JIANGXI, type: "website", title: "Jiangxi Buddhist Association — Jingju Temple", author: "Jiangxi Buddhist Association", url: "https://www.jxsfjxh.cn/c/1580404867831939074?pageNum=4&pageSize=9", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PUTONG_RUC, type: "website", title: "Renmin University Buddhist Studies — Yangqi Putong Temple", author: "Renmin University Buddhist Studies Institute", url: "https://isbrt.ruc.edu.cn/dtxx/rucfojiaoallcmsNews2569.htm", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FGS_VANCOUVER, type: "website", title: "Vancouver Fo Guang Shan — official site", author: "Vancouver Fo Guang Shan", url: "https://sites.google.com/view/vancouver-fo-guang-shan/home", publicationDate: "", reliability: "authoritative" },
    { id: SRC_IBPS_MONTREAL, type: "website", title: "IBPS Montreal — contact and visitor information", author: "IBPS Montreal", url: "https://ibpsmtl.org/contact-en/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DDM_ONTARIO, type: "website", title: "Dharma Drum Mountain Ontario — official center", author: "Dharma Drum Mountain Ontario", url: "https://www.ddmbaontario.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_HSI_LAI, type: "website", title: "Hsi Lai Temple — official site", author: "Fo Guang Shan Hsi Lai Temple", url: "https://www.hsilai.us/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DOJO_V_PROUDU, type: "website", title: "Dojo V Proudu — practice and teachers", author: "Dojo V Proudu", url: "https://www.zazen.cz/en.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BOUNDLESS_COPENHAGEN, type: "website", title: "Boundless Way Zen Copenhagen — calendar", author: "Boundless Way Zen Copenhagen", url: "https://copenhagenzen.com/kalender", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_BUDDHISTISK, type: "website", title: "Zen-Buddhistisk Forening — official site", author: "Zen-Buddhistisk Forening", url: "https://www.zenbuddhistiskforening.dk/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_AKAZIENZENDO, type: "website", title: "Akazienzendo — current practice", author: "Akazienzendo", url: "https://www.akazienzendo.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BODHIDHARMA_MUNICH, type: "website", title: "Bodhidharma Temple Munich — contact", author: "Bodhidharma Temple Munich", url: "https://www.buddhismusmuenchen.de/kontakt", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BODHIDHARMA_NUREMBERG, type: "website", title: "Bodhidharma Temple Nuremberg — contact", author: "Bodhidharma Temple Nuremberg", url: "https://www.buddhismusnuernberg.de/kontakt", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DHARMA_SANGHA_SCHWARZWALD, type: "website", title: "Dharma Sangha — current sesshin", author: "Dharma Sangha", url: "https://kurse.dharmaacademy.com/sesshin", publicationDate: "2026", reliability: "authoritative" },
    { id: SRC_CHOKA_SANGHA, type: "website", title: "Choka Sangha — current events", author: "Choka Sangha", url: "https://choka-sangha.de/veranstaltungen/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_DUSSELDORF, type: "website", title: "Zendo Düsseldorf — current practice", author: "Zendo Düsseldorf", url: "https://zen-duesseldorf.de/event/meditationsabend-36/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CITRUS_ZEN, type: "website", title: "Citrus Zen — practice and teacher", author: "Citrus Zen", url: "https://www.citruszen.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_COLUMBIA_PRIORY, type: "website", title: "Columbia Zen Buddhist Priory — schedule", author: "Columbia Zen Buddhist Priory", url: "https://columbiazen.org/coming-to-the-priory/schedule/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LINH_SON_AUSTIN, type: "website", title: "Linh-Sơn Austin — official temple", author: "Chùa Linh-Sơn Austin", url: "https://www.linhsonaustin.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_CHOBOJI, type: "website", title: "Dai Bai Zan Cho Bo Zen Ji — schedule", author: "Cho Bo Zen Ji", url: "https://choboji.org/schedule/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_HOLLOW_BONES, type: "website", title: "Hollow Bones — local sanghas", author: "Hollow Bones Zen", url: "https://hollowboneszen.org/local-sanghas/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KORINJI, type: "website", title: "Korinji — monastery and visits", author: "Korinji", url: "https://www.korinji.org/contact", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LINH_SON_DETROIT, type: "website", title: "Linh Son Detroit — official temple", author: "Linh Son Detroit", url: "https://linhsondetroit.net/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_LINH_SON_DICKINSON, type: "website", title: "Linh Son Dickinson — prayer times", author: "Linh Son Dickinson", url: "https://www.linhsondickinson.org/prayer-timing", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ANTAIJI_SITE, type: "website", title: "Antaiji — schedule and history", author: "Antaiji", url: "https://www.antaiji.org/en/schedule/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DAISEN_IN_SITE, type: "website", title: "Daisen-in — official visitor information", author: "Daisen-in", url: "https://daisen-in.net/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_EIHEIJI_SITE, type: "website", title: "Daihonzan Eiheiji — official site", author: "Daihonzan Eiheiji", url: "https://daihonzan-eiheiji.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ERINJI_SITE, type: "website", title: "Erin-ji — zazen and visitor information", author: "Erin-ji", url: "https://erinji.jp/zazen", publicationDate: "", reliability: "authoritative" },
    { id: SRC_FUKUSAI_NAGASAKI, type: "website", title: "Nagasaki official tourism — Fukusai-ji", author: "Nagasaki City", url: "https://www.at-nagasaki.jp/spot/120", publicationDate: "", reliability: "authoritative" },
    { id: SRC_GINKAKUJI_SITE, type: "website", title: "Shōkoku-ji — Ginkaku-ji official site", author: "Shōkoku-ji", url: "https://www.shokoku-ji.jp/en/ginkakuji/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_KLOSTER, type: "website", title: "Zen-Kloster — official site", author: "Zen-Kloster", url: "https://zen-kloster.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DAISHIN_ZEN, type: "website", title: "Daishin Zen — Zen Orte", author: "Daishin Zen", url: "https://daishinzen.de/zen-orte", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DAISHIN_ZEN_ULM, type: "website", title: "Daishin Zen Ulm — official site", author: "Daishin Zen Ulm", url: "https://daishin-zen-ulm.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENDO_SAAR, type: "website", title: "Zendo Saar — official site", author: "Zendo Saar", url: "https://zendo-saar.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_GEMEINSCHAFT_BERLIN, type: "website", title: "Zen-Gemeinschaft Berlin — official site", author: "Zen-Gemeinschaft Berlin", url: "https://zen-gemeinschaft-berlin.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_NEUMUEHLE_SAAR, type: "website", title: "Neumühle Saar — official site", author: "Neumühle Saar", url: "https://neumuehle-saar.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZENDOJO_FREIBURG, type: "website", title: "Zendojo Freiburg — official site", author: "Zendojo Freiburg", url: "https://meditation-zen.org/de/zendojofreiburg", publicationDate: "", reliability: "authoritative" },
    { id: SRC_HANNYA_KAI, type: "website", title: "Hannya Kai — official site", author: "Hannya Kai", url: "https://hannya-kai.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZEN_DOJO_OFFENBURG, type: "website", title: "Zen-Dojo Offenburg — official site", author: "Zen-Dojo Offenburg", url: "https://zen-dojo-offenburg.de/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SOJIJI_SITE, type: "website", title: "Sōji-ji — official zazen information", author: "Sōji-ji", url: "https://www.sojiji.jp/en/zazen/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SHOKOKUJI_SITE, type: "website", title: "Shōkoku-ji — official history", author: "Shōkoku-ji", url: "https://www.shokoku-ji.jp/en/about/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TENRYUJI_SITE, type: "website", title: "Tenryū-ji — official English site", author: "Tenryū-ji", url: "https://www.tenryuji.com/en/index.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TOFUKUJI_SITE, type: "website", title: "Tōfuku-ji — official English visitor guide", author: "Tōfuku-ji", url: "https://tofukuji.jp/guide/tour/en/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TOKEIJI_SITE, type: "website", title: "Tōkei-ji — official English site", author: "Tōkei-ji", url: "https://tokeiji.com/en", publicationDate: "", reliability: "authoritative" },
    { id: SRC_ZUIGANJI_SITE, type: "website", title: "Zuigan-ji — official English site", author: "Zuigan-ji", url: "https://www.zuiganji.or.jp/english/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BAEKDAMSA_TEMPLESTAY, type: "website", title: "Korea Templestay — Baekdamsa", author: "Korea Templestay", url: "https://baekdamsa.templestay.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BAEKYANGSA_VISITKOREA, type: "website", title: "VisitKorea — Baekyangsa", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=104966", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BEOMEOSA_SITE, type: "website", title: "Beomeosa — official temple guide", author: "Beomeosa", url: "https://www.beomeo.kr/about/sub9.php", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BEOPJUSA_JOGYE, type: "website", title: "Beopjusa — official site", author: "Beopjusa", url: "https://beopjusa.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JOGYE_ORDER, type: "website", title: "Jogye Order — Beopjusa directory", author: "Jogye Order of Korean Buddhism", url: "https://www.buddhism.or.kr/jongdan/sub1/sub1-9-2-5.php", publicationDate: "", reliability: "authoritative" },
    { id: SRC_NAGASAKI_CITY_ZEN, type: "website", title: "Nagasaki City — official temple information", author: "Nagasaki City", url: "https://en.at-nagasaki.jp/spot/96", publicationDate: "", reliability: "authoritative" },
    { id: "src_seikyuji_dojos", type: "website", title: "Seikyuji — dojos and Zen groups linked to the temple", author: "Templo Zen Seikyuji", url: "https://www.seikyuji.org/donde-practicar/", publicationDate: "", reliability: "authoritative" },

    { id: SRC_DAISHUIN_MYOSHINJI_MAP, type: "website", title: "Myōshin-ji — official precinct map", author: "Myōshin-ji", url: "https://www.myoshinji.or.jp/application/files/9316/4249/3315/myoshinji_map_new.pdf", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KINKAKUJI_SHOKOKU, type: "website", title: "Shōkoku-ji — official Rokuon-ji history", author: "Shōkoku-ji", url: "https://www.shokoku-ji.jp/en/kinkakuji/about/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KODAIJI_OFFICIAL, type: "website", title: "Kōdai-ji — official temple site", author: "Kōdai-ji", url: "https://www.kodaiji.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KOFUKUJI_NAGASAKI_CITY, type: "website", title: "Nagasaki City — Kōfuku-ji visitor information", author: "Nagasaki City", url: "https://en.at-nagasaki.jp/barrierfree/64161", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MANPUKUJI_OFFICIAL, type: "website", title: "Manpuku-ji — official Ōbaku temple site", author: "Manpuku-ji", url: "https://www.obakusan.or.jp/en/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MEIGETSUIN_JNTO, type: "website", title: "Japan National Tourism Organization — Meigetsu-in", author: "Japan National Tourism Organization", url: "https://www.japan.travel/en/spot/1583/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_MYOSHINJI_PUBLIC_ZAZEN, type: "website", title: "Myōshin-ji — public zazen information", author: "Myōshin-ji", url: "https://www.myoshinji.or.jp/english/zen/info.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_NANZENJI_OFFICIAL, type: "website", title: "Nanzen-ji — official visiting information", author: "Nanzen-ji", url: "https://nanzenji.or.jp/about_rinzaishu/visit", publicationDate: "", reliability: "authoritative" },
    { id: SRC_RYOANJI_OFFICIAL, type: "website", title: "Ryōan-ji — official visitor information", author: "Ryōan-ji", url: "https://www.ryoanji.jp/smph/eng/rode/index.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_RYUTAKUJI_MISHIMA_CITY, type: "website", title: "Izu official tourism — Ryūtaku-ji", author: "Beautiful Izu regional tourism portal", url: "https://b-izu.com/spot/post-4909/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SANUN_ZENDO_SANBO, type: "website", title: "Sanbo Zen International — San'un Zendo", author: "Sanbo Zen International", url: "https://sanbo-zen-international.org/en/sanun-zendo/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SHOFUKUJI_KOBE_OFFICIAL, type: "website", title: "Shōfuku-ji, Kobe — official temple site", author: "Shōfuku-ji", url: "https://www.zen-shofukuji.jp/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SHOFUKUJI_NAGASAKI_CITY, type: "website", title: "Nagasaki City — Shōfuku-ji visitor information", author: "Nagasaki City", url: "https://en.at-nagasaki.jp/barrierfree/64117", publicationDate: "", reliability: "authoritative" },
    { id: SRC_BORIMSA_OFFICIAL, type: "website", title: "Borimsa — official temple site", author: "Borimsa", url: "https://www.borimsa.org/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BULYEONGSA, type: "website", title: "VisitKorea — Bulyeongsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=94557", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_DAESEUNGSA, type: "website", title: "VisitKorea — Daeseungsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=91058", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_GIRIMSA, type: "website", title: "VisitKorea — Girimsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=92300", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_GWANCHOKSA, type: "website", title: "VisitKorea — Gwanchoksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=95051", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_HEUNGGUKSA, type: "website", title: "VisitKorea — Heungguksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=84111", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_HWAGYESA, type: "website", title: "VisitKorea — Hwagyesa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=90168", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_NAESOSA, type: "website", title: "VisitKorea — Naesosa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110754", publicationDate: "", reliability: "authoritative" },
    { id: SRC_DAEGU_PAGYESA, type: "website", title: "Daegu Tourism — Pagye Temple", author: "Daegu Foundation for Culture & Arts", url: "https://en.visitdaegu.or.kr/company/9?page=2&sca=%EC%9C%A0%EB%A3%8C%C2%B7%EC%B2%B4%ED%97%98%EA%B4%80%EA%B4%91", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SUDOSA_OFFICIAL, type: "website", title: "Sudo-sa — official temple site", author: "Sudo-sa", url: "http://www.sudosa.or.kr/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_TAPSA_OFFICIAL, type: "website", title: "Tapsa — official temple site", author: "Tapsa", url: "http://www.maisantapsa.com/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_YEONGGUKSA, type: "website", title: "VisitKorea — Yeongguksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=73758", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SONGGWANGSA, type: "website", title: "VisitKorea — Songgwangsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110711", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_HAEINSA, type: "website", title: "VisitKorea — Haeinsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=351&vcontsId=111156", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_TONGDOSA, type: "website", title: "VisitKorea — Tongdosa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110668", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_WOLJEONGSA, type: "website", title: "VisitKorea — Woljeongsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110826", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_MAGOKSA, type: "website", title: "VisitKorea — Magoksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110940", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BUSEOKSA, type: "website", title: "VisitKorea — Buseoksa Temple, Yeongju", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=111132", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_DAEHEUNGSA, type: "website", title: "VisitKorea — Daeheungsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?menuSn=351&vcontsId=104832", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_GOLGULSA, type: "website", title: "VisitKorea — Golgulsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=104360", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BULGUKSA, type: "website", title: "VisitKorea — Templestay temple directory", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=139770", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SEONUNSA, type: "website", title: "VisitKorea — Templestay temple directory", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=139770", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BONGEUNSA, type: "website", title: "VisitKorea — Bongeunsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=104722", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SILSANGSA, type: "website", title: "VisitKorea — Silsangsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=104736", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SANGWONSA, type: "website", title: "VisitKorea — Sangwonsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=111277", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SEONAMSA, type: "website", title: "VisitKorea — Seonamsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?menuSn=351&vcontsId=110583", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_JOGYESA, type: "website", title: "VisitKorea — Jogyesa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=111552", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SUDEOKSA, type: "website", title: "Sudeoksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=96644", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_DONGHWASA, type: "website", title: "Donghwasa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=110571", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SSANGGYE_SA, type: "website", title: "Ssanggyesa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=111834", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_YONGJUSA, type: "website", title: "Yongjusa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=351&vcontsId=95143", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_SINHEUNGSA, type: "website", title: "Sinheungsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=110707", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_JIKJISA, type: "website", title: "Jikjisa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=94392", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_EUNHAESA, type: "website", title: "Eunhaesa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=89729", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BULGUKSA_OFFICIAL, type: "website", title: "Bulguksa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=94395", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_GOUNSA, type: "website", title: "Gounsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=90655", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_GEUMSANSA, type: "website", title: "Geumsansa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=93836", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_HWAEOMSA, type: "website", title: "Hwaeomsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=111755", publicationDate: "", reliability: "authoritative" },
    { id: SRC_NYJ_BONGSEONSA, type: "website", title: "Namyangju City — Bongseonsa Temple", author: "Namyangju City", url: "https://www.nyj.go.kr/eng/contents.do?key=4417", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JOGYE_BONGAMSA, type: "website", title: "Jogye Order — Seon centers, including Bongamsa", author: "Jogye Order of Korean Buddhism", url: "https://jokb.org/bbs/content.php?co_id=3040", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_BONGWONSA, type: "website", title: "Bongwonsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=89961", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KTO_JEONDEUNGSA, type: "website", title: "Jeondeungsa Temple", author: "Korea Tourism Organization", url: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?menuSn=351&vcontsId=110726", publicationDate: "", reliability: "authoritative" },
    { id: SRC_JOCHIJI_SITE, type: "website", title: "Jōchi-ji — official visitor information", author: "Jōchi-ji", url: "https://jochiji.com/en/en", publicationDate: "", reliability: "authoritative" },
    { id: SRC_KENNINJI_SITE, type: "website", title: "Kennin-ji — zazen experience", author: "Kennin-ji", url: "https://www.kenninji.jp/experience/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_HOFUKUJI_OKAYAMA, type: "website", title: "Okayama official tourism — Hōfuku-ji", author: "Okayama Prefecture Tourism Federation", url: "https://www.okayama-japan.jp/en/spot/10606", publicationDate: "", reliability: "authoritative" },
    { id: SRC_PRAIRIE_ZEN, type: "website", title: "Prairie Zen Center — current schedule", author: "Prairie Zen Center", url: "https://prairiezen.org/Schedules.html", publicationDate: "", reliability: "authoritative" },
    { id: SRC_RMERC, type: "website", title: "Rocky Mountain Ecodharma Retreat Center — calendar", author: "Rocky Mountain Ecodharma Retreat Center", url: "https://rmerc.org/calendar/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SAGE_TAOS, type: "website", title: "Sage Institute — mission and programs", author: "Sage Institute", url: "https://www.sagetaos.com/about", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SLO_ZEN, type: "website", title: "San Luis Obispo Zen Circle — practice", author: "San Luis Obispo Zen Circle", url: "https://www.slozc.org/home", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SANTA_ROSA_ZEN, type: "website", title: "Santa Rosa Zen Group — practice and identity", author: "Santa Rosa Zen Group", url: "https://www.santarosazengroup.org/about", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SOUTHERN_WV_ZEN, type: "website", title: "Southern West Virginia Zen Group — current practice", author: "Southern West Virginia Zen Group", url: "https://southernwvzen.org/index.php/how-to-practice-zazen/", publicationDate: "", reliability: "authoritative" },
    { id: SRC_SWEETWATER_ZEN, type: "website", title: "Sweetwater Zen Center — current schedule", author: "Sweetwater Zen Center", url: "https://www.swzc.org/visit-us/event-schedule", publicationDate: "", reliability: "authoritative" },
    {
      id: SRC_FOGUANG,
      type: "website",
      title:
        "Fo Guang Shan / Buddha's Light International Association — global temples and IBPS chapters",
      author: "Fo Guang Shan Monastery",
      url: "https://www.fgs.org.tw/en/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_BOUNDLESS_WAY,
      type: "website",
      title:
        "Boundless Way Zen — affiliate sanghas (Ford / Blacker, hybrid Sōtō-Linji lineage)",
      author: "Boundless Way Zen Temple",
      url: "https://boundlessway.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_PEACEMAKERS,
      type: "website",
      title: "Zen Peacemakers — affiliate network (Bernie Glassman / ZPO)",
      author: "Zen Peacemakers International",
      url: "https://zenpeacemakers.org/about/affiliates/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ORDINARY_MIND,
      type: "website",
      title:
        "Ordinary Mind Zen School — affiliated sanghas (Joko Beck lineage)",
      author: "Ordinary Mind Zen School",
      url: "https://ordinarymind.com/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_ZEN_STUDIES_SOCIETY,
      type: "website",
      title:
        "Zen Studies Society — Dai Bosatsu Zendo Kongo-ji & New York Zendo Shobo-ji (Rinzai)",
      author: "Zen Studies Society",
      url: "https://zenstudies.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_CHOZEN_JI,
      type: "website",
      title: "Daihonzan Chozenji — International Zen Dōjō (Omori Sogen Rinzai)",
      author: "Chozenji",
      url: "https://chozen-ji.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_GLOBAL_ZEN_RESEARCH,
      type: "editorial",
      title: "Global Zen practice-centre research notes (2026-05-06)",
      author: "zenlineage.org research",
      url: null,
      publicationDate: "2026",
      reliability: "popular",
    },
    {
      id: SRC_BUDISMO_COM,
      type: "website",
      title: "budismo.com — Directorio de Centros y Templos Budistas",
      author: "budismo.com",
      url: "https://www.budismo.com/directorios/",
      publicationDate: "2026",
      reliability: "popular",
    },
    {
      id: "src_dojo_zen_laciotat_blog",
      type: "website",
      title: "Dojo Zen de Ceyreste et La Ciotat — local practice information",
      author: "Dojo Zen de Ceyreste et La Ciotat",
      url: "https://dojozenlaciotatceyreste.blogspot.com/p/dojo-zen-de-ceyreste-et-la-ciotat.html",
      publicationDate: "",
      reliability: "primary",
    },
    {
      id: "src_pine_mountain_buddhist_temple",
      type: "website",
      title: "Pine Mountain Buddhist Temple — practice and visitor information",
      author: "Pine Mountain Buddhist Temple",
      url: "https://pinemtnbuddhisttemple.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_redding_zen_buddhist_priory",
      type: "website",
      title: "Redding Zen Buddhist Priory — practice schedule and affiliation",
      author: "Redding Zen Buddhist Priory",
      url: "https://reddingzen.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_mt_adams_buddhist_temple",
      type: "website",
      title: "Mt. Adams Zen Buddhist Temple — schedule",
      author: "Mt. Adams Zen Buddhist Temple",
      url: "https://mtadamsbuddhisttemple.org/schedule/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_wallowa_buddhist_temple",
      type: "website",
      title: "Wallowa Buddhist Temple — practice and visitor information",
      author: "Wallowa Buddhist Temple",
      url: "https://wallowabuddhisttemple.org/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_plum_blossom_sangha",
      type: "website",
      title: "Plum Blossom Sangha — visit and practice information",
      author: "Plum Blossom Sangha",
      url: "https://plumblossomsangha.org/visit-us/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_uubf_practice_groups",
      type: "website",
      title: "Unitarian Universalist Buddhist Fellowship — practice groups",
      author: "Unitarian Universalist Buddhist Fellowship",
      url: "https://uubf.org/wp/uubf-practice-groups/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_PROVIDENCE_ZEN_CENTER,
      type: "website",
      title: "Providence Zen Center — meditation schedule and contact details",
      author: "Providence Zen Center",
      url: "https://providencezen.org/schedule",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_FALAISE_VERTE,
      type: "website",
      title: "Centre Zen de la Falaise Verte — Rinzai practice, sesshin and zazenkai",
      author: "Centre Zen de la Falaise Verte",
      url: "https://www.falaiseverte.org/zen/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_SANZU_TIANZHU,
      type: "website",
      title: "Tianzhu Mountain scenic area — Sanzu Temple",
      author: "Tianzhu Mountain Scenic Area",
      url: "https://www.tzs.com.cn/site-ah-tzs/node/306_77",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: SRC_TSZ_SHAN,
      type: "website",
      title: "Tsz Shan Monastery — programmes and visitor registration",
      author: "Tsz Shan Monastery",
      url: "https://www.tszshan.org/home/new/en/event.php?cat=cat6",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: SRC_FGS_NEW_ZEALAND,
      type: "website",
      title: "Fo Guang Shan New Zealand — locations and current events",
      author: "Fo Guang Shan New Zealand",
      url: "https://fgs.org.nz/english/contact-us/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_order_interbeing_indonesia",
      type: "website",
      title: "Order of Interbeing Indonesia — practice schedule",
      author: "Order of Interbeing Indonesia",
      url: "https://cms.ordinterbeing.id/jadwal/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_zen_center_manila",
      type: "website",
      title: "Zen Center Manila — current practice and affiliate information",
      author: "Zen Center Manila",
      url: "https://zencentermanila.wordpress.com/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_zen_manila_affiliates",
      type: "website",
      title: "Zen Center Manila — affiliate groups",
      author: "Zen Center Manila",
      url: "https://zencentermanila.wordpress.com/zen-centers/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_baguio_zen_center",
      type: "website",
      title: "Baguio Zen Center — lineage history and affiliated sangha",
      author: "Baguio Zen Center",
      url: "https://baguiozencenter.wordpress.com/zen-in-the-philippines/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_baguio_zen_schedule",
      type: "website",
      title: "Baguio Zen Center — sitting schedule and venue",
      author: "Baguio Zen Center",
      url: "https://baguiozencenter.wordpress.com/schedule/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_ocean_sky_chan_events",
      type: "website",
      title: "Ocean Sky Chan Monastery — events and retreats",
      author: "Ocean Sky Chan Monastery",
      url: "https://oceanskyzen.org/wp/?page_id=149",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_ddm_singapore_events",
      type: "website",
      title: "Dharma Drum Singapore — Chan practice events",
      author: "Dharma Drum Singapore",
      url: "https://ddsingapore.org/en/event-type/%E7%A6%85%E4%BF%AE",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_kosen_sangha_events_2026",
      type: "website",
      title: "Kōsen Sangha Argentina — 2026 events calendar",
      author: "Kōsen Sangha Argentina",
      url: "https://zen-deshimaru.com.ar/eventos/lista/?tribe-bar-date=2026-03-01",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_zen_philippines",
      type: "website",
      title: "Zen Philippines — About and practice information",
      author: "Zen Philippines",
      url: "https://www.zenphilippines.org.ph/about-us",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_kycl_singapore",
      type: "website",
      title: "Kwan Yin Chan Lin — Singapore contact details",
      author: "Kwan Yin Chan Lin Zen Meditation Centre",
      url: "https://www.kyclzen.sg/singapore",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_bodhi_zendo",
      type: "website",
      title: "Bodhi Zendo — training and retreat information",
      author: "Bodhi Zendo",
      url: "https://www.bodhizendo.org/index.php/en/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_ddm_malaysia",
      type: "website",
      title: "Dharma Drum Mountain Malaysia — contact and activities",
      author: "Dharma Drum Mountain Malaysia",
      url: "https://ddmmy.org/contact-us/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_fgs_malaysia_directory",
      type: "website",
      title: "Fo Guang Shan Malaysia — temple directory",
      author: "Fo Guang Shan Malaysia",
      url: "https://pjfgs.org/online-donation/fgs-directory/",
      publicationDate: "",
      reliability: "authoritative",
    },
    {
      id: "src_kycl_malaysia",
      type: "website",
      title: "Kwan Yin Chan Lin — Malaysia centres",
      author: "Kwan Yin Chan Lin",
      url: "https://www.kyclzen.sg/malaysia",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_ocean_sky_chan",
      type: "website",
      title: "Ocean Sky Chan Monastery — contact and programmes",
      author: "Ocean Sky Chan Monastery",
      url: "https://oceanskyzen.org/wp/?page_id=99",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_fgs_philippines",
      type: "website",
      title: "Fo Guang Shan Philippines — Mabuhay Temple",
      author: "Fo Guang Shan Philippines",
      url: "https://fgs-ph.com/",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_ddm_singapore",
      type: "website",
      title: "Dharma Drum Singapore — contact and programmes",
      author: "Dharma Drum Singapore",
      url: "https://ddsingapore.org/contact-us",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    {
      id: "src_fgs_singapore",
      type: "website",
      title: "Fo Guang Shan Singapore — contact and visitor information",
      author: "Fo Guang Shan Singapore",
      url: "https://www.fgs.sg/contact-1",
      publicationDate: "2026",
      reliability: "authoritative",
    },
    { id: "src_eisenbuch_fumonji", type: "website", title: "Zen-Zentrum Eisenbuch & Zen-Kloster Daihizan Fumonji — official site", author: "Zen-Zentrum Eisenbuch", url: "https://www.eisenbuch.de/jahresprogramm/", publicationDate: "2026", reliability: "authoritative" },
    { id: "src_zenvereinigung_berlin", type: "website", title: "Zen-Vereinigung Berlin — official dojo site", author: "Zen-Vereinigung Berlin", url: "https://www.zen-vereinigung-berlin.de/", publicationDate: "", reliability: "authoritative" },
    { id: "src_genjoan_hamburg", type: "website", title: "Zen Sangha GenjoAn — official community site", author: "Zen Sangha GenjoAn", url: "https://genjoan.net/", publicationDate: "", reliability: "authoritative" },
    { id: "src_zendo_koeln", type: "website", title: "Zendo Köln e.V. — official dojo site", author: "Zendo Köln e.V.", url: "https://www.zendo-koeln.de/", publicationDate: "", reliability: "authoritative" },
    { id: "src_zendo_wuppertal", type: "website", title: "Zendo Wuppertal e.V. — official dojo site", author: "Zendo Wuppertal e.V.", url: "https://www.zendo-wuppertal.de/", publicationDate: "", reliability: "authoritative" },
    { id: "src_zenkreis_kassel", type: "website", title: "Zen-Kreis-Kassel e.V. — official group site", author: "Zen-Kreis-Kassel e.V.", url: "https://www.zen-kreis-kassel.de/", publicationDate: "", reliability: "authoritative" },

];

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
    sourceId: SRC_EIHEIJI_SITE,
    sourceExcerpt:
      "Eihei-ji’s official site provides current temple and practice-stay information. Visitor hours are not presented as a meditation schedule.",
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
    sourceId: SRC_SOJIJI_SITE,
    sourceExcerpt:
      "Sōji-ji is a Sōtō head temple in Tsurumi, Yokohama. Its official site lists monthly Saturday zazen for visitors (9:00–12:00; ¥200).",
    url: "https://www.sojiji.jp/en/zazen/",
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
    sourceId: SRC_RINNOU,
    sourceExcerpt:
      "The Rinzai-Ōbaku federation identifies Daitoku-ji as the head temple of its Rinzai school. The complex and its subtemples have separate access arrangements; no single public zazen schedule is asserted.",
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
    sourceId: SRC_MYOSHINJI_PUBLIC_ZAZEN,
    sourceExcerpt: "Myōshin-ji’s official page confirms monthly public Zendō-kai on the 7th and 8th, with zazen and teishō, plus selected Saturday sessions. Reservations/capacity, Japanese-language instruction, and schedule exceptions apply; confirm dates with the temple.",
    url: "https://www.myoshinji.or.jp/english/zen/info.html",
    practiceDetails: { schedule: { value: "Public Zendō-kai monthly on the 7th and 8th (zazen and teishō); selected Saturday zazenkai also offered. Advance reservation and capacity limits apply; Japanese-language instruction only. Confirm dates with the temple.", sourceUrl: "https://www.myoshinji.or.jp/english/zen/info.html", checkedOn: "2026-10-08" } },
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
    sourceId: SRC_TOFUKUJI_SITE,
    sourceExcerpt:
      "Tōfuku-ji is a Rinzai Zen temple in Kyoto. Official information covers visitor access and events; no recurring public zazen schedule is listed.",
    url: "https://tofukuji.jp/guide/tour/en/",
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
    sourceId: SRC_NANZENJI_OFFICIAL,
    sourceExcerpt: "Nanzen-ji’s official site provides current visiting hours and admission and confirms visitor access to temple areas. No recurring public zazen schedule is established by the reviewed official information.",
    url: "https://nanzenji.or.jp/about_rinzaishu/visit",
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
    sourceId: SRC_KENNINJI_SITE,
    sourceExcerpt:
      "Kennin-ji’s official experience page publishes a free second-Sunday zazen program, with seasonal exceptions, and the Rinzai federation confirms its head-temple status.",
    url: "https://www.kenninji.jp/experience/",
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
    sourceId: SRC_TENRYUJI_SITE,
    sourceExcerpt:
      "Tenryū-ji is a Rinzai Zen temple in Kyoto. The official site provides visitor information; it does not list a public sitting schedule.",
    url: "https://www.tenryuji.com/en/index.html",
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
    sourceId: SRC_SHOKOKUJI_SITE,
    sourceExcerpt:
      "Shōkoku-ji is the head temple of its Rinzai branch in Kyoto. Official information describes access for special exhibitions; no recurring public zazen schedule is listed.",
    url: "https://www.shokoku-ji.jp/en/about/",
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
    sourceId: SRC_DAISHUIN_MYOSHINJI_MAP,
    sourceExcerpt: "Myōshin-ji’s official precinct map places Daishū-in among the complex subtemples. Sōkō Morinaga’s biography is historical context; neither source establishes public access to this subtemple or a recurring practice schedule.",
    // Daishū-in has no website of its own; link the article documenting it.
    url: "https://www.myoshinji.or.jp/application/files/9316/4249/3315/myoshinji_map_new.pdf",
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
    sourceId: SRC_MANPUKUJI_OFFICIAL,
    sourceExcerpt: "Manpuku-ji’s official site identifies the Ōbaku head temple and offers visitor-facing information. Heritage and visitor access do not establish a recurring public zazen schedule.",
    url: "https://www.obakusan.or.jp/en/",
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
    sourceId: SRC_SANUN_ZENDO_SANBO,
    sourceExcerpt: "Sanbo Zen International identifies San’un Zendo in Kamakura as its headquarters and central dojo. This confirms institutional identity; current public visitor access and recurring open sessions were not established in the reviewed material.",
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
    // Schaumburgweg 3, 51545 Waldbröl.
    lat: 50.87839,
    lng: 7.62665,
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
    // OSM node for Chùa Từ Hiếu, Đường Thanh Hải, Phường Thủy Xuân. The
    // previous pin sat ~1.9km west, in open ground short of the temple.
    lat: 16.43891,
    lng: 107.571989,
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
    sourceId: SRC_KTO_SONGGWANGSA,
    sourceExcerpt: "VisitKorea identifies Songgwangsa as one of Korea’s Three Jewel Temples, gives visitor information, and notes its templestay program. This supports the temple’s historic Buddhist identity and visitor access; the page does not establish a recurring public Seon schedule.",
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
    sourceId: SRC_KTO_HAEINSA,
    sourceExcerpt: "VisitKorea describes Haeinsa’s 802 foundation, heritage collections, address, and visitor hours. Its templestay link supports a visitor program; no recurring public Seon schedule is established here.",
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
    sourceId: SRC_KTO_TONGDOSA,
    sourceExcerpt: "VisitKorea describes Tongdosa as a historic temple and UNESCO site, gives visitor information, and confirms a templestay program. This does not establish a recurring public Seon schedule.",
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
    sourceId: SRC_KTO_BULGUKSA,
    sourceExcerpt: "VisitKorea’s current templestay directory lists Bulguksa with its address and temple website. This verifies a visitor program listing, not recurring public Seon practice.",
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
    sourceId: SRC_BEOMEOSA_SITE,
    sourceExcerpt:
      "Beomeo-sa (범어사) is a Jogye temple on Mt. Geumjeongsan in Busan. Its official site describes Seon culture education and heritage; no recurring public practice schedule is listed.",
    url: "https://www.beomeo.kr/about/sub9.php",
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
    sourceId: SRC_KTO_JOGYESA,
    sourceExcerpt: "VisitKorea identifies Jogyesa as the Jogye Order’s main temple, gives its address and year-round access. This confirms institutional identity and visitor access, not a recurring public Seon schedule.",
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
    sourceId: SRC_KTO_HWAGYESA,
    sourceExcerpt:
      "VisitKorea supports Hwagyesa’s identity, address, visitor information and templestay context. This does not establish current monastic training access or a recurring public Seon schedule.",
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
    sourceId: SRC_KTO_SEONAMSA,
    sourceExcerpt: "VisitKorea documents Seonamsa’s heritage, location, and visitor access. Its UNESCO mountain-monastery recognition is historical/institutional context, not evidence of a recurring public Seon schedule.",
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
    sourceId: SRC_PROVIDENCE_ZEN_CENTER,
    sourceExcerpt:
      "Providence Zen Center publishes weekly in-person meditation, chanting, and sitting schedules and gives its address as 99 Pound Rd, Cumberland, Rhode Island.",
    url: "https://providencezen.org/schedule",
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
    sourceId: SRC_SHAOLIN_ZHENGZHOU,
    sourceExcerpt:
      "Zhengzhou government identifies Shaolin as a historic Chan monastery and visitor site in Dengfeng. Published opening hours are visitor hours, not a public meditation schedule (checked 2026-10-08).",
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
    // Wikipedia infobox for 南華寺 on Mount Caoxi, Qujiang, Shaoguan. The
    // previous pin sat ~23km north-east of the monastery.
    lat: 24.64916667,
    lng: 113.63138889,
    region: "Guangdong Province",
    country: "China",
    foundedYear: 502,
    foundedPrecision: "circa",
    schoolSlug: "early-chan",
    founderSlug: "dajian-huineng",
    status: "active",
    sourceId: SRC_NANHUA_SHAOGUAN,
    sourceExcerpt:
      "Shaoguan government identifies Nanhua as the Chan ancestral temple where Huineng taught; government reports document current 2025–2026 temple events, but no weekly public meditation schedule.",
    url: "https://www.sg.gov.cn/sgly/yzsg/msgj/content/post_1960276.html",
  },

  // ─── Ancestral seats of the Chan houses ──────────────────────────────
  // The mountains where the lineages this atlas charts actually began.
  // Coordinates are Wikipedia infobox values, cross-checked against the
  // OSM node for each temple's native name; where the two disagreed the
  // temple node won and the discrepancy is noted on the entry.
  //
  // School assignment follows the house whose ancestral seat the temple
  // is, rather than the generic `chan` bucket, where the sources support
  // that precision — a temple that is the cradle of a house should say so.
  {
    slug: "sizu-temple",
    names: [
      { locale: "en", value: "Sizu Temple (Temple of the Fourth Patriarch)" },
      { locale: "zh", value: "四祖寺" },
    ],
    lat: 30.120729,
    lng: 115.792178,
    region: "Hubei",
    country: "China",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "early-chan",
    founderSlug: "dayi-daoxin",
    status: "active",
    sourceId: SRC_SIZU_TEMPLE_SITE,
    sourceExcerpt:
      "Sizu Temple's own history describes the Huangmei monastery and its rebuilding. This historical page does not confirm a current visitor schedule (checked 2026-10-08).",
    url: "https://www.hmszs.org/110/2013/03/20130327288.html",
    geoPrecision: "exact",
  },
  {
    slug: "wuzu-temple",
    names: [
      { locale: "en", value: "Wuzu Temple (Temple of the Fifth Patriarch)" },
      { locale: "zh", value: "五祖寺" },
    ],
    lat: 30.191008,
    lng: 115.947831,
    region: "Hubei",
    country: "China",
    foundedYear: 654,
    foundedPrecision: "circa",
    schoolSlug: "early-chan",
    founderSlug: "daman-hongren",
    status: "active",
    sourceId: SRC_WUZU_HUBEI,
    sourceExcerpt:
      "The Hubei Buddhist Association identifies Wuzu Temple in Huangmei with Fifth Patriarch Hongren and the East Mountain Chan tradition. No current public practice schedule was verified (checked 2026-10-08).",
    url: "https://www.hbsfjxh.cn/article.html?id=6964749192627490816",
    geoPrecision: "exact",
  },
  {
    slug: "sanzu-temple",
    names: [
      { locale: "en", value: "Sanzu Temple (Temple of the Third Patriarch)" },
      { locale: "zh", value: "三祖寺" },
    ],
    lat: 30.671763,
    lng: 116.502287,
    region: "Anhui",
    country: "China",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "early-chan",
    founderSlug: "jianzhi-sengcan",
    status: "active",
    sourceId: SRC_SANZU_TIANZHU,
    sourceExcerpt:
      "The Tianzhu Mountain scenic-area authority identifies Sanzu Temple as a Chan ancestral site associated with Third Patriarch Sengcan. It gives visitor information for the area, but no current public meditation schedule was verified (checked 2026-10-08).",
    url: "https://www.tzs.com.cn/site-ah-tzs/node/306_77",
    geoPrecision: "exact",
  },
  {
    slug: "guoen-temple",
    names: [
      { locale: "en", value: "Guoen Temple" },
      { locale: "zh", value: "國恩寺" },
    ],
    lat: 22.591803,
    lng: 112.223499,
    region: "Guangdong",
    country: "China",
    foundedYear: 683,
    foundedPrecision: "circa",
    schoolSlug: "early-chan",
    founderSlug: "dajian-huineng",
    status: "active",
    sourceId: SRC_GUOEN_XINXING,
    sourceExcerpt:
      "Xinxing County’s archive identifies Guoen Temple at Longshan with Sixth Patriarch Huineng and as one of the principal Chan ancestral temples. No current public meditation timetable was found.",
    url: "https://oa.xinxing.gov.cn/info/19564",
    geoPrecision: "exact",
  },
  {
    slug: "guangxiao-temple-guangzhou",
    names: [
      { locale: "en", value: "Guangxiao Temple" },
      { locale: "zh", value: "光孝寺" },
    ],
    lat: 23.1321,
    lng: 113.251,
    region: "Guangdong",
    country: "China",
    foundedYear: 401,
    foundedPrecision: "circa",
    schoolSlug: "early-chan",
    status: "active",
    sourceId: SRC_GUANGXIAO_GUANGZHOU,
    sourceExcerpt:
      "Guangzhou government identifies Guangxiao as an active religious site and Chan ancestral temple where Huineng was ordained, at 109 Guangxiao Road. Visitor hours are not a meditation schedule.",
    url: "https://www.gz.gov.cn/zlgz/gzly/wzgz/zjcs/fj/content/post_7760653.html",
    geoPrecision: "exact",
  },
  {
    slug: "jingju-temple-jian",
    names: [
      { locale: "en", value: "Jingju Temple" },
      { locale: "zh", value: "淨居寺" },
    ],
    lat: 27.063644,
    lng: 115.05947,
    region: "Jiangxi",
    country: "China",
    foundedYear: 705,
    foundedPrecision: "circa",
    schoolSlug: "qingyuan-line",
    founderSlug: "qingyuan-xingsi",
    status: "active",
    sourceId: SRC_JINGJU_JIANGXI,
    sourceExcerpt:
      "The Jiangxi Buddhist Association lists Qingyuan Mountain Jingju Temple, the historic seat associated with Qingyuan Xingsi. One dated 2025 retreat was found; a recurring current schedule remains unverified.",
    url: "https://www.jxsfjxh.cn/c/1580404867831939074?pageNum=4&pageSize=9",
    geoPrecision: "exact",
  },
  {
    slug: "nantai-temple",
    names: [
      { locale: "en", value: "Nantai Temple" },
      { locale: "zh", value: "南臺寺" },
    ],
    lat: 27.265106,
    lng: 112.716444,
    region: "Hunan",
    country: "China",
    foundedYear: 502,
    foundedPrecision: "circa",
    schoolSlug: "qingyuan-line",
    founderSlug: "shitou-xiqian",
    status: "active",
    sourceId: SRC_NANTAI_HENGYANG,
    sourceExcerpt:
      "Hengyang government identifies Nantai Temple on Mount Heng with Shitou Xiqian and the Caodong, Yunmen, and Fayan Chan lineages. No current public practice schedule was verified (checked 2026-10-08).",
    url: "https://www.hengyang.gov.cn/hyly/hyly/xx/20200111/i56156.html",
    geoPrecision: "exact",
  },
  {
    slug: "baizhang-temple",
    names: [
      { locale: "en", value: "Baizhang Temple" },
      { locale: "zh", value: "百丈寺" },
    ],
    lat: 28.699423,
    lng: 114.791099,
    region: "Jiangxi",
    country: "China",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "nanyue-line",
    founderSlug: "baizhang-huaihai",
    status: "active",
    sourceId: SRC_BAIZHANG_JIANGXI_GOV,
    sourceExcerpt:
      "A 2012 Fengxin County People's Congress account identifies Baizhang Temple as a Chan ancestral site and reports its reopening to visitors in 2011; current visiting arrangements remain unconfirmed (checked 2026-10-08).",
    url: "https://www.jxrd.gov.cn/system/2012/11/23/012188560.shtml",
    geoPrecision: "exact",
  },
  {
    slug: "dongshan-puli-temple",
    names: [
      { locale: "en", value: "Dongshan Puli Temple" },
      { locale: "zh", value: "洞山普利禪寺" },
    ],
    lat: 28.522237,
    lng: 114.86078,
    region: "Jiangxi",
    country: "China",
    foundedYear: 859,
    foundedPrecision: "exact",
    schoolSlug: "caodong",
    founderSlug: "dongshan-liangjie",
    status: "active",
    sourceId: SRC_DONGSHAN_JIANGXI_BUDDHIST,
    sourceExcerpt:
      "The Jiangxi Buddhist Association identifies Dongshan Puli Temple in Yifeng as the Caodong ancestral temple, founded by Dongshan Liangjie in 859 and rebuilt from 2010 (checked 2026-10-08).",
    url: "https://www.jxsfjxh.cn/a/1625134274018217986",
    // OSM resolves 洞山 only to the village that takes its name from the
    // mountain; the temple sits in that village, ~21km from Yifeng town.
    geoPrecision: "city",
  },
  {
    slug: "caoshan-baoji-temple",
    names: [
      { locale: "en", value: "Caoshan Baoji Temple" },
      { locale: "zh", value: "曹山寶積寺" },
    ],
    lat: 27.562153,
    lng: 116.108355,
    region: "Jiangxi",
    country: "China",
    foundedYear: 870,
    foundedPrecision: "circa",
    schoolSlug: "caodong",
    founderSlug: "caoshan-benji",
    status: "active",
    sourceId: SRC_CAOSHAN_JIANGXI_BUDDHIST,
    sourceExcerpt:
      "The Jiangxi Buddhist Association identifies Caoshan Baoji Temple in Yihuang as a Caodong ancestral temple and gives its contact details (checked 2026-10-08).",
    url: "https://www.jxsfjxh.cn/a/1602486239564070914",
    geoPrecision: "exact",
  },
  {
    slug: "miyin-temple",
    names: [
      { locale: "en", value: "Miyin Temple" },
      { locale: "zh", value: "密印寺" },
    ],
    lat: 28.17666667,
    lng: 111.97111111,
    region: "Hunan",
    country: "China",
    foundedYear: 807,
    foundedPrecision: "circa",
    schoolSlug: "guiyang",
    founderSlug: "guishan-lingyou",
    status: "active",
    sourceId: SRC_MIYIN_HUNAN,
    sourceExcerpt:
      "Hunan's culture and tourism authority identifies Weishan Miyin Temple as the ancestral temple of the Guiyang Chan school. No current public meditation schedule was verified (checked 2026-10-08).",
    url: "https://whhlyt.hunan.gov.cn/whhlyt/news/sxxw/201909/t20190910_5466705.html",
    geoPrecision: "exact",
  },
  {
    slug: "putong-temple-yangqi",
    names: [
      { locale: "en", value: "Putong Temple (Mount Yangqi)" },
      { locale: "zh", value: "楊岐普通寺" },
    ],
    lat: 27.836674,
    lng: 113.8967,
    region: "Jiangxi",
    country: "China",
    foundedYear: 753,
    foundedPrecision: "exact",
    schoolSlug: "yangqi-line",
    founderSlug: "yangqi-fanghui",
    status: "active",
    sourceId: SRC_PUTONG_RUC,
    sourceExcerpt:
      "Renmin University’s Buddhist Studies Institute identifies Putong Temple on Mount Yangqi as the originating temple of the Linji Yangqi branch. Current public access and practice schedules remain unverified.",
    url: "https://isbrt.ruc.edu.cn/dtxx/rucfojiaoallcmsNews2569.htm",
    geoPrecision: "exact",
  },
  {
    slug: "yongquan-temple-fuzhou",
    names: [
      { locale: "en", value: "Yongquan Temple (Gushan)" },
      { locale: "zh", value: "湧泉寺" },
    ],
    lat: 26.05775,
    lng: 119.39083889,
    region: "Fujian",
    country: "China",
    foundedYear: 783,
    foundedPrecision: "exact",
    schoolSlug: "other",
    status: "active",
    sourceId: SRC_YONGQUAN_FUZHOU,
    sourceExcerpt:
      "Fuzhou's Guling tourism authority documents Yongquan Temple on Gushan. A September 2026 closure notice affected the scenic area, so current access should be confirmed (checked 2026-10-08).",
    url: "https://gl.fuzhou.gov.cn/zjgl/lyjd/jdjs/gspqgcmyggq/201405/t20140509_892653.htm",
    geoPrecision: "exact",
  },

  // ─── Japanese root temples ───────────────────────────────────────────
  {
    slug: "kosho-ji-uji",
    names: [
      { locale: "en", value: "Kōshō-ji" },
      { locale: "ja", value: "興聖寺" },
    ],
    lat: 34.89002778,
    lng: 135.81373611,
    region: "Kyoto Prefecture",
    country: "Japan",
    foundedYear: 1233,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "dogen",
    status: "active",
    sourceId: SRC_KOSHOJI_UJI_SITE,
    sourceExcerpt:
      "Kōshō-ji's own site says Dōgen founded its predecessor at Fukakusa in 1233 and that the temple was re-established at Uji in 1648; it publishes current zazen events and access details (checked 2026-10-08).",
    url: "https://www.uji-koushouji.jp/",
    geoPrecision: "exact",
  },
  {
    slug: "yoko-ji-hakui",
    names: [
      { locale: "en", value: "Yōkō-ji" },
      { locale: "ja", value: "永光寺" },
    ],
    lat: 36.91297222,
    lng: 136.85105556,
    region: "Ishikawa Prefecture",
    country: "Japan",
    foundedYear: 1312,
    foundedPrecision: "exact",
    schoolSlug: "soto",
    founderSlug: "keizan-jokin",
    status: "active",
    sourceId: SRC_YOKOJI_SOTO_OFFICE,
    sourceExcerpt:
      "The Sōtō Zen Ishikawa Office lists Yōkō-ji in Hakui, founded in 1312 by Keizan, with a zazen gathering on the second Sunday each month (checked 2026-10-08).",
    url: "https://www.sotozen-net.jp/temple/68",
    practiceDetails: {
      schedule: {
        value: "Zazen gathering on the second Sunday of each month; confirm details before visiting.",
        sourceUrl: "https://www.sotozen-net.jp/temple/68",
        checkedOn: "2026-10-08",
      },
    },
    geoPrecision: "exact",
  },
  {
    slug: "hokyo-ji-ono",
    names: [
      { locale: "en", value: "Hōkyō-ji" },
      { locale: "ja", value: "寶慶寺" },
    ],
    lat: 35.91775,
    lng: 136.46452778,
    region: "Fukui Prefecture",
    country: "Japan",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "soto",
    founderSlug: "jakuen",
    status: "active",
    sourceId: SRC_HOKYOJI_ONO_CITY,
    sourceExcerpt:
      "Ōno City's temple page identifies Hōkyō-ji as a Sōtō monastery founded by Jakuen and says visitors can experience zazen (checked 2026-10-08).",
    url: "https://www.city.ono.fukui.jp/kanko/kanko-joho/guide/houkyoji.html",
    geoPrecision: "exact",
  },
  {
    slug: "zuisho-ji-tokyo",
    names: [
      { locale: "en", value: "Zuishō-ji" },
      { locale: "ja", value: "瑞聖寺" },
    ],
    lat: 35.63729167,
    lng: 139.72696389,
    region: "Tokyo",
    country: "Japan",
    foundedYear: 1670,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_ZUISHOJI_CULTURAL_AGENCY,
    sourceExcerpt:
      "Japan's Agency for Cultural Affairs identifies Zuishō-ji as an Ōbaku temple founded in 1670 and documents its historic hall. Tokyo's official travel guide gives its current Shirokanedai address (checked 2026-10-08).",
    url: "https://www.gotokyo.org/en/spot/1090/index.html",
    geoPrecision: "exact",
  },
  {
    slug: "sofuku-ji-nagasaki",
    names: [
      { locale: "en", value: "Sōfuku-ji" },
      { locale: "ja", value: "崇福寺" },
    ],
    lat: 32.74222222,
    lng: 129.88361111,
    region: "Nagasaki Prefecture",
    country: "Japan",
    foundedYear: 1629,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_NAGASAKI_CITY_ZEN,
    sourceExcerpt:
      "Nagasaki City's tourism authority identifies Sōfuku-ji (崇福寺) as the Chinese temple founded in 1629 by the monk Chaoran and publishes its current address, visitor hours, and admission. No recurring public Zen practice schedule is listed.",
    url: "https://en.at-nagasaki.jp/spot/96",
    geoPrecision: "exact",
  },
  {
    slug: "kofuku-ji-nagasaki",
    names: [
      { locale: "en", value: "Kōfuku-ji" },
      { locale: "ja", value: "興福寺" },
    ],
    lat: 32.74786111,
    lng: 129.88388889,
    region: "Nagasaki Prefecture",
    country: "Japan",
    foundedYear: 1624,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_KOFUKUJI_NAGASAKI_CITY,
    sourceExcerpt: "Nagasaki City identifies Kōfuku-ji as Japan’s first Ōbaku temple and publishes its address, visitor hours and admission. No recurring public meditation schedule is listed.",
    url: "https://en.at-nagasaki.jp/barrierfree/64161",
    geoPrecision: "exact",
  },

  // ─── Ōbaku temples ───────────────────────────────────────────────────
  // The third Japanese Zen school had a single entry on this map. These
  // are the Nagasaki Chinese temples through which it arrived.
  {
    slug: "shofuku-ji-nagasaki",
    names: [
      { locale: "en", value: "Shōfuku-ji" },
      { locale: "ja", value: "聖福寺" },
    ],
    lat: 32.753,
    lng: 129.87693,
    region: "Nagasaki Prefecture",
    country: "Japan",
    foundedYear: 1677,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_SHOFUKUJI_NAGASAKI_CITY,
    sourceExcerpt: "Nagasaki City’s official tourism source identifies the temple and provides visitor context. It does not establish public recurring Zen practice.",
    url: "https://en.at-nagasaki.jp/barrierfree/64117",
    geoPrecision: "exact",
  },
  {
    slug: "fukusai-ji",
    names: [
      { locale: "en", value: "Fukusai-ji" },
      { locale: "ja", value: "福済寺" },
    ],
    lat: 32.75353,
    lng: 129.87465,
    region: "Nagasaki Prefecture",
    country: "Japan",
    foundedYear: 1628,
    foundedPrecision: "exact",
    schoolSlug: "obaku",
    status: "active",
    sourceId: SRC_FUKUSAI_NAGASAKI,
    sourceExcerpt:
      "Nagasaki’s official tourism page confirms Fukusai-ji as an Ōbaku temple and gives current visitor hours. It does not establish a public meditation schedule.",
    url: "https://www.at-nagasaki.jp/spot/120",
    geoPrecision: "exact",
  },

  // ─── Rinzai temples of the Gozan and the Kyoto branches ──────────────
  {
    slug: "tokei-ji",
    names: [
      { locale: "en", value: "Tōkei-ji" },
      { locale: "ja", value: "東慶寺" },
    ],
    lat: 35.33524444,
    lng: 139.54563056,
    region: "Kanagawa Prefecture",
    country: "Japan",
    foundedYear: 1285,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_TOKEIJI_SITE,
    sourceExcerpt:
      "Tōkei-ji is a Rinzai Engaku-ji branch temple in Kamakura. Its official site provides visitor and worship information; no public zazen schedule is listed.",
    url: "https://tokeiji.com/en",
    geoPrecision: "exact",
  },
  {
    slug: "jochi-ji",
    names: [
      { locale: "en", value: "Jōchi-ji" },
      { locale: "ja", value: "淨智寺" },
    ],
    lat: 35.33338889,
    lng: 139.54638889,
    region: "Kanagawa Prefecture",
    country: "Japan",
    foundedYear: 1281,
    foundedPrecision: "circa",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_JOCHIJI_SITE,
    sourceExcerpt:
      "Jōchi-ji’s official site identifies the Rinzai Engaku-ji temple, its Kamakura address, and daily visiting hours. No current public zazen schedule was found.",
    url: "https://jochiji.com/en/en",
    geoPrecision: "exact",
  },
  {
    slug: "meigetsu-in",
    names: [
      { locale: "en", value: "Meigetsu-in" },
      { locale: "ja", value: "明月院" },
    ],
    lat: 35.33499167,
    lng: 139.55145556,
    region: "Kanagawa Prefecture",
    country: "Japan",
    foundedYear: 1160,
    foundedPrecision: "circa",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_MEIGETSUIN_JNTO,
    sourceExcerpt: "Japan National Tourism Organization identifies Meigetsu-in as a Rinzai temple and provides location and visitor context. This does not establish monastic training access or recurring public Zen practice.",
    url: "https://www.japan.travel/en/spot/1583/",
    geoPrecision: "exact",
  },
  {
    slug: "zuigan-ji",
    names: [
      { locale: "en", value: "Zuigan-ji" },
      { locale: "ja", value: "瑞巌寺" },
    ],
    lat: 38.372178,
    lng: 141.059597,
    region: "Miyagi Prefecture",
    country: "Japan",
    foundedYear: 828,
    foundedPrecision: "circa",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_ZUIGANJI_SITE,
    sourceExcerpt:
      "Zuigan-ji is a Rinzai Myōshin-ji branch temple in Matsushima. Its official English site lists visitor hours and admission; no public zazen schedule is listed.",
    url: "https://www.zuiganji.or.jp/english/",
    geoPrecision: "exact",
  },
  {
    slug: "erin-ji",
    names: [
      { locale: "en", value: "Erin-ji" },
      { locale: "ja", value: "恵林寺" },
    ],
    lat: 35.72997222,
    lng: 138.71383333,
    region: "Yamanashi Prefecture",
    country: "Japan",
    foundedYear: 1330,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_ERINJI_SITE,
    sourceExcerpt:
      "Erin-ji’s official site identifies the Rinzai Myōshin-ji temple, gives its Kōshū address, and publishes Saturday and second-Sunday public zazen with current dates.",
    url: "https://erinji.jp/zazen",
    geoPrecision: "exact",
  },
  {
    slug: "ryoan-ji",
    names: [
      { locale: "en", value: "Ryōan-ji" },
      { locale: "ja", value: "龍安寺" },
    ],
    lat: 35.03444444,
    lng: 135.71833333,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1450,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_RYOANJI_OFFICIAL,
    sourceExcerpt: "Ryōan-ji’s official site provides access information for the temple and gardens. The visitor information does not establish recurring public Zen practice.",
    url: "https://www.ryoanji.jp/smph/eng/rode/index.html",
    geoPrecision: "exact",
  },
  {
    slug: "rokuon-ji-kinkaku-ji",
    names: [
      { locale: "en", value: "Kinkaku-ji (Rokuon-ji)" },
      { locale: "ja", value: "金閣寺（鹿苑寺）" },
    ],
    lat: 35.0395,
    lng: 135.7285,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1397,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_KINKAKUJI_SHOKOKU,
    sourceExcerpt: "Shōkoku-ji identifies Rokuon-ji as the official name of Kinkaku-ji, a Rinzai branch temple and UNESCO site. The reviewed official page gives historical and visiting context, not a recurring public zazen schedule.",
    url: "https://www.shokoku-ji.jp/en/kinkakuji/about/",
    geoPrecision: "exact",
  },
  {
    slug: "jisho-ji-ginkaku-ji",
    names: [
      { locale: "en", value: "Ginkaku-ji (Jishō-ji)" },
      { locale: "ja", value: "銀閣寺（慈照寺）" },
    ],
    lat: 35.02666667,
    lng: 135.79833333,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1490,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_GINKAKUJI_SITE,
    sourceExcerpt:
      "Shōkoku-ji’s official Ginkaku-ji site identifies its Rinzai affiliation and current seasonal visitor hours. It does not publish a regular public zazen schedule.",
    url: "https://www.shokoku-ji.jp/en/ginkakuji/",
    geoPrecision: "exact",
  },
  {
    slug: "kodai-ji",
    names: [
      { locale: "en", value: "Kōdai-ji" },
      { locale: "ja", value: "高台寺" },
    ],
    lat: 35.00076111,
    lng: 135.78111389,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1606,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_KODAIJI_OFFICIAL,
    sourceExcerpt: "Kōdai-ji’s official site supports the temple identity and publishes visitor information and a zazen experience offering. A one-off experience listing does not establish a recurring public practice timetable.",
    url: "https://www.kodaiji.com/",
    geoPrecision: "exact",
  },
  {
    slug: "daisen-in",
    names: [
      { locale: "en", value: "Daisen-in" },
      { locale: "ja", value: "大仙院" },
    ],
    lat: 35.044567,
    lng: 135.74595,
    region: "Kyoto",
    country: "Japan",
    foundedYear: 1509,
    foundedPrecision: "exact",
    schoolSlug: "rinzai",
    status: "active",
    sourceId: SRC_DAISEN_IN_SITE,
    sourceExcerpt:
      "Daisen-in’s official site gives current Kyoto visitor information and reservation-based zazen experiences. Visiting access is distinct from a fixed public practice schedule.",
    url: "https://daisen-in.net/",
    geoPrecision: "exact",
  },
  {
    slug: "tsz-shan-monastery",
    names: [
      { locale: "en", value: "Tsz Shan Monastery" },
      { locale: "zh", value: "慈山寺" },
    ],
    lat: 22.474203,
    lng: 114.205577,
    region: "Hong Kong SAR",
    country: "Hong Kong",
    foundedYear: 2015,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_TSZ_SHAN,
    sourceExcerpt:
      "Tsz Shan Monastery describes itself as a Chinese Buddhist monastery and publishes meditation-related visitor programmes that require registration. Its site does not establish a formal Chan affiliation or recurring public zazen schedule.",
    url: "https://www.tszshan.org/home/new/en/event.php?cat=cat6",
    geoPrecision: "exact",
  },

  // ─── Korean Seon seats ───────────────────────────────────────────────
  {
    slug: "silsang-sa",
    names: [
      { locale: "en", value: "Silsangsa" },
      { locale: "ko", value: "실상사" },
    ],
    lat: 35.417094,
    lng: 127.635264,
    region: "Jeolla-bukdo",
    country: "South Korea",
    foundedYear: 828,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_KTO_SILSANGSA,
    sourceExcerpt: "VisitKorea describes Silsangsa as a historic temple associated with the Nine Mountain Seon temples, gives visitor access details and address. This historical connection does not establish recurring public Seon practice.",
    url: "https://en.wikipedia.org/wiki/Silsangsa",
    geoPrecision: "exact",
  },
  {
    slug: "sangwon-sa",
    names: [
      { locale: "en", value: "Sangwonsa" },
      { locale: "ko", value: "상원사" },
    ],
    lat: 37.7863,
    lng: 128.5639,
    region: "Gangwon-do",
    country: "South Korea",
    foundedYear: 705,
    foundedPrecision: "circa",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_KTO_SANGWONSA,
    sourceExcerpt: "VisitKorea gives Sangwonsa’s historical background, address, and visitor hours. Its heritage and location do not establish a recurring public Seon schedule.",
    url: "https://en.wikipedia.org/wiki/Sangwonsa",
    geoPrecision: "exact",
  },
  {
    slug: "bongeun-sa",
    names: [
      { locale: "en", value: "Bongeunsa" },
      { locale: "ko", value: "봉은사" },
    ],
    lat: 37.51555556,
    lng: 127.05722222,
    region: "Seoul",
    country: "South Korea",
    foundedYear: 794,
    foundedPrecision: "exact",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_KTO_BONGEUNSA,
    sourceExcerpt: "VisitKorea gives Bongeunsa’s location, visitor hours, and temple information. It is a visitor-access source and does not establish a recurring public Seon schedule.",
    url: "https://en.wikipedia.org/wiki/Bongeunsa",
    geoPrecision: "exact",
  },
  {
    slug: "baekdam-sa",
    names: [
      { locale: "en", value: "Baekdamsa" },
      { locale: "ko", value: "백담사" },
    ],
    lat: 38.16472222,
    lng: 128.37386111,
    region: "Gangwon-do",
    country: "South Korea",
    foundedYear: 647,
    foundedPrecision: "circa",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_BAEKDAMSA_TEMPLESTAY,
    sourceExcerpt:
      "Baekdamsa is a Jogye Seon training temple and templestay destination in Inje County. The current templestay page lists programs; no weekly public practice schedule is listed.",
    url: "https://baekdamsa.templestay.com/",
    geoPrecision: "exact",
  },
  {
    slug: "chilbul-sa",
    names: [
      { locale: "en", value: "Chilbulsa" },
      { locale: "ko", value: "칠불사" },
    ],
    lat: 35.282194,
    lng: 127.609272,
    region: "Gyeongsang-namdo",
    country: "South Korea",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_CHILBULSA_SITE,
    sourceExcerpt:
      "Chilbulsa's own introduction describes its Jirisan temple and Seon training hall. Its first-century origin is presented as a traditional account, so no precise founding year is given here (checked 2026-10-08).",
    url: "https://chilbul.or.kr/doc/0102.php",
    geoPrecision: "exact",
  },
  {
    slug: "golgul-sa",
    names: [
      { locale: "en", value: "Golgulsa" },
      { locale: "ko", value: "골굴사" },
    ],
    lat: 35.80305556,
    lng: 129.40555556,
    region: "Gyeongsang-bukdo",
    country: "South Korea",
    foundedYear: 600,
    foundedPrecision: "circa",
    schoolSlug: "jogye",
    status: "active",
    sourceId: SRC_KTO_GOLGULSA,
    sourceExcerpt: "VisitKorea identifies Golgulsa as a center of the Korean Seonmudo tradition, confirms templestay programs, and gives visitor information. This supports Seonmudo and program access, not a recurring public Seon sitting schedule.",
    url: "https://en.wikipedia.org/wiki/Golgulsa",
    geoPrecision: "exact",
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
    sourceId: SRC_YUNMEN_SHAOGUAN,
    sourceExcerpt:
      "Shaoguan government identifies Yunmen Dajue Chan Temple near Ruyuan as the ancestral temple of the Yunmen school and describes its active monastic community. No public lay schedule was verified (checked 2026-10-08).",
    url: "https://www.sg.gov.cn/sgly/yzsg/msgj/content/post_1962120.html",
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
    sourceId: SRC_FALAISE_VERTE,
    sourceExcerpt:
      "The centre describes its practice as Japanese Rinzai Zen; its lineage page links Taikan Jyoji to Myōshin-ji Rinzai authorities. Current 2026 notices refer to Tuesday 06:30 streaming and sesshin; regular zazenkai are held at the centre and in several cities.",
    url: "https://www.falaiseverte.org/zen/",
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
    sourceId: SRC_ONEDROP,
    sourceExcerpt:
      "One Drop Zen identifies Hokuozan Sōgenji as its central European Rinzai monastery in Asendorf and names Taikan ShoE Roshi as its teacher; its lineage page describes it as a central practice place for intensive retreats.",
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
    // Strada Comunale Bargone 113, 43039 Salsomaggiore Terme (PR).
    lat: 44.82625,
    lng: 10.02969,
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
    // Via dei Crollalanza 9, 20143 Milano.
    lat: 45.44574,
    lng: 9.16539,
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
    // C/ Palleter 36, 2º, 46008 Valencia.
    lat: 39.47110,
    lng: -0.38770,
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
    slug: "seikyuji-moron",
    names: [
      { locale: "en", value: "Seikyūji" },
      { locale: "es", value: "Templo Zen Seikyūji" },
      { locale: "ja", value: "聖丘寺" },
    ],
    lat: 37.12153,
    lng: -5.45596,
    region: "Andalusia",
    country: "Spain",
    foundedYear: 2009,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_SOTOZEN_EUROPE,
    sourceExcerpt:
      "Templo Zen Seikyūji, Carretera Marchena–Morón de la Frontera km 8.8, 41530 Morón de la Frontera (Sevilla) — a Sōtō Zen monastery on the Finca La Morejona, listed in the Sōtōshū Europe directory, under the direction of Raphaël Dōkō Triet Rōshi (who also founded the Centre Zen de Lisboa). Ascribed to the Association Zen Internationale in the Deshimaru lineage.",
    url: "https://www.seikyuji.org/",
    // The monastery stands "in the heart of a large olive grove" reached by
    // a dirt track off the Marchena–Morón road; no gazetteer carries the
    // finca, and OSM has no node for it. Pinned to the town it gives as its
    // postal address and marked approximate, rather than asserting a
    // doorstep we cannot source. It is emphatically not in Seville: the row
    // previously sat on the Seville city centroid, 57km north-west.
    geoPrecision: "city",
  },
  {
    slug: "keiryuji-camprodon",
    names: [
      { locale: "en", value: "Keiryūji — Mountain Stream Temple" },
      { locale: "es", value: "Templo Keiryūji" },
      { locale: "ja", value: "渓流寺" },
    ],
    // La Masó de Bolòs 1, 17867 Camprodon — the hamlet east of the town centre.
    lat: 42.30366,
    lng: 2.42313,
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
    sourceId: SRC_HEALING_SPRING_PV,
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
    sourceId: SRC_MAISON_INSPIR_PV,
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
    sourceId: SRC_AIAB_PV,
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
    sourceId: SRC_THAI_PLUM_VILLAGE,
    sourceExcerpt:
      "Thai Plum Village, founded 2008 near Khao Yai National Park — the Plum Village community's largest hub in Asia, leading retreats throughout Southeast Asia.",
    url: "https://plumvillage.org/practice-centre/plum-village-thailand",
  },
  {
    slug: "stream-entering-monastery",
    names: [{ locale: "en", value: "Stream Entering Monastery" }],
    lat: -37.2917996,
    lng: 144.1951074,
    region: "Victoria",
    country: "Australia",
    foundedYear: 2010,
    foundedPrecision: "exact",
    schoolSlug: "plum-village",
    founderSlug: "thich-nhat-hanh",
    status: "active",
    sourceId: SRC_STREAM_ENTERING_PV,
    sourceExcerpt:
      "Plum Village identifies Stream Entering Monastery as a nunnery founded in 2010, relocated in June 2021 to 530 Porcupine Ridge Road, and hosting Days of Mindfulness every Sunday.",
    url: "https://plumvillage.org/practice-centre/stream-entering-monastery",
    geoPrecision: "exact",
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
    sourceId: SRC_MOUNTAIN_SPRING_PV,
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
    // 3703 N Washington Blvd, Indianapolis IN 46205. The old pin was the
    // downtown centroid, which it shared with Joshu Zen Temple — a Rinzai
    // temple 28km away in Fishers that had landed on the same point.
    lat: 39.82365,
    lng: -86.15166,
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
    sourceId: SRC_MRO,
    sourceExcerpt:
      "Zen Mountain Monastery’s current visitor page lists its public Sunday program and on-site practice; the Mountains and Rivers Order documents the monastery’s Daido Loori lineage.",
    url: "https://zmm.org/",
    practiceDetails: {
      meetingFormat: {
        value: "Sunday program on site by advance registration; beginning instruction is also offered online.",
        sourceUrl: "https://zmm.org/visiting-the-monastery/",
        checkedOn: "2026-10-07",
      },
      schedule: {
        value: "Public Sunday program; regular morning and evening sitting for returning visitors except during sesshin. Check current dates before visiting.",
        sourceUrl: "https://zmm.org/visiting-the-monastery/",
        checkedOn: "2026-10-07",
      },
      cost: {
        value: "Suggested $5 donation for the Sunday program.",
        sourceUrl: "https://zmm.org/visiting-the-monastery/",
        checkedOn: "2026-10-07",
      },
    },
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
    sourceId: SRC_UPAYA_CENTER,
    sourceExcerpt:
      "Upaya Zen Center’s official site documents its Santa Fe temple and current daily meditation schedule (checked 2026-10-08).",
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
    sourceId: SRC_ZEN_DUST,
    sourceExcerpt:
      "Zen Community of Oregon’s official site describes its White Plum lineage and multiple Oregon practice locations, including Great Vow Zen Monastery; this record represents the wider community.",
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
    sourceId: SRC_GREAT_PLAINS,
    sourceExcerpt:
      "Great Plains Zen Center’s current pages document Monroe sittings, 2026 retreats, and its Maezumi-line practice history. Confirm individual event dates before visiting.",
    url: "https://greatplainszen.org/",
  },
  {
    slug: "still-mind-zendo",
    names: [{ locale: "en", value: "Still Mind Zendo" }],
    lat: 40.7372304,
    lng: -73.9949422,
    region: "New York",
    country: "United States",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_STILL_MIND,
    sourceExcerpt:
      "Still Mind Zendo at 34 West 15th Street in Manhattan publishes current in-person and online practice and identifies its Maezumi/White Plum lineage.",
    url: "https://stillmindzendo.org/",
  },
  {
    slug: "ny-zen-center-contemplative-care",
    names: [{ locale: "en", value: "New York Zen Center for Contemplative Care" }],
    lat: 40.7435881,
    lng: -73.9933365,
    region: "New York",
    country: "United States",
    foundedYear: 2007,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_ZENCARE,
    sourceExcerpt:
      "New York Zen Center for Contemplative Care at 119 West 23rd Street publishes current in-person and online meditation and identifies its Sōtō/White Plum lineage.",
    url: "https://zencare.org/",
  },

  // ─── One Drop Zen (Shōdō Harada Rōshi's global sangha) ───────────────
  {
    slug: "tahomasan-sogenji",
    names: [
      { locale: "en", value: "Tahomasan Sogenji Monastery" },
      { locale: "ja", value: "太邦山曹源寺" },
    ],
    // 6499 Wahl Rd, Freeland WA 98249, Whidbey Island.
    lat: 47.97670,
    lng: -122.53422,
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
    // 15 Heytesbury Street, Dublin 8. The old pin was a Dublin centroid
    // shared with three unrelated sanghas.
    lat: 53.33511,
    lng: -6.26912,
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
    // Samuelsgården, Rådmandsgade 31, 2200 København N.
    lat: 55.69980,
    lng: 12.55042,
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
    // 300 Page Street, San Francisco CA 94102.
    lat: 37.77391,
    lng: -122.42612,
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
    sourceId: SRC_ZCLA_CENTER,
    sourceExcerpt:
      "Zen Center of Los Angeles identifies Buddha Essence Temple at 923 S Normandie Ave and documents its Maezumi–Glassman lineage and current practice schedule (checked 2026-10-08).",
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
    sourceId: SRC_YOKOJI_CENTER,
    sourceExcerpt:
      "Yokoji’s official site documents its San Jacinto Mountain training center, current Sunday program, and membership in the White Plum Asanga (checked 2026-10-08).",
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
    // PZI registers only a Santa Rosa PO box and runs most of its
    // programme online; it publishes no room you can turn up to. The pin
    // stands for the city, not a door — and previously sat 10m from the
    // Santa Rosa Zen Group, which does have a hall, in Kenwood.
    geoPrecision: "city",
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
    // Klosterstraße 10, 97292 Holzkirchen bei Würzburg.
    lat: 49.78040,
    lng: 9.68150,
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
    // NOT benediktushof.de — that domain belongs to Benediktushof gGmbH in
    // Reken, a disability-services provider 400km north with no connection
    // to this centre. The retreat centre publishes Klosterstraße 10 here.
    url: "https://www.benediktushof-holzkirchen.de/",
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
      "Zen Center of New York City (Fire Lotus Temple) at 500 State Street, Brooklyn — the urban centre of the Mountains and Rivers Order, the umbrella organisation founded by John Daido Loori at Zen Mountain Monastery. Led by Geoffrey Shugen Arnold Rōshi.",
    url: "https://zcnyc.mro.org/",
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
    // 1030 Pleasant Street, Worcester MA 01602 — the temple's published
    // address. The old pin sat ~4km east, in the wrong part of the city.
    lat: 42.27874,
    lng: -71.84607,
    region: "Massachusetts",
    country: "United States",
    foundedYear: 2011,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_BOUNDLESS_WAY,
    sourceExcerpt:
      "Boundless Way Zen Temple’s official site publishes its 2026–2027 Worcester schedule and describes its combined Japanese Sōtō and Korean Linji roots.",
    url: "https://boundlessway.org/",
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
    // 13 Hope Street, Liverpool L1 9BQ.
    lat: 53.40277,
    lng: -2.96952,
    region: "Liverpool",
    country: "United Kingdom",
    foundedYear: 2002,
    foundedPrecision: "circa",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_STONEWATER_ZEN,
    sourceExcerpt:
      "StoneWater's current site describes an active UK-wide and online sangha, publishes Liverpool and online schedules, and identifies David Keizan Scott Roshi and its White Plum lineage.",
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
    schoolSlug: "other",
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
    // OSM node for the temple at Rua São Joaquim 285, Liberdade.
    lat: -23.561232,
    lng: -46.636161,
    region: "São Paulo",
    country: "Brazil",
    foundedYear: 1956,
    foundedPrecision: "circa",
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_BUSSHINJI_BRAZIL,
    sourceExcerpt:
      "Templo Busshinji (佛心寺) in Liberdade, São Paulo, is the Sōtōshū South America regional headquarters. The temple's current ceremonies page lists temple ceremonies and visitor hours. Its sesshin page says sesshin has not been offered in recent years and may return in future; a current recurring public zazen schedule is not established by these pages. Treat this as a temple listing, not a verified public sitting schedule. Sources: https://sotozen.org.br/cerimonias-do-templo-busshinji/ and https://sotozen.org.br/seshin/.",
    url: "https://sotozen.org.br/",
  },
  {
    slug: "mosteiro-zen-morro-da-vargem",
    names: [
      { locale: "en", value: "Mosteiro Zen Morro da Vargem" },
      { locale: "pt", value: "Mosteiro Zen Budista Morro da Vargem" },
    ],
    // OSM node for the monastery on Rodovia Pedro Cutini, Pendanga,
    // Ibiraçu. Both previously seeded copies of this monastery sat about
    // 5km away, in different directions.
    lat: -19.886608,
    lng: -40.377925,
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
    sourceId: SRC_ANTAIJI_SITE,
    sourceExcerpt:
      "Antaiji’s official site publishes its residential daily zazen and sesshin routine and Sōtō history. Visits require coordination with the monastery.",
    url: "https://www.antaiji.org/en/schedule/",
  },

  // ─── White Plum Asanga — additional sanghas (2026-05 ingest) ─────────
  {
    slug: "village-zendo",
    names: [{ locale: "en", value: "Village Zendo" }],
    lat: 40.7196,
    lng: -74.0061,
    region: "New York",
    country: "United States",
    foundedYear: 1986,
    foundedPrecision: "exact",
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_VILLAGE_ZENDO,
    sourceExcerpt:
      "Village Zendo’s official site lists its Tribeca address, current daily and weekly practice, and White Plum connections (checked 2026-10-08).",
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
    sourceId: SRC_ZEN_TREE,
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
    sourceId: SRC_ZEN_ALKMAAR,
    sourceExcerpt:
      "Zen Alkmaar’s official site lists its Alkmaar practice groups and zazenkai and describes its Maezumi-line teachers through Genpo Merzel, Nico Tydeman, and Gretha Aerts (checked 2026-10-08).",
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
    sourceId: SRC_DE_BERKELEY,
    sourceExcerpt:
      "De Berkeley lists Zen in Bergen with Gretha Jikai Myoshin Aerts at Nesdijk 20H, Bergen NH, including a current Thursday practice window (checked 2026-10-08).",
    url: "https://deberkeley.nl/",
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
    sourceId: SRC_OFFENER_KREIS_FREIBURG,
    sourceExcerpt:
      "Zendo Offener Kreis Freiburg lists regular Tuesday and Thursday evening practice at Schlippehof 8; White Plum's current member list names its teacher Gabriele Shinmyo Geiger-Stappel.",
    url: "https://www.viaintegralis-freiburg.de/zugaenge/abend-meditation/",
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
    schoolSlug: "soto",
    status: "active",
    sourceId: SRC_DBU_BUDDHAWEG,
    sourceExcerpt:
      "The German Buddhist Union lists BuddhaWeg-Sangha as a Sōtō group in the Taisen Deshimaru line, led by Heinz-Jürgen Metzger, with regular practice in Solingen and Cologne and affiliation to ABZEn.",
    url: "https://buddhismus-deutschland.de/?zentren=buddhaweg-sangha-zen-zentrum-solingen-e-v",
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
    sourceId: SRC_OFFENER_KREIS_LUZERN,
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
    country: "United Kingdom",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "white-plum-asanga",
    status: "active",
    sourceId: SRC_YORK_ZEN,
    sourceExcerpt:
      "York Zen Group’s official site identifies the group with the White Plum Asanga and lists Monday 18:30–20:00 practice at St Bede’s, 21 Blossom Street, York (checked 2026-10-08).",
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
    sourceId: SRC_VIA_ZEN_COMMUNITIES,
    sourceExcerpt:
      "Via Zen identifies Zendo Mãos Vazias as a Sōtō Zen practice community in Campinas. A September 2026 event also names the zendo as organizer; its older blog schedule should be reconfirmed.",
    url: "https://zenbudismocampinas.wordpress.com/",
  },

  // ─── Diamond Sangha (Aitken / Sanbo Zen lineage) — international ────
  {
    slug: "koko-an-zendo",
    names: [{ locale: "en", value: "Koko An Zendo" }],
    lat: 21.3099,
    lng: -157.8174,
    region: "Hawaii",
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    sourceId: SRC_ZEN_VIENTO_DEL_SUR,
    sourceExcerpt:
      "Zen Viento del Sur in Buenos Aires — its first-party page identifies it as a Sangha Diamante community, describes weekly zazen and monthly zazenkai, and says it meets weekly online with its teacher. The page gives no public meeting times or venue; current public in-person access and the city pin’s venue meaning remain unverified. https://zen-vientodelsur.com.ar/?page_id=8",
    url: "https://zen-vientodelsur.com.ar/?page_id=8",
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
    sourceId: SRC_ZEN_MONTANAS_Y_MAR,
    sourceExcerpt:
      "Zen Montañas y Mar in Chile — its current activities page advertises an August 2026 sesshin at Casa Guangualí. An older site archive says the community's Circulos weekly sittings were suspended until further notice. The checked pages do not establish a recurring public Santiago venue; the Santiago city pin is approximate and does not identify the retreat site. Its Daniel Terragno profile describes his Diamond Sangha connection and ongoing relationship with the group. Sources: https://www.zenmontanasymar.org/retiros-y-actividades/, https://www.zenmontanasymar.org/category/uncategorized/, https://www.zenmontanasymar.org/daniel-terragno-roshi/.",
    url: "https://www.zenmontanasymar.org/",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
    foundedYear: 1988,
    foundedPrecision: "exact",
    schoolSlug: "chan",
    status: "active",
    sourceId: SRC_HSI_LAI,
    sourceExcerpt:
      "Hsi Lai Temple’s official site identifies its Fo Guang Shan Chinese Mahayana and Linji Chan affiliation, Hacienda Heights address, public visiting information, and current services. It is a broad Buddhist temple rather than an exclusively Zen center.",
    url: "https://www.hsilai.us/",
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
    sourceId: SRC_NAN_TIEN_SITE,
    sourceExcerpt:
      "Nan Tien Temple's current visitor page gives its address as 180 Berkeley Road, Berkeley NSW 2506 and publishes opening hours and contact details.",
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
    sourceId: SRC_CHUNG_TIAN_SITE,
    sourceExcerpt:
      "Fo Guang Shan Chung Tian Temple's current site identifies the Priestdale temple, publishes opening hours, weekly Dharma services, meditation classes and visitor information.",
    url: "https://www.fgschungtian.org.au/",
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
    sourceId: SRC_FOGUANG,
    sourceExcerpt:
      "Fo Guang Shan He Hua Temple’s official site confirms the temple at Zeedijk 106–118, Amsterdam, its Ch’an hall and regular visitor information, and its September 2000 opening.",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    sourceId: SRC_FGS_VANCOUVER,
    sourceExcerpt:
      "Vancouver Fo Guang Shan’s current site identifies the Richmond temple, its Humanistic Buddhist practice, public hours, and address at 8181 Cambie Road. Chan is one part of its broader tradition.",
    url: "https://sites.google.com/view/vancouver-fo-guang-shan/home",
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
    sourceId: SRC_FGS_TORONTO,
    sourceExcerpt:
      "Fo Guang Shan Temple of Toronto at 6525 Millcreek Drive, Mississauga, is a Humanistic Buddhist temple with Chan meditation among its programs; the official site publishes current services and classes.",
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
    sourceId: SRC_IBPS_MONTREAL,
    sourceExcerpt:
      "IBPS Montreal’s current contact page confirms Hua Yan Temple at 3831 Rue Jean-Talon E. and public hours. The Fo Guang Shan temple represents broader Humanistic Buddhism with Chan elements.",
    url: "https://ibpsmtl.org/contact-en/",
  },
  {
    slug: "ibps-london",
    names: [
      { locale: "en", value: "London Fo Guang Shan Temple" },
      { locale: "zh", value: "倫敦佛光山" },
    ],
    lat: 51.5170869,
    lng: -0.1381865,
    region: "England",
    country: "United Kingdom",
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: "chan",
    status: "active",
    sourceId: "src_london_fgs",
    sourceExcerpt:
      "The temple’s own current visitor page gives 84 Margaret Street, London W1W 8TD and opening hours. It describes the London temple as part of Fo Guang Shan and dedicated to Humanistic Buddhism. No founding year or recurring Chan schedule is asserted.",
    url: "https://www.londonfgs.org.uk/where-to-find-us",
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
    country: "United Kingdom",
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
    country: "United States",
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
    sourceId: SRC_FGS_NEW_ZEALAND,
    sourceExcerpt:
      "Fo Guang Shan New Zealand lists separate Auckland and Christchurch temples. This pin represents the Auckland temple at 16 Stancombe Road; the organization describes Humanistic Buddhist services and publishes current events without establishing an exclusively Chan programme.",
    url: "https://fgs.org.nz/english/contact-us/",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    country: "United States",
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
    // 20 South Broadway, 12th Floor, Yonkers NY 10701.
    lat: 40.93306,
    lng: -73.89823,
    region: "New York",
    country: "United States",
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
    // The roster gives a city, not an address, and this coordinate is the
    // Praça da Sé — São Paulo's conventional centre point — to five
    // decimals. Labelling it "exact" claimed a doorstep nobody published.
    geoPrecision: "city",
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
    // Same as Caminho de Luz above: this is Rome's centroid, not a venue.
    geoPrecision: "city",
  },

  // ─── Mountains and Rivers Order (Daido Loori) ─ Brooklyn satellite ───

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
    sourceId: SRC_DDM_ONTARIO,
    sourceExcerpt:
      "The official Dharma Drum Mountain Ontario site identifies a Sheng Yen Chan community with regular meditation, chanting, study, and teachings at 1025 McNicoll Avenue, Scarborough.",
    url: "https://www.ddmbaontario.org/",
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
    // Brunngasshalde 37, 3011 Bern — the meditation room the group publishes.
    // The old pin was the Bern city centroid, which it shared with the
    // unrelated Plum Village Swiss inter-sangha entry 11m away.
    lat: 46.94910,
    lng: 7.44987,
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
    // Karuna Cottage, 3215 NW 17th Street, Gainesville FL 32605. The old
    // pin was the Gainesville centroid, shared with the unrelated Kwan Um
    // Gateless Gate Zen Center.
    lat: 29.68209,
    lng: -82.34484,
    region: "Florida",
    country: "United States",
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
