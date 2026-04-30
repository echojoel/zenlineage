import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderProseWithFootnotes, type FootnoteRef } from "../src/lib/footnotes";

const ref = (overrides: Partial<FootnoteRef> & { index: number }): FootnoteRef => ({
  index: overrides.index,
  sourceTitle: overrides.sourceTitle ?? `Source ${overrides.index}`,
  sourceUrl: overrides.sourceUrl ?? null,
  author: overrides.author ?? null,
  pageOrSection: overrides.pageOrSection ?? null,
  excerpt: overrides.excerpt ?? null,
});

function html(node: ReturnType<typeof renderProseWithFootnotes>): string {
  return renderToStaticMarkup(node);
}

describe("renderProseWithFootnotes", () => {
  it("renders plain paragraphs unchanged when no markers are present", () => {
    const out = html(
      renderProseWithFootnotes("First paragraph.\n\nSecond paragraph.", [], {
        idScope: "x",
      })
    );
    expect(out).toContain("<p>First paragraph.</p>");
    expect(out).toContain("<p>Second paragraph.</p>");
    expect(out).not.toContain("<sup");
    expect(out).not.toContain("<aside");
  });

  it("emits a single superscript anchor for one marker", () => {
    const out = html(
      renderProseWithFootnotes(
        "Dōgen returned to Japan in 1227[1].",
        [ref({ index: 1, sourceTitle: "Dumoulin" })],
        { idScope: "dogen" }
      )
    );
    expect(out).toContain('<a href="#fn-dogen-1"');
    expect(out).toContain("<aside");
    expect(out).toContain("Dumoulin");
    expect(out).toContain('id="fn-dogen-1"');
  });

  it("emits multiple superscript anchors for multiple markers", () => {
    const out = html(
      renderProseWithFootnotes(
        "Founded Eihei-ji[1] in 1244[2].",
        [
          ref({ index: 1, sourceTitle: "Source A" }),
          ref({ index: 2, sourceTitle: "Source B" }),
        ],
        { idScope: "x" }
      )
    );
    expect(out).toContain('href="#fn-x-1"');
    expect(out).toContain('href="#fn-x-2"');
    expect(out).toContain("Source A");
    expect(out).toContain("Source B");
  });

  it("preserves out-of-range markers as plain text but renders supplied refs", () => {
    const out = html(
      renderProseWithFootnotes("Some claim[7] without a ref.", [ref({ index: 1 })], {
        idScope: "x",
      })
    );
    // The literal [7] survives because no ref index 7 was provided.
    expect(out).toContain("[7]");
    // But ref 1 still renders in the list.
    expect(out).toContain('id="fn-x-1"');
    // No anchor was created for [7].
    expect(out).not.toContain('href="#fn-x-7"');
  });

  it("ignores malformed markers like [1.5] or [-1]", () => {
    const out = html(
      renderProseWithFootnotes("Edge cases [1.5] and [-1] left alone.", [], {
        idScope: "x",
      })
    );
    expect(out).toContain("[1.5]");
    expect(out).toContain("[-1]");
    expect(out).not.toContain("<sup");
  });

  it("handles paragraph breaks and renders one ol regardless of paragraph count", () => {
    const out = html(
      renderProseWithFootnotes(
        "First[1].\n\nSecond[2].",
        [
          ref({ index: 1, sourceTitle: "S1" }),
          ref({ index: 2, sourceTitle: "S2" }),
        ],
        { idScope: "x" }
      )
    );
    const olMatches = out.match(/<ol/g) ?? [];
    expect(olMatches.length).toBe(1);
    const pMatches = out.match(/<p>/g) ?? [];
    expect(pMatches.length).toBe(2);
  });

  it("renders source URL as an anchor when provided", () => {
    const out = html(
      renderProseWithFootnotes(
        "Cite[1].",
        [
          ref({
            index: 1,
            sourceTitle: "Linked source",
            sourceUrl: "https://example.org/page",
          }),
        ],
        { idScope: "x" }
      )
    );
    expect(out).toContain('href="https://example.org/page"');
    expect(out).toContain("Linked source");
  });

  it("includes pageOrSection and excerpt in the entry", () => {
    const out = html(
      renderProseWithFootnotes(
        "Quote[1].",
        [
          ref({
            index: 1,
            sourceTitle: "Buswell",
            pageOrSection: "pp. 17–97",
            excerpt: "the awakening through reading",
          }),
        ],
        { idScope: "x" }
      )
    );
    expect(out).toContain("pp. 17–97");
    expect(out).toContain("the awakening through reading");
  });

  it("sorts references by index even if supplied out of order", () => {
    const out = html(
      renderProseWithFootnotes(
        "Marker[2] then[1].",
        [
          ref({ index: 2, sourceTitle: "Second" }),
          ref({ index: 1, sourceTitle: "First" }),
        ],
        { idScope: "x" }
      )
    );
    // The first <li> in the rendered list should be index 1 ("First").
    const firstLi = out.indexOf("First");
    const secondLi = out.indexOf("Second");
    expect(firstLi).toBeGreaterThan(0);
    expect(firstLi).toBeLessThan(secondLi);
  });

  it("trims and skips empty paragraphs", () => {
    const out = html(
      renderProseWithFootnotes("First.\n\n\n\nSecond.\n\n   \n\nThird.", [], {
        idScope: "x",
      })
    );
    const pMatches = out.match(/<p>/g) ?? [];
    expect(pMatches.length).toBe(3);
  });

  it("renders a single ↑ backref when a footnote is cited once", () => {
    const out = html(
      renderProseWithFootnotes("Once[1].", [ref({ index: 1 })], { idScope: "x" })
    );
    expect(out).toContain('href="#fnref-x-1-0"');
    expect(out).toContain("footnote-backref");
    expect(out).toContain("↑");
    // Single-site mode should NOT render the a/b letters.
    expect(out).not.toMatch(/>a<\/a>/);
  });

  it("renders ↑ a b backrefs when one footnote is cited multiple times", () => {
    const out = html(
      renderProseWithFootnotes(
        "First mention[1] and again[1] and once more[1].",
        [ref({ index: 1, sourceTitle: "Reused" })],
        { idScope: "x" }
      )
    );
    // The same href="#fn-x-1" appears 3 times in the prose markers.
    const calls = (out.match(/href="#fn-x-1"/g) ?? []).length;
    expect(calls).toBe(3);
    // Note <li> renders 3 backref letters a / b / c, each linking to a
    // distinct call-site id.
    expect(out).toContain('href="#fnref-x-1-0"');
    expect(out).toContain('href="#fnref-x-1-1"');
    expect(out).toContain('href="#fnref-x-1-2"');
    expect(out).toMatch(/>a<\/a>/);
    expect(out).toMatch(/>b<\/a>/);
    expect(out).toMatch(/>c<\/a>/);
    // Single canonical entry in the <ol> for this index.
    const olEntries = (out.match(/<li id="fn-x-1"/g) ?? []).length;
    expect(olEntries).toBe(1);
  });

  it("assigns unique call-site ids across paragraphs", () => {
    const out = html(
      renderProseWithFootnotes(
        "Para A[1].\n\nPara B[1].",
        [ref({ index: 1 })],
        { idScope: "x" }
      )
    );
    expect(out).toContain('id="fnref-x-1-0"');
    expect(out).toContain('id="fnref-x-1-1"');
  });
});
