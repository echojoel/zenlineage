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

const SOURCES = [
  {
    id: "src_chan_ancestors_pdf",
    type: "lineage_chart",
    title: "Chart of the Chan Ancestors",
    author: "Andy Ferguson",
    url: null,
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
    url: null,
    publicationDate: null,
    reliability: "secondary",
  },
  {
    id: "src_mountain_moon",
    type: "website",
    title: "Mountain Moon Sanbo-Zen Lineage Chart",
    author: null,
    url: null,
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
] as const;

async function main() {
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
