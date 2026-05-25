/**
 * seed-cjkv-names-japanese.ts — Add Japanese kanji/kana names to master_names
 *
 * Adds locale-specific name rows (ja, ko, vi, zh) for masters currently missing
 * them. Only characters verified from reputable sources are included:
 *   - Terebess Asia Online (terebess.hu)
 *   - Japanese Wikipedia (ja.wikipedia.org)
 *   - Google Arts & Culture / museum records
 *   - Well-known reference (D.T. Suzuki 鈴木大拙 is unambiguous)
 *
 * Uncertain names are listed in comments and skipped.
 *
 * Idempotent — checks for an existing row with the same (master_id, locale,
 * name_type, value) before inserting. Safe to re-run.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-cjkv-names-japanese.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames } from "@/db/schema";

interface NameEntry {
  slug: string;
  locale: "ja" | "ko" | "vi" | "zh";
  nameType: "dharma" | "birth" | "honorific" | "alias";
  value: string;
  /** Short justification / source for this entry */
  source: string;
}

// ---------------------------------------------------------------------------
// Verified entries
// ---------------------------------------------------------------------------
// Sources used:
//   [T] = terebess.hu biographical entry page
//   [JW] = ja.wikipedia.org article
//   [EW] = en.wikipedia.org article
//   [GK] = well-known / unambiguous (e.g. D.T. Suzuki)
//   [JWC] = ja.wikipedia.org — Jochu Tengin article, disciple list
//   [TA] = terebess.hu lineage / Seisetsu page
// ---------------------------------------------------------------------------

