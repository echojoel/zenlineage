/**
 * Wave-3 corrections from the agent panel.
 *
 * Each entry below was surfaced by independent multi-agent research as a
 * likely mis-attribution in the pre-existing master_transmissions table.
 * Sources cited in scripts/data/transmission-evidence/_suggested-corrections.md.
 *
 * For each correction this seeder:
 *
 *   1. Locates the wrong edge in master_transmissions and updates it to
 *      `type='disputed'`, preserving the historical claim with a note
 *      explaining what the research found.
 *   2. If a new master needs to be added (the actual transmission teacher
 *      isn't in the DB), inserts that master with biographical metadata.
 *   3. Inserts a new `type='primary', isPrimary=1` edge from the correct
 *      teacher with explanatory notes citing the sources.
 *
 * Edges that the panel found to be genuinely non-transmission (lay
 * patronage, peer relationships, chronologically impossible, or
 * unattested figures) are marked `disputed` without a replacement edge.
 *
 * Runs LAST in the prebuild chain, after every other seeder.
 *
 * Idempotent. Safe to re-run.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-corrections-wave-3.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames, masterTransmissions, schools } from "@/db/schema";

interface Correction {
  /** Slug of the student in the existing wrong edge. */
  student: string;
  /** Slug of the (wrong) teacher in the existing edge. */
  wrongTeacher: string;
  /** Slug of the correct teacher, if known. Omit to mark disputed without adding a replacement. */
  correctTeacher?: string;
  /** If the correct teacher isn't yet seeded, supply this so we add them. */
  seedCorrectTeacher?: {
    slug: string;
    schoolSlug: string;
    enName: string;
    aliases?: string[];
    cjkName?: string;
    cjkLocale?: "ja" | "zh" | "ko";
    birthYear?: number;
    deathYear?: number;
    /** Optional upstream edge so the new master is also connected. */
    teacherSlug?: string;
  };
  /** Notes for the new (correct) primary edge. */
  newEdgeNotes?: string;
  /** Notes for the disputed edge — explains what research found. */
  disputedNotes: string;
}

