import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseHtml } from '../scripts/extract-wikipedia';
import type { RawMaster } from '../scripts/scraper-types';

const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/wikipedia-sample.html');
const GOLDEN_PATH = path.resolve(__dirname, 'golden/wikipedia-expected.json');

describe('Wikipedia Zen lineage scraper', () => {
  const html = fs.readFileSync(FIXTURE_PATH, 'utf-8');
  const expected: RawMaster[] = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
  const actual = parseHtml(html, 'src_wikipedia', 'test-run-id');

  it('should extract the correct number of masters', () => {
    expect(actual).toHaveLength(expected.length);
  });

  it('should match the golden output exactly', () => {
    expect(actual).toEqual(expected);
  });

  it('should set source_id to src_wikipedia on every record', () => {
    for (const m of actual) {
      expect(m.source_id).toBe('src_wikipedia');
    }
  });

  it('should set ingestion_run_id on every record', () => {
    for (const m of actual) {
      expect(m.ingestion_run_id).toBe('test-run-id');
    }
  });

  it('should extract CJK characters for masters with Chinese names', () => {
    const bodhidharma = actual.find(m => m.name === 'Bodhidharma');
    expect(bodhidharma).toBeDefined();
    expect(bodhidharma!.names_cjk).toBe('菩提達摩');
  });

  it('should extract teacher relationships', () => {
    const huike = actual.find(m => m.name === 'Dazu Huike');
    expect(huike).toBeDefined();
    expect(huike!.teachers).toHaveLength(1);
    expect(huike!.teachers[0]!.name).toBe('Bodhidharma');
    expect(huike!.teachers[0]!.edge_type).toBe('primary');
  });

  it('should parse masters from multiple tables', () => {
    const schools = new Set(actual.map(m => m.school));
    expect(schools.has('Chan')).toBe(true);
    expect(schools.has('Caodong')).toBe(true);
  });

  it('should handle death-only dates', () => {
    const bodhidharma = actual.find(m => m.name === 'Bodhidharma');
    expect(bodhidharma!.dates).toBe('d. 536?');
  });

  it('should handle birth-death date ranges', () => {
    const huike = actual.find(m => m.name === 'Dazu Huike');
    expect(huike!.dates).toBe('487–593');
  });

  it('should return empty array for empty HTML', () => {
    const result = parseHtml('<html><body></body></html>', 'src_wikipedia', 'run1');
    expect(result).toEqual([]);
  });

  it('should return empty array for HTML with no wikitable', () => {
    const result = parseHtml('<html><body><table><tr><td>hi</td></tr></table></body></html>', 'src_wikipedia', 'run1');
    expect(result).toEqual([]);
  });
});
