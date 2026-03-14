#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Tibetan Buddhist Encyclopedia scraper
// Parses nested <ul>/<li> lineage trees where teacher-student relationships
// are encoded by nesting depth.
// ---------------------------------------------------------------------------

import * as cheerio from "cheerio";
import fs from "fs";
import type { RawMaster, RawTeacherRef } from "./scraper-types";
import {
  failIngestionRun,
  finishIngestionRun,
  fingerprintContent,
  startIngestionRun,
  toArchiveRef,
} from "./ingestion-provenance";

/**
 * Parse a single <li> text node to extract name, CJK, and dates.
 *
 * Expected format: "Name (CJK, dates)" or "Name (dates)" or just "Name"
 * Examples:
 *   "Bodhidharma (菩提達摩, d. 536?)"
 *   "Dazu Huike (大祖慧可, 487-593)"
 *   "Jianzhi Sengcan (鑑智僧璨, d. 606)"
 */
function parseMasterText(text: string): {
  name: string;
  names_cjk: string;
  dates: string;
} {
  const trimmed = text.trim();

  // Match pattern: Name (parenthetical content)
  const parenMatch = trimmed.match(/^([^(]+)\(([^)]+)\)\s*$/);
  if (!parenMatch) {
    return { name: trimmed, names_cjk: "", dates: "" };
  }

  const name = parenMatch[1]!.trim();
  const parenContent = parenMatch[2]!.trim();

  // Split parenthetical on comma — may contain CJK + dates, or just dates
  const parts = parenContent.split(",").map((p) => p.trim());

  // Check if first part contains CJK characters
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}]/u;

  if (parts.length >= 2 && cjkRegex.test(parts[0]!)) {
    return {
      name,
      names_cjk: parts[0]!,
      dates: parts.slice(1).join(", ").trim(),
    };
  }

  // No CJK — entire parenthetical is dates
  if (/\d/.test(parenContent)) {
    return { name, names_cjk: "", dates: parenContent };
  }

  return { name, names_cjk: parenContent, dates: "" };
}

/**
 * Recursively walk a <ul> tree, tracking parent at each nesting level.
 */
function walkList(
  $: ReturnType<typeof cheerio.load>,
  ul: cheerio.Element,
  parentName: string | null,
  school: string,
  sourceId: string,
  ingestionRunId: string,
  results: RawMaster[]
): void {
  $(ul)
    .children("li")
    .each((_i, li) => {
      // Get only the direct text of this <li>, excluding nested <ul>
      const directText = $(li)
        .contents()
        .filter(function (this: { type?: string }) {
          return this.type === "text";
        })
        .text()
        .trim();

      if (!directText) return;

      const parsed = parseMasterText(directText);
      const teachers: RawTeacherRef[] = [];

      if (parentName) {
        teachers.push({ name: parentName, edge_type: "primary" });
      }

      results.push({
        name: parsed.name,
        names_cjk: parsed.names_cjk,
        dates: parsed.dates,
        teachers,
        school,
        source_id: sourceId,
        ingestion_run_id: ingestionRunId,
      });

      // Recurse into nested <ul>
      $(li)
        .children("ul")
        .each((_j, nestedUl) => {
          walkList(
            $,
            nestedUl as cheerio.Element,
            parsed.name,
            school,
            sourceId,
            ingestionRunId,
            results
          );
        });
    });
}

/**
 * Pure parsing function — testable without network access.
 * Expects HTML with .lineage-tree containers holding nested <ul> lists.
 */
export function parseHtml(html: string, sourceId: string, ingestionRunId: string): RawMaster[] {
  const $ = cheerio.load(html);
  const masters: RawMaster[] = [];

  $("div.lineage-tree").each((_i, treeDiv) => {
    // Try to find a school label from a preceding heading or data attribute
    const school =
      $(treeDiv).attr("data-school") || $(treeDiv).prev("h2, h3").text().trim() || "Chan";

    // Walk top-level <ul> elements
    $(treeDiv)
      .children("ul")
      .each((_j, ul) => {
        walkList($, ul as cheerio.Element, null, school, sourceId, ingestionRunId, masters);
      });
  });

  return masters;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
async function main() {
  const inputPath = process.argv[2] || "scripts/data/raw/tibetan-encyclopedia.html";
  const outputPath = process.argv[3] || "scripts/data/raw/tibetan-encyclopedia.json";
  const sourceId = "src_tibetan_encyclopedia";

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error("Save the Tibetan Buddhist Encyclopedia HTML to this path first.");
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf-8");
  const run = await startIngestionRun({
    sourceId,
    scriptName: "extract-tibetan-encyclopedia.ts",
  });

  try {
    const masters = parseHtml(html, sourceId, run.id);

    fs.writeFileSync(outputPath, JSON.stringify(masters, null, 2));
    await finishIngestionRun(run, {
      recordCount: masters.length,
      notes: `Extracted ${masters.length} masters from Tibetan Buddhist Encyclopedia HTML.`,
      snapshotHash: fingerprintContent(html),
      snapshotArchiveRef: toArchiveRef(inputPath),
    });

    console.log(`Extracted ${masters.length} masters from Tibetan Buddhist Encyclopedia`);
    console.log(`Output written to ${outputPath}`);
  } catch (err) {
    await failIngestionRun(run, err);
    throw err;
  }
}

// Only run main when executed directly (not when imported)
const isDirectRun =
  process.argv[1]?.endsWith("extract-tibetan-encyclopedia.ts") ||
  process.argv[1]?.endsWith("extract-tibetan-encyclopedia");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
}
