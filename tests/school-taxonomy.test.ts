import { describe, expect, it } from "vitest";
import { reconcile, type RawMaster } from "../scripts/reconcile";
import {
  determineSchoolDefinition,
  getSchoolAncestors,
  normalizeSchoolLabel,
} from "../src/lib/school-taxonomy";

const ALIAS_MAP = {
  aliases: {
    Dōgen: ["Dogen", "Eihei Dōgen", "Yongping Daoyuan", "道元"],
    "Tiantong Rujing": ["Tendô Nyojô", "T'ien-t'ung Ju-ching"],
    "Koun Ejō": ["Koun Ejo", "Ejo"],
    "Tettsū Gikai": ["Tettsu Gikai", "Gikai"],
    "Keizan Jōkin": ["Keizan Jokin", "Keizan"],
  },
};

function rawMaster(overrides: Partial<RawMaster>): RawMaster {
  return {
    name: "Placeholder",
    names_cjk: "",
    dates: "",
    teachers: [],
    school: "Chan",
    source_id: "src_wikipedia",
    ingestion_run_id: "run_test",
    ...overrides,
  };
}

describe("school taxonomy", () => {
  it("normalizes mixed Chan/Zen labels to a canonical school", () => {
    expect(normalizeSchoolLabel("Caodong/Soto")?.slug).toBe("soto");
    expect(normalizeSchoolLabel("Linji/Rinzai")?.slug).toBe("rinzai");
    expect(normalizeSchoolLabel("Sanbo-Zen")?.slug).toBe("sanbo-zen");
    expect(normalizeSchoolLabel("Indian patriarchs")?.slug).toBe("indian-patriarchs");
  });

  it("applies curated master overrides for Dogen", () => {
    expect(
      determineSchoolDefinition({
        rawLabel: "Caodong",
        names: ["Yongping Daoyuan", "Dōgen"],
      })?.slug,
    ).toBe("soto");
  });

  it("retains the Soto parent chain through Caodong", () => {
    expect(getSchoolAncestors("soto").map((school) => school.slug)).toEqual([
      "chan",
      "qingyuan-line",
      "caodong",
      "soto",
    ]);
  });

  it("assigns Indian patriarchs by curated name override", () => {
    expect(
      determineSchoolDefinition({
        rawLabel: "",
        names: ["Kapimala"],
      })?.slug,
    ).toBe("indian-patriarchs");
  });

  it("routes broad special cases into Other when the source lacks a school", () => {
    expect(
      determineSchoolDefinition({
        rawLabel: "",
        names: ["Pang Yun", "Layman Pang"],
      })?.slug,
    ).toBe("other");
  });
});

describe("Soto reconciliation", () => {
  it("builds a Soto lineage with Dogen linked to Rujing", () => {
    const raw: RawMaster[] = [
      rawMaster({
        name: "Tiantong Rujing",
        names_alt: ["Tendô Nyojô"],
        school: "Caodong",
        source_id: "src_chan_ancestors_pdf",
      }),
      rawMaster({
        name: "Yongping Daoyuan",
        names_alt: ["Eihei Dōgen"],
        school: "Caodong",
        source_id: "src_chan_ancestors_pdf",
      }),
      rawMaster({
        name: "Dogen",
        names_cjk: "道元",
        dates: "1200-1253",
        teachers: [{ name: "Tiantong Rujing", edge_type: "primary" }],
        school: "Soto",
        source_id: "src_sotozen_founders",
        ingestion_run_id: "run_soto_curated",
        names_alt: ["Eihei Dōgen", "Yongping Daoyuan"],
      }),
      rawMaster({
        name: "Koun Ejo",
        teachers: [{ name: "Dogen", edge_type: "primary" }],
        school: "Soto",
        source_id: "src_sotozen_founders",
        ingestion_run_id: "run_soto_curated",
        names_alt: ["Koun Ejō"],
      }),
      rawMaster({
        name: "Tettsu Gikai",
        teachers: [{ name: "Koun Ejo", edge_type: "primary" }],
        school: "Soto",
        source_id: "src_sotozen_founders",
        ingestion_run_id: "run_soto_curated",
        names_alt: ["Tettsū Gikai"],
      }),
    ];

    const result = reconcile(raw, ALIAS_MAP);

    const dogen = result.masters.find((master) =>
      master.names.some((name) => name.value === "Dōgen" || name.value === "Dogen"),
    );
    const rujing = result.masters.find((master) =>
      master.names.some((name) => name.value === "Tiantong Rujing"),
    );

    expect(dogen?.school).toBe("Soto");
    expect(result.masters.some((master) => master.school === "Soto")).toBe(true);
    expect(
      result.transmissions.some(
        (edge) => edge.teacher_id === rujing?.id && edge.student_id === dogen?.id,
      ),
    ).toBe(true);
    expect(
      result.transmissions.some(
        (edge) =>
          edge.student_id !== dogen?.id &&
          edge.source_ids.includes("src_sotozen_founders"),
      ),
    ).toBe(true);
  });
});
