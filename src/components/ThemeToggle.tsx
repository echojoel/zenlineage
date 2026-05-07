"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Three small icon buttons — sun, half-sun, moon — for day / sepia /
 * evening reading. No labels, no surrounding chrome. Quiet inline
 * row meant to live in a page footer. Active state fills the icon;
 * inactive states stay outlined.
 *
 * Persists to localStorage; the boot script in layout.tsx applies
 * the persisted choice before first paint to avoid a flash.
 */

type Theme = "day" | "sepia" | "dark";
const STORAGE_KEY = "zen-theme";
const ORDER: Theme[] = ["day", "sepia", "dark"];

const LABELS: Record<Theme, string> = {
  day: "Day reading",
  sepia: "Sepia reading",
  dark: "Evening reading",
};

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = theme;
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

function SunIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
    </svg>
  );
}

function SepiaIcon({ filled }: { filled: boolean }) {
  // Half-shaded circle — the sun at the horizon, evoking the warm
  // tone between full day and full night.
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="6" fill="none" />
      <path
        d="M12 6 a6 6 0 0 1 0 12 z"
        fill={filled ? "currentColor" : "currentColor"}
        fillOpacity={filled ? 1 : 0.35}
      />
    </svg>
  );
}

function MoonIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5 A8 8 0 1 1 9.5 4 a6.5 6.5 0 0 0 10.5 10.5 z" />
    </svg>
  );
}

const ICON_FOR: Record<Theme, (props: { filled: boolean }) => React.JSX.Element> = {
  day: SunIcon,
  sepia: SepiaIcon,
  dark: MoonIcon,
};

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
      {ORDER.map((opt) => {
        const Icon = ICON_FOR[opt];
        const active = hydrated && theme === opt;
        return (
          <button
            key={opt}
            type="button"
            className={`theme-toggle-btn${active ? " theme-toggle-btn--active" : ""}`}
            aria-label={LABELS[opt]}
            aria-pressed={active}
            title={LABELS[opt]}
            onClick={() => setExplicit(opt)}
          >
            <Icon filled={active} />
          </button>
        );
      })}
    </div>
  );
}
