# Feature Spotlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a rotating five-card feature spotlight between the homepage nav and the daily proverb, auto-advancing every 5 s with a fade transition, pausing on hover, navigable by dot buttons.

**Architecture:** A single `"use client"` component (`FeatureSpotlight`) holds all logic — a static `CARDS` array, `useState` for current index and opacity, a `useRef` for the interval, and callback handlers for hover/dot/card click. The component imports into `page.tsx` (server component) with no additional data fetching. Styles live in `globals.css` alongside existing `.home-*` rules.

**Tech Stack:** React 18 `useState` / `useEffect` / `useRef` / `useCallback`, Next.js `Link`, TypeScript, custom CSS variables (`--ink`, `--ink-light`, `--font-cormorant`, `--font-inter`)

---

## File map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/FeatureSpotlight.tsx` | All spotlight state, timer, and markup |
| Modify | `src/app/globals.css` | Add `.feature-spotlight` block after `.home-proverb-link` |
| Modify | `src/app/page.tsx` | Import component, insert between `</nav>` and `{randomProverb &&` |

---

## Task 1: CSS — spotlight styles

**Files:**
- Modify: `src/app/globals.css` (after line 125, after the `.home-proverb-link` block)

- [ ] **Step 1: Insert styles into globals.css**

  Open `src/app/globals.css`. After the closing `}` of the `@media (min-width: 768px) { .home-proverb-link { margin-top: 6rem; } }` block (currently around line 125), add:

  ```css
  /* ── Feature Spotlight ── */
  .feature-spotlight {
    margin: 2.5rem auto 0;
    max-width: 380px;
    width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .spotlight-card {
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(0, 0, 0, 0.07);
    border-radius: 8px;
    padding: 20px 24px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    display: block;
    width: 100%;
  }

  .spotlight-eyebrow {
    display: block;
    font-family: var(--font-inter), sans-serif;
    font-size: 0.46rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-light);
    opacity: 0.8;
    margin-bottom: 10px;
  }

  .spotlight-rule {
    width: 18px;
    height: 1px;
    background: var(--ink-light);
    opacity: 0.3;
    margin: 0 auto 12px;
  }

  .spotlight-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 0.9rem;
    font-style: italic;
    color: var(--ink);
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .spotlight-body {
    font-family: Georgia, serif;
    font-size: 0.54rem;
    color: var(--ink-light);
    line-height: 1.7;
    margin-bottom: 12px;
  }

  .spotlight-cta {
    font-family: var(--font-inter), sans-serif;
    font-size: 0.46rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-light);
    text-decoration: none;
    display: inline-block;
    transition: color 0.2s ease;
  }

  .spotlight-cta:hover {
    color: var(--ink);
  }

  .spotlight-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-top: 12px;
    padding: 4px 0;
  }

  .spotlight-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #c0b0a0;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.3s ease;
  }

  .spotlight-dot--active {
    background: var(--ink);
  }

  @media (max-width: 480px) {
    .feature-spotlight {
      padding: 0 0.5rem;
    }
    .spotlight-card {
      padding: 16px 18px;
    }
  }
  ```

- [ ] **Step 2: Verify no existing class name collisions**

  ```bash
  grep -n "spotlight-" /Users/basket/workspace/zen/src/app/globals.css
  ```

  Expected: only the lines you just added. If any pre-existing `.spotlight-*` rules appear, rename the new ones to `.feature-spotlight-*` throughout.

---

## Task 2: FeatureSpotlight component

**Files:**
- Create: `src/components/FeatureSpotlight.tsx`

