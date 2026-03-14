export interface LineageVisibilityNode {
  id: string;
  schoolId: string | null;
}

export interface LineageVisibilityEdge {
  source: string;
  target: string;
  type: string;
}

export function getSchoolContextNodeIds(
  nodes: LineageVisibilityNode[],
  edges: LineageVisibilityEdge[],
  schoolFilter: string,
): Set<string> {
  if (schoolFilter === "all") {
    return new Set(nodes.map((node) => node.id));
  }

  const selectedIds = new Set(
    nodes
      .filter((node) => node.schoolId === schoolFilter)
      .map((node) => node.id),
  );

  if (selectedIds.size === 0) {
    return selectedIds;
  }

  const visibleIds = new Set(selectedIds);
  for (const edge of edges) {
    if (edge.type !== "primary") {
      continue;
    }

    const sourceSelected = selectedIds.has(edge.source);
    const targetSelected = selectedIds.has(edge.target);

    if (sourceSelected && !targetSelected) {
      visibleIds.add(edge.target);
    }

    if (targetSelected && !sourceSelected) {
      visibleIds.add(edge.source);
    }
  }

  return visibleIds;
}
