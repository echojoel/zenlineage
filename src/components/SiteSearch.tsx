"use client";

/**
 * Site-wide search.
 *
 * Lives at the root of the layout so it's available on every page.
 * Renders a fixed-position trigger pill (bottom-right) and a centered
 * dialog. The dialog lazy-loads `/data/search-index.json` on first
 * open and runs Fuse.js against it locally.
 *
 * Keyboard:
 *   Cmd/Ctrl+K, /  open the dialog
 *   Esc            close
 *   ↑/↓            move selection
 *   Enter          navigate to highlighted result
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import type { SearchEntry } from "@/lib/search-types";

const TYPE_LABELS: Record<SearchEntry["type"], string> = {
  master: "Master",
  school: "School",
  teaching: "Teaching",
  glossary: "Term",
  temple: "Temple",
};

export default function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Lazy-fetch the index the first time the dialog opens. Cached for
  // the rest of the session in component state.
  useEffect(() => {
    if (!open || entries) return;
    let cancelled = false;
    fetch("/data/search-index.json")
      .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : []))
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, entries]);

  // External components can open the dialog by dispatching a custom
  // event on `window`. The homepage uses this so its dedicated search
  // bar opens the same dialog without having to lift state up. The
  // event optionally carries a prefilled query (used by the
  // SearchAction sitelinks-search-box landing).
  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ q?: string }>).detail;
      if (detail?.q) setQuery(detail.q);
      setOpen(true);
    }
    window.addEventListener("zen:open-search", onOpen);
    return () => window.removeEventListener("zen:open-search", onOpen);
  }, []);

  // Honor the SearchAction landing pattern advertised in the WebSite
  // JSON-LD: a visit to `/?q=...` opens search prefilled with the
  // query. Fired once per page load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length > 0) {
      setQuery(q);
      setOpen(true);
    }
  }, []);

  // Global keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd/Ctrl+K: toggle. `/` only when no input is focused.
      const target = e.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target as HTMLElement | null)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input on open and reset transient state.
  useEffect(() => {
    if (open) {
      // Small timeout so the dialog mounts before focus.
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      setHighlight(0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const fuse = useMemo(() => {
    if (!entries) return null;
    return new Fuse(entries, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "nativeTitle", weight: 0.2 },
        { name: "secondary", weight: 0.1 },
        { name: "blurb", weight: 0.1 },
      ],
      threshold: 0.35,
      distance: 200,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [entries]);

  const results = useMemo(() => {
    if (!fuse || !entries) return [];
    if (!query.trim()) {
      // Empty query: show a sample landing of one item per type so the
      // dialog doesn't look broken when the user opens it cold.
      const seen = new Set<SearchEntry["type"]>();
      const sample: SearchEntry[] = [];
      for (const e of entries) {
        if (seen.has(e.type)) continue;
        seen.add(e.type);
        sample.push(e);
        if (seen.size >= 4) break;
      }
      return sample;
    }
    return fuse.search(query, { limit: 30 }).map((r) => r.item);
  }, [fuse, entries, query]);

  // Keep highlight in valid range and scroll into view.
  useEffect(() => {
    if (highlight >= results.length) setHighlight(0);
  }, [results, highlight]);
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${highlight}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const navigateTo = useCallback(
    (entry: SearchEntry) => {
      setOpen(false);
      setQuery("");
      router.push(entry.url);
    },
    [router]
  );

  const onListKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(results.length - 1, h + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
      } else if (e.key === "Enter" && results[highlight]) {
        e.preventDefault();
        navigateTo(results[highlight]);
      }
    },
    [results, highlight, navigateTo]
  );

  return (
    <>
      <button
        type="button"
        className="site-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
      >
        <span className="site-search-trigger-icon" aria-hidden>
          ⌕
        </span>
        <span className="site-search-trigger-label">Search</span>
        <kbd className="site-search-trigger-kbd">⌘K</kbd>
      </button>

      {open && (
        <div
          className="site-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={onListKey}
        >
          <div className="site-search-dialog">
            <div className="site-search-input-row">
              <span className="site-search-input-icon" aria-hidden>
                ⌕
              </span>
              <input
                ref={inputRef}
                className="site-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder="Search masters, schools, teachings, glossary…"
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="button"
                className="site-search-close"
                onClick={() => setOpen(false)}
                aria-label="Close search"
              >
                Esc
              </button>
            </div>

            {!entries && (
              <p className="site-search-status">Loading index…</p>
            )}

            {entries && results.length === 0 && (
              <p className="site-search-status">
                {query.trim()
                  ? `No matches for “${query.trim()}”.`
                  : "Type to search."}
              </p>
            )}

            {entries && results.length > 0 && (
              <ul ref={listRef} className="site-search-results">
                {results.map((entry, idx) => (
                  <li key={`${entry.type}:${entry.slug}`}>
                    <button
                      type="button"
                      data-idx={idx}
                      className={`site-search-result${
                        idx === highlight ? " site-search-result--active" : ""
                      }`}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => navigateTo(entry)}
                    >
                      <span className="site-search-result-type">
                        {TYPE_LABELS[entry.type]}
                      </span>
                      <span className="site-search-result-body">
                        <span className="site-search-result-title">
                          {entry.title}
                          {entry.nativeTitle && (
                            <span className="site-search-result-native">
                              {" "}
                              {entry.nativeTitle}
                            </span>
                          )}
                        </span>
                        {entry.secondary && (
                          <span className="site-search-result-secondary">
                            {entry.secondary}
                          </span>
                        )}
                        {entry.blurb && (
                          <span className="site-search-result-blurb">
                            {entry.blurb}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="site-search-hint">
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd>{" "}
              close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
