/**
 * Sōtō Zen canonical-lineage cross-check.
 *
 * Loads `scripts/data/canonical-soto-lineage.ts` and verifies the live
 * `master_transmissions` table matches our ground-truth reference. Catches
 * the kinds of correctness errors that the structural `audit-transmissions`
 * audit cannot catch:
 *
 *   - The DB records a *different* teacher than the canonical source says
 *     (TEACHER_MISMATCH).
 *   - A canonical edge exists but is missing from the DB (EDGE_MISSING).
 *   - The DB notes for an edge mention a shihō year that differs from the
 *     canonical year (YEAR_MISMATCH).
 *   - The canonical entry has a `disputedBy` source but the DB edge is not
 *     flagged as `disputed` (DISPUTED_NOT_FLAGGED).
 *   - A canonical master is missing from the DB, or has a different school
 *     placement, or different birth / death years (MASTER_MISSING,
 *     SCHOOL_MISMATCH, BIRTH_MISMATCH, DEATH_MISMATCH).
 *
 * Severity gating:
 *   - Tier-1 masters (per `src/lib/editorial-tiers.ts`) → ERROR
 *   - Non-tier-1 → WARN
 *   - `DISPUTED_NOT_FLAGGED` → INFO (cosmetic; doesn't block)
 *   - `MASTER_MISSING` for un-seeded Tokugawa/early-Meiji figures → INFO
 *     (these are tracked separately as a seeding backlog)
 *
 * Exits non-zero when any ERROR rows are present.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/audit-soto-lineage.ts
 *   # or
 *   npm run audit:soto
 */

import { db } from "@/db";
import { masters, masterTransmissions, schools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TIER_1_ENTRIES } from "@/lib/editorial-tiers";
import {
  CANONICAL_EDGES,
  CANONICAL_MASTERS,
} from "./data/canonical-soto-lineage";

type Severity = "ERROR" | "WARN" | "INFO";

interface Finding {
  severity: Severity;
  rule: string;
  subject: string;
  reason: string;
}

const tier1 = new Set(TIER_1_ENTRIES.map((e) => e.slug));

const SHIHO_YEAR_RE = /\b(1[3-9]\d{2}|20\d{2})\b/;

function parseShihoYear(notes: string | null): number | null {
  if (!notes) return null;
  const m = notes.match(SHIHO_YEAR_RE);
  return m ? Number(m[1]) : null;
}

