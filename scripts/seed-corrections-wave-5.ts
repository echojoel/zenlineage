/**
 * Wave-5 mis-attributions surfaced during the tier-upgrade pass.
 *
 * Marks each wrong edge `disputed` and (where the correct teacher is in
 * the DB) adds a new primary edge.
 *
 * Runs after seed-corrections-wave-4.ts in the prebuild chain.
 *
 * Idempotent.
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";

interface DisputedFix {
  student: string;
  wrongTeacher: string;
  correctTeacher?: string;
  newEdgeNotes?: string;
  disputedNotes: string;
}

const FIXES: DisputedFix[] = [
  {
    student: "daguang-juhui",
    wrongTeacher: "touzi-datong",
    correctTeacher: "shishuang-qingzhu",
    newEdgeNotes:
      "Per Polish Wikipedia and Ferguson chart: Daguang Juhui was a heir of Shishuang Qingzhu, not Touzi Datong.",
    disputedNotes:
      "DISPUTED — Wave-5: Daguang Juhui's actual teacher was Shishuang Qingzhu, not Touzi Datong.",
  },
  {
    student: "guannan-daochang",
    wrongTeacher: "shitou-xiqian",
    correctTeacher: "baizhang-huaihai",
    newEdgeNotes:
      "Per Terebess: Guannan Daochang was a heir of Baizhang Huaihai (Mazu's heir), not Shitou Xiqian.",
    disputedNotes:
      "DISPUTED — Wave-5: Guannan Daochang's actual teacher was Baizhang Huaihai (per Terebess dedicated page), not Shitou Xiqian.",
  },
  {
    student: "deshan-yuanmi",
    wrongTeacher: "dongshan-shouchu",
    disputedNotes:
      "DISPUTED — Wave-5: Deshan Yuanmi and Dongshan Shouchu were both dharma heirs of Yunmen Wenyan — dharma siblings, not teacher-student. Per Zen Apocrypha, Terebess, Wikipedia.",
  },
];

async function applyFix(d: DisputedFix): Promise<{ disputed: boolean; added: boolean }> {
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

async function main() {
  let disputedCount = 0;
  let addedCount = 0;
  for (const fix of FIXES) {
    const result = await applyFix(fix);
    if (result.disputed) disputedCount++;
    if (result.added) addedCount++;
    const action = result.disputed && result.added ? "DISPUTED+ADDED"
      : result.disputed ? "DISPUTED"
      : result.added ? "ADDED" : "noop";
    console.log(
      `  ${action.padEnd(15)} ${fix.wrongTeacher} → ${fix.student}${
        fix.correctTeacher ? `   (correct: ${fix.correctTeacher})` : ""
      }`,
    );
  }
  console.log(`[seed-corrections-wave-5] disputed=${disputedCount} added=${addedCount} of ${FIXES.length} fixes`);
}

main().catch((err) => { console.error(err); process.exit(1); });
