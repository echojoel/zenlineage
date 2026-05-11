"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { GraphData, GraphNode, GraphEdge, GraphSchool } from "@/lib/graph-types";
import { getSchoolContextNodeIds } from "@/lib/lineage-visibility";
import { formatDateWithPrecision } from "@/lib/date-format";

// ---------------------------------------------------------------------------
// School colour palette (keyed by partial slug match)
// ---------------------------------------------------------------------------

const SCHOOL_COLORS: [string, number][] = [
  // Specific prefixes before general ones (schoolColor uses includes())
  ["earlychan", 0x7a8a70],   // sage green
  ["indianpatriarchs", 0x8b7a55], // antique gold
  ["qingyuan", 0x5a7a7a],    // teal
  ["nanyue", 0x6a7a5a],      // dark moss
  ["yangqi", 0x5a8a5a],      // brighter moss
  ["rinzai", 0x5a7a5a],      // moss green
  ["linji", 0x5a7a5a],       // moss green
  ["caodong", 0x8b6b4a],     // rust brown
  ["soto", 0x8b6b4a],        // rust brown
  ["obaku", 0x7a8b6a],       // olive
  ["yunmen", 0xa07040],       // burnt orange
  ["fayan", 0x6a7a8b],       // slate blue
  ["huayan", 0x7a6a8b],      // mauve
  ["guiyang", 0x8b7a5a],     // tan
  ["chan", 0x7a8a70],         // sage green (after earlychan)
  ["lamte", 0x7a6a6a],       // dusty rose-brown
  ["truclam", 0x7a7a6a],     // warm khaki
  ["plumvillage", 0x8a6a7a],  // muted plum
  ["thien", 0x7a7060],       // warm stone
  ["jogye", 0x607a80],       // steel blue
  ["kwanum", 0x5a7080],      // dark steel
  ["taego", 0x6a7a70],       // grey-sage
  ["seon", 0x6a7080],        // cool grey-blue
  ["sanbozen", 0x7a6a8b],    // mauve
];

function schoolColor(schoolSlug: string | null): number {
  if (!schoolSlug) return 0x9a8a75;
  const key = schoolSlug.toLowerCase().replace(/[^a-z]/g, "");
  for (const [prefix, color] of SCHOOL_COLORS) {
    if (key.includes(prefix)) return color;
  }
  return 0x9a8a75;
}

function drawDashedLine(
  g: import("pixi.js").Graphics,
  x1: number, y1: number, x2: number, y2: number,
  dash = 6, gap = 4,
): void {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;
  const nx = dx / len, ny = dy / len;
  let d = 0;
  while (d < len) {
    const segEnd = Math.min(d + dash, len);
    g.moveTo(x1 + nx * d, y1 + ny * d);
    g.lineTo(x1 + nx * segEnd, y1 + ny * segEnd);
    d += dash + gap;
  }
}

// Tight on/off pattern used for disputed transmissions and editorial
// `dharma` bridges (where the literal immediate teacher isn't in the
// DB yet and the edge connects to the nearest seeded lineage ancestor).
function drawDottedLine(
  g: import("pixi.js").Graphics,
  x1: number, y1: number, x2: number, y2: number,
  dot = 1.5, gap = 4,
): void {
  drawDashedLine(g, x1, y1, x2, y2, dot, gap);
}

// ---------------------------------------------------------------------------
// Date display helper
// ---------------------------------------------------------------------------

function formatNodeDate(year: number | null, precision: string | null): string {
  return formatDateWithPrecision(year, precision, { unknown: "?" }) ?? "?";
}

// Compact label for the dual-range scrubber thumbs. Shows BCE for
// negative years (the Buddha is around -480) and the bare CE year
// otherwise.
function formatYearLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return String(year);
}

// Pull the active reading-mode colors (set as CSS vars on <html>) so the
// PIXI canvas — which paints onto a raw GL surface, not the DOM — stays in
// sync with sepia / dark themes instead of baking in the default day palette.
function parseHexColor(value: string): number | null {
  const m = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1];
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return parseInt(full, 16);
}

