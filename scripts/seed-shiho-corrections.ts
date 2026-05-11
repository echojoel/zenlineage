/**
 * Seed Deshimaru-line shihō / ordination corrections.
 *
 * Runs LAST in the prebuild chain, after seed-db.ts, seed-deshimaru-lineage.ts,
 * and the other lineage seeders have established the basic transmission graph.
 *
 * Background — Taisen Deshimaru (1914–1982) did not himself confer dharma
 * transmission (shihō) on any of his Western disciples. He was their
 * ordination master and root teacher, but the formal Sōtō shihō that
 * authenticates each of them was conferred by a small set of Japanese
 * Sōtōshū prelates after Deshimaru's death:
 *
 *   • Niwa Rempō Zenji, 77th abbot of Eihei-ji 1985–1993
 *       → Étienne Mokushō Zeisler, Roland Yuno Rech, and Stéphane Kōsen
 *         Thibaut (1984, at Eihei-ji)
 *   • Yūkō Okamoto Roshi (Teishōji)
 *       → Raphaël Dōkō Triet (1997)
 *       → Michel Meihō Reikū Bovay (1998 at Teishōji)
 *   • Kishigami Kōjun (direct Sawaki disciple)
 *       → Philippe Reiryū Coupey (31 August 2008, Dōjō Zen de Paris)
 *   • Dōshō Saikawa (Hossen-ji / Kasuisai abbot)
 *       → Olivier Reigen Wang-Genh (2001)
 *
 * The pre-existing seeders (seed-db.ts via the raw curated JSON;
 * seed-deshimaru-lineage.ts) recorded ALL of these students as having
 * a `primary` Dharma transmission edge from Deshimaru himself. That is
 * historically wrong. This script applies the corrections:
 *
 *   R1. `primary` in `master_transmissions` means *documented Dharma
 *       transmission (shihō)*. Nothing else.
 *   R2. Deshimaru → X edges are re-typed to `secondary` with isPrimary
 *       cleared; notes preserve the ordination-master context.
 *   R3. The real shihō edges (Niwa/Okamoto/Kishigami/Saikawa → X) are
 *       created as `primary` with isPrimary=true, replacing any prior
 *       `dharma`-typed editorial-bridge edge to the same teacher.
 *
 * Idempotent. Safe to re-run.
 *
 * Usage:  DATABASE_URL=file:zen.db npx tsx scripts/seed-shiho-corrections.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { citations, masters, masterTransmissions } from "@/db/schema";

interface ShihoCorrection {
  /** Student whose lineage we're correcting. */
  student: string;
  /** The slug of the master who actually gave shihō to this student. */
  shihoTeacher: string;
  /** Year of the shihō ceremony (if known). */
  shihoYear?: number;
  /** Source IDs that document this transmission. */
  sourceIds: string[];
  /** Explanatory notes carried on the shihō edge. */
  shihoNotes: string;
  /**
   * Notes to write on the Deshimaru → student edge after re-typing it
   * to `secondary`. Captures the ordination / discipleship role.
   */
  ordinationNotes: string;
}

