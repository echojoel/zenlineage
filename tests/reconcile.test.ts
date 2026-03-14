import { describe, it, expect } from "vitest";
import {
  parseDates,
  expandAbbreviatedYear,
  deterministicId,
  slugify,
  buildAliasLookup,
  resolveCanonicalKey,
  matchStrategy,
  resolveTeacherRef,
  buildSearchTokens,
  reconcile,
  type RawMaster,
  type CanonicalMaster,
} from "../scripts/reconcile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rawMaster(overrides: Partial<RawMaster> = {}): RawMaster {
  return {
    name: "Test Master",
    names_cjk: "",
    dates: "",
    teachers: [],
    school: "Chan",
    source_id: "src_wikipedia",
    ingestion_run_id: "run_test",
    ...overrides,
  };
}

const ALIAS_MAP = {
  aliases: {
    "Dongshan Liangjie": ["Tôzan Ryôkai", "Tung-shan Liang-chieh", "洞山良价"],
    Bodhidharma: ["Puti Damo", "Bodai Daruma", "P'u-ti Ta-mo", "達磨", "菩提達摩"],
    "Mazu Daoyi": ["Baso Dôitsu", "Ma-tsu Tao-i", "馬祖道一"],
    "Linji Yixuan": ["Rinzai Gigen", "Lin-chi I-hsüan", "臨済義玄"],
  },
};

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

describe("expandAbbreviatedYear", () => {
  it("807-69 → 869", () => {
    expect(expandAbbreviatedYear(807, 69)).toBe(869);
  });

  it("1025-72 → 1072", () => {
    expect(expandAbbreviatedYear(1025, 72)).toBe(1072);
  });

  it("910-90 → 990", () => {
    expect(expandAbbreviatedYear(910, 90)).toBe(990);
  });
});

describe("parseDates", () => {
  it("parses a standard year range", () => {
    const result = parseDates("487-593");
    expect(result.birth).toEqual({ year: 487, precision: "exact", confidence: "high" });
    expect(result.death).toEqual({ year: 593, precision: "exact", confidence: "high" });
  });

  it("expands abbreviated death year 807-69", () => {
    const result = parseDates("807-69");
    expect(result.birth?.year).toBe(807);
    expect(result.death?.year).toBe(869);
    expect(result.death?.precision).toBe("exact");
    expect(result.death?.confidence).toBe("high");
  });

  it("expands abbreviated death year 1025-72", () => {
    const result = parseDates("1025-72");
    expect(result.birth?.year).toBe(1025);
    expect(result.death?.year).toBe(1072);
  });

  it("parses d. 536? C.E.", () => {
    const result = parseDates("d. 536? C.E.");
    expect(result.birth).toBeNull();
    expect(result.death).toEqual({ year: 536, precision: "circa", confidence: "medium" });
  });

  it("parses d. 606", () => {
    const result = parseDates("d. 606");
    expect(result.death).toEqual({ year: 606, precision: "exact", confidence: "high" });
  });

  it("parses d. 9th c.", () => {
    const result = parseDates("d. 9th c.");
    expect(result.death?.year).toBe(850);
    expect(result.death?.precision).toBe("century");
    expect(result.death?.confidence).toBe("low");
  });

  it("parses d. 1st c.", () => {
    const result = parseDates("d. 1st c.");
    expect(result.death?.year).toBe(50);
    expect(result.death?.precision).toBe("century");
  });

  it("parses n.d. as null dates", () => {
    const result = parseDates("n.d.");
    expect(result.birth).toBeNull();
    expect(result.death).toBeNull();
  });

  it("parses empty string as null dates", () => {
    const result = parseDates("");
    expect(result.birth).toBeNull();
    expect(result.death).toBeNull();
  });

  it("parses c. 500", () => {
    const result = parseDates("c. 500");
    expect(result.birth).toEqual({ year: 500, precision: "circa", confidence: "medium" });
    expect(result.death).toBeNull();
  });

  it("parses fl. 800", () => {
    const result = parseDates("fl. 800");
    expect(result.birth).toEqual({ year: 800, precision: "circa", confidence: "low" });
    expect(result.death).toBeNull();
  });

  it("parses a four-digit range 885-958", () => {
    const result = parseDates("885-958");
    expect(result.birth?.year).toBe(885);
    expect(result.death?.year).toBe(958);
  });
});

