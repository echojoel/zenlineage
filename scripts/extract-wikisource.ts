#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Wikisource Teaching Extractor
// Fetches Mumonkan (48 cases) and Blue Cliff Record (100 cases) from
// Wikisource via the MediaWiki API, parsing public-domain translations.
// ---------------------------------------------------------------------------

import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import type { RawTeaching, RawMasterRole } from "./scraper-types";
import {
  startIngestionRun,
  finishIngestionRun,
  failIngestionRun,
  fingerprintContent,
  toArchiveRef,
} from "./ingestion-provenance";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RATE_LIMIT_MS = 300;
const USER_AGENT = "zen-encyclopedia/1.0 (contact: zen-project@example.com)";
const OUTPUT_DIR = "scripts/data/raw-teachings";
const OUTPUT_PATH = path.join(OUTPUT_DIR, "wikisource-teachings.json");

const MUMONKAN_PAGE = "The_Gateless_Gate";
const MUMONKAN_SOURCE_ID = "src_mumonkan_senzaki_1934";
const BLUE_CLIFF_PAGE = "Blue_Cliff_Record";
const BLUE_CLIFF_SOURCE_ID = "src_blue_cliff_record_shaw_1961";

// ---------------------------------------------------------------------------
// Well-known master slugs for Mumonkan cases
// Maps case number to the primary protagonist master.
// ---------------------------------------------------------------------------

export const MUMONKAN_MASTER_MAP: Record<number, { slug: string; name: string }> = {
  1: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  2: { slug: "baizhang-huaihai", name: "Baizhang" },
  3: { slug: "juzhi", name: "Juzhi" },
  4: { slug: "huineng", name: "Huineng" },
  5: { slug: "xiangyan-zhixian", name: "Xiangyan" },
  6: { slug: "shakyamuni", name: "Buddha" },
  7: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  8: { slug: "xitang-zhizang", name: "Xitang" },
  9: { slug: "xingyang-qingrang", name: "Xingyang" },
  10: { slug: "qingshui", name: "Qingshui" },
  11: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  12: { slug: "ruiyan-shiyan", name: "Ruiyan" },
  13: { slug: "deshan-xuanjian", name: "Deshan" },
  14: { slug: "nanquan-puyuan", name: "Nanquan" },
  15: { slug: "dongshan-shouchu", name: "Dongshan" },
  16: { slug: "yunmen-wenyan", name: "Yunmen" },
  17: { slug: "unknown", name: "National Teacher" },
  18: { slug: "dongshan-shouchu", name: "Dongshan" },
  19: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  20: { slug: "shogen", name: "Shogen" },
  21: { slug: "yunmen-wenyan", name: "Yunmen" },
  22: { slug: "mahakashyapa", name: "Kashyapa" },
  23: { slug: "huineng", name: "Huineng" },
  24: { slug: "fuketsu-ensho", name: "Fuketsu" },
  25: { slug: "yangshan-huiji", name: "Yangshan" },
  26: { slug: "unknown", name: "Two Monks" },
  27: { slug: "nanquan-puyuan", name: "Nanquan" },
  28: { slug: "deshan-xuanjian", name: "Deshan" },
  29: { slug: "huineng", name: "Huineng" },
  30: { slug: "mazu-daoyi", name: "Mazu" },
  31: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  32: { slug: "unknown", name: "Outsider" },
  33: { slug: "mazu-daoyi", name: "Mazu" },
  34: { slug: "nanquan-puyuan", name: "Nanquan" },
  35: { slug: "unknown", name: "Seijo" },
  36: { slug: "wuzu-fayan", name: "Wuzu" },
  37: { slug: "zhaozhou-congshen", name: "Zhaozhou" },
  38: { slug: "wuzu-fayan", name: "Wuzu" },
  39: { slug: "yunmen-wenyan", name: "Yunmen" },
  40: { slug: "guishan-lingyou", name: "Guishan" },
  41: { slug: "bodhidharma", name: "Bodhidharma" },
  42: { slug: "shakyamuni", name: "Buddha" },
  43: { slug: "shoushan-xingnian", name: "Shoushan" },
  44: { slug: "bajiao-huiqing", name: "Bajiao" },
  45: { slug: "dongshan-shouchu", name: "Dongshan" },
  46: { slug: "xiangyan-zhixian", name: "Xiangyan" },
  47: { slug: "doushuai-congyue", name: "Doushuai" },
  48: { slug: "qianfeng", name: "Qianfeng" },
};

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWikisourcePage(title: string): Promise<string> {
  const url = `https://en.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Wikisource API returned ${res.status} for "${title}"`);
  }
  const data = (await res.json()) as {
    parse?: { text: { "*": string } };
    error?: { info: string };
  };
  if (data.error) {
    throw new Error(`Wikisource error: ${data.error.info}`);
  }
  if (!data.parse?.text?.["*"]) {
    throw new Error(`Unexpected API response structure for "${title}"`);
  }
  return data.parse.text["*"];
}

