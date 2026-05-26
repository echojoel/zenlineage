# Feature Spotlight — Design Spec

**Date:** 2026-05-26  
**Status:** Approved

## Summary

Add a rotating feature spotlight card to the frontpage, positioned between the nav grid and the daily proverb. The spotlight cycles through five curated feature cards, each linking to a section of the site. It auto-advances on a timer, pauses on hover, and supports manual dot navigation. No icons, no emojis — pure typography.

## Goal

First-time visitors see the nav but don't know what each section offers. The spotlight shows them *why* to click a given link — the depth behind the label — without requiring them to leave the homepage.

## Visual design

- **Layout:** Single card, centred, `max-width: 380px` (matching the daily proverb width)
- **Card anatomy:**
  1. Section label — tiny uppercase spaced caps, muted ink (`0.46rem`, `letter-spacing: 0.18em`)
  2. Thin rule — `18px × 1px`, `opacity: 0.3` (same treatment as existing page dividers)
  3. Italic heading — `0.78rem`, Cormorant or Georgia, `color: var(--ink)`
  4. Description — `0.54rem`, roman, `color: var(--ink-light)`, `line-height: 1.7`, one sentence
  5. CTA link — `0.46rem`, uppercase, `letter-spacing: 0.1em`, navigates to target page
- **Card background:** `rgba(255,255,255,0.45)`, `border: 1px solid rgba(0,0,0,0.07)`, `border-radius: 8px` — same glass-paper treatment as existing detail cards
- **Dots:** Row of 5 dots below the card, `4px` circles. Active dot: `var(--ink)`. Inactive: `#c0b0a0`. Clicking a dot jumps to that card.
- **Spacing:** `margin-top: 24px` from the nav divider; `margin-bottom: 24px` before the daily proverb section

## Animation

- **Transition:** Opacity fade — `opacity` `0` → `1` over `0.4s ease`. No slide (too app-like).
- **Timer:** 5 seconds per card. Resets when user manually navigates via dot.
- **Pause on hover:** `mouseenter` clears the interval; `mouseleave` restarts it.
- **Touch:** Clicking the card itself advances to the next card (same as pressing the next dot).

## The five cards

| # | Section label | Heading | Description | Link |
|---|---------------|---------|-------------|------|
| 1 | Lineage Graph | Who taught whom, for 2,500 years | Pan and zoom through 578 sourced transmission edges — from Śākyamuni Buddha through the Tang masters to contemporary teachers. | `/lineage` |
| 2 | Koan Browser | Mumonkan · Blue Cliff Record · Denkoroku | Browse canonical koan collections case by case, with full text, master cross-references, and links to individual teaching pages. | `/proverbs` |
| 3 | Practice Map | Find a place to sit | 1,657 active dōjō, monasteries, and lay sanghas across 51 countries — pan, zoom, and filter by school. | `/practice` |
| 4 | Masters | 556 teachers across 25 schools | Sourced biographies, portraits, lineage positions, and teachings spanning 2,500 years of Chan and Zen history. | `/masters` |
| 5 | Timeline | From the Buddha to the modern West | A chronological sweep through the patriarchs — Tang dynasty masters, Japanese founders, and twentieth-century teachers who brought Zen to the West. | `/timeline` |

## Implementation

### New file: `src/components/FeatureSpotlight.tsx`

A `"use client"` component. Self-contained — no props, no server data needed. The five cards are defined as a static array inside the component.

```
CARDS = [
  { label, heading, description, href },
  ...
]
```

State:
- `current: number` — index of the displayed card (0–4)
- `transitioning: boolean` — true during the 400ms fade-out, used to apply `opacity: 0`

Timer logic:
- `useEffect` starts a `setInterval(advance, 5000)` on mount and clears it on unmount
- `advance()`: set `transitioning = true` → wait 400ms → set `current = (current + 1) % 5`, `transitioning = false`
- `resetTimer()`: clear existing interval, start new one from zero — called after any manual dot click

Hover handlers on the card wrapper: `onMouseEnter` clears the interval ref, `onMouseLeave` restarts it.

### Edit: `src/app/page.tsx`

Import `FeatureSpotlight` and insert it between the nav `</nav>` and the `{randomProverb && ...}` block. No server data changes.

### Edit: `src/app/globals.css`

Add styles for `.feature-spotlight`, `.spotlight-card`, `.spotlight-eyebrow`, `.spotlight-rule`, `.spotlight-heading`, `.spotlight-body`, `.spotlight-cta`, `.spotlight-dots`, `.spotlight-dot`. Mobile: card padding reduced, max-width 100% with horizontal margin.

## What this is not

- Not a full-page onboarding wizard
- Not user-type pathfinding ("I'm a practitioner / scholar")
- Not a content sampler (no live DB queries — cards are editorial, static copy)
- Not a marquee or ticker — one card at a time, no simultaneous content

## Out of scope

- A/B testing card order
- Personalisation or tracking which cards the user has seen
- Swipe gesture support (can add later if needed on mobile)
