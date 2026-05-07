"use client";

/**
 * Reader for /sutras/[slug]. Renders one of N PD/CC translations of the
 * same sūtra, with a segmented chip control to switch between them.
 *
 * URL contract: ?translator=<slug>&passage=<n>. Both params survive a
 * translation switch so the reader stays anchored at the same passage
 * (translations agree on §N section IDs by the canonical division of
 * each sūtra — Conze for the Heart, the 32 Chinese chapters for the
 * Diamond, the 10 Wong chapters for the Platform).
 *
 * Static-export friendly: state lives in component and is hydrated on
 * mount from `window.location.search` (mirroring ProverbsClient.tsx).
 * No useSearchParams, no Suspense gymnastics.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { linkifyText, type LinkTerm } from "@/lib/linkify-mentions";

export interface SutraTranslation {
  /** Slug of the *teaching* row (e.g. "heart-sutra-mueller-1894"). */
  slug: string;
  /** Short label for the chip — translator surname + year. */
  chipLabel: string;
  /** Two- or three-character language tag rendered above chipLabel
   *  in the chip (EN, SA, 漢, 日). */
  langLabel: string;
  /** BCP-47-ish locale of the prose body. Drives `lang=` on the
   *  rendered article so screen readers and font-fallback select
   *  appropriate behaviour for CJK and Sanskrit. */
  language: string;
  /** Long label for the source footer. */
  fullLabel: string;
  translator: string;
  edition: string;
  licenseStatus: string;
  /** Markdown body. Sections start with `## §N …` headings. */
  content: string;
  /** Source citation: edition title + URL to authoritative full text. */
  source: {
    title: string;
    url: string | null;
    locator: string;
  };
  /** When the rendered text is a curated subset of the full sūtra
   *  (Diamond, Platform, Lotus all ship as selections), the source
   *  footer surfaces a small "Selected chapters" badge so the reader
   *  knows the sūtra continues beyond what's on the page. Optional;
   *  absent / "complete" omits the badge. */
  coverage?:
    | { kind: "complete" }
    | { kind: "selections"; sections: string };
  /** Optional URL to a freely-licensed audio file of the chant. */
  audioUrl?: string;
  /** Catalogue page underlying the audio file, for attribution. */
  audioSourceUrl?: string;
  audioAttribution?: string;
}

interface Props {
  sutraTitle: string;
  translations: SutraTranslation[];
  /** chip-slug to use when ?translator= is missing or invalid. */
  defaultTranslator: string;
  /** Auto-link target list — glossary terms, sūtra titles, etc.
   *  Server pages assemble these and pass them in. The reader applies
   *  them only to plain prose (not to italicised verse blocks, where
   *  Sanskrit transliteration would otherwise generate noisy links). */
  linkTerms?: LinkTerm[];
}

interface ParsedSection {
  passageNumber: string;
  heading: string;
  body: string;
}

/**
 * Split a `## §N Heading\n\nbody…` markdown block into ordered
 * sections. Anything before the first `## §` is dropped — every PD
 * translation we ship is structured so the first heading is §1.
 */
function parseSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const parts = markdown.split(/^## §/m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;
    const headingLine = part.slice(0, newlineIndex).trim();
    const body = part.slice(newlineIndex + 1).trim();
    const match = headingLine.match(/^(\S+)\s+(.+)$/);
    if (!match) continue;
    sections.push({
      passageNumber: match[1],
      heading: match[2],
      body,
    });
  }
  return sections;
}

