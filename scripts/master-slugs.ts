export interface MasterSlugRecord {
  id: string;
  slug: string;
}

export function buildResolvedMasterSlugMap(
  masters: MasterSlugRecord[],
): Map<string, string> {
  const usedSlugs = new Set<string>();
  const resolvedSlugs = new Map<string, string>();

  for (const master of masters) {
    let slug = master.slug || "master";

    if (usedSlugs.has(slug)) {
      let counter = 2;
      while (usedSlugs.has(`${slug}-${counter}`)) counter++;
      slug = `${slug}-${counter}`;
    }

    usedSlugs.add(slug);
    resolvedSlugs.set(master.id, slug);
  }

  return resolvedSlugs;
}
