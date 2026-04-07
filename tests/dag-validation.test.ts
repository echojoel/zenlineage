import { describe, it, expect } from "vitest";
import {
  detectCycles,
  detectSelfLoops,
  checkTemporalConsistency,
  checkDuplicatePrimary,
  detectOrphans,
  validateDAG,
  type TransmissionEdge,
  type MasterDates,
} from "@/lib/dag-validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shorthand to build a transmission edge. */
function edge(
  id: string,
  teacherId: string,
  studentId: string,
  opts: {
    type?: "primary" | "secondary" | "disputed";
    isPrimary?: boolean;
  } = {}
): TransmissionEdge {
  return {
    id,
    teacherId,
    studentId,
    type: opts.type ?? "primary",
    isPrimary: opts.isPrimary ?? false,
  };
}

/** Shorthand to build a MasterDates record. */
function master(
  id: string,
  opts: {
    birthYear?: number | null;
    birthPrecision?: string | null;
    birthConfidence?: string | null;
    deathYear?: number | null;
    deathPrecision?: string | null;
    deathConfidence?: string | null;
  } = {}
): MasterDates {
  return {
    id,
    birthYear: opts.birthYear ?? null,
    birthPrecision: opts.birthPrecision ?? null,
    birthConfidence: opts.birthConfidence ?? null,
    deathYear: opts.deathYear ?? null,
    deathPrecision: opts.deathPrecision ?? null,
    deathConfidence: opts.deathConfidence ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DAG Validation", () => {
  // -----------------------------------------------------------------------
  // 1. Valid DAG — linear chain of 5 masters
  // -----------------------------------------------------------------------
  describe("valid linear chain", () => {
    const edges: TransmissionEdge[] = [
      edge("e1", "A", "B", { isPrimary: true }),
      edge("e2", "B", "C", { isPrimary: true }),
      edge("e3", "C", "D", { isPrimary: true }),
      edge("e4", "D", "E", { isPrimary: true }),
    ];
    const masters_: MasterDates[] = [
      master("A", {
        birthYear: 600,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 670,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("B", {
        birthYear: 638,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 713,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("C", {
        birthYear: 680,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 740,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("D", {
        birthYear: 720,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 790,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("E", {
        birthYear: 760,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 835,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
    ];
    const ids = ["A", "B", "C", "D", "E"];

    it("should pass all checks", () => {
      const result = validateDAG(edges, masters_, ids);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // 2. Cycle detection — A -> B -> C -> A
  // -----------------------------------------------------------------------
  describe("cycle detection", () => {
    const edges: TransmissionEdge[] = [
      edge("e1", "A", "B"),
      edge("e2", "B", "C"),
      edge("e3", "C", "A"),
    ];

    it("should detect the cycle", () => {
      const issues = detectCycles(edges);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0]!.type).toBe("cycle");
    });

    it("should mark the result as invalid", () => {
      const result = validateDAG(edges, [], ["A", "B", "C"]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === "cycle")).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 3. Self-loop — A -> A
  // -----------------------------------------------------------------------
  describe("self-loop detection", () => {
    const edges: TransmissionEdge[] = [edge("e1", "A", "A")];

    it("should detect the self-loop", () => {
      const issues = detectSelfLoops(edges);
      expect(issues).toHaveLength(1);
      expect(issues[0]!.type).toBe("self_loop");
      expect(issues[0]!.entityIds).toContain("A");
    });

    it("should mark the result as invalid", () => {
      const result = validateDAG(edges, [], ["A"]);
      expect(result.valid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 4. Temporal review warning — teacher younger than student
  // -----------------------------------------------------------------------
  describe("temporal review warning — teacher younger than student", () => {
    const edges: TransmissionEdge[] = [edge("e1", "T", "S")];
    const masters_: MasterDates[] = [
      master("T", {
        birthYear: 900,
        birthPrecision: "exact",
        birthConfidence: "high",
        deathYear: 980,
        deathPrecision: "exact",
        deathConfidence: "high",
      }),
      master("S", {
        birthYear: 800,
        birthPrecision: "exact",
        birthConfidence: "high",
      }),
    ];

    it("should produce a temporal issue", () => {
      const issues = checkTemporalConsistency(edges, masters_);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0]!.type).toBe("temporal");
    });

    it("should be classified as a warning in validateDAG", () => {
      const result = validateDAG(edges, masters_, ["T", "S"]);
      expect(result.valid).toBe(true);
      expect(result.errors.filter((e) => e.type === "temporal")).toHaveLength(0);
      expect(result.warnings.some((w) => w.type === "temporal")).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 5. Temporal violation (soft) — insufficient overlap, low confidence
  // -----------------------------------------------------------------------
  describe("temporal violation — soft warning", () => {
    const edges: TransmissionEdge[] = [edge("e1", "T", "S")];
    const masters_: MasterDates[] = [
      master("T", {
        birthYear: 700,
        birthPrecision: "circa",
        birthConfidence: "low",
        deathYear: 760,
        deathPrecision: "circa",
        deathConfidence: "low",
      }),
      master("S", {
        birthYear: 755,
        birthPrecision: "circa",
        birthConfidence: "low",
      }),
    ];

    it("should produce a temporal issue", () => {
      const issues = checkTemporalConsistency(edges, masters_);
      // overlap = 760 - 755 = 5, which is < 10
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0]!.type).toBe("temporal");
    });

    it("should be classified as a warning (not error) because confidence is low", () => {
      const result = validateDAG(edges, masters_, ["T", "S"]);
      expect(result.valid).toBe(true); // warnings don't block
      expect(result.warnings.some((w) => w.type === "temporal")).toBe(true);
      expect(result.errors.filter((e) => e.type === "temporal")).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // 6. Duplicate primary — student with two isPrimary transmissions
  // -----------------------------------------------------------------------
  describe("duplicate primary detection", () => {
    const edges: TransmissionEdge[] = [
      edge("e1", "T1", "S", { isPrimary: true }),
      edge("e2", "T2", "S", { isPrimary: true }),
    ];

    it("should detect duplicate primary", () => {
      const issues = checkDuplicatePrimary(edges);
      expect(issues).toHaveLength(1);
      expect(issues[0]!.type).toBe("duplicate_primary");
      expect(issues[0]!.entityIds).toContain("S");
    });

    it("should mark result as invalid", () => {
      const result = validateDAG(edges, [], ["T1", "T2", "S"]);
      expect(result.valid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // 7. Orphan detection — master with no edges
  // -----------------------------------------------------------------------
  describe("orphan detection", () => {
    const edges: TransmissionEdge[] = [edge("e1", "A", "B")];

    it("should detect orphan master", () => {
      const issues = detectOrphans(["A", "B", "LONER"], edges);
      expect(issues).toHaveLength(1);
      expect(issues[0]!.type).toBe("orphan");
      expect(issues[0]!.entityIds).toContain("LONER");
    });

    it("should be a warning, not an error", () => {
      const result = validateDAG(edges, [], ["A", "B", "LONER"]);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.type === "orphan")).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 8. Complex valid DAG — master with multiple teachers (primary + secondary)
  // -----------------------------------------------------------------------
  describe("complex valid DAG", () => {
    // Lineage:
    //   A (600-670) -> B (638-713, primary)
    //   A           -> C (650-720, primary)
    //   B           -> D (690-760, primary)
    //   C           -> D (690-760, secondary)   <-- D has two teachers
    //   D           -> E (740-810, primary)
    const edges: TransmissionEdge[] = [
      edge("e1", "A", "B", { isPrimary: true }),
      edge("e2", "A", "C", { isPrimary: true }),
      edge("e3", "B", "D", { isPrimary: true }),
      edge("e4", "C", "D", { type: "secondary", isPrimary: false }),
      edge("e5", "D", "E", { isPrimary: true }),
    ];
    const masters_: MasterDates[] = [
      master("A", {
        birthYear: 600,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 670,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("B", {
        birthYear: 638,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 713,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("C", {
        birthYear: 650,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 720,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("D", {
        birthYear: 690,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 760,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
      master("E", {
        birthYear: 740,
        birthPrecision: "exact",
        birthConfidence: "certain",
        deathYear: 810,
        deathPrecision: "exact",
        deathConfidence: "certain",
      }),
    ];
    const ids = ["A", "B", "C", "D", "E"];

    it("should pass all checks with no errors or warnings", () => {
      const result = validateDAG(edges, masters_, ids);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should not flag D's secondary teacher as duplicate primary", () => {
      const issues = checkDuplicatePrimary(edges);
      expect(issues).toHaveLength(0);
    });

    it("should detect no cycles", () => {
      const issues = detectCycles(edges);
      expect(issues).toHaveLength(0);
    });
  });
});
