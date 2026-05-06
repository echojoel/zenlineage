// Bidirectional mapping between country names as stored in the DB
// (mostly English) and URL-safe slugs used by /practice/by-country.
// Centralised so sitemap, page route, and any cross-links agree.

export function countryToSlug(country: string): string {
  return country
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Reverse direction is best-effort: we look up the full country list at
// build time and resolve a slug back to its canonical name. This helper
// builds the lookup once for callers that have the country list.
export function buildCountryLookup(countries: string[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const c of countries) {
    lookup.set(countryToSlug(c), c);
  }
  return lookup;
}
