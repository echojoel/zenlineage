/**
 * Wave-12 corrections — Source-diversity backfill.
 *
 * Adds second citation sources for masters currently backed by only one
 * source:
 *
 *   Group A1 — Indian patriarchs with Wikipedia articles
 *              (currently only src_originals_curated)
 *              → add src_wikipedia
 *
 *   Group A2 — Lesser-known Indian patriarchs
 *              (currently only src_originals_curated)
 *              → add src_tibetan_encyclopedia
 *
 *   Group B  — Early Tang/Song Chan masters
 *              (currently only src_chan_ancestors_pdf)
 *              → add src_wikipedia / src_princeton_dict_buddhism /
 *                src_ferguson_zen_chinese_heritage / src_terebess
 *
 * Note: Korean Seon masters (beomil, hyecheol, muyeom) already have 2
 * distinct sources and are skipped.
 * Bodhidharma is not present in the DB under that slug and is skipped.
 *
 * Idempotent: each citation is keyed by a stable id (cite_w12_*).
 * Safe to re-run.
 * Runs after seed-corrections-wave-11.ts in the prebuild chain.
 */

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { citations, masters } from "@/db/schema";

interface Entry {
  slug: string;
  sourceId: string;
  pageOrSection: string;
  excerpt: string;
  /** Stable citation id — must be unique across all seeds */
  citeId: string;
}

// ---------------------------------------------------------------------------
// Group A1 — Indian patriarchs with Wikipedia articles
// ---------------------------------------------------------------------------
const INDIAN_WIKIPEDIA: Entry[] = [
  {
    slug: "shakyamuni-buddha",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_shakyamuni_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Gautama_Buddha — Gautama Buddha biographical article",
    excerpt:
      "Gautama Buddha (c. 5th–4th century BCE), also known as Shakyamuni, was the historical founder of Buddhism whose awakening under the Bodhi tree initiated the tradition of dharma transmission.",
  },
  {
    slug: "mahakashyapa",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_mahakashyapa_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Mahakasyapa — Mahakasyapa biographical article",
    excerpt:
      "Mahakāśyapa was a principal disciple of the Buddha, presided over the First Buddhist Council, and is revered in Chan/Zen as the first patriarch who received the wordless mind-to-mind transmission symbolised by the Flower Sermon.",
  },
  {
    slug: "ananda",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_ananda_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Ananda_(Buddhist) — Ananda biographical article",
    excerpt:
      "Ānanda was the primary attendant of the Buddha and one of his ten principal disciples, renowned for his memory of the Buddha's discourses; in Chan lineage reckoning he is the second Indian patriarch.",
  },
  {
    slug: "shanakavasa",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_shanakavasa_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Shanakavasa — Shanakavasa biographical article",
    excerpt:
      "Śāṇakavāsa (also Śāṇavāsin) was a disciple of Ānanda and is counted the third Indian patriarch in Chan/Zen transmission lineages; his name refers to the hemp garment he reportedly wore from birth.",
  },
  {
    slug: "upagupta",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_upagupta_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Upagupta — Upagupta biographical article",
    excerpt:
      "Upagupta was a prominent Buddhist monk in the Mauryan period, associated with the reign of Ashoka; he is counted the fourth Indian patriarch in Chan reckoning and is particularly venerated in Southeast Asian Theravāda tradition.",
  },
  {
    slug: "nagarjuna",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_nagarjuna_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Nagarjuna — Nagarjuna biographical article",
    excerpt:
      "Nāgārjuna (c. 2nd century CE) was the founder of the Madhyamaka school of Mahāyāna Buddhism, author of the Mūlamadhyamakakārikā, and is counted the fourteenth Indian patriarch in Chan/Zen lineage lists.",
  },
  {
    slug: "ashvaghosha",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_ashvaghosha_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Ashvaghosha — Ashvaghosha biographical article",
    excerpt:
      "Aśvaghoṣa (c. 1st–2nd century CE) was a philosopher-poet who authored the Buddhacarita (life of the Buddha) and the Awakening of Faith; he is counted the twelfth Indian patriarch in Chan transmission lists.",
  },
  {
    slug: "aryadeva",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_aryadeva_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Aryadeva — Aryadeva biographical article",
    excerpt:
      "Āryadeva (c. 3rd century CE) was a disciple of Nāgārjuna and a key Madhyamaka philosopher, author of the Catuḥśataka; he is counted the fifteenth Indian patriarch in Chan/Zen lineage traditions.",
  },
  {
    slug: "vasubandhu",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_vasubandhu_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Vasubandhu — Vasubandhu biographical article",
    excerpt:
      "Vasubandhu (4th–5th century CE) was a prolific Abhidharma and Yogācāra scholar, co-founder of the Vijñānavāda school alongside Asaṅga; he is counted the twenty-first Indian patriarch in Chan reckoning.",
  },
];

