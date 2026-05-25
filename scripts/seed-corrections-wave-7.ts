/**
 * Wave-7 corrections — Xingyang Qingpou teacher correction + Inzan chain
 * extension (Ekkei Shuken → Kazan Genku → Muchaku Kaiko → Muso Joko →
 * Osaka Koryu).
 *
 * Part 1 (CORRECTIONS): Marks the wrong xingyang-qingpou →
 * xianglin-chengyuan edge as disputed and creates a new primary edge to
 * touzi-yiqing (the probable correct teacher based on generational evidence
 * from Ferguson's Zen's Chinese Heritage and the Angelfire Zen ancestors
 * lineage chart).
 *
 * Part 2 (INZAN_CHAIN_FIXES): Seeds the four missing Japanese Rinzai
 * masters that connect gisan-zenrai (already in DB, 1802–1878) to
 * osaka-koryu (already in DB, 1901–1985):
 *   ekkei-shuken (1810–1884) — student of gisan-zenrai
 *   kazan-genku  (~1840s–~1910s) — student of ekkei-shuken
 *   muchaku-kaiko (1871–1928) — student of kazan-genku
 *   muso-joko    (1884–1949) — student of muchaku-kaiko
 * Then adds the osaka-koryu → muso-joko primary edge.
 *
 * The osaka-koryu → linji-yixuan ORPHAN_ANCHOR in seed-shiho-corrections.ts
 * is removed separately (that entry is deleted from ORPHAN_ANCHORS in that
 * file). With the real chain in place the anchor is no longer needed.
 *
 * Source for the full chain: Wikipedia "Koryū Osaka" infobox, Great Wave
 * Zen Sangha lineage page, and the existing evidence file at
 * scripts/data/transmission-evidence/osaka-koryu__linji-yixuan.md.
 *
 * Runs after seed-corrections-wave-6.ts in the prebuild chain.
 *
 * Idempotent. Safe to re-run.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-corrections-wave-7.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames, masterTransmissions, schools } from "@/db/schema";

// ── Part 1: Disputed-teacher corrections ─────────────────────────────────

interface Correction {
  /** Slug of the student in the existing wrong edge. */
  student: string;
  /** Slug of the (wrong) teacher in the existing edge. */
  wrongTeacher: string;
  /** Slug of the correct teacher (must already exist in DB). */
  correctTeacher: string;
  /** Notes for the disputed edge — explains what research found. */
  disputedNotes: string;
  /** Notes for the new (correct) primary edge. */
  newEdgeNotes: string;
}

// ── Part 2: Inzan chain extension ────────────────────────────────────────

interface SeedMaster {
  slug: string;
  schoolSlug: string;
  enName: string;
  aliases?: string[];
  cjkName?: string;
  cjkLocale?: "ja" | "zh" | "ko";
  birthYear?: number;
  deathYear?: number;
  /** precision hint — "exact" if the year is confirmed, "approximate" if estimated */
  birthPrecision?: "exact" | "approximate" | "unknown";
  deathPrecision?: "exact" | "approximate" | "unknown";
}

interface ChainFix {
  student: string;
  teacher: string;
  notes: string;
}