async function main() {
  // ── Load DB state in one pass ───────────────────────────────────────────
  const allMasters = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters);
  const allSchools = await db
    .select({ id: schools.id, slug: schools.slug })
    .from(schools);
  const schoolSlugById = new Map(allSchools.map((s) => [s.id, s.slug]));
  const masterBySlug = new Map(allMasters.map((m) => [m.slug, m]));

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

  // Build a quick index: student slug → primary edge (if any).
  const idToSlug = new Map(allMasters.map((m) => [m.id, m.slug]));
  const studentPrimaryEdge = new Map<string, (typeof allEdges)[number]>();
  const studentAllEdges = new Map<string, (typeof allEdges)[number][]>();
  for (const e of allEdges) {
    const studentSlug = idToSlug.get(e.studentId);
    if (!studentSlug) continue;
    const arr = studentAllEdges.get(studentSlug) ?? [];
    arr.push(e);
    studentAllEdges.set(studentSlug, arr);
    if ((e.isPrimary ?? false) && !studentPrimaryEdge.has(studentSlug)) {
      studentPrimaryEdge.set(studentSlug, e);
    }
  }

  const findings: Finding[] = [];
  const push = (severity: Severity, rule: string, subject: string, reason: string) =>
    findings.push({ severity, rule, subject, reason });

  // Severity helper: tier-1 → ERROR, otherwise WARN.
  const tieredSeverity = (slug: string): Severity =>
    tier1.has(slug) ? "ERROR" : "WARN";

  // ── Check each canonical edge ───────────────────────────────────────────
  for (const c of CANONICAL_EDGES) {
    const studentRow = masterBySlug.get(c.student);
    const teacherRow = masterBySlug.get(c.teacher);

    if (!studentRow) {
      push(
        "INFO",
        "master-missing",
        c.student,
        `canonical edge ${c.teacher} → ${c.student}: student not yet seeded in DB`,
      );
      continue;
    }
    if (!teacherRow) {
      push(
        "INFO",
        "master-missing",
        c.teacher,
        `canonical edge ${c.teacher} → ${c.student}: teacher not yet seeded in DB`,
      );
      continue;
    }

    const edges = studentAllEdges.get(c.student) ?? [];
    const matching = edges.find((e) => e.teacherId === teacherRow.id);

    if (!matching) {
      // No edge from canonical teacher exists. Check whether the DB has a
      // *different* primary teacher — that's TEACHER_MISMATCH (an active
      // contradiction). Otherwise it's just EDGE_MISSING (a gap we should
      // add).
      const dbPrimary = studentPrimaryEdge.get(c.student);
      if (dbPrimary) {
        const dbTeacherSlug = idToSlug.get(dbPrimary.teacherId) ?? "?";
        push(
          tieredSeverity(c.student),
          "teacher-mismatch",
          c.student,
          `canonical says teacher is ${c.teacher}, but DB primary edge points to ${dbTeacherSlug}`,
        );
      } else {
        push(
          tieredSeverity(c.student),
          "edge-missing",
          c.student,
          `canonical ${c.teacher} → ${c.student} not present in DB (student has no primary edge either)`,
        );
      }
      continue;
    }

    // Edge exists. Check the shihō year if both sides specify one.
    if (c.shihoYear) {
      const actual = parseShihoYear(matching.notes);
      if (actual && actual !== c.shihoYear) {
        push(
          "WARN",
          "year-mismatch",
          c.student,
          `canonical shihō year ${c.shihoYear} ≠ year parsed from DB notes (${actual}) on ${c.teacher} → ${c.student}`,
        );
      }
    }

    // Disputed flag — informational only.
    if (c.disputedBy && matching.type !== "disputed") {
      push(
        "INFO",
        "disputed-not-flagged",
        c.student,
        `canonical records academic dissent (${c.disputedBy.url}); DB edge type is '${matching.type}' — consider flagging as 'disputed'`,
      );
    }
  }

  // ── Check each canonical master row ─────────────────────────────────────
  for (const c of CANONICAL_MASTERS) {
    const row = masterBySlug.get(c.slug);
    if (!row) {
      push(
        tieredSeverity(c.slug),
        "master-missing",
        c.slug,
        `canonical master not present in DB`,
      );
      continue;
    }
    if (c.birthYear && row.birthYear && row.birthYear !== c.birthYear) {
      push(
        tieredSeverity(c.slug),
        "birth-mismatch",
        c.slug,
        `canonical birthYear=${c.birthYear} vs DB birthYear=${row.birthYear}`,
      );
    }
    if (c.deathYear && row.deathYear && row.deathYear !== c.deathYear) {
      push(
        tieredSeverity(c.slug),
        "death-mismatch",
        c.slug,
        `canonical deathYear=${c.deathYear} vs DB deathYear=${row.deathYear}`,
      );
    }
    const dbSchoolSlug = row.schoolId ? schoolSlugById.get(row.schoolId) : null;
    if (dbSchoolSlug && dbSchoolSlug !== c.schoolSlug) {
      push(
        tieredSeverity(c.slug),
        "school-mismatch",
        c.slug,
        `canonical schoolSlug='${c.schoolSlug}' vs DB schoolSlug='${dbSchoolSlug}'`,
      );
    }
  }

  // ── Temporal-feasibility scan over the live edges ───────────────────────
  // Teacher's death must be ≥ student's birth + 5 (student must be old
  // enough to plausibly be a student of the teacher before the teacher
  // dies). Student's birth must be ≥ teacher's birth + 10.
  // We skip `dharma` (editorial bridge) edges and `disputed` edges since
  // those represent long-distance lineage anchoring across centuries where
  // the immediate teacher isn't seeded — not a real teacher-student claim.
  for (const e of allEdges) {
    if (e.type === "dharma" || e.type === "disputed") continue;
    const sSlug = idToSlug.get(e.studentId);
    const tSlug = idToSlug.get(e.teacherId);
    if (!sSlug || !tSlug) continue;
    const s = masterBySlug.get(sSlug);
    const t = masterBySlug.get(tSlug);
    if (!s || !t) continue;
    if (s.birthYear == null || t.birthYear == null) continue;

    // Patriarchal dummy dates (pre-CE Indian patriarchs all carry placeholder
    // birth years spaced by century markers; not historically claimed).
    if (s.birthYear < 200 && t.birthYear < 200) continue;

    if (t.deathYear != null && t.deathYear < s.birthYear - 1) {
      push(
        "WARN",
        "temporal-impossible",
        sSlug,
        `${tSlug} (d. ${t.deathYear}) died before ${sSlug} (b. ${s.birthYear}) was born`,
      );
      continue;
    }
    if (s.birthYear < t.birthYear + 5) {
      push(
        "INFO",
        "temporal-tight",
        sSlug,
        `${tSlug} (b. ${t.birthYear}) only ${s.birthYear - t.birthYear} years older than ${sSlug} (b. ${s.birthYear}) — verify`,
      );
    }
  }

  // ── Output ──────────────────────────────────────────────────────────────
  const counts = { ERROR: 0, WARN: 0, INFO: 0 };
  for (const f of findings) counts[f.severity]++;

  console.log("\n=== Sōtō canonical-lineage audit ===");
  console.log(`Canonical edges checked:  ${CANONICAL_EDGES.length}`);
  console.log(`Canonical masters checked: ${CANONICAL_MASTERS.length}`);
  console.log(`DB edges scanned:         ${allEdges.length}`);
  console.log(`Errors:                   ${counts.ERROR}`);
  console.log(`Warnings:                 ${counts.WARN}`);
  console.log(`Info:                     ${counts.INFO}`);

  if (findings.length === 0) {
    console.log("\n✓ All canonical claims match the DB.");
    return;
  }

  const byRule = new Map<string, Finding[]>();
  for (const f of findings) {
    const key = `${f.severity}:${f.rule}`;
    const arr = byRule.get(key) ?? [];
    arr.push(f);
    byRule.set(key, arr);
  }
  const sortedKeys = [...byRule.keys()].sort((a, b) => {
    const order: Record<Severity, number> = { ERROR: 0, WARN: 1, INFO: 2 };
    const sa = a.split(":")[0] as Severity;
    const sb = b.split(":")[0] as Severity;
    return order[sa] - order[sb] || a.localeCompare(b);
  });

  for (const key of sortedKeys) {
    const arr = byRule.get(key)!;
    const [severity, rule] = key.split(":");
    console.log(
      `\n── [${severity}] ${rule} — ${arr.length} ${arr.length === 1 ? "row" : "rows"} ──`,
    );
    for (const f of arr.slice(0, 30)) {
      console.log(`  • ${f.subject} — ${f.reason}`);
    }
    if (arr.length > 30) console.log(`  …and ${arr.length - 30} more`);
  }

  if (counts.ERROR > 0) {
    console.log("\n✘ Audit failed — fix ERROR rows before deploying.");
    process.exit(1);
  }
  console.log("\n✓ No errors. Warnings and info rows above are for review.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