function readThemeColors(): { paper: number; ink: number } {
  if (typeof document === "undefined") {
    return { paper: 0xfaf9f7, ink: 0x3d3530 };
  }
  const style = getComputedStyle(document.documentElement);
  const paper = parseHexColor(style.getPropertyValue("--paper")) ?? 0xfaf9f7;
  const ink = parseHexColor(style.getPropertyValue("--ink")) ?? 0x3d3530;
  return { paper, ink };
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

// Portraits are the only display mode for the lineage graph. The previous
// "Names" text-only mode existed before portraits had full coverage; with
// every master imaged, the toggle was unnecessary noise.
type ViewMode = "image";

// Per-node portrait bookkeeping. Lets the cull pass swap textures based on
// zoom level and skip loads for off-screen nodes.
interface NodePortraitState {
  nodeId: string;
  container: import("pixi.js").Container;
  textDot: import("pixi.js").Graphics;
  portraitFrame: import("pixi.js").Graphics | null;
  label: import("pixi.js").Text;
  sprite: import("pixi.js").Sprite | null;
  hasPortrait: boolean;
  isSvg: boolean;
  url48: string | null;
  url96: string | null;
  url200: string | null;
  loadedKey: "48" | "96" | "200" | null;
  loading: boolean;
}

interface PixiState {
  app: import("pixi.js").Application;
  stage: import("pixi.js").Container;
  nodeContainers: Map<string, import("pixi.js").Container>;
  portraitStates: Map<string, NodePortraitState>;
  edgeGraphics: import("pixi.js").Graphics;
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, { x: number; y: number }>;
  highlighted: Set<string> | null;
  schoolFilter: string;
  timeMin: number;
  timeMax: number;
  dataMinYear: number;
  dataMaxYear: number;
  orphanSet: Set<string>;
  viewMode: ViewMode;
  zoomScale: number;
  cullPortraits: () => void;
  applyAllNodeModes: () => void;
}

// Decide which thumbnail size to load given the current zoom scale. Above
// 4× zoom we upgrade to the 200px tile so faces stay sharp; below 1.5× the
// 48px tile is plenty.
function targetThumbKey(scale: number): "48" | "96" | "200" {
  if (scale >= 4) return "200";
  if (scale >= 1.5) return "96";
  return "48";
}

// Toggle a node's children to match the active view mode. In text mode the
// big portrait frame and any loaded sprite are hidden and the small dot
// stands in. In image mode the frame is shown for nodes with a portrait
// (sprite layered on top once it loads); nodes without a portrait keep the
// small dot so the visual grid stays consistent.
function applyNodeMode(state: NodePortraitState, mode: ViewMode): void {
  const inImage = mode === "image";
  const showPortrait = inImage && state.hasPortrait;
  if (state.portraitFrame) state.portraitFrame.visible = showPortrait;
  if (state.sprite) state.sprite.visible = showPortrait;
  state.textDot.visible = !showPortrait;
  if (showPortrait) {
    state.label.anchor.set(0.5, -0.5);
    state.label.position.y = 14 + 2; // PORTRAIT_RADIUS + gap
  } else {
    state.label.anchor.set(0.5, -0.6);
    state.label.position.y = 0;
  }
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
  const [timeMax, setTimeMax] = useState(2000);
  const [timeMin, setTimeMin] = useState(-600);
  const [dataMaxYear, setDataMaxYear] = useState(2000);
  const [dataMinYear, setDataMinYear] = useState(-600);
  const [schoolList, setSchoolList] = useState<GraphSchool[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [legendOpen, setLegendOpen] = useState(true);
  const viewMode: ViewMode = "image";

  const pixiRef = useRef<PixiState | null>(null);
  const fuseRef = useRef<import("fuse.js").default<GraphNode> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  // Set by node pointerdown handlers so the document-level outside-tap
  // listener can distinguish "tapped a node" from "tapped empty canvas".
  const nodeJustClickedRef = useRef(false);

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
      if (pixi.orphanSet.has(id)) continue;
      if (!schoolContextIds.has(id)) continue;
      const effectiveYear = node.deathYear ?? node.birthYear;
      // Hide nodes whose effective year falls outside the time window.
      // Nodes with no recorded year are kept visible only when the
      // window covers the full data range — otherwise they'd float as
      // disconnected stragglers when the user narrows the bounds.
      const filterIsActive =
        pixi.timeMin > pixi.dataMinYear || pixi.timeMax < pixi.dataMaxYear;
      const yearOk =
        effectiveYear == null
          ? !filterIsActive
          : effectiveYear >= pixi.timeMin && effectiveYear <= pixi.timeMax;
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

      const srcNode = nodeById.get(edge.source);
      const edgeColor = schoolColor(srcNode?.schoolSlug ?? srcNode?.schoolName ?? null);
      // Three-tier edge style — see the legend below the canvas.
      //   primary                 → solid, full weight
      //   secondary               → dashed (additional real teacher)
      //   disputed | dharma       → dotted (historically contested or
      //                              an editorial bridge to the nearest
      //                              seeded lineage ancestor)
      const edgeWidth = edge.type === "primary" ? 1.5 : 0.8;
      edgeGraphics.setStrokeStyle({ width: edgeWidth, color: edgeColor, alpha });

      if (edge.type === "primary") {
        edgeGraphics.moveTo(src.x, src.y);
        edgeGraphics.lineTo(tgt.x, tgt.y);
      } else if (edge.type === "secondary") {
        drawDashedLine(edgeGraphics, src.x, src.y, tgt.x, tgt.y);
      } else {
        // "disputed" and "dharma" (editorial bridges)
        drawDottedLine(edgeGraphics, src.x, src.y, tgt.x, tgt.y);
      }
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
        const res = await fetch("/data/graph.json");
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
      const years = nodes.map((n) => n.deathYear ?? n.birthYear).filter((y): y is number => y != null);
      const maxYear = years.length > 0 ? Math.max(...years) : 2000;
      const minYear = years.length > 0 ? Math.min(...years) : -600;
      setDataMaxYear(maxYear);
      setDataMinYear(minYear);
      setTimeMax(maxYear);
      setTimeMin(minYear);

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
      // All edge types contribute to hierarchical layout positioning
      const primaryEdges = validEdges;

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

      // Reposition false roots: nodes at the same y-level as the true root
      // (Shakyamuni) that aren't Shakyamuni — place them just above their
      // first student so they don't crowd the top of the graph.
      const shakyamuniNode = nodes.find((n) => n.slug === "shakyamuni-buddha");
      const shakyamuniPos = shakyamuniNode ? connectedPositions.get(shakyamuniNode.id) : null;
      if (shakyamuniPos) {
        const rootY = shakyamuniPos.y;
        // Build child map: parent → first child position
        const childMap = new Map<string, { x: number; y: number }>();
        for (const e of primaryEdges) {
          if (!childMap.has(e.source)) {
            const childPos = connectedPositions.get(e.target);
            if (childPos) childMap.set(e.source, childPos);
          }
        }
        for (const [id, pos] of connectedPositions) {
          if (id === shakyamuniNode!.id) continue;
          if (Math.abs(pos.y - rootY) < 1) {
            // This is a false root — reposition above its first student
            const childPos = childMap.get(id);
            if (childPos) {
              connectedPositions.set(id, {
                x: childPos.x,
                y: childPos.y - 70, // one layer above student
              });
            }
          }
        }
      }

      // Scale up connected positions for readability
      const scaledConnected = new Map<string, { x: number; y: number }>();
      for (const [id, pos] of connectedPositions) {
        scaledConnected.set(id, { x: pos.x * 1.5, y: pos.y * 1.5 });
      }

      // Merge all positions
      const positions = new Map<string, { x: number; y: number }>([
        ...scaledConnected,
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

      const themeColors = readThemeColors();

      const app = new PIXI.Application();
      await app.init({
        canvas,
        width: w,
        height: h,
        backgroundColor: themeColors.paper,
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

      // Ensure Cormorant Garamond is loaded before creating text nodes
      await document.fonts.ready;

      // Node containers
      const nodeContainers = new Map<string, import("pixi.js").Container>();
      const portraitStates = new Map<string, NodePortraitState>();

      const initialMode: ViewMode = "image";
      const PORTRAIT_RADIUS = 14;
      const TEXT_DOT_RADIUS = 6;

      // ---- Portrait loading + viewport culling ---------------------------
      //
      // Loading every thumbnail on init wastes bandwidth — most masters are
      // off-screen. Instead each node defers its load until the cull pass
      // sees it inside the (padded) viewport. The cull also re-targets the
      // texture size when the user zooms in past 1.5× / 4×.

      async function loadPortrait(
        state: NodePortraitState,
        sizeKey: "48" | "96" | "200"
      ): Promise<void> {
        if (destroyed || state.loading) return;
        const url =
          sizeKey === "200"
            ? state.url200 ?? state.url96 ?? state.url48
            : sizeKey === "96"
              ? state.url96 ?? state.url48
              : state.url48 ?? state.url96;
        if (!url) return;
        if (state.loadedKey === sizeKey) return;
        // Don't downgrade: a 200 already loaded stays 200, etc.
        const rank = { "48": 0, "96": 1, "200": 2 } as const;
        if (state.loadedKey && rank[state.loadedKey] >= rank[sizeKey]) return;

        state.loading = true;
        try {
          const texture = (await PIXI.Assets.load(url)) as import("pixi.js").Texture;
          if (destroyed) return;
          if (!state.sprite) {
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5);
            const size = PORTRAIT_RADIUS * 2;
            sprite.width = size;
            sprite.height = size;

            const mask = new PIXI.Graphics();
            mask.circle(0, 0, PORTRAIT_RADIUS - 1);
            mask.fill({ color: 0xffffff });
            sprite.mask = mask;
            state.container.addChild(mask);
            state.container.addChild(sprite);
            state.sprite = sprite;
          } else {
            state.sprite.texture = texture;
          }
          state.loadedKey = sizeKey;
          // Respect the current view mode — don't force-show a sprite if
          // the user has switched to text mode mid-load.
          const currentMode = pixiRef.current?.viewMode ?? initialMode;
          state.sprite.visible = currentMode === "image" && state.hasPortrait;
        } catch {
          // Network error or decode failure — leave the medallion in place.
        } finally {
          state.loading = false;
        }
      }

      function cullPortraits(): void {
        const pixi = pixiRef.current;
        if (!pixi) return;
        if (pixi.viewMode !== "image") return;

        const screenW = app.screen.width;
        const screenH = app.screen.height;
        const k = stage.scale.x || 1;
        const tx = stage.position.x;
        const ty = stage.position.y;

        // 200px screen-space padding around the viewport — generous enough
        // that panning a screen-width still finds most nodes pre-loaded.
        const padScreen = 200;
        const xMinW = (-tx - padScreen) / k;
        const yMinW = (-ty - padScreen) / k;
        const xMaxW = (screenW - tx + padScreen) / k;
        const yMaxW = (screenH - ty + padScreen) / k;

        const target = targetThumbKey(k);

        for (const state of portraitStates.values()) {
          if (!state.hasPortrait) continue;
          const pos = positions.get(state.nodeId);
          if (!pos) continue;
          if (!state.container.visible) continue;
          if (pos.x < xMinW || pos.x > xMaxW || pos.y < yMinW || pos.y > yMaxW) continue;
          // SVG placeholders aren't rasterized into multiple sizes; they
          // resolve to the same file regardless of zoom.
          const pickedKey = state.isSvg ? "48" : target;
          void loadPortrait(state, pickedKey);
        }
      }

      function applyAllNodeModes(): void {
        const pixi = pixiRef.current;
        const mode = pixi?.viewMode ?? initialMode;
        for (const state of portraitStates.values()) {
          applyNodeMode(state, mode);
        }
      }

      for (const node of nodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const c = new PIXI.Container();
        c.position.set(pos.x, pos.y);
        c.eventMode = "static";
        c.cursor = "pointer";

        const color = schoolColor(node.schoolSlug ?? node.schoolName ?? null);

        // Two medallion variants live side-by-side; the cull pass toggles
        // visibility based on view mode and whether a portrait sprite has
        // loaded. Pre-building both avoids redraw work on toggle.
        const hasPortrait = Boolean(node.imageThumb96 ?? node.imageThumb48);
        const isSvg = (node.imageThumb48 ?? node.imageThumb96 ?? "").endsWith(".svg");

        let portraitFrame: import("pixi.js").Graphics | null = null;
        if (hasPortrait) {
          portraitFrame = new PIXI.Graphics();
          portraitFrame.circle(0, 0, PORTRAIT_RADIUS);
          portraitFrame.fill({ color, alpha: 0.25 });
          portraitFrame.circle(0, 0, PORTRAIT_RADIUS);
          portraitFrame.stroke({ width: 1, color, alpha: 0.85 });
          c.addChild(portraitFrame);
        }

        const textDot = new PIXI.Graphics();
        textDot.circle(0, 0, TEXT_DOT_RADIUS);
        textDot.fill({ color, alpha: 0.9 });
        c.addChild(textDot);

        // Label
        const shortLabel = node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label;
        const label = new PIXI.Text({
          text: shortLabel,
          style: new PIXI.TextStyle({
            fontSize: 11,
            fill: themeColors.ink,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }),
        });
        c.addChild(label);

        // Larger invisible hit area so nodes are clickable even when zoomed out
        const hitArea = new PIXI.Graphics();
        hitArea.circle(0, 0, Math.max(20, PORTRAIT_RADIUS + 6));
        hitArea.fill({ color: 0xffffff, alpha: 0 });
        c.addChildAt(hitArea, 0); // behind circle and label

        // Hover
        c.on("pointerover", (e: import("pixi.js").FederatedPointerEvent) => {
          const rect = containerRef.current?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
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
          nodeJustClickedRef.current = true;
          setSidebar({
            node,
            schoolName: node.schoolName ?? undefined,
          });
        });

        stage.addChild(c);
        nodeContainers.set(node.id, c);

        portraitStates.set(node.id, {
          nodeId: node.id,
          container: c,
          textDot,
          portraitFrame,
          label,
          sprite: null,
          hasPortrait,
          isSvg,
          url48: node.imageThumb48 ?? null,
          url96: node.imageThumb96 ?? null,
          url200: node.imageThumb200 ?? null,
          loadedKey: null,
          loading: false,
        });

        applyNodeMode(portraitStates.get(node.id)!, initialMode);
      }

      pixiRef.current = {
        app,
        stage,
        nodeContainers,
        portraitStates,
        edgeGraphics,
        nodes,
        edges,
        positions,
        highlighted: null,
        schoolFilter: "all",
        timeMin: minYear,
        timeMax: maxYear,
        dataMinYear: minYear,
        dataMaxYear: maxYear,
        orphanSet,
        viewMode: initialMode,
        zoomScale: 1,
        cullPortraits,
        applyAllNodeModes,
      };

      // Initial draw + viewport cull (loads only nodes in the initial viewport).
      redraw();
      cullPortraits();

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
          if (pixiRef.current) {
            pixiRef.current.zoomScale = k;
          }
          cullPortraits();
        });

      d3.select(canvas).call(zoom);
      zoomRef.current = zoom;

      let initialTransform;

      if (initialFocusSlug) {
        const focusedNode = nodes.find((node) => node.slug === initialFocusSlug);
        const focusedPosition = focusedNode ? positions.get(focusedNode.id) : null;
        if (focusedNode && focusedPosition) {
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

    // Re-sync the PIXI canvas with the active reading-mode whenever the
    // theme toggle flips `data-theme` on <html>. The DOM-rendered chrome
    // tracks CSS variables automatically; the GL surface needs an explicit
    // repaint of background + label fills.
    const themeObserver = new MutationObserver(() => {
      const pixi = pixiRef.current;
      if (!pixi) return;
      const { paper, ink } = readThemeColors();
      pixi.app.renderer.background.color = paper;
      for (const state of pixi.portraitStates.values()) {
        state.label.style.fill = ink;
      }
    });
    if (typeof document !== "undefined") {
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    const canvasEl = canvasRef.current;
    return () => {
      destroyed = true;
      themeObserver.disconnect();
      if (zoomRef.current && canvasEl) {
        d3.select(canvasEl).on(".zoom", null);
      }
      pixiRef.current?.app.destroy();
      pixiRef.current = null;
      zoomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Outside-tap dismiss for the master sidebar on mobile (≤720px). Desktop
  // keeps the sidebar pinned as a side rail; tapping the canvas there should
  // not dismiss it.
  useEffect(() => {
    if (!sidebar) return;
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 720px)");
    const handler = (e: PointerEvent) => {
      if (!mq.matches) return;
      // A node-tap fires its PIXI pointerdown handler before the document
      // listener (the canvas is deeper in the tree), setting this flag. In
      // that case the new node is already being shown — don't dismiss, or
      // React batching would collapse the open+close into a no-op flash.
      if (nodeJustClickedRef.current) {
        nodeJustClickedRef.current = false;
        return;
      }
      const target = e.target as Node | null;
      if (target && sidebarRef.current && sidebarRef.current.contains(target)) return;
      setSidebar(null);
    };

    document.addEventListener("pointerdown", handler);
    return () => {
      document.removeEventListener("pointerdown", handler);
    };
  }, [sidebar]);

  // Handle focusSlug changes without re-initializing the whole graph
  useEffect(() => {
    if (status !== "ready" || !pixiRef.current || !zoomRef.current || !canvasRef.current) return;

    if (focusSlug) {
      const pixi = pixiRef.current;
      const focusedNode = pixi.nodes.find((node) => node.slug === focusSlug);
      const focusedPosition = focusedNode ? pixi.positions.get(focusedNode.id) : null;

      if (focusedNode && focusedPosition) {
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

  useEffect(() => {
    if (!pixiRef.current) return;
    pixiRef.current.schoolFilter = selectedSchool;
    redraw();
    pixiRef.current.cullPortraits();

    const pixi = pixiRef.current;
    if (canvasRef.current && zoomRef.current && selectedSchool !== "all" && !focusSlug) {
      // Find school member nodes (exclude bridge nodes)
      const schoolNodes = pixi.nodes.filter(
        (n) => n.schoolId === selectedSchool && !pixi.orphanSet.has(n.id)
      );

      if (schoolNodes.length > 0) {
        // Sort by y-position ascending — topmost node is the school root/founder
        const withPos = schoolNodes
          .map((n) => ({ node: n, pos: pixi.positions.get(n.id) }))
          .filter((entry): entry is { node: GraphNode; pos: { x: number; y: number } } => !!entry.pos)
          .sort((a, b) => a.pos.y - b.pos.y);

        if (withPos.length > 0) {
          const rootPos = withPos[0].pos;
          const canvas = canvasRef.current;
          const w = canvas.clientWidth || window.innerWidth;
          const h = canvas.clientHeight || window.innerHeight;
          const scale = 1.2;
          const tx = w / 2 - scale * rootPos.x;
          const ty = h / 4 - scale * rootPos.y;

          if (!prefersReducedMotion) {
            d3.select(canvas)
              .transition()
              .duration(700)
              .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
          } else {
            d3.select(canvas).call(
              zoomRef.current.transform,
              d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
          }
        }
      }
    }
  }, [selectedSchool, redraw, prefersReducedMotion, focusSlug]);

  useEffect(() => {
    if (!pixiRef.current) return;
    pixiRef.current.timeMin = timeMin;
    pixiRef.current.timeMax = timeMax;
    pixiRef.current.dataMinYear = dataMinYear;
    pixiRef.current.dataMaxYear = dataMaxYear;
    redraw();
    pixiRef.current.cullPortraits();
  }, [timeMin, timeMax, dataMinYear, dataMaxYear, redraw]);


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
          aria-label="Search masters in lineage"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          id="lineage-school"
          name="lineage-school"
          className="lineage-select"
          aria-label="Filter by school"
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
      </div>

      {/* Time scrubber — dual-thumb range so the user can clamp both
          ends of the visible window (e.g. only Tang-era masters). The
          two inputs are stacked; CSS gives them transparent tracks so
          they read as one control. */}
      <div className="lineage-scrubber">
        <span className="scrubber-value scrubber-value-start">
          {timeMin === dataMinYear ? "Before" : formatYearLabel(timeMin)}
        </span>
        <div className="scrubber-range">
          <input
            type="range"
            id="lineage-time-min"
            name="lineage-time-min"
            aria-label="Filter — earliest year"
            className="scrubber-input scrubber-input-min"
            min={dataMinYear}
            max={dataMaxYear}
            step={10}
            value={timeMin}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), timeMax - 10);
              setTimeMin(next);
            }}
          />
          <input
            type="range"
            id="lineage-time-max"
            name="lineage-time-max"
            aria-label="Filter — latest year"
            className="scrubber-input scrubber-input-max"
            min={dataMinYear}
            max={dataMaxYear}
            step={10}
            value={timeMax}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), timeMin + 10);
              setTimeMax(next);
            }}
          />
        </div>
        <span className="scrubber-value scrubber-value-end">
          {timeMax === dataMaxYear ? "Now" : formatYearLabel(timeMax)}
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="lineage-canvas"
        role="img"
        aria-label="Zen lineage graph: pan and zoom to explore teacher-student transmissions across schools and centuries. Use the search box to find a master."
      />

      {/* Loading / error */}
      {status === "loading" && <div className="lineage-loading">Loading lineage…</div>}
      {status === "error" && <div className="lineage-loading">Failed to load graph data.</div>}

      {/* Edge-style legend. Three-tier scheme matching the renderer
          above: solid = canonical direct teacher; dashed = an
          additional teacher (e.g. student trained under more than one
          master); dotted = a historically disputed transmission or an
          editorial bridge to the nearest seeded lineage ancestor. */}
      {status === "ready" && (
        legendOpen ? (
          <aside className="lineage-legend" aria-label="Edge style legend">
            <button
              className="lineage-legend-close"
              onClick={() => setLegendOpen(false)}
              aria-label="Hide legend"
            >
              ✕
            </button>
            <p className="lineage-legend-title">Transmission lines</p>
            <ul className="lineage-legend-list">
              <li className="lineage-legend-item">
                <span className="lineage-legend-swatch lineage-legend-swatch-solid" aria-hidden />
                <span>Primary — canonical direct teacher</span>
              </li>
              <li className="lineage-legend-item">
                <span className="lineage-legend-swatch lineage-legend-swatch-dashed" aria-hidden />
                <span>Secondary — additional teacher</span>
              </li>
              <li className="lineage-legend-item">
                <span className="lineage-legend-swatch lineage-legend-swatch-dotted" aria-hidden />
                <span>Disputed or editorial bridge</span>
              </li>
            </ul>
          </aside>
        ) : (
          <button
            className="lineage-legend-open"
            onClick={() => setLegendOpen(true)}
            aria-label="Show edge style legend"
          >
            Legend
          </button>
        )
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}>
          <div className="tooltip-name">{tooltip.node.label}</div>
          {(tooltip.node.birthYear || tooltip.node.deathYear) && (
            <div className="tooltip-dates">
              {formatNodeDate(tooltip.node.birthYear, tooltip.node.birthPrecision)} –{" "}
              {formatNodeDate(tooltip.node.deathYear, tooltip.node.deathPrecision)}
            </div>
          )}
          {tooltip.schoolName && <div className="tooltip-school">{tooltip.schoolName}</div>}
        </div>
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside className="sidebar" ref={sidebarRef}>
          <button className="sidebar-close" onClick={() => setSidebar(null)} aria-label="Close">
            ✕
          </button>
          {sidebar.node.imageSrc && (
            <Link
              href={`/masters/${sidebar.node.slug}`}
              className="sidebar-image-link"
              aria-label={`Open profile of ${sidebar.node.label}`}
            >
              <div className="sidebar-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sidebar.node.imageSrc}
                  alt={sidebar.node.imageAlt ?? sidebar.node.label}
                  className="sidebar-image"
                />
              </div>
            </Link>
          )}
          <h2 className="sidebar-name">{sidebar.node.label}</h2>
          {sidebar.schoolName && <p className="sidebar-school">{sidebar.schoolName}</p>}
          {(sidebar.node.birthYear || sidebar.node.deathYear) && (
            <p className="sidebar-dates">
              {formatNodeDate(sidebar.node.birthYear, sidebar.node.birthPrecision)} –{" "}
              {formatNodeDate(sidebar.node.deathYear, sidebar.node.deathPrecision)}
            </p>
          )}
          {sidebar.node.bio && <p className="sidebar-description">{sidebar.node.bio}</p>}
          <div className="sidebar-actions">
            <Link className="sidebar-button" href={`/masters/${sidebar.node.slug}`}>
              Open profile →
            </Link>
            {sidebar.node.schoolSlug && (
              <Link className="sidebar-button" href={`/schools/${sidebar.node.schoolSlug}`}>
                Open school →
              </Link>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
