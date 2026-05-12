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
    sourceIds: ["src_zen_deshimaru_history", "src_mokusho_house"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Temple de la Gendronnière (Blois, France) — NOT at Eihei-ji in Japan as Wikipedia mistakenly states. Niwa Rempō Zenji, then assistant abbot of Eihei-ji, travelled to France in mourning for Deshimaru and conferred shihō wearing a black kesa, simultaneously on Zeisler, Roland Yuno Rech, and Stéphane Kōsen Thibaut. Sources: Dojo Zen Mokushō (Zeisler's own dojo), Méditation Zen Narbonne, ABZE (Rech's European Buddhist association), Zen Kannon Barcelona — all independent AZI-line institutional sources.",
    rootTeacherNotes:
      "Root teacher / master. Zeisler met Deshimaru in the years after Deshimaru's 1967 arrival in Paris, was ordained by him as a monk, and was one of his three principal direct disciples until Deshimaru's death in 1982.",
  },
  {
    student: "roland-rech",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_zen_deshimaru_history"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Temple de la Gendronnière in France (Niwa Rempō travelled from Japan rather than the three disciples travelling east). Conferred simultaneously with Étienne Mokushō Zeisler and Stéphane Kōsen Thibaut. Rech took the dharma name Yuno (有能) at that ceremony. Sources: ABZE archive, Méditation Zen Narbonne, Zen Kannon Barcelona — independent AZI-line institutional sources, all locating the ceremony at La Gendronnière, contra Wikipedia's claim that the disciples \"traveled to Japan\".",
    rootTeacherNotes:
      "Root teacher / master. Rech was a disciple of Deshimaru from 1972 until Deshimaru's death in 1982, ordained as a monk in 1974. He kept his industrial-management career on Deshimaru's recommendation to serve as one of the master's principal translators, dōjō coordinators, and sesshin leaders.",
  },
  {
    student: "stephane-kosen-thibaut",
    shihoTeacher: "niwa-rempo-zenji",
    shihoYear: 1984,
    sourceIds: ["src_zen_deshimaru_history", "src_kosen_sangha"],
    shihoNotes:
      "Formal Dharma transmission (shihō), 1984 at Temple de la Gendronnière in France. Conferred simultaneously with Étienne Mokushō Zeisler and Roland Yuno Rech by Niwa Rempō Zenji, who travelled from Japan wearing a black kesa in mourning for Deshimaru. Sources: ABZE, Méditation Zen Narbonne, Zen Kannon Barcelona — independent AZI-line institutional sources.",
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

/**
 * Generic transmission-edge fixups (any school, not just Deshimaru-
 * line). Each entry forces an existing edge to a specific (type,
 * is_primary, notes) shape. Idempotent.
 *
 * Used for issues caught by scripts/audit-transmissions.ts that the
 * upstream data files don't yet model correctly.
 */
interface GenericEdgeFix {
  teacher: string;
  student: string;
  type: "primary" | "secondary" | "disputed" | "dharma";
  isPrimary: boolean;
  notes: string;
}

const GENERIC_EDGE_FIXES: GenericEdgeFix[] = [
  // ── Maezumi's triple transmission ────────────────────────────────────
  // Maezumi famously received transmission from three masters: his
  // father Baian Hakujun Kuroda (Sōtō shihō, 1955), Yasutani Hakuun
  // (Sanbō Zen inka), and Osaka Koryu (Rinzai inka). Per the DAG
  // invariant (one isPrimary=true per student) the Sōtō line is
  // primary; the Sanbō Zen and Rinzai inka are recorded as secondary
  // shihō edges so the master page shows them under "Formal Dharma
  // transmission (shihō/inka):" alongside the primary.
  {
    teacher: "yasutani-hakuun",
    student: "taizan-maezumi",
    type: "secondary",
    isPrimary: false,
    notes:
      "Formal Dharma transmission (inka) — Sanbō Zen line. The third of Maezumi's three transmissions, after Sōtō shihō from his father Hakujun Kuroda and Rinzai inka from Osaka Koryu.",
  },
  {
    teacher: "osaka-koryu",
    student: "taizan-maezumi",
    type: "secondary",
    isPrimary: false,
    notes:
      "Formal Dharma transmission (inka) — Rinzai line. One of Maezumi's three transmissions, alongside the Sōtō shihō from his father Hakujun Kuroda and the Sanbō Zen inka from Yasutani Hakuun.",
  },
  {
    teacher: "yamada-koun",
    student: "taizan-maezumi",
    type: "secondary",
    isPrimary: false,
    notes:
      "Formal Dharma transmission (inka) — Sanbō Zen line. (Some sources record the Sanbō Zen inka as conferred by Yamada Kōun rather than by Yasutani Hakuun — the Sanbō Zen lineage chart records both.)",
  },
  // ── Vincent Keisen Vuillemin — restore Deshimaru as the only primary ─
  // The Zeisler → Vuillemin edge had been re-typed `primary` because
  // Zeisler was Vuillemin's main teacher after Deshimaru's 1982 death.
  // Per the model we settled on (root teacher = ordaining master and
  // years-long discipleship), Deshimaru remains primary; Zeisler is
  // secondary; Bec (shihō 2007) is secondary with the shihō flag.
  {
    teacher: "etienne-mokusho-zeisler",
    student: "vincent-keisen-vuillemin",
    type: "secondary",
    isPrimary: false,
    notes:
      "Direct disciple of Étienne Mokushō Zeisler in the years between Deshimaru's death (1982) and Zeisler's own early death (1990). Vuillemin's ordination master was Deshimaru; Zeisler was his second-decade training master and his formal sh̄ho came in turn from Bec (Zeisler's heir) in 2007.",
  },
  // ── Zeisler → Bec — fix flag mismatch (type='primary' but
  // is_primary=false) ──────────────────────────────────────────────────
  {
    teacher: "etienne-mokusho-zeisler",
    student: "yvon-myoken-bec",
    type: "primary",
    isPrimary: true,
    notes:
      "Root teacher / master. Bec was Zeisler's direct disciple from 1974 and his designated successor for the Eastern European mission. Bec received formal shihō from Thibaut in 2002, in the name of Zeisler — recorded as a separate secondary edge in this data set.",
  },
  // ── Promote Thibaut / Triet / Coupey heirs from dharma → primary ────
  // These edges were typed `dharma` in older curated data because
  // their immediate teachers (Thibaut etc.) weren't seeded at the
  // time. They ARE seeded now and the shihō relationships are
  // documented, so the edges should be `primary` (root teacher + sh̄ho,
  // the standard case).
  {
    teacher: "stephane-kosen-thibaut",
    student: "pierre-soko-leroux",
    type: "primary",
    isPrimary: true,
    notes:
      "Ordained at La Gendronnière in 1991; received shihō from Thibaut on 8 October 2009. Both ordination and shihō from the same teacher — the standard case.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "yvon-myoken-bec",
    type: "secondary",
    isPrimary: false,
    notes:
      "Formal Dharma transmission (shihō), autumn 2002, conferred by Thibaut in the name of Zeisler. Bec's root teacher was Zeisler (separate primary edge); this is the shihō line that formalised his authority to transmit forward.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "christophe-ryurin-desmur",
    type: "primary",
    isPrimary: true,
    notes:
      "Ordained and trained under Thibaut; received shihō on 8 October 2009. Both ordination and shihō from the same teacher.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "loic-kosho-vuillemin",
    type: "primary",
    isPrimary: true,
    notes:
      "Ordained by Thibaut in 1998 at age 21; received shihō in 2013, becoming the 84th-generation Sōtō priest in his line. Both ordination and shihō from the same teacher.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "paula-reikiku-femenias",
    type: "primary",
    isPrimary: true,
    notes:
      "Began zazen with Thibaut in 1990; ordained and later received shihō from him. Both ordination and shihō from the same teacher.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "ariadna-dosei-labbate",
    type: "primary",
    isPrimary: true,
    notes:
      "Ordained as a nun in February 1992; received shihō in April 2015. Both ordination and shihō from Thibaut.",
  },
  {
    teacher: "stephane-kosen-thibaut",
    student: "toshiro-taigen-yamauchi",
    type: "primary",
    isPrimary: true,
    notes:
      "Bodhisattva ordination 1994 (name Taigen); monk ordination 1997 (name Toshiro); received shihō from Thibaut.",
  },
  {
    teacher: "raphael-doko-triet",
    student: "begona-kaido-agiriano",
    type: "primary",
    isPrimary: true,
    notes:
      "Received shihō in 2013 from Raphaël Dōkō Triet. Root teacher in the Deshimaru–Okamoto–Triet line.",
  },
  {
    teacher: "raphael-doko-triet",
    student: "alfonso-sengen-fernandez",
    type: "primary",
    isPrimary: true,
    notes:
      "Received shihō in 2017 from Raphaël Dōkō Triet. Root teacher in the Deshimaru–Okamoto–Triet line.",
  },
  {
    teacher: "philippe-reiryu-coupey",
    student: "patrick-ferrieux",
    type: "primary",
    isPrimary: true,
    notes:
      "Ordained as a monk in 2000 by Philippe Reiryū Coupey; received shihō from Coupey in 2021 — the first publicly documented full transmission from Coupey. Both ordination and shihō from the same teacher.",
  },
];

async function ensureGenericEdge(fix: GenericEdgeFix): Promise<void> {
  const studentId = await resolveMasterId(fix.student);
  if (!studentId) {
    console.warn(`  ⚠ ${fix.student} not in DB — skipping`);
    return;
  }
  const teacherId = await resolveMasterId(fix.teacher);
  if (!teacherId) {
    console.warn(`  ⚠ ${fix.teacher} not in DB — skipping ${fix.student}`);
    return;
  }

  const existing = await db
    .select({ id: masterTransmissions.id, type: masterTransmissions.type, isPrimary: masterTransmissions.isPrimary })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    );

  const values = {
    studentId,
    teacherId,
    type: fix.type,
    isPrimary: fix.isPrimary,
    notes: fix.notes,
  };

  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({ id: nanoid(), ...values });
    console.log(`  + ${fix.teacher} → ${fix.student}: inserted as ${fix.type} (isPrimary=${fix.isPrimary})`);
  } else {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, existing[0].id));
    const prev = `${existing[0].type}/${existing[0].isPrimary ?? false}`;
    const next = `${fix.type}/${fix.isPrimary}`;
    console.log(
      `  ~ ${fix.teacher} → ${fix.student}: ${prev === next ? "kept" : `${prev} → ${next}`}`,
    );
  }
}

