import { deterministicId, type CanonicalCitation } from "./reconcile";

export const BIOGRAPHY_EDITORIAL_SOURCE = {
  id: "src_editorial_biographies",
  type: "editorial_dataset",
  title: "Zen Editorial Biographies",
  author: "Zen project editorial",
  url: null,
  publicationDate: null,
  reliability: "editorial",
} as const;

const SUPPORTED_MASTER_FIELDS = new Set(["dates", "name", "school", "teachers"]);

export interface BiographyItemCitation {
  id: string;
  sourceId: string;
  entityType: "master_biography";
  entityId: string;
  fieldName: string;
  excerpt: string;
  pageOrSection: string | null;
}

export function buildBiographyItemCitations(input: {
  bioId: string;
  slug: string;
  displayName: string;
  masterCitations: CanonicalCitation[];
}): BiographyItemCitation[] {
  const citations: BiographyItemCitation[] = [
    {
      id: deterministicId(`cite:${input.bioId}:${BIOGRAPHY_EDITORIAL_SOURCE.id}:editorial_summary`),
      sourceId: BIOGRAPHY_EDITORIAL_SOURCE.id,
      entityType: "master_biography",
      entityId: input.bioId,
      fieldName: "editorial_summary",
      excerpt: `Editorial biography summary for ${input.displayName}`,
      pageOrSection: `scripts/seed-biographies.ts#${input.slug}`,
    },
  ];

  const seenSupportKeys = new Set<string>();

  for (const masterCitation of input.masterCitations) {
    if (!SUPPORTED_MASTER_FIELDS.has(masterCitation.field_name)) continue;

    const supportKey = [
      masterCitation.source_id,
      masterCitation.field_name,
      masterCitation.excerpt,
    ].join(":");
    if (seenSupportKeys.has(supportKey)) continue;
    seenSupportKeys.add(supportKey);

    citations.push({
      id: deterministicId(`cite:${input.bioId}:${supportKey}`),
      sourceId: masterCitation.source_id,
      entityType: "master_biography",
      entityId: input.bioId,
      fieldName: "biography_support",
      excerpt: `${masterCitation.field_name}: ${masterCitation.excerpt}`,
      pageOrSection: `master:${masterCitation.field_name}`,
    });
  }

  return citations;
}
