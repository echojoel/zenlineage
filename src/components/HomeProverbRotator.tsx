"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface RotatorItem {
  title: string;
  content: string;
  attribution: string;
  href: string;
}

interface RotatorStats {
  transmissions: number;
  koans: number;
  temples: number;
  countries: number;
  masters: number;
  schools: number;
}

function buildFeatureItems(s: RotatorStats): RotatorItem[] {
  const n = (v: number) => v.toLocaleString("en-US");
  return [
    {
      title: "Lineage",
      content: `${n(s.transmissions)} dharma transmissions — from Śākyamuni Buddha through the Tang dynasty masters to teachers alive today.`,
      attribution: "Explore the lineage graph →",
      href: "/lineage",
    },
    {
      title: "Koans",
      content: `The Mumonkan, Blue Cliff Record, Denkōroku, and Transmission of the Lamp — ${n(s.koans)} cases, expanded with master cross-references.`,
      attribution: "Open the koan browser →",
      href: "/proverbs?mode=koans",
    },
    {
      title: "Practice centers",
      content: `${n(s.temples)} active dōjō, monasteries, and sanghas across ${n(s.countries)} countries.`,
      attribution: "Find a place to sit →",
      href: "/practice",
    },
    {
      title: "Masters",
      content: `${n(s.masters)} teachers. ${n(s.schools)} schools. 2,500 years of Chan and Zen history, with sourced biographies and portraits.`,
      attribution: "Browse the masters →",
      href: "/masters",
    },
  ];
}

const INTERVAL_MS = 10000;
const FADE_MS = 500;
const SWIPE_THRESHOLD = 50;

const textStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  fontSize: "0.78rem",
  lineHeight: 1.7,
  color: "var(--ink-light)",
  whiteSpace: "pre-line",
  marginBottom: "0.35rem",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: "0.5rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--ink-light)",
  opacity: 0.75,
  display: "block",
  marginBottom: "0.55rem",
};

const attributionStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.06em",
  fontVariant: "small-caps",
  color: "var(--ink-light)",
  opacity: 0.9,
};

interface Props {
  proverb: { content: string; authorName: string | null; slug: string } | null;
  stats: RotatorStats;
}

export default function HomeProverbRotator({ proverb, stats }: Props) {
  const items: RotatorItem[] = [
    ...(proverb
      ? [
          {
            title: "Proverb of the day",
            content: proverb.content,
            attribution: proverb.authorName ?? "Traditional Zen Proverb",
            href: `/proverbs?highlight=${proverb.slug}`,
          },
        ]
      : []),
    ...buildFeatureItems(stats),
  ];

  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadingRef = useRef(false);
  const currentRef = useRef(0);
  const touchStartX = useRef<number | null>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const navigateTo = useCallback((index: number) => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    setVisible(false);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setCurrent(index);
      setVisible(true);
      fadingRef.current = false;
    }, FADE_MS);
  }, []);

  const advance = useCallback(() => {
    navigateTo((currentRef.current + 1) % items.length);
  }, [navigateTo, items.length]);

  const goBack = useCallback(() => {
    navigateTo((currentRef.current - 1 + items.length) % items.length);
  }, [navigateTo, items.length]);

  const startTimer = useCallback(() => {
    if (prefersReduced) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, INTERVAL_MS);
  }, [advance, prefersReduced]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  const handlePrev = () => { goBack(); startTimer(); };
  const handleNext = () => { advance(); startTimer(); };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) handleNext();
    else handlePrev();
  };

  const item = items[current];
  if (!item) return null;

  return (
    <div
      className="home-proverb-link"
      style={{ display: "flex", alignItems: "center" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        className="rotator-arrow"
        onClick={handlePrev}
        aria-label="Previous"
      >
        ‹
      </button>

      <Link
        href={item.href}
        style={{
          display: "block",
          maxWidth: "380px",
          textDecoration: "none",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <span style={titleStyle}>{item.title}</span>
        <p style={textStyle}>{item.content}</p>
        <span style={attributionStyle}>{item.attribution}</span>
      </Link>

      <button
        type="button"
        className="rotator-arrow"
        onClick={handleNext}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
