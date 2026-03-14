import { describe, expect, it } from "vitest";
import {
  BIOGRAPHY_EDITORIAL_SOURCE,
  buildBiographyItemCitations,
} from "../scripts/biography-citations";
import type { CanonicalCitation } from "../scripts/reconcile";

describe("biography item citations", () => {
  it("creates an editorial citation plus filtered supporting citations", () => {
    const masterCitations: CanonicalCitation[] = [
      {
        id: "c1",
        source_id: "src_wikipedia",
        entity_type: "master",
        entity_id: "master_1",
        field_name: "dates",
        excerpt: "1200-1253",
      },
      {
        id: "c2",
        source_id: "src_wikipedia",
        entity_type: "master",
        entity_id: "master_1",
        field_name: "koan_refs",
        excerpt: "1, 2, 3",
      },
      {
        id: "c3",
        source_id: "src_sotozen_founders",
        entity_type: "master",
        entity_id: "master_1",
        field_name: "teachers",
        excerpt: "Tiantong Rujing",
      },
    ];

    const citations = buildBiographyItemCitations({
      bioId: "bio_dogen_en",
      slug: "dogen",
      displayName: "Dogen",
      masterCitations,
    });

    expect(citations[0]).toMatchObject({
      sourceId: BIOGRAPHY_EDITORIAL_SOURCE.id,
      entityType: "master_biography",
      entityId: "bio_dogen_en",
      fieldName: "editorial_summary",
      pageOrSection: "scripts/seed-biographies.ts#dogen",
    });
    expect(citations).toHaveLength(3);
    expect(citations.some((citation) => citation.excerpt === "koan_refs: 1, 2, 3")).toBe(false);
    expect(citations.some((citation) => citation.excerpt === "dates: 1200-1253")).toBe(true);
    expect(citations.some((citation) => citation.excerpt === "teachers: Tiantong Rujing")).toBe(
      true
    );
  });

  it("deduplicates repeated support citations", () => {
    const masterCitations: CanonicalCitation[] = [
      {
        id: "c1",
        source_id: "src_wikipedia",
        entity_type: "master",
        entity_id: "master_1",
        field_name: "name",
        excerpt: "Dogen",
      },
      {
        id: "c2",
        source_id: "src_wikipedia",
        entity_type: "master",
        entity_id: "master_1",
        field_name: "name",
        excerpt: "Dogen",
      },
    ];

    const citations = buildBiographyItemCitations({
      bioId: "bio_dogen_en",
      slug: "dogen",
      displayName: "Dogen",
      masterCitations,
    });

    expect(citations).toHaveLength(2);
    expect(new Set(citations.map((citation) => citation.id)).size).toBe(citations.length);
  });
});