const CORRECTIONS: Correction[] = [
  {
    student: "xingyang-qingpou",
    wrongTeacher: "xianglin-chengyuan",
    correctTeacher: "touzi-yiqing",
    disputedNotes:
      "DISPUTED — Wave-7 correction 2026-05-25: Xianglin Chengyuan (14th gen, 908–987) " +
      "is three generations before Xingyang Qingpou (17th gen), making a direct " +
      "teacher–student relationship chronologically and generationally implausible. " +
      "Polish Wikipedia confirms Xianglin Chengyuan's documented dharma heir is Zhimen " +
      "Guangzuo (15th gen, d. 1031), not Xingyang Qingpou. The Yunmen chain runs: " +
      "Xianglin Chengyuan (14th gen) → Zhimen Guangzuo (15th gen) → Xuedou Chongxian " +
      "(16th gen, 980–1052), placing Xingyang Qingpou as a 17th-gen heir of someone " +
      "in the 16th generation, not of 14th-gen Xianglin. The original edge is almost " +
      "certainly a data-entry error, possibly caused by confusion between the similar " +
      "'Xianglin' and 'Xingyang' names in a lineage chart.",
    newEdgeNotes:
      "Touzi Yiqing (投子義青, 1032–1083) is the 16th-generation Caodong/Sōtō master " +
      "whose position in the lineage makes him the probable correct teacher of Xingyang " +
      "Qingpou (17th gen). The Angelfire Zen ancestors lineage chart groups Xingyang " +
      "Qingpou under the 'Tousi' (Touzi) heading as 'Tousi Xingyang Qingpou', " +
      "indicating Xingyang Qingpou is a dharma heir of Touzi Yiqing. Ferguson's Zen's " +
      "Chinese Heritage (Terebess) places both Touzi Yiqing and Xingyang Qingpou in the " +
      "17th generation, consistent with Touzi Yiqing (16th gen) → Xingyang Qingpou " +
      "(17th gen). Pending confirmation in primary sources (Wudeng Huiyuan, Jingde " +
      "Chuandeng Lu). Tier D — human review required.",
  },
];

/**
 * New Rinzai masters to seed (Pass 1).
 *
 * These four masters fill the gap in the Inzan chain between gisan-zenrai
 * (already in DB, 1802–1878) and osaka-koryu (already in DB, 1901–1985).
 *
 * Evidence: Wikipedia "Koryū Osaka" article (full lineage chain quoted);
 * Great Wave Zen Sangha lineage page; osaka-koryu__linji-yixuan.md reducer
 * notes (2026-05-25 research session). Dates for Muchaku Kaiko (1871–1928)
 * and Muso Joko (1884–1949) come from the Wikipedia/Great Wave sources.
 * Ekkei Shuken (1810–1884) dates from Terebess/academic Rinzai sources.
 * Kazan Genku dates are not found in any English-language source.
 */
const INZAN_NEW_MASTERS: SeedMaster[] = [
  {
    slug: "ekkei-shuken",
    schoolSlug: "rinzai",
    enName: "Ekkei Shuken",
    aliases: ["Ekkei Shūken"],
    cjkName: "越溪守謙",
    cjkLocale: "ja",
    birthYear: 1810,
    birthPrecision: "exact",
    deathYear: 1884,
    deathPrecision: "exact",
  },
  {
    slug: "kazan-genku",
    schoolSlug: "rinzai",
    enName: "Kazan Genku",
    cjkName: "花山玄久",
    cjkLocale: "ja",
    // Dates not found in English-language sources.
    birthPrecision: "unknown",
    deathPrecision: "unknown",
  },
  {
    slug: "muchaku-kaiko",
    schoolSlug: "rinzai",
    enName: "Muchaku Kaiko",
    aliases: ["Muchaku Kaikō Roshi"],
    cjkName: "無著海光",
    cjkLocale: "ja",
    birthYear: 1871,
    birthPrecision: "exact",
    deathYear: 1928,
    deathPrecision: "exact",
  },
  {
    slug: "muso-joko",
    schoolSlug: "rinzai",
    enName: "Muso Joko",
    aliases: ["Muso Jōkō Roshi", "Hannyakutsu Jōkō Roshi", "Hannyakutsu Joko Roshi"],
    cjkName: "無相定光",
    cjkLocale: "ja",
    birthYear: 1884,
    birthPrecision: "exact",
    deathYear: 1949,
    deathPrecision: "exact",
  },
];

/**
 * Transmission edges to add (Pass 2 — after all masters are seeded).
 *
 * Completes the chain: gisan-zenrai → ekkei-shuken → kazan-genku →
 * muchaku-kaiko → muso-joko → osaka-koryu.
 *
 * The osaka-koryu → muso-joko edge replaces the former
 * osaka-koryu → linji-yixuan ORPHAN_ANCHOR (removed from
 * seed-shiho-corrections.ts as part of this wave-7 work).
 */
