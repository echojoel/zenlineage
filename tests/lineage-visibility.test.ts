import { describe, expect, it } from "vitest";
import { getSchoolContextNodeIds } from "../src/lib/lineage-visibility";

describe("lineage visibility", () => {
  const nodes = [
    { id: "buddha", schoolId: "indian" },
    { id: "mahakashyapa", schoolId: "indian" },
    { id: "prajnatara", schoolId: "indian" },
    { id: "bodhidharma", schoolId: "early-chan" },
    { id: "huike", schoolId: "early-chan" },
    { id: "linji", schoolId: "linji" },
  ];

  const edges = [
    { source: "buddha", target: "mahakashyapa", type: "primary" },
    { source: "mahakashyapa", target: "prajnatara", type: "primary" },
    { source: "prajnatara", target: "bodhidharma", type: "primary" },
    { source: "bodhidharma", target: "huike", type: "primary" },
    { source: "huike", target: "linji", type: "secondary" },
  ];

  it("returns all nodes when no school filter is active", () => {
    expect(getSchoolContextNodeIds(nodes, edges, "all")).toEqual(
      new Set(nodes.map((node) => node.id))
    );
  });

  it("keeps direct bridge figures visible across school boundaries", () => {
    expect(getSchoolContextNodeIds(nodes, edges, "indian")).toEqual(
      new Set(["buddha", "mahakashyapa", "prajnatara", "bodhidharma"])
    );
  });

  it("includes upstream context for the next school in the lineage", () => {
    expect(getSchoolContextNodeIds(nodes, edges, "early-chan")).toEqual(
      new Set(["prajnatara", "bodhidharma", "huike"])
    );
  });

  it("ignores non-primary edges when building school context", () => {
    expect(getSchoolContextNodeIds(nodes, edges, "linji")).toEqual(new Set(["linji"]));
  });
});
