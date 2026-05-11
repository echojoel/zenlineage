"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type {
  TimelineEra,
  BibliographyEntry,
  EventCitation,
  Mention,
} from "@/lib/timeline-editorial";
import {
  FootnoteList,
  renderProseWithFootnotes,
  type FootnoteRef as FootnoteRefEntry,
} from "@/lib/footnotes";

export interface ResolvedMaster {
  slug: string;
  name: string;
  imagePath: string | null;
}

export interface ResolvedSchool {
  slug: string;
  name: string;
}

interface Props {
  eras: TimelineEra[];
  masterMap: Record<string, ResolvedMaster>;
  schoolMap: Record<string, ResolvedSchool>;
  bibliography: Record<string, BibliographyEntry>;
}

function formatYear(year: number, precision: "exact" | "circa" | "century"): string {
  const abs = Math.abs(year);
  const suffix = year < 0 ? " BCE" : " CE";
  if (precision === "century") {
    const century = Math.ceil(abs / 100);
    return `${century}th c.${suffix}`;
  }
  const prefix = precision === "circa" ? "c. " : "";
  return `${prefix}${abs}${suffix}`;
}

function formatYearRange(
  start: number,
  end: number | undefined,
  precision: "exact" | "circa" | "century"
): string {
  const s = formatYear(start, precision);
  if (!end || end === start) return s;
  const abs = Math.abs(end);
  const suffix = end < 0 ? " BCE" : " CE";
  return `${s} – ${abs}${suffix}`;
}

const FN_SCOPE = "timeline";

function citeTupleKey(c: EventCitation): string {
  return `${c.key}::${c.pages ?? ""}`;
}

function buildFootnotes(
  eras: TimelineEra[],
  bibliography: Record<string, BibliographyEntry>
): {
  indexByCiteKey: Map<string, number>;
  footnoteRefs: FootnoteRefEntry[];
} {
  const indexByCiteKey = new Map<string, number>();
  const footnoteRefs: FootnoteRefEntry[] = [];

  const visit = (citations: EventCitation[]) => {
    for (const c of citations) {
      const tupleKey = citeTupleKey(c);
      if (indexByCiteKey.has(tupleKey)) continue;
      const bib = bibliography[c.key];
      if (!bib) continue;
      const index = footnoteRefs.length + 1;
      indexByCiteKey.set(tupleKey, index);
      footnoteRefs.push({
        index,
        sourceTitle: bib.title,
        author: bib.author,
        pageOrSection: c.pages ?? `${bib.year}`,
        sourceUrl: bib.url ?? null,
      });
    }
  };

  for (const era of eras) {
    for (const event of era.events) visit(event.citations);
    visit(era.citations);
  }

  return { indexByCiteKey, footnoteRefs };
}

/**
 * Authored event descriptions embed local `[N]` markers (where N matches
 * the event's own `citations[].index` field). The timeline keeps a single
 * global References list, so we remap each event's local indexes to the
 * shared global ones before passing the prose to renderProseWithFootnotes.
 * Markers without a resolvable global index are left intact (the renderer
 * will surface them as plain text, making authoring slips visible).
 */
function remapMarkersToGlobal(
  description: string,
  citations: EventCitation[],
  indexByCiteKey: Map<string, number>
): string {
  const localToGlobal = new Map<number, number>();
  for (const c of citations) {
    const global = indexByCiteKey.get(citeTupleKey(c));
    if (typeof global !== "number") continue;
    const localIndex = (c as { index?: number }).index;
    if (typeof localIndex === "number") {
      localToGlobal.set(localIndex, global);
    }
  }
  return description.replace(/\[(\d+)\]/g, (match, raw) => {
    const remapped = localToGlobal.get(Number(raw));
    return remapped !== undefined ? `[${remapped}]` : match;
  });
}

function MasterMention({
  mention,
  masterMap,
}: {
  mention: Mention;
  masterMap: Record<string, ResolvedMaster>;
}) {
  const resolved = mention.slug ? masterMap[mention.slug] : null;

  if (resolved) {
    return (
      <Link href={`/masters/${resolved.slug}`} className="timeline-master-link">
        {resolved.imagePath && (
          <Image
            src={resolved.imagePath}
            alt={resolved.name}
            width={28}
            height={28}
            className="timeline-master-portrait"
          />
        )}
        <span className="timeline-master-name">{resolved.name}</span>
      </Link>
    );
  }

  return <span className="timeline-master-name">{mention.label}</span>;
}

