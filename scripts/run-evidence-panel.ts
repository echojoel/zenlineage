/**
 * Orchestrator for the transmission-evidence agent panel.
 *
 * Selects a batch of edges and runs them through the Researcher (×3) →
 * Reducer → Reviewer pipeline. Output: one .md file per edge under
 * scripts/data/transmission-evidence/.
 *
 * This script never modifies master_transmissions.
 *
 * Usage:
 *   npx tsx scripts/run-evidence-panel.ts --school <slug>
 *   npx tsx scripts/run-evidence-panel.ts --tier D --wave-size 25
 *   npx tsx scripts/run-evidence-panel.ts --edges path/to/edge-ids.txt
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import {
  masters,
  masterNames,
  masterTransmissions,
  schools,
  transmissionEvidence,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const STATE_FILE = path.join(
  process.cwd(),
  "scripts/data/transmission-evidence/_state.json",
);

interface State {
  last_run: string | null;
  processed_edge_ids: string[];
}

function loadState(): State {
  if (!fs.existsSync(STATE_FILE)) return { last_run: null, processed_edge_ids: [] };
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
}
function saveState(s: State): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

interface EdgePayload {
  edgeId: string;
  studentSlug: string;
  teacherSlug: string;
  studentLabel: string;
  teacherLabel: string;
  studentNative: string[];
  teacherNative: string[];
  studentDates: string;
  teacherDates: string;
  schoolSlug: string;
  existingNotes: string;
}

async function buildPayloads(filter: {
  school?: string;
  tier?: string;
  edgeIds?: string[];
}): Promise<EdgePayload[]> {
  const all = await db
    .select({
      edgeId: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
      notes: masterTransmissions.notes,
    })
    .from(masterTransmissions);

  const mastersRows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birth: masters.birthYear,
      death: masters.deathYear,
    })
    .from(masters);
  const m = new Map(mastersRows.map((r) => [r.id, r]));

  const schoolRows = await db.select({ id: schools.id, slug: schools.slug }).from(schools);
  const schoolSlugOf = new Map(schoolRows.map((s) => [s.id, s.slug]));

  const nameRows = await db
    .select({ masterId: masterNames.masterId, locale: masterNames.locale, value: masterNames.value })
    .from(masterNames);
  const namesByMaster = new Map<string, { native: string[]; primary: string | null }>();
  for (const n of nameRows) {
    const bucket = namesByMaster.get(n.masterId) ?? { native: [], primary: null };
    if (n.locale === "en") bucket.primary = bucket.primary ?? n.value;
    else bucket.native.push(`${n.locale}: ${n.value}`);
    namesByMaster.set(n.masterId, bucket);
  }

  let evidenceFilter = new Set<string>();
  if (filter.tier) {
    const rows = await db
      .select({ tid: transmissionEvidence.transmissionId })
      .from(transmissionEvidence)
      .where(eq(transmissionEvidence.tier, filter.tier));
    evidenceFilter = new Set(rows.map((r) => r.tid));
  }

  const fmtDates = (b: number | null, d: number | null) =>
    b === null && d === null ? "unknown" : `${b ?? "?"}–${d ?? "?"}`;

  return all
    .filter((e) => {
      if (filter.edgeIds && !filter.edgeIds.includes(e.edgeId)) return false;
      const sM = m.get(e.studentId);
      const tM = m.get(e.teacherId);
      if (!sM || !tM) return false;
      if (filter.school) {
        const ss = schoolSlugOf.get(sM.schoolId ?? "") ?? "";
        const ts = schoolSlugOf.get(tM.schoolId ?? "") ?? "";
        if (ss !== filter.school && ts !== filter.school) return false;
      }
      if (filter.tier && !evidenceFilter.has(e.edgeId)) return false;
      return true;
    })
    .map((e) => {
      const sM = m.get(e.studentId)!;
      const tM = m.get(e.teacherId)!;
      const sN = namesByMaster.get(e.studentId) ?? { native: [], primary: null };
      const tN = namesByMaster.get(e.teacherId) ?? { native: [], primary: null };
      return {
        edgeId: e.edgeId,
        studentSlug: sM.slug,
        teacherSlug: tM.slug,
        studentLabel: sN.primary ?? sM.slug,
        teacherLabel: tN.primary ?? tM.slug,
        studentNative: sN.native,
        teacherNative: tN.native,
        studentDates: fmtDates(sM.birth, sM.death),
        teacherDates: fmtDates(tM.birth, tM.death),
        schoolSlug: schoolSlugOf.get(sM.schoolId ?? "") ?? "unknown",
        existingNotes: e.notes ?? "",
      };
    });
}

function parseArgs(argv: string[]): { school?: string; tier?: string; edgesFile?: string; waveSize: number } {
  const out: { school?: string; tier?: string; edgesFile?: string; waveSize: number } = { waveSize: 25 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--school") out.school = argv[++i];
    else if (a === "--tier") out.tier = argv[++i];
    else if (a === "--edges") out.edgesFile = argv[++i];
    else if (a === "--wave-size") out.waveSize = Number(argv[++i]);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const edgeIds = args.edgesFile
    ? fs.readFileSync(args.edgesFile, "utf-8").split(/\s+/).filter(Boolean)
    : undefined;

  const payloads = await buildPayloads({
    school: args.school,
    tier: args.tier ?? "D",
    edgeIds,
  });
  const slice = payloads.slice(0, args.waveSize);

  const state = loadState();
  console.log(`[run-evidence-panel] wave size=${slice.length}, filter=${JSON.stringify(args)}, already_processed=${state.processed_edge_ids.length}`);

  const packDir = path.join(
    process.cwd(),
    "scripts/data/transmission-evidence/_taskpacks",
    `wave-${Date.now()}`,
  );
  fs.mkdirSync(packDir, { recursive: true });
  fs.writeFileSync(
    path.join(packDir, "wave.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        filter: args,
        edges: slice,
      },
      null,
      2,
    ),
  );
  const allowList = await import("@/lib/source-domains");
  fs.writeFileSync(
    path.join(packDir, "source-domains.json"),
    JSON.stringify(
      {
        SOURCE_DOMAINS: allowList.SOURCE_DOMAINS,
        PROMOTIONAL_DENY: allowList.PROMOTIONAL_DENY.map((r) => r.source),
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(packDir, "README.md"),
    `# Wave ${path.basename(packDir)}\n\n` +
      `Hand this directory to the outer agentic session. The session will:\n\n` +
      `1. For each edge in \`wave.json\`, dispatch 3 researcher subagents in isolated worktrees with the prompt from \`scripts/data/agent-recipes/transmission-evidence.md\`.\n` +
      `2. Collect each subagent's JSON envelope into \`<edgeId>/researcher-{1,2,3}.json\`.\n` +
      `3. Run the reducer subagent on the three envelopes and write the merged evidence file to \`scripts/data/transmission-evidence/<student>__<teacher>.md\`.\n` +
      `4. Run the reviewer subagent; downgrade tier in the file if warranted.\n` +
      `5. Append any suggested corrections to \`scripts/data/transmission-evidence/_suggested-corrections.md\`.\n` +
      `6. Update \`scripts/data/transmission-evidence/_state.json\` by appending the processed edge ids.\n`,
  );
  console.log(`[run-evidence-panel] task pack written: ${packDir}`);

  state.last_run = new Date().toISOString();
  saveState(state);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
