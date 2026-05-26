"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface ProverbItem {
  type: "proverb";
  content: string;
  attribution: string;
  href: string;
}

interface FeatureItem {
  type: "feature";
  content: string;
  attribution: string;
  href: string;
}

type RotatorItem = ProverbItem | FeatureItem;

const FEATURE_ITEMS: FeatureItem[] = [
  {
    type: "feature",
    content:
      "578 dharma transmissions — from Śākyamuni Buddha through the Tang dynasty masters to teachers alive today.",
    attribution: "Explore the lineage graph →",
    href: "/lineage",
  },
  {
    type: "feature",
    content:
      "The Mumonkan, Blue Cliff Record, and Denkoroku — 136 cases, expanded with master cross-references.",
    attribution: "Open the koan browser →",
    href: "/proverbs?mode=koans",
  },
  {
    type: "feature",
    content: "1,657 active dōjō, monasteries, and sanghas across 51 countries.",
    attribution: "Find a place to sit →",
    href: "/practice",
  },
  {
    type: "feature",
    content:
      "556 teachers. 25 schools. 2,500 years of Chan and Zen history, with sourced biographies and portraits.",
    attribution: "Browse the masters →",
    href: "/masters",
  },
];

const INTERVAL_MS = 10000;
const FADE_MS = 500;

const textStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  fontSize: "0.78rem",
  lineHeight: 1.7,
  color: "var(--ink-light)",
  whiteSpace: "pre-line",
  marginBottom: "0.35rem",
};

const attributionStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.06em",
  fontVariant: "small-caps",
  color: "var(--ink-light)",
  opacity: 0.55,
};

interface Props {
  proverb: { content: string; authorName: string | null; slug: string } | null;
}

export default function HomeProverbRotator({ proverb }: Props) {
  const items: RotatorItem[] = [
    ...(proverb
      ? [
          {
            type: "proverb" as const,
            content: proverb.content,
            attribution: proverb.authorName ?? "Traditional Zen Proverb",
            href: `/proverbs?highlight=${proverb.slug}`,
          },
        ]
      : []),
    ...FEATURE_ITEMS,
  ];

  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadingRef = useRef(false);
  const currentRef = useRef(0);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const navigateTo = useCallback(
    (index: number) => {
      if (fadingRef.current) return;
      fadingRef.current = true;
      setVisible(false);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setCurrent(index);
        setVisible(true);
        fadingRef.current = false;
      }, FADE_MS);
    },
    []
  );

  const advance = useCallback(() => {
    navigateTo((currentRef.current + 1) % items.length);
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

  const item = items[current];
  if (!item) return null;

  return (
    <Link
      href={item.href}
      className="home-proverb-link"
      style={{
        display: "block",
        maxWidth: "380px",
        textDecoration: "none",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <p style={textStyle}>{item.content}</p>
      <span style={attributionStyle}>{item.attribution}</span>
    </Link>
  );
}
