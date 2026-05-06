"use client";

/**
 * URL-driven /practice UX. Single page, single state — selection lives
 * in the `?school=` query param. Picker chips highlight the active
 * school; map filters to it; practice-instruction list renders below
 * the map only when something is selected.
 *
 * Server pre-fetches the schools list (so chips render before JS) and
 * passes it in. Practice instructions are loaded client-side from
 * `/data/practice-instructions.json` (baked at build time).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const PracticeMap = dynamic(() => import("@/components/PracticeMap"), {
  ssr: false,
  loading: () => <p className="detail-muted">Loading map…</p>,
});

/** Order traditions present themselves in the directory: source-tradition
 *  Chinese first (chronological root), then the four regional branches. */
const TRADITION_ORDER = ["Chan", "Zen", "Seon", "Thiền"] as const;
const TRADITION_HEADINGS: Record<(typeof TRADITION_ORDER)[number], string> = {
  Chan: "Chinese — Chán",
  Zen: "Japanese — Zen",
  Seon: "Korean — Seon",
  Thiền: "Vietnamese — Thiền",
};

export interface SchoolChip {
  slug: string;
  name: string;
  tradition: string | null;
  templeCount: number;
  instructionCount: number;
}

interface PracticeInstructionView {
  slug: string;
  title: string;
  content: string;
  collection: string | null;
  type: string | null;
  attributionStatus: string | null;
  authorSlug: string | null;
  authorName: string | null;
  translator: string | null;
  edition: string | null;
  licenseStatus: string | null;
  sources: { id: string; title: string | null; url: string | null }[];
}

type InstructionsPayload = Record<string, PracticeInstructionView[]>;

