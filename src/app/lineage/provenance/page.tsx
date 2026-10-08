import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "@/components/Link";

export const metadata: Metadata = {
  title: "Lineage source evidence",
  description:
    "Explore the sources behind Zen Lineage's teacher–student connections, grouped by the strength of the recorded evidence.",
  alternates: { canonical: "https://zenlineage.org/lineage/provenance" },
  openGraph: {
    title: "Lineage source evidence — Zen Lineage",
    description:
      "Explore the sources behind Zen Lineage's teacher–student connections, grouped by the strength of the recorded evidence.",
    url: "https://zenlineage.org/lineage/provenance",
    type: "website",
  },
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
  A: "Tier A — Institutional and corroborated",
  B: "Tier B — Independently corroborated",
  C: "Tier C — Limited corroboration",
  D: "Tier D — No accepted evidence",
};

const TIER_BLURB: Record<string, string> = {
  A: "At least one institutional source and corroboration from an independent source. This grade records the mix of sources in the evidence file; it does not by itself establish that a contemporary primary document survives.",
  B: "At least two independent sources, including an academic or institutional source, without meeting the Tier A criterion.",
  C: "At least one accepted academic, institutional, sangha, or reference source supports the connection, without enough independent sources for Tier B. Further corroboration would strengthen it.",
  D: "No accepted academic, institutional, sangha, or reference source is recorded for this edge. Contributions and corrections are welcome.",
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
            Every teacher–student edge in the lineage graph — {totalEdges} in
            total — is graded A through D according to how well it is documented.
            Tier A has institutional and independent support; Tier D marks edges
            without accepted evidence. Use this index to find under-documented transmissions
            or to check the evidence behind any specific connection.
          </p>
        </section>

        <section className="detail-card" id="methodology">
          <h2 className="detail-section-title">Methodology</h2>
          <p className="detail-muted" style={{ marginBottom: "0.75rem" }}>
            This site records the available evidence for links on the lineage graph
            and shows where further verification is needed.
          </p>
          <p className="detail-muted" style={{ marginBottom: "0.75rem" }}>
            <strong>Sources are classified by domain.</strong>{" "}
            <em>Institutional</em> = the tradition&apos;s own publications
            (Sōtōshū, White Plum Asanga, Sanbō Zen, Sōji-ji, Eihei-ji, etc.).{" "}
            <em>Academic</em> = peer-reviewed scholarship and university
            presses. <em>Reference</em> = Wikipedia (counts as one source
            across all language editions). <em>Sangha</em> = dharma centres
            with verifiable lineage. <em>Community</em> = blogs and personal
            sites (corroborative only, never sole source). Anything matching
            the <em>promotional</em> deny-list (Amazon, Goodreads, &amp;c.)
            is rejected.
          </p>
          <p className="detail-muted" style={{ marginBottom: "0.75rem" }}>
            <strong>Tiers compose from those sources:</strong>{" "}
            <strong>A</strong> = at least one institutional source plus
            independent corroboration.{" "}
            <strong>B</strong> = two or more independent sources, at least
            one of which is academic or institutional.{" "}
            <strong>C</strong> = at least one credible source without enough independent corroboration for Tier B.{" "}
            <strong>D</strong> = no evidence file, or sources we cannot
            stand behind. Tier-D edges still render on the graph, but with
            a <span aria-hidden>?</span> glyph at the midpoint — visible
            doubt rather than silent omission.
          </p>
          <p className="detail-muted" style={{ marginBottom: "0.75rem" }}>
            <strong>Verification ran through six waves</strong> of
            independent multi-agent research. Each transmission was
            assigned to three independent researchers working in isolation,
            their findings merged by a deterministic reducer, then audited
            by a reviewer that fetches each cited URL and checks the
            verbatim quote actually appears on the page. Mis-attributions
            are recorded as <code>type=&apos;disputed&apos;</code> in the
            database with the original claim preserved alongside the
            corrected primary edge — never silently deleted.
          </p>
          <p className="detail-muted">
            Click any edge on the lineage graph to see its specific
            sources. The lists below group every edge by its current tier;
            click into any master to see the inbound and outbound
            transmissions on their own detail page.
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
