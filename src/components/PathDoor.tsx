import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One door in the /about Pick-Your-Path block. Equal-weight visual
 * treatment regardless of where it leads — no door is "primary."
 * The visitor's path through the encyclopedia depends on what they
 * came for, not what we'd promote.
 *
 * Design: a quiet card with a glyph (large native script or symbol),
 * a short eyebrow ("HISTORY"), an H3 title, and a 1-2 sentence
 * lede. The whole card is the link target — single click target,
 * single focus ring.
 */

interface PathDoorProps {
  /** Visible above the title in tracked uppercase. */
  eyebrow: string;
  /** The door's name as a noun phrase. */
  title: string;
  /** One- or two-sentence promise. */
  lede: ReactNode;
  /** Internal route. */
  href: string;
  /** Glyph rendered in the gutter — a native character or a small
   *  symbol. Kept as a node so callers can choose font / lang. */
  glyph: ReactNode;
  /** Optional `lang` attribute for screen readers / font-fallback
   *  on the glyph (e.g., "zh" for 心). */
  glyphLang?: string;
}

export default function PathDoor({
  eyebrow,
  title,
  lede,
  href,
  glyph,
  glyphLang,
}: PathDoorProps) {
  return (
    <Link href={href} className="path-door">
      <span className="path-door-glyph" aria-hidden="true" lang={glyphLang}>
        {glyph}
      </span>
      <span className="path-door-body">
        <span className="path-door-eyebrow">{eyebrow}</span>
        <span className="path-door-title">{title}</span>
        <span className="path-door-lede">{lede}</span>
      </span>
      <span className="path-door-chevron" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