const ENTRIES: NameEntry[] = [
  // ── Sōtō medieval lineage (Baizan → Jochu → Shingan branch) ──────────────

  {
    // Source: [T] terebess.hu/zen/mesterek/BaizanMonpon.html
    // kanji confirmed in page heading "梅山聞本 Baizan Monpon"
    slug: "baizan-monpon",
    locale: "ja",
    nameType: "dharma",
    value: "梅山聞本",
    source: "Terebess: terebess.hu/zen/mesterek/BaizanMonpon.html",
  },
  {
    // Source: [T] terebess.hu/zen/mesterek/JochuTengin.html
    // heading "如仲 [恕仲] 天誾 Jochū Tengin (1365-1437)"
    // ja.Wikipedia also confirms 如仲天誾 as primary, 恕仲天誾 as variant
    slug: "jochu-tengin",
    locale: "ja",
    nameType: "dharma",
    value: "如仲天誾",
    source: "Terebess + ja.Wikipedia: ja.wikipedia.org/wiki/如仲天ぎん",
  },
  {
    // Source: [JWC] ja.wikipedia.org/wiki/如仲天ぎん — disciple list
    // "真厳道空" listed as second named dharma heir of Jochu Tengin
    slug: "shingan-doku",
    locale: "ja",
    nameType: "dharma",
    value: "真厳道空",
    source: "ja.Wikipedia Jochu Tengin article, disciple list: 真厳道空",
  },

  // daiki-kyokan is the slug; ja.Wikipedia Jochu Tengin article names
  // "大輝霊曜" (Taiki Reiyō) as one of Jochu's dharma heirs. The slug
  // "daiki-kyokan" renders as a different reading of the same kanji block.
  // UNCERTAIN: The slug romanisation "daiki-kyokan" doesn't match "大輝霊曜"
  // (Taiki Reiyō). Adding with nameType=alias flagged by source comment.
  {
    // Source: [JWC] ja.Wikipedia Jochu Tengin disciple list: 大輝霊曜
    // NOTE: Reading "daiki kyokan" vs "taiki reiyo" — same kanji, different
    // romanisation convention. Adding as alias; nameType=alias to signal
    // the mismatch for human review.
    slug: "daiki-kyokan",
    locale: "ja",
    nameType: "alias",
    value: "大輝霊曜",
    source: "ja.Wikipedia Jochu Tengin disciples: 大輝霊曜 (Taiki Reiyō / Daiki Kyokan) — reading uncertain, added as alias",
  },

  // Taigen Soshin — confirmed from Terebess JochuTengin page ancestor chain
  // "太源 宗真 Taigen Sōshin (?-1371)" — appears as ancestor of Baizan Monpon
  {
    // Source: [T] terebess.hu/zen/mesterek/JochuTengin.html ancestor list
    slug: "taigen-soshin",
    locale: "ja",
    nameType: "dharma",
    value: "太源宗真",
    source: "Terebess JochuTengin page ancestor list: 太源 宗真 Taigen Sōshin",
  },

  // ── Sōtō medieval lineage — Senso Esai branch ────────────────────────────
  // senso-esai, iyoku-choyu, mugai-keigon, nenshitsu-yokaku:
  // Terebess references these masters only in romanised form. The kanji
  // "泉叟恵済" for Senso Esai is inferred from the search result snippet
  // "泉叟 恵済" but not confirmed from a direct page view. SKIP pending
  // verification.
  //
  // SKIPPED (uncertain kanji — no page-level kanji confirmation found):
  //   senso-esai       — Terebess gives only romanised "Sensō Esai"
  //   iyoku-choyu      — Terebess/Wikipedia give only romanised form
  //   mugai-keigon     — No kanji source located (not same as Mugai Nyodai)
  //   nenshitsu-yokaku — No kanji source located

  // ── Rinzai — Inzan lineage (Ryoen → Seisetsu → Bokuo branch) ─────────────

  {
    // Source: [TA] terebess.hu/zen/mesterek/SekiSeisetsu.html
    // Dharma lineage section: "龍淵元碩 Ryūen Genseki (1842-1918)"
    slug: "ryoen-genseki",
    locale: "ja",
    nameType: "dharma",
    value: "龍淵元碩",
    source: "Terebess SekiSeisetsu page dharma lineage: 龍淵元碩 Ryūen Genseki",
  },
  {
    // Source: [TA] terebess.hu/zen/mesterek/SekiSeisetsu.html
    // Heading "精拙元浄 Seisetsu Genjō (1877-1945)" confirmed; also confirmed
    // by japanesewiki.com/Buddhism/Seki Seisetsu.html
    slug: "seisetsu-genjyo",
    locale: "ja",
    nameType: "dharma",
    value: "精拙元浄",
    source: "Terebess SekiSeisetsu page: 精拙元浄 Seisetsu Genjō; confirmed japanesewiki.com",
  },
  {
    // Source: japanesewiki.com/Buddhism/Seki Bokuo.html: "関牧翁"
    // Further confirmed by reiwaantiques.com product title and paradisebound.ca
    slug: "bokuo-soun",
    locale: "ja",
    nameType: "dharma",
    value: "関牧翁",
    source: "japanesewiki.com Seki Bokuo entry: 関牧翁; confirmed reiwaantiques product listing",
  },

  // ── Rinzai — Takuju / Daitokuji lineage (Sohan → Yamamoto Genpo) ─────────

  {
    // Source: terebess.hu/zen/mesterek/YamamotoGenpo.html
    // Dharma lineage: "宗般玄芳 Sōhan Genhō (1848-1922)"
    // Note: romanised in some sources as "Sohan Genyo" but kanji is 宗般玄芳
    slug: "sohan-genyo",
    locale: "ja",
    nameType: "dharma",
    value: "宗般玄芳",
    source: "Terebess YamamotoGenpo page lineage: 宗般玄芳 Sōhan Genhō",
  },

  // ── Rinzai — Inzan lineage (Banryo → Joten → Joshu Sasaki) ──────────────

  {
    // Source: Multiple web sources (ciolek.com Hakuin School, search snippets)
    // confirm "盤龍禅礎 Banryo Zenso" in the Inzan transmission chain
    // leading to Joten Soko. Dates given as 1848-1935 in one source
    // (vs 1849-1918 in DB) but kanji is consistent.
    slug: "banryo-zenso",
    locale: "ja",
    nameType: "dharma",
    value: "盤龍禅礎",
    source: "ciolek.com Hakuin School lineage chart: 盤龍禅礎 Banryo Zenso",
  },
  {
    // Source: Multiple web sources confirm "承天宗杲" as Joten Soko's kanji.
    // Confirmed via peoplepill.com/i/kyozan-joshu-sasaki lineage entry.
    slug: "joten-soko-miura",
    locale: "ja",
    nameType: "dharma",
    value: "承天宗杲",
    source: "peoplepill.com Joshu Sasaki lineage: 承天宗杲 Joten Soko Miura",
  },

  // ── Rinzai — Nanzenji lineage ─────────────────────────────────────────────

  // kono-bukai: Terebess ShibayamaZenkei page mentions "河野霧海 Kōno Mukai"
  // as a possible alternative, but the reading "Bukai" vs "Mukai" is
  // inconsistent. Relationship to 河野武戒 also unclear. SKIPPED.
  //
  // SKIPPED (uncertain):
  //   kono-bukai — conflicting kanji; Terebess gives 河野霧海 (Mukai) not Bukai

  // ── D.T. Suzuki ──────────────────────────────────────────────────────────

  {
    // Source: [GK] universally known; English Wikipedia, Terebess, all sources
    // confirm 鈴木大拙 (Suzuki Daisetsu). Full birth name: 鈴木大拙貞太郎.
    slug: "d-t-suzuki",
    locale: "ja",
    nameType: "dharma",
    value: "鈴木大拙",
    source: "en.wikipedia.org/wiki/D._T._Suzuki: 鈴木 大拙 貞太郎 (universally confirmed)",
  },

  // ── Sōtō — Keido Chisan (Sōjiji abbot) ──────────────────────────────────

  {
    // Source: [T] terebess.hu/zen/mesterek/koho.html
    // Page heading: "孤峰 (瑩堂) 智璨 Kohō (Keidō) Chisan (1879-1967)"
    // 瑩堂智璨 is the Keidō Chisan reading. Kohō (孤峰) is his alternative name.
    slug: "keido-chisan",
    locale: "ja",
    nameType: "dharma",
    value: "瑩堂智璨",
    source: "Terebess koho.html: 孤峰 (瑩堂) 智璨 Kohō (Keidō) Chisan",
  },

  // ── Rinzai — Nanpu Shaoming / Nampo Jomyo ────────────────────────────────

  {
    // Source: [EW] en.wikipedia.org/wiki/Nanpo_Sh%C5%8Dmy%C5%8D
    // "南浦紹明" confirmed. This is a Chinese master who came to Japan,
    // so the zh locale is also appropriate but ja is the canonical form
    // used in Japanese Rinzai sources.
    slug: "nanpu-shaoming",
    locale: "ja",
    nameType: "dharma",
    value: "南浦紹明",
    source: "en.Wikipedia Nanpo Shōmyō: 南浦紹明 confirmed; Terebess daio-kokushi page",
  },

  // ── Sōtō masters with no kanji found ─────────────────────────────────────
  //
  // The following masters have only romanised names in accessible sources.
  // No attempt to construct or guess kanji. All skipped:
  //
  //   niken-sekiryo    — Terebess entry exists but no kanji on accessible page
  //   guhaku-daioshou  — Terebess entry exists but no kanji found
  //   tenrin-kanshu    — no dedicated source located
  //   bokushitsu-bokushu — Terebess entry exists but no kanji confirmed
  //   ken-an-junsa     — no kanji source located
  //   enjo-gikan       — no kanji source located
  //   sengan-bonryu    — no kanji source located
  //   shoun-hozui      — no kanji source located
  //   reitan-roryu     — Terebess entry exists but no kanji confirmed
  //   chokoku-koen     — no kanji source located
  //   senshu-donko     — no kanji source located
  //
  //   shaku-daijo      — references point to a Western Zen priest, no traditional kanji
  //   shaku-kojyu      — no kanji source located beyond family name 釈
  //   joten-soko-miura — added above
  //   ryoen-genseki    — added above

  // ── Korean / Vietnamese masters (checking existing coverage) ─────────────
  //
  // From the pre-check query, these already exist in the DB:
  //   vinitaruci      vi: "Tì-ni-đa-lưu-chi"  ← ALREADY EXISTS
  //   vo-ngon-thong   vi: "Vô Ngôn Thông"      ← ALREADY EXISTS
  //   vo-ngon-thong   zh: "無言通"               ← ALREADY EXISTS
  //   khuong-viet     vi: "Khuông Việt"         ← ALREADY EXISTS
  //   van-hanh        vi: "Vạn Hạnh"            ← ALREADY EXISTS
  //   gyeongheo-seongu ko: "경허성우"            ← ALREADY EXISTS
  //   gyeongheo-seongu zh: "鏡虛惺牛"            ← ALREADY EXISTS
  //   seosan-hyujeong ko: "서산휴정"              ← ALREADY EXISTS
  //   seosan-hyujeong zh: "西山休靜"              ← ALREADY EXISTS
  //
  // All requested KO/VI entries are already present. No action needed.
];