- [ ] **Step 1: Create the component**

  Create `src/components/FeatureSpotlight.tsx` with the following content:

  ```tsx
  "use client";

  import { useState, useEffect, useRef, useCallback } from "react";
  import Link from "next/link";

  interface SpotlightCard {
    label: string;
    heading: string;
    description: string;
    href: string;
    cta: string;
  }

  const CARDS: SpotlightCard[] = [
    {
      label: "Lineage Graph",
      heading: "Who taught whom, for 2,500 years",
      description:
        "Pan and zoom through 578 sourced transmission edges — from Śākyamuni Buddha through the Tang masters to contemporary teachers.",
      href: "/lineage",
      cta: "Explore the graph",
    },
    {
      label: "Koan Browser",
      heading: "Mumonkan · Blue Cliff Record · Denkoroku",
      description:
        "Browse canonical koan collections case by case, with full text, master cross-references, and links to individual teaching pages.",
      href: "/proverbs",
      cta: "Open the koans",
    },
    {
      label: "Practice Map",
      heading: "Find a place to sit",
      description:
        "1,657 active dōjō, monasteries, and lay sanghas across 51 countries — pan, zoom, and filter by school.",
      href: "/practice",
      cta: "Open the map",
    },
    {
      label: "Masters",
      heading: "556 teachers across 25 schools",
      description:
        "Sourced biographies, portraits, lineage positions, and teachings spanning 2,500 years of Chan and Zen history.",
      href: "/masters",
      cta: "Browse the masters",
    },
    {
      label: "Timeline",
      heading: "From the Buddha to the modern West",
      description:
        "A chronological sweep through the patriarchs — Tang dynasty masters, Japanese founders, and twentieth-century teachers who brought Zen to the West.",
      href: "/timeline",
      cta: "See the timeline",
    },
  ];

  const INTERVAL_MS = 5000;
  const FADE_MS = 400;

  export default function FeatureSpotlight() {
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fadingRef = useRef(false);
    const currentRef = useRef(0);

    useEffect(() => {
      currentRef.current = current;
    }, [current]);

    const navigateTo = useCallback((index: number) => {
      if (fadingRef.current) return;
      fadingRef.current = true;
      setVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setVisible(true);
        fadingRef.current = false;
      }, FADE_MS);
    }, []);

    const advance = useCallback(() => {
      navigateTo((currentRef.current + 1) % CARDS.length);
    }, [navigateTo]);

    const startTimer = useCallback(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(advance, INTERVAL_MS);
    }, [advance]);

    const stopTimer = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    useEffect(() => {
      startTimer();
      return stopTimer;
    }, [startTimer, stopTimer]);

    const handleDotClick = (index: number) => {
      navigateTo(index);
      startTimer();
    };

    const handleCardClick = () => {
      navigateTo((currentRef.current + 1) % CARDS.length);
      startTimer();
    };

    const card = CARDS[current];

    return (
      <div
        className="feature-spotlight"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
      >
        <div
          className="spotlight-card"
          onClick={handleCardClick}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          <span className="spotlight-eyebrow">{card.label}</span>
          <div className="spotlight-rule" />
          <p className="spotlight-heading">{card.heading}</p>
          <p className="spotlight-body">{card.description}</p>
          <Link
            href={card.href}
            className="spotlight-cta"
            onClick={(e) => e.stopPropagation()}
          >
            {card.cta} →
          </Link>
        </div>

        <div className="spotlight-dots">
          {CARDS.map((c, i) => (
            <button
              key={c.label}
              className={`spotlight-dot${i === current ? " spotlight-dot--active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDotClick(i);
              }}
              aria-label={`Show ${c.label}`}
            />
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  cd /Users/basket/workspace/zen && npx tsc --noEmit 2>&1 | grep -i "FeatureSpotlight\|spotlight" || echo "no spotlight errors"
  ```

  Expected: `no spotlight errors`

---

## Task 3: Wire into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

  At the top of `src/app/page.tsx`, after the existing import for `ThemeToggle`:

  ```tsx
  import FeatureSpotlight from "@/components/FeatureSpotlight";
  ```

- [ ] **Step 2: Insert between nav and proverb**

  In the JSX, find `</nav>` (the closing tag of the nav element around line 244). Immediately after it, before the `{/* Random proverb */}` comment, insert:

  ```tsx
  <FeatureSpotlight />
  ```

  The result should read:

  ```tsx
        </nav>

        <FeatureSpotlight />

        {/* Random proverb — between nav and footer */}
        {randomProverb && (
  ```

- [ ] **Step 3: Type-check the full project**

  ```bash
  cd /Users/basket/workspace/zen && npx tsc --noEmit 2>&1 | tail -10
  ```

  Expected: no output (zero errors).

---

## Task 4: Build, verify, commit, deploy

- [ ] **Step 1: Full build**

  ```bash
  cd /Users/basket/workspace/zen && npm run build 2>&1 | tail -20
  ```

  Expected: build completes, no TypeScript or compilation errors. The `/` route should appear in the static output list.

- [ ] **Step 2: Start dev server and eyeball it**

  ```bash
  cd /Users/basket/workspace/zen && npm run dev
  ```

  Open `http://localhost:3000`. Confirm:
  - The spotlight card appears between the nav and the daily proverb
  - Cards rotate every 5 s with a fade
  - Hovering the card pauses rotation
  - Clicking a dot jumps to that card and resets the timer
  - Clicking the card body (not the CTA) advances to the next card
  - Clicking "Explore the graph →" (or equivalent CTA) navigates to the correct page
  - On narrow viewport (< 480px) card padding is reduced and card stays within bounds

- [ ] **Step 3: Commit**

  ```bash
  cd /Users/basket/workspace/zen && git add src/components/FeatureSpotlight.tsx src/app/page.tsx src/app/globals.css
  git commit -m "feat(home): add rotating feature spotlight carousel"
  ```

- [ ] **Step 4: Deploy**

  ```bash
  cd /Users/basket/workspace/zen && npm run build && find out -mindepth 2 -name "__next.*.txt" -type f -delete && npx wrangler pages deploy out --project-name=zenlineage 2>&1 | tail -10
  ```

  Expected: `✨ Deployment complete!` with a preview URL.
