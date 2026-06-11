/**
 * Diacritic stripping, isolated from `search-tokens.ts` on purpose.
 *
 * `search-tokens.ts` imports the `pinyin` package, whose bundled dictionary
 * is several megabytes. Client-reachable modules (e.g. `school-taxonomy.ts`)
 * must import from here so the dictionary never enters a browser bundle.
 */

/** Strip combining diacritical marks (ō→o, ü→u, ê→e, …). */
export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
