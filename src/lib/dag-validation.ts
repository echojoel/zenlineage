// ---------------------------------------------------------------------------
// DAG Validation Library
// ---------------------------------------------------------------------------
// Validates the Zen lineage graph (a directed acyclic graph of
// teacher -> student dharma transmissions) against structural,
// temporal, and cardinality rules.
// ---------------------------------------------------------------------------

// -------------------------------- Types ------------------------------------

export interface TransmissionEdge {
  id: string;
  studentId: string;
  teacherId: string;
  type: "primary" | "secondary" | "disputed";
  isPrimary: boolean;
}

export interface MasterDates {
  id: string;
  birthYear: number | null;
  birthPrecision: string | null;
  birthConfidence: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
  deathConfidence: string | null;
}

export interface ValidationIssue {
  type: "cycle" | "self_loop" | "temporal" | "duplicate_primary" | "orphan";
  message: string;
  entityIds: string[];
}

interface ValidationIssueInternal extends ValidationIssue {
  _warning?: boolean;
}

export interface ValidationResult {
  valid: boolean; // true if no errors (warnings are OK)
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

// ------------------------------ Helpers -----------------------------------

/**
 * Build an adjacency list from transmission edges (teacher -> student).
 */
function buildAdjacencyList(edges: TransmissionEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.teacherId)) adj.set(edge.teacherId, []);
    adj.get(edge.teacherId)!.push(edge.studentId);
  }
  return adj;
}

/**
 * Collect all unique node IDs that appear in the edge set.
 */
function collectNodeIds(edges: TransmissionEdge[]): Set<string> {
  const ids = new Set<string>();
  for (const edge of edges) {
    ids.add(edge.teacherId);
    ids.add(edge.studentId);
  }
  return ids;
}

// ----------------------------- Validators ---------------------------------

/**
 * Detect cycles using iterative DFS with explicit WHITE / GRAY / BLACK
 * colouring.  Returns one ValidationIssue per back-edge found.
 */
export function detectCycles(edges: TransmissionEdge[]): ValidationIssue[] {
  const adj = buildAdjacencyList(edges);
  const nodes = collectNodeIds(edges);

  const WHITE = 0; // unvisited
  const GRAY = 1; // in current DFS path
  const BLACK = 2; // fully processed

  const colour = new Map<string, number>();
  for (const n of nodes) colour.set(n, WHITE);

  // parent map so we can reconstruct the cycle path
  const parent = new Map<string, string | null>();

  const issues: ValidationIssue[] = [];

  for (const start of nodes) {
    if (colour.get(start) !== WHITE) continue;

    const stack: string[] = [start];
    parent.set(start, null);

    while (stack.length > 0) {
      const node = stack[stack.length - 1]!;

      if (colour.get(node) === WHITE) {
        colour.set(node, GRAY);
        const neighbours = adj.get(node) ?? [];
        for (const neighbour of neighbours) {
          const nc = colour.get(neighbour) ?? WHITE;
          if (nc === WHITE) {
            parent.set(neighbour, node);
            stack.push(neighbour);
          } else if (nc === GRAY) {
            // back-edge => cycle.  Reconstruct cycle path.
            const cyclePath: string[] = [neighbour, node];
            let cur = node;
            while (cur !== neighbour) {
              cur = parent.get(cur)!;
              if (cur === null) break;
              cyclePath.push(cur);
            }
            issues.push({
              type: "cycle",
              message: `Cycle detected involving nodes: ${cyclePath.join(" -> ")}`,
              entityIds: [...new Set(cyclePath)],
            });
          }
        }
      } else {
        colour.set(node, BLACK);
        stack.pop();
      }
    }
  }

  return issues;
}

/**
 * Detect self-loops (student_id === teacher_id).
 */
export function detectSelfLoops(edges: TransmissionEdge[]): ValidationIssue[] {
  return edges
    .filter((e) => e.studentId === e.teacherId)
    .map((e) => ({
      type: "self_loop" as const,
      message: `Self-loop: transmission ${e.id} has student_id === teacher_id (${e.studentId})`,
      entityIds: [e.id, e.studentId],
    }));
}

/**
 * Check temporal consistency of each transmission edge.
 *
 * Rules (only checked when both endpoints have dates with precision >= circa):
 *   (a) teacher.birthYear < student.birthYear
 *   (b) lifespans overlap by >= 10 years (teacher.deathYear - student.birthYear >= 10)
 *
 * A violation is an *error* when both relevant confidences are "certain" or
 * "probable" (i.e. high confidence), otherwise a *warning*.
 */
