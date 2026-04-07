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
    title: "Soto Zen Buddhism - Shakyamuni Buddha and the Two Founders",
    author: "Sotoshu / Soto Zen Buddhism",
    url: "https://www.sotozen.com/eng/about/Buddha_founders/dogen_zenji.html",
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
    id: "src_agent_review",
    type: "review",
    title: "Agent-assisted data review and lineage correction",
    author: null,
    url: null,
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
