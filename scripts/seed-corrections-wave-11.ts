/**
 * Wave-11 corrections — Master-level citation + search-token backfill for
 * 3 masters added by seed-corrections-wave-10.ts (miyun-yuanwu,
 * feiyin-tongrong, manhwa-suil) without entity-level citations or search
 * tokens.
 *
 * Idempotent. Safe to re-run.
 * Runs after seed-corrections-wave-10.ts in the prebuild chain.
 */

import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { citations, masters, searchTokens } from "@/db/schema";

interface Entry {
  slug: string;
  sourceId: string;
  pageOrSection: string;
  excerpt: string;
  searchToken: string;
}

const ENTRIES: Entry[] = [
  {
    slug: "miyun-yuanwu",
    sourceId: "src_wikipedia",
    pageOrSection: "en.wikipedia.org/wiki/Miyun_Yuanwu — Miyun Yuanwu (密雲圓悟, 1566–1642), late-Ming Linji revival patriarch",
    excerpt: "密雲圓悟 Miyun Yuanwu (1566–1642): major Linji-school revivalist of the late Ming dynasty; teacher of Feiyin Tongrong and many others",
    searchToken: "Miyun Yuanwu 密雲圓悟 Ming Linji",
  },
  {
    slug: "feiyin-tongrong",
    sourceId: "src_wikipedia",
    pageOrSection: "en.wikipedia.org/wiki/Feiyin_Tongrong — Feiyin Tongrong (費隱通容, 1593–1661), dharma heir of Miyun Yuanwu; teacher of Ingen Ryūki",
    excerpt: "費隱通容 Feiyin Tongrong (1593–1661): Linji-school master; transmitted to Ingen Ryūki who founded Ōbaku Zen in Japan",
    searchToken: "Feiyin Tongrong 費隱通容 Obaku Ingen",
  },
  {
    slug: "manhwa-suil",
    sourceId: "src_wikipedia",
    pageOrSection: "en.wikipedia.org/wiki/Gyeongheo — Gyeongheo's teacher: Manhwa Suil (萬化守一), Korean Seon master in the Seosan lineage",
    excerpt: "萬化守一 Manhwa Suil: Korean Seon master and direct teacher of Gyeongheo Seongu (1846–1912), who revived the Joseon Seon tradition",
    searchToken: "Manhwa Suil 萬化守一 Korean Seon Gyeongheo",
  },
];

async function main() {
  console.log("Wave-11: Backfilling citations + search tokens for 3 wave-10 masters...\n");

  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  for (const entry of ENTRIES) {
    const masterId = slugToId.get(entry.slug);
    if (!masterId) {
      console.warn(`  [SKIP] ${entry.slug} — not found in DB`);
      continue;
    }

    // Citation
    const citeId = `cite_w11_master_${entry.slug}`;
    const existingCite = await db
      .select({ id: citations.id })
      .from(citations)
      .where(and(eq(citations.id, citeId), eq(citations.entityType, "master")))
      .limit(1);

    if (existingCite.length === 0) {
      await db.insert(citations).values({
        id: citeId,
        sourceId: entry.sourceId,
        entityType: "master",
        entityId: masterId,
        fieldName: "identity",
        pageOrSection: entry.pageOrSection,
        excerpt: entry.excerpt,
      });
      console.log(`  ✓ ${entry.slug} — citation added`);
    } else {
      console.log(`  [exists] ${entry.slug} — citation already present`);
    }

    // Search token
    const existingToken = await db
      .select({ id: searchTokens.id })
      .from(searchTokens)
      .where(and(eq(searchTokens.entityType, "master"), eq(searchTokens.entityId, masterId)))
      .limit(1);

    if (existingToken.length === 0) {
      await db.insert(searchTokens).values({
        id: nanoid(),
        entityType: "master",
        entityId: masterId,
        token: entry.searchToken,
      });
      console.log(`  ✓ ${entry.slug} — search token added`);
    } else {
      console.log(`  [exists] ${entry.slug} — search token already present`);
    }
  }

  console.log("\n✓ Wave-11 complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
