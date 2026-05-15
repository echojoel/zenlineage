"use client";

import type { GraphEdge, GraphNode } from "@/lib/graph-types";

// ---------------------------------------------------------------------------
// Tier label helpers
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<string, string> = {
  A: "Tier A — institutional + corroborated",
  B: "Tier B — institutional only",
  C: "Tier C — community / reference",
  D: "Tier D — provenance pending",
};

function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? `Tier ${tier}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EdgeProvenancePanelProps {
  edge: GraphEdge;
  teacher: GraphNode | undefined;
  student: GraphNode | undefined;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EdgeProvenancePanel({
  edge,
  teacher,
  student,
  onClose,
}: EdgeProvenancePanelProps) {
  const teacherName = teacher?.label ?? edge.source;
  const studentName = student?.label ?? edge.target;
  const tier = edge.tier ?? "D";

  return (
    <aside
      style={{
        position: "fixed",
        top: "5rem",
        right: "1rem",
        zIndex: 60,
        width: "min(28rem, calc(100vw - 2rem))",
        maxHeight: "80vh",
        overflowY: "auto",
        background: "var(--paper)",
        border: "1px solid color-mix(in srgb, var(--ink) 18%, transparent)",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 24px color-mix(in srgb, var(--ink) 12%, transparent)",
        padding: "1.25rem 1.25rem 1.5rem",
        color: "var(--ink)",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
      aria-label="Transmission provenance"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close provenance panel"
        style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          color: "var(--ink-light)",
          lineHeight: 1,
          padding: "0.25rem",
        }}
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ paddingRight: "1.5rem" }}>
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-light)",
            marginBottom: "0.25rem",
          }}
        >
          Transmission
        </p>
        <h2
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            margin: "0 0 0.35rem",
            lineHeight: 1.3,
          }}
        >
          {teacherName} → {studentName}
        </h2>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.72rem",
            letterSpacing: "0.04em",
            padding: "0.15rem 0.55rem",
            borderRadius: "9999px",
            background:
              tier === "A"
                ? "color-mix(in srgb, var(--moss) 18%, transparent)"
                : tier === "B"
                  ? "color-mix(in srgb, var(--moss) 10%, transparent)"
                  : tier === "C"
                    ? "color-mix(in srgb, var(--rust) 12%, transparent)"
                    : "color-mix(in srgb, var(--ink) 8%, transparent)",
            color:
              tier === "A" || tier === "B"
                ? "var(--moss)"
                : tier === "C"
                  ? "var(--rust)"
                  : "var(--ink-light)",
            border: "1px solid currentColor",
          }}
        >
          {tierLabel(tier)}
        </span>
      </div>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)",
          margin: "1rem 0",
        }}
      />

      {/* Sources */}
      {edge.sources.length === 0 ? (
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--ink-light)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          We have not yet recorded a quotable source for this transmission.
          If you know of a primary or scholarly reference, contributions are
          welcome.
        </p>
      ) : (
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {edge.sources.map((src, i) => (
            <li
              key={i}
              style={{
                borderLeft: "2px solid color-mix(in srgb, var(--moss) 35%, transparent)",
                paddingLeft: "0.85rem",
              }}
            >
              {/* Publisher + class badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                  {src.publisher}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.06em",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "9999px",
                    background: "color-mix(in srgb, var(--ink) 8%, transparent)",
                    color: "var(--ink-light)",
                    border: "1px solid color-mix(in srgb, var(--ink) 12%, transparent)",
                    textTransform: "uppercase",
                  }}
                >
                  {src.domainClass}
                </span>
              </div>

              {/* Quote */}
              {src.quote && (
                <blockquote
                  style={{
                    margin: "0 0 0.5rem",
                    padding: 0,
                    fontSize: "0.88rem",
                    lineHeight: 1.65,
                    color: "var(--ink)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{src.quote}&rdquo;
                </blockquote>
              )}

              {/* Link + retrieval date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  fontSize: "0.75rem",
                  color: "var(--ink-light)",
                }}
              >
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--moss)", textDecoration: "underline" }}
                  >
                    {(() => {
                      try {
                        return new URL(src.url).hostname.replace(/^www\./, "");
                      } catch {
                        return src.url;
                      }
                    })()}
                  </a>
                )}
                {src.retrievedOn && (
                  <span>retrieved {src.retrievedOn}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