const CORRECTIONS: Correction[] = [
  // ── Wrong teacher, correct teacher already in DB ─────────────────────
  {
    student: "jingzhao-mihu",
    wrongTeacher: "yangshan-huiji",
    correctTeacher: "guishan-lingyou",
    newEdgeNotes:
      "Dharma transmission per Terebess Asia Online and the Guiyang-school lineage charts. Jingzhao Mihu is consistently listed as a dharma heir of Guishan Lingyou, not of his student Yangshan Huiji.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Jingzhao Mihu's actual teacher per Terebess and the Guiyang-school lineage was Guishan Lingyou, not Yangshan Huiji (Yangshan was Mihu's dharma brother). Original Yangshan edge preserved as disputed historical claim.",
  },
  {
    student: "nanta-guangyong",
    wrongTeacher: "shishuang-qingzhu",
    correctTeacher: "yangshan-huiji",
    newEdgeNotes:
      "Nanta Guangyong was a dharma heir of Yangshan Huiji in the Guiyang school. The lineage runs Guishan → Yangshan → Nanta → Bajiao. Per Terebess and Wikipedia.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Nanta Guangyong was a Guiyang-school heir of Yangshan Huiji, not a heir of Shishuang Qingzhu (who was in the parallel Daowu/Yaoshan branch).",
  },
  {
    student: "wufeng-changguan",
    wrongTeacher: "xitang-zhizang",
    correctTeacher: "baizhang-huaihai",
    newEdgeNotes:
      "Wufeng Changguan was a dharma heir of Baizhang Huaihai. A recorded encounter has Baizhang sending Wufeng to visit Xitang. Per Terebess, Encyclopedia of Buddhism.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: every source places Wufeng Changguan as Baizhang Huaihai's heir, not Xitang Zhizang's. The famous koan exchange has Baizhang directing Wufeng to visit Xitang, confirming Baizhang as the transmission teacher.",
  },
  {
    student: "baoen-xuanze",
    wrongTeacher: "yunmen-wenyan",
    correctTeacher: "fayan-wenyi",
    newEdgeNotes:
      "Baoen Xuanze was a dharma heir of Fayan Wenyi, founder of the Fayan school. The famous 'fire boy' enlightenment exchange is with Fayan. Per Terebess, WWZC, Encyclopedia of Buddhism.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Baoen Xuanze was a Fayan-school heir; his enlightenment dialogue ('the fire boy comes seeking fire') is with Fayan Wenyi, not Yunmen Wenyan.",
  },
  {
    student: "qinglin-shiqian",
    wrongTeacher: "zhaozhou-congshen",
    correctTeacher: "dongshan-liangjie",
    newEdgeNotes:
      "Qinglin Shiqian was a dharma heir of Dongshan Liangjie, founder of the Caodong school. Per Terebess, Encyclopedia of Buddhism, Wikipedia.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Qinglin Shiqian was a Caodong heir of Dongshan Liangjie, not a heir of Zhaozhou Congshen (whose lineage died out quickly). Zhaozhou's own Wikipedia article notes he had no surviving direct heir.",
  },
  {
    student: "longji-shaoxiu",
    wrongTeacher: "cuiwei-wuxue",
    correctTeacher: "luohan-guichen",
    newEdgeNotes:
      "Longji Shaoxiu was a dharma heir of Luohan Guichen (Dizang), in the Fayan-school precursor branch. Per Terebess, WWZC.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Longji Shaoxiu's actual transmission was from Luohan Guichen (Dizang). Cuiwei Wuxue's documented heir was Touzi Datong, not Longji.",
  },
  {
    student: "luoshan-daoxian",
    wrongTeacher: "xuefeng-yicun",
    correctTeacher: "yantou-quanhuo",
    newEdgeNotes:
      "Luoshan Daoxian's dharma transmission was from Yantou Quanhuo (Xuefeng's dharma brother under Deshan Xuanjian). Luoshan trained with Xuefeng but received shihō from Yantou. Per Wikipedia, WWZC.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Luoshan Daoxian studied with Xuefeng but received dharma transmission from Xuefeng's dharma brother Yantou Quanhuo. The Xuefeng→Luoshan edge conflates study-visit with transmission.",
  },
  {
    student: "mingzhao-deqian",
    wrongTeacher: "xuefeng-yicun",
    correctTeacher: "luoshan-daoxian",
    newEdgeNotes:
      "Mingzhao Deqian's direct teacher was Luoshan Daoxian (Yantou's heir). Mingzhao is two generations removed from Xuefeng via the Yantou branch. Per Terebess, Wikipedia.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Mingzhao Deqian's teacher was Luoshan Daoxian, not Xuefeng directly. He sits in the Yantou Quanhuo sub-branch of Deshan's lineage.",
  },
  {
    student: "qingxi-hongjin",
    wrongTeacher: "xuefeng-yicun",
    correctTeacher: "luohan-guichen",
    newEdgeNotes:
      "Qingxi Hongjin was a dharma heir of Luohan Guichen (Dizang), dharma brother of Fayan Wenyi. Lineage: Xuefeng → Xuansha → Luohan → Qingxi. Per Terebess, WWZC.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Qingxi Hongjin's direct teacher was Luohan Guichen, not Xuefeng. He is Xuefeng's great-grand-student through Xuansha Shibei → Luohan Guichen.",
  },
  {
    student: "taiyuan-fu",
    wrongTeacher: "shushan-kuangren",
    correctTeacher: "xuefeng-yicun",
    newEdgeNotes:
      "Taiyuan Fu was a dharma heir of Xuefeng Yicun. The famous tenzo-enlightenment story under Xuefeng is well-documented in lamp records.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Taiyuan Fu was a Xuefeng heir, attested in the Jingde Chuandeng lu with the famous tenzo enlightenment. No source links him to Shushan Kuangren.",
  },
  {
    student: "danyuan-yingzhen",
    wrongTeacher: "nanyue-daoxuan",
    correctTeacher: "nanyang-huizhong",
    newEdgeNotes:
      "Danyuan Yingzhen was the attendant and dharma heir of National Teacher Nanyang Huizhong. Per Terebess. The 97 circle-figures passed from the Sixth Patriarch to Nanyang to Danyuan are canonical in Guiyang/Caodong lore.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Danyuan Yingzhen's actual teacher was Nanyang Huizhong. 'Nanyue Daoxuan' does not appear in any Chan reference as Danyuan's teacher; this is likely a name conflation.",
  },

  // ── Mark disputed without replacement (no clear correct teacher) ─────
  {
    student: "baizhang-niepan",
    wrongTeacher: "linji-yixuan",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Baizhang Niepan (died ~828 CE) predates Linji Yixuan (died 866 CE) and was a student of Baizhang Huaihai, a generation earlier. The transmission as coded is chronologically impossible.",
  },
  {
    student: "yuelin-shiguan",
    wrongTeacher: "wuzhun-shifan",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Yuelin Shiguan (1143–1217) predates Wuzhun Shifan (1178–1249); the edge direction is reversed. Yuelin's confirmed student was Wumen Huikai.",
  },
  {
    student: "dingzhou-shizang",
    wrongTeacher: "shishuang-qingzhu",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Dingzhou Shizang's recorded dates (714–800) place him a century before Shishuang Qingzhu (807–888). The transmission is chronologically impossible.",
  },
  {
    student: "osaka-koryu",
    wrongTeacher: "linji-yixuan",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Linji Yixuan died 866 CE; Osaka Koryū lived 1901–1985. The edge encodes Rinzai-school school membership, not direct transmission. Koryū's actual root teacher was Muso Joko Roshi.",
  },
  {
    student: "wang-yanbin",
    wrongTeacher: "changqing-huileng",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Wang Yanbin was the governor of Fuzhou who invited Changqing Huileng to head a monastery and later built his memorial stūpa. A lay-patron relationship, not dharma transmission.",
  },
  {
    student: "mahasattva-fu",
    wrongTeacher: "puti-damo",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: no Chan source places Mahāsattva Fu (Fu Dashi, 497–569) as Bodhidharma's dharma heir in any formal transmission sense. The 'Three Mahāsattvas of the Liang Dynasty' grouping is honorific, not lineage. Per academic study (Tandfonline 2015), a 'Damo' mentioned in Fu's biography may be a different person later conflated with Bodhidharma.",
  },
  {
    student: "dosho-saikawa",
    wrongTeacher: "keido-chisan",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: no source links Keidō Chisan as Saikawa's dharma transmission teacher.",
  },
  {
    student: "wenshu-yingzhen",
    wrongTeacher: "dongshan-liangjie",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: 'Wenshu Yingzhen' does not appear in any English-language source as a named disciple of Dongshan Liangjie. Dongshan's confirmed students include Caoshan Benji, Yunju Daoying, Longya Judun, Jiufeng Puman, Qinshan Wensui, Yuezhou Qianfeng, Qinglin Shiqian, and Shushan Kuangren — Wenshu Yingzhen is absent from all lists.",
  },
  {
    student: "yangshan-yong",
    wrongTeacher: "tongan-daopi",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: 'Yangshan Yong' does not appear in any source as a disciple of Tongan Daopi. Daopi's only attested successor is Tongan Guanzhi.",
  },
  {
    student: "nanyue-daoxuan",
    wrongTeacher: "shitou-xiqian",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: 'Nanyue Daoxuan' does not exist in any Chan reference as a disciple of Shitou Xiqian. Shitou's main heirs were Yaoshan Weiyan, Danxia Tianran, and Tianhuang Daowu. The name is likely a conflation of Shitou's geographic location (Mt. Nanyue) with a personal name.",
  },
];