export function checkTemporalConsistency(
  edges: TransmissionEdge[],
  masters: MasterDates[]
): ValidationIssue[] {
  const mastersById = new Map<string, MasterDates>();
  for (const m of masters) mastersById.set(m.id, m);

  const USABLE_PRECISIONS = new Set(["exact", "circa"]);
  const HIGH_CONFIDENCE = new Set(["certain", "probable"]);

  const issues: ValidationIssueInternal[] = [];

  for (const edge of edges) {
    const teacher = mastersById.get(edge.teacherId);
    const student = mastersById.get(edge.studentId);
    if (!teacher || !student) continue;

    // Both must have birth years with usable precision
    const teacherBirthUsable =
      teacher.birthYear !== null && USABLE_PRECISIONS.has(teacher.birthPrecision ?? "");
    const studentBirthUsable =
      student.birthYear !== null && USABLE_PRECISIONS.has(student.birthPrecision ?? "");

    if (!teacherBirthUsable || !studentBirthUsable) continue;

    const bothBirthHighConf =
      HIGH_CONFIDENCE.has(teacher.birthConfidence ?? "") &&
      HIGH_CONFIDENCE.has(student.birthConfidence ?? "");

    // (a) Teacher born before student
    if (teacher.birthYear! >= student.birthYear!) {
      issues.push({
        type: "temporal",
        message: `Teacher (${edge.teacherId}, born ${teacher.birthYear}) born after or same year as student (${edge.studentId}, born ${student.birthYear})`,
        entityIds: [edge.id, edge.teacherId, edge.studentId],
      });
      // Mark as error only when high confidence
      if (!bothBirthHighConf) {
        issues[issues.length - 1]._warning = true;
      }
    }

    // (b) Lifespan overlap check — requires teacher death year
    const teacherDeathUsable =
      teacher.deathYear !== null && USABLE_PRECISIONS.has(teacher.deathPrecision ?? "");

    if (teacherDeathUsable) {
      const overlap = teacher.deathYear! - student.birthYear!;
      if (overlap < 10) {
        const highConf = bothBirthHighConf && HIGH_CONFIDENCE.has(teacher.deathConfidence ?? "");
        issues.push({
          type: "temporal",
          message: `Insufficient lifespan overlap (${overlap} years) between teacher ${edge.teacherId} (d. ${teacher.deathYear}) and student ${edge.studentId} (b. ${student.birthYear}); need >= 10`,
          entityIds: [edge.id, edge.teacherId, edge.studentId],
        });
        if (!highConf) {
          issues[issues.length - 1]._warning = true;
        }
      }
    }
  }

  return issues;
}

/**
 * Check that no master has more than one `isPrimary = true` incoming
 * transmission.
 */
export function checkDuplicatePrimary(edges: TransmissionEdge[]): ValidationIssue[] {
  // Group primary edges by student
  const primaryByStudent = new Map<string, TransmissionEdge[]>();
  for (const edge of edges) {
    if (!edge.isPrimary) continue;
    if (!primaryByStudent.has(edge.studentId)) {
      primaryByStudent.set(edge.studentId, []);
    }
    primaryByStudent.get(edge.studentId)!.push(edge);
  }

  const issues: ValidationIssue[] = [];
  for (const [studentId, primaries] of primaryByStudent) {
    if (primaries.length > 1) {
      issues.push({
        type: "duplicate_primary",
        message: `Student ${studentId} has ${primaries.length} primary transmissions (expected at most 1)`,
        entityIds: [studentId, ...primaries.map((e) => e.id)],
      });
    }
  }

  return issues;
}

/**
 * Detect orphan masters — masters that have no incoming or outgoing edges.
 * These are warnings, not errors.
 */
export function detectOrphans(masterIds: string[], edges: TransmissionEdge[]): ValidationIssue[] {
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.teacherId);
    connected.add(edge.studentId);
  }

  return masterIds
    .filter((id) => !connected.has(id))
    .map((id) => ({
      type: "orphan" as const,
      message: `Master ${id} has no incoming or outgoing transmission edges`,
      entityIds: [id],
    }));
}

// ------------------------------ Aggregate ---------------------------------

/**
 * Run all validations and return a consolidated result.
 */
export function validateDAG(
  edges: TransmissionEdge[],
  masters: MasterDates[],
  masterIds: string[]
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Self-loops — always errors
  errors.push(...detectSelfLoops(edges));

  // Cycles — always errors
  errors.push(...detectCycles(edges));

  // Temporal — errors when high confidence, warnings otherwise
  const temporalIssues = checkTemporalConsistency(edges, masters) as ValidationIssueInternal[];
  for (const issue of temporalIssues) {
    if (issue._warning) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _warning: _, ...clean } = issue;
      warnings.push(clean);
    } else {
      errors.push(issue);
    }
  }

  // Duplicate primary — always errors
  errors.push(...checkDuplicatePrimary(edges));

  // Orphans — always warnings
  warnings.push(...detectOrphans(masterIds, edges));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
