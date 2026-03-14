"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { GraphData, GraphNode, GraphEdge, GraphSchool } from "@/app/api/graph/route";
import { getSchoolContextNodeIds } from "@/lib/lineage-visibility";

// ---------------------------------------------------------------------------
// School colour palette (keyed by partial slug match)
// ---------------------------------------------------------------------------

const SCHOOL_COLORS: [string, number][] = [
  ["rinzai", 0x5a7a5a],
  ["linji", 0x5a7a5a],
  ["caodong", 0x8b6b4a],
  ["soto", 0x8b6b4a],
  ["obaku", 0x7a8b6a],
  ["yunmen", 0xa07040],
  ["fayan", 0x6a7a8b],
  ["huayan", 0x7a6a8b],
  ["guiyang", 0x8b7a5a],
];

function schoolColor(schoolSlug: string | null): number {
  if (!schoolSlug) return 0x9a8a75;
  const key = schoolSlug.toLowerCase().replace(/[^a-z]/g, "");
  for (const [prefix, color] of SCHOOL_COLORS) {
    if (key.includes(prefix)) return color;
  }
  return 0x9a8a75;
}

// ---------------------------------------------------------------------------
// Date display helper
// ---------------------------------------------------------------------------

function formatDate(year: number | null): string {
  if (!year) return "?";
  return String(year);
}

// ---------------------------------------------------------------------------
// Simple BFS-layering layout fallback
// ---------------------------------------------------------------------------

function simpleLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const nodeSet = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    children.set(n.id, []);
  }
  for (const e of edges) {
    if (!nodeSet.has(e.source) || !nodeSet.has(e.target)) continue;
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    children.get(e.source)?.push(e.target);
  }

  const layers = new Map<string, number>();
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id);
      layers.set(id, 0);
    }
  }

  let qi = 0;
  while (qi < queue.length) {
    const id = queue[qi++];
    const layer = layers.get(id) ?? 0;
    for (const child of children.get(id) ?? []) {
      const existing = layers.get(child) ?? -1;
      if (layer + 1 > existing) {
        layers.set(child, layer + 1);
        queue.push(child);
      }
    }
  }

  // Any node not reached: assign layer 0
  for (const n of nodes) {
    if (!layers.has(n.id)) layers.set(n.id, 0);
  }

  const byLayer = new Map<number, string[]>();
  for (const n of nodes) {
    const layer = layers.get(n.id) ?? 0;
    const arr = byLayer.get(layer) ?? [];
    arr.push(n.id);
    byLayer.set(layer, arr);
  }

  const LAYER_H = 110;
  const NODE_W = 150;

  for (const [layer, ids] of byLayer) {
    const y = layer * LAYER_H;
    const totalW = ids.length * NODE_W;
    ids.forEach((id, i) => {
      const x = -totalW / 2 + i * NODE_W + NODE_W / 2;
      positions.set(id, { x, y });
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Component types
// ---------------------------------------------------------------------------

interface TooltipState {
  x: number;
  y: number;
  node: GraphNode;
  schoolName?: string;
}

interface SidebarState {
  node: GraphNode;
  schoolName?: string;
}

interface PixiState {
  app: import("pixi.js").Application;
  stage: import("pixi.js").Container;
  nodeContainers: Map<string, import("pixi.js").Container>;
  edgeGraphics: import("pixi.js").Graphics;
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, { x: number; y: number }>;
  highlighted: Set<string> | null;
  schoolFilter: string;
  timeMax: number;
  showOrphans: boolean;
  orphanSet: Set<string>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LineageGraph() {
  const searchParams = useSearchParams();
  const focusSlug = searchParams.get("focus") ?? "";
  const schoolSlug = searchParams.get("school") ?? "";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [sidebar, setSidebar] = useState<SidebarState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [showOrphans, setShowOrphans] = useState(false);
  const [timeMax, setTimeMax] = useState(2000);
  const [dataMaxYear, setDataMaxYear] = useState(2000);
  const [schoolList, setSchoolList] = useState<GraphSchool[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const pixiRef = useRef<PixiState | null>(null);
  const fuseRef = useRef<import("fuse.js").default<GraphNode> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // ---------------------------------------------------------------------------
  // Redraw — updates node/edge visibility and alpha
  // ---------------------------------------------------------------------------

  const redraw = useCallback(() => {
    const pixi = pixiRef.current;
    if (!pixi) return;

    const { nodeContainers, edgeGraphics, edges, positions } = pixi;
    const nodeById = new Map(pixi.nodes.map((node) => [node.id, node]));
    const schoolContextIds = getSchoolContextNodeIds(pixi.nodes, pixi.edges, pixi.schoolFilter);

    const visible = new Set<string>();
    for (const [id] of nodeContainers) {
      const node = nodeById.get(id);
      if (!node) continue;
      if (!pixi.showOrphans && pixi.orphanSet.has(id)) continue;
      if (!schoolContextIds.has(id)) continue;
      const yearOk = node.deathYear == null || node.deathYear <= pixi.timeMax;
      if (!yearOk) continue;
      visible.add(id);
    }

    for (const [id, container] of nodeContainers) {
      const isVisible = visible.has(id);
      const node = nodeById.get(id);
      const isHighlighted = pixi.highlighted == null || pixi.highlighted.has(id);
      const isBridgeNode = pixi.schoolFilter !== "all" && node?.schoolId !== pixi.schoolFilter;
      container.visible = isVisible;
      const baseAlpha = isBridgeNode ? 0.45 : 1;
      container.alpha = isHighlighted ? baseAlpha : baseAlpha * 0.3;
    }

    edgeGraphics.clear();
    for (const edge of edges) {
      const src = positions.get(edge.source);
      const tgt = positions.get(edge.target);
      if (!src || !tgt) continue;
      if (!visible.has(edge.source) || !visible.has(edge.target)) continue;

      const highlighted =
        pixi.highlighted == null ||
        (pixi.highlighted.has(edge.source) && pixi.highlighted.has(edge.target));
      const edgeTouchesBridge =
        pixi.schoolFilter !== "all" &&
        ((nodeById.get(edge.source)?.schoolId ?? null) !== pixi.schoolFilter ||
          (nodeById.get(edge.target)?.schoolId ?? null) !== pixi.schoolFilter);
      const baseAlpha = edgeTouchesBridge ? 0.35 : 0.7;
      const alpha = highlighted ? baseAlpha : baseAlpha * 0.2;

      if (edge.type === "primary") {
        edgeGraphics.setStrokeStyle({ width: 1.5, color: 0x7a6a55, alpha });
      } else if (edge.type === "secondary") {
        edgeGraphics.setStrokeStyle({ width: 0.8, color: 0x9a8a75, alpha });
      } else {
        // disputed
        edgeGraphics.setStrokeStyle({ width: 0.8, color: 0xb09070, alpha });
      }

      edgeGraphics.moveTo(src.x, src.y);
      edgeGraphics.lineTo(tgt.x, tgt.y);
      edgeGraphics.stroke();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Init (runs once on mount)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let destroyed = false;
    const initialFocusSlug = searchParams.get("focus") || null;
    const initialSchoolSlug = searchParams.get("school") || null;

    async function init() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Fetch graph data
      let data: GraphData;
      try {
        const res = await fetch("/api/graph");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (e) {
        console.error("Failed to fetch graph:", e);
        if (!destroyed) setStatus("error");
        return;
      }
      if (destroyed) return;

      const { nodes, edges, schools } = data;
      setSchoolList(schools.sort((a, b) => a.name.localeCompare(b.name)));

      const schoolBySlug = new Map(schools.map((school) => [school.slug, school]));
      if (initialSchoolSlug) {
        const selected = schoolBySlug.get(initialSchoolSlug);
        if (selected) {
          setSelectedSchool(selected.id);
        }
      }

      // Identify orphan nodes (no edges at all)
      const connectedIds = new Set<string>();
      for (const e of edges) {
        connectedIds.add(e.source);
        connectedIds.add(e.target);
      }
      const orphanSet = new Set(nodes.filter((n) => !connectedIds.has(n.id)).map((n) => n.id));

      // Time range from data
      const years = nodes.map((n) => n.deathYear).filter((y): y is number => y != null);
      const maxYear = years.length > 0 ? Math.max(...years) : 2000;
      setDataMaxYear(maxYear);
      setTimeMax(maxYear);

      // Load Fuse.js
      const Fuse = (await import("fuse.js")).default;
      fuseRef.current = new Fuse(nodes, {
        keys: ["label", "searchText"],
        threshold: 0.3,
        distance: 100,
      });

      // ---------------------------------------------------------------------------
      // Layout: d3-dag sugiyama on connected nodes, simpleLayout for orphans
      // ---------------------------------------------------------------------------
      const connectedNodes = nodes.filter((n) => connectedIds.has(n.id));
      const nodeSet = new Set(nodes.map((n) => n.id));
      const validEdges = edges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target));
      // Only primary edges for sugiyama (cleaner hierarchy)
      const primaryEdges = validEdges.filter((e) => e.type === "primary");

      let connectedPositions: Map<string, { x: number; y: number }>;

      try {
        const { graphConnect, sugiyama } = await import("d3-dag");

        // Build pairs of [sourceId, targetId] strings
        const edgePairs: [string, string][] = primaryEdges.map((e) => [e.source, e.target]);

        // Default graphConnect already handles [string, string] arrays
        // node.data IS the string ID (not tuple) — this is the d3-dag v1 contract
        const connect = graphConnect();
        const graph = connect(edgePairs);

        const layout = sugiyama().nodeSize([120, 70] as [number, number]);
        layout(graph as Parameters<typeof layout>[0]);

        connectedPositions = new Map();
        for (const node of graph.nodes()) {
          // node.data is the string ID
          const id = node.data as string;
          connectedPositions.set(id, {
            x: (node as { x: number; y: number }).x,
            y: (node as { x: number; y: number }).y,
          });
        }
      } catch (err) {
        console.warn("d3-dag layout failed, using fallback:", err);
        // Fallback: BFS layout for connected nodes
        connectedPositions = simpleLayout(connectedNodes, primaryEdges);
      }

      // Scale up connected positions for readability
      const scaledConnected = new Map<string, { x: number; y: number }>();
      for (const [id, pos] of connectedPositions) {
        scaledConnected.set(id, { x: pos.x * 1.5, y: pos.y * 1.5 });
      }

      // Layout orphan nodes separately, place far below connected graph
      const orphanNodes = nodes.filter((n) => orphanSet.has(n.id));
      let orphanPositions = new Map<string, { x: number; y: number }>();
      if (orphanNodes.length > 0) {
        orphanPositions = simpleLayout(orphanNodes, []);
        // Place orphans below the connected graph
        const connYs = Array.from(scaledConnected.values()).map((p) => p.y);
        const maxConnY = connYs.length > 0 ? Math.max(...connYs) : 0;
        for (const [id, pos] of orphanPositions) {
          orphanPositions.set(id, { x: pos.x, y: pos.y + maxConnY + 300 });
        }
      }

      // Merge all positions
      const positions = new Map<string, { x: number; y: number }>([
        ...scaledConnected,
        ...orphanPositions,
      ]);

      // Ensure every node has a position
      for (const n of nodes) {
        if (!positions.has(n.id)) {
          positions.set(n.id, { x: 0, y: 0 });
        }
      }

      if (destroyed) return;

      // ---------------------------------------------------------------------------
      // Init PixiJS v8
      // ---------------------------------------------------------------------------
      const PIXI = await import("pixi.js");
      if (destroyed) return;

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      const app = new PIXI.Application();
      await app.init({
        canvas,
        width: w,
        height: h,
        backgroundColor: 0xfaf9f7,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio ?? 1,
      });

      if (destroyed) {
        app.destroy();
        return;
      }

      app.stage.eventMode = "static";
      const stage = new PIXI.Container();
      stage.eventMode = "static";
      app.stage.addChild(stage);
      stage.position.set(w / 2, h / 2);

      // Edges layer (drawn first, below nodes — no pointer events)
      const edgeGraphics = new PIXI.Graphics();
      edgeGraphics.eventMode = "none";
      stage.addChild(edgeGraphics);

      // Node containers
      const nodeContainers = new Map<string, import("pixi.js").Container>();

      for (const node of nodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const c = new PIXI.Container();
        c.position.set(pos.x, pos.y);
        c.eventMode = "static";
        c.cursor = "pointer";

        const color = schoolColor(node.schoolSlug ?? node.schoolName ?? null);

        // Circle
        const circle = new PIXI.Graphics();
        circle.circle(0, 0, 6);
        circle.fill({ color, alpha: 0.9 });
        circle.circle(0, 0, 6);
        circle.stroke({ width: 1, color: 0xfaf9f7, alpha: 0.5 });
        c.addChild(circle);

        // Label
        const shortLabel = node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label;
        const label = new PIXI.Text({
          text: shortLabel,
          style: new PIXI.TextStyle({
            fontSize: 9,
            fill: 0x3d3530,
            fontFamily: "Georgia, serif",
          }),
        });
        label.anchor.set(0.5, -0.6);
        c.addChild(label);

        // Larger invisible hit area so nodes are clickable even when zoomed out
        const hitArea = new PIXI.Graphics();
        hitArea.circle(0, 0, 20);
        hitArea.fill({ color: 0xffffff, alpha: 0 });
        c.addChildAt(hitArea, 0); // behind circle and label

        // Hover
        c.on("pointerover", (e: import("pixi.js").FederatedPointerEvent) => {
          const rect = canvas.getBoundingClientRect();
          setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            node,
            schoolName: node.schoolName ?? undefined,
          });
        });
        c.on("pointerout", () => setTooltip(null));

        // Click → sidebar
        c.on("pointerdown", () => {
          setSidebar({
            node,
            schoolName: node.schoolName ?? undefined,
          });
        });

        stage.addChild(c);
        nodeContainers.set(node.id, c);
      }

      pixiRef.current = {
        app,
        stage,
        nodeContainers,
        edgeGraphics,
        nodes,
        edges,
        positions,
        highlighted: null,
        schoolFilter: "all",
        timeMax: maxYear,
        showOrphans: false,
        orphanSet,
      };

      // Initial draw
      redraw();

      // ---------------------------------------------------------------------------
      // d3-zoom
      // ---------------------------------------------------------------------------
      const zoom = d3
        .zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.02, 12])
        .on("zoom", (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
          const { x, y, k } = event.transform;
          stage.position.set(x, y);
          stage.scale.set(k);
        });

      d3.select(canvas).call(zoom);
      zoomRef.current = zoom;

      let initialTransform;

      if (initialFocusSlug) {
        const focusedNode = nodes.find((node) => node.slug === initialFocusSlug);
        const focusedPosition = focusedNode ? positions.get(focusedNode.id) : null;
        if (focusedNode && focusedPosition) {
          if (orphanSet.has(focusedNode.id)) {
            setShowOrphans(true);
          }
          setSidebar({
            node: focusedNode,
            schoolName: focusedNode.schoolName ?? undefined,
          });

          const focusScale = 1.6;
          initialTransform = d3.zoomIdentity
            .translate(
              w / 2 - focusScale * focusedPosition.x,
              h / 2 - focusScale * focusedPosition.y
            )
            .scale(focusScale);
        }
      }

      if (!initialTransform) {
        // Find Shakyamuni Buddha or fallback to root nodes
        const rootNode =
          nodes.find((n) => n.slug === "shakyamuni-buddha") ||
          nodes.find((n) => connectedIds.has(n.id));
        const rootPos = rootNode ? positions.get(rootNode.id) : null;

        if (rootPos) {
          // Focus tightly on the root with a readable scale
          const focusScale = 1.2;
          // Offset slightly down so the descendants are visible below the root
          initialTransform = d3.zoomIdentity
            .translate(w / 2 - focusScale * rootPos.x, h / 4 - focusScale * rootPos.y)
            .scale(focusScale);
        } else {
          // Absolute fallback if graph is completely empty/disconnected
          const fitPositions = Array.from(scaledConnected.values());
          if (fitPositions.length === 0) {
            fitPositions.push(...positions.values());
          }

          if (fitPositions.length > 0) {
            const xs = fitPositions.map((p) => p.x);
            const ys = fitPositions.map((p) => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const gw = maxX - minX + 240;
            const gh = maxY - minY + 240;
            const k = Math.min(w / gw, h / gh, 2) * 0.85;
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            initialTransform = d3.zoomIdentity.translate(w / 2 - k * cx, h / 2 - k * cy).scale(k);
          } else {
            initialTransform = d3.zoomIdentity;
          }
        }
      }

      if (initialTransform) {
        if (!prefersReducedMotion) {
          d3.select(canvas).transition().duration(700).call(zoom.transform, initialTransform);
        } else {
          d3.select(canvas).call(zoom.transform, initialTransform);
        }
      }

      if (!destroyed) setStatus("ready");
    }

    init();

    const canvasEl = canvasRef.current;
    return () => {
      destroyed = true;
      if (zoomRef.current && canvasEl) {
        d3.select(canvasEl).on(".zoom", null);
      }
      pixiRef.current?.app.destroy();
      pixiRef.current = null;
      zoomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle focusSlug changes without re-initializing the whole graph
  useEffect(() => {
    if (status !== "ready" || !pixiRef.current || !zoomRef.current || !canvasRef.current) return;

    if (focusSlug) {
      const pixi = pixiRef.current;
      const focusedNode = pixi.nodes.find((node) => node.slug === focusSlug);
      const focusedPosition = focusedNode ? pixi.positions.get(focusedNode.id) : null;

      if (focusedNode && focusedPosition) {
        if (pixi.orphanSet.has(focusedNode.id)) {
          setShowOrphans(true);
        }
        setSidebar({
          node: focusedNode,
          schoolName: focusedNode.schoolName ?? undefined,
        });

        const canvas = canvasRef.current;
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        const focusScale = 1.6;
        const tx = w / 2 - focusScale * focusedPosition.x;
        const ty = h / 2 - focusScale * focusedPosition.y;

        if (!prefersReducedMotion) {
          d3.select(canvas)
            .transition()
            .duration(500)
            .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(focusScale));
        } else {
          d3.select(canvas).call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(tx, ty).scale(focusScale)
          );
        }
      }
    }
  }, [focusSlug, status, prefersReducedMotion]);

  // Handle schoolSlug changes without re-initializing the whole graph
  useEffect(() => {
    if (status !== "ready" || schoolList.length === 0) return;

    if (schoolSlug) {
      const schoolBySlug = new Map(schoolList.map((school) => [school.slug, school]));
      const selected = schoolBySlug.get(schoolSlug);
      if (selected) {
        setSelectedSchool(selected.id);
      }
    } else {
      setSelectedSchool("all");
    }
  }, [schoolSlug, status, schoolList]);

  // Sync state → pixi ref → redraw
  useEffect(() => {
    if (!pixiRef.current) return;
    pixiRef.current.showOrphans = showOrphans;
    redraw();
  }, [showOrphans, redraw]);

  useEffect(() => {
    if (!pixiRef.current) return;
    pixiRef.current.schoolFilter = selectedSchool;
    redraw();

    const pixi = pixiRef.current;
    if (canvasRef.current && zoomRef.current) {
      const schoolContextIds = getSchoolContextNodeIds(pixi.nodes, pixi.edges, selectedSchool);
      const visibleNodes = pixi.nodes.filter((n) => {
        if (!schoolContextIds.has(n.id)) return false;
        if (!pixi.showOrphans && pixi.orphanSet.has(n.id)) return false;
        return true;
      });

      if (visibleNodes.length > 0) {
        const positions = visibleNodes
          .map((n) => pixi.positions.get(n.id))
          .filter((p): p is { x: number; y: number } => !!p);
        if (positions.length > 0) {
          const xs = positions.map((p) => p.x);
          const ys = positions.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const canvas = canvasRef.current;
          const w = canvas.clientWidth || window.innerWidth;
          const h = canvas.clientHeight || window.innerHeight;
          const gw = maxX - minX + 240;
          const gh = maxY - minY + 240;
          const k = Math.min(w / gw, h / gh, 2) * 0.85;
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const tx = w / 2 - k * cx;
          const ty = h / 2 - k * cy;

          if (!prefersReducedMotion) {
            d3.select(canvas)
              .transition()
              .duration(700)
              .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
          } else {
            d3.select(canvas).call(
              zoomRef.current.transform,
              d3.zoomIdentity.translate(tx, ty).scale(k)
            );
          }
        }
      }
    }
  }, [selectedSchool, redraw, prefersReducedMotion]);

  useEffect(() => {
    if (!pixiRef.current) return;
    pixiRef.current.timeMax = timeMax;
    redraw();
  }, [timeMax, redraw]);

  useEffect(() => {
    if (!pixiRef.current) return;
    if (!searchQuery.trim() || !fuseRef.current) {
      pixiRef.current.highlighted = null;
    } else {
      const results = fuseRef.current.search(searchQuery);
      const baseHighlighted = new Set(results.map((r) => r.item.id));
      const extendedHighlighted = new Set(baseHighlighted);

      for (const edge of pixiRef.current.edges) {
        if (baseHighlighted.has(edge.source)) {
          extendedHighlighted.add(edge.target);
        }
        if (baseHighlighted.has(edge.target)) {
          extendedHighlighted.add(edge.source);
        }
      }

      pixiRef.current.highlighted = extendedHighlighted;

      if (results.length > 0 && canvasRef.current && zoomRef.current) {
        const topResult = results[0].item;
        const pos = pixiRef.current.positions.get(topResult.id);
        if (pos) {
          const canvas = canvasRef.current;
          const w = canvas.clientWidth || window.innerWidth;
          const h = canvas.clientHeight || window.innerHeight;
          const focusScale = 1.6;
          const tx = w / 2 - focusScale * pos.x;
          const ty = h / 2 - focusScale * pos.y;

          if (!prefersReducedMotion) {
            d3.select(canvas)
              .transition()
              .duration(500)
              .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(focusScale));
          } else {
            d3.select(canvas).call(
              zoomRef.current.transform,
              d3.zoomIdentity.translate(tx, ty).scale(focusScale)
            );
          }
        }
      }
    }
    redraw();
  }, [searchQuery, redraw, prefersReducedMotion]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="lineage-wrapper" ref={containerRef}>
      {/* Controls */}
      <div className="lineage-controls">
        <input
          type="text"
          id="lineage-search"
          name="lineage-search"
          className="lineage-search"
          placeholder="Search masters…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          id="lineage-school"
          name="lineage-school"
          className="lineage-select"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="all">All schools</option>
          {schoolList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label className="lineage-toggle" htmlFor="lineage-orphans">
          <input
            id="lineage-orphans"
            name="lineage-orphans"
            type="checkbox"
            checked={showOrphans}
            onChange={(e) => setShowOrphans(e.target.checked)}
          />
          Show unconnected
        </label>
      </div>

      {/* Time scrubber */}
      <div className="lineage-scrubber">
        <span className="scrubber-label">Before</span>
        <input
          type="range"
          id="lineage-time"
          name="lineage-time"
          min={0}
          max={dataMaxYear}
          step={10}
          value={timeMax}
          onChange={(e) => setTimeMax(Number(e.target.value))}
        />
        <span className="scrubber-value">{timeMax === dataMaxYear ? "Now" : timeMax}</span>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="lineage-canvas" />

      {/* Loading / error */}
      {status === "loading" && <div className="lineage-loading">Loading lineage…</div>}
      {status === "error" && <div className="lineage-loading">Failed to load graph data.</div>}

      {/* Tooltip */}
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}>
          <div className="tooltip-name">{tooltip.node.label}</div>
          {(tooltip.node.birthYear || tooltip.node.deathYear) && (
            <div className="tooltip-dates">
              {formatDate(tooltip.node.birthYear)} – {formatDate(tooltip.node.deathYear)}
            </div>
          )}
          {tooltip.schoolName && <div className="tooltip-school">{tooltip.schoolName}</div>}
        </div>
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside className="sidebar">
          <button className="sidebar-close" onClick={() => setSidebar(null)} aria-label="Close">
            ✕
          </button>
          {sidebar.node.imageSrc && (
            <div className="sidebar-image-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sidebar.node.imageSrc}
                alt={sidebar.node.imageAlt ?? sidebar.node.label}
                className="sidebar-image"
              />
            </div>
          )}
          <h2 className="sidebar-name">{sidebar.node.label}</h2>
          {sidebar.schoolName && <p className="sidebar-school">{sidebar.schoolName}</p>}
          {(sidebar.node.birthYear || sidebar.node.deathYear) && (
            <p className="sidebar-dates">
              {formatDate(sidebar.node.birthYear)} – {formatDate(sidebar.node.deathYear)}
            </p>
          )}
          {sidebar.node.bio && <p className="sidebar-description">{sidebar.node.bio}</p>}
          <div className="sidebar-actions">
            <Link className="sidebar-link" href={`/masters/${sidebar.node.slug}`}>
              Open profile
            </Link>
            {sidebar.node.schoolSlug && (
              <Link className="sidebar-link" href={`/schools/${sidebar.node.schoolSlug}`}>
                Open school
              </Link>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