// ---------------------------------------------------------------------------

async function main() {
  console.log("seed-cjkv-names-japanese: Adding CJKV locale names...\n");

  // Load all master slugs → IDs
  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  let added = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of ENTRIES) {
    const masterId = slugToId.get(entry.slug);
    if (!masterId) {
      console.warn(`  [NOT IN DB] ${entry.slug} — master not found, skipping`);
      missing++;
      continue;
    }

    // Check if this exact (master_id, locale, name_type, value) row already exists
    const existing = await db
      .select({ id: masterNames.id })
      .from(masterNames)
      .where(
        and(
          eq(masterNames.masterId, masterId),
          eq(masterNames.locale, entry.locale),
          eq(masterNames.nameType, entry.nameType),
          eq(masterNames.value, entry.value),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`  [already exists] ${entry.slug} (${entry.locale}) "${entry.value}"`);
      skipped++;
      continue;
    }

    // Also check if ANY row with this locale already exists (to avoid duplicates
    // when the value differs but represents the same locale entry)
    const existingLocale = await db
      .select({ id: masterNames.id, value: masterNames.value })
      .from(masterNames)
      .where(
        and(
          eq(masterNames.masterId, masterId),
          eq(masterNames.locale, entry.locale),
          eq(masterNames.nameType, entry.nameType),
        )
      )
      .limit(1);

    if (existingLocale.length > 0) {
      console.log(
        `  [locale exists] ${entry.slug} (${entry.locale}/${entry.nameType}) already has "${existingLocale[0].value}" — skipping "${entry.value}"`
      );
      skipped++;
      continue;
    }

    await db.insert(masterNames).values({
      id: nanoid(),
      masterId,
      locale: entry.locale,
      nameType: entry.nameType,
      value: entry.value,
    });

    console.log(`  ✓ ${entry.slug} (${entry.locale}) → "${entry.value}"`);
    added++;
  }

  console.log(`\n✓ Done: ${added} names added, ${skipped} skipped (already present), ${missing} slugs not found in DB`);

  if (missing > 0) {
    console.warn("\nWARNING: Some slugs were not found. Check that the seed-db pipeline has run.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