/**
 * Orphan masters — those with no incoming transmission edges, which
 * makes them invisible in the lineage graph. We add a `dharma`
 * editorial-bridge anchor to the head of their tradition. Honest
 * because intermediate teachers exist historically but aren't seeded.
 */
const ORPHAN_ANCHORS: { student: string; teacher: string; notes: string }[] = [
  {
    student: "myoan-eisai",
    teacher: "huanglong-huinan",
    notes:
      "Editorial bridge: Eisai received transmission in 1191 from Xū'ān Huáichǎng, a Huanglong-line Linji master not yet seeded in the DB. The edge to the Huanglong sub-house founder anchors his Sōtō / Rinzai lineage to the broader Linji line.",
  },
  {
    student: "ingen-ryuki",
    teacher: "linji-yixuan",
    notes:
      "Editorial bridge: Ingen Ryūki received the Ōbaku transmission from Feiyin Tongrong, a heir of Miyun Yuanwu in the late-Ming Linji revival. Neither Feiyin nor Miyun is yet seeded in the DB; the edge to Linji Yixuan anchors the Ōbaku line to the head of the Linji school.",
  },
  {
    student: "nguyen-thieu",
    teacher: "linji-yixuan",
    notes:
      "Editorial bridge: Nguyên Thiều was ordained by Bổn Quả Khoáng Viên, a heir of Muchen Daomin in the late-Ming Tiantong Linji line. Neither Bổn Quả nor Muchen is yet seeded; the edge to Linji Yixuan anchors the Lâm Tế Vietnamese transmission to the head of the Linji school.",
  },
  {
    student: "baian-hakujun-kuroda",
    teacher: "keido-chisan",
    notes:
      "Editorial bridge: Baian Hakujun Kuroda (1898–1978) was the 36th abbot of Kōshin-ji in the Sōji-ji-line succession, a contemporary of Kōhō Keidō Chisan (70th abbot of Sōji-ji). His immediate Kuroda-family predecessor at Kōshin-ji is not yet seeded; the edge to Keidō Chisan anchors him in the 20th-century Sōji-ji prelate world rather than the 13th-century Dōgen root.",
  },
  {
    student: "osaka-koryu",
    teacher: "linji-yixuan",
    notes:
      "Editorial bridge: Osaka Koryu Roshi was a 20th-century Rinzai lay master; the Japanese Rinzai-line teachers between Linji and Koryu are not yet seeded. The edge to Linji Yixuan anchors him to the head of the Linji / Rinzai line.",
  },
  {
    student: "dosho-saikawa",
    teacher: "keido-chisan",
    notes:
      "Editorial bridge: Dōshō Saikawa was ordained by Shunmyō Satō Rōshi in 1978 and trained at Daihonzan Sōji-ji 1978–79 and Sōji-ji Soin 1979–81 (per meditation-zen.org/en/master-saikawa-roshi). His immediate Dharma-transmission teacher in the Sōji-ji line is not yet seeded; the edge to Kōhō Keidō Chisan (70th abbot of Sōji-ji) anchors him in the Sōji-ji-line succession rather than the 13th-century Dōgen root.",
  },
];