const CORRECTIONS: ShihoCorrection[] = [
  // ── Senior trio: 1984 shihō from Niwa Zenji at Eihei-ji ─────────────
  {
    student: "etienne-mokusho-zeisler",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia", "src_zen_deshimaru_history"],
    shihoNotes:
      "Dharma transmission (shihō) received in 1984 from Niwa Rempō Zenji, 77th abbot of Eihei-ji, together with Roland Yuno Rech and Stéphane Kōsen Thibaut. Source: en.wikipedia.org — Taisen Deshimaru § Students: \"After Master Deshimaru's death, three of his closest disciples — Etienne Zeisler, Roland Rech, and Kosen Thibaut — traveled to Japan to receive shiho from Master Rempo Niwa Zenji.\"",
    ordinationNotes:
      "Ordination master / direct disciple. Zeisler was ordained as a monk by Deshimaru and trained under him until Deshimaru's death in 1982. Formal Dharma transmission (shihō) came not from Deshimaru himself but from Niwa Rempō Zenji of Eihei-ji in 1984.",
  },
  {
    student: "roland-rech",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia"],
    shihoNotes:
      "Dharma transmission (shihō) received in 1984 from Niwa Rempō Zenji, 77th abbot of Eihei-ji, together with Étienne Zeisler and Kōsen Thibaut. Took the dharma name Yuno (有能) at that ceremony. Source: fr.wikipedia.org — Roland Yuno Rech.",
    ordinationNotes:
      "Ordination master / direct disciple. Rech was a disciple of Deshimaru from 1972 until Deshimaru's death in 1982, ordained as a monk in 1974. His shihō came not from Deshimaru himself but from Niwa Rempō Zenji of Eihei-ji in 1984.",
  },
  {
    student: "stephane-kosen-thibaut",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia", "src_zen_deshimaru_history"],
    shihoNotes:
      "Dharma transmission (shihō) received in 1984 from Niwa Rempō Zenji, 77th abbot of Eihei-ji, together with Étienne Zeisler and Roland Yuno Rech. Source: en.wikipedia.org — Taisen Deshimaru § Students.",
    ordinationNotes:
      "Ordination master / direct disciple. Thibaut was a close disciple of Deshimaru who later founded the Kōsen Sangha. His formal Dharma transmission came not from Deshimaru himself but from Niwa Rempō Zenji of Eihei-ji in 1984.",
  },
  // ── Okamoto Roshi shihō recipients ──────────────────────────────────
  {
    student: "raphael-doko-triet",
    shihoTeacher: "yuko-okamoto",
    shihoYear: 1997,
    sourceIds: ["src_azi", "src_seikyuji"],
    shihoNotes:
      "Dharma transmission (shihō) received in 1997 from Yūkō Okamoto Roshi, \"a friend of Master Deshimaru\". Source: zen-azi.org — Raphaël Dōkō Triet biography.",
    ordinationNotes:
      "Ordination master / direct disciple. Deshimaru ordained Triet as a monk in 1973 and he was one of his close disciples in the founding Paris sangha. Shihō came not from Deshimaru himself but from Yūkō Okamoto in 1997.",
  },
  {
    student: "michel-reiku-bovay",
    shihoTeacher: "yuko-okamoto",
    shihoYear: 1998,
    sourceIds: ["src_dojo_lausanne"],
    shihoNotes:
      "Dharma transmission (shihō) received in 1998 from Yūkō Okamoto Roshi at Teishōji in Japan. Source: Muijoji / zen.ch biography of Meihō Missen Michel Bovay.",
    ordinationNotes:
      "Ordination master / direct disciple. Bovay began zazen with Deshimaru in Paris in 1972 and was ordained as a monk by him. Shihō came not from Deshimaru himself but from Yūkō Okamoto at Teishōji in 1998.",
  },
  // ── Kishigami / Saikawa shihō recipients (independent Sawaki line) ──
  {
    student: "philippe-reiryu-coupey",
    shihoTeacher: "kishigami-kojun",
    shihoYear: 2008,
    sourceIds: ["src_sangha_sans_demeure", "src_zen_road"],
    shihoNotes:
      "Dharma transmission (shihō) received on 31 August 2008 at the Dōjō Zen de Paris from Kōjun Kishigami — a direct Sawaki disciple who himself received shihō from Sawaki one month before Sawaki's 1965 death. Completes a Sawaki → Kishigami → Coupey line that runs parallel to the older Sawaki → Deshimaru → Coupey ordination line.",
    ordinationNotes:
      "Ordination master / direct disciple. Deshimaru ordained Coupey as a monk in 1972 and he served as Deshimaru's principal English-language transcriber until Deshimaru's death in 1982. Shihō came not from Deshimaru himself but from Kishigami Kōjun in 2008.",
  },
  {
    student: "olivier-reigen-wang-genh",
    shihoTeacher: "dosho-saikawa",
    shihoYear: 2001,
    sourceIds: ["src_azi", "src_ryumonji_alsace"],
    shihoNotes:
      "Dharma transmission (shihō) received in 2001 from Dōshō Saikawa Roshi, abbot of Hossen-ji and Kasuisai. Source: zen-azi.org — Olivier Reigen Wang-Genh biography: \"In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
    ordinationNotes:
      "Ordination master / direct disciple. Deshimaru ordained Wang-Genh as a monk in 1977 and he was one of his close European disciples until Deshimaru's death in 1982. Shihō came not from Deshimaru himself but from Dōshō Saikawa in 2001.",
  },
  // ── Second-generation shihō recipients within the Deshimaru line ───
  // These edges currently exist in the DB as type='dharma' (editorial
  // bridge); promote to primary because the shihō is documented.
  {
    student: "hugues-yusen-naas",
    shihoTeacher: "raphael-doko-triet",
    shihoYear: 2009,
    sourceIds: ["src_azi"],
    shihoNotes:
      "Dharma transmission (shihō) received in 2009 from Raphaël Dōkō Triet. Source: zen-azi.org — Hugues Yūsen Naas biography: \"In 2009, he received the transmission of the Dharma from Master Dôkô Raphaël Triet.\"",
    ordinationNotes:
      "Ordination master. Naas was ordained as a monk by Deshimaru in 1977; his Dharma transmission came from Triet (Deshimaru's own disciple) in 2009 — a second-generation Deshimaru-line shihō.",
  },
  {
    student: "barbara-kosen-richaudeau",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Dharma transmission (shihō) received from Stéphane Kōsen Thibaut as part of the Kōsen Sangha second-generation cohort.",
    ordinationNotes:
      "Ordination master. Barbara Kōsen Richaudeau was ordained as a Zen nun by Deshimaru in 1975 and followed him until his death in 1982. Her formal Dharma transmission came from Thibaut, not from Deshimaru himself.",
  },
  {
    student: "andre-ryujo-meissner",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Dharma transmission (shihō) received from Stéphane Kōsen Thibaut as part of the Kōsen Sangha second-generation cohort, framed in the Kōsen Sangha roster as \"in the name of Master Deshimaru\".",
    ordinationNotes:
      "Ordination master / direct disciple. André Ryūjō Meissner was a direct disciple of Deshimaru; his formal Dharma transmission came from Thibaut, not from Deshimaru himself.",
  },
  {
    student: "francoise-jomon-julien",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Dharma transmission (shihō) received from Stéphane Kōsen Thibaut.",
    ordinationNotes:
      "Discipleship. Françoise Jōmon Julien began zazen with Deshimaru in 1979 and received bodhisattva ordination from him. Her formal Dharma transmission came from Thibaut, not from Deshimaru himself.",
  },
  {
    student: "ingrid-gyuji-igelnick",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Dharma transmission (shihō) received from Stéphane Kōsen Thibaut in 1984.",
    ordinationNotes:
      "First encountered Deshimaru in 1978; ordained by Thibaut in 1984. Discipleship under Deshimaru; formal Dharma transmission from Thibaut.",
  },
  // ── Vuillemin: Zeisler-line ordination + Bec 2007 shihō ─────────────
  {
    student: "vincent-keisen-vuillemin",
    shihoTeacher: "yvon-myoken-bec",
    shihoYear: 2007,
    sourceIds: ["src_mokusho_house"],
    shihoNotes:
      "Dharma transmission (shihō) received on 25 March 2007 from Yvon Myōken Bec — Bec's first shihō granted. Completes the Deshimaru → Zeisler → Bec → Vuillemin line. Source: Mokushō Zen House — Our Story: \"2007 Master Myoken grants Dharma transmission to Vincent Keisen Vuillemin.\"",
    ordinationNotes:
      "Ordination master. Vuillemin was ordained by Deshimaru in the late 1970s. His Dharma transmission came from Yvon Myōken Bec in 2007, in the Zeisler line.",
  },
];

