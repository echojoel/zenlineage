/**
 * Wave-6 final orphan-bridging corrections.
 *
 * Connects the remaining 3 Sōtō chant chains (Gentō Sokuchū, Reitan
 * Roryu, Shogaku Rinzui) back to Keizan Jōkin via newly-identified
 * upstream edges. The result: the public lineage graph now spans all
 * the way from Shakyamuni Buddha to modern Sōtō teachers in 3
 * previously-disconnected branches.
 *
 * Runs after seed-corrections-wave-5.ts in the prebuild chain.
 *
 * Idempotent.
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

const FIXES: OrphanFix[] = [
  // Connect Gentō Sokuchū's chain back to Keizan via Gangoku Gankei
  // (who is already in the DB and reachable). This single edge frees
  // up: Gentō Sokuchū, Kyozan Baizen, Sozan Chimon, Yōzan Genki
  // Hayashi, Daichō Hayashi, and (via the existing Hayashi → Katagiri
  // edge already at tier A) Dainin Katagiri's full upstream pedigree.
  {
    student: "gento-sokuchu",
    teacher: "gangoku-gankei",
    notes:
      "Per the Treeleaf Zendo Sōtō ancestor chant: position 82 Gangoku Gankei → position 83 Gentō Sokuchū. Gentō Sokuchū (1729-1807) was the 50th abbot of Eihei-ji and a major Sōtō reformer. This edge connects the Katagiri/Yōzan-Hayashi sub-line back through the Hōzōji/Tōkei-in chain to Keizan Jōkin.",
  },

  // Connect Reitan Roryu's chain via Niken Sekiryo (position 80 in the
  // White Plum chant) and beyond.
  {
    student: "reitan-roryu",
    teacher: "niken-sekiryo",
    seedTeacher: {
      slug: "niken-sekiryo",
      schoolSlug: "soto",
      enName: "Niken Sekiryō",
    },
    notes:
      "Niken Sekiryō sits at position 80 in the Maezumi/White Plum Sōtō chant lineage, immediately preceding Reitan Roryu (position 81). Per Great Plains Zen Center, Village Zendo, and Sacramento Zen liturgies.",
  },
  // Niken Sekiryō ← Bokushitsu Bokushū (position 79 in the chant).
  {
    student: "niken-sekiryo",
    teacher: "bokushitsu-bokushu",
    seedTeacher: {
      slug: "bokushitsu-bokushu",
      schoolSlug: "soto",
      enName: "Bokushitsu Bokushū",
    },
    notes:
      "Bokushitsu Bokushū sits at position 79 in the White Plum chant lineage, immediately preceding Niken Sekiryō (position 80). Per Sacramento Zen and Great Plains Zen Center liturgies.",
  },
  // Bokushitsu Bokushū ← Tenkei Denson — Tenkei Denson is a known
  // Edo-period figure (1648-1735) who has a Wikipedia article. He's
  // position ~78 in the chant. The chant from here back to Keizan is
  // through known Sōtō patriarchs.
  {
    student: "bokushitsu-bokushu",
    teacher: "tenkei-denson",
    seedTeacher: {
      slug: "tenkei-denson",
      schoolSlug: "soto",
      enName: "Tenkei Denson",
      cjkName: "天桂伝尊",
      cjkLocale: "ja",
      birthYear: 1648,
      deathYear: 1735,
    },
    notes:
      "Tenkei Denson (1648–1735), a major Edo-period Sōtō priest, sits at position 78 in the White Plum chant lineage. His student was Bokushitsu Bokushū (position 79). Per Wikipedia and Sacramento Zen liturgy.",
  },
  // Tenkei Denson ← Gesshū Sōko (already in DB, reachable). Gesshū
  // (1618-1696) was Tenkei's dharma transmission teacher per Sōtōshū
  // tradition — this connects the entire Maezumi/Kuroda chant chain
  // back to Keizan via Gesshū → Tokuō → Mokushi → ... → Keizan.
  {
    student: "tenkei-denson",
    teacher: "gesshu-soko",
    notes:
      "Gesshū Sōko (1618–1696) gave dharma transmission to Tenkei Denson, one of the major Sōtō reformer-priests of the Edo period. This edge connects the Maezumi/Katagiri White Plum chant lineage (which runs Tenkei → Bokushitsu → Niken → Reitan → Kakujo → Kakuan → Ryoka → Guhaku → Kuroda → Maezumi) back through Gesshū to Keizan Jōkin.",
  },

  // Shogaku Rinzui ← Tokuzui Tenrin (15th abbot of Hōzōji).
  {
    student: "shogaku-rinzui",
    teacher: "tokuzui-tenrin",
    seedTeacher: {
      slug: "tokuzui-tenrin",
      schoolSlug: "soto",
      enName: "Tokuzui Tenrin",
      cjkName: "徳瑞天臨",
      cjkLocale: "ja",
    },
    notes:
      "Tokuzui Tenrin was the 15th abbot of Hōzōji 宝蔵寺, predecessor of Shogaku Rinzui (16th abbot). Per Treeleaf 'Our Lineage: A Continuing History' and Treeleaf forum lineage chart.",
  },
  // Tokuzui Tenrin ← Gesshū Sōko (same Gesshū already in DB and
  // reachable). Per the Treeleaf "Our Lineage: A Continuing History"
  // page, the Hōzōji abbot chain converges with the broader Sōtō
  // chant at Gesshū Sōko. Both the Hōzōji/Tōkei-in branch and the
  // Tenkei Denson branch descend from Gesshū through different
  // disciples — Gesshū had multiple dharma heirs.
  {
    student: "tokuzui-tenrin",
    teacher: "gesshu-soko",
    notes:
      "Per the Treeleaf 'Our Lineage' page, the Hōzōji abbot lineage descends from Gesshū Sōko (1618–1696) — the same Edo-period Sōtō master who taught Tenkei Denson in a parallel branch. Tokuzui Tenrin appears in the Treeleaf-charted chain immediately after Gesshū in the Hōzōji sequence (note: this connection is inferred from sequential numbering in the Treeleaf lineage and may benefit from primary-source verification — a future Japanese-language pass could confirm or correct it).",
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
  if (studentRow.length === 0) return "noop";
  const studentId = studentRow[0].id;

  let teacherId: string | null = null;
  if (f.seedTeacher) {
    teacherId = await ensureMaster(f.seedTeacher);
  } else {
    const tRow = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, f.teacher))
      .limit(1);
    if (tRow.length > 0) teacherId = tRow[0].id;
  }
  if (!teacherId) return "noop";

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
  for (const fix of FIXES) {
    const result = await applyFix(fix);
    if (result === "added") added++;
    console.log(`  ${result.padEnd(7)} ${fix.teacher} → ${fix.student}`);
  }
  console.log(`[seed-corrections-wave-6] added=${added} of ${FIXES.length} fixes`);
}

main().catch((err) => { console.error(err); process.exit(1); });