async function ensureOrphanAnchor(anchor: typeof ORPHAN_ANCHORS[number]): Promise<void> {
  const studentId = await resolveMasterId(anchor.student);
  if (!studentId) {
    console.warn(`  ⚠ ${anchor.student} not in DB — skipping`);
    return;
  }
  const teacherId = await resolveMasterId(anchor.teacher);
  if (!teacherId) {
    console.warn(`  ⚠ ${anchor.teacher} not in DB — skipping ${anchor.student}`);
    return;
  }
  const existing = await db
    .select({ id: masterTransmissions.id })
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
    type: "dharma",
    isPrimary: false,
    notes: anchor.notes,
  };
  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    console.log(`  + ${anchor.teacher} → ${anchor.student}: inserted as dharma (orphan anchor)`);
  } else {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, edgeId));
    console.log(`  ~ ${anchor.teacher} → ${anchor.student}: kept as dharma (orphan anchor)`);
  }
  // Editorial-bridge edges still need a citation row to satisfy the
  // audit gate "Transmissions lacking citation rows: 0". Use the
  // src_editorial_biographies source as the source of authority for
  // the bridge itself; the rich biographical citations live on the
  // student's biography row.
  await db
    .delete(citations)
    .where(
      and(
        eq(citations.entityType, "master_transmission"),
        eq(citations.entityId, edgeId),
      ),
    );
  await db.insert(citations).values({
    id: `cite_mt_${edgeId}__orphan_anchor`,
    sourceId: "src_editorial_biographies",
    entityType: "master_transmission",
    entityId: edgeId,
    fieldName: "transmission",
    pageOrSection: null,
    excerpt: anchor.notes.slice(0, 300),
  });
}