// Additional corrections that REQUIRE seeding a new master ──
interface SeededCorrection extends Correction {
  seedCorrectTeacher: NonNullable<Correction["seedCorrectTeacher"]>;
  correctTeacher: string;
}

const SEEDED_CORRECTIONS: SeededCorrection[] = [
  {
    student: "kobun-chino-otogawa",
    wrongTeacher: "shunryu-suzuki",
    correctTeacher: "hozan-koei-chino",
    seedCorrectTeacher: {
      slug: "hozan-koei-chino",
      schoolSlug: "soto",
      enName: "Hozan Koei Chino",
      aliases: ["Koei Chino Roshi"],
      cjkName: "知野弘栄",
      cjkLocale: "ja",
    },
    newEdgeNotes:
      "Dharma transmission (shihō) in 1962 at Kamo, Japan, from Hōzan Koei Chino Rōshi, Kobun's adoptive father and abbot of Kōtaiji temple. Per Jikoji Zen Center, Jakkoan, Terebess.",
    disputedNotes:
      "DISPUTED-AS-TRANSMISSION (kept as 'secondary' working relationship — see master_transmissions row type) — Wave-3 agent panel: Kobun's actual shihō teacher was his adoptive father Hōzan Koei Chino Rōshi in Kamo, Japan, 1962. Suzuki invited Kobun to Tassajara in 1967 and they collaborated until Suzuki's death in 1971; this is a working relationship, not a transmission lineage.",
  },
  {
    student: "baian-hakujun-kuroda",
    wrongTeacher: "keido-chisan",
    correctTeacher: "guhaku-daioshou",
    seedCorrectTeacher: {
      slug: "guhaku-daioshou",
      schoolSlug: "soto",
      enName: "Guhaku Daiōshō",
      aliases: ["Guhaku"],
      deathYear: 1928,
    },
    newEdgeNotes:
      "Per ZenHub genealogy: Baian Hakujun Kuroda's actual dharma transmission teacher was Guhaku Daiōshō (d. 1928), not Keidō Chisan.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Kuroda's actual teacher per ZenHub was Guhaku Daiōshō. Keidō Chisan (1879–1967) was a different Sōtō priest.",
  },
  {
    student: "sohan-genyo",
    wrongTeacher: "gisan-zenrai",
    correctTeacher: "kasan-zenryo",
    seedCorrectTeacher: {
      slug: "kasan-zenryo",
      schoolSlug: "rinzai",
      enName: "Kasan Zenryō",
      cjkName: "嘉山禅良",
      cjkLocale: "ja",
    },
    newEdgeNotes:
      "Sohan Genyō was in the Takuju Kosen sub-line, transmission from Kasan Zenryō. Per Shining Bright Lotus and Daiyuzenji lineage charts.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Sohan Genyō (1848–1922) is in the Takuju line under Kasan Zenryō. Gisan Zenrai is in the parallel Inzan sub-line.",
  },
  {
    student: "vincent-keisen-vuillemin",
    wrongTeacher: "etienne-mokusho-zeisler",
    correctTeacher: "yvon-myoken-bec",
    seedCorrectTeacher: {
      slug: "yvon-myoken-bec",
      schoolSlug: "soto",
      enName: "Yvon Myōken Bec",
    },
    newEdgeNotes:
      "Dharma transmission (shihō) on 4 June 2007 from Yvon Myōken Bec. Per terebess.hu and the Fundación Kannonji records.",
    disputedNotes:
      "DISPUTED — Wave-3 agent panel: Zeisler gave Vuillemin monk ordination in 1987 (not dharma transmission). Vuillemin's actual shihō was from Yvon Myōken Bec in 2007.",
  },
];