// ---------------------------------------------------------------------------
// Mumonkan (The Gateless Gate) parser
// ---------------------------------------------------------------------------

/**
 * Parse the Gateless Gate HTML from Wikisource into individual case teachings.
 *
 * The Senzaki/Reps translation on Wikisource structures each case with headings
 * like "1. Joshu's Dog", "2. Hyakujo's Fox", etc. Each heading is followed by
 * the case text, Mumon's comment, and verse.
 *
 * We treat the entire content of each case (main case + comment + verse) as
 * the `content` field, since they form a cohesive teaching unit.
 */
export function parseMumonkan(
  html: string,
  sourceId: string,
  ingestionRunId: string
): RawTeaching[] {
  const $ = cheerio.load(html);
  const teachings: RawTeaching[] = [];

  // Strategy 1: Look for headings that match case number patterns
  // The Gateless Gate page typically uses h2 or h3 headings for cases
  const casePattern = /^(\d{1,2})\.\s*(.+)$/;

  // Collect all heading elements and their content
  const headings: { caseNum: number; title: string; content: string }[] = [];

  // Try multiple heading selectors — Wikisource markup varies
  const headingSelectors = ["h2", "h3", "h4"];
  let matchedSelector: string | null = null;

  for (const sel of headingSelectors) {
    const candidates: { caseNum: number; title: string; el: cheerio.Element }[] = [];
    $(sel).each((_i, el) => {
      const text = $(el).text().trim();
      const match = text.match(casePattern);
      if (match) {
        candidates.push({
          caseNum: parseInt(match[1]!, 10),
          title: match[2]!.trim(),
          el,
        });
      }
    });
    if (candidates.length >= 10) {
      // Found a heading level with enough case matches
      matchedSelector = sel;
      // Extract content between consecutive headings
      for (let i = 0; i < candidates.length; i++) {
        const current = candidates[i]!;
        const contentParts: string[] = [];
        let node = $(current.el).next();
        const nextCaseEl = i < candidates.length - 1 ? candidates[i + 1]!.el : null;

        while (node.length > 0) {
          if (nextCaseEl && node[0] === nextCaseEl) break;
          // Stop if we hit a heading at the same or higher level
          const tagName = node.prop("tagName")?.toLowerCase() ?? "";
          if (
            tagName === matchedSelector &&
            node.text().trim().match(casePattern)
          ) {
            break;
          }
          contentParts.push(node.text().trim());
          node = node.next();
        }

        headings.push({
          caseNum: current.caseNum,
          title: current.title,
          content: contentParts.filter(Boolean).join("\n\n"),
        });
      }
      break;
    }
  }

  // Strategy 2: If headings didn't work, try <dl>/<dt> or <span class="mw-headline">
  if (headings.length < 10) {
    $(".mw-headline").each((_i, el) => {
      const text = $(el).text().trim();
      const match = text.match(casePattern);
      if (match) {
        const parentHeading = $(el).parent();
        const contentParts: string[] = [];
        let node = parentHeading.next();

        while (node.length > 0) {
          const hasHeadline = node.find(".mw-headline").length > 0;
          if (hasHeadline) {
            const nextText = node.find(".mw-headline").text().trim();
            if (nextText.match(casePattern)) break;
          }
          contentParts.push(node.text().trim());
          node = node.next();
        }

        headings.push({
          caseNum: parseInt(match[1]!, 10),
          title: match[2]!.trim(),
          content: contentParts.filter(Boolean).join("\n\n"),
        });
      }
    });
  }

  // Build RawTeaching records from parsed headings
  for (const h of headings) {
    if (h.caseNum < 1 || h.caseNum > 48) continue;

    const masterInfo = MUMONKAN_MASTER_MAP[h.caseNum];
    const authorSlug = masterInfo?.slug ?? "unknown";

    const masterRoles: RawMasterRole[] = [];
    if (masterInfo && masterInfo.slug !== "unknown") {
      masterRoles.push({ slug: masterInfo.slug, role: "speaker" });
    }
    // Wumen Huikai is always the commentator
    masterRoles.push({ slug: "wumen-huikai", role: "commentator" });

    teachings.push({
      slug: `mumonkan-case-${String(h.caseNum).padStart(2, "0")}`,
      type: "koan",
      author_slug: authorSlug,
      collection: "Mumonkan",
      case_number: String(h.caseNum),
      compiler: "Wumen Huikai",
      era: "Song",
      attribution_status: "verified",
      locale: "en",
      title: h.title,
      content: h.content,
      source_id: sourceId,
      ingestion_run_id: ingestionRunId,
      locator: `Case ${h.caseNum}`,
      master_roles: masterRoles,
    });
  }

  // Sort by case number
  teachings.sort(
    (a, b) => parseInt(a.case_number!, 10) - parseInt(b.case_number!, 10)
  );

  return teachings;
}