function renderInline(
  text: string,
  linkTerms: LinkTerm[] | null
): React.ReactNode {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  // Linkify-or-pass plain text segments. Verse content lives inside
  // `*…*` italic spans which we deliberately skip to avoid littering
  // Sanskrit transliterations with noisy English term links.
  const pushPlain = (segment: string) => {
    if (!segment) return;
    if (linkTerms && linkTerms.length > 0) {
      for (const node of linkifyText(segment, linkTerms)) {
        out.push(node);
      }
    } else {
      out.push(segment);
    }
  };

  while (i < text.length) {
    const star = text.indexOf("*", i);
    if (star === -1) {
      pushPlain(text.slice(i));
      break;
    }
    if (star > i) pushPlain(text.slice(i, star));
    const close = text.indexOf("*", star + 1);
    if (close === -1) {
      pushPlain(text.slice(star));
      break;
    }
    out.push(<em key={`em-${key++}`}>{text.slice(star + 1, close)}</em>);
    i = close + 1;
  }
  return out;
}

function renderBody(
  body: string,
  linkTerms: LinkTerm[] | null
): React.ReactNode[] {
  const blocks = body.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const allItalic = /^\*[^*]+\*$/.test(trimmed.replace(/\n/g, " "));
    const lines = trimmed.split("\n");
    // Verse blocks pass `null` to suppress linkification — verses
    // are typically translit/Sanskrit and any English glossary hit
    // would corrupt the line break and visual rhythm.
    const lineLinkTerms = allItalic ? null : linkTerms;
    const rendered = lines.map((line, j) => (
      <span key={j}>
        {renderInline(line, lineLinkTerms)}
        {j < lines.length - 1 ? <br /> : null}
      </span>
    ));
    if (allItalic) {
      return (
        <blockquote key={i} className="sutra-verse">
          {rendered}
        </blockquote>
      );
    }
    return <p key={i}>{rendered}</p>;
  });
}

