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

export interface SutraTranslation {
  /** Slug of the *teaching* row (e.g. "heart-sutra-mueller-1894"). */
  slug: string;
  /** Short label for the chip — translator surname + year. */
  chipLabel: string;
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
}

interface Props {
  sutraTitle: string;
  translations: SutraTranslation[];
  /** chip-slug to use when ?translator= is missing or invalid. */
  defaultTranslator: string;
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

function renderInline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const star = text.indexOf("*", i);
    if (star === -1) {
      out.push(text.slice(i));
      break;
    }
    if (star > i) out.push(text.slice(i, star));
    const close = text.indexOf("*", star + 1);
    if (close === -1) {
      out.push(text.slice(star));
      break;
    }
    out.push(<em key={`em-${key++}`}>{text.slice(star + 1, close)}</em>);
    i = close + 1;
  }
  return out;
}

function renderBody(body: string): React.ReactNode[] {
  const blocks = body.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const allItalic = /^\*[^*]+\*$/.test(trimmed.replace(/\n/g, " "));
    const lines = trimmed.split("\n");
    const rendered = lines.map((line, j) => (
      <span key={j}>
        {renderInline(line)}
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
}: Props) {
  const validSlugs = useMemo(
    () => new Set(translations.map((t) => t.slug)),
    [translations]
  );
  const [activeSlug, setActiveSlug] = useState<string>(defaultTranslator);
  const articleRef = useRef<HTMLElement | null>(null);
  const initialPassageRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const wantTranslator = params.get("translator");
    const wantPassage = params.get("passage");
    if (wantTranslator && validSlugs.has(wantTranslator)) {
      setActiveSlug(wantTranslator);
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

  const handleSelect = useCallback(
    (slug: string) => {
      if (slug === activeSlug) return;
      const params = new URLSearchParams(window.location.search);
      params.set("translator", slug);
      const passage = params.get("passage");
      if (passage) {
        initialPassageRef.current = passage;
      } else {
        const sections = articleRef.current?.querySelectorAll<HTMLElement>(
          "[data-passage]"
        );
        if (sections) {
          const viewportTop = window.scrollY + 100;
          let nearest: string | null = null;
          for (const s of sections) {
            if (s.offsetTop <= viewportTop) {
              nearest = s.dataset.passage ?? null;
            } else {
              break;
            }
          }
          if (nearest) {
            initialPassageRef.current = nearest;
            params.set("passage", nearest);
          }
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
    [activeSlug]
  );

  const active =
    translations.find((t) => t.slug === activeSlug) ??
    translations.find((t) => t.slug === defaultTranslator) ??
    translations[0];

  if (!active) {
    return <p className="detail-muted">No translations available yet.</p>;
  }

  const sections = parseSections(active.content);
  const licenseLabel = formatLicense(active.licenseStatus);

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
              className={`glossary-filter-chip${
                t.slug === active.slug ? " glossary-filter-chip--active" : ""
              }`}
              onClick={() => handleSelect(t.slug)}
              aria-pressed={t.slug === active.slug}
            >
              {t.chipLabel}
            </button>
          ))}
        </div>
      </div>

      <article ref={articleRef} className="sutra-prose detail-summary">
        {sections.map((section) => (
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
            <div className="sutra-passage-body">{renderBody(section.body)}</div>
          </section>
        ))}
      </article>

      <footer className="sutra-source-footer">
        <p className="sutra-source-line">
          Translated by <strong>{active.translator}</strong>. {active.edition}.{" "}
          <span className="sutra-license-badge">{licenseLabel}</span>
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
