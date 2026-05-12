/**
 * Seed Deshimaru-line shihō / root-teacher corrections.
 *
 * Runs LAST in the prebuild chain, after seed-db.ts, seed-deshimaru-lineage.ts,
 * and the other lineage seeders have established the basic transmission graph.
 *
 * Background — Taisen Deshimaru (1914–1982) did not himself confer dharma
 * transmission (shihō) on any of his Western disciples. He was their
 * root master — they trained under him for years, often a decade or more,
 * until his death in 1982. After he died, several of them travelled to
 * Japan and received the formal Sōtōshū shihō from a master they had
 * not themselves trained under:
 *
 *   • Niwa Rempō Zenji (77th abbot of Eihei-ji, 1985–1993)
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
 * The model we settled on after walking through these cases with the
 * user — and explicitly preferring the practitioner / lived-lineage
 * view over the Sōtōshū institutional view:
 *
 *   R1. `primary` (isPrimary = true) means *root teacher*: the master
 *       you actually trained under, often for many years, the master
 *       you call your master. For most students this is also the
 *       shihō giver. For Deshimaru's disciples, this is Deshimaru.
 *
 *   R2. `secondary` (isPrimary = false) covers EVERY non-root teacher
 *       relationship, including formal Dharma transmission (shihō)
 *       received from someone other than the root master, and ordinary
 *       brief / additional teachers. Notes on the edge must say which
 *       kind. The master-detail page UI surfaces the distinction by
 *       parsing the notes — sh̄ho-typed secondary edges get their own
 *       prominent "Formal Dharma transmission (shihō):" section.
 *
 *   R3. `dharma` is the editorial-bridge fallback only (when the
 *       literal teacher isn't seeded yet). `disputed` is contested.
 *
 * What this script does:
 *
 *   1. Ensure Deshimaru → X is `primary` / isPrimary=true for every
 *      one of his disciples, with notes preserving the root-teacher
 *      narrative. This reverses an earlier pass that had downgraded
 *      these to `secondary`.
 *
 *   2. Ensure each post-death shihō edge (Niwa/Okamoto/Kishigami/
 *      Saikawa/Thibaut/Triet/Bec → X) is `secondary` / isPrimary=false,
 *      with notes that begin with the marker "Formal Dharma
 *      transmission (shihō)" so the UI can detect them.
 *
 *   3. Add citation rows on each shihō edge documenting its source.
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
  /** Slug of the master who actually gave shihō to this student. */
  shihoTeacher: string;
  /** Year of the shihō ceremony (if known). */
  shihoYear?: number;
  /** Source IDs that document this transmission. */
  sourceIds: string[];
  /**
   * Notes carried on the shihō edge. MUST begin with the marker
   * "Formal Dharma transmission (shihō)" so the master-detail page
   * UI can detect it and surface it under its own labelled section.
   */
  shihoNotes: string;
  /**
   * Notes for the Deshimaru → student PRIMARY edge — the root-teacher
   * relationship the disciple actually trained in.
   */
  rootTeacherNotes: string;
}

