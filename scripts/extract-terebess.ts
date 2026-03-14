#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Terebess Zen lineage page scraper
// Parses simple HTML/text lineage pages where indentation and arrow markers
// indicate teacher-student relationships.
// ---------------------------------------------------------------------------

import * as cheerio from 'cheerio';
import fs from 'fs';
import { nanoid } from 'nanoid';
import type { RawMaster, RawTeacherRef } from './scraper-types';

/**
 * Parse a single master line to extract name, CJK, dates, and notes.
 *
 * Expected formats:
 *   "Dongshan Liangjie (洞山良价, 807-869) - founder of Caodong school"
 *   "→ Caoshan Benji (曹山本寂, 840-901)"
 *   "Linji Yixuan (臨濟義玄, d. 866)"
 */
function parseMasterLine(raw: string): {
  name: string;
  names_cjk: string;
  dates: string;
  notes: string;
} {
  // Strip leading arrow/bullet markers and whitespace
  let text = raw.replace(/^[\s\u00a0]*[→•·\-–—]\s*/, '').trim();

  // Extract trailing notes after " - "
  let notes = '';
  const dashIdx = text.lastIndexOf(' - ');
  if (dashIdx > 0) {
    const afterDash = text.substring(dashIdx + 3).trim();
    // Only treat as notes if it doesn't look like a date range
    if (!/^\d/.test(afterDash)) {
      notes = afterDash;
      text = text.substring(0, dashIdx).trim();
    }
  }

  // Match "Name (CJK, dates)" or "Name (dates)"
  const parenMatch = text.match(/^([^(]+)\(([^)]+)\)\s*$/);
  if (!parenMatch) {
    return { name: text, names_cjk: '', dates: '', notes };
  }

  const name = parenMatch[1]!.trim();
  const parenContent = parenMatch[2]!.trim();

  const parts = parenContent.split(',').map(p => p.trim());
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}]/u;

  if (parts.length >= 2 && cjkRegex.test(parts[0]!)) {
    return {
      name,
      names_cjk: parts[0]!,
      dates: parts.slice(1).join(', ').trim(),
      notes,
    };
  }

  if (/\d/.test(parenContent)) {
    return { name, names_cjk: '', dates: parenContent, notes };
  }

  return { name, names_cjk: parenContent, dates: '', notes };
}

/**
 * Determine indentation level from leading whitespace and non-breaking spaces.
 */
function indentLevel(raw: string): number {
  const match = raw.match(/^([\s\u00a0]*)/);
  if (!match) return 0;
  // Count logical indent units (each &nbsp;&nbsp; or two spaces = one level)
  const ws = match[1]!;
  const nbspCount = (ws.match(/\u00a0/g) || []).length;
  const spaceCount = (ws.match(/ /g) || []).length;
  return Math.floor((nbspCount + spaceCount) / 2);
}

/**
 * Pure parsing function — testable without network access.
 * Expects HTML with .content divs containing lineage information
 * organized under <h2> school headings, with indented <p> lines.
 */
export function parseHtml(
  html: string,
  sourceId: string,
  ingestionRunId: string,
): RawMaster[] {
  const $ = cheerio.load(html);
  const masters: RawMaster[] = [];

  $('div.content').each((_i, contentDiv) => {
    let currentSchool = '';
    // Stack of [indentLevel, name] to track parent at each depth
    const parentStack: Array<{ level: number; name: string }> = [];

    $(contentDiv).children().each((_j, el) => {
      const tagName = (el as cheerio.Element).tagName?.toLowerCase();

      if (tagName === 'h2' || tagName === 'h3') {
        currentSchool = $(el).text().trim()
          .replace(/\s+lineage$/i, '')
          .replace(/\s+line$/i, '')
          .trim();
        parentStack.length = 0;
        return;
      }

      if (tagName === 'p') {
        const rawText = $(el).text();
        const text = rawText.trim();
        if (!text) return;

        const level = indentLevel(rawText);
        const hasArrow = /[→]/.test(text);
        const effectiveLevel = hasArrow ? Math.max(1, level) : level;

        const parsed = parseMasterLine(text);
        if (!parsed.name) return;

        // Pop stack entries at same or deeper level
        while (parentStack.length > 0 && parentStack[parentStack.length - 1]!.level >= effectiveLevel) {
          parentStack.pop();
        }

        const teachers: RawTeacherRef[] = [];
        if (parentStack.length > 0) {
          teachers.push({
            name: parentStack[parentStack.length - 1]!.name,
            edge_type: 'primary',
          });
        }

        masters.push({
          name: parsed.name,
          names_cjk: parsed.names_cjk,
          dates: parsed.dates,
          teachers,
          school: currentSchool,
          source_id: sourceId,
          ingestion_run_id: ingestionRunId,
        });

        parentStack.push({ level: effectiveLevel, name: parsed.name });
      }
    });
  });

  return masters;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
async function main() {
  const inputPath = process.argv[2] || 'scripts/data/raw/terebess.html';
  const outputPath = process.argv[3] || 'scripts/data/raw/terebess.json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error('Save the Terebess Zen lineage HTML to this path first.');
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, 'utf-8');
  const runId = nanoid();
  const masters = parseHtml(html, 'src_terebess', runId);

  fs.writeFileSync(outputPath, JSON.stringify(masters, null, 2));
  console.log(`Extracted ${masters.length} masters from Terebess`);
  console.log(`Output written to ${outputPath}`);
}

// Only run main when executed directly (not when imported)
const isDirectRun = process.argv[1]?.endsWith('extract-terebess.ts')
  || process.argv[1]?.endsWith('extract-terebess');
if (isDirectRun) {
  main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
