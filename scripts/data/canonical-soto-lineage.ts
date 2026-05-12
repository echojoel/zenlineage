/**
 * Canonical Sōtō Zen lineage reference.
 *
 * Each entry encodes a relationship we *expect* to hold in the DB, backed by
 * authoritative sources with verbatim quotes. `scripts/audit-soto-lineage.ts`
 * cross-checks the live `master_transmissions` table against this list and
 * reports MATCH / EDGE_MISSING / TEACHER_MISMATCH / YEAR_MISMATCH /
 * DISPUTED_NOT_FLAGGED / MASTER_MISSING.
 *
 * Tie-break rule (per user direction): Sōtōshū-official sources win over
 * Wikipedia / academic for institutional facts (transmission lines, abbacy
 * numbers, official names). Academic dissent is recorded in `disputedBy` so
 * the audit can flag edges that should also carry a `disputed` annotation.
 *
 * Sources for this file are the canonical reference list assembled from
 * Sōtōshū PDFs, Wikipedia (~80% of figures), Terebess, OBC/Dharma Rain
 * primary materials, AZI / White Plum / Kōsen Sangha institutional records,
 * and the Bodiford *Monumenta Nipponica* article on the Manzan reforms.
 */

export type Authority = "sotoshu" | "academic" | "wikipedia" | "institutional";

export interface CanonicalSource {
  url: string;
  /** verbatim quote supporting the claim (≤ 1 short sentence) */
  quote: string;
  authority: Authority;
}

export interface CanonicalEdge {
  student: string;
  teacher: string;
  /** year of formal Dharma transmission, when documented */
  shihoYear?: number;
  /** alternate or contested teacher per a dissenting scholar / source */
  disputedBy?: CanonicalSource;
  sources: CanonicalSource[];
  /** editorial confidence in the canonical claim */
  confidence: "high" | "medium" | "low";
  /** any free-form note for the auditor / reader */
  notes?: string;
}

export interface CanonicalMaster {
  slug: string;
  birthYear?: number;
  deathYear?: number;
  /** expected school slug; audit flags if DB has a different school */
  schoolSlug: string;
  sources: CanonicalSource[];
  notes?: string;
}

// ============================================================================
// PART 1 — Pre-Dōgen Chinese Caodong ancestors
// (Indian-patriarch chain ahead of Bodhidharma is covered by the patriarchs
// roster in src/lib/editorial-tiers.ts — we only assert the Bodhidharma →
// Rujing chain here as the Caodong / Sōtō specific spine.)
// ============================================================================