/**
 * Students whose Deshimaru edge needs to be retyped from primary →
 * secondary, even if we don't (yet) have a documented shihō from a
 * non-Deshimaru teacher. Their Deshimaru edge stops claiming shihō.
 */
const ORDINATION_ONLY_RETYPES: { student: string; ordinationNotes: string }[] = [
  {
    student: "evelyne-eko-de-smedt",
    ordinationNotes:
      "Ordination master / direct disciple. De Smedt was ordained by Deshimaru in the 1970s and co-authored L'Anneau de la Voie with him; she has prefaced several of Deshimaru's posthumously-published volumes. No formal Dharma transmission (shihō) from Deshimaru himself is documented; she has remained the editorial voice of the line rather than a transmission successor.",
  },
  {
    student: "pierre-reigen-crepon",
    ordinationNotes:
      "Ordination master / direct disciple. Crépon was ordained by Deshimaru and became the principal French-language biographer of the master. No formal Dharma transmission (shihō) from Deshimaru is documented; he carries the line as a senior AZI teacher rather than a transmission successor.",
  },
  {
    student: "jean-pierre-genshu-faure",
    ordinationNotes:
      "Ordination master / direct disciple. Faure was ordained by Deshimaru and founded the Temple Zen Kanshōji (Dordogne) in 1999. No formal Dharma transmission (shihō) from Deshimaru is documented in the AZI / Sōtōshū public record.",
  },
  {
    student: "robert-livingston",
    ordinationNotes:
      "Ordination master / direct disciple. Robert Livingston was a close disciple of Deshimaru in Paris in the 1970s and was designated by Deshimaru before 1982 to bring Sōtō practice to the United States, where he founded the New Orleans Zen Temple. He gave Dharma transmission to Tony Bland (2004) and Richard Reishin Collins (2016). No formal shihō from Deshimaru himself is documented in the published record.",
  },
];

