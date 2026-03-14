/**
 * Extract master data from the Chan Ancestors PDF.
 *
 * Parses text extracted from "Chart of the Chan Ancestors" by Andy Ferguson
 * (1998, South Mountain Publications). Outputs RawMaster[] to
 * scripts/data/raw/chan-ancestors.json.
 *
 * Usage:  npx tsx scripts/extract-pdf.ts
 */

import { PDFParse } from "pdf-parse";
import fs from "fs";
import path from "path";
import { sanitizeRawMasters } from "./raw-master-cleaning";
import type { RawMaster, RawTeacherRef } from "./scraper-types";
import {
  failIngestionRun,
  finishIngestionRun,
  fingerprintContent,
  startIngestionRun,
  toArchiveRef,
} from "./ingestion-provenance";

export type { RawMaster, RawTeacherRef } from "./scraper-types";

// ---------------------------------------------------------------------------
// Date pattern — matches the various date formats found in the PDF
// ---------------------------------------------------------------------------

const DATE_RE =
  /^(?:d\.\s+\d+\??\s*C\.E\.|d\.\s+\d+(?:th|st|nd|rd)\s+c\.|d\.\s+\d+|n\.d\.\s*|\d{2,4}-\d{2,4})$/;

/**
 * Return true if the line looks like a date string found in chart entries.
 */
export function isDateLine(line: string): boolean {
  return DATE_RE.test(line.trim());
}

// ---------------------------------------------------------------------------
// School inference from grid code
// ---------------------------------------------------------------------------

/**
 * Grid codes use a letter (column) and number (row). The column letters map
 * to lineage branches on the chart. This is an approximate mapping based on
 * the PDF layout analysis.
 */
export function inferSchool(gridCode: string): string {
  if (!gridCode) return "";
  const col = gridCode.charAt(0).toUpperCase();

  // Early patriarchs (column I, rows 1-6)
  const row = parseInt(gridCode.slice(1), 10);
  if (col === "I" && row <= 6) return "Early Chan";

  // Nanyue line
  if (["A", "B", "C", "D"].includes(col)) {
    // Linji school and descendants
    if (col === "A") return "Linji";
    if (col === "B") return "Linji";
    if (col === "C") return "Linji/Yangqi";
    if (col === "D") return "Linji";
  }

  // Qingyuan line
  if (["E", "F"].includes(col)) return "Caodong";
  if (col === "G") return "Guiyang";
  if (col === "H") return "Yunmen";
  if (col === "I" && row > 6) return "Yunmen";
  if (col === "J") return "Caodong";
  if (col === "K") return "Nanyue line";
  if (col === "L") return "Qingyuan line";
  if (col === "M") return "Qingyuan line";
  if (col === "N") return "Qingyuan line";
  if (col === "O") return "Qingyuan line";
  if (col === "P") return "Qingyuan line";
  if (col === "Q") return "Other";

  return "";
}

// ---------------------------------------------------------------------------
// Index parsing
// ---------------------------------------------------------------------------

/**
 * A parsed row from the tab-separated index section.
 */
export interface IndexEntry {
  pinyin: string;
  wadeGiles: string;
  romaji: string;
  gridCode: string;
  koanRefs: string;
}

/**
 * A "Not shown" cross-reference parsed from the index.
 */
export interface NotShownRef {
  name: string;
  teacherName: string;
  teacherGrid: string;
}

const NOT_SHOWN_RE = /^(.+?)\s*\(Not shown\.?\s*(?:Student of\s+)?(.+?),\s*([A-Q]\d+)\)/;

/**
 * Parse the index section of the PDF text into structured entries.
 *
 * The index lines are tab-separated with the format:
 *   Pinyin \t Wade-Giles \t Romaji \t GridCode [koan refs...]
 *
 * Some lines are "See" cross-references or "Not shown" notes.
 * Continuation lines (overflow koan numbers) have only tab-separated numbers.
 */
