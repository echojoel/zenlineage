import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseHtml } from '../scripts/extract-mountain-moon';
import type { RawMaster } from '../scripts/scraper-types';

const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/mountain-moon-sample.html');
const GOLDEN_PATH = path.resolve(__dirname, 'golden/mountain-moon-expected.json');

describe('Mountain Moon Sanbo-Zen lineage scraper', () => {
  const html = fs.readFileSync(FIXTURE_PATH, 'utf-8');
  const expected: RawMaster[] = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
  const actual = parseHtml(html, 'src_mountain_moon', 'test-run-id');

  it('should extract the correct number of masters', () => {
    expect(actual).toHaveLength(expected.length);
  });

  it('should match the golden output exactly', () => {
    expect(actual).toEqual(expected);
  });

  it('should set source_id to src_mountain_moon on every record', () => {
    for (const m of actual) {
      expect(m.source_id).toBe('src_mountain_moon');
    }
  });

  it('should parse master with no teacher (lineage root)', () => {
    const harada = actual.find(m => m.name === 'Harada Daiun Sogaku');
    expect(harada).toBeDefined();
    expect(harada!.teachers).toHaveLength(0);
  });

  it('should extract teacher from span.teacher', () => {
    const yasutani = actual.find(m => m.name === 'Yasutani Hakuun');
    expect(yasutani).toBeDefined();
    expect(yasutani!.teachers).toHaveLength(1);
    expect(yasutani!.teachers[0]!.name).toBe('Harada Daiun Sogaku');
  });

  it('should extract CJK from span.cjk', () => {
    const yasutani = actual.find(m => m.name === 'Yasutani Hakuun');
    expect(yasutani!.names_cjk).toBe('安谷白雲');
  });

  it('should handle masters without CJK names', () => {
    const aitken = actual.find(m => m.name === 'Robert Aitken');
    expect(aitken).toBeDefined();
    expect(aitken!.names_cjk).toBe('');
  });

  it('should handle open-ended dates (still living or unknown death)', () => {
    const habito = actual.find(m => m.name === 'Ruben Habito');
    expect(habito!.dates).toBe('1947-');
  });

  it('should extract school from data-school attribute', () => {
    for (const m of actual) {
      expect(m.school).toBe('Sanbo-Zen');
    }
  });

  it('should handle multiple students of the same teacher', () => {
    const yamadaStudents = actual.filter(
      m => m.teachers.some(t => t.name === 'Yamada Koun'),
    );
    expect(yamadaStudents).toHaveLength(2);
    const names = yamadaStudents.map(m => m.name).sort();
    expect(names).toEqual(['Robert Aitken', 'Ruben Habito']);
  });

  it('should return empty array for empty HTML', () => {
    const result = parseHtml('<html><body></body></html>', 'src_mountain_moon', 'run1');
    expect(result).toEqual([]);
  });
});