async function resolveMasterId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: masters.id }).from(masters).where(eq(masters.slug, slug));
  return rows[0]?.id ?? null;
}

async function deshimaruId(): Promise<string> {
  const id = await resolveMasterId("taisen-deshimaru");
  if (!id) throw new Error("taisen-deshimaru not in DB — run seed-db.ts first");
  return id;
}

async function retypeDeshimaruEdge(
  studentId: string,
  studentSlug: string,
  notes: string,
): Promise<void> {
  const deshimaru = await deshimaruId();
  const existing = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, deshimaru),
      ),
    );
  if (existing.length === 0) {
    // Some students are recorded as direct Deshimaru disciples in the
    // bio prose but the edge wasn't created — insert it as secondary.
    await db.insert(masterTransmissions).values({
      id: nanoid(),
      studentId,
      teacherId: deshimaru,
      type: "secondary",
      isPrimary: false,
      notes,
    });
    console.log(`  + Deshimaru → ${studentSlug}: inserted as secondary`);
  } else {
    await db
      .update(masterTransmissions)
      .set({ type: "secondary", isPrimary: false, notes })
      .where(eq(masterTransmissions.id, existing[0].id));
    console.log(`  ~ Deshimaru → ${studentSlug}: retyped primary → secondary`);
  }
}

async function upsertShihoEdge(c: ShihoCorrection): Promise<void> {
  const studentId = await resolveMasterId(c.student);
  if (!studentId) {
    console.warn(`  ⚠ ${c.student} not in DB — skipping`);
    return;
  }
  const teacherId = await resolveMasterId(c.shihoTeacher);
  if (!teacherId) {
    console.warn(`  ⚠ ${c.shihoTeacher} not in DB — skipping ${c.student}`);
    return;
  }

  const existing = await db
    .select({ id: masterTransmissions.id, type: masterTransmissions.type })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    );

  const edgeId = existing[0]?.id ?? nanoid();
  const values = {
    studentId,
    teacherId,
    type: "primary",
    isPrimary: true,
    notes: c.shihoNotes,
  };

  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    console.log(`  + ${c.shihoTeacher} → ${c.student}: inserted as primary (shihō)`);
  } else {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, edgeId));
    console.log(
      `  ~ ${c.shihoTeacher} → ${c.student}: promoted ${existing[0].type} → primary (shihō)`,
    );
  }

  // Citation rows for the shihō edge.
  await db
    .delete(citations)
    .where(
      and(
        eq(citations.entityType, "master_transmission"),
        eq(citations.entityId, edgeId),
      ),
    );
  for (let i = 0; i < c.sourceIds.length; i++) {
    await db.insert(citations).values({
      id: `cite_mt_${edgeId}__${i}__${c.sourceIds[i]}`,
      sourceId: c.sourceIds[i],
      entityType: "master_transmission",
      entityId: edgeId,
      fieldName: "transmission",
      pageOrSection: null,
      excerpt: c.shihoNotes,
    });
  }

  // Now retype Deshimaru → student to secondary with the ordination notes.
  await retypeDeshimaruEdge(studentId, c.student, c.ordinationNotes);
}

async function main() {
  console.log("Applying Deshimaru-line shihō / ordination corrections…\n");

  console.log("→ Shihō edges (new or promoted):");
  for (const c of CORRECTIONS) {
    await upsertShihoEdge(c);
  }

  console.log("\n→ Ordination-only retypes (Deshimaru-edge → secondary, no shihō yet documented):");
  for (const o of ORDINATION_ONLY_RETYPES) {
    const studentId = await resolveMasterId(o.student);
    if (!studentId) {
      console.warn(`  ⚠ ${o.student} not in DB — skipping`);
      continue;
    }
    await retypeDeshimaruEdge(studentId, o.student, o.ordinationNotes);
  }

  console.log("\n=== Deshimaru-line shihō / ordination corrections complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
