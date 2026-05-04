import Link from "next/link";

const REPO_ISSUE_URL = "https://github.com/echojoel/zenlineage/issues/new";

type Confidence = "high" | "medium" | "low" | null | undefined;

export interface AccuracyField {
  label: string;
  confidence: Confidence;
  citationCount?: number;
}

export interface AccuracyFooterProps {
  entityType: "master" | "teaching" | "school";
  entitySlug: string;
  entityName: string;
  fields?: AccuracyField[];
  totalCitations?: number;
  attributionStatus?: "verified" | "traditional" | "unresolved" | string | null;
}

const CONFIDENCE_LABEL: Record<NonNullable<Confidence>, string> = {
  high: "high — multiple authoritative sources",
  medium: "medium — one authoritative source",
  low: "low — based on hagiography or single popular source",
};

function summarize(fields: AccuracyField[]): { worst: Confidence; cited: number } {
  const rank: Record<NonNullable<Confidence>, number> = { low: 0, medium: 1, high: 2 };
  let worst: Confidence = undefined;
  let cited = 0;
  for (const f of fields) {
    if (f.citationCount && f.citationCount > 0) cited += 1;
    if (!f.confidence) continue;
    if (worst === undefined || worst === null) {
      worst = f.confidence;
      continue;
    }
    if (rank[f.confidence] < rank[worst]) worst = f.confidence;
  }
  return { worst, cited };
}

export function AccuracyFooter({
  entityType,
  entitySlug,
  entityName,
  fields = [],
  totalCitations,
  attributionStatus,
}: AccuracyFooterProps) {
  const { worst } = summarize(fields);

  const issueTitle = `Correction: ${entityType}/${entitySlug}`;
  const issueBody = [
    `**Entity:** ${entityType}/${entitySlug} (${entityName})`,
    "",
    "**Field with possible issue:**",
    "<!-- e.g. birth_year, school_id, attribution_status -->",
    "",
    "**What is wrong:**",
    "",
    "**Suggested correction (with source):**",
    "",
    "<!-- Please include a citation: book + page, scholarly article, monastery records, etc. -->",
    "",
    "---",
    "_Submitted via the per-page Report an issue link._",
  ].join("\n");
  const issueUrl = `${REPO_ISSUE_URL}?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=data-correction`;

  const fieldsToShow = fields.filter((f) => f.confidence != null);

  return (
    <section className="detail-card accuracy-footer" aria-labelledby="accuracy-footer-heading">
      <h3 id="accuracy-footer-heading" className="detail-section-title">
        Confidence &amp; corrections
      </h3>
      <div className="accuracy-footer-grid">
        {fieldsToShow.length > 0 && (
          <ul className="accuracy-footer-fields">
            {fieldsToShow.map((f) => (
              <li key={f.label}>
                <span className="detail-name-meta">{f.label}</span>
                <span
                  className={`accuracy-confidence accuracy-confidence-${f.confidence ?? "unknown"}`}
                >
                  {f.confidence ? CONFIDENCE_LABEL[f.confidence] : "uncertain"}
                </span>
              </li>
            ))}
          </ul>
        )}
        {fieldsToShow.length === 0 && worst == null && (
          <p className="detail-muted">
            No per-field confidence has been recorded for this {entityType} yet. Treat
            individual claims with the caution appropriate to the source list below.
          </p>
        )}
        {attributionStatus && (
          <p className="detail-list-meta">
            Attribution status: <strong>{attributionStatus}</strong> — see{" "}
            <Link href="/about" className="detail-inline-link">
              editorial policy
            </Link>{" "}
            for what this means.
          </p>
        )}
        {typeof totalCitations === "number" && (
          <p className="detail-list-meta">
            {totalCitations === 0
              ? "No supporting citations recorded yet."
              : `${totalCitations} supporting citation${totalCitations === 1 ? "" : "s"} on record (see Sources above).`}
          </p>
        )}
      </div>
      <p className="accuracy-footer-cta">
        Spot something wrong?{" "}
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-inline-link"
        >
          Report an issue
        </a>{" "}
        — please include a source so we can verify the correction.
      </p>
    </section>
  );
}
