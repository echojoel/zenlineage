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
      "Editorial bridge: Dōshō Saikawa was ordained by Shunmyō Satō Rōshi in 1978 and trained at Daihonzan Sōji-ji 1978–79 and Sōji-ji Soin 1979–81 (per meditation-zen.org/en/master-saikawa-roshi). His immediate shihō teacher in the Sōji-ji line is not yet seeded; the edge to Kōhō Keidō Chisan (70th abbot of Sōji-ji) anchors him in the Sōji-ji-line succession rather than the 13th-century Dōgen root.",
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
