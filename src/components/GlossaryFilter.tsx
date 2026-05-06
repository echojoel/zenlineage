"use client";

/**
 * Tradition filter for the /glossary page. Reads + writes the
 * `?tradition=...` URL search param so a filter selection is
 * shareable and shows up in browser history.
 *
 * The actual filtering of glossary entries happens client-side via
 * a CSS class toggled on the `<body>`-style root element, driven by
 * a small inline script + this component. Keeps the page SSR-friendly
 * and cheap.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ORDER = ["all", "Chan", "Zen", "Seon", "Thiền"] as const;
type Tradition = (typeof ORDER)[number];

const LABELS: Record<Tradition, string> = {
  all: "All",
  Chan: "Chinese — Chán",
  Zen: "Japanese — Zen",
  Seon: "Korean — Seon",
  Thiền: "Vietnamese — Thiền",
};

function applyClass(tradition: Tradition) {
  const root = document.querySelector<HTMLElement>("[data-glossary-root]");
  if (!root) return;
  root.dataset.activeTradition = tradition;
}

export default function GlossaryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tradition") as Tradition | null) ?? "all";
  const [active, setActive] = useState<Tradition>(
    ORDER.includes(initial as Tradition) ? (initial as Tradition) : "all"
  );

  // Sync the data-active-tradition attribute on mount and when the URL
  // changes externally (back/forward).
  useEffect(() => {
    applyClass(active);
  }, [active]);

  // Keep state in sync if the URL changes from outside (e.g. back btn).
  useEffect(() => {
    const param = (searchParams.get("tradition") as Tradition | null) ?? "all";
    if (ORDER.includes(param as Tradition) && param !== active) {
      setActive(param as Tradition);
    }
  }, [searchParams, active]);

  const select = useCallback(
    (tradition: Tradition) => {
      setActive(tradition);
      const next = new URLSearchParams(searchParams.toString());
      if (tradition === "all") next.delete("tradition");
      else next.set("tradition", tradition);
      const qs = next.toString();
      router.replace(qs ? `/glossary?${qs}` : "/glossary", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="glossary-filter">
      {ORDER.map((t) => (
        <button
          key={t}
          type="button"
          className={`glossary-filter-chip${
            t === active ? " glossary-filter-chip--active" : ""
          }`}
          onClick={() => select(t)}
          aria-pressed={t === active}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  );
}