export function parseIndex(lines: string[]): {
  entries: IndexEntry[];
  notShown: NotShownRef[];
  seeRefs: Map<string, string>;
} {
  const entries: IndexEntry[] = [];
  const notShown: NotShownRef[] = [];
  const seeRefs = new Map<string, string>();
  let lastEntry: IndexEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // "Not shown" entries
    const notShownMatch = trimmed.match(NOT_SHOWN_RE);
    if (notShownMatch) {
      notShown.push({
        name: notShownMatch[1].trim(),
        teacherName: notShownMatch[2].trim(),
        teacherGrid: notShownMatch[3].trim(),
      });
      continue;
    }

    // "See" cross-references: "Name (See OtherName)"
    const seeMatch = trimmed.match(/^(.+?)\s*\(See\s+(.+?)\)$/);
    if (seeMatch) {
      seeRefs.set(seeMatch[1].trim(), seeMatch[2].trim());
      continue;
    }

    // Skip lines that are purely koan number overflow (continuation lines)
    // These are lines with only numbers, commas, tabs, and spaces
    if (/^[\d,\s\t]+$/.test(trimmed)) {
      if (lastEntry) {
        const overflow = trimmed.replace(/\t+/g, " ").trim();
        lastEntry.koanRefs = [lastEntry.koanRefs, overflow].filter(Boolean).join(" ").trim();
      }
      continue;
    }

    // Skip header/label lines
    if (/^Pinyin\b/i.test(trimmed)) continue;
    if (/^\(Chinese\)/i.test(trimmed)) continue;
    if (/^Location\b/i.test(trimmed)) continue;

    // Tab-separated index row
    const parts = line.split("\t").map((p) => p.trim());
    if (parts.length >= 3) {
      const pinyin = parts[0];
      const wadeGiles = parts[1];
      const romaji = parts[2];

      // The 4th part may contain grid code + koan refs
      const rest = parts.slice(3).join(" ").trim();
      const gridMatch = rest.match(/^([A-Q]\d+)/);
      const gridCode = gridMatch ? gridMatch[1] : "";
      const koanRefs = gridMatch ? rest.slice(gridMatch[0].length).trim() : rest;

      // Validate: pinyin should look like a name (has a space, starts uppercase)
      if (pinyin && /^[A-Z]/.test(pinyin) && wadeGiles) {
        const entry = { pinyin, wadeGiles, romaji, gridCode, koanRefs };
        entries.push(entry);
        lastEntry = entry;
      }
    }
  }

  return { entries, notShown, seeRefs };
}

// ---------------------------------------------------------------------------
// Chart-entry parsing
// ---------------------------------------------------------------------------

/**
 * A block of lines from the visual chart area representing a single master.
 */
export interface ChartBlock {
  pinyin: string;
  wadeGiles: string;
  romaji: string;
  dates: string;
  nicknames: string[];
  extraLines: string[];
}

/**
 * Parse the visual chart section into blocks of master entries.
 *
 * Each master appears as a group of 3-5 consecutive lines:
 *   1. Pinyin name
 *   2. Optionally a nickname in quotes
 *   3. Wade-Giles name
 *   4. Romaji name
 *   5. Date line
 *
 * We detect blocks by looking for sequences ending in a date line.
 */
export function parseChartBlocks(lines: string[]): ChartBlock[] {
  const blocks: ChartBlock[] = [];

  // Accumulate lines into candidate blocks.
  // A date line signals the end of a block.
  let currentLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      // Empty line might separate blocks
      if (currentLines.length > 0) {
        // Try to flush if we have a partial block
        const block = tryBuildBlock(currentLines);
        if (block) blocks.push(block);
        currentLines = [];
      }
      continue;
    }

    currentLines.push(line);

    if (isDateLine(line)) {
      const block = tryBuildBlock(currentLines);
      if (block) blocks.push(block);
      currentLines = [];
    }
  }

  // Handle any trailing block
  if (currentLines.length > 0) {
    const block = tryBuildBlock(currentLines);
    if (block) blocks.push(block);
  }

  return blocks;
}

/**
 * Return true if the line looks like noise (headers, labels, map text) rather
 * than a master name or transliteration.
 */
function isNoiseLine(line: string): boolean {
  // Lines with tabs are likely map/header artifacts
  if (line.includes("\t")) return true;
  // School labels, section headers
  if (/School$/.test(line)) return true;
  // Map title fragments
  if (/^(Map|of the|Zen|Ancestors|Bodhidharma)$/i.test(line)) return true;
  // Parenthetical generation notes
  if (/^\(\d+th Generation/.test(line)) return true;
  if (/^(Yangqi|Huanglong) Branch\)?$/.test(line)) return true;
  // Geographic labels
  if (/^(Japan|Korea|China)$/.test(line)) return true;
  return false;
}

