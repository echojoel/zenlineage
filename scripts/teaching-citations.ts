import { deterministicId } from "./reconcile";

export const TEACHING_EDITORIAL_SOURCE = {
  id: "src_editorial_teachings",
  type: "editorial_dataset",
  title: "Zen Editorial Teachings Corpus",
  author: "Zen project editorial",
  url: null,
  publicationDate: null,
  reliability: "editorial",
} as const;

export interface TeachingItemCitation {
  id: string;
  sourceId: string;
  entityType: "teaching";
  entityId: string;
  fieldName: string;
  excerpt: string;
  pageOrSection: string | null;
}

export function buildTeachingItemCitations(input: {
  teachingId: string;
  authorSlug: string;
  collection: string;
  caseNumber?: string;
  sourceId: string;
  locator: string;
  title: string;
}): TeachingItemCitation[] {
  const locatorLabel = input.caseNumber
    ? `Case ${input.caseNumber}, ${input.collection}`
    : input.locator;

  return [
    {
      id: deterministicId(`cite:${input.teachingId}:${input.sourceId}:text`),
      sourceId: input.sourceId,
      entityType: "teaching",
      entityId: input.teachingId,
      fieldName: "content",
      excerpt: `${input.collection}${input.caseNumber ? ` case ${input.caseNumber}` : ""}: ${input.title}`,
      pageOrSection: locatorLabel,
    },
  ];
}
