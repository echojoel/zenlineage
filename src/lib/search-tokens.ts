import { pinyin } from "pinyin";
import { toRomaji } from "wanakana";
import { looksWadeGiles } from "@/lib/romanization";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchToken {
  token: string; // normalized search token (lowercased, diacritics stripped)
  original: string; // original form before normalization
  locale: string; // 'en' | 'zh' | 'ja' | 'ko' | 'vi' | 'sa'
  tokenType: string; // 'name' | 'alias' | 'transliteration' | 'romanization'
}

export interface SearchTokenInput {
  value: string;
  locale: string;
  nameType: string; // 'dharma' | 'birth' | 'honorific' | 'alias'
}

// ---------------------------------------------------------------------------
// Character-range helpers
// ---------------------------------------------------------------------------

const CJK_RE = /[\u4e00-\u9fff]/;
const KANA_RE = /[\u3040-\u309f\u30a0-\u30ff]/;

function containsCJK(s: string): boolean {
  return CJK_RE.test(s);
}

function containsKana(s: string): boolean {
  return KANA_RE.test(s);
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

/** Strip combining diacritical marks (ō→o, ü→u, ê→e, …). */
export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Lowercase + strip diacritics. */
function normalizeToken(s: string): string {
  return stripDiacritics(s).toLowerCase();
}

// ---------------------------------------------------------------------------
// Token-type mapping from nameType
// ---------------------------------------------------------------------------

function tokenTypeFor(nameType: string): string {
  if (nameType === "alias") return "alias";
  return "name";
}

// ---------------------------------------------------------------------------
// Pinyin generation
// ---------------------------------------------------------------------------

/** Extract CJK characters from a string and return pinyin tokens. */
function pinyinTokens(cjkText: string, locale: string): SearchToken[] {
  // Get per-character pinyin (no tone marks, style: 0 = NORMAL)
  const syllables: string[][] = pinyin(cjkText, { style: 0 });
  const flat = syllables.map((s) => s[0]);

  const tokens: SearchToken[] = [];

  // Full pinyin, space-separated
  const spaced = flat.join(" ");
  tokens.push({
    token: spaced,
    original: cjkText,
    locale,
    tokenType: "romanization",
  });

  // Full pinyin, concatenated (no spaces)
  const concat = flat.join("");
  if (concat !== spaced) {
    tokens.push({
      token: concat,
      original: cjkText,
      locale,
      tokenType: "romanization",
    });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Kana romanisation
// ---------------------------------------------------------------------------

function kanaTokens(kanaText: string, locale: string): SearchToken[] {
  const romaji = toRomaji(kanaText).toLowerCase();
  return [
    {
      token: romaji,
      original: kanaText,
      locale,
      tokenType: "romanization",
    },
  ];
}

// ---------------------------------------------------------------------------
// Multi-word expansion
// ---------------------------------------------------------------------------

/** Given "Nanquan Puyuan", return ["nanquan puyuan", "nanquan", "puyuan"]. */
function multiWordTokens(
  normalized: string,
  original: string,
  locale: string,
  tokenType: string
): SearchToken[] {
  const tokens: SearchToken[] = [{ token: normalized, original, locale, tokenType }];

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    for (const word of words) {
      tokens.push({ token: word, original, locale, tokenType });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Wade-Giles handling
// ---------------------------------------------------------------------------

/**
 * Wade-Giles romanisations use hyphens and apostrophes
 * (e.g. "T'ien-huang Tao-wu").
 *
 * We emit:
 *  1. The normalised form (diacritics stripped, lowercased, punctuation kept)
 *  2. A form with apostrophes and hyphens removed
 *  Plus individual word tokens for each.
 */
function wadeGilesTokens(
  normalized: string,
  original: string,
  locale: string,
  tokenType: string
): SearchToken[] {
  const tokens: SearchToken[] = [];

  // 1. With punctuation kept (already normalised by caller)
  tokens.push(...multiWordTokens(normalized, original, locale, tokenType));

  // 2. Stripped of apostrophes and hyphens
  const stripped = normalized.replace(/['\u2019-]/g, "");
  if (stripped !== normalized) {
    tokens.push(...multiWordTokens(stripped, original, locale, tokenType));
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Segment a mixed string into CJK runs and non-CJK runs
// ---------------------------------------------------------------------------

interface Segment {
  text: string;
  kind: "cjk" | "kana" | "latin";
}

function segmentString(input: string): Segment[] {
  const segments: Segment[] = [];
  let current = "";
  let currentKind: Segment["kind"] | null = null;

  for (const ch of input) {
    let kind: Segment["kind"];
    if (CJK_RE.test(ch)) kind = "cjk";
    else if (KANA_RE.test(ch)) kind = "kana";
    else kind = "latin";

    if (kind !== currentKind && current.length > 0) {
      segments.push({ text: current, kind: currentKind! });
      current = "";
    }
    currentKind = kind;
    current += ch;
  }
  if (current.length > 0 && currentKind) {
    segments.push({ text: current, kind: currentKind });
  }
  return segments;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function generateSearchTokens(input: SearchTokenInput): SearchToken[] {
  const { value, locale, nameType } = input;
  const tType = tokenTypeFor(nameType);

  const seen = new Set<string>();
  const result: SearchToken[] = [];

  function add(tok: SearchToken) {
    const key = `${tok.token}|${tok.tokenType}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(tok);
  }

  const hasCJK = containsCJK(value);
  const hasKana = containsKana(value);

  // If the string is purely CJK or purely kana, handle directly
  if (!hasCJK && !hasKana) {
    // Pure Latin / romanised text
    const normalized = normalizeToken(value);
    if (looksWadeGiles(value)) {
      for (const t of wadeGilesTokens(normalized, value, locale, tType)) add(t);
    } else {
      for (const t of multiWordTokens(normalized, value, locale, tType)) add(t);
    }
    return result;
  }

  // Mixed or pure CJK/kana — segment the string
  const segments = segmentString(value);

  // Generate tokens for each segment
  for (const seg of segments) {
    if (seg.kind === "cjk") {
      for (const t of pinyinTokens(seg.text.trim(), locale)) add(t);
    } else if (seg.kind === "kana") {
      for (const t of kanaTokens(seg.text.trim(), locale)) add(t);
    } else {
      const trimmed = seg.text.trim();
      if (trimmed.length === 0) continue;
      const normalized = normalizeToken(trimmed);
      if (looksWadeGiles(trimmed)) {
        for (const t of wadeGilesTokens(normalized, trimmed, locale, tType)) add(t);
      } else {
        for (const t of multiWordTokens(normalized, trimmed, locale, tType)) add(t);
      }
    }
  }

  return result;
}