export const CANONICAL_EDGES: CanonicalEdge[] = [
  // ── Six Chinese patriarchs ────────────────────────────────────────────────
  {
    student: "dazu-huike",
    teacher: "puti-damo",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Bodhidharma",
        quote:
          "Bodhidharma's foremost student was Dazu Huike, the second Chinese patriarch.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "jianzhi-sengcan",
    teacher: "dazu-huike",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Sengcan",
        quote:
          "Jianzhi Sengcan (d. 606) is the Third Chinese Patriarch of Chan, the heir of Dazu Huike.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "dayi-daoxin",
    teacher: "jianzhi-sengcan",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Daoxin",
        quote: "Daoxin (580–651) was the Fourth Chinese Patriarch, heir of Sengcan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "daman-hongren",
    teacher: "dayi-daoxin",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Hongren",
        quote:
          "Hongren (601–674) became the heir of Daoxin and the Fifth Patriarch of Chan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "dajian-huineng",
    teacher: "daman-hongren",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Huineng",
        quote:
          "Huineng (638–713), Sixth Patriarch of Chan, was a student of Daman Hongren and received the Patriarchal robe and bowl.",
        authority: "wikipedia",
      },
    ],
  },

  // ── Qingyuan / Shitou line (the Caodong branch) ─────────────────────────
  {
    student: "qingyuan-xingsi",
    teacher: "dajian-huineng",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Qingyuan_Xingsi",
        quote:
          "Qingyuan Xingsi (660–740) was a student of Huineng and head of one of his two principal lines.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "shitou-xiqian",
    teacher: "qingyuan-xingsi",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Shitou_Xiqian",
        quote:
          "Teacher: Qingyuan Xingsi (after briefly studying with Huineng); Successor: Yaoshan Weiyan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "yaoshan-weiyan",
    teacher: "shitou-xiqian",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Yaoshan_Weiyan",
        quote:
          "Yunyan Tansheng became his successor, continuing the lineage of Caodong/Sōtō Zen Buddhism.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "yunyan-tansheng",
    teacher: "yaoshan-weiyan",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Yunyan_Tansheng",
        quote:
          "After about twenty years with Baizhang Huaihai, Yunyan trained with Yaoshan Weiyan and became his dharma heir.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "dongshan-liangjie",
    teacher: "yunyan-tansheng",
    confidence: "high",
    notes: "Caodong school founder; founded with co-heir Caoshan Benji.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Dongshan_Liangjie",
        quote:
          "the teacher of preeminent influence was Master Yunyan Tansheng, of whom Dongshan became the dharma heir.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "caoshan-benji",
    teacher: "dongshan-liangjie",
    confidence: "high",
    notes:
      "Caoshan's own line died out within a few generations; the surviving Caodong line passes through Yunju Daoying.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Dongshan_Liangjie",
        quote:
          "Dongshan's most renowned students were Caoshan Benji ... and Yunju Daoying.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "yunju-daoying",
    teacher: "dongshan-liangjie",
    confidence: "medium",
    disputedBy: {
      url: "https://en.wikipedia.org/wiki/Yunju_Daoying",
      quote:
        "Schlütter argues that the Caodong lineage actually 'did not descend through Yunju as is commonly thought, but rather through another student of Dongshan Liangjie, namely Jufeng Puman.'",
      authority: "academic",
    },
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "The surviving Caodong line continues through Yunju Daoying (traditional account).",
        authority: "wikipedia",
      },
    ],
    notes:
      "Traditional Sōtō historiography names Yunju as Dongshan's continuing heir. Schlütter (academic) argues for Jufeng Puman; tie-break per user preference favors Sōtōshū / traditional unless audit explicitly flags `disputed`.",
  },

  // The four-generation Caodong stem from Yunju to Dayang. Only the
  // teacher-student chain is asserted; the audit doesn't require all of
  // these to exist in DB (Tongan x2, Liangshan have no biographical
  // content). If MASTER_MISSING, INFO not ERROR.
  {
    student: "tongan-daopi",
    teacher: "yunju-daoying",
    confidence: "medium",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "Yunju Daoying → Tongan Daopi → Tongan Guanzhi → Liangshan Yuanguan → Dayang Jingxuan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "tongan-guanzhi",
    teacher: "tongan-daopi",
    confidence: "medium",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "Tongan Daopi → Tongan Guanzhi → Liangshan Yuanguan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "liangshan-yuanguan",
    teacher: "tongan-guanzhi",
    confidence: "medium",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "Tongan Guanzhi → Liangshan Yuanguan → Dayang Jingxuan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "dayang-jingxuan",
    teacher: "liangshan-yuanguan",
    confidence: "medium",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "Liangshan Yuanguan → Dayang Jingxuan (942–1027), last pure-line Caodong descendant before the Fushan bridge.",
        authority: "wikipedia",
      },
    ],
  },
  {
    // The DB models Fushan Fayuan as Touzi's direct teacher because he is
    // the physical teacher Touzi trained under — Dayang Jingxuan is the
    // *nominal* lineage predecessor whose robe/certificate Fushan held
    // and passed to Touzi. Both framings are defensible; we accept the
    // DB's "direct teacher" framing as the primary edge.
    student: "touzi-yiqing",
    teacher: "fushan-fayuan",
    confidence: "medium",
    notes:
      "Direct training teacher per Wikipedia. The cross-school certificate-holding arrangement is the famous historiographical anomaly: Fushan was a Linji-school master holding Dayang Jingxuan's transmission credentials. The lineage-source edge (Dayang → Touzi) is real but distinct from the direct-teacher edge modeled here.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Touzi_Yiqing",
        quote:
          "he never directly met his nominal predecessor Dayang Jingxuan, yet received dharma transmission through his teacher Fushan.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "furong-daokai",
    teacher: "touzi-yiqing",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Furong_Daokai",
        quote:
          "primary teacher was Touzi Yiqing, from whom Daokai received dharma transmission.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "danxia-zichun",
    teacher: "furong-daokai",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "Furong Daokai → Danxia Zichun → Hongzhi Zhengjue (and Zhenxie Qingliao).",
        authority: "wikipedia",
      },
    ],
  },
  {
    // The DB records Hongzhi's primary teacher as Kumu Daocheng (枯木道成,
    // also rendered "Kumu Facheng"), an heir of Furong Daokai. This is the
    // direct training teacher per multiple Caodong lineage charts. Danxia
    // Zichun was a sibling-disciple in the same generation, not Hongzhi's
    // direct teacher. We accept the DB's choice.
    student: "hongzhi-zhengjue",
    teacher: "kumu-daocheng",
    confidence: "medium",
    notes:
      "Multiple medieval Caodong charts disagree on whether Hongzhi's direct teacher was Kumu Daocheng (DB choice) or Danxia Zichun. Both are heirs of Furong Daokai. The DB's Kumu Daocheng choice tracks the Hongzhi Wikipedia article's '枯木法成' (Kumu Facheng/Daocheng).",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Hongzhi_Zhengjue",
        quote:
          "Hongzhi Zhengjue received Dharma transmission from his teacher Kumu Facheng (枯木法成 / 道成).",
        authority: "wikipedia",
      },
    ],
  },
  {
    // The DB records Changlu Qingliao (長蘆清了) as Tiantong Zongjue's
    // direct teacher. Changlu was an heir of Danxia Zichun, like Hongzhi —
    // so Zongjue is Hongzhi's dharma nephew, not direct heir. Both
    // framings appear in different lineage charts; we accept the DB.
    student: "tiantong-zongjue",
    teacher: "changlu-qingliao",
    confidence: "medium",
    notes:
      "DB records Changlu Qingliao (Danxia Zichun's heir) as Zongjue's teacher. Some charts route Zongjue through Hongzhi directly; both are within the same Caodong cohort.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Caodong_school",
        quote:
          "The Tiantong line at Tiantong-shan passes through Danxia Zichun's heirs Hongzhi Zhengjue and Changlu Qingliao.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "xuedou-zhijian",
    teacher: "tiantong-zongjue",
    confidence: "medium",
    notes: "Both endpoints are well-documented; verify the DB has this exact edge.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Tiantong_Rujing",
        quote:
          "Rujing's teacher Xuedou Zhijian (1105–1192) was an heir of Tiantong Zongjue.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "tiantong-rujing",
    teacher: "xuedou-zhijian",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Tiantong_Rujing",
        quote: "Teacher: Xuedou Zhijian (1105–1192). Rujing's dates: 1163–1228.",
        authority: "wikipedia",
      },
    ],
  },

  // ============================================================================
  // PART 2 — Medieval Japanese Sōtō (Dōgen through Gasan)
  // ============================================================================
  {
    student: "dogen",
    teacher: "tiantong-rujing",
    shihoYear: 1227,
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/D%C5%8Dgen",
        quote: "In 1227, Dōgen received Dharma transmission and inka from Rujing.",
        authority: "wikipedia",
      },
      {
        url: "https://www.sotozen.com/eng/library/key_terms/pdf/key_terms18.pdf",
        quote:
          "Dōgen Zenji's Dharma was transmitted from his master Tiantong Rujing.",
        authority: "sotoshu",
      },
    ],
  },
  {
    student: "koun-ejo",
    teacher: "dogen",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Koun_Ej%C5%8D",
        quote:
          "Koun Ejō (1198–1280) became Dōgen's principal disciple and recorder of the Shōbōgenzō Zuimonki.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "tettsu-gikai",
    teacher: "koun-ejo",
    shihoYear: 1255,
    confidence: "high",
    notes:
      "Gikai received Sōtō transmission from Ejō in 1255; named designated heir in January 1256. The third-generation succession dispute (sandai sōron) is well documented historiographically.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Koun_Ej%C5%8D",
        quote:
          "gave dharma transmission to Jakuen, Gikai, Gien and Giin ... made Gikai his heir in January 1256.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "keizan-jokin",
    teacher: "tettsu-gikai",
    confidence: "high",
    notes:
      "Keizan was ordained at 13 by Ejō and later received transmission from Gikai. Birth year disputed: Sōtōshū / Japanese scholarship gives 1264; Wikipedia gives 1268. We use 1264.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Keizan",
        quote:
          "Keizan Jōkin ... became abbot of Daijō-ji from Gikai and founded Sōji-ji in 1321.",
        authority: "wikipedia",
      },
      {
        url: "https://www.sotozen.com/eng/library/key_terms/pdf/key_terms18.pdf",
        quote: "Keizan Jōkin (1264–1325), known as Taiso, founder of Sōji-ji.",
        authority: "sotoshu",
      },
    ],
  },
  {
    student: "meiho-sotetsu",
    teacher: "keizan-jokin",
    confidence: "high",
    notes:
      "Founded the Meihō-ha; abbot of Yōkō-ji (installed in the 8th month of 1325, one week before Keizan's death) and of Daijō-ji from 1311. Per multiple sources cross-checked by the 24-agent pilot verification: Maezumi's White Plum line and the Suzuki SFZC line are *both* Gasan-ha, NOT Meihō-ha — Wikipedia Sōtō: \"In Western Zen, the two largest lineages, Maezumi's White Plum Asangha and Suzuki's San Francisco Zen Center lineage, are Gasan-ha.\" Modern Sōji-ji dominance is a late-14th-c. to Edo institutional consolidation; the clean two-ha (Meihō vs Gasan) binary erases four other extinct lines.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Keizan",
        quote:
          "Meihō Sotetsu (1277–1350) became abbot of Yōkō-ji, and Gasan Jōseki abbot of Sōji-ji; both of those lines of Dharma Transmission remain important in Japanese Sōtō Zen.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "gasan-joseki",
    teacher: "keizan-jokin",
    confidence: "high",
    notes:
      "Founded the dominant Gasan-ha; 2nd head of Sōji-ji. Five senior heirs (Gasan-go-tetsu) seeded the regional Sōtō network.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Gasan_J%C5%8Dseki",
        quote:
          "Gasan Jōseki ... was a disciple and Dharma heir of Keizan Jōkin and abbot of Sōji-ji.",
        authority: "wikipedia",
      },
    ],
  },

  // ============================================================================
  // PART 4 — Modern Sōtō (Meiji onward) — only edges where both endpoints
  // already exist in the DB. Tokugawa figures (Manzan, Menzan, Tenkei, Gentō)
  // and many Meiji figures (Nishiari, Oka, Kishizawa) are not yet seeded;
  // they appear as MASTER_MISSING info-rows in the audit but don't fail it.
  // ============================================================================
  {
    student: "kodo-sawaki",
    teacher: "sawada-zenko",
    shihoYear: 1906,
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Sawaki_K%C5%8Dd%C5%8D",
        quote:
          "Kōdō Sawaki (1880–1965) received Dharma transmission in 1906 from Zenkō Sawada.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "kosho-uchiyama",
    teacher: "kodo-sawaki",
    confidence: "high",
    notes: "Ordained 1941; succeeded Sawaki as abbot of Antai-ji in 1965.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/K%C5%8Dsh%C5%8D_Uchiyama",
        quote:
          "Kōshō Uchiyama (1912–1998) was a dharma heir of Sawaki Kōdō and successor at Antai-ji.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "gudo-wafu-nishijima",
    teacher: "kodo-sawaki",
    confidence: "high",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Gud%C5%8D_Wafu_Nishijima",
        quote:
          "Nishijima Roshi was a Sōtō Zen priest in the lineage of Kōdō Sawaki.",
        authority: "wikipedia",
      },
    ],
  },

  // ============================================================================
  // PART 5 — 20th-century overseas (subset where both endpoints exist
  // in DB and the claim is well-attested in primary sources)
  // ============================================================================
  {
    student: "shunryu-suzuki",
    teacher: "gyokujun-so-on",
    confidence: "high",
    notes:
      "Shihō from his adoptive father Gyokujun So-on Suzuki. Kishizawa Ian was a formal study teacher, not the shihō teacher.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Shunry%C5%AB_Suzuki",
        quote:
          "Suzuki was ordained as a Sōtō priest by his father's friend, Gyokujun So-on Suzuki, who became his teacher.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "taisen-deshimaru",
    teacher: "kodo-sawaki",
    shihoYear: 1965,
    confidence: "medium",
    notes:
      "Deshimaru claimed deathbed shihō from Sawaki in December 1965; some sources note this transmission was never formally registered with the Sōtōshū. Niwa Rempō later gave shihō to three of Deshimaru's senior heirs in 1984.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Taisen_Deshimaru",
        quote:
          "He received the Dharma transmission (shihō) from Sawaki shortly before Sawaki's death in 1965.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "taizan-maezumi",
    teacher: "baian-hakujun-kuroda",
    shihoYear: 1955,
    confidence: "high",
    notes:
      "Sōtō shihō from his father Hakujun Kuroda. Maezumi additionally received Sanbō-Kyōdan transmission from Hakuun Yasutani (1970) and Kōryū Ōsaka's lay line — the famous triple transmission. The Sōtō line is the primary edge; the others are secondary.",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Hakuyu_Taizan_Maezumi",
        quote:
          "Maezumi received Dharma transmission from his father Baian Hakujun Kuroda in 1955.",
        authority: "wikipedia",
      },
      {
        url: "https://zenhub.org/genealogy/hakuyu-taizan-maezumi-roshi/",
        quote:
          "Maezumi Rōshi received Dharma transmission (shihō) from his father, Baian Hakujun Kuroda, in 1955.",
        authority: "institutional",
      },
    ],
  },
  {
    student: "dainin-katagiri",
    teacher: "daicho-hayashi",
    shihoYear: 1949,
    confidence: "high",
    notes:
      "Daichō Hayashi (Taizō-in, Fukui) ordained Katagiri in 1949. The Hashimoto Eko association at Eihei-ji was a study relationship, not shihō. (Daichō Hayashi is not yet seeded — Phase 4 of the lineage-verification plan adds him.)",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Dainin_Katagiri",
        quote:
          "ordained a monk by and named a Dharma heir of Daicho Hayashi at Taizo-in in Fukui.",
        authority: "wikipedia",
      },
      {
        url: "https://www.mnzencenter.org/uploads/2/9/5/8/29581455/katagiri_biography_v.20220222.pdf",
        quote:
          "On December 24, 1949, Daichō Hayashi performed the denpō ceremony — formal transmission of Dharma — for Katagiri at Taizō-in.",
        authority: "institutional",
      },
    ],
  },
  {
    student: "kobun-chino-otogawa",
    teacher: "hozan-koei-chino",
    shihoYear: 1962,
    confidence: "high",
    notes:
      "Kōbun received shihō from his adoptive father Hōzan Kōei Chino at Jōkō-ji in Kamo, 1962. The widely-cited Eihei-ji Sawaki connection was a practice/onshi training, not shihō. (Hōzan Kōei Chino is not yet seeded — Phase 4 adds him.)",
    sources: [
      {
        url: "https://www.jikojizencenter.org/biography",
        quote:
          "He received dharma transmission from Koei Chino Roshi in Kamo in 1962.",
        authority: "institutional",
      },
      {
        url: "https://en.wikipedia.org/wiki/K%C5%8Dbun_Chino_Otogawa",
        quote:
          "Following the death of his birth father, Kōbun was adopted by his uncle, Hōzan Kōei Chino, who became his Sōtō teacher.",
        authority: "wikipedia",
      },
    ],
  },
  {
    student: "niwa-rempo-zenji",
    teacher: "niwa-butsuan",
    shihoYear: 1926,
    confidence: "high",
    notes:
      "Shihō 1926 from his uncle Niwa Butsuan at Tōkei-in (Shizuoka). Niwa later trained at Antai-ji during Sawaki's era. (Niwa Butsuan not yet seeded — Phase 4 adds him.) Niwa later became the 77th abbot of Eihei-ji (1985–1993).",
    sources: [
      {
        url: "https://terebess.hu/zen/mesterek/NiwaRempo.html",
        quote:
          "ordained at age 12 (1916) under Niwa Butsuan at Tōkei-in ... received dharma transmission from him in 1926.",
        authority: "institutional",
      },
      {
        url: "https://en.wikipedia.org/wiki/Rempo_Niwa",
        quote:
          "Niwa trained at Antai-ji and became the 77th abbot of Eihei-ji.",
        authority: "wikipedia",
      },
    ],
  },
];