export default function PracticeExperience({ schools }: { schools: SchoolChip[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("school") ?? "";
  const mapCardRef = useRef<HTMLElement | null>(null);

  const [instructions, setInstructions] = useState<InstructionsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/practice-instructions.json")
      .then((res) => (res.ok ? (res.json() as Promise<InstructionsPayload>) : null))
      .then((payload) => {
        if (!cancelled && payload) setInstructions(payload);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectSchool = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (selected === slug) {
        next.delete("school");
      } else {
        next.set("school", slug);
      }
      const qs = next.toString();
      router.replace(qs ? `/practice?${qs}` : "/practice", { scroll: false });
    },
    [router, searchParams, selected]
  );

  const activeSchool = useMemo(
    () => schools.find((s) => s.slug === selected) ?? null,
    [schools, selected]
  );

  const activeInstructions = activeSchool
    ? instructions?.[activeSchool.slug] ?? []
    : [];

  // Schools grouped by source tradition, used by both the dropdown
  // (rendered as <optgroup>s) and the directory (4-column block below
  // the map). Within a tradition, sort by temple count desc so the
  // most-active schools come first.
  const schoolsByTradition = useMemo(() => {
    const groups = new Map<string, SchoolChip[]>();
    for (const s of schools) {
      const key = s.tradition ?? "Other";
      const list = groups.get(key) ?? [];
      list.push(s);
      groups.set(key, list);
    }
    for (const list of groups.values()) {
      list.sort(
        (a, b) =>
          b.templeCount - a.templeCount || a.name.localeCompare(b.name)
      );
    }
    return groups;
  }, [schools]);

  const orderedTraditions = useMemo(() => {
    const result: { key: string; heading: string; items: SchoolChip[] }[] = [];
    for (const t of TRADITION_ORDER) {
      const items = schoolsByTradition.get(t);
      if (items && items.length > 0) {
        result.push({ key: t, heading: TRADITION_HEADINGS[t], items });
      }
    }
    // Anything not in the canonical four (e.g. "Other") at the end.
    for (const [key, items] of schoolsByTradition.entries()) {
      if (TRADITION_ORDER.includes(key as (typeof TRADITION_ORDER)[number])) continue;
      if (items.length === 0) continue;
      result.push({ key, heading: key, items });
    }
    return result;
  }, [schoolsByTradition]);

  const totalTemples = useMemo(
    () => schools.reduce((n, s) => n + s.templeCount, 0),
    [schools]
  );

  const onDirectoryPick = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (selected === slug) next.delete("school");
      else next.set("school", slug);
      const qs = next.toString();
      router.replace(qs ? `/practice?${qs}` : "/practice", { scroll: false });
      // Stay where the user is — the practice-instructions block
      // appears immediately below the directory, so they see it
      // without losing the school list from view.
    },
    [router, searchParams, selected]
  );

  const clearFilter = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("school");
    const qs = next.toString();
    router.replace(qs ? `/practice?${qs}` : "/practice", { scroll: false });
  }, [router, searchParams]);

  return (
    <>
      <section
        className="detail-card detail-card--wide practice-map-card"
        ref={mapCardRef}
      >
        <div className="practice-filter-bar">
          <label htmlFor="practice-school-select" className="practice-filter-label">
            School
          </label>
          <select
            id="practice-school-select"
            className="practice-filter-select"
            value={selected}
            onChange={(e) => {
              const v = e.target.value;
              const next = new URLSearchParams(searchParams.toString());
              if (v) next.set("school", v);
              else next.delete("school");
              const qs = next.toString();
              router.replace(qs ? `/practice?${qs}` : "/practice", { scroll: false });
            }}
          >
            <option value="">All schools ({totalTemples})</option>
            {orderedTraditions.map((g) => (
              <optgroup key={g.key} label={g.heading}>
                {g.items.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                    {s.templeCount > 0 ? ` — ${s.templeCount}` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {activeSchool && (
            <>
              <span className="practice-filter-summary">
                {activeSchool.templeCount}{" "}
                {activeSchool.templeCount === 1 ? "place" : "places"}
                {activeSchool.instructionCount > 0
                  ? ` · ${activeSchool.instructionCount} instr.`
                  : ""}
              </span>
              <button
                type="button"
                className="practice-filter-clear"
                onClick={clearFilter}
              >
                Clear filter
              </button>
            </>
          )}
        </div>

        <PracticeMap selectedSchool={selected || null} />
        <p
          className="detail-muted"
          style={{ marginTop: "0.75rem", fontSize: "0.72rem" }}
        >
          Map tiles from{" "}
          <a
            className="detail-inline-link"
            href="https://openfreemap.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenFreeMap
          </a>
          . Map data ©{" "}
          <a
            className="detail-inline-link"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
          </a>
          .
        </p>
        {activeSchool && (
          <div className="practice-filter-clear-row">
            <button
              type="button"
              className="practice-filter-clear"
              onClick={clearFilter}
            >
              Clear filter — show all schools
            </button>
          </div>
        )}
      </section>

      <section className="detail-card detail-card--wide">
        <h3 className="detail-section-title">Browse by tradition</h3>
        <div className="practice-traditions">
          {orderedTraditions.map((g) => (
            <div key={g.key} className="practice-tradition">
              <h4 className="practice-tradition-heading">
                {g.heading}
                <span className="practice-tradition-heading-meta">
                  {g.items.reduce((n, s) => n + s.templeCount, 0)} places
                </span>
              </h4>
              <ul className="practice-tradition-list">
                {g.items.map((s) => {
                  const isActive = s.slug === selected;
                  return (
                    <li key={s.slug}>
                      <button
                        type="button"
                        className={`practice-tradition-school${
                          isActive ? " practice-tradition-school--active" : ""
                        }`}
                        onClick={() => onDirectoryPick(s.slug)}
                        aria-pressed={isActive}
                        title={
                          s.instructionCount > 0
                            ? `${s.instructionCount} practice instruction${
                                s.instructionCount === 1 ? "" : "s"
                              }`
                            : undefined
                        }
                      >
                        <span className="practice-tradition-school-name">
                          {s.name}
                        </span>
                        <span
                          className={`practice-tradition-school-count${
                            s.templeCount === 0
                              ? " practice-tradition-school-count--zero"
                              : ""
                          }`}
                        >
                          {s.templeCount > 0 ? s.templeCount : "–"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {activeSchool && activeInstructions.length > 0 && (
        <section className="detail-card">
          <h3 className="detail-section-title">
            Practice instructions — {activeSchool.name}
          </h3>
          <ul
            className="detail-link-list"
            style={{ listStyle: "none", padding: 0 }}
          >
            {activeInstructions.map((p) => (
              <li
                key={p.slug}
                style={{
                  padding: "1.25rem 0",
                  borderBottom: "1px solid rgba(122, 106, 85, 0.15)",
                }}
              >
                <h4
                  className="detail-subsection-title"
                  style={{ marginBottom: "0.4rem" }}
                >
                  <Link className="detail-inline-link" href={`/teachings/${p.slug}`}>
                    {p.title}
                  </Link>
                </h4>
                <p
                  className="proverb-content"
                  style={{ textAlign: "left", marginBottom: "0.6rem" }}
                >
                  {p.content}
                </p>
                <p className="detail-list-meta" style={{ marginBottom: "0.25rem" }}>
                  {p.authorName && p.authorSlug ? (
                    <>
                      <Link
                        className="detail-inline-link"
                        href={`/masters/${p.authorSlug}`}
                      >
                        {p.authorName}
                      </Link>
                      {p.collection ? ` · ${p.collection}` : ""}
                    </>
                  ) : (
                    p.collection
                  )}
                </p>
                <p className="detail-source-excerpt" style={{ fontSize: "0.7rem" }}>
                  {p.translator ? `Trans. ${p.translator}` : null}
                  {p.translator && p.edition ? " · " : null}
                  {p.edition}
                  {p.licenseStatus ? (
                    <>
                      {p.translator || p.edition ? " · " : null}
                      License: {p.licenseStatus.replace(/_/g, " ")}
                    </>
                  ) : null}
                </p>
                {p.sources.length > 0 && (
                  <p className="detail-source-excerpt" style={{ fontSize: "0.7rem" }}>
                    Source:{" "}
                    {p.sources.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 ? "; " : ""}
                        {s.url ? (
                          <a
                            className="detail-source-link"
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {s.title ?? s.id}
                          </a>
                        ) : (
                          s.title ?? s.id
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
