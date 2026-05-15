import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Provenance — Zen Lineage",
  description:
    "Every transmission on this site grouped by source quality.",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GraphEdgeSource {
  publisher: string;
  url: string;
  domainClass: string;
  quote: string | null;
  retrievedOn: string | null;
}

interface GraphEdge {
  id: string;
  source: string; // teacher node id
  target: string; // student node id
  type: string;
  isPrimary: boolean;
  shihoConferred: boolean;
  tier: "A" | "B" | "C" | "D";
  sources: GraphEdgeSource[];
}

interface GraphNode {
  id: string;
  slug: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ---------------------------------------------------------------------------
// Tier metadata
// ---------------------------------------------------------------------------

const TIER_LABEL: Record<string, string> = {
  A: "Tier A — Primary source",
  B: "Tier B — Secondary source",
  C: "Tier C — Tertiary / indirect",
  D: "Tier D — Unverified / imported",
};

const TIER_BLURB: Record<string, string> = {
  A: "At least one contemporary or near-contemporary primary source names the transmission directly — for example a deed of succession (shihōjō), an official lineage register, or a first-hand account by the student or a close disciple.",
  B: "The transmission is attested in a reputable secondary scholarly work — monographs, peer-reviewed articles, or well-sourced encyclopaedias — but no primary deed has been located or digitised.",
  C: "The edge rests on a tertiary source (encyclopedia entry, survey text, or aggregated lineage chart) or on indirect evidence such as the master being listed as a dharma heir without further detail. Treat with appropriate scepticism.",
  D: "No source record has been entered yet. The edge was imported from the canonical dataset but has not yet been audited. Contributions and corrections are welcome.",
};

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadGraph(): GraphData {
  const filePath = path.join(process.cwd(), "public", "data", "graph.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GraphData;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProvenancePage() {
  const graph = loadGraph();

  // Build lookup maps from graph nodes
  const labelOf = new Map<string, string>(graph.nodes.map((n) => [n.id, n.label]));
  const slugOf = new Map<string, string>(graph.nodes.map((n) => [n.id, n.slug]));

  // Bucket edges by tier
  const buckets: Record<"A" | "B" | "C" | "D", GraphEdge[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };
  for (const edge of graph.edges) {
    const tier = (edge.tier ?? "D") as "A" | "B" | "C" | "D";
    buckets[tier].push(edge);
  }

  // Sort each bucket alphabetically by teacher label
  for (const tier of ["A", "B", "C", "D"] as const) {
    buckets[tier].sort((a, b) => {
      const ta = labelOf.get(a.source) ?? a.source;
      const tb = labelOf.get(b.source) ?? b.source;
      return ta.localeCompare(tb);
    });
  }

  const totalEdges = graph.edges.length;

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/lineage" className="nav-link">
          Lineage
        </Link>
        <h1 className="page-title">Provenance</h1>
      </header>

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Source quality</p>
          <h2 className="detail-title">Transmission provenance</h2>
          <p className="detail-subtitle">
            Every dharma-transmission edge in the lineage graph — {totalEdges} in
            total — is graded A through D according to how well it is documented.
            Tier A rests on primary sources; Tier D marks edges imported without
            a source record. Use this index to find under-documented transmissions
            or to check the evidence behind any specific connection.
          </p>
        </section>

        {(["A", "B", "C", "D"] as const).map((tier) => {
          const edges = buckets[tier];
          return (
            <section key={tier} className="detail-card" id={`tier-${tier}`}>
              <h2 className="detail-section-title">
                {TIER_LABEL[tier]}{" "}
                <span className="detail-list-meta">
                  ({edges.length} edge{edges.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <p className="detail-muted" style={{ marginBottom: "1rem" }}>
                {TIER_BLURB[tier]}
              </p>

              {edges.length === 0 ? (
                <p className="detail-muted">No edges in this tier.</p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {edges.map((edge) => {
                    const teacherLabel = labelOf.get(edge.source) ?? edge.source;
                    const studentLabel = labelOf.get(edge.target) ?? edge.target;
                    const teacherSlug = slugOf.get(edge.source);
                    const studentSlug = slugOf.get(edge.target);
                    const firstSource = edge.sources[0];

                    return (
                      <li
                        key={edge.id}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.5rem",
                          padding: "0.4rem 0",
                          borderBottom: "1px solid rgba(122, 106, 85, 0.12)",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Teacher */}
                        {teacherSlug ? (
                          <Link
                            href={`/lineage/${teacherSlug}`}
                            className="master-list-name"
                          >
                            {teacherLabel}
                          </Link>
                        ) : (
                          <span className="master-list-name">{teacherLabel}</span>
                        )}

                        {/* Arrow */}
                        <span className="detail-list-meta" aria-hidden>→</span>

                        {/* Student */}
                        {studentSlug ? (
                          <Link
                            href={`/lineage/${studentSlug}`}
                            className="master-list-name"
                          >
                            {studentLabel}
                          </Link>
                        ) : (
                          <span className="master-list-name">{studentLabel}</span>
                        )}

                        {/* First source publisher (if present) */}
                        {firstSource && (
                          <span className="detail-list-meta">
                            —{" "}
                            {firstSource.url ? (
                              <a
                                href={firstSource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "inherit", textDecoration: "underline" }}
                              >
                                {firstSource.publisher}
                              </a>
                            ) : (
                              firstSource.publisher
                            )}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
