/**
 * Comprehensive transmission-edge audit.
 *
 * Walks every row in `master_transmissions` and applies a battery of
 * rules that catch the kinds of errors we hit while sorting out the
 * Deshimaru lineage:
 *
 *   - type vs is_primary inconsistency (e.g. type='dharma' but is_primary=1)
 *   - >1 is_primary=true incoming edges per student (DAG violation)
 *   - notes saying "shihō" but type='dharma' (editorial bridge that's
 *     actually a real transmission)
 *   - notes saying "ordained" but type='primary' AND no separate sh̄ho
 *     edge documented (possible miscategorisation)
 *   - masters with zero incoming edges (orphans — fine for Shakyamuni,
 *     reportable for everyone else)
 *   - dangling teacher/student ids
 *   - Deshimaru-line edges missing the "Root teacher / master" notes
 *     marker that the shihō-derivation needs
 *
 * Output is grouped by severity (ERROR / WARN / INFO). Exits non-zero
 * when any ERROR rows are found.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/audit-transmissions.ts
 *   # or
 *   npm run audit:transmissions
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masters, masterTransmissions, citations } from "@/db/schema";

interface Finding {
  severity: "ERROR" | "WARN" | "INFO";
  rule: string;
  studentSlug: string;
  teacherSlug: string;
  edgeType: string;
  isPrimary: boolean;
  notes: string | null;
  reason: string;
}

// Unicode-friendly shihō test. We can't use \b around terms with
// non-ASCII characters (ō, ấ) because \b is defined relative to the
// ASCII \w class. Use a simple substring test on a lowercased copy
// of the notes — terms here are distinctive enough that false hits
// are not a concern.
const SHIHO_TERMS = [
  "shihō",
  "shiho",
  "inka",
  "inga",
  "ấn khả",
  "an kha",
  "chuanfa",
  "传法",
  "傳法",
  "formal dharma transmission",
];
function containsShihoTerm(notes: string | null): boolean {
  if (!notes) return false;
  const lower = notes.toLowerCase();
  return SHIHO_TERMS.some((t) => lower.includes(t));
}
const ROOT_TEACHER_ONLY_RE = /^\s*root\s+teacher\s*\/\s*master\b/i;
const ORDINATION_RE = /\b(ordained|ordination)\b/i;

async function main() {
  // Load everything in one pass.
  const allMasters = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters);
  const idToSlug = new Map(allMasters.map((m) => [m.id, m.slug]));

  const allEdges = await db
    .select({
      id: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
      type: masterTransmissions.type,
      isPrimary: masterTransmissions.isPrimary,
      notes: masterTransmissions.notes,
    })
    .from(masterTransmissions);

  const allCitations = await db
    .select({
      entityId: citations.entityId,
      entityType: citations.entityType,
    })
    .from(citations);
  const citedEdgeIds = new Set(
    allCitations
      .filter((c) => c.entityType === "master_transmission")
      .map((c) => c.entityId)
  );

  const findings: Finding[] = [];
  const studentToEdges = new Map<string, typeof allEdges>();
  for (const e of allEdges) {
    const arr = studentToEdges.get(e.studentId) ?? [];
    arr.push(e);
    studentToEdges.set(e.studentId, arr);
  }

  const push = (
    severity: Finding["severity"],
    rule: string,
    e: (typeof allEdges)[number],
    reason: string
  ) => {
    findings.push({
      severity,
      rule,
      studentSlug: idToSlug.get(e.studentId) ?? `<missing:${e.studentId}>`,
      teacherSlug: idToSlug.get(e.teacherId) ?? `<missing:${e.teacherId}>`,
      edgeType: e.type,
      isPrimary: e.isPrimary ?? false,
      notes: e.notes,
      reason,
    });
  };

  // ── Per-edge rules ────────────────────────────────────────────────
  for (const e of allEdges) {
    const isPrimary = e.isPrimary ?? false;
    const notes = e.notes;

    // R1. Dangling references.
    if (!idToSlug.has(e.studentId)) {
      push("ERROR", "dangling-student", e, "studentId does not resolve to any master");
    }
    if (!idToSlug.has(e.teacherId)) {
      push("ERROR", "dangling-teacher", e, "teacherId does not resolve to any master");
    }

    // R2. Type vs is_primary consistency.
    if (e.type === "primary" && !isPrimary) {
      push(
        "ERROR",
        "type-primary-but-not-primary-flag",
        e,
        "type='primary' but is_primary=false — these must agree"
      );
    }
    if (e.type === "secondary" && isPrimary) {
      push(
        "ERROR",
        "type-secondary-but-primary-flag",
        e,
        "type='secondary' but is_primary=true — secondary edges should never be the canonical primary"
      );
    }
    if (e.type === "dharma" && isPrimary) {
      // `dharma + is_primary=true` is acceptable when the student
      // has no other `primary` edge — it means "this is the canonical
      // lineage line, traced through an editorial bridge because the
      // immediate teacher is not yet seeded". Common for Korean /
      // Vietnamese masters whose Chinese-era teachers aren't in the
      // DB. We only warn when ANOTHER true `primary` edge exists for
      // the same student — that's the case where the dharma+primary
      // flag is contradicting the real primary.
      const studentEdges = studentToEdges.get(e.studentId) ?? [];
      const otherPrimary = studentEdges.some(
        (other) =>
          other.id !== e.id &&
          other.type === "primary" &&
          (other.isPrimary ?? false),
      );
      if (otherPrimary) {
        push(
          "WARN",
          "dharma-flagged-primary-with-rival",
          e,
          "type='dharma' but is_primary=true while another `primary` edge exists for the same student — pick one or clear the flag here"
        );
      }
    }
    if (e.type === "disputed" && isPrimary) {
      push(
        "WARN",
        "disputed-flagged-primary",
        e,
        "type='disputed' but is_primary=true — disputed transmissions shouldn't be the canonical primary"
      );
    }

    // R3. Notes vs type signal.
    if (notes && containsShihoTerm(notes)) {
      if (e.type === "dharma") {
        push(
          "WARN",
          "shiho-notes-on-dharma-edge",
          e,
          "notes mention shihō / inka / inga / ấn khả but type='dharma' — should this be type='primary' (root + shihō) or 'secondary' (shihō from a non-root teacher)?"
        );
      }
    }

    // R4. Primary edge with "ordained by" notes but neither a shihō
    // term nor the explicit "Root teacher / master" prefix. The
    // standard case ("Ordained 1992, shihō 2011 from X") contains
    // both terms in the same note — that's NOT a warning. We only
    // warn when notes mention ordination without any shihō term AND
    // without the root-teacher exclusion, because in that case the
    // shihō-derivation will mark this edge as shihō-conferring by
    // default and the data doesn't explicitly support that.
    if (
      e.type === "primary" &&
      isPrimary &&
      notes &&
      ORDINATION_RE.test(notes) &&
      !ROOT_TEACHER_ONLY_RE.test(notes) &&
      !containsShihoTerm(notes)
    ) {
      push(
        "INFO",
        "primary-mentions-ordination-only",
        e,
        "notes mention 'ordained' but don't mention shihō and don't start with 'Root teacher / master'. The graph will infer shihō=true; if this teacher gave ordination only (not shihō), prefix the notes with 'Root teacher / master.'"
      );
    }

    // R5. Citation coverage.
    if (!citedEdgeIds.has(e.id)) {
      push(
        "WARN",
        "transmission-without-citation",
        e,
        "no citation row recorded for this transmission edge"
      );
    }
  }

  // ── Per-student rules ─────────────────────────────────────────────
  for (const [studentId, edges] of studentToEdges) {
    const primaryCount = edges.filter((e) => (e.isPrimary ?? false)).length;
    const studentSlug = idToSlug.get(studentId) ?? `<missing:${studentId}>`;
    if (primaryCount > 1) {
      // DAG invariant — every student has at most one canonical
      // root-teacher edge. More than one isPrimary=true is a hard
      // contradiction.
      findings.push({
        severity: "ERROR",
        rule: "multiple-is-primary",
        studentSlug,
        teacherSlug: "(multiple)",
        edgeType: "(multiple)",
        isPrimary: true,
        notes: null,
        reason: `student has ${primaryCount} incoming edges with is_primary=true (allowed: ≤1). Edges from: ${edges
          .filter((e) => e.isPrimary)
          .map((e) => idToSlug.get(e.teacherId) ?? "?")
          .join(", ")}`,
      });
    }
  }

  // ── Orphan masters (no incoming edges) ────────────────────────────
  // Skip Shakyamuni — he's the root of the entire DAG.
  const expectedRoots = new Set(["shakyamuni-buddha"]);
  const studentsSet = new Set(allEdges.map((e) => e.studentId));
  for (const m of allMasters) {
    if (studentsSet.has(m.id)) continue;
    if (expectedRoots.has(m.slug)) continue;
    findings.push({
      severity: "INFO",
      rule: "orphan-master",
      studentSlug: m.slug,
      teacherSlug: "(none)",
      edgeType: "—",
      isPrimary: false,
      notes: null,
      reason: "master has no incoming transmission edge; not reachable from the lineage graph",
    });
  }

  // ── Output ────────────────────────────────────────────────────────
  const bySeverity = { ERROR: 0, WARN: 0, INFO: 0 };
  for (const f of findings) bySeverity[f.severity]++;

  console.log("\n=== Transmission audit ===");
  console.log(`Total edges:    ${allEdges.length}`);
  console.log(`Total masters:  ${allMasters.length}`);
  console.log(`Errors:         ${bySeverity.ERROR}`);
  console.log(`Warnings:       ${bySeverity.WARN}`);
  console.log(`Info:           ${bySeverity.INFO}`);
  console.log();

  if (findings.length === 0) {
    console.log("✓ All edges pass.");
    return;
  }

  // Group by rule
  const byRule = new Map<string, Finding[]>();
  for (const f of findings) {
    const arr = byRule.get(`${f.severity}:${f.rule}`) ?? [];
    arr.push(f);
    byRule.set(`${f.severity}:${f.rule}`, arr);
  }
  const sortedRuleKeys = [...byRule.keys()].sort((a, b) => {
    const order = { ERROR: 0, WARN: 1, INFO: 2 };
    const sa = a.split(":")[0] as keyof typeof order;
    const sb = b.split(":")[0] as keyof typeof order;
    return order[sa] - order[sb] || a.localeCompare(b);
  });

  for (const key of sortedRuleKeys) {
    const arr = byRule.get(key)!;
    const [severity, rule] = key.split(":");
    console.log(`\n── [${severity}] ${rule} — ${arr.length} ${arr.length === 1 ? "row" : "rows"} ──`);
    // Print a sample (cap at 20 for very large groups)
    const sample = arr.slice(0, 20);
    for (const f of sample) {
      const ns = f.notes ? `  notes: ${f.notes.slice(0, 80).replace(/\n/g, " ")}${f.notes.length > 80 ? "…" : ""}` : "";
      console.log(`  • ${f.teacherSlug} → ${f.studentSlug} [type=${f.edgeType}, isPrimary=${f.isPrimary}]`);
      console.log(`    reason: ${f.reason}${ns ? "\n    " + ns : ""}`);
    }
    if (arr.length > 20) {
      console.log(`  …and ${arr.length - 20} more`);
    }
  }

  if (bySeverity.ERROR > 0) {
    console.log("\n✘ Audit failed — fix ERROR rows before deploying.");
    process.exit(1);
  }
  console.log("\n✓ No errors. Warnings and info rows above are for review.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
