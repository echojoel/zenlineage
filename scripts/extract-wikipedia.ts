#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Wikipedia Zen Lineage Charts scraper
// Parses wikitable-formatted lineage tables with columns for master name,
// CJK characters, dates, teacher, and school.
// ---------------------------------------------------------------------------

import * as cheerio from 'cheerio';
import fs from 'fs';
import { nanoid } from 'nanoid';
import type { RawMaster, RawTeacherRef } from './scraper-types';

/**
 * Pure parsing function — testable without network access.
 * Expects Wikipedia-style wikitable HTML with columns:
 *   Master | Chinese/CJK | Dates | Teacher | School
 */
export function parseHtml(
  html: string,
  sourceId: string,
  ingestionRunId: string,
): RawMaster[] {
  const $ = cheerio.load(html);
  const masters: RawMaster[] = [];

  $('table.wikitable').each((_tableIdx, table) => {
    // Detect column headers to handle varying column orders
    const headers: string[] = [];
    $(table).find('tr').first().find('th').each((_i, th) => {
      headers.push($(th).text().trim().toLowerCase());
    });

    const colIdx = {
      master: headers.findIndex(h => h.includes('master') || h.includes('name')),
      cjk: headers.findIndex(h => h.includes('chinese') || h.includes('cjk') || h.includes('kanji')),
      dates: headers.findIndex(h => h.includes('date')),
      teacher: headers.findIndex(h => h.includes('teacher') || h.includes('lineage')),
      school: headers.findIndex(h => h.includes('school') || h.includes('sect')),
    };

    // Skip tables that don't look like lineage tables
    if (colIdx.master === -1) return;

    // Process data rows (skip header row)
    $(table).find('tr').slice(1).each((_rowIdx, row) => {
      const cells = $(row).find('td');
      if (cells.length === 0) return;

      const getText = (idx: number): string => {
        if (idx < 0 || idx >= cells.length) return '';
        return $(cells[idx]).text().trim();
      };

      const name = getText(colIdx.master);
      if (!name) return;

      const teacherName = getText(colIdx.teacher);
      const teachers: RawTeacherRef[] = [];
      if (teacherName) {
        teachers.push({ name: teacherName, edge_type: 'primary' });
      }

      // Check for alternative names in parentheses within the master cell
      const namesAlt: string[] = [];
      const masterCellText = getText(colIdx.master);
      const altMatch = masterCellText.match(/\(([^)]+)\)/);
      if (altMatch) {
        namesAlt.push(altMatch[1]!);
      }

      masters.push({
        name,
        names_cjk: getText(colIdx.cjk),
        dates: getText(colIdx.dates),
        teachers,
        school: getText(colIdx.school),
        source_id: sourceId,
        ingestion_run_id: ingestionRunId,
        ...(namesAlt.length > 0 ? { names_alt: namesAlt } : {}),
      });
    });
  });

  return masters;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
async function main() {
  const inputPath = process.argv[2] || 'scripts/data/raw/wikipedia.html';
  const outputPath = process.argv[3] || 'scripts/data/raw/wikipedia.json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error('Save the Wikipedia Zen lineage charts HTML to this path first.');
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, 'utf-8');
  const runId = nanoid();
  const masters = parseHtml(html, 'src_wikipedia', runId);

  fs.writeFileSync(outputPath, JSON.stringify(masters, null, 2));
  console.log(`Extracted ${masters.length} masters from Wikipedia`);
  console.log(`Output written to ${outputPath}`);
}

// Only run main when executed directly (not when imported)
const isDirectRun = process.argv[1]?.endsWith('extract-wikipedia.ts')
  || process.argv[1]?.endsWith('extract-wikipedia');
if (isDirectRun) {
  main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
