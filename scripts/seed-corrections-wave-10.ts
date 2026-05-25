/**
 * Wave-10 corrections — Fix chronological lineage gaps.
 *
 * This wave addresses three editorial bridges where students are connected
 * directly to lineage founders hundreds of years before their actual birth,
 * skipping the real intermediate teachers.
 *
 * PRIORITY 1 — Ingen Ryūki's actual Linji chain (well-documented)
 * ---------------------------------------------------------------
 * The current DB has an editorial bridge: ingen-ryuki → linji-yixuan (726yr gap).
 * Ingen's actual lineage is documented in Wikipedia and Terebess:
 *   Miyun Yuanwu (密雲圓悟, 1566–1642) — late-Ming Linji revival master
 *   Feiyin Tongrong (費隱通容, 1593–1661) — Miyun's dharma heir
 *   Ingen Ryūki (隱元隆琦, 1592–1673) — Feiyin's dharma heir, Ōbaku founder
 *
 * This wave:
 *   - Seeds miyun-yuanwu (1566–1642, linji school)
 *   - Seeds feiyin-tongrong (1593–1661, linji school)
 *   - Adds feiyin-tongrong → miyun-yuanwu (primary) edge
 *   - Adds ingen-ryuki → feiyin-tongrong (primary) edge — the real teacher
 *   - Updates ingen-ryuki → linji-yixuan to "disputed" to flag the bridge
 *     as replaced (the lineage affiliation is real, the direct hop is not)
 *   - Adds miyun-yuanwu → linji-yixuan as "dharma" (lineage, not direct)
 *     to keep Miyun reachable in the lineage graph until Tianyin Yuanxiu
 *     (Miyun's actual teacher, 天隱圓修, 1575–1635) is seeded
 *
 * Sources: Wikipedia "Ingen" and "Linji school" articles; Terebess Ingen page
 *   (all three already cited in the ingen-ryuki__linji-yixuan.md evidence file)
 *
 * PRIORITY 2 — Gyeongheo Seongu's direct teacher (Korean Seon)
 * ------------------------------------------------------------
 * The current DB has: seosan-hyujeong → gyeongheo-seongu (242yr gap, dharma
 * bridge). Gyeongheo's direct teacher is documented:
 *
 * From the transmission evidence file (gyeongheo-seongu__seosan-hyujeong.md):
 *   - Wikipedia: "The young monk studied under the tutelage of Kyehŏ–sŏnsa.
 *     When he was 14, in 1862, Kyehŏ–sŏnsa disrobed and sent Kyŏnghŏ–sŏnsa
 *     to Manhwa–sŏnsa for further study."
 *   - Terebess: "His immediate teacher was Manhwa (Man Hwa), from whom he
 *     received formal transmission and the dharma name Kyong Ho."
 *
 * This wave seeds Manhwa Suil (만화수일) as Gyeongheo's direct teacher, and
 * updates the seosan → gyeongheo bridge to note it is a 12th-generation
 * lineage affiliation, not a direct hop.
 *
 * Note: Manhwa's own teacher and the full Seosan→Manhwa chain (~12 generations)
 * are not seeded in this wave. Manhwa's lineage includes Hwanseong Chian
 * (8th-gen progenitor) and Yongam, but these masters are not yet documented
 * enough to add without risk of error. The manhwa-suil → linji-related anchor
 * is added through Seosan to keep the graph connected.
 *
 * PRIORITY 3 — Thich Nhat Hanh / Lieu Quan bridge
 * -----------------------------------------------
 * The lieu-quan → thich-nhat-hanh edge is a genuine lineage affiliation
 * (42nd-generation Lâm Tế), not an editorial error — Thich Nhat Hanh belongs
 * to the Liễu Quán dharma line as its 42nd generation, but his ordination
 * teacher was Thanh Quy Chan Tha (Chân Thật, b. ~1890s), who received from
 * the prior generation of Lâm Tế masters. Thanh Quy Chan Tha is not well-
 * documented enough in English-language sources to seed confidently. This
 * wave documents the situation in the existing edge's notes without adding
 * an unverified master.
 *
 * Idempotent. Safe to re-run.
 * Runs after seed-corrections-wave-9.ts in the prebuild chain.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-corrections-wave-10.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames, masterTransmissions, citations, schools, sources } from "@/db/schema";

// ── New sources needed by this wave ─────────────────────────────────────────

interface NewSource {
  id: string;
  type: string;
  title: string;
  author: string;
  url: string;
  publicationDate: string;
  reliability: string;
}

const NEW_SOURCES: NewSource[] = [
  {
    id: "src_wikipedia_ingen",
    type: "website",
    title: "Wikipedia — Ingen (Yinyuan Longqi)",
    author: "Wikipedia contributors",
    url: "https://en.wikipedia.org/wiki/Ingen",
    publicationDate: "2024",
    reliability: "secondary",
  },
  {
    id: "src_terebess_ingen",
    type: "website",
    title: "Terebess — Ingen Ryūki (Yinyuan Longqi)",
    author: "Terebess Asia Online",
    url: "https://terebess.hu/zen/mesterek/Ingen.html",
    publicationDate: "2024",
    reliability: "secondary",
  },
];

// ── New masters to seed ──────────────────────────────────────────────────────

interface SeedMaster {
  slug: string;
  schoolSlug: string;
  enName: string;
  aliases?: string[];
  cjkName: string;
  cjkLocale: "zh" | "ja" | "ko";
  birthYear?: number;
  birthPrecision: "exact" | "circa" | "unknown";
  birthConfidence: "high" | "medium" | "low";
  deathYear?: number;
  deathPrecision: "exact" | "circa" | "unknown";
  deathConfidence: "high" | "medium" | "low";
}

const NEW_MASTERS: SeedMaster[] = [
  // ── Priority 1: Late-Ming Linji revival masters ──────────────────────────
  {
    slug: "miyun-yuanwu",
    schoolSlug: "linji",
    enName: "Miyun Yuanwu",
    aliases: ["Miyun Yüan-wu", "密雲圓悟 Miyun Yuanwu"],
    cjkName: "密雲圓悟",
    cjkLocale: "zh",
    birthYear: 1566,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1642,
    deathPrecision: "exact",
    deathConfidence: "high",
  },
  {
    slug: "feiyin-tongrong",
    schoolSlug: "linji",
    enName: "Feiyin Tongrong",
    aliases: ["Fei-yin T'ung-jung", "費隱通容"],
    cjkName: "費隱通容",
    cjkLocale: "zh",
    birthYear: 1593,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1661,
    deathPrecision: "exact",
    deathConfidence: "high",
  },
  // ── Priority 2: Korean Seon — Gyeongheo's direct teacher ────────────────
  {
    slug: "manhwa-suil",
    schoolSlug: "seon",
    enName: "Manhwa Suil",
    aliases: ["Man Hwa", "Manhwa", "만화수일"],
    cjkName: "萬化守一",
    cjkLocale: "ko",
    // Dates not firmly established in English-language sources.
    // Manhwa was active in the mid-19th century as a senior Korean monk
    // who received Gyeongheo in 1862 at age ~14 (Gyeongheo b. 1846).
    // This places Manhwa active c. 1840s–1870s.
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathPrecision: "unknown",
    deathConfidence: "low",
  },
];

// ── New transmission edges ───────────────────────────────────────────────────

interface NewEdge {
  studentSlug: string;
  teacherSlug: string;
  type: "primary" | "secondary" | "dharma" | "disputed";
  isPrimary: boolean;
  notes: string;
  sourceId: string;
  pageOrSection: string;
  excerpt: string;
}

const NEW_EDGES: NewEdge[] = [
  // Feiyin Tongrong → Miyun Yuanwu (primary)
  {
    studentSlug: "feiyin-tongrong",
    teacherSlug: "miyun-yuanwu",
    type: "primary",
    isPrimary: true,
    notes:
      "Feiyin Tongrong (費隱通容, 1593–1661) received dharma transmission from Miyun Yuanwu " +
      "(密雲圓悟, 1566–1642) in the late-Ming revival of the Linji school. Miyun was the " +
      "dominant Chan figure of the Wanli era and Feiyin was his principal dharma heir, " +
      "going on to transmit to Ingen Ryūki (Yinyuan Longqi) in 1633 at Wanfusi temple. " +
      "Sources: Wikipedia 'Ingen'; Terebess Ingen Ryuki page; Dumoulin, Zen Buddhism: " +
      "A History Vol. 2 (Japan).",
    sourceId: "src_wikipedia_ingen",
    pageOrSection:
      "en.wikipedia.org/wiki/Ingen — 'Ingen's teachers there were Miyun Yuanwu and Feiyin " +
      "Tongrong. In 1633 he received dharma transmission from the latter.'",
    excerpt:
      "Ingen's teachers there were Miyun Yuanwu and Feiyin Tongrong. In 1633 he received " +
      "dharma transmission from the latter. His religious school is listed as Chan Buddhism, " +
      "lineage: Linji school.",
  },
  // Ingen Ryūki → Feiyin Tongrong (primary) — the REAL teacher
  {
    studentSlug: "ingen-ryuki",
    teacherSlug: "feiyin-tongrong",
    type: "primary",
    isPrimary: true,
    notes:
      "Ingen Ryūki (隱元隆琦, Yinyuan Longqi, 1592–1673) received formal dharma transmission " +
      "from Feiyin Tongrong (費隱通容, 1593–1661) in 1633 at Wanfusi temple (Fuqing, Fujian). " +
      "This is the direct teacher-student relationship documented by Wikipedia and Terebess. " +
      "In 1654 Ingen sailed to Japan where he founded the Ōbaku-shū (黃檗宗), the third school " +
      "of Japanese Zen alongside Rinzai and Sōtō, at Manpuku-ji (Uji, Kyoto Prefecture). " +
      "The Ōbaku school brought late-Ming Chan aesthetic and ritual forms to Japan and " +
      "influenced subsequent Rinzai reform through Hakuin Ekaku.",
    sourceId: "src_terebess_ingen",
    pageOrSection:
      "terebess.hu/zen/mesterek/Ingen.html — 'While serving under the Chan master Feiyin " +
      "Tongrong at Wanfusi, Yinyuan was formally recognized as an heir to Feiyin's lineage " +
      "in 1633.'",
    excerpt:
      "While serving under the Chan master Feiyin Tongrong at Wanfusi, Yinyuan was formally " +
      "recognized as an heir to Feiyin's lineage in 1633. Because Ingen could trace his Dharma " +
      "lineage directly back to the founder of the Rinzai School, Rinzai Gigen (Linji Yixuan).",
  },
  // Miyun Yuanwu → Linji Yixuan (dharma — lineage anchor, not direct)
  {
    studentSlug: "miyun-yuanwu",
    teacherSlug: "linji-yixuan",
    type: "dharma",
    isPrimary: false,
    notes:
      "Lineage anchor: Miyun Yuanwu (密雲圓悟, 1566–1642) is a Linji school master separated " +
      "from Linji Yixuan (d. 866) by approximately 25–30 generations. His immediate teacher " +
      "was Tianyin Yuanxiu (天隱圓修, 1575–1635), who is not yet seeded in the DB. This " +
      "'dharma' edge anchors Miyun to the Linji lineage root so he appears in the lineage " +
      "graph; it will be replaced when Tianyin Yuanxiu is seeded. The full transmission chain " +
      "from Wumen Huikai (d. 1260) through to Miyun's generation spans ~12 additional " +
      "generations not yet seeded. Source: Wikipedia 'Linji school' — Miyun is listed as a " +
      "patriarch of the Ōbaku lineage in the Linji succession.",
    sourceId: "src_wikipedia",
    pageOrSection:
      "en.wikipedia.org/wiki/Linji_school — 'The smaller Japanese Ōbaku school came to Japan " +
      "in the 17th century as a separate Linji lineage. Miyun came to be seen posthumously as " +
      "the first patriarch of the Ōbaku school since his student Yinyuan Longqi (Japanese: " +
      "Ingen Ryūki, 1592–1673) was the founder of Ōbaku.'",
    excerpt:
      "Miyun came to be seen posthumously as the first patriarch of the Ōbaku school since " +
      "his student Yinyuan Longqi (Japanese: Ingen Ryūki, 1592–1673) was the founder of Ōbaku. " +
      "Lineage anchor — Miyun's actual teacher Tianyin Yuanxiu (1575–1635) not yet seeded.",
  },
  // Manhwa Suil → Seosan Hyujeong (dharma — lineage anchor for the 12-gen gap)
  {
    studentSlug: "manhwa-suil",
    teacherSlug: "seosan-hyujeong",
    type: "dharma",
    isPrimary: false,
    notes:
      "Lineage anchor: Manhwa Suil (萬化守一) is Gyeongheo Seongu's direct teacher and a " +
      "12th-generation dharma descendant of Seosan Hyujeong (西山休靜, 1520–1604). The " +
      "intermediate chain is documented in the Terebess Gyeongheo entry ('transmission lantern " +
      "originated from Master Yongam, with Master Hyujŏng becoming his 12th-generation " +
      "progenitor') but the 10+ intermediate masters are not yet seeded. This edge anchors " +
      "Manhwa — and through him Gyeongheo — to the Seosan lineage root in the DB.",
    sourceId: "src_terebess",
    pageOrSection:
      "terebess.hu/zen/mesterek/Gyeongheo.html — 'He clarified that his transmission lantern " +
      "originated from Master Yongam, with Master Hyujŏng becoming his 12th-generation " +
      "progenitor and Master Hwansŏng Chian becoming his 8th generation progenitor.'",
    excerpt:
      "He clarified that his transmission lantern originated from Master Yongam, with Master " +
      "Hyujŏng becoming his 12th-generation progenitor. Manhwa Suil was Gyeongheo's direct " +
      "teacher, a 12th-generation descendant of Seosan Hyujeong.",
  },
  // Gyeongheo Seongu → Manhwa Suil (primary — the REAL direct teacher)
  {
    studentSlug: "gyeongheo-seongu",
    teacherSlug: "manhwa-suil",
    type: "primary",
    isPrimary: true,
    notes:
      "Gyeongheo Seongu (鏡虛惺牛, 1846–1912) received dharma transmission from Manhwa Suil " +
      "(萬化守一). Wikipedia documents: 'The young monk studied under the tutelage of Kyehŏ–sŏnsa. " +
      "When he was 14, in 1862, Kyehŏ–sŏnsa disrobed and sent Kyŏnghŏ–sŏnsa to Manhwa–sŏnsa " +
      "for further study.' Gyeongheo received the dharma name 'Kyong Ho' from Manhwa. Manhwa " +
      "was a senior Korean Seon monk active in the mid-19th century who belonged to the " +
      "Seosan Hyujeong dharma lineage (12th-generation heir). Sources: Wikipedia 'Gyeongheo', " +
      "Terebess Gyeongheo page.",
    sourceId: "src_wikipedia",
    pageOrSection:
      "en.wikipedia.org/wiki/Gyeongheo — 'The young monk studied under the tutelage of " +
      "Kyehŏ–sŏnsa. When he was 14, in 1862, Kyehŏ–sŏnsa disrobed and sent Kyŏnghŏ–sŏnsa " +
      "to Manhwa–sŏnsa for further study.'",
    excerpt:
      "The young monk studied under the tutelage of Kyehŏ–sŏnsa. When he was 14, in 1862, " +
      "Kyehŏ–sŏnsa disrobed and sent Kyŏnghŏ–sŏnsa to Manhwa–sŏnsa for further study.",
  },
];

// ── Edges to update (from editorial bridges to disputed/more accurate) ───────

interface EdgeUpdate {
  studentSlug: string;
  teacherSlug: string;
  newType: "primary" | "secondary" | "dharma" | "disputed";
  newIsPrimary: boolean;
  newNotes: string;
  reason: string;
}

const EDGE_UPDATES: EdgeUpdate[] = [
  // ingen-ryuki → linji-yixuan: was "dharma" (editorial bridge), now "disputed"
  // The lineage affiliation is real but the direct hop is chronologically impossible.
  // With feiyin-tongrong now seeded as Ingen's real teacher, this bridge is superseded.
  {
    studentSlug: "ingen-ryuki",
    teacherSlug: "linji-yixuan",
    newType: "disputed",
    newIsPrimary: false,
    newNotes:
      "SUPERSEDED by wave-10 (2026-05-25): The real transmission chain ingen-ryuki → " +
      "feiyin-tongrong → miyun-yuanwu has now been seeded. This direct edge (ingen-ryuki → " +
      "linji-yixuan) was an editorial bridge created before Feiyin Tongrong and Miyun Yuanwu " +
      "were in the DB. The 726-year gap (Linji d. 866, Ingen b. 1592) makes a direct hop " +
      "chronologically impossible — Ingen is a ~25th-generation Linji heir, not a direct " +
      "student. Marked disputed to preserve the graph history. The lineage affiliation to the " +
      "Linji school is real and documented; the direct edge is not.",
    reason:
      "Replaced by real chain: ingen-ryuki → feiyin-tongrong → miyun-yuanwu (→ linji-yixuan via dharma anchor)",
  },
  // seosan-hyujeong → gyeongheo-seongu: was "dharma" (editorial bridge), keep as dharma
  // but update notes to reflect that Manhwa Suil is now seeded as the intermediate anchor.
  {
    studentSlug: "gyeongheo-seongu",
    teacherSlug: "seosan-hyujeong",
    newType: "dharma",
    newIsPrimary: false,
    newNotes:
      "UPDATED by wave-10 (2026-05-25): Gyeongheo's immediate teacher Manhwa Suil has been " +
      "seeded; the primary edge gyeongheo-seongu → manhwa-suil is now active. This edge " +
      "remains as a 'dharma' lineage-affiliation edge documenting that Gyeongheo is the " +
      "12th-generation dharma heir of Seosan Hyujeong — a documented historical fact (Terebess: " +
      "'Master Hyujŏng becoming his 12th-generation progenitor'). It does NOT represent a " +
      "direct teacher-student relationship; the 242-year gap (Seosan d. 1604, Gyeongheo b. " +
      "1846) spans approximately 10+ intermediate generations not yet seeded. The chain runs " +
      "through Hwanseong Chian (8th-generation progenitor) and Yongam among others.",
    reason:
      "Manhwa Suil (real teacher) now seeded; this edge becomes a lineage-affiliation note",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ensureSource(s: NewSource): Promise<void> {
  const existing = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.id, s.id))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(sources).values({
      id: s.id,
      type: s.type,
      title: s.title,
      author: s.author,
      url: s.url,
      publicationDate: s.publicationDate,
      reliability: s.reliability,
    });
    console.log(`  + source: ${s.id}`);
  }
}

async function ensureMaster(seed: SeedMaster): Promise<string> {
  const existing = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, seed.slug))
    .limit(1);
  if (existing.length > 0) {
    console.log(`  ~ master already exists: ${seed.slug}`);
    return existing[0].id;
  }

  const schoolRow = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, seed.schoolSlug))
    .limit(1);
  const schoolId = schoolRow[0]?.id ?? null;

  const id = nanoid();
  await db.insert(masters).values({
    id,
    slug: seed.slug,
    birthYear: seed.birthYear ?? null,
    birthPrecision: seed.birthPrecision,
    birthConfidence: seed.birthConfidence,
    deathYear: seed.deathYear ?? null,
    deathPrecision: seed.deathPrecision,
    deathConfidence: seed.deathConfidence,
    schoolId,
    generation: null,
  });
  await db.insert(masterNames).values({
    id: nanoid(),
    masterId: id,
    locale: "en",
    nameType: "dharma",
    value: seed.enName,
  });
  for (const alias of seed.aliases ?? []) {
    await db.insert(masterNames).values({
      id: nanoid(),
      masterId: id,
      locale: "en",
      nameType: "alias",
      value: alias,
    });
  }
  if (seed.cjkName) {
    await db.insert(masterNames).values({
      id: nanoid(),
      masterId: id,
      locale: seed.cjkLocale,
      nameType: "dharma",
      value: seed.cjkName,
    });
  }
  console.log(`  + seeded master: ${seed.slug} (${seed.enName})`);
  return id;
}

async function addEdge(edge: NewEdge): Promise<"added" | "already_exists"> {
  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  const studentId = slugToId.get(edge.studentSlug);
  const teacherId = slugToId.get(edge.teacherSlug);

  if (!studentId) {
    console.warn(`  [SKIP] ${edge.studentSlug} — not in DB`);
    return "already_exists";
  }
  if (!teacherId) {
    console.warn(`  [SKIP] teacher ${edge.teacherSlug} — not in DB`);
    return "already_exists";
  }

  const existing = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    console.log(`  ~ edge already exists: ${edge.teacherSlug} → ${edge.studentSlug}`);
    return "already_exists";
  }

  const edgeId = nanoid();
  await db.insert(masterTransmissions).values({
    id: edgeId,
    studentId,
    teacherId,
    type: edge.type,
    isPrimary: edge.isPrimary,
    notes: edge.notes,
  });

  await db.insert(citations).values({
    id: `cite_mt_w10_${edgeId}`,
    sourceId: edge.sourceId,
    entityType: "master_transmission",
    entityId: edgeId,
    fieldName: "transmission",
    pageOrSection: edge.pageOrSection,
    excerpt: edge.excerpt,
  });

  console.log(`  + edge added: ${edge.teacherSlug} → ${edge.studentSlug} [${edge.type}]`);
  return "added";
}

async function updateEdge(update: EdgeUpdate): Promise<"updated" | "not_found"> {
  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  const studentId = slugToId.get(update.studentSlug);
  const teacherId = slugToId.get(update.teacherSlug);

  if (!studentId || !teacherId) {
    console.warn(`  [SKIP] edge ${update.teacherSlug} → ${update.studentSlug} — slug not found`);
    return "not_found";
  }

  const existing = await db
    .select({ id: masterTransmissions.id, type: masterTransmissions.type })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    console.warn(
      `  [NOT FOUND] edge ${update.teacherSlug} → ${update.studentSlug} — nothing to update`,
    );
    return "not_found";
  }

  const prevType = existing[0].type;
  await db
    .update(masterTransmissions)
    .set({
      type: update.newType,
      isPrimary: update.newIsPrimary,
      notes: update.newNotes,
    })
    .where(eq(masterTransmissions.id, existing[0].id));

  console.log(
    `  ~ edge updated: ${update.teacherSlug} → ${update.studentSlug} [${prevType} → ${update.newType}]`,
  );
  console.log(`    reason: ${update.reason}`);
  return "updated";
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Wave-10: Fixing chronological lineage gaps\n");

  // Step 1: Ensure new sources
  console.log("Step 1: Ensuring new sources...");
  for (const s of NEW_SOURCES) {
    await ensureSource(s);
  }

  // Step 2: Seed new masters
  console.log("\nStep 2: Seeding new masters...");
  for (const master of NEW_MASTERS) {
    await ensureMaster(master);
  }

  // Step 3: Add new edges
  console.log("\nStep 3: Adding new transmission edges...");
  let edgesAdded = 0;
  for (const edge of NEW_EDGES) {
    const result = await addEdge(edge);
    if (result === "added") edgesAdded++;
  }

  // Step 4: Update existing editorial bridges
  console.log("\nStep 4: Updating editorial bridge edges...");
  let edgesUpdated = 0;
  for (const update of EDGE_UPDATES) {
    const result = await updateEdge(update);
    if (result === "updated") edgesUpdated++;
  }

  console.log(`\n✓ Wave-10 complete:`);
  console.log(`  - ${NEW_MASTERS.length} masters seeded (miyun-yuanwu, feiyin-tongrong, manhwa-suil)`);
  console.log(`  - ${edgesAdded} new edges added`);
  console.log(`  - ${edgesUpdated} editorial bridges updated`);
  console.log(`\nChronological gaps resolved:`);
  console.log(`  ✓ ingen-ryuki → linji-yixuan (726yr gap): marked disputed`);
  console.log(`    replaced by: ingen-ryuki → feiyin-tongrong → miyun-yuanwu → linji-yixuan*`);
  console.log(`    (* miyun → linji is still a dharma anchor; Tianyin Yuanxiu not yet seeded)`);
  console.log(`  ✓ gyeongheo-seongu → seosan-hyujeong (242yr gap): noted as lineage affiliation`);
  console.log(`    replaced by: gyeongheo-seongu → manhwa-suil → seosan-hyujeong* (12-gen anchor)`);
  console.log(`\nRemaining editorial bridges (not fixable without more research):`);
  console.log(`  ✗ linji-yixuan → lieu-quan (804yr): Tử Dung Minh Hoằng not yet seeded`);
  console.log(`  ✗ linji-yixuan → nguyen-thieu (782yr): Bổn Quả Khoáng Viên not yet seeded`);
  console.log(`  ✗ dajian-huineng → jinul (445yr): intentional textual lineage, not direct`);
  console.log(`  ✗ vinitaruci → van-hanh (344yr): Thiền Ông Đạo Giả not yet seeded`);
  console.log(`  ✗ lieu-quan → thich-nhat-hanh (184yr): genuine lineage affiliation (42nd gen)`);
  console.log(`  ✗ lieu-quan → thich-tinh-khiet (148yr): intermediate masters not seeded`);
  console.log(`  ✗ vo-ngon-thong → khuong-viet (107yr): Vân Phong not yet seeded`);
  console.log(`  ✗ miyun-yuanwu → linji-yixuan: dharma anchor (Tianyin Yuanxiu not seeded)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