async function ensureMaster(seed: SeededCorrection["seedCorrectTeacher"]): Promise<string> {
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

async function applyCorrection(c: Correction): Promise<{ disputed: boolean; added: boolean }> {
  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, c.student))
    .limit(1);
  const wrongTeacherRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, c.wrongTeacher))
    .limit(1);
  if (studentRow.length === 0) {
    console.warn(`  [skip] student ${c.student} not found in DB`);
    return { disputed: false, added: false };
  }
  const studentId = studentRow[0].id;

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
  }

  let added = false;
  if (c.correctTeacher) {
    let correctTeacherId: string | null = null;
    if ("seedCorrectTeacher" in c && c.seedCorrectTeacher) {
      correctTeacherId = await ensureMaster(c.seedCorrectTeacher);
    } else {
      const correctRow = await db
        .select({ id: masters.id })
        .from(masters)
        .where(eq(masters.slug, c.correctTeacher))
        .limit(1);
      if (correctRow.length > 0) correctTeacherId = correctRow[0].id;
    }
    if (correctTeacherId) {
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
      if (existingNew.length === 0) {
        await db.insert(masterTransmissions).values({
          id: nanoid(),
          studentId,
          teacherId: correctTeacherId,
          type: "primary",
          isPrimary: true,
          notes: c.newEdgeNotes ?? null,
        });
        added = true;
      }
    } else {
      console.warn(
        `  [skip] correct teacher ${c.correctTeacher} for student ${c.student} not found and not seeded`,
      );
    }
  }
  return { disputed, added };
}