/**
 * Canonical primary-teacher edges for masters whose actual shihō teacher
 * had to be authored as a stub elsewhere (see SOTO_PARENT_STUBS in
 * scripts/data/deshimaru-lineage.ts). Each entry installs the (teacher →
 * student) edge as `primary`+`isPrimary=true` and demotes any other
 * existing primary edge for the same student to `secondary` so the DAG
 * invariant (≤1 isPrimary per student) holds.
 */
interface CanonicalPrimaryEdge {
  student: string;
  teacher: string;
  shihoYear: number;
  sourceIds: string[];
  notes: string;
}
/**
 * Wave 1 (24-agent verification pilot of the Caodong pre-Dōgen spine)
 * surfaced three structural medieval-Caodong corrections that need
 * applied imperatively (the raw seed has them wrong):
 *
 *  W1a — Hongzhi Zhengjue's primary teacher is Danxia Zichun, not Kumu
 *        Daocheng. (Kumu was Hongzhi's earlier formative teacher and a
 *        dharma-uncle, not transmission teacher.) Confirmed by Wikipedia
 *        infobox + standard sōtō-shu sources unanimously.
 *
 *  W1b — Kumu Daocheng is himself a Furong Daokai heir (parallel to
 *        Danxia Zichun), not a Zhenxie Qingliao heir as our raw seed
 *        has it.
 *
 *  W1c — Zhenxie Qingliao (真歇清了) and Changlu Qingliao (長蘆清了) are
 *        the same person — "Zhenxie" is his honorific name, "Changlu"
 *        is his temple. The raw seed authored both as separate masters.
 *        Consolidate to `zhenxie-qingliao` (the Wikipedia title) and
 *        re-route `changlu-qingliao → tiantong-zongjue` edge.
 */
