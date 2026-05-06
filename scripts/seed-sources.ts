/**
 * Seed bibliographic source rows into the `sources` table.
 *
 * Idempotent — uses INSERT … ON CONFLICT DO UPDATE so the script can be
 * re-run safely at any time without duplicating data.
 *
 * Usage:  npx tsx scripts/seed-sources.ts
 */

import { db } from "@/db";
import { sources } from "@/db/schema";
import { BIOGRAPHY_EDITORIAL_SOURCE } from "./biography-citations";
import { TEACHING_EDITORIAL_SOURCE } from "./teaching-citations";

const SOURCES = [
  {
    id: "src_external_portrait",
    type: "image_source",
    title: "External portrait (institutional / biographical fair use)",
    author: null,
    url: null,
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_chan_ancestors_pdf",
    type: "lineage_chart",
    title: "Chart of the Chan Ancestors",
    author: "Andy Ferguson",
    url: "https://wisdomexperience.org/product/zens-chinese-heritage/",
    publicationDate: "1998",
    reliability: "scholarly",
  },
  {
    id: "src_tibetan_encyclopedia",
    type: "website",
    title: "Tibetan Buddhist Encyclopedia - Zen Lineage Charts",
    author: null,
    url: "http://tibetanbuddhistencyclopedia.com",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_terebess",
    type: "website",
    title: "Terebess Asia Online - Zen Encyclopaedia",
    author: null,
    url: "https://terebess.hu/zen/",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_cosmos_chan",
    type: "website",
    title: "Cosmos Chan Lineage Transmission Charts",
    author: null,
    url: "https://www.cosmoschan.org/lineage/lineagetransmission/",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_mountain_moon",
    type: "website",
    title: "Mountain Moon Sanbo-Zen Lineage Chart",
    author: null,
    url: "https://mountainmoon.org.au/sanbo-zen-lineage-chart",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_wikipedia",
    type: "website",
    title: "Wikipedia - Zen Lineage Charts",
    author: null,
    url: "https://en.wikipedia.org/wiki/Zen_lineage_charts",
    publicationDate: null,
    reliability: "popular",
  },
  {
    id: "src_originals_curated",
    type: "editorial_dataset",
    title: "Zen Editorial Overlay - Originals Curation",
    author: "Zen project editorial",
    url: null,
    publicationDate: null,
    reliability: "editorial",
  },
  {
    id: "src_sotozen_founders",
    type: "website",
    title: "Sōtō Zen — Sōtōshū global website (lineage and biographies)",
    author: "Sōtōshū Shūmuchō",
    url: "https://www.sotozen.com/eng/",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_hardcore_zen_nishijima_students",
    type: "website",
    title: "Hardcore Zen - Brad Warner on Gudo Nishijima and fellow students",
    author: "Brad Warner",
    url: "https://hardcorezen.info/betrayal-of-the-spirit/159/comment-page-2",
    publicationDate: "2012",
    reliability: "primary",
  },
  {
    id: "src_londonzen_nishijima",
    type: "website",
    title: "London Zen Centre - Gudo Wafu Nishijima",
    author: "London Zen Centre",
    url: "https://www.londonzen.org/gudo-wafu-nishijima/",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_zen_deshimaru_history",
    type: "website",
    title: "Zen Deshimaru - The history of Zen, from the Buddha to the modern world",
    author: "Zen Deshimaru Buddhist Association",
    url: "https://www.zen-deshimaru.com/en/zen/biography-zen-master-eihei-dogen-1200-1253-part-ii",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_zcla_maezumi_founders",
    type: "website",
    title: "Zen Center of Los Angeles - Water Wheel founder history issue",
    author: "Zen Center of Los Angeles",
    url: "https://zcla.org/wp-content/uploads/ewheel/Apr-Jun_2017-Final-singlepgs.pdf",
    publicationDate: "2017",
    reliability: "authoritative",
  },
  {
    id: "src_mnzencenter_katagiri_biography",
    type: "website",
    title: "Minnesota Zen Meditation Center - Ceaseless Effort: The Life of Dainin Katagiri",
    author: "Andrea Martin / Minnesota Zen Meditation Center",
    url: "https://www.mnzencenter.org/uploads/2/9/5/8/29581455/katagiri_biography_v.20211001.pdf",
    publicationDate: "2021",
    reliability: "authoritative",
  },
  {
    id: "src_kobun_sama_biography",
    type: "website",
    title: "Kobun-sama - Biography",
    author: "Kobun-sama.org",
    url: "https://www.kobun-sama.org/en/biografie/",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_obcon_founding_teachers",
    type: "website",
    title: "Order of Buddhist Contemplatives - Founding Teachers",
    author: "Order of Buddhist Contemplatives",
    url: "https://obcon.org/about-us/founding-teachers/",
    publicationDate: null,
    reliability: "authoritative",
  },
  BIOGRAPHY_EDITORIAL_SOURCE,
  TEACHING_EDITORIAL_SOURCE,
  {
    id: "src_mumonkan_senzaki_1934",
    type: "text_edition",
    title: "Mumonkan (Gateless Barrier) — Senzaki & Reps translation, 1934",
    author: "Nyogen Senzaki, Paul Reps (trans.)",
    url: "https://en.wikisource.org/wiki/The_Gateless_Gate",
    publicationDate: "1934",
    reliability: "scholarly",
  },
  {
    id: "src_blue_cliff_record_shaw_1961",
    type: "text_edition",
    title: "The Blue Cliff Record — R.D.M. Shaw translation, 1961",
    author: "R.D.M. Shaw (trans.)",
    url: null,
    publicationDate: "1961",
    reliability: "scholarly",
  },
  {
    id: "src_platform_sutra_yampolsky_1967",
    type: "text_edition",
    title: "The Platform Sutra of the Sixth Patriarch — Philip Yampolsky translation, 1967",
    author: "Philip Yampolsky (trans.)",
    url: null,
    publicationDate: "1967",
    reliability: "scholarly",
  },
  {
    id: "src_wikisource",
    type: "website",
    title: "Wikisource — English-language free library",
    author: null,
    url: "https://en.wikisource.org",
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_dumoulin_india_china",
    type: "book",
    title: "Zen Buddhism: A History, Volume 1 — India and China",
    author: "Heinrich Dumoulin (trans. James W. Heisig & Paul Knitter)",
    url: "https://wisdomexperience.org/product/zen-buddhism-a-history-volume-1/",
    publicationDate: "1988 (rev. 2005)",
    reliability: "scholarly",
  },
  {
    id: "src_dumoulin_japan",
    type: "book",
    title: "Zen Buddhism: A History, Volume 2 — Japan",
    author: "Heinrich Dumoulin (trans. James W. Heisig & Paul Knitter)",
    url: "https://wisdomexperience.org/product/zen-buddhism-a-history-volume-2/",
    publicationDate: "1990 (rev. 2005)",
    reliability: "scholarly",
  },
  {
    id: "src_mcrae_seeing_through_zen",
    type: "book",
    title: "Seeing through Zen: Encounter, Transformation, and Genealogy in Chinese Chan Buddhism",
    author: "John R. McRae",
    url: "https://www.ucpress.edu/book/9780520237988/seeing-through-zen",
    publicationDate: "2003",
    reliability: "scholarly",
  },
  {
    id: "src_leighton_okumura_eihei_koroku",
    type: "text_edition",
    title: "Dōgen's Extensive Record — A Translation of the Eihei Kōroku",
    author: "Taigen Dan Leighton & Shohaku Okumura (trans.)",
    url: "https://wisdomexperience.org/product/dogens-extensive-record/",
    publicationDate: "2004",
    reliability: "scholarly",
  },
  {
    id: "src_cleary_shobogenzo",
    type: "text_edition",
    title: "Treasury of the True Dharma Eye: Zen Master Dogen's Shobo Genzo",
    author: "Kazuaki Tanahashi (ed. & trans.)",
    url: "https://www.shambhala.com/treasury-of-the-true-dharma-eye-1450.html",
    publicationDate: "2010",
    reliability: "scholarly",
  },
  {
    id: "src_red_pine_platform",
    type: "text_edition",
    title: "The Platform Sutra: The Zen Teaching of Hui-neng",
    author: "Red Pine (Bill Porter) (trans.)",
    url: "https://counterpointpress.com/books/the-platform-sutra/",
    publicationDate: "2006",
    reliability: "scholarly",
  },
  {
    id: "src_heine_wright_koan",
    type: "edited_volume",
    title: "The Kōan: Texts and Contexts in Zen Buddhism",
    author: "Steven Heine & Dale S. Wright (eds.)",
    url: "https://global.oup.com/academic/product/the-koan-9780195117486",
    publicationDate: "2000",
    reliability: "scholarly",
  },
  {
    id: "src_shambhala_zen_dictionary",
    type: "reference",
    title: "The Shambhala Dictionary of Buddhism and Zen",
    author: "Ingrid Fischer-Schreiber et al.",
    url: "https://www.shambhala.com/the-shambhala-dictionary-of-buddhism-and-zen.html",
    publicationDate: "1991",
    reliability: "scholarly",
  },
  {
    id: "src_princeton_dict_buddhism",
    type: "reference",
    title: "The Princeton Dictionary of Buddhism",
    author: "Robert E. Buswell Jr. & Donald S. Lopez Jr.",
    url: "https://press.princeton.edu/books/hardcover/9780691157863/the-princeton-dictionary-of-buddhism",
    publicationDate: "2013",
    reliability: "scholarly",
  },
  {
    id: "src_sotoshu_global",
    type: "website",
    title: "Sōtōshū — Global Sōtō Zen Network",
    author: "Sōtōshū Shūmuchō",
    url: "https://www.sotozen.com/",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_plumvillage_books",
    type: "website",
    title: "Plum Village — Books, articles, and practice materials",
    author: "Plum Village Community of Engaged Buddhism",
    url: "https://plumvillage.org/books",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_kwan_um_teachings",
    type: "website",
    title: "Kwan Um School of Zen — Teachings of Zen Master Seung Sahn",
    author: "Kwan Um School of Zen",
    url: "https://kwanumzen.org",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_agent_review",
    type: "review",
    title: "Agent-assisted data review and lineage correction",
    author: null,
    url: null,
    publicationDate: null,
    reliability: "secondary",
  },
  // Three institutional source IDs registered globally so they exist by
  // the time seed-biographies runs (inside seed-db). These are also
  // upserted later by seed-temples.ts and seed-maezumi-lineage.ts, but
  // those run after seed-biographies, which references all three from
  // existing footnotes (Triet → src_azi / src_sotozen_europe; Maezumi
  // and Glassman → src_whiteplum).
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
    url: "https://www.sotozen.com/eng/temples/regional_office/europe.html",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  {
    id: "src_whiteplum",
    type: "website",
    title: "White Plum Asanga — Founder and Dharma Heirs",
    author: "White Plum Asanga",
    url: "https://whiteplum.org/founder/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  // Disciples of Deshimaru: institutional source pages used as footnotes
  // for biographies in seed-biographies.ts and scripts/data/deshimaru-lineage.ts.
  // These are also re-upserted later by seed-temples.ts; registering them
  // here ensures the FK is satisfied when biographies seed inside seed-db.
  {
    id: "src_kosen_sangha",
    type: "website",
    title: "Kosen Sangha — Maître Kosen / Kōsen Thibaut presentation",
    author: "Kosen Sangha International",
    url: "https://www.zen-deshimaru.com/fr/association-abzd/maitre-kosen/",
    publicationDate: "2026",
    reliability: "authoritative",
  },
  {
    id: "src_kanshoji",
    type: "website",
    title: "Monastère Bouddhiste Zen Kanshoji — Founder & lineage",
    author: "Kanshoji / Taiun Jean-Pierre Faure",
    url: "https://www.kanshoji.org/kanshoji/",
    publicationDate: "2026",
    reliability: "authoritative",
  },
  {
    id: "src_zen_road",
    type: "website",
    title: "Zen Road — Sangha Sans demeure (Philippe Reiryū Coupey)",
    author: "Zen Road / Philippe Reiryū Coupey",
    url: "https://zen-road.org/",
    publicationDate: "2026",
    reliability: "authoritative",
  },
  {
    id: "src_mokusho_house",
    type: "website",
    title:
      "Mokusho Zen House Budapest — Our Story (Étienne Mokushō Zeisler & the Eastern European mission)",
    author: "Mokusho Zen House / Yvon Myōken Bec",
    url: "https://www.mokushozen.hu/en/sample-page/our-story/",
    publicationDate: "2026",
    reliability: "authoritative",
  },
  // ── Practice-instruction primary sources ────────────────────────────
  {
    id: "src_jinul_susimkyol",
    type: "primary_text",
    title: "Susimkyŏl 修心訣 (Secrets on Cultivating the Mind)",
    author: "Pojo Chinul (Jinul)",
    url: "https://en.wikipedia.org/wiki/Susimkyol",
    publicationDate: "1209",
    reliability: "authoritative",
  },
  {
    id: "src_seosan_mirror_of_seon",
    type: "primary_text",
    title: "Sŏn'ga kwigam 禪家龜鑑 (Mirror of Seon)",
    author: "Seosan Hyujeong",
    url: "https://en.wikipedia.org/wiki/Cheongheo_Hyujeong",
    publicationDate: "1564",
    reliability: "authoritative",
  },
  {
    id: "src_seongcheol_dharma_talks",
    type: "primary_text",
    title: "Seongcheol Dharma Talks (백일법문)",
    author: "Seongcheol",
    url: "https://en.wikipedia.org/wiki/Seongcheol",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_truc_lam_records",
    type: "primary_text",
    title: "Recorded Sayings of the Trúc Lâm Patriarchs",
    author: "Trần Nhân Tông; Pháp Loa; Huyền Quang",
    url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m_Zen",
    publicationDate: "13th–14th c.",
    reliability: "authoritative",
  },
  {
    id: "src_plum_village_practice",
    type: "website",
    title: "Plum Village — Mindful breathing and walking practice guidance",
    author: "Thích Nhất Hạnh; Plum Village Community of Engaged Buddhism",
    url: "https://plumvillage.org/mindfulness/",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_dogen_fukanzazengi",
    type: "primary_text",
    title: "Fukanzazengi 普勧坐禅儀 (Universal Recommendation for Zazen)",
    author: "Eihei Dōgen",
    url: "https://www.sotozen.com/eng/zazen/advice/fukanzanzeng.html",
    publicationDate: "1227",
    reliability: "authoritative",
  },
  // ── Lisbon / Iberia Sōtō lineage primary references ─────────────────
  {
    id: "src_dojo_zen_lisboa",
    type: "website",
    title: "Ryumonji – Dojo Zen de Lisboa — Mestres",
    author: "Centro Zen de Lisboa (Ryumonji)",
    url: "https://dojozenlisboa.com/mestres/",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_azi_lisbon",
    type: "website",
    title: "Centre zen de Lisboa — Association Zen Internationale",
    author: "Association Zen Internationale",
    url: "https://www.zen-azi.org/en/node/562",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_ysc_gosto_simples",
    type: "monograph",
    title: "O Gosto Simples da Vida",
    author: "Yves Shoshin Crettaz",
    url: null,
    publicationDate: null,
    reliability: "primary",
  },
  {
    id: "src_ysc_young_dogen_pdf",
    type: "essay",
    title: "The Young Dōgen in China",
    author: "Yves Shoshin Crettaz",
    url: "https://www.zen-azi.org/system/files/media/files/2025-09/100-2020%20-%20The%20young%20Dogen%20in%20China%20-%20YSC.pdf",
    publicationDate: "2020",
    reliability: "primary",
  },
  {
    id: "src_seikyuji",
    type: "website",
    title: "Seikyuji Temple — Raphaël Doko Triet",
    author: "Templo Zen Seikyuji",
    url: "https://www.seikyuji.org/raphael-doko-triet/",
    publicationDate: null,
    reliability: "authoritative",
  },
  {
    id: "src_zen_mataro",
    type: "website",
    title: "Zen Mataró — Raphaël Doko Triet (biographical page)",
    author: "Zen Mataró sangha",
    url: "https://zenmataro.com/raphael-doko-triet/",
    publicationDate: null,
    reliability: "secondary",
  },
] as const;

export default async function main() {
  console.log("Seeding sources…");

  for (const src of SOURCES) {
    await db
      .insert(sources)
      .values(src)
      .onConflictDoUpdate({
        target: sources.id,
        set: {
          type: src.type,
          title: src.title,
          author: src.author,
          url: src.url,
          publicationDate: src.publicationDate,
          reliability: src.reliability,
        },
      });

    console.log(`  ✓ ${src.id}`);
  }

  console.log(`\nSeeded ${SOURCES.length} sources.`);
}

if (process.argv[1] && process.argv[1].endsWith("seed-sources.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