const INZAN_CHAIN_FIXES: ChainFix[] = [
  {
    student: "ekkei-shuken",
    teacher: "gisan-zenrai",
    notes:
      "Dharma transmission from Gisan Zenrai (1802–1878) in the Inzan Rinzai line. Ekkei Shuken (越溪守謙, 1810–1884) is the direct dharma heir of Gisan Zenrai in the chain documented by Wikipedia (Koryū Osaka article): Gisan Zenrai → Ekkei Shuken → Kazan Genku → Muchaku Kaikō → Muso Jōkō → Koryū Osaka.",
  },
  {
    student: "kazan-genku",
    teacher: "ekkei-shuken",
    notes:
      "Dharma transmission from Ekkei Shuken (1810–1884) in the Inzan Rinzai line. Kazan Genku (花山玄久) is the dharma heir of Ekkei Shuken in the chain documented by Wikipedia (Koryū Osaka article). Exact dates not found in English-language sources; position in the chain places him active roughly 1870–1920.",
  },
  {
    student: "muchaku-kaiko",
    teacher: "kazan-genku",
    notes:
      "Dharma transmission from Kazan Genku in the Inzan Rinzai line. Muchaku Kaikō (無著海光, 1871–1928) is documented in the Wikipedia Koryū Osaka article as the teacher of Muso Jōkō Roshi. Wikipedia notes he was a Shingon priest who practiced the Inzan koan curriculum.",
  },
  {
    student: "muso-joko",
    teacher: "muchaku-kaiko",
    notes:
      "Dharma transmission from Muchaku Kaikō (1871–1928) in the Inzan Rinzai line. Muso Jōkō (無相定光, 1884–1949, also known as Hannyakutsu Jōkō Roshi) was a Shingon priest who practiced the Inzan koan curriculum. He is documented in the Wikipedia Koryū Osaka article and multiple Western Zen sangha sources (Great Wave Zen, Hazy Moon, Zen Peacemakers) as Koryū Osaka's direct teacher.",
  },
  {
    student: "osaka-koryu",
    teacher: "muso-joko",
    notes:
      "Dharma transmission (inka) from Muso Jōkō Roshi (1884–1949) in the Inzan Rinzai line. Documented by Wikipedia (Koryū Osaka article), Great Wave Zen Sangha lineage page, and other Western Zen sources. Muso Jōkō empowered Koryū Osaka to remain a lay teacher — an unusual authorization that Koryū Osaka passed on as the founding ethos of the Shakamuni-kai lay Rinzai lineage.",
  },
];

async function ensureMaster(seed: SeedMaster): Promise<string> {
  const existing = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, seed.slug))
    .limit(1);
  if (existing.length > 0) return existing[0].id;

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
    birthPrecision: seed.birthPrecision ?? (seed.birthYear ? "exact" : "unknown"),
    birthConfidence: seed.birthYear ? "high" : "low",
    deathYear: seed.deathYear ?? null,
    deathPrecision: seed.deathPrecision ?? (seed.deathYear ? "exact" : "unknown"),
    deathConfidence: seed.deathYear ? "high" : "low",
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
      locale: seed.cjkLocale ?? "ja",
      nameType: "dharma",
      value: seed.cjkName,
    });
  }
  console.log(`  + seeded master: ${seed.slug} (${seed.enName})`);
  return id;
}

async function applyChainFix(f: ChainFix): Promise<"added" | "noop"> {
  // All masters must already exist in DB by the time edges are added
  // (ensureMaster is called for each in INZAN_NEW_MASTERS first).
  const teacherRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, f.teacher))
    .limit(1);
  if (teacherRow.length === 0) {
    console.warn(`  [skip] teacher ${f.teacher} not in DB`);
    return "noop";
  }
  const teacherId = teacherRow[0].id;

  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, f.student))
    .limit(1);
  if (studentRow.length === 0) {
    console.warn(`  [skip] student ${f.student} not in DB`);
    return "noop";
  }
  const studentId = studentRow[0].id;

  const exists = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    )
    .limit(1);
  if (exists.length > 0) return "noop";

  await db.insert(masterTransmissions).values({
    id: nanoid(),
    studentId,
    teacherId,
    type: "primary",
    isPrimary: true,
    notes: f.notes,
  });
  return "added";
}