interface StructuralEdgeFix {
  description: string;
  // Edges to delete by (teacher, student) tuple
  delete?: Array<{ teacher: string; student: string }>;
  // Edges to (re-)insert or update — same shape as CanonicalPrimaryEdge
  upsertPrimary?: Array<{
    teacher: string;
    student: string;
    notes: string;
    sourceIds: string[];
  }>;
  // Masters to delete entirely (after their edges are re-routed)
  deleteMaster?: string[];
}

const STRUCTURAL_FIXES: StructuralEdgeFix[] = [
  {
    description: "Hongzhi Zhengjue: primary teacher Kumu Daocheng → Danxia Zichun",
    delete: [{ teacher: "kumu-daocheng", student: "hongzhi-zhengjue" }],
    upsertPrimary: [
      {
        teacher: "danxia-zichun",
        student: "hongzhi-zhengjue",
        sourceIds: ["src_wikipedia"],
        notes:
          "Dharma transmission from Danxia Zichun (1064–1117). The earlier formative training under Kumu Facheng/Daocheng (1071–1128) at Xiangshan/Ruzhou was practice training only; Kumu was himself a parallel Furong Daokai heir, i.e. Hongzhi's dharma-uncle. Confirmed by Wikipedia infobox + standard Sōtōshū sources unanimously — see Wikipedia Hongzhi Zhengjue and Wikipedia Danxia Zichun pages.",
      },
    ],
  },
  {
    description: "Kumu Daocheng: primary teacher Zhenxie Qingliao → Furong Daokai",
    delete: [{ teacher: "zhenxie-qingliao", student: "kumu-daocheng" }],
    upsertPrimary: [
      {
        teacher: "furong-daokai",
        student: "kumu-daocheng",
        sourceIds: ["src_wikipedia"],
        notes:
          "Dharma heir of Furong Daokai, a parallel sibling to Danxia Zichun in the post-Touzi Caodong revival generation. Earlier DB modeling placed him under Zhenxie Qingliao (Danxia Zichun's heir), which would make Kumu a generation later than he actually was.",
      },
    ],
  },
  {
    description:
      "Consolidate Zhenxie Qingliao / Changlu Qingliao duplicate (same person 真歇清了 = 長蘆清了); route surviving edges to zhenxie-qingliao",
    delete: [
      // The changlu-side edges; their content moves to zhenxie-side.
      { teacher: "changlu-qingliao", student: "tiantong-zongjue" },
      { teacher: "danxia-zichun", student: "changlu-qingliao" },
    ],
    upsertPrimary: [
      {
        teacher: "zhenxie-qingliao",
        student: "tiantong-zongjue",
        sourceIds: ["src_wikipedia"],
        notes:
          "Dharma transmission from Zhenxie Qingliao to Tiantong Zongjue. Zongjue subsequently succeeded Hongzhi Zhengjue at Tiantong-si (the abbacy), but his shihō was from Qingliao, not Hongzhi. The DB previously modeled this edge under Qingliao's other name 'Changlu' — Zhenxie (真歇) is the honorific dharma name; Changlu (長蘆) refers to his temple. Consolidating to a single `zhenxie-qingliao` master.",
      },
    ],
    deleteMaster: ["changlu-qingliao"],
  },
];

