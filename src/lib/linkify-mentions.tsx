import React, { type ReactNode } from "react";
import Link from "next/link";
import { getSutraRegistry } from "./sutra-registry";
import { buildGlossary, termAnchorId } from "./glossary-data";

/**
 * Generic auto-linker. Given a string of plain text and a list of
 * known terms, returns a React node array where every match of a
 * known term is wrapped in an internal `<Link>` to the matching
 * page on this site.
 *
 * Matching rules:
 * - Longest-first, so "Heart Sūtra" wins over "Heart".
 * - Each term may be matched at most once per text segment, so
 *   biography prose mentioning the same master ten times still gets
 *   only one inline link — the first occurrence — keeping prose
 *   readable.
 * - Word-boundary matching for ASCII terms; native scripts (CJK,
 *   IAST diacritics) are matched literally so "般若波羅蜜多心經"
 *   resolves regardless of surrounding characters.
 *
 * Linkable terms are passed in by the caller. Pages assemble them
 * from data they already have on hand (the masters table for a
 * school page; the sūtra registry, always; the current entity's
 * own slug, excluded so a page never links to itself).
 */

export interface LinkTerm {
  /** The literal text the renderer scans for. */
  match: string;
  /** Internal href to wrap the match in. */
  href: string;
  /** Sort key — higher first. Defaults to `match.length`. */
  weight?: number;
}

/**
 * Build the sūtra portion of the link registry. Pulls every English
 * title and native-script title from the registry. Always available.
 */
export function buildSutraLinkTerms(opts?: { excludeHref?: string }): LinkTerm[] {
  const exclude = opts?.excludeHref ?? null;
  const terms: LinkTerm[] = [];
  for (const s of getSutraRegistry()) {
    const href = `/sutras/${s.slug}`;
    if (href === exclude) continue;
    terms.push({ match: s.title, href });
    // Also catch the ASCII ‘Sutra’ form authors sometimes use.
    if (s.title.includes("Sūtra")) {
      terms.push({ match: s.title.replace("Sūtra", "Sutra"), href });
    }
    if (s.nativeTitle) {
      terms.push({ match: s.nativeTitle, href });
    }
  }
  return terms;
}

/**
 * Build link terms for every glossary entry. Each entry's display
 * term and native term (e.g. shikantaza / 只管打坐) becomes a link
 * to the matching glossary anchor. The English form is required to
 * be at least 5 characters to avoid noisy matches in arbitrary
 * prose ("Mu" would otherwise link inside "must"); CJK terms always
 * link literally because there is no collision risk.
 */
export function buildGlossaryLinkTerms(): LinkTerm[] {
  const terms: LinkTerm[] = [];
  for (const entry of buildGlossary()) {
    const href = `/glossary#${termAnchorId(entry.termKey)}`;
    if (entry.displayTerm && entry.displayTerm.length >= 5) {
      terms.push({ match: entry.displayTerm, href });
    }
    if (entry.nativeTerm) {
      terms.push({ match: entry.nativeTerm, href });
    }
  }
  return terms;
}

/** Test whether a character can stand at the boundary of an ASCII
 *  word — letters, digits, and the diacritics we use in romanised
 *  names (ā, ī, ū, ñ, ś, etc.). Used to avoid linking 'art' inside
 *  'Heart'. */
function isAsciiWordChar(ch: string): boolean {
  return /[A-Za-zÀ-ÖØ-öø-ÿĀ-ſ0-9]/.test(ch);
}

/** Decide whether `match` should be treated as needing word-boundary
 *  guards. CJK and characters outside the Latin range are matched as
 *  literal substrings. */
function needsAsciiWordBoundary(match: string): boolean {
  return /^[ -~À-ÖØ-öø-ÿĀ-ſ\s.,'’\-–—()]+$/.test(match);
}

/**
 * Walk a string, replacing the first occurrence of every term with
 * a Link node. Untouched text and links are interleaved.
 */
export function linkifyText(text: string, terms: LinkTerm[]): ReactNode[] {
  if (!text || terms.length === 0) return [text];

  // Sort longest-first so 'Heart Sūtra' beats 'Heart'.
  const sorted = [...terms].sort(
    (a, b) => (b.weight ?? b.match.length) - (a.weight ?? a.match.length)
  );

  type Hit = { start: number; end: number; href: string };
  const hits: Hit[] = [];
  const used = new Set<string>();

  for (const term of sorted) {
    if (used.has(term.match)) continue;
    const idx = findMatch(text, term.match);
    if (idx === -1) continue;
    // Reject if the hit overlaps a previously-claimed range.
    const end = idx + term.match.length;
    if (hits.some((h) => idx < h.end && end > h.start)) continue;
    hits.push({ start: idx, end, href: term.href });
    used.add(term.match);
  }

  if (hits.length === 0) return [text];

  hits.sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const hit of hits) {
    if (hit.start > cursor) out.push(text.slice(cursor, hit.start));
    out.push(
      <Link
        key={`lm-${key++}`}
        href={hit.href}
        className="detail-inline-link"
      >
        {text.slice(hit.start, hit.end)}
      </Link>
    );
    cursor = hit.end;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function findMatch(text: string, match: string): number {
  if (!needsAsciiWordBoundary(match)) {
    return text.indexOf(match);
  }
  // ASCII word-boundary scan.
  let from = 0;
  while (true) {
    const idx = text.indexOf(match, from);
    if (idx === -1) return -1;
    const before = idx === 0 ? "" : text[idx - 1];
    const after = text[idx + match.length] ?? "";
    if (!isAsciiWordChar(before) && !isAsciiWordChar(after)) {
      return idx;
    }
    from = idx + 1;
  }
}
