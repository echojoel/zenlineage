/**
 * Wave-4 orphan-upstream corrections.
 *
 * Connects the remaining orphan masters (who don't reach Shakyamuni via
 * the public graph) to their actual dharma teachers per the Wave-4
 * agent panel. Some teachers already exist in the DB; others need to
 * be seeded as new masters.
 *
 * Runs after seed-corrections-wave-3.ts in the prebuild chain.
 *
 * Idempotent. Safe to re-run.
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames, masterTransmissions, schools } from "@/db/schema";

interface SeedMaster {
  slug: string;
  schoolSlug: string;
  enName: string;
  aliases?: string[];
  cjkName?: string;
  cjkLocale?: "ja" | "zh" | "ko";
  birthYear?: number;
  deathYear?: number;
}

interface OrphanFix {
  student: string;
  teacher: string;
  seedTeacher?: SeedMaster;
  notes: string;
}

const ORPHAN_FIXES: OrphanFix[] = [
  // Niwa Rempō Zenji ← Niwa Butsuan (already in DB, just needs edge).
  {
    student: "niwa-rempo-zenji",
    teacher: "niwa-butsuan",
    notes:
      "Dharma transmission (shihō) 1926, age 22, at Tōkei-in temple, Shizuoka. Rempō succeeded Butsuan as 5th abbot of Tōkei-in. Per Terebess Zen Encyclopedia and sotozen-net.or.jp.",
  },
  // Niwa Butsuan ← Niwa Bukkan (NEW master, 1862-1904).
  {
    student: "niwa-butsuan",
    teacher: "niwa-bukkan",
    seedTeacher: {
      slug: "niwa-bukkan",
      schoolSlug: "soto",
      enName: "Niwa Bukkan Myōkoku",
      aliases: ["Bukkan Myōkoku", "Niwa Bukkan"],
      cjkName: "丹羽佛鑑明國",
      cjkLocale: "ja",
      birthYear: 1862,
      deathYear: 1904,
    },
    notes:
      "Niwa Bukkan Myōkoku (1862–1904), prior abbot of Tōkei-in. Butsuan was adopted into the Niwa family and succeeded Bukkan. Per Terebess Niwa Butsuan biography and Niwa Rempō biography.",
  },
  // Daichō Hayashi ← Yōzan Genki Hayashi (NEW master).
  {
    student: "daicho-hayashi",
    teacher: "yozan-genki-hayashi",
    seedTeacher: {
      slug: "yozan-genki-hayashi",
      schoolSlug: "soto",
      enName: "Yōzan Genki Hayashi",
      aliases: ["Yozan Hayashi"],
      cjkName: "林洋山玄機",
      cjkLocale: "ja",
    },
    notes:
      "Yōzan Genki Hayashi was abbot of the original Taizō-in in Fukui City and took Daichō Hayashi in as a monk-novice. Daichō took the Hayashi surname from him and later moved the Taizō-in name to a small Kitada village temple. Per Andrea Martin, 'Ceaseless Effort: The Life of Dainin Katagiri' (MZMC) and Patheos / Great Tree Temple.",
  },
  // Yūkō Okamoto ← Kōdō Sawaki (already in DB).
  {
    student: "yuko-okamoto",
    teacher: "kodo-sawaki",
    notes:
      "Yūkō Okamoto practised with Kōdō Sawaki as a young monk at Teishōji (Sawaki's training base). Note: while Okamoto is consistently described as Sawaki's student, the institutional shihō pathway may differ — Sawaki's 5+3 named shihō recipients do not include Yūkō; the formal shihō may have come via Yamada Reirin or Niwa Rempō. Per Muijoji Zen Dōjō Zürich and Seikyuji.",
  },
  // Kōjun Kishigami ← Kōdō Sawaki (already in DB).
  {
    student: "kishigami-kojun",
    teacher: "kodo-sawaki",
    notes:
      "Dharma transmission (shihō) from Kōdō Sawaki in 1965, approximately one month before Sawaki's death on 21 December 1965. Kishigami is one of five monks who received transmission from Sawaki. Per Terebess Kishigami biography, English Wikipedia Sawaki article, and German Wikipedia Kishigami article.",
  },
  // Jakuen ← Koun Ejō (already in DB) — direct disciple of Rujing who
  // received Japan-side shihō from Dōgen's heir.
  {
    student: "jakuen",
    teacher: "koun-ejo",
    notes:
      "Jakuen (寂円, 1207–1299) trained under Tiantong Rujing in China alongside Dōgen, came to Japan with Dōgen, and received shihō from Dōgen's heir Koun Ejō after Dōgen's death (1253). Founded Hōkyōji temple in Echizen. Per ja.wikipedia.org/wiki/寂円, en.wikipedia.org/wiki/Jakuen, and Japanese Wiki Corpus.",
  },
  // Ryoka Daibai ← Kakuan Ryogu (NEW master).
  {
    student: "ryoka-daibai",
    teacher: "kakuan-ryogu",
    seedTeacher: {
      slug: "kakuan-ryogu",
      schoolSlug: "soto",
      enName: "Kakuan Ryogu",
      cjkName: "覚庵良愚",
      cjkLocale: "ja",
    },
    notes:
      "Kakuan Ryogu (覚庵良愚) sits at position 83 in the Maezumi/White Plum Sōtō chant lineage, with Ryoka Daibai (84) as his dharma heir and Ungan Guhaku (85) following. Per Village Zendo, Great Plains Zen Center, Dewdrop Sangha, Sacramento Zen, and Treetop Zen Center lineage chants.",
  },
  // Changlu Qingliao is a DUPLICATE of zhenxie-qingliao (same person —
  // 'Changlu' is his mountain residence; 'Zhenxie' is his honorific).
  // The DB has both as separate masters. Best fix without merging:
  // give Changlu Qingliao a primary edge from Danxia Zichun (the same
  // teacher as Zhenxie), so the lineage chain renders correctly on
  // his detail page even though the duplicate sits alongside.
  {
    student: "changlu-qingliao",
    teacher: "danxia-zichun",
    notes:
      "Changlu Qingliao (長蘆清了, 1088–1151) is the same person as Zhenxie Qingliao (真歇清了) — 'Changlu' refers to Mount Changlu where he served as head monk; 'Zhenxie' is his honorific title. Same dharma transmission from Danxia Zichun as the Zhenxie Qingliao node. The DB has both names as separate masters; a future cleanup pass should merge them. Per en.wikipedia.org/wiki/Zhenxie_Qingliao.",
  },

  // ── Phase 2: upstream connections for the new masters we just added.
  // Each previously-orphaned chain gets one more hop up so its students
  // become Shakyamuni-reachable.

  // Niwa Bukkan ← Masuda Zuimyō (NEW master).
  {
    student: "niwa-bukkan",
    teacher: "masuda-zuimyo",
    seedTeacher: {
      slug: "masuda-zuimyo",
      schoolSlug: "soto",
      enName: "Masuda Zuimyō",
      cjkName: "増田瑞明",
      cjkLocale: "ja",
    },
    notes:
      "Masuda Zuimyō, abbot of Hōzōji, ordained Niwa Bukkan in 1873 (age 10) and conferred shihō around 1885 after Bukkan's university studies. Per Le Refuge du Plessis (Tōkei-in lineage page).",
  },
  // Yōzan Genki Hayashi ← Sozan Chimon (NEW master, position 85 in the
  // Maezumi/Katagiri Sōtō chant lineage).
  {
    student: "yozan-genki-hayashi",
    teacher: "sozan-chimon",
    seedTeacher: {
      slug: "sozan-chimon",
      schoolSlug: "soto",
      enName: "Sozan Chimon",
      cjkName: "曽山智門",
      cjkLocale: "ja",
    },
    notes:
      "Sozan Chimon sits at position 85 in the Maezumi/Katagiri Sōtō chant lineage, immediately preceding Yōzan Genki Hayashi (position 86). Per Treeleaf Zen lineage chart.",
  },
  // Kakuan Ryogu ← Kakujo Tosai (NEW master, position 82 in the chant).
  {
    student: "kakuan-ryogu",
    teacher: "kakujo-tosai",
    seedTeacher: {
      slug: "kakujo-tosai",
      schoolSlug: "soto",
      enName: "Kakujo Tosai",
      cjkName: "覚浄登斎",
      cjkLocale: "ja",
    },
    notes:
      "Kakujo Tosai sits at position 82 in the Maezumi/White Plum Sōtō chant lineage, immediately preceding Kakuan Ryogu (position 83). Per Village Zendo, Treetop Zen Center, and Great Plains Zen Center liturgies.",
  },
];

// ── Wave-4 mis-attribution corrections (surfaced during tier upgrades).
// Same pattern as wave-3: mark wrong edge `disputed` and add correct
// primary where possible.

interface DisputedFix {
  student: string;
  wrongTeacher: string;
  correctTeacher?: string;
  newEdgeNotes?: string;
  disputedNotes: string;
}

const DISPUTED_FIXES: DisputedFix[] = [
  {
    student: "huguo-jingyuan",
    wrongTeacher: "taiping-huiqin",
    correctTeacher: "yuanwu-keqin",
    newEdgeNotes:
      "Huguo Jingyuan was a dharma heir of Yuanwu Keqin (Linji school, Yangqi sub-line). Per Polish Wikipedia and MDPI Religions academic source.",
    disputedNotes:
      "DISPUTED — Wave-4: Huguo Jingyuan's actual teacher was Yuanwu Keqin, not Taiping Huiqin.",
  },
  {
    student: "huanglong-huiji",
    wrongTeacher: "huanglong-huinan",
    disputedNotes:
      "DISPUTED — Wave-4: Huanglong Huiji appears ca. 1204; Huanglong Huinan died 1069. Direct transmission is chronologically impossible (~135 year gap). Edge represents school affiliation, not direct shihō.",
  },
  {
    student: "gessen-zenne",
    wrongTeacher: "shoju-rojin",
    disputedNotes:
      "DISPUTED — Wave-4: Gessen Zen'e's actual teacher was Kogetsu Zenzai, not Shoju Rojin. Per Wikipedia and Encyclopedia of Buddhism.",
  },
  {
    student: "baoning-renyong",
    wrongTeacher: "cuiyan-kezhen",
    correctTeacher: "yangqi-fanghui",
    newEdgeNotes:
      "Baoning Renyong was a dharma heir of Yangqi Fanghui, founder of the Yangqi sub-line of Linji. Per WWZC and Terebess.",
    disputedNotes:
      "DISPUTED — Wave-4: Baoning Renyong's actual teacher was Yangqi Fanghui, not Cuiyan Kezhen.",
  },
];

async function applyDisputedFix(d: DisputedFix): Promise<{ disputed: boolean; added: boolean }> {
  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, d.student))
    .limit(1);
  if (studentRow.length === 0) return { disputed: false, added: false };
  const studentId = studentRow[0].id;

  let disputed = false;
  const wrongRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, d.wrongTeacher))
    .limit(1);
  if (wrongRow.length > 0) {
    const existing = await db
      .select({ id: masterTransmissions.id, type: masterTransmissions.type })
      .from(masterTransmissions)
      .where(
        and(
          eq(masterTransmissions.studentId, studentId),
          eq(masterTransmissions.teacherId, wrongRow[0].id),
        ),
      )
      .limit(1);
    if (existing.length > 0 && existing[0].type !== "disputed") {
      await db
        .update(masterTransmissions)
        .set({ type: "disputed", isPrimary: false, notes: d.disputedNotes })
        .where(eq(masterTransmissions.id, existing[0].id));
      disputed = true;
    }
  }

  let added = false;
  if (d.correctTeacher) {
    const correctRow = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, d.correctTeacher))
      .limit(1);
    if (correctRow.length > 0) {
      const exists = await db
        .select({ id: masterTransmissions.id })
        .from(masterTransmissions)
        .where(
          and(
            eq(masterTransmissions.studentId, studentId),
            eq(masterTransmissions.teacherId, correctRow[0].id),
          ),
        )
        .limit(1);
      if (exists.length === 0) {
        await db.insert(masterTransmissions).values({
          id: nanoid(),
          studentId,
          teacherId: correctRow[0].id,
          type: "primary",
          isPrimary: true,
          notes: d.newEdgeNotes ?? null,
        });
        added = true;
      }
    }
  }
  return { disputed, added };
}

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
    birthPrecision: seed.birthYear ? "exact" : "unknown",
    birthConfidence: seed.birthYear ? "high" : "low",
    deathYear: seed.deathYear ?? null,
    deathPrecision: seed.deathYear ? "exact" : "unknown",
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
  return id;
}

async function applyFix(f: OrphanFix): Promise<"added" | "noop"> {
  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, f.student))
    .limit(1);
  if (studentRow.length === 0) {
    console.warn(`  [skip] student ${f.student} not found`);
    return "noop";
  }
  const studentId = studentRow[0].id;

  let teacherId: string | null = null;
  if (f.seedTeacher) {
    teacherId = await ensureMaster(f.seedTeacher);
  } else {
    const teacherRow = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, f.teacher))
      .limit(1);
    if (teacherRow.length > 0) teacherId = teacherRow[0].id;
  }
  if (!teacherId) {
    console.warn(`  [skip] teacher ${f.teacher} not found / not seeded`);
    return "noop";
  }

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

async function main() {
  let added = 0;
  for (const fix of ORPHAN_FIXES) {
    const result = await applyFix(fix);
    if (result === "added") added++;
    console.log(`  ${result.padEnd(7)} ${fix.teacher} → ${fix.student}`);
  }
  let disputed = 0;
  let disputedAdded = 0;
  for (const d of DISPUTED_FIXES) {
    const result = await applyDisputedFix(d);
    if (result.disputed) disputed++;
    if (result.added) disputedAdded++;
    const action = result.disputed && result.added ? "DISPUTED+ADDED"
      : result.disputed ? "DISPUTED"
      : result.added ? "ADDED" : "noop";
    console.log(
      `  ${action.padEnd(15)} ${d.wrongTeacher} → ${d.student}${
        d.correctTeacher ? `   (correct: ${d.correctTeacher})` : ""
      }`,
    );
  }
  console.log(
    `[seed-corrections-wave-4] orphan_added=${added} of ${ORPHAN_FIXES.length}, disputed=${disputed}, replacements_added=${disputedAdded}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
