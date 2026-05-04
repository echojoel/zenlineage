/**
 * Taizan Maezumi's full transmission neighborhood — his three teachers who
 * authorize his triple-transmission claim (Soto / Rinzai / Sanbo-Zen), and
 * the twelve White Plum dharma heirs through whom Maezumi's line became
 * the most widely-distributed single-master cluster in American Zen.
 *
 * Structured data file consumed by scripts/seed-maezumi-lineage.ts. Dates
 * and affiliations are drawn from the White Plum Asanga's canonical
 * founder page (whiteplum.org/founder/) and the Zen Center of Los Angeles
 * founder history (Water Wheel). Where dates are less well-publicized, the
 * entry uses precision="unknown"/confidence="low" rather than inventing a
 * year — the accuracy audit will flag these as honest gaps.
 */

import type { KVMaster, KVSource } from "./korean-vietnamese-masters";

export const MAEZUMI_SOURCES: KVSource[] = [
  {
    id: "src_whiteplum",
    type: "website",
    title: "White Plum Asanga — Founder and Dharma Heirs",
    author: "White Plum Asanga",
    url: "https://whiteplum.org/founder/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
];

// Each entry anchors its biographical claims to either the White Plum
// founder page, the ZCLA Water Wheel founder history (already in the DB
// as src_zcla_maezumi_founders), or both.

export const MAEZUMI_MASTERS: KVMaster[] = [
  // ─── Teachers who authorize Maezumi's triple lineage ─────────────────
  {
    slug: "baian-hakujun-kuroda",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Baian Hakujun Kuroda" },
      { locale: "en", nameType: "alias", value: "Hakujun Kuroda" },
      { locale: "ja", nameType: "dharma", value: "黒田白雲" },
    ],
    birthYear: 1898,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1978,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Baian Hakujun Kuroda (黒田白雲, 1898–1978) was Taizan Maezumi's father and his first and primary Soto teacher. Abbot of Koshin-ji (Kirigaya-dera) in Tokyo and a senior officer of the Soto school's central administration (Shumucho), he ordained his three monk sons — Junyu, Taizan, and another brother — and gave Taizan Soto dharma transmission, the first of the three authorizations on which Maezumi later built the Zen Center of Los Angeles. Through Baian Hakujun the White Plum line inherits its Soto backbone: shikantaza practice, monastic forms, and the Eiheiji/Sojiji institutional framework that Maezumi brought to the West.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
      { sourceId: "src_zcla_maezumi_founders", fieldName: "teachers" },
    ],
    transmissions: [],
  },
  {
    slug: "osaka-koryu",
    schoolSlug: "rinzai",
    names: [
      { locale: "en", nameType: "dharma", value: "Osaka Koryu" },
      { locale: "en", nameType: "alias", value: "Koryu Osaka Roshi" },
      { locale: "ja", nameType: "dharma", value: "大阪広隆" },
    ],
    birthYear: 1901,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1985,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Osaka Koryu (大阪広隆, 1901–1985) was a lay Rinzai teacher — unusual in a tradition historically centered on monastic training — who led the Tokyo lay group Shakyamuni-kai (Shakyamuni-kai Kanzō) and gave Rinzai inka to a small number of students, including Taizan Maezumi. His authorization is the Rinzai half of Maezumi's triple lineage and is the reason the White Plum line teaches the Hakuin koan curriculum alongside Soto shikantaza. Koryu also taught Robert Aitken, Philip Kapleau, and Peter Matthiessen at various stages, and through Aitken and Kapleau his teaching reached the English-language Zen world well before Maezumi's inka was widely known.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
      { sourceId: "src_zcla_maezumi_founders", fieldName: "teachers" },
    ],
    transmissions: [],
  },

  // ─── The twelve White Plum dharma heirs ───────────────────────────────
  // Ordered roughly by date of transmission; heirs who went on to found
  // major practice centers are given fuller biographies because their
  // historical footprint is larger.

  {
    slug: "bernie-tetsugen-glassman",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Bernie Tetsugen Glassman" },
      { locale: "en", nameType: "alias", value: "Bernie Glassman" },
      { locale: "en", nameType: "alias", value: "Tetsugen Bernard Glassman" },
      { locale: "ja", nameType: "alias", value: "哲玄" },
    ],
    birthYear: 1939,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2018,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Bernie Tetsugen Glassman (哲玄, 1939–2018) was the first of Taizan Maezumi's American dharma heirs, authorized in 1976, and the teacher who shaped socially-engaged Zen in the United States. An aerospace engineer before ordination, he founded the Zen Community of New York (1979), the Greyston Bakery and Greyston Mandala in Yonkers (which provides jobs and housing in distressed communities), and — with his wife Sandra Jishu Holmes — the Zen Peacemakers order in 1996, whose Three Tenets (not-knowing, bearing witness, taking action) recast Maezumi's Zen as an explicitly social practice. Through his Peacemaker bearing-witness retreats at Auschwitz-Birkenau and on the streets of New York, and through a generation of dharma heirs of his own, Glassman made 'engaged Zen' a mainstream category in Western Buddhism.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
      { sourceId: "src_zcla_maezumi_founders" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "First of Maezumi's American dharma heirs; transmission in 1976.",
      },
    ],
  },
  {
    slug: "charlotte-joko-beck",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Charlotte Joko Beck" },
      { locale: "en", nameType: "alias", value: "Joko Beck" },
      { locale: "ja", nameType: "alias", value: "常湖" },
    ],
    birthYear: 1917,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2011,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Charlotte Joko Beck (常湖, 1917–2011) was a second-generation American dharma heir of Taizan Maezumi and the teacher most responsible for an unadorned, psychologically-rigorous American Zen. A classical pianist and single mother of four before coming to practice in her fifties, she was appointed head of the San Diego Zen Center by Maezumi in 1983, later leaving the White Plum to found the Ordinary Mind School — a loosely-federated network of centers emphasising everyday life as the primary field of practice. Her books Everyday Zen (1989) and Nothing Special (1993) became two of the most widely-read introductions to Zen practice in English, and her teaching's refusal of mystification has shaped two generations of secular American Zen.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission from Maezumi; later established Ordinary Mind School independently.",
      },
    ],
  },
  {
    slug: "dennis-genpo-merzel",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Dennis Genpo Merzel" },
      { locale: "en", nameType: "alias", value: "Genpo Roshi" },
      { locale: "ja", nameType: "alias", value: "玄峰" },
    ],
    birthYear: 1944,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Dennis Genpo Merzel (玄峰, b. 1944) was Maezumi's second American dharma heir (authorized in 1980) and the founder of Kanzeon Sangha, later Big Mind Western Zen. A former teacher and swimmer, he trained at the Zen Center of Los Angeles from the early 1970s and subsequently established centers in the Netherlands, Germany, the UK, and Salt Lake City. In the 2000s he developed 'Big Mind', a group-interview practice that explicitly integrates Voice Dialogue psychotherapy with Zen koan inquiry; the method has drawn both enthusiastic uptake and substantive critique from within the Zen world. A 2011 disclosure of misconduct led Merzel to resign from the White Plum Asanga; he continues to teach independently.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission 1980.",
      },
    ],
  },
  {
    slug: "john-daido-loori",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "John Daido Loori" },
      { locale: "en", nameType: "alias", value: "Daido Roshi" },
      { locale: "ja", nameType: "alias", value: "大道" },
    ],
    birthYear: 1931,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2009,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "John Daido Loori (大道, 1931–2009) was a former Navy photographer and research scientist who became one of the most important institution-builders in American Zen. Authorized by Maezumi in the mid-1980s, he founded Zen Mountain Monastery in Mount Tremper, New York (1980) and went on to build the Mountains and Rivers Order — a nationwide network combining traditional monastic training with an integration of creative disciplines (photography, calligraphy, music, zen arts) as dharma gates. Through his Dharma Communications publishing and media work, and a long list of books (including the eight-fold gates of Zen), Loori shaped a distinctly American synthesis of rigorous Soto-Rinzai training with the contemplative arts.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission c. 1986; also received inka from Tetsugen Glassman.",
      },
    ],
  },
  {
    slug: "jan-chozen-bays",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Jan Chozen Bays" },
      { locale: "en", nameType: "alias", value: "Chozen Bays Roshi" },
      { locale: "ja", nameType: "alias", value: "長善" },
    ],
    birthYear: 1945,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Jan Chozen Bays (長善, b. 1945) is a pediatrician, author, and co-abbot of Great Vow Zen Monastery in Clatskanie, Oregon, which she founded with her husband Laren Hogen Bays in 2002. Authorized by Maezumi in the early 1980s, she served for decades at the Zen Community of Oregon in Portland before establishing Great Vow as a full-time residential training monastery. Her teaching integrates Zen with her medical vocation — she is a national expert on child-abuse pediatrics — and her books on mindful eating and mindfulness for children have made White Plum practice accessible outside strictly Buddhist contexts.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission c. 1983.",
      },
    ],
  },
  {
    slug: "gerry-shishin-wick",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Gerry Shishin Wick" },
      { locale: "en", nameType: "alias", value: "Shishin Wick Roshi" },
      { locale: "ja", nameType: "alias", value: "支芯" },
    ],
    birthYear: 1943,
    birthPrecision: "circa",
    birthConfidence: "medium",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Gerry Shishin Wick (支芯, b. c. 1943) is an astrophysicist and Zen master, a White Plum dharma heir of Taizan Maezumi (authorized 1990) and founder of Great Mountain Zen Center in Berthoud, Colorado. With his wife Ilia Shinko Perez (also a dharma heir) he established Great Mountain as a residential training center and has co-authored a number of books on Zen practice, including work on the Book of Equanimity koan collection. His scientific background shapes a teaching style that pairs rigorous koan investigation with clarity about the practice's empirical claims.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission 1990.",
      },
    ],
  },
  {
    slug: "nicolee-jikyo-mccann",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Nicolee Jikyo McCann" },
      { locale: "en", nameType: "alias", value: "Jikyo Roshi" },
      { locale: "ja", nameType: "alias", value: "慈鏡" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Nicolee Jikyo McCann (慈鏡) is a White Plum dharma heir of Taizan Maezumi teaching in Southern California. She served as a senior teacher in the Maezumi line for many years and continues teaching in the White Plum tradition.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "william-nyogen-yeo",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "William Nyogen Yeo" },
      { locale: "en", nameType: "alias", value: "Nyogen Yeo Roshi" },
      { locale: "ja", nameType: "alias", value: "如幻" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "William Nyogen Yeo (如幻) is a White Plum dharma heir of Taizan Maezumi. Long associated with Zenshuji Soto Mission in Los Angeles, he has taught in the Maezumi line since his dharma transmission and continues as a senior teacher.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "susan-myoyu-andersen",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Susan Myoyu Andersen" },
      { locale: "ja", nameType: "alias", value: "妙裕" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 2020,
    deathPrecision: "circa",
    deathConfidence: "medium",
    biography:
      "Susan Myoyu Andersen (妙裕) was a White Plum dharma heir of Taizan Maezumi who served for many years at the Zen Center of Los Angeles. She is remembered for steady teaching in the residential sangha during and after Maezumi's lifetime.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "john-tesshin-sanderson",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "John Tesshin Sanderson" },
      { locale: "ja", nameType: "alias", value: "徹心" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "John Tesshin Sanderson (徹心) is a White Plum dharma heir of Taizan Maezumi, one of the twelve senior students Maezumi authorized before his death in 1995.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "alfred-jitsudo-ancheta",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Alfred Jitsudo Ancheta" },
      { locale: "ja", nameType: "alias", value: "実道" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Alfred Jitsudo Ancheta (実道) is a White Plum dharma heir of Taizan Maezumi, authorized among the cohort of senior students who received transmission before Maezumi's death. He teaches in Southern California in the Maezumi line.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "anne-seisen-saunders",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Anne Seisen Saunders" },
      { locale: "en", nameType: "alias", value: "Seisen Saunders Roshi" },
      { locale: "ja", nameType: "alias", value: "正泉" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Anne Seisen Saunders (正泉) is a White Plum dharma heir of Taizan Maezumi and abbot of Sweetwater Zen Center in National City, California, which she founded as a residential training community. She continues to teach actively in the Maezumi line.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
];

/**
 * Transmissions INTO Maezumi that we need to add (the Soto and Sanbo-Zen
 * branches of his triple lineage — the Rinzai branch we add via Osaka
 * Koryu above, whose slug is defined in the masters list).
 *
 * These run as a post-pass after Kuroda and Koryu have been seeded.
 */
export const MAEZUMI_INCOMING_TRANSMISSIONS: Array<{
  studentSlug: string;
  teacherSlug: string;
  type: "primary" | "secondary" | "dharma";
  isPrimary: boolean;
  notes: string;
  sourceIds: string[];
}> = [
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "baian-hakujun-kuroda",
    type: "dharma",
    isPrimary: false,
    notes:
      "Soto dharma transmission from his father, the abbot of Koshin-ji. Marked non-primary because Maezumi's White Plum lineage flows from Yasutani Hakuun (Sanbo-Zen), and a master may have at most one primary incoming transmission.",
    sourceIds: ["src_whiteplum", "src_zcla_maezumi_founders"],
  },
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "osaka-koryu",
    type: "dharma",
    isPrimary: false,
    notes: "Rinzai inka from lay master Osaka Koryu.",
    sourceIds: ["src_whiteplum"],
  },
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "yamada-koun",
    type: "dharma",
    isPrimary: false,
    notes: "Sanbo-Zen inka; the third of Maezumi's three dharma authorizations.",
    sourceIds: ["src_whiteplum"],
  },
];