// ── Upstream connections for the four new masters seeded above ───────
// These attach the newly-introduced teachers to the existing tree so
// their students remain reachable from Shakyamuni Buddha on the public
// graph.

interface UpstreamConnection {
  /** Master who is currently orphaned (no upstream edge). */
  student: string;
  /** Master who is the upstream teacher. */
  teacher: string;
  /** If the teacher isn't yet seeded, add them. */
  seedTeacher?: NonNullable<Correction["seedCorrectTeacher"]>;
  notes: string;
}

const UPSTREAM_CONNECTIONS: UpstreamConnection[] = [
  // Bec ← Kosen Thibaut (transmission 2002). Thibaut already in DB
  // (he is one of Deshimaru's heirs via Niwa Renpō Zenji).
  {
    student: "yvon-myoken-bec",
    teacher: "stephane-kosen-thibaut",
    notes:
      "Dharma transmission (shihō) autumn 2002 from Stéphane Kōsen Thibaut, who himself received shihō from Niwa Renpō Zenji at Eihei-ji in 1984. Sources: Fundación Kannonji, Mokusho Zen House, Zen Universe, zen-deshimaru.com.",
  },
  // Kasan Zenryō ← Sozan Genkyō (a new master needing seeding).
  // Sozan Genkyō's own teacher Takujū Kosen (1760-1833) is already in
  // the DB, so seeding Sozan Genkyō connects the chain back to it.
  {
    student: "kasan-zenryo",
    teacher: "sozan-genkyo",
    seedTeacher: {
      slug: "sozan-genkyo",
      schoolSlug: "rinzai",
      enName: "Sosan Genkyō",
      aliases: ["Sosan Genkyō", "Sozan Genkyō"],
      cjkName: "蘇山玄喬",
      cjkLocale: "ja",
      birthYear: 1798,
      deathYear: 1868,
      teacherSlug: "takuju-kosen",
    },
    notes:
      "Sozan Genkyō (1798–1868) was the dharma successor of Takujū Kosen (1760–1833) in the Takuju sub-line of Hakuin's Rinzai. Per Terebess (chayat.html) and Shining Bright Lotus.",
  },
  // Guhaku Daiōshō ← Ryoka Daibai (a new master needing seeding).
  // Ryoka Daibai's own teacher (Kakuan Ryogu) is not yet seeded so this
  // chain has one more orphan in it — but Guhaku and Kuroda now route
  // through Ryoka Daibai which is the best we can do with current data.
  {
    student: "guhaku-daioshou",
    teacher: "ryoka-daibai",
    seedTeacher: {
      slug: "ryoka-daibai",
      schoolSlug: "soto",
      enName: "Ryoka Daibai",
      cjkName: "了杲大梅",
      cjkLocale: "ja",
    },
    notes:
      "Ryoka Daibai (了杲大梅) is the predecessor of Guhaku Daiōshō in the Sōtō ancestor lineage chanted at Great Plains Zen Center, Sacramento Zen, and other White Plum / Maezumi-lineage centers.",
  },
  // Note on Hozan Koei Chino: agent search found no source identifying
  // his upstream teacher. He remains orphaned for now; his student
  // Kobun Chino Otogawa is still graph-reachable via the (disputed)
  // Shunryū Suzuki edge until research surfaces Koei Chino's teacher.
];

