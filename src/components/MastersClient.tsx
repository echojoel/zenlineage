"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { formatDateWithPrecision } from "@/lib/date-format";
import type { MasterListItem } from "@/lib/master-list";

interface Props {
  masters: MasterListItem[];
  schoolNames: Record<string, string>;
}

type ViewMode = "grid" | "list";

export default function MastersClient({ masters, schoolNames }: Props) {
  const [query, setQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const fuse = useMemo(
    () =>
      new Fuse(masters, {
        keys: ["primaryName", "searchText"],
        threshold: 0.35,
        distance: 100,
      }),
    [masters]
  );

  const filtered = useMemo(() => {
    let base = masters;
    if (query.trim()) {
      base = fuse.search(query).map((r) => r.item);
    }
    if (selectedSchool !== "all") {
      base = base.filter((m) => m.schoolId === selectedSchool);
    }
    return base;
  }, [masters, query, selectedSchool, fuse]);

  const uniqueSchools = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of masters) {
      if (m.schoolId && !seen.has(m.schoolId)) {
        seen.set(m.schoolId, schoolNames[m.schoolId] ?? m.schoolId);
      }
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [masters, schoolNames]);

  return (
    <div className="masters-page">
      {/* Controls */}
      <div className="masters-controls">
        <input
          type="text"
          className="masters-search"
          placeholder="Search masters…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="masters-select"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="all">All schools</option>
          {uniqueSchools.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <div className="view-toggle">
          <button
            className={`view-btn${viewMode === "grid" ? " active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            ▦
          </button>
          <button
            className={`view-btn${viewMode === "list" ? " active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <p className="masters-count">{filtered.length} masters</p>

      {/* Master list/grid */}
      <div className={viewMode === "grid" ? "masters-grid" : "masters-list"}>
        {filtered.map((m) => (
          <MasterCard
            key={m.id}
            master={m}
            schoolName={m.schoolId ? (schoolNames[m.schoolId] ?? m.schoolId) : undefined}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}

function MasterCard({
  master,
  schoolName,
  viewMode,
}: {
  master: MasterListItem;
  schoolName?: string;
  viewMode: ViewMode;
}) {
  const birth = formatDateWithPrecision(master.birthYear, master.birthPrecision, {
    unknown: "?",
  });
  const death = formatDateWithPrecision(master.deathYear, master.deathPrecision, {
    unknown: "?",
  });
  const hasDates = master.birthYear != null || master.deathYear != null;

  if (viewMode === "list") {
    return (
      <Link className="master-list-row" href={`/masters/${master.slug}`}>
        <span className="master-list-name">{master.primaryName}</span>
        {schoolName && <span className="master-list-school">{schoolName}</span>}
        {hasDates && (
          <span className="master-list-dates">
            {birth} – {death}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link className="master-card" href={`/masters/${master.slug}`}>
      <div className="master-card-name">{master.primaryName}</div>
      {schoolName && <div className="master-card-school">{schoolName}</div>}
      {hasDates && (
        <div className="master-card-dates">
          <span className="precision-badge">
            {birth} – {death}
          </span>
        </div>
      )}
    </Link>
  );
}
