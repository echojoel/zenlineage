/**
 * Shared shape for the site-wide search index baked at build time and
 * consumed client-side by `<SiteSearch>`.
 *
 * The index covers four entity types so a single keyboard-driven dialog
 * lets a reader find anything on the site without knowing which page
 * the term belongs to.
 */
export type SearchEntryType = "master" | "school" | "teaching" | "glossary" | "temple";

export interface SearchEntry {
  type: SearchEntryType;
  /** Slug-style identifier, unique within `type`. */
  slug: string;
  /** Primary display name (English). */
  title: string;
  /** Native orthography (CJK / Vietnamese), used to match queries
   *  typed in the original script. */
  nativeTitle?: string;
  /** A second line of context: tradition, school, collection, author. */
  secondary?: string;
  /** ~140-char preview drawn from the entity's body (biography first
   *  line, definition, content). Used for ranking and result preview. */
  blurb?: string;
  /** Canonical href for navigation on result click. */
  url: string;
}