function SchoolMention({
  mention,
  schoolMap,
}: {
  mention: Mention;
  schoolMap: Record<string, ResolvedSchool>;
}) {
  const resolved = mention.slug ? schoolMap[mention.slug] : null;

  if (resolved) {
    return (
      <Link href={`/schools/${resolved.slug}`} className="timeline-school-link">
        {resolved.name}
      </Link>
    );
  }

  return <span className="timeline-school-tag">{mention.label}</span>;
}

export default function TimelineClient({
  eras,
  masterMap,
  schoolMap,
  bibliography,
}: Props) {
  const { indexByCiteKey, footnoteRefs } = buildFootnotes(eras, bibliography);

  const [enhanced, setEnhanced] = useState(false);
  const [activeEraId, setActiveEraId] = useState(eras[0]?.id ?? "");
  const [visibleEntries, setVisibleEntries] = useState<Set<string>>(new Set());

  const eraRefs = useRef<Map<string, HTMLElement>>(new Map());
  const entryRefs = useRef<Map<string, HTMLElement>>(new Map());

  const eraRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) eraRefs.current.set(id, el);
      else eraRefs.current.delete(id);
    },
    []
  );

  const entryRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) entryRefs.current.set(id, el);
      else entryRefs.current.delete(id);
    },
    []
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    setEnhanced(true);

    // Era observer — update sticky indicator
    const eraObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveEraId(entry.target.getAttribute("data-era-id") ?? "");
          }
        }
      },
      { threshold: 0.3 }
    );

    // Entry observer — reveal on scroll, once visible stays visible
    const entryObserver = new IntersectionObserver(
      (entries) => {
        const newVisible: string[] = [];
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-entry-id");
            if (id) newVisible.push(id);
          }
        }
        if (newVisible.length > 0) {
          setVisibleEntries((prev) => {
            const next = new Set(prev);
            for (const id of newVisible) next.add(id);
            return next;
          });
        }
      },
      { threshold: 0.15 }
    );

    for (const el of eraRefs.current.values()) eraObserver.observe(el);
    for (const el of entryRefs.current.values()) entryObserver.observe(el);

    return () => {
      eraObserver.disconnect();
      entryObserver.disconnect();
    };
  }, []);

  const activeEra = eras.find((e) => e.id === activeEraId) ?? eras[0];

  return (
    <div className={`timeline-container${enhanced ? " timeline-enhanced" : ""}`}>
      <div className="timeline-era-indicator">
        {activeEra.title} &middot; {activeEra.subtitle}
      </div>
      <div className="timeline-axis" />

      {eras.map((era) => (
        <section
          key={era.id}
          className="timeline-era"
          data-era-id={era.id}
          ref={eraRef(era.id)}
        >
          <div className="timeline-era-header">
            <h2>{era.title}</h2>
            <span className="timeline-era-subtitle">{era.subtitle}</span>
            <div className="timeline-era-intro">
              {renderProseWithFootnotes(
                remapMarkersToGlobal(era.introduction, era.citations, indexByCiteKey),
                footnoteRefs,
                {
                  idScope: `timeline-era-${era.id}`,
                  anchorScope: FN_SCOPE,
                  suppressList: true,
                }
              )}
            </div>
          </div>

          {era.events.map((event) => (
            <article
              key={event.id}
              className={`timeline-entry${visibleEntries.has(event.id) ? " visible" : ""}`}
              data-entry-id={event.id}
              ref={entryRef(event.id)}
            >
              <div className="timeline-entry-marker" />
              <div className="timeline-entry-content">
                <span className="timeline-year">
                  {formatYearRange(event.yearStart, event.yearEnd, event.precision)}
                </span>
                <h3>{event.title}</h3>
                {renderProseWithFootnotes(
                  remapMarkersToGlobal(event.description, event.citations, indexByCiteKey),
                  footnoteRefs,
                  {
                    idScope: `timeline-${event.id}`,
                    anchorScope: FN_SCOPE,
                    suppressList: true,
                  }
                )}

                {event.masters.length > 0 && (
                  <div className="timeline-masters">
                    {event.masters.map((m, i) => (
                      <MasterMention key={i} mention={m} masterMap={masterMap} />
                    ))}
                  </div>
                )}

                {event.schools.length > 0 && (
                  <div className="timeline-schools">
                    {event.schools.map((s, i) => (
                      <SchoolMention key={i} mention={s} schoolMap={schoolMap} />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ))}

      <FootnoteList
        refs={footnoteRefs}
        scope={FN_SCOPE}
        title="References"
      />
    </div>
  );
}
