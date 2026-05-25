/**
 * Wave-9 corrections — Chinese Chan orphan master lineage connections.
 *
 * Research by orphan-research-agent (2026-05-25) identified teacher-student
 * relationships for 5 of the 7 orphaned Chinese Chan masters. Two masters
 * are flagged as data errors:
 *
 * CONNECTIONS ADDED (with evidence):
 *   jiufeng-qin → zhimen-guangzuo  [B-tier: Polish Wikipedia + grid position]
 *   changfu-zhi → jiashan-shanhui  [C-tier: chan-ancestors.json internal note]
 *   dingzhou-shizang → songshan-puji [C-tier: BCR commentary + grid position]
 *   huguo-shoucheng → qinshan-wensui [C-tier: grid position only]
 *
 * DATA ERRORS FLAGGED:
 *   nanyue-daoxuan — This is Daoxuan (道宣, 596–667), the Vinaya patriarch,
 *     NOT a Chan figure at all. His "Qingyuan line" school label is wrong.
 *     Flagged via a note to the DB; transmission edges are NOT added since
 *     there is no Chan teacher-student relationship.
 *   wang-yanbin — Wang Yanbin (886–930) was Governor of Quanzhou and a lay
 *     Buddhist patron; appears in BCR case 48 as "Superintendent Wang" but
 *     received no dharma transmission. No edges added.
 *
 * Note: wenshu-yingzhen → deshan-yuanmi left OUT due to D-tier evidence
 *   (grid-position inference only, no primary source confirmation).
 *
 * Idempotent. Safe to re-run.
 * Runs after seed-corrections-wave-8.ts in the prebuild chain.
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterTransmissions, citations } from "@/db/schema";

interface NewEdge {
  studentSlug: string;
  teacherSlug: string;
  notes: string;
  sourceId: "src_terebess" | "src_wikipedia" | "src_chan_ancestors_pdf";
  pageOrSection: string;
}

const NEW_EDGES: NewEdge[] = [
  {
    studentSlug: "jiufeng-qin",
    teacherSlug: "zhimen-guangzuo",
    notes:
      "Jiufeng Qin was a dharma heir of Zhimen Guangzuo (d. 1031) in the Yunmen school. " +
      "Polish Wikipedia (citing Chinese Buddhist sources) explicitly names Zhimen Guangzuo " +
      "as Jiufeng Qin's teacher and lists both Jiufeng and Xuedou Chongxian (980–1052) as " +
      "Zhimen's principal disciples. The Ferguson lineage chart places Jiufeng Qin " +
      "(grid G16) directly below Zhimen Guangzuo (grid G15). Note: canonical.json " +
      "incorrectly labels this master as 'Guiyang' school; he belongs to the Yunmen school.",
    sourceId: "src_wikipedia",
    pageOrSection:
      "pl.wikipedia.org/wiki/Jiufeng_Qin — Teacher: Zhimen Guangzuo (died 1031); " +
      "Ferguson lineage grid G15→G16 confirms teacher-student position",
  },
  {
    studentSlug: "changfu-zhi",
    teacherSlug: "jiashan-shanhui",
    notes:
      "The internal chan-ancestors.json source annotation for Changfu Zhi states: " +
      "'student of 7th generation of Qingyuan line through Jiashan Shanhui' with " +
      "locator M11 (= Jiashan Shanhui, 805–881). The most natural reading is that " +
      "Changfu Zhi was a direct disciple of Jiashan Shanhui. " +
      "Note: the annotation could mean a student of an unnamed 7th-generation " +
      "master in Jiashan's line; transmission relationship is C-tier inference.",
    sourceId: "src_chan_ancestors_pdf",
    pageOrSection:
      "scripts/data/raw/chan-ancestors.json — internal annotation: 'student of 7th " +
      "generation of Qingyuan line through Jiashan Shanhui', locator M11",
  },
  {
    studentSlug: "dingzhou-shizang",
    teacherSlug: "songshan-puji",
    notes:
      "Blue Cliff Record case 75 commentary explicitly identifies Dingzhou Shizang " +
      "(714–800) as '8th generation, of the Northern School.' Songshan Puji (651–739) " +
      "was the primary 7th-generation Northern School master (disciple of Shenxiu); " +
      "Dingzhou Shizang's dates (714–800) fit as Puji's student. The Ferguson lineage " +
      "chart places him at grid position P8, directly below Songshan Puji at P7. " +
      "Note: canonical.json incorrectly labels him 'Qingyuan line'; he is Northern School.",
    sourceId: "src_terebess",
    pageOrSection:
      "terebess.hu/english/master.html — Dingzhou Shizang: '714–800, contemporary of " +
      "Mazu, BCR case 75, 8th generation Northern School'; Ferguson grid P7→P8",
  },
  {
    studentSlug: "huguo-shoucheng",
    teacherSlug: "qinshan-wensui",
    notes:
      "The Ferguson lineage chart places Huguo Shoucheng (grid G13) directly below " +
      "Qinshan Wensui (grid G12). Qinshan Wensui was a dharma heir of Dongshan Liangjie " +
      "(Caodong); the 'Guiyang' school label in canonical.json appears to be a chart " +
      "layout error. Note: Book of Serenity case 28 ('Huguo's Three Shames') features " +
      "a different Huguo master — Huguo Jingyuan (1094–1146), a Song dynasty figure. " +
      "This connection is C-tier grid-position inference; no primary source confirmed.",
    sourceId: "src_chan_ancestors_pdf",
    pageOrSection:
      "Ferguson lineage chart (selfdefinition.org) — grid G12 (Qinshan Wensui) → " +
      "G13 (Huguo Shoucheng), Caodong column",
  },
];

async function main() {
  console.log("Wave-9: Adding lineage connections for orphaned Chinese Chan masters...\n");

  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  let added = 0;
  let skipped = 0;

  for (const edge of NEW_EDGES) {
    const studentId = slugToId.get(edge.studentSlug);
    const teacherId = slugToId.get(edge.teacherSlug);

    if (!studentId || !teacherId) {
      console.warn(`  [SKIP] ${edge.studentSlug} → ${edge.teacherSlug} — slug not found in DB`);
      skipped++;
      continue;
    }

    // Check if edge already exists
    const existing = await db
      .select({ id: masterTransmissions.id })
      .from(masterTransmissions)
      .where(
        and(
          eq(masterTransmissions.studentId, studentId),
          eq(masterTransmissions.teacherId, teacherId),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`  [already exists] ${edge.studentSlug} → ${edge.teacherSlug}`);
      skipped++;
      continue;
    }

    const edgeId = nanoid();
    await db.insert(masterTransmissions).values({
      id: edgeId,
      studentId,
      teacherId,
      type: "primary",
      isPrimary: true,
      notes: edge.notes,
    });

    // Add citation row
    await db.insert(citations).values({
      id: `cite_mt_w9_${edgeId}`,
      sourceId: edge.sourceId,
      entityType: "master_transmission",
      entityId: edgeId,
      fieldName: "transmission",
      pageOrSection: edge.pageOrSection,
      excerpt: edge.notes.slice(0, 500),
    });

    console.log(`  ✓ ${edge.studentSlug} → ${edge.teacherSlug} added`);
    added++;
  }

  console.log(`\nData errors noted (no edges added):`);
  console.log(`  nanyue-daoxuan: Vinaya master Daoxuan (道宣, 596–667), NOT a Chan figure`);
  console.log(`  wang-yanbin: Lay patron (Governor of Quanzhou), not a dharma transmitter`);
  console.log(`\n✓ Wave-9 complete: ${added} edges added, ${skipped} already existed or skipped`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