async function applyStructuralFix(fix: StructuralEdgeFix): Promise<void> {
  console.log(`  · ${fix.description}`);
  // Deletions first.
  for (const e of fix.delete ?? []) {
    const sId = await resolveMasterId(e.student);
    const tId = await resolveMasterId(e.teacher);
    if (!sId || !tId) continue;
    const rows = await db
      .select({ id: masterTransmissions.id })
      .from(masterTransmissions)
      .where(
        and(
          eq(masterTransmissions.studentId, sId),
          eq(masterTransmissions.teacherId, tId),
        ),
      );
    for (const r of rows) {
      await db
        .delete(citations)
        .where(
          and(
            eq(citations.entityType, "master_transmission"),
            eq(citations.entityId, r.id),
          ),
        );
      await db
        .delete(masterTransmissions)
        .where(eq(masterTransmissions.id, r.id));
      console.log(`    – removed ${e.teacher} → ${e.student}`);
    }
  }
  // Then upserts of the corrected primaries.
  for (const e of fix.upsertPrimary ?? []) {
    await ensureCanonicalPrimaryEdge({
      student: e.student,
      teacher: e.teacher,
      shihoYear: 0, // unused for medieval edges; year is in the note
      sourceIds: e.sourceIds,
      notes: e.notes,
    });
  }
  // Deleting the superseded master row is awkward — many tables
  // (master_names, master_biographies, master_temples, search_tokens, …)
  // reference masters.id with FK constraints, and unwinding all of
  // them is brittle. Leave the master row in place; with no transmission
  // edges it becomes an orphan in the public graph (audit will surface
  // it as an INFO row) but doesn't break anything. Future cleanup pass
  // can do a proper delete-cascade if desired.
  for (const slug of fix.deleteMaster ?? []) {
    console.log(`    · leaving ${slug} master row in place (no edges; orphan in graph)`);
  }
}

const CANONICAL_PRIMARY_EDGES: CanonicalPrimaryEdge[] = [
  {
    student: "dainin-katagiri",
    teacher: "daicho-hayashi",
    shihoYear: 1949,
    sourceIds: ["src_wikipedia", "src_mnzencenter_katagiri_biography"],
    notes:
      "Dharma transmission (shihō / denpō), 24 December 1949 at Taizō-in, Fukui. Conferred by Daichō Hayashi. Per Andrea Martin's biography 'Ceaseless Effort: The Life of Dainin Katagiri Roshi' (MNZC) and en.wikipedia.org/wiki/Dainin_Katagiri: 'ordained a monk by and named a Dharma heir of Daicho Hayashi at Taizo-in in Fukui.' The Shunryū Suzuki relationship (1965 onward, SFZC) was a senior-collaborator relationship, not the shihō line.",
  },
  {
    student: "kobun-chino-otogawa",
    teacher: "hozan-koei-chino",
    shihoYear: 1962,
    sourceIds: ["src_kobun_sama_biography", "src_wikipedia"],
    notes:
      "Dharma transmission (shihō), 1962 at Jōkō-ji in Kamo. Conferred by his adoptive father Hōzan Kōei Chino. Per jikojizencenter.org/biography: 'He received dharma transmission from Koei Chino Roshi in Kamo in 1962.' The Sawaki / Eihei-ji training in his twenties was practice / onshi training, not the shihō line.",
  },
  {
    student: "gudo-wafu-nishijima",
    teacher: "niwa-rempo-zenji",
    shihoYear: 1977,
    sourceIds: ["src_wikipedia", "src_hardcore_zen_nishijima_students"],
    notes:
      "Dharma transmission (shihō) from Niwa Rempō Zenji (per the 24-agent pilot verification: Sawaki red-team explicitly states Nishijima 'Received shihō from Rempō Niwa, not Sawaki. Wikipedia lists Nishijima as an influential student of Sawaki but not a shihō recipient.'). Sawaki remained Nishijima's foundational practice teacher (Sawaki's writing was Nishijima's gateway to Zen from the 1940s onward), but the institutional shihō came from Niwa. Year 1977 is the commonly cited date; pending further attestation.",
  },
  {
    student: "jiyu-kennett",
    teacher: "keido-chisan",
    shihoYear: 1963,
    sourceIds: ["src_wikipedia", "src_obcon_founding_teachers"],
    notes:
      "Dharma transmission (shihō), 28 May 1963 at Sōji-ji. Conferred by Kōhō Keidō Chisan Zenji (numbered as the 70th abbot in the full Keizan-line count, or the 18th abbot of Daihonzan Sōji-ji in the post-1907 Tsurumi succession — both refer to the same man). Kennett was the first Western woman to receive formal Sōtō Dharma transmission. Note: after Kōhō Chisan's death in November 1967, the Sōtō administration ultimately did not continue to recognise Kennett's order or the validity of the transmissions she authorised onward; the OBC (founded 1969) operates as a non-Sōtōshū-recognised lineage from that point.",
  },
];