// ---------------------------------------------------------------------------
// Alias lookup
// ---------------------------------------------------------------------------

describe("buildAliasLookup", () => {
  it("maps canonical name to itself", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    expect(lookup.get("dongshan liangjie")).toBe("Dongshan Liangjie");
  });

  it("maps alias variants to canonical name", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    expect(lookup.get("tôzan ryôkai")).toBe("Dongshan Liangjie");
    expect(lookup.get("tung-shan liang-chieh")).toBe("Dongshan Liangjie");
    expect(lookup.get("洞山良价")).toBe("Dongshan Liangjie");
  });
});

describe("resolveCanonicalKey", () => {
  it("resolves primary name directly", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const m = rawMaster({ name: "Dongshan Liangjie" });
    expect(resolveCanonicalKey(m, lookup)).toBe("dongshan liangjie");
  });

  it("resolves alias variant to canonical key", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const m = rawMaster({ name: "Tôzan Ryôkai" });
    expect(resolveCanonicalKey(m, lookup)).toBe("dongshan liangjie");
  });

  it("resolves via names_alt when primary does not match", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const m = rawMaster({
      name: "UnknownForm",
      names_alt: ["Tung-shan Liang-chieh"],
    });
    expect(resolveCanonicalKey(m, lookup)).toBe("dongshan liangjie");
  });

  it("falls back to lowercase primary name when no alias found", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const m = rawMaster({ name: "Some Obscure Master" });
    expect(resolveCanonicalKey(m, lookup)).toBe("some obscure master");
  });
});

// ---------------------------------------------------------------------------
// Test 1: Exact CJK match
// ---------------------------------------------------------------------------

describe("matchStrategy — exact CJK match", () => {
  it("detects CJK match when both masters share the same CJK characters", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const a = rawMaster({ name: "Dongshan Liangjie", names_cjk: "洞山良价" });
    const b = rawMaster({
      name: "Tung-shan Liang-chieh",
      names_cjk: "洞山良价",
      source_id: "src_chan_ancestors_pdf",
    });
    expect(matchStrategy(a, b, lookup)).toBe("cjk");
  });

  it("does not match when CJK strings differ", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const a = rawMaster({ name: "Master A", names_cjk: "洞山良价" });
    const b = rawMaster({ name: "Master B", names_cjk: "趙州從諗" });
    expect(matchStrategy(a, b, lookup)).not.toBe("cjk");
  });
});

// ---------------------------------------------------------------------------
// Test 2: Exact name match
// ---------------------------------------------------------------------------

describe("matchStrategy — exact name match", () => {
  it("detects case-insensitive name match", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const a = rawMaster({ name: "Bodhidharma" });
    const b = rawMaster({ name: "bodhidharma", source_id: "src_terebess" });
    expect(matchStrategy(a, b, lookup)).toBe("name");
  });
});

// ---------------------------------------------------------------------------
// Test 3: Alias match
// ---------------------------------------------------------------------------

describe("matchStrategy — alias match", () => {
  it("matches Tôzan Ryôkai to Dongshan Liangjie via aliases", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const a = rawMaster({ name: "Dongshan Liangjie" });
    const b = rawMaster({ name: "Tôzan Ryôkai", source_id: "src_terebess" });
    expect(matchStrategy(a, b, lookup)).toBe("alias");
  });

  it("matches Japanese and Chinese romanizations of same master", () => {
    const lookup = buildAliasLookup(ALIAS_MAP);
    const a = rawMaster({ name: "Mazu Daoyi" });
    const b = rawMaster({ name: "Baso Dôitsu", source_id: "src_terebess" });
    expect(matchStrategy(a, b, lookup)).toBe("alias");
  });
});

