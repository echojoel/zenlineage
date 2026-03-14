import { describe, expect, it } from "vitest";
import { MUMONKAN_MASTER_MAP, parseMumonkanTOC, parseMumonkanCasePage, buildMumonkanTeaching } from "../scripts/extract-wikisource";
import fs from "fs";
import path from "path";

// Load canonical.json to validate slugs
const canonicalPath = path.join(process.cwd(), "scripts/data/reconciled/canonical.json");
const canonical: { slug: string }[] = JSON.parse(fs.readFileSync(canonicalPath, "utf-8"));
const canonicalSlugs = new Set(canonical.map((m) => m.slug));

describe("MUMONKAN_MASTER_MAP", () => {
  it("every slug is either 'unknown' or exists in canonical.json", () => {
    for (const [caseNum, entry] of Object.entries(MUMONKAN_MASTER_MAP)) {
      if (entry.slug === "unknown") continue;
      expect(canonicalSlugs.has(entry.slug), `Case ${caseNum}: slug "${entry.slug}" not found in canonical.json`).toBe(true);
    }
  });

  it("has exactly 48 entries", () => {
    expect(Object.keys(MUMONKAN_MASTER_MAP).length).toBe(48);
  });

  it("contains the corrected slugs", () => {
    expect(MUMONKAN_MASTER_MAP[3].slug).toBe("jinhua-juzhi");
    expect(MUMONKAN_MASTER_MAP[4].slug).toBe("dajian-huineng");
    expect(MUMONKAN_MASTER_MAP[6].slug).toBe("shakyamuni-buddha");
    expect(MUMONKAN_MASTER_MAP[24].slug).toBe("fengxue-yanzhao");
    expect(MUMONKAN_MASTER_MAP[41].slug).toBe("puti-damo");
    expect(MUMONKAN_MASTER_MAP[48].slug).toBe("yuezhou-qianfeng");
  });

  it("cases 10, 17, 20, 26, 32, 35 are unknown", () => {
    for (const caseNum of [10, 17, 20, 26, 32, 35]) {
      expect(MUMONKAN_MASTER_MAP[caseNum].slug).toBe("unknown");
    }
  });
});

describe("parseMumonkanTOC", () => {
  it("parses a minimal TOC fixture", () => {
    const html = `
      <div class="mw-parser-output">
        <div class="ws-summary">
          <ol>
            <li><a href="/wiki/The_Gateless_Gate/Joshu%27s_Dog">Joshu's Dog</a></li>
            <li><a href="/wiki/The_Gateless_Gate/Hyakujo%27s_Fox">Hyakujo's Fox</a></li>
            <li><a href="/wiki/The_Gateless_Gate/Gutei%27s_Finger">Gutei's Finger</a></li>
          </ol>
        </div>
      </div>
    `;
    const entries = parseMumonkanTOC(html);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      caseNum: 1,
      title: "Joshu's Dog",
      subpage: "The_Gateless_Gate/Joshu%27s_Dog",
    });
    expect(entries[2].caseNum).toBe(3);
    expect(entries[2].title).toBe("Gutei's Finger");
  });

  it("caps at 48 entries (excludes Amban's Addition)", () => {
    // Build a TOC with 50 entries
    const items = Array.from({ length: 50 }, (_, i) =>
      `<li><a href="/wiki/The_Gateless_Gate/Case_${i + 1}">Case ${i + 1}</a></li>`
    ).join("");
    const html = `<div class="ws-summary"><ol>${items}</ol></div>`;
    const entries = parseMumonkanTOC(html);
    expect(entries).toHaveLength(48);
  });
});

describe("parseMumonkanCasePage", () => {
  it("strips Wikisource chrome and returns clean text", () => {
    const html = `
      <div class="mw-parser-output">
        <div class="ws-noexport">Navigation stuff</div>
        <div class="ws-header wst-header-structure">Header chrome</div>
        <style>.some-style { color: red; }</style>
        <p>A monk asked Joshu, "Has a dog Buddha-nature or not?"</p>
        <p>Joshu answered: "Mu."</p>
      </div>
    `;
    const text = parseMumonkanCasePage(html);
    expect(text).toContain("A monk asked Joshu");
    expect(text).toContain("Mu.");
    expect(text).not.toContain("Navigation stuff");
    expect(text).not.toContain("Header chrome");
    expect(text).not.toContain("some-style");
  });
});

describe("buildMumonkanTeaching", () => {
  it("builds correct teaching for case 1", () => {
    const teaching = buildMumonkanTeaching(1, "Joshu's Dog", "A monk asked...", "src_test", "run_test");
    expect(teaching.slug).toBe("mumonkan-case-01");
    expect(teaching.type).toBe("koan");
    expect(teaching.author_slug).toBe("zhaozhou-congshen");
    expect(teaching.collection).toBe("Mumonkan");
    expect(teaching.case_number).toBe("1");
    expect(teaching.compiler).toBe("Wumen Huikai");
    expect(teaching.master_roles).toEqual([
      { slug: "zhaozhou-congshen", role: "speaker" },
      { slug: "wumen-huikai", role: "commentator" },
    ]);
  });

  it("builds teaching with unknown author for case 17", () => {
    const teaching = buildMumonkanTeaching(17, "Test", "Content", "src_test", "run_test");
    expect(teaching.author_slug).toBe("unknown");
    // Unknown authors don't get speaker role, only commentator
    expect(teaching.master_roles).toEqual([
      { slug: "wumen-huikai", role: "commentator" },
    ]);
  });

  it("builds correct teaching for case 48", () => {
    const teaching = buildMumonkanTeaching(48, "One Road", "Content", "src_test", "run_test");
    expect(teaching.slug).toBe("mumonkan-case-48");
    expect(teaching.author_slug).toBe("yuezhou-qianfeng");
    expect(teaching.master_roles).toEqual([
      { slug: "yuezhou-qianfeng", role: "speaker" },
      { slug: "wumen-huikai", role: "commentator" },
    ]);
  });
});
