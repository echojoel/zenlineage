import type { ReactNode } from "react";
import React from "react";

/**
 * Inline footnote rendering.
 *
 * Authoring convention: prose may include `[1]`, `[2]`, … markers. The
 * renderer walks the text, splits paragraphs on `\n\n`, replaces each
 * marker with a superscript anchor, and emits an ordered list of
 * references at the foot of the prose block.
 *
 * The reference list is supplied externally (from the citations table
 * for biographies, from school-taxonomy for schools, from a constant
 * for the /about page). Out-of-range markers (e.g. `[7]` when only 5
 * refs are provided) are preserved as plain text — better to surface
 * an authoring slip than to silently drop a claim's evidence.
 */

export interface FootnoteRef {
  /** 1-based index referenced from prose markers. */
  index: number;
  /** Full bibliographic source title, e.g. "Zen Buddhism: A History — Japan". */
  sourceTitle: string;
  /** Optional URL to the source (publisher page, archive.org, etc.). */
  sourceUrl?: string | null;
  /** Author / editor / translator if available. */
  author?: string | null;
  /** Page or section locator, e.g. "pp. 85–94" or "fasc. 1". */
  pageOrSection?: string | null;
  /** Optional supporting quote shown after the source citation. */
  excerpt?: string | null;
}

interface RenderOptions {
  /** Stable id namespace, used in anchor ids: `fn-{idScope}-{N}`. */
  idScope: string;
  /** Show "Notes" header above the footnote list (default true). */
  showHeader?: boolean;
}

const MARKER_RE = /\[(\d{1,3})\]/g;

/**
 * Split a single paragraph string on footnote markers. Each numbered
 * marker becomes a `<sup><a>` anchor that targets `#fn-{idScope}-{N}`.
 * Markers without a corresponding reference render as plain `[N]`
 * (still visible to the reader, but not a dead link).
 */
function renderParagraph(
  text: string,
  refs: Map<number, FootnoteRef>,
  idScope: string,
  paragraphIndex: number
): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // Reset regex state — global regex retains lastIndex across calls.
  MARKER_RE.lastIndex = 0;
  while ((match = MARKER_RE.exec(text)) !== null) {
    const [token, indexStr] = match;
    const start = match.index;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    const n = parseInt(indexStr, 10);
    if (refs.has(n)) {
      nodes.push(
        <sup key={`m-${key++}`} className="footnote-ref">
          <a
            href={`#fn-${idScope}-${n}`}
            id={`fnref-${idScope}-${n}-${paragraphIndex}`}
            aria-label={`Footnote ${n}`}
          >
            [{n}]
          </a>
        </sup>
      );
    } else {
      // Out-of-range marker: render the literal token so the slip is
      // visible to the author rather than silently swallowed.
      nodes.push(token);
    }
    lastIndex = start + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

/**
 * Render prose with inline footnote markers and a numbered footnote
 * list at the end. If no markers are present and no refs are supplied,
 * behaves identically to the previous `text.split("\n\n").map(...)`
 * pattern: one `<p>` per paragraph.
 */
export function renderProseWithFootnotes(
  text: string,
  refs: FootnoteRef[],
  options: RenderOptions
): React.JSX.Element {
  const { idScope, showHeader = true } = options;

  const refMap = new Map<number, FootnoteRef>();
  for (const ref of refs) refMap.set(ref.index, ref);

  const paragraphs = text.split(/\n\n+/);
  const paragraphNodes = paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p, i) => (
      <p key={`p-${i}`}>{renderParagraph(p, refMap, idScope, i)}</p>
    ));

  // Sort references for the footnote list by index so authors can
  // declare them in any order.
  const sortedRefs = [...refs].sort((a, b) => a.index - b.index);

  return (
    <>
      {paragraphNodes}
      {sortedRefs.length > 0 && (
        <aside className="footnote-section" aria-label="Footnotes">
          {showHeader && <h4 className="footnote-section-title">Notes</h4>}
          <ol className="footnote-list">
            {sortedRefs.map((ref) => (
              <li
                key={ref.index}
                id={`fn-${idScope}-${ref.index}`}
                value={ref.index}
              >
                <FootnoteEntry entry={ref} />
              </li>
            ))}
          </ol>
        </aside>
      )}
    </>
  );
}

function FootnoteEntry({ entry }: { entry: FootnoteRef }): React.JSX.Element {
  const titleNode = entry.sourceUrl ? (
    <a
      href={entry.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="footnote-source-link"
    >
      {entry.sourceTitle}
    </a>
  ) : (
    <span className="footnote-source-link">{entry.sourceTitle}</span>
  );

  return (
    <>
      {entry.author && <span className="footnote-author">{entry.author}, </span>}
      {titleNode}
      {entry.pageOrSection && (
        <span className="footnote-locator">, {entry.pageOrSection}</span>
      )}
      {entry.excerpt && (
        <span className="footnote-excerpt"> — &ldquo;{entry.excerpt}&rdquo;</span>
      )}
    </>
  );
}

/**
 * Inline `<sup>[N]</sup>` reference for use in JSX (where the prose
 * is not stored as a string but written directly in TSX, e.g.
 * `/about` page). Requires the parent component to render a single
 * `<FootnoteList>` with the matching refs near the foot of the page.
 */
export function FootnoteRef({
  n,
  scope,
}: {
  n: number;
  scope: string;
}): React.JSX.Element {
  return (
    <sup className="footnote-ref">
      <a href={`#fn-${scope}-${n}`} aria-label={`Footnote ${n}`}>
        [{n}]
      </a>
    </sup>
  );
}

/**
 * Standalone footnote list. Pair with `<FootnoteRef>` markers above.
 */
export function FootnoteList({
  refs,
  scope,
  title = "Notes",
}: {
  refs: FootnoteRef[];
  scope: string;
  title?: string;
}): React.JSX.Element | null {
  if (refs.length === 0) return null;
  const sorted = [...refs].sort((a, b) => a.index - b.index);
  return (
    <aside className="footnote-section" aria-label={title}>
      <h3 className="footnote-section-title">{title}</h3>
      <ol className="footnote-list">
        {sorted.map((ref) => (
          <li key={ref.index} id={`fn-${scope}-${ref.index}`} value={ref.index}>
            <FootnoteEntry entry={ref} />
          </li>
        ))}
      </ol>
    </aside>
  );
}