// ---------------------------------------------------------------------------
// Test 4: Date parsing (covered above, additional integration test)
// ---------------------------------------------------------------------------

describe("date parsing — all formats", () => {
  const cases: Array<[string, { birth: number | null; death: number | null }]> = [
    ["487-593", { birth: 487, death: 593 }],
    ["807-69", { birth: 807, death: 869 }],
    ["1025-72", { birth: 1025, death: 1072 }],
    ["d. 536? C.E.", { birth: null, death: 536 }],
    ["d. 606", { birth: null, death: 606 }],
    ["d. 9th c.", { birth: null, death: 850 }],
    ["n.d.", { birth: null, death: null }],
    ["c. 500", { birth: 500, death: null }],
    ["fl. 800", { birth: 800, death: null }],
  ];

  for (const [input, expected] of cases) {
    it(`parseDates("${input}")`, () => {
      const result = parseDates(input);
      expect(result.birth?.year ?? null).toBe(expected.birth);
      expect(result.death?.year ?? null).toBe(expected.death);
    });
  }
});

// ---------------------------------------------------------------------------
// Test 5: Ambiguous → review queue
// ---------------------------------------------------------------------------

describe("reconcile — ambiguous date+partial → review queue", () => {
  it("routes partial name matches with overlapping dates to review queue", () => {
    // Two masters: same first name token, overlapping dates, but different aliases
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Huangbo Ziran",
        dates: "800-880",
        source_id: "src_wikipedia",
      }),
      rawMaster({
        name: "Huangbo Qingliang",
        dates: "820-900",
        source_id: "src_terebess",
      }),
    ];

    const result = reconcile(rawMasters, { aliases: {} });

    // They should NOT be merged (different second component)
    // but the date+partial overlap sends them to the review queue
    expect(result.reviewQueue.length).toBeGreaterThan(0);
    const item = result.reviewQueue[0];
    expect(item.candidates.some((c) => c.name === "Huangbo Ziran")).toBe(true);
    expect(item.candidates.some((c) => c.name === "Huangbo Qingliang")).toBe(true);
  });
});

describe("reconcile — reviewed non-merges", () => {
  it("suppresses review queue entries for known distinct masters", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Daowu Yuanzhi",
        dates: "769-835",
        source_id: "src_chan_ancestors_pdf",
      }),
      rawMaster({
        name: "Tianhuang Daowu",
        dates: "748-807",
        source_id: "src_chan_ancestors_pdf",
      }),
    ];

    const result = reconcile(rawMasters, { aliases: {} });

    expect(result.reviewQueue).toHaveLength(0);
    expect(result.masters).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Test 6: No match → passthrough
// ---------------------------------------------------------------------------

describe("reconcile — unique master passes through unchanged", () => {
  it("creates one canonical master per unique raw master", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({ name: "Alpha Master", dates: "700-780", source_id: "src_wikipedia" }),
      rawMaster({ name: "Beta Master", dates: "900-970", source_id: "src_terebess" }),
    ];

    const result = reconcile(rawMasters, { aliases: {} });
    expect(result.masters).toHaveLength(2);

    const names = result.masters.map((m) => m.names[0].value).sort();
    expect(names).toContain("Alpha Master");
    expect(names).toContain("Beta Master");
  });
});

// ---------------------------------------------------------------------------
// Test 7: CJK merge
// ---------------------------------------------------------------------------