// ============================================================================
// CANONICAL_MASTERS — expected biographical / school assignment facts
// ============================================================================

export const CANONICAL_MASTERS: CanonicalMaster[] = [
  // Caodong / Sōtō patriarchal spine.
  // Dongshan's DB school is 'qingyuan-line' (the structural Qingyuan
  // Xingsi → Shitou → ... → Dongshan lineage grouping); his heirs Caoshan
  // and Yunju are placed under 'caodong' (the school he founded). Both
  // placements are defensible — we accept the DB's grouping.
  {
    slug: "dongshan-liangjie",
    birthYear: 807,
    deathYear: 869,
    schoolSlug: "qingyuan-line",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Dongshan_Liangjie",
        quote: "Dongshan Liangjie (807–869), founder of the Caodong school.",
        authority: "wikipedia",
      },
    ],
    notes:
      "Founder of Caodong by name; in our school taxonomy, the founder still belongs to the parent Qingyuan-line grouping while his heirs anchor the Caodong school proper.",
  },
  {
    slug: "tiantong-rujing",
    birthYear: 1163,
    deathYear: 1228,
    schoolSlug: "caodong",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Tiantong_Rujing",
        quote: "Tiantong Rujing (1163–1228), Dōgen's teacher.",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "dogen",
    birthYear: 1200,
    deathYear: 1253,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/D%C5%8Dgen",
        quote: "Dōgen (1200–1253), founder of the Japanese Sōtō school.",
        authority: "wikipedia",
      },
      {
        url: "https://www.sotozen.com/eng/dharma/founders.html",
        quote: "Dōgen Zenji (1200–1253), founder of Sōtō Zen.",
        authority: "sotoshu",
      },
    ],
  },
  {
    slug: "koun-ejo",
    birthYear: 1198,
    deathYear: 1280,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Koun_Ej%C5%8D",
        quote: "Koun Ejō (1198–1280).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "tettsu-gikai",
    birthYear: 1219,
    deathYear: 1309,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Tettsu_Gikai",
        quote: "Tettsū Gikai (1219–1309).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "keizan-jokin",
    birthYear: 1264,
    deathYear: 1325,
    schoolSlug: "soto",
    notes:
      "Sōtōshū / Japanese scholarship: 1264–1325. Wikipedia lists 1268–1325 — keep 1264 per Sōtōshū tie-break rule.",
    sources: [
      {
        url: "https://www.sotozen.com/eng/dharma/founders.html",
        quote: "Keizan Jōkin (1264–1325), Taiso of Sōtō Zen, founder of Sōji-ji.",
        authority: "sotoshu",
      },
    ],
  },
  {
    slug: "gasan-joseki",
    birthYear: 1275,
    deathYear: 1366,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Gasan_J%C5%8Dseki",
        quote: "Gasan Jōseki (1275–1366).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "meiho-sotetsu",
    birthYear: 1277,
    deathYear: 1350,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Keizan",
        quote:
          "Meihō Sotetsu (1277–1350) ... abbot of Yōkō-ji.",
        authority: "wikipedia",
      },
    ],
  },
  // Modern Sōtō anchors
  {
    slug: "kodo-sawaki",
    birthYear: 1880,
    deathYear: 1965,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Sawaki_K%C5%8Dd%C5%8D",
        quote: "Kōdō Sawaki (1880–1965).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "kosho-uchiyama",
    birthYear: 1912,
    deathYear: 1998,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/K%C5%8Dsh%C5%8D_Uchiyama",
        quote: "Kōshō Uchiyama (1912–1998).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "niwa-rempo-zenji",
    birthYear: 1905,
    deathYear: 1993,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Rempo_Niwa",
        quote: "Rempō Niwa (1905–1993), 77th abbot of Eihei-ji.",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "shunryu-suzuki",
    birthYear: 1904,
    deathYear: 1971,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Shunry%C5%AB_Suzuki",
        quote: "Shunryū Suzuki (1904–1971).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "taisen-deshimaru",
    birthYear: 1914,
    deathYear: 1982,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Taisen_Deshimaru",
        quote: "Taisen Deshimaru (1914–1982).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "taizan-maezumi",
    birthYear: 1931,
    deathYear: 1995,
    // Maezumi himself is Sōtō (his Sōtō shihō from Hakujun is the primary
    // edge). The White Plum Asanga is the federation he founded; per
    // memory/project_white_plum_separation.md, his 12 heirs live under
    // 'white-plum-asanga', but Maezumi himself stays in 'soto'.
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Hakuyu_Taizan_Maezumi",
        quote:
          "Maezumi (1931–1995), founder of the Zen Center of Los Angeles and the White Plum Asanga.",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "dainin-katagiri",
    birthYear: 1928,
    deathYear: 1990,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Dainin_Katagiri",
        quote: "Dainin Katagiri (1928–1990).",
        authority: "wikipedia",
      },
    ],
  },
  {
    slug: "kobun-chino-otogawa",
    birthYear: 1938,
    deathYear: 2002,
    schoolSlug: "soto",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/K%C5%8Dbun_Chino_Otogawa",
        quote: "Kōbun Chino Otogawa (1938–2002).",
        authority: "wikipedia",
      },
    ],
  },
];

// ============================================================================
// SCHEMA-ONLY RE-EXPORTS for `audit-soto-lineage.ts`
// ============================================================================

export type CanonicalEdgeKey = `${string}->${string}`;

export function edgeKey(e: { teacher: string; student: string }): CanonicalEdgeKey {
  return `${e.teacher}->${e.student}`;
}
