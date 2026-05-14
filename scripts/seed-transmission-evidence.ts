/**
 * Seed transmission_evidence + transmission_sources from per-edge
 * Markdown files at scripts/data/transmission-evidence/<student>__<teacher>.md.
 *
 * Edges with no evidence file get a row with tier='D' and
 * human_review_needed=1 so the public-side code never has to handle a
 * missing-evidence case.
 *
 * Strictly additive: this script never reads, modifies, or deletes
 * rows in master_transmissions.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-transmission-evidence.ts
 */
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  masters,
  masterTransmissions,
  transmissionEvidence,
  transmissionSources,
} from "@/db/schema";
import { parseEvidenceFile } from "@/lib/edge-trust";

const EVIDENCE_DIR = path.join(process.cwd(), "scripts/data/transmission-evidence");

async function main() {
  const mastersList = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  const edges = await db
    .select({
      id: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
    })
    .from(masterTransmissions);
  const edgeKey = (sId: string, tId: string) => `${sId}|${tId}`;
  const edgeIdByKey = new Map(
    edges.map((e) => [edgeKey(e.studentId, e.teacherId), e.id]),
  );

  // Clean slate — seeder owns these two tables completely.
  await db.delete(transmissionSources);
  await db.delete(transmissionEvidence);

  let loaded = 0;
  let danglingFiles = 0;
  let parseErrors = 0;

  const files = fs.existsSync(EVIDENCE_DIR)
    ? fs
        .readdirSync(EVIDENCE_DIR)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_") && !f.startsWith("."))
    : [];

  const filesByEdgeId = new Map<string, string>();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(EVIDENCE_DIR, file), "utf-8");
    const parsed = parseEvidenceFile(raw);
    if (!parsed.ok) {
      console.error(`[evidence] ${file}: parse errors:\n  - ${parsed.errors.join("\n  - ")}`);
      parseErrors++;
      continue;
    }
    const sId = slugToId.get(parsed.parsed.student);
    const tId = slugToId.get(parsed.parsed.teacher);
    if (!sId || !tId) {
      console.error(
        `[evidence] ${file}: unknown master slug (student=${parsed.parsed.student}, teacher=${parsed.parsed.teacher})`,
      );
      danglingFiles++;
      continue;
    }
    const edgeId = edgeIdByKey.get(edgeKey(sId, tId));
    if (!edgeId) {
      console.error(
        `[evidence] ${file}: no master_transmissions row for ${parsed.parsed.teacher} → ${parsed.parsed.student}`,
      );
      danglingFiles++;
      continue;
    }
    filesByEdgeId.set(edgeId, file);

    const evidenceId = nanoid();
    await db.insert(transmissionEvidence).values({
      id: evidenceId,
      transmissionId: edgeId,
      tier: parsed.parsed.tier,
      verifiedAt: parsed.parsed.verified_at,
      humanReviewNeeded: parsed.parsed.human_review_needed,
      reducerNotes: parsed.parsed.reducer_notes,
      reviewerNotes: parsed.parsed.reviewer_notes,
    });
    for (let i = 0; i < parsed.parsed.sources.length; i++) {
      const s = parsed.parsed.sources[i];
      await db.insert(transmissionSources).values({
        id: nanoid(),
        evidenceId,
        publisher: s.publisher,
        url: s.url,
        domainClass: s.domain_class,
        retrievedOn: s.retrieved_on,
        quote: s.quote,
        sortOrder: i,
      });
    }
    loaded++;
  }

  // Tier-D placeholder for every edge with no evidence file.
  let placeheld = 0;
  for (const e of edges) {
    if (filesByEdgeId.has(e.id)) continue;
    await db.insert(transmissionEvidence).values({
      id: nanoid(),
      transmissionId: e.id,
      tier: "D",
      verifiedAt: null,
      humanReviewNeeded: true,
      reducerNotes: null,
      reviewerNotes: null,
    });
    placeheld++;
  }

  console.log(
    `[seed-transmission-evidence] loaded=${loaded} tier_d_placeholders=${placeheld} parse_errors=${parseErrors} dangling=${danglingFiles}`,
  );
  if (parseErrors > 0 || danglingFiles > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