export default function SutraReader({
  sutraTitle,
  translations,
  defaultTranslator,
  linkTerms = [],
}: Props) {
  const validSlugs = useMemo(
    () => new Set(translations.map((t) => t.slug)),
    [translations]
  );
  const [activeSlug, setActiveSlug] = useState<string>(defaultTranslator);
  /** When set, the reader splits into two columns and renders the
   *  matching translation alongside the active one — passage by
   *  passage, sharing § anchors. Null disables compare mode. */
  const [compareSlug, setCompareSlug] = useState<string | null>(null);
  /** When true the secondary chip strip ("Compare with…") is open. */
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const articleRef = useRef<HTMLElement | null>(null);
  const initialPassageRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const wantTranslator = params.get("translator");
    const wantCompare = params.get("compare");
    const wantPassage = params.get("passage");
    if (wantTranslator && validSlugs.has(wantTranslator)) {
      setActiveSlug(wantTranslator);
    }
    if (wantCompare && validSlugs.has(wantCompare) && wantCompare !== wantTranslator) {
      setCompareSlug(wantCompare);
      setCompareOpen(true);
    }
    initialPassageRef.current = wantPassage;
  }, [validSlugs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const passage = initialPassageRef.current;
    if (!passage) return;
    const el = document.getElementById(`passage-${passage}`);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, [activeSlug]);

  /** Capture the currently visible §N before swapping content so the
   *  scroll position survives the swap. */
  const captureNearestPassage = useCallback((): string | null => {
    const sections = articleRef.current?.querySelectorAll<HTMLElement>(
      "[data-passage]"
    );
    if (!sections) return null;
    const viewportTop =
      typeof window !== "undefined" ? window.scrollY + 100 : 0;
    let nearest: string | null = null;
    for (const s of sections) {
      if (s.offsetTop <= viewportTop) {
        nearest = s.dataset.passage ?? null;
      } else {
        break;
      }
    }
    return nearest;
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      if (slug === activeSlug) return;
      const params = new URLSearchParams(window.location.search);
      params.set("translator", slug);
      // If the user switches the primary translation to whatever was
      // in the compare slot, drop the compare slot — it would be
      // showing the same text twice.
      if (compareSlug === slug) {
        setCompareSlug(null);
        params.delete("compare");
      }
      const passage = params.get("passage");
      if (passage) {
        initialPassageRef.current = passage;
      } else {
        const nearest = captureNearestPassage();
        if (nearest) {
          initialPassageRef.current = nearest;
          params.set("passage", nearest);
        }
      }
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `${window.location.pathname}?${qs}` : window.location.pathname
      );
      setActiveSlug(slug);
    },
    [activeSlug, compareSlug, captureNearestPassage]
  );

  const handleCompare = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (slug && slug !== activeSlug) {
        params.set("compare", slug);
        setCompareSlug(slug);
      } else {
        params.delete("compare");
        setCompareSlug(null);
      }
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `${window.location.pathname}?${qs}` : window.location.pathname
      );
    },
    [activeSlug]
  );

  const toggleCompareOpen = useCallback(() => {
    setCompareOpen((prev) => {
      const next = !prev;
      if (!next && compareSlug) {
        // Closing the picker also dismisses an active comparison.
        handleCompare(null);
      }
      return next;
    });
  }, [compareSlug, handleCompare]);

  const active =
    translations.find((t) => t.slug === activeSlug) ??
    translations.find((t) => t.slug === defaultTranslator) ??
    translations[0];

  if (!active) {
    return <p className="detail-muted">No translations available yet.</p>;
  }

  const sections = parseSections(active.content);
  const licenseLabel = formatLicense(active.licenseStatus);

  const compareTranslation =
    compareSlug !== null
      ? translations.find((t) => t.slug === compareSlug) ?? null
      : null;
  const compareSections = compareTranslation
    ? parseSections(compareTranslation.content)
    : null;
  const compareSectionByPassage = compareSections
    ? new Map(compareSections.map((s) => [s.passageNumber, s]))
    : null;

  // Translations available for the right-hand "Compare with…" slot:
  // anything except the currently-active primary translation.
  const compareCandidates = translations.filter((t) => t.slug !== active.slug);

  return (
    <>
      <div
        className="sutra-switcher"
        role="group"
        aria-label={`${sutraTitle} translation`}
      >
        <span className="sutra-switcher-label">Translation</span>
        <div className="sutra-switcher-chips">
          {translations.map((t) => (
            <button
              key={t.slug}
              type="button"
              className={`sutra-chip${
                t.slug === active.slug ? " sutra-chip--active" : ""
              }`}
              onClick={() => handleSelect(t.slug)}
              aria-pressed={t.slug === active.slug}
              lang={t.language}
            >
              <span
                className="sutra-chip-lang"
                aria-hidden="true"
                lang={t.language}
              >
                {t.langLabel}
                {t.audioUrl ? (
                  <span
                    className="sutra-chip-audio-indicator"
                    aria-label="Audio recording available"
                    title="Audio recording available"
                  >
                    {" "}♪
                  </span>
                ) : null}
              </span>
              <span className="sutra-chip-label">{t.chipLabel}</span>
            </button>
          ))}
        </div>
        {compareCandidates.length > 0 && (
          <div className="sutra-compare-toggle-row">
            <button
              type="button"
              className={`sutra-compare-toggle${
                compareOpen ? " sutra-compare-toggle--open" : ""
              }`}
              onClick={toggleCompareOpen}
              aria-expanded={compareOpen}
            >
              {compareSlug ? "Hide compare" : "Compare two translations"}
            </button>
          </div>
        )}
        {compareOpen && (
          <div className="sutra-switcher-compare">
            <span className="sutra-switcher-label">Compare with</span>
            <div className="sutra-switcher-chips">
              {compareCandidates.map((t) => (
                <button
                  key={`cmp-${t.slug}`}
                  type="button"
                  className={`sutra-chip${
                    t.slug === compareSlug ? " sutra-chip--active" : ""
                  }`}
                  onClick={() =>
                    handleCompare(t.slug === compareSlug ? null : t.slug)
                  }
                  aria-pressed={t.slug === compareSlug}
                  lang={t.language}
                >
                  <span
                    className="sutra-chip-lang"
                    aria-hidden="true"
                    lang={t.language}
                  >
                    {t.langLabel}
                  </span>
                  <span className="sutra-chip-label">{t.chipLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {active.audioUrl ? (
        <div className="sutra-audio-panel" aria-label="Chant recording">
          <p className="sutra-audio-label">
            <span className="sutra-audio-icon" aria-hidden="true">
              ♪
            </span>{" "}
            Chant recording
          </p>
          <audio
            controls
            preload="none"
            src={active.audioUrl}
            className="sutra-audio-player"
          >
            Your browser does not support embedded audio. Open the
            recording directly:{" "}
            <a
              href={active.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {active.audioUrl}
            </a>
          </audio>
          {active.audioAttribution || active.audioSourceUrl ? (
            <p className="sutra-audio-attribution">
              {active.audioSourceUrl ? (
                <a
                  href={active.audioSourceUrl}
                  className="detail-inline-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {active.audioAttribution ?? "Source"}
                </a>
              ) : (
                active.audioAttribution
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      <article
        ref={articleRef}
        className={`sutra-prose detail-summary${
          compareTranslation ? " sutra-prose--compare" : ""
        }`}
        lang={compareTranslation ? undefined : active.language}
      >
        {sections.map((section) => {
          const cmp = compareSectionByPassage?.get(section.passageNumber);
          return (
            <section
              key={section.passageNumber}
              id={`passage-${section.passageNumber}`}
              data-passage={section.passageNumber}
              className="sutra-passage"
            >
              <h3 className="sutra-passage-heading">
                <span className="sutra-passage-marker" aria-hidden="true">
                  §{section.passageNumber}
                </span>
                <span className="sutra-passage-title">{section.heading}</span>
              </h3>
              {compareTranslation ? (
                <div className="sutra-passage-grid">
                  <div
                    className="sutra-passage-body"
                    lang={active.language}
                  >
                    <p className="sutra-passage-col-label">
                      {active.langLabel} · {active.translator}
                    </p>
                    {renderBody(
                      section.body,
                      linkTerms.length > 0 ? linkTerms : null
                    )}
                  </div>
                  <div
                    className="sutra-passage-body"
                    lang={compareTranslation.language}
                  >
                    <p className="sutra-passage-col-label">
                      {compareTranslation.langLabel} ·{" "}
                      {compareTranslation.translator}
                    </p>
                    {cmp ? (
                      renderBody(
                        cmp.body,
                        linkTerms.length > 0 ? linkTerms : null
                      )
                    ) : (
                      <p className="detail-muted">
                        Not present in this edition.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="sutra-passage-body">
                  {renderBody(
                    section.body,
                    linkTerms.length > 0 ? linkTerms : null
                  )}
                </div>
              )}
            </section>
          );
        })}
      </article>

      <footer className="sutra-source-footer">
        <p className="sutra-source-line">
          Translated by <strong>{active.translator}</strong>. {active.edition}.{" "}
          <span className="sutra-license-badge">{licenseLabel}</span>
          {active.coverage && active.coverage.kind === "selections" ? (
            <span
              className="sutra-coverage-badge"
              title={active.coverage.sections}
            >
              Selected chapters
            </span>
          ) : null}
        </p>
        <p className="sutra-source-line">
          {active.source.url ? (
            <a
              href={active.source.url}
              className="detail-inline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {active.source.title}
            </a>
          ) : (
            <span>{active.source.title}</span>
          )}
          {active.source.locator ? (
            <span className="detail-list-meta"> · {active.source.locator}</span>
          ) : null}
          {active.coverage && active.coverage.kind === "selections" ? (
            <span className="detail-list-meta">
              {" "}· {active.coverage.sections}
            </span>
          ) : null}
        </p>
      </footer>
    </>
  );
}

function formatLicense(status: string): string {
  switch (status) {
    case "public_domain":
      return "Public domain";
    case "cc_by":
      return "CC BY";
    case "cc_by_sa":
      return "CC BY-SA";
    default:
      return status;
  }
}