const CORRECTIONS: ShihoCorrection[] = [
  // ── Senior trio: 1984 shihō from Niwa Zenji at Eihei-ji ─────────────
  {
    student: "etienne-mokusho-zeisler",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia", "src_zen_deshimaru_history"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Eihei-ji. Conferred by Niwa Rempō Zenji, 77th abbot of Eihei-ji, together with Roland Yuno Rech and Stéphane Kōsen Thibaut. Source: en.wikipedia.org — Taisen Deshimaru § Students: \"After Master Deshimaru's death, three of his closest disciples — Etienne Zeisler, Roland Rech, and Kosen Thibaut — traveled to Japan to receive shiho from Master Rempo Niwa Zenji.\"",
    rootTeacherNotes:
      "Root teacher / master. Zeisler met Deshimaru in the years after Deshimaru's 1967 arrival in Paris, was ordained by him as a monk, and was one of his three principal direct disciples until Deshimaru's death in 1982.",
  },
  {
    student: "roland-rech",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Eihei-ji. Conferred by Niwa Rempō Zenji together with Étienne Zeisler and Kōsen Thibaut. Rech took the dharma name Yuno (有能) at that ceremony. Source: fr.wikipedia.org — Roland Yuno Rech.",
    rootTeacherNotes:
      "Root teacher / master. Rech was a disciple of Deshimaru from 1972 until Deshimaru's death in 1982, ordained as a monk in 1974. He kept his industrial-management career on Deshimaru's recommendation to serve as one of the master's principal translators, dōjō coordinators, and sesshin leaders.",
  },
  {
    student: "stephane-kosen-thibaut",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_wikipedia", "src_zen_deshimaru_history"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Eihei-ji. Conferred by Niwa Rempō Zenji together with Étienne Zeisler and Roland Yuno Rech. Source: en.wikipedia.org — Taisen Deshimaru § Students.",
    rootTeacherNotes:
      "Root teacher / master. Thibaut was a close direct disciple of Deshimaru who later founded the Kōsen Sangha, the network of dōjōs around the Yu Jō Nyūsanji temple and the Kanshōji branch of the AZI federation.",
  },
  // ── Okamoto Roshi shihō recipients ──────────────────────────────────
  {
    student: "raphael-doko-triet",
    shihoTeacher: "yuko-okamoto",
    shihoYear: 1997,
    sourceIds: ["src_azi", "src_seikyuji"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1997. Conferred by Yūkō Okamoto Roshi, \"a friend of Master Deshimaru\". Source: zen-azi.org — Raphaël Dōkō Triet biography.",
    rootTeacherNotes:
      "Root teacher / master. Triet began practising zazen with Deshimaru in 1971 at the Paris dōjō and was ordained as a monk by him in 1973; he was one of Deshimaru's close direct disciples in the founding Paris sangha until Deshimaru's 1982 death.",
  },
  {
    student: "michel-reiku-bovay",
    shihoTeacher: "yuko-okamoto",
    shihoYear: 1998,
    sourceIds: ["src_dojo_lausanne"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1998 at Teishōji in Japan. Conferred by Yūkō Okamoto Roshi. Source: Muijoji / zen.ch biography of Meihō Missen Michel Bovay.",
    rootTeacherNotes:
      "Root teacher / master. Bovay began zazen with Deshimaru in Paris in 1972 and was ordained as a monk by him. He was one of the closest Swiss-French direct disciples and held the AZI presidency 1995–2003.",
  },
  // ── Kishigami / Saikawa shihō recipients (independent Sawaki line) ──
  {
    student: "philippe-reiryu-coupey",
    shihoTeacher: "kishigami-kojun",
    shihoYear: 2008,
    sourceIds: ["src_sangha_sans_demeure", "src_zen_road"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 31 August 2008 at the Dōjō Zen de Paris. Conferred by Kōjun Kishigami — a direct Sawaki disciple who himself received shihō from Sawaki one month before Sawaki's 1965 death. Completes a Sawaki → Kishigami → Coupey transmission line parallel to the Sawaki → Deshimaru → Coupey root-teacher line.",
    rootTeacherNotes:
      "Root teacher / master. Deshimaru ordained Coupey as a monk in 1972 and Coupey served as Deshimaru's principal English-language transcriber from that year until Deshimaru's death in April 1982 — a continuous decade-long direct discipleship.",
  },
  {
    student: "olivier-reigen-wang-genh",
    shihoTeacher: "dosho-saikawa",
    shihoYear: 2001,
    sourceIds: ["src_azi", "src_ryumonji_alsace"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 2001. Conferred by Dōshō Saikawa Roshi, abbot of Hossen-ji and Kasuisai. Source: zen-azi.org — Olivier Reigen Wang-Genh biography: \"In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
    rootTeacherNotes:
      "Root teacher / master. Deshimaru ordained Wang-Genh as a monk in 1977 and he was one of his close European direct disciples until Deshimaru's 1982 death; from 1973 onward he had been developing the Strasbourg dōjō under Deshimaru's authority.",
  },
  // ── Second-generation Deshimaru-line shihō recipients ──────────────
  {
    student: "hugues-yusen-naas",
    shihoTeacher: "raphael-doko-triet",
    shihoYear: 2009,
    sourceIds: ["src_azi"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 2009. Conferred by Raphaël Dōkō Triet, Deshimaru's own ordained disciple. Source: zen-azi.org — Hugues Yūsen Naas biography: \"In 2009, he received the transmission of the Dharma from Master Dôkô Raphaël Triet.\"",
    rootTeacherNotes:
      "Root teacher / master. Naas was ordained as a monk by Deshimaru in 1977 and trained under him until Deshimaru's 1982 death; he later served as abbot of La Gendronnière 2019–2021 and founded the Centre Zen du Perche Daishugyōji.",
  },
  {
    student: "barbara-kosen-richaudeau",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Formal Dharma transmission (shihō) from Stéphane Kōsen Thibaut, second-generation Deshimaru-line. Part of the Kōsen Sangha shihō cohort.",
    rootTeacherNotes:
      "Root teacher / master. Barbara Kōsen Richaudeau was ordained as a Zen nun by Deshimaru in 1975 and followed him as a close direct disciple until his death in 1982.",
  },
  {
    student: "andre-ryujo-meissner",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Formal Dharma transmission (shihō) from Stéphane Kōsen Thibaut, second-generation Deshimaru-line. Framed in the Kōsen Sangha roster as \"in the name of Master Deshimaru\".",
    rootTeacherNotes:
      "Root teacher / master. André Ryūjō Meissner was a close direct disciple of Deshimaru, ordained by him in the 1970s.",
  },
  {
    student: "francoise-jomon-julien",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Formal Dharma transmission (shihō) from Stéphane Kōsen Thibaut.",
    rootTeacherNotes:
      "Root teacher / master. Françoise Jōmon Julien began zazen with Deshimaru in 1979 and received bodhisattva ordination from him.",
  },
  {
    student: "ingrid-gyuji-igelnick",
    shihoTeacher: "stephane-kosen-thibaut",
    sourceIds: ["src_kosen_sangha"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984. Conferred by Stéphane Kōsen Thibaut.",
    rootTeacherNotes:
      "Root teacher / master. Igelnick first encountered Deshimaru in 1978; she was ordained by Thibaut in 1984 but her formative discipleship was with Deshimaru.",
  },
  // ── Vuillemin: Zeisler-line root teacher + Bec 2007 shihō ───────────
  {
    student: "vincent-keisen-vuillemin",
    shihoTeacher: "yvon-myoken-bec",
    shihoYear: 2007,
    sourceIds: ["src_mokusho_house"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 25 March 2007 — Bec's first shihō granted. Completes the Deshimaru → Zeisler → Bec → Vuillemin transmission line. Source: Mokushō Zen House — Our Story: \"2007 Master Myoken grants Dharma transmission to Vincent Keisen Vuillemin.\"",
    rootTeacherNotes:
      "Root teacher / master. Vuillemin was ordained by Deshimaru in the late 1970s and trained under him until Deshimaru's 1982 death, after which he became a close disciple of Étienne Mokushō Zeisler until Zeisler's own early death in 1990. The Bec shihō in 2007 formalised the lineage.",
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

/** Ensure Deshimaru → student is type='primary', isPrimary=true, with
 *  root-teacher notes. Overrides any prior `secondary` typing. */
async function ensureRootTeacherEdge(
  studentId: string,
  studentSlug: string,
  notes: string,
): Promise<void> {
  const deshimaru = await deshimaruId();
  const existing = await db
    .select({ id: masterTransmissions.id, type: masterTransmissions.type })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, deshimaru),
      ),
    );
  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({
      id: nanoid(),
      studentId,
      teacherId: deshimaru,
      type: "primary",
      isPrimary: true,
      notes,
    });
    console.log(`  + Deshimaru → ${studentSlug}: inserted as primary (root teacher)`);
  } else {
    await db
      .update(masterTransmissions)
      .set({ type: "primary", isPrimary: true, notes })
      .where(eq(masterTransmissions.id, existing[0].id));
    const verb = existing[0].type === "primary" ? "kept" : "restored";
    console.log(`  ~ Deshimaru → ${studentSlug}: ${verb} as primary (root teacher)`);
  }
}

/** Ensure the shihō-giver → student edge is type='secondary',
 *  isPrimary=false, with notes flagged as "Formal Dharma transmission
 *  (shihō)" so the master-detail page UI can surface it under its own
 *  prominent labelled section. */
async function ensureShihoEdge(c: ShihoCorrection): Promise<void> {
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
    type: "secondary",
    isPrimary: false,
    notes: c.shihoNotes,
  };

  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    console.log(`  + ${c.shihoTeacher} → ${c.student}: inserted as secondary (shihō)`);
  } else {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, edgeId));
    const verb = existing[0].type === "secondary" ? "kept" : `re-typed ${existing[0].type} →`;
    console.log(`  ~ ${c.shihoTeacher} → ${c.student}: ${verb} secondary (shihō)`);
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

  // And ensure Deshimaru → student is the primary root-teacher edge.
  await ensureRootTeacherEdge(studentId, c.student, c.rootTeacherNotes);
}

/**
 * Direct Deshimaru disciples who have NO documented sh̄ho from anyone
 * (Deshimaru never transmitted; no post-death sh̄ho from another
 * Japanese master is recorded for them either). Their Deshimaru edge
 * should remain `primary` (he was their root teacher) — we explicitly
 * ensure that here in case an earlier seeding pass left it `secondary`.
 */
const ORDINATION_ONLY_DIRECT_DISCIPLES: { student: string; rootTeacherNotes: string }[] = [
  {
    student: "evelyne-eko-de-smedt",
    rootTeacherNotes:
      "Root teacher / master. De Smedt was ordained by Deshimaru in the 1970s and co-authored L'Anneau de la Voie with him; she has prefaced several of Deshimaru's posthumous volumes. No formal Dharma transmission (shihō) is documented in her record — she has remained the editorial voice of the line rather than a transmission successor.",
  },
  {
    student: "pierre-reigen-crepon",
    rootTeacherNotes:
      "Root teacher / master. Crépon was ordained by Deshimaru and became the principal French-language biographer of the master. No formal Dharma transmission (shihō) is documented in his record; he carries the line as a senior AZI teacher.",
  },
  {
    student: "jean-pierre-genshu-faure",
    rootTeacherNotes:
      "Root teacher / master. Faure was ordained by Deshimaru and founded the Temple Zen Kanshōji (Dordogne) in 1999. No formal Dharma transmission (shihō) from a separate teacher is documented in the AZI / Sōtōshū public record.",
  },
  {
    student: "robert-livingston",
    rootTeacherNotes:
      "Root teacher / master. Robert Livingston was a close direct disciple of Deshimaru in Paris in the 1970s and was designated by Deshimaru before 1982 to bring Sōtō practice to the United States, where he founded the New Orleans Zen Temple in 1991. He gave Dharma transmission to Tony Bland (2004) and Richard Reishin Collins (2016). No formal sh̄ho from a separate teacher is documented in his record.",
  },
];

async function main() {
  console.log("Applying Deshimaru-line shihō / root-teacher corrections…\n");

  console.log("→ Shihō edges (secondary, flagged 'Formal Dharma transmission'):");
  for (const c of CORRECTIONS) {
    await ensureShihoEdge(c);
  }

  console.log("\n→ Ordination-only direct disciples (ensure Deshimaru edge is primary):");
  for (const o of ORDINATION_ONLY_DIRECT_DISCIPLES) {
    const studentId = await resolveMasterId(o.student);
    if (!studentId) {
      console.warn(`  ⚠ ${o.student} not in DB — skipping`);
      continue;
    }
    await ensureRootTeacherEdge(studentId, o.student, o.rootTeacherNotes);
  }

  console.log("\n=== Deshimaru-line shihō / root-teacher corrections complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