describe("reconcile — CJK merge", () => {
  it("merges two raw masters with the same CJK into one canonical master", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Dongshan Liangjie",
        names_cjk: "洞山良价",
        dates: "807-69",
        source_id: "src_chan_ancestors_pdf",
      }),
      rawMaster({
        name: "Tung-shan Liang-chieh",
        names_cjk: "洞山良价",
        dates: "807-869",
        source_id: "src_wikipedia",
      }),
    ];

    const result = reconcile(rawMasters, ALIAS_MAP);
    expect(result.masters).toHaveLength(1);

    const master = result.masters[0];
    // Primary source is chan_ancestors_pdf (higher reliability)
    expect(master.names[0].value).toBe("Dongshan Liangjie");
    expect(master.birth_year).toBe(807);
    expect(master.death_year).toBe(869);
    expect(master.source_ids).toContain("src_chan_ancestors_pdf");
    expect(master.source_ids).toContain("src_wikipedia");
  });
});

// ---------------------------------------------------------------------------
// Test 7: Teacher reference resolution
// ---------------------------------------------------------------------------

describe("resolveTeacherRef", () => {
  it("resolves teacher by slug", () => {
    const master: CanonicalMaster = {
      id: "master-1",
      slug: "dongshan-liangjie",
      names: [{ locale: "en", name_type: "dharma", value: "Dongshan Liangjie" }],
      birth_year: 807,
      birth_precision: "exact",
      birth_confidence: "high",
      death_year: 869,
      death_precision: "exact",
      death_confidence: "high",
      school: "Caodong",
      source_ids: ["src_chan_ancestors_pdf"],
    };

    const canonicalById = new Map([["master-1", master]]);
    const slugToId = new Map([["dongshan-liangjie", "master-1"]]);
    const aliasLookup = buildAliasLookup(ALIAS_MAP);

    const id = resolveTeacherRef("Dongshan Liangjie", canonicalById, slugToId, aliasLookup);
    expect(id).toBe("master-1");
  });

  it("resolves teacher by alias", () => {
    const master: CanonicalMaster = {
      id: "master-1",
      slug: "dongshan-liangjie",
      names: [{ locale: "en", name_type: "dharma", value: "Dongshan Liangjie" }],
      birth_year: 807,
      birth_precision: "exact",
      birth_confidence: "high",
      death_year: 869,
      death_precision: "exact",
      death_confidence: "high",
      school: "Caodong",
      source_ids: ["src_chan_ancestors_pdf"],
    };

    const canonicalById = new Map([["master-1", master]]);
    const slugToId = new Map([["dongshan-liangjie", "master-1"]]);
    const aliasLookup = buildAliasLookup(ALIAS_MAP);

    // 'Tôzan Ryôkai' → canonical 'Dongshan Liangjie' → slug → ID
    const id = resolveTeacherRef("Tôzan Ryôkai", canonicalById, slugToId, aliasLookup);
    expect(id).toBe("master-1");
  });

  it("returns null for unresolvable teacher", () => {
    const canonicalById = new Map<string, CanonicalMaster>();
    const slugToId = new Map<string, string>();
    const aliasLookup = buildAliasLookup({ aliases: {} });

    const id = resolveTeacherRef("Completely Unknown", canonicalById, slugToId, aliasLookup);
    expect(id).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Test 7 (continued): Transmission edges built from teacher refs
// ---------------------------------------------------------------------------

describe("reconcile — teacher reference resolution produces transmissions", () => {
  it("creates a transmission edge when teacher resolves to a canonical master", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Yunyan Tansheng",
        dates: "780-841",
        teachers: [{ name: "Dongshan Liangjie", edge_type: "primary" }],
        source_id: "src_wikipedia",
      }),
      rawMaster({
        name: "Dongshan Liangjie",
        names_cjk: "洞山良价",
        dates: "807-69",
        teachers: [],
        source_id: "src_chan_ancestors_pdf",
      }),
    ];

    const result = reconcile(rawMasters, ALIAS_MAP);
    expect(result.transmissions.length).toBeGreaterThan(0);

    const dongshan = result.masters.find((m) => m.names[0].value === "Dongshan Liangjie");
    expect(dongshan).toBeDefined();

    const tx = result.transmissions.find((t) => t.teacher_id === dongshan!.id);
    expect(tx).toBeDefined();
    expect(tx!.type).toBe("primary");
    expect(tx!.is_primary).toBe(true);
  });

  it("does not create a transmission edge for unresolvable teacher", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Some Student",
        teachers: [{ name: "Ghost Teacher", edge_type: "primary" }],
        source_id: "src_wikipedia",
      }),
    ];

    const result = reconcile(rawMasters, { aliases: {} });
    expect(result.transmissions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Test 8: DAG validation integration
// ---------------------------------------------------------------------------

describe("reconcile — DAG validation integration", () => {
  it("returns valid DAG result when no structural issues exist", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({
        name: "Teacher A",
        dates: "700-780",
        source_id: "src_wikipedia",
      }),
      rawMaster({
        name: "Student B",
        dates: "760-840",
        teachers: [{ name: "Teacher A", edge_type: "primary" }],
        source_id: "src_wikipedia",
      }),
    ];

    const result = reconcile(rawMasters, { aliases: {} });
    // No self-loops, no cycles
    expect(result.dagResult.errors.filter((e) => e.type === "self_loop")).toHaveLength(0);
    expect(result.dagResult.errors.filter((e) => e.type === "cycle")).toHaveLength(0);
  });

  it("exposes DAG result object with valid, errors, warnings fields", () => {
    const result = reconcile([], { aliases: {} });
    expect(result.dagResult).toHaveProperty("valid");
    expect(result.dagResult).toHaveProperty("errors");
    expect(result.dagResult).toHaveProperty("warnings");
  });

  it("idempotency — two runs on the same input produce identical master IDs", () => {
    const rawMasters: RawMaster[] = [
      rawMaster({ name: "Stable Master", dates: "800-880", source_id: "src_wikipedia" }),
    ];

    const r1 = reconcile(rawMasters, { aliases: {} });
    const r2 = reconcile(rawMasters, { aliases: {} });

    expect(r1.masters[0].id).toBe(r2.masters[0].id);
    expect(r1.masters[0].slug).toBe(r2.masters[0].slug);
  });
});