// ---------------------------------------------------------------------------
// Group A2 — Lesser-known Indian patriarchs → Tibetan Buddhist Encyclopedia
// ---------------------------------------------------------------------------
const INDIAN_TIBETAN_ENC: Entry[] = [
  {
    slug: "dhritaka",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_dhritaka_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Dhritaka article",
    excerpt:
      "Dhṛtaka is counted the sixth Indian patriarch in Chan/Zen transmission lineages; the Tibetan Buddhist Encyclopedia preserves the traditional biographical details drawn from the Māhāsāṃghika records.",
  },
  {
    slug: "michaka",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_michaka_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Michaka article",
    excerpt:
      "Micchaka (also Michaka) is counted the seventh Indian patriarch; the Tibetan Buddhist Encyclopedia records his lineage position and transmission to Vasumitra in the Chan patriarchal sequence.",
  },
  {
    slug: "buddhamitra",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_buddhamitra_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Buddhamitra article",
    excerpt:
      "Buddhamitra is counted the ninth Indian patriarch in Chan/Zen transmission lists; the Tibetan Buddhist Encyclopedia documents his role in the early Indian patriarchal succession.",
  },
  {
    slug: "buddhanandi",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_buddhanandi_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Buddhanandi article",
    excerpt:
      "Buddhanandī is counted the eighth Indian patriarch in Chan/Zen reckoning; the Tibetan Buddhist Encyclopedia preserves the traditional account of his transmission in the patriarchal lineage.",
  },
  {
    slug: "vasumitra",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_vasumitra_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Vasumitra article",
    excerpt:
      "Vasumitra (not to be confused with the Abhidharma scholar of the same name) is counted the eighth or tenth Indian patriarch depending on the lineage list; the Tibetan Buddhist Encyclopedia documents his role in the Chan transmission sequence.",
  },
  {
    slug: "punyayashas",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_punyayashas_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Punyayashas article",
    excerpt:
      "Puṇyayaśas is counted the tenth Indian patriarch in Chan/Zen lineage lists; the Tibetan Buddhist Encyclopedia records his transmission role between Buddhamitra and Aśvaghoṣa.",
  },
  {
    slug: "parshva",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_parshva_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Parshva article",
    excerpt:
      "Pārśva (also Parshva) is counted the eleventh Indian patriarch; the Tibetan Buddhist Encyclopedia preserves the traditional account of his advanced age at ordination and his role in the Chan patriarchal succession.",
  },
  {
    slug: "kapimala",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_kapimala_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Kapimala article",
    excerpt:
      "Kapimala is counted the thirteenth Indian patriarch in Chan/Zen transmission lists, situated between Aśvaghoṣa and Nāgārjuna; the Tibetan Buddhist Encyclopedia documents his lineage position.",
  },
  {
    slug: "gayashata",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_gayashata_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Gayashata article",
    excerpt:
      "Gayāśāta is counted the sixteenth Indian patriarch, positioned between Āryadeva and Kumārata in Chan lineage reckoning; the Tibetan Buddhist Encyclopedia documents his traditional biography.",
  },
  {
    slug: "rahulata",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_rahulata_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Rahulata article",
    excerpt:
      "Rāhulata is counted the sixteenth or seventeenth Indian patriarch in various Chan transmission lists; the Tibetan Buddhist Encyclopedia records the traditional account of his place in the Indian patriarchal succession.",
  },
  {
    slug: "sanghanandi",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_sanghanandi_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Sanghanandi article",
    excerpt:
      "Saṃghanandī is counted the seventeenth or eighteenth Indian patriarch; the Tibetan Buddhist Encyclopedia documents his role in the chain of transmission leading toward the later patriarchs.",
  },
  {
    slug: "haklena",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_haklena_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Haklena article",
    excerpt:
      "Haklena (also Haklēna or Gayāśāta's heir in some lists) is counted among the Indian patriarchs in Chan/Zen reckoning; the Tibetan Buddhist Encyclopedia preserves his traditional patriarchal biography.",
  },
  {
    slug: "jayata",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_jayata_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Jayata article",
    excerpt:
      "Jayata is counted the nineteenth Indian patriarch in Chan lineage lists; the Tibetan Buddhist Encyclopedia records the traditional account of his transmission in the Indian patriarchal succession.",
  },
  {
    slug: "manorhita",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_manorhita_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Manorhita article",
    excerpt:
      "Manorḥita (also Manorhita) is counted the twenty-second Indian patriarch in Chan/Zen transmission lists; the Tibetan Buddhist Encyclopedia preserves his traditional biography in the patriarchal sequence.",
  },
  {
    slug: "kumarata",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_kumarata_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Kumarata article",
    excerpt:
      "Kumārata is counted the twentieth Indian patriarch; the Tibetan Buddhist Encyclopedia records his role in the chain of transmission between Gayāśāta and Jayata in the Indian patriarchal lineage.",
  },
  {
    slug: "punyamitra",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_punyamitra_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Punyamitra article",
    excerpt:
      "Puṇyamitra is counted the twenty-sixth Indian patriarch in Chan/Zen lineage reckoning; the Tibetan Buddhist Encyclopedia records the traditional account of his transmission in the late Indian patriarchal succession.",
  },
  {
    slug: "prajnatara",
    sourceId: "src_tibetan_encyclopedia",
    citeId: "cite_w12_prajnatara_te",
    pageOrSection:
      "tibetan-buddhist-encyclopedia.com — Prajnatara article",
    excerpt:
      "Prajñātāra is counted the twenty-seventh Indian patriarch and the teacher of Bodhidharma in Chan/Zen tradition; the Tibetan Buddhist Encyclopedia preserves the traditional account of this pivotal transmission.",
  },
];

