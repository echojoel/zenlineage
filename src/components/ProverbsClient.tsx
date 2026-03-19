"use client";

import { useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import type { ProverbListItem } from "@/app/proverbs/page";

const BATCH_SIZE = 12;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Props {
  proverbs: ProverbListItem[];
  allThemes: { slug: string; name: string }[];
  schoolNames: Record<string, string>;
}

export default function ProverbsClient({
  proverbs,
  allThemes,
  schoolNames,
}: Props) {
  const [order, setOrder] = useState(proverbs);
  const [query, setQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const handleShuffle = useCallback(() => {
    setOrder(shuffle(order));
    setVisibleCount(BATCH_SIZE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [order]);

  const fuse = useMemo(
    () =>
      new Fuse(order, {
        keys: ["title", "content", "attributedName"],
        threshold: 0.35,
        distance: 200,
      }),
    [order]
  );

  const filtered = useMemo(() => {
    let base = order;
    if (query.trim()) {
      base = fuse.search(query).map((r) => r.item);
    }
    if (selectedTheme !== "all") {
      base = base.filter((p) =>
        p.themes.some((t) => t.slug === selectedTheme)
      );
    }
    if (selectedSchool !== "all") {
      base = base.filter((p) => p.schoolId === selectedSchool);
    }
    if (selectedEra !== "all") {
      base = base.filter((p) => p.era === selectedEra);
    }
    return base;
  }, [proverbs, query, selectedTheme, selectedSchool, selectedEra, fuse]);

  // Reset visible count when filters change
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const uniqueSchools = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of proverbs) {
      if (p.schoolId && !seen.has(p.schoolId)) {
        seen.set(p.schoolId, schoolNames[p.schoolId] ?? p.schoolId);
      }
    }
    return Array.from(seen.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [proverbs, schoolNames]);

  const uniqueEras = useMemo(() => {
    const ERA_ORDER: Record<string, { rank: number; dates: string }> = {
      "Han": { rank: 1, dates: "206 BCE–220 CE" },
      "Liang": { rank: 2, dates: "502–557" },
      "Sui": { rank: 3, dates: "581–618" },
      "Tang": { rank: 4, dates: "618–907" },
      "Five Dynasties": { rank: 5, dates: "907–979" },
      "Song": { rank: 6, dates: "960–1279" },
      "Kamakura": { rank: 7, dates: "1185–1333" },
      "Muromachi": { rank: 8, dates: "1336–1573" },
      "Edo": { rank: 9, dates: "1603–1868" },
      "Meiji": { rank: 10, dates: "1868–1912" },
      "Showa": { rank: 11, dates: "1926–1989" },
      "Heisei": { rank: 12, dates: "1989–2019" },
      "Contemporary": { rank: 13, dates: "present" },
    };
    const seen = new Set<string>();
    for (const p of proverbs) {
      if (p.era) seen.add(p.era);
    }
    return Array.from(seen)
      .sort((a, b) => (ERA_ORDER[a]?.rank ?? 99) - (ERA_ORDER[b]?.rank ?? 99))
      .map((era) => ({ name: era, dates: ERA_ORDER[era]?.dates ?? "" }));
  }, [proverbs]);

  return (
    <div className="proverbs-page">
      {/* Controls */}
      <div className="proverbs-controls">
        <input
          type="text"
          className="masters-search"
          placeholder="Search proverbs…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(BATCH_SIZE);
          }}
        />

        {uniqueSchools.length > 0 && (
          <select
            className="masters-select"
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setVisibleCount(BATCH_SIZE);
            }}
          >
            <option value="all">All schools</option>
            {uniqueSchools.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}

        {uniqueEras.length > 1 && (
          <select
            className="masters-select"
            value={selectedEra}
            onChange={(e) => {
              setSelectedEra(e.target.value);
              setVisibleCount(BATCH_SIZE);
            }}
          >
            <option value="all">All eras</option>
            {uniqueEras.map((era) => (
              <option key={era.name} value={era.name}>
                {era.name} ({era.dates})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Theme pills */}
      <div className="proverbs-theme-pills">
        <button
          className={`proverbs-theme-pill${selectedTheme === "all" ? " active" : ""}`}
          onClick={() => {
            setSelectedTheme("all");
            setVisibleCount(BATCH_SIZE);
          }}
        >
          All
        </button>
        {allThemes.map((t) => (
          <button
            key={t.slug}
            className={`proverbs-theme-pill${selectedTheme === t.slug ? " active" : ""}`}
            onClick={() => {
              setSelectedTheme(selectedTheme === t.slug ? "all" : t.slug);
              setVisibleCount(BATCH_SIZE);
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="proverbs-meta">
        <p className="masters-count">{filtered.length} proverbs</p>
        <button className="proverbs-shuffle-btn" onClick={handleShuffle}>
          Shuffle
        </button>
      </div>

      {/* Proverb list */}
      <div className="proverbs-list">
        {visible.map((p) => (
          <ProverbEntry key={p.id} proverb={p} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="proverbs-load-more">
          <button
            className="proverbs-load-more-btn"
            onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}
          >
            Show more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

function ProverbEntry({ proverb }: { proverb: ProverbListItem }) {
  return (
    <div className="proverb-entry">
      <div className="proverb-content">{proverb.content}</div>
      <div className="proverb-attribution">
        {proverb.attributedSlug ? (
          <Link
            href={`/masters/${proverb.attributedSlug}`}
            className="detail-inline-link"
          >
            {proverb.attributedName}
          </Link>
        ) : (
          <span>Traditional Zen Proverb</span>
        )}
        {proverb.era && <span className="proverb-era">{proverb.era}</span>}
      </div>
      {proverb.themes.length > 0 && (
        <div className="proverb-tags">
          {proverb.themes.map((t) => (
            <span key={t.slug} className="proverb-theme-tag">
              {t.name.toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
