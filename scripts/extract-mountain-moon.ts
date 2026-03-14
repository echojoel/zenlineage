#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Mountain Moon Sanbo-Zen lineage chart scraper
// Parses structured HTML with .lineage containers holding .master divs,
// each containing name, dates, and teacher spans.
// ---------------------------------------------------------------------------

import * as cheerio from 'cheerio';
import fs from 'fs';
import type { RawMaster, RawTeacherRef } from './scraper-types';
import {
  failIngestionRun,
  finishIngestionRun,
  fingerprintContent,
  startIngestionRun,
  toArchiveRef,
} from './ingestion-provenance';

/**
 * Pure parsing function — testable without network access.
 * Expects HTML with .lineage containers holding .master divs, each with:
 *   - .name span
 *   - .dates span
 *   - .teacher span (optional)
 *   - data-school attribute on .master or parent .lineage div
 */
export function parseHtml(
  html: string,
  sourceId: string,
  ingestionRunId: string,
): RawMaster[] {
  const $ = cheerio.load(html);
  const masters: RawMaster[] = [];

  $('div.lineage').each((_i, lineageDiv) => {
    // School can be on the div or in a preceding heading
    const divSchool = $(lineageDiv).attr('data-school') || '';
    const headingSchool = $(lineageDiv).find('h2, h3').first().text().trim()
      .replace(/\s+lineage$/i, '')
      .trim();
    const fallbackSchool = divSchool || headingSchool || 'Sanbo-Zen';

    $(lineageDiv).find('div.master').each((_j, masterDiv) => {
      const name = $(masterDiv).find('span.name').text().trim();
      if (!name) return;

      const dates = $(masterDiv).find('span.dates').text().trim();
      const teacherName = $(masterDiv).find('span.teacher').text().trim();
      const cjk = $(masterDiv).find('span.cjk').text().trim();
      const school = $(masterDiv).attr('data-school') || fallbackSchool;

      const teachers: RawTeacherRef[] = [];
      if (teacherName) {
        teachers.push({ name: teacherName, edge_type: 'primary' });
      }

      masters.push({
        name,
        names_cjk: cjk,
        dates,
        teachers,
        school,
        source_id: sourceId,
        ingestion_run_id: ingestionRunId,
      });
    });
  });

  return masters;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
async function main() {
  const inputPath = process.argv[2] || 'scripts/data/raw/mountain-moon.html';
  const outputPath = process.argv[3] || 'scripts/data/raw/mountain-moon.json';
  const sourceId = 'src_mountain_moon';

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error('Save the Mountain Moon Sanbo-Zen lineage HTML to this path first.');
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, 'utf-8');
  const run = await startIngestionRun({
    sourceId,
    scriptName: 'extract-mountain-moon.ts',
  });

  try {
    const masters = parseHtml(html, sourceId, run.id);

    fs.writeFileSync(outputPath, JSON.stringify(masters, null, 2));
    await finishIngestionRun(run, {
      recordCount: masters.length,
      notes: `Extracted ${masters.length} masters from Mountain Moon lineage HTML.`,
      snapshotHash: fingerprintContent(html),
      snapshotArchiveRef: toArchiveRef(inputPath),
    });

    console.log(`Extracted ${masters.length} masters from Mountain Moon`);
    console.log(`Output written to ${outputPath}`);
  } catch (err) {
    await failIngestionRun(run, err);
    throw err;
  }
}

// Only run main when executed directly (not when imported)
const isDirectRun = process.argv[1]?.endsWith('extract-mountain-moon.ts')
  || process.argv[1]?.endsWith('extract-mountain-moon');
if (isDirectRun) {
  main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
