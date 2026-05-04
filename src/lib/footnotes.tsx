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
 * Tracks every call-site (occurrence) of each footnote marker so the
 * note list can render Wikipedia-style backref arrows pointing to the
 * exact spot the marker appears in the prose.
 */
type CallSiteMap = Map<number, string[]>;

/**
 * Split a single paragraph string on footnote markers. Each numbered
 * marker becomes a `<sup><a>` anchor that targets `#fn-{idScope}-{N}`
 * and itself carries a unique `id` so the corresponding note can link
 * back to it. Markers without a matching reference are preserved as
 * literal text so authoring slips stay visible.
 */
function renderParagraph(
  text: string,
  refs: Map<number, FootnoteRef>,
  idScope: string,
  callSites: CallSiteMap,
  startCounter: number
): { nodes: ReactNode; counter: number } {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  let counter = startCounter;

  MARKER_RE.lastIndex = 0;
  while ((match = MARKER_RE.exec(text)) !== null) {
    const [token, indexStr] = match;
    const start = match.index;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    const n = parseInt(indexStr, 10);
    if (refs.has(n)) {
      // Each call-site gets a globally unique id so multiple `[N]`s
      // in the same paragraph (or across paragraphs) all back-link
      // independently.
      const callId = `fnref-${idScope}-${n}-${counter++}`;
      const sites = callSites.get(n) ?? [];
      sites.push(callId);
      callSites.set(n, sites);
      nodes.push(
        <sup key={`m-${key++}`} className="footnote-ref">
          <a
            href={`#fn-${idScope}-${n}`}
            id={callId}
            aria-label={`Footnote ${n}`}
          >
            [{n}]
          </a>
        </sup>
      );
    } else {
      nodes.push(token);
    }
    lastIndex = start + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return { nodes, counter };
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
  const callSites: CallSiteMap = new Map();
  let counter = 0;
  const paragraphNodes = paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p, i) => {
      const { nodes, counter: next } = renderParagraph(p, refMap, idScope, callSites, counter);
      counter = next;
      return <p key={`p-${i}`}>{nodes}</p>;
    });

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
                <Backrefs sites={callSites.get(ref.index) ?? []} />
                <FootnoteEntry entry={ref} />
              </li>
            ))}
          </ol>
        </aside>
      )}
    </>
  );
}

/**
 * Wikipedia-style backref. One call-site → "↑". Multiple call-sites
 * → "↑ a b c" with a separate jump-back link for each. When zero
 * call-sites are registered (rare but possible — e.g. an author
 * declared a footnote that they didn't actually cite), no arrow is
 * rendered.
 */
function Backrefs({ sites }: { sites: string[] }): React.JSX.Element | null {
  if (sites.length === 0) return null;
  if (sites.length === 1) {
    return (
      <a
        href={`#${sites[0]}`}
        className="footnote-backref"
        aria-label="Jump back to citation"
      >
        ↑
      </a>
    );
  }
  return (
    <span className="footnote-backref-group">
      <span className="footnote-backref-jump">↑</span>{" "}
      {sites.map((site, i) => (
        <a
          key={site}
          href={`#${site}`}
          className="footnote-backref"
          aria-label={`Jump back to citation ${String.fromCharCode(97 + i)}`}
        >
          {String.fromCharCode(97 + i)}
        </a>
      ))}{" "}
    </span>
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

/**
 * Render multiple prose blocks that share a single footnote reference
 * list, with one unified Notes block at the foot of the page (Wikipedia
 * style). Each prose block is split on `\n\n` into paragraphs; `[N]`
 * markers are converted to superscript anchors that link to a single
 * combined `<aside>` containing one `<li>` per source. Backref arrows
 * point at the actual call-site, which is what makes citation reuse
 * across blocks behave correctly: cite source `[2]` in two different
 * blocks and the Notes entry shows `↑ a b` for both call-sites.
 */
export function renderSharedFootnotedProse({
  blocks,
  refs,
  scope,
  notesTitle = "References",
}: {
  blocks: Array<{ key: string; text: string }>;
  refs: FootnoteRef[];
  scope: string;
  notesTitle?: string;
}): {
  renderedBlocks: Array<{ key: string; nodes: React.JSX.Element[] }>;
  notes: React.JSX.Element | null;
} {
  const refMap = new Map<number, FootnoteRef>();
  for (const ref of refs) refMap.set(ref.index, ref);

  const callSites: CallSiteMap = new Map();
  let counter = 0;

  const renderedBlocks = blocks.map((block) => {
    const paragraphs = block.text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const nodes = paragraphs.map((p, i) => {
      const { nodes: paraNodes, counter: next } = renderParagraph(
        p,
        refMap,
        scope,
        callSites,
        counter
      );
      counter = next;
      return <p key={`${block.key}-p-${i}`}>{paraNodes}</p>;
    });
    return { key: block.key, nodes };
  });

  const sortedRefs = [...refs].sort((a, b) => a.index - b.index);

  const notes =
    sortedRefs.length === 0 ? null : (
      <aside className="footnote-section" aria-label={notesTitle}>
        <h3 className="footnote-section-title">{notesTitle}</h3>
        <ol className="footnote-list">
          {sortedRefs.map((ref) => (
            <li
              key={ref.index}
              id={`fn-${scope}-${ref.index}`}
              value={ref.index}
            >
              <Backrefs sites={callSites.get(ref.index) ?? []} />
              <FootnoteEntry entry={ref} />
            </li>
          ))}
        </ol>
      </aside>
    );

  return { renderedBlocks, notes };
}