async function applyCorrection(c: Correction): Promise<{ disputed: boolean; added: boolean }> {
  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, c.student))
    .limit(1);
  if (studentRow.length === 0) {
    console.warn(`  [skip] student ${c.student} not found in DB`);
    return { disputed: false, added: false };
  }
  const studentId = studentRow[0].id;

  const wrongTeacherRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, c.wrongTeacher))
    .limit(1);

  let disputed = false;
  if (wrongTeacherRow.length > 0) {
    const wrongTeacherId = wrongTeacherRow[0].id;
    const existing = await db
      .select({ id: masterTransmissions.id, type: masterTransmissions.type })
      .from(masterTransmissions)
      .where(
        and(
          eq(masterTransmissions.studentId, studentId),
          eq(masterTransmissions.teacherId, wrongTeacherId),
        ),
      )
      .limit(1);
    if (existing.length > 0 && existing[0].type !== "disputed") {
      await db
        .update(masterTransmissions)
        .set({
          type: "disputed",
          isPrimary: false,
          notes: c.disputedNotes,
        })
        .where(eq(masterTransmissions.id, existing[0].id));
      disputed = true;
    }
  } else {
    console.warn(`  [warn] wrong teacher ${c.wrongTeacher} not found — skipping dispute step`);
  }

  const correctTeacherRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, c.correctTeacher))
    .limit(1);
  if (correctTeacherRow.length === 0) {
    console.warn(`  [skip] correct teacher ${c.correctTeacher} not found in DB`);
    return { disputed, added: false };
  }
  const correctTeacherId = correctTeacherRow[0].id;

  const existingNew = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, correctTeacherId),
      ),
    )
    .limit(1);

  let added = false;
  if (existingNew.length === 0) {
    await db.insert(masterTransmissions).values({
      id: nanoid(),
      studentId,
      teacherId: correctTeacherId,
      type: "primary",
      isPrimary: true,
      notes: c.newEdgeNotes,
    });
    added = true;
  }

  return { disputed, added };
}

async function main() {
  // ── Part 1: Disputed-teacher corrections ──────────────────────────────
  let totalDisputed = 0;
  let totalAdded = 0;

  console.log("→ Wave-7 disputed-teacher corrections:");
  for (const c of CORRECTIONS) {
    const { disputed, added } = await applyCorrection(c);
    if (disputed) totalDisputed++;
    if (added) totalAdded++;
    const action =
      disputed && added
        ? "DISPUTED+ADDED"
        : disputed
          ? "DISPUTED    "
          : added
            ? "ADDED       "
            : "noop        ";
    console.log(
      `  ${action} ${c.wrongTeacher} → ${c.student}   (correct: ${c.correctTeacher})`,
    );
  }

  // ── Part 2: Inzan chain extension ─────────────────────────────────────
  console.log("\n→ Wave-7 Inzan chain: seed new masters (pass 1):");
  for (const master of INZAN_NEW_MASTERS) {
    await ensureMaster(master);
  }

  console.log("\n→ Wave-7 Inzan chain: add transmission edges (pass 2):");
  let chainAdded = 0;
  for (const fix of INZAN_CHAIN_FIXES) {
    const result = await applyChainFix(fix);
    if (result === "added") chainAdded++;
    console.log(`  ${result.padEnd(7)} ${fix.teacher} → ${fix.student}`);
  }

  console.log(
    `\n[seed-corrections-wave-7] disputed=${totalDisputed} added=${totalAdded} of ${CORRECTIONS.length} corrections; chain=${chainAdded} of ${INZAN_CHAIN_FIXES.length} edges`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