async function applyUpstreamConnection(u: UpstreamConnection): Promise<boolean> {
  const studentRow = await db
    .select({ id: masters.id })
    .from(masters)
    .where(eq(masters.slug, u.student))
    .limit(1);
  if (studentRow.length === 0) {
    console.warn(`  [skip-upstream] student ${u.student} not found`);
    return false;
  }
  const studentId = studentRow[0].id;

  let teacherId: string | null = null;
  if (u.seedTeacher) {
    teacherId = await ensureMaster(u.seedTeacher);
    if (u.seedTeacher.teacherSlug) {
      const upstreamRow = await db
        .select({ id: masters.id })
        .from(masters)
        .where(eq(masters.slug, u.seedTeacher.teacherSlug))
        .limit(1);
      if (upstreamRow.length > 0) {
        const exists = await db
          .select({ id: masterTransmissions.id })
          .from(masterTransmissions)
          .where(
            and(
              eq(masterTransmissions.studentId, teacherId),
              eq(masterTransmissions.teacherId, upstreamRow[0].id),
            ),
          )
          .limit(1);
        if (exists.length === 0) {
          await db.insert(masterTransmissions).values({
            id: nanoid(),
            studentId: teacherId,
            teacherId: upstreamRow[0].id,
            type: "primary",
            isPrimary: true,
            notes:
              `Upstream connection from canonical lineage (added by seed-corrections-wave-3.ts).`,
          });
        }
      }
    }
  } else {
    const teacherRow = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, u.teacher))
      .limit(1);
    if (teacherRow.length > 0) teacherId = teacherRow[0].id;
  }
  if (!teacherId) {
    console.warn(`  [skip-upstream] teacher ${u.teacher} not available`);
    return false;
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
  if (exists.length > 0) return false;

  await db.insert(masterTransmissions).values({
    id: nanoid(),
    studentId,
    teacherId,
    type: "primary",
    isPrimary: true,
    notes: u.notes,
  });
  return true;
}

async function main() {
  let totalDisputed = 0;
  let totalAdded = 0;
  for (const c of [...CORRECTIONS, ...SEEDED_CORRECTIONS]) {
    const { disputed, added } = await applyCorrection(c);
    if (disputed) totalDisputed++;
    if (added) totalAdded++;
    const action = disputed && added ? "DISPUTED+ADDED" : disputed ? "DISPUTED" : added ? "ADDED" : "noop";
    console.log(
      `  ${action.padEnd(15)} ${c.wrongTeacher} → ${c.student}${
        c.correctTeacher ? `   (correct: ${c.correctTeacher})` : ""
      }`,
    );
  }
  let upstreamAdded = 0;
  for (const u of UPSTREAM_CONNECTIONS) {
    const added = await applyUpstreamConnection(u);
    if (added) upstreamAdded++;
    console.log(`  ${added ? "UPSTREAM" : "noop"}        ${u.teacher} → ${u.student}`);
  }
  console.log(
    `[seed-corrections-wave-3] disputed=${totalDisputed} added=${totalAdded} upstream=${upstreamAdded} of ${
      CORRECTIONS.length + SEEDED_CORRECTIONS.length
    } corrections + ${UPSTREAM_CONNECTIONS.length} upstream`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
