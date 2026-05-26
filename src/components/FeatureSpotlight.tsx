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
