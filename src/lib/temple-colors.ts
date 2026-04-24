/**
 * School colour palette, shared between the lineage graph and the practice
 * map. A Soto master on the lineage graph and a Soto temple on the practice
 * map must render in the exact same colour, so the palette lives here and
 * both consumers import from this module.
 *
 * Colours are keyed by a normalized *prefix* of the school slug so that a
 * single entry like `"soto"` matches both `soto` and `soto-zen`. Entries are
 * declared most-specific-first because matching uses `String#includes`.
 *
 * The palette is derived from `SCHOOL_COLORS` in `LineageGraph.tsx`. For now
 * LineageGraph keeps its own PixiJS-friendly number form; this module
 * exports both the hex-string form (for CSS / MapLibre layer paint) and a
 * number form (for any PixiJS consumer that wants to migrate later).
 */

type PaletteEntry = {
  /** Normalized slug-substring to match against (a-z only, no separators). */
  key: string;
  /** Hex colour as "#rrggbb". */
  hex: string;
  /** Human note — what this colour evokes. */
  note: string;
};

export const SCHOOL_HEX_COLORS: readonly PaletteEntry[] = [
  // Specific before general — schoolHexColor uses String#includes.
  { key: "earlychan", hex: "#7a8a70", note: "sage green" },
  { key: "indianpatriarchs", hex: "#8b7a55", note: "antique gold" },
  { key: "qingyuan", hex: "#5a7a7a", note: "teal" },
  { key: "nanyue", hex: "#6a7a5a", note: "dark moss" },
  { key: "yangqi", hex: "#5a8a5a", note: "brighter moss" },
  { key: "rinzai", hex: "#5a7a5a", note: "moss green" },
  { key: "linji", hex: "#5a7a5a", note: "moss green" },
  { key: "caodong", hex: "#8b6b4a", note: "rust brown" },
  { key: "soto", hex: "#8b6b4a", note: "rust brown" },
  { key: "obaku", hex: "#7a8b6a", note: "olive" },
  { key: "yunmen", hex: "#a07040", note: "burnt orange" },
  { key: "fayan", hex: "#6a7a8b", note: "slate blue" },
  { key: "huayan", hex: "#7a6a8b", note: "mauve" },
  { key: "guiyang", hex: "#8b7a5a", note: "tan" },
  { key: "chan", hex: "#7a8a70", note: "sage green (after earlychan)" },
  { key: "lamte", hex: "#7a6a6a", note: "dusty rose-brown" },
  { key: "truclam", hex: "#7a7a6a", note: "warm khaki" },
  { key: "plumvillage", hex: "#8a6a7a", note: "muted plum" },
  { key: "thien", hex: "#7a7060", note: "warm stone" },
  { key: "jogye", hex: "#607a80", note: "steel blue" },
  { key: "kwanum", hex: "#5a7080", note: "dark steel" },
  { key: "taego", hex: "#6a7a70", note: "grey-sage" },
  { key: "seon", hex: "#6a7080", note: "cool grey-blue" },
  { key: "sanbozen", hex: "#7a6a8b", note: "mauve" },
];

/** Fallback colour for unknown / null school slugs. */
export const DEFAULT_SCHOOL_HEX = "#9a8a75";

/**
 * Return the hex colour ("#rrggbb") for a school slug, or the default if the
 * slug doesn't match any palette key.
 */
export function schoolHexColor(schoolSlug: string | null | undefined): string {
  if (!schoolSlug) return DEFAULT_SCHOOL_HEX;
  const normalized = schoolSlug.toLowerCase().replace(/[^a-z]/g, "");
  for (const { key, hex } of SCHOOL_HEX_COLORS) {
    if (normalized.includes(key)) return hex;
  }
  return DEFAULT_SCHOOL_HEX;
}

/**
 * Number form of {@link schoolHexColor} — useful for the PixiJS lineage
 * graph, which treats colours as numeric constants. Kept here so both
 * consumers are definitionally in sync.
 */
export function schoolColorNumber(schoolSlug: string | null | undefined): number {
  const hex = schoolHexColor(schoolSlug);
  return parseInt(hex.slice(1), 16);
}