function tryBuildBlock(lines: string[]): ChartBlock | null {
  if (lines.length < 3) return null;

  const nicknames: string[] = [];
  const clean: string[] = [];

  for (const l of lines) {
    // Detect quoted nicknames: "Huangmei", "Caoxi", etc.
    if (/^".*"$/.test(l) || /^\u201C.*\u201D$/.test(l) || /^".*"$/.test(l)) {
      nicknames.push(l.replace(/^[""\u201C]|[""\u201D]$/g, ""));
    } else if (!isNoiseLine(l)) {
      clean.push(l);
    }
  }

  // We need at least: pinyin, wade-giles, romaji (+ optional dates = 3-4)
  if (clean.length < 3) return null;

  const dates = isDateLine(clean[clean.length - 1]) ? clean.pop()! : "";
  const romaji = clean.length >= 3 ? clean.pop()! : "";
  const wadeGiles = clean.length >= 2 ? clean.pop()! : "";
  const pinyin = clean.length >= 1 ? clean.shift()! : "";

  // Sometimes the Wade-Giles is split across two lines; join extras into wadeGiles
  const extraLines = clean; // any remaining lines

  return {
    pinyin,
    wadeGiles: extraLines.length > 0 ? [wadeGiles, ...extraLines].join(" ") : wadeGiles,
    romaji,
    dates,
    nicknames,
    extraLines: [],
  };
}

// ---------------------------------------------------------------------------
// Merge index + chart data into RawMaster[]
// ---------------------------------------------------------------------------

export function buildRawMasters(
  indexEntries: IndexEntry[],
  chartBlocks: ChartBlock[],
  notShownRefs: NotShownRef[],
  ingestionRunId: string
): RawMaster[] {
  // Build a lookup from pinyin name → chart block for date supplementation
  const chartByName = new Map<string, ChartBlock>();
  for (const block of chartBlocks) {
    chartByName.set(block.pinyin, block);
  }

  // Build a lookup from name → teacher for "Not shown" relationships
  const teacherLookup = new Map<string, NotShownRef>();
  for (const ref of notShownRefs) {
    teacherLookup.set(ref.name, ref);
  }

  const masters: RawMaster[] = [];

  for (const entry of indexEntries) {
    const chartBlock = chartByName.get(entry.pinyin);
    const notShownRef = teacherLookup.get(entry.pinyin);

    const teachers: RawTeacherRef[] = [];
    if (notShownRef) {
      teachers.push({
        name: notShownRef.teacherName,
        edge_type: "primary",
        locator: notShownRef.teacherGrid,
        notes: `Not shown on chart. Student of ${notShownRef.teacherName}`,
      });
    }

    const dates = chartBlock?.dates ?? "";
    const nicknames = chartBlock?.nicknames ?? [];
    const namesAlt: string[] = [];
    if (entry.wadeGiles) namesAlt.push(entry.wadeGiles);
    if (entry.romaji) namesAlt.push(entry.romaji);

    masters.push({
      name: entry.pinyin,
      names_cjk: "", // CJK characters are not available from text extraction
      dates,
      teachers,
      school: inferSchool(entry.gridCode),
      source_id: "src_chan_ancestors_pdf",
      ingestion_run_id: ingestionRunId,
      names_alt: namesAlt.length > 0 ? namesAlt : undefined,
      grid_code: entry.gridCode || undefined,
      nicknames: nicknames.length > 0 ? nicknames : undefined,
      koan_refs: entry.koanRefs || undefined,
    });
  }

  // Also add "Not shown" masters that don't appear in the index as regular entries
  for (const ref of notShownRefs) {
    if (!masters.find((m) => m.name === ref.name)) {
      masters.push({
        name: ref.name,
        names_cjk: "",
        dates: "",
        teachers: [
          {
            name: ref.teacherName,
            edge_type: "primary",
            locator: ref.teacherGrid,
            notes: `Not shown on chart. Student of ${ref.teacherName}`,
          },
        ],
        school: inferSchool(ref.teacherGrid),
        source_id: "src_chan_ancestors_pdf",
        ingestion_run_id: ingestionRunId,
      });
    }
  }

  return sanitizeRawMasters(masters);
}