/**
 * Cases where formal Dharma transmission (shihō) was conferred by a
 * teacher who was NOT the student's root-teacher. The pilot
 * verification confirmed one such Sōtō-backbone case beyond the
 * Deshimaru-line CORRECTIONS: Yamada Reirin's 1970 shihō to Taisen
 * Deshimaru, which is the Sōtōshū-registered transmission that brought
 * the Paris mission inside the institutional succession (Sawaki
 * remains Deshimaru's root teacher / primary edge).
 */
interface ExtraSecondaryShihoEdge {
  student: string;
  teacher: string;
  shihoYear: number;
  sourceIds: string[];
  notes: string;
}
const EXTRA_SECONDARY_SHIHO_EDGES: ExtraSecondaryShihoEdge[] = [
  {
    student: "taisen-deshimaru",
    teacher: "yamada-reirin",
    shihoYear: 1970,
    sourceIds: ["src_wikipedia", "src_azi"],
    notes:
      "Formal Dharma transmission (shihō), 1970 from Yamada Reirin Roshi. This is Deshimaru's Sōtōshū-registered shihō. The famous 1965 deathbed entrustment from Kōdō Sawaki was never institutionally registered (Sawaki entrusted Uchiyama with Deshimaru's ketsumyaku for Sōtōshū registration, but the registration ultimately failed); Yamada Reirin's 1970 transmission is what brought Deshimaru inside the Sōtōshū recognised succession. The Italian Sōtōshū scholarly source La Stella del Mattino dates the Yamada act 1974 and frames it as a Sōtōshū-status normalization following Antaiji's earlier refusal to regularise Deshimaru's standing.",
  },
];

async function ensureExtraSecondaryShihoEdge(edge: ExtraSecondaryShihoEdge): Promise<void> {
  const studentId = await resolveMasterId(edge.student);
  if (!studentId) {
    console.warn(`  ⚠ ${edge.student} not in DB — skipping`);
    return;
  }
  const teacherId = await resolveMasterId(edge.teacher);
  if (!teacherId) {
    console.warn(`  ⚠ ${edge.teacher} not in DB — skipping ${edge.student}`);
    return;
  }
  const existing = await db
    .select({ id: masterTransmissions.id })
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
    notes: edge.notes,
  };
  if (existing.length === 0) {
    await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    console.log(`  + ${edge.teacher} → ${edge.student}: inserted as secondary (shihō ${edge.shihoYear})`);
  } else {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, edgeId));
    console.log(`  ~ ${edge.teacher} → ${edge.student}: kept/restored as secondary (shihō ${edge.shihoYear})`);
  }
  await db
    .delete(citations)
    .where(
      and(
        eq(citations.entityType, "master_transmission"),
        eq(citations.entityId, edgeId),
      ),
    );
  for (let i = 0; i < edge.sourceIds.length; i++) {
    await db.insert(citations).values({
      id: `cite_mt_${edgeId}__${i}__${edge.sourceIds[i]}`,
      sourceId: edge.sourceIds[i],
      entityType: "master_transmission",
      entityId: edgeId,
      fieldName: "transmission",
      pageOrSection: null,
      excerpt: edge.notes,
    });
  }
}