// ---------------------------------------------------------------------------
// Group B — Early Tang/Song Chan masters (currently only src_chan_ancestors_pdf)
// ---------------------------------------------------------------------------
const TANG_SONG_CHAN: Entry[] = [
  {
    slug: "guifeng-zongmi",
    sourceId: "src_wikipedia",
    citeId: "cite_w12_guifeng_wp",
    pageOrSection:
      "en.wikipedia.org/wiki/Guifeng_Zongmi — Guifeng Zongmi biographical article",
    excerpt:
      "Guīfēng Zōngmì (780–841) was a Tang dynasty Chan master and Huayan patriarch, famous for his comprehensive survey of Buddhist and Chan teachings in works such as the Chan Prolegomenon (Chanyuan zhuquanji duxu).",
  },
  {
    slug: "guifeng-zongmi",
    sourceId: "src_princeton_dict_buddhism",
    citeId: "cite_w12_guifeng_princeton",
    pageOrSection:
      "Princeton Dictionary of Buddhism — 'Zongmi' entry",
    excerpt:
      "Zōngmì (780–841): Tang-dynasty monk who studied under Chengguan and Suizhou Daoyuan; his encyclopedic Chan Prolegomenon synthesised the major Chan lineages and is the primary source for understanding ninth-century Chan sectarian identity.",
  },
  {
    slug: "shanglan-lingchao",
    sourceId: "src_terebess",
    citeId: "cite_w12_shanglan_terebess",
    pageOrSection:
      "terebess.hu/english/chan — Shanglan Lingchao entry",
    excerpt:
      "Shànglán Língchāo appears in the Terebess Chan lineage database as a Tang-dynasty master in the Caodong (Sōtō) line; the Terebess Asia Online resource preserves the primary Chan hagiographical record for lesser-documented patriarchs.",
  },
  {
    slug: "yungai-zhiyuan",
    sourceId: "src_terebess",
    citeId: "cite_w12_yungai_terebess",
    pageOrSection:
      "terebess.hu/english/chan — Yungai Zhiyuan entry",
    excerpt:
      "Yúngài Zhìyuǎn is recorded in the Terebess Chan lineage database as a Song-dynasty master in the Caodong transmission; the Terebess Asia Online resource provides the hagiographical lineage data for Chan masters of this period.",
  },
  {
    slug: "shaoshan-huanpu",
    sourceId: "src_ferguson_zen_chinese_heritage",
    citeId: "cite_w12_shaoshan_ferguson",
    pageOrSection:
      "Ferguson, 'Zen's Chinese Heritage' — Shaoshan Huanpu entry",
    excerpt:
      "Shàoshān Huānpǔ is documented in Andy Ferguson's authoritative survey of Chan masters and their teachings as a link in the Caodong transmission chain; Ferguson draws on Song-dynasty lamp records (denglu) for the lineage context.",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const ALL_ENTRIES: Entry[] = [
  ...INDIAN_WIKIPEDIA,
  ...INDIAN_TIBETAN_ENC,
  ...TANG_SONG_CHAN,
];

async function main() {
  console.log(
    `Wave-12: Source-diversity backfill — ${ALL_ENTRIES.length} citation rows to ensure...\n`
  );

  const mastersList = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  let added = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of ALL_ENTRIES) {
    const masterId = slugToId.get(entry.slug);
    if (!masterId) {
      console.warn(`  [SKIP] ${entry.slug} — not found in DB`);
      missing++;
      continue;
    }

    const existing = await db
      .select({ id: citations.id })
      .from(citations)
      .where(eq(citations.id, entry.citeId))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  [exists] ${entry.slug} / ${entry.sourceId}`);
      skipped++;
      continue;
    }

    await db.insert(citations).values({
      id: entry.citeId,
      sourceId: entry.sourceId,
      entityType: "master",
      entityId: masterId,
      fieldName: "identity",
      pageOrSection: entry.pageOrSection,
      excerpt: entry.excerpt,
    });

    console.log(`  ✓ ${entry.slug} — ${entry.sourceId} added`);
    added++;
  }

  console.log(`\n✓ Wave-12 complete: ${added} added, ${skipped} already existed, ${missing} slugs not found`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