// ---------------------------------------------------------------------------
// Splitting PDF text into chart and index sections
// ---------------------------------------------------------------------------

/**
 * Split the full PDF text into chart-entry lines and index lines.
 *
 * The index section begins where we see multiple consecutive tab-separated
 * lines with the pattern: Pinyin \t Wade-Giles \t Romaji \t Location ...
 *
 * We look for the "Pinyin" header row or the first block of tab-separated
 * name entries that appear in alphabetical order.
 */
export function splitSections(text: string): {
  chartLines: string[];
  indexLines: string[];
} {
  const lines = text.split("\n");

  // Find where index tab-separated entries begin.
  // The index has dense tab-separated lines. We look for runs of them.
  let indexStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tabs = line.split("\t");

    // A tab-separated index entry has 3+ tabs and starts with a name
    if (
      tabs.length >= 3 &&
      /^[A-Z][a-z]/.test(tabs[0].trim()) &&
      /^[A-Z][a-z]/.test(tabs[1].trim())
    ) {
      // Check if nearby lines are also tab-separated entries
      let consecutiveTabLines = 0;
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].split("\t").length >= 3) consecutiveTabLines++;
      }
      if (consecutiveTabLines >= 3) {
        indexStart = i;
        break;
      }
    }
  }

  // If we couldn't find it by tab density, look for the "Pinyin" header
  if (indexStart === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (/^Pinyin\s/i.test(lines[i].trim())) {
        indexStart = i;
        break;
      }
    }
  }

  // Fallback: use 50% of text as chart, rest as index
  if (indexStart === -1) {
    indexStart = Math.floor(lines.length / 2);
  }

  // Walk backwards from indexStart to find actual boundary.
  // Chart blocks just before the index may have been grid headers.
  // We include a small overlap for safety.
  const chartLines = lines.slice(0, indexStart);
  const indexLines = lines.slice(indexStart);

  return { chartLines, indexLines };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pdfPath = path.resolve(process.env.PDF_PATH ?? "Chart-of-the-Chan-Ancestors.pdf");

  const run = await startIngestionRun({
    sourceId: "src_chan_ancestors_pdf",
    scriptName: "extract-pdf.ts",
  });

  try {
    console.log(`Reading PDF: ${pdfPath}`);
    const buffer = fs.readFileSync(pdfPath);
    const uint8 = new Uint8Array(buffer);
    const parser = new PDFParse(uint8);
    const result = await parser.getText();
    const text = result.text;

    console.log(`Extracted ${text.length} characters of text.`);

    // Split into sections
    const { chartLines, indexLines } = splitSections(text);
    console.log(
      `Chart section: ${chartLines.length} lines, Index section: ${indexLines.length} lines`
    );

    // Parse each section
    const { entries, notShown, seeRefs } = parseIndex(indexLines);
    console.log(
      `Index: ${entries.length} entries, ${notShown.length} "not shown" refs, ${seeRefs.size} cross-refs`
    );

    const chartBlocks = parseChartBlocks(chartLines);
    console.log(`Chart: ${chartBlocks.length} master blocks`);

    // Build output
    const masters = buildRawMasters(entries, chartBlocks, notShown, run.id);
    console.log(`Built ${masters.length} RawMaster records.`);

    // Write output
    const outDir = path.resolve("scripts/data/raw");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "chan-ancestors.json");
    fs.writeFileSync(outPath, JSON.stringify(masters, null, 2));
    console.log(`Wrote output to ${outPath}`);

    await finishIngestionRun(run, {
      recordCount: masters.length,
      notes: `Extracted ${entries.length} index entries, ${notShown.length} not-shown refs, ${chartBlocks.length} chart blocks`,
      snapshotHash: fingerprintContent(buffer),
      snapshotArchiveRef: toArchiveRef(pdfPath),
    });

    console.log("Done.");
  } catch (err) {
    await failIngestionRun(run, err);
    throw err;
  }
}

// Only run main() when executed directly (not when imported by tests)
const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("extract-pdf.ts") || process.argv[1].endsWith("extract-pdf.js"));

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
