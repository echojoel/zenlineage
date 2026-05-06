/**
 * Build a deduplicated glossary from `SCHOOL_TAXONOMY.keyConcepts`.
 *
 * Each school definition lists 0-N concepts a reader is likely to meet
 * when studying it (shikantaza, hwadu, hishiryō, etc.). The same term
 * can appear under multiple schools — when it does, we merge into a
 * single glossary entry and remember which schools surfaced it.
 *
 * Pure function over the static taxonomy — no DB access.
 */

import { getSchoolDefinitions } from "./school-taxonomy";

export interface GlossarySchoolRef {
  slug: string;
  name: string;
  tradition: string;
}

export interface GlossaryEntry {
  /** Lower-cased canonical key used for dedup and anchor IDs. */
  termKey: string;
  /** Display form, capitalisation as authored. */
  displayTerm: string;
  nativeTerm?: string;
  description: string;
  schools: GlossarySchoolRef[];
  externalUrl?: string;
}

function normalizeKey(term: string): string {
  return term
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .trim();
}

export function buildGlossary(): GlossaryEntry[] {
  const byKey = new Map<string, GlossaryEntry>();

  for (const school of getSchoolDefinitions()) {
    if (!school.keyConcepts || school.keyConcepts.length === 0) continue;

    const ref: GlossarySchoolRef = {
      slug: school.slug,
      name: school.name,
      tradition: school.tradition,
    };

    for (const concept of school.keyConcepts) {
      const key = normalizeKey(concept.term);
      const existing = byKey.get(key);
      if (existing) {
        // Already saw this term — merge in this school. Keep the first
        // non-empty description / nativeTerm / url (definitions are
        // close enough across schools that taking the first is fine
        // and avoids juggling per-school variant copy).
        if (!existing.schools.some((s) => s.slug === school.slug)) {
          existing.schools.push(ref);
        }
        if (!existing.nativeTerm && concept.nativeTerm) {
          existing.nativeTerm = concept.nativeTerm;
        }
        if (!existing.externalUrl && concept.url) {
          existing.externalUrl = concept.url;
        }
        continue;
      }
      byKey.set(key, {
        termKey: key,
        displayTerm: concept.term,
        nativeTerm: concept.nativeTerm,
        description: concept.description,
        schools: [ref],
        externalUrl: concept.url,
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.termKey.localeCompare(b.termKey, "en", { sensitivity: "base" })
  );
}

/** Slug-safe fragment for `id` attributes on glossary entries. */
export function termAnchorId(termKey: string): string {
  return `term-${termKey
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)}`;
}