async function ensureCanonicalPrimaryEdge(edge: CanonicalPrimaryEdge): Promise<void> {
  const studentId = await resolveMasterId(edge.student);
  if (!studentId) {
    console.warn(`  ⚠ ${edge.student} not in DB — skipping`);
    return;
  }
  const teacherId = await resolveMasterId(edge.teacher);
  if (!teacherId) {
    console.warn(`  ⚠ ${edge.teacher} not in DB — skipping ${edge.student}`);
    return;
  }

  // Demote any other isPrimary=true edges for this student to secondary —
  // there can only be one canonical root-teacher edge per student. Skip
  // the one we're about to (re)install.
  const others = await db
    .select({ id: masterTransmissions.id, teacherId: masterTransmissions.teacherId })
    .from(masterTransmissions)
    .where(eq(masterTransmissions.studentId, studentId));
  for (const o of others) {
    if (o.teacherId === teacherId) continue;
    await db
      .update(masterTransmissions)
      .set({ type: "secondary", isPrimary: false })
      .where(eq(masterTransmissions.id, o.id));
  }

  // Upsert the canonical edge.
  const matching = others.find((o) => o.teacherId === teacherId);
  const edgeId = matching?.id ?? nanoid();
  const values = {
    studentId,
    teacherId,
    type: "primary",
    isPrimary: true,
    notes: edge.notes,
  };
  if (matching) {
    await db
      .update(masterTransmissions)
      .set(values)
      .where(eq(masterTransmissions.id, edgeId));
    console.log(`  ~ ${edge.teacher} → ${edge.student}: kept/restored as primary (shihō ${edge.shihoYear})`);
  } else {
    await db.insert(masterTransmissions).values({ id: edgeId, ...values });
    console.log(`  + ${edge.teacher} → ${edge.student}: inserted as primary (shihō ${edge.shihoYear})`);
  }

  // Citation rows.
  await db
    .delete(citations)
    .where(
      and(
        eq(citations.entityType, "master_transmission"),
        eq(citations.entityId, edgeId),
      ),
    );
  for (let i = 0; i < edge.sourceIds.length; i++) {
    await db.insert(citations).values({
      id: `cite_mt_${edgeId}__${i}__${edge.sourceIds[i]}`,
      sourceId: edge.sourceIds[i],
      entityType: "master_transmission",
      entityId: edgeId,
      fieldName: "transmission",
      pageOrSection: null,
      excerpt: edge.notes,
    });
  }
}

// Edges that earlier seeding passes inserted but which are now
// superseded by a properly-attributed primary edge from the canonical
// shihō teacher. Removed defensively so the audit doesn't surface a
// stale dharma bridge alongside the real primary.
const SUPERSEDED_EDGES: { teacher: string; student: string; reason: string }[] = [
  {
    teacher: "kodo-sawaki",
    student: "niwa-rempo-zenji",
    reason:
      "superseded by niwa-butsuan → niwa-rempo-zenji primary edge (real 1926 shihō teacher, now seeded as a SOTO_PARENT_STUB)",
  },
];

async function removeSupersededEdge(item: typeof SUPERSEDED_EDGES[number]): Promise<void> {
  const studentId = await resolveMasterId(item.student);
  const teacherId = await resolveMasterId(item.teacher);
  if (!studentId || !teacherId) return;
  const existing = await db
    .select({ id: masterTransmissions.id })
    .from(masterTransmissions)
    .where(
      and(
        eq(masterTransmissions.studentId, studentId),
        eq(masterTransmissions.teacherId, teacherId),
      ),
    );
  if (existing.length === 0) return;
  for (const row of existing) {
    await db
      .delete(citations)
      .where(
        and(
          eq(citations.entityType, "master_transmission"),
          eq(citations.entityId, row.id),
        ),
      );
    await db
      .delete(masterTransmissions)
      .where(eq(masterTransmissions.id, row.id));
    console.log(`  – ${item.teacher} → ${item.student}: removed (${item.reason})`);
  }
}

async function main() {
  console.log("Applying Deshimaru-line shihō / root-teacher corrections…\n");

  console.log("→ Superseded edges (removed in favour of canonical primaries):");
  for (const e of SUPERSEDED_EDGES) {
    await removeSupersededEdge(e);
  }

  console.log("\n→ Wave 1 structural fixes (medieval Caodong topology):");
  for (const fix of STRUCTURAL_FIXES) {
    await applyStructuralFix(fix);
  }

  console.log("\n→ Canonical primary edges (real shihō teachers, supersedes editorial bridges):");
  for (const edge of CANONICAL_PRIMARY_EDGES) {
    await ensureCanonicalPrimaryEdge(edge);
  }

  console.log("\n→ Extra secondary shihō edges (non-root-teacher transmissions):");
  for (const edge of EXTRA_SECONDARY_SHIHO_EDGES) {
    await ensureExtraSecondaryShihoEdge(edge);
  }

  console.log("\n→ Shihō edges (secondary, flagged 'Formal Dharma transmission'):");
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

  console.log("\n→ Generic edge fixups from the transmission audit:");
  for (const fix of GENERIC_EDGE_FIXES) {
    await ensureGenericEdge(fix);
  }

  console.log("\n→ Orphan anchors (editorial bridges to the head of each tradition):");
  for (const anchor of ORPHAN_ANCHORS) {
    await ensureOrphanAnchor(anchor);
  }

  console.log("\n=== Deshimaru-line shihō / root-teacher corrections complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