// ---------------------------------------------------------------------------
// Blue Cliff Record parser
// ---------------------------------------------------------------------------

/**
 * Parse the Blue Cliff Record HTML from Wikisource.
 *
 * The Blue Cliff Record (Biyan Lu) has 100 cases compiled by Xuedou Chongxian
 * (verses) and Yuanwu Keqin (commentary). The page structure may vary — this
 * parser attempts multiple strategies to extract individual cases.
 */
export function parseBlueCliffRecord(
  html: string,
  sourceId: string,
  ingestionRunId: string
): RawTeaching[] {
  const $ = cheerio.load(html);
  const teachings: RawTeaching[] = [];

  const casePattern = /^(?:Case\s+)?(\d{1,3})[\.\:\s]+(.+)$/i;

  // Try heading-based extraction
  const headingSelectors = ["h2", "h3", "h4"];

  for (const sel of headingSelectors) {
    const candidates: { caseNum: number; title: string; el: cheerio.Element }[] = [];

    $(sel).each((_i, el) => {
      const text = $(el).text().trim();
      const match = text.match(casePattern);
      if (match) {
        const num = parseInt(match[1]!, 10);
        if (num >= 1 && num <= 100) {
          candidates.push({
            caseNum: num,
            title: match[2]!.trim(),
            el,
          });
        }
      }
    });

    if (candidates.length >= 5) {
      for (let i = 0; i < candidates.length; i++) {
        const current = candidates[i]!;
        const contentParts: string[] = [];
        let node = $(current.el).next();
        const nextCaseEl = i < candidates.length - 1 ? candidates[i + 1]!.el : null;

        while (node.length > 0) {
          if (nextCaseEl && node[0] === nextCaseEl) break;
          const tagName = node.prop("tagName")?.toLowerCase() ?? "";
          if (tagName === sel) {
            const nextText = node.text().trim();
            if (nextText.match(casePattern)) break;
          }
          contentParts.push(node.text().trim());
          node = node.next();
        }

        teachings.push({
          slug: `blue-cliff-case-${String(current.caseNum).padStart(3, "0")}`,
          type: "koan",
          author_slug: "unknown",
          collection: "Blue Cliff Record",
          case_number: String(current.caseNum),
          compiler: "Xuedou Chongxian / Yuanwu Keqin",
          era: "Song",
          attribution_status: "verified",
          locale: "en",
          title: current.title,
          content: contentParts.filter(Boolean).join("\n\n"),
          source_id: sourceId,
          ingestion_run_id: ingestionRunId,
          locator: `Case ${current.caseNum}`,
          master_roles: [
            { slug: "xuedou-chongxian", role: "compiler" },
            { slug: "yuanwu-keqin", role: "commentator" },
          ],
        });
      }
      break;
    }
  }

  // Also try mw-headline spans
  if (teachings.length < 5) {
    $(".mw-headline").each((_i, el) => {
      const text = $(el).text().trim();
      const match = text.match(casePattern);
      if (match) {
        const num = parseInt(match[1]!, 10);
        if (num < 1 || num > 100) return;

        const parentHeading = $(el).parent();
        const contentParts: string[] = [];
        let node = parentHeading.next();

        while (node.length > 0) {
          const hasHeadline = node.find(".mw-headline").length > 0;
          if (hasHeadline) {
            const nextText = node.find(".mw-headline").text().trim();
            if (nextText.match(casePattern)) break;
          }
          contentParts.push(node.text().trim());
          node = node.next();
        }

        teachings.push({
          slug: `blue-cliff-case-${String(num).padStart(3, "0")}`,
          type: "koan",
          author_slug: "unknown",
          collection: "Blue Cliff Record",
          case_number: String(num),
          compiler: "Xuedou Chongxian / Yuanwu Keqin",
          era: "Song",
          attribution_status: "verified",
          locale: "en",
          title: match[2]!.trim(),
          content: contentParts.filter(Boolean).join("\n\n"),
          source_id: sourceId,
          ingestion_run_id: ingestionRunId,
          locator: `Case ${num}`,
          master_roles: [
            { slug: "xuedou-chongxian", role: "compiler" },
            { slug: "yuanwu-keqin", role: "commentator" },
          ],
        });
      }
    });
  }

  // Sort by case number
  teachings.sort(
    (a, b) => parseInt(a.case_number!, 10) - parseInt(b.case_number!, 10)
  );

  return teachings;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Wikisource Teaching Extractor");
  console.log("============================\n");

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allTeachings: RawTeaching[] = [];
  const rawHtmlParts: string[] = [];

  // -- Mumonkan (The Gateless Gate) --
  const mumonkanRun = await startIngestionRun({
    sourceId: MUMONKAN_SOURCE_ID,
    scriptName: "extract-wikisource.ts",
  });

  try {
    console.log(`Fetching Mumonkan from Wikisource page: ${MUMONKAN_PAGE}...`);
    const mumonkanHtml = await fetchWikisourcePage(MUMONKAN_PAGE);
    rawHtmlParts.push(mumonkanHtml);

    console.log("Parsing Mumonkan cases...");
    const mumonkanTeachings = parseMumonkan(
      mumonkanHtml,
      MUMONKAN_SOURCE_ID,
      mumonkanRun.id
    );

    console.log(`  Extracted ${mumonkanTeachings.length} Mumonkan cases`);
    if (mumonkanTeachings.length === 0) {
      console.warn(
        "  WARNING: No Mumonkan cases extracted. Page structure may have changed."
      );
    }

    allTeachings.push(...mumonkanTeachings);

    await finishIngestionRun(mumonkanRun, {
      recordCount: mumonkanTeachings.length,
      notes: `Extracted ${mumonkanTeachings.length} Mumonkan cases from Wikisource.`,
      snapshotHash: fingerprintContent(mumonkanHtml),
      snapshotArchiveRef: toArchiveRef(OUTPUT_PATH),
    });
  } catch (err) {
    console.error("  ERROR fetching/parsing Mumonkan:", err);
    await failIngestionRun(mumonkanRun, err);
    // Continue to try Blue Cliff Record
  }

  await sleep(RATE_LIMIT_MS);

  // -- Blue Cliff Record --
  const blueCliffRun = await startIngestionRun({
    sourceId: BLUE_CLIFF_SOURCE_ID,
    scriptName: "extract-wikisource.ts",
  });

  try {
    console.log(
      `\nFetching Blue Cliff Record from Wikisource page: ${BLUE_CLIFF_PAGE}...`
    );
    const blueCliffHtml = await fetchWikisourcePage(BLUE_CLIFF_PAGE);
    rawHtmlParts.push(blueCliffHtml);

    console.log("Parsing Blue Cliff Record cases...");
    const blueCliffTeachings = parseBlueCliffRecord(
      blueCliffHtml,
      BLUE_CLIFF_SOURCE_ID,
      blueCliffRun.id
    );

    console.log(
      `  Extracted ${blueCliffTeachings.length} Blue Cliff Record cases`
    );
    if (blueCliffTeachings.length === 0) {
      console.warn(
        "  WARNING: No Blue Cliff Record cases extracted. " +
          "Page may not exist or structure may differ."
      );
    }

    allTeachings.push(...blueCliffTeachings);

    await finishIngestionRun(blueCliffRun, {
      recordCount: blueCliffTeachings.length,
      notes: `Extracted ${blueCliffTeachings.length} Blue Cliff Record cases from Wikisource.`,
      snapshotHash: fingerprintContent(blueCliffHtml),
      snapshotArchiveRef: toArchiveRef(OUTPUT_PATH),
    });
  } catch (err) {
    console.error("  ERROR fetching/parsing Blue Cliff Record:", err);
    await failIngestionRun(blueCliffRun, err);
  }

  // Write output
  if (allTeachings.length > 0) {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTeachings, null, 2));
    console.log(
      `\nWrote ${allTeachings.length} teachings to ${OUTPUT_PATH}`
    );
  } else {
    console.warn("\nNo teachings extracted. Output file not written.");
  }

  console.log("\nDone.");
}

// Only run main when executed directly (not when imported for testing)
const isDirectRun =
  process.argv[1]?.endsWith("extract-wikisource.ts") ||
  process.argv[1]?.endsWith("extract-wikisource");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
}
