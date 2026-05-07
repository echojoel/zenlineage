"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reading-mode toggle. Three explicit states cycle in order:
 *   • day   — light paper, warm-brown ink (the historical default)
 *   • sepia — warm parchment, dark-brown ink (old-book reading feel)
 *   • dark  — warm walnut paper, cream ink (evening reading)
 *
 * Each click advances. The user's choice persists to
 * `localStorage["zen-theme"]`. The boot script in layout.tsx applies
 * the persisted preference before first paint so pages don't flash.
 *
 * The toggle is rendered as three small dots — filled = current,
 * hollow = available — with a textual label describing the current
 * mode. Quiet styling so it disappears into the page chrome until a
 * reader looks for it.
 */

type Theme = "day" | "sepia" | "dark";
const STORAGE_KEY = "zen-theme";

const ORDER: Theme[] = ["day", "sepia", "dark"];

const LABELS: Record<Theme, string> = {
  day: "Day",
  sepia: "Sepia",
  dark: "Evening",
};

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = theme;
  // Update <meta name="theme-color"> for the browser chrome.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta instanceof HTMLMetaElement) {
    meta.content =
      theme === "dark"
        ? "#2a2520"
        : theme === "sepia"
          ? "#f4ecd8"
          : "#faf9f7";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("day");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === "sepia" || stored === "dark" || stored === "day"
        ? stored
        : "day";
    setTheme(initial);
    applyTheme(initial);
    setHydrated(true);
  }, []);

  const setExplicit = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setTheme(next);
  }, []);

  return (
    <div className="theme-toggle" role="group" aria-label="Reading mode">
      <span className="theme-toggle-label">Reading mode</span>
      <div className="theme-toggle-options">
        {ORDER.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`theme-toggle-option${
              hydrated && theme === opt ? " theme-toggle-option--active" : ""
            }`}
            aria-pressed={hydrated && theme === opt}
            onClick={() => setExplicit(opt)}
          >
            {LABELS[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