// ---------------------------------------------------------------------------
// Search tokens
// ---------------------------------------------------------------------------

describe("buildSearchTokens", () => {
  it("generates tokens for all name values", () => {
    const masters: CanonicalMaster[] = [
      {
        id: "test-id",
        slug: "bodhidharma",
        names: [
          { locale: "en", name_type: "dharma", value: "Bodhidharma" },
          { locale: "zh", name_type: "alias", value: "達磨" },
        ],
        birth_year: null,
        birth_precision: "unknown",
        birth_confidence: "low",
        death_year: 536,
        death_precision: "circa",
        death_confidence: "medium",
        school: "Chan",
        source_ids: ["src_wikipedia"],
      },
    ];

    const tokens = buildSearchTokens(masters);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((t) => t.entity_id === "test-id")).toBe(true);
    expect(tokens.some((t) => t.token.includes("bodhidharma"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deterministicId
// ---------------------------------------------------------------------------

describe("deterministicId", () => {
  it("returns the same ID for the same seed", () => {
    expect(deterministicId("master:bodhidharma")).toBe(deterministicId("master:bodhidharma"));
  });

  it("returns different IDs for different seeds", () => {
    expect(deterministicId("master:bodhidharma")).not.toBe(deterministicId("master:huike"));
  });

  it("returns a 21-character string", () => {
    expect(deterministicId("any seed").length).toBe(21);
  });
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Dongshan Liangjie")).toBe("dongshan-liangjie");
  });

  it("strips diacritics", () => {
    expect(slugify("Tôzan Ryôkai")).toBe("tozan-ryokai");
  });

  it("handles names with apostrophes", () => {
    expect(slugify("Lin-chi I-hsüan")).toBe("lin-chi-i-hsuan");
  });
});
