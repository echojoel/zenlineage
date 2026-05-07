/**
 * Pure citation formatters for the "Cite this" disclosure on
 * biographies, schools, and sūtra pages. Each function takes a
 * normalised CiteEntry and returns a plain string.
 *
 * Conventions chosen:
 *  • Encyclopedia is the publisher in every format.
 *  • Author defaults to "Zen Lineage editorial" when no individual
 *    author is appropriate (most master biographies).
 *  • Year is the publication year of the cited edition (sūtras) or
 *    the accessed-year fallback for living encyclopedia entries
 *    (masters / schools).
 *  • All formats are English-language scholarly conventions; no
 *    localisation.
 */

export interface CiteEntry {
  /** Title as it should appear in the citation. Already includes any
   *  parenthetical translator/edition info for sūtras. */
  title: string;
  /** Author / translator / editor as a single string. */
  author: string;
  /** Year as a number. For master/school pages, the current year. */
  year: number;
  /** Canonical URL (absolute, https://). */
  url: string;
  /** Slug used as the BibTeX cite-key. */
  slug: string;
  /** ISO date (YYYY-MM-DD) for the "accessed" line in Chicago. */
  accessedDate?: string;
  /** Optional one-line note appended to BibTeX (e.g. "Encyclopedia
   *  biography"). */
  note?: string;
}

/** A bare URL with the entity's name — useful for chat / email. */
export function formatPlain(entry: CiteEntry): string {
  return `${entry.title}. Zen Lineage. ${entry.url}`;
}

/** APA 7 style:
 *  Author. (Year). Title. Zen Lineage. URL */
export function formatAPA(entry: CiteEntry): string {
  return `${entry.author} (${entry.year}). ${entry.title}. Zen Lineage. ${entry.url}`;
}

/** Chicago manual of style — author-date with accessed line. */
export function formatChicago(entry: CiteEntry): string {
  const accessed = entry.accessedDate
    ? `Accessed ${formatHumanDate(entry.accessedDate)}. `
    : "";
  return `${entry.author}. "${entry.title}." Zen Lineage. ${accessed}${entry.url}`;
}

/** BibTeX entry — `@misc` is the right type for an online
 *  encyclopedia article. Uses the slug as the cite-key. */
export function formatBibTeX(entry: CiteEntry): string {
  const note = entry.note ? `,\n  note     = {${entry.note}}` : "";
  const accessed = entry.accessedDate
    ? `,\n  urldate  = {${entry.accessedDate}}`
    : "";
  return `@misc{zenlineage_${slugifyForBibKey(entry.slug)},
  author   = {${escapeBibTeX(entry.author)}},
  title    = {${escapeBibTeX(entry.title)}},
  year     = {${entry.year}},
  url      = {${entry.url}},
  publisher = {Zen Lineage}${accessed}${note}
}`;
}

/* ─── helpers ────────────────────────────────────────────────────── */

function escapeBibTeX(text: string): string {
  // BibTeX is fragile around braces and a handful of special chars.
  // The minimal safe set: escape backslashes and braces. Diacritics
  // (ā ī ū ṅ ñ etc.) are passed through — modern BibTeX (with
  // biblatex + UTF-8 inputenc) handles them.
  return text.replace(/\\/g, "\\\\").replace(/[{}]/g, (m) => `\\${m}`);
}

function slugifyForBibKey(slug: string): string {
  // BibTeX cite-keys allow letters, digits, and a few punctuators.
  // Conservative: strip everything but alphanumerics and dashes,
  // collapse dashes.
  return slug
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function formatHumanDate(iso: string): string {
  // "2026-05-07" → "May 7, 2026"
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
