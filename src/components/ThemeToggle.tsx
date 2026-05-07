"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Sepia evening / day toggle. Two visible states:
 *   • day    — light paper, warm-brown ink (the historical default)
 *   • sepia  — warm dark walnut, cream ink (evening reading)
 *
 * Internally a third state, `system`, is the initial / unset value:
 * it lets the OS-level `prefers-color-scheme: dark` decide. We treat
 * a user click as an explicit override and persist it to
 * `localStorage["zen-theme"]`.
 *
 * The boot script in layout.tsx applies the persisted preference
 * before first paint so the page never flashes from light to sepia.
 */

type Theme = "system" | "day" | "sepia";
const STORAGE_KEY = "zen-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = theme;
  // Update the <meta name="theme-color"> for the browser chrome.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta instanceof HTMLMetaElement) {
    const isDark =
      theme === "sepia" ||
      (theme === "system" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    meta.content = isDark ? "#2a2520" : "#faf9f7";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  // Avoid hydration mismatch: don't render an explicit aria-pressed
  // state until we've read localStorage on mount.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === "day" || stored === "sepia" || stored === "system"
        ? stored
        : "system";
    setTheme(initial);
    applyTheme(initial);
    setHydrated(true);
  }, []);

  const handleClick = useCallback(() => {
    setTheme((prev) => {
      // Cycle: system → day → sepia → system. Most users will park
      // on either day or sepia after one or two clicks.
      const next: Theme =
        prev === "system" ? "day" : prev === "day" ? "sepia" : "system";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const label =
    theme === "sepia"
      ? "Evening reading"
      : theme === "day"
        ? "Day reading"
        : "Match system";

  // Glyph: filled circle for sepia, outline circle for day, dotted
  // for system. Keeps a single visual vocabulary across states.
  const glyph =
    theme === "sepia" ? "◐" : theme === "day" ? "○" : "◔";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-pressed={hydrated && theme === "sepia"}
      aria-label={`Reading mode: ${label}. Click to cycle.`}
      title={`Reading mode: ${label}`}
    >
      <span className="theme-toggle-glyph" aria-hidden="true">
        {glyph}
      </span>
    </button>
  );
}
